import { NextRequest, NextResponse } from 'next/server'

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token do Turnstile não informado' },
        { status: 400 }
      )
    }

    // Se não há chave configurada, pular verificação (modo dev)
    if (!TURNSTILE_SECRET) {
      console.log('[Turnstile] Verificação pulada — nenhuma chave secreta configurada')
      return NextResponse.json({ success: true, bypassed: true })
    }

    // Verificar com Cloudflare
    const formData = new URLSearchParams()
    formData.append('secret', TURNSTILE_SECRET)
    formData.append('response', token)

    const cfResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    )

    if (!cfResponse.ok) {
      console.error('[Turnstile] Erro na verificação com Cloudflare:', cfResponse.status)
      return NextResponse.json(
        { success: false, error: 'Erro ao verificar com Cloudflare' },
        { status: 502 }
      )
    }

    const result = await cfResponse.json()

    return NextResponse.json({
      success: result.success === true,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor'
    console.error('Erro na verificação do Turnstile:', message)
    return NextResponse.json(
      { success: false, error: 'Erro ao verificar. Tente novamente.' },
      { status: 500 }
    )
  }
}
