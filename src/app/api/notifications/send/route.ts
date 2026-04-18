import { NextRequest, NextResponse } from 'next/server'
import { getFCMTokensForAccount } from './register/route'

const FIREBASE_SERVER_KEY = process.env.FIREBASE_SERVER_KEY
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

interface SendNotificationBody {
  accountId: string
  title: string
  body: string
  data?: Record<string, string>
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SendNotificationBody
    const { accountId, title, body: messageBody, data } = body

    if (!accountId || !title || !messageBody) {
      return NextResponse.json(
        { error: 'accountId, title e body são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar tokens FCM para a conta
    const tokens = getFCMTokensForAccount(accountId)

    if (tokens.length === 0) {
      return NextResponse.json({
        success: true,
        sent: false,
        reason: 'no_tokens',
        message: 'Nenhum token FCM registrado para esta conta',
      })
    }

    // Se Firebase não configurado, apenas log
    if (!FIREBASE_SERVER_KEY || !FIREBASE_PROJECT_ID) {
      console.log(`[FCM] Notificação NÃO enviada (Firebase não configurado):`, {
        to: accountId,
        title,
        body: messageBody,
        tokensCount: tokens.length,
      })

      return NextResponse.json({
        success: true,
        sent: false,
        reason: 'no_firebase_config',
        message: 'Firebase não configurado. Notificação registrada no log.',
        tokensCount: tokens.length,
      })
    }

    // Enviar via FCM HTTP v1 API
    const payload = {
      message: {
        notification: {
          title,
          body: messageBody,
        },
        data: data || {},
        tokens,
      },
    }

    const fcmResponse = await fetch(
      `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FIREBASE_SERVER_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    if (!fcmResponse.ok) {
      const errorText = await fcmResponse.text()
      console.error('[FCM] Erro do Firebase:', fcmResponse.status, errorText)
      return NextResponse.json({
        success: false,
        sent: false,
        reason: 'fcm_error',
        error: 'Erro ao enviar notificação via Firebase',
      }, { status: 502 })
    }

    const result = await fcmResponse.json()

    console.log(`[FCM] Notificação enviada para ${accountId}:`, {
      success: result.successCount ?? 0,
      failure: result.failureCount ?? 0,
    })

    return NextResponse.json({
      success: true,
      sent: true,
      successCount: result.successCount ?? 0,
      failureCount: result.failureCount ?? 0,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor'
    console.error('[FCM] Erro ao enviar notificação:', message)
    return NextResponse.json(
      { success: false, error: 'Erro ao enviar notificação' },
      { status: 500 }
    )
  }
}
