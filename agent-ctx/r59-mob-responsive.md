# R59: Mobile-First Responsive Fixes

**Agent:** Main Agent
**Task:** Fix mobile responsiveness issues across the app (80% smartphone users)

## Changes Made

### 1. Global Layout Bottom Padding (CRITICAL)
**File:** `src/app/layout.tsx` — Line 72
- Changed `<main className="flex-1">` → `<main className="flex-1 pb-20 md:pb-4">`
- Ensures ALL views have 80px bottom padding on mobile (covers 64px MobileNav + 16px buffer)
- On desktop (md+), only 16px padding

### 2. Home View Bottom Spacer
**File:** `src/app/page.tsx` — Line 1760
- Changed `<div className="h-4" />` → `<div className="h-20 md:h-4" />`
- Adds 80px bottom spacer at end of home view content, 16px on desktop

### 3. FavoritesView Bottom Padding (in page.tsx)
**File:** `src/app/page.tsx` — Lines 381, 455
- Empty state: `className="max-w-7xl mx-auto px-4 pt-4"` → `className="max-w-7xl mx-auto px-4 pt-4 pb-24 md:pb-6"`
- Populated state: `className="max-w-7xl mx-auto px-4 pt-4"` → `className="max-w-7xl mx-auto px-4 pt-4 pb-24 md:pb-6"`

### 4. CartView Bottom Padding (VERIFIED OK)
**File:** `src/components/cart/CartView.tsx` — Line 673
- Already has `pb-48` (192px) — sufficient for MobileNav

### 5. CheckoutView Bottom Padding (VERIFIED OK)
**File:** `src/components/checkout/CheckoutView.tsx` — Line 540
- Already has `pb-28` (112px) — sufficient for MobileNav

### 6. OrdersView Bottom Padding
**File:** `src/components/orders/OrdersView.tsx` — Line 318
- Changed `pb-20` → `pb-24 md:pb-6`

### 7. SearchView Bottom Padding
**File:** `src/components/search/SearchView.tsx` — Line 409
- Changed `className="min-h-screen bg-background relative"` → `className="min-h-screen pb-24 md:pb-6 bg-background relative"`

### 8. ProfileView Bottom Padding (VERIFIED OK)
**File:** `src/components/profile/ProfileView.tsx` — Multiple lines
- Already has `pb-24` on all view containers

### 9. Grid Layout Fixes

#### RecipeDiscovery.tsx — Line 1293
- Changed nutrition grid: `grid-cols-5` → `grid-cols-3 sm:grid-cols-5`
- The `grid-cols-8` meal planner (lines 1515, 1526) already has `overflow-x-auto` with `min-w-[640px]` — no change needed

#### SmartMealPrep.tsx — Lines 1350-1351, 1484-1485
- Wrapped planner tab grid content with `overflow-x-auto` > `min-w-[600px]` wrapper divs
- This prevents the 8-column day grid from being cramped on mobile
- Weekly Nutrition Summary and Budget Tracker remain outside the scrollable area

#### PaymentTracker.tsx — Line 88
- `grid-cols-8 grid-rows-8` inside a fixed `w-48 h-48` container — no change needed (QR code pattern)

### 10. Global CSS Mobile Utilities
**File:** `src/app/globals.css` — Lines 44085-44109
- Added `r59-mob-content-pad`: dynamic padding-bottom with `env(safe-area-inset-bottom)` for iOS home indicator
- Added `r59-mob-overflow-wrap`: prevents horizontal overflow on mobile
- Added `r59-touch-target`: ensures 44px minimum touch target sizing
- Added `r59-safe-bottom`: safe area padding for bottom fixed elements

### 11. Footer iOS Safe Area
**File:** `src/components/layout/Footer.tsx` — Line 230
- Added `r59-safe-bottom` class to footer element
- Respects iOS home indicator with `env(safe-area-inset-bottom)`

## Lint Results
- **0 new errors** introduced by our changes
- All errors in our edited files are pre-existing (RecipeDiscovery:1085, SmartMealPrep:1044 — setState in useEffect)
- SmartSuggestions.tsx parsing error is pre-existing from a prior round
- 41 total problems (30 errors, 11 warnings) — all pre-existing
