'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Plus,
  Trash2,
  Copy,
  Share2,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Sparkles,
  Tag,
  TrendingDown,
  Loader2,
  PackageOpen,
  AlertCircle,
  X,
  Pencil,
  LayoutGrid,
  PartyPopper,
  Heart,
  Baby,
  Leaf,
  Clock,
  DollarSign,
  Zap,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// ─── Constants ────────────────────────────────────────────────────

const STORAGE_KEY = 'domplace-smart-list-manager'

const UNITS = ['un', 'kg', 'pacote', 'litro'] as const
type Unit = (typeof UNITS)[number]

type Priority = 'high' | 'medium' | 'low'

interface StoreSuggestion {
  storeName: string
  price: number
  distance: string
}

// ─── Types ───────────────────────────────────────────────────────

interface ListItem {
  id: string
  name: string
  quantity: number
  unit: Unit
  estimatedPrice: number
  actualPrice: number | null
  priority: Priority
  checked: boolean
  category: string
  cheapestStore: StoreSuggestion | null
}

interface ShoppingList {
  id: string
  name: string
  items: ListItem[]
  budget: number
  createdAt: string
}

interface ListTemplate {
  id: string
  name: string
  emoji: string
  description: string
  items: Omit<ListItem, 'id' | 'checked' | 'actualPrice' | 'cheapestStore'>[]
}

interface AisleCategory {
  id: string
  name: string
  emoji: string
  borderColor: string
  bgColor: string
  textColor: string
  keywords: string[]
}

// ─── Aisle / Department categories ────────────────────────────────

const AISLE_CATEGORIES: AisleCategory[] = [
  {
    id: 'hortifruti',
    name: 'Hortifruti',
    emoji: '🥬',
    borderColor: 'border-l-emerald-500',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    keywords: ['banana', 'tomate', 'alface', 'maçã', 'laranja', 'cebola', 'batata', 'cenoura', 'fruta', 'verdura', 'legume', 'limão', 'mamão', 'abacaxi', 'morango', 'uva', 'manga', 'brócolis', 'pepino', 'abobrinha', 'pimentão'],
  },
  {
    id: 'laticinios',
    name: 'Laticínios',
    emoji: '🧀',
    borderColor: 'border-l-blue-500',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-600 dark:text-blue-400',
    keywords: ['leite', 'queijo', 'manteiga', 'iogurte', 'requeijão', 'creme', 'nata', 'ricota', 'muçarela', 'provolone', 'coalhada'],
  },
  {
    id: 'padaria',
    name: 'Padaria',
    emoji: '🍞',
    borderColor: 'border-l-amber-500',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-600 dark:text-amber-400',
    keywords: ['pão', 'bolacha', 'biscoito', 'bolo', 'torrada', 'croissant', 'rosca', 'tapioca', 'farinha'],
  },
  {
    id: 'carnes',
    name: 'Carnes',
    emoji: '🥩',
    borderColor: 'border-l-red-500',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-600 dark:text-red-400',
    keywords: ['frango', 'boi', 'carne', 'peixe', 'camarão', 'linguiça', 'salsicha', 'bacon', 'peru', 'porco', 'costela', 'picanha', 'moída', 'file', 'atum', 'salmão'],
  },
  {
    id: 'limpeza',
    name: 'Limpeza',
    emoji: '🧹',
    borderColor: 'border-l-cyan-500',
    bgColor: 'bg-cyan-500/10',
    textColor: 'text-cyan-600 dark:text-cyan-400',
    keywords: ['detergente', 'sabão', 'desinfetante', 'amaciante', 'esponja', 'papel', 'vassoura', 'balde', 'cloro', 'multiuso', 'escova'],
  },
  {
    id: 'bebidas',
    name: 'Bebidas',
    emoji: '🥤',
    borderColor: 'border-l-purple-500',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-600 dark:text-purple-400',
    keywords: ['café', 'suco', 'água', 'refrigerante', 'cerveja', 'vinho', 'chá', 'guaraná', 'coca', 'mate'],
  },
  {
    id: 'higiene',
    name: 'Higiene',
    emoji: '🧴',
    borderColor: 'border-l-pink-500',
    bgColor: 'bg-pink-500/10',
    textColor: 'text-pink-600 dark:text-pink-400',
    keywords: ['sabonete', 'shampoo', 'condicionador', 'pasta', 'escova', 'desodorante', 'creme', 'hidratante', 'protetor'],
  },
  {
    id: 'frios',
    name: 'Frios',
    emoji: '🥓',
    borderColor: 'border-l-orange-500',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-600 dark:text-orange-400',
    keywords: ['presunto', 'peito', 'pernil', 'salame', 'mortadela', 'frios', 'defumado'],
  },
]

// ─── Autocomplete database ────────────────────────────────────────

