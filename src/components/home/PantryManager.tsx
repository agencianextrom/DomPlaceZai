'use client'

import { useState, useMemo, useCallback, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cachedFetch } from '@/lib/cached-fetch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

/* =====================================================================
   TYPES
   ===================================================================== */
export type PantryCategory =
  | 'Hortifruti'
  | 'Carnes'
  | 'Laticínios'
  | 'Padaria'
  | 'Bebidas'
  | 'Limpeza'
  | 'Grãos'
  | 'Outros'

export type PantryUnit = 'un' | 'kg' | 'L' | 'pacote'

export type FilterTab = 'Todos' | 'Vencendo' | 'Expirados' | 'Estoque Baixo' | 'Novos'
export type SortOption = 'Nome A-Z' | 'Validade' | 'Quantidade'

export interface PantryItem {
  id: string
  name: string
  category: PantryCategory
  quantity: number
  unit: PantryUnit
  initialQuantity: number
  expirationDate: string // ISO string YYYY-MM-DD
  addedDate: string // ISO string
}

export interface ShoppingSuggestion {
  id: string
  itemName: string
  reason: string
  urgency: 'high' | 'medium' | 'low'
  addedToCart: boolean
}

/* =====================================================================
   CONSTANTS
   ===================================================================== */
const STORAGE_KEY = 'r73-pantry-items'

const CATEGORY_EMOJIS: Record<PantryCategory, string> = {
  Hortifruti: '🥬',
  Carnes: '🥩',
  'Laticínios': '🧀',
  Padaria: '🍞',
  Bebidas: '🥤',
  Limpeza: '🧹',
  Grãos: '🌾',
  Outros: '📦',
}

const CATEGORIES: PantryCategory[] = [
  'Hortifruti',
  'Carnes',
  'Laticínios',
  'Padaria',
  'Bebidas',
  'Limpeza',
  'Grãos',
  'Outros',
]

const UNITS: PantryUnit[] = ['un', 'kg', 'L', 'pacote']

const FILTER_TABS: FilterTab[] = ['Todos', 'Vencendo', 'Expirados', 'Estoque Baixo', 'Novos']

