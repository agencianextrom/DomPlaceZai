'use client'

import { useAppStore } from '@/store/useAppStore'
import { HeroBanner } from '@/components/home/HeroBanner'
import { CategoryBar } from '@/components/home/CategoryBar'
import { ProductCarousel } from '@/components/home/ProductCarousel'
import { StoreCarousel } from '@/components/home/StoreCarousel'
import { PartnersBanner } from '@/components/home/PartnersBanner'
import { ProductDetail } from '@/components/product/ProductDetail'
import { StoreProfile } from '@/components/store/StoreProfile'
import { SearchView } from '@/components/search/SearchView'
import { CartView } from '@/components/cart/CartView'
import { CartRecoveryBanner } from '@/components/cart/CartRecoveryBanner'
import { CheckoutView } from '@/components/checkout/CheckoutView'
import { OrdersView, OrderDetail } from '@/components/orders/OrdersView'
import { ProfileView } from '@/components/profile/ProfileView'
import { StoreDashboard } from '@/components/dashboard/StoreDashboard'
import { AuthModal } from '@/components/auth/AuthModal'
import { WelcomeModal } from '@/components/onboarding/WelcomeModal'
import { AIChatBot } from '@/components/chat/AIChatBot'
import { CookieConsent } from '@/components/layout/CookieConsent'
import { QuickInfo } from '@/components/home/QuickInfo'
import { FlashSale } from '@/components/home/FlashSale'
import { WeekendSpecials } from '@/components/home/WeekendSpecials'
import { StoreComparison } from '@/components/home/StoreComparison'
import { ProductComparison } from '@/components/product/ProductComparison'
import { OrderMap } from '@/components/orders/OrderMap'
import { NotificationsPage } from '@/components/notifications/NotificationsPage'
import { AdminDashboard } from '@/components/dashboard/AdminDashboard'
import { SmartSuggestions } from '@/components/home/SmartSuggestions'
import { SupportCenter } from '@/components/support/SupportCenter'
import { ProductQuickView } from '@/components/product/ProductQuickView'
import { StoreSearch } from '@/components/home/StoreSearch'
import { LoyaltyTier } from '@/components/profile/LoyaltyTier'
import { WishlistShare } from '@/components/profile/WishlistShare'
import { StoreFavorites } from '@/components/home/StoreFavorites'
import { OrderTimeline } from '@/components/profile/OrderTimeline'
import { SpinWheel } from '@/components/promotions/SpinWheel'
import { MapStoreLocator } from '@/components/home/MapStoreLocator'
import { DailyDeals } from '@/components/home/DailyDeals'
import { DeliveryFeeCalculator } from '@/components/home/DeliveryFeeCalculator'
import { NeighborhoodSelector } from '@/components/home/NeighborhoodSelector'
import { ProductQuickAdd } from '@/components/product/ProductQuickAdd'
import { UrgencyStrip } from '@/components/home/UrgencyStrip'
import { DriverDashboard } from '@/components/driver/DriverDashboard'
import { AffiliateDashboard } from '@/components/affiliate/AffiliateDashboard'
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt'
import { Share2 } from 'lucide-react'
import { useState, useEffect, useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ProductCard } from '@/components/product/ProductCard'
import { ShoppingLists } from '@/components/profile/ShoppingLists'
import { Heart, Sparkles, MapPin, LayoutDashboard, GitCompareArrows, Grid3X3, List, ArrowUpDown, ChevronRight } from 'lucide-react'
import { useState as useQVState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import type { ProductData, StoreData } from '@/store/useAppStore'
import { usePageViewTracking, trackEvent, AnalyticsEvents } from '@/lib/analytics'

// Dynamic time-based greeting helpers
function getGreeting(): { text: string; emoji: string; period: string } {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return { text: 'Bom dia', emoji: '☀️', period: 'manhã' }
  if (hour >= 12 && hour < 18) return { text: 'Boa tarde', emoji: '🌤️', period: 'tarde' }
  return { text: 'Boa noite', emoji: '🌙', period: 'noite' }
}

function getGreetingTitle(currentUser: any): string {
  const greeting = getGreeting()
  const name = currentUser?.name || 'Visitante'
  return `${greeting.text}, ${name}! ${greeting.emoji}`
}

// Fallback data in case API fails
const fallbackBanners = [
  { id: 'b1', title: 'Ofertas da Semana', subtitle: 'Até 40% de desconto em produtos locais', image: '/images/grocery.jpg', gradient: 'bg-gradient-to-r from-primary via-emerald-500 to-teal-500' },
  { id: 'b2', title: 'Entrega Grátis', subtitle: 'Compras acima de R$ 50 em lojas selecionadas', image: '/images/bakery.jpg', gradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500' },
  { id: 'b3', title: 'Novidades no App', subtitle: 'Descubra novas lojas e produtos da região', image: '/images/acai.jpg', gradient: 'bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500' },
  { id: 'b4', title: 'Programa de Fidelidade', subtitle: 'Ganhe pontos a cada compra e troque por descontos', image: '/images/beauty.jpg', gradient: 'bg-gradient-to-r from-lime-500 via-green-500 to-emerald-600' },
]

const fallbackStores: StoreData[] = [
  { id: 's1', name: 'Mercado do Zé', slug: 'mercado-do-ze', description: 'O melhor mercado de Dom Eliseu com produtos frescos e preços justos.', category: 'FOOD', logo: '/images/grocery.jpg', coverImage: '/images/grocery.jpg', phone: '(91) 99999-0001', whatsapp: '(91) 99999-0001', address: 'Rua Principal, 123', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 5.00, freeDeliveryAbove: 50, rating: 4.7, totalReviews: 128, opensAt: '07:00', closesAt: '21:00', openDays: '1,2,3,4,5,6,7' },
  { id: 's2', name: 'Açaí da Boa', slug: 'acai-da-boa', description: 'O mais autêntico açaí paraense, feito com frutas selecionadas da região.', category: 'FOOD', logo: '/images/acai.jpg', coverImage: '/images/acai.jpg', phone: '(91) 99999-0002', whatsapp: '(91) 99999-0002', address: 'Av. Brasil, 456', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 3.00, freeDeliveryAbove: 30, rating: 4.9, totalReviews: 256, opensAt: '08:00', closesAt: '22:00', openDays: '1,2,3,4,5,6' },
  { id: 's3', name: 'Agropecuária São Paulo', slug: 'agropecuaria-sao-paulo', description: 'Tudo para o campo e para a cidade. Ferramentas, sementes e muito mais.', category: 'AGRICULTURE', logo: '/images/agriculture.jpg', coverImage: '/images/agriculture.jpg', phone: '(91) 99999-0003', whatsapp: '(91) 99999-0003', address: 'Rod. PA-279, Km 5', neighborhood: 'Zona Rural', city: 'Dom Eliseu', state: 'PA', deliveryFee: 8.00, freeDeliveryAbove: 200, rating: 4.5, totalReviews: 67, opensAt: '06:00', closesAt: '18:00', openDays: '1,2,3,4,5,6' },
  { id: 's4', name: 'Farmácia Vida', slug: 'farmacia-vida', description: 'Sua saúde em primeiro lugar. Medicamentos, suplementos e atendimento farmacêutico.', category: 'HEALTH', logo: '/images/pharmacy.jpg', coverImage: '/images/pharmacy.jpg', phone: '(91) 99999-0004', whatsapp: '(91) 99999-0004', address: 'Rua Pará, 789', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 0, freeDeliveryAbove: null, rating: 4.6, totalReviews: 89, opensAt: '07:00', closesAt: '22:00', openDays: '1,2,3,4,5,6,7' },
  { id: 's5', name: 'Padaria Pão Quente', slug: 'padaria-pao-quente', description: 'Pão fresquinho todo dia! Doces, salgados e muito mais.', category: 'FOOD', logo: '/images/bakery.jpg', coverImage: '/images/bakery.jpg', phone: '(91) 99999-0005', whatsapp: '(91) 99999-0005', address: 'Rua Amazonas, 321', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 3.00, freeDeliveryAbove: 25, rating: 4.8, totalReviews: 198, opensAt: '05:00', closesAt: '20:00', openDays: '1,2,3,4,5,6,7' },
  { id: 's6', name: 'Loja do Eletrônico', slug: 'loja-do-eletronico', description: 'Celulares, acessórios e eletrônicos com as melhores ofertas.', category: 'ELECTRONICS', logo: '/images/electronics.jpg', coverImage: '/images/electronics.jpg', phone: '(91) 99999-0006', whatsapp: '(91) 99999-0006', address: 'Rua Tocantins, 654', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 5.00, freeDeliveryAbove: 100, rating: 4.3, totalReviews: 45, opensAt: '08:00', closesAt: '20:00', openDays: '1,2,3,4,5,6' },
  { id: 's7', name: 'Pet Shop Amigo Fiel', slug: 'pet-shop-amigo-fiel', description: 'Tudo para seu melhor amigo. Rações, banho, tosa e acessórios.', category: 'ANIMALS', logo: '/images/pets.jpg', coverImage: '/images/pets.jpg', phone: '(91) 99999-0007', whatsapp: '(91) 99999-0007', address: 'Rua Maranhão, 987', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 4.00, freeDeliveryAbove: 80, rating: 4.7, totalReviews: 112, opensAt: '08:00', closesAt: '19:00', openDays: '1,2,3,4,5,6' },
  { id: 's8', name: 'Salão da Bella', slug: 'salao-da-bella', description: 'Beleza e bem-estar para mulheres e homens. Cortes, coloração e tratamentos.', category: 'BEAUTY', logo: '/images/beauty.jpg', coverImage: '/images/beauty.jpg', phone: '(91) 99999-0008', whatsapp: '(91) 99999-0008', address: 'Rua Ceará, 147', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 0, freeDeliveryAbove: null, rating: 4.9, totalReviews: 210, opensAt: '09:00', closesAt: '20:00', openDays: '1,2,3,4,5,6' },
]

const fallbackProducts: ProductData[] = [
  { id: 'p1', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: '/images/grocery.jpg', name: 'Arroz Tio João 5kg', slug: 'arroz-tio-joao', description: 'Arroz tipo 1 premium, ideal para o dia a dia da sua família.', price: 24.90, comparePrice: 29.90, images: '["/images/grocery.jpg"]', stock: 50, rating: 4.5, totalReviews: 23, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["5kg","1kg"]', category: 'FOOD', freeDeliveryAbove: 50, storeDeliveryFee: 5 },
  { id: 'p2', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: '/images/grocery.jpg', name: 'Feijão Carioca 1kg', slug: 'feijao-carioca', description: 'Feijão carioca selecionado de alta qualidade.', price: 8.90, comparePrice: null, images: '["/images/grocery.jpg"]', stock: 80, rating: 4.3, totalReviews: 15, isFeatured: false, isNew: false, isOffer: false, tags: '[]', variations: '["1kg","500g"]', category: 'FOOD', freeDeliveryAbove: 50, storeDeliveryFee: 5 },
  { id: 'p3', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: '/images/grocery.jpg', name: 'Óleo de Soja 900ml', slug: 'oleo-soja', description: 'Óleo de soja puro para cozinhar.', price: 7.49, comparePrice: 8.99, images: '["/images/grocery.jpg"]', stock: 40, rating: 4.1, totalReviews: 8, isFeatured: false, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'FOOD', freeDeliveryAbove: 50, storeDeliveryFee: 5 },
  { id: 'p5', storeId: 's2', storeName: 'Açaí da Boa', storeLogo: '/images/acai.jpg', name: 'Açaí 500ml', slug: 'acai-500ml', description: 'Açaí cremoso feito com frutas frescas do Pará. Acompanha granola e banana.', price: 15.00, comparePrice: 18.00, images: '["/images/acai.jpg"]', stock: 100, rating: 4.9, totalReviews: 89, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["300ml","500ml","700ml"]', category: 'FOOD', freeDeliveryAbove: 30, storeDeliveryFee: 3 },
  { id: 'p6', storeId: 's2', storeName: 'Açaí da Boa', storeLogo: '/images/acai.jpg', name: 'Açaí Premium 700ml', slug: 'acai-premium-700ml', description: 'Açaí premium com frutas da estação, leite condensado e granola artesanal.', price: 22.00, comparePrice: null, images: '["/images/acai.jpg"]', stock: 50, rating: 4.8, totalReviews: 45, isFeatured: true, isNew: true, isOffer: false, tags: '[]', variations: null, category: 'FOOD', freeDeliveryAbove: 30, storeDeliveryFee: 3 },
  { id: 'p9', storeId: 's3', storeName: 'Agropecuária São Paulo', storeLogo: '/images/agriculture.jpg', name: 'Adubo NPK 20kg', slug: 'adubo-npk', description: 'Adubo NPK para culturas diversas. Alta eficiência.', price: 89.90, comparePrice: null, images: '["/images/agriculture.jpg"]', stock: 25, rating: 4.4, totalReviews: 12, isFeatured: true, isNew: false, isOffer: false, tags: '[]', variations: null, category: 'AGRICULTURE', freeDeliveryAbove: 200, storeDeliveryFee: 8 },
  { id: 'p13', storeId: 's4', storeName: 'Farmácia Vida', storeLogo: '/images/pharmacy.jpg', name: 'Vitamina C 500mg', slug: 'vitamina-c', description: 'Suplemento de vitamina C 500mg. Pote com 60 cápsulas.', price: 35.00, comparePrice: 42.00, images: '["/images/pharmacy.jpg"]', stock: 100, rating: 4.7, totalReviews: 34, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["500mg","1000mg"]', category: 'HEALTH', freeDeliveryAbove: null, storeDeliveryFee: 0 },
  { id: 'p17', storeId: 's5', storeName: 'Padaria Pão Quente', storeLogo: '/images/bakery.jpg', name: 'Pão Francês (6 un)', slug: 'pao-frances', description: 'Pão francês fresquinho saindo do forno. Pacote com 6 unidades.', price: 6.00, comparePrice: null, images: '["/images/bakery.jpg"]', stock: 200, rating: 4.9, totalReviews: 120, isFeatured: true, isNew: false, isOffer: false, tags: '[]', variations: null, category: 'FOOD', freeDeliveryAbove: 25, storeDeliveryFee: 3 },
]

// Skeleton loading components
function HomeSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
      <div className="mt-4">
        <Skeleton className="w-full h-40 sm:h-52 rounded-2xl" />
      </div>
      <div className="mt-6">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-48 mt-2" />
      </div>
      <div className="mt-8">
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 min-w-[68px]">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <Skeleton className="w-14 h-3 rounded" />
            </div>
          ))}
        </div>
      </div>
      {[1, 2, 3].map((section) => (
        <div key={section} className="mt-8">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-40 sm:w-48 h-56 rounded-xl shrink-0" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ProductDetailView() {
  const { selectedProduct } = useAppStore()
  return (
    <motion.div key="product" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4">
      {selectedProduct ? (
        <ProductDetail product={selectedProduct} />
      ) : (
        <p className="text-center py-12 text-muted-foreground">Produto não encontrado</p>
      )}
    </motion.div>
  )
}

function StoreProfileView() {
  const { selectedStore } = useAppStore()
  return (
    <motion.div key="store" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4">
      {selectedStore ? (
        <StoreProfile store={selectedStore} />
      ) : (
        <p className="text-center py-12 text-muted-foreground">Loja não encontrada</p>
      )}
    </motion.div>
  )
}

function OrderDetailView() {
  return (
    <motion.div key="order-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <OrderDetail />
    </motion.div>
  )
}

// Floating compare button component
function CompareFloatingButton() {
  const { compareProductIds, navigate } = useAppStore()
  
  if (compareProductIds.length === 0) return null
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed bottom-24 md:bottom-6 right-4 z-50"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => navigate('product-comparison')}
            className="h-12 px-4 bg-gradient-to-r from-primary to-emerald-600 text-white hover:from-primary/90 hover:to-emerald-600/90 shadow-xl rounded-full gap-2"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <GitCompareArrows className="h-4 w-4" />
            </motion.div>
            <span className="text-sm font-semibold">Comparar</span>
            <motion.div
              key={compareProductIds.length}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="h-6 w-6 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold"
            >
              {compareProductIds.length}
            </motion.div>
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Favorites view component with filters, sorting, and grid/list toggle
function FavoritesView({ products, onShareClick }: { products: ProductData[]; onShareClick?: () => void }) {
  const { selectProduct, navigate } = useAppStore()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc' | 'rating'>('recent')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const setWishlistShareOpenFromParent = useAppStore((s: any) => s.setWishlistShareOpen) as ((v: boolean) => void) | undefined
  
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category))
    return Array.from(cats)
  }, [products])
  
  const filtered = useMemo(() => {
    let result = activeCategory ? products.filter(p => p.category === activeCategory) : products
    switch (sortBy) {
      case 'price_asc': return [...result].sort((a, b) => a.price - b.price)
      case 'price_desc': return [...result].sort((a, b) => b.price - a.price)
      case 'rating': return [...result].sort((a, b) => b.rating - a.rating)
      default: return result
    }
  }, [products, activeCategory, sortBy])
  
  const categoryLabels: Record<string, string> = {
    FOOD: 'Alimentação', HEALTH: 'Saúde', AGRICULTURE: 'Agricultura', ELECTRONICS: 'Eletrônicos',
    BEAUTY: 'Beleza', ANIMALS: 'Animais', FASHION: 'Moda', SERVICES: 'Serviços',
    HOME_GARDEN: 'Casa & Jardim', EDUCATION: 'Educação', SPORTS: 'Esportes', OTHER: 'Outros',
  }
  
  if (products.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="max-w-7xl mx-auto px-4 pt-4"
      >
        <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Favoritos
        </h1>
        {/* Empty state */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-red-100 to-rose-200 dark:from-red-900/20 dark:to-rose-800/20 flex items-center justify-center">
              <Heart className="h-12 w-12 text-red-300 dark:text-red-700" />
            </div>
            {/* Decorative orbiting ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-3 rounded-full border border-dashed border-red-200/50 dark:border-red-800/30"
            />
          </motion.div>
          <h2 className="text-lg font-bold mt-6">Nenhum favorito ainda</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            Toque no ❤️ em produtos e lojas para salvá-los aqui e encontrá-los rapidamente
          </p>
          <motion.div whileTap={{ scale: 0.95 }} className="mt-6">
            <Button 
              onClick={() => useAppStore.getState().navigate('home')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground btn-glow"
            >
              Explorar produtos
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 pt-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500 fill-red-500" />
          Favoritos
          <Badge variant="secondary" className="text-[10px] ml-1 bg-primary/5 text-primary border-0">
            {filtered.length}
          </Badge>
        </h1>
        <div className="flex items-center gap-1">
          {onShareClick && products.length > 0 && (
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 border-primary/30 hover:bg-primary/5"
                onClick={onShareClick}
              >
                <Share2 className="h-3.5 w-3.5 text-primary" />
                Compartilhar
              </Button>
            </motion.div>
          )}
          {/* Grid/List toggle */}
          <div className="flex bg-secondary/50 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          {/* Sort */}
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => {
            const order: Array<'recent' | 'price_asc' | 'price_desc' | 'rating'> = ['recent', 'price_asc', 'price_desc', 'rating']
            const idx = order.indexOf(sortBy)
            setSortBy(order[(idx + 1) % order.length])
          }}>
            <ArrowUpDown className="h-3 w-3" />
            {{ recent: 'Recentes', price_asc: 'Menor preço', price_desc: 'Maior preço', rating: 'Avaliação' }[sortBy]}
          </Button>
        </div>
      </div>

      {/* Category filter chips */}
      {categories.length > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 overflow-x-auto hide-scrollbar pb-3 mb-2"
        >
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              !activeCategory
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
            }`}
          >
            Todos ({products.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                cat === activeCategory
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {categoryLabels[cat] || cat} ({products.filter(p => p.category === cat).length})
            </button>
          ))}
        </motion.div>
      )}

      {/* Products grid or list */}
      {filtered.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => {
                  selectProduct(p)
                  navigate('product')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <span className="text-2xl">
                    {{ FOOD: '🍚', HEALTH: '💊', AGRICULTURE: '🌿', ELECTRONICS: '📱', BEAUTY: '💅', ANIMALS: '🐾' }[p.category] || '📦'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold line-clamp-1">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.storeName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}</span>
                    {p.comparePrice && p.comparePrice > p.price && (
                      <span className="text-[10px] text-muted-foreground line-through">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.comparePrice)}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-medium">Nenhum produto nesta categoria</p>
          <button 
            onClick={() => setActiveCategory(null)}
            className="text-sm text-primary hover:underline mt-1"
          >
            Ver todos os favoritos
          </button>
        </div>
      )}
    </motion.div>
  )
}

// LazySection: Intersection observer component for progressive content loading
function LazySection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  
  if (!isVisible) {
    return (
      <div ref={ref} className={className}>
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      </div>
    )
  }
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function Home() {
  const { currentView, isSearchOpen, activeCategory, getCartItemCount, currentUser } = useAppStore()
  const cartItemCount = getCartItemCount()

  // Analytics page view tracking
  usePageViewTracking()

  // Track homepage view
  useEffect(() => {
    trackEvent(AnalyticsEvents.HOMEPAGE_VIEW)
  }, [])

  // Dynamic page title based on cart count
  useEffect(() => {
    const baseTitle = 'DomPlace'
    document.title = cartItemCount > 0
      ? `${baseTitle} (${cartItemCount} ${cartItemCount === 1 ? 'item' : 'itens'})`
      : baseTitle
  }, [cartItemCount])
  const [quickViewProduct, setQuickViewProduct] = useQVState<ProductData | null>(null)
  const [quickViewOpen, setQuickViewOpen] = useQVState(false)
  const [wishlistShareOpen, setWishlistShareOpen] = useQVState(false)
  const [apiProducts, setApiProducts] = useState<ProductData[]>([])
  const [apiStores, setApiStores] = useState<StoreData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch from API on mount
  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [productsRes, storesRes] = await Promise.all([
          fetch('/api/products?limit=50'),
          fetch('/api/stores?limit=20'),
        ])
        const productsData = await productsRes.json()
        const storesData = await storesRes.json()
        if (!cancelled) {
          setApiProducts(productsData.products || [])
          setApiStores(storesData.stores || [])
        }
      } catch {
        // Use fallback data silently
        if (!cancelled) {
          setApiProducts([])
          setApiStores([])
        }
      }
      if (!cancelled) setIsLoading(false)
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  // Use API data or fallback
  const allProducts = apiProducts.length > 0 ? apiProducts : fallbackProducts
  const allStores = apiStores.length > 0 ? apiStores : fallbackStores

  // Filter by category
  const filteredProducts = useMemo(() => {
    if (!activeCategory) return allProducts
    return allProducts.filter(p => p.category === activeCategory)
  }, [allProducts, activeCategory])

  const filteredStores = useMemo(() => {
    if (!activeCategory) return allStores
    return allStores.filter(s => s.category === activeCategory)
  }, [allStores, activeCategory])

  // Carousels data
  const offerProducts = filteredProducts.filter(p => p.isOffer)
  const newProducts = filteredProducts.filter(p => p.isNew)
  const featuredProducts = filteredProducts.filter(p => p.isFeatured)
  const suggestedProducts = filteredProducts.slice(0, 8)
  
  return (
    <div className="min-h-screen pb-20 md:pb-4">
      {/* Cart Recovery Banner - shows above main content */}
      <CartRecoveryBanner />

      <AnimatePresence mode="wait">
        {isSearchOpen ? (
          <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SearchView />
          </motion.div>
        ) : currentView === 'home' ? (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <div className="flex gap-6">
              {/* Main content area */}
              <div className="flex-1 min-w-0">
                {isLoading ? (
                  <HomeSkeleton />
                ) : (
                  <>
                    {/* === PRIORITY 1: Always visible, no lazy loading === */}

                    {/* Urgency Strip — social proof ticker */}
                    <section className="-mx-3 sm:-mx-4 lg:-mx-6">
                      <UrgencyStrip />
                    </section>

                    {/* Hero */}
                    <section className="mt-2">
                      <HeroBanner banners={fallbackBanners} />
                    </section>

                    {/* Flash Sale */}
                    <section className="mt-4">
                      <FlashSale />
                    </section>

                    {/* Welcome greeting */}
                    <motion.section 
                      className="mt-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg sm:text-xl font-bold">
                            {getGreetingTitle(currentUser)}
                          </h2>
                          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            <span>Entregando em Dom Eliseu, PA</span>
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 ml-0.5" />
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          <span>3 lojas com ofertas novas</span>
                        </div>
                      </div>
                    </motion.section>
                    
                    {/* Categories - now filterable */}
                    <section className="mt-8">
                      <CategoryBar />
                    </section>

                    {/* Active category indicator */}
                    {activeCategory && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold">
                            Mostrando: {allProducts.filter(p => p.category === activeCategory).length} produtos em{' '}
                            {activeCategory.replace(/_/g, ' ')}
                          </h3>
                          <button 
                            onClick={() => useAppStore.getState().setActiveCategory(null)}
                            className="text-xs text-primary hover:underline"
                          >
                            Ver todos
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* === PRIORITY 2: Lazy loaded === */}

                    <Separator className="my-8 bg-border/50" />

                    {/* Offers of the Day */}
                    <LazySection>
                      {offerProducts.length > 0 && (
                        <section>
                          <ProductCarousel title="🔥 Ofertas do Dia" products={offerProducts} />
                        </section>
                      )}
                    </LazySection>

                    <Separator className="my-8 bg-border/50" />

                    {/* Featured Stores */}
                    <LazySection>
                      {filteredStores.length > 0 && (
                        <section>
                          <StoreCarousel title="🏪 Lojas em Destaque" stores={filteredStores} />
                        </section>
                      )}
                    </LazySection>

                    {/* === PRIORITY 3: Lazy loaded, below fold === */}

                    <Separator className="my-8 bg-border/50" />

                    {/* Weekend Specials */}
                    <LazySection>
                      <section className="mt-4">
                        <WeekendSpecials />
                      </section>
                    </LazySection>

                    <Separator className="my-8 bg-border/50" />

                    {/* Daily Deals */}
                    <LazySection>
                      <DailyDeals />
                    </LazySection>

                    <Separator className="my-8 bg-border/50" />

                    {/* Store Favorites Carousel */}
                    <LazySection>
                      <StoreFavorites stores={allStores} />
                    </LazySection>

                    <Separator className="my-8 bg-border/50" />

                    {/* New in City */}
                    <LazySection>
                      {newProducts.length > 0 && (
                        <section>
                          <ProductCarousel title="✨ Novidades na Cidade" products={newProducts} />
                        </section>
                      )}
                    </LazySection>

                    {/* === PRIORITY 4: Lazy loaded, bottom === */}

                    <Separator className="my-8 bg-border/50" />

                    {/* Store Search */}
                    <LazySection>
                      <section>
                        <StoreSearch stores={filteredStores} />
                      </section>
                    </LazySection>

                    <Separator className="my-8 bg-border/50" />

                    {/* Delivery Fee Calculator */}
                    <LazySection>
                      <DeliveryFeeCalculator />
                    </LazySection>

                    <Separator className="my-8 bg-border/50" />

                    {/* Smart Suggestions (AI) */}
                    <LazySection>
                      <SmartSuggestions />
                    </LazySection>

                    <Separator className="my-8 bg-border/50" />

                    {/* Suggestions */}
                    <LazySection>
                      {suggestedProducts.length > 0 && (
                        <section>
                          <ProductCarousel title="💡 Sugestões para Você" products={suggestedProducts} />
                        </section>
                      )}
                    </LazySection>

                    <Separator className="my-8 bg-border/50" />

                    {/* Map Store Locator */}
                    <LazySection>
                      <MapStoreLocator stores={allStores} />
                    </LazySection>

                    <Separator className="my-8 bg-border/50" />

                    {/* Partners */}
                    <LazySection>
                      <section>
                        <PartnersBanner />
                      </section>
                    </LazySection>

                    <Separator className="my-8 bg-border/50" />
                    
                    {/* Segmented Ads */}
                    <LazySection>
                      {filteredProducts.filter(p => p.storeId === 's2' || p.storeId === 's5').length > 0 && (
                        <section>
                          <ProductCarousel 
                            title="📢 Anúncios Segmentados" 
                            products={filteredProducts.filter(p => p.storeId === 's2' || p.storeId === 's5')} 
                          />
                        </section>
                      )}
                    </LazySection>

                    <Separator className="my-8 bg-border/50" />

                    {/* Store Comparison CTA */}
                    <LazySection>
                      <section>
                        <div className="bg-gradient-to-r from-primary/5 to-emerald-50 dark:from-primary/10 dark:to-emerald-900/10 rounded-2xl p-4 border border-primary/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                                <GitCompareArrows className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold">Comparar Lojas</h3>
                                <p className="text-xs text-muted-foreground">Compare precos e avaliacoes lado a lado</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-primary/30 hover:bg-primary/5 text-primary h-9"
                              onClick={() => useAppStore.getState().navigate('store-comparison')}
                            >
                              Comparar
                            </Button>
                          </div>
                        </div>
                      </section>
                    </LazySection>
                  </>
                )}
                
                <div className="h-4" />
              </div>

              {/* Desktop sidebar - Quick Info panel */}
              <QuickInfo />
            </div>
          </motion.div>
        ) : currentView === 'product' ? (
          <ProductDetailView />
        ) : currentView === 'store' ? (
          <StoreProfileView />
        ) : currentView === 'cart' ? (
          <motion.div key="cart" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <CartView />
          </motion.div>
        ) : currentView === 'checkout' ? (
          <motion.div key="checkout" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4">
            <CheckoutView />
          </motion.div>
        ) : currentView === 'orders' ? (
          <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <OrdersView />
          </motion.div>
        ) : currentView === 'order-detail' ? (
          <OrderDetailView />
        ) : currentView === 'profile' ? (
          <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <ProfileView />
          </motion.div>
        ) : currentView === 'store-dashboard' ? (
          <motion.div key="store-dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <StoreDashboard />
          </motion.div>
        ) : currentView === 'shopping-lists' ? (
          <motion.div key="shopping-lists" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <ShoppingLists />
          </motion.div>
        ) : currentView === 'product-comparison' ? (
          <motion.div key="product-comparison" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <ProductComparison />
          </motion.div>
        ) : currentView === 'admin-dashboard' ? (
          <motion.div key="admin-dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <AdminDashboard />
          </motion.div>
        ) : currentView === 'notifications' ? (
          <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <NotificationsPage />
          </motion.div>
        ) : currentView === 'support-center' ? (
          <motion.div key="support-center" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <SupportCenter />
          </motion.div>
        ) : currentView === 'driver-dashboard' ? (
          <motion.div key="driver-dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <DriverDashboard />
          </motion.div>
        ) : currentView === 'affiliate-dashboard' ? (
          <motion.div key="affiliate-dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <AffiliateDashboard />
          </motion.div>
        ) : currentView === 'favorites' ? (
          <FavoritesView products={featuredProducts} onShareClick={() => setWishlistShareOpen(true)} />
        ) : currentView === 'store-comparison' ? (
          <motion.div key="store-comparison" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4">
            <div className="max-w-3xl mx-auto pt-4 pb-8">
              <div className="flex items-center gap-3 mb-4">
                <Button variant="ghost" size="icon" onClick={() => useAppStore.getState().goBack()} className="h-10 w-10">
                  <ChevronRight className="h-5 w-5 rotate-180" />
                </Button>
                <h1 className="text-lg font-bold">Comparar Lojas</h1>
              </div>
              <StoreComparison stores={allStores.slice(0, 3)} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Auth Modal - always rendered */}
      <AuthModal />

      {/* Welcome Modal - shows on first visit */}
      <WelcomeModal />

      {/* AI Chat Bot - always mounted, floating */}
      <AIChatBot />

      {/* Cookie Consent Banner - shows on first visit */}
      <CookieConsent />

      {/* Floating Compare Button */}
      <CompareFloatingButton />

      {/* Product Quick View Modal */}
      <ProductQuickView product={quickViewProduct} open={quickViewOpen} onClose={() => setQuickViewOpen(false)} />

      {/* Product Quick Add Bottom Sheet */}
      <ProductQuickAdd />

      {/* Neighborhood Selector Bottom Sheet */}
      <NeighborhoodSelector />

      {/* Wishlist Share Modal */}
      <WishlistShare
        items={featuredProducts.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          storeName: p.storeName || 'Loja',
          category: p.category,
        }))}
        open={wishlistShareOpen}
        onOpenChange={setWishlistShareOpen}
      />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  )
}
