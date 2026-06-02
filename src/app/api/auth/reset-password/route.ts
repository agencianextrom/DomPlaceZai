import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit, getClientIP } from '@/lib/rate-limit'
import { hashPassword } from '@/lib/crypto'
import { consumeResetToken } from '@/lib/reset-tokens'

// POST: Redefinir senha com token de recuperação
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    const rl = rateLimit(ip, { limit: 5, windowMs: 60000 })
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'Muitas tentativas. Tente novamente em 1 minuto.' }, { status: 429 })
    }

    const body = await request.json()
    const { email, token, newPassword } = body

    // Validations
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'E-mail é obrigatório.' },
        { status: 400 }
      )
    }

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Token de recuperação é obrigatório.' },
        { status: 400 }
      )
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Nova senha é obrigatória.' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
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

    // Consume the reset token (one-time use, removes from store)
    const tokenData = consumeResetToken(token)

    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: 'Token inválido ou expirado. Solicite uma nova recuperação de senha.' },
        { status: 400 }
      )
    }

    // Verify email matches the token
    if (tokenData.email !== email.toLowerCase().trim()) {
      return NextResponse.json(
        { success: false, error: 'Token não corresponde ao e-mail fornecido.' },
        { status: 400 }
      )
    }

    // Find the account
    const account = await db.account.findUnique({
      where: { email: tokenData.email },
      select: { id: true, status: true, password: true },
    })

    if (!account) {
      return NextResponse.json(
        { success: false, error: 'Conta não encontrada.' },
        { status: 404 }
      )
    }

    if (account.status === 'SUSPENDED') {
      return NextResponse.json(
        { success: false, error: 'Conta suspensa. Entre em contato com o suporte.' },
        { status: 403 }
      )
    }

    // Hash the new password
    const hashedPassword = hashPassword(newPassword)

    // Update password in DB
    await db.account.update({
      where: { id: account.id },
      data: { password: hashedPassword },
    })

    console.log(`[ResetPassword] Senha atualizada para conta: ${account.id} (${tokenData.email})`)

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso! Faça login com sua nova senha.',
    })
  } catch (error: unknown) {
    console.error('Erro ao redefinir senha:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor. Tente novamente.' },
      { status: 500 }
    )
  }
}
