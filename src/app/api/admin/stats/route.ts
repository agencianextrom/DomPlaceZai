import { NextResponse } from 'next/server'
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

export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta rota.' },
        { status: 403 }
      )
    }

    // Date helpers
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1) // Monday
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalAccountsByRole,
      totalStoresByStatus,
      totalOrdersByStatus,
      totalRevenue,
      totalProducts,
      totalReviews,
      recentRegistrations,
      ordersToday,
      revenueToday,
      revenueThisWeek,
      revenueThisMonth,
      topStores,
      recentOrders,
      activeUsersToday,
      ordersThisWeek,
      ordersThisMonth,
      revenueByCategory,
    ] = await Promise.all([
      // Contagem de contas por role
      db.account.groupBy({
        by: ['role'],
        _count: { id: true },
      }),
      // Contagem de lojas por status
      db.store.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      // Contagem de pedidos por status
      db.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      // Receita total (pedidos entregues)
      db.order.aggregate({
        where: { status: 'DELIVERED' },
        _sum: { total: true },
      }),
      // Total de produtos ativos
      db.product.count({
        where: { status: 'ACTIVE' },
      }),
      // Total de avaliações
      db.review.count(),
      // Últimos 5 registros
      db.account.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      }),
      // Pedidos de hoje
      db.order.count({
        where: { createdAt: { gte: today } },
      }),
      // Receita de hoje (pedidos entregues hoje)
      db.order.aggregate({
        where: {
          status: 'DELIVERED',
          deliveredAt: { gte: today },
        },
        _sum: { total: true },
      }),
      // Receita da semana
      db.order.aggregate({
        where: {
          status: 'DELIVERED',
          deliveredAt: { gte: weekStart },
        },
        _sum: { total: true },
      }),
      // Receita do mes
      db.order.aggregate({
        where: {
          status: 'DELIVERED',
          deliveredAt: { gte: monthStart },
        },
        _sum: { total: true },
      }),
      // Top 5 lojas por vendas
      db.store.findMany({
        orderBy: { totalSales: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          rating: true,
          totalReviews: true,
          totalSales: true,
        },
      }),
      // Últimos 5 pedidos
      db.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          paymentMethod: true,
          deliveryType: true,
          createdAt: true,
          store: {
            select: { name: true },
          },
          account: {
            select: { name: true },
          },
          items: {
            select: { id: true },
          },
        },
      }),
      // Usuários ativos hoje (que fizeram pedidos hoje)
      db.order.groupBy({
        by: ['accountId'],
        where: { createdAt: { gte: today } },
      }),
      // Pedidos da semana
      db.order.count({
        where: { createdAt: { gte: weekStart } },
      }),
      // Pedidos do mes
      db.order.count({
        where: { createdAt: { gte: monthStart } },
      }),
      // Receita por categoria (via lojas)
      db.store.findMany({
        select: {
          category: true,
          totalSales: true,
        },
      }),
    ])

    // Formatar contagem de contas por role
    const roleCounts = {
      users: 0,
      storeOwners: 0,
      drivers: 0,
      affiliates: 0,
      admins: 0,
    }
    for (const item of totalAccountsByRole) {
      switch (item.role) {
        case 'USER':
          roleCounts.users = item._count.id
          break
        case 'STORE_OWNER':
          roleCounts.storeOwners = item._count.id
          break
        case 'DELIVERY_DRIVER':
          roleCounts.drivers = item._count.id
          break
        case 'AFFILIATE':
          roleCounts.affiliates = item._count.id
          break
        case 'ADMIN':
          roleCounts.admins = item._count.id
          break
      }
    }

    // Formatar contagem de lojas por status
    const storeCounts = {
      active: 0,
      pending: 0,
      suspended: 0,
      inactive: 0,
    }
    for (const item of totalStoresByStatus) {
      switch (item.status) {
        case 'ACTIVE':
          storeCounts.active = item._count.id
          break
        case 'PENDING_APPROVAL':
          storeCounts.pending = item._count.id
          break
        case 'SUSPENDED':
          storeCounts.suspended = item._count.id
          break
        case 'INACTIVE':
          storeCounts.inactive = item._count.id
          break
      }
    }

    // Formatar contagem de pedidos por status
    const orderCounts: Record<string, number> = {}
    for (const item of totalOrdersByStatus) {
      orderCounts[item.status] = item._count.id
    }

    // Agrupar receita por categoria de loja
    const categoryMap: Record<string, { sales: number; count: number }> = {}
    for (const store of revenueByCategory) {
      if (!categoryMap[store.category]) {
        categoryMap[store.category] = { sales: 0, count: 0 }
      }
      categoryMap[store.category].sales += store.totalSales
      categoryMap[store.category].count += 1
    }
    const totalCategorySales = Object.values(categoryMap).reduce((s, c) => s + c.sales, 0) || 1
    const revenueByCategoryData = Object.entries(categoryMap)
      .map(([category, data]) => ({
        category,
        sales: data.sales,
        storeCount: data.count,
        percentage: Math.round((data.sales / totalCategorySales) * 100),
      }))
      .sort((a, b) => b.sales - a.sales)

    return NextResponse.json({
      totalAccounts: {
        byRole: roleCounts,
        total: totalAccountsByRole.reduce((acc, item) => acc + item._count.id, 0),
      },
      totalStores: {
        byStatus: storeCounts,
        total: totalStoresByStatus.reduce((acc, item) => acc + item._count.id, 0),
      },
      totalOrders: {
        byStatus: orderCounts,
        total: totalOrdersByStatus.reduce((acc, item) => acc + item._count.id, 0),
      },
      totalRevenue: totalRevenue._sum.total || 0,
      totalProducts,
      totalReviews,
      recentRegistrations,
      ordersToday,
      ordersThisWeek,
      ordersThisMonth,
      revenueToday: revenueToday._sum.total || 0,
      revenueThisWeek: revenueThisWeek._sum.total || 0,
      revenueThisMonth: revenueThisMonth._sum.total || 0,
      activeUsersToday: activeUsersToday.length,
      topStores,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        paymentMethod: order.paymentMethod,
        deliveryType: order.deliveryType,
        createdAt: order.createdAt,
        storeName: order.store.name,
        customerName: order.account.name,
        itemCount: order.items.length,
      })),
      revenueByCategory: revenueByCategoryData,
    })
  } catch (error) {
    console.error('[Admin Stats] Erro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar estatísticas.' },
      { status: 500 }
    )
  }
}
