import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST: Solicitar recuperação de senha
// Em produção, enviaria um e-mail com link de redefinição via Resend
export async function POST(request: NextRequest) {
  try {
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
      select: { id: true, name: true, status: true },
    })

    if (account) {
      // TODO: Em produção, implementar o envio de e-mail de recuperação via Resend
      // 1. Gerar token único com expiração (ex: 1 hora)
      // 2. Salvar token no banco de dados (nova coluna ou tabela)
      // 3. Enviar e-mail com link: /reset-password?token=xxx
      // Exemplo:
      // const resetToken = generateResetToken()
      // await db.account.update({
      //   where: { id: account.id },
      //   data: { resetToken, resetTokenExpiresAt: new Date(Date.now() + 3600000) },
      // })
      // await sendResetEmail(account.email, account.name, resetToken)

      console.log(`[ForgotPassword] Solicitação de recuperação para: ${email} (Conta: ${account.id}, Status: ${account.status})`)
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
