'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cachedFetch } from '@/lib/api-cache'
import { Users, Plus, Minus, Receipt, Share2, Clock, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

/* ─── Interfaces ─── */

interface PersonSplit {
  name: string
  percentage: number
  amount: number
}

interface SplitHistoryEntry {
  date: string
  total: number
  people: number
  tipPercent: number
  perPerson: number
}

interface QuickBillSplitterProps {
  className?: string
}

/* ─── Constants ─── */

const HISTORY_KEY = 'r63-split-history'
const MAX_HISTORY = 5
const MIN_PEOPLE = 2
const MAX_PEOPLE = 20
const TIP_OPTIONS = [
  { label: 'Sem gorjeta', value: 0 },
  { label: '5%', value: 5 },
  { label: '10%', value: 10 },
  { label: '15%', value: 15 },
] as const

const DEFAULT_NAMES = [
  'Você', 'Amigo 1', 'Amigo 2', 'Amigo 3', 'Amigo 4', 'Amigo 5',
  'Amigo 6', 'Amigo 7', 'Amigo 8', 'Amigo 9', 'Amigo 10', 'Amigo 11',
  'Amigo 12', 'Amigo 13', 'Amigo 14', 'Amigo 15', 'Amigo 16', 'Amigo 17',
  'Amigo 18', 'Amigo 19', 'Amigo 20',
]

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

/* ─── Confetti Burst (inline lightweight) ─── */

interface ConfettiParticle {
  id: number
  x: number
  y: number
  color: string
  size: number
  rotation: number
  vx: number
  vy: number
  rotSpeed: number
}

const CONFETTI_COLORS = ['#10b981', '#f59e0b', '#f43f5e', '#14b8a6', '#84cc16', '#6366f1', '#a855f7']
let confettiIdCounter = 0

function MiniConfettiBurst({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([])
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active) return

    const newParticles: ConfettiParticle[] = Array.from({ length: 24 }, () => {
      const angle = Math.random() * Math.PI * 2
      const velocity = 2 + Math.random() * 4
      return {
        id: confettiIdCounter++,
        x: 0,
        y: 0,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 4 + Math.random() * 6,
        rotation: Math.random() * 360,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 3,
        rotSpeed: -10 + Math.random() * 20,
      }
    })
    setParticles(newParticles)

    const startTime = performance.now()
    const duration = 900

    function frame(now: number) {
      const progress = Math.min((now - startTime) / duration, 1)
      if (progress >= 1) {
        setParticles([])
        rafRef.current = null
        return
      }
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          x: p.x + p.vx * 0.98,
          y: p.y + p.vy + 0.12,
          vy: p.vy + 0.12,
          vx: p.vx * 0.98,
          rotation: p.rotation + p.rotSpeed,
        }))
      )
      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [active])

  if (particles.length === 0) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  )
}

/* ─── Component ─── */

