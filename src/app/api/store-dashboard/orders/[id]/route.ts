import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mapa de transições de status permitidas
const STATUS_TRANSITIONS: Record<string, { nextStatus: string; label: string }[]> = {
  PENDING: [
    { nextStatus: 'CONFIRMED', label: 'Aceitar pedido' },
    { nextStatus: 'CANCELLED', label: 'Rejeitar pedido' },
  ],
  CONFIRMED: [
    { nextStatus: 'PREPARING', label: 'Iniciar preparo' },
    { nextStatus: 'CANCELLED', label: 'Cancelar pedido' },
  ],
  PREPARING: [
    { nextStatus: 'READY', label: 'Pronto para retirada/entrega' },
  ],
  READY: [
    { nextStatus: 'DELIVERING', label: 'Saiu para entrega' },
  ],
  DELIVERING: [
    { nextStatus: 'DELIVERED', label: 'Pedido entregue' },
  ],
}

// Mapeamento de ações para transições de status
const ACTION_MAP: Record<string, { from: string; to: string; defaultNote: string }> = {
  accept: { from: 'PENDING', to: 'CONFIRMED', defaultNote: 'Pedido aceito pelo lojista' },
  reject: { from: 'PENDING', to: 'CANCELLED', defaultNote: 'Pedido rejeitado pelo lojista' },
  prepare: { from: 'CONFIRMED', to: 'PREPARING', defaultNote: 'Preparo iniciado' },
  ready: { from: 'PREPARING', to: 'READY', defaultNote: 'Pedido pronto' },
  start_delivery: { from: 'READY', to: 'DELIVERING', defaultNote: 'Pedido saiu para entrega' },
  deliver: { from: 'DELIVERING', to: 'DELIVERED', defaultNote: 'Pedido entregue' },
  cancel: { from: 'CONFIRMED', to: 'CANCELLED', defaultNote: 'Pedido cancelado pelo lojista' },
}

// PATCH: Atualizar status do pedido (ações do lojista)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { action, reason } = body

    // Identificar a conta do lojista
    const accountId = (session?.user as Record<string, unknown>)?.id as string

    if (!accountId) {
      return NextResponse.json(
        { error: 'ID da conta é obrigatório' },
        { status: 400 }
      )
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Ação é obrigatória' },
        { status: 400 }
      )
    }

    const validActions = Object.keys(ACTION_MAP)
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Ação inválida. Ações permitidas: ${validActions.join(', ')}` },
        { status: 400 }
      )
    }

    const transition = ACTION_MAP[action]

    // Buscar pedido e validar que pertence a loja do lojista
    const order = await db.order.findUnique({
      where: { id },
      include: {
        store: {
          select: { id: true, accountId: true, name: true },
        },
        items: {
          select: { productId: true, quantity: true },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    // Validar que o pedido pertence à loja desta conta
    if (order.store.accountId !== accountId) {
      return NextResponse.json(
        { error: 'Este pedido não pertence à sua loja' },
        { status: 403 }
      )
    }

    // Validar status atual para a transição
    if (order.status !== transition.from) {
      return NextResponse.json(
        {
          error: `Não é possível realizar esta ação. Status atual: ${order.status}, necessário: ${transition.from}`,
        },
        { status: 400 }
      )
    }

    // Não permitir cancelamento se já estiver em entregando ou entregue
    if (action === 'cancel' && (order.status === 'DELIVERING' || order.status === 'DELIVERED')) {
      return NextResponse.json(
        { error: 'Não é possível cancelar um pedido que já está em entrega ou foi entregue' },
        { status: 400 }
      )
    }

    // Executar a transição dentro de uma transação
    const updatedOrder = await db.$transaction(async (tx) => {
      const updateData: Record<string, unknown> = {
        status: transition.to,
      }

      // Se cancelando, restaurar estoque e registrar motivo
      if (transition.to === 'CANCELLED') {
        updateData.cancelledAt = new Date()
        updateData.cancelReason = reason || transition.defaultNote

        // Restaurar estoque dos produtos
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              soldCount: { decrement: item.quantity },
            },
          })
        }
      }

      // Se entregue, registrar data de entrega
      if (transition.to === 'DELIVERED') {
        updateData.deliveredAt = new Date()

        // Atualizar total de vendas da loja
        await tx.store.update({
          where: { id: order.store.id },
          data: { totalSales: { increment: 1 } },
        })
      }

      // Atualizar o pedido
      const updated = await tx.order.update({
        where: { id },
        data: updateData,
        include: {
          store: {
            select: { id: true, name: true, logo: true },
          },
          account: {
            select: { id: true, name: true, phone: true },
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
      })

      // Registrar no histórico de status
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: transition.to as 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED',
          note: reason || transition.defaultNote,
        },
      })

      return updated
    })

    return NextResponse.json({
      success: true,
      message: transition.defaultNote,
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        storeId: updatedOrder.storeId,
        storeName: updatedOrder.store.name,
        status: updatedOrder.status,
        subtotal: updatedOrder.subtotal,
        deliveryFee: updatedOrder.deliveryFee,
        discount: updatedOrder.discount,
        total: updatedOrder.total,
        paymentMethod: updatedOrder.paymentMethod,
        deliveryType: updatedOrder.deliveryType,
        deliveryAddress: updatedOrder.deliveryAddress,
        notes: updatedOrder.notes,
        estimatedTime: updatedOrder.estimatedTime,
        customerName: updatedOrder.account.name,
        customerPhone: updatedOrder.account.phone,
        items: updatedOrder.items,
        statusHistory: updatedOrder.statusHistory,
        createdAt: updatedOrder.createdAt,
        paidAt: updatedOrder.paidAt,
        deliveredAt: updatedOrder.deliveredAt,
        cancelledAt: updatedOrder.cancelledAt,
        cancelReason: updatedOrder.cancelReason,
      },
    })
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
