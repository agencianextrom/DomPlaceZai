# Task 9 - Admin API Routes

## Agent: Backend Developer

## Work Log:
- Created 8 admin API route files with full ADMIN role verification
- All routes use `requireAdmin()` helper with NextAuth session check
- All routes use `import { db } from '@/lib/db'` (Prisma with Turso/libSQL)
- All error handling uses try/catch with Brazilian Portuguese error messages
- ESLint passes with 0 errors
- Dev server compiles successfully

## Files Created:

### 1. `/src/app/api/admin/stats/route.ts` - GET
- Platform-wide statistics endpoint
- Returns: totalAccounts (by role), totalStores (by status), totalOrders (by status), totalRevenue, totalProducts, totalReviews, recentRegistrations, ordersToday, revenueToday, topStores
- Uses parallel Promise.all for performance

### 2. `/src/app/api/admin/stores/route.ts` - GET
- Lists all stores with owner info (name, email)
- Query params: status, search, limit, offset
- Pagination support (total, page, totalPages)
- Sorted by createdAt desc
- Returns: id, name, slug, category, status, rating, totalReviews, totalSales, phone, createdAt, ownerName, ownerEmail

### 3. `/src/app/api/admin/stores/[id]/route.ts` - PATCH
- Store moderation: approve | suspend | activate | reject
- Updates store status and account status accordingly
- Creates ActivityLog entry with admin action
- Returns updated store with owner info

### 4. `/src/app/api/admin/users/route.ts` - GET
- Lists all accounts with role-specific info
- Query params: role, status, search, limit, offset
- Pagination support
- Includes role-specific details: user (spent/orders/loyalty), storeOwner (store info), deliveryDriver (vehicle/verification/deliveries), affiliate (earnings/referrals)

### 5. `/src/app/api/admin/users/[id]/route.ts` - PATCH
- User moderation: activate | suspend | block | change_role
- 'change_role' creates role-specific records (Store with PENDING_APPROVAL, DeliveryDriver with PENDING, Affiliate with generated referral code, User)
- All actions create ActivityLog entries
- Block sets status to INACTIVE (forces session invalidation)

### 6. `/src/app/api/admin/orders/route.ts` - GET
- Lists all orders with store, customer, and driver info
- Query params: status, storeId, dateFrom, dateTo, limit, offset
- Pagination support
- Includes order items
- Returns: orderNumber, status, total, paymentMethod, deliveryType, timestamps, storeName, customerName, driverName

### 7. `/src/app/api/admin/payouts/route.ts` - GET + PATCH
- GET: Lists affiliates with pending earnings, sorted by pendingEarnings desc
- PATCH: approve (deduct from totalEarnings + pendingEarnings) or reject (keep pending, log rejection)
- Creates ActivityLog entries for both actions
- Validates amount doesn't exceed pendingEarnings

### 8. `/src/app/api/admin/reviews/route.ts` - GET + PATCH
- GET: Lists flagged reviews (no reply OR rating ≤ 2), with reviewer, store, and product info
- PATCH: reply (adds reply text, max 1000 chars) or delete (removes review, updates store/product rating totals)
- Creates ActivityLog entries for both actions
- Recalculates store/product rating and review counts after deletion
