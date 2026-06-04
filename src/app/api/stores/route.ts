import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET: Listar lojas com filtros
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const where: Record<string, unknown> = {
      status: 'ACTIVE',
    }
    
    if (category) {
      where.category = category
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }
    
    const [stores, total] = await Promise.all([
      db.store.findMany({
        where,
        include: {
          account: { select: { name: true, avatar: true } },
        },
        orderBy: { weeklyScore: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.store.count({ where }),
    ])
    
    return NextResponse.json({
      stores: stores.map(s => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        description: s.description,
        category: s.category,
        logo: s.logo,
        coverImage: s.coverImage,
        phone: s.phone,
        whatsapp: s.whatsapp,
        address: s.address,
        neighborhood: s.neighborhood,
        city: s.city,
        state: s.state,
        deliveryFee: s.deliveryFee,
        freeDeliveryAbove: s.freeDeliveryAbove,
        rating: s.rating,
        totalReviews: s.totalReviews,
        opensAt: s.opensAt,
        closesAt: s.closesAt,
        openDays: s.openDays,
      })),
      total,
      limit,
      offset,
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST: Criar nova loja
export async function POST(request: Request) {
  try {
    // Auth check — only authenticated STORE_OWNER or ADMIN can create stores
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    const accountId = (session.user as any)?.id
    const account = await db.account.findUnique({ where: { id: accountId } })
    if (!account || (account.role !== 'STORE_OWNER' && account.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Apenas lojistas podem criar lojas' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      description,
      category,
      phone,
      whatsapp,
      address,
      neighborhood,
      opensAt,
      closesAt,
      openDays,
      deliveryFee,
      freeDeliveryAbove,
      minOrderValue,
      pixKey,
      socialMedia,
      logo,
      coverImage,
    } = body

    // Validação
    if (!name || !category) {
      return NextResponse.json(
        { error: 'Nome e categoria são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se a conta já tem loja
    const existingStore = await db.store.findUnique({ where: { accountId } })
    if (existingStore) {
      return NextResponse.json(
        { error: 'Esta conta já possui uma loja cadastrada' },
        { status: 400 }
      )
    }

    // Gerar slug
    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const slug = `${baseSlug}-${Date.now()}`

    const store = await db.store.create({
      data: {
        accountId,
        name,
        slug,
        description: description || null,
        category,
        phone: phone || null,
        whatsapp: whatsapp || null,
        address: address || null,
        neighborhood: neighborhood || null,
        opensAt: opensAt || null,
        closesAt: closesAt || null,
        openDays: openDays || '1,2,3,4,5,6,7',
        deliveryFee: deliveryFee ? parseFloat(deliveryFee) : 0,
        freeDeliveryAbove: freeDeliveryAbove ? parseFloat(freeDeliveryAbove) : null,
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
        pixKey: pixKey || null,
        socialMedia: socialMedia || null,
        logo: logo || null,
        coverImage: coverImage || null,
        status: 'PENDING_APPROVAL',
      },
    })

    return NextResponse.json({ success: true, store }, { status: 201 })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }, { status: 500 })
  }
}
