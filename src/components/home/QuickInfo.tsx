'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Store, Sparkles, Clock, TrendingUp, MessageCircle, CloudSun, ChevronLeft, ChevronRight, Thermometer, Droplets, Sun, Cloud, CloudRain, CloudLightning, CloudSnow, CloudFog, Wind, Loader2 } from 'lucide-react'

// Mock data for the quick info panel
const quickStats = [
  { label: 'Produtos', value: '32', icon: Package, color: 'text-emerald-500 bg-emerald-500/10', progress: 78 },
  { label: 'Lojas', value: '8', icon: Store, color: 'text-amber-500 bg-amber-500/10', progress: 45 },
  { label: 'Ofertas', value: '12', icon: Sparkles, color: 'text-primary bg-primary/10', progress: 92 },
]

const recentOrders = [
  {
    id: 'o1',
    storeName: 'Açaí da Boa',
    productName: 'Açaí 500ml',
    status: 'Em andamento',
    time: 'Há 15 min',
    statusColor: 'text-amber-500 bg-amber-500/10',
    progress: 65,
  },
  {
    id: 'o2',
    storeName: 'Mercado do Zé',
    productName: 'Arroz Tio João 5kg',
    status: 'Entregue',
    time: 'Ontem',
    statusColor: 'text-emerald-500 bg-emerald-500/10',
    progress: 100,
  },
]

const dailyTips = [
  {
    id: 't1',
    storeName: 'Açaí da Boa',
    tip: 'Experimente o Açaí Premium com granola artesanal — clientes ganham 10% de cashback na primeira compra!',
    icon: MessageCircle,
    emoji: '🍇',
  },
  {
    id: 't2',
    storeName: 'Padaria Pão Quente',
    tip: 'Pão francês fresquinho todo dia até 7h da manhã. Peça 6 unidades por apenas R$ 6,00!',
    icon: TrendingUp,
    emoji: '🍞',
  },
  {
    id: 't3',
    storeName: 'Farmácia Vida',
    tip: 'Vitaminas com até 20% de desconto esta semana. Não perca a promoção de inverno!',
    icon: Sparkles,
    emoji: '💊',
  },
]

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

export function QuickInfo() {
  const [currentTip, setCurrentTip] = useState(0)
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(true)

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
          const temp = data.temp != null ? data.temp : 30
          const feelsLike = data.feelsLike != null ? data.feelsLike : temp + 4
          setWeather({
            temp: `${Math.round(temp)}°C`,
            condition: data.condition || 'Nuvens dispersas',
            humidity: `${data.humidity ?? 70}%`,
            feelsLike: `${Math.round(feelsLike)}°C`,
          })
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

  const weatherData = weather || fallbackWeather
  const WeatherIcon = getWeatherIcon(weatherData.condition)

  // Auto-rotate tips every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % dailyTips.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const nextTip = () => setCurrentTip(prev => (prev + 1) % dailyTips.length)
  const prevTip = () => setCurrentTip(prev => (prev - 1 + dailyTips.length) % dailyTips.length)

  return (
    <aside className="hidden lg:block w-[300px] xl:w-[340px] shrink-0">
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
                <>
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
              </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Resumo Rápido Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl border border-primary/10 overflow-hidden"
        >
          <div className="noise-bg relative p-4">
            <div className="relative z-10">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary animate-breathe" />
                Resumo Rápido
              </h3>
              <div className="space-y-3">
                {quickStats.map((stat) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ x: 2 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`h-9 w-9 rounded-lg ${stat.color} flex items-center justify-center shrink-0`}>
                      <stat.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                        <span className="text-sm font-bold">{stat.value}</span>
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
            </div>
          </div>
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
          <div className="space-y-2.5">
            {recentOrders.map((order) => (
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
                    <p className="text-xs font-semibold truncate">{order.productName}</p>
                    <p className="text-[10px] text-muted-foreground">{order.storeName}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${order.statusColor}`}>
                        {order.status}
                      </span>
                      <span className="text-[9px] text-muted-foreground">{order.time}</span>
                    </div>
                    {/* Order progress bar */}
                    <div className="mt-2 h-1 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${order.status === 'Entregue' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${order.progress}%` }}
                        transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Dicas do Dia — Carousel */}
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
            <div className="flex items-center gap-1">
              <button onClick={prevTip} className="h-6 w-6 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="text-[10px] text-muted-foreground tabular-nums">{currentTip + 1}/{dailyTips.length}</span>
              <button onClick={nextTip} className="h-6 w-6 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden min-h-[80px]">
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
                  <span className="text-base">{dailyTips[currentTip].emoji}</span>
                  <span className="text-[10px] font-semibold text-accent">{dailyTips[currentTip].storeName}</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{dailyTips[currentTip].tip}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {dailyTips.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTip(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentTip ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/20 hover:bg-muted-foreground/40'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </aside>
  )
}
