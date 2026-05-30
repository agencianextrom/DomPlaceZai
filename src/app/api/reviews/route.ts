import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET: Listar avaliações de produto ou loja
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const storeId = searchParams.get('storeId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sort = searchParams.get('sort') || 'newest'

    if (!productId && !storeId) {
      return NextResponse.json(
        { error: 'ID do produto ou ID da loja é obrigatório' },
        { status: 400 }
      )
    }

    const where: Record<string, unknown> = {}
    if (productId) where.productId = productId
    if (storeId) where.storeId = storeId

    const orderBy: Record<string, string> = {}
    switch (sort) {
      case 'newest': orderBy.createdAt = 'desc'; break
      case 'oldest': orderBy.createdAt = 'asc'; break
      case 'highest': orderBy.rating = 'desc'; break
      case 'lowest': orderBy.rating = 'asc'; break
      default: orderBy.createdAt = 'desc'
    }

    const [reviews, total, avgResult] = await Promise.all([
      db.review.findMany({
        where,
        include: {
          account: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      db.review.count({ where }),
      db.review.aggregate({
        where,
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ])

    return NextResponse.json({
      reviews: reviews.map(r => ({
        id: r.id,
        accountId: r.accountId,
        accountName: r.account.name,
        accountAvatar: r.account.avatar,
        storeId: r.storeId,
        productId: r.productId,
        rating: r.rating,
        comment: r.comment,
        images: r.images,
        reply: r.reply,
        isVerified: r.isVerified,
        createdAt: r.createdAt,
      })),
      total,
      limit,
      offset,
      average: avgResult._avg.rating ? Math.round(avgResult._avg.rating * 10) / 10 : 0,
      count: avgResult._count.rating,
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST: Criar avaliação (usuários autenticados)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { accountId, productId, storeId, rating, comment, images } = body

    if (!accountId || !rating) {
      return NextResponse.json(
        { error: 'ID da conta e avaliação são obrigatórios' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'A avaliação deve ser entre 1 e 5' },
        { status: 400 }
      )
    }

    if (!productId && !storeId) {
      return NextResponse.json(
        { error: 'ID do produto ou ID da loja é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se a conta existe
    const account = await db.account.findUnique({ where: { id: accountId } })
    if (!account) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 })
    }

    // Verificar se já avaliou este item
    const existingWhere: Record<string, unknown> = { accountId }
    if (productId) existingWhere.productId = productId
    if (storeId) existingWhere.storeId = storeId

    const existing = await db.review.findFirst({ where: existingWhere })
    if (existing) {
      return NextResponse.json(
        { error: 'Você já avaliou este item' },
        { status: 400 }
      )
    }

    const imagesStr = Array.isArray(images) ? JSON.stringify(images) : images || '[]'

    const review = await db.review.create({
      data: {
        accountId,
        productId: productId || null,
        storeId: storeId || null,
        rating,
        comment: comment || null,
        images: imagesStr,
        isVerified: true,
      },
    })

    // Atualizar avaliação média do produto
    if (productId) {
      const productReviews = await db.review.findMany({
        where: { productId },
        select: { rating: true },
      })

      const avgRating = productReviews.length > 0
        ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
        : 0

      await db.product.update({
        where: { id: productId },
        data: {
          rating: Math.round(avgRating * 10) / 10,
          totalReviews: productReviews.length,
        },
      })
    }

    // Atualizar avaliação média da loja
    if (storeId) {
      const storeReviews = await db.review.findMany({
        where: { storeId },
        select: { rating: true },
      })

      const avgRating = storeReviews.length > 0
        ? storeReviews.reduce((sum, r) => sum + r.rating, 0) / storeReviews.length
        : 0

      await db.store.update({
        where: { id: storeId },
        data: {
          rating: Math.round(avgRating * 10) / 10,
          totalReviews: storeReviews.length,
        },
      })
    }

    return NextResponse.json({ success: true, review }, { status: 201 })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }, { status: 500 })
  }
}
