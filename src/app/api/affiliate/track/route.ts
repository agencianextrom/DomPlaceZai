import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { referralCode, orderId, accountId } = body

    // Validação dos campos obrigatórios
    if (!referralCode || !accountId) {
      return NextResponse.json(
        { success: false, error: 'Código de indicação e ID da conta são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar afiliado pelo código de indicação
    const affiliate = await db.affiliate.findUnique({
      where: { referralCode: referralCode.toUpperCase() },
    })

    if (!affiliate) {
      return NextResponse.json(
        { success: false, error: 'Código de indicação inválido' },
        { status: 404 }
      )
    }

    if (affiliate.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Este código de indicação não está ativo no momento' },
        { status: 403 }
      )
    }

    // Não permitir auto-indicação
    if (affiliate.accountId === accountId) {
      return NextResponse.json(
        { success: false, error: 'Você não pode usar seu próprio código de indicação' },
        { status: 400 }
      )
    }

    // Verificar se já existe uma indicação para esta conta e pedido
    if (orderId) {
      const existingReferral = await db.referral.findFirst({
        where: {
          affiliateId: affiliate.id,
          referredId: accountId,
          orderId,
        },
      })

      if (existingReferral) {
        return NextResponse.json(
          { success: false, error: 'Esta indicação já foi registrada' },
          { status: 409 }
        )
      }
    } else {
      // Se não tem orderId, verificar se já tem indicação pendente para esta conta
      const existingPending = await db.referral.findFirst({
        where: {
          affiliateId: affiliate.id,
          referredId: accountId,
          status: 'pending',
        },
      })

      if (existingPending) {
        return NextResponse.json(
          { success: false, error: 'Você já tem uma indicação pendente para este afiliado' },
          { status: 409 }
        )
      }
    }

    // Buscar valor do pedido se orderId fornecido
    let amount = 0
    if (orderId) {
      const order = await db.order.findUnique({
        where: { id: orderId },
        select: { total: true },
      })
      if (order) {
        amount = order.total
      }
    }

    // Calcular comissão
    const commission = parseFloat((amount * affiliate.commissionRate).toFixed(2))

    // Criar registro de indicação
    const referral = await db.referral.create({
      data: {
        affiliateId: affiliate.id,
        referredId: accountId,
        orderId: orderId || null,
        amount,
        commission,
        status: 'pending',
      },
    })

    // Incrementar total de indicações do afiliado
    await db.affiliate.update({
      where: { id: affiliate.id },
      data: {
        totalReferrals: { increment: 1 },
      },
    })

    // Registrar log de atividade do afiliado
    await db.activityLog.create({
      data: {
        accountId: affiliate.accountId,
        action: 'NEW_REFERRAL',
        details: `Nova indicação registrada: ${referral.id} - Comissão pendente: R$${commission.toFixed(2)}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Indicação registrada com sucesso!',
      data: {
        referralId: referral.id,
        affiliateReferralCode: affiliate.referralCode,
        amount,
        commission,
        status: referral.status,
      },
    })
  } catch (error) {
    console.error('Erro ao registrar indicação:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
