import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// PUT: Atualizar endereço existente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const accountId = (session?.user as Record<string, unknown>)?.id as string | undefined

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'Usuário não autenticado. Faça login para continuar.' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Verificar se o endereço pertence ao usuário
    const existingAddress = await db.address.findUnique({
      where: { id },
    })

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, error: 'Endereço não encontrado.' },
        { status: 404 }
      )
    }

    if (existingAddress.accountId !== accountId) {
      return NextResponse.json(
        { success: false, error: 'Você não tem permissão para editar este endereço.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { street, number, complement, neighborhood, city, state, zipCode, isDefault } = body

    // Validações parciais (só valida campos enviados)
    if (street !== undefined && (typeof street !== 'string' || street.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: 'A rua é obrigatória.' },
        { status: 400 }
      )
    }

    if (neighborhood !== undefined && (typeof neighborhood !== 'string' || neighborhood.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: 'O bairro é obrigatório.' },
        { status: 400 }
      )
    }

    if (city !== undefined && (typeof city !== 'string' || city.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: 'A cidade é obrigatória.' },
        { status: 400 }
      )
    }

    if (state !== undefined && (typeof state !== 'string' || state.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: 'O estado é obrigatório.' },
        { status: 400 }
      )
    }

    // Se isDefault=true, desmarcar outros endereços padrão primeiro
    if (isDefault === true) {
      await db.address.updateMany({
        where: {
          accountId,
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      })
    }

    const updatedAddress = await db.address.update({
      where: { id },
      data: {
        ...(street !== undefined ? { street: street.trim() } : {}),
        ...(number !== undefined ? { number: number?.trim() || null } : {}),
        ...(complement !== undefined ? { complement: complement?.trim() || null } : {}),
        ...(neighborhood !== undefined ? { neighborhood: neighborhood.trim() } : {}),
        ...(city !== undefined ? { city: city.trim() } : {}),
        ...(state !== undefined ? { state: state.trim() } : {}),
        ...(zipCode !== undefined ? { zipCode: zipCode?.trim() || null } : {}),
        ...(isDefault !== undefined ? { isDefault: !!isDefault } : {}),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Endereço atualizado com sucesso!',
      address: updatedAddress,
    })
  } catch (error: unknown) {
    console.error('Erro ao atualizar endereço:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor. Tente novamente.' },
      { status: 500 }
    )
  }
}

// DELETE: Remover endereço
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const accountId = (session?.user as Record<string, unknown>)?.id as string | undefined

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'Usuário não autenticado. Faça login para continuar.' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Verificar se o endereço pertence ao usuário
    const existingAddress = await db.address.findUnique({
      where: { id },
    })

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, error: 'Endereço não encontrado.' },
        { status: 404 }
      )
    }

    if (existingAddress.accountId !== accountId) {
      return NextResponse.json(
        { success: false, error: 'Você não tem permissão para remover este endereço.' },
        { status: 403 }
      )
    }

    await db.address.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Endereço removido com sucesso!',
    })
  } catch (error: unknown) {
    console.error('Erro ao remover endereço:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor. Tente novamente.' },
      { status: 500 }
    )
  }
}
