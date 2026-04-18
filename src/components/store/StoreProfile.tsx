'use client'

import { ArrowLeft, Clock, MapPin, Phone, MessageCircle, ShoppingBag, Heart, Share2, ChevronDown, ChevronUp, Store, Truck, Star, Instagram, Facebook, Globe, Percent, ShieldCheck, Zap, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore, type StoreData, type ProductData } from '@/store/useAppStore'
import { ProductCard, formatBRL } from '@/components/product/ProductCard'
import { StarRating } from '@/components/ui/StarRating'
import { StoreRatingBreakdown } from './StoreRatingBreakdown'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface StoreProfileProps {
  store: StoreData
}

const categoryLabels: Record<string, string> = {
  AGRICULTURE: 'Agricultura',
  FOOD: 'Alimentação',
  SERVICES: 'Serviços',
  FASHION: 'Moda',
  ELECTRONICS: 'Eletrônicos',
  HEALTH: 'Saúde',
  HOME_GARDEN: 'Casa & Jardim',
  ANIMALS: 'Animais',
  EDUCATION: 'Educação',
  BEAUTY: 'Beleza',
  SPORTS: 'Esportes',
  OTHER: 'Outros',
}

const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const mockReviews = [
  { name: 'Maria S.', initials: 'MS', rating: 5, comment: 'Loja excelente! Produtos de qualidade e atendimento ótimo. Sempre entrego rápido.', date: '3 dias atrás' },
  { name: 'João P.', initials: 'JP', rating: 4, comment: 'Boa variedade de produtos e preços justos. Recomendo a todos!', date: '1 semana atrás' },
  { name: 'Ana C.', initials: 'AC', rating: 5, comment: 'Melhor loja de Dom Eliseu! Sempre compro aqui.', date: '2 semanas atrás' },
  { name: 'Pedro L.', initials: 'PL', rating: 4, comment: 'Ótimo atendimento no WhatsApp. Produtos frescos!', date: '3 semanas atrás' },
]

const mockPromotions = [
  { id: 'p1', title: 'Happy Hour', desc: '30% de desconto em todos os produtos das 17h às 19h', validUntil: '30/06/2025', badge: '-30%', color: 'from-red-500 to-rose-600' },
  { id: 'p2', title: 'Primeira Compra', desc: 'R$10 de desconto na sua primeira compra acima de R$30', validUntil: 'Sem validade', badge: 'R$10 OFF', color: 'from-primary to-emerald-600' },
  { id: 'p3', title: 'Combo Família', desc: 'Compre 3 produtos e ganhe 10% de desconto no total', validUntil: '15/05/2025', badge: '-10%', color: 'from-amber-500 to-orange-600' },
]

