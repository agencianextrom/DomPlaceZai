'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, Plus, Trash2, PiggyBank, Clock, TrendingDown, AlertTriangle, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Module-level currency formatter
const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

// Expense category definition
interface ExpenseCategory {
  id: string
  name: string
  emoji: string
  color: string
  barColor: string
}

const expenseCategories: ExpenseCategory[] = [
  { id: 'alimentacao', name: 'Alimentação', emoji: '🍎', color: 'text-red-500', barColor: 'from-red-400 to-red-500' },
  { id: 'limpeza', name: 'Limpeza', emoji: '🧹', color: 'text-blue-500', barColor: 'from-blue-400 to-blue-500' },
  { id: 'beleza', name: 'Beleza', emoji: '💅', color: 'text-pink-500', barColor: 'from-pink-400 to-pink-500' },
  { id: 'saude', name: 'Saúde', emoji: '💊', color: 'text-emerald-500', barColor: 'from-emerald-400 to-emerald-500' },
  { id: 'pets', name: 'Pets', emoji: '🐾', color: 'text-amber-500', barColor: 'from-amber-400 to-amber-500' },
  { id: 'tecnologia', name: 'Tecnologia', emoji: '📱', color: 'text-violet-500', barColor: 'from-violet-400 to-violet-500' },
]

// Expense entry
interface ExpenseEntry {
  id: string
  categoryId: string
  amount: number
  description: string
  date: string
}

// Budget state type
interface BudgetState {
  budget: number
  expenses: ExpenseEntry[]
  lastReset: string
}

// localStorage helpers
const STORAGE_KEY = 'domplace-budget-planner'

function loadBudgetState(): BudgetState {
  if (typeof window === 'undefined') {
    return { budget: 500, expenses: [], lastReset: new Date().toISOString() }
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // ignore
  }
  return { budget: 500, expenses: [], lastReset: new Date().toISOString() }
}

function saveBudgetState(state: BudgetState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

// Check if month has changed
function needsMonthlyReset(lastReset: string): boolean {
  const last = new Date(lastReset)
  const now = new Date()
  return last.getMonth() !== now.getMonth() || last.getFullYear() !== now.getFullYear()
}

// Calculate days until next month
function daysUntilNextMonth(): number {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const diff = next.getTime() - now.getTime()
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

// SVG mini line chart for 7-day spending
function MiniLineChart({ data }: { data: number[] }) {
  const width = 200
  const height = 50
  const padding = 4
  const maxVal = Math.max(...data, 1)
  const minVal = 0

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((val - minVal) / (maxVal - minVal)) * (height - padding * 2)
    return `${x},${y}`
  })

  const pathD = data.length > 1
    ? `M ${points[0]} ` + points.slice(1).map((p) => `L ${p}`).join(' ')
    : ''

  const areaD = data.length > 1
    ? `M ${padding},${height - padding} L ${points.join(' L ')} L ${width - padding},${height - padding} Z`
    : ''

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="none">
      {/* Area fill */}
      {areaD && (
        <motion.path
          d={areaD}
          fill="url(#r28-chart-gradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
      )}
      {/* Line */}
      {pathD && (
        <motion.path
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      )}
      {/* Data points */}
      {data.map((val, i) => {
        const x = padding + (i / (data.length - 1)) * (width - padding * 2)
        const y = height - padding - ((val - minVal) / (maxVal - minVal)) * (height - padding * 2)
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="2.5"
            className="fill-primary"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + i * 0.08, type: 'spring' as const, stiffness: 400, damping: 20 }}
          />
        )
      })}
      {/* Gradient def */}
      <defs>
        <linearGradient id="r28-chart-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Circular progress ring component
