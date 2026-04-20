import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PATCH: Ações do entregador em um pedido
// actions: 'accept' | 'pickup' | 'deliver' | 'complete' | 'fail'
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const accountId = (session?.user as any)?.id

    if (!accountId) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    // Verificar se a conta tem papel de entregador
    const account = await db.account.findUnique({
      where: { id: accountId },
      select: { role: true },
    })

    if (!account || account.role !== 'DELIVERY_DRIVER') {
      return NextResponse.json(
        { error: 'Acesso negado. Conta não é um entregador.' },
        { status: 403 }
      )
    }

    // Buscar perfil do entregador
    const driver = await db.deliveryDriver.findUnique({
      where: { accountId },
    })

    if (!driver) {
      return NextResponse.json(
        { error: 'Perfil de entregador não encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { action } = body

    const validActions = ['accept', 'pickup', 'deliver', 'complete', 'fail']
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { error: `Ação inválida. Valores permitidos: ${validActions.join(', ')}` },
        { status: 400 }
      )
    }

    // Buscar pedido
    const order = await db.order.findUnique({
      where: { id },
      include: {
        store: { select: { id: true } },
        items: {
          select: { productId: true, quantity: true },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Executar ação
    let updatedOrder: any = null

    if (action === 'accept') {
      // Aceitar pedido: atribuir entregador, status = DELIVERING, status do entregador = BUSY
      if (order.status !== 'READY') {
        return NextResponse.json(
          { error: `Este pedido não está disponível para aceite. Status atual: ${order.status}` },
          { status: 400 }
        )
      }

      if (order.driverId) {
        return NextResponse.json(
          { error: 'Este pedido já foi atribuído a outro entregador.' },
          { status: 400 }
        )
      }

      updatedOrder = await db.$transaction(async (tx) => {
        // Atualizar pedido
        const updated = await tx.order.update({
          where: { id },
          data: {
            driverId: driver.id,
            status: 'DELIVERING',
          },
        })

        // Atualizar status do entregador para BUSY
        await tx.deliveryDriver.update({
          where: { id: driver.id },
          data: { status: 'BUSY' },
        })

        // Registrar no histórico
        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            status: 'DELIVERING',
            note: 'Entregador aceitou o pedido',
          },
        })

        return updated
      })
    } else if (action === 'pickup') {
      // Retirar pedido na loja (transição interna dentro de DELIVERING)
      if (order.driverId !== driver.id) {
        return NextResponse.json(
          { error: 'Este pedido não está atribuído a você.' },
          { status: 403 }
        )
      }

      if (order.status !== 'DELIVERING') {
        return NextResponse.json(
          { error: `Ação não permitida para o status atual: ${order.status}` },
          { status: 400 }
        )
      }

      updatedOrder = await db.$transaction(async (tx) => {
        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            status: 'DELIVERING',
            note: 'Pedido retirado na loja pelo entregador',
          },
        })

        return tx.order.findUnique({ where: { id } })
      })
    } else if (action === 'deliver') {
      // Sair para entrega
      if (order.driverId !== driver.id) {
        return NextResponse.json(
          { error: 'Este pedido não está atribuído a você.' },
          { status: 403 }
        )
      }

      if (order.status !== 'DELIVERING') {
        return NextResponse.json(
          { error: `Ação não permitida para o status atual: ${order.status}` },
          { status: 400 }
        )
      }

      updatedOrder = await db.orderStatusHistory.create({
        data: {
          orderId: id,
          status: 'DELIVERING',
          note: 'Entregador a caminho',
        },
      })

      updatedOrder = await db.order.findUnique({ where: { id } })
    } else if (action === 'complete') {
      // Completar entrega
      if (order.driverId !== driver.id) {
        return NextResponse.json(
          { error: 'Este pedido não está atribuído a você.' },
          { status: 403 }
        )
      }

      if (order.status !== 'DELIVERING') {
        return NextResponse.json(
          { error: `Ação não permitida para o status atual: ${order.status}` },
          { status: 400 }
        )
      }

      updatedOrder = await db.$transaction(async (tx) => {
        // Atualizar pedido
        const updated = await tx.order.update({
          where: { id },
          data: {
            status: 'DELIVERED',
            deliveredAt: new Date(),
          },
        })

        // Incrementar entregas e ganhos do entregador
        await tx.deliveryDriver.update({
          where: { id: driver.id },
          data: {
            totalDeliveries: { increment: 1 },
            totalEarnings: { increment: order.commission },
            status: 'ONLINE',
          },
        })

        // Incrementar vendas da loja
        await tx.store.update({
          where: { id: order.storeId },
          data: { totalSales: { increment: 1 } },
        })

        // Registrar no histórico
        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            status: 'DELIVERED',
            note: 'Pedido entregue com sucesso',
          },
        })

        return updated
      })
    } else if (action === 'fail') {
      // Falha na entrega
      if (order.driverId !== driver.id) {
        return NextResponse.json(
          { error: 'Este pedido não está atribuído a você.' },
          { status: 403 }
        )
      }

      if (order.status !== 'DELIVERING') {
        return NextResponse.json(
          { error: `Ação não permitida para o status atual: ${order.status}` },
          { status: 400 }
        )
      }

      updatedOrder = await db.$transaction(async (tx) => {
        // Atualizar pedido
        const updated = await tx.order.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            cancelReason: 'Falha na entrega',
            driverId: null, // Liberar pedido para reatribuição
          },
        })

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

        // Voltar status do entregador para ONLINE
        await tx.deliveryDriver.update({
          where: { id: driver.id },
          data: { status: 'ONLINE' },
        })

        // Registrar no histórico
        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            status: 'CANCELLED',
            note: 'Falha na entrega pelo entregador',
          },
        })

        return updated
      })
    }

    // Buscar pedido atualizado com detalhes
    const finalOrder = await db.order.findUnique({
      where: { id },
      include: {
        store: {
          select: { name: true, logo: true, address: true, neighborhood: true },
        },
        account: {
          select: { name: true, phone: true },
        },
        items: {
          select: {
            productName: true,
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
    })

    return NextResponse.json({
      success: true,
      order: finalOrder ? {
        id: finalOrder.id,
        orderNumber: finalOrder.orderNumber,
        status: finalOrder.status,
        storeName: finalOrder.store?.name,
        storeLogo: finalOrder.store?.logo,
        storeAddress: finalOrder.store?.address,
        storeNeighborhood: finalOrder.store?.neighborhood,
        customerName: finalOrder.account?.name,
        customerPhone: finalOrder.account?.phone,
        deliveryAddress: finalOrder.deliveryAddress,
        items: finalOrder.items,
        total: finalOrder.total,
        commission: finalOrder.commission,
        deliveredAt: finalOrder.deliveredAt,
        cancelledAt: finalOrder.cancelledAt,
        cancelReason: finalOrder.cancelReason,
        statusHistory: finalOrder.statusHistory,
        createdAt: finalOrder.createdAt,
        updatedAt: finalOrder.updatedAt,
      } : null,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
