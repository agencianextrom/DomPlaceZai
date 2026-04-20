import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PATCH: Atualizar localização do entregador
export async function PATCH(request: NextRequest) {
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
    const { latitude, longitude } = body

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Latitude e longitude são obrigatórias' },
        { status: 400 }
      )
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Latitude e longitude devem ser números' },
        { status: 400 }
      )
    }

    if (latitude < -90 || latitude > 90) {
      return NextResponse.json(
        { error: 'Latitude inválida. Deve estar entre -90 e 90.' },
        { status: 400 }
      )
    }

    if (longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Longitude inválida. Deve estar entre -180 e 180.' },
        { status: 400 }
      )
    }

    // Verificar se entregador existe
    const driver = await db.deliveryDriver.findUnique({
      where: { accountId },
    })

    if (!driver) {
      return NextResponse.json(
        { error: 'Perfil de entregador não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar localização
    await db.deliveryDriver.update({
      where: { accountId },
      data: {
        currentLatitude: latitude,
        currentLongitude: longitude,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Localização atualizada',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
