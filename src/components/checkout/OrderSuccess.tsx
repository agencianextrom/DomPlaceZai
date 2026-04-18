'use client'

import { useState } from 'react'
import {
  Check, Package, Clock, MapPin, Share2, QrCode, ArrowRight,
  ShoppingBag, Truck, ChevronRight, Copy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store/useAppStore'
import { formatBRL } from '@/components/product/ProductCard'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface OrderSuccessProps {
  orderNumber: string
  items: { productName: string; quantity: number; price: number; total: number }[]
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  paymentMethod: string
  deliveryType: string
  estimatedDelivery: string
}

const confettiColors = ['#10b981', '#f59e0b', '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#8b5cf6', '#ef4444']
const confettiShapes = ['●', '■', '▲', '★', '♦', '◆']

function ConfettiParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => {
        const angle = (i / 40) * Math.PI * 2
        const distance = 80 + Math.random() * 160
        const tx = Math.cos(angle) * distance
        const ty = Math.sin(angle) * distance - 60 + Math.random() * 40
        const color = confettiColors[i % confettiColors.length]
        const shape = confettiShapes[i % confettiShapes.length]
        const size = 5 + Math.random() * 10
        const delay = i * 0.02

        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
            animate={{ x: tx, y: ty + 200, scale: 0, opacity: 0, rotate: (Math.random() - 0.5) * 1080 }}
            transition={{ duration: 1.5 + Math.random(), delay: 0.3 + delay, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/2"
            style={{ color, fontSize: `${size}px`, lineHeight: 1 }}
          >
            {shape}
          </motion.div>
        )
      })}
    </div>
  )
}

export function OrderSuccess({
  orderNumber,
  items,
  subtotal,
  deliveryFee,
  discount,
  total,
  paymentMethod,
  deliveryType,
  estimatedDelivery,
}: OrderSuccessProps) {
  const { navigate } = useAppStore()
  const [showPixQR, setShowPixQR] = useState(false)
  const isPix = paymentMethod === 'pix' || paymentMethod === 'PIX'

  const handleShareWhatsApp = () => {
    const message = `🛒 Pedido confirmado no DomPlace!\n\n📦 Pedido #${orderNumber}\n💰 Total: ${formatBRL(total)}\n⏰ Previsão: ${estimatedDelivery}\n\nAcompanhe seu pedido no app!`
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
    toast.success('Compartilhando no WhatsApp...')
  }

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber)
    toast.success(`Pedido #${orderNumber} copiado!`)
  }

  const paymentLabels: Record<string, string> = {
    pix: 'Pix',
    PIX: 'Pix',
    credit: 'Cartão de Crédito',
    CREDIT_CARD: 'Cartão de Crédito',
    boleto: 'Boleto',
    cash: 'Dinheiro',
    CASH_ON_DELIVERY: 'Dinheiro',
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 pb-28 md:pb-8">
      {/* Success checkmark with confetti */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative mt-8 mb-6"
      >
        {/* Outer glow ring */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
          className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary/20 via-emerald-400/20 to-accent/20 blur-xl"
        />
        
        {/* Pulsing ring */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full border-2 border-primary/30"
        />

        {/* Main circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary via-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 12 }}
          >
            <Check className="h-12 w-12 text-white" strokeWidth={3} />
          </motion.div>
        </motion.div>

        <ConfettiParticles />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center mb-6"
      >
        <h1 className="text-2xl font-bold text-shadow-sm">Pedido Confirmado! 🎉</h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-2"
        >
          <button
            onClick={handleCopyOrderNumber}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="font-mono text-sm">Pedido #{orderNumber}</span>
            <Copy className="h-3 w-3" />
          </button>
        </motion.div>
      </motion.div>

      {/* Estimated delivery card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="w-full max-w-md mb-4"
      >
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border-emerald-200/50 dark:border-emerald-800/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shrink-0">
              {deliveryType === 'PICKUP' ? (
                <MapPin className="h-6 w-6 text-white" />
              ) : (
                <Truck className="h-6 w-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {deliveryType === 'PICKUP' ? 'Pronto para retirada' : 'Previsão de entrega'}
              </p>
              <p className="text-lg font-bold text-primary">{estimatedDelivery}</p>
              <p className="text-xs text-muted-foreground">
                {paymentLabels[paymentMethod] || paymentMethod} · {formatBRL(total)}
              </p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Clock className="h-5 w-5 text-primary" />
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Order Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="w-full max-w-md mb-4"
      >
        <Card className="border-border/50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Resumo do Pedido
            </h3>
            <div className="space-y-2.5">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">{item.quantity}x</span>
                    <span className="text-sm">{item.productName}</span>
                  </div>
                  <span className="font-medium text-sm">{formatBRL(item.total)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatBRL(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Entrega</span>
                <span>{deliveryFee === 0 ? 'Grátis' : formatBRL(deliveryFee)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Desconto</span>
                  <span>-{formatBRL(discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-primary">{formatBRL(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pix QR Code placeholder */}
      {isPix && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="w-full max-w-md mb-4"
        >
          <Card className="border-primary/20 bg-gradient-to-b from-white to-primary/5 dark:from-card dark:to-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-sm">Pagamento via Pix</h3>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[10px]">
                  Aguardando pagamento
                </Badge>
              </div>
              
              <AnimatePresence mode="wait">
                {showPixQR ? (
                  <motion.div
                    key="qr"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center"
                  >
                    {/* QR Code placeholder */}
                    <div className="w-48 h-48 mx-auto bg-white rounded-xl border-2 border-border/50 flex items-center justify-center mb-3 relative overflow-hidden">
                      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 p-2 gap-[1px]">
                        {Array.from({ length: 64 }).map((_, i) => (
                          <div
                            key={i}
                            className={`rounded-[1px] ${Math.random() > 0.4 ? 'bg-foreground' : 'bg-transparent'}`}
                          />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm z-10">
                          <span className="text-primary font-bold text-lg">D</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Escaneie o QR Code ou copie a chave Pix
                    </p>
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
                      <code className="text-xs flex-1 truncate font-mono">
                        119998888776@domplace.com
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs shrink-0"
                        onClick={() => {
                          navigator.clipboard.writeText('119998888776@domplace.com')
                          toast.success('Chave Pix copiada!')
                        }}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copiar
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs text-muted-foreground"
                      onClick={() => setShowPixQR(false)}
                    >
                      Ocultar QR Code
                    </Button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowPixQR(true)}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all text-center group"
                  >
                    <QrCode className="h-8 w-8 text-primary/60 mx-auto mb-2 group-hover:text-primary transition-colors" />
                    <p className="text-sm font-medium text-primary">Mostrar QR Code Pix</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Clique para ver o código de pagamento</p>
                  </motion.button>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="w-full max-w-md space-y-3 mt-2"
      >
        <Button
          className="w-full h-12 bg-primary text-primary-foreground font-semibold btn-glow gap-2"
          onClick={() => navigate('orders')}
        >
          <Package className="h-4 w-4" />
          Acompanhar Pedido
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-11 gap-2"
            onClick={() => navigate('home')}
          >
            <ShoppingBag className="h-4 w-4" />
            Continuar Comprando
          </Button>
          <Button
            variant="outline"
            className="h-11 gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/10"
            onClick={handleShareWhatsApp}
          >
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
