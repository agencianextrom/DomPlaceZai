'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Star, Truck, CheckCircle, MessageCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

// ─── Types ────────────────────────────────────────────────────────────────
interface TipOption {
  value: number
  label: string
  emoji: string
}

// ─── Mock Driver Data ──────────────────────────────────────────────────────
const driver = {
  name: 'Carlos Eduardo',
  initials: 'CE',
  rating: 4.9,
  deliveries: 1247,
  gradient: 'from-blue-400 to-indigo-500',
}

const tipOptions: TipOption[] = [
  { value: 2, label: 'R$2', emoji: '😊' },
  { value: 5, label: 'R$5', emoji: '👏' },
  { value: 10, label: 'R$10', emoji: '🎉' },
  { value: 15, label: 'R$15', emoji: '🤩' },
]

const monthlyGoal = {
  target: 500,
  current: 347,
}

// ─── Component ─────────────────────────────────────────────────────────────
export function TipSelector() {
  const [selectedTip, setSelectedTip] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [showThankYou, setShowThankYou] = useState(false)
  const [isCustomActive, setIsCustomActive] = useState(false)

  const progressPercent = useMemo(
    () => Math.min(100, Math.round((monthlyGoal.current / monthlyGoal.target) * 100)),
    []
  )

  const handleSelectTip = useCallback((value: number) => {
    setSelectedTip(value)
    setIsCustomActive(false)
    setCustomAmount('')
    setShowThankYou(true)
    setTimeout(() => setShowThankYou(false), 3000)
  }, [])

  const handleCustomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    const num = parseInt(raw, 10) || 0
    if (num > 200) return
    setCustomAmount(num > 0 ? String(num) : '')
    setIsCustomActive(num > 0)
    if (num > 0) {
      setSelectedTip(null)
      setShowThankYou(true)
      setTimeout(() => setShowThankYou(false), 3000)
    }
  }, [])

  const handleNoTip = useCallback(() => {
    setSelectedTip(0)
    setIsCustomActive(false)
    setCustomAmount('')
  }, [])

  const activeValue = useMemo(() => {
    if (selectedTip !== null && selectedTip > 0) return selectedTip
    if (isCustomActive && customAmount) return parseInt(customAmount, 10)
    return 0
  }, [selectedTip, isCustomActive, customAmount])

  return (
    <section className="r33-tip-section">
      {/* Driver Info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 260, damping: 24 }}
        className="mb-5"
      >
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/60 r33-driver-card">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`h-14 w-14 rounded-full bg-gradient-to-br ${driver.gradient} flex items-center justify-center text-white font-bold text-sm shadow-lg r33-avatar-glow`}
          >
            {driver.initials}
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{driver.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-[10px] gap-0.5 px-2 py-0 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/30">
                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                {driver.rating}
              </Badge>
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Truck className="h-3 w-3" />
                {driver.deliveries} entregas
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Title */}
      <div className="mb-4">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-400" />
          Gorjeta para o Entregador
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          100% da gorjeta vai para o entregador
        </p>
      </div>

      {/* Preset Tips */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {tipOptions.map((tip, idx) => {
          const isSelected = selectedTip === tip.value
          return (
            <motion.button
              key={tip.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, type: 'spring' as const, stiffness: 300, damping: 22 }}
              whileHover={{ y: -3, transition: { type: 'spring' as const, stiffness: 400, damping: 18 } }}
              whileTap={{ scale: 0.93 }}
              onClick={() => handleSelectTip(tip.value)}
              className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 r33-tip-card ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border/60 bg-card hover:border-primary/30'
              }`}
            >
              <span className="text-xl">{tip.emoji}</span>
              <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                {tip.label}
              </span>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 500, damping: 20 }}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Custom amount */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mb-4"
      >
        <div className={`relative rounded-xl border-2 transition-all duration-200 p-3 r33-custom-input-wrap ${
          isCustomActive
            ? 'border-primary bg-primary/5'
            : 'border-border/60 bg-card'
        }`}>
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Outro valor
          </p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">R$</span>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={customAmount}
              onChange={handleCustomChange}
              className="pl-8 h-10 text-sm font-bold r33-tip-input"
            />
          </div>
          {isCustomActive && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const }}
              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow"
            >
              <CheckCircle className="h-3.5 w-3.5" />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* No tip option */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNoTip}
          className={`w-full text-xs gap-1.5 h-9 rounded-xl transition-all ${
            selectedTip === 0
              ? 'text-muted-foreground bg-muted'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Sem gorjeta
          {selectedTip === 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const }}
            >
              <CheckCircle className="h-3.5 w-3.5" />
            </motion.div>
          )}
        </Button>
      </motion.div>

      {/* Thank you message */}
      <AnimatePresence>
        {showThankYou && activeValue > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
            className="mt-4 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-800/30 r33-thank-msg"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, -10, 10, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
              >
                <span className="text-2xl">🙏</span>
              </motion.div>
              <div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Obrigado!</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-500">
                  {driver.name} recebe R$ {activeValue.toFixed(2).replace('.', ',')} de gorjeta
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Monthly tip goal progress */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-5"
      >
        <div className="p-4 rounded-2xl bg-card border border-border/60 r33-goal-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-red-400" />
              Mês de Gorjetas
            </p>
            <Badge className="text-[10px] px-2 py-0 bg-primary/10 text-primary border-primary/20 font-bold">
              {progressPercent}%
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="h-3 rounded-full bg-muted overflow-hidden r33-progress-bg">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 r33-progress-fill"
            />
          </div>

          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] text-muted-foreground">
              R$ {monthlyGoal.current.toFixed(2).replace('.', ',')} arrecadado
            </p>
            <p className="text-[10px] text-muted-foreground">
              Meta: R$ {monthlyGoal.target.toFixed(2).replace('.', ',')}
            </p>
          </div>

          {/* Fun message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-[11px] text-center mt-2 text-muted-foreground flex items-center justify-center gap-1"
          >
            <MessageCircle className="h-3 w-3" />
            Faltam R$ {(monthlyGoal.target - monthlyGoal.current).toFixed(2).replace('.', ',')} para a meta!
          </motion.p>
        </div>
      </motion.div>
    </section>
  )
}
