'use client'

import { useState } from 'react'
import { Trash2, Plus, Minus, ArrowRight, Tag, ShoppingBag, Store, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store/useAppStore'
import { formatBRL } from '@/components/product/ProductCard'
import { motion, AnimatePresence } from 'framer-motion'
import { ProductCard } from '@/components/product/ProductCard'
import type { ProductData } from '@/store/useAppStore'

const gradients = [
  'from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30',
  'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30',
]

const icons = ['🍎', '🛒', '📦', '🎁', '🌿', '🍞']

const suggestedProducts: ProductData[] = [
  { id: 'sp1', storeId: 's2', storeName: 'Açaí da Boa', storeLogo: null, name: 'Açaí 500ml', slug: 'acai-500ml', description: 'Açaí cremoso feito com frutas frescas do Pará.', price: 15.00, comparePrice: 18.00, images: '[]', stock: 100, rating: 4.9, totalReviews: 89, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["300ml","500ml","700ml"]', category: 'FOOD' },
  { id: 'sp2', storeId: 's5', storeName: 'Padaria Pão Quente', storeLogo: null, name: 'Pão Francês (6 un)', slug: 'pao-frances', description: 'Pão francês fresquinho saindo do forno.', price: 6.00, comparePrice: null, images: '[]', stock: 200, rating: 4.9, totalReviews: 120, isFeatured: true, isNew: false, isOffer: false, tags: '[]', variations: null, category: 'FOOD' },
  { id: 'sp3', storeId: 's4', storeName: 'Farmácia Vida', storeLogo: null, name: 'Pasta de Dente Colgate', slug: 'pasta-dente', description: 'Pasta de dente Colgate Máxima Proteção 90g.', price: 6.90, comparePrice: null, images: '[]', stock: 200, rating: 4.3, totalReviews: 11, isFeatured: false, isNew: false, isOffer: false, tags: '[]', variations: null, category: 'HEALTH' },
  { id: 'sp4', storeId: 's3', storeName: 'Agropecuária São Paulo', storeLogo: null, name: 'Muda de Cupuaçu', slug: 'muda-cupuacu', description: 'Muda de cupuaçuzeiro com raiz forte, pronta para plantio.', price: 25.00, comparePrice: null, images: '[]', stock: 30, rating: 4.8, totalReviews: 5, isFeatured: true, isNew: true, isOffer: false, tags: '[]', variations: null, category: 'AGRICULTURE' },
  { id: 'sp5', storeId: 's8', storeName: 'Salão da Bella', storeLogo: null, name: 'Manicure Completa', slug: 'manicure-completa', description: 'Manicure e pedicure completa com esmaltação.', price: 50.00, comparePrice: null, images: '[]', stock: 999, rating: 4.7, totalReviews: 54, isFeatured: false, isNew: true, isOffer: false, tags: '[]', variations: null, category: 'BEAUTY' },
]

export function CartView() {
  const { 
    cartItems, 
    removeFromCart, 
    updateCartQuantity, 
    getCartGroupedByStore,
    getCartTotal,
    navigate,
  } = useAppStore()
  
  const [promoCode, setPromoCode] = useState('')
  const [suggestionScrollPos, setSuggestionScrollPos] = useState(0)
  const groups = getCartGroupedByStore()
  const subtotal = getCartTotal()
  const deliveryFees = groups.length * 5.00
  const total = subtotal + deliveryFees

  const scrollSuggestions = (direction: 'left' | 'right') => {
    const container = document.getElementById('suggestions-scroll')
    if (!container) return
    const scrollAmount = 220
    const newScroll = direction === 'left' 
      ? Math.max(0, suggestionScrollPos - scrollAmount)
      : suggestionScrollPos + scrollAmount
    container.scrollTo({ left: newScroll, behavior: 'smooth' })
    setSuggestionScrollPos(newScroll)
  }
  
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-24">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative mb-6"
        >
          <div className="w-28 h-28 rounded-full bg-secondary flex items-center justify-center">
            <ShoppingBag className="h-14 w-14 text-muted-foreground/30" />
          </div>
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Sparkles className="h-4 w-4 text-primary" />
          </motion.div>
        </motion.div>
        <h2 className="text-xl font-bold mb-1">Seu carrinho está vazio</h2>
        <p className="text-muted-foreground text-center mb-6 text-sm max-w-xs">
          Adicione produtos das lojas locais e aproveite as melhores ofertas de Dom Eliseu
        </p>
        <div className="flex gap-3">
          <Button onClick={() => navigate('home')} variant="outline" className="h-11">
            Explorar ofertas
          </Button>
          <Button onClick={() => navigate('home')} className="bg-primary text-primary-foreground h-11">
            Ver lojas
            <Store className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen pb-48">
      {/* Header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border -mx-4 px-4 -mt-4 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold flex items-center gap-2">
            Carrinho
            <Badge variant="secondary" className="text-xs">{cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}</Badge>
          </h1>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => useAppStore.getState().clearCart()}>
            Limpar
          </Button>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Suggested products - "Add more items" */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Adicione mais itens</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => scrollSuggestions('left')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => scrollSuggestions('right')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div id="suggestions-scroll" className="flex gap-3 overflow-x-auto hide-scrollbar -mx-1 px-1 pb-1">
            {suggestedProducts.map((product) => (
              <div key={product.id} className="shrink-0 w-[150px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Items grouped by store */}
        <AnimatePresence>
          {groups.map((group) => (
            <motion.div
              key={group.storeId}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary/30">
                <Store className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">{group.storeName}</span>
                <span className="text-xs text-muted-foreground ml-auto">{group.items.length} {group.items.length === 1 ? 'item' : 'itens'}</span>
              </div>
              
              <div className="divide-y divide-border">
                {group.items.map((item) => {
                  const gradient = gradients[Math.abs(item.product.name.charCodeAt(0)) % gradients.length]
                  const icon = icons[Math.abs(item.product.name.charCodeAt(0)) % icons.length]
                  
                  return (
                    <div key={item.productId} className="flex gap-3 p-4">
                      <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shrink-0`}>
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold truncate">{item.product.name}</h3>
                        <p className="text-sm font-bold text-primary mt-1">{formatBRL(item.product.price)}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                              className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                              className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{formatBRL(item.product.price * item.quantity)}</span>
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="px-4 py-3 bg-secondary/20 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Subtotal da loja</span>
                <span className="font-semibold">{formatBRL(group.subtotal)}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Promo code */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Código promocional</span>
          </div>
          <div className="flex gap-2 mt-3">
            <Input
              placeholder="Digite seu cupom"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1 h-10"
            />
            <Button variant="outline" className="h-10">Aplicar</Button>
          </div>
        </div>
        
        {/* Order bump */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/20 p-4">
          <p className="text-xs font-semibold text-primary mb-1">🔥 Sugestão para você</p>
          <p className="text-sm">Adicione mais R$ 15,00 e ganhe frete grátis!</p>
        </div>
      </div>
      
      {/* Bottom summary */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-background border-t border-border px-4 py-4 pb-20 md:pb-4">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatBRL(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Entrega ({groups.length} {groups.length === 1 ? 'loja' : 'lojas'})</span>
              <span>{formatBRL(deliveryFees)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-primary">{formatBRL(total)}</span>
            </div>
          </div>
          <Button
            className="w-full h-12 mt-3 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold"
            onClick={() => navigate('checkout')}
          >
            Finalizar Pedido
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
