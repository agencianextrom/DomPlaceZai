import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET: Listar todos os endereços do usuário autenticado
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const accountId = (session?.user as Record<string, unknown>)?.id as string | undefined

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'Usuário não autenticado. Faça login para continuar.' },
        { status: 401 }
      )
    }

    const addresses = await db.address.findMany({
      where: { accountId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({
      success: true,
      addresses,
    })
  } catch (error: unknown) {
    console.error('Erro ao buscar endereços:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor. Tente novamente.' },
      { status: 500 }
    )
  }
}

// POST: Criar novo endereço
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const accountId = (session?.user as Record<string, unknown>)?.id as string | undefined

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'Usuário não autenticado. Faça login para continuar.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { street, number, complement, neighborhood, city, state, zipCode, isDefault } = body

    // Validações
    if (!street || typeof street !== 'string' || street.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'A rua é obrigatória.' },
        { status: 400 }
      )
    }

    if (!neighborhood || typeof neighborhood !== 'string' || neighborhood.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'O bairro é obrigatório.' },
        { status: 400 }
      )
    }

    if (!city || typeof city !== 'string' || city.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'A cidade é obrigatória.' },
        { status: 400 }
      )
    }

    if (!state || typeof state !== 'string' || state.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'O estado é obrigatório.' },
        { status: 400 }
      )
    }

    // Se isDefault=true, desmarcar outros endereços padrão primeiro
    if (isDefault) {
      await db.address.updateMany({
        where: { accountId, isDefault: true },
        data: { isDefault: false },
      })
    }

    const address = await db.address.create({
      data: {
        accountId,
        street: street.trim(),
        number: number?.trim() || null,
        complement: complement?.trim() || null,
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode?.trim() || null,
        isDefault: isDefault === true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Endereço criado com sucesso!',
      address,
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('Erro ao criar endereço:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor. Tente novamente.' },
      { status: 500 }
    )
  }
}
