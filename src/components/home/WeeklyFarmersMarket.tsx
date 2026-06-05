'use client'
/* ─── WeeklyFarmersMarket ─── "Feira da Semana" ───
   Farmers market hub: weekly schedule, seasonal produce, local farmer profiles,
   price comparisons (feira vs supermarket), order directly from farmers. */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Leaf, MapPin, Clock, Star, ChevronRight, ShoppingBag,
  TrendingDown, Calendar, Truck, Heart, Filter, Sun, Cloud,
  Droplets, Wind
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProduceItem {
  id: string
  name: string
  emoji: string
  category: string
  priceFeira: number
  priceSuper: number
  savings: number
  season: string
  farmer: string
  organic: boolean
  unit: string
}

interface FarmerProfile {
  id: string
  name: string
  emoji: string
  farm: string
  rating: number
  reviews: number
  distance: string
  specialties: string[]
  open: boolean
}

interface MarketDay {
  day: string
  date: string
  location: string
  time: string
  farmers: number
  produceCount: number
  weather: { icon: typeof Sun; temp: string; desc: string }
  popular: string[]
}

// ─── Data ──────────────────────────────────────────────────────────────────────
const marketDays: MarketDay[] = [
  {
    day: 'Sábado',
    date: '07 Jun',
    location: 'Praça Central',
    time: '06:00 – 12:00',
    farmers: 24,
    produceCount: 156,
    weather: { icon: Sun, temp: '32°C', desc: 'Ensolarado' },
    popular: ['Tomate', 'Banana', 'Couve']
  },
  {
    day: 'Terça',
    date: '10 Jun',
    location: 'Terminal Rodoviário',
    time: '06:00 – 11:00',
    farmers: 18,
    produceCount: 98,
    weather: { icon: Cloud, temp: '28°C', desc: 'Nublado' },
    popular: ['Mandioca', 'Laranja', 'Hortelã']
  },
  {
    day: 'Quinta',
    date: '12 Jun',
    location: 'Área do Mercado',
    time: '15:00 – 19:00',
    farmers: 12,
    produceCount: 72,
    weather: { icon: Droplets, temp: '26°C', desc: 'Chuvisco' },
    popular: ['Açaí', 'Cupuaçu', 'Tucumã']
  }
]

const produce: ProduceItem[] = [
  { id: '1', name: 'Tomate Cereja', emoji: '🍅', category: 'Legumes', priceFeira: 4.90, priceSuper: 7.50, savings: 35, season: 'Todo ano', farmer: 'Seu Joaquim', organic: true, unit: 'kg' },
  { id: '2', name: 'Banana Nanica', emoji: '🍌', category: 'Frutas', priceFeira: 3.20, priceSuper: 4.80, savings: 33, season: 'Todo ano', farmer: 'Dona Maria', organic: false, unit: 'kg' },
  { id: '3', name: 'Couve Manteiga', emoji: '🥬', category: 'Verduras', priceFeira: 2.50, priceSuper: 5.90, savings: 58, season: 'Todo ano', farmer: 'Sr. Antônio', organic: true, unit: 'maço' },
  { id: '4', name: 'Açaí', emoji: '🫐', category: 'Frutas Nativas', priceFeira: 18.00, priceSuper: 25.00, savings: 28, season: 'Safra', farmer: 'Seu Raimundo', organic: true, unit: 'kg' },
  { id: '5', name: 'Mandioca', emoji: '🥔', category: 'Raízes', priceFeira: 4.50, priceSuper: 6.20, savings: 27, season: 'Todo ano', farmer: 'Dona Francisca', organic: false, unit: 'kg' },
  { id: '6', name: 'Tucumã', emoji: '🥭', category: 'Frutas Nativas', priceFeira: 12.00, priceSuper: 18.00, savings: 33, season: 'Safra', farmer: 'Seu Raimundo', organic: true, unit: 'kg' },
  { id: '7', name: 'Hortelã', emoji: '🌿', category: 'Temperos', priceFeira: 1.50, priceSuper: 4.00, savings: 63, season: 'Todo ano', farmer: 'Sr. Antônio', organic: true, unit: 'maço' },
  { id: '8', name: 'Cupuaçu', emoji: '🍑', category: 'Frutas Nativas', priceFeira: 8.90, priceSuper: 13.50, savings: 34, season: 'Safra', farmer: 'Dona Maria', organic: true, unit: 'kg' },
  { id: '9', name: 'Pimentão Verde', emoji: '🫑', category: 'Legumes', priceFeira: 5.90, priceSuper: 8.20, savings: 28, season: 'Inverno', farmer: 'Seu Joaquim', organic: false, unit: 'kg' },
  { id: '10', name: 'Laranja Pêra', emoji: '🍊', category: 'Frutas', priceFeira: 3.80, priceSuper: 5.50, savings: 31, season: 'Todo ano', farmer: 'Dona Francisca', organic: false, unit: 'kg' },
]

