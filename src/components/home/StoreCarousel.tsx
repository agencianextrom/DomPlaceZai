'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight, Clock, Star, MapPin, Trophy, ShoppingBag, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { useAppStore, type StoreData } from '@/store/useAppStore'

const gradients = [
  'from-emerald-500 to-green-600',
  'from-amber-500 to-orange-600',
  'from-teal-500 to-cyan-600',
  'from-rose-500 to-pink-600',
  'from-lime-500 to-green-600',
  'from-orange-500 to-red-500',
  'from-emerald-600 to-teal-600',
  'from-amber-600 to-yellow-500',
]

const logoColors: Record<string, string> = {
  AGRICULTURE: 'bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300',
  FOOD: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  SERVICES: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300',
  FASHION: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  ELECTRONICS: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  HEALTH: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  HOME_GARDEN: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  ANIMALS: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  EDUCATION: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  BEAUTY: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300',
  SPORTS: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  OTHER: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300',
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

const deliveryTimes: Record<string, string> = {
  FOOD: '20-40 min',
  AGRICULTURE: '1-3 dias',
  SERVICES: 'Agendar',
  FASHION: '2-5 dias',
  ELECTRONICS: '3-7 dias',
  HEALTH: '30-60 min',
  HOME_GARDEN: '2-5 dias',
  ANIMALS: '1-3 dias',
  EDUCATION: 'Online',
  BEAUTY: 'Agendar',
  SPORTS: '2-5 dias',
  OTHER: '2-7 dias',
}

interface StoreCarouselProps {
  title: string
  stores: StoreData[]
}

export function StoreCarousel({ title, stores }: StoreCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { navigate, selectStore } = useAppStore()
  
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -300 : 300,
      behavior: 'smooth',
    })
  }
  
  if (!stores.length) return null
  
  // Sort stores by rating to determine ranking
  const rankedStores = [...stores].sort((a, b) => b.rating - a.rating)
  
  const isOpen = (store: StoreData) => {
    if (!store.opensAt || !store.closesAt) return true
    const now = new Date()
    // Convert to Brasilia time (UTC-3)
    const brasiliaOffset = 3 * 60 // 3 hours in minutes
    const utcMins = now.getUTCHours() * 60 + now.getUTCMinutes()
    const currentMins = (utcMins - brasiliaOffset + 24 * 60) % (24 * 60)
    const [h, m] = store.opensAt.split(':').map(Number)
    const [eh, em] = store.closesAt.split(':').map(Number)
    const openMins = h * 60 + m
    const closeMins = eh * 60 + em
    if (openMins <= closeMins) {
      return currentMins >= openMins && currentMins <= closeMins
    }
    // Handles overnight hours (e.g., bar open till 2am)
    return currentMins >= openMins || currentMins <= closeMins
  }

  const getRank = (storeId: string) => {
    const idx = rankedStores.findIndex(s => s.id === storeId)
    return idx >= 0 ? idx + 1 : null
  }

  const handleStoreClick = (store: StoreData) => {
    selectStore(store)
    navigate('store')
  }
  
  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <span className="w-1 h-6 rounded-full bg-primary" />
          {title}
        </h2>
        <div className="flex items-center gap-1">
          {/* "Ver todas as lojas" link */}
          <button
            onClick={() => navigate('search')}
            className="flex items-center gap-1 text-sm text-primary font-medium hover:text-primary/80 transition-colors group mr-1"
          >
            <span>Ver todas as lojas</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
          {/* Scroll buttons - hidden on lg where grid is shown */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile: horizontal carousel (below lg) */}
      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2 lg:hidden"
      >
        {stores.map((store, index) => (
          <StoreCard
            key={store.id}
            store={store}
            index={index}
            gradient={gradients[index % gradients.length]}
            logoColor={logoColors[store.category] || logoColors.OTHER}
            deliveryTime={deliveryTimes[store.category] || '2-7 dias'}
            rank={getRank(store.id)}
            open={isOpen(store)}
            onClick={() => handleStoreClick(store)}
          />
        ))}
      </div>

      {/* Desktop: 3-column grid with equal height (lg+) */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-3 pb-2">
        {stores.slice(0, 6).map((store, index) => (
          <motion.div
            key={store.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className="h-full"
          >
            <StoreCard
              store={store}
              index={index}
              gradient={gradients[index % gradients.length]}
              logoColor={logoColors[store.category] || logoColors.OTHER}
              deliveryTime={deliveryTimes[store.category] || '2-7 dias'}
              rank={getRank(store.id)}
              open={isOpen(store)}
              onClick={() => handleStoreClick(store)}
              isDesktop
            />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// Extracted store card for reuse in mobile and desktop
interface StoreCardProps {
  store: StoreData
  index: number
  gradient: string
  logoColor: string
  deliveryTime: string
  rank: number | null
  open: boolean
  onClick: () => void
  isDesktop?: boolean
}

function StoreCard({ store, index, gradient, logoColor, deliveryTime, rank, open, onClick, isDesktop }: StoreCardProps) {
  const initials = store.name.substring(0, 2).toUpperCase()

  // On mobile, use motion.button; on desktop, just a button (parent handles animation)
  const inner = (
    <div
      onClick={onClick}
      className={`h-full bg-card rounded-xl border border-border overflow-hidden text-left hover:shadow-lg transition-all duration-300 group hover:-translate-y-0.5 ${isDesktop ? '' : 'shrink-0 w-[260px] sm:w-[280px]'} cursor-pointer`}
    >
      {/* Gradient header with pattern overlay */}
      <div className={`h-24 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        {/* Pattern overlay */}
        <div className="absolute inset-0 dot-pattern opacity-40" />
        
        {/* Top ranking badge */}
        {rank && rank <= 3 && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-white/90 dark:bg-black/50 rounded-md px-2 py-0.5">
            <Trophy className={`h-3 w-3 ${rank === 1 ? 'text-amber-500' : rank === 2 ? 'text-slate-400' : 'text-amber-700'}`} />
            <span className="text-[10px] font-bold text-foreground">
              Top #{rank}
            </span>
          </div>
        )}

        {store.deliveryFee > 0 && (
          <Badge className="absolute top-2 right-2 bg-white/90 text-foreground border-0 text-[10px]">
            Entrega R${store.deliveryFee.toFixed(2)}
          </Badge>
        )}

        {/* Decorative circles */}
        <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10" />
        <div className="absolute right-8 top-2 w-10 h-10 rounded-full bg-white/10" />
      </div>

      <div className="p-3 flex gap-3">
        <div className={`w-10 h-10 rounded-full ${logoColor} flex items-center justify-center text-sm font-bold shrink-0 shadow-sm ring-2 ring-white dark:ring-card`}>
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{store.name}</h3>
          <Badge variant="secondary" className="text-[10px] mt-0.5">
            {categoryLabels[store.category] || store.category}
          </Badge>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
              {store.rating.toFixed(1)}
            </span>
            <span className={`flex items-center gap-0.5 ${open ? 'text-emerald-600' : 'text-red-500'}`}>
              <Clock className="h-3 w-3" />
              {open ? 'Aberto' : 'Fechado'}
            </span>
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {deliveryTime}
            </span>
          </div>
          {store.address && (
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-0.5 truncate">
              <MapPin className="h-2.5 w-2.5 shrink-0" />
              {store.address}
            </p>
          )}
        </div>
      </div>

      {/* Ver Loja button */}
      <div className="px-3 pb-3">
        <div className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/5 text-primary text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
          <ShoppingBag className="h-3 w-3" />
          Ver Loja
        </div>
      </div>
    </div>
  )

  // Wrap with motion on mobile for slide-in animation
  if (!isDesktop) {
    return (
      <motion.div
        key={store.id}
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '0px 100px 0px 0px' }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
      >
        {inner}
      </motion.div>
    )
  }

  return inner
}
