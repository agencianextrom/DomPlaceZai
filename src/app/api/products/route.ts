import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET: Listar produtos com busca, filtros, ordenação e paginação
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Busca textual (case-insensitive via contains — SQLite é case-insensitive por padrão)
    const search = searchParams.get('search')

    // Filtros
    const category = searchParams.get('category')
    const storeId = searchParams.get('storeId')
    const isOffer = searchParams.get('isOffer')
    const isNew = searchParams.get('isNew')
    const isFeatured = searchParams.get('isFeatured')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    // Ordenação
    const sort = searchParams.get('sort') || 'relevance'

    // Paginação
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Construir cláusula where
    const where: Record<string, unknown> = {
      status: 'ACTIVE',
    }

    // Busca por nome, descrição ou tags
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ]
    }

    // Filtro por categoria da loja
    if (category) {
      where.store = { category }
    }

    // Filtro por loja específica
    if (storeId) {
      where.storeId = storeId
    }

    // Filtros booleanos
    if (isOffer === 'true') where.isOffer = true
    if (isNew === 'true') where.isNew = true
    if (isFeatured === 'true') where.isFeatured = true

    // Filtro por faixa de preço
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {}
      if (minPrice) priceFilter.gte = parseFloat(minPrice)
      if (maxPrice) priceFilter.lte = parseFloat(maxPrice)
      where.price = priceFilter
    }

    // Ordenação
    const orderBy: Record<string, string> = {}
    switch (sort) {
      case 'price-asc':
        orderBy.price = 'asc'
        break
      case 'price-desc':
        orderBy.price = 'desc'
        break
      case 'rating':
        orderBy.rating = 'desc'
        break
      case 'newest':
        orderBy.createdAt = 'desc'
        break
      case 'popular':
        orderBy.soldCount = 'desc'
        break
      case 'name-asc':
        orderBy.name = 'asc'
        break
      case 'name-desc':
        orderBy.name = 'desc'
        break
      default:
        orderBy.soldCount = 'desc'
    }

    // Busca paginada com dados da loja
    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          store: {
            select: {
              id: true,
              name: true,
              logo: true,
              category: true,
              freeDeliveryAbove: true,
              deliveryFee: true,
              rating: true,
              totalReviews: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      db.product.count({ where }),
    ])

    // Buscar categorias disponíveis para os filtros
    const storeCategories = await db.store.findMany({
      where: { status: 'ACTIVE' },
      select: { category: true },
      distinct: ['category'],
    })

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        storeId: p.storeId,
        storeName: p.store.name,
        storeLogo: p.store.logo,
        storeId_full: p.store.id,
        storeRating: p.store.rating,
        storeTotalReviews: p.store.totalReviews,
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
        soldCount: p.soldCount,
        createdAt: p.createdAt,
      })),
      total,
      limit,
      offset,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1,
        hasMore: offset + limit < total,
      },
      filters: {
        categories: storeCategories.map((s) => s.category),
      },
    })
  } catch (error: unknown) {
    console.error('Erro ao listar produtos:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST: Criar novo produto (dono da loja)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    const accountId = (session.user as any)?.id
    if (!accountId) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })
    }

    // Verify the user owns the store (STORE_OWNER or ADMIN role)
    const account = await db.account.findUnique({ where: { id: accountId } })
    if (!account || (account.role !== 'STORE_OWNER' && account.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Apenas lojistas podem criar produtos' }, { status: 403 })
    }

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

    // Verify store ownership
    const store = await db.store.findUnique({ where: { id: storeId } })
    if (!store || (store.accountId !== accountId && account.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Loja não encontrada ou sem permissão' }, { status: 403 })
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
    const variationsStr = variations
      ? Array.isArray(variations)
        ? JSON.stringify(variations)
        : variations
      : null

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
    console.error('Erro ao criar produto:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
