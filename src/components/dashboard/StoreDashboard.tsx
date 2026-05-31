'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Store, ArrowLeft, DollarSign, ShoppingCart, Package, Star,
  TrendingUp, TrendingDown, Plus, Eye, MoreVertical, ChevronRight,
  Clock, User, BarChart3, ThumbsUp, ThumbsDown, Minus, MessageSquare,
  RefreshCw, Loader2, Trash2, ChefHat, Truck, CheckCircle2, XCircle,
  AlertTriangle, Settings, Tag, Percent, Gift, ShieldX, Phone, MapPin,
  Hash, Calendar, Copy, X, Save, ToggleLeft, Timer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
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
import { ReviewsManagement } from './ReviewsManagement'
import { ProductForm } from './ProductForm'

// ─── Types ───
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

// ─── Animated Counter Hook ───
function useAnimatedCounter(target: number, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0)

  const animate = useCallback(() => {
    const startTime = Date.now()
    const step = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutExpo
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

// ─── Status Config ───
const orderStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  PREPARING: { label: 'Preparando', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  READY: { label: 'Pronto', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  DELIVERING: { label: 'Em Entrega', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  DELIVERED: { label: 'Entregue', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

const promotionTypeLabels: Record<string, string> = {
  PERCENTAGE: 'Desconto %',
  FIXED_AMOUNT: 'Desconto Fixo',
  FREE_DELIVERY: 'Frete Grátis',
  BUY_X_GET_Y: 'Compre X Ganhe Y',
}

// ─── Order Action Config ───
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
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
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

// ─── Stat Card ───
function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  trend,
  delay,
}: {
  icon: typeof DollarSign
  label: string
  value: string
  suffix?: string
  trend: { value: string; positive: boolean }
  delay: number
}) {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden relative">
        {/* Subtle gradient accent top line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-emerald-400 to-accent/60 opacity-60" />
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0">
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
            <p className="text-2xl font-bold">
              {value}{suffix && <span className="text-sm font-normal text-muted-foreground ml-0.5">{suffix}</span>}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Skeleton Loaders ───
function StatsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
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
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-3 space-y-2">
              <Skeleton className="h-5 w-16 mx-auto" />
              <Skeleton className="h-3 w-10 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-end gap-2 h-36">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-20 w-full rounded-t-md" />
                <Skeleton className="h-3 w-6 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
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

// ─── Error State ───
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

// ─── Access Denied State ───
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

// ─── Auth Loading State ───
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

// ─── Order Detail Dialog ───
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
  const statusCfg = orderStatusConfig[order.status] || { label: order.status, color: 'bg-muted text-muted-foreground' }

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
          {/* Status & Customer */}
          <div className="flex items-center justify-between">
            <Badge className={`${statusCfg.color} text-xs px-3 py-1 border-0`}>
              {statusCfg.label}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(order.createdAt)}
            </span>
          </div>

          {/* Customer */}
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

          {/* Items */}
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

          {/* Totals */}
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

          {/* Delivery info */}
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

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Histórico de status</p>
              <div className="space-y-2">
                {order.statusHistory.map((entry) => {
                  const cfg = orderStatusConfig[entry.status]
                  return (
                    <div key={entry.id} className="flex items-center gap-2 text-xs">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${
                        entry.status === 'DELIVERED' ? 'bg-emerald-500' :
                        entry.status === 'CANCELLED' ? 'bg-red-500' :
                        'bg-primary'
                      }`} />
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

// ─── Settings Form ───
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
  // Derive initial form from settings
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

  // Sync form when settings load (one-time, via render-phase assignment)
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
      {/* Info card */}
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

      {/* Basic Info */}
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
            <Input
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="mt-1 h-9 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="mt-1 min-h-[80px] resize-none text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" /> Telefone
              </Label>
              <Input
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="(99) 99999-9999"
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" /> WhatsApp
              </Label>
              <Input
                value={form.whatsapp}
                onChange={(e) => updateField('whatsapp', e.target.value)}
                placeholder="+5599999999999"
                className="mt-1 h-9 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card className="border-border/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Endereço</Label>
            <Input
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              className="mt-1 h-9 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Bairro</Label>
            <Input
              value={form.neighborhood}
              onChange={(e) => updateField('neighborhood', e.target.value)}
              className="mt-1 h-9 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card className="border-border/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Horário de Funcionamento
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Abre às</Label>
              <Input
                type="time"
                value={form.opensAt}
                onChange={(e) => updateField('opensAt', e.target.value)}
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Fecha às</Label>
              <Input
                type="time"
                value={form.closesAt}
                onChange={(e) => updateField('closesAt', e.target.value)}
                className="mt-1 h-9 text-sm"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Dias de funcionamento (1=Dom, 2=Seg, ..., 7=Sáb)</Label>
            <Input
              value={form.openDays}
              onChange={(e) => updateField('openDays', e.target.value)}
              placeholder="Ex: 2,3,4,5,6"
              className="mt-1 h-9 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Settings */}
      <Card className="border-border/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            Entrega
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Taxa de entrega (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.deliveryFee}
                onChange={(e) => updateField('deliveryFee', e.target.value)}
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Frete grátis acima de (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.freeDeliveryAbove}
                onChange={(e) => updateField('freeDeliveryAbove', e.target.value)}
                className="mt-1 h-9 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Pedido mínimo (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.minOrderValue}
                onChange={(e) => updateField('minOrderValue', e.target.value)}
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Raio de entrega (km)</Label>
              <Input
                type="number"
                value={form.deliveryRadius}
                onChange={(e) => updateField('deliveryRadius', e.target.value)}
                className="mt-1 h-9 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment */}
      <Card className="border-border/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Chave PIX</Label>
            <Input
              value={form.pixKey}
              onChange={(e) => updateField('pixKey', e.target.value)}
              className="mt-1 h-9 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Redes Sociais (link)</Label>
            <Input
              value={form.socialMedia}
              onChange={(e) => updateField('socialMedia', e.target.value)}
              className="mt-1 h-9 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-11 bg-primary text-primary-foreground font-semibold gap-2"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Salvar Configurações
          </>
        )}
      </Button>
    </motion.div>
  )
}

// ─── Promotion Create Dialog ───
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
    title: '',
    description: '',
    type: 'PERCENTAGE',
    value: '',
    minOrderValue: '',
    maxDiscount: '',
    usageLimit: '',
    code: '',
    startsAt: '',
    endsAt: '',
  })

  const updateField = (field: keyof PromotionForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast.error('Título é obrigatório')
      return
    }
    if (!form.value || parseFloat(form.value) <= 0) {
      toast.error('Valor da promoção é obrigatório')
      return
    }
    if (!form.startsAt || !form.endsAt) {
      toast.error('Datas de início e fim são obrigatórias')
      return
    }
    if (new Date(form.endsAt) <= new Date(form.startsAt)) {
      toast.error('Data de fim deve ser posterior à data de início')
      return
    }

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
    setForm({
      title: '',
      description: '',
      type: 'PERCENTAGE',
      value: '',
      minOrderValue: '',
      maxDiscount: '',
      usageLimit: '',
      code: '',
      startsAt: '',
      endsAt: '',
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Criar Promoção
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Título *</Label>
            <Input
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Ex: Promoção de Verão"
              className="mt-1 h-9 text-sm"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="mt-1 min-h-[60px] resize-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Tipo *</Label>
              <select
                value={form.type}
                onChange={(e) => updateField('type', e.target.value)}
                className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {Object.entries(promotionTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Valor {form.type === 'PERCENTAGE' ? '(%)' : '(R$)'} *
              </Label>
              <Input
                type="number"
                step={form.type === 'PERCENTAGE' ? '1' : '0.01'}
                value={form.value}
                onChange={(e) => updateField('value', e.target.value)}
                placeholder={form.type === 'PERCENTAGE' ? '10' : '5.00'}
                className="mt-1 h-9 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Pedido mínimo (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.minOrderValue}
                onChange={(e) => updateField('minOrderValue', e.target.value)}
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Desconto máximo (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.maxDiscount}
                onChange={(e) => updateField('maxDiscount', e.target.value)}
                className="mt-1 h-9 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Limite de uso</Label>
              <Input
                type="number"
                value={form.usageLimit}
                onChange={(e) => updateField('usageLimit', e.target.value)}
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Código promocional</Label>
              <Input
                value={form.code}
                onChange={(e) => updateField('code', e.target.value.toUpperCase())}
                placeholder="Ex: VERAO20"
                className="mt-1 h-9 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Início *</Label>
              <Input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => updateField('startsAt', e.target.value)}
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Fim *</Label>
              <Input
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => updateField('endsAt', e.target.value)}
                className="mt-1 h-9 text-sm"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} className="h-9 text-xs">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="h-9 text-xs gap-1 bg-primary text-primary-foreground"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Plus className="h-3 w-3" />
            )}
            Criar Promoção
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Component ───
export function StoreDashboard() {
  const { goBack, currentUser } = useAppStore()
  const { isStoreOwner, isLoading: authLoading, isAuthenticated } = useAuth()

  // State
  const [stats, setStats] = useState<StatsData | null>(null)
  const [products, setProducts] = useState<ProductData[]>([])
  const [orders, setOrders] = useState<OrderData[]>([])
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null)
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

  // Helper: map stats API response to StatsData
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
  }), [])

  // Fetch stats and orders on mount
  const fetchStatsAndOrders = useCallback(async () => {
    if (!accountId) {
      setError('Você precisa estar logado para acessar o painel.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch(`/api/store-dashboard/stats?accountId=${accountId}`),
        fetch(`/api/store-dashboard/orders?accountId=${accountId}&limit=50`),
      ])

      if (!statsRes.ok) {
        const errData = await statsRes.json().catch(() => ({ error: 'Erro desconhecido' }))
        throw new Error(errData.error || 'Erro ao buscar estatísticas')
      }

      if (!ordersRes.ok) {
        const errData = await ordersRes.json().catch(() => ({ error: 'Erro desconhecido' }))
        throw new Error(errData.error || 'Erro ao buscar pedidos')
      }

      const statsData = await statsRes.json()
      const ordersData = await ordersRes.json()

      // Stats are nested under .stats in the API response
      if (statsData.stats) {
        setStats(mapStats(statsData.stats))
      }

      setOrders(ordersData.orders ?? [])
    } catch (err) {
      console.error('Erro ao carregar dados do painel:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
      setStatsLoading(false)
      setOrdersLoading(false)
    }
  }, [accountId, mapStats])

  // Fetch products when products tab is active
  const fetchProducts = useCallback(async () => {
    if (!accountId) return

    setProductsLoading(true)
    try {
      // First fetch stats to get storeId
      const statsRes = await fetch(`/api/store-dashboard/stats?accountId=${accountId}`)
      if (!statsRes.ok) return
      const statsData = await statsRes.json()

      if (!statsData.storeId) return

      // Fetch active products
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

  // Fetch store settings
  const fetchSettings = useCallback(async () => {
    if (!accountId) return

    setSettingsLoading(true)
    try {
      const res = await fetch(`/api/store-dashboard/settings?accountId=${accountId}`)
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
        throw new Error(errData.error || 'Erro ao buscar configurações')
      }
      const data = await res.json()
      setStoreSettings({
        id: data.id,
        name: data.name ?? '',
        description: data.description,
        phone: data.phone,
        whatsapp: data.whatsapp,
        address: data.address,
        neighborhood: data.neighborhood,
        city: data.city ?? '',
        state: data.state ?? '',
        opensAt: data.opensAt,
        closesAt: data.closesAt,
        openDays: data.openDays ?? '',
        deliveryFee: data.deliveryFee ?? 0,
        freeDeliveryAbove: data.freeDeliveryAbove,
        minOrderValue: data.minOrderValue,
        deliveryRadius: data.deliveryRadius,
        pixKey: data.pixKey,
        socialMedia: data.socialMedia,
        logo: data.logo,
        coverImage: data.coverImage,
        category: data.category ?? '',
        status: data.status ?? '',
        rating: data.rating ?? 0,
        totalReviews: data.totalReviews ?? 0,
        totalSales: data.totalSales ?? 0,
      })
    } catch (err) {
      console.error('Erro ao carregar configurações:', err)
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar configurações')
    } finally {
      setSettingsLoading(false)
    }
  }, [accountId])

  // Fetch promotions
  const fetchPromotions = useCallback(async () => {
    if (!accountId) return

    setPromotionsLoading(true)
    try {
      const res = await fetch(`/api/store-dashboard/promotions?accountId=${accountId}&limit=50`)
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
        throw new Error(errData.error || 'Erro ao buscar promoções')
      }
      const data = await res.json()
      setPromotions(data.promotions ?? [])
    } catch (err) {
      console.error('Erro ao carregar promoções:', err)
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar promoções')
    } finally {
      setPromotionsLoading(false)
    }
  }, [accountId])

  // Load main data on mount
  useEffect(() => {
    if (!authLoading && isAuthenticated && isStoreOwner) {
      fetchStatsAndOrders()
    }
  }, [authLoading, isAuthenticated, isStoreOwner, fetchStatsAndOrders])

  // Load tab-specific data
  useEffect(() => {
    if (!authLoading && !isAuthenticated || !isStoreOwner) return
    if (activeTab === 'products' && products.length === 0 && !productsLoading) {
      fetchProducts()
    }
    if (activeTab === 'settings' && !storeSettings && !settingsLoading) {
      fetchSettings()
    }
    if (activeTab === 'promotions' && promotions.length === 0 && !promotionsLoading) {
      fetchPromotions()
    }
  }, [activeTab, authLoading, isAuthenticated, isStoreOwner, products.length, productsLoading, fetchProducts, storeSettings, settingsLoading, fetchSettings, promotions.length, promotionsLoading, fetchPromotions])

  // Order action handler (accept, prepare, ready, start_delivery, deliver, reject, cancel)
  const handleOrderAction = async (orderId: string, action: string, reason?: string) => {
    if (!accountId) return

    setActionLoading(orderId)
    try {
      const body: Record<string, unknown> = { action, accountId }
      if (reason) body.reason = reason

      const res = await fetch(`/api/store-dashboard/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
        throw new Error(errData.error || 'Erro ao atualizar pedido')
      }

      const data = await res.json()
      toast.success(data.message || 'Pedido atualizado com sucesso!')

      // Update order in local state
      if (data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...data.order } : o))
        )
      }

      // Refresh stats
      setStatsLoading(true)
      fetch(`/api/store-dashboard/stats?accountId=${accountId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.stats) {
            setStats(mapStats(data.stats))
          }
        })
        .catch(() => {})
        .finally(() => setStatsLoading(false))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar pedido')
    } finally {
      setActionLoading(null)
    }
  }

  // Delete product handler
  const handleDeleteProduct = async (productId: string) => {
    setDeletingProduct(productId)
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
        throw new Error(errData.error || 'Erro ao deletar produto')
      }

      toast.success('Produto removido com sucesso!')
      setProducts((prev) => prev.filter((p) => p.id !== productId))

      // Refresh stats
      fetch(`/api/store-dashboard/stats?accountId=${accountId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.stats) {
            setStats(mapStats(data.stats))
          }
        })
        .catch(() => {})
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao deletar produto')
    } finally {
      setDeletingProduct(null)
    }
  }

  // Save settings handler
  const handleSaveSettings = async (data: Record<string, unknown>) => {
    if (!accountId) return

    setSettingsSaving(true)
    try {
      const res = await fetch(`/api/store-dashboard/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, ...data }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
        throw new Error(errData.error || 'Erro ao salvar configurações')
      }

      const result = await res.json()
      toast.success(result.message || 'Configurações salvas com sucesso!')

      // Refresh settings
      fetchSettings()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar configurações')
    } finally {
      setSettingsSaving(false)
    }
  }

  // Create promotion handler
  const handleCreatePromotion = async (data: Record<string, unknown>) => {
    if (!accountId) return

    setPromotionCreating(true)
    try {
      const res = await fetch(`/api/store-dashboard/promotions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, ...data }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
        throw new Error(errData.error || 'Erro ao criar promoção')
      }

      const result = await res.json()
      toast.success(result.message || 'Promoção criada com sucesso!')
      setPromoDialogOpen(false)

      // Refresh promotions list
      fetchPromotions()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar promoção')
    } finally {
      setPromotionCreating(false)
    }
  }

  // Computed values
  const topProducts = useMemo(() => {
    if (products.length === 0) return []
    return [...products]
      .sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0))
      .slice(0, 5)
      .map((p) => ({ name: p.name, sales: p.soldCount ?? 0 }))
  }, [products])

  // Filtered orders
  const filteredOrders = useMemo(() => {
    if (orderFilter === 'all') return orders
    return orders.filter((o) => o.status === orderFilter)
  }, [orders, orderFilter])

  // Weekly sales computed from orders (last 7 days)
  const weeklySales = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const now = new Date()
    const result = days.map((day) => ({ day, value: 0 }))

    orders.forEach((order) => {
      if (order.status === 'CANCELLED') return
      const orderDate = new Date(order.createdAt)
      const diffDays = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays < 7) {
        const dayIndex = orderDate.getDay()
        result[dayIndex].value += order.total
      }
    })

    return result
  }, [orders])

  const maxSaleValue = Math.max(...weeklySales.map((s) => s.value), 1)
  const inactiveProducts = stats ? stats.totalProducts - stats.activeProducts : 0

  // Animated stats (use 0 until data loads)
  const totalRevenue = useAnimatedCounter(stats?.totalRevenue ?? 0, 1400)
  const todayRevenue = useAnimatedCounter(stats?.todayRevenue ?? 0, 1000)
  const totalOrders = useAnimatedCounter(stats?.totalOrders ?? 0, 1000)
  const todayOrders = useAnimatedCounter(stats?.todayOrders ?? 0, 800)
  const activeProductsCount = useAnimatedCounter(stats?.activeProducts ?? 0, 800)
  const draftProductsCount = useAnimatedCounter(inactiveProducts, 600)
  const ratingValue = useAnimatedCounter(stats?.averageRating ?? 0, 1200, 1)
  const ratingFloor = Math.floor(stats?.averageRating ?? 0)

  // Refresh handler
  const handleRefresh = () => {
    fetchStatsAndOrders()
    if (activeTab === 'products') fetchProducts()
    if (activeTab === 'settings') fetchSettings()
    if (activeTab === 'promotions') fetchPromotions()
    toast.success('Dados atualizados!')
  }

  // Open order detail
  const openOrderDetail = (order: OrderData) => {
    setSelectedOrder(order)
    setOrderDetailOpen(true)
  }

  // ─── Auth Guard ───
  if (authLoading) return <AuthLoading />
  if (!isAuthenticated || !isStoreOwner) return <AccessDenied />

  return (
    <div className="min-h-screen pb-24 relative">
      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 grid-pattern pointer-events-none" />
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
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="h-10 w-10"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-4">
        {/* Error state */}
        {error && !stats && !loading ? (
          <ErrorState onRetry={fetchStatsAndOrders} />
        ) : (
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto overflow-x-auto hide-scrollbar mb-4 relative">
            {/* Animated underline indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300" />
            <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
              <BarChart3 className="h-3.5 w-3.5" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-1.5 text-xs sm:text-sm">
              <Package className="h-3.5 w-3.5" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5 text-xs sm:text-sm">
              <ShoppingCart className="h-3.5 w-3.5" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 text-xs sm:text-sm">
              <TrendingUp className="h-3.5 w-3.5" />
              Análises
            </TabsTrigger>
            <TabsTrigger value="promotions" className="gap-1.5 text-xs sm:text-sm">
              <Gift className="h-3.5 w-3.5" />
              Promoções
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-1.5 text-xs sm:text-sm">
              <MessageSquare className="h-3.5 w-3.5" />
              Avaliações
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5 text-xs sm:text-sm">
              <Settings className="h-3.5 w-3.5" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="new-product" className="gap-1.5 text-xs sm:text-sm">
              <Plus className="h-3.5 w-3.5" />
              Novo Produto
            </TabsTrigger>
          </TabsList>

          {/* ── Overview Tab ── */}
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
                {/* Revenue & Orders Row */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    icon={DollarSign}
                    label="Receita total"
                    value={`R$ ${totalRevenue}`}
                    trend={{ value: '+12%', positive: true }}
                    delay={0}
                  />
                  <StatCard
                    icon={ShoppingCart}
                    label="Total de pedidos"
                    value={String(totalOrders)}
                    trend={{ value: '+8%', positive: true }}
                    delay={0.06}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <motion.div variants={itemVariants} transition={{ delay: 0.12 }}>
                    <Card className="stat-gradient-primary hover:shadow-md transition-shadow">
                      <CardContent className="p-3 text-center">
                        <p className="text-lg font-bold text-primary animate-count-up">R$ {todayRevenue}</p>
                        <p className="text-[10px] text-muted-foreground">Hoje</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div variants={itemVariants} transition={{ delay: 0.15 }}>
                    <Card className="stat-gradient-amber hover:shadow-md transition-shadow">
                      <CardContent className="p-3 text-center">
                        <p className="text-lg font-bold text-amber-600 dark:text-amber-400 animate-count-up" style={{ animationDelay: '0.1s' }}>{todayOrders}</p>
                        <p className="text-[10px] text-muted-foreground">Pedidos hoje</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div variants={itemVariants} transition={{ delay: 0.18 }}>
                    <Card className="stat-gradient-teal hover:shadow-md transition-shadow">
                      <CardContent className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          <p className="text-lg font-bold animate-count-up" style={{ animationDelay: '0.2s' }}>{ratingValue}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Avaliação</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Quick order status overview */}
                {stats && (stats.pendingOrders > 0 || stats.preparingOrders > 0 || stats.deliveringOrders > 0) && (
                  <motion.div variants={itemVariants} transition={{ delay: 0.2 }}>
                    <Card className="border-border/50">
                      <CardContent className="p-3">
                        <div className="grid grid-cols-3 gap-2">
                          {stats.pendingOrders > 0 && (
                            <div className="text-center cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-lg p-2 transition-colors" onClick={() => { setOrderFilter('PENDING'); setActiveTab('orders') }}>
                              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{stats.pendingOrders}</p>
                              <p className="text-[10px] text-muted-foreground">Pendentes</p>
                            </div>
                          )}
                          {stats.preparingOrders > 0 && (
                            <div className="text-center cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-lg p-2 transition-colors" onClick={() => { setOrderFilter('PREPARING'); setActiveTab('orders') }}>
                              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{stats.preparingOrders}</p>
                              <p className="text-[10px] text-muted-foreground">Preparando</p>
                            </div>
                          )}
                          {stats.deliveringOrders > 0 && (
                            <div className="text-center cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/10 rounded-lg p-2 transition-colors" onClick={() => { setOrderFilter('DELIVERING'); setActiveTab('orders') }}>
                              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.deliveringOrders}</p>
                              <p className="text-[10px] text-muted-foreground">Em Entrega</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Weekly Sales Chart */}
                <motion.div variants={itemVariants} transition={{ delay: 0.2 }}>
                  <Card className="border-border/50 overflow-hidden glassmorphism-strong">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        Vendas dos últimos 7 dias
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      {/* Chart area with gradient + grid */}
                      <div className="rounded-lg bg-gradient-to-b from-primary/[0.03] to-transparent grid-pattern p-3">
                        <div className="flex items-end gap-2 h-36">
                          {weeklySales.map((day, i) => {
                            const isToday = i === new Date().getDay()
                            return (
                              <motion.div
                                key={day.day}
                                className="flex-1 flex flex-col items-center gap-1.5"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 200 }}
                              >
                                <motion.span
                                  className={`text-[10px] font-semibold ${isToday ? 'text-primary' : 'text-muted-foreground'}`}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.5 + i * 0.08 }}
                                >
                                  {day.value > 0 ? Math.round(day.value) : '0'}
                                </motion.span>
                                <motion.div
                                  className={`w-full rounded-t-md min-h-[4px] ${isToday
                                    ? 'bg-gradient-to-t from-primary to-emerald-300 shadow-sm shadow-primary/20'
                                    : 'bg-gradient-to-t from-primary/60 to-emerald-400/60'
                                  }`}
                                  initial={{ height: 0 }}
                                  animate={{ height: `${(day.value / maxSaleValue) * 100}%` }}
                                  transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 150, damping: 20 }}
                                />
                                <span className={`text-[10px] ${isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>{day.day}</span>
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Products & Rating Row */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.div variants={itemVariants} transition={{ delay: 0.25 }}>
                    <Card className="border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Package className="h-4 w-4 text-primary" />
                          <p className="text-sm font-semibold">Produtos</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xl font-bold">{activeProductsCount}</p>
                            <p className="text-[10px] text-muted-foreground">Ativos</p>
                          </div>
                          <Separator orientation="vertical" className="h-8" />
                          <div>
                            <p className="text-xl font-bold text-muted-foreground">{draftProductsCount}</p>
                            <p className="text-[10px] text-muted-foreground">Inativos</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={itemVariants} transition={{ delay: 0.3 }}>
                    <Card className="border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="h-4 w-4 text-amber-500" />
                          <p className="text-sm font-semibold">Avaliação</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-3xl font-bold">{ratingValue}</p>
                          <div>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-3.5 w-3.5 ${s <= ratingFloor ? 'text-amber-500 fill-amber-500' : 'text-amber-200'}`}
                                />
                              ))}
                            </div>
                            <p className="text-[10px] text-muted-foreground">{ratingValue} de 5.0</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
            )}
          </TabsContent>

          {/* ── Products Tab ── */}
          <TabsContent value="products">
            <AnimatePresence mode="wait">
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-sm">Meus Produtos</h2>
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground gap-1 h-8 text-xs"
                    onClick={() => setActiveTab('new-product')}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar Produto
                  </Button>
                </div>

                {productsLoading ? (
                  <ProductsSkeleton />
                ) : products.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">Nenhum produto encontrado</h3>
                    <p className="text-sm text-muted-foreground">Adicione produtos para começar a vender.</p>
                  </motion.div>
                ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2"
                >
                  {products.map((product) => (
                    <motion.div key={product.id} variants={itemVariants}>
                      <Card className="border-border/50 hover:shadow-sm transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            {/* Mini image placeholder */}
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-emerald-100 dark:from-primary/10 dark:to-emerald-900/30 flex items-center justify-center shrink-0">
                              <Package className="h-5 w-5 text-primary/60" />
                            </div>

                            {/* Product info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm truncate">{product.name}</p>
                                <Badge
                                  className={`text-[9px] px-1.5 py-0 border-0 shrink-0 ${
                                    product.status === 'ACTIVE'
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  Ativo
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm font-bold text-primary">{formatBRL(product.price)}</span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                  <Package className="h-2.5 w-2.5" />
                                  {product.stock > 0 ? `${product.stock} un.` : 'Esgotado'}
                                </span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                  <ShoppingCart className="h-2.5 w-2.5" />
                                  {product.soldCount ?? 0} vendas
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Deletar produto</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja remover <strong>{product.name}</strong>? Esta ação pode ser desfeita reativando o produto depois.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteProduct(product.id)}
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                      disabled={deletingProduct === product.id}
                                    >
                                      {deletingProduct === product.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        'Deletar'
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ── Orders Tab ── */}
          <TabsContent value="orders">
            <AnimatePresence mode="wait">
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-sm">Pedidos Recentes</h2>
                  <Badge variant="secondary" className="text-[10px]">{filteredOrders.length} pedidos</Badge>
                </div>

                {/* Order status filters */}
                <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-3 mb-3">
                  {orderFilterOptions.map((opt) => (
                    <Button
                      key={opt.value}
                      size="sm"
                      variant={orderFilter === opt.value ? 'default' : 'outline'}
                      className={`h-7 text-[10px] shrink-0 ${orderFilter === opt.value ? 'bg-primary text-primary-foreground' : ''}`}
                      onClick={() => setOrderFilter(opt.value)}
                    >
                      {opt.label}
                      {opt.value !== 'all' && (
                        <Badge className="ml-1 text-[8px] px-1 py-0 bg-primary-foreground/20 text-primary-foreground border-0">
                          {orders.filter((o) => opt.value === 'all' || o.status === opt.value).length}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>

                {ordersLoading ? (
                  <OrdersSkeleton />
                ) : filteredOrders.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">Nenhum pedido encontrado</h3>
                    <p className="text-sm text-muted-foreground">
                      {orderFilter === 'all'
                        ? 'Os pedidos dos seus clientes aparecerão aqui.'
                        : `Nenhum pedido com status "${orderFilterOptions.find(o => o.value === orderFilter)?.label}".`
                      }
                    </p>
                  </motion.div>
                ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2"
                >
                  {filteredOrders.map((order) => {
                    const statusCfg = orderStatusConfig[order.status] || { label: order.status, color: 'bg-muted text-muted-foreground' }
                    const actionCfg = orderActionConfig[order.status]
                    return (
                      <motion.div key={order.id} variants={itemVariants}>
                        <Card className="border-border/50 hover:shadow-sm transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                  <User className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-semibold text-sm">{order.customerName || 'Cliente'}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                    <Clock className="h-2.5 w-2.5" />
                                    {timeAgo(order.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <Badge className={`${statusCfg.color} text-[10px] px-2 py-0.5 border-0`}>
                                {statusCfg.label}
                              </Badge>
                            </div>

                            <Separator className="my-3" />

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground font-mono">#{order.orderNumber}</span>
                                <span className="text-xs text-muted-foreground">{order.items?.length ?? 0} itens</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm">{formatBRL(order.total)}</span>
                                {actionCfg ? (
                                  <Button
                                    variant={actionCfg.variant}
                                    size="sm"
                                    className="h-7 text-xs gap-1 px-2 btn-shine"
                                    onClick={() => handleOrderAction(order.id, actionCfg.action)}
                                    disabled={actionLoading === order.id}
                                  >
                                    {actionLoading === order.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <actionCfg.icon className="h-3 w-3" />
                                    )}
                                    {actionCfg.label}
                                  </Button>
                                ) : null}
                              </div>
                            </div>

                            {/* Action row: reject, details */}
                            <div className="flex items-center gap-2 mt-3">
                              {/* Reject/Cancel buttons for PENDING and CONFIRMED */}
                              {order.status === 'PENDING' && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-xs gap-1 px-2 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                                      disabled={actionLoading === order.id}
                                    >
                                      <XCircle className="h-3 w-3" />
                                      Rejeitar
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Rejeitar pedido #{order.orderNumber}</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja rejeitar este pedido? O estoque dos produtos será restaurado.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleOrderAction(order.id, 'reject')}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                      >
                                        Rejeitar Pedido
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                              {order.status === 'CONFIRMED' && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-xs gap-1 px-2 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                                      disabled={actionLoading === order.id}
                                    >
                                      <XCircle className="h-3 w-3" />
                                      Cancelar
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Cancelar pedido #{order.orderNumber}</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja cancelar este pedido? O estoque dos produtos será restaurado.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleOrderAction(order.id, 'cancel')}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                      >
                                        Cancelar Pedido
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs gap-1 px-2"
                                onClick={() => openOrderDetail(order)}
                              >
                                <Eye className="h-3 w-3" />
                                Ver detalhes
                              </Button>
                            </div>

                            {/* Mini gradient accent line */}
                            <div className="mt-3 h-[1px] bg-gradient-to-r from-primary/20 via-accent/20 to-transparent" />
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ── Analytics Tab ── */}
          <TabsContent value="analytics">
            <AnimatePresence mode="wait">
              <motion.div
                key="analytics"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                variants={containerVariants}
                className="space-y-4"
              >
                {/* Top Products */}
                <motion.div variants={itemVariants}>
                  <Card className="border-border/50 overflow-hidden card-aurora">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Top 5 Produtos por Vendas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-3">
                      {topProducts.length > 0 ? (
                        topProducts.map((product, i) => (
                          <div key={product.name} className="flex items-center gap-3">
                            <span className="text-xs font-bold text-muted-foreground w-5 text-center">{i + 1}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium">{product.name}</span>
                                <span className="text-xs font-bold text-primary">{product.sales} vendas</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(product.sales / (topProducts[0]?.sales || 1)) * 100}%` }}
                                  transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado de vendas disponível</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Revenue Comparison */}
                <motion.div variants={itemVariants}>
                  <Card className="border-border/50 overflow-hidden glassmorphism-strong">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        Comparação de Receita
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{formatBRL(stats?.totalRevenue ?? 0)}</p>
                          <p className="text-xs text-muted-foreground mt-1">Total acumulado</p>
                          <Badge className="text-[10px] mt-1 text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 border-0 gap-0.5">
                            <TrendingUp className="h-2.5 w-2.5" />
                            +12%
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{formatBRL(stats?.todayRevenue ?? 0)}</p>
                          <p className="text-xs text-muted-foreground mt-1">Hoje</p>
                          <Badge variant="secondary" className="text-[10px] mt-1 gap-0.5">
                            <Minus className="h-2.5 w-2.5" />
                            Hoje
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Order Status Breakdown */}
                <motion.div variants={itemVariants}>
                  <Card className="border-border/50">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                        Status dos Pedidos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-3">
                      {stats ? (
                        [
                          { label: 'Pendentes', value: stats.pendingOrders, color: 'bg-amber-500' },
                          { label: 'Preparando', value: stats.preparingOrders, color: 'bg-orange-500' },
                          { label: 'Em Entrega', value: stats.deliveringOrders, color: 'bg-purple-500' },
                          { label: 'Entregues', value: stats.completedOrders, color: 'bg-emerald-500' },
                          { label: 'Cancelados', value: stats.cancelledOrders, color: 'bg-red-500' },
                        ].map((item, i) => (
                          <div key={item.label}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium">{item.label}</span>
                              </div>
                              <span className="text-xs font-bold">{item.value}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full ${item.color} rounded-full`}
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.totalOrders > 0 ? (item.value / stats.totalOrders) * 100 : 0}%` }}
                                transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">Carregando dados...</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Customer Satisfaction */}
                <motion.div variants={itemVariants}>
                  <Card className="border-border/50">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        Satisfação dos Clientes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-3">
                      {[
                        { label: 'Positivo', value: stats?.averageRating && stats.averageRating >= 4 ? 92 : 70, color: 'bg-emerald-500' },
                        { label: 'Neutro', value: stats?.averageRating && stats.averageRating >= 4 ? 5 : 20, color: 'bg-amber-500' },
                        { label: 'Negativo', value: stats?.averageRating && stats.averageRating >= 4 ? 3 : 10, color: 'bg-red-500' },
                      ].map((item, i) => (
                        <div key={item.label}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              {item.label === 'Positivo' ? (
                                <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />
                              ) : item.label === 'Negativo' ? (
                                <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
                              ) : (
                                <Minus className="h-3.5 w-3.5 text-amber-500" />
                              )}
                              <span className="text-xs font-medium">{item.label}</span>
                            </div>
                            <span className="text-xs font-bold">{item.value}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${item.color} rounded-full`}
                              initial={{ width: 0 }}
                              animate={{ width: `${item.value}%` }}
                              transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ── Promotions Tab ── */}
          <TabsContent value="promotions">
            <AnimatePresence mode="wait">
              <motion.div
                key="promotions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-sm">Promoções</h2>
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground gap-1 h-8 text-xs"
                    onClick={() => setPromoDialogOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Nova Promoção
                  </Button>
                </div>

                {promotionsLoading ? (
                  <PromotionsSkeleton />
                ) : promotions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Gift className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">Nenhuma promoção</h3>
                    <p className="text-sm text-muted-foreground">Crie promoções para atrair mais clientes.</p>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-2"
                  >
                    {promotions.map((promo) => {
                      const isExpired = new Date(promo.endsAt) < new Date()
                      const isUpcoming = new Date(promo.startsAt) > new Date()
                      return (
                        <motion.div key={promo.id} variants={itemVariants}>
                          <Card className="border-border/50 hover:shadow-sm transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-sm truncate">{promo.title}</p>
                                    <Badge
                                      className={`text-[9px] px-1.5 py-0 border-0 shrink-0 ${
                                        !promo.isActive || isExpired
                                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                          : isUpcoming
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                      }`}
                                    >
                                      {!promo.isActive ? 'Inativa' : isExpired ? 'Expirada' : isUpcoming ? 'Agendada' : 'Ativa'}
                                    </Badge>
                                  </div>
                                  {promo.description && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{promo.description}</p>
                                  )}
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="text-xs font-semibold text-primary">
                                      {promo.type === 'PERCENTAGE'
                                        ? `${promo.value}% desconto`
                                        : promo.type === 'FIXED_AMOUNT'
                                          ? `${formatBRL(promo.value)} desconto`
                                          : promo.type === 'FREE_DELIVERY'
                                            ? 'Frete grátis'
                                            : `Compre e Ganhe`
                                      }
                                    </span>
                                    {promo.code && (
                                      <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <Hash className="h-2.5 w-2.5" />
                                        {promo.code}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-0.5">
                                      <Calendar className="h-2.5 w-2.5" />
                                      {formatDate(promo.startsAt)}
                                    </span>
                                    <span>→</span>
                                    <span className="flex items-center gap-0.5">
                                      <Calendar className="h-2.5 w-2.5" />
                                      {formatDate(promo.endsAt)}
                                    </span>
                                  </div>
                                  {promo.usageLimit && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <Progress
                                        value={Math.min(((promo.usedCount ?? 0) / promo.usageLimit) * 100, 100)}
                                        className="h-1.5 flex-1"
                                      />
                                      <span className="text-[10px] text-muted-foreground">
                                        {promo.usedCount ?? 0}/{promo.usageLimit}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                )}

                {/* Create Promotion Dialog */}
                <PromotionCreateDialog
                  open={promoDialogOpen}
                  onClose={() => setPromoDialogOpen(false)}
                  onCreate={handleCreatePromotion}
                  loading={promotionCreating}
                />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ── Reviews Tab ── */}
          <TabsContent value="reviews">
            <AnimatePresence mode="wait">
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <ReviewsManagement />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ── Settings Tab ── */}
          <TabsContent value="settings">
            <SettingsTab
              settings={storeSettings}
              loading={settingsLoading}
              saving={settingsSaving}
              onFetch={fetchSettings}
              onSave={handleSaveSettings}
            />
          </TabsContent>

          {/* ── New Product Tab ── */}
          <TabsContent value="new-product">
            <AnimatePresence mode="wait">
              <motion.div
                key="new-product"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
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
        onClose={() => {
          setOrderDetailOpen(false)
          setSelectedOrder(null)
        }}
      />
    </div>
  )
}