const AUTOCOMPLETE_ITEMS: Omit<ListItem, 'id' | 'checked' | 'actualPrice' | 'cheapestStore'>[] = [
  { name: 'Banana', quantity: 1, unit: 'kg', estimatedPrice: 5.90, priority: 'low', category: 'hortifruti' },
  { name: 'Tomate', quantity: 1, unit: 'kg', estimatedPrice: 8.49, priority: 'medium', category: 'hortifruti' },
  { name: 'Alface', quantity: 1, unit: 'un', estimatedPrice: 3.50, priority: 'low', category: 'hortifruti' },
  { name: 'Cebola', quantity: 1, unit: 'kg', estimatedPrice: 6.99, priority: 'low', category: 'hortifruti' },
  { name: 'Batata', quantity: 1, unit: 'kg', estimatedPrice: 5.49, priority: 'low', category: 'hortifruti' },
  { name: 'Leite Integral 1L', quantity: 3, unit: 'un', estimatedPrice: 5.99, priority: 'high', category: 'laticinios' },
  { name: 'Queijo Mussarela 400g', quantity: 1, unit: 'pacote', estimatedPrice: 19.90, priority: 'medium', category: 'laticinios' },
  { name: 'Manteiga 200g', quantity: 1, unit: 'un', estimatedPrice: 9.90, priority: 'medium', category: 'laticinios' },
  { name: 'Iogurte Natural 170g', quantity: 4, unit: 'un', estimatedPrice: 3.49, priority: 'low', category: 'laticinios' },
  { name: 'Pão Francês', quantity: 1, unit: 'kg', estimatedPrice: 14.90, priority: 'high', category: 'padaria' },
  { name: 'Bolo de Chocolate', quantity: 1, unit: 'un', estimatedPrice: 22.00, priority: 'low', category: 'padaria' },
  { name: 'Peito de Frango', quantity: 1, unit: 'kg', estimatedPrice: 16.90, priority: 'high', category: 'carnes' },
  { name: 'Carne Moída 500g', quantity: 1, unit: 'pacote', estimatedPrice: 22.50, priority: 'high', category: 'carnes' },
  { name: 'Linguiça', quantity: 1, unit: 'kg', estimatedPrice: 19.90, priority: 'medium', category: 'carnes' },
  { name: 'Detergente 500ml', quantity: 1, unit: 'un', estimatedPrice: 3.49, priority: 'medium', category: 'limpeza' },
  { name: 'Sabão em Pó 1kg', quantity: 1, unit: 'pacote', estimatedPrice: 12.90, priority: 'medium', category: 'limpeza' },
  { name: 'Café 500g', quantity: 1, unit: 'pacote', estimatedPrice: 18.90, priority: 'high', category: 'bebidas' },
  { name: 'Suco de Laranja 1L', quantity: 2, unit: 'un', estimatedPrice: 8.50, priority: 'low', category: 'bebidas' },
  { name: 'Água Mineral 1.5L', quantity: 3, unit: 'un', estimatedPrice: 3.00, priority: 'low', category: 'bebidas' },
  { name: 'Shampoo 400ml', quantity: 1, unit: 'un', estimatedPrice: 14.90, priority: 'medium', category: 'higiene' },
  { name: 'Pasta de Dente', quantity: 1, unit: 'un', estimatedPrice: 6.99, priority: 'medium', category: 'higiene' },
  { name: 'Presunto 200g', quantity: 1, unit: 'pacote', estimatedPrice: 9.90, priority: 'medium', category: 'frios' },
  { name: 'Mamão Papaia', quantity: 1, unit: 'un', estimatedPrice: 7.50, priority: 'low', category: 'hortifruti' },
  { name: 'Brócolis', quantity: 1, unit: 'un', estimatedPrice: 8.90, priority: 'low', category: 'hortifruti' },
  { name: 'Requeijão 200g', quantity: 1, unit: 'un', estimatedPrice: 7.49, priority: 'medium', category: 'laticinios' },
  { name: 'Desinfetante 2L', quantity: 1, unit: 'un', estimatedPrice: 8.90, priority: 'medium', category: 'limpeza' },
  { name: 'Amaciante 2L', quantity: 1, unit: 'un', estimatedPrice: 12.50, priority: 'medium', category: 'limpeza' },
  { name: 'Picanha', quantity: 1, unit: 'kg', estimatedPrice: 59.90, priority: 'high', category: 'carnes' },
  { name: 'Salmão 400g', quantity: 1, unit: 'pacote', estimatedPrice: 42.90, priority: 'low', category: 'carnes' },
  { name: 'Refrigerante 2L', quantity: 2, unit: 'un', estimatedPrice: 9.90, priority: 'low', category: 'bebidas' },
  { name: 'Sabonete Líquido 250ml', quantity: 1, unit: 'un', estimatedPrice: 11.90, priority: 'medium', category: 'higiene' },
]

// ─── List templates ───────────────────────────────────────────────

