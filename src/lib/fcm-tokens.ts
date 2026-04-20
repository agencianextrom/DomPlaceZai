// Armazenamento em memória: accountId → array de FCM tokens
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
