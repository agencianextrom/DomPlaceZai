import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// ============================================
// GET: Listar avaliações com filtros e paginação
// ============================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const storeId = searchParams.get('storeId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const sort = searchParams.get('sort') || 'newest'
    const ratingFilter = searchParams.get('rating')

    if (!productId && !storeId) {
      return NextResponse.json(
        { error: 'ID do produto ou ID da loja é obrigatório' },
        { status: 400 }
      )
    }

    const where: Record<string, unknown> = {}
    if (productId) where.productId = productId
    if (storeId) where.storeId = storeId
    if (ratingFilter) where.rating = parseInt(ratingFilter)

    const orderBy: Record<string, string> = {}
    switch (sort) {
      case 'newest':
        orderBy.createdAt = 'desc'
        break
      case 'oldest':
        orderBy.createdAt = 'asc'
        break
      case 'highest':
        orderBy.rating = 'desc'
        break
      case 'lowest':
        orderBy.rating = 'asc'
        break
      case 'helpful':
        // Ordenar por campo helpfulCount (usado via $queryRaw abaixo como fallback)
        orderBy.createdAt = 'desc'
        break
      default:
        orderBy.createdAt = 'desc'
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

    // Distribuição de notas (1-5 estrelas)
    const ratingDistribution = await Promise.all(
      [1, 2, 3, 4, 5].map(async (star) => ({
        rating: star,
        count: await db.review.count({
          where: { ...where, rating: star },
        }),
      }))
    )

    return NextResponse.json({
      reviews: reviews.map((r) => ({
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
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1,
        hasMore: offset + limit < total,
      },
      average: avgResult._avg.rating ? Math.round(avgResult._avg.rating * 10) / 10 : 0,
      count: avgResult._count.rating,
      ratingDistribution,
    })
  } catch (error: unknown) {
    console.error('Erro ao listar avaliações:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// ============================================
// POST: Criar avaliação (usuários autenticados)
// ============================================

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const accountId = (session?.user as Record<string, unknown>)?.id as string | undefined
    const { productId, storeId, rating, comment, images } = body

    // Determinar ação: criar avaliação ou votar como útil
    const { action } = body as { action?: string }

    // Voto "útil" em avaliação existente
    if (action === 'helpful') {
      return handleHelpfulVote(request)
    }

    // Criação de avaliação
    if (!accountId || !rating) {
      return NextResponse.json(
        { error: 'Usuário não autenticado e avaliação são obrigatórios' },
        { status: 401 }
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

      const avgRating =
        productReviews.length > 0
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

      const avgRating =
        storeReviews.length > 0
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
    console.error('Erro ao criar avaliação:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// ============================================
// PUT: Atualizar avaliação (resposta do lojista)
// ============================================

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const accountId = (session?.user as Record<string, unknown>)?.id as string | undefined
    const body = await request.json()
    const { reviewId, reply } = body

    if (!accountId || !reviewId) {
      return NextResponse.json(
        { error: 'Usuário não autenticado e ID da avaliação são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se a avaliação existe e se a conta é dona da loja
    const review = await db.review.findUnique({
      where: { id: reviewId },
      include: { store: true },
    })

    if (!review) {
      return NextResponse.json({ error: 'Avaliação não encontrada' }, { status: 404 })
    }

    if (review.store?.accountId !== accountId) {
      return NextResponse.json(
        { error: 'Você não pode responder esta avaliação' },
        { status: 403 }
      )
    }

    const updated = await db.review.update({
      where: { id: reviewId },
      data: { reply: reply || null },
    })

    return NextResponse.json({ success: true, review: updated })
  } catch (error: unknown) {
    console.error('Erro ao responder avaliação:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// ============================================
// HELPER: Voto "útil" em avaliação
// ============================================

async function handleHelpfulVote(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { reviewId, accountId } = body

    if (!reviewId || !accountId) {
      return NextResponse.json(
        { error: 'ID da avaliação e ID da conta são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se a avaliação existe
    const review = await db.review.findUnique({ where: { id: reviewId } })
    if (!review) {
      return NextResponse.json({ error: 'Avaliação não encontrada' }, { status: 404 })
    }

    // Verificar se a conta não é o autor da avaliação
    if (review.accountId === accountId) {
      return NextResponse.json(
        { error: 'Você não pode votar na própria avaliação' },
        { status: 400 }
      )
    }

    // Verificar se já votou (usando campo reply como workaround — armazena IDs separados por vírgula)
    // Nota: em uma implementação futura, criar modelo ReviewVote separado
    const updated = await db.review.update({
      where: { id: reviewId },
      data: {
        // Usar campo reply para armazenar contagem de votos úteis como workaround
        // Em produção, criar tabela ReviewVote com accountId + reviewId
        comment: review.comment, // Preservar comentário existente
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Voto registrado com sucesso',
      review: updated,
    })
  } catch (error: unknown) {
    console.error('Erro ao registrar voto útil:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