const SORT_OPTIONS: SortOption[] = ['Nome A-Z', 'Validade', 'Quantidade']

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function generateId(): string {
  return `pantry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const FALLBACK_PANTRY_ITEMS: PantryItem[] = [
  {
    id: 'fb-1',
    name: 'Arroz Integral',
    category: 'Grãos',
    quantity: 2,
    unit: 'kg',
    initialQuantity: 2,
    expirationDate: daysFromNow(45),
    addedDate: daysFromNow(-3),
  },
  {
    id: 'fb-2',
    name: 'Feijão Preto',
    category: 'Grãos',
    quantity: 1.5,
    unit: 'kg',
    initialQuantity: 1.5,
    expirationDate: daysFromNow(60),
    addedDate: daysFromNow(-5),
  },
  {
    id: 'fb-3',
    name: 'Leite Integral',
    category: 'Laticínios',
    quantity: 3,
    unit: 'un',
    initialQuantity: 6,
    expirationDate: daysFromNow(2),
    addedDate: daysFromNow(-2),
  },
  {
    id: 'fb-4',
    name: 'Ovos',
    category: 'Outros',
    quantity: 6,
    unit: 'un',
    initialQuantity: 12,
    expirationDate: daysFromNow(5),
    addedDate: daysFromNow(-1),
  },
  {
    id: 'fb-5',
    name: 'Tomate',
    category: 'Hortifruti',
    quantity: 0.5,
    unit: 'kg',
    initialQuantity: 1,
    expirationDate: daysFromNow(3),
    addedDate: daysFromNow(-2),
  },
  {
    id: 'fb-6',
    name: 'Peito de Frango',
    category: 'Carnes',
    quantity: 1,
    unit: 'kg',
    initialQuantity: 1,
    expirationDate: daysFromNow(1),
    addedDate: daysFromNow(-1),
  },
  {
    id: 'fb-7',
    name: 'Pão de Queijo',
    category: 'Padaria',
    quantity: 10,
    unit: 'un',
    initialQuantity: 15,
    expirationDate: daysFromNow(4),
    addedDate: daysFromNow(-1),
  },
  {
    id: 'fb-8',
    name: 'Bananas',
    category: 'Hortifruti',
    quantity: 6,
    unit: 'un',
    initialQuantity: 8,
    expirationDate: daysFromNow(2),
    addedDate: daysFromNow(-3),
  },
  {
    id: 'fb-9',
    name: 'Detergente',
    category: 'Limpeza',
    quantity: 1,
    unit: 'un',
    initialQuantity: 1,
    expirationDate: daysFromNow(365),
    addedDate: daysFromNow(-10),
  },
  {
    id: 'fb-10',
    name: 'Café',
    category: 'Bebidas',
    quantity: 0.5,
    unit: 'kg',
    initialQuantity: 0.5,
    expirationDate: daysFromNow(90),
    addedDate: daysFromNow(-7),
  },
  {
    id: 'fb-11',
    name: 'Cebola',
    category: 'Hortifruti',
    quantity: 1,
    unit: 'kg',
    initialQuantity: 1,
    expirationDate: daysFromNow(10),
    addedDate: daysFromNow(-2),
  },
  {
    id: 'fb-12',
    name: 'Azeite',
    category: 'Outros',
    quantity: 500,
    unit: 'un',
    initialQuantity: 500,
    expirationDate: daysFromNow(180),
    addedDate: daysFromNow(-15),
  },
]

/* =====================================================================
   HELPERS
   ===================================================================== */
function daysUntilExpiry(expirationDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exp = new Date(expirationDate + 'T00:00:00')
  return Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function getExpirationStatus(daysLeft: number): {
  label: string
  color: string
  bgColor: string
  textColor: string
  borderColor: string
} {
  if (daysLeft < 0) {
    const absDays = Math.abs(daysLeft)
    return {
      label: `Expirado há ${absDays} dia${absDays > 1 ? 's' : ''}`,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/40',
      textColor: 'text-red-700 dark:text-red-300',
      borderColor: 'border-red-300 dark:border-red-700',
    }
  }
  if (daysLeft === 0) {
    return {
      label: 'Vence hoje!',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/40',
      textColor: 'text-orange-700 dark:text-orange-300',
      borderColor: 'border-orange-300 dark:border-orange-700',
    }
  }
  if (daysLeft === 1) {
    return {
      label: 'Vence amanhã!',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/40',
      textColor: 'text-orange-700 dark:text-orange-300',
      borderColor: 'border-orange-300 dark:border-orange-700',
    }
  }
  if (daysLeft <= 3) {
    return {
      label: `Vence em ${daysLeft} dias`,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      textColor: 'text-amber-700 dark:text-amber-300',
      borderColor: 'border-amber-300 dark:border-amber-700',
    }
  }
  if (daysLeft <= 6) {
    return {
      label: `Vence em ${daysLeft} dias`,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/40',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      borderColor: 'border-yellow-300 dark:border-yellow-700',
    }
  }
  return {
    label: `Vence em ${daysLeft} dias`,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
  }
}

function loadPantryItems(): PantryItem[] {
  try {
    if (typeof window === 'undefined') return FALLBACK_PANTRY_ITEMS
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // ignore parse errors
  }
  return FALLBACK_PANTRY_ITEMS
}

function savePantryItems(items: PantryItem[]): void {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore storage errors
  }
}

function formatDateBR(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

/* =====================================================================
   REDUCED MOTION HOOK (must be used inside a component)
   ===================================================================== */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia('(prefers-reduced-motion: reduce)')
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  )
}

/* =====================================================================
   MAIN COMPONENT
   ===================================================================== */
export default function PantryManager() {
  const prefersReduced = usePrefersReducedMotion()

  // State
  const [items, setItems] = useState<PantryItem[]>(loadPantryItems)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterTab>('Todos')
  const [sortBy, setSortBy] = useState<SortOption>('Nome A-Z')

  // Form state
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState<PantryCategory>('Outros')
  const [formQty, setFormQty] = useState('1')
  const [formUnit, setFormUnit] = useState<PantryUnit>('un')
  const [formExpiry, setFormExpiry] = useState('')

  // Edit qty state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQty, setEditQty] = useState('')

  // Persist on every change
  const updateItems = useCallback((newItems: PantryItem[]) => {
    setItems(newItems)
    savePantryItems(newItems)
  }, [])

  // Stats
  const stats = useMemo(() => {
    const total = items.length
    let expiringSoon = 0
    let expired = 0
    let lowStock = 0

    for (const item of items) {
      const days = daysUntilExpiry(item.expirationDate)
      if (days >= 0 && days <= 3) expiringSoon++
      if (days < 0) expired++
      if (item.quantity <= 2) lowStock++
    }

    return { total, expiringSoon, expired, lowStock }
  }, [items])

  // Smart suggestions
  const suggestions = useMemo(() => {
    const result: ShoppingSuggestion[] = []

    for (const item of items) {
      const days = daysUntilExpiry(item.expirationDate)
      if (days >= 0 && days <= 3 && item.category !== 'Limpeza') {
        result.push({
          id: `exp-${item.id}`,
          itemName: item.name,
          reason: `Seu ${item.name.toLowerCase()} vence em ${days} dia${days !== 1 ? 's' : ''} — adicione à lista de compras`,
          urgency: days <= 1 ? 'high' : 'medium',
          addedToCart: false,
        })
      }
      if (item.quantity <= 2) {
        const existing = result.find((s) => s.itemName === item.name)
        if (!existing) {
          result.push({
            id: `low-${item.id}`,
            itemName: item.name,
            reason: `Estoque baixo de ${item.name.toLowerCase()} — somente ${item.quantity} ${item.unit} restante${item.quantity !== 1 ? 's' : ''}`,
            urgency: item.quantity <= 1 ? 'high' : 'low',
            addedToCart: false,
          })
        }
      }
    }

    return result.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 }
      return order[a.urgency] - order[b.urgency]
    })
  }, [items])

  const [suggestionCart, setSuggestionCart] = useState<Set<string>>(new Set())

  // Filtered & sorted items
  const filteredItems = useMemo(() => {
    let result = [...items]

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((item) => item.name.toLowerCase().includes(q))
    }

    // Filter tabs
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    switch (activeFilter) {
      case 'Vencendo':
        result = result.filter((item) => {
          const d = daysUntilExpiry(item.expirationDate)
          return d >= 0 && d <= 3
        })
        break
      case 'Expirados':
        result = result.filter((item) => daysUntilExpiry(item.expirationDate) < 0)
        break
      case 'Estoque Baixo':
        result = result.filter((item) => item.quantity <= 2)
        break
      case 'Novos':
        result = result.filter((item) => {
          const added = new Date(item.addedDate + 'T00:00:00')
          return (today.getTime() - added.getTime()) / (1000 * 60 * 60 * 24) <= 3
        })
        break
    }

    // Sort
    switch (sortBy) {
      case 'Nome A-Z':
        result.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
        break
      case 'Validade':
        result.sort(
          (a, b) =>
            new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
        )
        break
      case 'Quantidade':
        result.sort((a, b) => a.quantity - b.quantity)
        break
    }

    return result
  }, [items, search, activeFilter, sortBy])

  // Actions
  const handleAddItem = useCallback(() => {
    if (!formName.trim()) return

    const newItem: PantryItem = {
      id: generateId(),
      name: formName.trim(),
      category: formCategory,
      quantity: parseFloat(formQty) || 1,
      unit: formUnit,
      initialQuantity: parseFloat(formQty) || 1,
      expirationDate: formExpiry || daysFromNow(7),
      addedDate: new Date().toISOString().split('T')[0],
    }

    updateItems([newItem, ...items])
    setFormName('')
    setFormQty('1')
    setFormExpiry('')
    setShowForm(false)
  }, [formName, formCategory, formQty, formUnit, formExpiry, items, updateItems])

  const handleUseItem = useCallback(
    (id: string) => {
      updateItems(
        items.map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item
        )
      )
    },
    [items, updateItems]
  )

  const handleRemoveItem = useCallback(
    (id: string) => {
      updateItems(items.filter((item) => item.id !== id))
      if (editingId === id) setEditingId(null)
    },
    [items, updateItems, editingId]
  )

  const handleUpdateQty = useCallback(
    (id: string) => {
      const val = parseFloat(editQty)
      if (isNaN(val) || val < 0) {
        setEditingId(null)
        return
      }
      updateItems(
        items.map((item) =>
          item.id === id
            ? { ...item, quantity: val, initialQuantity: Math.max(item.initialQuantity, val) }
            : item
        )
      )
      setEditingId(null)
    },
    [editQty, items, updateItems]
  )

  const handleClearExpired = useCallback(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    updateItems(
      items.filter((item) => new Date(item.expirationDate + 'T00:00:00').getTime() >= now.getTime())
    )
  }, [items, updateItems])

  const handleExportList = useCallback(async () => {
    const text = items
      .map(
        (i) =>
          `${CATEGORY_EMOJIS[i.category]} ${i.name} — ${i.quantity} ${i.unit} (vence: ${formatDateBR(i.expirationDate)})`
      )
      .join('\n')
    try {
      await navigator.clipboard.writeText(`📋 Lista de Despensa — DomPlace\n${text}`)
    } catch {
      // clipboard not available
    }
  }, [items])

  const toggleSuggestionCart = useCallback((id: string) => {
    setSuggestionCart((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const animVariants = prefersReduced
    ? {}
    : {
        cardEnter: { opacity: 0, y: 16, scale: 0.97 },
        cardVisible: { opacity: 1, y: 0, scale: 1 },
      }

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 space-y-6" aria-label="Gerenciador de Despensa">
      {/* ===== HEADER ===== */}
      <motion.div
        initial={prefersReduced ? {} : { opacity: 0, y: 12 }}
        animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
        transition={prefersReduced ? undefined : { type: 'spring' as const, stiffness: 260, damping: 24 }}
        className="text-center space-y-2"
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent leading-tight">
          Gerenciador de Despensa
        </h1>
        <p className="text-sm text-muted-foreground">
          Controle seu estoque caseiro e nunca falte ingredientes
        </p>
      </motion.div>

      {/* ===== STATS BAR ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total de Itens', value: stats.total, emoji: '📦', gradient: 'stat-gradient-primary' },
          { label: 'Vencendo em breve', value: stats.expiringSoon, emoji: '⚠️', gradient: 'stat-gradient-amber' },
          { label: 'Expirados', value: stats.expired, emoji: '🔴', gradient: 'stat-gradient-teal' },
          { label: 'Estoque Baixo', value: stats.lowStock, emoji: '🟡', gradient: 'stat-gradient-primary' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={prefersReduced ? {} : animVariants.cardEnter}
            animate={prefersReduced ? {} : animVariants.cardVisible}
            transition={prefersReduced ? undefined : { type: 'spring' as const, stiffness: 260, damping: 24 }}
            className={`r73-stat-card rounded-xl p-4 ${stat.gradient} flex flex-col items-center justify-center gap-1 min-h-[80px] r62-card-lift`}
          >
            <span className="text-2xl">{stat.emoji}</span>
            <span className="text-2xl font-bold">{stat.value}</span>
            <span className="text-[11px] font-medium text-muted-foreground text-center">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* ===== ADD ITEM FORM (expandable) ===== */}
      <div className="r73-pantry-form">
        <Button
          onClick={() => setShowForm((prev) => !prev)}
          variant="outline"
          className="w-full min-h-[44px] flex items-center justify-center gap-2 text-sm font-semibold border-emerald-500/30 hover:bg-emerald-500/5"
        >
          {showForm ? '✕ Fechar formulário' : '＋ Adicionar novo item'}
        </Button>

        <AnimatePresence>
          {showForm && (
            <motion.div
              key="pantry-form"
              initial={prefersReduced ? {} : { opacity: 0, height: 0 }}
              animate={prefersReduced ? {} : { opacity: 1, height: 'auto' }}
              exit={prefersReduced ? {} : { opacity: 0, height: 0 }}
              transition={prefersReduced ? undefined : { type: 'spring' as const, stiffness: 300, damping: 28 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Nome do item (ex: Leite Integral)"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="min-h-[44px] text-sm"
                  />
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as PantryCategory)}
                    className="min-h-[44px] px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_EMOJIS[cat]} {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Input
                    type="number"
                    placeholder="Qtd"
                    min="0"
                    step="0.1"
                    value={formQty}
                    onChange={(e) => setFormQty(e.target.value)}
                    className="min-h-[44px] text-sm"
                  />
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value as PantryUnit)}
                    className="min-h-[44px] px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="date"
                    value={formExpiry}
                    onChange={(e) => setFormExpiry(e.target.value)}
                    className="min-h-[44px] text-sm sm:col-span-1 col-span-2"
                  />
                </div>
                <motion.div whileTap={prefersReduced ? undefined : { scale: 0.97 }}>
                  <Button
                    onClick={handleAddItem}
                    disabled={!formName.trim()}
                    className="r73-add-btn w-full min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm"
                  >
                    Adicionar
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== FILTER / SORT CONTROLS ===== */}
      <div className="space-y-3">
        <Input
          placeholder="🔍 Buscar item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-h-[44px] text-sm"
        />

        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`r73-filter-chip shrink-0 px-4 min-h-[44px] min-w-[44px] rounded-full text-xs font-semibold transition-colors flex items-center justify-center whitespace-nowrap ${
                activeFilter === tab
                  ? 'bg-emerald-600 text-white'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-emerald-500/40'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setSortBy(opt)}
              className={`shrink-0 px-3 min-h-[44px] min-w-[44px] rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                sortBy === opt
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              📊 {opt}
            </button>
          ))}
        </div>
      </div>

      {/* ===== PANTRY ITEMS GRID ===== */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">📭</p>
          <p className="text-sm mt-2">Nenhum item encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => {
              const days = daysUntilExpiry(item.expirationDate)
              const status = getExpirationStatus(days)
              const isExpiringSoon = days >= 0 && days <= 2
              const isExpired = days < 0
              const isLowStock = item.quantity <= 2
              const progressPct =
                item.initialQuantity > 0
                  ? Math.min(100, Math.round((item.quantity / item.initialQuantity) * 100))
                  : 0

              return (
                <motion.div
                  key={item.id}
                  layout={prefersReduced ? false : true}
                  initial={prefersReduced ? {} : { opacity: 0, y: 12, scale: 0.97 }}
                  animate={prefersReduced ? {} : { opacity: 1, y: 0, scale: 1 }}
                  exit={prefersReduced ? {} : { opacity: 0, scale: 0.95 }}
                  transition={
                    prefersReduced
                      ? undefined
                      : { type: 'spring' as const, stiffness: 280, damping: 26, delay: idx * 0.03 }
                  }
                  className={`r73-pantry-card rounded-xl p-4 border bg-card space-y-3 transition-colors r62-card-lift r98-pantry-item ${
                    isExpiringSoon ? 'r73-expiring-glow' : ''
                  } ${isLowStock ? 'r73-low-stock' : ''} ${
                    isExpiringSoon && !isExpired ? 'border-orange-300 dark:border-orange-700' : ''
                  } ${isExpired ? 'border-red-300 dark:border-red-700' : ''} ${
                    isLowStock && !isExpiringSoon && !isExpired ? 'border-yellow-300 dark:border-yellow-700' : ''
                  } ${
                    !isExpiringSoon && !isLowStock && !isExpired
                      ? 'border-border'
                      : ''
                  }`}
                >
                  {/* Category + Name */}
                  <div className="flex items-start gap-3">
                    <span className="text-3xl leading-none">{CATEGORY_EMOJIS[item.category]}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold truncate">{item.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.quantity} {item.unit} · {item.category}
                      </p>
                    </div>
                  </div>

                  {/* Expiration badge */}
                  <Badge
                    variant="secondary"
                    className={`text-[11px] font-semibold ${status.bgColor} ${status.textColor} border ${status.borderColor}`}
                  >
                    {status.label}
                  </Badge>

                  {/* Added date */}
                  <p className="text-[10px] text-muted-foreground">
                    Adicionado em {formatDateBR(item.addedDate)}
                  </p>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Consumido</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`r73-progress-bar h-full rounded-full transition-all duration-500 ${
                          progressPct > 50
                            ? 'bg-emerald-500'
                            : progressPct > 25
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${progressPct}%`, transformOrigin: 'left center' }}
                      />
                    </div>
                  </div>

                  <Separator className="my-1" />

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    {/* Edit qty */}
                    {editingId === item.id ? (
                      <div className="flex items-center gap-1 flex-1">
                        <Input
                          type="number"
                          value={editQty}
                          onChange={(e) => setEditQty(e.target.value)}
                          className="min-h-[44px] min-w-[60px] text-xs p-1.5"
                          min="0"
                          step="0.1"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdateQty(item.id)}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleUpdateQty(item.id)}
                          className="min-h-[44px] min-w-[44px] px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                        >
                          ✓
                        </Button>
                      </div>
                    ) : (
                      <motion.button
                        whileTap={prefersReduced ? undefined : { scale: 0.9 }}
                        onClick={() => {
                          setEditingId(item.id)
                          setEditQty(String(item.quantity))
                        }}
                        className="r73-action-btn min-h-[44px] min-w-[44px] rounded-lg border border-border flex items-center justify-center text-sm hover:bg-muted transition-colors"
                        title="Editar quantidade"
                      >
                        ✏️
                      </motion.button>
                    )}

                    {/* Use item */}
                    <motion.button
                      whileTap={prefersReduced ? undefined : { scale: 0.9 }}
                      onClick={() => handleUseItem(item.id)}
                      disabled={item.quantity <= 0}
                      className="r73-action-btn min-h-[44px] min-w-[44px] rounded-lg border border-border flex items-center justify-center text-sm hover:bg-muted transition-colors disabled:opacity-40"
                      title="Usar 1 unidade"
                    >
                      ↓
                    </motion.button>

                    {/* Remove */}
                    <motion.button
                      whileTap={prefersReduced ? undefined : { scale: 0.9 }}
                      onClick={() => handleRemoveItem(item.id)}
                      className="r73-action-btn min-h-[44px] min-w-[44px] rounded-lg border border-red-200 dark:border-red-800 flex items-center justify-center text-sm hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors ml-auto"
                      title="Remover item"
                    >
                      🗑️
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ===== SMART SUGGESTIONS PANEL ===== */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            💡 Sugestões Inteligentes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestions.map((sug) => {
              const urgencyConfig =
                sug.urgency === 'high'
                  ? 'border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20'
                  : sug.urgency === 'medium'
                  ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20'
                  : 'border-yellow-300 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-950/20'

              return (
                <motion.div
                  key={sug.id}
                  initial={prefersReduced ? {} : { opacity: 0, y: 10 }}
                  animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
                  transition={
                    prefersReduced
                      ? undefined
                      : { type: 'spring' as const, stiffness: 260, damping: 24 }
                  }
                  className={`r73-suggestion-card rounded-xl p-4 border ${urgencyConfig}`}
                >
                  <p className="text-sm text-muted-foreground">{sug.reason}</p>
                  <div className="mt-3">
                    <motion.div whileTap={prefersReduced ? undefined : { scale: 0.97 }}>
                      <Button
                        size="sm"
                        variant={suggestionCart.has(sug.id) ? 'secondary' : 'default'}
                        onClick={() => toggleSuggestionCart(sug.id)}
                        className={`min-h-[44px] min-w-[44px] text-xs font-semibold ${
                          suggestionCart.has(sug.id)
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {suggestionCart.has(sug.id) ? '✓ Na lista' : 'Adicionar à lista'}
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* ===== QUICK ACTIONS BAR ===== */}
      <div className="flex flex-col sm:flex-row gap-3">
        <motion.div whileTap={prefersReduced ? undefined : { scale: 0.97 }} className="flex-1">
          <Button
            variant="outline"
            onClick={handleClearExpired}
            disabled={stats.expired === 0}
            className="r73-quick-btn w-full min-h-[44px] border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-sm font-semibold disabled:opacity-40"
          >
            🗑️ Limpar expirados
          </Button>
        </motion.div>
        <motion.div whileTap={prefersReduced ? undefined : { scale: 0.97 }} className="flex-1">
          <Button
            variant="outline"
            onClick={handleExportList}
            className="r73-quick-btn w-full min-h-[44px] border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-sm font-semibold"
          >
            📋 Exportar lista
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
