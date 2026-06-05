'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  Store, ArrowLeft, DollarSign, ShoppingCart, Package, Star,
  TrendingUp, TrendingDown, Plus, Eye, MoreVertical, ChevronRight,
  Clock, User, BarChart3, ThumbsUp, ThumbsDown, Minus, MessageSquare,
  RefreshCw, Loader2, Trash2, ChefHat, Truck, CheckCircle2, XCircle,
  AlertTriangle, Settings, Tag, Percent, Gift, ShieldX, Phone, MapPin,
  Hash, Calendar, Copy, X, Save, ToggleLeft, Timer,
  Zap, Heart, Megaphone, ArrowUpRight, FileText, ImageIcon,
  GripVertical, MousePointerClick, CircleDot,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
// Recharts removed - div-based mini chart used instead
import { ReviewsManagement } from './ReviewsManagement'
import { ProductForm } from './ProductForm'

// --- Types ---
interface StatsData {
  totalRevenue: number
  todayRevenue: number
  totalOrders: number
  todayOrders: number
  pendingOrders: number
  preparingOrders: number
  deliveringOrders: number
  completedOrders: number
  cancelledOrders: number
  totalProducts: number
  activeProducts: number
  averageRating: number
  totalReviews: number
  monthlyRevenue: number
}

interface OrderItem {
  id: string
  productId: string
  productName: string
  productImage?: string | null
  quantity: number
  price: number
  total: number
}

interface StatusHistoryEntry {
  id: string
  status: string
  note: string
  createdAt: string
}

interface OrderData {
  id: string
  orderNumber: string
  accountId?: string
  customerName: string
  customerPhone?: string | null
  customerAvatar?: string | null
  status: string
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  items: OrderItem[]
  createdAt: string
  deliveryType: string
  deliveryAddress?: string | null
  notes?: string | null
  estimatedTime?: string | null
  paymentMethod: string | null
  statusHistory?: StatusHistoryEntry[]
  paidAt?: string | null
  deliveredAt?: string | null
  cancelledAt?: string | null
  cancelReason?: string | null
}

interface ProductData {
  id: string
  name: string
  price: number
  stock: number
  rating: number
  totalReviews: number
  category: string
  status?: string
  soldCount?: number
  revenue?: number
  image?: string | null
}

interface StoreSettings {
  id: string
  name: string
  description: string | null
  phone: string | null
  whatsapp: string | null
  address: string | null
  neighborhood: string | null
  city: string
  state: string
  opensAt: string | null
  closesAt: string | null
  openDays: string
  deliveryFee: number
  freeDeliveryAbove: number | null
  minOrderValue: number | null
  deliveryRadius: number | null
  pixKey: string | null
  socialMedia: string | null
  logo: string | null
  coverImage: string | null
  category: string
  status: string
  rating: number
  totalReviews: number
  totalSales: number
}

interface PromotionData {
  id: string
  title: string
  description: string | null
  type: string
  value: number
  minOrderValue: number | null
  maxDiscount: number | null
  usageLimit: number | null
  usedCount?: number
  code: string | null
  startsAt: string
  endsAt: string
  isActive: boolean
  createdAt: string
}

interface PromotionForm {
  title: string
  description: string
  type: string
  value: string
  minOrderValue: string
  maxDiscount: string
  usageLimit: string
  code: string
  startsAt: string
  endsAt: string
}

// --- Animated Counter Hook ---
function useAnimatedCounter(target: number, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0)

  const animate = useCallback(() => {
    const startTime = Date.now()
    const step = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setValue(eased * target)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])

  useEffect(() => {
    animate()
  }, [animate])

  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString('pt-BR')
}

// --- Status Config (color-coded per spec) ---
const orderStatusConfig: Record<string, { label: string; color: string; dotColor: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dotColor: 'bg-amber-500' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', dotColor: 'bg-sky-500' },
  PREPARING: { label: 'Preparando', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', dotColor: 'bg-purple-500' },
  READY: { label: 'Pronto', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400', dotColor: 'bg-teal-500' },
  DELIVERING: { label: 'Em Entrega', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400', dotColor: 'bg-cyan-500' },
  DELIVERED: { label: 'Entregue', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dotColor: 'bg-emerald-500' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dotColor: 'bg-red-500' },
}

const promotionTypeLabels: Record<string, string> = {
  PERCENTAGE: 'Desconto %',
  FIXED_AMOUNT: 'Desconto Fixo',
  FREE_DELIVERY: 'Frete Grátis',
  BUY_X_GET_Y: 'Compre X Ganhe Y',
}

const orderActionConfig: Record<string, { action: string; label: string; icon: typeof CheckCircle2; variant: 'default' | 'outline' | 'destructive' }> = {
  PENDING: { action: 'accept', label: 'Aceitar', icon: CheckCircle2, variant: 'default' },
  CONFIRMED: { action: 'prepare', label: 'Preparar', icon: ChefHat, variant: 'outline' },
  PREPARING: { action: 'ready', label: 'Pronto', icon: CheckCircle2, variant: 'default' },
  READY: { action: 'start_delivery', label: 'Iniciar Entrega', icon: Truck, variant: 'default' },
  DELIVERING: { action: 'deliver', label: 'Entregue', icon: CheckCircle2, variant: 'default' },
}

const orderFilterOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'CONFIRMED', label: 'Confirmados' },
  { value: 'PREPARING', label: 'Preparando' },
  { value: 'READY', label: 'Prontos' },
  { value: 'DELIVERING', label: 'Em Entrega' },
  { value: 'DELIVERED', label: 'Entregues' },
  { value: 'CANCELLED', label: 'Cancelados' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}

const statCardVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 12 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 350, damping: 22 },
  },
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)
  if (diffMin < 1) return 'Agora'
  if (diffMin < 60) return `${diffMin} min atrás`
  if (diffHr < 24) return `${diffHr}h atrás`
  return `${diffDay}d atrás`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDayLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

// --- Status Badge Component ---
function StatusBadge({ status }: { status: string }) {
  const cfg = orderStatusConfig[status] || { label: status, color: 'bg-muted text-muted-foreground', dotColor: 'bg-muted-foreground' }
  return (
    <Badge className={`${cfg.color} text-[10px] sm:text-xs px-2 py-0.5 border-0 gap-1 font-medium`}>
      <CircleDot className={`h-2 w-2 ${cfg.dotColor}`} />
      {cfg.label}
    </Badge>
  )
}

