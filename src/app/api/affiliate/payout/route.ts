import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const MIN_PAYOUT_AMOUNT = 50 // R$50 mínimo para saque

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Sessão não encontrada' },
        { status: 401 }
      )
    }

    const userId = (session.user as Record<string, unknown>).id as string
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ID do usuário não encontrado' },
        { status: 401 }
      )
    }

    // Buscar dados do afiliado
    const affiliate = await db.affiliate.findUnique({
      where: { accountId: userId },
    })

    if (!affiliate) {
      return NextResponse.json(
        { success: false, error: 'Perfil de afiliado não encontrado' },
        { status: 404 }
      )
    }

    const availableBalance = affiliate.totalEarnings - affiliate.pendingEarnings

    // Buscar últimas solicitações de saque do log de atividades
    const payoutLogs = await db.activityLog.findMany({
      where: {
        accountId: userId,
        action: 'PAYOUT_REQUEST',
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    const recentPayoutHistory = payoutLogs.map((log) => ({
      id: log.id,
      details: log.details,
      createdAt: log.createdAt.toISOString(),
    }))

    // Contar saques pendentes
    const pendingPayouts = await db.activityLog.count({
      where: {
        accountId: userId,
        action: 'PAYOUT_REQUEST',
        details: { contains: 'pendente' },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        availableBalance,
        pendingPayouts,
        recentPayoutHistory,
        minPayoutAmount: MIN_PAYOUT_AMOUNT,
      },
    })
  } catch (error) {
    console.error('Erro ao carregar informações de saque:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Sessão não encontrada' },
        { status: 401 }
      )
    }

    const userId = (session.user as Record<string, unknown>).id as string
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ID do usuário não encontrado' },
        { status: 401 }
      )
    }

    // Validar body
    const body = await request.json()
    const { amount } = body

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valor inválido' },
        { status: 400 }
      )
    }

    if (amount < MIN_PAYOUT_AMOUNT) {
      return NextResponse.json(
        { success: false, error: `O valor mínimo para saque é R$${MIN_PAYOUT_AMOUNT},00` },
        { status: 400 }
      )
    }

    // Buscar dados do afiliado
    const affiliate = await db.affiliate.findUnique({
      where: { accountId: userId },
    })

    if (!affiliate) {
      return NextResponse.json(
        { success: false, error: 'Perfil de afiliado não encontrado' },
        { status: 404 }
      )
    }

    if (affiliate.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Sua conta de afiliado não está ativa' },
        { status: 403 }
      )
    }

    const availableBalance = affiliate.totalEarnings - affiliate.pendingEarnings

    if (amount > availableBalance) {
      return NextResponse.json(
        { success: false, error: `Saldo insuficiente. Saldo disponível: R$${availableBalance.toFixed(2)}` },
        { status: 400 }
      )
    }

    // Atualizar dados do afiliado
    const updatedAffiliate = await db.affiliate.update({
      where: { id: affiliate.id },
      data: {
        totalEarnings: affiliate.totalEarnings - amount,
        pendingEarnings: affiliate.pendingEarnings + amount,
      },
    })

    // Registrar log de atividade
    await db.activityLog.create({
      data: {
        accountId: userId,
        action: 'PAYOUT_REQUEST',
        details: `Solicitação de saque de R$${amount.toFixed(2)} - Status: pendente`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Solicitação de saque realizada com sucesso!',
      data: {
        amount,
        newTotalEarnings: updatedAffiliate.totalEarnings,
        newPendingEarnings: updatedAffiliate.pendingEarnings,
        availableBalance: updatedAffiliate.totalEarnings - updatedAffiliate.pendingEarnings,
        status: 'pendente',
      },
    })
  } catch (error) {
    console.error('Erro ao solicitar saque:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
