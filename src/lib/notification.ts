'use client'

/**
 * Utilitário client-side para Firebase Cloud Messaging (FCM)
 * Só inicializa se NEXT_PUBLIC_FIREBASE_API_KEY estiver configurado
 */

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const FIREBASE_APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID
const FIREBASE_MESSAGING_SENDER_ID = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID

const isFirebaseConfigured = !!(FIREBASE_API_KEY && FIREBASE_PROJECT_ID && FIREBASE_APP_ID && FIREBASE_MESSAGING_SENDER_ID)

let messagingInstance: unknown = null
let firebaseInitialized = false

async function initializeFirebase(): Promise<unknown> {
  if (!isFirebaseConfigured || firebaseInitialized) {
    return messagingInstance
  }

  if (typeof window === 'undefined') {
    return null
  }

  try {
    const firebase = await import('firebase/app')
    await import('firebase/messaging')

    const fb = firebase as any
    if (!fb.apps?.length) {
      fb.initializeApp({
        apiKey: FIREBASE_API_KEY,
        authDomain: `${FIREBASE_PROJECT_ID}.firebaseapp.com`,
        projectId: FIREBASE_PROJECT_ID,
        storageBucket: `${FIREBASE_PROJECT_ID}.firebasestorage.app`,
        messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
        appId: FIREBASE_APP_ID,
      })
    }

    messagingInstance = fb.messaging()
    firebaseInitialized = true
    return messagingInstance
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[FCM] Erro ao inicializar Firebase:', message)
    return null
  }
}

/**
 * Solicita permissão de notificação do navegador
 * @returns true se a permissão foi concedida
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  if (!isFirebaseConfigured) {
    console.log('[FCM] Firebase não configurado — permissão simulada')
    return true
  }

  if (!('Notification' in window)) {
    console.warn('[FCM] Navegador não suporta notificações')
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

/**
 * Obtém o token FCM e registra no servidor
 * @param accountId ID da conta do usuário
 * @returns true se o registro foi bem-sucedido
 */
export async function registerFCMToken(accountId: string): Promise<boolean> {
  if (typeof window === 'undefined') return false

  try {
    if (!isFirebaseConfigured) {
      console.log('[FCM] Firebase não configurado — token simulado registrado')
      // Mesmo assim, tenta registrar um token mock para o servidor saber que a conta aceita notificações
      try {
        await fetch('/api/notifications/register?XTransformPort=3000', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: `mock-fcm-token-${accountId}-${Date.now()}`,
            accountId,
          }),
        })
      } catch {
        // Falha silenciosa
      }
      return true
    }

    const messaging = await initializeFirebase() as { getToken: (options?: { vapidKey: string }) => Promise<string> }
    if (!messaging) return false

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    const token = await messaging.getToken(vapidKey ? { vapidKey } : undefined)

    if (!token) {
      console.warn('[FCM] Não foi possível obter o token FCM')
      return false
    }

    // Registrar token no servidor
    const response = await fetch('/api/notifications/register?XTransformPort=3000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, accountId }),
    })

    if (!response.ok) {
      console.error('[FCM] Erro ao registrar token no servidor:', response.status)
      return false
    }

    console.log('[FCM] Token registrado com sucesso')
    return true
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[FCM] Erro ao registrar token FCM:', message)
    return false
  }
}

export { isFirebaseConfigured }
