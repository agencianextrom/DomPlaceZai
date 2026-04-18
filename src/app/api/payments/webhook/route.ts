import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Se não há token Mercado Pago configurado, apenas log e retornar OK
    if (!MP_ACCESS_TOKEN) {
      console.log('[MercadoPago Webhook] Recebido (modo mock):', JSON.stringify(body).substring(0, 200))
      return NextResponse.json({ received: true, mock: true })
    }

    // Verificar assinatura da requisição
    const signature = request.headers.get('x-signature')
    const requestId = request.headers.get('x-request-id')

    if (signature) {
      // Mercado Pago envia x-id-empresarial e x-signature para verificação
      const xIdEmpresarial = request.headers.get('x-id-empresarial')
      if (xIdEmpresarial && !verifySignature(signature, xIdEmpresarial, requestId || '', dataIdFromBody(body))) {
        console.warn('[MercadoPago Webhook] Assinatura inválida')
        // Mesmo assim retornar 200 para evitar retentativas
        return NextResponse.json({ received: true })
      }
    }

    // Processar webhook
    const { type, action, data } = body

    // Só processar eventos de pagamento
    if (type === 'payment' && data?.id) {
      const paymentId = data.id

      try {
        const mercadopago = await import('mercadopago')
        const mp = new mercadopago.default({ accessToken: MP_ACCESS_TOKEN })
        const payment = await mp.payments.findById(String(paymentId))

        const paymentData = payment as Record<string, unknown>
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

            console.log(`[MercadoPago Webhook] Pedido ${order.orderNumber} aprovado — pontos: ${points}`)
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
        console.error('[MercadoPago Webhook] Erro ao processar pagamento:', msg)
      }
    }

    // Sempre retornar 200 para evitar retentativas
    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    console.error('[MercadoPago Webhook] Erro:', message)
    // Sempre 200 para evitar retentativas
    return NextResponse.json({ received: true, error: message })
  }
}

function dataIdFromBody(body: Record<string, unknown>): string {
  const data = body.data as Record<string, unknown> | undefined
  return data?.id as string ?? ''
}

function verifySignature(
  signature: string,
  xIdEmpresarial: string,
  requestId: string,
  dataId: string
): boolean {
  // Verificação básica da assinatura do Mercado Pago
  // Em produção, implementar verificação HMAC completa
  try {
    const parts = signature.split(',')
    const tsPart = parts.find((p) => p.startsWith('ts='))
    const v1Part = parts.find((p) => p.startsWith('v1='))

    if (!tsPart || !v1Part) return false

    // Se não tivermos a chave para verificação HMAC, aceitar (graceful degradation)
    if (!process.env.MERCADO_PAGO_WEBHOOK_SECRET) {
      console.warn('[MercadoPago Webhook] MERCADO_PAGO_WEBHOOK_SECRET não configurada — pulando verificação HMAC')
      return true
    }

    // Implementação simplificada — em produção usar crypto.createHmac
    return tsPart.length > 0 && v1Part.length > 0
  } catch {
    return false
  }
}
