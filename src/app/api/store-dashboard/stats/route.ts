import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET: Estatísticas do painel do lojista
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId') || (session?.user as Record<string, unknown>)?.id as string

    if (!accountId) {
      return NextResponse.json(
        { error: 'ID da conta é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar a loja associada a esta conta
    const store = await db.store.findUnique({
      where: { accountId },
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Loja não encontrada para esta conta' },
        { status: 404 }
      )
    }

    const storeId = store.id

    // Definir statuses que contam como receita (pedidos pagos/ativos)
    const revenueStatuses = ['CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED']

    // Início do dia (meia-noite no fuso de Brasília)
    const todayStart = new Date()
    todayStart.setUTCHours(3, 0, 0, 0) // UTC-3 = meia-noite em Brasília

    // Executar todas as consultas de estatísticas em paralelo
    const [
      totalRevenueResult,
      todayRevenueResult,
      totalOrdersResult,
      pendingOrdersResult,
      preparingOrdersResult,
      deliveringOrdersResult,
      completedOrdersResult,
      cancelledOrdersResult,
      refundedOrdersResult,
      totalProductsResult,
      activeProductsResult,
      storeWithRatings,
    ] = await Promise.all([
      // Receita total
      db.order.aggregate({
        where: { storeId, status: { in: revenueStatuses } },
        _sum: { total: true },
      }),

      // Receita de hoje
      db.order.aggregate({
        where: {
          storeId,
          status: { in: revenueStatuses },
          createdAt: { gte: todayStart },
        },
        _sum: { total: true },
      }),

      // Total de pedidos
      db.order.count({ where: { storeId } }),

      // Pedidos pendentes
      db.order.count({ where: { storeId, status: 'PENDING' } }),

      // Pedidos em preparo
      db.order.count({ where: { storeId, status: 'PREPARING' } }),

      // Pedidos em entrega
      db.order.count({ where: { storeId, status: 'DELIVERING' } }),

      // Pedidos concluídos (entregues)
      db.order.count({ where: { storeId, status: 'DELIVERED' } }),

      // Pedidos cancelados
      db.order.count({ where: { storeId, status: 'CANCELLED' } }),

      // Pedidos reembolsados
      db.order.count({ where: { storeId, status: 'REFUNDED' } }),

      // Total de produtos
      db.product.count({ where: { storeId } }),

      // Produtos ativos
      db.product.count({ where: { storeId, status: 'ACTIVE' } }),

      // Rating e total de reviews (da store)
      db.store.findUnique({
        where: { id: storeId },
        select: { rating: true, totalReviews: true },
      }),
    ])

    return NextResponse.json({
      storeId,
      storeName: store.name,
      storeStatus: store.status,
      stats: {
        totalRevenue: totalRevenueResult._sum.total || 0,
        todayRevenue: todayRevenueResult._sum.total || 0,
        totalOrders,
        pendingOrders,
        preparingOrders,
        deliveringOrders,
        completedOrders,
        cancelledOrders,
        refundedOrders,
        totalProducts,
        activeProducts,
        inactiveProducts: totalProducts - activeProductsResult,
        averageRating: storeWithRatings?.rating || 0,
        totalReviews: storeWithRatings?.totalReviews || 0,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas do painel:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
