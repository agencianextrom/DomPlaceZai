import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const user = session?.user as Record<string, unknown> | null
  if (!user || user.role !== 'ADMIN') {
    return null
  }
  return session
}

// GET - Listar avaliações sinalizadas (sem resposta ou com nota baixa)
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta rota.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 100)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0)

    // Avaliações que precisam de atenção: sem resposta OU com nota baixa (1-2 estrelas)
    const where = {
      OR: [
        { reply: null },
        { rating: { lte: 2 } },
      ],
    }

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        select: {
          id: true,
          rating: true,
          comment: true,
          reply: true,
          isVerified: true,
          images: true,
          createdAt: true,
          updatedAt: true,
          account: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          store: {
            select: {
              id: true,
              name: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.review.count({ where }),
    ])

    const page = Math.floor(offset / limit) + 1
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        reply: review.reply,
        isVerified: review.isVerified,
        images: review.images,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        reviewerName: review.account.name,
        reviewerEmail: review.account.email,
        storeId: review.store?.id || null,
        storeName: review.store?.name || null,
        productId: review.product?.id || null,
        productName: review.product?.name || null,
        needsReply: !review.reply,
        lowRating: review.rating <= 2,
      })),
      pagination: {
        total,
        page,
        totalPages,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('[Admin Reviews GET] Erro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar avaliações.' },
      { status: 500 }
    )
  }
}

// PATCH - Responder ou deletar avaliação
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta rota.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { reviewId, action, replyText } = body as {
      reviewId: string
      action: 'reply' | 'delete'
      replyText?: string
    }

    if (!reviewId || !action || !['reply', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos. Informe reviewId e action (reply/delete).' },
        { status: 400 }
      )
    }

    // Buscar avaliação existente
    const review = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        account: true,
        store: true,
        product: true,
      },
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Avaliação não encontrada.' },
        { status: 404 }
      )
    }

    const adminId = (session.user as Record<string, unknown>).id as string

    if (action === 'reply') {
      if (!replyText || replyText.trim().length === 0) {
        return NextResponse.json(
          { error: 'O texto da resposta é obrigatório para a ação "reply".' },
          { status: 400 }
        )
      }

      if (replyText.length > 1000) {
        return NextResponse.json(
          { error: 'A resposta deve ter no máximo 1000 caracteres.' },
          { status: 400 }
        )
      }

      const updated = await db.review.update({
        where: { id: reviewId },
        data: { reply: replyText.trim() },
      })

      await db.activityLog.create({
        data: {
          accountId: adminId,
          action: 'REVIEW_REPLY',
          details: `Resposta adicionada à avaliação ID ${reviewId} (nota ${review.rating}) de "${review.account.name}" ${review.product ? `sobre produto "${review.product.name}"` : ''} ${review.store ? `da loja "${review.store.name}"` : ''}.`,
        },
      })

      return NextResponse.json({
        message: 'Resposta adicionada à avaliação com sucesso.',
        review: {
          id: updated.id,
          reply: updated.reply,
          updatedAt: updated.updatedAt,
        },
      })
    }

    if (action === 'delete') {
      // Deletar avaliação
      await db.$transaction([
        db.review.delete({
          where: { id: reviewId },
        }),
        db.activityLog.create({
          data: {
            accountId: adminId,
            action: 'REVIEW_DELETE',
            details: `Avaliação ID ${reviewId} (nota ${review.rating}) de "${review.account.name}" ${review.product ? `sobre produto "${review.product.name}"` : ''} ${review.store ? `da loja "${review.store.name}"` : ''} foi removida pelo administrador.`,
          },
        }),
      ])

      // Atualizar contagem de reviews da loja/produto
      const updateOperations: Promise<unknown>[] = []

      if (review.storeId) {
        const storeReviews = await db.review.findMany({
          where: { storeId: review.storeId },
          select: { rating: true },
        })
        const avgRating = storeReviews.length > 0
          ? storeReviews.reduce((sum, r) => sum + r.rating, 0) / storeReviews.length
          : 0
        updateOperations.push(
          db.store.update({
            where: { id: review.storeId },
            data: {
              totalReviews: storeReviews.length,
              rating: Math.round(avgRating * 100) / 100,
            },
          })
        )
      }

      if (review.productId) {
        const productReviews = await db.review.findMany({
          where: { productId: review.productId },
          select: { rating: true },
        })
        const avgRating = productReviews.length > 0
          ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
          : 0
        updateOperations.push(
          db.product.update({
            where: { id: review.productId },
            data: {
              totalReviews: productReviews.length,
              rating: Math.round(avgRating * 100) / 100,
            },
          })
        )
      }

      if (updateOperations.length > 0) {
        await Promise.all(updateOperations)
      }

      return NextResponse.json({
        message: 'Avaliação removida com sucesso.',
      })
    }

    return NextResponse.json({ error: 'Ação desconhecida.' }, { status: 400 })
  } catch (error) {
    console.error('[Admin Reviews PATCH] Erro:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor ao processar avaliação.' },
      { status: 500 }
    )
  }
}
