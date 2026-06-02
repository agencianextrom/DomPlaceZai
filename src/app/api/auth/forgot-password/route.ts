import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit, getClientIP } from '@/lib/rate-limit'
import { generateToken } from '@/lib/crypto'
import { storeResetToken } from '@/lib/reset-tokens'

// POST: Solicitar recuperação de senha
// Em produção, enviaria um e-mail com link de redefinição via Resend
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    const rl = rateLimit(ip, { limit: 3, windowMs: 60000 })
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'Muitas tentativas. Tente novamente em 1 minuto.' }, { status: 429 })
    }

    const body = await request.json()
    const { email } = body

    // Validação básica
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: true, message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação.' },
        { status: 200 }
      )
    }

    // Verificar se a conta existe (sem revelar ao usuário)
    const account = await db.account.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true, name: true, status: true, emailVerified: true },
    })

    if (account && account.status === 'ACTIVE') {
      // Generate a secure 32-byte reset token
      const resetToken = generateToken(32)

      // Store the token in memory (valid for 1 hour)
      storeResetToken(account.email, resetToken)

      // In production, send email via Resend with a link:
      // const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
      // await sendResetEmail(account.email, account.name, resetUrl)

      console.log(`[ForgotPassword] Reset token generated for: ${email} (Account: ${account.id}, Status: ${account.status})`)

      // In non-production, return the dev token so testing is possible
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({
          success: true,
          message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação de senha no seu endereço de e-mail.',
          devToken: resetToken,
        })
      }
    }

    // Sempre retorna sucesso para evitar enumeração de e-mails
    return NextResponse.json({
      success: true,
      message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação de senha no seu endereço de e-mail.',
    })
  } catch (error: unknown) {
    console.error('Erro na solicitação de recuperação de senha:', error)
    // Mesmo em erro, retorna mensagem genérica para segurança
    return NextResponse.json({
      success: true,
      message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação de senha no seu endereço de e-mail.',
    })
  }
}
