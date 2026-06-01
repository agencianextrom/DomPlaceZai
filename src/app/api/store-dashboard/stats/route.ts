import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET: Estatísticas do painel do lojista
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const accountId = (session?.user as Record<string, unknown>)?.id as string

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

    // Data de 7 dias atrás para receita semanal
    const sevenDaysAgo = new Date(todayStart)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Data de 30 dias atrás para receita mensal
    const thirtyDaysAgo = new Date(todayStart)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Executar todas as consultas de estatísticas em paralelo
    const [
      totalRevenueResult,
      todayRevenueResult,
      weekRevenueResult,
      monthRevenueResult,
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
      // Top 5 produtos mais vendidos
      topProducts,
      // Receita diária dos últimos 7 dias
      dailyRevenue,
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

      // Receita da semana
      db.order.aggregate({
        where: {
          storeId,
          status: { in: revenueStatuses },
          createdAt: { gte: sevenDaysAgo },
        },
        _sum: { total: true },
      }),

      // Receita do mês
      db.order.aggregate({
        where: {
          storeId,
          status: { in: revenueStatuses },
          createdAt: { gte: thirtyDaysAgo },
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

      // Top 5 produtos mais vendidos
      db.product.findMany({
        where: { storeId, status: 'ACTIVE' },
        select: {
          id: true,
          name: true,
          price: true,
          soldCount: true,
          stock: true,
          images: true,
          rating: true,
          totalReviews: true,
        },
        orderBy: { soldCount: 'desc' },
        take: 5,
      }),

      // Pedidos dos últimos 7 dias com receita (para gráfico diário)
      db.order.findMany({
        where: {
          storeId,
          status: { in: revenueStatuses },
          createdAt: { gte: sevenDaysAgo },
        },
        select: {
          total: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
    ])

    // Agrupar receita por dia dos últimos 7 dias
    const dailyRevenueMap = new Map<string, number>()
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo)
      date.setDate(date.getDate() + i)
      const key = date.toISOString().split('T')[0]
      dailyRevenueMap.set(key, 0)
    }

    for (const order of dailyRevenue) {
      const key = order.createdAt.toISOString().split('T')[0]
      const current = dailyRevenueMap.get(key) || 0
      dailyRevenueMap.set(key, current + order.total)
    }

    const dailyRevenueData = Array.from(dailyRevenueMap.entries()).map(
      ([date, revenue]) => ({ date, revenue: Math.round(revenue * 100) / 100 })
    )

    // Calcular taxa média de avaliação (com base nos reviews)
    const reviewsWithRating = await db.review.findMany({
      where: { storeId },
      select: { rating: true },
    })
    const averageRating = reviewsWithRating.length > 0
      ? Math.round(
          (reviewsWithRating.reduce((sum, r) => sum + r.rating, 0) / reviewsWithRating.length) * 10
        ) / 10
      : 0

    return NextResponse.json({
      storeId,
      storeName: store.name,
      storeStatus: store.status,
      stats: {
        totalRevenue: totalRevenueResult._sum.total || 0,
        todayRevenue: todayRevenueResult._sum.total || 0,
        weekRevenue: weekRevenueResult._sum.total || 0,
        monthRevenue: monthRevenueResult._sum.total || 0,
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
        averageRating,
        totalReviews: storeWithRatings?.totalReviews || 0,
      },
      topProducts: topProducts.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        soldCount: p.soldCount,
        stock: p.stock,
        images: p.images,
        rating: p.rating,
        totalReviews: p.totalReviews,
      })),
      dailyRevenue: dailyRevenueData,
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas do painel:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
