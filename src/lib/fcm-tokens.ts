// Armazenamento em memória: accountId → array de FCM tokens
//
// LIMITATION: Tokens are lost on server restart. This is acceptable for MVP
// on a single-server deployment. For production with horizontal scaling:
// TODO: Persist FCM tokens to the database (e.g., a new FcmToken model or
//       as a JSON field on Account) so tokens survive restarts and are shared
//       across multiple server instances.
const fcmTokens = new Map<string, string[]>()

// Função auxiliar para acessar tokens
export function getFCMTokensForAccount(accountId: string): string[] {
  return fcmTokens.get(accountId) ?? []
}

// Registrar token para uma conta
export function registerFCMTokenForAccount(token: string, accountId: string): string[] {
  const existing = fcmTokens.get(accountId) ?? []

  // Evitar duplicatas
  if (!existing.includes(token)) {
    existing.push(token)
    fcmTokens.set(accountId, existing)
  }

  return existing
}
