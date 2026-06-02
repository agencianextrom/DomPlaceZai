---
Task ID: 3c
Agent: Homepage Polish Agent
Task: Improve homepage section polish — fix fake data, connect to real APIs, enhance card display

## Work Log:

### Issue 1: UrgencyStrip — Removed ALL fake social proof
**File: `src/components/home/UrgencyStrip.tsx`**

**Before**: Showed fake messages like "Beatriz comprou Pão Francês há 7 min atrás", "89 pedidos hoje em Dom Eliseu", "3 entregas acontecendo agora", fake reviews, fake viewer counts. Used deterministic fake data generation with arrays of names, stores, products, time labels, and review quotes.

**After**: 
- Removed ALL 8 fake data arrays (names, stores, products, timeAgoLabels, reviewQuotes)
- Removed `getPurchaseCount()`, `getActiveDeliveries()`, `getViewerCount()` fake generators
- Removed entire `generateMessages()` function that produced fake purchase/review/viewer messages
- Now fetches from `/api/products?limit=5&sort=newest` to get real newest products
- Transforms real product data into "Novo produto: [productName]" messages with store initial avatars
- Includes promotional messages: "Entrega grátis em compras acima de R$50", "Novas ofertas toda semana no DomPlace", "Ganhe pontos com o programa de fidelidade", etc.
- Deterministic minute-based shuffle for message variety
- Falls back gracefully to promo-only messages if API fails
- All visual design preserved (emerald gradient, avatars, pulse dot, pattern overlay, left/right accents)

### Issue 2: FlashSale — Connected to real API
**File: `src/components/home/FlashSale.tsx`**

**Before**: Used hardcoded `flashSaleProducts[]` array with 6 fake products with fake `soldPercent` values and fake `originalStock`.

**After**:
- Removed ALL hardcoded `flashSaleProducts[]` mock data
- Fetches from `/api/products?isOffer=true&limit=6&sort=popular` for real offer products
- Added `FlashSaleCardSkeleton` loading component with proper card skeleton
- Added `mapApiToFlashProduct()` helper that computes `soldPercent` from real `soldCount` and `stock`
- Added error state with retry button
- Added empty state ("Nenhuma oferta disponível no momento")
- Added refresh button in header
- Auto-refreshes when countdown reaches zero
- Extended `categoryIcons` map to cover all store categories
- All visual design preserved (countdown timer, gradients, discount badges, stock progress bars, shimmer)

### Issue 3: HeroBanner — Verified
**File: `src/components/home/HeroBanner.tsx`**

**Status**: No changes needed. All images exist in `/public/images/` (bakery.jpg, grocery.jpg, acai.jpg, beauty.jpg, agriculture.jpg, pharmacy.jpg, electronics.jpg, pets.jpg). The HeroBanner component does NOT use the `banner.image` field at all — it renders pure gradient backgrounds with sparkle particles, morph blobs, floating dots, and text overlays. The banner is already beautiful and fully functional without images.

### Issue 4: StoreCarousel — Enhanced polish
**File: `src/components/home/StoreCarousel.tsx`**

**Before**: Already had good card design with initials, name, category badge, rating, delivery fee, open/closed status, hover shadow, and "Ver Loja" button.

**After** (enhancements):
- Added real store logo image support: shows `<img>` when `store.logo` exists, falls back to initials on error
- Added "Frete Grátis" badge for stores with `deliveryFee === 0` (emerald colored)
- Added review count next to rating: "4.7 (128)"
- Changed open/closed indicator from clock icon to a colored dot (green with pulse for open, red for closed)
- Improved hover effect: added `hover:border-primary/30` and changed translate from -0.5 to -1 for more noticeable lift
- All existing visual design preserved

### Issue 5: DailyRewards — Verified
**File: `src/components/promotions/DailyRewards.tsx`**

**Status**: No changes needed. The component is entirely localStorage-based (key: `domplace-daily-streak`), which is appropriate for client-side gamification. It properly:
- Uses lazy initializer `getInitialStreak()` to avoid setState-in-effect
- Handles streak resets when days are skipped (resets streak but preserves total points)
- Has proper 7-day streak tracker with visual progress
- Confetti animation on reward claim
- Toast notification with points and streak info
- Clean localStorage persistence

### Additional Fix:
**File: `src/components/layout/CookieConsent.tsx`**
- ESLint error `react-hooks/set-state-in-effect` was already fixed in prior session (uses lazy initializer)
- Confirmed fix is present and lint passes

## Stage Summary:
- 3 files modified: `UrgencyStrip.tsx`, `FlashSale.tsx`, `StoreCarousel.tsx`
- 2 files verified (no changes needed): `HeroBanner.tsx`, `DailyRewards.tsx`
- All fake social proof data removed from UrgencyStrip (8 arrays + 3 generators + 1 generator function)
- All hardcoded flash sale products removed (6 fake products with fake sold percentages)
- FlashSale now connected to real API with loading skeletons, error/empty states, and retry
- Store carousel enhanced with logo images, free delivery badge, review count, animated open dot
- ESLint: 0 errors
- Dev server: compiling successfully (GET / 200 consistently)
- All existing visual designs and animations preserved
