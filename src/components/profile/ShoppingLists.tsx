'use client'

import { useState } from 'react'
import { ListChecks, Flame, Plus, Share2, Clock, ShoppingCart, ChevronDown, ChevronUp, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'

// --- Types ---
interface ShoppingItem {
  id: string
  name: string
  quantity: number
  price: number
  checked: boolean
}

interface ShoppingList {
  id: string
  name: string
  icon: typeof ListChecks
  items: ShoppingItem[]
  lastModified: string
  color: string
  iconBg: string
}

// --- Mock Data ---
const initialLists: ShoppingList[] = [
  {
    id: 'l1',
    name: 'Compras da Semana',
    icon: ListChecks,
    items: [
      { id: 'i1', name: 'Arroz Tio João 5kg', quantity: 1, price: 24.90, checked: false },
      { id: 'i2', name: 'Feijão Carioca 1kg', quantity: 2, price: 8.90, checked: false },
      { id: 'i3', name: 'Açaí 500ml', quantity: 3, price: 15.00, checked: true },
      { id: 'i4', name: 'Leite Integral 1L', quantity: 4, price: 6.90, checked: false },
    ],
    lastModified: 'Hoje, 14:30',
    color: 'text-primary',
    iconBg: 'bg-primary/10',
  },
  {
    id: 'l2',
    name: 'Churrasco de Sábado',
    icon: Flame,
    items: [
      { id: 'i5', name: 'Carne bovina 2kg', quantity: 1, price: 59.90, checked: false },
      { id: 'i6', name: 'Linguiça 500g', quantity: 2, price: 12.50, checked: false },
      { id: 'i7', name: 'Refrigerante 2L', quantity: 3, price: 8.00, checked: true },
    ],
    lastModified: 'Ontem, 19:15',
    color: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-100 dark:bg-orange-900/20',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function ShoppingLists() {
  const [lists, setLists] = useState<ShoppingList[]>(initialLists)
  const [expandedList, setExpandedList] = useState<string | null>(null)
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({})

  const toggleItem = (listId: string, itemId: string) => {
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              ),
            }
          : list
      )
    )
  }

  const addItem = (listId: string) => {
    const text = newItemTexts[listId]?.trim()
    if (!text) return

    setLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: [
                ...list.items,
                {
                  id: `i-new-${Date.now()}`,
                  name: text,
                  quantity: 1,
                  price: 0,
                  checked: false,
                },
              ],
            }
          : list
      )
    )
    setNewItemTexts((prev) => ({ ...prev, [listId]: '' }))
  }

  const removeItem = (listId: string, itemId: string) => {
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? { ...list, items: list.items.filter((item) => item.id !== itemId) }
          : list
      )
    )
  }

  const getTotal = (items: ShoppingItem[]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const getCheckedCount = (items: ShoppingItem[]) => {
    return items.filter((i) => i.checked).length
  }

  const getListIcon = (list: ShoppingList) => {
    const ListIcon = list.icon
    return <ListIcon className={`h-5 w-5 ${list.color}`} />
  }

  return (
    <div className="space-y-4">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" />
          Minhas Listas
        </h2>
        <Button
          size="sm"
          className="bg-primary text-primary-foreground gap-1 h-8 text-xs"
          onClick={() => {
            const newList: ShoppingList = {
              id: `l-new-${Date.now()}`,
              name: `Nova Lista ${lists.length + 1}`,
              icon: ListChecks,
              items: [],
              lastModified: 'Agora',
              color: 'text-primary',
              iconBg: 'bg-primary/10',
            }
            setLists([...lists, newList])
            setExpandedList(newList.id)
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Criar nova lista
        </Button>
      </div>

      {/* Lists */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {lists.map((list) => {
          const isExpanded = expandedList === list.id
          const total = getTotal(list.items)
          const checkedCount = getCheckedCount(list.items)
          const isComplete = list.items.length > 0 && checkedCount === list.items.length

          return (
            <motion.div key={list.id} variants={itemVariants} layout>
              <Card className="border-border/50 overflow-hidden hover:shadow-sm transition-shadow">
                <CardContent className="p-0">
                  {/* List Header */}
                  <button
                    className="w-full p-4 flex items-center gap-3 text-left"
                    onClick={() => setExpandedList(isExpanded ? null : list.id)}
                  >
                    <div className={`h-10 w-10 rounded-xl ${list.iconBg} flex items-center justify-center shrink-0`}>
                      {getListIcon(list)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm truncate">{list.name}</p>
                        {isComplete && (
                          <Badge className="text-[9px] px-1.5 py-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                            Completa
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                          {list.items.length} {list.items.length === 1 ? 'item' : 'itens'}
                        </Badge>
                        {list.items.length > 0 && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" />
                            {list.lastModified}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                      >
                        <Share2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Items */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="overflow-hidden"
                      >
                        <Separator />
                        <div className="p-4 pt-3 space-y-2">
                          {/* Progress */}
                          {list.items.length > 0 && (
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-primary rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(checkedCount / list.items.length) * 100}%` }}
                                  transition={{ duration: 0.4 }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                {checkedCount}/{list.items.length}
                              </span>
                            </div>
                          )}

                          {/* Items */}
                          <AnimatePresence>
                            {list.items.length === 0 ? (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-muted-foreground text-center py-4"
                              >
                                Nenhum item na lista. Adicione o primeiro!
                              </motion.p>
                            ) : (
                              list.items.map((item) => (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 10, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="flex items-center gap-3 py-1.5 group"
                                >
                                  <Checkbox
                                    checked={item.checked}
                                    onCheckedChange={() => toggleItem(list.id, item.id)}
                                    className="h-5 w-5"
                                  />
                                  <div className={`flex-1 min-w-0 ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-medium truncate">{item.name}</p>
                                      <span className="text-[10px] text-muted-foreground shrink-0">x{item.quantity}</span>
                                    </div>
                                    {item.price > 0 && (
                                      <p className="text-[10px] text-muted-foreground">
                                        {formatBRL(item.price * item.quantity)}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                    onClick={() => removeItem(list.id, item.id)}
                                  >
                                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                                  </Button>
                                </motion.div>
                              ))
                            )}
                          </AnimatePresence>

                          {/* Add item input */}
                          <div className="flex gap-2 mt-2">
                            <Input
                              placeholder="Adicionar item..."
                              className="h-9 text-sm flex-1"
                              value={newItemTexts[list.id] || ''}
                              onChange={(e) =>
                                setNewItemTexts((prev) => ({ ...prev, [list.id]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') addItem(list.id)
                              }}
                            />
                            <Button
                              size="sm"
                              className="h-9 gap-1 bg-primary text-primary-foreground px-3"
                              onClick={() => addItem(list.id)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          {/* Total */}
                          {list.items.length > 0 && total > 0 && (
                            <div className="flex items-center justify-between pt-2 mt-2 border-t border-border">
                              <span className="text-xs text-muted-foreground">Total estimado</span>
                              <span className="font-bold text-sm text-primary">{formatBRL(total)}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
