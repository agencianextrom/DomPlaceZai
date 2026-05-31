import { create } from 'zustand'

export type AppView = 'home' | 'search' | 'store' | 'product' | 'cart' | 'checkout' | 'orders' | 'profile' | 'order-detail' | 'favorites' | 'store-dashboard' | 'shopping-lists' | 'product-comparison' | 'notifications' | 'admin-dashboard' | 'support-center' | 'store-comparison' | 'driver-dashboard' | 'affiliate-dashboard'

export interface StoreData {
  id: string
  name: string
  slug: string
  description: string | null
  category: string
  logo: string | null
  coverImage: string | null
  phone: string | null
  whatsapp: string | null
  address: string | null
  neighborhood: string | null
  city: string
  state: string
  deliveryFee: number
  freeDeliveryAbove: number | null
  rating: number
  totalReviews: number
  opensAt: string | null
  closesAt: string | null
  openDays: string
  totalSales?: number
}

export interface ProductData {
  id: string
  storeId: string
  storeName?: string
  storeLogo?: string | null
  name: string
  slug: string
  description: string | null
  price: number
  comparePrice: number | null
  images: string
  stock: number
  rating: number
  totalReviews: number
  isFeatured: boolean
  isNew: boolean
  isOffer: boolean
  tags: string
  variations: string | null
  category: string
  freeDeliveryAbove: number | null
  storeDeliveryFee: number
}

export interface CartItemData {
  id: string
  productId: string
  product: ProductData
  storeId: string
  storeName: string
  quantity: number
}

export interface BannerData {
  id: string
  storeId: string
  storeName?: string
  title: string
  subtitle: string | null
  image: string
  link: string | null
  level: string
  order: number
}

export interface OrderData {
  id: string
  orderNumber: string
  storeId: string
  storeName?: string
  status: string
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  paymentMethod: string | null
  deliveryType: string
  createdAt: string
  items?: { productName: string; quantity: number; price: number; total: number }[]
}

// localStorage helpers
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore write errors
  }
}

// Cart persistence helpers
import { saveCartToStorage, loadCartFromStorage, clearCartStorage } from '@/lib/cart-persistence'

export interface CurrentUser {
  id?: string
  email?: string | null
  name?: string | null
  role?: string
  avatar?: string | null
}

// Chat message type (matches hook)
export interface ChatMessageData {
  id: string
  orderId: string
  senderId: string
  receiverId: string | null
  driverId: string | null
  message: string
  attachment: string | null
  isRead: boolean
  createdAt: string
}

// Tracking data type (matches hook)
export interface TrackingData {
  orderId: string
  driverLocation: { lat: number; lng: number; heading: number; speed: number; accuracy: number } | null
  eta: number
  etaText: string
  progress: number
  status: string
  statusLabel: string
  driverName: string
  driverVehicle: string
}

interface AppState {
  // Auth
  currentUser: CurrentUser | null
  
  // Navigation
  currentView: AppView
  navigationHistory: AppView[]
  
  // Selected items
  selectedStore: StoreData | null
  selectedProduct: ProductData | null
  selectedOrder: OrderData | null
  selectedOrderTab: string
  
  // Cart
  cartItems: CartItemData[]
  
  // Search
  searchQuery: string
  isSearchOpen: boolean
  
  // Category filtering
  activeCategory: string | null
  
  // Favorites (persisted)
  favoriteProductIds: Set<string>
  favoriteStoreIds: Set<string>
  
  // Recent searches (persisted)
  recentSearches: string[]
  
  // Product comparison
  compareProductIds: string[]
  
  // Chat
  chatMessages: ChatMessageData[]
  isChatConnected: boolean
  
  // Delivery tracking
  trackingData: TrackingData | null
  isTrackingConnected: boolean
  
  // UI
  isMobileMenuOpen: boolean
  isAuthModalOpen: boolean
  isChatOpen: boolean
  quickAddProduct: ProductData | null
  isQuickAddOpen: boolean
  neighborhoodSelectorOpen: boolean
  selectedNeighborhood: string
  
  // Actions
  navigate: (view: AppView) => void
  goBack: () => void
  selectStore: (store: StoreData) => void
  selectProduct: (product: ProductData) => void
  selectOrder: (order: OrderData) => void
  setSelectedOrderTab: (tab: string) => void
  
