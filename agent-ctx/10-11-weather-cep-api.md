# Task 10+11: Weather API & CEP API Enhancement

## Changes Made

### 1. `/src/app/api/weather/route.ts` — Weather API
**Bugs fixed:**
- **Corrected coordinates**: Changed from `-3.3728, -47.3556` to `-3.3917, -50.3558` (correct Dom Eliseu, PA coordinates)
- **Fixed timezone**: Changed from `America/Belem` to `America/Sao_Paulo`

**Enhancements:**
- **In-memory cache (10 minutes)**: Replaced Next.js ISR cache (`next: { revalidate }`) with a proper in-memory cache with 10-minute TTL. Cache includes coordinate-keyed invalidation.
- **Graceful degradation**: If the external API is down, returns stale cached data instead of an error.
- **Request timeout**: Added 8-second AbortController timeout for the fetch call.
- **Additional WMO codes**: Added codes 46 and 47 (fog with depositing rime).
- **New data field**: Added `wind_speed_10m` to the Open-Meteo query and `windSpeed` in the response.
- **Removed ISR**: Removed `next: { revalidate }` since we handle caching ourselves.

### 2. `/src/app/api/cep/[cep]/route.ts` — CEP API
**Enhancements:**
- **In-memory cache (1 hour)**: Replaced Next.js ISR cache (24h) with a Map-based in-memory cache with 1-hour TTL per CEP.
- **Cache cleanup**: Added periodic cleanup of expired cache entries every 5 minutes to prevent memory leaks.
- **Request timeout**: Added 6-second AbortController timeout.
- **Network error fallback**: If ViaCEP is unreachable, returns stale cached data if available.
- **Additional response fields**: Added `stateFull` (full state name), `ddd`, and `ibge` to the standardized response.
- **Removed ISR**: Removed `next: { revalidate }`.

### 3. `/src/components/home/QuickInfo.tsx` — QuickInfo Component
**Bugs fixed:**
- **Critical field mismatch**: The component was reading `data.temperature` but the API returns `data.temp`. Fixed to use `data.temp`.
- **Safe fallbacks**: Added null-safe defaults (`data.temp != null ? data.temp : 30`) to prevent NaN display.
- **Aligned refresh interval**: Changed weather refresh from 30 minutes to 10 minutes to match the API cache TTL.

## Pre-existing Issues (Not Changed)
- Lint errors in `DeliveryTracker.tsx` and `OrderMap.tsx` (setState in effect warnings) — pre-existing, unrelated to this task.
- Seed route SQLite column error — pre-existing, unrelated.
