'use client'

import { useState } from 'react'
import { ArrowLeft, MapPin, CreditCard, Banknote, QrCode, FileText, Check, Store, Truck, Shield, ChevronRight, Clock, Calendar, Tag, X, Loader2, Search, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/store/useAppStore'
import { formatBRL } from '@/components/product/ProductCard'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { PaymentTracker } from './PaymentTracker'
import { TaxBreakdown } from './TaxBreakdown'
import { SplitPaymentSelector } from './SplitPaymentSelector'
import { DeliveryScheduler } from './DeliveryScheduler'
import { PaymentMethods } from './PaymentMethods'
import { DeliverySlotPicker } from './DeliverySlotPicker'
import { TipSelector } from './TipSelector'
import { OrderSuccess } from './OrderSuccess'

const paymentMethods = [
  { id: 'PIX', label: 'Pix', icon: QrCode, desc: 'Pagamento instantâneo', color: 'bg-teal-50 dark:bg-teal-900/10 border-teal-200 dark:border-teal-800/30' },
  { id: 'CREDIT_CARD', label: 'Cartão de Crédito', icon: CreditCard, desc: 'Em até 3x sem juros', color: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30' },
  { id: 'BOLETO', label: 'Boleto', icon: FileText, desc: 'Prazo de 1-2 dias', color: 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800/30' },
  { id: 'CASH_ON_DELIVERY', label: 'Dinheiro', icon: Banknote, desc: 'Pagamento na entrega', color: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30' },
]

const deliveryTimeOptions = [
  { id: 'today-30', label: 'Hoje', desc: '30-45 min', icon: Clock },
  { id: 'today-60', label: 'Hoje', desc: '60-90 min', icon: Clock },
  { id: 'tomorrow', label: 'Amanhã', desc: '09:00 - 18:00', icon: Calendar },
  { id: 'schedule', label: 'Agendar', desc: 'Escolher data e hora', icon: Calendar },
]

type CheckoutStep = 'cart' | 'address' | 'payment' | 'confirmation'

const stepLabels = [
  { id: 'cart' as CheckoutStep, num: 0, title: 'Carrinho', icon: '🛒' },
  { id: 'address' as CheckoutStep, num: 1, title: 'Endereço', icon: '📍' },
  { id: 'payment' as CheckoutStep, num: 2, title: 'Pagamento', icon: '💳' },
  { id: 'confirmation' as CheckoutStep, num: 3, title: 'Confirmação', icon: '✅' },
]

// Confetti particles configuration
const confettiColors = ['#10b981', '#f59e0b', '#06b6d4', '#f97316', '#84cc16', '#ec4899']
const confettiShapes = ['●', '■', '▲', '★']

function ConfettiBurst() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 18 }).map((_, i) => {
        const angle = (i / 18) * Math.PI * 2
        const distance = 60 + Math.random() * 80
        const tx = Math.cos(angle) * distance
        const ty = Math.sin(angle) * distance - 30
        const color = confettiColors[i % confettiColors.length]
        const shape = confettiShapes[i % confettiShapes.length]
        const size = 6 + Math.random() * 8
        const delay = i * 0.03

        return (
          <motion.div
            key={i}
            initial={{
              x: 0,
              y: 0,
              scale: 1,
              opacity: 1,
              rotate: 0,
            }}
            animate={{
              x: tx,
              y: ty,
              scale: 0,
              opacity: 0,
              rotate: (Math.random() - 0.5) * 720,
            }}
            transition={{
              duration: 1 + Math.random() * 0.5,
              delay: 0.2 + delay,
              ease: 'easeOut',
            }}
            className="absolute left-1/2 top-1/2"
            style={{
              color,
              fontSize: `${size}px`,
              lineHeight: 1,
            }}
          >
            {shape}
          </motion.div>
        )
      })}
    </div>
  )
}

