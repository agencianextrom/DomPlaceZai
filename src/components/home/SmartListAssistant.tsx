'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ListChecks, Plus, Trash2, Share2, Download, Sparkles, CheckCircle2, Circle, ChefHat, TrendingUp, Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────

type Category = 'frutas' | 'laticinios' | 'carnes' | 'padaria' | 'bebidas' | 'limpeza' | 'higiene' | 'outros'

interface ShoppingItem {
  id: string; name: string; quantity: number; price: number; category: Category; purchased: boolean
}

interface ShoppingList {
  id: string; name: string; budget: number; items: ShoppingItem[]
}

interface AISuggestion {
  id: string; name: string; price: number; reason: string
}

// ─── Constants ────────────────────────────────────────────────────

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'frutas', label: 'Frutas' }, { value: 'laticinios', label: 'Laticínios' },
  { value: 'carnes', label: 'Carnes' }, { value: 'padaria', label: 'Padaria' },
  { value: 'bebidas', label: 'Bebidas' }, { value: 'limpeza', label: 'Limpeza' },
  { value: 'higiene', label: 'Higiene' }, { value: 'outros', label: 'Outros' },
]

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  frutas: ['banana', 'maçã', 'laranja', 'uva', 'manga', 'morango', 'abacaxi', 'mamão', 'melancia', 'pera'],
  laticinios: ['leite', 'queijo', 'manteiga', 'iogurte', 'requeijão', 'creme de leite', 'nata', 'muçarela'],
  carnes: ['frango', 'carne', 'peixe', 'picanha', 'linguiça', 'bacon', 'salsicha', 'peru'],
  padaria: ['pão', 'bolacha', 'biscoito', 'bolo', 'farinha', 'tapioca', 'torrada', 'croissant'],
  bebidas: ['café', 'suco', 'refrigerante', 'cerveja', 'água', 'vinho', 'chá', 'guaraná'],
  limpeza: ['detergente', 'sabão', 'desinfetante', 'amaciante', 'cloro', 'esponja', 'papel higiênico'],
  higiene: ['shampoo', 'sabonete', 'desodorante', 'pasta de dente', 'creme', 'condicionador'],
  outros: [],
}

const AI_SUGGESTIONS_POOL: AISuggestion[] = [
  { id: 'as1', name: 'Café 500g', price: 18.90, reason: 'Combina com leite e pão da sua lista' },
  { id: 'as2', name: 'Manteiga 200g', price: 9.90, reason: 'Essencial para acompanhar o pão' },
  { id: 'as3', name: 'Tomate 1kg', price: 8.49, reason: 'Falta verduras na sua lista semanal' },
  { id: 'as4', name: 'Cebola 1kg', price: 6.99, reason: 'Ingrediente base para a maioria das receitas' },
  { id: 'as5', name: 'Óleo de Soja 900ml', price: 7.90, reason: 'Item básico faltando na sua cozinha' },
  { id: 'as6', name: 'Açúcar 1kg', price: 5.49, reason: 'Complemento para o café da manhã' },
  { id: 'as7', name: 'Refrigerante 2L', price: 9.90, reason: 'Perfeito para o churrasco de domingo' },
  { id: 'as8', name: 'Carvão 3kg', price: 22.00, reason: 'Essencial para o churrasco' },
  { id: 'as9', name: 'Farofa Pronta', price: 6.50, reason: 'Acompanhamento clássico do churrasco' },
  { id: 'as10', name: 'Batata Frita Congelada', price: 14.90, reason: 'Sugestão popular para churrasco' },
  { id: 'as11', name: 'Maçã 1kg', price: 12.90, reason: 'Lanche saudável para a semana' },
  { id: 'as12', name: 'Iogurte Natural 170g', price: 3.49, reason: 'Ótimo para café da manhã' },
]

