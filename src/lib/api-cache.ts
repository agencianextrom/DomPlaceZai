// Simple request deduplication + short cache
const cache = new Map<string, { data: any; ts: number }>()
const inflight = new Map<string, Promise<any>>()
const CACHE_TTL = 30000 // 30 seconds

export async function cachedFetch(url: string, options?: RequestInit): Promise<any> {
  const now = Date.now()
  const cached = cache.get(url)
  if (cached && now - cached.ts < CACHE_TTL) return cached.data

  if (inflight.has(url)) return inflight.get(url)

  const promise = fetch(url, options)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    })
    .then(data => {
      cache.set(url, { data, ts: Date.now() })
      inflight.delete(url)
      return data
    })
    .catch(err => {
      inflight.delete(url)
      throw err
    })

  inflight.set(url, promise)
  return promise
}
