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
import { DeliveryScheduler } from '@/components/checkout/DeliveryScheduler'
import { OrdersView, OrderDetail } from '@/components/orders/OrdersView'
import { ProfileView } from '@/components/profile/ProfileView'
import { StoreDashboard } from '@/components/dashboard/StoreDashboard'
import { AuthModal } from '@/components/auth/AuthModal'
import { WelcomeModal } from '@/components/onboarding/WelcomeModal'
import { AIChatBot } from '@/components/chat/AIChatBot'
import { CookieConsent } from '@/components/layout/CookieConsent'
import { ViewTransition } from '@/components/layout/ViewTransition'
import { SectionDivider } from '@/components/layout/SectionDivider'
import { QuickInfo } from '@/components/home/QuickInfo'
import { FlashSale } from '@/components/home/FlashSale'
import { CityNews } from '@/components/home/CityNews'
import { WeekendSpecials } from '@/components/home/WeekendSpecials'
import { StoreComparison } from '@/components/home/StoreComparison'
import { ProductComparison } from '@/components/product/ProductComparison'
import { OrderMap } from '@/components/orders/OrderMap'
import { NotificationsPage } from '@/components/notifications/NotificationsPage'
import { AdminDashboard } from '@/components/dashboard/AdminDashboard'
import { SmartSuggestions } from '@/components/home/SmartSuggestions'
import { RecentOrders } from '@/components/home/RecentOrders'
import { FeedActivity } from '@/components/home/FeedActivity'
import { NeighborhoodFeed } from '@/components/home/NeighborhoodFeed'
import { StoreReviews } from '@/components/home/StoreReviews'
import { RecipeSuggestions } from '@/components/home/RecipeSuggestions'
import { CommunityHighlights } from '@/components/home/CommunityHighlights'
import { RecentlyViewed } from '@/components/product/RecentlyViewed'
import { ProductBattle } from '@/components/home/ProductBattle'
import { RecentlyViewedHome } from '@/components/home/RecentlyViewed'
import { SupportCenter } from '@/components/support/SupportCenter'
import { ProductQuickView } from '@/components/product/ProductQuickView'
import { StoreQuickView } from '@/components/store/StoreQuickView'
import { PriceDropTicker } from '@/components/home/PriceDropTicker'
import { DealOfTheDay } from '@/components/home/DealOfTheDay'
import { StoreSearch } from '@/components/home/StoreSearch'
import { LoyaltyTier } from '@/components/profile/LoyaltyTier'
import { LoyaltyWidget } from '@/components/home/LoyaltyWidget'
import { ShoppingTimeline } from '@/components/home/ShoppingTimeline'
import { LiveDropAlert } from '@/components/home/LiveDropAlert'
import { BudgetPlanner } from '@/components/home/BudgetPlanner'
import { WishlistShare } from '@/components/profile/WishlistShare'
import { StoreFavorites } from '@/components/home/StoreFavorites'
// FavoritesView defined locally below
import { OrderTimeline as ProfileOrderTimeline } from '@/components/profile/OrderTimeline'
import { OrderTimeline } from '@/components/orders/OrderTimeline'
import { OrderRatingPrompt } from '@/components/orders/OrderRatingPrompt'
import { SpinWheel } from '@/components/promotions/SpinWheel'
import { DailyRewards as PromotionsDailyRewards } from '@/components/promotions/DailyRewards'
import { DailyRewards } from '@/components/home/DailyRewards'
import { StoreDirectory } from '@/components/store/StoreDirectory'
import { MapStoreLocator } from '@/components/home/MapStoreLocator'
import { DailyDeals } from '@/components/home/DailyDeals'
import { PromoBanner } from '@/components/home/PromoBanner'
import { TopRatedPicks } from '@/components/home/TopRatedPicks'
import { GiftGuide } from '@/components/home/GiftGuide'
import { WeatherWidget } from '@/components/home/WeatherWidget'
import { ComboBuilder } from '@/components/home/ComboBuilder'
import { ProductBundlesSlider } from '@/components/product/ProductBundlesSlider'
import { DeliveryFeeCalculator } from '@/components/home/DeliveryFeeCalculator'
import { NeighborhoodSelector } from '@/components/home/NeighborhoodSelector'
import { ProductQuickAdd } from '@/components/product/ProductQuickAdd'
import { UrgencyStrip } from '@/components/home/UrgencyStrip'
import { DriverDashboard } from '@/components/driver/DriverDashboard'
import { AffiliateDashboard } from '@/components/affiliate/AffiliateDashboard'
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt'
import { StoreOpenStatus } from '@/components/home/StoreOpenStatus'
import { FlashCoupon } from '@/components/home/FlashCoupon'
import { TrendingCategories } from '@/components/home/TrendingCategories'
import { BrandSpotlight } from '@/components/home/BrandSpotlight'
import { CommunityEvents } from '@/components/home/CommunityEvents'
import { WeeklySpecials } from '@/components/home/WeeklySpecials'
import { CustomerReviewsHighlight } from '@/components/home/CustomerReviewsHighlight'
import { QuickAddDrawer } from '@/components/home/QuickAddDrawer'
import { StoreRatingsOverview } from '@/components/home/StoreRatingsOverview'
import { ProductLaunchCountdown } from '@/components/home/ProductLaunchCountdown'
import { CompareProductsCTA } from '@/components/home/CompareProductsCTA'
import { PriceDropAlerts } from '@/components/home/PriceDropAlerts'
import { CommunityPoll } from '@/components/home/CommunityPoll'
import { InteractiveGameZone } from '@/components/home/InteractiveGameZone'
import { ServiceDirectory } from '@/components/home/ServiceDirectory'
import { DomEliseuStories } from '@/components/home/DomEliseuStories'
import { StoreSubscriptionBox } from '@/components/home/StoreSubscriptionBox'
import { LiveOrderMap } from '@/components/home/LiveOrderMap'
import { ExpressDeliveryHub } from '@/components/home/ExpressDeliveryHub'
import { NeighborhoodMarketplace } from '@/components/home/NeighborhoodMarketplace'
import { LocalProducers } from '@/components/home/LocalProducers'
import { EcoImpactTracker } from '@/components/home/EcoImpactTracker'
import { StoreEvents } from '@/components/home/StoreEvents'
import { CommunityChallenge } from '@/components/home/CommunityChallenge'
import { ProductWishTracker } from '@/components/home/ProductWishTracker'
import { StoreAnalytics } from '@/components/store/StoreAnalytics'
import { GroupOrderCreator } from '@/components/home/GroupOrderCreator'
import { LiveStreamingWidget } from '@/components/home/LiveStreamingWidget'
import { DynamicPricingAlerts } from '@/components/home/DynamicPricingAlerts'
import { StoreEventCalendar } from '@/components/store/StoreEventCalendar'
import { ReviewSentimentAI } from '@/components/home/ReviewSentimentAI'
import { StoreMembershipTiers } from '@/components/store/StoreMembershipTiers'
import { InfluencerShopPage } from '@/components/home/InfluencerShopPage'
import { EcoImpactDashboard } from '@/components/home/EcoImpactDashboard'
import { PriceComparisonBot } from '@/components/home/PriceComparisonBot'
import { ProductScanSearch } from '@/components/product/ProductScanSearch'
import { ARProductTryOn2 } from '@/components/product/ARProductTryOn2'
import { ProductWishlistShare2 } from '@/components/product/ProductWishlistShare2'
import { SocialCommerceFeed } from '@/components/home/SocialCommerceFeed'
import { OrderRatingSystem } from '@/components/orders/OrderRatingSystem'
import { DeliveryDriverTracking } from '@/components/delivery/DeliveryDriverTracking'
import { InvoiceGenerator } from '@/components/checkout/InvoiceGenerator'
import { NeighborhoodEvents2 } from '@/components/home/NeighborhoodEvents2'
import { ProductOriginTracker2 } from '@/components/product/ProductOriginTracker2'
import { SupportTicketSystem } from '@/components/support/SupportTicketSystem'
import { OrderSummaryReceipt } from '@/components/orders/OrderSummaryReceipt'
import { RealTimeDealsTicker } from '@/components/home/RealTimeDealsTicker'
import { AIStyleAdvisor } from '@/components/product/AIStyleAdvisor'
import { SmartShoppingAssistant } from '@/components/chat/SmartShoppingAssistant'
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
import { ScrollReveal } from '@/lib/use-scroll-reveal'
import { FloatingParticles } from '@/components/effects/FloatingParticles'
import { TextScramble } from '@/components/effects/TextScramble'
import { cachedFetch } from '@/lib/api-cache'

