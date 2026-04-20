import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET: Retornar perfil do entregador
export async function GET() {
  try {
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

    // Buscar dados do entregador com informações da conta
    const driver = await db.deliveryDriver.findUnique({
      where: { accountId },
      include: {
        account: {
          select: {
            name: true,
            phone: true,
            avatar: true,
          },
        },
      },
    })

    if (!driver) {
      return NextResponse.json(
        { error: 'Perfil de entregador não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      account: {
        name: driver.account.name,
        phone: driver.account.phone,
        avatar: driver.account.avatar,
      },
      driver: {
        status: driver.status,
        verification: driver.verification,
        vehicleType: driver.vehicleType,
        vehiclePlate: driver.vehiclePlate,
        cnhNumber: driver.cnhNumber,
        rating: driver.rating,
        totalDeliveries: driver.totalDeliveries,
        totalEarnings: driver.totalEarnings,
        commissionRate: driver.commissionRate,
        createdAt: driver.createdAt,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PUT: Atualizar dados do entregador
export async function PUT(request: NextRequest) {
  try {
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

    const body = await request.json()
    const { vehicleType, vehiclePlate, cnhNumber, cnhImage } = body

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

    // Não permitir atualização se verificação foi rejeitada
    if (driver.verification === 'REJECTED') {
      return NextResponse.json(
        { error: 'Não é possível atualizar o perfil. Verificação rejeitada. Entre em contato com o suporte.' },
        { status: 403 }
      )
    }

    // Validar vehicleType se fornecido
    const validVehicleTypes = ['motorcycle', 'car', 'bicycle', 'walk']
    if (vehicleType && !validVehicleTypes.includes(vehicleType)) {
      return NextResponse.json(
        { error: `Tipo de veículo inválido. Valores permitidos: ${validVehicleTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Construir dados de atualização
    const updateData: Record<string, string> = {}
    if (vehicleType !== undefined) updateData.vehicleType = vehicleType
    if (vehiclePlate !== undefined) updateData.vehiclePlate = vehiclePlate
    if (cnhNumber !== undefined) updateData.cnhNumber = cnhNumber
    if (cnhImage !== undefined) updateData.cnhImage = cnhImage

    const updatedDriver = await db.deliveryDriver.update({
      where: { accountId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      driver: {
        status: updatedDriver.status,
        verification: updatedDriver.verification,
        vehicleType: updatedDriver.vehicleType,
        vehiclePlate: updatedDriver.vehiclePlate,
        cnhNumber: updatedDriver.cnhNumber,
        rating: updatedDriver.rating,
        totalDeliveries: updatedDriver.totalDeliveries,
        totalEarnings: updatedDriver.totalEarnings,
        commissionRate: updatedDriver.commissionRate,
        createdAt: updatedDriver.createdAt,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
