import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const user = session?.user as Record<string, unknown> | null
  if (!user || user.role !== 'ADMIN') {
    return null
  }
  return session
}

// GET - Listar afiliados com ganhos pendentes
export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta rota.' },
        { status: 403 }
      )
    }

    const affiliates = await db.affiliate.findMany({
      where: {
        pendingEarnings: { gt: 0 },
      },
      select: {
        id: true,
        referralCode: true,
        totalEarnings: true,
        pendingEarnings: true,
        totalReferrals: true,
        totalConversions: true,
        status: true,
        createdAt: true,
        account: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
          },
        },
      },
      orderBy: { pendingEarnings: 'desc' },
    })

    const totalPendingPayouts = affiliates.reduce(
      (sum, aff) => sum + aff.pendingEarnings,
      0
    )

    return NextResponse.json({
      affiliates: affiliates.map((aff) => ({
        id: aff.id,
        name: aff.account.name,
        email: aff.account.email,
        phone: aff.account.phone,
        accountStatus: aff.account.status,
        referralCode: aff.referralCode,
        totalEarnings: aff.totalEarnings,
        pendingEarnings: aff.pendingEarnings,
        totalReferrals: aff.totalReferrals,
        totalConversions: aff.totalConversions,
        status: aff.status,
        createdAt: aff.createdAt,
      })),
      totalPendingPayouts,
      count: affiliates.length,
    })
  } catch (error) {
    console.error('[Admin Payouts GET] Erro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar pagamentos pendentes.' },
      { status: 500 }
    )
  }
}

// PATCH - Aprovar ou rejeitar pagamento de afiliado
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta rota.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { affiliateId, action, amount } = body as {
      affiliateId: string
      action: 'approve' | 'reject'
      amount: number
    }

    if (!affiliateId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos. Informe affiliateId, action (approve/reject) e amount.' },
        { status: 400 }
      )
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valor inválido. O amount deve ser maior que zero.' },
        { status: 400 }
      )
    }

    // Buscar afiliado
    const affiliate = await db.affiliate.findUnique({
      where: { id: affiliateId },
      include: { account: true },
    })

    if (!affiliate) {
      return NextResponse.json(
        { error: 'Afiliado não encontrado.' },
        { status: 404 }
      )
    }

    if (amount > affiliate.pendingEarnings) {
      return NextResponse.json(
        { error: `Valor solicitado (R$ ${amount.toFixed(2)}) excede os ganhos pendentes (R$ ${affiliate.pendingEarnings.toFixed(2)}).` },
        { status: 400 }
      )
    }

    const adminId = (session.user as Record<string, unknown>).id as string

    if (action === 'approve') {
      // Aprovar pagamento: deduzir do totalEarnings e do pendingEarnings
      const updated = await db.$transaction([
        db.affiliate.update({
          where: { id: affiliateId },
          data: {
            totalEarnings: { decrement: amount },
            pendingEarnings: { decrement: amount },
          },
        }),
        db.activityLog.create({
          data: {
            accountId: adminId,
            action: 'PAYOUT_APPROVE',
            details: `Pagamento de R$ ${amount.toFixed(2)} aprovado para o afiliado "${affiliate.account.name}" (código: ${affiliate.referralCode}).`,
          },
        }),
      ])

      return NextResponse.json({
        message: `Pagamento de R$ ${amount.toFixed(2)} aprovado para "${affiliate.account.name}".`,
        affiliate: {
          id: updated[0].id,
          referralCode: updated[0].referralCode,
          totalEarnings: updated[0].totalEarnings,
          pendingEarnings: updated[0].pendingEarnings,
        },
      })
    }

    if (action === 'reject') {
      // Rejeitar pagamento: mover pendingEarnings de volta (os ganhos permanecem como available/pending)
      // Na prática, os ganhos pendentes continuam acumulados - apenas registramos a rejeição
      const updated = await db.$transaction([
        db.affiliate.update({
          where: { id: affiliateId },
          data: {
            // Mantemos o pendingEarnings - o afiliado pode solicitar novamente
            // Poderíamos adicionar um campo "rejectedPayouts" mas o schema não tem
          },
        }),
        db.activityLog.create({
          data: {
            accountId: adminId,
            action: 'PAYOUT_REJECT',
            details: `Pagamento de R$ ${amount.toFixed(2)} rejeitado para o afiliado "${affiliate.account.name}" (código: ${affiliate.referralCode}). Os ganhos permanecem pendentes.`,
          },
        }),
      ])

      return NextResponse.json({
        message: `Pagamento de R$ ${amount.toFixed(2)} rejeitado para "${affiliate.account.name}". Os ganhos permanecem pendentes para nova solicitação.`,
        affiliate: {
          id: updated[0].id,
          referralCode: updated[0].referralCode,
          totalEarnings: updated[0].totalEarnings,
          pendingEarnings: updated[0].pendingEarnings,
        },
      })
    }

    return NextResponse.json({ error: 'Ação desconhecida.' }, { status: 400 })
  } catch (error) {
    console.error('[Admin Payouts PATCH] Erro:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor ao processar pagamento.' },
      { status: 500 }
    )
  }
}