// Module-level BRL currency formatter
const formatBRL = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

// Dynamic time-based greeting helpers
function getGreeting(): { text: string; emoji: string; period: string } {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return { text: 'Bom dia', emoji: '☀️', period: 'manhã' }
  if (hour >= 12 && hour < 18) return { text: 'Boa tarde', emoji: '🌤️', period: 'tarde' }
  return { text: 'Boa noite', emoji: '🌙', period: 'noite' }
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
    <ViewTransition viewKey="product" className="px-4">
      {selectedProduct ? (
        <ProductDetail product={selectedProduct} />
      ) : (
        <p className="text-center py-12 text-muted-foreground">Produto não encontrado</p>
      )}
    </ViewTransition>
  )
}

function StoreProfileView() {
  const { selectedStore } = useAppStore()
  return (
    <ViewTransition viewKey="store" className="px-4">
      {selectedStore ? (
        <StoreProfile store={selectedStore} />
      ) : (
        <p className="text-center py-12 text-muted-foreground">Loja não encontrada</p>
      )}
    </ViewTransition>
  )
}

function OrderDetailView() {
  return (
    <ViewTransition viewKey="order-detail">
      <OrderDetail />
      <div className="mt-6">
        <OrderSummaryReceipt />
      </div>
    </ViewTransition>
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
  const [unfavoritingId, setUnfavoritingId] = useState<string | null>(null)
  
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
        {/* Empty state with animated floating hearts */ }
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="relative">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-red-100 to-rose-200 dark:from-red-900/20 dark:to-rose-800/20 flex items-center justify-center">
                <Heart className="h-12 w-12 text-red-300 dark:text-red-700" />
              </div>
            </motion.div>
            {/* Animated floating hearts */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute pointer-events-none"
                style={{ left: `${20 + i * 18}%`, top: `${10 + (i % 3) * 25}%` }}
                animate={{
                  y: [0, -40, -80],
                  opacity: [0, 0.7, 0],
                  scale: [0.5, 1, 0.8],
                  rotate: [0, i * 30, i * 60],
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.6,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: 'easeOut',
                }}
              >
                <Heart className="text-red-300/60 dark:text-red-600/40" style={{ width: 12 + i * 2, height: 12 + i * 2 }} fill="currentColor" />
              </motion.div>
            ))}
            {/* Decorative orbiting ring */ }
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-3 rounded-full border border-dashed border-red-200/50 dark:border-red-800/30"
            />
          </div>
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
          <motion.span
            key={filtered.length}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="ml-1 inline-flex"
          >
            <Badge variant="secondary" className="text-[10px] bg-gradient-to-r from-red-500/10 to-pink-500/10 text-red-500 border-red-500/20 font-bold">
              {filtered.length}
            </Badge>
          </motion.span>
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

      {/* Category filter chips with shimmer */}
      {categories.length > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 overflow-x-auto hide-scrollbar pb-3 mb-2"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all relative overflow-hidden ${
              !activeCategory
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
            }`}
          >
            {!activeCategory && (
              <motion.span
                className="absolute inset-0 rounded-full"
                animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', backgroundSize: '200% 100%' }}
              />
            )}
            <span className="relative z-10">Todos ({products.length})</span>
          </motion.button>
          {categories.map((cat, i) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 + i * 0.04 }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all relative overflow-hidden ${
                cat === activeCategory
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {cat === activeCategory && (
                <motion.span
                  className="absolute inset-0 rounded-full"
                  animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', backgroundSize: '200% 100%' }}
                />
              )}
              <span className="relative z-10">{categoryLabels[cat] || cat} ({products.filter(p => p.category === cat).length})</span>
            </motion.button>
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
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.05, type: 'spring' as const, stiffness: 300, damping: 25 }}
                whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
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
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, type: 'spring' as const, stiffness: 300, damping: 25 }}
                whileHover={{ y: -3, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
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
                    <span className="text-sm font-bold text-primary">{formatBRL(p.price)}</span>
                    {p.comparePrice && p.comparePrice > p.price && (
                      <span className="text-[10px] text-muted-foreground line-through">{formatBRL(p.comparePrice)}</span>
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

// Zustand-backed Quick View wrapper
function ZustandQuickView() {
  const { quickViewProduct, isQuickViewOpen, closeQuickView } = useAppStore()
  return (
    <ProductQuickView
      product={quickViewProduct}
      open={isQuickViewOpen}
      onClose={closeQuickView}
    />
  )
}

// Store Quick View wrapper
function StoreQuickViewWrapper() {
  return <StoreQuickView />
}

export default function Home() {
  const { currentView, isSearchOpen, activeCategory, cartItems, currentUser } = useAppStore()
  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0)

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
        const [productsData, storesData] = await Promise.all([
          cachedFetch('/api/products?limit=50'),
          cachedFetch('/api/stores?limit=20'),
        ])
        if (!cancelled) {
          setApiProducts(productsData.products || [])
          setApiStores(storesData.stores || [])
        }
      } catch (error) {
        console.error('Error loading data:', error)
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
  const offerProducts = useMemo(() => filteredProducts.filter(p => p.isOffer), [filteredProducts])
  const newProducts = useMemo(() => filteredProducts.filter(p => p.isNew), [filteredProducts])
  const featuredProducts = useMemo(() => filteredProducts.filter(p => p.isFeatured), [filteredProducts])
  // Note: SmartSuggestions component handles suggestions; no need for a separate carousel
  
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
                      <HeroBanner banners={fallbackBanners} storeCount={allStores.length} productCount={allProducts.length} />
                    </section>

                    {/* Histórias de Dom Eliseu */}
                    <LazySection className="mt-3">
                      <DomEliseuStories />
                    </LazySection>

                    {/* Promo Banner — rotating campaigns with coupon codes */}
                    <section className="mt-4">
                      <PromoBanner />
                    </section>

                    {/* Weather Widget */}
                    <section className="mt-3">
                      <WeatherWidget />
                    </section>

                    {/* Price Drop Ticker */}
                    <section className="mt-3 rounded-xl overflow-hidden">
                      <PriceDropTicker />
                    </section>

                    {/* Animated Section Divider */}
                    <div className="mt-2">
                      <SectionDivider variant="bottom" />
                    </div>

                    {/* Flash Sale */}
                    <ScrollReveal>
                      <section className="mt-4">
                        <FlashSale />
                      </section>
                    </ScrollReveal>

                    {/* Deal of the Day — Oferta do Dia */}
                    <ScrollReveal>
                      <section className="mt-4">
                        <DealOfTheDay />
                      </section>
                    </ScrollReveal>

                    {/* Live Drop Alert — Ao Vivo: Novos Produtos */}
                    <LazySection>
                      <ScrollReveal delay={0.1}>
                        <section className="mt-4">
                          <LiveDropAlert />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Daily Rewards - Enhanced Gamification */}
                    <section className="mt-4">
                      <DailyRewards />
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
                            <TextScramble
                              text={`${getGreeting().text}, ${currentUser?.name || 'Visitante'}!`}
                              speed={40}
                              triggerOnView={false}
                              className="font-bold"
                            />
                            <span className="inline-block animate-bounce ml-1">{getGreeting().emoji}</span>
                          </h2>
                          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            <span className="shimmer-text font-medium">Entregando em Dom Eliseu, PA</span>
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 ml-0.5" />
                          </div>
                        </div>
                        {offerProducts.length > 0 && (
                          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                            <Sparkles className="h-4 w-4 text-amber-500" />
                            <span>{offerProducts.length} {offerProducts.length === 1 ? 'oferta ativa' : 'ofertas ativas'}</span>
                          </div>
                        )}
                      </div>
                    </motion.section>
                    
                    {/* Categories - now filterable */}
                    <section className="mt-8">
                      <CategoryBar />
                    </section>

                    {/* Store Open Status — live open/closed widget */}
                    <LazySection>
                      <ScrollReveal delay={0.1}>
                        <section className="mt-6">
                          <StoreOpenStatus />
                        </section>
                      </ScrollReveal>
                    </LazySection>

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
                            Mostrando: {filteredProducts.length} produtos em{' '}
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
                    <div className="mt-8">

                    {/* Featured Stores */}
                    {filteredStores.length > 0 && (
                      <LazySection>
                        <ScrollReveal delay={0.2}>
                          <div className="relative">
                            <FloatingParticles count={6} color="oklch(0.78 0.16 70)" maxSize={3} className="opacity-40" />
                            <section className="mt-8">
                              <StoreCarousel title="🏪 Lojas em Destaque" stores={filteredStores} />
                            </section>
                          </div>
                        </ScrollReveal>
                      </LazySection>
                    )}

                    {/* Product Battle — Qual é o Melhor? */}
                    <LazySection>
                      <ScrollReveal delay={0.2}>
                        <section className="mt-4">
                          <ProductBattle />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* === PRIORITY 3: Lazy loaded, below fold === */}

                    {/* Programa de Fidelidade */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section>
                          <h3 className="text-lg font-bold mb-4 gradient-text-animated">
                            🏆 Programa de Fidelidade
                          </h3>
                          <LoyaltyTier />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Loyalty Rewards Widget */}
                    <LazySection>
                      <ScrollReveal delay={0.1}>
                        <section>
                          <LoyaltyWidget />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Shopping Timeline — Journey milestones */}
                    <LazySection>
                      <ScrollReveal delay={0.1}>
                        <section className="mt-6">
                          <ShoppingTimeline />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Budget Planner — Planejador de Orçamento */}
                    <LazySection>
                      <ScrollReveal delay={0.1}>
                        <section className="mt-6">
                          <BudgetPlanner />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Brand Spotlight — Featured Store Carousel */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <BrandSpotlight />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Flash Coupons — gamified coupon collection */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <FlashCoupon />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Community Events — Local Events Calendar */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <CommunityEvents />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Weekly Specials — Day-of-Week Deals */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <WeeklySpecials />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Customer Reviews Highlight */}
                    <LazySection>
                      <ScrollReveal delay={0.2}>
                        <section>
                          <CustomerReviewsHighlight />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Weekend Specials */}
                    <LazySection>
                      <ScrollReveal delay={0.25}>
                        <section>
                          <WeekendSpecials />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Daily Deals */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <DailyDeals />
                      </ScrollReveal>
                    </LazySection>

                    {/* Price Drop Alerts */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <PriceDropAlerts />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Trending Categories */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <TrendingCategories />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Top Rated Picks */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <TopRatedPicks />
                      </ScrollReveal>
                    </LazySection>

                    {/* Combo Builder */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <ComboBuilder />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Product Bundles Slider — Combos Imperdíveis */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <ProductBundlesSlider />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Store Favorites Carousel */}
                    <LazySection>
                      <StoreFavorites stores={allStores} />
                    </LazySection>

                    {/* Product Launch Countdown */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <ProductLaunchCountdown />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Compare Products CTA */}
                    <LazySection>
                      <ScrollReveal delay={0.1}>
                        <section>
                          <CompareProductsCTA />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* New in City */}
                    {newProducts.length > 0 && (
                      <LazySection>
                        <section>
                          <ProductCarousel title="✨ Novidades na Cidade" products={newProducts} />
                        </section>
                      </LazySection>
                    )}

                    {/* === PRIORITY 4: Lazy loaded, bottom === */}

                    {/* Store Search */}
                    <LazySection>
                      <section>
                        <StoreSearch stores={filteredStores} />
                      </section>
                    </LazySection>

                    {/* Delivery Fee Calculator */}
                    <LazySection>
                      <DeliveryFeeCalculator />
                    </LazySection>

                    {/* Smart Suggestions (AI) */}
                    <LazySection>
                      <ScrollReveal delay={0.1}>
                        <div className="relative">
                          <FloatingParticles count={8} color="oklch(0.45 0.1 155)" maxSize={3} className="opacity-60" />
                          <SmartSuggestions />
                        </div>
                      </ScrollReveal>
                    </LazySection>

                    {/* Map Store Locator */}
                    <LazySection>
                      <MapStoreLocator stores={allStores} />
                    </LazySection>

                    {/* Partners */}
                    <LazySection>
                      <section>
                        <PartnersBanner />
                      </section>
                    </LazySection>

                    {/* City News */}
                    <LazySection>
                      <section>
                        <CityNews />
                      </section>
                    </LazySection>

                    {/* Recent Orders */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section>
                          <RecentOrders />
                        </section>
                      </ScrollReveal>
                    </LazySection>
                    
                    {/* Segmented Ads */}
                    {filteredProducts.filter(p => p.isOffer).length > 0 && (
                      <LazySection>
                        <section>
                          <ProductCarousel 
                            title="📢 Anúncios Segmentados" 
                            products={filteredProducts.filter(p => p.isOffer)} 
                          />
                        </section>
                      </LazySection>
                    )}

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

                    {/* Product Comparison CTA */}
                    <LazySection>
                      <section>
                        <div className="bg-gradient-to-r from-emerald-500/5 to-primary/5 dark:from-emerald-500/10 dark:to-primary/10 rounded-2xl p-4 border border-emerald-500/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-primary flex items-center justify-center shadow-sm">
                                <GitCompareArrows className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold">Comparar Produtos</h3>
                                <p className="text-xs text-muted-foreground">Compare até 4 produtos lado a lado</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-emerald-500/30 hover:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 h-9"
                              onClick={() => useAppStore.getState().navigate('product-comparison')}
                            >
                              Comparar
                            </Button>
                          </div>
                        </div>
                      </section>
                    </LazySection>

                    {/* Community Highlights */}
                    <LazySection>
                      <ScrollReveal delay={0.3}>
                        <section>
                          <CommunityHighlights />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Community Poll */}
                    <LazySection>
                      <ScrollReveal delay={0.3}>
                        <section className="mt-6">
                          <CommunityPoll />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Interactive Game Zone — Zona de Jogos */}
                    <LazySection>
                      <ScrollReveal delay={0.3}>
                        <section className="mt-6">
                          <InteractiveGameZone />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Live Order Map — Acompanhe ao Vivo */}
                    <LazySection>
                      <ScrollReveal delay={0.3}>
                        <section className="mt-6">
                          <LiveOrderMap />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Express Delivery Hub — Entrega Expressa */}
                    <LazySection>
                      <ScrollReveal delay={0.3}>
                        <section className="mt-6">
                          <ExpressDeliveryHub />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Service Directory — Serviços Locais */}
                    <LazySection>
                      <ScrollReveal delay={0.3}>
                        <section className="mt-6">
                          <ServiceDirectory />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Store Subscription Box — Caixa de Assinatura */}
                    <LazySection>
                      <ScrollReveal delay={0.3}>
                        <section className="mt-6">
                          <StoreSubscriptionBox />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Neighborhood Marketplace — Vizinhos Vendem */}
                    <LazySection>
                      <ScrollReveal delay={0.3}>
                        <section className="mt-6">
                          <NeighborhoodMarketplace />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Local Producers — Produtores Locais */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <LocalProducers />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Neighborhood Feed */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <EcoImpactTracker />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Store Events Calendar */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <StoreEvents />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Community Challenges */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <CommunityChallenge />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Product Wish Tracker */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <ProductWishTracker />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Store Analytics */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <StoreAnalytics />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Group Orders */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <GroupOrderCreator />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Live Streaming */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <LiveStreamingWidget />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Dynamic Pricing Alerts */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <DynamicPricingAlerts />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Store Event Calendar */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <StoreEventCalendar />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Review Sentiment AI */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <ReviewSentimentAI />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Store Membership Tiers */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <StoreMembershipTiers />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Real Time Deals Ticker */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <RealTimeDealsTicker />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Influencer Shop Page */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <InfluencerShopPage />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Eco Impact Dashboard */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <EcoImpactDashboard />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Price Comparison Bot */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <PriceComparisonBot />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Product Scan Search */}
                    <LazySection>
                      <ScrollReveal delay={0.15}>
                        <section className="mt-6">
                          <ProductScanSearch />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* AR Product Try-On 2 */}
                    <LazySection>
                      <ScrollReveal delay={0.2}>
                        <section className="mt-6">
                          <ARProductTryOn2 />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Social Commerce Feed */}
                    <LazySection>
                      <ScrollReveal delay={0.25}>
                        <section>
                          <SocialCommerceFeed />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Order Rating System */}
                    <LazySection>
                      <ScrollReveal delay={0.3}>
                        <section className="mt-6">
                          <OrderRatingSystem />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Product Wishlist Share */}
                    <LazySection>
                      <ScrollReveal delay={0.35}>
                        <section className="mt-6">
                          <ProductWishlistShare2 />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Delivery Driver Tracking */}
                    <LazySection>
                      <ScrollReveal delay={0.4}>
                        <section className="mt-6">
                          <DeliveryDriverTracking />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Invoice Generator */}
                    <LazySection>
                      <ScrollReveal delay={0.45}>
                        <section className="mt-6">
                          <InvoiceGenerator invoice={{
                            invoiceNumber: `DOM-${new Date().getFullYear()}-${String(42).padStart(4, '0')}`,
                            date: new Date().toISOString(),
                            dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
                            status: 'paga' as const,
                            store: { name: 'Supermercado Bom Preço', cnpj: '12.345.678/0001-90', address: 'Rua Principal, 123 - Centro, Dom Eliseu-PA', phone: '(91) 99999-0000', email: 'contato@bompreco.com' },
                            customer: { name: 'Maria Silva', cpf: '123.456.789-00', address: 'Rua das Flores, 456 - Dom Eliseu-PA', email: 'maria@email.com', phone: '(91) 98888-1111' },
                            items: [
                              { id: 'i1', productName: 'Arroz 5kg', quantity: 2, unitPrice: 24.9, discount: 5 },
                              { id: 'i2', productName: 'Feijão 1kg', quantity: 1, unitPrice: 12.5, discount: 0 },
                              { id: 'i3', productName: 'Óleo de Soja 900ml', quantity: 1, unitPrice: 8.9, discount: 0 },
                            ],
                            subtotal: 71.20,
                            tax: { icms: 8.54, iss: 1.78, ipi: 0 },
                            discount: 3.56,
                            shipping: 5.00,
                            total: 72.64,
                            payment: { method: 'credit', cardBrand: 'visa', lastFour: '4242', installmentCount: 3 },
                            timeline: { issued: new Date().toISOString(), viewed: new Date(Date.now() - 3600000).toISOString(), paid: new Date(Date.now() - 1800000).toISOString() },
                          }} />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Neighborhood Events 2 */}
                    <LazySection>
                      <ScrollReveal delay={0.5}>
                        <section className="mt-6">
                          <NeighborhoodEvents2 />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Product Origin Tracker 2 */}
                    <LazySection>
                      <ScrollReveal delay={0.55}>
                        <section className="mt-6">
                          <ProductOriginTracker2 />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Neighborhood Feed */}
                    <LazySection>
                      <ScrollReveal delay={0.3}>
                        <section>
                          <NeighborhoodFeed />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Store Reviews */}
                    <LazySection>
                      <ScrollReveal delay={0.3}>
                        <section>
                          <StoreReviews />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Store Ratings Overview */}
                    <LazySection>
                      <ScrollReveal delay={0.3}>
                        <section>
                          <StoreRatingsOverview />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Recipe Suggestions */}
                    <LazySection>
                      <ScrollReveal delay={0.3}>
                        <section>
                          <RecipeSuggestions />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Recently Viewed */}
                    <LazySection>
                      <ScrollReveal delay={0.3}>
                        <section>
                          <RecentlyViewed />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Recently Viewed Home (Enhanced) */}
                    <LazySection>
                      <ScrollReveal delay={0.3}>
                        <section>
                          <RecentlyViewedHome />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Feed Activity */}
                    <LazySection>
                      <ScrollReveal delay={0.3}>
                        <section>
                          <FeedActivity />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    {/* Gift Guide */}
                    <LazySection>
                      <ScrollReveal delay={0.3}>
                        <section>
                          <GiftGuide />
                        </section>
                      </ScrollReveal>
                    </LazySection>

                    </div>
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
        ) : currentView === 'stores' ? (
          <motion.div key="stores" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-7xl mx-auto px-4 pt-4 pb-8">
            <StoreDirectory stores={allStores} />
          </motion.div>
        ) : currentView === 'store' ? (
          <StoreProfileView />
        ) : currentView === 'cart' ? (
          <ViewTransition viewKey="cart">
            <CartView />
          </ViewTransition>
        ) : currentView === 'checkout' ? (
          <motion.div key="checkout" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 max-w-3xl mx-auto">
            <CheckoutView />
            <div className="mt-6">
              <DeliveryScheduler />
            </div>
          </motion.div>
        ) : currentView === 'orders' ? (
          <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <OrdersView />
          </motion.div>
        ) : currentView === 'order-detail' ? (
          <OrderDetailView />
        ) : currentView === 'profile' ? (
          <ViewTransition viewKey="profile">
            <ProfileView />
          </ViewTransition>
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
            <div className="mt-6">
              <SupportTicketSystem />
            </div>
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
      <ZustandQuickView />

      {/* Product Quick Add Bottom Sheet */}
      <ProductQuickAdd />

      {/* Quick Add Drawer */}
      <QuickAddDrawer />

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

      {/* Smart Shopping Assistant */}
      <SmartShoppingAssistant />

      {/* Order Rating Prompt */}
      <OrderRatingPrompt />
    </div>
  )
}
