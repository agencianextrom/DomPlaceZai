---
Task ID: store-dashboard-api
Agent: Backend Developer
Task: Create backend API routes for Store Owner (Lojista) dashboard

Work Log:
- Created `/src/app/api/store-dashboard/stats/route.ts` - GET endpoint for store statistics
  - Revenue (total + today), order counts by status, product counts, ratings
  - Uses Prisma aggregate for revenue, parallel queries for performance
  - Today calculation uses UTC-3 (Brasília timezone)

- Created `/src/app/api/store-dashboard/orders/route.ts` - GET endpoint for store orders
  - Lists orders with customer info, items, status history
  - Supports filtering by status, pagination (limit/offset)
  - Sorted by createdAt desc, includes full pagination metadata

- Created `/src/app/api/store-dashboard/orders/[id]/route.ts` - PATCH endpoint for order management
  - Actions: accept, reject, prepare, ready, start_delivery, deliver, cancel
  - Strict status transition validation (PENDING→CONFIRMED/CANCELLED, CONFIRMED→PREPARING/CANCELLED, etc.)
  - Transaction-based: cancel restores product stock + decrements soldCount
  - Deliver sets deliveredAt + increments store.totalSales
  - Creates OrderStatusHistory entry for every transition
  - Validates store ownership (403 if order not from this store)

- Created `/src/app/api/store-dashboard/settings/route.ts` - GET and PUT endpoints
  - GET: Returns full store settings with account info
  - PUT: Updates 17 allowed fields with validation
  - Phone/WhatsApp regex validation, openDays format check, negative value prevention
  - Validates store ownership before update

- Created `/src/app/api/store-dashboard/promotions/route.ts` - GET and POST endpoints
  - GET: Lists promotions with active filter and pagination
  - POST: Creates promotion with full validation
  - Promotion types: PERCENTAGE, FIXED_AMOUNT, FREE_DELIVERY, BUY_X_GET_Y
  - Code uniqueness check (409 if duplicate), percentage max 100%, date range validation
  - Auto-uppercasing promo codes

Stage Summary:
- 5 API route files created with consistent patterns
- All use `NextResponse.json()`, `db` from `@/lib/db`, `authOptions` from `@/lib/auth`
- All error handling uses `error instanceof Error ? error.message : '...'`
- All text in Brazilian Portuguese
- ESLint: 0 errors
- Dev server: compiling successfully