// --- Stat Card ---
function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  trend,
  delay,
  gradient,
}: {
  icon: typeof DollarSign
  label: string
  value: string
  suffix?: string
  trend: { value: string; positive: boolean }
  delay: number
  gradient?: string
}) {
  return (
    <motion.div
      variants={statCardVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      whileHover={{ y: -4, transition: { type: 'spring' as const, stiffness: 400, damping: 20 } }}
    >
      <Card className="border-border/50 overflow-hidden relative group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-default r39-stat-card r42-stat-glow-border">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-emerald-400 to-accent/60 opacity-60 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-primary/5 via-transparent to-emerald-400/5" />
        <CardContent className="p-4 relative">
          <div className="flex items-start justify-between">
            <div className={`h-10 w-10 rounded-xl ${gradient || 'bg-gradient-to-br from-primary/15 to-primary/5'} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <Badge
              variant="secondary"
              className={`text-[10px] px-1.5 py-0 gap-0.5 ${trend.positive ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20' : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/20'}`}
            >
              {trend.positive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
              {trend.value}
            </Badge>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold r39-stat-value" style={{ animationDelay: `${delay + 0.15}s` }}>
              {value}{suffix && <span className="text-sm font-normal text-muted-foreground ml-0.5">{suffix}</span>}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// --- Quick Action Button ---
function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  delay,
  color,
}: {
  icon: typeof DollarSign
  label: string
  onClick: () => void
  delay: number
  color?: string
}) {
  return (
    <motion.button
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border/50 bg-card hover:bg-accent/50 transition-colors min-w-[72px] r42-quick-action-glow"
    >
      <div className={`h-10 w-10 rounded-xl ${color || 'bg-gradient-to-br from-primary/15 to-primary/5'} flex items-center justify-center`}>
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">{label}</span>
    </motion.button>
  )
}

// --- Skeleton Loaders ---
function StatsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-40" />
            {[0,1,2,3,4].map((i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-40" />
            {[0,1,2,3,4].map((i) => (
              <div key={i} className="flex items-center gap-3 py-1">
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2 w-16" />
                </div>
                <Skeleton className="h-4 w-14" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ProductsSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function OrdersSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2, 3].map((i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-[1px] w-full" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-7 w-20 rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2, 3].map((i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function PromotionsSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-48" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// --- Empty State ---
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
}: {
  icon: typeof Package
  title: string
  description: string
  action?: () => void
  actionLabel?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-100 dark:to-emerald-900/30 flex items-center justify-center mb-4 r42-empty-float">
        <Icon className="h-8 w-8 text-primary/70 r42-empty-float-inner" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-xs">{description}</p>
      {actionLabel && action && (
        <Button onClick={action} className="gap-2 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}

// --- Error State ---
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold mb-1">Erro ao carregar dados</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-xs">
        Não foi possível carregar as informações do painel. Verifique sua conexão e tente novamente.
      </p>
      <Button onClick={onRetry} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Tentar novamente
      </Button>
    </motion.div>
  )
}

// --- Access Denied State ---
function AccessDenied() {
  const { goBack } = useAppStore()
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="text-center max-w-sm"
      >
        <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-xl font-bold mb-2">Acesso Negado</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Você não tem permissão para acessar o painel da loja. Somente proprietários de loja podem acessar esta área.
        </p>
        <Button onClick={goBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </motion.div>
    </div>
  )
}

// --- Auth Loading State ---
function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Verificando permissões...</p>
      </div>
    </div>
  )
}

// --- RevenueChartTooltip removed (div-based mini chart used) ---

// --- Order Detail Dialog ---
function OrderDetailDialog({
  order,
  open,
  onClose,
}: {
  order: OrderData | null
  open: boolean
  onClose: () => void
}) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Pedido #{order.orderNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <StatusBadge status={order.status} />
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(order.createdAt)}
            </span>
          </div>

          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{order.customerName || 'Cliente'}</p>
                  {order.customerPhone && (
                    <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Itens do pedido</p>
            <div className="space-y-2">
              {(order.items || []).map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity}x {formatBRL(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{formatBRL(item.total)}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-border/50">
            <CardContent className="p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatBRL(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxa de entrega</span>
                <span>{formatBRL(order.deliveryFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Desconto</span>
                  <span>-{formatBRL(order.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-primary">{formatBRL(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {order.deliveryAddress && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>{order.deliveryAddress}</span>
              </div>
            )}
            {order.notes && (
              <div className="flex items-start gap-2 text-sm">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>{order.notes}</span>
              </div>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Pagamento: {order.paymentMethod || 'Não informado'}</span>
              <span>Tipo: {order.deliveryType === 'DELIVERY' ? 'Entrega' : 'Retirada'}</span>
            </div>
          </div>

          {order.statusHistory && order.statusHistory.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Histórico de status</p>
              <div className="space-y-2">
                {order.statusHistory.map((entry) => {
                  const cfg = orderStatusConfig[entry.status]
                  return (
                    <div key={entry.id} className="flex items-center gap-2 text-xs">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${cfg?.dotColor || 'bg-primary'}`} />
                      <span className="font-medium">{cfg?.label || entry.status}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{formatDate(entry.createdAt)}</span>
                      {entry.note && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{entry.note}</span>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {order.cancelReason && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800/30">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Motivo do cancelamento</p>
              <p className="text-xs text-red-600 dark:text-red-300">{order.cancelReason}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// --- Settings Form ---
function SettingsTab({
  settings,
  loading,
  saving,
  onFetch,
  onSave,
}: {
  settings: StoreSettings | null
  loading: boolean
  saving: boolean
  onFetch: () => void
  onSave: (data: Record<string, unknown>) => void
}) {
  const initialForm = useMemo<Record<string, string>>(() => {
    if (!settings) return {
      name: '', description: '', phone: '', whatsapp: '', address: '',
      neighborhood: '', opensAt: '', closesAt: '', openDays: '',
      deliveryFee: '0', freeDeliveryAbove: '', minOrderValue: '',
      deliveryRadius: '', pixKey: '', socialMedia: '',
    }
    return {
      name: settings.name || '',
      description: settings.description || '',
      phone: settings.phone || '',
      whatsapp: settings.whatsapp || '',
      address: settings.address || '',
      neighborhood: settings.neighborhood || '',
      opensAt: settings.opensAt || '',
      closesAt: settings.closesAt || '',
      openDays: settings.openDays || '',
      deliveryFee: String(settings.deliveryFee || 0),
      freeDeliveryAbove: String(settings.freeDeliveryAbove || ''),
      minOrderValue: String(settings.minOrderValue || ''),
      deliveryRadius: String(settings.deliveryRadius || ''),
      pixKey: settings.pixKey || '',
      socialMedia: settings.socialMedia || '',
    }
  }, [settings])

  const [form, setForm] = useState<Record<string, string>>(initialForm)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  if (settings && !settingsLoaded) {
    setForm(initialForm)
    setSettingsLoaded(true)
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    const data: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(form)) {
      if (settings && val !== String(settings[key as keyof StoreSettings] ?? '')) {
        if (key === 'deliveryFee' || key === 'freeDeliveryAbove' || key === 'minOrderValue' || key === 'deliveryRadius') {
          data[key] = val === '' ? null : parseFloat(val)
        } else {
          data[key] = val || null
        }
      }
    }
    if (Object.keys(data).length === 0) {
      toast.info('Nenhuma alteração detectada')
      return
    }
    onSave(data)
  }

  if (loading && !settings) return <SettingsSkeleton />

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/15 to-emerald-100 dark:to-emerald-900/30 flex items-center justify-center shrink-0">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Configurações da Loja</p>
              <p className="text-xs text-muted-foreground">
                Status: <Badge className={`${settings?.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'} text-[9px] px-1.5 py-0 border-0`}>
                  {settings?.status === 'ACTIVE' ? 'Ativa' : settings?.status === 'INACTIVE' ? 'Inativa' : 'Pendente'}
                </Badge>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Nome da loja</Label>
            <Input value={form.name} onChange={(e) => updateField('name', e.target.value)} className="mt-1 h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Descrição</Label>
            <Textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} className="mt-1 min-h-[80px] resize-none text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Telefone</Label>
              <Input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="(99) 99999-9999" className="mt-1 h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> WhatsApp</Label>
              <Input value={form.whatsapp} onChange={(e) => updateField('whatsapp', e.target.value)} placeholder="+5599999999999" className="mt-1 h-9 text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Endereço</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Endereço</Label>
            <Input value={form.address} onChange={(e) => updateField('address', e.target.value)} className="mt-1 h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Bairro</Label>
            <Input value={form.neighborhood} onChange={(e) => updateField('neighborhood', e.target.value)} className="mt-1 h-9 text-sm" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Horário de Funcionamento</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Abre às</Label>
              <Input type="time" value={form.opensAt} onChange={(e) => updateField('opensAt', e.target.value)} className="mt-1 h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Fecha às</Label>
              <Input type="time" value={form.closesAt} onChange={(e) => updateField('closesAt', e.target.value)} className="mt-1 h-9 text-sm" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Dias de funcionamento (1=Dom, 2=Seg, ..., 7=Sáb)</Label>
            <Input value={form.openDays} onChange={(e) => updateField('openDays', e.target.value)} placeholder="Ex: 2,3,4,5,6" className="mt-1 h-9 text-sm" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Entrega</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Taxa de entrega (R$)</Label>
              <Input type="number" step="0.01" value={form.deliveryFee} onChange={(e) => updateField('deliveryFee', e.target.value)} className="mt-1 h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Frete grátis acima de (R$)</Label>
              <Input type="number" step="0.01" value={form.freeDeliveryAbove} onChange={(e) => updateField('freeDeliveryAbove', e.target.value)} className="mt-1 h-9 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Pedido mínimo (R$)</Label>
              <Input type="number" step="0.01" value={form.minOrderValue} onChange={(e) => updateField('minOrderValue', e.target.value)} className="mt-1 h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Raio de entrega (km)</Label>
              <Input type="number" value={form.deliveryRadius} onChange={(e) => updateField('deliveryRadius', e.target.value)} className="mt-1 h-9 text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Chave PIX</Label>
            <Input value={form.pixKey} onChange={(e) => updateField('pixKey', e.target.value)} className="mt-1 h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Redes Sociais (link)</Label>
            <Input value={form.socialMedia} onChange={(e) => updateField('socialMedia', e.target.value)} className="mt-1 h-9 text-sm" />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full h-11 bg-primary text-primary-foreground font-semibold gap-2">
        {saving ? (<><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>) : (<><Save className="h-4 w-4" /> Salvar Configurações</>)}
      </Button>
    </motion.div>
  )
}

// --- Promotion Create Dialog ---
function PromotionCreateDialog({
  open,
  onClose,
  onCreate,
  loading,
}: {
  open: boolean
  onClose: () => void
  onCreate: (data: Record<string, unknown>) => void
  loading: boolean
}) {
  const [form, setForm] = useState<PromotionForm>({
    title: '', description: '', type: 'PERCENTAGE', value: '', minOrderValue: '',
    maxDiscount: '', usageLimit: '', code: '', startsAt: '', endsAt: '',
  })

  const updateField = (field: keyof PromotionForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!form.title.trim()) { toast.error('Título é obrigatório'); return }
    if (!form.value || parseFloat(form.value) <= 0) { toast.error('Valor da promoção é obrigatório'); return }
    if (!form.startsAt || !form.endsAt) { toast.error('Datas de início e fim são obrigatórias'); return }
    if (new Date(form.endsAt) <= new Date(form.startsAt)) { toast.error('Data de fim deve ser posterior à data de início'); return }

    const data: Record<string, unknown> = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      type: form.type,
      value: parseFloat(form.value),
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
    }
    if (form.minOrderValue) data.minOrderValue = parseFloat(form.minOrderValue)
    if (form.maxDiscount) data.maxDiscount = parseFloat(form.maxDiscount)
    if (form.usageLimit) data.usageLimit = parseInt(form.usageLimit)
    if (form.code.trim()) data.code = form.code.trim()
    onCreate(data)
  }

  const handleClose = () => {
    setForm({ title: '', description: '', type: 'PERCENTAGE', value: '', minOrderValue: '', maxDiscount: '', usageLimit: '', code: '', startsAt: '', endsAt: '' })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Gift className="h-5 w-5 text-primary" /> Criar Promoção</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Título *</Label>
            <Input value={form.title} onChange={(e) => updateField('title', e.target.value)} placeholder="Ex: Promoção de Verão" className="mt-1 h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Descrição</Label>
            <Textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} className="mt-1 min-h-[60px] resize-none text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Tipo *</Label>
              <select value={form.type} onChange={(e) => updateField('type', e.target.value)} className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {Object.entries(promotionTypeLabels).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
              </select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Valor {form.type === 'PERCENTAGE' ? '(%)' : '(R$)'} *</Label>
              <Input type="number" step={form.type === 'PERCENTAGE' ? '1' : '0.01'} value={form.value} onChange={(e) => updateField('value', e.target.value)} placeholder={form.type === 'PERCENTAGE' ? '10' : '5.00'} className="mt-1 h-9 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Pedido mínimo (R$)</Label>
              <Input type="number" step="0.01" value={form.minOrderValue} onChange={(e) => updateField('minOrderValue', e.target.value)} className="mt-1 h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Desconto máximo (R$)</Label>
              <Input type="number" step="0.01" value={form.maxDiscount} onChange={(e) => updateField('maxDiscount', e.target.value)} className="mt-1 h-9 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Limite de uso</Label>
              <Input type="number" value={form.usageLimit} onChange={(e) => updateField('usageLimit', e.target.value)} className="mt-1 h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Código promocional</Label>
              <Input value={form.code} onChange={(e) => updateField('code', e.target.value.toUpperCase())} placeholder="Ex: VERAO20" className="mt-1 h-9 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Início *</Label>
              <Input type="datetime-local" value={form.startsAt} onChange={(e) => updateField('startsAt', e.target.value)} className="mt-1 h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Fim *</Label>
              <Input type="datetime-local" value={form.endsAt} onChange={(e) => updateField('endsAt', e.target.value)} className="mt-1 h-9 text-sm" />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} className="h-9 text-xs">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading} className="h-9 text-xs gap-1 bg-primary text-primary-foreground">
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            Criar Promoção
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// --- Main Component ---
export function StoreDashboard() {
  const { goBack, currentUser } = useAppStore()
  const { isStoreOwner, isLoading: authLoading, isAuthenticated } = useAuth()

  const [stats, setStats] = useState<StatsData | null>(null)
  const [products, setProducts] = useState<ProductData[]>([])
  const [orders, setOrders] = useState<OrderData[]>([])
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null)
  const [storeId, setStoreId] = useState<string | null>(null)
  const [promotions, setPromotions] = useState<PromotionData[]>([])

  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [promotionsLoading, setPromotionsLoading] = useState(false)
  const [promotionCreating, setPromotionCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null)
  const [orderFilter, setOrderFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null)
  const [orderDetailOpen, setOrderDetailOpen] = useState(false)
  const [promoDialogOpen, setPromoDialogOpen] = useState(false)

  const accountId = currentUser?.id

  const mapStats = useCallback((s: Record<string, unknown>): StatsData => ({
    totalRevenue: (s.totalRevenue as number) ?? 0,
    todayRevenue: (s.todayRevenue as number) ?? 0,
    totalOrders: (s.totalOrders as number) ?? 0,
    todayOrders: (s.todayOrders as number) ?? ((s.pendingOrders as number) ?? 0) + ((s.preparingOrders as number) ?? 0),
    pendingOrders: (s.pendingOrders as number) ?? 0,
    preparingOrders: (s.preparingOrders as number) ?? 0,
    deliveringOrders: (s.deliveringOrders as number) ?? 0,
    completedOrders: (s.completedOrders as number) ?? 0,
    cancelledOrders: (s.cancelledOrders as number) ?? 0,
    totalProducts: (s.totalProducts as number) ?? 0,
    activeProducts: (s.activeProducts as number) ?? 0,
    averageRating: (s.averageRating as number) ?? 0,
    totalReviews: (s.totalReviews as number) ?? 0,
    monthlyRevenue: (s.monthlyRevenue as number) ?? 0,
  }), [])

  const fetchStatsAndOrders = useCallback(async () => {
    if (!accountId) { setError('Você precisa estar logado para acessar o painel.'); setLoading(false); return }
    setLoading(true); setError(null)
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch(`/api/store-dashboard/stats?accountId=${accountId}`),
        fetch(`/api/store-dashboard/orders?accountId=${accountId}&limit=50`),
      ])
      if (!statsRes.ok) { const errData = await statsRes.json().catch(() => ({ error: 'Erro desconhecido' })); throw new Error(errData.error || 'Erro ao buscar estatísticas') }
      if (!ordersRes.ok) { const errData = await ordersRes.json().catch(() => ({ error: 'Erro desconhecido' })); throw new Error(errData.error || 'Erro ao buscar pedidos') }
      const statsData = await statsRes.json()
      const ordersData = await ordersRes.json()
      if (statsData.stats) setStats(mapStats(statsData.stats))
      if (statsData.storeId) setStoreId(statsData.storeId)
      setOrders(ordersData.orders ?? [])
    } catch (err) {
      console.error('Erro ao carregar dados do painel:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false); setStatsLoading(false); setOrdersLoading(false)
    }
  }, [accountId, mapStats])

  const fetchProducts = useCallback(async () => {
    if (!accountId) return
    setProductsLoading(true)
    try {
      const statsRes = await fetch(`/api/store-dashboard/stats?accountId=${accountId}`)
      if (!statsRes.ok) return
      const statsData = await statsRes.json()
      if (!statsData.storeId) return
      const productsRes = await fetch(`/api/products?storeId=${statsData.storeId}&status=ACTIVE&limit=100`)
      if (!productsRes.ok) return
      const productsData = await productsRes.json()
      setProducts(productsData.products ?? [])
    } catch (err) {
      console.error('Erro ao carregar produtos:', err)
    } finally {
      setProductsLoading(false)
    }
  }, [accountId])

  const fetchSettings = useCallback(async () => {
    if (!accountId) return
    setSettingsLoading(true)
    try {
      const res = await fetch(`/api/store-dashboard/settings?accountId=${accountId}`)
      if (!res.ok) { const errData = await res.json().catch(() => ({ error: 'Erro desconhecido' })); throw new Error(errData.error || 'Erro ao buscar configurações') }
      const data = await res.json()
      setStoreSettings({
        id: data.id, name: data.name ?? '', description: data.description, phone: data.phone,
        whatsapp: data.whatsapp, address: data.address, neighborhood: data.neighborhood,
        city: data.city ?? '', state: data.state ?? '', opensAt: data.opensAt, closesAt: data.closesAt,
        openDays: data.openDays ?? '', deliveryFee: data.deliveryFee ?? 0, freeDeliveryAbove: data.freeDeliveryAbove,
        minOrderValue: data.minOrderValue, deliveryRadius: data.deliveryRadius, pixKey: data.pixKey,
        socialMedia: data.socialMedia, logo: data.logo, coverImage: data.coverImage,
        category: data.category ?? '', status: data.status ?? '', rating: data.rating ?? 0,
        totalReviews: data.totalReviews ?? 0, totalSales: data.totalSales ?? 0,
      })
    } catch (err) {
      console.error('Erro ao carregar configurações:', err)
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar configurações')
    } finally {
      setSettingsLoading(false)
    }
  }, [accountId])

  const fetchPromotions = useCallback(async () => {
    if (!accountId) return
    setPromotionsLoading(true)
    try {
      const res = await fetch(`/api/store-dashboard/promotions?accountId=${accountId}&limit=50`)
      if (!res.ok) { const errData = await res.json().catch(() => ({ error: 'Erro desconhecido' })); throw new Error(errData.error || 'Erro ao buscar promoções') }
      const data = await res.json()
      setPromotions(data.promotions ?? [])
    } catch (err) {
      console.error('Erro ao carregar promoções:', err)
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar promoções')
    } finally {
      setPromotionsLoading(false)
    }
  }, [accountId])

  useEffect(() => {
    if (!authLoading && isAuthenticated && isStoreOwner) { fetchStatsAndOrders() }
  }, [authLoading, isAuthenticated, isStoreOwner, fetchStatsAndOrders])

  useEffect(() => {
    if (!authLoading && !isAuthenticated || !isStoreOwner) return
    if (activeTab === 'products' && products.length === 0 && !productsLoading) fetchProducts()
    if (activeTab === 'settings' && !storeSettings && !settingsLoading) fetchSettings()
    if (activeTab === 'promotions' && promotions.length === 0 && !promotionsLoading) fetchPromotions()
  }, [activeTab, authLoading, isAuthenticated, isStoreOwner, products.length, productsLoading, fetchProducts, storeSettings, settingsLoading, fetchSettings, promotions.length, promotionsLoading, fetchPromotions])

  const handleOrderAction = async (orderId: string, action: string, reason?: string) => {
    if (!accountId) return
    setActionLoading(orderId)
    try {
      const body: Record<string, unknown> = { action, accountId }
      if (reason) body.reason = reason
      const res = await fetch(`/api/store-dashboard/orders/${orderId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const errData = await res.json().catch(() => ({ error: 'Erro desconhecido' })); throw new Error(errData.error || 'Erro ao atualizar pedido') }
      const data = await res.json()
      toast.success(data.message || 'Pedido atualizado com sucesso!')
      if (data.order) setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...data.order } : o)))
      setStatsLoading(true)
      fetch(`/api/store-dashboard/stats?accountId=${accountId}`).then((r) => r.json()).then((d) => { if (d.stats) setStats(mapStats(d.stats)) }).catch(() => {}).finally(() => setStatsLoading(false))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar pedido')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    setDeletingProduct(productId)
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' })
      if (!res.ok) { const errData = await res.json().catch(() => ({ error: 'Erro desconhecido' })); throw new Error(errData.error || 'Erro ao deletar produto') }
      toast.success('Produto removido com sucesso!')
      setProducts((prev) => prev.filter((p) => p.id !== productId))
      fetch(`/api/store-dashboard/stats?accountId=${accountId}`).then((r) => r.json()).then((d) => { if (d.stats) setStats(mapStats(d.stats)) }).catch(() => {})
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao deletar produto')
    } finally {
      setDeletingProduct(null)
    }
  }

  const handleSaveSettings = async (data: Record<string, unknown>) => {
    if (!accountId) return
    setSettingsSaving(true)
    try {
      const res = await fetch(`/api/store-dashboard/settings`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accountId, ...data }) })
      if (!res.ok) { const errData = await res.json().catch(() => ({ error: 'Erro desconhecido' })); throw new Error(errData.error || 'Erro ao salvar configurações') }
      const result = await res.json()
      toast.success(result.message || 'Configurações salvas com sucesso!')
      fetchSettings()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar configurações')
    } finally {
      setSettingsSaving(false)
    }
  }

  const handleCreatePromotion = async (data: Record<string, unknown>) => {
    if (!accountId) return
    setPromotionCreating(true)
    try {
      const res = await fetch(`/api/store-dashboard/promotions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accountId, ...data }) })
      if (!res.ok) { const errData = await res.json().catch(() => ({ error: 'Erro desconhecido' })); throw new Error(errData.error || 'Erro ao criar promoção') }
      const result = await res.json()
      toast.success(result.message || 'Promoção criada com sucesso!')
      setPromoDialogOpen(false)
      fetchPromotions()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar promoção')
    } finally {
      setPromotionCreating(false)
    }
  }

  // Computed: Top 5 products by soldCount
  const topProducts = useMemo(() => {
    if (products.length === 0) return []
    return [...products].sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0)).slice(0, 5)
      .map((p) => ({ id: p.id, name: p.name, sold: p.soldCount ?? 0, revenue: p.revenue ?? (p.price * (p.soldCount ?? 0)) }))
  }, [products])

  // Computed: Recent 5 orders
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders])

  // Filtered orders
  const filteredOrders = useMemo(() => {
    if (orderFilter === 'all') return orders
    return orders.filter((o) => o.status === orderFilter)
  }, [orders, orderFilter])

  // Revenue chart data: last 7 days
  const revenueChartData = useMemo(() => {
    const days: { name: string; date: string; valor: number }[] = []
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dayStart = new Date(d)
      dayStart.setUTCHours(3, 0, 0, 0)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)
      const revenue = orders
        .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REFUNDED' && new Date(o.createdAt) >= dayStart && new Date(o.createdAt) < dayEnd)
        .reduce((sum, o) => sum + o.total, 0)
      days.push({
        name: i === 0 ? 'Hoje' : dayNames[d.getDay()],
        date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        valor: revenue,
      })
    }
    return days
  }, [orders])

  const inactiveProducts = stats ? stats.totalProducts - stats.activeProducts : 0

  // Animated stats
  const todayRevenue = useAnimatedCounter(stats?.todayRevenue ?? 0, 1000)
  const todayOrders = useAnimatedCounter(stats?.todayOrders ?? 0, 800)
  const ratingValue = useAnimatedCounter(stats?.averageRating ?? 0, 1200, 1)
  const monthlyRevenue = useAnimatedCounter(stats?.monthlyRevenue ?? stats?.totalRevenue ?? 0, 1400)
  const ratingFloor = Math.floor(stats?.averageRating ?? 0)

  const handleRefresh = () => {
    fetchStatsAndOrders()
    if (activeTab === 'products') fetchProducts()
    if (activeTab === 'settings') fetchSettings()
    if (activeTab === 'promotions') fetchPromotions()
    toast.success('Dados atualizados!')
  }

  const openOrderDetail = (order: OrderData) => {
    setSelectedOrder(order)
    setOrderDetailOpen(true)
  }

  // --- Auth Guard ---
  if (authLoading) return <AuthLoading />
  if (!isAuthenticated || !isStoreOwner) return <AccessDenied />

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern pointer-events-none" />
      {/* Floating gradient orbs for visual depth */}
      <div className="r39-orb r39-orb-1" aria-hidden="true" />
      <div className="r39-orb r39-orb-2" aria-hidden="true" />
      <div className="r39-orb r39-orb-3" aria-hidden="true" />
      <div className="relative">
        {/* Header */}
        <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border -mx-4 px-4 -mt-4 pt-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={goBack} className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 flex-1">
              <Store className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold">Dashboard da Loja</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRefresh} className="h-10 w-10" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 mt-4">
          {error && !stats && !loading ? (
            <ErrorState onRetry={fetchStatsAndOrders} />
          ) : (
          <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full overflow-x-auto hide-scrollbar mb-4">
              <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm r39-nav-glow"><BarChart3 className="h-3.5 w-3.5" /> Visão Geral</TabsTrigger>
              <TabsTrigger value="orders" className="gap-1.5 text-xs sm:text-sm r39-nav-glow"><ShoppingCart className="h-3.5 w-3.5" /> Pedidos</TabsTrigger>
              <TabsTrigger value="products" className="gap-1.5 text-xs sm:text-sm r39-nav-glow"><Package className="h-3.5 w-3.5" /> Produtos</TabsTrigger>
              <TabsTrigger value="promotions" className="gap-1.5 text-xs sm:text-sm r39-nav-glow"><Gift className="h-3.5 w-3.5" /> Promoções</TabsTrigger>
              <TabsTrigger value="reviews" className="gap-1.5 text-xs sm:text-sm r39-nav-glow"><Star className="h-3.5 w-3.5" /> Avaliações</TabsTrigger>
              <TabsTrigger value="settings" className="gap-1.5 text-xs sm:text-sm r39-nav-glow"><Settings className="h-3.5 w-3.5" /> Configurações</TabsTrigger>
              <TabsTrigger value="new-product" className="gap-1.5 text-xs sm:text-sm r39-nav-glow"><Plus className="h-3.5 w-3.5" /> Novo Produto</TabsTrigger>
            </TabsList>

            {/* ══════════ VISÃO GERAL TAB ══════════ */}
            <TabsContent value="overview">
              {loading || statsLoading ? (
                <StatsSkeleton />
              ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key="overview"
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  variants={containerVariants}
                  className="space-y-4"
                >
                  {/* Stats Grid: Vendas Hoje, Pedidos, Avaliação, Faturamento Mensal */}
                  <div className="relative">
                    {/* Gradient mesh background behind stats grid */}
                    <div className="absolute -inset-4 -z-10 overflow-hidden rounded-2xl">
                      <div className="absolute top-0 left-1/4 h-32 w-32 bg-primary/8 rounded-full blur-3xl animate-pulse" />
                      <div className="absolute bottom-0 right-1/4 h-28 w-28 bg-emerald-400/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 bg-teal-400/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                    <StatCard icon={DollarSign} label="Vendas Hoje" value={`R$ ${todayRevenue}`} trend={{ value: '+15%', positive: true }} delay={0} gradient="bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/10" />
                    <StatCard icon={ShoppingCart} label="Pedidos Hoje" value={String(todayOrders)} trend={{ value: '+8%', positive: true }} delay={0.06} gradient="bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/10" />
                    <StatCard icon={Star} label="Avaliação" value={`${ratingValue} ⭐`} suffix={`/ ${stats?.totalReviews || 0} avaliações`} trend={{ value: '+0.2', positive: true }} delay={0.12} gradient="bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/10" />
                    <StatCard icon={Package} label="Produtos Ativos" value={`${stats?.activeProducts || 0}/${stats?.totalProducts || 0}`} suffix={inactiveProducts > 0 ? `${inactiveProducts} inativos` : undefined} trend={{ value: inactiveProducts > 0 ? `${inactiveProducts} inativos` : 'Todos ativos', positive: inactiveProducts === 0 }} delay={0.18} gradient="bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-900/30 dark:to-teal-800/10" />
                    </div>
                  </div>

                  {/* Revenue Mini Chart (div-based for mobile) */}
                  <motion.div variants={itemVariants} transition={{ delay: 0.20 }}>
                    <Card className="border-border/50 r39-chart-grid">
                      <div className="r39-chart-line-draw" />
                      <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          Faturamento do Mês
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">Últimos 7 dias</CardDescription>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 relative z-[2]">
                        <div className="flex items-end gap-1.5 h-24">
                          {revenueChartData.map((d, i) => {
                            const maxVal = Math.max(...revenueChartData.map(r => r.valor), 1)
                            const height = Math.max(8, (d.valor / maxVal) * 100)
                            const isToday = i === revenueChartData.length - 1
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-[9px] text-muted-foreground">{d.valor > 0 ? `${(d.valor / 1000).toFixed(0)}k` : ''}</span>
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: `${height}%` }}
                                  transition={{ delay: 0.3 + i * 0.06, duration: 0.5, type: 'spring' as const }}
                                  className={`w-full rounded-t-md min-h-[4px] ${isToday ? 'bg-gradient-to-t from-primary via-emerald-500 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-gradient-to-t from-primary/15 to-primary/30 hover:from-primary/25 hover:to-primary/50'} transition-colors`}
                                />
                                <span className={`text-[9px] ${isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>{d.name}</span>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <motion.div variants={itemVariants} transition={{ delay: 0.22 }}>
                      <Card className="border-border/50">
                        <CardHeader className="pb-2 pt-4 px-4">
                          <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            Faturamento Mensal
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                          <p className="text-3xl font-bold r39-revenue-pulse r39-revenue-gradient r42-revenue-pulse">R$ {monthlyRevenue}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-emerald-500 r42-revenue-arrow" />
                            <span className="text-xs text-emerald-600 dark:text-emerald-400">+12% vs mês anterior</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                    <motion.div variants={itemVariants} transition={{ delay: 0.24 }}>
                      <Card className="border-border/50">
                        <CardHeader className="pb-2 pt-4 px-4">
                          <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Package className="h-4 w-4 text-amber-500" />
                            Alertas de Estoque
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                          <div className="space-y-2">
                            {products.filter(p => (p.stock ?? 0) <= 5 && p.stock > 0).slice(0, 3).map(p => (
                              <div key={p.id} className="flex items-center justify-between py-1.5">
                                <div className="flex items-center gap-2 min-w-0">
                                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                  <span className="text-xs truncate">{p.name}</span>
                                </div>
                                <Badge className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">{p.stock} un</Badge>
                              </div>
                            ))}
                            {products.filter(p => (p.stock ?? 0) <= 5 && p.stock > 0).length === 0 && (
                              <div className="text-center py-3">
                                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
                                <p className="text-xs text-muted-foreground">Todo o estoque está abastecido</p>
                              </div>
                            )}
                            {products.filter(p => (p.stock ?? 0) === 0).length > 0 && (
                              <div className="mt-2 pt-2 border-t border-border/30">
                                <p className="text-[10px] text-red-500 font-medium">{products.filter(p => p.stock === 0).length} produto(s) sem estoque</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Quick Order Status Overview */}
                  {stats && (stats.pendingOrders > 0 || stats.preparingOrders > 0 || stats.deliveringOrders > 0) && (
                    <motion.div variants={itemVariants} transition={{ delay: 0.22 }}>
                      <Card className="border-border/50">
                        <CardContent className="p-3">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {stats.pendingOrders > 0 && (
                              <div className="text-center cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-lg p-2 transition-colors" onClick={() => { setOrderFilter('PENDING'); setActiveTab('orders') }}>
                                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{stats.pendingOrders}</p>
                                <p className="text-[10px] text-muted-foreground">Pendentes</p>
                              </div>
                            )}
                            {stats.preparingOrders > 0 && (
                              <div className="text-center cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/10 rounded-lg p-2 transition-colors" onClick={() => { setOrderFilter('PREPARING'); setActiveTab('orders') }}>
                                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.preparingOrders}</p>
                                <p className="text-[10px] text-muted-foreground">Preparando</p>
                              </div>
                            )}
                            {stats.deliveringOrders > 0 && (
                              <div className="text-center cursor-pointer hover:bg-cyan-50 dark:hover:bg-cyan-900/10 rounded-lg p-2 transition-colors" onClick={() => { setOrderFilter('DELIVERING'); setActiveTab('orders') }}>
                                <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{stats.deliveringOrders}</p>
                                <p className="text-[10px] text-muted-foreground">Em Entrega</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Quick Actions */}
                  <motion.div variants={itemVariants} transition={{ delay: 0.24 }}>
                    <Card className="border-border/50">
                      <CardContent className="p-4">
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Ações Rápidas</h3>
                        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                          <QuickActionButton icon={Plus} label="Adicionar Produto" onClick={() => setActiveTab('new-product')} delay={0} color="bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/10" />
                          <QuickActionButton icon={Gift} label="Criar Promoção" onClick={() => setPromoDialogOpen(true)} delay={0.04} color="bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/10" />
                          <QuickActionButton icon={Star} label="Ver Avaliações" onClick={() => setActiveTab('reviews')} delay={0.08} color="bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/10" />
                          <QuickActionButton icon={Settings} label="Configurar Loja" onClick={() => setActiveTab('settings')} delay={0.12} color="bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-900/30 dark:to-teal-800/10" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Recent Orders + Top Products - 2 col on lg */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Recent Orders */}
                    <motion.div variants={itemVariants} transition={{ delay: 0.28 }}>
                      <Card className="border-border/50">
                        <CardHeader className="pb-2 pt-4 px-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              Pedidos Recentes
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="text-xs text-primary min-h-[44px] min-w-[44px] h-7" onClick={() => setActiveTab('orders')}>
                              Ver todos <ChevronRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                          {recentOrders.length === 0 ? (
                            <div className="py-6 text-center">
                              <ShoppingCart className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                              <p className="text-xs text-muted-foreground">Nenhum pedido ainda</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {recentOrders.map((order, idx) => (
                                <motion.div
                                  key={order.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.3 + idx * 0.05 }}
                                  className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                  onClick={() => openOrderDetail(order)}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">#{order.orderNumber.slice(-4)}</span>
                                    <div className="min-w-0">
                                      <p className="text-xs font-medium truncate">{order.customerName}</p>
                                      <p className="text-[10px] text-muted-foreground">{timeAgo(order.createdAt)}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs font-semibold text-primary">{formatBRL(order.total)}</span>
                                    <StatusBadge status={order.status} />
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Top Products */}
                    <motion.div variants={itemVariants} transition={{ delay: 0.30 }}>
                      <Card className="border-border/50">
                        <CardHeader className="pb-2 pt-4 px-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-primary" />
                              Top Produtos
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="text-xs text-primary min-h-[44px] min-w-[44px] h-7" onClick={() => setActiveTab('products')}>
                              Ver todos <ChevronRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                          {topProducts.length === 0 ? (
                            <div className="py-6 text-center">
                              <Package className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                              <p className="text-xs text-muted-foreground">Nenhum produto cadastrado</p>
                              <Button variant="outline" size="sm" className="mt-2 text-xs gap-1" onClick={() => setActiveTab('new-product')}>
                                <Plus className="h-3 w-3" /> Criar produto
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {topProducts.map((product, idx) => (
                                <motion.div
                                  key={product.id}
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.32 + idx * 0.05 }}
                                  className="flex items-center gap-3 py-2"
                                >
                                  <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : idx === 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' : idx === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-muted text-muted-foreground'}`}>
                                    {idx + 1}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{product.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{product.sold} vendidos</p>
                                  </div>
                                  <span className="text-xs font-semibold text-primary shrink-0">{formatBRL(product.revenue)}</span>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>
              )}
            </TabsContent>

            {/* ══════════ PEDIDOS TAB ══════════ */}
            <TabsContent value="orders">
              <AnimatePresence mode="wait">
                <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-sm">Todos os Pedidos</h2>
                    <Badge variant="secondary" className="text-xs">{filteredOrders.length} pedidos</Badge>
                  </div>

                  {/* Filter chips */}
                  <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-3">
                    {orderFilterOptions.map((opt) => (
                      <Button
                        key={opt.value}
                        size="sm"
                        variant={orderFilter === opt.value ? 'default' : 'outline'}
                        className={`text-xs h-7 shrink-0 ${orderFilter === opt.value ? 'bg-primary text-primary-foreground' : ''}`}
                        onClick={() => setOrderFilter(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <Card className="border-border/50 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">#</TableHead>
                            <TableHead className="text-xs">Cliente</TableHead>
                            <TableHead className="text-xs">Valor</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                            <TableHead className="text-xs">Data</TableHead>
                            <TableHead className="text-xs text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOrders.map((order) => {
                            const actionCfg = orderActionConfig[order.status]
                            return (
                              <TableRow key={order.id} className="hover:bg-muted/30 r42-order-row-hover">
                                <TableCell className="text-xs font-mono">#{order.orderNumber.slice(-4)}</TableCell>
                                <TableCell>
                                  <div>
                                    <p className="text-xs font-medium">{order.customerName}</p>
                                    <p className="text-[10px] text-muted-foreground">{order.customerPhone || ''}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs font-semibold">{formatBRL(order.total)}</TableCell>
                                <TableCell><StatusBadge status={order.status} /></TableCell>
                                <TableCell className="text-[10px] text-muted-foreground">{timeAgo(order.createdAt)}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button variant="ghost" size="sm" className="min-h-[44px] min-w-[44px] h-7 text-xs" onClick={() => openOrderDetail(order)}>
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    {actionCfg && (
                                      <Button
                                        size="sm"
                                        variant={actionCfg.variant}
                                        className="min-h-[44px] min-w-[44px] h-7 text-xs gap-1"
                                        disabled={actionLoading === order.id}
                                        onClick={() => handleOrderAction(order.id, actionCfg.action)}
                                      >
                                        {actionLoading === order.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <actionCfg.icon className="h-3 w-3" />}
                                        {actionCfg.label}
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden">
                    {ordersLoading ? <OrdersSkeleton /> : filteredOrders.length === 0 ? (
                      <EmptyState icon={ShoppingCart} title="Nenhum pedido encontrado" description={orderFilter !== 'all' ? 'Não há pedidos com esse filtro no momento.' : 'Seus pedidos aparecerão aqui.'} action={() => setOrderFilter('all')} actionLabel={orderFilter !== 'all' ? 'Limpar filtro' : undefined} />
                    ) : (
                      <div className="space-y-2">
                        {filteredOrders.map((order, orderIdx) => {
                          const actionCfg = orderActionConfig[order.status]
                          const statusCfg = orderStatusConfig[order.status]
                          const pulseClass = statusCfg?.dotColor?.includes('amber') ? 'r39-status-pulse-amber' : statusCfg?.dotColor?.includes('red') ? 'r39-status-pulse-red' : 'r39-status-pulse'
                          return (
                            <Card key={order.id} className={`border-border/50 r39-order-item r39-order-lift`}>
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-muted-foreground">#{order.orderNumber.slice(-4)}</span>
                                    <p className="text-xs font-medium">{order.customerName}</p>
                                  </div>
                                  <div className={`${pulseClass} rounded-full`}><StatusBadge status={order.status} /></div>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(order.createdAt)}</span>
                                    <span className="text-xs font-semibold text-primary">{formatBRL(order.total)}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Button variant="ghost" size="sm" className="min-h-[44px] min-w-[44px] h-7 text-xs" onClick={() => openOrderDetail(order)}>
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    {actionCfg && (
                                      <Button size="sm" variant={actionCfg.variant} className="min-h-[44px] min-w-[44px] h-7 text-xs gap-1" disabled={actionLoading === order.id} onClick={() => handleOrderAction(order.id, actionCfg.action)}>
                                        {actionLoading === order.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <actionCfg.icon className="h-3 w-3" />}
                                        {actionCfg.label}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            {/* ══════════ PRODUTOS TAB ══════════ */}
            <TabsContent value="products">
              <AnimatePresence mode="wait">
                <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-sm">Meus Produtos</h2>
                    <Button size="sm" className="bg-primary text-primary-foreground gap-1 min-h-[44px] min-w-[44px] h-8 text-xs" onClick={() => setActiveTab('new-product')}>
                      <Plus className="h-3.5 w-3.5" /> Adicionar Produto
                    </Button>
                  </div>

                  {productsLoading ? <ProductsSkeleton /> : products.length === 0 ? (
                    <EmptyState icon={Package} title="Nenhum produto cadastrado" description="Comece adicionando seu primeiro produto ao catálogo." action={() => setActiveTab('new-product')} actionLabel="Adicionar Produto" />
                  ) : (
                    <div className="space-y-2">
                      {products.map((product) => (
                        <motion.div key={product.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                          <Card className="border-border/50 hover:shadow-sm transition-shadow">
                            <CardContent className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/10 to-emerald-100 dark:to-emerald-900/30 flex items-center justify-center shrink-0 overflow-hidden">
                                  {product.image ? (
                                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <Package className="h-5 w-5 text-primary/50" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{product.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs font-semibold text-primary">{formatBRL(product.price)}</span>
                                    <Badge variant="secondary" className="text-[9px] px-1 py-0">{product.category}</Badge>
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] text-muted-foreground">Estoque: {product.stock}</span>
                                    {product.soldCount !== undefined && (
                                      <span className="text-[10px] text-muted-foreground">• {product.soldCount} vendidos</span>
                                    )}
                                  </div>
                                </div>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive min-h-[44px] min-w-[44px]" disabled={deletingProduct === product.id}>
                                      {deletingProduct === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
                                      <AlertDialogDescription>Tem certeza que deseja excluir &quot;{product.name}&quot;? Esta ação não pode ser desfeita.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => handleDeleteProduct(product.id)}>Excluir</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            {/* ══════════ PROMOÇÕES TAB ══════════ */}
            <TabsContent value="promotions">
              <AnimatePresence mode="wait">
                <motion.div key="promotions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-sm">Minhas Promoções</h2>
                    <Button size="sm" className="bg-primary text-primary-foreground gap-1 min-h-[44px] min-w-[44px] h-8 text-xs" onClick={() => setPromoDialogOpen(true)}>
                      <Plus className="h-3.5 w-3.5" /> Criar Promoção
                    </Button>
                  </div>

                  {promotionsLoading ? <PromotionsSkeleton /> : promotions.length === 0 ? (
                    <EmptyState icon={Megaphone} title="Nenhuma promoção ativa" description="Crie promoções para atrair mais clientes e aumentar suas vendas." action={() => setPromoDialogOpen(true)} actionLabel="Criar Promoção" />
                  ) : (
                    <div className="space-y-2">
                      {promotions.map((promo) => (
                        <motion.div key={promo.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                          <Card className="border-border/50 hover:shadow-sm transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-semibold">{promo.title}</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{promo.description}</p>
                                </div>
                                <Badge className={`text-[10px] px-1.5 py-0 border-0 ${promo.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                  {promo.isActive ? 'Ativa' : 'Inativa'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> {promotionTypeLabels[promo.type] || promo.type}: {promo.type === 'PERCENTAGE' ? `${promo.value}%` : formatBRL(promo.value)}</span>
                                {promo.code && <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{promo.code}</span>}
                              </div>
                              {promo.usageLimit && (
                                <div className="mt-2">
                                  <Progress value={promo.usedCount ? (promo.usedCount / promo.usageLimit) * 100 : 0} className="h-1.5" />
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{promo.usedCount || 0}/{promo.usageLimit} usos</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            {/* ══════════ AVALIAÇÕES TAB ══════════ */}
            <TabsContent value="reviews">
              <AnimatePresence mode="wait">
                <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                  <ReviewsManagement storeId={storeId} />
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            {/* ══════════ CONFIGURAÇÕES TAB ══════════ */}
            <TabsContent value="settings">
              <SettingsTab
                settings={storeSettings}
                loading={settingsLoading}
                saving={settingsSaving}
                onFetch={fetchSettings}
                onSave={handleSaveSettings}
              />
            </TabsContent>

            {/* ══════════ NOVO PRODUTO TAB ══════════ */}
            <TabsContent value="new-product">
              <AnimatePresence mode="wait">
                <motion.div key="new-product" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                  <ProductForm />
                </motion.div>
              </AnimatePresence>
            </TabsContent>
          </Tabs>
          )}
        </div>
      </div>

      {/* Order Detail Dialog */}
      <OrderDetailDialog
        order={selectedOrder}
        open={orderDetailOpen}
        onClose={() => setOrderDetailOpen(false)}
      />

      {/* Promotion Create Dialog */}
      <PromotionCreateDialog
        open={promoDialogOpen}
        onClose={() => setPromoDialogOpen(false)}
        onCreate={handleCreatePromotion}
        loading={promotionCreating}
      />
    </div>
  )
}