  // Cart actions
  addToCart: (product: ProductData, storeName: string, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartItemCount: () => number
  getCartGroupedByStore: () => { storeId: string; storeName: string; items: CartItemData[]; subtotal: number }[]
  
  // Search actions
  setSearchQuery: (query: string) => void
  openSearch: () => void
  closeSearch: () => void
  
  // Category actions
  setActiveCategory: (category: string | null) => void
  
  // Favorites actions
  toggleFavoriteProduct: (productId: string) => void
  toggleFavoriteStore: (storeId: string) => void
  isFavoriteProduct: (productId: string) => boolean
  isFavoriteStore: (storeId: string) => boolean
  
  // Recent searches actions
  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void
  
  // Auth actions
  setCurrentUser: (user: CurrentUser | null) => void
  logoutUser: () => void
  
  // UI actions
  toggleMobileMenu: () => void
  openAuthModal: () => void
  closeAuthModal: () => void
  toggleChat: () => void
  openQuickAdd: (product: ProductData) => void
  closeQuickAdd: () => void
  openNeighborhoodSelector: () => void
  closeNeighborhoodSelector: () => void
  setSelectedNeighborhood: (name: string) => void
  
  // Comparison actions
  toggleCompareProduct: (productId: string) => void
  clearComparison: () => void
  isComparing: (productId: string) => boolean
  
  // Chat actions
  setChatMessages: (messages: ChatMessageData[]) => void
  addChatMessage: (message: ChatMessageData) => void
  setIsChatConnected: (connected: boolean) => void
  
  // Tracking actions
  setTrackingData: (data: TrackingData | null) => void
  setIsTrackingConnected: (connected: boolean) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Auth
  currentUser: null,
  
  // Navigation
  currentView: 'home',
  navigationHistory: ['home'],
  
  // Selected items
  selectedStore: null,
  selectedProduct: null,
  selectedOrder: null,
  selectedOrderTab: 'ongoing',
  
  // Cart (persisted to localStorage)
  cartItems: typeof window !== 'undefined' ? (loadCartFromStorage() ?? []) : [],
  
  // Search
  searchQuery: '',
  isSearchOpen: false,
  
  // Category filtering
  activeCategory: null,
  
  // Favorites (loaded from localStorage on client)
  favoriteProductIds: new Set(loadFromStorage<string[]>('domplace-fav-products', [])),
  favoriteStoreIds: new Set(loadFromStorage<string[]>('domplace-fav-stores', [])),
  
  // Recent searches (loaded from localStorage on client)
  recentSearches: loadFromStorage<string[]>('domplace-recent-searches', ['Açaí congelado', 'Ração para cachorro', 'Pão de queijo']),
  
  // Product comparison
  compareProductIds: [],
  
  // Chat
  chatMessages: [],
  isChatConnected: false,
  
  // Delivery tracking
  trackingData: null,
  isTrackingConnected: false,
  
  // UI
  isMobileMenuOpen: false,
  isAuthModalOpen: false,
  isChatOpen: false,
  quickAddProduct: null,
  isQuickAddOpen: false,
  neighborhoodSelectorOpen: false,
  selectedNeighborhood: loadFromStorage<string>('domplace-neighborhood', 'Centro'),
  
  // Actions
  navigate: (view) => set((state) => ({
    currentView: view,
    navigationHistory: [...state.navigationHistory, view],
    isSearchOpen: false,
    isMobileMenuOpen: false,
  })),
  
  goBack: () => set((state) => {
    const history = [...state.navigationHistory]
    history.pop()
    const prevView = history.length > 0 ? history[history.length - 1] : 'home'
    return {
      currentView: prevView,
      navigationHistory: history,
    }
  }),
  
  selectStore: (store) => set({ selectedStore: store }),
  selectProduct: (product) => set({ selectedProduct: product }),
  selectOrder: (order) => set({ selectedOrder: order }),
  setSelectedOrderTab: (tab) => set({ selectedOrderTab: tab }),
  
  // Cart actions (all mutations persist to localStorage)
  addToCart: (product, storeName, quantity = 1) => set((state) => {
    const existingItem = state.cartItems.find(item => item.productId === product.id)
    let newItems: typeof state.cartItems
    if (existingItem) {
      newItems = state.cartItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
    } else {
      newItems = [...state.cartItems, {
        id: `cart-${Date.now()}`,
        productId: product.id,
        product,
        storeId: product.storeId,
        storeName,
        quantity,
      }]
    }
    saveCartToStorage(newItems)
    return { cartItems: newItems }
  }),
  
  removeFromCart: (productId) => set((state) => {
    const newItems = state.cartItems.filter(item => item.productId !== productId)
    saveCartToStorage(newItems)
    return { cartItems: newItems }
  }),
  
  updateCartQuantity: (productId, quantity) => set((state) => {
    const newItems = quantity <= 0
      ? state.cartItems.filter(item => item.productId !== productId)
      : state.cartItems.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
    saveCartToStorage(newItems)
    return { cartItems: newItems }
  }),
  
  clearCart: () => {
    clearCartStorage()
    set({ cartItems: [] })
  },
  
  getCartTotal: () => {
    return get().cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0)
  },
  