const LIST_TEMPLATES: ListTemplate[] = [
  {
    id: 'weekly',
    name: 'Essenciais Semanais',
    emoji: '📋',
    description: 'Itens básicos para a semana',
    items: [
      { name: 'Leite Integral 1L', quantity: 6, unit: 'un', estimatedPrice: 5.99, priority: 'high', category: 'laticinios' },
      { name: 'Pão Francês', quantity: 2, unit: 'kg', estimatedPrice: 14.90, priority: 'high', category: 'padaria' },
      { name: 'Banana', quantity: 1, unit: 'kg', estimatedPrice: 5.90, priority: 'low', category: 'hortifruti' },
      { name: 'Tomate', quantity: 1, unit: 'kg', estimatedPrice: 8.49, priority: 'medium', category: 'hortifruti' },
      { name: 'Peito de Frango', quantity: 1, unit: 'kg', estimatedPrice: 16.90, priority: 'high', category: 'carnes' },
      { name: 'Café 500g', quantity: 1, unit: 'pacote', estimatedPrice: 18.90, priority: 'high', category: 'bebidas' },
      { name: 'Detergente 500ml', quantity: 2, unit: 'un', estimatedPrice: 3.49, priority: 'medium', category: 'limpeza' },
      { name: 'Arroz 5kg', quantity: 1, unit: 'pacote', estimatedPrice: 24.90, priority: 'high', category: 'padaria' },
      { name: 'Feijão Carioca 1kg', quantity: 1, unit: 'pacote', estimatedPrice: 8.90, priority: 'high', category: 'padaria' },
      { name: 'Óleo de Soja 900ml', quantity: 1, unit: 'un', estimatedPrice: 7.90, priority: 'medium', category: 'padaria' },
    ],
  },
  {
    id: 'party',
    name: 'Festa',
    emoji: '🎉',
    description: 'Tudo para uma festa memorável',
    items: [
      { name: 'Refrigerante 2L', quantity: 6, unit: 'un', estimatedPrice: 9.90, priority: 'high', category: 'bebidas' },
      { name: 'Cerveja Long Neck', quantity: 24, unit: 'un', estimatedPrice: 3.49, priority: 'high', category: 'bebidas' },
      { name: 'Picanha', quantity: 2, unit: 'kg', estimatedPrice: 59.90, priority: 'high', category: 'carnes' },
      { name: 'Linguiça', quantity: 2, unit: 'kg', estimatedPrice: 19.90, priority: 'high', category: 'carnes' },
      { name: 'Pão de Alho', quantity: 2, unit: 'pacote', estimatedPrice: 12.90, priority: 'medium', category: 'padaria' },
      { name: 'Queijo Mussarela 400g', quantity: 3, unit: 'pacote', estimatedPrice: 19.90, priority: 'medium', category: 'laticinios' },
      { name: 'Salgadinhos Mix', quantity: 2, unit: 'pacote', estimatedPrice: 8.90, priority: 'low', category: 'padaria' },
      { name: 'Bolo de Chocolate', quantity: 1, unit: 'un', estimatedPrice: 45.00, priority: 'medium', category: 'padaria' },
      { name: 'Guardanapos 50un', quantity: 2, unit: 'pacote', estimatedPrice: 5.90, priority: 'medium', category: 'limpeza' },
      { name: 'Copos Descartáveis 50un', quantity: 3, unit: 'pacote', estimatedPrice: 6.90, priority: 'medium', category: 'limpeza' },
    ],
  },
  {
    id: 'healthy',
    name: 'Vida Saudável',
    emoji: '🥗',
    description: 'Alimentação equilibrada e nutritiva',
    items: [
      { name: 'Brócolis', quantity: 2, unit: 'un', estimatedPrice: 8.90, priority: 'high', category: 'hortifruti' },
      { name: 'Alface', quantity: 2, unit: 'un', estimatedPrice: 3.50, priority: 'high', category: 'hortifruti' },
      { name: 'Cenoura', quantity: 1, unit: 'kg', estimatedPrice: 6.49, priority: 'high', category: 'hortifruti' },
      { name: 'Peito de Frango', quantity: 2, unit: 'kg', estimatedPrice: 16.90, priority: 'high', category: 'carnes' },
      { name: 'Salmão 400g', quantity: 1, unit: 'pacote', estimatedPrice: 42.90, priority: 'medium', category: 'carnes' },
      { name: 'Iogurte Natural 170g', quantity: 6, unit: 'un', estimatedPrice: 3.49, priority: 'medium', category: 'laticinios' },
      { name: 'Mamão Papaia', quantity: 1, unit: 'un', estimatedPrice: 7.50, priority: 'medium', category: 'hortifruti' },
      { name: 'Abobrinha', quantity: 2, unit: 'un', estimatedPrice: 5.90, priority: 'medium', category: 'hortifruti' },
      { name: 'Castanha de Caju 200g', quantity: 1, unit: 'pacote', estimatedPrice: 22.90, priority: 'low', category: 'hortifruti' },
      { name: 'Suco de Laranja 1L', quantity: 3, unit: 'un', estimatedPrice: 8.50, priority: 'medium', category: 'bebidas' },
    ],
  },
  {
    id: 'baby',
    name: 'Bebê',
    emoji: '👶',
    description: 'Itens essenciais para o bebê',
    items: [
      { name: 'Fralda Descartável M', quantity: 1, unit: 'pacote', estimatedPrice: 89.90, priority: 'high', category: 'higiene' },
      { name: 'Lenço Umedecido 80un', quantity: 3, unit: 'pacote', estimatedPrice: 12.90, priority: 'high', category: 'higiene' },
      { name: 'Leite em Pó 800g', quantity: 1, unit: 'pacote', estimatedPrice: 54.90, priority: 'high', category: 'laticinios' },
      { name: 'Sabonete Líquido Baby 250ml', quantity: 1, unit: 'un', estimatedPrice: 16.90, priority: 'medium', category: 'higiene' },
      { name: 'Creme Rash 100g', quantity: 1, unit: 'un', estimatedPrice: 29.90, priority: 'medium', category: 'higiene' },
      { name: 'Mamadeira 260ml', quantity: 2, unit: 'un', estimatedPrice: 24.90, priority: 'medium', category: 'laticinios' },
      { name: 'Papel Higiênico Folha Dupla', quantity: 4, unit: 'pacote', estimatedPrice: 4.90, priority: 'medium', category: 'limpeza' },
      { name: 'Detergente Neutro 500ml', quantity: 1, unit: 'un', estimatedPrice: 4.49, priority: 'low', category: 'limpeza' },
    ],
  },
]

// ─── Suggestion engine ────────────────────────────────────────────

const SUGGESTION_MAP: Record<string, string[]> = {
  hortifruti: ['Limão', 'Mamão Papaia', 'Abacaxi', 'Pepino'],
  laticinios: ['Iogurte Natural 170g', 'Requeijão 200g', 'Manteiga 200g'],
  padaria: ['Tapioca 500g', 'Biscoito Cream Cracker', 'Farinha de Trigo 1kg'],
  carnes: ['Linguiça', 'Bacon 200g', 'File de Frango'],
  limpeza: ['Esponja Multiuso', 'Amaciante 2L', 'Cloro 1L'],
  bebidas: ['Chá Gelado', 'Água Mineral 1.5L', 'Néctar de Frutas'],
  higiene: ['Desodorante Roll-on', 'Hidratante Corporal', 'Creme Dental 90g'],
  frios: ['Mortadela 200g', 'Salame 150g', 'Queijo Prato 400g'],
}

function getCategoryForName(name: string): string {
  const lower = name.toLowerCase()
  for (const cat of AISLE_CATEGORIES) {
    if (cat.keywords.some((kw) => lower.includes(kw))) return cat.id
  }
  return 'hortifruti'
}

function getAisleMeta(catId: string): AisleCategory {
  return AISLE_CATEGORIES.find((c) => c.id === catId) ?? AISLE_CATEGORIES[0]
}

function generateCheapestStore(itemName: string, price: number): StoreSuggestion {
  const stores = [
    { name: 'Supermercado Savegnago', priceMult: 1.0, dist: '1.2 km' },
    { name: 'Atacadão', priceMult: 0.92, dist: '3.8 km' },
    { name: 'Carrefour', priceMult: 1.05, dist: '2.1 km' },
    { name: 'Assaí Atacadista', priceMult: 0.89, dist: '4.5 km' },
    { name: 'Pão de Açúcar', priceMult: 1.12, dist: '0.8 km' },
  ]
  // deterministic pick based on name hash
  let hash = 0
  for (let i = 0; i < itemName.length; i++) hash = ((hash << 5) - hash + itemName.charCodeAt(i)) | 0
  const idx = Math.abs(hash) % stores.length
  const store = stores[idx]
  return { storeName: store.name, price: Math.round(price * store.priceMult * 100) / 100, distance: store.dist }
}

