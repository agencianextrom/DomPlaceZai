'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudRain, Sun, Cloud, CloudLightning, CloudDrizzle, Snowflake, Wind, Droplets, Thermometer, AlertTriangle } from 'lucide-react'

/* ── Types ── */
interface WeatherData {
  temp: number
  feelsLike: number
  humidity: number
  condition: string
  icon: string
  isDay: boolean
  windSpeed: number
  lat: number
  lon: number
}

interface HourForecast {
  hour: string
  temp: number
  icon: string
}

/* ── Icon resolver ── */
function getWeatherIcon(icon: string, size = 20) {
  const props = { size, className: 'text-white/90' }
  switch (icon) {
    case 'sun': return <Sun {...props} />
    case 'cloud-sun': return <Cloud className={`${props.className}`} style={{ opacity: 0.85 }} {...{ size }} />
    case 'cloud': return <Cloud {...props} />
    case 'cloud-drizzle': return <CloudDrizzle {...props} />
    case 'cloud-rain': case 'cloud-rain-wind': return <CloudRain {...props} />
    case 'cloud-lightning': return <CloudLightning {...props} />
    case 'cloud-fog': return <Cloud {...props} />
    case 'cloud-hail': return <CloudRain {...props} />
    case 'snowflake': return <Snowflake {...props} />
    default: return <Cloud {...props} />
  }
}

function getWeatherEmoji(icon: string): string {
  switch (icon) {
    case 'sun': return '☀️'
    case 'cloud-sun': return '⛅'
    case 'cloud': return '☁️'
    case 'cloud-drizzle': return '🌦️'
    case 'cloud-rain': case 'cloud-rain-wind': return '🌧️'
    case 'cloud-lightning': return '⛈️'
    case 'cloud-fog': return '🌫️'
    case 'cloud-hail': return '🌨️'
    case 'snowflake': return '❄️'
    default: return '🌤️'
  }
}

/* ── Determine delivery suitability ── */
function getDeliveryStatus(icon: string, temp: number): { good: boolean; message: string } {
  if (icon.includes('rain') || icon.includes('drizzle') || icon === 'cloud-lightning') {
    return { good: false, message: 'Chuva pode atrasar entregas' }
  }
  if (temp >= 38) {
    return { good: false, message: 'Calor extremo — entregas rápidas!' }
  }
  if (icon === 'cloud-lightning' || icon === 'cloud-hail') {
    return { good: false, message: 'Tempo instável, possível atraso' }
  }
  return { good: true, message: 'Ótimo dia para delivery!' }
}

/* ── Generate mock hourly forecast ── */
function generateHourlyForecast(baseTemp: number, baseIcon: string): HourForecast[] {
  const now = new Date()
  const hours: HourForecast[] = []
  for (let i = 0; i < 5; i++) {
    const h = new Date(now.getTime() + i * 3600000)
    const variation = Math.round((Math.random() - 0.5) * 4)
    hours.push({
      hour: `${h.getHours().toString().padStart(2, '0')}:00`,
      temp: baseTemp + variation,
      icon: baseIcon,
    })
  }
  return hours
}

/* ── Weather-themed gradient ── */
function getWeatherGradient(icon: string, temp: number, isDay: boolean): string {
  if (icon === 'sun' || icon === 'cloud-sun') {
    return temp > 30
      ? 'from-orange-500 via-amber-500 to-yellow-500'
      : 'from-sky-400 via-cyan-400 to-blue-400'
  }
  if (icon.includes('rain') || icon.includes('drizzle') || icon === 'cloud-lightning') {
    return 'from-slate-600 via-blue-700 to-indigo-800'
  }
  if (icon === 'snowflake' || icon === 'cloud-hail') {
    return 'from-blue-300 via-indigo-300 to-purple-400'
  }
  if (icon === 'cloud') {
    return isDay
      ? 'from-slate-400 via-gray-400 to-zinc-500'
      : 'from-slate-700 via-gray-700 to-zinc-800'
  }
  return 'from-sky-400 via-cyan-400 to-blue-400'
}

/* ── Floating particles matching weather ── */
function WeatherParticles({ icon }: { icon: string }) {
  const isRain = icon.includes('rain') || icon.includes('drizzle') || icon === 'cloud-lightning'
  const isSnow = icon === 'snowflake' || icon === 'cloud-hail'
  const count = isRain ? 6 : isSnow ? 5 : 3

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const isRainP = isRain
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: isRainP ? 2 : isSnow ? 4 : 3,
              height: isRainP ? 10 : isSnow ? 4 : 3,
              left: `${10 + i * 17}%`,
              top: -5,
              backgroundColor: isRainP ? 'rgba(200,220,255,0.6)' : isSnow ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,200,0.4)',
            }}
            animate={{
              y: [0, 120],
              x: isRainP ? [0, -8, 4, -6, 0] : isSnow ? [0, 15, -10, 20, 0] : [0, 5, -5, 0],
              opacity: [0, 1, 1, 0.6, 0],
            }}
            transition={{
              duration: isRainP ? 1.2 + Math.random() * 0.5 : isSnow ? 3 + Math.random() : 4 + Math.random(),
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'linear' as const,
            }}
          />
        )
      })}
    </div>
  )
}

