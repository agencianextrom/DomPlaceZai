import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET: Buscar configurações da loja
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const accountId = (session?.user as Record<string, unknown>)?.id as string

    if (!accountId) {
      return NextResponse.json(
        { error: 'ID da conta é obrigatório' },
        { status: 400 }
      )
    }

    const store = await db.store.findUnique({
      where: { accountId },
      include: {
        account: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
      },
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Loja não encontrada para esta conta' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: store.id,
      accountId: store.accountId,
      name: store.name,
      slug: store.slug,
      description: store.description,
      category: store.category,
      status: store.status,
      logo: store.logo,
      coverImage: store.coverImage,
      phone: store.phone,
      whatsapp: store.whatsapp,
      address: store.address,
      neighborhood: store.neighborhood,
      city: store.city,
      state: store.state,
      latitude: store.latitude,
      longitude: store.longitude,
      deliveryRadius: store.deliveryRadius,
      deliveryFeeType: store.deliveryFeeType,
      deliveryFee: store.deliveryFee,
      freeDeliveryAbove: store.freeDeliveryAbove,
      minOrderValue: store.minOrderValue,
      rating: store.rating,
      totalReviews: store.totalReviews,
      totalSales: store.totalSales,
      opensAt: store.opensAt,
      closesAt: store.closesAt,
      openDays: store.openDays,
      pixKey: store.pixKey,
      socialMedia: store.socialMedia,
      commissionRate: store.commissionRate,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
      account: store.account,
    })
  } catch (error) {
    console.error('Erro ao buscar configurações da loja:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT: Atualizar configurações da loja
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const accountId = (session?.user as Record<string, unknown>)?.id as string

    if (!accountId) {
      return NextResponse.json(
        { error: 'ID da conta é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar que a loja pertence a esta conta
    const existingStore = await db.store.findUnique({
      where: { accountId },
    })

    if (!existingStore) {
      return NextResponse.json(
        { error: 'Loja não encontrada para esta conta' },
        { status: 404 }
      )
    }

    // Campos permitidos para atualização
    const allowedFields = [
      'name',
      'description',
      'phone',
      'whatsapp',
      'address',
      'neighborhood',
      'opensAt',
      'closesAt',
      'openDays',
      'deliveryFee',
      'freeDeliveryAbove',
      'minOrderValue',
      'deliveryRadius',
      'pixKey',
      'socialMedia',
      'logo',
      'coverImage',
    ]

    // Construir objeto de atualização apenas com campos fornecidos
    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Validações específicas
    if (updateData.name !== undefined && (!updateData.name || (updateData.name as string).trim().length < 2)) {
      return NextResponse.json(
        { error: 'Nome da loja deve ter pelo menos 2 caracteres' },
        { status: 400 }
      )
    }

    if (updateData.deliveryFee !== undefined && (updateData.deliveryFee as number) < 0) {
      return NextResponse.json(
        { error: 'Taxa de entrega não pode ser negativa' },
        { status: 400 }
      )
    }

    if (updateData.freeDeliveryAbove !== undefined && (updateData.freeDeliveryAbove as number) < 0) {
      return NextResponse.json(
        { error: 'Valor para frete grátis não pode ser negativo' },
        { status: 400 }
      )
    }

    if (updateData.minOrderValue !== undefined && (updateData.minOrderValue as number) < 0) {
      return NextResponse.json(
        { error: 'Valor mínimo do pedido não pode ser negativo' },
        { status: 400 }
      )
    }

    if (updateData.deliveryRadius !== undefined && (updateData.deliveryRadius as number) < 0) {
      return NextResponse.json(
        { error: 'Raio de entrega não pode ser negativo' },
        { status: 400 }
      )
    }

    if (updateData.openDays !== undefined) {
      const days = (updateData.openDays as string).split(',').map(Number)
      if (days.some((d: number) => isNaN(d) || d < 1 || d > 7)) {
        return NextResponse.json(
          { error: 'Dias de funcionamento inválidos. Use números de 1 (dom) a 7 (sáb) separados por vírgula' },
          { status: 400 }
        )
      }
    }

    if (updateData.phone !== undefined && updateData.phone) {
      const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/
      if (!phoneRegex.test(updateData.phone as string)) {
        return NextResponse.json(
          { error: 'Telefone inválido. Use o formato (99) 99999-9999' },
          { status: 400 }
        )
      }
    }

    if (updateData.whatsapp !== undefined && updateData.whatsapp) {
      const waRegex = /^\+?55\d{2}9?\d{4}\d{4}$|^55\d{2}9?\d{4}\d{4}$/
      if (!waRegex.test((updateData.whatsapp as string).replace(/\D/g, ''))) {
        return NextResponse.json(
          { error: 'Número de WhatsApp inválido' },
          { status: 400 }
        )
      }
    }

    // Não permitir campos vazios - remover campos undefined/null
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo para atualizar' },
        { status: 400 }
      )
    }

    // Atualizar a loja
    const updatedStore = await db.store.update({
      where: { accountId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: 'Configurações atualizadas com sucesso',
      store: {
        id: updatedStore.id,
        name: updatedStore.name,
        slug: updatedStore.slug,
        description: updatedStore.description,
        category: updatedStore.category,
        status: updatedStore.status,
        logo: updatedStore.logo,
        coverImage: updatedStore.coverImage,
        phone: updatedStore.phone,
        whatsapp: updatedStore.whatsapp,
        address: updatedStore.address,
        neighborhood: updatedStore.neighborhood,
        city: updatedStore.city,
        state: updatedStore.state,
        deliveryRadius: updatedStore.deliveryRadius,
        deliveryFeeType: updatedStore.deliveryFeeType,
        deliveryFee: updatedStore.deliveryFee,
        freeDeliveryAbove: updatedStore.freeDeliveryAbove,
        minOrderValue: updatedStore.minOrderValue,
        opensAt: updatedStore.opensAt,
        closesAt: updatedStore.closesAt,
        openDays: updatedStore.openDays,
        pixKey: updatedStore.pixKey,
        socialMedia: updatedStore.socialMedia,
        updatedAt: updatedStore.updatedAt,
      },
    })
  } catch (error) {
    console.error('Erro ao atualizar configurações da loja:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
