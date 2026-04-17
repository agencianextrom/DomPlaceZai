import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const storeId = searchParams.get('storeId')
    const isOffer = searchParams.get('isOffer')
    const isNew = searchParams.get('isNew')
    const isFeatured = searchParams.get('isFeatured')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sort = searchParams.get('sort') || 'relevance'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const where: any = {
      status: 'ACTIVE',
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ]
    }
    
    if (category) {
      where.store = { category }
    }
    
    if (storeId) {
      where.storeId = storeId
    }
    
    if (isOffer === 'true') where.isOffer = true
    if (isNew === 'true') where.isNew = true
    if (isFeatured === 'true') where.isFeatured = true
    if (minPrice) where.price = { ...(where.price || {}), gte: parseFloat(minPrice) }
    if (maxPrice) where.price = { ...(where.price || {}), lte: parseFloat(maxPrice) }
    
    const orderBy: any = {}
    switch (sort) {
      case 'price-asc': orderBy.price = 'asc'; break
      case 'price-desc': orderBy.price = 'desc'; break
      case 'rating': orderBy.rating = 'desc'; break
      case 'newest': orderBy.createdAt = 'desc'; break
      case 'popular': orderBy.soldCount = 'desc'; break
      default: orderBy.soldCount = 'desc'
    }
    
    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          store: { select: { name: true, logo: true, category: true } },
        },
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
        storeName: p.store.name,
        storeLogo: p.store.logo,
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
        category: p.store.category,
      })),
      total,
      limit,
      offset,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
