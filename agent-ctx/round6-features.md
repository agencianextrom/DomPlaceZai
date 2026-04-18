---
Task ID: round6-features
Agent: Features Developer
Task: Add 5 new features to DomPlace marketplace

Work Log:
- Updated Zustand store (`/src/store/useAppStore.ts`):
  - Added `product-comparison` to `AppView` type
  - Added `compareProductIds: string[]` state
  - Added `toggleCompareProduct()`, `clearComparison()`, `isComparing()` actions

- Created **OrderMap** (`/src/components/orders/OrderMap.tsx`):
  - Simulated SVG delivery map with street grid and building blocks
  - Animated dashed route path that fills as driver progresses
  - Store marker (green) with store name label
  - Destination marker (red) with "Sua casa" label
  - Driver marker (amber) with pulse animation, moving along route
  - Compass indicator, live "AO VIVO" badge
  - ETA countdown timer (minutes:seconds) with progress bar
  - Driver info card with name, vehicle, plate, rating, delivery count
  - Call/chat buttons linking to WhatsApp
  - Integrated into OrdersView OrderDetail for DELIVERING status

- Created **ProductComparison** (`/src/components/product/ProductComparison.tsx`):
  - Side-by-side comparison table for 2-3 products
  - Grid layout: product images at top, comparison table below
  - Comparison rows: Preço, Avaliação, Estoque, Entrega, Loja, Popularidade
  - "BestIndicator" badges (green checkmarks) for lowest price, highest rating, most stock, free shipping, most popular
  - Stock status labels (Em estoque, Poucas unidades, Últimas unidades!)
  - Delivery labels and time estimates
  - Popularity progress bars
  - Remove product button on each card
  - "Add more" button when < 3 products
  - Empty state when no products selected
  - Click product card to navigate to product detail

- Created **FlashSale** (`/src/components/home/FlashSale.tsx`):
  - "Oferta Relâmpago" section with gradient red/orange/amber theme
  - Countdown timer to end of day (hours:minutes:seconds) with animated digits
  - Flame icon with rotation animation
  - 6 flash sale products sorted by sold percentage
  - Each card shows: discount badge, product image, price with strikethrough, stock progress bar
  - Pulsing "Últimas!" indicator for products with >85% sold
  - "Comprar" button with gradient styling
  - Auto-refresh animation when timer reaches zero
  - Horizontal scroll with navigation buttons
  - Placed after HeroBanner in home view

- Created **ReviewsManagement** (`/src/components/dashboard/ReviewsManagement.tsx`):
  - Stats summary card: average rating, rating distribution bar chart (1-5 stars)
  - Sentiment breakdown (positive/neutral/negative) with colored badges
  - Reply rate statistics with progress bar
  - Filter tabs: All, by star rating (1-5), "Sem resposta", "Negativas"
  - Review cards with: customer info, verified badge, star rating, date, product name
  - Sentiment indicator badge per review (colored border)
  - Reply section showing store's response
  - Reply dialog with review preview, textarea, send/cancel buttons
  - Integrated as "Avaliações" tab in StoreDashboard

- Created **PromoCodeWidget** (`/src/components/promotions/PromoCodeWidget.tsx`):
  - Enhanced promo code input with clear button, loading spinner on apply
  - Enter key support for applying codes
  - Error state with red text for invalid codes
  - Success animation with checkmark and party popper
  - Applied promos shown as gradient cards with discount info and remove button
  - "Available promos" section with 4 promo codes (ACAI10, FRETE5, GRATIS, DESCONTO20)
  - Each available promo shows: icon, code, badge, description, validity, min order
  - Copy button to copy code to clipboard
  - Click promo card to auto-fill input
  - Replaced old promo code section in CartView

- Modified **page.tsx**:
  - Imported FlashSale, ProductComparison, OrderMap
  - Added FlashSale section after HeroBanner in home view
  - Added product-comparison view route
  - Added CompareFloatingButton component (shows when products are being compared)
  - Floating button with badge count, navigates to comparison view

- Modified **OrdersView.tsx**:
  - Imported OrderMap
  - Added OrderMap for DELIVERING orders in OrderDetail
  - DeliveryTracker now only shows for PREPARING/CONFIRMED orders

- Modified **CartView.tsx**:
  - Replaced old promo code input with PromoCodeWidget
  - Removed unused promoCode state variable

- Modified **StoreDashboard.tsx**:
  - Added MessageSquare icon import
  - Added ReviewsManagement import
  - Added "Avaliações" tab to TabsList
  - Added ReviewsManagement TabsContent

- Modified **ProductCard.tsx**:
  - Added GitCompareArrows icon import
  - Added compare functionality (isComparing, toggleCompareProduct from store)
  - Added compare toggle button at bottom-right of product image
  - Active state shows primary background

Stage Summary:
- 5 new components created (OrderMap, ProductComparison, FlashSale, ReviewsManagement, PromoCodeWidget)
- 1 new view added (product-comparison)
- 6 files modified (page.tsx, OrdersView.tsx, CartView.tsx, StoreDashboard.tsx, ProductCard.tsx, useAppStore.ts)
- ESLint: 0 errors
- Dev server: compiling successfully
- All text in Brazilian Portuguese, emerald/amber/red theme maintained
