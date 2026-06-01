import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET: Listar pedidos do entregador
// type: 'available' | 'active' | 'completed'
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const accountId = (session?.user as Record<string, unknown>)?.id as string | undefined

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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'available'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let orders: Record<string, unknown>[] = []
    let total = 0

    if (type === 'available') {
      // Pedidos prontos para retirada, sem entregador, tipo entrega
      const where = {
        status: 'READY' as const,
        driverId: null,
        deliveryType: 'DELIVERY' as const,
      }

      const availableResult = await Promise.all([
        db.order.findMany({
          where,
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
          },
          orderBy: { createdAt: 'asc' }, // Mais antigos primeiro (prioridade)
          take: limit,
          skip: offset,
        }),
        db.order.count({ where }),
      ])
      orders = availableResult[0] as Record<string, unknown>[]
      total = availableResult[1] as number
    } else if (type === 'active') {
      // Pedidos atribuídos a este entregador com status DELIVERING ou CONFIRMED
      const where = {
        driverId: driver.id,
        status: { in: ['DELIVERING', 'CONFIRMED'] as ['DELIVERING', 'CONFIRMED'] },
      }

      const activeResult = await Promise.all([
        db.order.findMany({
          where,
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
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        db.order.count({ where }),
      ])
      orders = activeResult[0] as Record<string, unknown>[]
      total = activeResult[1] as number
    } else if (type === 'completed') {
      // Pedidos concluídos ou cancelados por este entregador
      const where = {
        driverId: driver.id,
        status: { in: ['DELIVERED', 'CANCELLED'] as ['DELIVERED', 'CANCELLED'] },
      }

      const completedResult = await Promise.all([
        db.order.findMany({
          where,
          include: {
            store: {
              select: { name: true, logo: true },
            },
            account: {
              select: { name: true },
            },
            items: {
              select: {
                productName: true,
                quantity: true,
                total: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
          take: Math.min(limit, 50),
          skip: offset,
        }),
        db.order.count({ where }),
      ])
      orders = completedResult[0] as Record<string, unknown>[]
      total = completedResult[1] as number
    } else {
      return NextResponse.json(
        { error: 'Tipo inválido. Use: available, active ou completed' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      orders: orders.map((o: Record<string, unknown>) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        storeName: (o.store as Record<string, unknown>)?.name,
        storeLogo: (o.store as Record<string, unknown>)?.logo,
        storeAddress: (o.store as Record<string, unknown>)?.address,
        storeNeighborhood: (o.store as Record<string, unknown>)?.neighborhood,
        customerName: (o.account as Record<string, unknown>)?.name,
        customerPhone: (o.account as Record<string, unknown>)?.phone,
        deliveryAddress: o.deliveryAddress,
        items: o.items,
        total: o.total,
        commission: o.commission,
        deliveryType: o.deliveryType,
        estimatedTime: o.estimatedTime,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
        deliveredAt: o.deliveredAt,
        cancelledAt: o.cancelledAt,
        cancelReason: o.cancelReason,
        statusHistory: o.statusHistory,
      })),
      total,
      limit,
      offset,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
