// Shared type definitions for the DomPlace marketplace
// Import from '@/types' to use across the codebase

// ── API response types ──────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ── Product types ───────────────────────────────────────────────────

export interface ProductData {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice?: number | null
  images: string[]
  category: string
  storeId: string
  storeName?: string
  rating: number
  reviewCount: number
  stock: number
  status: string
  createdAt: string
  updatedAt: string
}

// ── Store types ───────────────────────────────────────────────────────

export interface StoreData {
  id: string
  name: string
  slug: string
  description: string
  logo?: string
  coverImage?: string
  address: string
  neighborhood: string
  city: string
  rating: number
  reviewCount: number
  deliveryFee: number
  deliveryTime: number
  category: string
  status: string
  accountId: string
}

// ── Order types ───────────────────────────────────────────────────────

export interface OrderData {
  id: string
  orderNumber: string
  status: string
  total: number
  items: OrderItemData[]
  storeName?: string
  createdAt: string
  updatedAt: string
  estimatedDelivery?: number
}

export interface OrderItemData {
  id: string
  productId: string
  productName?: string
  productImage?: string
  quantity: number
  price: number
}

// ── Account types ────────────────────────────────────────────────────

export interface AccountData {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: 'USER' | 'STORE_OWNER' | 'DRIVER' | 'AFFILIATE' | 'ADMIN'
  createdAt: string
}

// ── Cart types ───────────────────────────────────────────────────────

export interface CartItemData {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  storeId?: string
  storeName?: string
}

// ── Chat / Notification types ────────────────────────────────────────

export interface ChatMessageData {
  id: string
  senderId: string
  text: string
  timestamp: number
  type: 'user' | 'assistant' | 'system'
}

export interface NotificationData {
  id: string
  title: string
  body: string
  type: string
  read: boolean
  createdAt: string
}

// ── Session user type (for use with NextAuth) ─────────────────────────

export interface SessionUser {
  id: string
  email: string
  name: string
  role: string
  avatar?: string
  phone?: string
}

// ── App view type for SPA navigation ───────────────────────────────────

export type AppView =
  | 'home'
  | 'search'
  | 'cart'
  | 'checkout'
  | 'orders'
  | 'profile'
  | 'favorites'
  | 'store'
  | 'product'
  | 'stores'
  | 'auth'
  | 'support'
  | 'notifications'
  | 'driver'
  | 'affiliate'
  | 'admin'
  | 'chat'