// ─── Helpers ─────────────────────────────────────────────────────

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const uid = () => `slm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const PRIORITY_CONFIG = {
  high: { label: 'Alta', color: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30', icon: AlertCircle },
  medium: { label: 'Média', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30', icon: Zap },
  low: { label: 'Baixa', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', icon: Clock },
} as const

// ─── localStorage persistence ───────────────────────────────────

interface PersistedState {
  lists: ShoppingList[]
  activeListId: string
}

function loadState(): PersistedState {
  if (typeof window === 'undefined') {
    return { lists: [], activeListId: '' }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { lists: [], activeListId: '' }
}

function saveState(s: PersistedState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch { /* ignore */ }
}

// ─── Template icon helper ─────────────────────────────────────────

function TemplateIcon({ templateId }: { templateId: string }) {
  switch (templateId) {
    case 'party':
      return <PartyPopper className="h-4 w-4 text-pink-500" />
    case 'healthy':
      return <Leaf className="h-4 w-4 text-emerald-500" />
    case 'baby':
      return <Baby className="h-4 w-4 text-sky-500" />
    default:
      return <ShoppingCart className="h-4 w-4 text-amber-500" />
  }
}

// ─── Main component ─────────────────────────────────────────────

export function SmartListManager() {
  const [mounted, setMounted] = useState(false)
  const [lists, setLists] = useState<ShoppingList[]>([])
  const [activeListId, setActiveListId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingActualPrice, setEditingActualPrice] = useState('')
  const [shareToast, setShareToast] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Hydration guard
  useEffect(() => {
    const state = loadState()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLists(state.lists)
    setActiveListId(state.activeListId)
    setMounted(true)
  }, [])

  // Persist on change
  useEffect(() => {
    if (!mounted) return
    saveState({ lists, activeListId })
  }, [mounted, lists, activeListId])

  // Auto-expand all categories on mount
  useEffect(() => {
    if (mounted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpandedCategories(new Set(AISLE_CATEGORIES.map((c) => c.id)))
    }
  }, [mounted])

  // ─── Derived state ────────────────────────────────────────────

  const activeList = useMemo(
    () => lists.find((l) => l.id === activeListId) ?? null,
    [lists, activeListId],
  )

  const uncheckedItems = useMemo(
    () => (activeList?.items.filter((i) => !i.checked) ?? []),
    [activeList],
  )

  const checkedItems = useMemo(
    () => (activeList?.items.filter((i) => i.checked) ?? []),
    [activeList],
  )

  const estimatedTotal = useMemo(
    () => uncheckedItems.reduce((sum, i) => sum + i.estimatedPrice * i.quantity, 0),
    [uncheckedItems],
  )

  const budgetPercent = useMemo(
    () => (activeList && activeList.budget > 0 ? (estimatedTotal / activeList.budget) * 100 : 0),
    [activeList, estimatedTotal],
  )

  const overBudget = budgetPercent > 100

  // Group items by category
  const groupedItems = useMemo(() => {
    const map = new Map<string, ListItem[]>()
    for (const item of uncheckedItems) {
      const list = map.get(item.category) ?? []
      list.push(item)
      map.set(item.category, list)
    }
    return map
  }, [uncheckedItems])

  // Search autocomplete suggestions
  const autocompleteSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return []
    const q = searchQuery.toLowerCase()
    return AUTOCOMPLETE_ITEMS.filter((i) => i.name.toLowerCase().includes(q)).slice(0, 6)
  }, [searchQuery])

  // Suggested items based on list content
  const suggestions = useMemo(() => {
    const catIds = new Set(activeList?.items.map((i) => i.category) ?? [])
    const existingNames = new Set(activeList?.items.map((i) => i.name.toLowerCase()) ?? [])
    const suggestionsList: Omit<ListItem, 'id' | 'checked' | 'actualPrice' | 'cheapestStore'>[] = []
    for (const catId of catIds) {
      const items = SUGGESTION_MAP[catId] ?? []
      for (const name of items) {
        if (!existingNames.has(name.toLowerCase())) {
          const found = AUTOCOMPLETE_ITEMS.find((a) => a.name === name)
          if (found) suggestionsList.push(found)
        }
      }
    }
    return suggestionsList.slice(0, 4)
  }, [activeList])

  // ─── List CRUD handlers ───────────────────────────────────────

  const createList = useCallback((template?: ListTemplate) => {
    const newList: ShoppingList = {
      id: uid(),
      name: template ? template.name : 'Nova Lista',
      budget: 200,
      createdAt: new Date().toISOString(),
      items: template
        ? template.items.map((i) => ({
            ...i,
            id: uid(),
            checked: false,
            actualPrice: null,
            cheapestStore: generateCheapestStore(i.name, i.estimatedPrice),
          }))
        : [],
    }
    setLists((prev) => [...prev, newList])
    setActiveListId(newList.id)
    setShowTemplates(false)
  }, [])

  const renameList = useCallback(
    (listId: string, newName: string) => {
      if (!newName.trim()) return
      setLists((prev) => prev.map((l) => (l.id === listId ? { ...l, name: newName.trim() } : l)))
      setEditingListId(null)
      setEditingName('')
    },
    [],
  )

  const deleteList = useCallback(
    (listId: string) => {
      setLists((prev) => {
        const next = prev.filter((l) => l.id !== listId)
        if (activeListId === listId) {
          setActiveListId(next[0]?.id ?? '')
        }
        return next
      })
    },
    [activeListId],
  )

  const duplicateList = useCallback((listId: string) => {
    setLists((prev) => {
      const src = prev.find((l) => l.id === listId)
      if (!src) return prev
      const dup: ShoppingList = {
        id: uid(),
        name: `${src.name} (cópia)`,
        items: src.items.map((i) => ({ ...i, id: uid() })),
        budget: src.budget,
        createdAt: new Date().toISOString(),
      }
      return [...prev, dup]
    })
  }, [])

  // ─── Item handlers ────────────────────────────────────────────

  const addItemToList = useCallback(
    (item: Omit<ListItem, 'id' | 'checked' | 'actualPrice' | 'cheapestStore'>) => {
      if (!activeListId) return
      const newItem: ListItem = {
        ...item,
        id: uid(),
        checked: false,
        actualPrice: null,
        cheapestStore: generateCheapestStore(item.name, item.estimatedPrice),
      }
      setLists((prev) =>
        prev.map((l) => (l.id === activeListId ? { ...l, items: [...l.items, newItem] } : l)),
      )
      setSearchQuery('')
    },
    [activeListId],
  )

  const removeItem = useCallback(
    (itemId: string) => {
      if (!activeListId) return
      setLists((prev) =>
        prev.map((l) => (l.id === activeListId ? { ...l, items: l.items.filter((i) => i.id !== itemId) } : l)),
      )
    },
    [activeListId],
  )

  const toggleChecked = useCallback(
    (itemId: string) => {
      if (!activeListId) return
      setLists((prev) =>
        prev.map((l) =>
          l.id === activeListId
            ? { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i)) }
            : l,
        ),
      )
    },
    [activeListId],
  )

  const updateItemQuantity = useCallback(
    (itemId: string, qty: number) => {
      if (!activeListId || qty < 1) return
      setLists((prev) =>
        prev.map((l) =>
          l.id === activeListId
            ? { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, quantity: qty } : i)) }
            : l,
        ),
      )
    },
    [activeListId],
  )

  const updateItemUnit = useCallback(
    (itemId: string, unit: Unit) => {
      if (!activeListId) return
      setLists((prev) =>
        prev.map((l) =>
          l.id === activeListId
            ? { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, unit } : i)) }
            : l,
        ),
      )
    },
    [activeListId],
  )

  const updateItemPriority = useCallback(
    (itemId: string, priority: Priority) => {
      if (!activeListId) return
      setLists((prev) =>
        prev.map((l) =>
          l.id === activeListId
            ? { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, priority } : i)) }
            : l,
        ),
      )
    },
    [activeListId],
  )

  const saveActualPrice = useCallback(
    (itemId: string) => {
      const val = parseFloat(editingActualPrice)
      if (isNaN(val) || val < 0 || !activeListId) {
        setEditingItemId(null)
        setEditingActualPrice('')
        return
      }
      setLists((prev) =>
        prev.map((l) =>
          l.id === activeListId
            ? { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, actualPrice: val } : i)) }
            : l,
        ),
      )
      setEditingItemId(null)
      setEditingActualPrice('')
    },
    [activeListId, editingActualPrice],
  )

  const findCheapest = useCallback(
    (itemId: string) => {
      if (!activeListId) return
      setLists((prev) =>
        prev.map((l) =>
          l.id === activeListId
            ? {
                ...l,
                items: l.items.map((i) =>
                  i.id === itemId ? { ...i, cheapestStore: generateCheapestStore(i.name, i.estimatedPrice) } : i,
                ),
              }
            : l,
        ),
      )
    },
    [activeListId],
  )

  // ─── Drag-to-reorder (simulated) ──────────────────────────────

  const moveItem = useCallback(
    (fromIdx: number, toIdx: number) => {
      if (!activeListId || fromIdx === toIdx) return
      setLists((prev) =>
        prev.map((l) => {
          if (l.id !== activeListId) return l
          const newItems = [...l.items]
          const [moved] = newItems.splice(fromIdx, 1)
          newItems.splice(toIdx, 0, moved)
          return { ...l, items: newItems }
        }),
      )
      setDragOverIdx(null)
    },
    [activeListId],
  )

  // ─── Budget handler ───────────────────────────────────────────

  const updateBudget = useCallback(
    (val: number) => {
      if (!activeListId || val < 0) return
      setLists((prev) => prev.map((l) => (l.id === activeListId ? { ...l, budget: val } : l)))
    },
    [activeListId],
  )

  // ─── Share handler ─────────────────────────────────────────────

  const handleShare = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`https://domplace.com/lista/${activeListId}`).catch(() => {})
    }
    setShareToast(true)
    setTimeout(() => setShareToast(false), 2500)
  }, [activeListId])

  // ─── Category expand/collapse toggle ──────────────────────────

  const toggleCategory = useCallback((catId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(catId)) next.delete(catId)
      else next.add(catId)
      return next
    })
  }, [])

  // ─── Rename list start ────────────────────────────────────────

  const startRename = useCallback((list: ShoppingList) => {
    setEditingListId(list.id)
    setEditingName(list.name)
  }, [])

  // ─── Hydration guard render ───────────────────────────────────

  if (!mounted) {
    return (
      <div className="r53-listmgr-root">
        <div className="rounded-2xl p-6 glassmorphism-strong animate-pulse">
          <div className="h-6 w-52 bg-muted rounded mb-4" />
          <div className="h-40 bg-muted rounded mb-4" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  // ─── Render: No lists yet ─────────────────────────────────────

  if (lists.length === 0) {
    return (
      <div className="r53-listmgr-root">
        <div className="rounded-2xl overflow-hidden glassmorphism-strong relative">
          <div className="absolute inset-0 gradient-mesh opacity-10 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center justify-center py-16 px-6">
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="r53-listmgr-empty-icon"
            >
              <PackageOpen className="h-16 w-16 text-muted-foreground/40" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mt-4"
            >
              <p className="text-sm font-semibold text-muted-foreground">Nenhuma lista criada</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Crie uma nova lista ou use um template</p>
            </motion.div>

            {/* Create blank list button */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-6 w-full max-w-xs">
              <Button
                onClick={() => createList()}
                className="w-full h-10 text-xs font-bold rounded-xl gap-2 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 text-white"
              >
                <Plus className="h-4 w-4" />
                Criar Nova Lista
              </Button>
            </motion.div>

            {/* Templates section */}
            <div className="w-full mt-6">
              <p className="text-[11px] font-semibold text-muted-foreground mb-3 text-center">Ou comece com um template:</p>
              <div className="grid grid-cols-2 gap-2">
                {LIST_TEMPLATES.map((tpl) => (
                  <motion.div
                    key={tpl.id}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => createList(tpl)}
                    className="r53-listmgr-template-card rounded-xl border border-border/50 bg-background/40 p-3 cursor-pointer hover:border-primary/40 transition-colors text-center"
                  >
                    <span className="text-2xl block mb-1">{tpl.emoji}</span>
                    <span className="text-[11px] font-semibold block">{tpl.name}</span>
                    <span className="text-[9px] text-muted-foreground">{tpl.items.length} itens</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Render: Main view ────────────────────────────────────────

  return (
    <div className="r53-listmgr-root">
      <div className="rounded-2xl overflow-hidden glassmorphism-strong relative r62-card-lift">
        {/* Background mesh */}
        <div className="absolute inset-0 gradient-mesh opacity-10 pointer-events-none" />

        <div className="relative z-10">
          {/* ─── Header ─── */}
          <div className="flex items-center justify-between p-4 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shadow-md">
                <ShoppingCart className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold r53-listmgr-title r62-heading-gradient">Listas Inteligentes</h3>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Gerencie suas compras
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[9px] font-bold">
                {lists.length} {lists.length === 1 ? 'lista' : 'listas'}
              </Badge>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="h-7 w-7 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                  aria-label="Ver templates"
                >
                  <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                </button>
              </motion.div>
            </div>
          </div>

          {/* ─── Templates panel ─── */}
          <AnimatePresence>
            {showTemplates && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-3">
                  <div className="bg-background/40 rounded-xl p-3 border border-border/30">
                    <p className="text-[11px] font-bold mb-2.5 flex items-center gap-1.5">
                      <Tag className="h-3 w-3" />
                      Templates Rápidos
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {LIST_TEMPLATES.map((tpl) => (
                        <motion.div
                          key={tpl.id}
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => createList(tpl)}
                          className="r53-listmgr-template-card rounded-lg border border-border/50 bg-background/60 p-2.5 cursor-pointer hover:border-primary/40 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <TemplateIcon templateId={tpl.id} />
                            <span className="text-[11px] font-semibold flex-1 truncate">{tpl.name}</span>
                          </div>
                          <span className="text-[9px] text-muted-foreground">{tpl.description}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── List tabs ─── */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1">
              {lists.map((list) => (
                <motion.div key={list.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="shrink-0">
                  <button
                    onClick={() => setActiveListId(list.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                      list.id === activeListId
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-background/40 text-muted-foreground border-border/50 hover:border-primary/30'
                    }`}
                  >
                    <span className="truncate max-w-[100px]">
                      {editingListId === list.id ? (
                        <input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') renameList(list.id, editingName)
                            if (e.key === 'Escape') setEditingListId(null)
                          }}
                          onBlur={() => renameList(list.id, editingName)}
                          className="bg-transparent outline-none w-20 text-primary-foreground"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        list.name
                      )}
                    </span>
                    <span className="text-[9px] opacity-70">({list.items.filter((i) => !i.checked).length})</span>
                  </button>
                </motion.div>
              ))}

              {/* Create new list tab */}
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="shrink-0">
                <button
                  onClick={() => createList()}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-dashed border-primary/40 hover:border-primary/60 hover:bg-primary/5 text-primary transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Nova
                </button>
              </motion.div>
            </div>
          </div>

          {/* ─── List actions bar ─── */}
          {activeList && (
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => startRename(activeList)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-background/40 border border-border/50 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil className="h-2.5 w-2.5" />
                    Renomear
                  </button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => duplicateList(activeList.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-background/40 border border-border/50 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Copy className="h-2.5 w-2.5" />
                    Duplicar
                  </button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-background/40 border border-border/50 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Share2 className="h-2.5 w-2.5" />
                    Compartilhar
                  </button>
                </motion.div>
                {lists.length > 1 && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <button
                      onClick={() => deleteList(activeList.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-red-500/5 border border-red-500/20 hover:border-red-500/40 text-red-500 transition-colors"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                      Excluir
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Share toast */}
              <AnimatePresence>
                {shareToast && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-1.5 mt-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5"
                  >
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Link copiado para a área de transferência!
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ─── Budget tracker ─── */}
          {activeList && (
            <div className="px-4 pb-3">
              <div className="bg-background/40 rounded-xl p-3 border border-border/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[11px] font-semibold">Orçamento</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">R$</span>
                    <input
                      type="number"
                      value={activeList.budget}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value)
                        if (!isNaN(v)) updateBudget(v)
                      }}
                      className="w-20 bg-transparent text-[11px] font-bold text-right outline-none tabular-nums"
                      min={0}
                      step={10}
                    />
                  </div>
                </div>

                {/* Animated progress bar */}
                <div className="relative">
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        overBudget
                          ? 'bg-gradient-to-r from-red-500 to-red-400'
                          : budgetPercent > 80
                            ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                            : 'bg-gradient-to-r from-primary to-emerald-400'
                      } r53-listmgr-progress-glow`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(budgetPercent, 100)}%` }}
                      transition={{ type: 'spring' as const, stiffness: 180, damping: 22 }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Estimado: <span className="font-bold text-foreground">{formatBRL(estimatedTotal)}</span>
                  </span>
                  <span
                    className={`text-[10px] font-bold tabular-nums ${
                      overBudget
                        ? 'text-red-500'
                        : budgetPercent > 80
                          ? 'text-amber-500'
                          : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {Math.round(budgetPercent)}%
                    {overBudget && ' ⚠️ Ultrapassou!'}
                  </span>
                </div>

                {overBudget && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1.5"
                  >
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-[10px] font-bold text-red-500">
                      Seu orçamento foi ultrapassado em {formatBRL(estimatedTotal - activeList.budget)}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* ─── Quick add search ─── */}
          {activeList && (
            <div className="px-4 pb-3 relative">
              <div className="flex items-center gap-2 bg-background/60 border border-border/50 rounded-lg px-3 py-2">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar ou adicionar item..."
                  className="flex-1 bg-transparent text-[11px] outline-none placeholder:text-muted-foreground/50 min-w-0"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="shrink-0">
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>

              {/* Autocomplete dropdown */}
              <AnimatePresence>
                {autocompleteSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute left-4 right-4 top-full mt-1 z-50 bg-popover border border-border rounded-xl shadow-lg overflow-hidden"
                  >
                    {autocompleteSuggestions.map((sug, idx) => (
                      <motion.button
                        key={sug.name}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03, type: 'spring' as const, stiffness: 400, damping: 28 }}
                        onClick={() => addItemToList(sug)}
                        className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-muted/40 transition-colors text-left border-b border-border/20 last:border-b-0"
                      >
                        <span className="text-base">{getAisleMeta(sug.category).emoji}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] font-medium truncate block">{sug.name}</span>
                          <span className="text-[9px] text-muted-foreground">
                            {formatBRL(sug.estimatedPrice)} · {sug.unit}
                          </span>
                        </div>
                        <Plus className="h-3 w-3 text-primary shrink-0" />
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ─── Suggested items ─── */}
          {activeList && suggestions.length > 0 && (
            <div className="px-4 pb-3">
              <div className="bg-violet-500/5 border border-violet-500/15 rounded-xl p-3">
                <p className="text-[11px] font-bold mb-2 flex items-center gap-1.5 text-violet-600 dark:text-violet-400">
                  <Sparkles className="h-3 w-3" />
                  Você também pode precisar de...
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((sug) => (
                    <motion.button
                      key={sug.name}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addItemToList(sug)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-violet-500/10 border border-violet-500/20 hover:border-violet-500/40 text-violet-600 dark:text-violet-400 transition-colors"
                    >
                      <Plus className="h-2.5 w-2.5" />
                      {sug.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── Item list by category ─── */}
          {activeList && uncheckedItems.length > 0 && (
            <div className="px-4 pb-3 space-y-2.5 max-h-[420px] overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {Array.from(groupedItems.entries()).map(([catId, items]) => {
                  const aisle = getAisleMeta(catId)
                  const isExpanded = expandedCategories.has(catId)

                  return (
                    <motion.div
                      key={catId}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ type: 'spring' as const, stiffness: 280, damping: 26 }}
                      className={`rounded-xl border-l-4 ${aisle.borderColor} ${aisle.bgColor} r53-listmgr-category-card`}
                    >
                      {/* Category header */}
                      <button
                        onClick={() => toggleCategory(catId)}
                        className="flex items-center gap-2 w-full p-2.5 text-left"
                      >
                        <span className="text-lg">{aisle.emoji}</span>
                        <span className={`text-[11px] font-bold flex-1 ${aisle.textColor}`}>{aisle.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${aisle.bgColor} ${aisle.textColor}`}>
                          {items.length}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-muted-foreground" />
                        )}
                      </button>

                      {/* Category items */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-2.5 pb-2.5 space-y-1.5">
                              {items.map((item, idx) => {
                                const pCfg = PRIORITY_CONFIG[item.priority]
                                const PriorityIcon = pCfg.icon

                                return (
                                  <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20, scale: 0.9 }}
                                    transition={{
                                      delay: idx * 0.04,
                                      type: 'spring' as const,
                                      stiffness: 350,
                                      damping: 25,
                                    }}
                                    className={`r53-listmgr-item-row flex items-center gap-2 bg-background/40 rounded-lg p-2 border border-border/20 hover:border-primary/20 transition-colors ${
                                      dragOverIdx === idx ? 'r53-listmgr-drag-over border-primary/50' : ''
                                    }`}
                                    draggable
                                    onDragStart={(e) => {
                                      const dt = (e as unknown as React.DragEvent).dataTransfer
                                      dt.setData('text/plain', String(idx))
                                      dt.effectAllowed = 'move'
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault()
                                      setDragOverIdx(idx)
                                    }}
                                    onDragLeave={() => setDragOverIdx(null)}
                                    onDrop={(e) => {
                                      e.preventDefault()
                                      const dt = (e as unknown as React.DragEvent).dataTransfer
                                      const fromIdx = parseInt(dt.getData('text/plain'), 10)
                                      if (!isNaN(fromIdx)) moveItem(fromIdx, idx)
                                    }}
                                    onDragEnd={() => setDragOverIdx(null)}
                                  >
                                    {/* Drag handle */}
                                    <div className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground/70 shrink-0">
                                      <GripVertical className="h-3 w-3" />
                                    </div>

                                    {/* Check toggle */}
                                    <motion.button
                                      whileHover={{ scale: 1.15 }}
                                      whileTap={{ scale: 0.85 }}
                                      onClick={() => toggleChecked(item.id)}
                                      className={`h-4.5 w-4.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                                        item.checked
                                          ? 'bg-primary border-primary'
                                          : 'border-muted-foreground/30 hover:border-primary/50'
                                      }`}
                                    >
                                      <AnimatePresence>
                                        {item.checked && (
                                          <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            transition={{ type: 'spring' as const, stiffness: 500, damping: 20 }}
                                          >
                                            <Check className="h-2.5 w-2.5 text-primary-foreground" />
                                          </motion.span>
                                        )}
                                      </AnimatePresence>
                                    </motion.button>

                                    {/* Item info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] font-medium truncate">{item.name}</span>
                                        {/* Priority badge */}
                                        <span
                                          className={`inline-flex items-center gap-0.5 text-[8px] px-1 py-px rounded-full border font-bold shrink-0 ${pCfg.color}`}
                                        >
                                          <PriorityIcon className="h-2 w-2" />
                                          {pCfg.label}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        {/* Quantity controls */}
                                        <div className="flex items-center gap-1">
                                          <motion.button
                                            whileHover={{ scale: 1.15 }}
                                            whileTap={{ scale: 0.85 }}
                                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                            className="h-4 w-4 rounded bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors"
                                          >
                                            <ArrowDown className="h-2 w-2" />
                                          </motion.button>
                                          <span className="text-[10px] font-bold tabular-nums w-5 text-center">{item.quantity}</span>
                                          <motion.button
                                            whileHover={{ scale: 1.15 }}
                                            whileTap={{ scale: 0.85 }}
                                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                            className="h-4 w-4 rounded bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors"
                                          >
                                            <ArrowUp className="h-2 w-2" />
                                          </motion.button>
                                        </div>

                                        {/* Unit selector */}
                                        <select
                                          value={item.unit}
                                          onChange={(e) => updateItemUnit(item.id, e.target.value as Unit)}
                                          className="text-[9px] bg-background/60 border border-border/30 rounded px-1 py-px outline-none cursor-pointer text-muted-foreground min-h-[44px]"
                                        >
                                          {UNITS.map((u) => (
                                            <option key={u} value={u}>
                                              {u}
                                            </option>
                                          ))}
                                        </select>

                                        {/* Priority selector */}
                                        <select
                                          value={item.priority}
                                          onChange={(e) => updateItemPriority(item.id, e.target.value as Priority)}
                                          className="text-[9px] bg-background/60 border border-border/30 rounded px-1 py-px outline-none cursor-pointer text-muted-foreground min-h-[44px]"
                                        >
                                          <option value="high">🔴 Alta</option>
                                          <option value="medium">🟡 Média</option>
                                          <option value="low">🟢 Baixa</option>
                                        </select>
                                      </div>
                                    </div>

                                    {/* Price info */}
                                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                                      <span className="text-[10px] font-bold tabular-nums text-foreground">
                                        {formatBRL(item.estimatedPrice * item.quantity)}
                                      </span>
                                      {editingItemId === item.id ? (
                                        <div className="flex items-center gap-1">
                                          <input
                                            value={editingActualPrice}
                                            onChange={(e) => setEditingActualPrice(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && saveActualPrice(item.id)}
                                            className="w-14 bg-transparent text-[9px] outline-none border-b border-primary/50 text-center tabular-nums"
                                            placeholder="Real"
                                            autoFocus
                                          />
                                          <button onClick={() => saveActualPrice(item.id)}>
                                            <Check className="h-2.5 w-2.5 text-primary" />
                                          </button>
                                        </div>
                                      ) : item.actualPrice !== null ? (
                                        <span className="text-[9px] tabular-nums text-emerald-600 dark:text-emerald-400">
                                          → {formatBRL(item.actualPrice * item.quantity)}
                                        </span>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setEditingItemId(item.id)
                                            setEditingActualPrice('')
                                          }}
                                          className="text-[8px] text-muted-foreground hover:text-primary transition-colors"
                                        >
                                          preço real?
                                        </button>
                                      )}
                                    </div>

                                    {/* Find cheapest */}
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="shrink-0">
                                      <button
                                        onClick={() => findCheapest(item.id)}
                                        className="h-6 w-6 min-h-[44px] min-w-[44px] rounded-md bg-amber-500/10 hover:bg-amber-500/20 flex items-center justify-center transition-colors"
                                        title="Encontrar mais barato"
                                      >
                                        <TrendingDown className="h-3 w-3 text-amber-500" />
                                      </button>
                                    </motion.div>

                                    {/* Cheapest store tooltip */}
                                    {item.cheapestStore && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ type: 'spring' as const, stiffness: 400, damping: 22 }}
                                        className="shrink-0 max-w-[120px]"
                                      >
                                        <div className="text-[8px] text-amber-600 dark:text-amber-400 leading-tight">
                                          <span className="font-bold block truncate">{item.cheapestStore.storeName}</span>
                                          <span className="tabular-nums">{formatBRL(item.cheapestStore.price)}</span>
                                          {' · '}
                                          <span>{item.cheapestStore.distance}</span>
                                        </div>
                                      </motion.div>
                                    )}

                                    {/* Delete button */}
                                    <motion.button
                                      whileHover={{ scale: 1.15 }}
                                      whileTap={{ scale: 0.85 }}
                                      onClick={() => removeItem(item.id)}
                                      className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                                    >
                                      <X className="h-3 w-3" />
                                    </motion.button>
                                  </motion.div>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}

          {/* ─── Checked-off items ─── */}
          {activeList && checkedItems.length > 0 && (
            <div className="px-4 pb-3">
              <div className="bg-muted/20 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Itens marcados ({checkedItems.length})
                </p>
                <div className="space-y-1 max-h-[150px] overflow-y-auto custom-scrollbar">
                  <AnimatePresence>
                    {checkedItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/30 transition-colors group"
                      >
                        {/* Checked checkbox */}
                        <button
                          onClick={() => toggleChecked(item.id)}
                          className="h-4.5 w-4.5 rounded-md bg-primary/20 border-2 border-primary flex items-center justify-center shrink-0"
                        >
                          <Check className="h-2.5 w-2.5 text-primary" />
                        </button>
                        {/* Strikethrough name */}
                        <span className="text-[11px] text-muted-foreground line-through truncate flex-1">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-bold tabular-nums text-muted-foreground/60">
                          {formatBRL(item.estimatedPrice * item.quantity)}
                        </span>
                        {/* Uncheck button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleChecked(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-0.5 shrink-0"
                        >
                          <X className="h-3 w-3" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Savings comparison */}
                {checkedItems.some((i) => i.actualPrice !== null) && (
                  <div className="mt-2 pt-2 border-t border-border/20">
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5">
                      <TrendingDown className="h-3 w-3 text-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        Economia real:{' '}
                        {formatBRL(
                          checkedItems
                            .filter((i) => i.actualPrice !== null)
                            .reduce(
                              (sum, i) =>
                                sum + i.estimatedPrice * i.quantity - (i.actualPrice ?? 0) * i.quantity,
                              0,
                            ),
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── Empty list state ─── */}
          {activeList && activeList.items.length === 0 && (
            <div className="px-4 pb-4 text-center py-8">
              <PackageOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-[11px] font-medium text-muted-foreground">Lista vazia</p>
              <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                Use a busca acima para adicionar itens
              </p>
            </div>
          )}

          {/* ─── Footer ─── */}
          <div className="px-4 py-2.5 border-t border-border/30 flex items-center justify-center gap-1.5 text-[9px] text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            <span>Listas inteligentes DomPlace — organização perfeita</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SmartListManager
