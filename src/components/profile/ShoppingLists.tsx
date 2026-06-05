'use client'

import { useState, useEffect, useRef } from 'react'
import { ListChecks, Flame, Plus, Share2, Clock, ShoppingCart, ChevronDown, ChevronUp, X, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  saveListsToStorage,
  loadListsFromStorage,
  type ShoppingItem,
  type ShoppingList,
} from '@/lib/shopping-lists-persistence'

// --- Icon mapping ---
const iconMap: Record<string, typeof ListChecks> = {
  ListChecks,
  Flame,
}

function getIconComponent(iconName: string): typeof ListChecks {
  return iconMap[iconName] || ListChecks
}

// --- Helpers ---
function formatLastModified(): string {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

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
  const [expandedList, setExpandedList] = useState<string | null>(null)
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({})
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [editingListName, setEditingListName] = useState('')
  const isInitialized = useRef(false)

  // Load lists from localStorage on mount — use lazy initializer pattern
  // to avoid calling setState inside an effect.
  const [lists, setLists] = useState<ShoppingList[]>(() => {
    if (typeof window === 'undefined') return []
    const stored = loadListsFromStorage()
    return stored && stored.length > 0 ? stored : []
  })

  // Persist lists to localStorage on changes (skip first render)
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true
      return
    }
    saveListsToStorage(lists)
  }, [lists])

  const toggleItem = (listId: string, itemId: string) => {
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              ),
              lastModified: formatLastModified(),
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
              lastModified: formatLastModified(),
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
          ? { ...list, items: list.items.filter((item) => item.id !== itemId), lastModified: formatLastModified() }
          : list
      )
    )
  }

  const createList = () => {
    const newList: ShoppingList = {
      id: `l-new-${Date.now()}`,
      name: `Nova Lista ${lists.length + 1}`,
      iconName: 'ListChecks',
      items: [],
      lastModified: formatLastModified(),
      color: 'text-primary',
      iconBg: 'bg-primary/10',
    }
    setLists([...lists, newList])
    setExpandedList(newList.id)
    setEditingListId(newList.id)
    setEditingListName(newList.name)
  }

  const deleteList = (listId: string) => {
    setLists((prev) => prev.filter((list) => list.id !== listId))
    if (expandedList === listId) setExpandedList(null)
    toast.success('Lista removida')
  }

  const startEditListName = (listId: string, currentName: string) => {
    setEditingListId(listId)
    setEditingListName(currentName)
  }

  const saveListName = (listId: string) => {
    const trimmed = editingListName.trim()
    if (!trimmed) {
      setEditingListId(null)
      return
    }
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId ? { ...list, name: trimmed, lastModified: formatLastModified() } : list
      )
    )
    setEditingListId(null)
  }

  const handleShareList = (list: ShoppingList) => {
    const lines: string[] = []
    lines.push(`📋 ${list.name}`)
    lines.push('')

    if (list.items.length === 0) {
      lines.push('(Lista vazia)')
    } else {
      list.items.forEach((item) => {
        const check = item.checked ? '✅' : '⬜'
        lines.push(`${check} ${item.quantity}x ${item.name}${item.price > 0 ? ` — ${formatBRL(item.price * item.quantity)}` : ''}`)
      })

      const total = list.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const checked = list.items.filter(i => i.checked).length
      lines.push('')
      lines.push(`Progresso: ${checked}/${list.items.length}`)
      if (total > 0) lines.push(`Total estimado: ${formatBRL(total)}`)
    }

    lines.push('')
    lines.push('— via DomPlace 🛒')

    const text = lines.join('\n')

    navigator.clipboard.writeText(text).then(() => {
      toast.success('Lista copiada!')
    }).catch(() => {
      // Fallback: try execCommand for older browsers
      try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        toast.success('Lista copiada!')
      } catch {
        toast.error('Não foi possível copiar a lista')
      }
    })
  }

  const getTotal = (items: ShoppingItem[]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const getCheckedCount = (items: ShoppingItem[]) => {
    return items.filter((i) => i.checked).length
  }

  const getListIcon = (list: ShoppingList) => {
    const ListIcon = getIconComponent(list.iconName)
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
          className="bg-primary text-primary-foreground gap-1 h-8 min-h-[44px] text-xs"
          onClick={createList}
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
                        {editingListId === list.id ? (
                          <Input
                            value={editingListName}
                            onChange={(e) => setEditingListName(e.target.value)}
                            onBlur={() => saveListName(list.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveListName(list.id)
                              if (e.key === 'Escape') setEditingListId(null)
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="h-7 text-sm font-semibold w-full max-w-[180px]"
                            autoFocus
                          />
                        ) : (
                          <p className="font-semibold text-sm truncate">{list.name}</p>
                        )}
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
                          handleShareList(list)
                        }}
                        title="Copiar lista"
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
                                    className="h-7 w-7 min-h-[44px] min-w-[44px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
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

                          {/* Total + Actions */}
                          <div className="flex items-center justify-between pt-2 mt-2 border-t border-border">
                            <div className="flex items-center gap-2">
                              {list.items.length > 0 && total > 0 && (
                                <>
                                  <span className="text-xs text-muted-foreground">Total estimado</span>
                                  <span className="font-bold text-sm text-primary">{formatBRL(total)}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 min-h-[44px] min-w-[44px]"
                                onClick={() => startEditListName(list.id, list.name)}
                                title="Editar nome"
                              >
                                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 min-h-[44px] min-w-[44px]"
                                onClick={() => handleShareList(list)}
                                title="Copiar lista"
                              >
                                <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 min-h-[44px] min-w-[44px]"
                                onClick={() => deleteList(list.id)}
                                title="Excluir lista"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </div>
                          </div>
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

      {/* Empty state */}
      {lists.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <ListChecks className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nenhuma lista criada</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 gap-1"
            onClick={createList}
          >
            <Plus className="h-3.5 w-3.5" />
            Criar primeira lista
          </Button>
        </motion.div>
      )}
    </div>
  )
}
