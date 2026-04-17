'use client'

import { useState } from 'react'
import { ArrowLeft, MapPin, CreditCard, Banknote, QrCode, FileText, Check, Store, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'
import { formatBRL } from '@/components/product/ProductCard'
import { motion, AnimatePresence } from 'framer-motion'

const paymentMethods = [
  { id: 'pix', label: 'Pix', icon: QrCode, desc: 'Pagamento instantâneo' },
  { id: 'credit', label: 'Cartão de Crédito', icon: CreditCard, desc: 'Em até 3x sem juros' },
  { id: 'debit', label: 'Cartão de Débito', icon: CreditCard, desc: 'Débito na entrega' },
  { id: 'boleto', label: 'Boleto', icon: FileText, desc: 'Prazo de 1-2 dias' },
  { id: 'cash', label: 'Dinheiro', icon: Banknote, desc: 'Pagamento na entrega' },
]

type CheckoutStep = 'address' | 'payment' | 'summary' | 'confirmation'

export function CheckoutView() {
  const { goBack, navigate, getCartGroupedByStore, getCartTotal, clearCart } = useAppStore()
  const [step, setStep] = useState<CheckoutStep>('address')
  const [payment, setPayment] = useState('pix')
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const groups = getCartGroupedByStore()
  const subtotal = getCartTotal()
  const deliveryFees = deliveryType === 'pickup' ? 0 : groups.length * 5.00
  const total = subtotal + deliveryFees
  
  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    // Simulate order creation
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsProcessing(false)
    setStep('confirmation')
    clearCart()
  }
  
  if (step === 'confirmation') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-24">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-4"
        >
          <Check className="h-10 w-10 text-primary-foreground" />
        </motion.div>
        <h2 className="text-xl font-bold mb-1">Pedido Confirmado!</h2>
        <p className="text-muted-foreground text-center mb-2">
          Seu pedido #DP{Date.now().toString().slice(-6)} foi realizado com sucesso.
        </p>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Você receberá atualizações sobre o status do seu pedido.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('orders')}>
            Ver Pedidos
          </Button>
          <Button onClick={() => navigate('home')} className="bg-primary text-primary-foreground">
            Continuar Comprando
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border -mx-4 px-4 -mt-4 pt-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Finalizar Pedido</h1>
            {/* Progress steps */}
            <div className="flex items-center gap-1 mt-1">
              {(['address', 'payment', 'summary'] as CheckoutStep[]).map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <div className={`h-1.5 w-1.5 rounded-full ${step === s ? 'bg-primary' : i < ['address', 'payment', 'summary'].indexOf(step) ? 'bg-primary/50' : 'bg-muted'}`} />
                  {i < 2 && <div className={`h-0.5 w-8 ${i < ['address', 'payment', 'summary'].indexOf(step) ? 'bg-primary/50' : 'bg-muted'}`} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 'address' && (
            <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {/* Delivery type */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Tipo de entrega</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDeliveryType('delivery')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${deliveryType === 'delivery' ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    <Truck className="h-6 w-6 mb-2 text-primary" />
                    <p className="font-semibold text-sm">Entrega</p>
                    <p className="text-xs text-muted-foreground">Receba em casa</p>
                  </button>
                  <button
                    onClick={() => setDeliveryType('pickup')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${deliveryType === 'pickup' ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    <Store className="h-6 w-6 mb-2 text-primary" />
                    <p className="font-semibold text-sm">Retirada</p>
                    <p className="text-xs text-muted-foreground">Retire na loja</p>
                  </button>
                </div>
              </div>
              
              {deliveryType === 'delivery' && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Endereço de entrega</h3>
                  <div className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">Adicionar endereço</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input placeholder="Rua" />
                      <Input placeholder="Número" />
                      <Input placeholder="Bairro" />
                      <Input placeholder="Complemento" />
                      <Input placeholder="CEP" className="sm:col-span-2" />
                    </div>
                  </div>
                </div>
              )}
              
              <Button className="w-full h-12 mt-6 bg-primary text-primary-foreground" onClick={() => setStep('payment')}>
                Continuar
              </Button>
            </motion.div>
          )}
          
          {step === 'payment' && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="font-semibold mb-4">Forma de pagamento</h3>
              <RadioGroup value={payment} onValueChange={setPayment} className="space-y-2">
                {paymentMethods.map((method) => (
                  <Label
                    key={method.id}
                    htmlFor={method.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      payment === method.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <RadioGroupItem value={method.id} id={method.id} />
                    <method.icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-sm">{method.label}</p>
                      <p className="text-xs text-muted-foreground">{method.desc}</p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
              
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1 h-12" onClick={() => setStep('address')}>
                  Voltar
                </Button>
                <Button className="flex-1 h-12 bg-primary text-primary-foreground" onClick={() => setStep('summary')}>
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}
          
          {step === 'summary' && (
            <motion.div key="summary" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="font-semibold mb-4">Resumo do pedido</h3>
              
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                {groups.map((group) => (
                  <div key={group.storeId} className="p-4 border-b border-border last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Store className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">{group.storeName}</span>
                    </div>
                    {group.items.map((item) => (
                      <div key={item.productId} className="flex justify-between text-sm py-1">
                        <span className="text-muted-foreground">{item.quantity}x {item.product.name}</span>
                        <span className="font-medium">{formatBRL(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 bg-card rounded-xl border border-border p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatBRL(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entrega ({deliveryType === 'pickup' ? 'Retirada' : `${groups.length} lojas`})</span>
                  <span>{deliveryFees === 0 ? 'Grátis' : formatBRL(deliveryFees)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatBRL(total)}</span>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1 h-12" onClick={() => setStep('payment')}>
                  Voltar
                </Button>
                <Button 
                  className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    `Pagar ${formatBRL(total)}`
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