export function CheckoutView() {
  const { goBack, navigate, getCartGroupedByStore, getCartTotal, getCartItemCount, clearCart, currentUser, selectOrder } = useAppStore()
  const [step, setStep] = useState<CheckoutStep>('address') // Start at address (cart is implicit)
  const [payment, setPayment] = useState('PIX')
  const [deliveryType, setDeliveryType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY')
  const [deliveryTime, setDeliveryTime] = useState('today-30')
  const [selectedDeliverySlot, setSelectedDeliverySlot] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [couponError, setCouponError] = useState('')
  const [createdOrder, setCreatedOrder] = useState<{
    id: string
    orderNumber: string
    storeId: string
    storeName: string
    status: string
    subtotal: number
    deliveryFee: number
    discount: number
    total: number
    paymentMethod: string
    deliveryType: string
    createdAt: string
    items?: { productName: string; quantity: number; price: number; total: number; productImage?: string | null }[]
  } | null>(null)
  const [pixQrCode, setPixQrCode] = useState<string | null>(null)
  const [pixQrCodeText, setPixQrCodeText] = useState<string | null>(null)
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState('')

  // ViaCEP auto-fill for checkout address
  const handleCepChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    let masked = ''
    for (let i = 0; i < digits.length; i++) {
      if (i === 5) masked += '-'
      masked += digits[i]
    }
    setAddress({ ...address, zip: masked })
    setCepError('')

    if (digits.length === 8) {
      setCepLoading(true)
      try {
        fetch(`/api/cep/${digits}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data && !data.erro) {
              setAddress(prev => ({
                ...prev,
                street: data.street || prev.street,
                neighborhood: data.neighborhood || prev.neighborhood,
                city: data.city || prev.city,
                state: data.state || prev.state,
                zip: data.zip || prev.zip,
              }))
            } else if (data && data.erro) {
              setCepError('CEP não encontrado')
            }
          })
          .catch(() => { /* silently fail */ })
          .finally(() => setCepLoading(false))
      } catch {
        setCepLoading(false)
      }
    }
  }

  // Address form state
  const [address, setAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'Dom Eliseu',
    state: 'PA',
    zip: '',
    reference: '',
  })

  const groups = getCartGroupedByStore()
  const subtotal = getCartTotal()

  // Calculate real delivery fee: if there are store groups, use fixed R$5 per group (since we don't have per-store fee from Zustand)
  // In a real scenario, store data would carry deliveryFee/freeDeliveryAbove
  const deliveryFees = deliveryType === 'PICKUP' ? 0 : groups.length * 5.00

  // Calculate discount
  const discount = appliedCoupon === 'ACAI10' ? Math.round(subtotal * 0.10 * 100) / 100 : 0
  const freteDiscount = appliedCoupon === 'FRETE5' ? 5.00 : 0
  const total = Math.max(0, subtotal + deliveryFees - discount - freteDiscount)

  // Map current step to stepLabels index (cart=0, address=1, payment=2, confirmation=3)
  // Since we start at 'address', offset by +1
  const currentStepIndex = stepLabels.findIndex(s => s.id === step)

  const handleApplyCoupon = () => {
    setCouponError('')
    if (!couponCode.trim()) return

    if (couponCode.toUpperCase() === 'ACAI10') {
      setAppliedCoupon(couponCode.toUpperCase())
      toast.success('Cupom ACAI10 aplicado! 10% de desconto')
    } else if (couponCode.toUpperCase() === 'FRETE5') {
      setAppliedCoupon(couponCode.toUpperCase())
      toast.success('Cupom FRETE5 aplicado! R$5 de desconto no frete')
    } else {
      setCouponError('Cupom inválido')
      toast.error('Cupom inválido. Tente ACAI10 ou FRETE5')
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    toast.success('Cupom removido')
  }

  const handlePlaceOrder = async () => {
    if (!termsAccepted) return
    if (groups.length === 0) {
      toast.error('Seu carrinho está vazio')
      return
    }

    setIsProcessing(true)
    setPixQrCode(null)
    setPixQrCodeText(null)

    try {
      const primaryGroup = groups[0]
      const orderItems = primaryGroup.items.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.images ? JSON.parse(item.product.images)[0] : null,
        price: item.product.price,
        quantity: item.quantity,
      }))

      const deliveryAddressStr = deliveryType === 'DELIVERY'
        ? `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''}, ${address.neighborhood}, ${address.city} - ${address.state}${address.zip ? ` (${address.zip})` : ''}${address.reference ? ` [${address.reference}]` : ''}`
        : null

      const requestBody: {
        storeId: string
        items: Array<{
          productId: string
          productName?: string
          productImage?: string | null
          price: number
          quantity: number
        }>
        deliveryType: string
        deliveryAddress: string | null
        paymentMethod: string
        notes: string
        discount: number
        accountId?: string
      } = {
        storeId: primaryGroup.storeId,
        items: orderItems,
        deliveryType,
        deliveryAddress: deliveryAddressStr,
        paymentMethod: payment,
        notes: '',
        discount: discount + freteDiscount,
      }

      if (currentUser?.id) {
        requestBody.accountId = currentUser.id
      }

      // If payment is PIX, try to get QR code from Mercado Pago
      if (payment === 'PIX') {
        try {
          const paymentRes = await fetch('/api/payments/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: orderItems.map(i => ({
                title: i.productName,
                quantity: i.quantity,
                unit_price: i.price,
              })),
              payment_method: 'pix',
            }),
          })
          if (paymentRes.ok) {
            const paymentData = await paymentRes.json()
            if (paymentData.qrCode) setPixQrCode(paymentData.qrCode)
            if (paymentData.qrCodeText) setPixQrCodeText(paymentData.qrCodeText)
          }
        } catch {
          // Payment API unavailable, continue with normal order
        }
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.error || 'Erro ao criar pedido. Tente novamente.'
        toast.error(errorMsg)
        setIsProcessing(false)
        return
      }

      if (data.success && data.order) {
        setCreatedOrder(data.order)
        clearCart()
        setStep('confirmation')
        toast.success('Pedido criado com sucesso!')
      } else {
        toast.error('Erro inesperado ao criar pedido')
        setIsProcessing(false)
      }
    } catch {
      toast.error('Erro de conexão. Verifique sua internet e tente novamente.')
      setIsProcessing(false)
    }
  }

  const copyPixCode = () => {
    if (pixQrCodeText) {
      navigator.clipboard.writeText(pixQrCodeText)
      toast.success('Código Pix copiado!')
    }
  }

  const handleViewOrder = () => {
    if (createdOrder) {
      selectOrder({
        id: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
        storeId: createdOrder.storeId,
        storeName: createdOrder.storeName,
        status: createdOrder.status,
        subtotal: createdOrder.subtotal,
        deliveryFee: createdOrder.deliveryFee,
        discount: createdOrder.discount,
        total: createdOrder.total,
        paymentMethod: createdOrder.paymentMethod,
        deliveryType: createdOrder.deliveryType,
        createdAt: createdOrder.createdAt,
        items: createdOrder.items,
      })
      navigate('order-detail')
    } else {
      navigate('orders')
    }
  }

  const canProceed = () => {
    if (step === 'address') {
      if (deliveryType === 'PICKUP') return true
      return address.street && address.number && address.neighborhood
    }
    if (step === 'payment') {
      return true
    }
    return true
  }

  if (step === 'confirmation') {
    // Derive estimated delivery text for OrderSuccess countdown timer
    const estimatedDelivery =
      deliveryType === 'PICKUP'
        ? '15-30 min'
        : deliveryTime === 'today-30'
          ? '30-45 min'
          : deliveryTime === 'today-60'
            ? '60-90 min'
            : deliveryTime === 'tomorrow'
              ? '1 dia'
              : '2 dias'

    return (
      <OrderSuccess
        orderNumber={createdOrder?.orderNumber || 'DP---'}
        items={createdOrder?.items?.map(i => ({
          productName: i.productName,
          quantity: i.quantity,
          price: i.price,
          total: i.total,
        })) || []}
        subtotal={createdOrder?.subtotal || 0}
        deliveryFee={createdOrder?.deliveryFee || 0}
        discount={createdOrder?.discount || 0}
        total={createdOrder?.total || 0}
        paymentMethod={createdOrder?.paymentMethod || payment}
        deliveryType={createdOrder?.deliveryType || deliveryType}
        estimatedDelivery={estimatedDelivery}
      />
    )
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      {/* Header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-strong border-b border-border/50 -mx-4 px-4 -mt-4 pt-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack} className="h-10 w-10 min-h-[44px] min-w-[44px]">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
              className="text-lg font-bold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent r32-checkout-shimmer"
            >Finalizar Pedido</motion.h1>

            {/* Step indicator — 4-step animated progress: Carrinho → Endereço → Pagamento → Confirmação */}
            <div className="progress-steps mt-2.5">
              {stepLabels.map((s, i) => {
                const isCompleted = i < currentStepIndex
                const isCurrent = i === currentStepIndex
                return (
                  <div key={s.id} className="flex items-center flex-1">
                    <div className="step">
                      <motion.div
                        animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.5, type: 'spring' as const, stiffness: 300, damping: 20 }}
                        className={`step-dot ${isCompleted ? 'completed r40-step-glow-ring r39-step-check-wiggle' : ''} ${isCurrent ? 'current' : ''} ${isCurrent ? 'r32-step-glow r33-checkout-step-pulse r40-step-glow-ring r42-step-icon-glow-ring r58-checkout-step-glow' : ''}`}
                      >
                        {isCompleted ? (
                          <motion.div
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </motion.div>
                        ) : (
                          <span className="text-sm">{s.icon}</span>
                        )}
                      </motion.div>
                      <span className={`text-[10px] font-medium mt-1 hidden sm:block transition-colors duration-300 ${isCurrent ? 'text-foreground font-semibold' : isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                        {s.title}
                      </span>
                    </div>
                    {i < stepLabels.length - 1 && (
                      <div className="step-line">
                        <motion.div
                          className={`step-line-fill ${i < currentStepIndex ? 'filled r33-checkout-progress-line r40-progress-line-gradient r42-step-gradient-connector' : ''}`}
                          layout
                          transition={{ duration: 0.6, ease: 'easeInOut' }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 'address' && (
            <motion.div key="address" initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }} transition={{ duration: 0.35 }}>
              <div className="reveal-up" style={{ animationDelay: '0.1s' }}>
              <div className="mb-6">
                <motion.h3
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                  className="font-semibold mb-3 bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent r62-heading-gradient"
                >Tipo de entrega</motion.h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setDeliveryType('DELIVERY')}
                    className={`r62-card-lift r100-checkout-step p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      deliveryType === 'DELIVERY'
                        ? 'border-primary bg-primary/5 shadow-[0_2px_12px_rgba(16,185,129,0.12)]'
                        : 'border-border hover:border-primary/30 hover:shadow-sm'
                    }`}
                  >
                    <Truck className={`h-6 w-6 mb-2 transition-colors ${deliveryType === 'DELIVERY' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="font-semibold text-sm">Entrega</p>
                    <p className="text-xs text-muted-foreground">Receba em casa</p>
                    {deliveryType === 'DELIVERY' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3"
                      >
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      </motion.div>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setDeliveryType('PICKUP')}
                    className={`r62-card-lift r100-checkout-step p-4 rounded-xl border-2 text-left transition-all duration-200 relative ${
                      deliveryType === 'PICKUP'
                        ? 'border-primary bg-primary/5 shadow-[0_2px_12px_rgba(16,185,129,0.12)]'
                        : 'border-border hover:border-primary/30 hover:shadow-sm'
                    }`}
                  >
                    <Store className={`h-6 w-6 mb-2 transition-colors ${deliveryType === 'PICKUP' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="font-semibold text-sm">Retirada</p>
                    <p className="text-xs text-muted-foreground">Retire na loja</p>
                    {deliveryType === 'PICKUP' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3"
                      >
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      </motion.div>
                    )}
                  </motion.button>
                </div>
              </div>

              {deliveryType === 'DELIVERY' && (
                <div className="space-y-4">
                  <motion.h3
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                    className="font-semibold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent r62-heading-gradient"
                  >Endereço de entrega</motion.h3>

                  {/* Map placeholder with gradient card and pin icon */}
                  <div className="h-32 rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
                      {/* Grid pattern */}
                      <div className="absolute inset-0 opacity-[0.1]" style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)',
                        backgroundSize: '30px 30px',
                      }} />
                      {/* Roads */}
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20" />
                      <div className="absolute top-0 bottom-0 left-1/3 w-0.5 bg-white/15" />
                      <div className="absolute top-0 bottom-0 right-1/4 w-0.5 bg-white/10" />
                      {/* Pin animation */}
                      <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center shadow-lg border-2 border-white">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <motion.div
                          className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-500 rotate-45"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.div>
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-amber-400"
                        animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 60, height: 60 }}
                      />
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-white z-10">
                      <p className="text-[10px] font-medium">Dom Eliseu, PA</p>
                    </div>
                  </div>

                  <Card className="r42-address-card-glass">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">Adicionar endereço</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <Label className="text-xs text-muted-foreground">Rua / Avenida *</Label>
                          <Input
                            placeholder="Ex: Rua Principal"
                            value={address.street}
                            onChange={(e) => setAddress({...address, street: e.target.value})}
                            className="mt-1 min-h-12"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Número *</Label>
                          <Input
                            placeholder="Ex: 123"
                            value={address.number}
                            onChange={(e) => setAddress({...address, number: e.target.value})}
                            className="mt-1 min-h-12"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Complemento</Label>
                          <Input
                            placeholder="Ex: Apt 4B"
                            value={address.complement}
                            onChange={(e) => setAddress({...address, complement: e.target.value})}
                            className="mt-1 min-h-12"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Bairro *</Label>
                          <Input
                            placeholder="Ex: Centro"
                            value={address.neighborhood}
                            onChange={(e) => setAddress({...address, neighborhood: e.target.value})}
                            className="mt-1 min-h-12"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">CEP</Label>
                          <div className="relative mt-1">
                            <Input
                              placeholder="Ex: 68555-000"
                              value={address.zip}
                              onChange={(e) => handleCepChange(e.target.value)}
                              className={`pr-9 ${cepLoading ? 'opacity-70' : ''}`}
                              maxLength={9}
                              disabled={cepLoading}
                            />
                            {cepLoading && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              </div>
                            )}
                            {!cepLoading && address.zip.replace(/\D/g, '').length >= 8 && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Search className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          {cepError && <p className="text-[10px] text-amber-600 mt-0.5">{cepError}</p>}
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Cidade</Label>
                          <Input
                            value={address.city}
                            onChange={(e) => setAddress({...address, city: e.target.value})}
                            className="mt-1 min-h-12"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Estado</Label>
                          <Input
                            value={address.state}
                            onChange={(e) => setAddress({...address, state: e.target.value})}
                            className="mt-1 min-h-12"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-xs text-muted-foreground">Referência</Label>
                          <Input
                            placeholder="Ex: Próximo ao mercado"
                            value={address.reference}
                            onChange={(e) => setAddress({...address, reference: e.target.value})}
                            className="mt-1 min-h-12"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Button
                className="w-full h-12 mt-6 bg-gradient-to-r from-primary to-emerald-600 text-primary-foreground font-semibold btn-shine btn-glow ripple-effect reveal-up rounded-xl r42-cta-shimmer-checkout"
                style={{ animationDelay: '0.3s' }}
                onClick={() => setStep('payment')}
                disabled={!canProceed()}
              >
                Continuar para pagamento
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
              </div>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }} transition={{ duration: 0.35 }}>
              <div className="reveal-up" style={{ animationDelay: '0.1s' }}>
              {/* Delivery time selector */}
              {deliveryType === 'DELIVERY' && (
                <div className="mb-6">
                  <motion.h3
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                    className="font-semibold mb-3 flex items-center gap-1.5 bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent r62-heading-gradient"
                  >
                    <Clock className="h-4 w-4 text-primary" />
                    Horário da entrega
                  </motion.h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {deliveryTimeOptions.map((option) => {
                      const OptionIcon = option.icon
                      return (
                        <motion.button
                          key={option.id}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setDeliveryTime(option.id)}
                          className={`p-3 rounded-xl border-2 text-left transition-all duration-200 relative ${
                            deliveryTime === option.id
                              ? 'border-primary bg-primary/5 shadow-[0_2px_12px_rgba(16,185,129,0.12)]'
                              : 'border-border hover:border-primary/30 hover:shadow-sm'
                          }`}
                        >
                          <OptionIcon className={`h-5 w-5 mb-1.5 transition-colors ${deliveryTime === option.id ? 'text-primary' : 'text-muted-foreground'}`} />
                          <p className="font-semibold text-xs">{option.label}</p>
                          <p className="text-[10px] text-muted-foreground">{option.desc}</p>
                          {deliveryTime === option.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring' as const, stiffness: 500, damping: 25 }}
                              className="absolute top-2 right-2"
                            >
                              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </div>
                            </motion.div>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Delivery Slot Picker — detailed time slots with capacity and weather */}
              {deliveryType === 'DELIVERY' && (
                <div className="mb-6">
                  <DeliverySlotPicker
                    selectedSlot={selectedDeliverySlot}
                    onSlotSelect={setSelectedDeliverySlot}
                    storeName={groups[0]?.storeName || 'DomPlace'}
                    storeDeliveryFee={5.0}
                  />
                </div>
              )}

              <motion.h3
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                className="font-semibold mb-4 flex items-center gap-1.5 bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent r62-heading-gradient"
              >
                <CreditCard className="h-4 w-4 text-primary" />
                Forma de pagamento
              </motion.h3>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <motion.button
                    key={method.id}
                    whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(16,185,129,0.2)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPayment(method.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-300 relative glass-border checkout-payment-card r40-payment-card-shimmer r42-payment-card-hover r42-payment-card-shimmer r39-payment-glow r58-checkout-payment-glow min-h-[56px] r62-card-lift r100-checkout-step ${
                      payment === method.id
                        ? 'border-primary bg-primary/5 r39-payment-glow-active'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${payment === method.id ? 'bg-primary/10 scale-110' : 'bg-muted'}`}>
                      <method.icon className={`h-5 w-5 transition-all duration-300 ${payment === method.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <p className="font-semibold text-sm">{method.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{method.desc}</p>
                    {payment === method.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' as const, stiffness: 500, damping: 25 }}
                        className="absolute top-2 right-2"
                      >
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center r33-checkout-checkmark-anim r40-payment-checkmark-pop">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Detailed Payment Methods — card fields, Pix code, cash change, boleto */}
              <div className="mt-4">
                <PaymentMethods orderTotal={total} onPaymentSelect={(method) => setPayment(method)} />
              </div>

              {/* Payment Tracker — PIX status / Card / Cash */}
              <div className="mt-4">
                <PaymentTracker amount={total} onStatusChange={(status) => {
                  if (status === 'confirmado') {
                    toast.success('Pagamento confirmado via PIX!')
                  }
                }} />
              </div>

              {/* Split Payment Selector */}
              <div className="mt-4">
                <SplitPaymentSelector orderTotal={total} />
              </div>

              {/* Coupon input */}
              <div className="mt-6">
                <motion.h3
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                  className="font-semibold mb-3 flex items-center gap-1.5 bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent r62-heading-gradient"
                >
                  <Tag className="h-4 w-4 text-primary" />
                  Cupom de desconto
                </motion.h3>
                {appliedCoupon ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="r40-coupon-gradient-border">
                      <CardContent className="p-3 flex items-center justify-between r40-coupon-success">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Tag className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{appliedCoupon}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {appliedCoupon === 'ACAI10' ? '10% de desconto aplicado' : 'R$5 de desconto no frete'}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 min-h-[44px] min-w-[44px] text-xs text-destructive active:scale-95 transition-transform" onClick={handleRemoveCoupon}>
                          <X className="h-3 w-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Digite o código do cupom"
                        value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value); setCouponError('') }}
                        className={couponError ? 'border-destructive' : ''}
                      />
                      {couponError && <p className="text-[10px] text-destructive mt-1">{couponError}</p>}
                    </div>
                    <Button variant="outline" className="h-10 min-h-[44px] active:scale-95 transition-transform" onClick={handleApplyCoupon} disabled={!couponCode.trim()}>
                      Aplicar
                    </Button>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground mt-2">Experimente: ACAI10 ou FRETE5</p>
              </div>

              {/* Order summary card with animated items */}
              <Card className="mt-6 gradient-border-animated bg-card rounded-xl overflow-hidden r40-address-glass r39-checkout-conic-border">
                <CardContent className="p-4">
                  <motion.h4
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                    className="font-semibold text-sm mb-3 flex items-center gap-1.5 bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent"
                  ><Shield className="h-3.5 w-3.5 text-primary" />Resumo do pedido</motion.h4>
                  {/* Animated item-by-item list */}
                  <div className="space-y-2 mb-3">
                    {groups.flatMap(g => g.items).map((item, idx) => (
                      <motion.div
                        key={`${item.productId}-${idx}`}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.4, type: 'spring' as const, stiffness: 200, damping: 25 }}
                        className="flex items-center justify-between text-sm r39-summary-stagger"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs bg-primary/10 text-primary font-medium h-5 w-5 rounded flex items-center justify-center shrink-0">{item.quantity}x</span>
                          <span className="text-muted-foreground truncate text-xs">{item.product.name}</span>
                        </div>
                        <span className="font-medium text-xs shrink-0 ml-2">{formatBRL(item.product.price * item.quantity)}</span>
                      </motion.div>
                    ))}
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm mt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal (<span className="r58-checkout-badge-pulse">{getCartItemCount()}</span> itens)</span>
                      <span>{formatBRL(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entrega</span>
                      <span>{deliveryFees === 0 ? 'Grátis' : formatBRL(deliveryFees)}</span>
                    </div>
                    {appliedCoupon === 'ACAI10' && (
                      <div className="flex justify-between text-emerald-600">
                        <span className="flex items-center gap-1 r40-savings-glow">
                          <Tag className="h-3 w-3" />
                          Desconto (10%)
                        </span>
                        <span>-{formatBRL(discount)}</span>
                      </div>
                    )}
                    {appliedCoupon === 'FRETE5' && (
                      <div className="flex justify-between text-emerald-600">
                        <span className="flex items-center gap-1 r40-savings-glow">
                          <Tag className="h-3 w-3" />
                          Desconto no frete
                        </span>
                        <span>-R$5,00</span>
                      </div>
                    )}
                    <Separator />

                    {/* Tax Breakdown — Resumo Fiscal */}
                    <div className="mt-2">
                      <TaxBreakdown subtotal={subtotal} />
                    </div>

                    {/* Delivery Scheduler — Agendamento de Entrega */}
                    <div className="mt-4">
                      <DeliveryScheduler />
                    </div>

                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="r33-checkout-price-shimmer r40-total-gradient-text inline-block">
                      <motion.span
                        key={total}
                        initial={{ scale: 1.15, color: 'rgb(16, 185, 129)' }}
                        animate={{ scale: 1, color: 'rgb(16, 185, 129)' }}
                        transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                        className="text-primary"
                      >
                        {formatBRL(total)}
                      </motion.span>
                    </span>
                    </div>
                  </div>

                  {/* Store breakdown */}
                  {groups.map(group => (
                    <div key={group.storeId} className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground font-medium">{group.storeName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {group.items.map(i => i.product.name).join(', ')}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tip Selector — driver tip with preset and custom amounts */}
              <div className="mt-6">
                <TipSelector />
              </div>

              {/* Confidence badges — enhanced with hover and pulse */}
              <div className="flex items-center justify-center gap-4 mt-4 py-2">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: [0, -3, 0] }}
                  transition={{ delay: 0.6, duration: 3, repeat: Infinity }}
                  whileHover={{ scale: 1.08, y: -2 }}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-default r40-confidence-badge r39-confidence-scale r42-confidence-badge-hover"
                >
                  <span className="text-emerald-500 r40-confidence-icon-wiggle r39-confidence-icon-glow" style={{ '--r40-badge-delay': '0s' } as React.CSSProperties}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  Seguro
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: [0, -3, 0] }}
                  transition={{ delay: 0.7, duration: 3, repeat: Infinity }}
                  whileHover={{ scale: 1.08, y: -2 }}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-default r40-confidence-badge r39-confidence-scale r42-confidence-badge-hover"
                >
                  <motion.span
                    className="text-emerald-500 r40-confidence-icon-wiggle r39-confidence-icon-glow"
                    style={{ '--r40-badge-delay': '0.3s' } as React.CSSProperties}
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                  </motion.span>
                  Garantido
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: [0, -3, 0] }}
                  transition={{ delay: 0.8, duration: 3, repeat: Infinity }}
                  whileHover={{ scale: 1.08, y: -2 }}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-default r40-confidence-badge r39-confidence-scale r42-confidence-badge-hover"
                >
                  <span className="text-primary r40-confidence-icon-wiggle r39-confidence-icon-glow" style={{ '--r40-badge-delay': '0.6s' } as React.CSSProperties}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/><path d="m12 15 5 6H7Z"/></svg>
                  </span>
                  Frete grátis acima de R$50
                </motion.div>
              </div>

              {/* Terms */}
              <div className="mt-4 flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  Concordo com os <button className="text-primary underline">Termos de Uso</button> e a{' '}
                  <button className="text-primary underline">Política de Privacidade</button> do DomPlace.
                  Entendo que o pedido será processado após a confirmação do pagamento.
                </Label>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1 h-12" onClick={() => setStep('address')}>
                  Voltar
                </Button>
                <motion.div className="r40-confirm-btn-wrapper">
                  <Button
                    className="flex-1 h-12 bg-gradient-to-r from-primary via-emerald-600 to-primary text-primary-foreground font-semibold btn-shine btn-glow ripple-effect rounded-xl checkout-btn-shimmer r32-confirm-shine r40-confirm-btn-glow r39-confirm-shimmer relative overflow-hidden r58-checkout-btn-sweep"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || !termsAccepted}
                  >
                    <span className="r33-checkout-btn-shimmer"></span>
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processando...
                      </div>
                    ) : (
                      <>
                        Confirmar Pedido
                        <Check className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom summary bar for mobile */}
      {(step as string) !== 'confirmation' && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-strong border-t px-4 py-3" style={{ borderTop: '1px solid rgba(16,185,129,0.2)', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground r32-total-pop">Total</p>
              <p className="text-lg font-bold text-primary r32-total-pop r42-total-animate">{formatBRL(total)}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="h-3 w-3 text-emerald-500" />
              Compra segura
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
