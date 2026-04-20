import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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

    // Buscar indicações recentes (últimas 10)
    const recentReferrals = await db.referral.findMany({
      where: { affiliateId: affiliate.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        affiliate: false,
      },
    })

    // Buscar nomes dos usuários indicados
    const referredAccounts = await db.account.findMany({
      where: {
        id: { in: recentReferrals.map((r) => r.referredId) },
      },
      select: { id: true, name: true },
    })

    const accountMap = new Map(referredAccounts.map((a) => [a.id, a.name]))

    // Formatar indicações recentes
    const formattedReferrals = recentReferrals.map((ref) => ({
      id: ref.id,
      referredUserName: accountMap.get(ref.referredId) || 'Desconhecido',
      amount: ref.amount,
      commission: ref.commission,
      status: ref.status,
      createdAt: ref.createdAt.toISOString(),
    }))

    // Calcular saldo disponível (totalEarnings - soma de indicações pagas)
    const paidReferrals = await db.referral.findMany({
      where: {
        affiliateId: affiliate.id,
        status: 'paid',
      },
      select: { commission: true },
    })
    const paidCommissions = paidReferrals.reduce((sum, r) => sum + r.commission, 0)
    const availableBalance = affiliate.totalEarnings - affiliate.pendingEarnings

    // Estatísticas do mês atual
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const monthlyReferrals = await db.referral.count({
      where: {
        affiliateId: affiliate.id,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    })

    const monthlyConversions = await db.referral.count({
      where: {
        affiliateId: affiliate.id,
        status: { in: ['approved', 'paid'] },
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        referralCode: affiliate.referralCode,
        commissionRate: affiliate.commissionRate,
        totalEarnings: affiliate.totalEarnings,
        pendingEarnings: affiliate.pendingEarnings,
        totalReferrals: affiliate.totalReferrals,
        totalConversions: affiliate.totalConversions,
        status: affiliate.status,
        availableBalance,
        recentReferrals: formattedReferrals,
        monthlyStats: {
          referrals: monthlyReferrals,
          conversions: monthlyConversions,
        },
      },
    })
  } catch (error) {
    console.error('Erro ao carregar dashboard do afiliado:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
