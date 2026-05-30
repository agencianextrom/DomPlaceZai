import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET: Buscar loja por ID com estatísticas e produtos
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar query param "include" para controlar o que é retornado
    const { searchParams } = new URL(request.url)
    const includeProducts = searchParams.get('include') === 'products'

    const store = await db.store.findUnique({
      where: { id },
      include: {
        account: { select: { name: true, avatar: true } },
        ...(includeProducts
          ? {
              products: {
                where: { status: 'ACTIVE' },
                orderBy: { soldCount: 'desc' },
                take: 50,
              },
            }
          : {}),
      },
    })

    if (!store) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    // Buscar estatísticas
    const [productCount, activeOrders, totalRevenue, reviews] = await Promise.all([
      db.product.count({ where: { storeId: id, status: 'ACTIVE' } }),
      db.order.count({
        where: { storeId: id, status: { notIn: ['CANCELLED', 'REFUNDED'] } },
      }),
      db.order.aggregate({
        where: { storeId: id, status: { notIn: ['CANCELLED', 'REFUNDED'] } },
        _sum: { total: true },
      }),
      db.review.count({ where: { storeId: id } }),
    ])

    return NextResponse.json({
      id: store.id,
      name: store.name,
      slug: store.slug,
      description: store.description,
      category: store.category,
      logo: store.logo,
      coverImage: store.coverImage,
      phone: store.phone,
      whatsapp: store.whatsapp,
      address: store.address,
      neighborhood: store.neighborhood,
      city: store.city,
      state: store.state,
      deliveryFee: store.deliveryFee,
      deliveryFeeType: store.deliveryFeeType,
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
      status: store.status,
      commissionRate: store.commissionRate,
      products: includeProducts
        ? store.products.map(p => ({
            id: p.id,
            storeId: p.storeId,
            storeName: store.name,
            storeLogo: store.logo,
            name: p.name,
            slug: p.slug,
            description: p.description,
            price: p.price,
            comparePrice: p.comparePrice,
            images: p.images,
            stock: p.stock,
            rating: p.rating,
            totalReviews: p.totalReviews,
            isFeatured: p.isFeatured,
            isNew: p.isNew,
            isOffer: p.isOffer,
            tags: p.tags,
            variations: p.variations,
            category: store.category,
          }))
        : undefined,
      stats: {
        productCount,
        activeOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        reviewCount: reviews,
      },
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT: Atualizar informações da loja
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Verificar se a loja existe
    const existing = await db.store.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    const data: Record<string, unknown> = { updatedAt: new Date() }

    if (body.name !== undefined) {
      data.name = body.name
      const baseSlug = body.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      data.slug = `${baseSlug}-${Date.now()}`
    }
    if (body.description !== undefined) data.description = body.description
    if (body.category !== undefined) data.category = body.category
    if (body.phone !== undefined) data.phone = body.phone
    if (body.whatsapp !== undefined) data.whatsapp = body.whatsapp
    if (body.address !== undefined) data.address = body.address
    if (body.neighborhood !== undefined) data.neighborhood = body.neighborhood
    if (body.opensAt !== undefined) data.opensAt = body.opensAt
    if (body.closesAt !== undefined) data.closesAt = body.closesAt
    if (body.openDays !== undefined) data.openDays = body.openDays
    if (body.deliveryFee !== undefined) data.deliveryFee = parseFloat(body.deliveryFee)
    if (body.freeDeliveryAbove !== undefined) {
      data.freeDeliveryAbove = body.freeDeliveryAbove ? parseFloat(body.freeDeliveryAbove) : null
    }
    if (body.minOrderValue !== undefined) {
      data.minOrderValue = body.minOrderValue ? parseFloat(body.minOrderValue) : null
    }
    if (body.pixKey !== undefined) data.pixKey = body.pixKey
    if (body.socialMedia !== undefined) data.socialMedia = body.socialMedia
    if (body.logo !== undefined) data.logo = body.logo
    if (body.coverImage !== undefined) data.coverImage = body.coverImage
    if (body.status !== undefined) data.status = body.status

    const store = await db.store.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true, store })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }, { status: 500 })
  }
}
