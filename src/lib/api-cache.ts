// Simple request deduplication + short cache with size limit
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new Map<string, { data: any; ts: number }>()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const inflight = new Map<string, Promise<any>>()
const CACHE_TTL = 30000 // 30 seconds
const MAX_CACHE_ENTRIES = 100

function evictOldest() {
  // Evict the oldest entry when cache exceeds max size
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value as string | undefined
    if (oldestKey !== undefined) {
      cache.delete(oldestKey)
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function cachedFetch<T = any>(url: string, options?: RequestInit): Promise<T> {
  const now = Date.now()
  const cached = cache.get(url)
  if (cached && now - cached.ts < CACHE_TTL) return cached.data as T

  if (inflight.has(url)) return inflight.get(url) as Promise<T>

  const promise = fetch(url, options)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json() as Promise<T>
    })
    .then(data => {
      evictOldest()
      cache.set(url, { data, ts: Date.now() })
      inflight.delete(url)
      return data
    })
    .catch(err => {
      inflight.delete(url)
      throw err
    })

  inflight.set(url, promise)
  return promise as Promise<T>
}