const farmers: FarmerProfile[] = [
  { id: '1', name: 'Seu Joaquim', emoji: '👨‍🌾', farm: 'Sítio Bom Sucesso', rating: 4.9, reviews: 127, distance: '3.2 km', specialties: ['Tomate', 'Pimentão', 'Alface'], open: true },
  { id: '2', name: 'Dona Maria', emoji: '👩‍🌾', farm: 'Chácara Santa Helena', rating: 4.8, reviews: 98, distance: '5.1 km', specialties: ['Banana', 'Cupuaçu', 'Abacaxi'], open: true },
  { id: '3', name: 'Sr. Antônio', emoji: '👴', farm: 'Sítio Esperança', rating: 5.0, reviews: 203, distance: '2.8 km', specialties: ['Couve', 'Hortelã', 'Cebolinha'], open: true },
  { id: '4', name: 'Seu Raimundo', emoji: '🧔', farm: 'Roça do Pará', rating: 4.7, reviews: 64, distance: '7.5 km', specialties: ['Açaí', 'Tucumã', 'Bacaba'], open: false },
  { id: '5', name: 'Dona Francisca', emoji: '👩‍🦱', farm: 'Fazenda São José', rating: 4.6, reviews: 45, distance: '4.3 km', specialties: ['Mandioca', 'Laranja', 'Limão'], open: true },
]

const categories = ['Todos', 'Frutas', 'Legumes', 'Verduras', 'Raízes', 'Frutas Nativas', 'Temperos']

const brl = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

const sp = 'spring' as const

