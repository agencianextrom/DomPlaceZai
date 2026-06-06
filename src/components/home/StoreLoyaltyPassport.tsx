'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cachedFetch } from '@/lib/api-cache'
import { Progress } from '@/components/ui/progress'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Globe, Award, Gift, ChevronLeft, ChevronRight, Stamp, Trophy } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface StoreDestination {
  id: string
  name: string
  city: string
  emoji: string
  category: string
  gradient: string
  gradientDark: string
  accentColor: string
}

interface Milestone {
  stamps: number
  tier: 'bronze' | 'silver' | 'gold'
  label: string
  reward: string
  icon: string
  color: string
}

interface StampData {
  [storeId: string]: {
    stamps: number
    claimed: string[]
  }
}

const MILESTONES: Milestone[] = [
  { stamps: 3, tier: 'bronze', label: 'Bronze', reward: '5% desconto', icon: '🥉', color: '#cd7f32' },
  { stamps: 6, tier: 'silver', label: 'Silver', reward: '10% desconto', icon: '🥈', color: '#c0c0c0' },
  { stamps: 10, tier: 'gold', label: 'Gold', reward: 'Frete grátis', icon: '🥇', color: '#ffd700' },
]

const STORE_DESTINATIONS: StoreDestination[] = [
  { id: 'padaria', name: 'Padaria Sol', city: 'Bairro Centro', emoji: '🥐', category: 'Padaria', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', gradientDark: 'linear-gradient(135deg, #b45309, #92400e)', accentColor: '#f59e0b' },
  { id: 'acai', name: 'Açaí da Terra', city: 'Vila Nova', emoji: '🫐', category: 'Açaí', gradient: 'linear-gradient(135deg, #7c3aed, #4c1d95)', gradientDark: 'linear-gradient(135deg, #5b21b6, #3b0764)', accentColor: '#7c3aed' },
  { id: 'farmacia', name: 'Farmácia Vida', city: 'Jardim América', emoji: '💊', category: 'Farmácia', gradient: 'linear-gradient(135deg, #10b981, #059669)', gradientDark: 'linear-gradient(135deg, #047857, #065f46)', accentColor: '#10b981' },
  { id: 'pet', name: 'Pet Shop Amigo', city: 'Bairro Esperança', emoji: '🐾', category: 'Pet Shop', gradient: 'linear-gradient(135deg, #f97316, #ea580c)', gradientDark: 'linear-gradient(135deg, #c2410c, #9a3412)', accentColor: '#f97316' },
  { id: 'beleza', name: 'Beleza Pura', city: 'Centro', emoji: '💄', category: 'Beleza', gradient: 'linear-gradient(135deg, #ec4899, #db2777)', gradientDark: 'linear-gradient(135deg, #be185d, #9d174d)', accentColor: '#ec4899' },
  { id: 'horti', name: 'Horti Fruti', city: 'Mercado Municipal', emoji: '🥬', category: 'Hortifruti', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)', gradientDark: 'linear-gradient(135deg, #15803d, #166534)', accentColor: '#22c55e' },
  { id: 'eletronica', name: 'Tech House', city: 'Avenida Brasil', emoji: '🔌', category: 'Eletrônicos', gradient: "linear-gradient(135deg, #06b6d4, #0891b2)", gradientDark: 'linear-gradient(135deg, #0e7490, #155e75)', accentColor: '#06b6d4' },
  { id: 'açougue', name: 'Açougue Boi', city: 'Bairro São José', emoji: '🥩', category: 'Açougue', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', gradientDark: 'linear-gradient(135deg, #b91c1c, #991b1b)', accentColor: '#ef4444' },
]

const STORAGE_KEY = 'r58-passport-stamps'

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function loadStamps(): StampData {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveStamps(data: StampData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage full or unavailable
  }
}

function getMilestone(stampCount: number): Milestone | null {
  let current: Milestone | null = null
  for (const m of MILESTONES) {
    if (stampCount >= m.stamps) current = m
  }
  return current
}

function getNextMilestone(stampCount: number): Milestone | null {
  for (const m of MILESTONES) {
    if (stampCount < m.stamps) return m
  }
  return null
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */
function StampSlot({ index, filled, accentColor, delay }: { index: number; filled: boolean; accentColor: string; delay: number }) {
  return (
    <motion.div
      className="r58-passport-stamp-slot relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 flex items-center justify-center overflow-hidden"
      style={{
        borderColor: filled ? accentColor : 'rgba(0,0,0,0.15)',
        background: filled ? `${accentColor}22` : 'transparent',
      }}
      variants={stampSlotVariants}
      custom={index}
      initial="empty"
      animate={filled ? 'filled' : 'empty'}
    >
      {filled && (
        <motion.div
          className="r58-passport-ink-splash absolute inset-0"
          style={{ background: `radial-gradient(circle, ${accentColor}40 0%, transparent 70%)` }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      )}
      {filled ? (
        <motion.span
          className="text-base sm:text-lg font-bold"
          style={{ color: accentColor }}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 20, delay: delay * 0.05 }}
        >
          ✓
        </motion.span>
      ) : (
        <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">{index + 1}</span>
      )}
    </motion.div>
  )
}

const stampSlotVariants = {
  empty: { boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  filled: {
    boxShadow: '0 0 0 2px rgba(16,185,129,0.15), 0 2px 8px rgba(0,0,0,0.1)',
  },
}

function PassportCover({ onOpen, totalStamps }: { onOpen: () => void; totalStamps: number }) {
  return (
    <motion.div
      className="r58-passport-cover relative cursor-pointer rounded-2xl overflow-hidden"
      style={{ transformStyle: 'preserve-3d' }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onOpen}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 200, damping: 25 }}
    >
      {/* Leather texture background */}
      <div
        className="r58-passport-leather absolute inset-0"
        style={{
          background: 'linear-gradient(145deg, #1a4731 0%, #0d5c3e 30%, #0a3d2b 60%, #143d2e 100%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
        }}
      />

      {/* Gold border accent */}
      <div className="absolute inset-0 rounded-2xl border border-yellow-600/40" />
      <div className="absolute inset-[3px] rounded-[14px] border border-yellow-500/20" />

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-8 flex flex-col items-center gap-4">
        {/* Globe icon */}
        <motion.div
          className="r58-passport-globe-icon w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(145deg, #c9952e, #f5d060, #b8860b)',
            boxShadow: '0 4px 16px rgba(201,149,46,0.4), inset 0 2px 4px rgba(255,255,255,0.2)',
          }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-900" />
        </motion.div>

        {/* Embossed title */}
        <div className="text-center">
          <h2
            className="r58-passport-cover-title text-2xl sm:text-3xl font-black tracking-wider uppercase r62-heading-gradient"
            style={{
              color: '#f5d060',
              textShadow: '0 1px 0 rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)',
              letterSpacing: '0.15em',
            }}
          >
            PASSAPORTE
          </h2>
          <p
            className="r58-passport-cover-subtitle text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase mt-1"
            style={{
              color: '#c9952e',
              textShadow: '0 1px 0 rgba(0,0,0,0.4)',
            }}
          >
            DomPlace Fidelidade
          </p>
        </div>

        {/* Total stamps */}
        <motion.div
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            background: 'rgba(245,208,96,0.15)',
            border: '1px solid rgba(245,208,96,0.3)',
          }}
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Stamp className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-300 font-bold text-sm">
            <AnimatedCounter value={totalStamps} />
          </span>
          <span className="text-yellow-400/70 text-xs">selos</span>
        </motion.div>

        {/* Open hint */}
        <motion.p
          className="text-yellow-400/50 text-xs"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Toque para abrir
        </motion.p>
      </div>
    </motion.div>
  )
}

function StorePage({
  store,
  stampCount,
  onAddStamp,
  onClaimReward,
  index,
}: {
  store: StoreDestination
  stampCount: number
  onAddStamp: (storeId: string) => void
  onClaimReward: (storeId: string, tier: string) => void
  index: number
}) {
  const currentMilestone = getMilestone(stampCount)
  const nextMilestone = getNextMilestone(stampCount)
  const progress = Math.min((stampCount / 10) * 100, 100)

  return (
    <motion.div
      className="r58-passport-page min-w-full flex-shrink-0"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ type: 'spring' as const, stiffness: 250, damping: 30, delay: index * 0.1 }}
    >
      {/* Page header with gradient */}
      <div
        className="relative rounded-t-2xl overflow-hidden p-4 sm:p-6"
        style={{ background: store.gradient }}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.span
              className="text-3xl sm:text-4xl"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 }}
            >
              {store.emoji}
            </motion.span>
            <div>
              <h3 className="text-white font-bold text-sm sm:text-base">{store.name}</h3>
              <div className="flex items-center gap-1 text-white/70 text-xs">
                <MapPin className="w-3 h-3" />
                <span>{store.city}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Stamp className="w-4 h-4 text-white/80" />
            <span className="text-white font-bold text-lg">{stampCount}</span>
            <span className="text-white/60 text-xs">/10</span>
          </div>
        </div>
      </div>

      {/* Page body */}
      <div className="r58-passport-page-body p-4 sm:p-6 border border-t-0 rounded-b-2xl bg-card">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Progresso</span>
            {nextMilestone && (
              <span className="text-xs font-medium" style={{ color: store.accentColor }}>
                Próximo: {nextMilestone.label} ({nextMilestone.stamps} selos)
              </span>
            )}
          </div>
          <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="r58-passport-progress-bar h-full rounded-full"
              style={{ background: store.gradient }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring' as const, stiffness: 120, damping: 20, delay: 0.3 }}
            />
          </div>
        </div>

        {/* Stamp grid */}
        <div className="mb-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Colete selos em cada compra!</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 sm:gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <StampSlot
                key={i}
                index={i}
                filled={i < stampCount}
                accentColor={store.accentColor}
                delay={i}
              />
            ))}
          </div>
        </div>

        {/* Add stamp button */}
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <div
            className="cursor-pointer rounded-xl py-2.5 px-4 text-center text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ background: store.gradient }}
            onClick={() => onAddStamp(store.id)}
          >
            + Ganhar Selo
          </div>
        </motion.div>

        {/* Milestones / Rewards */}
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" />
            Marcos de Conquista
          </h4>
          <div className="space-y-2">
            {MILESTONES.map((milestone) => {
              const achieved = stampCount >= milestone.stamps
              const claimed = localStorage.getItem(`${STORAGE_KEY}-${store.id}-${milestone.tier}`) === 'claimed'
              return (
                <motion.div
                  key={milestone.tier}
                  className="r58-passport-milestone flex items-center gap-3 p-2.5 rounded-lg border"
                  style={{
                    borderColor: achieved ? `${milestone.color}40` : 'rgba(0,0,0,0.08)',
                    background: achieved ? `${milestone.color}10` : 'transparent',
                  }}
                  variants={milestoneVariants}
                  initial="locked"
                  animate={achieved ? 'unlocked' : 'locked'}
                >
                  <span className="text-xl">{milestone.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-xs font-bold"
                        style={{ color: achieved ? milestone.color : 'var(--muted-foreground)' }}
                      >
                        {milestone.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{milestone.stamps} selos</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{milestone.reward}</p>
                  </div>
                  {achieved && !claimed && (
                    <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                      <div
                        className="cursor-pointer px-2.5 py-1 min-h-[44px] rounded-md text-[10px] font-bold text-white"
                        style={{ background: milestone.color }}
                        onClick={() => onClaimReward(store.id, milestone.tier)}
                      >
                        Resgatar
                      </div>
                    </motion.div>
                  )}
                  {achieved && claimed && (
                    <span className="text-xs text-green-600 font-medium">✓ Resgatado</span>
                  )}
                  {!achieved && (
                    <span className="text-[10px] text-muted-foreground">
                      {stampCount}/{milestone.stamps}
                    </span>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const milestoneVariants = {
  locked: { opacity: 0.5 },
  unlocked: {
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 200, damping: 20 },
  },
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */
export function StoreLoyaltyPassport() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [stampData, setStampData] = useState<StampData>(() => loadStamps())
  /* Fetch stores from API in background (optional enhancement) */
  useEffect(() => {
    cachedFetch('/api/stores?limit=8').catch(() => {
      // Gracefully degrade – use static destinations
    })
  }, [])

  const totalStamps = Object.values(stampData).reduce((sum, d) => sum + d.stamps, 0)

  const handleAddStamp = useCallback((storeId: string) => {
    setStampData((prev) => {
      const next = { ...prev }
      if (!next[storeId]) next[storeId] = { stamps: 0, claimed: [] }
      if (next[storeId].stamps < 10) {
        next[storeId] = { ...next[storeId], stamps: next[storeId].stamps + 1 }
        saveStamps(next)
      }
      return next
    })
  }, [])

  const handleClaimReward = useCallback((storeId: string, tier: string) => {
    localStorage.setItem(`${STORAGE_KEY}-${storeId}-${tier}`, 'claimed')
    setStampData((prev) => {
      const next = { ...prev }
      if (next[storeId]) {
        next[storeId] = { ...next[storeId], claimed: [...next[storeId].claimed, tier] }
      }
      return next
    })
  }, [])

  const goNext = () => setCurrentPage((p) => (p + 1) % STORE_DESTINATIONS.length)
  const goPrev = () => setCurrentPage((p) => (p - 1 + STORE_DESTINATIONS.length) % STORE_DESTINATIONS.length)

  const currentStore = STORE_DESTINATIONS[currentPage]
  const currentStampCount = stampData[currentStore?.id]?.stamps ?? 0

  // loadStamps() already handles SSR via typeof window check

  return (
    <section className="r58-passport-section w-full max-w-md mx-auto px-4 pb-8 r62-card-lift">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* ============= COVER VIEW ============= */
          <motion.div key="cover" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
            <PassportCover onOpen={() => setIsOpen(true)} totalStamps={totalStamps} />
            {/* Subtitle */}
            <motion.p
              className="text-center text-sm text-muted-foreground mt-4 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Colete selos em cada compra!
            </motion.p>
          </motion.div>
        ) : (
          /* ============= PASSPORT INNER PAGES ============= */
          <motion.div
            key="inner"
            className="r58-passport-inner"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring' as const, stiffness: 250, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <div
                  className="min-h-[44px] cursor-pointer flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border"
                  onClick={() => setIsOpen(false)}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Voltar
                </div>
              </motion.div>

              <div className="flex items-center gap-2">
                <Stamp className="w-4 h-4 text-primary" />
                <span className="font-bold text-sm text-foreground">
                  <AnimatedCounter value={totalStamps} />
                </span>
                <span className="text-xs text-muted-foreground">selos totais</span>
              </div>
            </div>

            {/* Tabs: Stamp View / Reward View */}
            <Tabs defaultValue="stamps" className="w-full mb-4">
              <TabsList className="w-full h-10">
                <TabsTrigger value="stamps" className="flex-1 text-xs gap-1">
                  <Stamp className="w-3.5 h-3.5" />
                  Selos
                </TabsTrigger>
                <TabsTrigger value="rewards" className="flex-1 text-xs gap-1">
                  <Gift className="w-3.5 h-3.5" />
                  Recompensas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="stamps">
                {/* Page navigation dots */}
                <div className="flex items-center justify-center gap-1.5 mb-3">
                  {STORE_DESTINATIONS.map((store, i) => (
                    <motion.button
                      key={store.id}
                      className="w-7 h-7 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-sm border transition-all"
                      style={{
                        borderColor: i === currentPage ? store.accentColor : 'rgba(0,0,0,0.1)',
                        background: i === currentPage ? `${store.accentColor}20` : 'transparent',
                        transformOrigin: 'center',
                      }}
                      onClick={() => setCurrentPage(i)}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {store.emoji}
                    </motion.button>
                  ))}
                </div>

                {/* Page with flip animation */}
                <div className="relative overflow-hidden rounded-2xl">
                  <AnimatePresence mode="wait">
                    <StorePage
                      key={currentStore.id}
                      store={currentStore}
                      stampCount={currentStampCount}
                      onAddStamp={handleAddStamp}
                      onClaimReward={handleClaimReward}
                      index={currentPage}
                    />
                  </AnimatePresence>
                </div>

                {/* Navigation arrows */}
                <div className="flex items-center justify-between mt-3 px-2">
                  <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}>
                    <button
                      className="w-9 h-9 rounded-full border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors min-h-[44px] min-w-[44px]"
                      onClick={goPrev}
                      aria-label="Página anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </motion.div>

                  <span className="text-xs text-muted-foreground font-medium">
                    {currentPage + 1} / {STORE_DESTINATIONS.length}
                  </span>

                  <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}>
                    <button
                      className="w-9 h-9 rounded-full border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors min-h-[44px] min-w-[44px]"
                      onClick={goNext}
                      aria-label="Próxima página"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                </div>
              </TabsContent>

              <TabsContent value="rewards">
                {/* Reward summary across all stores */}
                <div className="r58-passport-rewards-list space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                  {STORE_DESTINATIONS.map((store, i) => {
                    const storeStamps = stampData[store.id]?.stamps ?? 0
                    const claimed = stampData[store.id]?.claimed ?? []
                    const nextM = getNextMilestone(storeStamps)
                    const achievedMilestones = MILESTONES.filter((m) => storeStamps >= m.stamps)

                    return (
                      <motion.div
                        key={store.id}
                        className="r58-passport-reward-card rounded-xl border p-3"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, type: 'spring' as const, stiffness: 200, damping: 25 }}
                      >
                        <div className="flex items-center gap-2.5 mb-2">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                            style={{ background: store.gradient }}
                          >
                            {store.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{store.name}</p>
                            <p className="text-xs text-muted-foreground">{storeStamps} selos coletados</p>
                          </div>
                          <Award className="w-4 h-4 text-muted-foreground" />
                        </div>

                        {/* Mini progress */}
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: store.gradient }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((storeStamps / 10) * 100, 100)}%` }}
                            transition={{ delay: 0.3 + i * 0.08, duration: 0.6 }}
                          />
                        </div>

                        {/* Milestone badges */}
                        <div className="flex gap-1.5 flex-wrap">
                          {MILESTONES.map((m) => {
                            const done = storeStamps >= m.stamps
                            const isClaimed = claimed.includes(m.tier)
                            return (
                              <span
                                key={m.tier}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border"
                                style={{
                                  borderColor: done ? `${m.color}60` : 'rgba(0,0,0,0.08)',
                                  background: done ? `${m.color}18` : 'transparent',
                                  color: done ? m.color : 'var(--muted-foreground)',
                                }}
                              >
                                {m.icon} {m.label}
                                {isClaimed && <span className="text-green-600">✓</span>}
                              </span>
                            )
                          })}
                        </div>

                        {/* Next milestone hint */}
                        {nextM && (
                          <p className="text-[10px] text-muted-foreground mt-1.5">
                            Faltam {nextM.stamps - storeStamps} selos para {nextM.label}
                          </p>
                        )}
                        {!nextM && achievedMilestones.length === MILESTONES.length && (
                          <p className="text-[10px] font-semibold mt-1.5" style={{ color: store.accentColor }}>
                            🎉 Todas as conquistas desbloqueadas!
                          </p>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
