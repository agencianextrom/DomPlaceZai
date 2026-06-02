import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    let body: Record<string, unknown>

    try {
      body = JSON.parse(rawBody) as Record<string, unknown>
    } catch {
      logger.warn('Webhook recebido com JSON inválido')
      return NextResponse.json({ received: true })
    }

    // Se não há token Mercado Pago configurado, apenas log e retornar OK
    if (!MP_ACCESS_TOKEN) {
      logger.info('Recebido (modo mock)', { body: JSON.stringify(body).substring(0, 200) })
      return NextResponse.json({ received: true, mock: true })
    }

    // Verificar assinatura da requisição
    const signature = request.headers.get('x-signature')
    const requestId = request.headers.get('x-request-id')

    if (signature) {
      // Mercado Pago envia x-id-empresarial e x-signature para verificação
      const xIdEmpresarial = request.headers.get('x-id-empresarial')
      if (xIdEmpresarial) {
        const isValid = verifySignature(
          signature,
          xIdEmpresarial,
          requestId || '',
          dataIdFromBody(body),
          rawBody
        )
        if (!isValid) {
          logger.warn('Assinatura do webhook inválida — rejeitando requisição')
          return NextResponse.json({ received: true, error: 'Invalid signature' }, { status: 403 })
        }
      }
    }

    // Processar webhook
    const { type, data } = body
    const dataRecord = data as Record<string, unknown> | undefined

    // Só processar eventos de pagamento
    if (type === 'payment' && dataRecord?.id) {
      const paymentId = dataRecord.id

      try {
        const mercadopago = await import('mercadopago')
        const mp = new mercadopago.default({ accessToken: MP_ACCESS_TOKEN })
        const { Payment } = mercadopago
        const paymentClient = new Payment(mp)
        const payment = await paymentClient.get({ id: String(paymentId) })

        const paymentData = payment as unknown as Record<string, unknown>
        const paymentStatus = paymentData.status as string | undefined
        const externalRef = paymentData.external_reference as string | undefined

        if (paymentStatus === 'approved') {
          // Procurar pedido pelo paymentId e atualizar
          const order = await db.order.findFirst({
            where: { paymentId: String(paymentId) },
          })

          if (order) {
            await db.order.update({
              where: { id: order.id },
              data: {
                status: 'CONFIRMED',
                paidAt: new Date(),
              },
            })

            // Criar registro de histórico de status
            await db.orderStatusHistory.create({
              data: {
                orderId: order.id,
                status: 'CONFIRMED',
                note: 'Pagamento aprovado via Mercado Pago',
              },
            })

            // Adicionar pontos de fidelidade (1 ponto por real gasto)
            const points = Math.floor(order.total)
            if (points > 0) {
              await db.loyaltyPoint.create({
                data: {
                  accountId: order.accountId,
                  points,
                  source: 'COMPRA',
                  referenceId: order.id,
                },
              })
            }

            logger.info(`Pedido ${order.orderNumber} aprovado — pontos: ${points}`)
          }
        } else if (paymentStatus === 'cancelled' || paymentStatus === 'rejected') {
          const order = await db.order.findFirst({
            where: { paymentId: String(paymentId) },
          })

          if (order && order.status === 'PENDING') {
            await db.order.update({
              where: { id: order.id },
              data: {
                status: 'CANCELLED',
                cancelledAt: new Date(),
                cancelReason: `Pagamento ${paymentStatus === 'cancelled' ? 'cancelado' : 'rejeitado'} pelo Mercado Pago`,
              },
            })

            await db.orderStatusHistory.create({
              data: {
                orderId: order.id,
                status: 'CANCELLED',
                note: `Pagamento ${paymentStatus === 'cancelled' ? 'cancelado' : 'rejeitado'}`,
              },
            })
          }
        }
      } catch (mpError: unknown) {
        const msg = mpError instanceof Error ? mpError.message : String(mpError)
        logger.error('Erro ao processar pagamento:', msg)
      }
    }

    // Sempre retornar 200 para evitar retentativas
    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    logger.error('Erro no webhook:', message)
    // Sempre 200 para evitar retentativas
    return NextResponse.json({ received: true, error: message })
  }
}

function dataIdFromBody(body: Record<string, unknown>): string {
  const data = body.data as Record<string, unknown> | undefined
  return data?.id as string ?? ''
}

/**
 * Verifica a assinatura HMAC-SHA256 do Mercado Pago.
 *
 * O Mercado Pago envia o header `x-signature` no formato:
 *   ts=<timestamp>,v1=<hmac_hex>
 *
 * O HMAC é calculado como:
 *   HMAC-SHA256(webhookSecret, data_id + ts)
 *
 * Se `MERCADO_PAGO_WEBHOOK_SECRET` não estiver configurado, retorna true
 * (graceful degradation para ambientes de desenvolvimento).
 */
function verifySignature(
  signature: string,
  _xIdEmpresarial: string,
  _requestId: string,
  dataId: string,
  _rawBody: string
): boolean {
  try {
    const parts = signature.split(',')
    const tsPart = parts.find((p) => p.startsWith('ts='))
    const v1Part = parts.find((p) => p.startsWith('v1='))

    if (!tsPart || !v1Part) return false

    const ts = tsPart.slice(3) // remove "ts="
    const v1 = v1Part.slice(3) // remove "v1="

    if (!ts || !v1) return false

    // Graceful degradation: skip verification if no secret configured
    const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET
    if (!webhookSecret) {
      logger.warn('MERCADO_PAGO_WEBHOOK_SECRET não configurada — pulando verificação HMAC')
      return true
    }

    // Compute expected HMAC: SHA256(secret, data_id + ts)
    const payload = `${dataId}${ts}`
    const expectedHmac = createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex')

    // Timing-safe comparison to prevent timing attacks
    if (expectedHmac.length !== v1.length) return false

    const isValid = timingSafeEqual(
      Buffer.from(expectedHmac, 'hex'),
      Buffer.from(v1, 'hex')
    )

    if (!isValid) {
      logger.warn('HMAC mismatch — assinatura do webhook não confere')
    }

    return isValid
  } catch {
    return false
  }
}
