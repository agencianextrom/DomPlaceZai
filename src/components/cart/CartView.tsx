'use client'

import { useState } from 'react'
import { Trash2, Plus, Minus, ArrowRight, Tag, ShoppingBag, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store/useAppStore'
import { formatBRL } from '@/components/product/ProductCard'
import { motion, AnimatePresence } from 'framer-motion'

const gradients = [
  'from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30',
  'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30',
]

const icons = ['🍎', '🛒', '📦', '🎁', '🌿', '🍞']

export function CartView() {
  const { 
    cartItems, 
    removeFromCart, 
    updateCartQuantity, 
    getCartGroupedByStore,
    getCartTotal,
    navigate,
    goBack,
  } = useAppStore()
  
  const [promoCode, setPromoCode] = useState('')
  const groups = getCartGroupedByStore()
  const subtotal = getCartTotal()
  const deliveryFees = groups.length * 5.00
  const total = subtotal + deliveryFees
  
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-24">
        <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-4">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
        </div>
        <h2 className="text-xl font-bold mb-1">Seu carrinho está vazio</h2>
        <p className="text-muted-foreground text-center mb-6">Adicione produtos das lojas locais para começar</p>
        <Button onClick={() => navigate('home')} className="bg-primary text-primary-foreground">
          Explorar lojas
        </Button>
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
