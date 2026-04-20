# Task: Rewrite ProfileView.tsx with Real API Data

## Agent: Full-Stack Developer
## Status: COMPLETED

## Changes Made:
1. **Replaced all mock data with real API fetches** using `useEffect` + `fetch()`:
   - `GET /api/profile` → profile data (name, email, stats, loyaltyBalance, etc.)
   - `GET /api/orders?accountId=X&limit=3` → recent orders
   - `GET /api/loyalty` → loyalty points (currentBalance, totalEarned, totalRedeemed)
   - `GET /api/favorites?accountId=X&type=store&limit=5` → favorite stores

2. **Added loading state** with full skeleton UI (cover, stats, orders, menu)

3. **Fixed Logout Button**: Added `onClick={() => signOut({ callbackUrl: '/' })}` from `next-auth/react`

4. **Fixed Edit Button**: Replaced `openAuthModal()` with a Dialog form containing:
   - Input fields: name, phone, bio
   - Character count on bio (max 500)
   - Save button calls `PUT /api/profile`
   - Loading spinner while saving
   - Toast on success/error

5. **Status mapping**: Orders use proper badge colors:
   - DELIVERED → 'Entregue' (emerald)
   - DELIVERING → 'Em Entrega' (purple)
   - CONFIRMED → 'Confirmado' (blue)
   - PREPARING → 'Preparando' (amber)
   - PENDING → 'Pendente' (gray)
   - CANCELLED → 'Cancelado' (red)

6. **Stats use real data**: orderCount, favoriteCount, loyaltyPoints from API

7. **Empty states**: Added for orders and favorite stores when no data

8. **Time ago**: Orders show relative time (e.g., "2h atrás", "Ontem")

9. **Kept ALL existing styling, animations, layout exactly the same**

10. **Unused imports cleaned**: Removed `RewardsSection`, `ShoppingLists`, `OrderTimeline` imports that were no longer used in main view

## Removed:
- `RewardsSection` import (was not used in main view)
- `ShoppingLists` import (was not used in main view)  
- `OrderTimeline` import (was not used in main view)
- `Plus`, `Trash2` imports (unused)
- Mock `recentOrders`, `favoriteStores`, `savedAddresses` arrays
- `openAuthModal()` call from edit button

## New Imports:
- `signOut` from `next-auth/react`
- `Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter` from `@/components/ui/dialog`
- `Input` from `@/components/ui/input`
- `Label` from `@/components/ui/label`
- `Skeleton` from `@/components/ui/skeleton`
- `Loader2` from `lucide-react`

## Verification:
- ESLint: 0 errors
- Dev server: Compiling successfully (no TypeScript errors)
- All routes: GET / 200
