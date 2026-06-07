# Task 1-B: UI/UX Fix Agent

## Work Record

### Files Changed (4):
1. `src/components/home/PromoBanner.tsx` — Added `min-h-[44px]` to 2 CTA buttons
2. `src/components/layout/MobileNav.tsx` — Added `useEffect` to sync `activeTabX` with `currentView` changes
3. `src/components/dashboard/StoreDashboard.tsx` — Improved `AccessDenied` component with login-prompting UX
4. `src/app/layout.tsx` — Changed `viewport.themeColor` from `#6366f1` to `#059669`

### Fixes Applied:

**PROBLEM 1 — Aproveitar Button Touch Target (P1):**
- PromoBanner CTA buttons (HeroPromoSlide + PromoCard) had `px-4 py-2` with no min-height
- Added `min-h-[44px]` class to both buttons

**PROBLEM 2 — SPA Navigation Active State (P1):**
- MobileNav's sliding pill indicator (`activeTabX`) relied solely on ref callbacks
- Added backup `useEffect` that queries DOM for active tab via `aria-current="page"` on `currentView` change
- Uses `requestAnimationFrame` to ensure DOM is updated before measuring

**PROBLEM 3 — Anunciar Acesso Negado UX (P2):**
- `AccessDenied` component now differentiates between "not logged in" and "wrong role"
- When not logged in: shows "É necessário estar logado para anunciar" + "Fazer Login" button → opens AuthModal
- When logged in (wrong role): keeps original permission message + "Voltar" button

**PROBLEM 4 — theme-color Meta Tag (P3):**
- `viewport.themeColor` was `#6366f1` (indigo) overriding the correct `metadata.other` value
- Changed to `#059669` (emerald-600) to match branding

### Verification:
- `bun run lint`: 0 errors, 0 warnings ✅
- Dev server compiles cleanly ✅
