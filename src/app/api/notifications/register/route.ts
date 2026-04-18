import { NextRequest, NextResponse } from 'next/server'

// Armazenamento em memória: accountId → array de FCM tokens
const fcmTokens = new Map<string, string[]>()

// Função auxiliar para acessar tokens (exportada para uso no /send)
export function getFCMTokensForAccount(accountId: string): string[] {
  return fcmTokens.get(accountId) ?? []
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, accountId } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token FCM é obrigatório' },
        { status: 400 }
      )
    }

    if (!accountId || typeof accountId !== 'string') {
      return NextResponse.json(
        { error: 'ID da conta é obrigatório' },
        { status: 400 }
      )
    }

    // Registrar token para a conta
    const existing = fcmTokens.get(accountId) ?? []

    // Evitar duplicatas
    if (!existing.includes(token)) {
      existing.push(token)
      fcmTokens.set(accountId, existing)
    }

    const FIREBASE_SERVER_KEY = process.env.FIREBASE_SERVER_KEY
    if (!FIREBASE_SERVER_KEY) {
      console.log(`[FCM] Token registrado em memória para conta ${accountId} (${existing.length} tokens total) — Firebase não configurado`)
    } else {
      console.log(`[FCM] Token registrado para conta ${accountId} (${existing.length} tokens total)`)
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor'
    console.error('[FCM] Erro ao registrar token:', message)
    return NextResponse.json(
      { error: 'Erro ao registrar token de notificação' },
      { status: 500 }
    )
  }
}
