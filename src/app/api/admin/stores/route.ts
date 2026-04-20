import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { StoreStatus } from '@prisma/client'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const user = session?.user as Record<string, unknown> | null
  if (!user || user.role !== 'ADMIN') {
    return null
  }
  return session
}

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
    const status = searchParams.get('status') as StoreStatus | null
    const search = searchParams.get('search') || ''
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 100)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0)

    // Montar filtro where
    const where: Record<string, unknown> = {}
    if (status && Object.values(StoreStatus).includes(status)) {
      where.status = status
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { account: { name: { contains: search } } },
        { account: { email: { contains: search } } },
      ]
    }

    const [stores, total] = await Promise.all([
      db.store.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          status: true,
          rating: true,
          totalReviews: true,
          totalSales: true,
          phone: true,
          createdAt: true,
          account: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.store.count({ where }),
    ])

    const page = Math.floor(offset / limit) + 1
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      stores: stores.map((store) => ({
        id: store.id,
        name: store.name,
        slug: store.slug,
        category: store.category,
        status: store.status,
        rating: store.rating,
        totalReviews: store.totalReviews,
        totalSales: store.totalSales,
        phone: store.phone,
        createdAt: store.createdAt,
        ownerName: store.account.name,
        ownerEmail: store.account.email,
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
    console.error('[Admin Stores] Erro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar lojas.' },
      { status: 500 }
    )
  }
}
