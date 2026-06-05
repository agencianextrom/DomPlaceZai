'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Rocket,
  Bell,
  BellRing,
  BellOff,
  Sparkles,
  ChevronRight,
  Clock,
  Share2,
  Mail,
  Phone,
  Moon,
  Sun,
  MessageSquare,
  Zap,
  TrendingUp,
  Users,
  Eye,
  Trophy,
  Flame,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

/* ────────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────────── */

interface UpcomingProduct {
  id: string
  name: string
  emoji: string
  category: string
  launchDate: Date
  launchPrice: string
  expectedPrice: string
  interestCount: number
  gradient: string
  description: string
}

interface PastLaunch {
  id: string
  name: string
  emoji: string
  category: string
  price: string
  soldPercent: number
  gradient: string
}

/* ────────────────────────────────────────────────────────────────────
   Mock Data — 6 upcoming products, 3 past launches
   ──────────────────────────────────────────────────────────────────── */

function generateUpcomingProducts(): UpcomingProduct[] {
  const now = new Date()
  return [
    {
      id: 'r47-up-1',
      name: 'Fone Bluetooth Pro X',
      emoji: '🎧',
      category: 'Eletrônicos',
      launchDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000),
      launchPrice: 'R$ 249,90',
      expectedPrice: 'R$ 399,90',
      interestCount: 534,
      gradient: 'from-blue-100 to-indigo-200',
      description: 'Cancelamento de ruído ativo, 40h de bateria',
    },
    {
      id: 'r47-up-2',
      name: 'Vestido Midi Floral',
      emoji: '👗',
      category: 'Moda',
      launchDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000),
      launchPrice: 'R$ 159,90',
      expectedPrice: 'R$ 249,90',
      interestCount: 287,
      gradient: 'from-pink-100 to-rose-200',
      description: 'Tecido orgânico, modelagem exclusiva',
    },
    {
      id: 'r47-up-3',
      name: 'Luminária Smart LED',
      emoji: '💡',
      category: 'Casa',
      launchDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
      launchPrice: 'R$ 129,90',
      expectedPrice: 'R$ 199,90',
      interestCount: 412,
      gradient: 'from-amber-100 to-yellow-200',
      description: 'RGB 16M cores, compatível com Alexa',
    },
    {
      id: 'r47-up-4',
      name: 'Café Especial Cerrado',
      emoji: '☕',
      category: 'Alimentos',
      launchDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000),
      launchPrice: 'R$ 39,90',
      expectedPrice: 'R$ 59,90',
      interestCount: 156,
      gradient: 'from-orange-100 to-amber-200',
      description: 'Torrefação artesanal, 500g grãos premium',
    },
    {
      id: 'r47-up-5',
      name: 'Smartwatch Fitness V3',
      emoji: '⌚',
      category: 'Eletrônicos',
      launchDate: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      launchPrice: 'R$ 349,90',
      expectedPrice: 'R$ 549,90',
      interestCount: 723,
      gradient: 'from-emerald-100 to-teal-200',
      description: 'GPS integrado, SpO2, 14 dias de bateria',
    },
    {
      id: 'r47-up-6',
      name: 'Tênis Running Cloud',
      emoji: '👟',
      category: 'Moda',
      launchDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000),
      launchPrice: 'R$ 299,90',
      expectedPrice: 'R$ 449,90',
      interestCount: 891,
      gradient: 'from-violet-100 to-purple-200',
      description: 'Entressola cloud, palmilha ortopédica',
    },
  ]
}

function generatePastLaunches(): PastLaunch[] {
  return [
    {
      id: 'r47-past-1',
      name: 'Drone Mini 4K',
      emoji: '🛸',
      category: 'Eletrônicos',
      price: 'R$ 1.299,90',
      soldPercent: 94,
      gradient: 'from-sky-100 to-blue-200',
    },
    {
      id: 'r47-past-2',
      name: 'Kit Skincare Orgânico',
      emoji: '🧴',
      category: 'Moda',
      price: 'R$ 89,90',
      soldPercent: 87,
      gradient: 'from-lime-100 to-green-200',
    },
    {
      id: 'r47-past-3',
      name: 'Panela Elétrica Smart',
      emoji: '🍳',
      category: 'Casa',
      price: 'R$ 219,90',
      soldPercent: 91,
      gradient: 'from-red-100 to-orange-200',
    },
  ]
}

