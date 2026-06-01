import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN

interface CheckoutItem {
  id: string
  title: string
  quantity: number
  unit_price: number
}

interface PayerInfo {
  email: string
  name: string
  phone?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, paymentMethod, payer, orderId } = body as {
      items: CheckoutItem[]
      paymentMethod: string
      payer: PayerInfo
      orderId?: string
    }

    // Validação básica
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Itens do pedido são obrigatórios' },
        { status: 400 }
      )
    }

    if (!payer?.email) {
      return NextResponse.json(
        { error: 'E-mail do pagador é obrigatório' },
        { status: 400 }
      )
    }

    // Calcular total
    const transactionAmount = items.reduce(
      (sum: number, item: CheckoutItem) => sum + item.unit_price * item.quantity,
      0
    )

    const description = items.map((i: CheckoutItem) => i.title).join(', ')

    // Se não há token Mercado Pago, criar pagamento mock
    if (!MP_ACCESS_TOKEN) {
      logger.info('Modo mock — nenhuma chave de acesso configurada')

      const mockId = `mock-pay-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

      // Se orderId fornecido, atualizar status no banco
      if (orderId) {
        await db.order.update({
          where: { id: orderId },
          data: {
            paymentId: mockId,
            status: 'PENDING',
          },
        }).catch(() => {
          // Silencioso — pedido pode não existir ainda
        })
      }

      return NextResponse.json({
        id: mockId,
        status: 'pending',
        qrCode: generateMockBase64QR(),
        qrCodeText: '00020126580014br.gov.bcb.pix0136mock-pix-domplace-domeliseu-pa5204000053039865802BR5925DOMPLACE TECNOLOGIA LTDA6009SAO PAULO62070503***63041D3D',
        ticketUrl: '#',
        transactionAmount,
        mock: true,
      })
    }

    // Mercado Pago real
    const mercadopago = await import('mercadopago')
    const mp = new mercadopago.default({
      accessToken: MP_ACCESS_TOKEN,
    })

    // Use the correct SDK v2 API
    const { Payment } = mercadopago
    const paymentClient = new Payment(mp)

    if (paymentMethod === 'PIX' || paymentMethod === 'pix') {
      // Pagamento via PIX
      const paymentData = {
        transaction_amount: transactionAmount,
        description: description.substring(0, 256),
        payment_method_id: 'pix',
        payer: {
          email: payer.email,
          first_name: payer.name?.split(' ')[0] || '',
          last_name: payer.name?.split(' ').slice(1).join(' ') || '',
          phone: payer.phone ? { number: payer.phone.replace(/\D/g, '') } : undefined,
        },
      }

      const payment = await paymentClient.create({ body: paymentData })

      // Atualizar pedido se orderId fornecido
      if (orderId) {
        await db.order.update({
          where: { id: orderId },
          data: {
            paymentId: payment.id?.toString() || mockIdFallback(),
            status: 'PENDING',
          },
        }).catch(() => {})
      }

      const pointOfInteraction = (payment as unknown as Record<string, unknown>).point_of_interaction as Record<string, unknown> | undefined
      const transactionData = pointOfInteraction?.transaction_data as Record<string, unknown> | undefined

      return NextResponse.json({
        id: payment.id?.toString(),
        status: payment.status,
        qrCode: transactionData?.qr_code_base64 as string | undefined,
        qrCodeText: transactionData?.qr_code as string | undefined,
        ticketUrl: transactionData?.ticket_url as string | undefined,
        transactionAmount,
      })
    } else {
      // Pagamento com cartão de crédito
      const paymentData = {
        transaction_amount: transactionAmount,
        description: description.substring(0, 256),
        payment_method_id: body.cardBrand || 'visa',
        payer: {
          email: payer.email,
          first_name: payer.name?.split(' ')[0] || '',
          last_name: payer.name?.split(' ').slice(1).join(' ') || '',
        },
        token: body.cardToken,
        installments: body.installments || 1,
      }

      const payment = await paymentClient.create({ body: paymentData })

      // Atualizar pedido
      if (orderId) {
        await db.order.update({
          where: { id: orderId },
          data: {
            paymentId: payment.id?.toString() || mockIdFallback(),
            status: payment.status === 'approved' ? 'CONFIRMED' : 'PENDING',
            paidAt: payment.status === 'approved' ? new Date() : undefined,
          },
        }).catch(() => {})
      }

      return NextResponse.json({
        id: payment.id?.toString(),
        status: payment.status,
        transactionAmount,
        paymentMethod: 'credit_card',
        installments: body.installments || 1,
        cardLastFour: body.cardLastFour,
      })
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor'
    logger.error('Erro no checkout:', message)
    return NextResponse.json(
      { error: 'Erro ao processar pagamento. Tente novamente.' },
      { status: 500 }
    )
  }
}

function mockIdFallback(): string {
  return `pay-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
}

function generateMockBase64QR(): string {
  // Gera um QR code mock base64 (imagem SVG codificada)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="white"/>
    <rect x="16" y="16" width="64" height="64" fill="black"/>
    <rect x="24" y="24" width="48" height="48" fill="white"/>
    <rect x="32" y="32" width="32" height="32" fill="black"/>
    <rect x="176" y="16" width="64" height="64" fill="black"/>
    <rect x="184" y="24" width="48" height="48" fill="white"/>
    <rect x="192" y="32" width="32" height="32" fill="black"/>
    <rect x="16" y="176" width="64" height="64" fill="black"/>
    <rect x="24" y="184" width="48" height="48" fill="white"/>
    <rect x="32" y="192" width="32" height="32" fill="black"/>
    <rect x="96" y="16" width="16" height="16" fill="black"/>
    <rect x="128" y="16" width="16" height="16" fill="black"/>
    <rect x="96" y="48" width="16" height="16" fill="black"/>
    <rect x="128" y="48" width="16" height="16" fill="black"/>
    <rect x="96" y="96" width="64" height="16" fill="black"/>
    <rect x="96" y="128" width="16" height="16" fill="black"/>
    <rect x="144" y="128" width="16" height="16" fill="black"/>
    <rect x="96" y="160" width="16" height="16" fill="black"/>
    <rect x="128" y="160" width="16" height="16" fill="black"/>
    <rect x="96" y="192" width="16" height="16" fill="black"/>
    <rect x="128" y="192" width="16" height="16" fill="black"/>
    <rect x="176" y="96" width="16" height="16" fill="black"/>
    <rect x="208" y="96" width="16" height="16" fill="black"/>
    <rect x="176" y="128" width="16" height="16" fill="black"/>
    <rect x="208" y="128" width="16" height="16" fill="black"/>
    <rect x="176" y="160" width="16" height="16" fill="black"/>
    <rect x="208" y="160" width="16" height="16" fill="black"/>
    <rect x="176" y="192" width="16" height="16" fill="black"/>
    <rect x="208" y="192" width="16" height="16" fill="black"/>
    <rect x="96" y="224" width="16" height="16" fill="black"/>
    <rect x="128" y="224" width="16" height="16" fill="black"/>
  </svg>`
  return Buffer.from(svg).toString('base64')
}
