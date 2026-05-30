import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PATCH: Atualizar status do entregador (ONLINE, OFFLINE, BUSY)
export async function PATCH(request: NextRequest) {
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

    const body = await request.json()
    const { status } = body

    const validStatuses = ['ONLINE', 'OFFLINE', 'BUSY']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status inválido. Valores permitidos: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Buscar entregador atual
    const driver = await db.deliveryDriver.findUnique({
      where: { accountId },
    })

    if (!driver) {
      return NextResponse.json(
        { error: 'Perfil de entregador não encontrado' },
        { status: 404 }
      )
    }

    // Validações por status
    if (status === 'ONLINE') {
      // Só pode ficar online se verificado
      if (driver.verification !== 'VERIFIED') {
        return NextResponse.json(
          { error: 'Entregador não verificado. Aguarde a aprovação da sua verificação.' },
          { status: 403 }
        )
      }
    }

    if (status === 'BUSY') {
      // Deve ter uma entrega ativa (driverId em algum pedido)
      const activeOrder = await db.order.findFirst({
        where: {
          driverId: driver.id,
          status: { in: ['DELIVERING', 'CONFIRMED'] },
        },
      })

      if (!activeOrder) {
        return NextResponse.json(
          { error: 'Não é possível definir como ocupado sem uma entrega ativa.' },
          { status: 400 }
        )
      }
    }

    // Construir dados de atualização
    const updateData: Record<string, unknown> = { status }

    if (status === 'OFFLINE') {
      // Limpar localização ao ficar offline
      updateData.currentLatitude = null
      updateData.currentLongitude = null
    }

    const updatedDriver = await db.deliveryDriver.update({
      where: { accountId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: `Status atualizado para ${status}`,
      status: updatedDriver.status,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