/* ────────────────────────────────────────────────────────────────────
   Countdown Hook
   ──────────────────────────────────────────────────────────────────── */

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalMs: number
}

function useCountdown(targetDate: Date): CountdownTime {
  const [time, setTime] = useState<CountdownTime>(() => calcCountdown(targetDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(calcCountdown(targetDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  return time
}

function calcCountdown(targetDate: Date): CountdownTime {
  const diff = Math.max(0, targetDate.getTime() - Date.now())
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    totalMs: diff,
  }
}

/* ────────────────────────────────────────────────────────────────────
   Animated Counter Hook — for launch stats
   ──────────────────────────────────────────────────────────────────── */

function useAnimatedCounter(target: number, duration: number = 1500) {
  const [value, setValue] = useState(0)
  const startTime = useRef<number | null>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    startTime.current = Date.now()
    const animate = () => {
      if (startTime.current === null) return
      const elapsed = Date.now() - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration])

  return value
}

/* ────────────────────────────────────────────────────────────────────
   Feature 1: Launch Countdown — Animated Digit Flip
   ──────────────────────────────────────────────────────────────────── */

function CountdownDigit({ value, label, large = false }: { value: number; label: string; large?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        ref={ref}
        key={value}
        initial={{ rotateX: -90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
        className={`relative overflow-hidden rounded-xl flex items-center justify-center font-bold tabular-nums
          ${large
            ? 'w-16 h-20 sm:w-20 sm:h-24 text-3xl sm:text-4xl'
            : 'w-10 h-12 text-sm sm:text-base'
          }`}
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(217, 119, 6, 0.25)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          color: '#b45309',
        }}
      >
        {String(value).padStart(2, '0')}
        {/* Flip line */}
        <div
          className="absolute left-0 right-0 top-1/2 h-px"
          style={{ background: 'rgba(0, 0, 0, 0.06)' }}
        />
      </motion.div>
      <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider" style={{ color: '#9ca3af' }}>
        {label}
      </span>
    </div>
  )
}

function CountdownDisplay({ targetDate, large = false }: { targetDate: Date; large?: boolean }) {
  const time = useCountdown(targetDate)
  const separatorSize = large ? 'text-2xl sm:text-3xl mt-[-12px]' : 'text-lg mt-[-10px]'

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <CountdownDigit value={time.days} label="Dias" large={large} />
      <motion.span
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' as const }}
        className={`font-bold ${separatorSize}`}
        style={{ color: '#f59e0b' }}
      >
        :
      </motion.span>
      <CountdownDigit value={time.hours} label="Horas" large={large} />
      <motion.span
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.5 }}
        className={`font-bold ${separatorSize}`}
        style={{ color: '#f59e0b' }}
      >
        :
      </motion.span>
      <CountdownDigit value={time.minutes} label="Min" large={large} />
      <motion.span
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.25 }}
        className={`font-bold ${separatorSize}`}
        style={{ color: '#f59e0b' }}
      >
        :
      </motion.span>
      <CountdownDigit value={time.seconds} label="Seg" large={large} />
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────
   Feature 8: Early Access Badge
   ──────────────────────────────────────────────────────────────────── */

function EarlyAccessBadge() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -15 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 20, delay: 0.3 }}
      className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(245, 158, 11, 0.2))',
        border: '1px solid rgba(234, 179, 8, 0.4)',
      }}
    >
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' as const }}
      >
        <Trophy className="h-3.5 w-3.5" style={{ color: '#ca8a04' }} />
      </motion.div>
      <span className="text-[11px] font-bold" style={{ color: '#a16207' }}>
        Acesso antecipado
      </span>
      <motion.div
        className="absolute inset-0"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const, repeatDelay: 1 }}
      >
        <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]" />
      </motion.div>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────────────────
   Shimmer Badge for "Lançamento"
   ──────────────────────────────────────────────────────────────────── */

