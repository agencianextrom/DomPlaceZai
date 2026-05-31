# Task 12 + 13: Order Flow Status Machine, Notifications & NProgress Polish

## Summary
Enhanced three core systems: order flow state machine, notification system, and NProgress loader.

## Files Changed

### 1. `/src/lib/orderFlow.ts` (MODIFIED)
**Order Flow Status Machine Enhancement**
- Added `borderColor` and `icon` fields to status definitions
- Added `isValidTransition()` with self-transition prevention
- Added `getTransitionError()` for detailed Portuguese error messages
- Added `getStatusDescription()` and `getStatusInfo()` helpers
- Added `calculateCommission()` for delivery commission
- Added `calculateLoyaltyPoints()` with configurable points per real, minimum order value, first-order bonus, expiration
- Added `getStatusChangeNotification()` - generates in-app notification payload for every status transition with contextual messages
- Added `getLoyaltyPointsNotification()` - generates loyalty points earned notification
- Added `applyStatusTransition()` - server-side function that wraps the full transition in a DB transaction:
  - Validates transitions
  - Updates order status
  - Creates status history entry
  - Restores stock on cancellation
  - Awards loyalty points on delivery
  - Creates in-app notifications for status change AND loyalty points

### 2. `/src/app/api/orders/[id]/route.ts` (MODIFIED)
**PATCH endpoint now uses `applyStatusTransition()`**
- Removed manual status validation and update logic
- PATCH now delegates to the enhanced `applyStatusTransition()` function
- Returns loyalty points, commission, and notification data in response
- Optionally fires push notification via FCM (fire-and-forget)
- GET and POST (rating) endpoints unchanged

### 3. `/src/app/api/notifications/route.ts` (NEW)
**Full CRUD API for notifications**
- **GET**: Lists notifications with filtering (type, isRead), pagination, and unread count
  - `?count=true` - lightweight unread count endpoint for polling
  - Supports `accountId`, `type`, `isRead`, `limit`, `offset` query params
- **PATCH**: Mark as read (single or all)
  - `{ notificationId }` - mark single notification
  - `{ markAll: true }` - mark all as read
- **DELETE**: Remove notification by ID

### 4. `/src/components/notifications/NotificationPanel.tsx` (MODIFIED)
**Real API integration with polling**
- Fetches notifications from `/api/notifications` on mount
- Polls unread count every 30 seconds (lightweight)
- Optimistic UI updates for mark-read and dismiss
- Emerald badge with spring animation and ping pulse
- Dismiss button (visible on hover)
- Refresh button
- Loading spinner state
- Graceful degradation (empty state if API fails)
- All text in Brazilian Portuguese

### 5. `/src/components/notifications/NotificationsPage.tsx` (MODIFIED)
**Real API integration**
- Fetches notifications from `/api/notifications` on mount
- Mark as read via PATCH API
- Delete via DELETE API
- Mark all as read via API
- Refresh button
- Loading spinner state
- Maps API notification types (ORDER_UPDATE, DELIVERY, PROMOTION, SYSTEM, etc.) to display icons
- Action buttons on order notifications ("Ver pedido") navigate to orders view
- Graceful degradation

### 6. `/src/components/navigation/NProgressLoader.tsx` (MODIFIED)
**Smoother SPA navigation**
- Improved NProgress configuration: speed=350, minimum=0.08, trickleSpeed=180, trickleRate=0.015
- Added SPA link click detection for proactive NProgress start
- Skips external links, anchors, mailto, download, modifier-key clicks
- Cleanup on unmount

### 7. `/src/app/globals.css` (MODIFIED)
**NProgress emerald gradient styling**
- Added CSS for `#nprogress .bar` with emerald-to-amber gradient
- Light mode: oklch(0.45 0.1 155) → oklch(0.78 0.16 70) gradient
- Dark mode: brighter emerald variant with glow box-shadow
- Custom 3px height bar
- Removed spinner
- Trailing glow effect via box-shadow peg
- Saturate/brightness filter for richer colors

## Technical Notes
- All text in Brazilian Portuguese
- Emerald/amber theme maintained throughout
- orderFlow.ts imports `db` but only uses it in `applyStatusTransition()` (server-side only)
- NotificationPanel uses `useAuth` hook for user context
- NotificationsPage uses `useAppStore` for navigation
- No test code written per requirements
