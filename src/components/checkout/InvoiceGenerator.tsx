'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  Printer,
  Download,
  Mail,
  Copy,
  FileText,
  CreditCard,
  Building2,
  QrCode,
  Check,
  Clock,
  Eye,
  AlertCircle,
  XCircle,
  PenLine,
  ChevronDown,
  ChevronUp,
  Receipt,
  BarChart3,
  ShieldCheck,
  Calendar,
  User,
  MapPin,
  Hash,
  Tag,
  Percent,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { formatBRL } from '@/lib/format'

// ─── Types ────────────────────────────────────────────────────────────

export type InvoiceStatus = 'paga' | 'pendente' | 'cancelada'

export interface InvoiceItem {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  discount: number
}

export interface InvoiceCustomer {
  name: string
  address: string
  cpf: string
  email: string
  phone: string
}

export interface InvoiceStore {
  name: string
  logo?: string
  address: string
  cnpj: string
  phone: string
  email: string
}

export interface InvoiceTax {
  icms: number
  iss: number
  ipi: number
}

export interface InvoiceTimeline {
  issued: string
  viewed?: string
  paid?: string
  cancelled?: string
}

export interface InvoicePayment {
  method: string
  cardBrand?: string
  lastFour?: string
  installmentCount?: number
}

export interface InvoiceData {
  invoiceNumber: string
  date: string
  dueDate: string
  status: InvoiceStatus
  store: InvoiceStore
  customer: InvoiceCustomer
  items: InvoiceItem[]
  subtotal: number
  tax: InvoiceTax
  discount: number
  shipping: number
  total: number
  payment: InvoicePayment
  timeline: InvoiceTimeline
  notes?: string
}

interface InvoiceGeneratorProps {
  invoice: InvoiceData
  className?: string
}

// ─── Status Configuration ─────────────────────────────────────────────

const STATUS_CONFIG: Record<InvoiceStatus, {
  label: string
  color: string
  bg: string
  borderColor: string
  icon: typeof Check
}> = {
  paga: {
    label: 'PAGA',
    color: '#059669',
    bg: 'rgba(5, 150, 105, 0.08)',
    borderColor: 'rgba(5, 150, 105, 0.25)',
    icon: Check,
  },
  pendente: {
    label: 'PENDENTE',
    color: '#d97706',
    bg: 'rgba(217, 119, 6, 0.08)',
    borderColor: 'rgba(217, 119, 6, 0.25)',
    icon: Clock,
  },
  cancelada: {
    label: 'CANCELADA',
    color: '#dc2626',
    bg: 'rgba(220, 38, 38, 0.08)',
    borderColor: 'rgba(220, 38, 38, 0.25)',
    icon: XCircle,
  },
}

// ─── Card brand SVG icons ───────────────────────────────────────────────

function CardBrandIcon({ brand }: { brand?: string }) {
  if (!brand) return <CreditCard className="h-5 w-5" style={{ color: '#6b7280' }} />

  const lowerBrand = brand.toLowerCase()
  if (lowerBrand === 'visa') {
    return (
      <svg viewBox="0 0 48 32" className="h-5 w-5" fill="none">
        <rect width="48" height="32" rx="4" fill="#1a1f71" />
        <text x="24" y="21" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold" fontFamily="sans-serif">VISA</text>
      </svg>
    )
  }
  if (lowerBrand === 'mastercard') {
    return (
      <svg viewBox="0 0 48 32" className="h-5 w-5" fill="none">
        <rect width="48" height="32" rx="4" fill="#252525" />
        <circle cx="18" cy="16" r="8" fill="#eb001b" opacity="0.8" />
        <circle cx="30" cy="16" r="8" fill="#f79e1b" opacity="0.8" />
        <path d="M24 9.5a8 8 0 0 1 0 13" fill="#ff5f00" opacity="0.8" />
        <path d="M24 22.5a8 8 0 0 1 0-13" fill="#ff5f00" opacity="0.8" />
      </svg>
    )
  }
  if (lowerBrand === 'amex' || lowerBrand === 'american express') {
    return (
      <svg viewBox="0 0 48 32" className="h-5 w-5" fill="none">
        <rect width="48" height="32" rx="4" fill="#006fcf" />
        <text x="24" y="20" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">AMEX</text>
      </svg>
    )
  }
  if (lowerBrand === 'elo') {
    return (
      <svg viewBox="0 0 48 32" className="h-5 w-5" fill="none">
        <rect width="48" height="32" rx="4" fill="#1e1e57" />
        <circle cx="16" cy="16" r="6" fill="#ff6600" opacity="0.7" />
        <circle cx="32" cy="16" r="6" fill="#0066cc" opacity="0.7" />
        <circle cx="24" cy="16" r="6" fill="#cc0066" opacity="0.7" />
      </svg>
    )
  }
  return <CreditCard className="h-5 w-5" style={{ color: '#6b7280' }} />
}

