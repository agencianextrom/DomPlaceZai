import { create } from 'zustand'

export type AppView = 'home' | 'search' | 'store' | 'product' | 'cart' | 'checkout' | 'orders' | 'profile' | 'order-detail' | 'favorites'

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

interface AppState {
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
  
  // UI
  isMobileMenuOpen: boolean
  isAuthModalOpen: boolean
  isChatOpen: boolean
  
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
  
  // UI actions
  toggleMobileMenu: () => void
  openAuthModal: () => void
  closeAuthModal: () => void
  toggleChat: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation
  currentView: 'home',
  navigationHistory: ['home'],
  
  // Selected items
  selectedStore: null,
  selectedProduct: null,
  selectedOrder: null,
  selectedOrderTab: 'ongoing',
  
  // Cart
  cartItems: [],
  
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
  
  // UI
  isMobileMenuOpen: false,
  isAuthModalOpen: false,
  isChatOpen: false,
  
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
  
  // Cart actions
  addToCart: (product, storeName, quantity = 1) => set((state) => {
    const existingItem = state.cartItems.find(item => item.productId === product.id)
    if (existingItem) {
      return {
        cartItems: state.cartItems.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      }
    }
    return {
      cartItems: [...state.cartItems, {
        id: `cart-${Date.now()}`,
        productId: product.id,
        product,
        storeId: product.storeId,
        storeName,
        quantity,
      }],
    }
  }),
  
  removeFromCart: (productId) => set((state) => ({
    cartItems: state.cartItems.filter(item => item.productId !== productId),
  })),
  
  updateCartQuantity: (productId, quantity) => set((state) => ({
    cartItems: quantity <= 0
      ? state.cartItems.filter(item => item.productId !== productId)
      : state.cartItems.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        ),
  })),
  
  clearCart: () => set({ cartItems: [] }),
  
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
  
  // UI actions
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
}))
