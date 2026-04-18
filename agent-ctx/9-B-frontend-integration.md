---
Task ID: 9-B
Agent: Frontend Integration Developer
Task: Update all Phase 1 + Phase 2 frontend components

Work Log:
- **AddressManager.tsx**: Added ViaCEP auto-fill integration
  - Added CEP mask formatting (00000-000) as user types
  - Auto-fetches from `/api/cep/{digits}` when 8 digits entered
  - Auto-fills street, neighborhood, city, state, zip from API response
  - Shows loading spinner during fetch, error message if CEP not found
  - Graceful fallback — form remains editable if API fails
  - Added Loader2 and Search icon imports

- **CheckoutView.tsx**: Added ViaCEP + Mercado Pago PIX QR integration
  - ViaCEP auto-fill in checkout address form (same pattern as AddressManager)
  - PIX payment integration: calls `/api/payments/checkout` with items
  - Shows QR code image (base64) and copy-paste code in confirmation view
  - "Escaneie o QR Code ou copie o código Pix" text
  - "Copiar código Pix" button with clipboard integration
  - CASH_ON_DELIVERY and BOLETO proceed as before (mock)
  - Graceful fallback if payment API unavailable

- **QuickInfo.tsx**: Added Open-Meteo real weather integration
  - Removed hardcoded weatherData const
  - Added state: weather, weatherLoading
  - Fetches from `/api/weather` (defaults to Dom Eliseu)
  - Weather icon mapping function for 9 conditions (Sun, CloudSun, Cloud, CloudRain, CloudLightning, CloudFog, CloudSnow, Wind)
  - Fallback to mock data (32°C) if API fails
  - Loading skeleton spinner while fetching
  - Auto-refresh every 30 minutes

- **AuthModal.tsx**: Added Google/Facebook OAuth + Cloudflare Turnstile
  - Google OAuth button: dynamically imports signIn from next-auth/react
  - Facebook OAuth button with SVG icon
  - Buttons disabled when providers not configured (NEXT_PUBLIC_GOOGLE_CLIENT_ID)
  - Cloudflare Turnstile: dynamic import (no SSR), rendered before submit buttons
  - Turnstile verification enforced in login/register if env var configured
  - "Complete a verificação de segurança" warning message
  - If env var NOT configured, Turnstile is completely hidden (no verification required)

- **OrderMap.tsx**: Replaced SVG fake map with real Leaflet/OpenStreetMap map
  - Created LeafletMapInner component (dynamically imported, no SSR)
  - Real Leaflet map centered on Dom Eliseu [-3.44, -47.36]
  - Custom divIcon markers: Store (green), Destination (red), Driver (amber)
  - Animated route polyline (dashed = remaining, solid = completed)
  - Driver position updates as progress changes
  - Fixed Leaflet default marker icon paths for webpack/Next.js
  - All existing overlays preserved: AO VIVO badge, ETA card, compass
  - Driver info card, call/chat buttons unchanged

Stage Summary:
- 5 existing components updated, 1 new component created (LeafletMapInner)
- All changes have graceful fallback when APIs unavailable
- ESLint: 0 errors
- Dev server: compiling successfully
- All text in Brazilian Portuguese