export function QuickBillSplitter({ className = '' }: QuickBillSplitterProps) {
  const [totalBill, setTotalBill] = useState<string>('')
  const [peopleCount, setPeopleCount] = useState<number>(2)
  const [tipPercent, setTipPercent] = useState<number>(0)
  const [splitMode, setSplitMode] = useState<'equal' | 'percentage'>('equal')
  const [people, setPeople] = useState<PersonSplit[]>([
    { name: DEFAULT_NAMES[0], percentage: 50, amount: 0 },
    { name: DEFAULT_NAMES[1], percentage: 50, amount: 0 },
  ])
  const [showHistory, setShowHistory] = useState<boolean>(false)
  const [history, setHistory] = useState<SplitHistoryEntry[]>([])
  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  const [addingPerson, setAddingPerson] = useState<boolean>(false)
  const [newPersonName, setNewPersonName] = useState<string>('')
  const [sharedToast, setSharedToast] = useState<boolean>(false)
  const [activePersonIdx, setActivePersonIdx] = useState<number>(0)

  /* Load history from localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (raw) {
        const parsed: SplitHistoryEntry[] = JSON.parse(raw)
        setHistory(parsed)
      }
    } catch {
      // ignore corrupt data
    }
  }, [])

  /* Keep people list synced with peopleCount in equal mode */
  useEffect(() => {
    if (splitMode === 'equal') {
      setPeople(prev => {
        const next: PersonSplit[] = []
        for (let i = 0; i < peopleCount; i++) {
          next.push({
            name: prev[i]?.name ?? DEFAULT_NAMES[i] ?? `Pessoa ${i + 1}`,
            percentage: Math.floor(100 / peopleCount),
            amount: 0,
          })
        }
        // Adjust last person to make sum = 100
        if (next.length > 0) {
          const allocated = next.slice(0, -1).reduce((s, p) => s + p.percentage, 0)
          next[next.length - 1].percentage = 100 - allocated
        }
        return next
      })
    }
  }, [peopleCount, splitMode])

  const totalValue = parseFloat(totalBill.replace(',', '.')) || 0
  const tipAmount = totalValue * (tipPercent / 100)
  const totalWithTip = totalValue + tipAmount

  /* Calculate per-person for equal mode */
  const equalPerPerson = peopleCount > 0 && totalWithTip > 0 ? totalWithTip / peopleCount : 0

  /* Recalculate custom percentages */
  const recalcCustomPeople = useCallback((list: PersonSplit[], total: number) => {
    return list.map(p => ({
      ...p,
      amount: total * (p.percentage / 100),
    }))
  }, [])

  /* Derived custom people */
  const customPeople = recalcCustomPeople(people, totalWithTip)
  const totalCustomPercentage = people.reduce((s, p) => s + p.percentage, 0)

  /* Stepper handlers */
  const incrementPeople = useCallback(() => {
    setPeopleCount(prev => Math.min(prev + 1, MAX_PEOPLE))
  }, [])

  const decrementPeople = useCallback(() => {
    setPeopleCount(prev => Math.max(prev - 1, MIN_PEOPLE))
  }, [])

  /* Update a person's percentage in custom mode */
  const updatePercentage = useCallback((index: number, value: number) => {
    setPeople(prev => {
      const next = [...prev]
      next[index] = { ...next[index], percentage: Math.max(0, Math.min(100, value)) }
      return next
    })
  }, [])

  /* Update a person's name */
  const updatePersonName = useCallback((index: number, name: string) => {
    setPeople(prev => {
      const next = [...prev]
      next[index] = { ...next[index], name }
      return next
    })
  }, [])

  /* Remove a person from custom mode */
  const removePerson = useCallback((index: number) => {
    setPeople(prev => prev.filter((_, i) => i !== index))
  }, [])

  /* Add a new person */
  const addNewPerson = useCallback(() => {
    if (people.length >= MAX_PEOPLE) return
    const name = newPersonName.trim() || (DEFAULT_NAMES[people.length] ?? `Pessoa ${people.length + 1}`)
    setPeople(prev => {
      const remaining = 100 - prev.reduce((s, p) => s + p.percentage, 0)
      const pct = Math.max(0, remaining)
      return [...prev, { name, percentage: pct, amount: 0 }]
    })
    setNewPersonName('')
    setAddingPerson(false)
  }, [people, newPersonName])

  /* Switch to custom mode */
  const switchToCustom = useCallback(() => {
    setSplitMode('percentage')
    setPeople(prev =>
      prev.map(p => ({
        ...p,
        percentage: Math.floor(100 / prev.length),
        amount: 0,
      }))
    )
  }, [])

  /* Save to history */
  const saveToHistory = useCallback((perPerson: number) => {
    const entry: SplitHistoryEntry = {
      date: new Date().toISOString(),
      total: totalWithTip,
      people: peopleCount,
      tipPercent,
      perPerson,
    }
    setHistory(prev => {
      const next = [entry, ...prev].slice(0, MAX_HISTORY)
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [totalWithTip, peopleCount, tipPercent])

  /* Fire confetti */
  const triggerConfetti = useCallback(() => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 1000)
  }, [])

  /* Share split summary */
  const shareSplit = useCallback(() => {
    const perPerson = splitMode === 'equal' ? equalPerPerson : 0
    let text = `🧾 Divisão de conta\n`
    text += `Total: ${formatBRL(totalWithTip)}\n`
    text += `Pessoas: ${splitMode === 'equal' ? peopleCount : people.length}\n`
    text += `Gorjeta: ${tipPercent}%\n`
    if (splitMode === 'equal') {
      text += `Cada um paga: ${formatBRL(perPerson)}\n`
    } else {
      text += `\nDetalhes:\n`
      for (const p of customPeople) {
        text += `• ${p.name}: ${formatBRL(p.amount)} (${p.percentage}%)\n`
      }
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setSharedToast(true)
      setTimeout(() => setSharedToast(false), 2000)
    }
  }, [totalWithTip, peopleCount, tipPercent, splitMode, equalPerPerson, people, customPeople])

  /* Load history split */
  const loadHistoryEntry = useCallback((entry: SplitHistoryEntry) => {
    setTotalBill(String(entry.total / (1 + entry.tipPercent / 100)))
    setPeopleCount(entry.people)
    setTipPercent(entry.tipPercent)
    setSplitMode('equal')
    setShowHistory(false)
  }, [])

  /* Reset form */
  const resetForm = useCallback(() => {
    setTotalBill('')
    setPeopleCount(2)
    setTipPercent(0)
    setSplitMode('equal')
    setPeople([
      { name: DEFAULT_NAMES[0], percentage: 50, amount: 0 },
      { name: DEFAULT_NAMES[1], percentage: 50, amount: 0 },
    ])
  }, [])

  /* Has valid result to display */
  const hasResult = totalValue > 0 && peopleCount > 0

  return (
    <Card className={`r63-bill-card rounded-2xl overflow-hidden ${className}`}>
      {/* ─── Header ─── */}
      <CardHeader className="pb-3 pt-5 px-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' as const }}
            >
              <Receipt className="h-5 w-5 text-indigo-500" />
            </motion.div>
            <div>
              <h3 className="text-base font-bold r63-bill-header">Divisor de Conta</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Divida a conta com seus amigos
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(prev => !prev)}
            className="h-9 px-2 text-xs text-muted-foreground active:scale-95 transition-transform"
            aria-label={showHistory ? 'Ocultar histórico' : 'Ver histórico'}
          >
            <Clock className="h-3.5 w-3.5 mr-1" />
            {showHistory ? 'Ocultar' : 'Histórico'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-5 sm:px-6 pb-6 space-y-5">
        {/* ─── History Panel ─── */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pb-1">
                {history.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3">
                    Nenhuma divisão anterior
                  </p>
                ) : (
                  history.map(entry => (
                    <button
                      key={entry.date}
                      onClick={() => loadHistoryEntry(entry)}
                      className="w-full text-left flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors active:scale-[0.98] transition-transform min-h-[44px]"
                    >
                      <div className="flex items-center gap-2.5">
                        <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium">{formatBRL(entry.total)}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {entry.people} pessoas · Gorjeta {entry.tipPercent}%
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-600">{formatBRL(entry.perPerson)}/pessoa</p>
                        <p className="text-[10px] text-muted-foreground">{formatDate(entry.date)}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Total Input ─── */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Valor total da conta</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground pointer-events-none">
              R$
            </span>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={totalBill}
              onChange={e => {
                const v = e.target.value.replace(/[^0-9.,]/g, '')
                setTotalBill(v)
              }}
              className="r63-bill-input pl-10 h-12 text-lg font-semibold rounded-xl border-border/60 bg-card"
              aria-label="Valor total da conta em reais"
            />
          </div>
        </div>

        {/* ─── People Count Stepper ─── */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Número de pessoas</label>
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={decrementPeople}
              disabled={peopleCount <= MIN_PEOPLE}
              className="r63-bill-stepper flex items-center justify-center rounded-xl border border-border/60 bg-card text-foreground disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
              aria-label="Remover pessoa"
            >
              <Minus className="h-4 w-4" />
            </motion.button>

            <div className="flex-1 flex items-center justify-center">
              <motion.div
                key={peopleCount}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold tabular-nums">{peopleCount}</span>
              </motion.div>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={incrementPeople}
              disabled={peopleCount >= MAX_PEOPLE}
              className="r63-bill-stepper flex items-center justify-center rounded-xl border border-border/60 bg-card text-foreground disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
              aria-label="Adicionar pessoa"
            >
              <Plus className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        {/* ─── Tip Selection ─── */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Gorjeta</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TIP_OPTIONS.map(opt => (
              <motion.button
                key={opt.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTipPercent(opt.value)}
                className={`r63-bill-tip-btn min-h-[44px] rounded-xl border text-xs font-semibold transition-all active:scale-95 transition-transform ${
                  tipPercent === opt.value
                    ? 'active border-indigo-400'
                    : 'border-border/60 bg-card text-muted-foreground hover:border-indigo-300 hover:text-foreground'
                }`}
                aria-label={`Gorjeta de ${opt.label}`}
                aria-pressed={tipPercent === opt.value}
              >
                {opt.label}
              </motion.button>
            ))}
          </div>
          {tipAmount > 0 && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-muted-foreground text-right"
            >
              Gorjeta: {formatBRL(tipAmount)}
            </motion.p>
          )}
        </div>

        {/* ─── Split Mode Toggle ─── */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Modo de divisão</label>
          <div className="r63-bill-toggle flex items-center relative">
            <motion.div
              className="r63-bill-toggle-indicator"
              initial={false}
              animate={{ left: splitMode === 'equal' ? '3px' : 'calc(50% - 3px)' }}
              style={{ width: 'calc(50% - 3px)' }}
            />
            <button
              onClick={() => setSplitMode('equal')}
              className={`flex-1 relative z-10 py-2 text-xs font-semibold rounded-full transition-colors min-h-[44px] flex items-center justify-center ${
                splitMode === 'equal' ? 'text-foreground' : 'text-muted-foreground'
              }`}
              aria-pressed={splitMode === 'equal'}
            >
              Dividir igual
            </button>
            <button
              onClick={switchToCustom}
              className={`flex-1 relative z-10 py-2 text-xs font-semibold rounded-full transition-colors min-h-[44px] flex items-center justify-center ${
                splitMode === 'percentage' ? 'text-foreground' : 'text-muted-foreground'
              }`}
              aria-pressed={splitMode === 'percentage'}
            >
              Com percentual
            </button>
          </div>
        </div>

        {/* ─── Result Area ─── */}
        <AnimatePresence mode="wait">
          {hasResult && splitMode === 'equal' && (
            <motion.div
              key="equal-result"
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
              className="r63-bill-result rounded-xl p-5 text-center relative overflow-hidden"
            >
              <MiniConfettiBurst active={showConfetti} />
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Total com gorjeta
              </p>
              <motion.p
                key={totalWithTip}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                className="text-sm text-muted-foreground mb-3"
              >
                {formatBRL(totalWithTip)}
              </motion.p>
              <div className="w-full h-px bg-emerald-200/50 dark:bg-emerald-700/30 my-3" />
              <p className="text-xs text-muted-foreground mb-1">Cada pessoa paga</p>
              <motion.p
                key={equalPerPerson}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 350, damping: 22 }}
                className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums"
              >
                {formatBRL(equalPerPerson)}
              </motion.p>

              <div className="mt-4 flex gap-2">
                <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                  <Button
                    onClick={() => {
                      saveToHistory(equalPerPerson)
                      triggerConfetti()
                    }}
                    className="r63-bill-share w-full min-h-[44px] text-white font-semibold text-sm rounded-xl"
                  >
                    <Receipt className="h-4 w-4 mr-1.5" />
                    Salvar divisão
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={shareSplit}
                    variant="outline"
                    className="min-h-[44px] min-w-[44px] px-3 rounded-xl border-border/60 active:scale-95 transition-transform"
                    aria-label="Compartilhar divisão"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Custom Split Mode: Person List ─── */}
        <AnimatePresence>
          {splitMode === 'percentage' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
              className="overflow-hidden space-y-2"
            >
              {/* Percentage warning */}
              {totalCustomPercentage !== 100 && totalValue > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[11px] font-medium text-amber-600 dark:text-amber-400 text-center"
                >
                  Total dos percentuais: {totalCustomPercentage}% (deve ser 100%)
                </motion.p>
              )}

              {/* Person cards with stagger */}
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                <AnimatePresence mode="popLayout">
                  {customPeople.map((person, index) => (
                    <motion.div
                      key={`${person.name}-${index}`}
                      layout
                      initial={{ opacity: 0, x: -16, scale: 0.95 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        transition: {
                          delay: index * 0.05,
                          type: 'spring' as const,
                          stiffness: 300,
                          damping: 25,
                        },
                      }}
                      exit={{ opacity: 0, x: 16, scale: 0.95 }}
                      onClick={() => setActivePersonIdx(index)}
                      className={`r63-bill-person p-3 rounded-xl border cursor-pointer ${
                        activePersonIdx === index
                          ? 'r63-bill-person-active border-emerald-400/40'
                          : 'border-border/60 bg-card'
                      }`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Pessoa: ${person.name}, ${person.percentage}%`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {person.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={person.name}
                            onChange={e => updatePersonName(index, e.target.value)}
                            className="text-xs font-semibold bg-transparent border-none outline-none w-full text-foreground placeholder:text-muted-foreground"
                            placeholder="Nome da pessoa"
                            aria-label={`Nome da pessoa ${index + 1}`}
                            onClick={e => e.stopPropagation()}
                          />
                          <p className="text-[10px] text-muted-foreground tabular-nums mt-0.5">
                            {formatBRL(person.amount)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            max={100}
                            value={person.percentage}
                            onChange={e => updatePercentage(index, parseInt(e.target.value) || 0)}
                            className="w-14 h-8 text-xs text-right font-semibold bg-muted/50 rounded-lg border border-border/40 outline-none focus:border-indigo-400 tabular-nums px-1.5"
                            aria-label={`Percentual de ${person.name}`}
                            onClick={e => e.stopPropagation()}
                          />
                          <span className="text-[10px] text-muted-foreground font-medium">%</span>
                          {people.length > 2 && (
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={e => {
                                e.stopPropagation()
                                removePerson(index)
                              }}
                              className="h-8 w-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors active:scale-95 transition-transform"
                              aria-label={`Remover ${person.name}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add Person */}
              <AnimatePresence>
                {addingPerson ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 p-2 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/20">
                      <Input
                        type="text"
                        value={newPersonName}
                        onChange={e => setNewPersonName(e.target.value)}
                        placeholder="Nome (opcional)"
                        className="h-9 text-xs flex-1 border-0 bg-transparent focus-visible:ring-0"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') addNewPerson()
                          if (e.key === 'Escape') setAddingPerson(false)
                        }}
                        aria-label="Nome da nova pessoa"
                      />
                      <Button
                        size="sm"
                        onClick={addNewPerson}
                        disabled={people.length >= MAX_PEOPLE}
                        className="h-9 px-3 text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg min-w-[44px] active:scale-95 transition-transform"
                        aria-label="Confirmar adição"
                      >
                        OK
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setAddingPerson(false)}
                        className="h-9 w-9 p-0 text-muted-foreground min-w-[36px]"
                        aria-label="Cancelar"
                      >
                        ✕
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  people.length < MAX_PEOPLE && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setAddingPerson(true)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-border text-xs font-medium text-muted-foreground hover:border-indigo-300 hover:text-indigo-500 transition-colors min-h-[44px] active:scale-95 transition-transform"
                      aria-label="Adicionar pessoa"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Adicionar pessoa
                    </motion.button>
                  )
                )}
              </AnimatePresence>

              {/* Custom result summary */}
              {hasResult && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
                  className="r63-bill-result rounded-xl p-4 space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total com gorjeta</span>
                    <span className="font-bold">{formatBRL(totalWithTip)}</span>
                  </div>
                  <div className="w-full h-px bg-emerald-200/50 dark:bg-emerald-700/30" />
                  <div className="flex gap-2">
                    <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                      <Button
                        onClick={() => {
                          const perP = customPeople.length > 0 ? customPeople[0].amount : 0
                          saveToHistory(perP)
                          triggerConfetti()
                        }}
                        className="r63-bill-share w-full min-h-[44px] text-white font-semibold text-sm rounded-xl"
                      >
                        <Receipt className="h-4 w-4 mr-1.5" />
                        Salvar divisão
                      </Button>
                    </motion.div>
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={shareSplit}
                        variant="outline"
                        className="min-h-[44px] min-w-[44px] px-3 rounded-xl border-border/60 active:scale-95 transition-transform"
                        aria-label="Compartilhar divisão"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Reset button ─── */}
        {hasResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={resetForm}
              className="text-xs text-muted-foreground h-9 px-3 active:scale-95 transition-transform"
            >
              Nova divisão
            </Button>
          </motion.div>
        )}

        {/* ─── Shared toast ─── */}
        <AnimatePresence>
          {sharedToast && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background text-xs font-medium px-4 py-2.5 rounded-full shadow-lg"
              role="status"
              aria-live="polite"
            >
              ✅ Divisão copiada!
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
