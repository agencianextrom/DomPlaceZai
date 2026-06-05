const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function cachedFetch<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const now = Date.now()
  const cacheKey = `${url}-${JSON.stringify(options ?? {})}`

  const cached = cache.get(cacheKey)
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data as T
  }

  try {
    const res = await fetch(url, options)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    cache.set(cacheKey, { data, timestamp: now })
    return data as T
  } catch {
    if (cached) return cached.data as T
    throw new Error(`cachedFetch failed for ${url}`)
  }
}