function LaunchShimmerBadge() {
  return (
    <div className="relative overflow-hidden rounded-full r47-drop-badge">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.8), rgba(245, 158, 11, 0.8))' }} />
      <motion.div
        className="absolute inset-0"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const, repeatDelay: 0.8 }}
      >
        <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg]" />
      </motion.div>
      <div className="relative px-2 py-0.5 flex items-center gap-1">
        <Sparkles className="h-2.5 w-2.5 text-white" />
        <span className="text-[9px] font-bold text-white">Lançamento</span>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────
   Feature 2: Product Preview — Hero Card
   ──────────────────────────────────────────────────────────────────── */

function HeroProductPreview({ product }: { product: UpcomingProduct }) {
  const countdown = useCountdown(product.launchDate)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 200, damping: 25 }}
      className="r47-launch-card relative overflow-hidden rounded-2xl"
      style={{
        background: `linear-gradient(135deg, ${product.gradient}, rgba(255, 255, 255, 0.6))`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      }}
    >
      <div className="p-5 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
        {/* Emoji Hero */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
          className="text-7xl sm:text-8xl drop-shadow-lg shrink-0"
        >
          {product.emoji}
        </motion.div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ background: 'rgba(217, 119, 6, 0.15)', color: '#b45309' }}>
              {product.category}
            </span>
            <EarlyAccessBadge />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold mb-1" style={{ color: '#1f2937' }}>
            {product.name}
          </h2>
          <p className="text-sm mb-4" style={{ color: '#6b7280' }}>
            {product.description}
          </p>

          {/* Preço especial badge */}
          <div className="flex items-center gap-3 justify-center sm:justify-start mb-5">
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20, delay: 0.2 }}
              className="text-2xl sm:text-3xl font-black"
              style={{ color: '#b45309' }}
            >
              {product.launchPrice}
            </motion.span>
            <span className="relative px-3 py-1 rounded-full text-xs font-bold text-white overflow-hidden" style={{ background: '#dc2626' }}>
              Preço especial de lançamento
              <motion.div
                className="absolute inset-0"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const, repeatDelay: 1.2 }}
              >
                <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]" />
              </motion.div>
            </span>
          </div>

          <div className="text-xs mb-3" style={{ color: '#9ca3af' }}>
            Preço sugerido: <span className="line-through">{product.expectedPrice}</span>
          </div>

          {/* Feature 1: Large Countdown */}
          <div className="flex justify-center sm:justify-start">
            <CountdownDisplay targetDate={product.launchDate} large />
          </div>
        </div>
      </div>

      {/* Bottom interest bar */}
      <div className="px-5 sm:px-8 pb-5">
        <div className="flex items-center justify-between text-xs mb-2" style={{ color: '#6b7280' }}>
          <span className="font-medium">{countdown.totalMs > 0 ? 'Contagem regressiva ativa' : 'Lançamento concluído!'}</span>
          <span className="font-bold" style={{ color: '#d97706' }}>
            {product.interestCount} interessados
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0, 0, 0, 0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #f59e0b, #ea580c)' }}
            initial={{ width: '0%' }}
            animate={{ width: `${Math.min((product.interestCount / 1000) * 100, 95)}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' as const }}
          />
        </div>
      </div>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────────────────
   Feature 3: Waitlist Signup
   ──────────────────────────────────────────────────────────────────── */

function WaitlistSignup({ productId }: { productId: string }) {
  const [contact, setContact] = useState('')
  const [joined, setJoined] = useState(false)
  const [waitlistPosition, setWaitlistPosition] = useState(0)
  const [inputMode, setInputMode] = useState<'email' | 'phone'>('email')

  const handleJoin = useCallback(() => {
    if (!contact.trim()) return
    setWaitlistPosition(100 + Math.floor(Math.random() * 200))
    setJoined(true)
    toast.success('Você entrou na lista!', {
      description: `Posição na lista: #${waitlistPosition || 127}`,
    })
  }, [contact, waitlistPosition])

  return (
    <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
      <AnimatePresence mode="wait">
        {!joined ? (
          <motion.div
            key="signup"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
          >
            <h3 className="text-sm font-bold mb-3" style={{ color: '#92400e' }}>
              <BellRing className="h-4 w-4 inline mr-1" style={{ color: '#d97706' }} />
              Entrar na lista de espera
            </h3>

            {/* Input mode toggle */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setInputMode('email')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${inputMode === 'email'
                  ? 'text-white'
                  : ''
                }`}
                style={inputMode === 'email'
                  ? { background: 'rgba(217, 119, 6, 1)' }
                  : { background: 'rgba(217, 119, 6, 0.1)', color: '#b45309' }
                }
              >
                <Mail className="h-3 w-3" />
                Email
              </button>
              <button
                onClick={() => setInputMode('phone')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${inputMode === 'phone'
                  ? 'text-white'
                  : ''
                }`}
                style={inputMode === 'phone'
                  ? { background: 'rgba(217, 119, 6, 1)' }
                  : { background: 'rgba(217, 119, 6, 0.1)', color: '#b45309' }
                }
              >
                <Phone className="h-3 w-3" />
                Telefone
              </button>
            </div>

            <div className="flex gap-2">
              <Input
                type={inputMode === 'email' ? 'email' : 'tel'}
                placeholder={inputMode === 'email' ? 'seu@email.com' : '(11) 99999-9999'}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                className="flex-1 h-10 text-sm rounded-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(217, 119, 6, 0.3)',
                }}
              />
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleJoin}
                  className="h-10 px-5 rounded-lg font-bold text-sm text-white"
                  style={{ background: 'linear-gradient(135deg, #d97706, #ea580c)' }}
                >
                  Entrar na lista
                </Button>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="confirmed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
            className="text-center py-2"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, type: 'spring' as const, stiffness: 300, damping: 15 }}
            >
              <span className="text-4xl">🎉</span>
            </motion.div>
            <p className="text-lg font-black mt-2" style={{ color: '#b45309' }}>
              Você é o <span className="inline-block text-2xl">#{waitlistPosition}</span>!
            </p>
            <p className="text-xs mt-1" style={{ color: '#92400e' }}>
              Você será notificado antes do lançamento
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────
   Feature 4: Launch Categories Tabs
   ──────────────────────────────────────────────────────────────────── */

