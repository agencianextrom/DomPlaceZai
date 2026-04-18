'use client'

import { useState } from 'react'
import { Trash2, Plus, Minus, ArrowRight, Tag, ShoppingBag, Store, ChevronLeft, ChevronRight, Sparkles, Truck, PartyPopper } from 'lucide-react'
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

const FREE_DELIVERY_THRESHOLD = 50

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
  
  const freeDeliveryProgress = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100)
  const hasFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD
  const remainingForFree = Math.max(FREE_DELIVERY_THRESHOLD - subtotal, 0)

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
          initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative mb-8"
        >
          {/* Floating animated shopping bag */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/5 dark:to-accent/5 flex items-center justify-center shadow-inner"
          >
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, 2, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            >
              <ShoppingBag className="h-16 w-16 text-primary/40" />
            </motion.div>
          </motion.div>
          
          {/* Orbiting sparkle */}
          <motion.div
            animate={{ 
              rotate: 360,
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
            style={{ transformOrigin: 'center center' }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
          </motion.div>
          
          {/* Second orbiting sparkle - opposite direction */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
            style={{ transformOrigin: 'center center' }}
          >
            <div className="absolute bottom-2 right-0">
              <Sparkles className="h-3 w-3 text-primary/50" />
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-xl font-bold mb-2 text-shadow-sm">Seu carrinho está vazio</h2>
          <p className="text-muted-foreground text-center mb-8 text-sm max-w-xs mx-auto leading-relaxed">
            Adicione produtos das lojas locais e aproveite as melhores ofertas de Dom Eliseu
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('home')} variant="outline" className="h-11 px-5">
              Explorar ofertas
            </Button>
            <Button onClick={() => navigate('home')} className="bg-primary text-primary-foreground h-11 px-5 btn-glow">
              Ver lojas
              <Store className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen pb-48">
      {/* Header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border -mx-4 px-4 -mt-4 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold flex items-center gap-2 text-shadow-sm">
            Carrinho
            <Badge variant="secondary" className="text-xs">{cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}</Badge>
          </h1>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => useAppStore.getState().clearCart()}>
            Limpar
          </Button>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Free delivery progress banner */}
        {!hasFreeDelivery ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 rounded-xl border border-primary/15 p-4 card-shine"
          >
            <div className="flex items-center gap-2 mb-2.5">
              <Truck className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Frete grátis a partir de {formatBRL(FREE_DELIVERY_THRESHOLD)}</span>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${freeDeliveryProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/70 rounded-full"
              />
              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/70 rounded-full" style={{ width: `${freeDeliveryProgress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Falta apenas <span className="font-semibold text-primary">{formatBRL(remainingForFree)}</span> para ganhar frete grátis!
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-emerald-500/10 to-primary/10 rounded-xl border border-emerald-500/20 p-3.5 flex items-center gap-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="h-9 w-9 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0"
            >
              <PartyPopper className="h-5 w-5 text-emerald-600" />
            </motion.div>
            <div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">🎉 Frete grátis!</p>
              <p className="text-xs text-muted-foreground">Você ganhou entrega gratuita neste pedido</p>
            </div>
          </motion.div>
        )}

        {/* Suggested products - "Add more items" */}
        <div className="bg-card rounded-xl border border-border p-4 card-shine">
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
            {suggestedProducts.map((product, index) => (
              <motion.div 
                key={product.id} 
                className="shrink-0 w-[150px]"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
              >
                <ProductCard product={product} />
              </motion.div>
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
              exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
              className="bg-card rounded-xl border border-border overflow-hidden card-shine"
            >
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary/30">
                <Store className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">{group.storeName}</span>
                <span className="text-xs text-muted-foreground ml-auto">{group.items.length} {group.items.length === 1 ? 'item' : 'itens'}</span>
              </div>
              
              <div className="divide-y divide-border">
                {group.items.map((item, index) => {
                  const gradient = gradients[Math.abs(item.product.name.charCodeAt(0)) % gradients.length]
                  const icon = icons[Math.abs(item.product.name.charCodeAt(0)) % icons.length]
                  
                  return (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -60, transition: { duration: 0.25 } }}
                      transition={{ delay: index * 0.06, duration: 0.35 }}
                      className="flex gap-3 p-4"
                    >
                      <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shrink-0`}>
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold truncate">{item.product.name}</h3>
                        <p className="text-sm font-bold text-primary mt-1">{formatBRL(item.product.price)}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileTap={{ scale: 0.88 }}
                              onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                              className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </motion.button>
                            <motion.span 
                              key={item.quantity}
                              initial={{ scale: 1.3 }}
                              animate={{ scale: 1 }}
                              className="w-6 text-center font-semibold text-sm"
                            >
                              {item.quantity}
                            </motion.span>
                            <motion.button
                              whileTap={{ scale: 0.88 }}
                              onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                              className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </motion.button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{formatBRL(item.product.price * item.quantity)}</span>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => removeFromCart(item.productId)}
                              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
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
        <div className="bg-card rounded-xl border border-border p-4 card-shine">
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
        
        {/* Order bump - only show if not yet at free delivery */}
        {!hasFreeDelivery && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/20 p-4"
          >
            <p className="text-xs font-semibold text-primary mb-1">🔥 Sugestão para você</p>
            <p className="text-sm">Adicione mais {formatBRL(remainingForFree)} e ganhe frete grátis!</p>
          </motion.div>
        )}
      </div>
      
      {/* Bottom summary */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-4 py-4 pb-20 md:pb-4">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatBRL(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Entrega ({groups.length} {groups.length === 1 ? 'loja' : 'lojas'})</span>
              <motion.span
                key={hasFreeDelivery ? 'free' : 'paid'}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className={hasFreeDelivery ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}
              >
                {hasFreeDelivery ? 'Grátis 🎉' : formatBRL(deliveryFees)}
              </motion.span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-primary">{formatBRL(total)}</span>
            </div>
          </div>
          <Button
            className="w-full h-12 mt-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary text-base font-semibold btn-glow"
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
