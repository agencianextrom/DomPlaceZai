import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET: Listar produtos com filtros e busca
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
    
    const where: Record<string, unknown> = {
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
    if (minPrice) {
      const priceFilter = (where.price as Record<string, number>) || {}
      priceFilter.gte = parseFloat(minPrice)
      where.price = priceFilter
    }
    if (maxPrice) {
      const priceFilter = (where.price as Record<string, number>) || {}
      priceFilter.lte = parseFloat(maxPrice)
      where.price = priceFilter
    }
    
    const orderBy: Record<string, string> = {}
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
          store: { select: { name: true, logo: true, category: true, freeDeliveryAbove: true, deliveryFee: true } },
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
        freeDeliveryAbove: p.store.freeDeliveryAbove,
        storeDeliveryFee: p.store.deliveryFee,
      })),
      total,
      limit,
      offset,
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST: Criar novo produto (dono da loja)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      price,
      comparePrice,
      stock,
      storeId,
      tags,
      images,
      variations,
      sku,
      weight,
      isFeatured,
      isNew,
      isOffer,
      status,
    } = body

    // Validação de campos obrigatórios
    if (!name || !price || !storeId) {
      return NextResponse.json(
        { error: 'Nome, preço e ID da loja são obrigatórios' },
        { status: 400 }
      )
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: 'O preço deve ser maior que zero' },
        { status: 400 }
      )
    }

    // Verificar se a loja existe
    const store = await db.store.findUnique({ where: { id: storeId } })
    if (!store) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    // Gerar slug
    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const slug = `${baseSlug}-${Date.now()}`

    // Processar arrays JSON
    const imagesStr = Array.isArray(images) ? JSON.stringify(images) : images || '[]'
    const tagsStr = Array.isArray(tags) ? JSON.stringify(tags) : tags || '[]'
    const variationsStr = variations ? (Array.isArray(variations) ? JSON.stringify(variations) : variations) : null

    const product = await db.product.create({
      data: {
        storeId,
        name,
        slug,
        description: description || null,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        stock: parseInt(stock) || 0,
        sku: sku || null,
        weight: weight ? parseFloat(weight) : null,
        images: imagesStr,
        tags: tagsStr,
        variations: variationsStr,
        isFeatured: isFeatured === true,
        isNew: isNew !== false,
        isOffer: isOffer === true,
        status: status || 'ACTIVE',
      },
    })

    return NextResponse.json({ success: true, product }, { status: 201 })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }, { status: 500 })
  }
}
