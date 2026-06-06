'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Store, Sparkles, Clock, TrendingUp, MessageCircle, CloudSun, ChevronLeft, ChevronRight, Thermometer, Droplets, Sun, Cloud, CloudRain, CloudLightning, CloudSnow, CloudFog, Wind, Loader2, ShoppingCart, RefreshCw } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/useAppStore'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { cachedFetch } from '@/lib/api-cache'

// Types for API responses
interface QuickStatsData {
  productCount: number
  storeCount: number
  offerCount: number
}

interface ApiOrderItem {
  productName: string
  quantity: number
  price: number
  total: number
}

interface ApiOrder {
  id: string
  orderNumber: string
  storeId: string
  storeName: string
  status: string
  total: number
  createdAt: string
  items: ApiOrderItem[]
}

interface ApiPromotion {
  id: string
  storeId?: string
  code?: string
  title: string
  type: string
  value: number
  description?: string | null
  endsAt?: string | null
}

// Weather icon mapping from Open-Meteo WMO codes / Portuguese conditions
function getWeatherIcon(condition: string) {
  const lower = condition.toLowerCase()
  if (lower.includes('sol') || lower.includes('clear') || lower.includes('ensolarado') || lower.includes('céu limpo')) return Sun
  if (lower.includes('parcial') || lower.includes('cloud')) return CloudSun
  if (lower.includes('nublado') || lower.includes('overcast') || lower.includes('coberto')) return Cloud
  if (lower.includes('chuva') || lower.includes('rain') || lower.includes('garoa') || lower.includes('chuvoso')) return CloudRain
  if (lower.includes('trovão') || lower.includes('thunder') || lower.includes('tempestade')) return CloudLightning
  if (lower.includes('névoa') || lower.includes('fog') || lower.includes('neblina')) return CloudFog
  if (lower.includes('neve') || lower.includes('snow')) return CloudSnow
  if (lower.includes('vento') || lower.includes('wind')) return Wind
  return CloudSun // default
}

interface WeatherData {
  temp: string
  condition: string
  humidity: string
  feelsLike: string
}

// Fallback mock data for when API is unavailable
const fallbackWeather: WeatherData = {
  temp: '32°C',
  condition: 'Parcialmente nublado',
  humidity: '78%',
  feelsLike: '36°C',
}

// Status mapping for order display
const statusMap: Record<string, { label: string; color: string; progress: number }> = {
  DELIVERING: { label: 'Em andamento', color: 'text-amber-500 bg-amber-500/10', progress: 65 },
  DELIVERED: { label: 'Entregue', color: 'text-emerald-500 bg-emerald-500/10', progress: 100 },
  PREPARING: { label: 'Preparando', color: 'text-orange-500 bg-orange-500/10', progress: 40 },
  CONFIRMED: { label: 'Confirmado', color: 'text-teal-500 bg-teal-500/10', progress: 25 },
  PENDING: { label: 'Pendente', color: 'text-amber-500 bg-amber-500/10', progress: 10 },
  CANCELLED: { label: 'Cancelado', color: 'text-red-500 bg-red-500/10', progress: 0 },
}

// Skeleton components for independent loading
function StatsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-6" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function OrdersSkeleton() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="p-2.5 rounded-lg bg-card/60 border border-border/40">
          <div className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function TipsSkeleton() {
  return (
    <div className="p-3 rounded-lg bg-gradient-to-r from-accent/5 to-primary/5 border border-accent/10">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4 mt-1" />
    </div>
  )
}

/* Stagger container for cards */
const cardStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}
const cardItemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 280, damping: 22 } },
}

/* Stat card emojis */
const statEmojis = ['📦', '🏪', '✨']

