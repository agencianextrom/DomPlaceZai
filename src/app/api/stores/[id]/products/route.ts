import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET: Produtos de uma loja específica
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'ACTIVE'
    const sort = searchParams.get('sort') || 'soldCount'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Verificar se a loja existe
    const store = await db.store.findUnique({
      where: { id },
      select: { id: true, name: true, logo: true, category: true },
    })

    if (!store) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    const where: any = { storeId: id }
    if (status !== 'ALL') {
      where.status = status
    }

    const orderBy: any = {}
    switch (sort) {
      case 'price-asc': orderBy.price = 'asc'; break
      case 'price-desc': orderBy.price = 'desc'; break
      case 'rating': orderBy.rating = 'desc'; break
      case 'newest': orderBy.createdAt = 'desc'; break
      case 'name': orderBy.name = 'asc'; break
      default: orderBy.soldCount = 'desc'
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({
      products: products.map(p => ({
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
        soldCount: p.soldCount,
        isFeatured: p.isFeatured,
        isNew: p.isNew,
        isOffer: p.isOffer,
        tags: p.tags,
        variations: p.variations,
        status: p.status,
        category: store.category,
      })),
      total,
      limit,
      offset,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
