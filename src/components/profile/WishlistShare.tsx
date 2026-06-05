'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, Share2, X, Check, Copy, QrCode, MessageCircle,
  ShoppingBag, Sparkles, PartyPopper
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
import QRCode from 'qrcode'
import { fireConfettiFromElement } from '@/lib/confetti'

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
  ANIMALS: 'from-orange-100 to-amber-200 dark:from-orange-900/30 dark:to-orange-800/30',
}

const categoryEmojis: Record<string, string> = {
  FOOD: '🍚', HEALTH: '💊', AGRICULTURE: '🌿', ELECTRONICS: '📱',
  BEAUTY: '💅', ANIMALS: '🐾', FASHION: '👗', SERVICES: '🔧',
  HOME_GARDEN: '🏠', EDUCATION: '📚', SPORTS: '⚽', OTHER: '📦',
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function generateWishlistText(items: WishlistItem[]): string {
  const lines = items.map((item) => `• ${item.name} — ${formatBRL(item.price)}`)
  const total = items.reduce((sum, i) => sum + i.price, 0)
  return `🛒 Lista de Desejos — DomPlace\n\n${lines.join('\n')}\n\n💰 Total: ${formatBRL(total)}`
}

export function WishlistShare({ items, open, onOpenChange }: WishlistShareProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(items.map(i => i.id))
  )
  const [qrOpen, setQrOpen] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const copyBtnRef = useRef<HTMLButtonElement>(null)

  // Reset selectedIds when items change
  useEffect(() => {
    setSelectedIds(new Set(items.map(i => i.id)))
  }, [items])

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

  const selectedItems = useMemo(() => items.filter(i => selectedIds.has(i.id)), [items, selectedIds])
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

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setLinkCopied(true)

      // Fire confetti from the button element
      if (copyBtnRef.current) {
        fireConfettiFromElement(copyBtnRef.current)
      }

      toast.success('Link copiado para a área de transferência!')
      setTimeout(() => setLinkCopied(false), 2500)
    } catch {
      toast.error('Não foi possível copiar o link')
    }
  }, [shareLink])

  const handleOpenQR = async () => {
    if (selectedItems.length === 0) {
      toast.error('Selecione pelo menos um item para gerar o QR Code')
      return
    }

    setQrOpen(true)
    setQrLoading(true)
    setQrDataUrl(null)

    const text = generateWishlistText(selectedItems)

    try {
      const dataUrl = await QRCode.toDataURL(text, {
        width: 280,
        margin: 2,
        color: {
          dark: '#1a1a2e',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      })
      setQrDataUrl(dataUrl)
    } catch {
      setQrDataUrl(null)
      toast.error('Não foi possível gerar o QR Code. Copie o link ao invés.')
    } finally {
      setQrLoading(false)
    }
  }

  const handleCopyQRText = async () => {
    try {
      const text = generateWishlistText(selectedItems)
      await navigator.clipboard.writeText(text)
      toast.success('Texto copiado!')
    } catch {
      toast.error('Não foi possível copiar o texto')
    }
  }

  return (
    <>
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
                className="h-8 w-8 min-h-[44px] min-w-[44px] text-white/80 hover:text-white hover:bg-white/20"
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

          {/* Price Total Footer */}
          <div className="px-4 py-2 bg-muted/30 border-t border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">
                Total da seleção ({selectedItems.length} {selectedItems.length === 1 ? 'item' : 'itens'})
              </span>
              <motion.span
                key={totalValue}
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                className="text-base font-extrabold text-primary"
              >
                {formatBRL(totalValue)}
              </motion.span>
            </div>
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
                ref={copyBtnRef}
                variant="outline"
                className={`h-10 gap-2 relative overflow-hidden transition-all ${linkCopied ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : ''}`}
                onClick={handleCopyLink}
              >
                <AnimatePresence mode="wait">
                  {linkCopied ? (
                    <motion.span
                      key="copied"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      <Sparkles className="h-3 w-3" />
                      Copiado!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copiar Link
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Success glow effect */}
                <AnimatePresence>
                  {linkCopied && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 0.3, scale: 1.5 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-emerald-400 rounded-lg pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </Button>
              <Button
                variant="outline"
                className="h-10 gap-2"
                onClick={handleOpenQR}
                disabled={qrLoading}
              >
                <QrCode className="h-4 w-4" />
                {qrLoading ? 'Gerando...' : 'QR Code'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-xs p-0 sm:rounded-2xl rounded-t-2xl gap-0 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-emerald-600 p-4 text-white text-center">
            <DialogTitle className="text-base font-bold flex items-center justify-center gap-2 text-white">
              <QrCode className="h-5 w-5" />
              QR Code da Lista
            </DialogTitle>
            <DialogDescription className="text-white/80 text-xs mt-1">
              Escaneie para ver os itens selecionados
            </DialogDescription>
          </div>

          <div className="p-6 flex flex-col items-center gap-4">
            {qrLoading ? (
              <div className="h-56 w-56 rounded-xl bg-muted/50 animate-pulse flex items-center justify-center">
                <QrCode className="h-12 w-12 text-muted-foreground" />
              </div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code da lista de desejos"
                className="h-56 w-56 rounded-xl"
              />
            ) : (
              <div className="h-56 w-56 rounded-xl bg-muted/30 border border-dashed border-border flex flex-col items-center justify-center gap-2">
                <QrCode className="h-10 w-10 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">QR indisponível</p>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'itens'} —{' '}
              <span className="font-semibold">{formatBRL(totalValue)}</span>
            </p>
          </div>

          <div className="p-4 border-t border-border bg-muted/30 flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyQRText}
              className="w-full gap-2"
            >
              <Copy className="h-3.5 w-3.5" />
              Copiar texto da lista
            </Button>
            <Button
              size="sm"
              onClick={() => setQrOpen(false)}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