export function QuickInfo() {
  const { currentUser } = useAppStore()
  const [currentTip, setCurrentTip] = useState(0)
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(true)

  // Real data states
  const [stats, setStats] = useState<QuickStatsData | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState(false)

  const [recentOrders, setRecentOrders] = useState<ApiOrder[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState(false)

  const [promotions, setPromotions] = useState<ApiPromotion[]>([])
  const [promotionsLoading, setPromotionsLoading] = useState(true)
  const [promotionsError, setPromotionsError] = useState(false)

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const brasiliaOffset = -3
      const utc = now.getTime() + now.getTimezoneOffset() * 60000
      const brasiliaTime = new Date(utc + brasiliaOffset * 3600000)
      setCurrentTime(brasiliaTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
      setCurrentDate(brasiliaTime.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }))
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch real weather data from Open-Meteo API
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('/api/weather')
        if (res.ok) {
          const data = await res.json()
          const temp = Number(data.temp)
          const feelsLike = Number(data.feelsLike)
          const humidity = Number(data.humidity)
          const condition = data.condition || ''

          // Validate that all critical values are real numbers — use fallback if any are invalid
          if (!isNaN(temp) && !isNaN(feelsLike) && !isNaN(humidity) && condition.length > 0) {
            setWeather({
              temp: `${Math.round(temp)}°C`,
              condition,
              humidity: `${Math.round(humidity)}%`,
              feelsLike: `${Math.round(feelsLike)}°C`,
            })
          } else {
            setWeather(fallbackWeather)
          }
        } else {
          setWeather(fallbackWeather)
        }
      } catch {
        setWeather(fallbackWeather)
      } finally {
        setWeatherLoading(false)
      }
    }
    fetchWeather()
    // Refresh every 10 minutes (matches API cache TTL)
    const interval = setInterval(fetchWeather, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Fetch quick stats (products, stores, offers)
  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    setStatsError(false)
    try {
      const [productsRes, storesRes, offersRes] = await Promise.all([
        cachedFetch('/api/products?isOffer=true&limit=1'),
        cachedFetch('/api/stores?limit=1'),
        cachedFetch('/api/products?isOffer=true&limit=100'),
      ])

      let productTotal = productsRes?.total || 0
      let storeTotal = storesRes?.total || 0
      let offerCount = offersRes?.total || (offersRes?.products || []).length

      setStats({ productCount: productTotal, storeCount: storeTotal, offerCount })
    } catch {
      setStatsError(true)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // Fetch recent orders (auth-dependent)
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true)
    setOrdersError(false)
    try {
      const data = await cachedFetch('/api/orders?limit=3')
      setRecentOrders(data?.orders || [])
    } catch {
      setOrdersError(true)
    } finally {
      setOrdersLoading(false)
    }
  }, [])

  // Fetch promotions as "Dicas do Dia"
  const fetchPromotions = useCallback(async () => {
    setPromotionsLoading(true)
    setPromotionsError(false)
    try {
      const data = await cachedFetch('/api/promotions')
      setPromotions(data?.promotions || [])
    } catch {
      setPromotionsError(true)
    } finally {
      setPromotionsLoading(false)
    }
  }, [])

  // Fetch all data on mount
  useEffect(() => {
    fetchStats()
    fetchOrders()
    fetchPromotions()
  }, [fetchStats, fetchOrders, fetchPromotions])

  const weatherData = weather || fallbackWeather
  const WeatherIcon = getWeatherIcon(weatherData.condition)

  // Build stats display from real data
  const quickStats = stats
    ? [
        { label: 'Produtos', value: String(stats.productCount), icon: Package, color: 'text-emerald-500 bg-emerald-500/10', progress: Math.min(100, (stats.productCount / 200) * 100) },
        { label: 'Lojas', value: String(stats.storeCount), icon: Store, color: 'text-amber-500 bg-amber-500/10', progress: Math.min(100, (stats.storeCount / 30) * 100) },
        { label: 'Ofertas', value: String(stats.offerCount), icon: Sparkles, color: 'text-primary bg-primary/10', progress: Math.min(100, (stats.offerCount / 50) * 100) },
      ]
    : []

  // Build tips from promotions
  const tipEmojis = ['🎁', '🏷️', '🔥', '💰', '✨', '🎉']
  const tipIcons = [MessageCircle, TrendingUp, Sparkles, MessageCircle, TrendingUp, Sparkles]

  // Auto-rotate tips every 5s
  useEffect(() => {
    if (promotions.length <= 1) return
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % promotions.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [promotions.length])

  const nextTip = () => setCurrentTip(prev => (prev + 1) % Math.max(promotions.length, 1))
  const prevTip = () => setCurrentTip(prev => (prev - 1 + Math.max(promotions.length, 1)) % Math.max(promotions.length, 1))

  // Get promotion description text
  const getPromoText = (promo: ApiPromotion): string => {
    if (promo.description) return promo.description
    const discountText = promo.type === 'PERCENTAGE' ? `${promo.value}% de desconto` : `R$ ${promo.value.toFixed(2)} de desconto`
    return promo.code ? `Use o cupom ${promo.code} e ganhe ${discountText}!` : discountText
  }

  return (
    <aside className="hidden lg:block w-[300px] xl:w-[340px] shrink-0 r62-card-lift r95-quickinfo-card">
      <div className="sticky top-20 space-y-4">
        {/* Clock + Date */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-xl border border-primary/10 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold tabular-nums tracking-tight">{currentTime || '--:--'}</p>
              <p className="text-xs text-muted-foreground capitalize">{currentDate || '...'}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </motion.div>

        {/* Weather Widget */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl border border-primary/10 overflow-hidden"
        >
          <div className="gradient-mesh relative p-4">
            <div className="relative z-10">
              {weatherLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Dom Eliseu, PA</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold">{weatherData.temp}</span>
                    <span className="text-sm text-muted-foreground">{weatherData.condition}</span>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-200 to-orange-200 dark:from-amber-800/30 dark:to-orange-800/30 flex items-center justify-center shadow-lg"
                >
                  <WeatherIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </motion.div>
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Thermometer className="h-3.5 w-3.5 text-red-400" />
                  Sensação: {weatherData.feelsLike}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Droplets className="h-3.5 w-3.5 text-teal-400" />
                  Umidade: {weatherData.humidity}
                </div>
              </div>
              </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Resumo Rápido Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl border border-primary/10 overflow-hidden r34-quick-info-card-border"
        >
          <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5 r62-heading-gradient">
                <div className="w-2 h-2 rounded-full bg-primary animate-breathe" />
                Resumo Rápido
                <motion.span
                  className="r34-quick-info-float-emoji text-base ml-auto"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                >
                  📊
                </motion.span>
              </h3>
              {statsLoading && <StatsSkeleton />}
              {statsError && !statsLoading && (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground mb-2">Erro ao carregar estatísticas</p>
                  <button onClick={fetchStats} className="min-h-[44px] min-w-[44px] text-xs text-primary hover:underline flex items-center gap-1 mx-auto justify-center">
                    <RefreshCw className="h-3 w-3" /> Tentar novamente
                  </button>
                </div>
              )}
              {!statsLoading && !statsError && quickStats.length > 0 && (
                <div className="space-y-3">
                  {quickStats.map((stat) => (
                    <motion.div
                      key={stat.label}
                      whileHover={{ x: 2 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`h-9 w-9 rounded-lg ${stat.color} flex items-center justify-center shrink-0 r34-quick-info-icon-glow`}>
                        <stat.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                          <span className="text-sm font-bold r34-quick-info-number-glow"><AnimatedCounter value={Number(stat.value)} duration={800} locale /></span>
                        </div>
                        <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.progress}%` }}
                            transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
        </motion.div>

        {/* Pedidos Recentes Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl border border-primary/10 p-4"
        >
          <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            Pedidos Recentes
          </h3>
          {ordersLoading && <OrdersSkeleton />}
          {ordersError && !ordersLoading && (
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground mb-2">Erro ao carregar pedidos</p>
              <button onClick={fetchOrders} className="min-h-[44px] min-w-[44px] text-xs text-primary hover:underline flex items-center gap-1 mx-auto justify-center">
                <RefreshCw className="h-3 w-3" /> Tentar novamente
              </button>
            </div>
          )}
          {!ordersLoading && !ordersError && recentOrders.length === 0 && (
            <div className="text-center py-4">
              <ShoppingCart className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                {currentUser ? 'Nenhum pedido recente' : 'Faça login para ver pedidos'}
              </p>
            </div>
          )}
          {!ordersLoading && !ordersError && recentOrders.length > 0 && (
            <div className="space-y-2.5">
              {recentOrders.map((order) => {
                const status = statusMap[order.status] || statusMap.PENDING
                const firstItem = order.items?.[0]
                return (
                  <motion.div
                    key={order.id}
                    whileHover={{ x: 3 }}
                    className="p-2.5 rounded-lg bg-card/60 border border-border/40 hover:border-primary/20 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Package className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate">{firstItem?.productName || `Pedido ${order.orderNumber}`}</p>
                        <p className="text-[10px] text-muted-foreground">{order.storeName}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        {/* Order progress bar */}
                        <div className="mt-2 h-1 bg-muted/30 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${order.status === 'DELIVERED' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${status.progress}%` }}
                            transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Dicas do Dia — Carousel (from real promotions) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-xl border border-primary/10 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Dicas do Dia
            </h3>
            {promotions.length > 1 && (
              <div className="flex items-center gap-1">
                <button onClick={prevTip} className="h-6 w-6 min-h-[44px] min-w-[44px] rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="text-[10px] text-muted-foreground tabular-nums">{currentTip + 1}/{promotions.length}</span>
                <button onClick={nextTip} className="h-6 w-6 min-h-[44px] min-w-[44px] rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors">
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="relative overflow-hidden min-h-[80px]">
            {promotionsLoading && <TipsSkeleton />}
            {promotionsError && !promotionsLoading && (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground mb-2">Erro ao carregar dicas</p>
                <button onClick={fetchPromotions} className="min-h-[44px] min-w-[44px] text-xs text-primary hover:underline flex items-center gap-1 mx-auto justify-center">
                  <RefreshCw className="h-3 w-3" /> Tentar novamente
                </button>
              </div>
            )}
            {!promotionsLoading && !promotionsError && promotions.length === 0 && (
              <div className="p-3 rounded-lg bg-gradient-to-r from-accent/5 to-primary/5 border border-accent/10 text-center py-6">
                <Sparkles className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Nenhuma promoção ativa no momento</p>
              </div>
            )}
            {!promotionsLoading && !promotionsError && promotions.length > 0 && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTip}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-3 rounded-lg bg-gradient-to-r from-accent/5 to-primary/5 border border-accent/10"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-base">{tipEmojis[currentTip % tipEmojis.length]}</span>
                    <span className="text-[10px] font-semibold text-accent">
                      {promotions[currentTip].code
                        ? `Cupom: ${promotions[currentTip].code}`
                        : 'Promoção ativa'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-foreground/90">{promotions[currentTip].title}</p>
                  <p className="text-[11px] text-foreground/60 mt-0.5 leading-relaxed">
                    {getPromoText(promotions[currentTip])}
                  </p>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Carousel dots */}
          {promotions.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {promotions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTip(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentTip ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/20 hover:bg-muted-foreground/40'
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </aside>
  )
}
