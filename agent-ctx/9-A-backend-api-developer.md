---
Task ID: 9-A
Agent: Backend API Developer
Task: Create all Phase 1 + Phase 2 backend API routes and utilities

Files Created:
1. `/src/app/api/cep/[cep]/route.ts` — ViaCEP proxy (free, no key)
2. `/src/app/api/weather/route.ts` — Open-Meteo proxy (free, no key)
3. `/src/app/api/turnstile/verify/route.ts` — Cloudflare Turnstile verification
4. `/src/app/api/payments/checkout/route.ts` — Mercado Pago checkout (mock/real)
5. `/src/app/api/payments/webhook/route.ts` — Mercado Pago webhook
6. `/src/app/api/notifications/register/route.ts` — FCM token registration
7. `/src/app/api/notifications/send/route.ts` — FCM push notification
8. `/src/lib/email.ts` — Resend email utility (3 functions)
9. `/src/lib/notification.ts` — FCM client utility ('use client')

Files Updated:
1. `/src/lib/auth.ts` — Added Google + Facebook OAuth providers
2. `/src/app/api/upload/route.ts` — Added Cloudinary support
3. `/src/middleware.ts` — Added 5 new public API paths

Key Design Decisions:
- All external services check env vars and gracefully degrade
- Free services (ViaCEP, Open-Meteo) require no API keys
- Mock mode for all paid services when keys are not configured
- All text in Brazilian Portuguese
- TypeScript strict types throughout (no `any` where avoidable)
- No frontend files modified
- No prisma schema modified