  getCartItemCount: () => {
    return get().cartItems.reduce((count, item) => count + item.quantity, 0)
  },
  
  getCartGroupedByStore: () => {
    const groups: Record<string, { storeId: string; storeName: string; items: CartItemData[]; subtotal: number }> = {}
    get().cartItems.forEach(item => {
      if (!groups[item.storeId]) {
        groups[item.storeId] = { storeId: item.storeId, storeName: item.storeName, items: [], subtotal: 0 }
      }
      groups[item.storeId].items.push(item)
      groups[item.storeId].subtotal += item.product.price * item.quantity
    })
    return Object.values(groups)
  },
  
  // Search actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  
  // Category actions
  setActiveCategory: (category) => set({ activeCategory: category }),
  
  // Favorites actions
  toggleFavoriteProduct: (productId) => {
    const state = get()
    const newSet = new Set(state.favoriteProductIds)
    if (newSet.has(productId)) {
      newSet.delete(productId)
    } else {
      newSet.add(productId)
    }
    saveToStorage('domplace-fav-products', Array.from(newSet))
    set({ favoriteProductIds: newSet })
  },
  
  toggleFavoriteStore: (storeId) => {
    const state = get()
    const newSet = new Set(state.favoriteStoreIds)
    if (newSet.has(storeId)) {
      newSet.delete(storeId)
    } else {
      newSet.add(storeId)
    }
    saveToStorage('domplace-fav-stores', Array.from(newSet))
    set({ favoriteStoreIds: newSet })
  },
  
  isFavoriteProduct: (productId) => get().favoriteProductIds.has(productId),
  isFavoriteStore: (storeId) => get().favoriteStoreIds.has(storeId),
  
  // Recent searches actions
  addRecentSearch: (query) => {
    const trimmed = query.trim()
    if (!trimmed || trimmed.length < 2) return
    const state = get()
    const updated = [trimmed, ...state.recentSearches.filter(s => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 10)
    saveToStorage('domplace-recent-searches', updated)
    set({ recentSearches: updated })
  },
  
  clearRecentSearches: () => {
    saveToStorage('domplace-recent-searches', [])
    set({ recentSearches: [] })
  },
  
  // Auth actions
  setCurrentUser: (user) => set({ currentUser: user }),
  logoutUser: () => set({ currentUser: null }),
  
  // UI actions
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  openQuickAdd: (product) => set({ quickAddProduct: product, isQuickAddOpen: true }),
  closeQuickAdd: () => set({ isQuickAddOpen: false }),
  openNeighborhoodSelector: () => set({ neighborhoodSelectorOpen: true }),
  closeNeighborhoodSelector: () => set({ neighborhoodSelectorOpen: false }),
  setSelectedNeighborhood: (name) => {
    saveToStorage('domplace-neighborhood', name)
    set({ selectedNeighborhood: name, neighborhoodSelectorOpen: false })
  },
  
  // Comparison actions
  toggleCompareProduct: (productId) => set((state) => {
    const exists = state.compareProductIds.includes(productId)
    if (exists) {
      return { compareProductIds: state.compareProductIds.filter(id => id !== productId) }
    }
    if (state.compareProductIds.length >= 3) return state
    return { compareProductIds: [...state.compareProductIds, productId] }
  }),
  clearComparison: () => set({ compareProductIds: [] }),
  isComparing: (productId) => get().compareProductIds.includes(productId),
  
  // Chat actions
  setChatMessages: (messages) => set({ chatMessages: messages }),
  addChatMessage: (message) => set((state) => ({
    chatMessages: state.chatMessages.some((m) => m.id === message.id)
      ? state.chatMessages
      : [...state.chatMessages, message],
  })),
  setIsChatConnected: (connected) => set({ isChatConnected: connected }),
  
  // Tracking actions
  setTrackingData: (data) => set({ trackingData: data }),
  setIsTrackingConnected: (connected) => set({ isTrackingConnected: connected }),
}))
