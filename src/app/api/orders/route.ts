import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateOrderNumber } from '@/lib/orderFlow'
import { logger } from '@/lib/logger'

// GET: Listar pedidos de um usuário com filtros e paginação
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const accountId = (session?.user as Record<string, unknown>)?.id as string | undefined

    // Filtros
    const storeId = searchParams.get('storeId')
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Paginação
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!accountId) {
      return NextResponse.json({ orders: [], total: 0, limit, offset })
    }

    const where: Record<string, unknown> = { accountId }

    if (storeId) where.storeId = storeId
    if (status) where.status = status

    // Filtro por faixa de data
    if (dateFrom || dateTo) {
      const createdAt: Record<string, Date> = {}
      if (dateFrom) createdAt.gte = new Date(dateFrom)
      if (dateTo) {
        const endDate = new Date(dateTo)
        endDate.setUTCHours(23, 59, 59, 999)
        createdAt.lte = endDate
      }
      where.createdAt = createdAt
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          store: {
            select: {
              id: true,
              name: true,
              logo: true,
              category: true,
              phone: true,
              whatsapp: true,
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

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        storeId: o.storeId,
        storeName: o.store.name,
        storeLogo: o.store.logo,
        storePhone: o.store.phone,
        storeWhatsapp: o.store.whatsapp,
        status: o.status,
        subtotal: o.subtotal,
        deliveryFee: o.deliveryFee,
        discount: o.discount,
        total: o.total,
        paymentMethod: o.paymentMethod,
        deliveryType: o.deliveryType,
        deliveryAddress: o.deliveryAddress,
        items: o.items,
        estimatedTime: o.estimatedTime,
        createdAt: o.createdAt,
        paidAt: o.paidAt,
        deliveredAt: o.deliveredAt,
        cancelledAt: o.cancelledAt,
        statusHistory: o.statusHistory,
      })),
      total,
      limit,
      offset,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1,
        hasMore: offset + limit < total,
      },
    })
  } catch (error: unknown) {
    console.error('Erro ao listar pedidos:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST: Criar pedido a partir de itens do carrinho
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const accountId = (session?.user as Record<string, unknown>)?.id as string | undefined

    const {
      storeId,
      items,
      deliveryType = 'DELIVERY',
      deliveryAddress,
      paymentMethod = 'PIX',
      notes,
      discount = 0,
    } = body

    if (!accountId) {
      return NextResponse.json(
        { error: 'Usuário não autenticado. Faça login para criar um pedido.' },
        { status: 401 }
      )
    }

    if (!storeId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'ID da loja e itens são obrigatórios' },
        { status: 400 }
      )
    }

    // Validate payment method
    const validPaymentMethods = ['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'BOLETO', 'CASH_ON_DELIVERY']
    if (!validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Método de pagamento inválido' },
        { status: 400 }
      )
    }

    // Validate delivery type
    if (deliveryType !== 'DELIVERY' && deliveryType !== 'PICKUP') {
      return NextResponse.json(
        { error: 'Tipo de entrega inválido' },
        { status: 400 }
      )
    }

    // Verify stock for all products (batch query to avoid N+1)
    const productIds = items.map((item: { productId: string }) => item.productId)
    const products = await db.product.findMany({ where: { id: { in: productIds } } })
    const productMap = new Map(products.map((p) => [p.id, p]))

    for (const item of items) {
      const product = productMap.get(item.productId)

      if (!product) {
        return NextResponse.json(
          { error: `Produto "${item.productName || item.productId}" não encontrado` },
          { status: 404 }
        )
      }

      if (product.storeId !== storeId) {
        return NextResponse.json(
          { error: `Produto "${product.name}" não pertence a esta loja` },
          { status: 400 }
        )
      }

      if (product.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: `Produto "${product.name}" não está disponível` },
          { status: 400 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Estoque insuficiente para "${product.name}". Disponível: ${product.stock}` },
          { status: 400 }
        )
      }
    }

    // Fetch store for delivery fee and commission
    const store = await db.store.findUnique({ where: { id: storeId } })
    if (!store) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    )

    // Calculate delivery fee based on store settings
    let deliveryFee = 0
    if (deliveryType === 'DELIVERY') {
      deliveryFee = store.deliveryFee || 0
      // Free delivery above threshold
      if (store.freeDeliveryAbove && subtotal >= store.freeDeliveryAbove) {
        deliveryFee = 0
      }
    }

    // Validate discount doesn't exceed subtotal
    const validatedDiscount = Math.min(discount, subtotal)
    const total = Math.max(0, subtotal + deliveryFee - validatedDiscount)

    // Calculate commission
    const commission = total * store.commissionRate

    // Generate unique order number
    const orderNumber = generateOrderNumber()

    // Create order using Prisma transaction
    const order = await db.$transaction(async (tx) => {
      // 1. Decrease product stock and increment sold count
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        })
      }

      // 2. Increment store total sales
      await tx.store.update({
        where: { id: storeId },
        data: { totalSales: { increment: 1 } },
      })

      // 3. Create the order with items and status history
      return tx.order.create({
        data: {
          orderNumber,
          accountId,
          storeId,
          status: 'PENDING',
          subtotal,
          deliveryFee,
          discount: validatedDiscount,
          total,
          paymentMethod,
          deliveryType,
          deliveryAddress: deliveryType === 'DELIVERY' ? deliveryAddress : null,
          notes: notes || null,
          commission,
          commissionRate: store.commissionRate,
          estimatedTime: deliveryType === 'PICKUP' ? '30-60 min' : '30-60 min',
          items: {
            create: items.map(
              (item: {
                productId: string
                productName?: string
                productImage?: string
                price: number
                quantity: number
              }) => ({
                productId: item.productId,
                productName: item.productName || item.productId,
                productImage: item.productImage || null,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity,
              })
            ),
          },
          statusHistory: {
            create: {
              status: 'PENDING',
              note: 'Pedido recebido',
            },
          },
        },
        include: {
          items: true,
          store: { select: { name: true, logo: true } },
          statusHistory: {
            select: { status: true, note: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      })
    })

    // Clear cart items for this user and store (outside transaction for safety)
    try {
      await db.cartItem.deleteMany({
        where: {
          accountId,
          product: { storeId },
        },
      })
    } catch {
      // Non-critical: cart cleanup failed, order was still created
      logger.warn('Could not clear cart after order creation')
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        storeId: order.storeId,
        storeName: order.store.name,
        storeLogo: order.store.logo,
        status: order.status,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        discount: order.discount,
        total: order.total,
        paymentMethod: order.paymentMethod,
        deliveryType: order.deliveryType,
        deliveryAddress: order.deliveryAddress,
        estimatedTime: order.estimatedTime,
        items: order.items,
        statusHistory: order.statusHistory,
        createdAt: order.createdAt,
      },
    })
  } catch (error: unknown) {
    logger.error('Erro ao criar pedido:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