// ─── Component ────────────────────────────────────────────────────────────────
export default function WeeklyFarmersMarket() {
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [selectedDay, setSelectedDay] = useState(0)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [showOrganicOnly, setShowOrganicOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'savings' | 'price' | 'name'>('savings')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  const toggleFav = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const filteredProduce = produce
    .filter(p => activeCategory === 'Todos' || p.category === activeCategory)
    .filter(p => !showOrganicOnly || p.organic)
    .sort((a, b) => {
      if (sortBy === 'savings') return b.savings - a.savings
      if (sortBy === 'price') return a.priceFeira - b.priceFeira
      return a.name.localeCompare(b.name)
    })

  const totalSavings = produce.reduce((sum, p) => sum + (p.savings * p.priceSuper / 100), 0)
  const avgSavings = Math.round(produce.reduce((sum, p) => sum + p.savings, 0) / produce.length)

  if (loading) return <LoadingSkeleton />

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: sp, stiffness: 260, damping: 24 }}
    >
      <Card className="overflow-hidden border-border/40 r90-farmers-card">
        {/* ── Header ── */}
        <CardHeader className="pb-3">
          <div
            className="r90-farmers-header flex items-center gap-3 px-4 py-4 rounded-xl -mx-6 -mt-6 mb-4"
            style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a, #15803d)',
              boxShadow: '0 4px 16px rgba(34,197,94,0.25)'
            }}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-white tracking-tight">Feira da Semana</h2>
              <p className="text-[11px] text-white/70 font-medium">Direto do produtor para sua mesa</p>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm">
              <TrendingDown className="h-3.5 w-3.5 text-green-200" />
              <span className="text-[11px] font-bold text-green-100">{avgSavings}% economia</span>
            </div>
          </div>

          {/* ── Market Day Selector ── */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
            {marketDays.map((day, i) => {
              const WeatherIcon = day.weather.icon
              return (
                <motion.button
                  key={day.day}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedDay(i)}
                  className={`shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all min-h-[44px] ${
                    selectedDay === i
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 r90-day-active'
                      : 'border-transparent bg-muted/50 hover:bg-muted r90-day-inactive'
                  }`}
                >
                  <span className="text-xs font-bold">{day.day}</span>
                  <span className="text-[10px] text-muted-foreground">{day.date}</span>
                  <div className="flex items-center gap-1">
                    <WeatherIcon className="h-3 w-3 text-amber-500" />
                    <span className="text-[10px] text-muted-foreground">{day.weather.temp}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-4 space-y-4">
          {/* ── Selected Day Details ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ type: sp, stiffness: 300, damping: 28 }}
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/40">
                  <MapPin className="h-3.5 w-3.5 text-green-600" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Local</p>
                    <p className="text-xs font-semibold">{marketDays[selectedDay].location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/40">
                  <Clock className="h-3.5 w-3.5 text-green-600" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Horário</p>
                    <p className="text-xs font-semibold">{marketDays[selectedDay].time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/40">
                  <ShoppingBag className="h-3.5 w-3.5 text-green-600" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Feirantes</p>
                    <p className="text-xs font-semibold">{marketDays[selectedDay].farmers} produtores</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/40">
                  <Leaf className="h-3.5 w-3.5 text-green-600" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Itens</p>
                    <p className="text-xs font-semibold">{marketDays[selectedDay].produceCount} produtos</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ── Category Filters + Controls ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <ShoppingBag className="h-4 w-4 text-green-600" />
                Produtos da Feira
              </h3>
              <span className="text-[10px] text-muted-foreground">{filteredProduce.length} itens</span>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowOrganicOnly(!showOrganicOnly)}
                className={`shrink-0 flex items-center gap-1 px-3 py-2 rounded-full text-[11px] font-medium border transition-all min-h-[44px] ${
                  showOrganicOnly
                    ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'border-border bg-card text-muted-foreground hover:border-green-300'
                }`}
              >
                <Leaf className="h-3 w-3" />
                Orgânico
              </motion.button>
              {categories.map(cat => (
                <motion.button
                  key={cat}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-3 py-2 rounded-full text-[11px] font-medium border transition-all min-h-[44px] ${
                    activeCategory === cat
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-border bg-card text-muted-foreground hover:border-green-300'
                  }`}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
            {/* Sort buttons */}
            <div className="flex gap-1.5">
              {([['savings', 'Maior economia'], ['price', 'Menor preço'], ['name', 'A–Z']] as const).map(([val, label]) => (
                <motion.button
                  key={val}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSortBy(val)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium border transition-all min-h-[44px] ${
                    sortBy === val
                      ? 'border-green-400 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'border-border bg-muted/40 text-muted-foreground hover:border-green-200'
                  }`}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* ── Produce Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <AnimatePresence mode="popLayout">
              {filteredProduce.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: sp, stiffness: 350, damping: 28, delay: i * 0.02 }}
                  className="r90-produce-card relative p-3 rounded-xl border border-border/40 bg-card/60 hover:border-green-300/50 transition-colors"
                >
                  {/* Favorite */}
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => toggleFav(item.id)}
                    className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors ${favorites.has(item.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
                    />
                  </motion.button>

                  <div className="flex gap-3">
                    {/* Emoji */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted/50 text-2xl shrink-0 r90-produce-emoji">
                      {item.emoji}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold truncate">{item.name}</h4>
                        {item.organic && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[9px] font-semibold dark:bg-green-900/30 dark:text-green-400">
                            <Leaf className="h-2.5 w-2.5" />
                            Orgânico
                          </span>
                        )}
                        {item.season === 'Safra' && (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-semibold dark:bg-amber-900/30 dark:text-amber-400">
                            Safra
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.farmer} · {item.category}</p>

                      {/* Price comparison */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-black text-green-600 dark:text-green-400">{brl(item.priceFeira)}</span>
                          <span className="text-[9px] text-muted-foreground">/{item.unit}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground line-through">{brl(item.priceSuper)}</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[9px] font-bold dark:bg-green-900/30 dark:text-green-400">
                          -{item.savings}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-2.5 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors r90-order-btn"
                    style={{
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(34,197,94,0.2)'
                    }}
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Pedir ao {item.farmer}
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── Savings Summary ── */}
          <motion.div
            className="r90-savings-card p-4 rounded-xl border border-green-200 dark:border-green-800/40"
            style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(16,163,74,0.12))' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30">
                <TrendingDown className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="text-sm font-bold">Economia na Feira</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-lg font-black text-green-600 dark:text-green-400">{avgSavings}%</p>
                <p className="text-[10px] text-muted-foreground">Economia média</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-green-600 dark:text-green-400">{brl(totalSavings)}</p>
                <p className="text-[10px] text-muted-foreground">Economia total</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-green-600 dark:text-green-400">{produce.length}</p>
                <p className="text-[10px] text-muted-foreground">Produtos</p>
              </div>
            </div>
            {/* Visual savings bar */}
            <div className="mt-3 space-y-1.5">
              {produce.slice(0, 5).map(item => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="text-sm w-6 text-center">{item.emoji}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted/60 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.savings}%` }}
                      transition={{ type: sp, stiffness: 200, damping: 20, delay: 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #22c55e, #16a34a)' }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-green-600 w-10 text-right">-{item.savings}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Local Farmers ── */}
          <div>
            <h3 className="text-sm font-bold flex items-center gap-1.5 mb-3">
              <Star className="h-4 w-4 text-amber-500" />
              Produtores Locais
            </h3>
            <div className="space-y-2">
              <AnimatePresence>
                {farmers.map((farmer, i) => (
                  <motion.div
                    key={farmer.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: sp, stiffness: 300, damping: 28, delay: i * 0.05 }}
                    className="r90-farmer-card flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card/60 hover:border-green-200/50 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 text-xl shrink-0">
                      {farmer.emoji}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold truncate">{farmer.name}</h4>
                        {!farmer.open && (
                          <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[9px] font-semibold dark:bg-red-900/30 dark:text-red-400">
                            Fechado
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">{farmer.farm}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {farmer.rating}
                        </span>
                        <span className="text-[10px] text-muted-foreground">({farmer.reviews})</span>
                        <span className="text-[10px] text-muted-foreground">· {farmer.distance}</span>
                      </div>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {farmer.specialties.map(s => (
                          <span key={s} className="px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 text-[9px] font-medium dark:bg-green-900/20 dark:text-green-400">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* View button */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Delivery from Farmers ── */}
          <motion.div
            className="r90-delivery-card p-4 rounded-xl border border-border/40"
            style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.04), rgba(20,184,166,0.08))' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 shrink-0">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold">Entrega do Produtor</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Receba em casa direto da feira. Pedidos acima de R$30 frete grátis!</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="shrink-0 min-h-[44px] px-3 py-2 rounded-lg bg-green-500 text-white text-[11px] font-semibold"
              >
                Saber mais
              </motion.button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <Card className="overflow-hidden border-border/40">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="h-20 rounded-xl bg-muted/50 animate-pulse" />
        {/* Day pills */}
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 w-24 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
        {/* Details grid */}
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-14 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
        {/* Produce cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    </Card>
  )
}
