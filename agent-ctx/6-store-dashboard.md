# Task 6 - StoreDashboard Enhancement Summary

## What Changed

**File Modified**: `/src/components/dashboard/StoreDashboard.tsx`

### 1. Authentication Guard
- Added `useAuth()` hook integration to check user role
- Shows `AccessDenied` component with ShieldX icon when user is not `STORE_OWNER`
- Shows `AuthLoading` spinner while auth state is loading
- Data fetching only triggers after auth is confirmed

### 2. Store Settings Tab (NEW)
- Fetches store settings via `GET /api/store-dashboard/settings?accountId=...`
- Full settings form with sections:
  - **Informações Básicas**: name, description, phone, whatsapp
  - **Endereço**: address, neighborhood
  - **Horário de Funcionamento**: opensAt, closesAt, openDays
  - **Entrega**: deliveryFee, freeDeliveryAbove, minOrderValue, deliveryRadius
  - **Pagamento**: pixKey, socialMedia
- Saves settings via `PUT /api/store-dashboard/settings` with dirty-checking (only sends changed fields)
- Loading skeleton (`SettingsSkeleton`) while fetching
- Save button with loading state

### 3. Promotions Tab (NEW)
- Fetches promotions via `GET /api/store-dashboard/promotions?accountId=...`
- Lists all promotions with:
  - Title, description, type, value display
  - Status badge (Ativa/Expirada/Agendada/Inativa)
  - Promo code with hash icon
  - Date range (startsAt → endsAt)
  - Usage progress bar when usageLimit is set
- Creates promotions via `POST /api/store-dashboard/promotions`
- `PromotionCreateDialog` with form fields:
  - Title, description, type (PERCENTAGE/FIXED_AMOUNT/FREE_DELIVERY/BUY_X_GET_Y)
  - Value, minOrderValue, maxDiscount, usageLimit, code
  - Date range (datetime-local inputs)
- Loading skeleton (`PromotionsSkeleton`) while fetching

### 4. Order Detail Dialog (NEW)
- `OrderDetailDialog` component showing full order details:
  - Status badge and creation date
  - Customer info (name, phone)
  - Items list with quantities and prices
  - Totals breakdown (subtotal, delivery fee, discount, total)
  - Delivery address and notes
  - Payment method and delivery type
  - Status history timeline
  - Cancel reason (if applicable)
- Triggered by "Ver detalhes" button on each order card

### 5. Enhanced Order Actions
- **Reject order** (PENDING → CANCELLED) with AlertDialog confirmation
- **Cancel order** (CONFIRMED → CANCELLED) with AlertDialog confirmation  
- Existing actions preserved: accept, prepare, ready, start_delivery, deliver
- Order status returned from API is now merged into local state (full order update, not just status)

### 6. Order Status Filters (NEW)
- Filter bar with buttons: Todos, Pendentes, Confirmados, Preparando, Prontos, Em Entrega, Entregues, Cancelados
- Each filter shows count badge
- Filters apply to displayed orders list

### 7. Overview Quick Status Cards
- Added clickable quick-action cards for pending, preparing, and delivering orders
- Clicking navigates to Orders tab with the appropriate filter pre-selected

### 8. Loading Skeletons
- `SettingsSkeleton` for settings tab
- `PromotionsSkeleton` for promotions tab
- Existing skeletons preserved (StatsSkeleton, ProductsSkeleton, OrdersSkeleton)

### 9. Error Handling with Retry
- All API fetch functions have try/catch with toast.error notifications
- Global `ErrorState` component with retry button for main data fetch failure
- Individual tab errors handled with toast notifications

### 10. Tab Navigation
- Updated tabs: Visão Geral, Produtos, Pedidos, Análises, **Promoções**, Avaliações, **Configurações**, Novo Produto

### 11. Helper Utilities
- Added `formatDate()` for full date-time formatting in pt-BR
- Added `mapStats()` helper to avoid duplicate stats mapping code

### 12. Type Definitions Added
- `StatusHistoryEntry` - order status history entries
- `StoreSettings` - full store settings shape
- `PromotionData` - promotion data shape
- `PromotionForm` - promotion create form shape
- Extended `OrderData` with additional fields from API

### Technical Details
- All text in Brazilian Portuguese ✓
- Emerald/amber theme ✓
- Responsive design with grid layouts ✓
- Framer Motion animations throughout ✓
- `'use client'` directive ✓
- shadcn/ui components only ✓
- No indigo/blue colors ✓
- Lint passes cleanly ✓
