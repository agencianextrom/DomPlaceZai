'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, Share2, X, Check, Copy, QrCode, MessageCircle, ExternalLink,
  ShoppingBag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

interface WishlistItem {
  id: string
  name: string
  price: number
  storeName: string
  category: string
}

interface WishlistShareProps {
  items: WishlistItem[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

const categoryGradients: Record<string, string> = {
  FOOD: 'from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30',
  HEALTH: 'from-teal-100 to-cyan-200 dark:from-teal-900/30 dark:to-cyan-800/30',
  AGRICULTURE: 'from-lime-100 to-green-200 dark:from-lime-900/30 dark:to-green-800/30',
  ELECTRONICS: 'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30',
  BEAUTY: 'from-rose-100 to-pink-200 dark:from-rose-900/30 dark:to-pink-800/30',
  ANIMALS: 'from-orange-100 to-amber-200 dark:from-orange-900/30 dark:to-amber-800/30',
}

const categoryEmojis: Record<string, string> = {
  FOOD: '🍚', HEALTH: '💊', AGRICULTURE: '🌿', ELECTRONICS: '📱',
  BEAUTY: '💅', ANIMALS: '🐾', FASHION: '👗', SERVICES: '🔧',
  HOME_GARDEN: '🏠', EDUCATION: '📚', SPORTS: '⚽', OTHER: '📦',
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function WishlistShare({ items, open, onOpenChange }: WishlistShareProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(items.map(i => i.id))
  )

  const toggleItem = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const selectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map(i => i.id)))
    }
  }

  const selectedItems = items.filter(i => selectedIds.has(i.id))
  const totalValue = selectedItems.reduce((sum, i) => sum + i.price, 0)
  const shareLink = `https://domplace.com/wishlist/${Date.now().toString(36)}`

  const handleWhatsApp = () => {
    if (selectedItems.length === 0) {
      toast.error('Selecione pelo menos um item para compartilhar')
      return
    }

    const itemList = selectedItems
      .map((item, i) => `${i + 1}. ${item.name} - ${formatBRL(item.price)} (${item.storeName})`)
      .join('\n')

    const message = `🛒 *Minha Lista de Desejos - DomPlace*\n\n${itemList}\n\n💰 *Total estimado: ${formatBRL(totalValue)}*\n\nVeja no DomPlace: ${shareLink}`

    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
    toast.success('Lista compartilhada no WhatsApp!')
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      toast.success('Link copiado para a área de transferência!')
    } catch {
      toast.error('Não foi possível copiar o link')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0 sm:rounded-2xl rounded-t-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-emerald-600 p-5 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Heart className="h-5 w-5 fill-current" />
                Compartilhar Favoritos
              </DialogTitle>
              <DialogDescription className="text-white/80 text-xs mt-1">
                Selecione os itens e escolha como compartilhar
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Preview Card */}
        <div className="px-4 pt-4 shrink-0">
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200/50 dark:border-amber-800/30">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">
                  {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'itens'} selecionado{selectedItems.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  Valor estimado: <span className="font-semibold text-primary">{formatBRL(totalValue)}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Select All */}
        <div className="px-4 pt-3">
          <button
            onClick={selectAll}
            className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
          >
            {selectedIds.size === items.length ? (
              <>
                <X className="h-3 w-3" />
                Desmarcar todos
              </>
            ) : (
              <>
                <Check className="h-3 w-3" />
                Selecionar todos
              </>
            )}
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-2">
          <AnimatePresence>
            {items.map((item, idx) => {
              const isSelected = selectedIds.has(item.id)
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary/30 bg-primary/5 shadow-sm'
                      : 'border-border/50 bg-card opacity-60'
                  }`}
                  onClick={() => toggleItem(item.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="shrink-0"
                  />
                  {/* Product mini image */}
                  <div className={`h-11 w-11 rounded-lg bg-gradient-to-br ${categoryGradients[item.category] || 'from-muted to-muted/50'} flex items-center justify-center shrink-0`}>
                    <span className="text-lg">{categoryEmojis[item.category] || '📦'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold line-clamp-1">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{item.storeName}</p>
                  </div>
                  <span className="text-sm font-bold text-primary shrink-0">{formatBRL(item.price)}</span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Share Options */}
        <div className="p-4 border-t border-border bg-background shrink-0 space-y-2">
          <Button
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="h-4 w-4" />
            Compartilhar no WhatsApp
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-10 gap-2"
              onClick={handleCopyLink}
            >
              <Copy className="h-4 w-4" />
              Copiar Link
            </Button>
            <Button
              variant="outline"
              className="h-10 gap-2"
              onClick={() => toast.info('QR Code será gerado em breve!')}
            >
              <QrCode className="h-4 w-4" />
              QR Code
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