const storeInfoCards = [
  { icon: Truck, label: 'Entrega Rápida', value: '30-45 min', color: 'text-primary', bg: 'bg-primary/10' },
  { icon: ShieldCheck, label: 'Pagamento Seguro', value: 'Pix, Cartão', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
  { icon: Award, label: 'Garantia', value: 'Satisfação', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/20' },
]

const tabItems = [
  { value: 'produtos', label: 'Produtos', icon: ShoppingBag },
  { value: 'sobre', label: 'Sobre', icon: Store },
  { value: 'avaliacoes', label: 'Avaliações', icon: Star },
  { value: 'promocoes', label: 'Promoções', icon: Percent },
] as const

type TabValue = typeof tabItems[number]['value']

export function StoreProfile({ store }: StoreProfileProps) {
  const { goBack, navigate, isFavoriteStore, toggleFavoriteStore } = useAppStore()
  const [products, setProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [activeTab, setActiveTab] = useState<TabValue>('produtos')
  const [showWhatsAppFab, setShowWhatsAppFab] = useState(false)
  
  const isFav = isFavoriteStore(store.id)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/stores/${store.id}`)
        const data = await res.json()
        if (!cancelled) setProducts(data.products || [])
      } catch {
        if (!cancelled) setProducts([])
      }
      if (!cancelled) setLoading(false)
    }
    fetchData()
    return () => { cancelled = true }
  }, [store.id])

  // Show WhatsApp FAB after scrolling past hero
  useEffect(() => {
    const handleScroll = () => {
      setShowWhatsAppFab(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  const isOpen = store.opensAt && store.closesAt ? (() => {
    const now = new Date()
    const brasiliaOffset = -3
    const utc = now.getTime() + now.getTimezoneOffset() * 60000
    const brasiliaTime = new Date(utc + brasiliaOffset * 3600000)
    const [h, m] = store.opensAt!.split(':').map(Number)
    const [eh, em] = store.closesAt!.split(':').map(Number)
    const currentMins = brasiliaTime.getHours() * 60 + brasiliaTime.getMinutes()
    const openMins = h * 60 + m
    const closeMins = eh * 60 + em
    return currentMins >= openMins && currentMins <= closeMins
  })() : true

  const openDaysList = store.openDays ? store.openDays.split(',').map(Number) : [1,2,3,4,5,6,7]
  
  const getHoursForDay = (dayNum: number) => {
    const isToday = new Date().getDay() === dayNum
    const isOpenDay = openDaysList.includes(dayNum)
    return {
      day: dayNames[dayNum],
      hours: isOpenDay ? `${store.opensAt} - ${store.closesAt}` : 'Fechado',
      isToday,
      isOpenDay,
    }
  }

  const handleWhatsApp = () => {
    const phone = store.whatsapp?.replace(/\D/g, '') || store.phone?.replace(/\D/g, '')
    if (phone) {
      window.open(`https://wa.me/55${phone}`, '_blank')
    }
  }
  
  return (
    <div className="min-h-screen pb-20 md:pb-4">
      {/* Hero header with premium gradient cover */}
      <div className="relative h-56 sm:h-72 -mx-4 -mt-4 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-emerald-600 to-teal-700" />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-emerald-800/50 to-amber-600/20"
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          style={{ backgroundSize: '200% 200%' }}
        />
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full h-12 sm:h-16 fill-background" preserveAspectRatio="none">
            <path d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,50 1440,40 L1440,60 L0,60 Z" />
          </svg>
        </div>

        {/* Back button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goBack}
          className="absolute top-4 left-4 h-10 w-10 bg-black/20 hover:bg-black/40 text-white border-0 z-10 backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Action buttons on cover */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFavoriteStore(store.id)}
            className="h-10 w-10 bg-black/20 hover:bg-black/40 text-white border-0 backdrop-blur-sm"
          >
            <Heart className={`h-5 w-5 transition-all ${isFav ? 'fill-red-400 text-red-400 scale-110' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 bg-black/20 hover:bg-black/40 text-white border-0 backdrop-blur-sm"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Store name overlay */}
        <div className="absolute bottom-12 left-4 right-4 text-white z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl font-bold text-shadow-lg"
          >
            {store.name}
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mt-2 flex-wrap"
          >
            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs">
              {categoryLabels[store.category] || store.category}
            </Badge>
            {isOpen ? (
              <span className="flex items-center gap-1 text-xs bg-emerald-500/25 text-emerald-100 px-2.5 py-1 rounded-full backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Aberto agora
              </span>
            ) : (
              <span className="text-xs bg-red-500/25 text-red-100 px-2.5 py-1 rounded-full backdrop-blur-sm">
                Fechado
              </span>
            )}
          </motion.div>
        </div>
      </div>
      
      {/* Store info section */}
      <div className="px-4 -mt-6 relative z-10">
        {/* Avatar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
          className="flex items-end gap-4"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-card border-4 border-background shadow-xl flex items-center justify-center text-2xl sm:text-3xl font-bold text-primary gradient-border">
            {store.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div className="pb-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <StarRating rating={store.rating} size="sm" showCount count={store.totalReviews} />
            </div>
          </div>
        </motion.div>
        
        {/* Store stats cards — premium hover */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { icon: ShoppingBag, label: 'Produtos', value: products.length || 0, bg: 'bg-primary/5 hover:bg-primary/10', iconColor: 'text-primary' },
            { icon: Star, label: 'Avaliação', value: store.rating.toFixed(1), bg: 'bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20', iconColor: 'text-amber-500 fill-amber-500' },
            { icon: MessageCircle, label: 'Avaliações', value: store.totalReviews || 0, bg: 'bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20', iconColor: 'text-emerald-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
            >
              <Card className={`border-0 ${stat.bg} transition-colors cursor-default card-premium-hover`}>
                <CardContent className="p-3 text-center">
                  <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.iconColor}`} />
                  <p className="text-lg font-bold animate-count-up">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Store info cards — trust badges */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          {storeInfoCards.map((info, i) => (
            <motion.div
              key={info.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.06 }}
              whileHover={{ y: -2 }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-colors cursor-default"
            >
              <div className={`h-8 w-8 rounded-lg ${info.bg} flex items-center justify-center`}>
                <info.icon className={`h-4 w-4 ${info.color}`} />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-semibold">{info.label}</p>
                <p className="text-[9px] text-muted-foreground">{info.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Delivery info */}
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="flex items-center gap-3 mt-4"
        >
          {store.deliveryFee === 0 ? (
            <Badge variant="secondary" className="text-primary bg-primary/10 text-xs">
              <Truck className="h-3 w-3 mr-1" />
              Entrega grátis
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Truck className="h-4 w-4 text-primary" />
              Entrega: {formatBRL(store.deliveryFee)}
              {store.freeDeliveryAbove && (
                <span className="text-xs"> (grátis acima de {formatBRL(store.freeDeliveryAbove)})</span>
              )}
            </span>
          )}
          <span className="text-xs text-muted-foreground">· 30-45 min</span>
        </motion.div>
        
        {/* Contact actions */}
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-2 mt-4"
        >
          {(store.whatsapp || store.phone) && (
            <Button 
              className="flex-1 h-11 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white btn-glow"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Abrir no WhatsApp
            </Button>
          )}
          {store.phone && (
            <Button variant="outline" className="h-11 px-4" onClick={() => {
              window.open(`tel:${store.phone!.replace(/\D/g, '')}`, '_self')
            }}>
              <Phone className="h-4 w-4" />
            </Button>
          )}
        </motion.div>
        
        {/* Address */}
        {store.address && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="flex items-center gap-2 mt-3 text-sm text-muted-foreground"
          >
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            {store.address}, {store.neighborhood || ''} - {store.city}/{store.state}
          </motion.div>
        )}
        
        {/* Description */}
        {store.description && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-3"
          >
            <p className="text-sm text-muted-foreground leading-relaxed">
              {showFullDescription || store.description.length < 100
                ? store.description
                : `${store.description.slice(0, 100)}...`}
            </p>
            {store.description.length > 100 && (
              <button 
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-sm text-primary hover:underline mt-1 flex items-center gap-1"
              >
                {showFullDescription ? 'Ver menos' : 'Ver mais'}
                {showFullDescription ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
          </motion.div>
        )}
      </div>
      
      {/* Custom Tabs with animated underline indicator */}
      <div className="mt-6 -mx-4 px-4">
        <div className="relative">
          {/* Tab buttons */}
          <div className="flex gap-1 bg-secondary/50 rounded-xl p-1">
            {tabItems.map((tab) => {
              const TabIcon = tab.icon
              const isActive = activeTab === tab.value
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex-1 relative flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs sm:text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="store-tab-bg"
                      className="absolute inset-0 bg-primary rounded-lg"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <TabIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'produtos' && (
            <motion.div
              key="produtos"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-4"
            >
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-muted rounded-xl h-56 skeleton-shimmer" />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {products.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                    >
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 text-muted-foreground"
                >
                  <Store className="h-16 w-16 mx-auto mb-3 text-muted-foreground/20" />
                  <p className="font-medium">Nenhum produto disponível</p>
                  <p className="text-sm mt-1">no momento</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'sobre' && (
            <motion.div
              key="sobre"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-4 space-y-4"
            >
              {/* About */}
              <Card className="border-border/50 card-spotlight hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-2">Sobre a loja</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {store.description || 'Nenhuma descrição disponível.'}
                  </p>
                </CardContent>
              </Card>

              {/* Hours */}
              <Card className="border-border/50 card-spotlight hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="px-4 py-3 flex items-center gap-2 border-b border-border/30">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">Horário de funcionamento</span>
                  </div>
                  {[0,1,2,3,4,5,6].map((day, idx) => {
                    const info = getHoursForDay(day)
                    return (
                      <div key={day} className={`flex items-center justify-between px-4 py-2.5 transition-colors ${idx < 6 ? 'border-b border-border/30' : ''} ${info.isToday ? 'bg-primary/5' : ''}`}>
                        <span className={`text-sm ${info.isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                          {info.day}{info.isToday ? ' (hoje)' : ''}
                        </span>
                        <span className={`text-sm ${!info.isOpenDay ? 'text-muted-foreground/50' : info.isToday ? 'font-semibold' : ''}`}>
                          {info.hours}
                        </span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
              
              {/* Contact */}
              <Card className="border-border/50 card-spotlight hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-3">Contato e redes sociais</h3>
                  <div className="space-y-3">
                    {store.phone && (
                      <div className="flex items-center gap-3 text-sm group">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Telefone</p>
                          <p className="font-medium">{store.phone}</p>
                        </div>
                      </div>
                    )}
                    {store.whatsapp && (
                      <div className="flex items-center gap-3 text-sm group">
                        <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <MessageCircle className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">WhatsApp</p>
                          <p className="font-medium">{store.whatsapp}</p>
                        </div>
                      </div>
                    )}
                    {store.address && (
                      <div className="flex items-center gap-3 text-sm group">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Endereço</p>
                          <p className="font-medium">{store.address}, {store.neighborhood} - {store.city}/{store.state}</p>
                        </div>
                      </div>
                    )}
                    {/* Social media */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="h-9 gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30">
                        <Instagram className="h-4 w-4" />
                        Instagram
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30">
                        <Facebook className="h-4 w-4" />
                        Facebook
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30">
                        <Globe className="h-4 w-4" />
                        Site
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery */}
              <Card className="border-primary/20 card-spotlight hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-primary" />
                    Informações de entrega
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxa de entrega</span>
                      <span className="font-medium">{store.deliveryFee === 0 ? 'Grátis' : formatBRL(store.deliveryFee)}</span>
                    </div>
                    {store.freeDeliveryAbove && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Frete grátis acima de</span>
                        <span className="font-medium text-primary">{formatBRL(store.freeDeliveryAbove)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tempo estimado</span>
                      <span className="font-medium">30-45 min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Área de cobertura</span>
                      <span className="font-medium">{store.city} e região</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'avaliacoes' && (
            <motion.div
              key="avaliacoes"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-4 space-y-4"
            >
              {/* Rating breakdown */}
              <StoreRatingBreakdown
                rating={store.rating}
                totalReviews={store.totalReviews}
                storeName={store.name}
              />
              
              {/* Reviews list */}
              {mockReviews.map((review, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="border-border/50 card-spotlight hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                          {review.initials}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm">{review.name}</p>
                            <span className="text-[10px] text-muted-foreground">{review.date}</span>
                          </div>
                          <div className="mt-0.5">
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'promocoes' && (
            <motion.div
              key="promocoes"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-4 space-y-3"
            >
              {/* Promo banner header */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary via-emerald-600 to-teal-600 p-6 text-white">
                <div className="absolute inset-0 dot-pattern opacity-20" />
                <div className="absolute top-2 right-2">
                  <Zap className="h-8 w-8 text-amber-400/40" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Percent className="h-5 w-5" />
                    Ver todas as promoções
                  </h3>
                  <p className="text-sm text-white/80 mt-1">
                    {mockPromotions.length} ofertas ativas nesta loja
                  </p>
                </div>
              </div>

              {/* Promo cards */}
              {mockPromotions.map((promo, i) => (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="overflow-hidden card-spotlight hover:shadow-lg transition-all card-premium-hover">
                    <div className="flex">
                      <div className={`w-24 sm:w-32 bg-gradient-to-br ${promo.color} flex items-center justify-center shrink-0`}>
                        <motion.span 
                          className="text-white font-bold text-sm sm:text-base text-center px-2"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                        >
                          {promo.badge}
                        </motion.span>
                      </div>
                      <CardContent className="p-4 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-sm">{promo.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{promo.desc}</p>
                            <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              Válido até {promo.validUntil}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating WhatsApp FAB */}
      <AnimatePresence>
        {showWhatsAppFab && (store.whatsapp || store.phone) && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleWhatsApp}
            className="fixed bottom-24 md:bottom-8 right-4 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-xl flex items-center justify-center fab-ping"
            aria-label="Abrir WhatsApp"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
