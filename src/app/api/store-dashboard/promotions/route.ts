import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET: Listar promoções da loja
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const accountId = (session?.user as Record<string, unknown>)?.id as string
    const activeOnly = searchParams.get('active') === 'true'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!accountId) {
      return NextResponse.json(
        { error: 'ID da conta é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar a loja associada a esta conta
    const store = await db.store.findUnique({
      where: { accountId },
      select: { id: true, name: true },
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Loja não encontrada para esta conta' },
        { status: 404 }
      )
    }

    // Construir filtro
    const where: Record<string, unknown> = { storeId: store.id }
    if (activeOnly) {
      where.isActive = true
    }

    // Buscar promoções com paginação
    const [promotions, total] = await Promise.all([
      db.promotion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.promotion.count({ where }),
    ])

    return NextResponse.json({
      storeId: store.id,
      storeName: store.name,
      promotions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Erro ao listar promoções:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST: Criar nova promoção
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const accountId = (session?.user as Record<string, unknown>)?.id as string

    if (!accountId) {
      return NextResponse.json(
        { error: 'ID da conta é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar a loja associada a esta conta
    const store = await db.store.findUnique({
      where: { accountId },
      select: { id: true, name: true },
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Loja não encontrada para esta conta' },
        { status: 404 }
      )
    }

    // Extrair campos do body
    const {
      title,
      description,
      type,
      value,
      minOrderValue,
      maxDiscount,
      usageLimit,
      code,
      startsAt,
      endsAt,
    } = body

    // Validações
    if (!title || (title as string).trim().length < 2) {
      return NextResponse.json(
        { error: 'Título é obrigatório e deve ter pelo menos 2 caracteres' },
        { status: 400 }
      )
    }

    const validTypes = ['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_DELIVERY', 'BUY_X_GET_Y']
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Tipo inválido. Tipos permitidos: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    if (value === undefined || value === null || (value as number) <= 0) {
      return NextResponse.json(
        { error: 'Valor da promoção é obrigatório e deve ser maior que zero' },
        { status: 400 }
      )
    }

    // Para desconto percentual, validar que não ultrapassa 100%
    if (type === 'PERCENTAGE' && (value as number) > 100) {
      return NextResponse.json(
        { error: 'Desconto percentual não pode ser maior que 100%' },
        { status: 400 }
      )
    }

    if (!startsAt || !endsAt) {
      return NextResponse.json(
        { error: 'Data de início e fim são obrigatórias' },
        { status: 400 }
      )
    }

    const startDate = new Date(startsAt)
    const endDate = new Date(endsAt)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Datas inválidas' },
        { status: 400 }
      )
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'Data de fim deve ser posterior à data de início' },
        { status: 400 }
      )
    }

    // Verificar se o código já existe (se fornecido)
    if (code) {
      const existingCode = await db.promotion.findUnique({
        where: { code: (code as string).toUpperCase().trim() },
      })

      if (existingCode) {
        return NextResponse.json(
          { error: 'Este código de promoção já está em uso' },
          { status: 409 }
        )
      }
    }

    // Criar promoção
    const promotion = await db.promotion.create({
      data: {
        storeId: store.id,
        title: (title as string).trim(),
        description: description ? (description as string).trim() : null,
        type: type as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_DELIVERY' | 'BUY_X_GET_Y',
        value: value as number,
        minOrderValue: minOrderValue !== undefined ? (minOrderValue as number) : null,
        maxDiscount: maxDiscount !== undefined ? (maxDiscount as number) : null,
        usageLimit: usageLimit !== undefined ? (usageLimit as number) : null,
        code: code ? (code as string).toUpperCase().trim() : null,
        startsAt: startDate,
        endsAt: endDate,
        isActive: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Promoção criada com sucesso',
        promotion,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar promoção:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
