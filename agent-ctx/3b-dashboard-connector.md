---
Task ID: 3b
Agent: Dashboard Connector Agent
Task: Connect 6 dashboard components to real APIs, replacing mock data

Summary of Changes:

1. **ReviewsManagement.tsx** — Complete rewrite: removed 8 mock reviews, fetches from `/api/reviews?storeId=X`, real reply via PUT, loading skeleton
2. **DriverDashboard.tsx** — Fixed GPS to Dom Eliseu PA (-3.3917, -50.3558), POST→PATCH for status/location, real browser geolocation auto-sent every 30s
3. **AffiliateDashboard.tsx** — Removed mock banners/templates, installed qrcode package, generates real QR code from referral URL
4. **RateOrderModal.tsx** — Functional photo upload via upload-client.ts (Cloudinary), progress indicators, max 3 photos
5. **OrdersView.tsx** — Removed fake stock check, uses real productId/productImage from order items for reorder
6. **DeliveryTracker.tsx** — Fetches real order detail for driver info and statusHistory, proper fallbacks

Supporting: StoreDashboard.tsx now passes storeId prop to ReviewsManagement.

No new lint errors. Dev server compiled successfully.