function CircularProgressRing({ percentage }: { percentage: number }) {
  const size = 100
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  const isOverBudget = percentage > 100

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: Math.max(0, strokeDashoffset) }}
          transition={{ type: 'spring' as const, stiffness: 150, damping: 20 }}
          className={isOverBudget ? 'text-red-500' : 'text-primary'}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.span
            key={Math.round(percentage)}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
            className={`text-lg font-bold tabular-nums ${isOverBudget ? 'text-red-500' : 'text-foreground'}`}
          >
            {Math.min(Math.round(percentage), 999)}%
          </motion.span>
        </div>
      </div>
    </div>
  )
}

export function BudgetPlanner() {
  const [state, setState] = useState<BudgetState>(loadBudgetState)
  const [budgetInput, setBudgetInput] = useState(state.budget.toString())
  const [showForm, setShowForm] = useState(false)
  const [formCategoryId, setFormCategoryId] = useState('alimentacao')
  const [formAmount, setFormAmount] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [mounted, setMounted] = useState(false)
  const prevExpenseCount = useRef(state.expenses.length)

  // Hydration guard
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check monthly reset
  useEffect(() => {
    if (mounted && needsMonthlyReset(state.lastReset)) {
      const newState: BudgetState = {
        budget: state.budget,
        expenses: [],
        lastReset: new Date().toISOString(),
      }
      setState(newState)
      saveBudgetState(newState)
    }
  }, [mounted, state.lastReset, state.budget])

  // Persist state changes
  useEffect(() => {
    if (mounted) {
      saveBudgetState(state)
    }
  }, [mounted, state])

  // Computed values
  const totalSpent = useMemo(
    () => state.expenses.reduce((sum, e) => sum + e.amount, 0),
    [state.expenses]
  )

  const budgetPercent = useMemo(
    () => (state.budget > 0 ? (totalSpent / state.budget) * 100 : 0),
    [totalSpent, state.budget]
  )

  const remaining = useMemo(
    () => Math.max(state.budget - totalSpent, 0),
    [state.budget, totalSpent]
  )

  const savings = remaining

  const isOverBudget = budgetPercent >= 80

  // Per-category spending
  const categorySpending = useMemo(() => {
    const map: Record<string, number> = {}
    state.expenses.forEach((e) => {
      map[e.categoryId] = (map[e.categoryId] || 0) + e.amount
    })
    return map
  }, [state.expenses])

  // Generate 7-day mock spending data (using actual expenses from last 7 days if available)
  const weekData = useMemo(() => {
    const now = new Date()
    const data: number[] = []
    for (let i = 6; i >= 0; i--) {
      const dayDate = new Date(now)
      dayDate.setDate(dayDate.getDate() - i)
      const dayStr = dayDate.toISOString().split('T')[0]
      const dayTotal = state.expenses
        .filter((e) => e.date.startsWith(dayStr))
        .reduce((sum, e) => sum + e.amount, 0)
      // Add some baseline variation for demo
      data.push(dayTotal > 0 ? dayTotal : Math.floor(Math.random() * state.budget * 0.15 + 5))
    }
    return data
  }, [state.expenses, state.budget])

  const daysRemaining = daysUntilNextMonth()

  // Budget presets
  const presets = [100, 300, 500, 1000]

  // Set budget handler
  const handleSetBudget = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, budget: amount }))
    setBudgetInput(amount.toString())
  }, [])

  // Add expense handler
  const handleAddExpense = useCallback(() => {
    const amount = parseFloat(formAmount)
    if (isNaN(amount) || amount <= 0) return

    const newExpense: ExpenseEntry = {
      id: `exp-${Date.now()}`,
      categoryId: formCategoryId,
      amount,
      description: formDescription.trim() || expenseCategories.find((c) => c.id === formCategoryId)?.name || '',
      date: new Date().toISOString(),
    }

    setState((prev) => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
    }))

    setFormAmount('')
    setFormDescription('')
    setShowForm(false)
  }, [formCategoryId, formAmount, formDescription])

  // Remove expense handler
  const handleRemoveExpense = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }))
  }, [])

  if (!mounted) {
    return (
      <div className="r28-budget-planner">
        <div className="rounded-2xl p-6 glassmorphism-strong animate-pulse">
          <div className="h-6 w-48 bg-muted rounded mb-4" />
          <div className="h-24 w-24 bg-muted rounded-full mx-auto mb-4" />
          <div className="h-4 w-32 bg-muted rounded mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="r28-budget-planner">
      <div className="rounded-2xl overflow-hidden glassmorphism-strong relative r62-card-lift">
        {/* Background mesh */}
        <div className="absolute inset-0 gradient-mesh-2 opacity-20 pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-md">
                <Wallet className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold r29-budget-shimmer r62-heading-gradient">Planejador de Orçamento</h3>
                <p className="text-[10px] text-muted-foreground">Controle seus gastos mensais</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{daysRemaining} dias até o resete</span>
            </div>
          </div>

          {/* Budget input row */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-1.5 bg-background/60 border border-border/50 rounded-lg px-3 py-2">
                <span className="text-xs font-semibold text-muted-foreground">R$</span>
                <input
                  type="number"
                  value={budgetInput}
                  onChange={(e) => {
                    setBudgetInput(e.target.value)
                    const val = parseFloat(e.target.value)
                    if (!isNaN(val) && val > 0) {
                      setState((prev) => ({ ...prev, budget: val }))
                    }
                  }}
                  className="flex-1 bg-transparent text-sm font-bold outline-none min-w-0 tabular-nums"
                  min={0}
                  step={10}
                />
              </div>
              <div className="flex gap-1">
                {presets.map((p) => (
                  <motion.button
                    key={p}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSetBudget(p)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                      state.budget === p
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background/40 text-muted-foreground border-border/50 hover:border-primary/30'
                    }`}
                  >
                    {p}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Progress ring + summary */}
          <div className="px-4 pb-4">
            <div className="flex items-center gap-6 bg-background/40 rounded-xl p-4 border border-border/30">
              <CircularProgressRing percentage={budgetPercent} />

              <div className="flex-1 min-w-0 space-y-2">
                {/* Budget alert at 80% */}
                {isOverBudget && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1.5"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    </motion.div>
                    <span className="text-[10px] font-bold text-red-500">
                      {budgetPercent >= 100
                        ? 'Orçamento ultrapassado!'
                        : 'Atenção: 80% do orçamento'}
                    </span>
                  </motion.div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Gasto Total</p>
                    <p className="text-sm font-bold text-foreground">{formatBRL(totalSpent)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Restante</p>
                    <p className={`text-sm font-bold ${remaining > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                      {formatBRL(remaining)}
                    </p>
                  </div>
                </div>

                {/* Savings highlight */}
                {savings > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5"
                  >
                    <PiggyBank className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 r29-savings-pulse">
                      Economizou {formatBRL(savings)} até agora!
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Expense categories */}
          <div className="px-4 pb-3">
            <p className="text-xs font-semibold mb-2.5">Gastos por Categoria</p>
            <div className="space-y-2">
              {expenseCategories.map((cat) => {
                const spent = categorySpending[cat.id] || 0
                const pct = state.budget > 0 ? (spent / state.budget) * 100 : 0
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ y: -3 }}
                    transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
                    className="flex items-center gap-2.5 r29-category-lift"
                  >
                    <span className="text-lg w-6 text-center">{cat.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] font-medium">{cat.name}</span>
                        <span className="text-[10px] font-semibold tabular-nums">{formatBRL(spent)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${cat.barColor} r29-progress-glow`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(pct, 100)}%` }}
                          transition={{ duration: 0.5, type: 'spring' as const, stiffness: 200, damping: 20 }}
                        />
                      </div>
                    </div>
                    <span className="text-[9px] text-muted-foreground w-8 text-right tabular-nums">
                      {Math.round(pct)}%
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* 7-day mini chart */}
          <div className="px-4 pb-3">
            <div className="bg-background/40 rounded-xl p-3 border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold">Últimos 7 dias</p>
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <TrendingDown className="h-3 w-3" />
                  <span className="tabular-nums">{formatBRL(weekData.reduce((a, b) => a + b, 0))} total</span>
                </div>
              </div>
              <MiniLineChart data={weekData} />
              <div className="flex justify-between mt-1.5 px-0.5">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, i) => (
                  <span key={day} className="text-[8px] text-muted-foreground/60">
                    {day}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Add expense form */}
          <div className="px-4 pb-3">
            <AnimatePresence>
              {showForm ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-background/60 rounded-xl p-3 border border-primary/20 space-y-2.5">
                    <p className="text-xs font-bold">Adicionar Despesa</p>

                    {/* Category select */}
                    <div className="flex flex-wrap gap-1.5">
                      {expenseCategories.map((cat) => (
                        <motion.button
                          key={cat.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFormCategoryId(cat.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-all flex items-center gap-1 ${
                            formCategoryId === cat.id
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background/40 text-muted-foreground border-border/50 hover:border-primary/30'
                          }`}
                        >
                          <span>{cat.emoji}</span>
                          {cat.name}
                        </motion.button>
                      ))}
                    </div>

                    {/* Amount input */}
                    <div className="flex items-center gap-1.5 bg-background/80 border border-border/50 rounded-lg px-3 py-2">
                      <span className="text-xs font-semibold text-muted-foreground">R$</span>
                      <input
                        type="number"
                        value={formAmount}
                        onChange={(e) => setFormAmount(e.target.value)}
                        placeholder="0,00"
                        className="flex-1 bg-transparent text-sm font-bold outline-none min-w-0 tabular-nums"
                        min={0}
                        step={0.01}
                      />
                    </div>

                    {/* Description */}
                    <input
                      type="text"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Descrição (opcional)"
                      className="w-full bg-background/80 border border-border/50 rounded-lg px-3 py-2 text-xs outline-none placeholder:text-muted-foreground/50 focus:border-primary/30 transition-colors"
                    />

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAddExpense}
                        className="flex-1 h-8 min-h-[44px] text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg btn-glow gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Adicionar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                        className="h-8 min-h-[44px] text-xs rounded-lg"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowForm(true)}
                    className="w-full h-9 text-xs font-semibold border-dashed border-primary/40 hover:border-primary/60 hover:bg-primary/5 text-primary rounded-xl gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar Despesa
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Expense list */}
          <AnimatePresence>
            {state.expenses.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-t border-border/30"
              >
                <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                  <p className="text-xs font-semibold">Despesas Recentes</p>
                  <Badge variant="secondary" className="text-[9px] font-bold">
                    {state.expenses.length}
                  </Badge>
                </div>
                <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                  <AnimatePresence>
                    {state.expenses.slice(0, 10).map((expense, idx) => {
                      const cat = expenseCategories.find((c) => c.id === expense.categoryId)
                      return (
                        <motion.div
                          key={expense.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 50, scale: 0.9 }}
                          transition={{
                            delay: idx * 0.03,
                            type: 'spring' as const,
                            stiffness: 300,
                            damping: 25,
                          }}
                          className="flex items-center gap-2.5 px-4 py-2.5 border-b border-border/10 last:border-b-0 hover:bg-muted/20 transition-colors group"
                        >
                          <span className="text-base">{cat?.emoji || '📦'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium line-clamp-1">
                              {expense.description || cat?.name || 'Despesa'}
                            </p>
                            <p className="text-[9px] text-muted-foreground">
                              {new Date(expense.date).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <span className="text-xs font-bold tabular-nums">{formatBRL(expense.amount)}</span>
                          <button
                            onClick={() => handleRemoveExpense(expense.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 p-0.5"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Monthly reset countdown */}
          <div className="px-4 py-3 border-t border-border/30 mt-auto">
            <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              >
                <Clock className="h-3 w-3" />
              </motion.div>
              <span>
                Resete mensual em {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BudgetPlanner