const CATEGORIES = ['Todos', 'Eletrônicos', 'Moda', 'Casa', 'Alimentos'] as const

function CategoryTabs({ active, onChange }: { active: string; onChange: (cat: string) => void }) {
  const tabsRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={tabsRef} className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat
        return (
          <motion.button
            key={cat}
            onClick={() => onChange(cat)}
            className={`relative px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${isActive ? 'text-white' : ''}`}
            style={isActive
              ? { background: 'rgba(217, 119, 6, 1)' }
              : { background: 'rgba(217, 119, 6, 0.08)', color: '#b45309' }
            }
            whileTap={{ scale: 0.95 }}
          >
            {cat}
            {isActive && (
              <motion.div
                layoutId="r47-cat-indicator"
                className="absolute inset-0 rounded-full"
                style={{ background: 'rgba(217, 119, 6, 1)' }}
                transition={{ type: 'spring' as const, stiffness: 350, damping: 30 }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────
   Feature 6: Drop Alert Toggle — Bell with ring pulse
   ──────────────────────────────────────────────────────────────────── */

function DropAlertToggle({ productId }: { productId: string }) {
  const [active, setActive] = useState(false)

  const toggle = useCallback(() => {
    setActive((prev) => {
      const next = !prev
      toast[next ? 'success' : 'info'](
        next ? 'Notificação ativada!' : 'Notificação desativada',
      )
      return next
    })
  }, [])

  return (
    <motion.button
      onClick={toggle}
      className="relative p-2 rounded-full transition-colors"
      style={{ background: active ? 'rgba(217, 119, 6, 0.15)' : 'rgba(0, 0, 0, 0.04)' }}
      whileTap={{ scale: 0.9 }}
    >
      {active ? (
        <Bell className="h-4 w-4" style={{ color: '#d97706' }} />
      ) : (
        <BellOff className="h-4 w-4" style={{ color: '#9ca3af' }} />
      )}

      {/* Animated ring pulse when active */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: '2px solid rgba(217, 119, 6, 0.5)' }}
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 1.6, opacity: 0 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' as const }}
          />
        )}
      </AnimatePresence>

      {/* Small dot indicator */}
      {active && (
        <motion.div
          className="absolute top-1 right-1 w-2 h-2 rounded-full"
          style={{ background: '#d97706' }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
        />
      )}
    </motion.button>
  )
}

/* ────────────────────────────────────────────────────────────────────
   Feature 12: Share Launch — Web Share API
   ──────────────────────────────────────────────────────────────────── */

function ShareLaunchButton({ productName }: { productName: string }) {
  const handleShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Lançamento: ${productName}`,
          text: `Confira o novo lançamento ${productName} no DomPlace!`,
          url: window.location.href,
        })
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard?.writeText(window.location.href)
      toast.success('Link copiado!', { description: 'Compartilhe com seus amigos' })
    }
  }, [productName])

  return (
    <motion.div whileTap={{ scale: 0.9 }}>
      <button
        onClick={handleShare}
        className="p-2 rounded-full transition-colors"
        style={{ background: 'rgba(0, 0, 0, 0.04)' }}
        title="Compartilhar lançamento"
      >
        <Share2 className="h-4 w-4" style={{ color: '#6b7280' }} />
      </button>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────────────────
   Feature 5: Upcoming Drop Card
   ──────────────────────────────────────────────────────────────────── */

function UpcomingDropCard({ product, index }: { product: UpcomingProduct; index: number }) {
  const time = useCountdown(product.launchDate)
  const isExpired = time.totalMs <= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: Math.min(index * 0.08, 0.5),
        type: 'spring' as const,
        stiffness: 200,
        damping: 25,
      }}
      className="r47-drop-card group"
    >
      <Card
        className="overflow-hidden h-full transition-all duration-300 hover:-translate-y-1 relative"
        style={{
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(217, 119, 6, 0.12)',
        }}
      >
        <CardContent className="p-0 h-full flex flex-col">
          {/* Image area */}
          <div className={`relative aspect-[4/3] flex items-center justify-center bg-gradient-to-br ${product.gradient} overflow-hidden`}>
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
              className="text-5xl drop-shadow-md z-10"
            >
              {product.emoji}
            </motion.div>

            {/* Launch shimmer badge */}
            <div className="absolute top-2 left-2 z-20">
              <LaunchShimmerBadge />
            </div>

            {/* Countdown badge */}
            {!isExpired ? (
              <div
                className="absolute top-2 right-2 z-20 px-2 py-1 rounded-lg text-[10px] font-bold text-white"
                style={{ background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)' }}
              >
                {time.days}d {time.hours}h
              </div>
            ) : (
              <div className="absolute top-2 right-2 z-20">
                <Badge className="text-[10px] bg-emerald-500 text-white border-0">
                  Disponível!
                </Badge>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3 flex flex-col flex-1">
            <h3 className="text-sm font-bold line-clamp-1" style={{ color: '#1f2937' }}>
              {product.name}
            </h3>
            <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: '#6b7280' }}>
              {product.description}
            </p>

            {/* Price */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-base font-black" style={{ color: '#b45309' }}>
                {product.launchPrice}
              </span>
              <span className="text-[10px] line-through" style={{ color: '#9ca3af' }}>
                {product.expectedPrice}
              </span>
            </div>

            {/* Interest count */}
            <div className="flex items-center gap-1 mt-1.5">
              <Users className="h-3 w-3" style={{ color: '#9ca3af' }} />
              <span className="text-[10px] font-medium" style={{ color: '#6b7280' }}>
                {product.interestCount} interessados
              </span>
            </div>

            {/* Actions row */}
            <div className="flex items-center justify-between mt-auto pt-3">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(217, 119, 6, 0.1)', color: '#b45309' }}>
                {product.category}
              </span>
              <div className="flex items-center gap-1">
                <ShareLaunchButton productName={product.name} />
                <DropAlertToggle productId={product.id} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────────────────
   Feature 7: Past Launch Card
   ──────────────────────────────────────────────────────────────────── */

function PastLaunchCard({ product, index }: { product: PastLaunch; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.1,
        type: 'spring' as const,
        stiffness: 250,
        damping: 25,
      }}
      className="r47-past-card"
    >
      <Card
        className="overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
        style={{
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <CardContent className="flex items-center gap-3 p-3">
          {/* Emoji */}
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center shrink-0`}>
            <span className="text-2xl">{product.emoji}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold line-clamp-1" style={{ color: '#1f2937' }}>
              {product.name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold" style={{ color: '#b45309' }}>{product.price}</span>
              <Badge className="text-[9px] px-1.5 py-0 border-0 bg-emerald-100 text-emerald-700">
                Disponível agora
              </Badge>
            </div>
            {/* Sold bar */}
            <div className="mt-1.5">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0, 0, 0, 0.06)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: '#10b981' }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${product.soldPercent}%` }}
                  transition={{ duration: 1, delay: index * 0.15, ease: 'easeOut' as const }}
                />
              </div>
              <span className="text-[9px] mt-0.5 inline-block" style={{ color: '#6b7280' }}>
                {product.soldPercent}% vendidos
              </span>
            </div>
          </div>

          {/* CTA */}
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              className="h-8 px-3 text-[11px] font-bold rounded-lg text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
            >
              <Eye className="h-3 w-3 mr-1" />
              Ver produto
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────────────────
   Feature 9: Launch Stats — Animated Counters
   ──────────────────────────────────────────────────────────────────── */

function LaunchStats() {
  const launchCount = useAnimatedCounter(12, 1800)
  const soldPercent = useAnimatedCounter(89, 2000)
  const memberCount = useAnimatedCounter(3247, 2200)

  const stats: { icon: typeof Rocket; label: string; value: number; suffix: string; color: string }[] = [
    { icon: Flame, label: 'lançamentos este mês', value: launchCount, suffix: '', color: '#d97706' },
    { icon: TrendingUp, label: 'vendidos em 24h', value: soldPercent, suffix: '%', color: '#059669' },
    { icon: Users, label: 'na lista de espera', value: memberCount, suffix: '', color: '#7c3aed' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 r47-launch-stats">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 0.3 + i * 0.1,
            type: 'spring' as const,
            stiffness: 250,
            damping: 25,
          }}
          className="p-4 rounded-xl text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.6)',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
          }}
        >
          <stat.icon className="h-5 w-5 mx-auto mb-2" style={{ color: stat.color }} />
          <div className="text-2xl sm:text-3xl font-black" style={{ color: stat.color }}>
            {stat.value}{stat.suffix}
          </div>
          <div className="text-[10px] sm:text-xs mt-1 font-medium" style={{ color: '#6b7280' }}>
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────
   Feature 10: Notification Preferences
   ──────────────────────────────────────────────────────────────────── */

function NotificationPreferences() {
  const [quietHours, setQuietHours] = useState(false)
  const [quietStart, setQuietStart] = useState('22:00')
  const [quietEnd, setQuietEnd] = useState('07:00')
  const [prefs, setPrefs] = useState({
    push: true,
    email: true,
    sms: false,
  })

  const togglePref = useCallback((key: 'push' | 'email' | 'sms') => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
    toast.info('Preferência atualizada')
  }, [])

  const prefItems: { key: 'push' | 'email' | 'sms'; icon: typeof Bell; label: string; desc: string }[] = [
    { key: 'push', icon: Bell, label: 'Push', desc: 'Notificações no navegador' },
    { key: 'email', icon: Mail, label: 'Email', desc: 'Avisos por email' },
    { key: 'sms', icon: MessageSquare, label: 'SMS', desc: 'Mensagens de texto' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 250, damping: 25, delay: 0.4 }}
      className="r47-notif-prefs p-4 rounded-xl"
      style={{
        background: 'rgba(243, 244, 246, 0.6)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#374151' }}>
        <Zap className="h-4 w-4" style={{ color: '#d97706' }} />
        Preferências de Notificação
      </h3>

      {/* Notification type toggles */}
      <div className="space-y-2 mb-4">
        {prefItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <item.icon className="h-4 w-4" style={{ color: prefs[item.key] ? '#d97706' : '#9ca3af' }} />
              <div>
                <span className="text-xs font-medium" style={{ color: '#374151' }}>{item.label}</span>
                <span className="text-[10px] ml-1.5" style={{ color: '#9ca3af' }}>{item.desc}</span>
              </div>
            </div>
            <motion.button
              onClick={() => togglePref(item.key)}
              className="relative w-10 h-6 rounded-full transition-colors"
              style={{ background: prefs[item.key] ? '#d97706' : 'rgba(0, 0, 0, 0.12)' }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                className="absolute top-1 w-4 h-4 rounded-full bg-white"
                style={{ boxShadow: '0 1px 4px rgba(0, 0, 0, 0.15)' }}
                animate={{ left: prefs[item.key] ? '20px' : '4px' }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
              />
            </motion.button>
          </div>
        ))}
      </div>

      {/* Quiet hours */}
      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4" style={{ color: '#6366f1' }} />
          <div>
            <span className="text-xs font-medium" style={{ color: '#374151' }}>Horário silencioso</span>
            <p className="text-[10px]" style={{ color: '#9ca3af' }}>Não notificar neste período</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {quietHours && (
            <div className="flex items-center gap-1">
              <input
                type="time"
                value={quietStart}
                onChange={(e) => setQuietStart(e.target.value)}
                className="w-16 h-7 text-[10px] rounded border text-center"
                style={{ border: '1px solid rgba(99, 102, 241, 0.3)', background: 'rgba(255, 255, 255, 0.8)' }}
              />
              <span className="text-[10px]" style={{ color: '#9ca3af' }}>até</span>
              <input
                type="time"
                value={quietEnd}
                onChange={(e) => setQuietEnd(e.target.value)}
                className="w-16 h-7 text-[10px] rounded border text-center"
                style={{ border: '1px solid rgba(99, 102, 241, 0.3)', background: 'rgba(255, 255, 255, 0.8)' }}
              />
            </div>
          )}
          <motion.button
            onClick={() => setQuietHours((p) => !p)}
            className="relative w-10 h-6 rounded-full transition-colors"
            style={{ background: quietHours ? '#6366f1' : 'rgba(0, 0, 0, 0.12)' }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              className="absolute top-1 w-4 h-4 rounded-full bg-white"
              style={{ boxShadow: '0 1px 4px rgba(0, 0, 0, 0.15)' }}
              animate={{ left: quietHours ? '20px' : '4px' }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
            />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────────────────
   MAIN COMPONENT — ProductLaunchAlert
   ──────────────────────────────────────────────────────────────────── */

export default function ProductLaunchAlert() {
  const upcomingProducts = useMemo(() => generateUpcomingProducts(), [])
  const pastLaunches = useMemo(() => generatePastLaunches(), [])
  const [activeCategory, setActiveCategory] = useState('Todos')

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'Todos') return upcomingProducts
    return upcomingProducts.filter((p) => p.category === activeCategory)
  }, [activeCategory, upcomingProducts])

  const featuredProduct = upcomingProducts[0]

  return (
    <motion.section
      id="r47-product-launch-alert"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 200, damping: 25 }}
      className="r47-launch-section r62-card-lift r94-launch-alert-card"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, #d97706, #ea580c)',
            boxShadow: '0 4px 16px rgba(217, 119, 6, 0.3)',
          }}
        >
          <Rocket className="h-5 w-5 text-white" />
        </motion.div>
        <div>
          <h2 className="font-extrabold text-xl sm:text-2xl flex items-center gap-2 r62-heading-gradient" style={{ color: '#1f2937' }}>
            <span>Lançamentos & Drops</span>
            <motion.span
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
              className="text-xl"
            >
              🚀
            </motion.span>
          </h2>
          <p className="text-xs sm:text-sm" style={{ color: '#6b7280' }}>
            Produtos que estão chegando — entre na lista e garanta seu desconto
          </p>
        </div>
      </div>

      {/* Feature 2: Hero Product Preview */}
      {featuredProduct && (
        <div className="mb-6">
          <HeroProductPreview product={featuredProduct} />
          <WaitlistSignup productId={featuredProduct.id} />
        </div>
      )}

      {/* Feature 9: Launch Stats */}
      <div className="mb-6">
        <LaunchStats />
      </div>

      {/* Feature 4: Category Tabs */}
      <div className="mb-5">
        <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
      </div>

      {/* Feature 5: Upcoming Drops Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2" style={{ color: '#1f2937' }}>
            <Sparkles className="h-5 w-5" style={{ color: '#d97706' }} />
            Próximos Lançamentos
          </h3>
          <span className="text-[10px] font-medium px-2 py-1 rounded-full" style={{ background: 'rgba(217, 119, 6, 0.1)', color: '#b45309' }}>
            {filteredProducts.length} produtos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => (
              <UpcomingDropCard key={product.id} product={product} index={index} />
            ))}
          </AnimatePresence>
        </div>

        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Clock className="h-8 w-8 mx-auto mb-2" style={{ color: '#d1d5db' }} />
            <p className="text-sm" style={{ color: '#9ca3af' }}>Nenhum lançamento nesta categoria</p>
          </motion.div>
        )}
      </div>

      {/* Feature 10: Notification Preferences */}
      <div className="mb-8">
        <NotificationPreferences />
      </div>

      {/* Feature 7: Past Launches */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2" style={{ color: '#1f2937' }}>
            <Trophy className="h-5 w-5" style={{ color: '#059669' }} />
            Lançamentos anteriores
          </h3>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1"
              style={{ color: '#6b7280' }}
            >
              Ver todos
              <ChevronRight className="h-3 w-3" />
            </Button>
          </motion.div>
        </div>

        <div className="space-y-3">
          {pastLaunches.map((product, index) => (
            <PastLaunchCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 250, damping: 25, delay: 0.6 }}
        className="text-center pt-4"
      >
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            className="h-11 px-8 rounded-xl text-sm font-bold gap-2 text-white"
            style={{
              background: 'linear-gradient(135deg, #d97706, #ea580c)',
              boxShadow: '0 4px 20px rgba(217, 119, 6, 0.3)',
            }}
          >
            <Sun className="h-4 w-4" />
            Ver todos os lançamentos
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
        <p className="text-[10px] mt-3" style={{ color: '#9ca3af' }}>
          Novos produtos adicionados toda semana • Atualizações em tempo real
        </p>
      </motion.div>

      {/* Feature 11: Background floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {useMemo(() => [
          { x: '5%', y: '10%', size: 3, delay: 0, color: 'rgba(245, 158, 11, 0.3)' },
          { x: '90%', y: '15%', size: 4, delay: 0.8, color: 'rgba(234, 179, 8, 0.25)' },
          { x: '80%', y: '70%', size: 3, delay: 1.6, color: 'rgba(245, 158, 11, 0.2)' },
          { x: '15%', y: '80%', size: 4, delay: 2.4, color: 'rgba(234, 88, 12, 0.2)' },
          { x: '50%', y: '5%', size: 3, delay: 3.2, color: 'rgba(245, 158, 11, 0.25)' },
        ].map((cfg, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: cfg.x,
              top: cfg.y,
              width: cfg.size,
              height: cfg.size,
              background: cfg.color,
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 0.8, 0],
              y: [0, -12, -24, -36],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              delay: cfg.delay,
              ease: 'easeOut' as const,
              repeatDelay: 0.8,
            }}
          />
        )), [])}
      </div>
    </motion.section>
  )
}
