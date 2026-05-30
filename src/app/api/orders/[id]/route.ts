import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET: Detalhes do pedido com itens e informações da loja
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const order = await db.order.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            logo: true,
            coverImage: true,
            phone: true,
            whatsapp: true,
            address: true,
            neighborhood: true,
            category: true,
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
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            status: true,
            note: true,
            createdAt: true,
          },
        },
        driver: {
          select: {
            id: true,
            vehicleType: true,
            vehiclePlate: true,
            rating: true,
            totalDeliveries: true,
            account: {
              select: {
                name: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      storeId: order.storeId,
      store: order.store,
      status: order.status,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      discount: order.discount,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentId: order.paymentId,
      deliveryType: order.deliveryType,
      deliveryAddress: order.deliveryAddress,
      trackingCode: order.trackingCode,
      notes: order.notes,
      estimatedTime: order.estimatedTime,
      customerRating: order.customerRating,
      driverRating: order.driverRating,
      commission: order.commission,
      items: order.items,
      statusHistory: order.statusHistory,
      driver: order.driver,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      cancelReason: order.cancelReason,
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }, { status: 500 })
  }
}

// PATCH: Atualizar status do pedido (dono da loja / entregador)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, driverId, trackingCode, cancelReason, note } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status é obrigatório' },
        { status: 400 }
      )
    }

    const validStatuses = [
      'PENDING', 'CONFIRMED', 'PREPARING', 'READY',
      'DELIVERING', 'DELIVERED', 'CANCELLED', 'REFUNDED',
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status inválido. Valores permitidos: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const order = await db.order.findUnique({ where: { id } })
    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    updateData.status = status

    if (driverId) updateData.driverId = driverId
    if (trackingCode) updateData.trackingCode = trackingCode

    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date()
      // Restaurar estoque se cancelado antes (não aplicável para DELIVERED)
    }

    if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date()
      updateData.cancelReason = cancelReason || null

      // Restaurar estoque dos produtos
      const items = await db.orderItem.findMany({
        where: { orderId: id },
        select: { productId: true, quantity: true },
      })

      for (const item of items) {
        await db.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            soldCount: { decrement: item.quantity },
          },
        })
      }
    }

    const updatedOrder = await db.order.update({
      where: { id },
      data: updateData,
    })

    // Registrar no histórico de status
    await db.orderStatusHistory.create({
      data: {
        orderId: id,
        status,
        note: note || null,
      },
    })

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
      },
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST: Adicionar avaliação ao pedido
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { accountId, rating, comment, images } = body

    if (!accountId || !rating) {
      return NextResponse.json(
        { error: 'ID da conta e avaliação são obrigatórios' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'A avaliação deve ser entre 1 e 5' },
        { status: 400 }
      )
    }

    const order = await db.order.findUnique({
      where: { id },
      include: { store: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    if (order.accountId !== accountId) {
      return NextResponse.json(
        { error: 'Você não pode avaliar este pedido' },
        { status: 403 }
      )
    }

    if (order.status !== 'DELIVERED') {
      return NextResponse.json(
        { error: 'Apenas pedidos entregues podem ser avaliados' },
        { status: 400 }
      )
    }

    // Verificar se já avaliou
    const existingReview = await db.review.findFirst({
      where: {
        accountId,
        storeId: order.storeId,
        productId: null,
      },
    })

    // Atualizar avaliação do pedido
    await db.order.update({
      where: { id },
      data: { customerRating: rating },
    })

    // Criar ou atualizar avaliação da loja
    const imagesStr = Array.isArray(images) ? JSON.stringify(images) : images || '[]'

    if (existingReview) {
      await db.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          comment: comment || null,
          images: imagesStr,
          isVerified: true,
        },
      })
    } else {
      await db.review.create({
        data: {
          accountId,
          storeId: order.storeId,
          rating,
          comment: comment || null,
          images: imagesStr,
          isVerified: true,
        },
      })
    }

    // Atualizar avaliação média da loja
    const storeReviews = await db.review.findMany({
      where: { storeId: order.storeId },
      select: { rating: true },
    })

    const avgRating = storeReviews.length > 0
      ? storeReviews.reduce((sum, r) => sum + r.rating, 0) / storeReviews.length
      : 0

    await db.store.update({
      where: { id: order.storeId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        totalReviews: storeReviews.length,
      },
    })

    return NextResponse.json({ success: true, message: 'Avaliação registrada com sucesso' })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }, { status: 500 })
  }
}