const initialLists: ShoppingList[] = [
  {
    id: '1', name: 'Compras da Semana', budget: 250,
    items: [
      { id: 'i1', name: 'Arroz 5kg', quantity: 1, price: 25.9, category: 'outros', purchased: true },
      { id: 'i2', name: 'Feijão Preto 1kg', quantity: 2, price: 9.9, category: 'outros', purchased: false },
      { id: 'i3', name: 'Leite Integral 1L', quantity: 3, price: 5.49, category: 'laticinios', purchased: false },
      { id: 'i4', name: 'Banana Prata', quantity: 1, price: 4.99, category: 'frutas', purchased: true },
      { id: 'i5', name: 'Peito de Frango 1kg', quantity: 1, price: 32.9, category: 'carnes', purchased: false },
      { id: 'i6', name: 'Pão Francês (6)', quantity: 2, price: 6.0, category: 'padaria', purchased: false },
    ],
  },
  {
    id: '2', name: 'Churrasco de Domingo', budget: 180,
    items: [
      { id: 'i7', name: 'Picanha 1.2kg', quantity: 1, price: 89.9, category: 'carnes', purchased: false },
      { id: 'i8', name: 'Linguiça Toscana 500g', quantity: 2, price: 15.9, category: 'carnes', purchased: false },
      { id: 'i9', name: 'Carvão 3kg', quantity: 1, price: 22.0, category: 'outros', purchased: false },
      { id: 'i10', name: 'Farofa Pronta', quantity: 1, price: 6.5, category: 'outros', purchased: false },
    ],
  },
]

