'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight, Clock, Star, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore, type StoreData } from '@/store/useAppStore'

const gradients = [
  'from-emerald-500 to-green-600',
  'from-amber-500 to-orange-600',
  'from-teal-500 to-cyan-600',
  'from-rose-500 to-pink-600',
  'from-violet-500 to-purple-600',
  'from-lime-500 to-green-600',
  'from-orange-500 to-red-500',
  'from-cyan-500 to-blue-500',
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
  
  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <span className="w-1 h-6 rounded-full bg-primary" />
          {title}
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => scroll('left')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => scroll('right')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2"
      >
        {stores.map((store, index) => {
          const open = isOpen(store)
          const gradient = gradients[index % gradients.length]
          const logoColor = logoColors[store.category] || logoColors.OTHER
          const initials = store.name.substring(0, 2).toUpperCase()
          return (
            <button
              key={store.id}
              onClick={() => {
                selectStore(store)
                navigate('store')
              }}
              className="shrink-0 w-[260px] sm:w-[280px] bg-card rounded-xl border border-border overflow-hidden text-left hover:shadow-md transition-shadow group"
            >
              <div className={`h-24 bg-gradient-to-br ${gradient} relative`}>
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
                  </div>
                  {store.address && (
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-0.5 truncate">
                      <MapPin className="h-2.5 w-2.5 shrink-0" />
                      {store.address}
                    </p>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
