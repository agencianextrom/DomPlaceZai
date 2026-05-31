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

// PATCH: Atualizar status do pedido usando a máquina de estados aprimorada
import { applyStatusTransition, getStatusLabel } from '@/lib/orderFlow'

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
    ] as const

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status inválido. Valores permitidos: ${validStatuses.map(s => getStatusLabel(s)).join(', ')}` },
        { status: 400 }
      )
    }

    // Use the enhanced state machine for all transitions
    const result = await applyStatusTransition({
      orderId: id,
      newStatus: status,
      note,
      cancelReason,
      driverId,
      trackingCode,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Optionally send push notification via FCM (fire-and-forget)
    if (result.notification) {
      try {
        await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountId: result.notification.accountId,
            title: result.notification.title,
            body: result.notification.message,
            data: result.notification.data,
          }),
        }).catch(() => {
          // Non-critical: push notification failed, in-app notification was already created
        })
      } catch {
        // Ignore FCM errors
      }
    }

    return NextResponse.json({
      success: true,
      loyaltyPoints: result.loyaltyPoints,
      commission: result.commission,
      notification: result.notification
        ? { title: result.notification.title, message: result.notification.message }
        : undefined,
    })
  } catch (error: unknown) {
    console.error('Erro ao atualizar pedido:', error)
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