// ─── Helpers ───────────────────────────────────────────────────────

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const uid = () => `sla-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

function autoCategorize(name: string): Category {
  const lower = name.toLowerCase()
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return cat as Category
  }
  return 'outros'
}

const getCategoryLabel = (cat: Category) => CATEGORIES.find((c) => c.value === cat)?.label ?? 'Outros'

// ─── Main Component ───────────────────────────────────────────────

export function SmartListAssistant() {
  const [loading, setLoading] = useState(true)
  const [lists, setLists] = useState<ShoppingList[]>([])
  const [activeListId, setActiveListId] = useState('')
  const [newListName, setNewListName] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showNewListInput, setShowNewListInput] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQty, setItemQty] = useState(1)
  const [itemPrice, setItemPrice] = useState('')
  const [itemCategory, setItemCategory] = useState<Category>('outros')
  const [budgetInput, setBudgetInput] = useState('')
  const [showBudgetEdit, setShowBudgetEdit] = useState(false)

  // Simulated loading
  useEffect(() => {
    const t = setTimeout(() => {
      setLists(initialLists)
      setActiveListId('1')
      setLoading(false)
    }, 1200)
    return () => clearTimeout(t)
  }, [])

  // Derived state
  const activeList = useMemo(() => lists.find((l) => l.id === activeListId) ?? null, [lists, activeListId])
  const totalCount = useMemo(() => activeList?.items.length ?? 0, [activeList])
  const purchasedCount = useMemo(() => activeList?.items.filter((i) => i.purchased).length ?? 0, [activeList])
  const estimatedTotal = useMemo(() => activeList?.items.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0, [activeList])
  const budgetLimit = activeList?.budget ?? 0
  const budgetPercent = budgetLimit > 0 ? (estimatedTotal / budgetLimit) * 100 : 0
  const isOverBudget = budgetPercent > 100

  // Rotating AI suggestions
  const suggestions = useMemo(() => {
    if (!activeList) return []
    const hasCarnes = activeList.items.some((i) => i.category === 'carnes')
    const hasPadaria = activeList.items.some((i) => i.category === 'padaria')
    const hasLaticinios = activeList.items.some((i) => i.category === 'laticinios')
    return AI_SUGGESTIONS_POOL.filter((s) => {
      if (hasCarnes && ['as7', 'as8', 'as9', 'as10'].includes(s.id)) return true
      if (hasPadaria && ['as2', 'as5', 'as6'].includes(s.id)) return true
      if (hasLaticinios && ['as1', 'as12'].includes(s.id)) return true
      return ['as3', 'as4', 'as11'].includes(s.id)
    }).slice(0, 5)
  }, [activeList])

  // List handlers
  const createList = useCallback(() => {
    if (!newListName.trim()) return
    const newList: ShoppingList = { id: uid(), name: newListName.trim(), budget: 150, items: [] }
    setLists((p) => [...p, newList])
    setActiveListId(newList.id)
    setNewListName('')
    setShowNewListInput(false)
  }, [newListName])

  const deleteList = useCallback((id: string) => {
    setLists((p) => {
      const next = p.filter((l) => l.id !== id)
      if (activeListId === id) setActiveListId(next[0]?.id ?? '')
      return next
    })
    setDeleteConfirm(null)
  }, [activeListId])

  const updateBudget = useCallback(() => {
    const val = parseFloat(budgetInput)
    if (!activeListId || isNaN(val) || val < 0) return
    setLists((p) => p.map((l) => (l.id === activeListId ? { ...l, budget: val } : l)))
    setShowBudgetEdit(false)
    setBudgetInput('')
  }, [activeListId, budgetInput])

  // Item handlers
  const addItem = useCallback(() => {
    if (!activeListId || !itemName.trim()) return
    const newItem: ShoppingItem = {
      id: uid(), name: itemName.trim(), quantity: itemQty,
      price: parseFloat(itemPrice) || 0, category: autoCategorize(itemName), purchased: false,
    }
    setLists((p) => p.map((l) => (l.id === activeListId ? { ...l, items: [...l.items, newItem] } : l)))
    setItemName(''); setItemQty(1); setItemPrice(''); setItemCategory('outros')
  }, [activeListId, itemName, itemQty, itemPrice])

  const togglePurchased = useCallback((itemId: string) => {
    if (!activeListId) return
    setLists((p) => p.map((l) =>
      l.id === activeListId
        ? { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, purchased: !i.purchased } : i)) }
        : l,
    ))
  }, [activeListId])

  const removeItem = useCallback((itemId: string) => {
    if (!activeListId) return
    setLists((p) => p.map((l) => (l.id === activeListId ? { ...l, items: l.items.filter((i) => i.id !== itemId) } : l)))
  }, [activeListId])

  const addSuggestion = useCallback((s: AISuggestion) => {
    if (!activeListId) return
    setLists((p) => p.map((l) => (l.id === activeListId ? {
      ...l, items: [...l.items, { id: uid(), name: s.name, quantity: 1, price: s.price, category: autoCategorize(s.name), purchased: false }],
    } : l)))
    toast.success(`${s.name} adicionado à lista!`)
  }, [activeListId])

  const handleShare = useCallback(() => toast.success('Link copiado!'), [])
  const handleExport = useCallback(() => toast.success('Lista exportada com sucesso!'), [])

  // ─── Loading skeleton ──────────────────────────────────────────

  if (loading) {
    return (
      <Card className="r62-card-lift">
        <CardHeader><div className="h-6 w-48 bg-muted animate-pulse rounded" /></CardHeader>
        <CardContent className="space-y-4">
          <div className="h-10 bg-muted animate-pulse rounded-lg" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
          <div className="h-20 bg-muted animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  // ─── Empty state ─────────────────────────────────────────────────

  if (lists.length === 0) {
    return (
      <Card className="r62-card-lift">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} className="r81-smart-list-empty-icon">
            <ListChecks className="h-16 w-16 text-muted-foreground/30" />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center mt-4">
            <p className="text-sm font-semibold text-muted-foreground">Nenhuma lista criada</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Crie sua primeira lista inteligente</p>
          </motion.div>
          <motion.div whileTap={{ scale: 0.95 }} className="mt-6 w-full max-w-xs">
            <Button
              onClick={() => setShowNewListInput(true)}
              className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white font-semibold text-sm"
            >
              <Plus className="h-4 w-4 mr-2" /> Criar Nova Lista
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  // ─── Main render ────────────────────────────────────────────────

  return (
    <Card className="r62-card-lift overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 flex items-center justify-center shadow-md">
              <ChefHat className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold r62-heading-gradient bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Listas Inteligentes
              </CardTitle>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Organize suas compras com IA
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-[10px] font-bold">
            {lists.length} {lists.length === 1 ? 'lista' : 'listas'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ─── List tabs ─── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <AnimatePresence mode="popLayout">
            {lists.map((list) => (
              <motion.button key={list.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setActiveListId(list.id); setDeleteConfirm(null) }}
                className={`shrink-0 flex items-center gap-1.5 px-3 min-h-[44px] rounded-lg text-xs font-semibold transition-all border ${
                  list.id === activeListId
                    ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white border-transparent shadow-sm'
                    : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-cyan-400/40'
                }`}>
                <span className="truncate max-w-[120px]">{list.name}</span>
                <span className="text-[9px] opacity-70">({list.items.length})</span>
              </motion.button>
            ))}
          </AnimatePresence>
          <motion.button layout whileTap={{ scale: 0.95 }} onClick={() => setShowNewListInput(true)}
            className="shrink-0 flex items-center gap-1 px-3 min-h-[44px] rounded-lg text-xs font-semibold border border-dashed border-cyan-400/40 hover:border-cyan-400/70 hover:bg-cyan-400/5 text-cyan-600 dark:text-cyan-400 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Nova Lista
          </motion.button>
        </div>

        {/* New list input */}
        <AnimatePresence>
          {showNewListInput && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="flex gap-2 p-3 rounded-xl bg-muted/40 border border-border/40 r81-smart-list-form">
                <Input placeholder="Nome da lista (ex: Festa, Churrasco…)" value={newListName}
                  onChange={(e) => setNewListName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && createList()}
                  className="min-h-[44px] text-sm" autoFocus />
                <Button onClick={createList} className="min-h-[44px] px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                  Criar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Stats bar ─── */}
        {activeList && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { icon: <ListChecks className="h-4 w-4 text-cyan-500" />, label: 'Total', value: `${totalCount} ${totalCount === 1 ? 'item' : 'itens'}` },
              { icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, label: 'Comprados', value: String(purchasedCount) },
              { icon: <Wallet className="h-4 w-4 text-blue-500" />, label: 'Estimado', value: formatBRL(estimatedTotal) },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/30">
                {stat.icon}
                <div>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-bold">{stat.value}</p>
                </div>
              </div>
            ))}
            <div className={`flex items-center gap-2 p-3 rounded-xl border ${isOverBudget ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
              <TrendingUp className={`h-4 w-4 ${isOverBudget ? 'text-red-500' : 'text-emerald-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground">Orçamento</p>
                {showBudgetEdit ? (
                  <div className="flex items-center gap-1">
                    <Input type="number" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && updateBudget()} className="h-6 w-20 text-xs p-0 px-1"
                      placeholder={String(budgetLimit)} autoFocus />
                    <Button size="sm" onClick={updateBudget} className="h-6 px-2 text-[10px]">OK</Button>
                  </div>
                ) : (
                  <button onClick={() => { setShowBudgetEdit(true); setBudgetInput(String(budgetLimit)) }} className="text-sm font-bold truncate">
                    {formatBRL(budgetLimit)}{' '}
                    <span className="text-[9px] font-normal text-muted-foreground">({Math.min(budgetPercent, 999).toFixed(0)}%)</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <Separator className="my-1" />

        {/* ─── Add item form ─── */}
        {activeList && (
          <div className="space-y-2 r81-smart-list-form">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Adicionar Item
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input placeholder="Nome do item…" value={itemName} onChange={(e) => setItemName(e.target.value)}
                className="min-h-[44px] text-sm flex-1" />
              <div className="flex gap-2">
                <Input type="number" placeholder="Qtd" min={1} value={itemQty}
                  onChange={(e) => setItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="min-h-[44px] w-16 text-sm text-center" />
                <Input type="number" placeholder="R$ preço" step="0.01" min={0} value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)} className="min-h-[44px] w-28 text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value as Category)}
                className="min-h-[44px] px-3 rounded-lg bg-background border border-border text-sm flex-1">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <Button onClick={addItem}
                className="min-h-[44px] px-5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold">
                Adicionar
              </Button>
            </div>
          </div>
        )}

        {/* ─── Items list ─── */}
        {activeList && activeList.items.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">Itens da Lista</p>
              {deleteConfirm && deleteConfirm === activeList.id && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                  <span className="text-[10px] text-red-500 font-medium">Excluir esta lista?</span>
                  <Button variant="destructive" size="sm" className="h-7 px-2 text-[10px]" onClick={() => deleteList(activeList.id)}>
                    Sim, excluir
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={() => setDeleteConfirm(null)}>
                    Cancelar
                  </Button>
                </motion.div>
              )}
            </div>
            <AnimatePresence mode="popLayout">
              {activeList.items.map((item) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="r81-smart-list-item flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-background/50 hover:bg-muted/30 transition-colors group">
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => togglePurchased(item.id)}
                    className="shrink-0 r81-smart-list-check min-h-[44px] min-w-[44px] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {item.purchased ? (
                        <motion.div key="checked" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </motion.div>
                      ) : (
                        <motion.div key="unchecked" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <Circle className="h-5 w-5 text-muted-foreground/40" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate transition-all ${item.purchased ? 'line-through text-muted-foreground' : ''}`}>
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{getCategoryLabel(item.category)}</Badge>
                      <span className="text-[10px] text-muted-foreground">Qtd: {item.quantity}</span>
                      {item.price > 0 && <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">{formatBRL(item.price * item.quantity)}</span>}
                    </div>
                  </div>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => removeItem(item.id)}
                    className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <Separator className="my-1" />

        {/* ─── AI Suggestions ─── */}
        {activeList && suggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold">Sugestões da IA</p>
                <p className="text-[10px] text-muted-foreground">Baseado nos seus itens</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <AnimatePresence>
                {suggestions.map((s, idx) => (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: idx * 0.08, type: 'spring', stiffness: 400, damping: 25 }}
                    className="r81-smart-list-suggestion flex items-center justify-between gap-2 p-3 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{s.reason}</p>
                      <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 mt-0.5">{formatBRL(s.price)}</p>
                    </div>
                    <Button size="sm" onClick={() => addSuggestion(s)}
                      className="shrink-0 min-h-[44px] min-w-[44px] px-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[11px] font-semibold">
                      Adicionar
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ─── Delete list button ─── */}
        {activeList && !deleteConfirm && (
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setDeleteConfirm(activeList.id)}
            className="flex items-center gap-1.5 px-3 min-h-[44px] rounded-lg text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors">
            <Trash2 className="h-3.5 w-3.5" /> Excluir Lista
          </motion.button>
        )}

        <Separator className="my-1" />

        {/* ─── Share & Export ─── */}
        <div className="flex items-center gap-2">
          <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
            <Button variant="outline" onClick={handleShare}
              className="w-full min-h-[44px] rounded-xl gap-2 text-sm font-semibold border-cyan-400/40 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-400/10">
              <Share2 className="h-4 w-4" /> Compartilhar
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
            <Button variant="outline" onClick={handleExport}
              className="w-full min-h-[44px] rounded-xl gap-2 text-sm font-semibold border-blue-400/40 text-blue-600 dark:text-blue-400 hover:bg-blue-400/10">
              <Download className="h-4 w-4" /> Exportar PDF
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SmartListAssistant
