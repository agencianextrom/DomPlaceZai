import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET: Buscar dados de ganhos do entregador
// period: 'today' | 'week' | 'month' | 'all'
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
    const period = searchParams.get('period') || 'today'

    // Calcular data de início com base no período
    const now = new Date()
    let startDate: Date

    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (period === 'week') {
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
      startDate.setHours(0, 0, 0, 0)
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    } else {
      // 'all' - sem filtro de data
      startDate = new Date(0)
    }

    // Buscar entregas concluídas no período
    const completedOrders = await db.order.findMany({
      where: {
        driverId: driver.id,
        status: 'DELIVERED',
        deliveredAt: { gte: startDate },
      },
      select: {
        orderNumber: true,
        commission: true,
        deliveredAt: true,
        store: {
          select: { name: true },
        },
      },
      orderBy: { deliveredAt: 'desc' },
    })

    // Calcular métricas do período
    const periodEarnings = completedOrders.reduce(
      (sum: number, order: { commission: number }) => sum + order.commission,
      0
    )
    const deliveryCount = completedOrders.length
    const averagePerDelivery = deliveryCount > 0 ? periodEarnings / deliveryCount : 0

    // Últimas 10 entregas concluídas
    const recentDeliveries = await db.order.findMany({
      where: {
        driverId: driver.id,
        status: 'DELIVERED',
      },
      select: {
        orderNumber: true,
        commission: true,
        deliveredAt: true,
        store: {
          select: { name: true },
        },
      },
      orderBy: { deliveredAt: 'desc' },
      take: 10,
    })

    return NextResponse.json({
      totalEarnings: driver.totalEarnings,
      periodEarnings,
      deliveryCount,
      averagePerDelivery: Math.round(averagePerDelivery * 100) / 100,
      recentDeliveries: recentDeliveries.map((d) => ({
        orderNumber: d.orderNumber,
        storeName: d.store?.name,
        commission: d.commission,
        deliveredAt: d.deliveredAt,
      })),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
