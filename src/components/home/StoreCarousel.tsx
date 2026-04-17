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
    const [h, m] = store.opensAt.split(':').map(Number)
    const [eh, em] = store.closesAt.split(':').map(Number)
    const currentMins = now.getHours() * 60 + now.getMinutes()
    const openMins = h * 60 + m
    const closeMins = eh * 60 + em
    return currentMins >= openMins && currentMins <= closeMins
  }
  
  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
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
              </div>
              <div className="p-3 flex gap-3">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-lg font-bold text-primary shrink-0">
                  {store.name.charAt(0)}
                </div>
                <div className="min-w-0">
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
