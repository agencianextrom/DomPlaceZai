import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

    // Buscar perfil do afiliado
    const affiliate = await db.affiliate.findUnique({
      where: { accountId: userId },
    })

    if (!affiliate) {
      return NextResponse.json(
        { success: false, error: 'Perfil de afiliado não encontrado' },
        { status: 404 }
      )
    }

    // Parse query params
    const { searchParams } = request.nextUrl
    const statusParam = searchParams.get('status') || 'all'
    const limitParam = parseInt(searchParams.get('limit') || '20', 10)
    const offsetParam = parseInt(searchParams.get('offset') || '0', 10)

    const limit = Math.min(Math.max(limitParam, 1), 100)
    const offset = Math.max(offsetParam, 0)

    // Construir filtro de status
    const statusFilter: Record<string, unknown> = { affiliateId: affiliate.id }
    if (statusParam !== 'all' && ['pending', 'approved', 'paid'].includes(statusParam)) {
      statusFilter.status = statusParam
    }

    // Buscar total de registros para paginação
    const totalCount = await db.referral.count({
      where: statusFilter as { affiliateId: string; status?: string },
    })

    // Buscar indicações
    const referrals = await db.referral.findMany({
      where: statusFilter as { affiliateId: string; status?: string },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    // Buscar dados dos usuários indicados
    const referredIds = referrals.map((r) => r.referredId)
    const referredAccounts = await db.account.findMany({
      where: { id: { in: referredIds } },
      select: { id: true, name: true, email: true },
    })
    const accountMap = new Map(referredAccounts.map((a) => [a.id, a]))

    // Buscar dados dos pedidos quando orderId existe
    const orderIds = referrals.map((r) => r.orderId).filter(Boolean) as string[]
    const orders = orderIds.length > 0
      ? await db.order.findMany({
          where: { id: { in: orderIds } },
          select: { id: true, orderNumber: true, total: true },
        })
      : []
    const orderMap = new Map(orders.map((o) => [o.id, o]))

    // Formatar resposta
    const formattedReferrals = referrals.map((ref) => {
      const referredAccount = accountMap.get(ref.referredId)
      const order = ref.orderId ? orderMap.get(ref.orderId) : null

      return {
        id: ref.id,
        referredUserName: referredAccount?.name || 'Desconhecido',
        referredUserEmail: referredAccount?.email || '',
        order: order
          ? {
              orderNumber: order.orderNumber,
              total: order.total,
            }
          : null,
        amount: ref.amount,
        commission: ref.commission,
        status: ref.status,
        createdAt: ref.createdAt.toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        referrals: formattedReferrals,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
      },
    })
  } catch (error) {
    console.error('Erro ao listar indicações:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
