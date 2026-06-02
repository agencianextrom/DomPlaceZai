---
Task ID: 2c
Agent: API Connector Agent
Task: Connect cart/checkout and profile components to real APIs, replacing hardcoded data

## Files Changed
- `src/lib/shopping-lists-persistence.ts` (NEW) — localStorage persistence for shopping lists
- `src/lib/delivery-estimate.ts` (NEW) — Dynamic delivery time estimation
- `src/components/cart/CartView.tsx` (MODIFIED) — Removed all hardcoded data, fetches from APIs
- `src/components/product/ProductQuickAdd.tsx` (MODIFIED) — Removed hardcoded delivery times
- `src/components/product/DeliveryTimeCalculator.tsx` (MODIFIED) — Removed hardcoded distance, dynamic props
- `src/components/profile/ShoppingLists.tsx` (MODIFIED) — Added localStorage persistence + share
- `src/components/profile/AddressManager.tsx` (MODIFIED) — Connected to /api/addresses CRUD

## Key Decisions
1. Delivery estimates use category-based ranges (FOOD: 20-35min, HEALTH: 30-45min, etc.) since most products don't have store hours data
2. Cross-sell fetches offers from cart stores first, then general offers as fallback
3. Shopping lists use lazy initializer for useState to avoid React lint rule about setState-in-effect
4. Address label is local-only (not in API schema) — derived from isDefault
5. API field mapping: frontend `zip` → API `zipCode`, frontend `isPrimary` → API `isDefault`
