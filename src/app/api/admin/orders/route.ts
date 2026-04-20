import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { OrderStatus } from '@prisma/client'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const user = session?.user as Record<string, unknown> | null
  if (!user || user.role !== 'ADMIN') {
    return null
  }
  return session
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta rota.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as OrderStatus | null
    const storeId = searchParams.get('storeId') || null
    const dateFrom = searchParams.get('dateFrom') || null
    const dateTo = searchParams.get('dateTo') || null
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 100)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0)

    // Montar filtro where
    const where: Record<string, unknown> = {}

    if (status && Object.values(OrderStatus).includes(status)) {
      where.status = status
    }
    if (storeId) {
      where.storeId = storeId
    }
    if (dateFrom || dateTo) {
      const createdAtFilter: Record<string, unknown> = {}
      if (dateFrom) {
        createdAtFilter.gte = new Date(dateFrom)
      }
      if (dateTo) {
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999)
        createdAtFilter.lte = toDate
      }
      where.createdAt = createdAtFilter
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          subtotal: true,
          deliveryFee: true,
          discount: true,
          total: true,
          paymentMethod: true,
          deliveryType: true,
          createdAt: true,
          deliveredAt: true,
          cancelledAt: true,
          cancelReason: true,
          store: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
          account: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          driver: {
            select: {
              id: true,
              account: {
                select: {
                  name: true,
                  phone: true,
                },
              },
            },
          },
          items: {
            select: {
              id: true,
              productName: true,
              quantity: true,
              price: true,
              total: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.order.count({ where }),
    ])

    const page = Math.floor(offset / limit) + 1
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        discount: order.discount,
        total: order.total,
        paymentMethod: order.paymentMethod,
        deliveryType: order.deliveryType,
        createdAt: order.createdAt,
        deliveredAt: order.deliveredAt,
        cancelledAt: order.cancelledAt,
        cancelReason: order.cancelReason,
        storeName: order.store.name,
        storeCategory: order.store.category,
        customerName: order.account.name,
        customerEmail: order.account.email,
        driverName: order.driver?.account?.name || null,
        driverPhone: order.driver?.account?.phone || null,
        itemCount: order.items.length,
        items: order.items,
      })),
      pagination: {
        total,
        page,
        totalPages,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('[Admin Orders] Erro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar pedidos.' },
      { status: 500 }
    )
  }
}
