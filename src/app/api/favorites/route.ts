import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET: Listar favoritos do usuário
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const accountId = (session?.user as Record<string, unknown>)?.id as string | undefined
    const type = searchParams.get('type') // 'product', 'store', ou 'all'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!accountId) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    const where: Record<string, unknown> = { accountId }
    if (type === 'product') where.productId = { not: null }
    if (type === 'store') where.storeId = { not: null }

    const favorites = await db.favorite.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            comparePrice: true,
            images: true,
            rating: true,
            totalReviews: true,
            store: { select: { id: true, name: true, logo: true, category: true } },
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            logo: true,
            coverImage: true,
            category: true,
            rating: true,
            totalReviews: true,
            deliveryFee: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await db.favorite.count({ where })

    return NextResponse.json({
      favorites: favorites.map(f => ({
        id: f.id,
        type: f.productId ? 'product' : 'store',
        product: f.product ? {
          id: f.product.id,
          name: f.product.name,
          price: f.product.price,
          comparePrice: f.product.comparePrice,
          images: f.product.images,
          rating: f.product.rating,
          totalReviews: f.product.totalReviews,
          store: f.product.store,
        } : null,
        store: f.store ? {
          id: f.store.id,
          name: f.store.name,
          logo: f.store.logo,
          coverImage: f.store.coverImage,
          category: f.store.category,
          rating: f.store.rating,
          totalReviews: f.store.totalReviews,
          deliveryFee: f.store.deliveryFee,
        } : null,
        createdAt: f.createdAt,
      })),
      total,
      limit,
      offset,
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST: Adicionar favorito
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const accountId = (session?.user as Record<string, unknown>)?.id as string | undefined
    const { productId, storeId } = body

    if (!accountId) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    if (!productId && !storeId) {
      return NextResponse.json(
        { error: 'ID do produto ou ID da loja é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se já é favorito
    const where: Record<string, unknown> = { accountId }
    if (productId) where.productId = productId
    if (storeId) where.storeId = storeId

    const existing = await db.favorite.findFirst({ where })
    if (existing) {
      return NextResponse.json({ success: true, message: 'Já está nos favoritos', favorite: existing })
    }

    // Verificar se o produto/loja existe
    if (productId) {
      const product = await db.product.findUnique({ where: { id: productId } })
      if (!product) {
        return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
      }
    }

    if (storeId) {
      const store = await db.store.findUnique({ where: { id: storeId } })
      if (!store) {
        return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
      }
    }

    const favorite = await db.favorite.create({
      data: {
        accountId,
        productId: productId || null,
        storeId: storeId || null,
      },
    })

    return NextResponse.json({ success: true, favorite, message: 'Adicionado aos favoritos' }, { status: 201 })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE: Remover favorito
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const accountId = (session?.user as Record<string, unknown>)?.id as string | undefined
    const favoriteId = searchParams.get('id')
    const productId = searchParams.get('productId')
    const storeId = searchParams.get('storeId')

    if (!accountId) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    if (favoriteId) {
      // Verify ownership before deleting
      const favorite = await db.favorite.findUnique({ where: { id: favoriteId } })
      if (!favorite) {
        return NextResponse.json({ error: 'Favorito não encontrado' }, { status: 404 })
      }
      if (favorite.accountId !== accountId) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
      await db.favorite.delete({ where: { id: favoriteId } })
      return NextResponse.json({ success: true, message: 'Favorito removido' })
    }

    // Remover por combinação accountId + productId/storeId
    if (productId || storeId) {
      const where: Record<string, unknown> = { accountId }
      if (productId) where.productId = productId
      if (storeId) where.storeId = storeId

      const favorite = await db.favorite.findFirst({ where })
      if (!favorite) {
        return NextResponse.json({ error: 'Favorito não encontrado' }, { status: 404 })
      }

      await db.favorite.delete({ where: { id: favorite.id } })
      return NextResponse.json({ success: true, message: 'Favorito removido' })
    }

    return NextResponse.json(
      { error: 'ID do favorito ou combinação de filtros é obrigatória' },
      { status: 400 }
    )
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }, { status: 500 })
  }
}