/* ── CSS ── */
const WEATHER_STYLE = `
@keyframes weather-glow {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}
`

/* ── Animation variants ── */
const containerVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 22,
    },
  },
}

const tempVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 350,
      damping: 18,
    },
  },
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/weather')
      .then((r) => {
        if (!r.ok) throw new Error('Weather API failed')
        return r.json() as Promise<Partial<WeatherData> & { error?: string }>
      })
      .then((data) => {
        if (cancelled) return
        if (data && data.temp !== undefined && !data.error) {
          setWeather({
            temp: data.temp,
            feelsLike: data.feelsLike ?? data.temp,
            humidity: data.humidity ?? 50,
            condition: data.condition ?? 'Ensolarado',
            icon: data.icon ?? 'sun',
            isDay: data.isDay ?? true,
            windSpeed: data.windSpeed ?? 0,
            lat: data.lat ?? -3.39,
            lon: data.lon ?? -50.36,
          })
        } else {
          // Use mock fallback
          setWeather({
            temp: 32,
            feelsLike: 35,
            humidity: 72,
            condition: 'Parcialmente nublado',
            icon: 'cloud-sun',
            isDay: true,
            windSpeed: 8,
            lat: -3.39,
            lon: -50.36,
          })
        }
      })
      .catch(() => {
        if (cancelled) return
        // Fallback mock data
        setError(true)
        setWeather({
          temp: 30,
          feelsLike: 33,
          humidity: 68,
          condition: 'Céu limpo',
          icon: 'sun',
          isDay: true,
          windSpeed: 12,
          lat: -3.39,
          lon: -50.36,
        })
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const deliveryStatus = useMemo(() => {
    if (!weather) return { good: true, message: 'Verificando...' }
    return getDeliveryStatus(weather.icon, weather.temp)
  }, [weather])

  const hourlyForecast = useMemo(() => {
    if (!weather) return []
    return generateHourlyForecast(weather.temp, weather.icon)
  }, [weather])

  const gradient = weather ? getWeatherGradient(weather.icon, weather.temp, weather.isDay) : 'from-sky-400 to-blue-500'

  if (loading) {
    return (
      <div className="rounded-2xl bg-muted animate-pulse h-20 w-full" />
    )
  }

  if (!weather) return null

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: WEATHER_STYLE }} />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`relative rounded-2xl overflow-hidden bg-gradient-to-r ${gradient} shadow-lg r62-card-lift`}
      >
        {/* Floating weather particles */}
        <WeatherParticles icon={weather.icon} />

        {/* Glass overlay */}
        <div className="absolute inset-0 bg-white/[0.08] backdrop-blur-md" />

        {/* Content — compact horizontal layout */}
        <div className="relative p-4 flex items-center gap-4">
          {/* Temperature & condition */}
          <div className="flex items-center gap-3 min-w-0">
            <motion.div
              variants={tempVariants}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              <motion.span
                className="text-5xl sm:text-6xl font-extrabold text-white leading-none"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
              >
                {weather.temp}°
              </motion.span>
            </motion.div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <motion.span
                  className="text-2xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }}
                >
                  {getWeatherEmoji(weather.icon)}
                </motion.span>
                <p className="text-sm font-semibold text-white truncate">{weather.condition}</p>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-white/70">
                <span className="text-[11px] flex items-center gap-0.5">
                  <Thermometer className="h-3 w-3" />
                  {weather.feelsLike}° sensação
                </span>
                <span className="text-[11px] flex items-center gap-0.5">
                  <Droplets className="h-3 w-3" />
                  {weather.humidity}%
                </span>
              </div>
            </div>
          </div>

          {/* Hourly forecast strip */}
          <div className="hidden sm:flex items-center gap-2 ml-auto">
            {hourlyForecast.map((h, i) => (
              <motion.div
                key={h.hour}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06, type: 'spring' as const, stiffness: 300, damping: 20 }}
                className="flex flex-col items-center gap-0.5 bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1.5"
              >
                <span className="text-[10px] text-white/70 font-medium">{h.hour}</span>
                <motion.span
                  className="text-sm"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' as const }}
                >
                  {getWeatherEmoji(h.icon)}
                </motion.span>
                <span className="text-[11px] font-bold text-white">{h.temp}°</span>
              </motion.div>
            ))}
          </div>

          {/* Delivery indicator */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, type: 'spring' as const, stiffness: 300, damping: 20 }}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm text-[11px] font-semibold ${
              deliveryStatus.good
                ? 'bg-emerald-400/20 text-emerald-100 border border-emerald-400/30'
                : 'bg-amber-400/20 text-amber-100 border border-amber-400/30'
            }`}
          >
            {deliveryStatus.good ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
                className="h-2 w-2 rounded-full bg-emerald-400"
              />
            ) : (
              <AlertTriangle className="h-3 w-3" />
            )}
            <span className="hidden sm:inline">{deliveryStatus.message}</span>
            <span className="sm:hidden">{deliveryStatus.good ? 'Delivery OK' : 'Atenção'}</span>
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}
