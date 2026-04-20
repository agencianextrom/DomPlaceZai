import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET: Retorna o perfil do usuário autenticado
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

    // Buscar conta com dados do usuário
    const account = await db.account.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            cpf: true,
            bio: true,
            dateOfBirth: true,
            loyaltyBalance: true,
            totalSpent: true,
            orderCount: true,
          },
        },
        _count: {
          select: {
            addresses: true,
            favorites: true,
            orders: true,
          },
        },
      },
    })

    if (!account) {
      return NextResponse.json(
        { success: false, error: 'Conta não encontrada.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: {
        // Account fields
        id: account.id,
        email: account.email,
        name: account.name,
        phone: account.phone,
        avatar: account.avatar,
        role: account.role,
        status: account.status,
        emailVerified: account.emailVerified,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,

        // User fields
        cpf: account.user?.cpf || null,
        bio: account.user?.bio || null,
        dateOfBirth: account.user?.dateOfBirth || null,
        loyaltyBalance: account.user?.loyaltyBalance ?? 0,
        totalSpent: account.user?.totalSpent ?? 0,
        orderCount: account.user?.orderCount ?? 0,

        // Computed counts
        addressCount: account._count.addresses,
        favoriteCount: account._count.favorites,
      },
    })
  } catch (error: unknown) {
    console.error('Erro ao buscar perfil:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor. Tente novamente.' },
      { status: 500 }
    )
  }
}

// PUT: Atualiza o perfil do usuário autenticado
export async function PUT(request: NextRequest) {
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
    const { name, phone, bio, dateOfBirth, avatar } = body

    // Validações
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'O nome é obrigatório.' },
        { status: 400 }
      )
    }

    if (name.trim().length > 100) {
      return NextResponse.json(
        { success: false, error: 'O nome deve ter no máximo 100 caracteres.' },
        { status: 400 }
      )
    }

    if (phone && (typeof phone !== 'string' || phone.length > 20)) {
      return NextResponse.json(
        { success: false, error: 'O telefone deve ter no máximo 20 caracteres.' },
        { status: 400 }
      )
    }

    if (bio && (typeof bio !== 'string' || bio.length > 500)) {
      return NextResponse.json(
        { success: false, error: 'A bio deve ter no máximo 500 caracteres.' },
        { status: 400 }
      )
    }

    if (avatar && typeof avatar !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Avatar inválido.' },
        { status: 400 }
      )
    }

    // Atualizar dados da conta
    const updatedAccount = await db.account.update({
      where: { id: accountId },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        avatar: avatar || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Atualizar dados do usuário (bio, dateOfBirth)
    if (bio !== undefined || dateOfBirth !== undefined) {
      const existingUser = await db.user.findUnique({
        where: { accountId },
      })

      const userData: Record<string, unknown> = {}
      if (bio !== undefined) userData.bio = bio.trim() || null
      if (dateOfBirth !== undefined) {
        userData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null
      }

      if (existingUser) {
        await db.user.update({
          where: { accountId },
          data: userData,
        })
      } else {
        // Criar registro de usuário se não existir
        await db.user.create({
          data: {
            accountId,
            ...userData,
          },
        })
      }
    }

    // Buscar perfil completo atualizado
    const fullProfile = await db.account.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            cpf: true,
            bio: true,
            dateOfBirth: true,
            loyaltyBalance: true,
            totalSpent: true,
            orderCount: true,
          },
        },
        _count: {
          select: {
            addresses: true,
            favorites: true,
            orders: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Perfil atualizado com sucesso!',
      profile: {
        id: fullProfile!.id,
        email: fullProfile!.email,
        name: fullProfile!.name,
        phone: fullProfile!.phone,
        avatar: fullProfile!.avatar,
        role: fullProfile!.role,
        status: fullProfile!.status,
        createdAt: fullProfile!.createdAt,
        updatedAt: fullProfile!.updatedAt,
        cpf: fullProfile!.user?.cpf || null,
        bio: fullProfile!.user?.bio || null,
        dateOfBirth: fullProfile!.user?.dateOfBirth || null,
        loyaltyBalance: fullProfile!.user?.loyaltyBalance ?? 0,
        totalSpent: fullProfile!.user?.totalSpent ?? 0,
        orderCount: fullProfile!.user?.orderCount ?? 0,
        addressCount: fullProfile!._count.addresses,
        favoriteCount: fullProfile!._count.favorites,
      },
    })
  } catch (error: unknown) {
    console.error('Erro ao atualizar perfil:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor. Tente novamente.' },
      { status: 500 }
    )
  }
}
