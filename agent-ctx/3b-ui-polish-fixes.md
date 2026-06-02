Task ID: 3b
Agent: UI Polish Fix Agent
Task: Fix 4 UI polish issues observed in production QA

Work Log:

**Issue 1: Cookie consent dialog reappearing after accepting**
- File: `src/components/layout/CookieConsent.tsx`
- Root cause: The useEffect checked `loadConsent()` which returned null for legacy formats, and didn't set a separate "accepted" flag. Also missing the simpler `domplace-cookies-accepted` key check.
- Fix: Added `hasPreviouslyConsented()` helper that checks BOTH `domplace-cookies-accepted` AND `domplace-cookie-consent` localStorage keys
- Added `markConsented()` helper that sets `domplace-cookies-accepted` to `'true'`
- Used `useState(() => hasPreviouslyConsented())` lazy initializer to avoid setState-in-effect lint error
- Added `hasConsented` state that is checked at the top of render — returns `null` immediately if true
- All three consent handlers (accept, reject, save preferences) now call `markConsented()` + `setHasConsented(true)`
- Early return `if (hasConsented) return null` prevents any UI from rendering

**Issue 2: Cart empty state visual enhancement**
- File: `src/components/cart/CartView.tsx`
- Added outer pulsing glow ring around the shopping bag circle
- Added 3 floating animated emoji accents (🛒, ✨, 🎁) with staggered float animations
- Added a third orbiting decoration with 🌿 emoji
- Added a third morph blob background element for richer atmosphere
- CTA buttons enlarged to h-12 with gradient backgrounds:
  - "Explorar ofertas": outline variant with primary border/30, hover glow
  - "Ver lojas": gradient from-primary to-emerald-600 with shadow-lg
- Buttons now stack vertically on mobile (flex-col sm:flex-row) for better touch targets

**Issue 3: Mobile nav visual polish**
- File: `src/components/layout/MobileNav.tsx`
- Verified backdrop-blur-xl already present and working ✓
- Active tab indicator: layoutId spring animation already smooth ✓
- Added visual pulse feedback: when a tab is active, a subtle pulse ring (scale 0.8→1.2, opacity 0.5→0) animates on the tab background
- Added `active:scale-95` to all nav buttons for tactile press feedback
- Enhanced cart floating button shadow: changed from `0 4px 20px` to `0 6px 24px` with stronger spread for more elevation effect

**Issue 4: Dark mode toggle touch target**
- File: `src/components/layout/MobileNav.tsx`
- Changed from `h-8 w-8` (32px) to `h-10 w-10` (40px) for better touch accessibility
- Adjusted position from `-top-10` to `-top-12` to account for larger size
- Header.tsx already had `h-10 w-10` — no changes needed there

Stage Summary:
- 3 files modified: CookieConsent.tsx, CartView.tsx, MobileNav.tsx
- ESLint: 0 errors
- Dev server: compiling successfully (GET / 200)
- All existing animations and visual design preserved
- No breaking changes
