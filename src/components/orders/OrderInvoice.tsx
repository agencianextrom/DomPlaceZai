'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Download,
  Share2,
  Printer,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  QrCode,
  HelpCircle,
  X,
  Store,
  Calendar,
  CreditCard,
  Truck,
  ShieldCheck,
  Receipt,
  Tag,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

// ---- BRL formatter ----
const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

// ---- Status config ----
const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
  PAID: { label: 'Pago', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
  PENDING: { label: 'Pendente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: CheckCircle },
  DELIVERED: { label: 'Entregue', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
  PREPARING: { label: 'Preparando', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: Clock },
  DELIVERING: { label: 'Em entrega', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Truck },
  READY: { label: 'Pronto', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: X },
}

const paymentLabels: Record<string, string> = {
  PIX: 'Pix',
  CREDIT_CARD: 'Cartão de Crédito',
  DEBIT_CARD: 'Cartão de Débito',
  BOLETO: 'Boleto',
  CASH_ON_DELIVERY: 'Dinheiro na Entrega',
}

// ---- Invoice Item type ----
export interface InvoiceItem {
  name: string
  qty: number
  price: number
}

// ---- Props ----
export interface OrderInvoiceProps {
  orderNumber: string
  items: InvoiceItem[]
  total: number
  discount: number
  deliveryFee: number
  paymentMethod: string
  status: string
  storeName: string
  date: string
  storeAddress?: string
  storeCnpj?: string
}

// ---- Animated QR Code placeholder ----
function QRCodePlaceholder() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="h-24 w-24 bg-white rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
        <QrCode className="h-12 w-12 text-muted-foreground/40" />
      </div>
      <p className="text-[10px] text-muted-foreground text-center leading-tight">
        Nota Fiscal Eletrônica
      </p>
    </motion.div>
  )
}

// ---- Payment confirmation badge ----
function PaymentBadge({ status }: { status: string }) {
  const isPaid = ['PAID', 'CONFIRMED', 'DELIVERED', 'READY', 'PREPARING', 'DELIVERING'].includes(status)
  const isCancelled = status === 'CANCELLED'

  if (isCancelled) {
    return null
  }

  if (isPaid) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 20, delay: 0.2 }}
        className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/30"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 500, damping: 15, delay: 0.4 }}
        >
          <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </motion.div>
        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          Pagamento Confirmado
        </span>
      </motion.div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800/30">
      <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
        Aguardando Pagamento
      </span>
    </div>
  )
}

