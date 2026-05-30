import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET: Buscar produto por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const product = await db.product.findUnique({
      where: { id },
      include: {
        store: { select: { name: true, logo: true, category: true, id: true } },
      },
    })
    
    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }
    
    return NextResponse.json({
      id: product.id,
      storeId: product.storeId,
      storeName: product.store.name,
      storeLogo: product.store.logo,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      comparePrice: product.comparePrice,
      images: product.images,
      stock: product.stock,
      rating: product.rating,
      totalReviews: product.totalReviews,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      isOffer: product.isOffer,
      tags: product.tags,
      variations: product.variations,
      category: product.store.category,
      status: product.status,
      createdAt: product.createdAt,
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT: Atualizar produto (dono da loja)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Verificar se o produto existe
    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Construir dados de atualização
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
    if (body.price !== undefined) {
      if (body.price <= 0) {
        return NextResponse.json({ error: 'O preço deve ser maior que zero' }, { status: 400 })
      }
      data.price = parseFloat(body.price)
    }
    if (body.comparePrice !== undefined) {
      data.comparePrice = body.comparePrice ? parseFloat(body.comparePrice) : null
    }
    if (body.stock !== undefined) data.stock = parseInt(body.stock)
    if (body.sku !== undefined) data.sku = body.sku
    if (body.weight !== undefined) data.weight = body.weight ? parseFloat(body.weight) : null
    if (body.images !== undefined) {
      data.images = Array.isArray(body.images) ? JSON.stringify(body.images) : body.images
    }
    if (body.tags !== undefined) {
      data.tags = Array.isArray(body.tags) ? JSON.stringify(body.tags) : body.tags
    }
    if (body.variations !== undefined) {
      data.variations = body.variations
        ? (Array.isArray(body.variations) ? JSON.stringify(body.variations) : body.variations)
        : null
    }
    if (body.isFeatured !== undefined) data.isFeatured = body.isFeatured === true
    if (body.isNew !== undefined) data.isNew = body.isNew === true
    if (body.isOffer !== undefined) data.isOffer = body.isOffer === true
    if (body.status !== undefined) data.status = body.status

    const product = await db.product.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true, product })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE: Soft delete (definir status como INACTIVE)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await db.product.findUnique({ where: { id } })
    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    await db.product.update({
      where: { id },
      data: { status: 'INACTIVE' },
    })

    return NextResponse.json({ success: true, message: 'Produto removido com sucesso' })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }, { status: 500 })
  }
}
