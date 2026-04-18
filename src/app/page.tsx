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
import { CheckoutView } from '@/components/checkout/CheckoutView'
import { OrdersView, OrderDetail } from '@/components/orders/OrdersView'
import { ProfileView } from '@/components/profile/ProfileView'
import { AuthModal } from '@/components/auth/AuthModal'
import { WelcomeModal } from '@/components/onboarding/WelcomeModal'
import { AIChatBot } from '@/components/chat/AIChatBot'
import { useState, useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ProductCard } from '@/components/product/ProductCard'
import { Heart, Sparkles, MapPin } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import type { ProductData, StoreData } from '@/store/useAppStore'

// Fallback data in case API fails
const fallbackBanners = [
  { id: 'b1', title: 'Ofertas da Semana', subtitle: 'Até 40% de desconto em produtos locais', image: '', gradient: 'bg-gradient-to-r from-primary via-emerald-500 to-teal-500' },
  { id: 'b2', title: 'Entrega Grátis', subtitle: 'Compras acima de R$ 50 em lojas selecionadas', image: '', gradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500' },
  { id: 'b3', title: 'Novidades no App', subtitle: 'Descubra novas lojas e produtos da região', image: '', gradient: 'bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500' },
  { id: 'b4', title: 'Programa de Fidelidade', subtitle: 'Ganhe pontos a cada compra e troque por descontos', image: '', gradient: 'bg-gradient-to-r from-lime-500 via-green-500 to-emerald-600' },
]

const fallbackStores: StoreData[] = [
  { id: 's1', name: 'Mercado do Zé', slug: 'mercado-do-ze', description: 'O melhor mercado de Dom Eliseu com produtos frescos e preços justos.', category: 'FOOD', logo: null, coverImage: null, phone: '(91) 99999-0001', whatsapp: '(91) 99999-0001', address: 'Rua Principal, 123', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 5.00, freeDeliveryAbove: 50, rating: 4.7, totalReviews: 128, opensAt: '07:00', closesAt: '21:00', openDays: '1,2,3,4,5,6,7' },
  { id: 's2', name: 'Açaí da Boa', slug: 'acai-da-boa', description: 'O mais autêntico açaí paraense, feito com frutas selecionadas da região.', category: 'FOOD', logo: null, coverImage: null, phone: '(91) 99999-0002', whatsapp: '(91) 99999-0002', address: 'Av. Brasil, 456', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 3.00, freeDeliveryAbove: 30, rating: 4.9, totalReviews: 256, opensAt: '08:00', closesAt: '22:00', openDays: '1,2,3,4,5,6' },
  { id: 's3', name: 'Agropecuária São Paulo', slug: 'agropecuaria-sao-paulo', description: 'Tudo para o campo e para a cidade. Ferramentas, sementes e muito mais.', category: 'AGRICULTURE', logo: null, coverImage: null, phone: '(91) 99999-0003', whatsapp: '(91) 99999-0003', address: 'Rod. PA-279, Km 5', neighborhood: 'Zona Rural', city: 'Dom Eliseu', state: 'PA', deliveryFee: 8.00, freeDeliveryAbove: 200, rating: 4.5, totalReviews: 67, opensAt: '06:00', closesAt: '18:00', openDays: '1,2,3,4,5,6' },
  { id: 's4', name: 'Farmácia Vida', slug: 'farmacia-vida', description: 'Sua saúde em primeiro lugar. Medicamentos, suplementos e atendimento farmacêutico.', category: 'HEALTH', logo: null, coverImage: null, phone: '(91) 99999-0004', whatsapp: '(91) 99999-0004', address: 'Rua Pará, 789', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 0, freeDeliveryAbove: null, rating: 4.6, totalReviews: 89, opensAt: '07:00', closesAt: '22:00', openDays: '1,2,3,4,5,6,7' },
  { id: 's5', name: 'Padaria Pão Quente', slug: 'padaria-pao-quente', description: 'Pão fresquinho todo dia! Doces, salgados e muito mais.', category: 'FOOD', logo: null, coverImage: null, phone: '(91) 99999-0005', whatsapp: '(91) 99999-0005', address: 'Rua Amazonas, 321', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 3.00, freeDeliveryAbove: 25, rating: 4.8, totalReviews: 198, opensAt: '05:00', closesAt: '20:00', openDays: '1,2,3,4,5,6,7' },
  { id: 's6', name: 'Loja do Eletrônico', slug: 'loja-do-eletronico', description: 'Celulares, acessórios e eletrônicos com as melhores ofertas.', category: 'ELECTRONICS', logo: null, coverImage: null, phone: '(91) 99999-0006', whatsapp: '(91) 99999-0006', address: 'Rua Tocantins, 654', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 5.00, freeDeliveryAbove: 100, rating: 4.3, totalReviews: 45, opensAt: '08:00', closesAt: '20:00', openDays: '1,2,3,4,5,6' },
  { id: 's7', name: 'Pet Shop Amigo Fiel', slug: 'pet-shop-amigo-fiel', description: 'Tudo para seu melhor amigo. Rações, banho, tosa e acessórios.', category: 'ANIMALS', logo: null, coverImage: null, phone: '(91) 99999-0007', whatsapp: '(91) 99999-0007', address: 'Rua Maranhão, 987', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 4.00, freeDeliveryAbove: 80, rating: 4.7, totalReviews: 112, opensAt: '08:00', closesAt: '19:00', openDays: '1,2,3,4,5,6' },
  { id: 's8', name: 'Salão da Bella', slug: 'salao-da-bella', description: 'Beleza e bem-estar para mulheres e homens. Cortes, coloração e tratamentos.', category: 'BEAUTY', logo: null, coverImage: null, phone: '(91) 99999-0008', whatsapp: '(91) 99999-0008', address: 'Rua Ceará, 147', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 0, freeDeliveryAbove: null, rating: 4.9, totalReviews: 210, opensAt: '09:00', closesAt: '20:00', openDays: '1,2,3,4,5,6' },
]

const fallbackProducts: ProductData[] = [
  { id: 'p1', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Arroz Tio João 5kg', slug: 'arroz-tio-joao', description: 'Arroz tipo 1 premium, ideal para o dia a dia da sua família.', price: 24.90, comparePrice: 29.90, images: '[]', stock: 50, rating: 4.5, totalReviews: 23, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["5kg","1kg"]', category: 'FOOD' },
  { id: 'p2', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Feijão Carioca 1kg', slug: 'feijao-carioca', description: 'Feijão carioca selecionado de alta qualidade.', price: 8.90, comparePrice: null, images: '[]', stock: 80, rating: 4.3, totalReviews: 15, isFeatured: false, isNew: false, isOffer: false, tags: '[]', variations: '["1kg","500g"]', category: 'FOOD' },
  { id: 'p3', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Óleo de Soja 900ml', slug: 'oleo-soja', description: 'Óleo de soja puro para cozinhar.', price: 7.49, comparePrice: 8.99, images: '[]', stock: 40, rating: 4.1, totalReviews: 8, isFeatured: false, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'FOOD' },
  { id: 'p5', storeId: 's2', storeName: 'Açaí da Boa', storeLogo: null, name: 'Açaí 500ml', slug: 'acai-500ml', description: 'Açaí cremoso feito com frutas frescas do Pará. Acompanha granola e banana.', price: 15.00, comparePrice: 18.00, images: '[]', stock: 100, rating: 4.9, totalReviews: 89, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["300ml","500ml","700ml"]', category: 'FOOD' },
  { id: 'p6', storeId: 's2', storeName: 'Açaí da Boa', storeLogo: null, name: 'Açaí Premium 700ml', slug: 'acai-premium-700ml', description: 'Açaí premium com frutas da estação, leite condensado e granola artesanal.', price: 22.00, comparePrice: null, images: '[]', stock: 50, rating: 4.8, totalReviews: 45, isFeatured: true, isNew: true, isOffer: false, tags: '[]', variations: null, category: 'FOOD' },
  { id: 'p9', storeId: 's3', storeName: 'Agropecuária São Paulo', storeLogo: null, name: 'Adubo NPK 20kg', slug: 'adubo-npk', description: 'Adubo NPK para culturas diversas. Alta eficiência.', price: 89.90, comparePrice: null, images: '[]', stock: 25, rating: 4.4, totalReviews: 12, isFeatured: true, isNew: false, isOffer: false, tags: '[]', variations: null, category: 'AGRICULTURE' },
  { id: 'p13', storeId: 's4', storeName: 'Farmácia Vida', storeLogo: null, name: 'Vitamina C 500mg', slug: 'vitamina-c', description: 'Suplemento de vitamina C 500mg. Pote com 60 cápsulas.', price: 35.00, comparePrice: 42.00, images: '[]', stock: 100, rating: 4.7, totalReviews: 34, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["500mg","1000mg"]', category: 'HEALTH' },
  { id: 'p17', storeId: 's5', storeName: 'Padaria Pão Quente', storeLogo: null, name: 'Pão Francês (6 un)', slug: 'pao-frances', description: 'Pão francês fresquinho saindo do forno. Pacote com 6 unidades.', price: 6.00, comparePrice: null, images: '[]', stock: 200, rating: 4.9, totalReviews: 120, isFeatured: true, isNew: false, isOffer: false, tags: '[]', variations: null, category: 'FOOD' },
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

export default function Home() {
  const { currentView, isSearchOpen, activeCategory } = useAppStore()
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
      <AnimatePresence mode="wait">
        {isSearchOpen ? (
          <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SearchView />
          </motion.div>
        ) : currentView === 'home' ? (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            {isLoading ? (
              <HomeSkeleton />
            ) : (
              <>
                {/* Hero */}
                <section className="mt-4">
                  <HeroBanner banners={fallbackBanners} />
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
                        Bem-vindo de volta, Maria! 👋
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

                <Separator className="my-8 bg-border/50" />
                
                {/* Offers of the Day */}
                {offerProducts.length > 0 && (
                  <section>
                    <ProductCarousel title="🔥 Ofertas do Dia" products={offerProducts} />
                  </section>
                )}

                <Separator className="my-8 bg-border/50" />
                
                {/* New in City */}
                {newProducts.length > 0 && (
                  <section>
                    <ProductCarousel title="✨ Novidades na Cidade" products={newProducts} />
                  </section>
                )}

                <Separator className="my-8 bg-border/50" />
                
                {/* Featured Stores */}
                {filteredStores.length > 0 && (
                  <section>
                    <StoreCarousel title="🏪 Lojas em Destaque" stores={filteredStores} />
                  </section>
                )}

                <Separator className="my-8 bg-border/50" />
                
                {/* Suggestions */}
                {suggestedProducts.length > 0 && (
                  <section>
                    <ProductCarousel title="💡 Sugestões para Você" products={suggestedProducts} />
                  </section>
                )}

                <Separator className="my-8 bg-border/50" />
                
                {/* Partners */}
                <section>
                  <PartnersBanner />
                </section>

                <Separator className="my-8 bg-border/50" />
                
                {/* Segmented Ads */}
                {filteredProducts.filter(p => p.storeId === 's2' || p.storeId === 's5').length > 0 && (
                  <section>
                    <ProductCarousel 
                      title="📢 Anúncios Segmentados" 
                      products={filteredProducts.filter(p => p.storeId === 's2' || p.storeId === 's5')} 
                    />
                  </section>
                )}
              </>
            )}
            
            <div className="h-4" />
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
        ) : currentView === 'favorites' ? (
          <motion.div key="favorites" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto px-4 pt-4">
            <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Favoritos
            </h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {featuredProducts.slice(0, 6).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
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
    </div>
  )
}