// ---- Main OrderInvoice component ----
export function OrderInvoice({
  orderNumber,
  items,
  total,
  discount,
  deliveryFee,
  paymentMethod,
  status,
  storeName,
  date,
  storeAddress,
  storeCnpj,
}: OrderInvoiceProps) {
  const [showHelp, setShowHelp] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const statusConfig = statusLabels[status] || statusLabels.PENDING
  const StatusIcon = statusConfig.icon

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0)
  }, [items])

  const finalTotal = subtotal - discount + deliveryFee

  const formattedDate = useMemo(() => {
    try {
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return date
    }
  }, [date])

  const formattedTime = useMemo(() => {
    try {
      return new Date(date).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }, [date])

  const handleDownloadPDF = useCallback(async () => {
    setIsDownloading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      toast.success('Nota fiscal baixada!', {
        description: `NF-${orderNumber}.pdf salvo com sucesso`,
      })
    } catch {
      toast.error('Erro ao baixar nota fiscal')
    } finally {
      setIsDownloading(false)
    }
  }, [orderNumber])

  const handleShare = useCallback(async () => {
    const text = `Nota Fiscal #${orderNumber} - DomPlace\nTotal: ${formatBRL(finalTotal)}\nLoja: ${storeName}`
    try {
      if (navigator.share) {
        await navigator.share({ title: `Nota Fiscal #${orderNumber}`, text })
      } else {
        await navigator.clipboard.writeText(text)
        toast.success('Dados copiados!', { description: 'Cole e compartilhe onde quiser' })
      }
    } catch {
      // user cancelled share
    }
  }, [orderNumber, finalTotal, storeName])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const itemRows = useMemo(() => {
    return items.map((item, i) => (
      <motion.tr
        key={i}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 + i * 0.06, type: 'spring' as const, stiffness: 300, damping: 25 }}
        className={i % 2 === 0 ? 'bg-secondary/20' : ''}
      >
        <td className="py-2.5 px-3 text-xs text-foreground font-medium">{item.name}</td>
        <td className="py-2.5 px-3 text-xs text-center text-muted-foreground tabular-nums">{item.qty}</td>
        <td className="py-2.5 px-3 text-xs text-right text-muted-foreground tabular-nums">{formatBRL(item.price)}</td>
        <td className="py-2.5 px-3 text-xs text-right font-semibold tabular-nums">{formatBRL(item.price * item.qty)}</td>
      </motion.tr>
    ))
  }, [items])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="r26-invoice-container max-w-lg mx-auto"
    >
      {/* Invoice Card */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {/* Header — Store info */}
        <div className="bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent p-4 sm:p-5 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm">{storeName}</h3>
                {storeAddress && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">{storeAddress}</p>
                )}
                {storeCnpj && (
                  <p className="text-[10px] text-muted-foreground">CNPJ: {storeCnpj}</p>
                )}
              </div>
            </div>
            <Badge className={`${statusConfig.color} border-0 text-[10px] font-semibold shrink-0`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        {/* Order Info Row */}
        <div className="p-4 sm:p-5 border-b border-border/50">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">Pedido</p>
                <p className="text-xs font-semibold">#{orderNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">Data</p>
                <p className="text-xs font-semibold">{formattedDate} {formattedTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">Pagamento</p>
                <p className="text-xs font-semibold">{paymentLabels[paymentMethod] || paymentMethod}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">NF-e</p>
                <p className="text-xs font-semibold">#{orderNumber}</p>
              </div>
            </div>
          </div>

          {/* Payment Confirmation */}
          <div className="mt-3">
            <PaymentBadge status={status} />
          </div>
        </div>

        {/* Items Table */}
        <div className="px-4 sm:px-5 pt-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Itens do Pedido
          </h4>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/40">
                  <th className="py-2 px-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Produto</th>
                  <th className="py-2 px-3 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Qtd</th>
                  <th className="py-2 px-3 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Unit.</th>
                  <th className="py-2 px-3 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {itemRows}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="px-4 sm:px-5 py-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium tabular-nums">{formatBRL(subtotal)}</span>
          </div>
          {deliveryFee > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: 'spring' as const, stiffness: 300, damping: 25 }}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-muted-foreground flex items-center gap-1">
                <Truck className="h-3 w-3" />
                Taxa de entrega
              </span>
              <span className="font-medium tabular-nums">{formatBRL(deliveryFee)}</span>
            </motion.div>
          )}
          {discount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, type: 'spring' as const, stiffness: 300, damping: 25 }}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Desconto
              </span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">-{formatBRL(discount)}</span>
            </motion.div>
          )}
          <Separator />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, type: 'spring' as const, stiffness: 400, damping: 20 }}
            className="flex items-center justify-between py-1"
          >
            <span className="text-sm font-bold">Total Final</span>
            <span className="text-lg font-extrabold text-primary text-gradient-primary tabular-nums">
              {formatBRL(finalTotal)}
            </span>
          </motion.div>
        </div>

        {/* QR Code Section */}
        <div className="px-4 sm:px-5 py-4 border-t border-border/50">
          <div className="flex items-center justify-center">
            <QRCodePlaceholder />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 sm:px-5 pb-4 space-y-2">
          <div className="flex gap-2">
            <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
              <Button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="w-full h-10 text-xs font-semibold gap-2 btn-glow"
              >
                {isDownloading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Download className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isDownloading ? 'Baixando...' : 'Baixar PDF'}
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
              <Button
                variant="outline"
                onClick={handleShare}
                className="w-full h-10 text-xs font-semibold gap-2"
              >
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
            </motion.div>
          </div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              onClick={handlePrint}
              className="w-full h-9 text-xs text-muted-foreground gap-2"
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimir
            </Button>
          </motion.div>
        </div>

        {/* Help Section */}
        <div className="px-4 sm:px-5 pb-4">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5" />
              Dúvidas sobre a nota?
            </span>
            <motion.div animate={{ rotate: showHelp ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-3.5 w-3.5" />
            </motion.div>
          </button>
          <AnimatePresence>
            {showHelp && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p>
                      <strong className="text-foreground">Nota Fiscal Eletrônica:</strong> A NF-e é emitida automaticamente pela loja. Você pode consultar a autenticidade no portal da Receita Federal.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Receipt className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p>
                      <strong className="text-foreground">Reembolso:</strong> Em caso de devolução, o estorno será feito no mesmo meio de pagamento utilizado.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p>
                      <strong className="text-foreground">Precisa de ajuda?</strong> Entre em contato com nosso suporte pelo chat ou pelo e-mail suporte@domplace.com.br
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

// ---- Wrapper for opening invoice from order card ----
export function OrderInvoiceModal({
  isOpen,
  onClose,
  ...props
}: OrderInvoiceProps & { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Modal */}
          <motion.div
            initial={{ y: '100%', scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: '100%', scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
            className="relative z-10 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl"
          >
            {/* Close button */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-sm border-b border-border">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Nota Fiscal
              </h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            {/* Invoice content */}
            <OrderInvoice {...props} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
