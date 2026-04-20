import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { createHash } from 'crypto'

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

// POST: Alterar senha do usuário autenticado
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
    const { currentPassword, newPassword } = body

    // Validações
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'A senha atual e a nova senha são obrigatórias.' },
        { status: 400 }
      )
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' },
        { status: 400 }
      )
    }

    if (newPassword.length > 128) {
      return NextResponse.json(
        { success: false, error: 'A nova senha deve ter no máximo 128 caracteres.' },
        { status: 400 }
      )
    }

    // Buscar conta com campo de senha
    const account = await db.account.findUnique({
      where: { id: accountId },
      select: { id: true, password: true },
    })

    if (!account) {
      return NextResponse.json(
        { success: false, error: 'Conta não encontrada.' },
        { status: 404 }
      )
    }

    // Verificar se a senha atual está correta
    const hashedCurrentPassword = hashPassword(currentPassword)
    if (hashedCurrentPassword !== account.password) {
      return NextResponse.json(
        { success: false, error: 'Senha atual incorreta.' },
        { status: 401 }
      )
    }

    // Verificar se a nova senha é diferente da atual
    const hashedNewPassword = hashPassword(newPassword)
    if (hashedNewPassword === account.password) {
      return NextResponse.json(
        { success: false, error: 'A nova senha deve ser diferente da senha atual.' },
        { status: 400 }
      )
    }

    // Atualizar a senha
    await db.account.update({
      where: { id: accountId },
      data: { password: hashedNewPassword },
    })

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso!',
    })
  } catch (error: unknown) {
    console.error('Erro ao alterar senha:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor. Tente novamente.' },
      { status: 500 }
    )
  }
}
