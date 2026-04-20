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

export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta rota.' },
        { status: 403 }
      )
    }

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
      topStores,
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
      (() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return db.order.count({
          where: { createdAt: { gte: today } },
        })
      })(),
      // Receita de hoje
      (() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return db.order.aggregate({
          where: {
            status: 'DELIVERED',
            deliveredAt: { gte: today },
          },
          _sum: { total: true },
        })
      })(),
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
    const orderCounts = {
      pending: 0,
      confirmed: 0,
      preparing: 0,
      ready: 0,
      delivering: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
    }
    for (const item of totalOrdersByStatus) {
      switch (item.status) {
        case 'PENDING':
          orderCounts.pending = item._count.id
          break
        case 'CONFIRMED':
          orderCounts.confirmed = item._count.id
          break
        case 'PREPARING':
          orderCounts.preparing = item._count.id
          break
        case 'READY':
          orderCounts.ready = item._count.id
          break
        case 'DELIVERING':
          orderCounts.delivering = item._count.id
          break
        case 'DELIVERED':
          orderCounts.delivered = item._count.id
          break
        case 'CANCELLED':
          orderCounts.cancelled = item._count.id
          break
        case 'REFUNDED':
          orderCounts.refunded = item._count.id
          break
      }
    }

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
      revenueToday: revenueToday._sum.total || 0,
      topStores,
    })
  } catch (error) {
    console.error('[Admin Stats] Erro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar estatísticas.' },
      { status: 500 }
    )
  }
}
