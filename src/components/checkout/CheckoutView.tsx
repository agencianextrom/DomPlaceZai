'use client'

import { useState } from 'react'
import { ArrowLeft, MapPin, CreditCard, Banknote, QrCode, FileText, Check, Store, Truck, Shield, ChevronRight, Clock, Calendar, Tag, X } from 'lucide-react'
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

const paymentMethods = [
  { id: 'pix', label: 'Pix', icon: QrCode, desc: 'Pagamento instantâneo', color: 'bg-teal-50 dark:bg-teal-900/10 border-teal-200 dark:border-teal-800/30' },
  { id: 'credit', label: 'Cartão de Crédito', icon: CreditCard, desc: 'Em até 3x sem juros', color: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30' },
  { id: 'boleto', label: 'Boleto', icon: FileText, desc: 'Prazo de 1-2 dias', color: 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800/30' },
  { id: 'cash', label: 'Dinheiro', icon: Banknote, desc: 'Pagamento na entrega', color: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30' },
]

const deliveryTimeOptions = [
  { id: 'today-30', label: 'Hoje', desc: '30-45 min', icon: Clock },
  { id: 'today-60', label: 'Hoje', desc: '60-90 min', icon: Clock },
  { id: 'tomorrow', label: 'Amanhã', desc: '09:00 - 18:00', icon: Calendar },
  { id: 'schedule', label: 'Agendar', desc: 'Escolher data e hora', icon: Calendar },
]

type CheckoutStep = 'address' | 'payment' | 'confirmation'

const stepLabels = [
  { id: 'address' as CheckoutStep, num: 1, title: 'Endereço' },
  { id: 'payment' as CheckoutStep, num: 2, title: 'Pagamento' },
  { id: 'confirmation' as CheckoutStep, num: 3, title: 'Confirmação' },
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
              rotate: 0 
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
              ease: 'easeOut' 
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
  const { goBack, navigate, getCartGroupedByStore, getCartTotal, getCartItemCount, clearCart } = useAppStore()
  const [step, setStep] = useState<CheckoutStep>('address')
  const [payment, setPayment] = useState('pix')
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery')
  const [deliveryTime, setDeliveryTime] = useState('today-30')
  const [isProcessing, setIsProcessing] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [couponError, setCouponError] = useState('')

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
  const deliveryFees = deliveryType === 'pickup' ? 0 : groups.length * 5.00

  // Calculate discount
  const discount = appliedCoupon === 'ACAI10' ? Math.round(subtotal * 0.10 * 100) / 100 : 0
  const total = subtotal + deliveryFees - discount

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
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsProcessing(false)
    setStep('confirmation')
    clearCart()
  }

  const canProceed = () => {
    if (step === 'address') {
      return address.street && address.number && address.neighborhood
    }
    if (step === 'payment') {
      return true
    }
    return true
  }
  
  if (step === 'confirmation') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-24">
        <div className="relative">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-28 h-28 rounded-full bg-gradient-to-br from-primary via-emerald-500 to-teal-500 flex items-center justify-center mb-6 shadow-neon-emerald relative z-10 ripple-wave"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              <Check className="h-12 w-12 text-white" />
            </motion.div>
          </motion.div>
          {/* Confetti burst around the checkmark */}
          <ConfettiBurst />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-2xl font-bold mb-2 text-shadow-sm"
          >
            Pedido Confirmado!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-muted-foreground mb-1"
          >
            Seu pedido #DP{Date.now().toString().slice(-6)} foi realizado com sucesso.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-muted-foreground mb-8"
          >
            Você receberá atualizações sobre o status do seu pedido.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex gap-3 justify-center"
          >
            <Button variant="outline" onClick={() => navigate('orders')} className="h-11">
              Ver Pedidos
            </Button>
            <Button onClick={() => navigate('home')} className="bg-primary text-primary-foreground h-11 btn-glow">
              Continuar Comprando
            </Button>
          </motion.div>
        </motion.div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen pb-28 md:pb-4">
      {/* Header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-strong border-b border-border/50 -mx-4 px-4 -mt-4 pt-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-shadow-sm">Finalizar Pedido</h1>
            
            {/* Step indicator using progress-steps CSS */}
            <div className="progress-steps mt-2.5">
              {stepLabels.map((s, i) => {
                const isCompleted = i < currentStepIndex
                const isCurrent = i === currentStepIndex
                return (
                  <div key={s.id} className="flex items-center flex-1">
                    <div className="step">
                      <motion.div
                        animate={isCurrent ? { scale: [1, 1.12, 1] } : {}}
                        transition={{ duration: 0.4, type: 'spring', stiffness: 400, damping: 20 }}
                        className={`step-dot ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                      >
                        {isCompleted ? <Check className="h-3.5 w-3.5" /> : s.num}
                      </motion.div>
                      <span className={`text-[10px] font-medium mt-1 hidden sm:block transition-colors duration-300 ${isCurrent ? 'text-foreground font-semibold' : isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                        {s.title}
                      </span>
                    </div>
                    {i < stepLabels.length - 1 && (
                      <div className="step-line">
                        <div className={`step-line-fill ${i < currentStepIndex ? 'filled' : ''}`} />
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
                <h3 className="font-semibold mb-3">Tipo de entrega</h3>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setDeliveryType('delivery')}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      deliveryType === 'delivery' 
                        ? 'border-primary bg-primary/5 shadow-[0_2px_12px_oklch(0.45_0.1_155/0.12)]' 
                        : 'border-border hover:border-primary/30 hover:shadow-sm'
                    }`}
                  >
                    <Truck className={`h-6 w-6 mb-2 transition-colors ${deliveryType === 'delivery' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="font-semibold text-sm">Entrega</p>
                    <p className="text-xs text-muted-foreground">Receba em casa</p>
                    {deliveryType === 'delivery' && (
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
                    onClick={() => setDeliveryType('pickup')}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 relative ${
                      deliveryType === 'pickup' 
                        ? 'border-primary bg-primary/5 shadow-[0_2px_12px_oklch(0.45_0.1_155/0.12)]' 
                        : 'border-border hover:border-primary/30 hover:shadow-sm'
                    }`}
                  >
                    <Store className={`h-6 w-6 mb-2 transition-colors ${deliveryType === 'pickup' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="font-semibold text-sm">Retirada</p>
                    <p className="text-xs text-muted-foreground">Retire na loja</p>
                    {deliveryType === 'pickup' && (
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
              
              {deliveryType === 'delivery' && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Endereço de entrega</h3>

                  {/* Map placeholder */}
                  <div className="h-32 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.1]" style={{
                      backgroundImage: 'linear-gradient(rgba(0,0,0,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.2) 1px, transparent 1px)',
                      backgroundSize: '30px 30px',
                    }} />
                    <div className="text-center relative z-10">
                      <MapPin className="h-8 w-8 text-primary mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Localização no mapa</p>
                    </div>
                  </div>

                  <Card>
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
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Número *</Label>
                          <Input 
                            placeholder="Ex: 123" 
                            value={address.number}
                            onChange={(e) => setAddress({...address, number: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Complemento</Label>
                          <Input 
                            placeholder="Ex: Apt 4B" 
                            value={address.complement}
                            onChange={(e) => setAddress({...address, complement: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Bairro *</Label>
                          <Input 
                            placeholder="Ex: Centro" 
                            value={address.neighborhood}
                            onChange={(e) => setAddress({...address, neighborhood: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">CEP</Label>
                          <Input 
                            placeholder="Ex: 68555-000" 
                            value={address.zip}
                            onChange={(e) => setAddress({...address, zip: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Cidade</Label>
                          <Input 
                            value={address.city}
                            onChange={(e) => setAddress({...address, city: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Estado</Label>
                          <Input 
                            value={address.state}
                            onChange={(e) => setAddress({...address, state: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-xs text-muted-foreground">Referência</Label>
                          <Input 
                            placeholder="Ex: Próximo ao mercado" 
                            value={address.reference}
                            onChange={(e) => setAddress({...address, reference: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              <Button 
                className="w-full h-12 mt-6 bg-gradient-to-r from-primary to-emerald-600 text-primary-foreground font-semibold btn-shine btn-glow ripple-effect reveal-up" 
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
              {deliveryType === 'delivery' && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    Horário da entrega
                  </h3>
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
                              ? 'border-primary bg-primary/5 shadow-[0_2px_12px_oklch(0.45_0.1_155/0.12)]' 
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
                              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
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

              <h3 className="font-semibold mb-4 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-primary" />
                Forma de pagamento
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <motion.button
                    key={method.id}
                    whileHover={{ y: -2, boxShadow: '0 4px 16px oklch(0.45 0.1 155 / 0.08)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPayment(method.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 relative glass-border ${
                      payment === method.id 
                        ? 'border-primary bg-primary/5 shadow-[0_2px_16px_oklch(0.45_0.1_155/0.1)]' 
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 transition-colors duration-200 ${payment === method.id ? 'bg-primary/10' : 'bg-muted'}`}>
                      <method.icon className={`h-5 w-5 transition-colors duration-200 ${payment === method.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <p className="font-semibold text-sm">{method.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{method.desc}</p>
                    {payment === method.id && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className="absolute top-2 right-2"
                      >
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Coupon input */}
              <div className="mt-6">
                <h3 className="font-semibold mb-3 flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-primary" />
                  Cupom de desconto
                </h3>
                {appliedCoupon ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="p-3 flex items-center justify-between">
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
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive" onClick={handleRemoveCoupon}>
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
                    <Button variant="outline" className="h-10" onClick={handleApplyCoupon} disabled={!couponCode.trim()}>
                      Aplicar
                    </Button>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground mt-2">Experimente: ACAI10 ou FRETE5</p>
              </div>
              
              {/* Order summary card */}
              <Card className="mt-6 gradient-border-animated bg-card rounded-xl overflow-hidden">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" />Resumo do pedido</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal ({getCartItemCount()} itens)</span>
                      <span>{formatBRL(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entrega</span>
                      <span>{deliveryFees === 0 ? 'Grátis' : formatBRL(deliveryFees)}</span>
                    </div>
                    {appliedCoupon === 'ACAI10' && (
                      <div className="flex justify-between text-emerald-600">
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          Desconto (10%)
                        </span>
                        <span>-{formatBRL(discount)}</span>
                      </div>
                    )}
                    {appliedCoupon === 'FRETE5' && (
                      <div className="flex justify-between text-emerald-600">
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          Desconto no frete
                        </span>
                        <span>-R$5,00</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">{formatBRL(total)}</span>
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
                <Button 
                  className="flex-1 h-12 bg-gradient-to-r from-primary via-emerald-600 to-primary text-primary-foreground font-semibold btn-shine btn-glow ripple-effect"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || !termsAccepted}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Processando...
                    </div>
                  ) : (
                    <>
                      Confirmar Pedido
                      <Check className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom summary bar for mobile */}
      {step !== 'confirmation' && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-strong border-t px-4 py-3" style={{ borderTop: '1px solid transparent', backgroundImage: 'linear-gradient(90deg, transparent, oklch(0.45 0.1 155 / 0.3), oklch(0.78 0.16 70 / 0.3), transparent)', backgroundOrigin: 'top', backgroundRepeat: 'no-repeat', backgroundSize: '100% 1px' }}>
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold text-primary">{formatBRL(total)}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="h-3 w-3 text-emerald-500" />
              Compra segura
            </div>
          </div>
          <div className="h-[env(safe-area-inset-bottom)] md:hidden" />
        </div>
      )}
    </div>
  )
}
