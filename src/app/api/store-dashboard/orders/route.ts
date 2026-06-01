import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET: Listar pedidos da loja do lojista
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const accountId = (session?.user as Record<string, unknown>)?.id as string

    // Parâmetros de filtro
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Paginação
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!accountId) {
      return NextResponse.json(
        { error: 'ID da conta é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar a loja associada a esta conta
    const store = await db.store.findUnique({
      where: { accountId },
      select: { id: true, name: true },
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Loja não encontrada para esta conta' },
        { status: 404 }
      )
    }

    const storeId = store.id

    // Construir filtro where
    const where: Record<string, unknown> = { storeId }

    if (status) {
      where.status = status as string
    }

    // Filtro por faixa de data
    if (dateFrom || dateTo) {
      const createdAt: Record<string, Date> = {}
      if (dateFrom) {
        createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        // Incluir o dia inteiro (até 23:59:59)
        const endDate = new Date(dateTo)
        endDate.setUTCHours(23, 59, 59, 999)
        createdAt.lte = endDate
      }
      where.createdAt = createdAt
    }

    // Buscar pedidos com paginação em paralelo
    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          account: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatar: true,
            },
          },
          items: {
            select: {
              id: true,
              productId: true,
              productName: true,
              productImage: true,
              price: true,
              quantity: true,
              total: true,
            },
          },
          statusHistory: {
            select: {
              id: true,
              status: true,
              note: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.order.count({ where }),
    ])

    // Calcular totais de receita para os pedidos filtrados
    const revenueStatuses = ['CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED']
    const filteredRevenueResult = await db.order.aggregate({
      where: {
        ...where,
        status: { in: revenueStatuses },
      },
      _sum: { total: true },
      _count: true,
    })

    return NextResponse.json({
      storeId,
      storeName: store.name,
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        accountId: o.accountId,
        customerName: o.account.name,
        customerPhone: o.account.phone,
        customerAvatar: o.account.avatar,
        status: o.status,
        subtotal: o.subtotal,
        deliveryFee: o.deliveryFee,
        discount: o.discount,
        total: o.total,
        paymentMethod: o.paymentMethod,
        deliveryType: o.deliveryType,
        deliveryAddress: o.deliveryAddress,
        notes: o.notes,
        estimatedTime: o.estimatedTime,
        items: o.items,
        statusHistory: o.statusHistory,
        createdAt: o.createdAt,
        paidAt: o.paidAt,
        deliveredAt: o.deliveredAt,
        cancelledAt: o.cancelledAt,
        cancelReason: o.cancelReason,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
        totalPages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1,
      },
      summary: {
        filteredRevenue: filteredRevenueResult._sum.total || 0,
        filteredCount: filteredRevenueResult._count || 0,
      },
    })
  } catch (error) {
    console.error('Erro ao listar pedidos da loja:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