// ─── Tax Pie Chart (SVG) ────────────────────────────────────────────────

function TaxPieChart({ tax, total }: { tax: InvoiceTax; total: number }) {
  const totalTax = tax.icms + tax.iss + tax.ipi
  if (totalTax <= 0) return null

  const segments = [
    { label: 'ICMS', value: tax.icms, color: '#10b981' },
    { label: 'ISS', value: tax.iss, color: '#f59e0b' },
    { label: 'IPI', value: tax.ipi, color: '#06b6d4' },
  ].filter((s) => s.value > 0)

  let cumulativeAngle = -90

  const paths = segments.map((seg) => {
    const fraction = seg.value / totalTax
    const angle = fraction * 360
    const startRad = (cumulativeAngle * Math.PI) / 180
    const endRad = ((cumulativeAngle + angle) * Math.PI) / 180
    const cx = 40
    const cy = 40
    const r = 32

    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)

    const largeArc = angle > 180 ? 1 : 0

    cumulativeAngle += angle

    if (angle >= 360) {
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
    }

    return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`
  })

  return (
    <div className="r44-tax-chart-wrapper">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
        <BarChart3 className="h-3.5 w-3.5" />
        Resumo Tributário
      </h4>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 80 80" className="h-20 w-20 shrink-0">
          {paths.map((d, i) => (
            <motion.path
              key={segments[i].label}
              d={d}
              fill={segments[i].color}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'spring' as const,
                stiffness: 200,
                damping: 15,
                delay: i * 0.15,
              }}
              style={{ transformOrigin: '40px 40px' }}
            />
          ))}
          <circle cx="40" cy="40" r="16" fill="var(--card, #ffffff)" />
          <text x="40" y="38" textAnchor="middle" fill="var(--foreground, #1a1a2e)" fontSize="7" fontWeight="700">
            {((totalTax / total) * 100).toFixed(1)}%
          </text>
          <text x="40" y="47" textAnchor="middle" fill="var(--muted-foreground, #6b7280)" fontSize="5">impostos</text>
        </svg>
        <div className="space-y-1.5 flex-1">
          {segments.map((seg, i) => (
            <motion.div
              key={seg.label}
              className="flex items-center justify-between text-xs"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: 'spring' as const,
                stiffness: 200,
                damping: 20,
                delay: 0.3 + i * 0.1,
              }}
            >
              <div className="flex items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-muted-foreground">{seg.label}</span>
              </div>
              <span className="font-mono font-semibold">{formatBRL(seg.value)}</span>
            </motion.div>
          ))}
          <Separator className="my-1" />
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>Total impostos</span>
            <span className="font-mono">{formatBRL(totalTax)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Barcode SVG Mock ───────────────────────────────────────────────────

function BarcodeMock({ invoiceNumber }: { invoiceNumber: string }) {
  const bars: number[] = []
  let seed = 0
  for (let i = 0; i < invoiceNumber.length; i++) {
    seed += invoiceNumber.charCodeAt(i)
  }
  for (let i = 0; i < 60; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    bars.push(seed % 3 === 0 ? 1 : seed % 5 === 0 ? 2 : 0)
  }

  return (
    <div className="r44-barcode-wrapper">
      <svg viewBox="0 0 200 50" className="w-full max-w-[280px] h-10" preserveAspectRatio="xMidYMid meet">
        {bars.map((bar, i) => {
          if (bar === 0) return null
          const width = bar === 2 ? 2 : 1
          return (
            <rect
              key={i}
              x={i * 3.2}
              y="2"
              width={width}
              height="46"
              fill="var(--foreground, #1a1a2e)"
              rx="0.3"
            />
          )
        })}
      </svg>
      <p className="text-[9px] font-mono text-muted-foreground mt-1 text-center tracking-[0.2em]">
        {invoiceNumber}
      </p>
    </div>
  )
}

// ─── QR Code Mock ──────────────────────────────────────────────────────

function QrCodeMock() {
  const cells: boolean[] = []
  let seed = 42
  for (let i = 0; i < 121; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    cells.push(seed % 3 !== 0)
  }

  const renderCell = (row: number, col: number) => {
    const idx = row * 11 + col
    const isCornerFinder =
      (row < 3 && col < 3) || (row < 3 && col > 7) || (row > 7 && col < 3)
    const isFilled = isCornerFinder || cells[idx]
    return (
      <rect
        key={`${row}-${col}`}
        x={col * 9 + 8}
        y={row * 9 + 8}
        width="7"
        height="7"
        rx="1"
        fill={isFilled ? 'var(--foreground, #1a1a2e)' : 'transparent'}
      />
    )
  }

  return (
    <div className="r44-qr-wrapper">
      <svg viewBox="0 0 110 110" className="h-16 w-16">
        <rect width="110" height="110" rx="6" fill="var(--card, #ffffff)" stroke="var(--border, #e5e7eb)" strokeWidth="1" />
        {Array.from({ length: 11 }).map((_, row) =>
          Array.from({ length: 11 }).map((_, col) => renderCell(row, col))
        )}
        <rect x="38" y="38" width="34" height="34" rx="4" fill="var(--card, #ffffff)" stroke="var(--border, #e5e7eb)" strokeWidth="0.5" />
        <text x="55" y="59" textAnchor="middle" fill="var(--primary, #10b981)" fontSize="16" fontWeight="bold" fontFamily="sans-serif">D</text>
      </svg>
    </div>
  )
}

// ─── Status Watermark ───────────────────────────────────────────────────

function StatusWatermark({ status }: { status: InvoiceStatus }) {
  const config = STATUS_CONFIG[status]

  return (
    <div className="r44-watermark">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
        animate={{ opacity: 0.07, scale: 1, rotate: -25 }}
        transition={{
          type: 'spring' as const,
          stiffness: 120,
          damping: 18,
          delay: 0.5,
        }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10"
        aria-hidden="true"
      >
        <span
          className="text-[72px] sm:text-[96px] font-black tracking-widest uppercase"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      </motion.div>
    </div>
  )
}

// ─── Signature Line ─────────────────────────────────────────────────────

function SignatureLine() {
  return (
    <div className="r44-signature-section">
      <Separator className="my-4" />
      <div className="flex items-end justify-between">
        <div className="flex-1 max-w-[200px]">
          <div
            className="border-b border-dashed border-border"
            style={{ height: '1px', marginBottom: '8px' }}
          />
          <p className="text-[10px] text-muted-foreground text-center">
            Assinatura do Responsável
          </p>
        </div>
        <div className="flex items-center gap-1.5 ml-4 mb-5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-[9px] text-muted-foreground">
            Documento válido sem assinatura digital
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Invoice Timeline ──────────────────────────────────────────────────

function InvoiceTimeline({ timeline }: { timeline: InvoiceTimeline }) {
  const steps = [
    {
      label: 'Emitida',
      date: timeline.issued,
      icon: FileText,
      done: true,
    },
    {
      label: 'Visualizada',
      date: timeline.viewed,
      icon: Eye,
      done: !!timeline.viewed,
    },
    {
      label: 'Paga',
      date: timeline.paid,
      icon: Check,
      done: !!timeline.paid,
    },
  ].filter((s) => s.date)

  return (
    <div className="r44-timeline-section">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-4">
        <Clock className="h-3.5 w-3.5" />
        Histórico
      </h4>
      <div className="relative pl-6">
        {steps.map((step, idx) => {
          const Icon = step.icon
          const isLast = idx === steps.length - 1
          return (
            <motion.div
              key={step.label}
              className="relative pb-4"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: 'spring' as const,
                stiffness: 200,
                damping: 20,
                delay: 0.6 + idx * 0.12,
              }}
            >
              {!isLast && (
                <div
                  className="absolute left-[-18px] top-3 bottom-0 w-px"
                  style={{
                    backgroundColor: step.done
                      ? 'rgba(16, 185, 129, 0.3)'
                      : 'rgba(107, 114, 128, 0.2)',
                  }}
                />
              )}
              <motion.div
                className="absolute left-[-22px] top-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring' as const,
                  stiffness: 300,
                  damping: 15,
                  delay: 0.65 + idx * 0.12,
                }}
                style={{
                  backgroundColor: step.done ? '#10b981' : '#d1d5db',
                  border: '2px solid var(--card, #ffffff)',
                }}
              >
                <Icon
                  className="h-2 w-2"
                  style={{ color: '#ffffff' }}
                />
              </motion.div>
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-medium">{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.date}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Stagger animation variants ─────────────────────────────────────────

const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
  },
} as const

const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 22,
    },
  },
} as const

const rowVariant = {
  hidden: { opacity: 0, x: -20, backgroundColor: 'transparent' },
  show: {
    opacity: 1,
    x: 0,
    backgroundColor: 'transparent',
    transition: {
      type: 'spring' as const,
      stiffness: 220,
      damping: 20,
    },
  },
} as const

// ─── Generate Invoice Number ────────────────────────────────────────────

function generateInvoiceNumber(index: number): string {
  const year = new Date().getFullYear()
  const num = String(index).padStart(4, '0')
  return `DOM-${year}-${num}`
}

// ─── Main Component ────────────────────────────────────────────────────

export function InvoiceGenerator({ invoice, className }: InvoiceGeneratorProps) {
  const [expanded, setExpanded] = useState(true)
  const [copied, setCopied] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)

  const statusConfig = STATUS_CONFIG[invoice.status]

  // Calculate totals per item
  const itemTotals = useMemo(
    () =>
      invoice.items.map((item) => {
        const lineTotal = item.quantity * item.unitPrice * (1 - item.discount)
        return { ...item, lineTotal }
      }),
    [invoice.items]
  )

  const totalTax = invoice.tax.icms + invoice.tax.iss + invoice.tax.ipi
  const grandTotal =
    invoice.subtotal - invoice.discount + totalTax + invoice.shipping

  // Handlers
  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleDownloadPDF = useCallback(() => {
    toast.success('PDF gerado com sucesso!', {
      description: 'Download iniciado automaticamente.',
    })
  }, [])

  const handleSendEmail = useCallback(() => {
    setSendingEmail(true)
    setTimeout(() => {
      setSendingEmail(false)
      toast.success('Nota fiscal enviada!', {
        description: `Enviada para ${invoice.customer.email}`,
      })
    }, 1500)
  }, [invoice.customer.email])

  const handleCopyInvoice = useCallback(() => {
    const text = `Nota Fiscal ${invoice.invoiceNumber}\nTotal: ${formatBRL(grandTotal)}\nData: ${invoice.date}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Dados copiados!')
    setTimeout(() => setCopied(false), 2000)
  }, [invoice.invoiceNumber, invoice.date, grandTotal])

  const handleDuplicate = useCallback(() => {
    const newIndex = Math.floor(Math.random() * 9999) + 1
    const newNumber = generateInvoiceNumber(newIndex)
    toast.success('Nota duplicada!', {
      description: `Nova nota: ${newNumber}`,
    })
  }, [])

  return (
    <div className={`r44-root ${className || ''}`}>
      {/* ── Print styles handled via CSS class ── */}
      <motion.div
        className="r44-container"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring' as const,
          stiffness: 180,
          damping: 20,
        }}
      >
        <Card className="r44-card">
          <CardContent className="r44-card-content p-4 sm:p-6 relative overflow-hidden">
            {/* Status Watermark */}
            <StatusWatermark status={invoice.status} />

            {/* ── Header: Store Info ── */}
            <motion.div
              className="r44-header flex items-start justify-between gap-4 mb-6"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              <motion.div className="flex items-start gap-3" variants={staggerItem}>
                <motion.div
                  className="r44-store-logo h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring' as const,
                    stiffness: 260,
                    damping: 15,
                    delay: 0.1,
                  }}
                >
                  {invoice.store.logo ? (
                    <img
                      src={invoice.store.logo}
                      alt={invoice.store.name}
                      className="h-8 w-8 rounded object-cover"
                    />
                  ) : (
                    <Building2 className="h-6 w-6" style={{ color: '#10b981' }} />
                  )}
                </motion.div>
                <div>
                  <h2 className="text-base font-bold leading-tight">{invoice.store.name}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-[240px]">
                    {invoice.store.address}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-mono">
                      CNPJ: {invoice.store.cnpj}
                    </Badge>
                  </div>
                </div>
              </motion.div>

              <motion.div className="text-right shrink-0" variants={staggerItem}>
                <motion.div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{
                    color: statusConfig.color,
                    backgroundColor: statusConfig.bg,
                    border: `1px solid ${statusConfig.borderColor}`,
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring' as const,
                    stiffness: 300,
                    damping: 15,
                    delay: 0.3,
                  }}
                >
                  {(() => {
                    const StatusIcon = statusConfig.icon
                    return <StatusIcon className="h-3.5 w-3.5" />
                  })()}
                  {statusConfig.label}
                </motion.div>
                <p className="text-xs text-muted-foreground mt-2 font-mono">
                  {invoice.invoiceNumber}
                </p>
              </motion.div>
            </motion.div>

            <Separator className="mb-6" />

            {/* ── Invoice Meta + Customer ── */}
            <motion.div
              className="r44-meta-section grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              {/* Invoice details */}
              <div className="r44-invoice-meta space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Receipt className="h-3.5 w-3.5" />
                  Dados da Nota
                </h3>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Hash className="h-3 w-3 shrink-0" />
                    <span>Número:</span>
                  </div>
                  <span className="font-mono font-medium">{invoice.invoiceNumber}</span>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3 w-3 shrink-0" />
                    <span>Emissão:</span>
                  </div>
                  <span className="font-medium">{invoice.date}</span>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>Vencimento:</span>
                  </div>
                  <span className="font-medium">{invoice.dueDate}</span>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Tag className="h-3 w-3 shrink-0" />
                    <span>Status:</span>
                  </div>
                  <span className="font-medium" style={{ color: statusConfig.color }}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>

              {/* Customer details */}
              <div className="r44-customer-meta space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Cliente
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-start gap-1.5">
                    <User className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                    <span className="font-medium">{invoice.customer.name}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-muted-foreground">
                    <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>{invoice.customer.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <ShieldCheck className="h-3 w-3 shrink-0" />
                    <span>CPF: {invoice.customer.cpf}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <Separator className="mb-4" />

            {/* ── Items Table ── */}
            <motion.div
              className="r44-items-section mb-6"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Itens da Nota ({invoice.items.length})
                </h3>
                {invoice.items.length > 3 && (
                  <motion.button
                    className="r44-toggle-items flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? (
                      <>
                        <ChevronUp className="h-3.5 w-3.5" />
                        <span>Recolher</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3.5 w-3.5" />
                        <span>Expandir</span>
                      </>
                    )}
                  </motion.button>
                )}
              </div>

              {/* Table Header */}
              <div className="r44-table-header hidden sm:grid sm:grid-cols-12 gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground rounded-t-lg" style={{ backgroundColor: 'rgba(107, 114, 128, 0.06)' }}>
                <div className="col-span-5">Produto</div>
                <div className="col-span-1 text-center">Qtd</div>
                <div className="col-span-2 text-right">Preço Unit.</div>
                <div className="col-span-1 text-right">Desc.</div>
                <div className="col-span-3 text-right">Total</div>
              </div>

              {/* Table Rows */}
              <div className="r44-table-body">
                <AnimatePresence mode="wait">
                  {(expanded ? itemTotals : itemTotals.slice(0, 3)).map((item, idx) => (
                    <motion.div
                      key={item.id}
                      className="r44-table-row grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2 px-3 py-2.5 text-xs border-b last:border-b-0"
                      style={{ borderColor: 'var(--border, #e5e7eb)' }}
                      variants={rowVariant}
                      custom={idx}
                      initial="hidden"
                      animate="show"
                      transition={{
                        type: 'spring' as const,
                        stiffness: 220,
                        damping: 20,
                        delay: 0.15 + idx * 0.06,
                      }}
                    >
                      <div className="col-span-5 font-medium truncate sm:pr-2" title={item.productName}>
                        {item.productName}
                      </div>
                      <div className="sm:col-span-1 text-muted-foreground text-center">
                        {item.quantity}x
                      </div>
                      <div className="sm:col-span-2 text-right font-mono text-muted-foreground">
                        {formatBRL(item.unitPrice)}
                      </div>
                      <div className="sm:col-span-1 text-right">
                        {item.discount > 0 ? (
                          <span className="text-emerald-600 font-medium flex items-center justify-end gap-0.5">
                            <Percent className="h-2.5 w-2.5" />
                            {Math.round(item.discount * 100)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                      <div className="sm:col-span-3 text-right font-semibold font-mono">
                        {formatBRL(item.lineTotal)}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {itemTotals.length > 3 && !expanded && (
                <motion.p
                  className="text-center text-xs text-muted-foreground py-2 r44-more-items"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  +{itemTotals.length - 3} mais itens
                </motion.p>
              )}
            </motion.div>

            {/* ── Totals Section ── */}
            <motion.div
              className="r44-totals-section mb-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring' as const,
                stiffness: 200,
                damping: 20,
                delay: 0.5,
              }}
            >
              <div className="r44-totals-grid ml-auto max-w-[320px] space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatBRL(invoice.subtotal)}</span>
                </div>

                {/* Tax breakdown */}
                <div className="r44-tax-lines">
                  {invoice.tax.icms > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#10b981' }} />
                        ICMS
                      </span>
                      <span className="font-mono">{formatBRL(invoice.tax.icms)}</span>
                    </div>
                  )}
                  {invoice.tax.iss > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
                        ISS
                      </span>
                      <span className="font-mono">{formatBRL(invoice.tax.iss)}</span>
                    </div>
                  )}
                  {invoice.tax.ipi > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#06b6d4' }} />
                        IPI
                      </span>
                      <span className="font-mono">{formatBRL(invoice.tax.ipi)}</span>
                    </div>
                  )}
                </div>

                {invoice.shipping > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Frete</span>
                    <span className="font-mono">{formatBRL(invoice.shipping)}</span>
                  </div>
                )}

                {invoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      Desconto
                    </span>
                    <span className="font-mono">-{formatBRL(invoice.discount)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-bold text-sm pt-1">
                  <span>Total</span>
                  <motion.span
                    className="font-mono text-primary inline-block"
                    initial={{ scale: 0.85 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring' as const,
                      stiffness: 350,
                      damping: 18,
                      delay: 0.7,
                    }}
                  >
                    {formatBRL(grandTotal)}
                  </motion.span>
                </div>
              </div>
            </motion.div>

            <Separator className="mb-6" />

            {/* ── Payment Method ── */}
            <motion.div
              className="r44-payment-section mb-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring' as const,
                stiffness: 200,
                damping: 20,
                delay: 0.55,
              }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
                <CreditCard className="h-3.5 w-3.5" />
                Pagamento
              </h3>
              <div className="r44-payment-card flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(107, 114, 128, 0.04)', border: '1px solid var(--border, #e5e7eb)' }}>
                <CardBrandIcon brand={invoice.payment.cardBrand} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{invoice.payment.method}</p>
                  {invoice.payment.cardBrand && (
                    <p className="text-xs text-muted-foreground">
                      {invoice.payment.cardBrand.toUpperCase()}
                      {invoice.payment.lastFour && (
                        <> •••• {invoice.payment.lastFour}</>
                      )}
                    </p>
                  )}
                  {invoice.payment.installmentCount && invoice.payment.installmentCount > 1 && (
                    <p className="text-xs text-muted-foreground">
                      {invoice.payment.installmentCount}x de{' '}
                      {formatBRL(grandTotal / invoice.payment.installmentCount)}
                    </p>
                  )}
                </div>
                <motion.div
                  className="r44-payment-badge px-2 py-0.5 rounded text-[10px] font-semibold"
                  style={{
                    backgroundColor: statusConfig.bg,
                    color: statusConfig.color,
                    border: `1px solid ${statusConfig.borderColor}`,
                  }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  {statusConfig.label}
                </motion.div>
              </div>
            </motion.div>

            {/* ── Tax Pie Chart + Timeline Grid ── */}
            <motion.div
              className="r44-info-grid grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <Card className="r44-tax-card border-border/50">
                <CardContent className="p-4">
                  <TaxPieChart tax={invoice.tax} total={grandTotal} />
                </CardContent>
              </Card>

              <Card className="r44-timeline-card border-border/50">
                <CardContent className="p-4">
                  <InvoiceTimeline timeline={invoice.timeline} />
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Notes ── */}
            {invoice.notes && (
              <motion.div
                className="r44-notes-section mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                  <PenLine className="h-3.5 w-3.5" />
                  Observações
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed p-3 rounded-lg" style={{ backgroundColor: 'rgba(107, 114, 128, 0.04)' }}>
                  {invoice.notes}
                </p>
              </motion.div>
            )}

            <Separator className="mb-4" />

            {/* ── Barcode + QR Code ── */}
            <motion.div
              className="r44-codes-section flex flex-col sm:flex-row items-center gap-4 mb-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring' as const,
                stiffness: 180,
                damping: 20,
                delay: 0.75,
              }}
            >
              <div className="flex-1 flex flex-col items-center w-full">
                <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Código de Barras</p>
                <BarcodeMock invoiceNumber={invoice.invoiceNumber} />
              </div>
              <div className="flex flex-col items-center">
                <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider font-semibold">QR Code</p>
                <QrCodeMock />
              </div>
            </motion.div>

            {/* ── Signature ── */}
            <SignatureLine />

            {/* ── Action Buttons ── */}
            <div className="r44-actions mt-4 flex flex-wrap gap-2">
              {/* Print Button */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="r44-btn-print gap-1.5 text-xs"
                  onClick={handlePrint}
                >
                  <Printer className="h-3.5 w-3.5" />
                  Imprimir
                </Button>
              </motion.div>

              {/* Download PDF Button */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="r44-btn-pdf gap-1.5 text-xs"
                  onClick={handleDownloadPDF}
                >
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </Button>
              </motion.div>

              {/* Send Email Button */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="r44-btn-email gap-1.5 text-xs"
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                >
                  {sendingEmail ? (
                    <motion.div
                      className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' as const }}
                    />
                  ) : (
                    <Mail className="h-3.5 w-3.5" />
                  )}
                  {sendingEmail ? 'Enviando...' : 'Enviar Email'}
                </Button>
              </motion.div>

              {/* Copy Invoice Button */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="r44-btn-copy gap-1.5 text-xs"
                  onClick={handleCopyInvoice}
                >
                  {copied ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' as const, stiffness: 300, damping: 15 }}
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    </motion.span>
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              </motion.div>

              {/* Duplicate Invoice Button */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="r44-btn-duplicate gap-1.5 text-xs"
                  onClick={handleDuplicate}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Duplicar
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// ─── Demo data for testing ─────────────────────────────────────────────

export const DEMO_INVOICE: InvoiceData = {
  invoiceNumber: 'DOM-2024-0042',
  date: '15/06/2024',
  dueDate: '15/07/2024',
  status: 'paga',
  store: {
    name: 'DomPlace Marketplace',
    address: 'Av. Brasil, 1500 - Centro, São Paulo - SP, 01430-001',
    cnpj: '12.345.678/0001-90',
    phone: '(11) 99999-0000',
    email: 'contato@domplace.com.br',
  },
  customer: {
    name: 'Maria Silva Santos',
    address: 'Rua das Flores, 42 - Vila Mariana, São Paulo - SP, 04023-000',
    cpf: '123.456.789-00',
    email: 'maria.santos@email.com',
    phone: '(11) 98765-4321',
  },
  items: [
    { id: '1', productName: 'Arroz Integral Tio João 5kg', quantity: 2, unitPrice: 24.90, discount: 0.05 },
    { id: '2', productName: 'Azeite Extra Virgem Gallo 500ml', quantity: 1, unitPrice: 32.90, discount: 0 },
    { id: '3', productName: 'Café Melitta Torrado e Moído 500g', quantity: 3, unitPrice: 18.50, discount: 0.1 },
    { id: '4', productName: 'Macarrão Barilla Spaghetti 500g', quantity: 2, unitPrice: 9.90, discount: 0 },
    { id: '5', productName: 'Leite Integral Parmalat 1L', quantity: 4, unitPrice: 5.49, discount: 0 },
    { id: '6', productName: 'Chocolate ao Leite Nestlé 200g', quantity: 1, unitPrice: 12.90, discount: 0.15 },
  ],
  subtotal: 209.26,
  tax: {
    icms: 12.55,
    iss: 3.14,
    ipi: 2.09,
  },
  discount: 10.46,
  shipping: 8.90,
  total: 225.48,
  payment: {
    method: 'Cartão de Crédito',
    cardBrand: 'visa',
    lastFour: '4242',
    installmentCount: 3,
  },
  timeline: {
    issued: '15/06/2024 às 14:32',
    viewed: '15/06/2024 às 14:45',
    paid: '15/06/2024 às 15:02',
  },
  notes: 'Pedido entregue com sucesso. Obrigada pela preferência, Maria! Avalie sua experiência na DomPlace.',
}
