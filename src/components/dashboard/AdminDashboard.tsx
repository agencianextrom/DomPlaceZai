'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Store, Users, ShieldCheck, DollarSign,
  TrendingUp, Eye, CheckCircle, XCircle, Clock, AlertTriangle,
  ChevronRight, Search, BarChart3, CreditCard, Calendar,
  ArrowUpRight, ArrowDownRight, Activity, Package, Star,
  Phone, Mail, MoreHorizontal, RefreshCw, Loader2, Ban, Shield,
  Trash2, MessageSquare, UserCog, AlertOctagon, Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'

// -- Types --
interface AdminStats {
  totalAccounts: { byRole: { users: number; storeOwners: number; drivers: number; affiliates: number; admins: number }; total: number }
  totalStores: { byStatus: { active: number; pending: number; suspended: number; inactive: number }; total: number }
  totalOrders: { byStatus: Record<string, number>; total: number }
  totalRevenue: number
  totalProducts: number
  totalReviews: number
  recentRegistrations: { id: string; name: string; email: string; role: string; status: string; createdAt: string }[]
  ordersToday: number
  revenueToday: number
  topStores: { id: string; name: string; slug: string; category: string; rating: number; totalReviews: number; totalSales: number }[]
}

interface StoreItem {
  id: string; name: string; slug: string; category: string; status: string;
  rating: number; totalReviews: number; totalSales: number; phone: string | null;
  createdAt: string; ownerName: string; ownerEmail: string;
}

interface UserItem {
  id: string; email: string; name: string; phone: string | null; avatar: string | null;
  role: string; status: string; emailVerified: string | null; createdAt: string;
  roleInfo: {
    user: { totalSpent: number; orderCount: number; loyaltyBalance: number } | null;
    storeOwner: { storeId: string; storeName: string; storeStatus: string; totalSales: number; rating: number } | null;
    deliveryDriver: { vehicleType: string; status: string; verification: string; totalDeliveries: number; rating: number } | null;
    affiliate: { referralCode: string; totalEarnings: number; pendingEarnings: number; totalReferrals: number; status: string } | null;
  };
}

interface OrderItem {
  id: string; orderNumber: string; status: string; subtotal: number; deliveryFee: number;
  discount: number; total: number; paymentMethod: string; deliveryType: string;
  createdAt: string; storeName: string; customerName: string; customerEmail: string;
  driverName: string | null; itemCount: number;
}

interface PayoutAffiliate {
  id: string; name: string; email: string; phone: string | null; accountStatus: string;
  referralCode: string; totalEarnings: number; pendingEarnings: number;
  totalReferrals: number; totalConversions: number; status: string; createdAt: string;
}

interface ReviewItem {
  id: string; rating: number; comment: string | null; reply: string | null;
  isVerified: boolean; createdAt: string; reviewerName: string; reviewerEmail: string;
  storeName: string | null; productName: string | null; needsReply: boolean; lowRating: boolean;
}

type FetchState<T> = {
  data: T | null
  loading: boolean
  error: string | null
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR')
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0',
  Aprovada: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0',
  Pendente: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0',
  SUSPENDED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0',
  Suspensa: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0',
  INACTIVE: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-0',
  Pago: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0',
  Processando: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0',
}

function getStatusColor(status: string): string {
  if (statusColors[status]) return statusColors[status]
  const s = status.toUpperCase()
  if (s.includes('ACTIVE') || s.includes('DELIVERED') || s.includes('APPROVED') || s.includes('PAID')) {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0'
  }
  if (s.includes('SUSPEND') || s.includes('CANCEL') || s.includes('REJECT') || s.includes('BLOCK')) {
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0'
  }
  return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0'
}

const roleLabels: Record<string, string> = {
  USER: 'Usuario',
  STORE_OWNER: 'Lojista',
  AFFILIATE: 'Afiliado',
  DELIVERY_DRIVER: 'Entregador',
  ADMIN: 'Admin',
}

const roleColors: Record<string, string> = {
  Usuario: 'bg-secondary text-secondary-foreground border-0',
  USER: 'bg-secondary text-secondary-foreground border-0',
  Lojista: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0',
  STORE_OWNER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0',
  Afiliado: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0',
  AFFILIATE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0',
  Entregador: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-0',
  DELIVERY_DRIVER: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-0',
  Admin: 'bg-primary/10 text-primary border-0',
  ADMIN: 'bg-primary/10 text-primary border-0',
}

const tabVariants = {
  enter: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

// -- Reusable Error State --
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
        <AlertOctagon className="h-8 w-8 text-red-500" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">Erro ao carregar dados</p>
      <p className="text-xs text-muted-foreground text-center mb-4 max-w-xs">{message}</p>
      <Button variant="outline" size="sm" className="gap-2" onClick={onRetry}>
        <RefreshCw className="h-3.5 w-3.5" />
        Tentar novamente
      </Button>
    </motion.div>
  )
}

// -- Reusable Empty State --
function EmptyState({ icon: Icon, message }: { icon: React.ComponentType<{ className?: string }>; message: string }) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-8 flex flex-col items-center justify-center">
        <div className="h-12 w-12 rounded-xl bg-secondary/50 flex items-center justify-center mb-3">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}

// -- Visão Geral Tab --
function OverviewTab() {
  const [state, setState] = useState<FetchState<AdminStats>>({ data: null, loading: true, error: null })

  const fetchStats = useCallback(async () => {
    try {
      setState({ data: null, loading: true, error: null })
      const res = await fetch('/api/admin/stats')
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Erro ao carregar estatisticas')
      }
      const data = await res.json()
      setState({ data, loading: false, error: null })
    } catch (err) {
      setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'Erro ao carregar estatisticas' })
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  if (state.loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border/50"><CardContent className="p-4 space-y-2"><Skeleton className="h-10 w-10 rounded-xl" /><Skeleton className="h-6 w-24" /><Skeleton className="h-4 w-16" /></CardContent></Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  if (state.error || !state.data) {
    return <ErrorState message={state.error || 'Dados indisponiveis'} onRetry={fetchStats} />
  }

  const stats = state.data
  const totalUsers = stats.totalAccounts.total
  const totalStores = stats.totalStores.total
  const totalOrders = stats.totalOrders.total

  return (
    <motion.div variants={tabVariants} initial="enter" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-5">
      {/* Stats Grid - 6 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label: 'Usuarios', value: formatNumber(totalUsers), icon: Users, gradient: 'from-primary to-emerald-600', extra: `${stats.totalAccounts.byRole.affiliates} afiliados` },
          { label: 'Lojas Ativas', value: `${stats.totalStores.byStatus.active}/${totalStores}`, icon: Store, gradient: 'from-emerald-600 to-teal-600', extra: `${stats.totalStores.byStatus.pending} pendentes` },
          { label: 'Pedidos do Mes', value: formatNumber(totalOrders), icon: Package, gradient: 'from-amber-500 to-orange-500', extra: `${stats.ordersToday} hoje` },
          { label: 'Faturamento', value: formatBRL(stats.totalRevenue), icon: DollarSign, gradient: 'from-emerald-500 to-emerald-700', extra: `${formatBRL(stats.revenueToday)} hoje` },
          { label: 'Entregadores Online', value: String(stats.totalAccounts.byRole.drivers), icon: TrendingUp, gradient: 'from-teal-500 to-cyan-600', extra: `${Math.max(0, stats.totalAccounts.byRole.drivers - 2)} offline` },
          { label: 'Avaliacao Media', value: '4.6', icon: Star, gradient: 'from-amber-400 to-yellow-500', extra: `${stats.totalReviews} avaliacoes` },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-border/50 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fetchStats}>
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                <p className="text-[10px] text-primary mt-1">{stat.extra}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Order Status Donut Chart (CSS-based) + Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Pedidos por Status
            </h3>
            <div className="flex items-center gap-4">
              {/* CSS Donut Chart */}
              <div className="relative h-28 w-28 shrink-0">
                <div className="absolute inset-0 rounded-full bg-secondary/30" />
                <svg viewBox="0 0 36 36" className="h-28 w-28 -rotate-90">
                  {(() => {
                    const statusEntries = Object.entries(stats.totalOrders.byStatus).filter(([k]) => k !== 'total') as [string, number][]
                    const total = statusEntries.reduce((s, [, c]) => s + c, 0) || 1
                    let accumulated = 0
                    const colors: Record<string, string> = { PENDING: '#f59e0b', CONFIRMED: '#38bdf8', PREPARING: '#a78bfa', DELIVERING: '#22d3ee', DELIVERED: '#10b981', CANCELLED: '#ef4444' }
                    const radius = 14
                    const circumference = 2 * Math.PI * radius
                    return statusEntries.map(([status, count]) => {
                      const pct = count / total
                    const strokeLength = pct * circumference
                    const offset = accumulated * circumference
                    accumulated += pct
                    return (
                      <circle
                        key={status}
                        cx="18"
                        cy="18"
                        r={radius}
                        fill="none"
                        stroke={colors[status] || '#94a3b8'}
                        strokeWidth="5"
                        strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                        strokeDashoffset={-offset}
                        className="transition-all duration-700"
                      />
                    )
                  })
                })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{totalOrders}</span>
                </div>
              </div>
              {/* Legend */}
              <div className="flex-1 space-y-1.5">
                {(() => {
                  const statusEntries = Object.entries(stats.totalOrders.byStatus).filter(([k]) => k !== 'total') as [string, number][]
                  const colors: Record<string, string> = { PENDING: 'bg-amber-500', CONFIRMED: 'bg-sky-500', PREPARING: 'bg-purple-500', DELIVERING: 'bg-cyan-500', DELIVERED: 'bg-emerald-500', CANCELLED: 'bg-red-500' }
                  const labels: Record<string, string> = { PENDING: 'Pendentes', CONFIRMED: 'Confirmados', PREPARING: 'Preparando', DELIVERING: 'Em Entrega', DELIVERED: 'Entregues', CANCELLED: 'Cancelados' }
                  return statusEntries.map(([status, count]) => (
                    <div key={status} className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${colors[status] || 'bg-muted-foreground'}`} />
                      <span className="text-xs flex-1">{labels[status] || status.replace('_', ' ')}</span>
                      <span className="text-xs font-semibold">{count}</span>
                    </div>
                  ))
                })()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Faturamento por Categoria (breakdown bars) */}
        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-amber-500" />
              Faturamento por Categoria
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Alimentacao', pct: 35, value: 'R$ 12.450', color: 'from-emerald-400 to-emerald-600' },
                { name: 'Saude', pct: 22, value: 'R$ 7.820', color: 'from-sky-400 to-sky-600' },
                { name: 'Servicos', pct: 18, value: 'R$ 6.400', color: 'from-amber-400 to-orange-500' },
                { name: 'Pets', pct: 12, value: 'R$ 4.270', color: 'from-purple-400 to-purple-600' },
                { name: 'Outros', pct: 13, value: 'R$ 4.630', color: 'from-gray-400 to-gray-500' },
              ].map((cat) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{cat.name}</span>
                    <span className="text-xs font-semibold">{cat.value} ({cat.pct}%)</span>
                  </div>
                  <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.pct}%` }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      className={`h-full rounded-full bg-gradient-to-r ${cat.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Stores */}
      {stats.topStores && stats.topStores.length > 0 && (
        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-4 relative">
            <div className="absolute top-0 left-0 w-8 h-[2px] bg-gradient-to-r from-amber-500/60 to-transparent rounded-full" />
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              Top lojas por vendas
            </h3>
            <div className="space-y-2">
              {stats.topStores.map((store, i) => (
                <motion.div key={store.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : i === 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' : i === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-secondary text-muted-foreground'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{store.name}</p>
                    <p className="text-[11px] text-muted-foreground">{store.category} · {store.totalReviews} avaliacoes</p>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span className="text-xs">{store.rating > 0 ? store.rating.toFixed(1) : '-'}</span>
                    </div>
                    <span className="text-xs font-semibold">{formatNumber(store.totalSales)} vendas</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configurações da Plataforma - Quick Links */}
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            Configuracoes da Plataforma
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Categorias', icon: Package },
              { label: 'Taxas', icon: DollarSign },
              { label: 'Entregadores', icon: TrendingUp },
              { label: 'Notificacoes', icon: Activity },
            ].map((item) => (
              <button key={item.label} className="flex items-center gap-2 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <item.icon className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Registrations / Activity Feed */}
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-4 relative">
          <div className="absolute top-0 left-0 w-8 h-[2px] bg-gradient-to-r from-primary/60 to-transparent rounded-full" />
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Cadastros recentes
          </h3>
          <div className="space-y-2">
            {stats.recentRegistrations.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhum cadastro recente</p>
            ) : (
              stats.recentRegistrations.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{item.name} <span className="text-muted-foreground">({roleLabels[item.role] || item.role})</span></p>
                    <p className="text-[11px] text-muted-foreground">{item.email}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{formatDate(item.createdAt)}</span>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// -- Lojas Tab --
function StoresTab() {
  const [state, setState] = useState<FetchState<StoreItem[]>>({ data: null, loading: true, error: null })
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{ storeId: string; action: string; storeName: string } | null>(null)

  const fetchStores = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const params = new URLSearchParams({ limit: '50' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/stores?${params}`)
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Erro ao carregar lojas')
      }
      const data = await res.json()
      setState({ data: data.stores || [], loading: false, error: null })
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: err instanceof Error ? err.message : 'Erro ao carregar lojas' }))
    }
  }, [search])

  useEffect(() => { fetchStores() }, [fetchStores])

  const handleAction = async (storeId: string, action: 'approve' | 'suspend' | 'activate' | 'reject') => {
    setActionLoading(storeId)
    try {
      const res = await fetch(`/api/admin/stores/${storeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || 'Acao realizada com sucesso!')
        fetchStores()
      } else {
        toast.error(data.error || 'Erro ao realizar acao')
      }
    } catch {
      toast.error('Erro de conexao')
    } finally {
      setActionLoading(null)
      setConfirmDialog(null)
    }
  }

  if (state.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    )
  }

  if (state.error) {
    return <ErrorState message={state.error} onRetry={fetchStores} />
  }

  const stores = state.data || []
  const filtered = stores

  const getStoreStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'Aprovada', PENDING_APPROVAL: 'Pendente', SUSPENDED: 'Suspensa', INACTIVE: 'Inativa'
    }
    return map[status] || status
  }

  return (
    <motion.div variants={tabVariants} initial="enter" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar lojas..." className="pl-9 h-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => fetchStores()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Store} message="Nenhuma loja encontrada" />
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="border-border/50 hidden md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Loja</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-center">Avaliacao</TableHead>
                    <TableHead className="text-center">Vendas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-sm">{store.name}</p>
                          <p className="text-xs text-muted-foreground">{store.ownerName}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{store.category}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          <span className="text-sm">{store.rating > 0 ? store.rating.toFixed(1) : '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm">{formatNumber(store.totalSales)}</TableCell>
                      <TableCell>
                        <Badge className={`text-[11px] ${getStatusColor(store.status)}`}>{getStoreStatusLabel(store.status)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {store.status !== 'ACTIVE' && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" disabled={actionLoading === store.id} onClick={() => setConfirmDialog({ storeId: store.id, action: 'approve', storeName: store.name })}>
                              {actionLoading === store.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><CheckCircle className="h-3 w-3 mr-1" /> Aprovar</>}
                            </Button>
                          )}
                          {store.status !== 'SUSPENDED' && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" disabled={actionLoading === store.id} onClick={() => setConfirmDialog({ storeId: store.id, action: 'suspend', storeName: store.name })}>
                              <XCircle className="h-3 w-3 mr-1" /> Suspender
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-7 text-xs"><Eye className="h-3 w-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-2">
            {filtered.map((store, i) => (
              <motion.div key={store.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border/50">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {store.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{store.name}</p>
                          <p className="text-xs text-muted-foreground">{store.category} · {store.ownerName}</p>
                        </div>
                      </div>
                      <Badge className={`text-[10px] ${getStatusColor(store.status)}`}>{getStoreStatusLabel(store.status)}</Badge>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500 fill-amber-500" />{store.rating > 0 ? store.rating.toFixed(1) : '-'}</span>
                        <span>{formatNumber(store.totalSales)} vendas</span>
                      </div>
                      <div className="flex gap-1">
                        {store.status !== 'ACTIVE' && (
                          <Button size="sm" variant="ghost" className="h-7 text-[11px] px-2 text-emerald-600" disabled={actionLoading === store.id} onClick={() => setConfirmDialog({ storeId: store.id, action: 'approve', storeName: store.name })}>
                            Aprovar
                          </Button>
                        )}
                        {store.status !== 'SUSPENDED' && (
                          <Button size="sm" variant="ghost" className="h-7 text-[11px] px-2 text-red-600" disabled={actionLoading === store.id} onClick={() => setConfirmDialog({ storeId: store.id, action: 'suspend', storeName: store.name })}>
                            Suspender
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Confirm Dialog */}
      <AlertDialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog?.action === 'approve' ? 'Aprovar loja' : 'Suspender loja'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.action === 'approve'
                ? `Tem certeza que deseja aprovar a loja "${confirmDialog?.storeName}"?`
                : `Tem certeza que deseja suspender a loja "${confirmDialog?.storeName}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDialog && handleAction(confirmDialog.storeId, confirmDialog.action as 'approve' | 'suspend')}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}

// -- Usuarios Tab --
function UsersTab() {
  const [state, setState] = useState<FetchState<UserItem[]>>({ data: null, loading: true, error: null })
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{ userId: string; action: string; userName: string } | null>(null)
  const [roleDialog, setRoleDialog] = useState<{ userId: string; userName: string } | null>(null)
  const [newRole, setNewRole] = useState('')

  const fetchUsers = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const params = new URLSearchParams({ limit: '50' })
      if (roleFilter && roleFilter !== 'Todos') params.set('role', roleFilter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Erro ao carregar usuarios')
      }
      const data = await res.json()
      setState({ data: data.accounts || [], loading: false, error: null })
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: err instanceof Error ? err.message : 'Erro ao carregar usuarios' }))
    }
  }, [search, roleFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleAction = async (userId: string, action: string) => {
    setActionLoading(userId)
    try {
      const body: Record<string, unknown> = { action }
      if (action === 'change_role' && newRole) body.role = newRole
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || 'Acao realizada com sucesso!')
        fetchUsers()
      } else {
        toast.error(data.error || 'Erro ao realizar acao')
      }
    } catch {
      toast.error('Erro de conexao')
    } finally {
      setActionLoading(null)
      setConfirmDialog(null)
      setRoleDialog(null)
    }
  }

  const roles = ['Todos', 'USER', 'STORE_OWNER', 'AFFILIATE', 'DELIVERY_DRIVER', 'ADMIN']

  if (state.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-20 rounded-full" />)}</div>
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    )
  }

  if (state.error) {
    return <ErrorState message={state.error} onRetry={fetchUsers} />
  }

  const users = state.data || []

  return (
    <motion.div variants={tabVariants} initial="enter" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar usuarios..." className="pl-9 h-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" size="icon" className="h-10 w-10" onClick={fetchUsers}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Role filter pills */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {roles.map(r => (
          <button key={r} onClick={() => setRoleFilter(r === 'Todos' ? null : r)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${(r === 'Todos' && !roleFilter) || roleFilter === r ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}>
            {roleLabels[r] || r}
          </button>
        ))}
      </div>

      {users.length === 0 ? (
        <EmptyState icon={Users} message="Nenhum usuario encontrado" />
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="border-border/50 hidden md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Usuario</TableHead>
                    <TableHead>Funcao</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead className="text-center">Pedidos</TableHead>
                    <TableHead className="text-right">Gasto</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell><Badge className={`text-[11px] ${roleColors[user.role] || roleColors[user.role.replace('_', '')]}`}>{roleLabels[user.role] || user.role}</Badge></TableCell>
                      <TableCell><Badge className={`text-[11px] ${getStatusColor(user.status)}`}>{user.status === 'ACTIVE' ? 'Ativo' : user.status === 'SUSPENDED' ? 'Suspenso' : 'Inativo'}</Badge></TableCell>
                      <TableCell className="text-sm">{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-center text-sm">{user.roleInfo.user?.orderCount || 0}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{(user.roleInfo.user?.totalSpent ?? 0) > 0 ? formatBRL(user.roleInfo.user!.totalSpent) : '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {user.status !== 'ACTIVE' && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600" disabled={actionLoading === user.id} onClick={() => setConfirmDialog({ userId: user.id, action: 'activate', userName: user.name })}>
                              <CheckCircle className="h-3 w-3 mr-1" /> Ativar
                            </Button>
                          )}
                          {user.status === 'ACTIVE' && user.role !== 'ADMIN' && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600" disabled={actionLoading === user.id} onClick={() => setConfirmDialog({ userId: user.id, action: 'suspend', userName: user.name })}>
                              <Ban className="h-3 w-3 mr-1" /> Suspender
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={actionLoading === user.id} onClick={() => { setNewRole(user.role); setRoleDialog({ userId: user.id, userName: user.name }) }}>
                            <UserCog className="h-3 w-3 mr-1" /> Role
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-2">
            {users.map((user, i) => (
              <motion.div key={user.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border/50">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge className={`text-[10px] ${roleColors[user.role] || ''}`}>{roleLabels[user.role] || user.role}</Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{formatDate(user.createdAt)}</span>
                        <span>{user.roleInfo.user?.orderCount || 0} pedidos</span>
                        {(user.roleInfo.user?.totalSpent ?? 0) > 0 && <span>{formatBRL(user.roleInfo.user!.totalSpent)}</span>}
                      </div>
                      <Badge className={`text-[10px] ${getStatusColor(user.status)}`}>{user.status === 'ACTIVE' ? 'Ativo' : user.status === 'SUSPENDED' ? 'Suspenso' : 'Inativo'}</Badge>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {user.status !== 'ACTIVE' && (
                        <Button size="sm" variant="ghost" className="h-7 text-[11px] px-2 text-emerald-600" disabled={actionLoading === user.id} onClick={() => setConfirmDialog({ userId: user.id, action: 'activate', userName: user.name })}>Ativar</Button>
                      )}
                      {user.status === 'ACTIVE' && user.role !== 'ADMIN' && (
                        <Button size="sm" variant="ghost" className="h-7 text-[11px] px-2 text-red-600" disabled={actionLoading === user.id} onClick={() => setConfirmDialog({ userId: user.id, action: 'suspend', userName: user.name })}>Suspender</Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 text-[11px] px-2" disabled={actionLoading === user.id} onClick={() => { setNewRole(user.role); setRoleDialog({ userId: user.id, userName: user.name }) }}>Role</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Action Confirm Dialog */}
      <AlertDialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog?.action === 'activate' ? 'Ativar usuario' : 'Suspender usuario'}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.action === 'activate'
                ? `Tem certeza que deseja ativar a conta de "${confirmDialog?.userName}"?`
                : `Tem certeza que deseja suspender a conta de "${confirmDialog?.userName}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDialog && handleAction(confirmDialog.userId, confirmDialog.action)}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Role Dialog */}
      <AlertDialog open={!!roleDialog} onOpenChange={() => setRoleDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterar funcao</AlertDialogTitle>
            <AlertDialogDescription>Selecione a nova funcao para "{roleDialog?.userName}"</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">Usuario</SelectItem>
                <SelectItem value="STORE_OWNER">Lojista</SelectItem>
                <SelectItem value="AFFILIATE">Afiliado</SelectItem>
                <SelectItem value="DELIVERY_DRIVER">Entregador</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => roleDialog && handleAction(roleDialog.userId, 'change_role')}>Salvar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}

// -- Pedidos Tab --
function OrdersTab() {
  const [state, setState] = useState<FetchState<OrderItem[]>>({ data: null, loading: true, error: null })
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const params = new URLSearchParams({ limit: '50' })
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/admin/orders?${params}`)
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Erro ao carregar pedidos')
      }
      const data = await res.json()
      setState({ data: data.orders || [], loading: false, error: null })
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: err instanceof Error ? err.message : 'Erro ao carregar pedidos' }))
    }
  }, [statusFilter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  if (state.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    )
  }

  if (state.error) {
    return <ErrorState message={state.error} onRetry={fetchOrders} />
  }

  const orders = state.data || []

  const orderStatuses = [
    { value: 'Todos', label: 'Todos' },
    { value: 'PENDING', label: 'Pendente' },
    { value: 'CONFIRMED', label: 'Confirmado' },
    { value: 'PREPARING', label: 'Preparando' },
    { value: 'DELIVERING', label: 'Em entrega' },
    { value: 'DELIVERED', label: 'Entregue' },
    { value: 'CANCELLED', label: 'Cancelado' },
  ]

  return (
    <motion.div variants={tabVariants} initial="enter" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
        {orderStatuses.map(s => (
          <button key={s.value} onClick={() => setStatusFilter(s.value === 'Todos' ? null : s.value)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${(s.value === 'Todos' && !statusFilter) || statusFilter === s.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}>
            {s.label}
          </button>
        ))}
        <div className="flex-1" />
        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={fetchOrders}>
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={Package} message="Nenhum pedido encontrado" />
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="border-border/50 hidden md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Loja</TableHead>
                    <TableHead>Entregador</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm font-semibold">#{order.orderNumber}</TableCell>
                      <TableCell><p className="text-sm">{order.customerName}</p></TableCell>
                      <TableCell className="text-sm">{order.storeName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{order.driverName || '-'}</TableCell>
                      <TableCell className="text-sm font-semibold">{formatBRL(order.total)}</TableCell>
                      <TableCell><Badge className={`text-[11px] ${getStatusColor(order.status)}`}>{order.status}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-2">
            {orders.map((order, i) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border/50">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono font-semibold text-sm">#{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">{order.storeName}</p>
                      </div>
                      <Badge className={`text-[10px] ${getStatusColor(order.status)}`}>{order.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">{order.customerName}{order.driverName ? ` · ${order.driverName}` : ''}</p>
                      <p className="text-sm font-bold">{formatBRL(order.total)}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{formatDate(order.createdAt)} · {order.itemCount} {order.itemCount === 1 ? 'item' : 'itens'}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}

// -- Moderacao Tab --
function ModerationTab() {
  const [state, setState] = useState<FetchState<ReviewItem[]>>({ data: null, loading: true, error: null })
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [replyDialog, setReplyDialog] = useState<{ reviewId: string; reviewName: string } | null>(null)
  const [replyText, setReplyText] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<{ reviewId: string; reviewName: string } | null>(null)

  const fetchReviews = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const res = await fetch('/api/admin/reviews?limit=50')
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Erro ao carregar avaliacoes')
      }
      const data = await res.json()
      setState({ data: data.reviews || [], loading: false, error: null })
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: err instanceof Error ? err.message : 'Erro ao carregar avaliacoes' }))
    }
  }, [])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const handleReply = async () => {
    if (!replyDialog || !replyText.trim()) return
    setActionLoading(replyDialog.reviewId)
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: replyDialog.reviewId, action: 'reply', replyText }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || 'Resposta enviada!')
        fetchReviews()
      } else {
        toast.error(data.error || 'Erro ao responder')
      }
    } catch {
      toast.error('Erro de conexao')
    } finally {
      setActionLoading(null)
      setReplyDialog(null)
      setReplyText('')
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setActionLoading(confirmDelete.reviewId)
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: confirmDelete.reviewId, action: 'delete' }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || 'Avaliacao removida!')
        fetchReviews()
      } else {
        toast.error(data.error || 'Erro ao remover')
      }
    } catch {
      toast.error('Erro de conexao')
    } finally {
      setActionLoading(null)
      setConfirmDelete(null)
    }
  }

  if (state.loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    )
  }

  if (state.error) {
    return <ErrorState message={state.error} onRetry={fetchReviews} />
  }

  const reviews = state.data || []

  return (
    <motion.div variants={tabVariants} initial="enter" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total sinalizados', value: reviews.length, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Abaixo de 3 estrelas', value: reviews.filter(r => r.lowRating).length, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Sem resposta', value: reviews.filter(r => r.needsReply).length, icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-3 text-center">
              <stat.icon className={`h-5 w-5 ${stat.color} mx-auto mb-1`} />
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-2" onClick={fetchReviews}><RefreshCw className="h-4 w-4" /> Atualizar</Button>
      </div>

      {/* Reviews */}
      {reviews.length === 0 ? (
        <EmptyState icon={ShieldCheck} message="Nenhuma avaliacao sinalizada" />
      ) : (
        <div className="space-y-2">
          {reviews.map((review, i) => (
            <motion.div key={review.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      <div className={`h-9 w-9 rounded-lg ${review.lowRating ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20'} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Star className={`h-4 w-4 ${review.lowRating ? 'text-red-500' : 'text-amber-500'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">{review.reviewerName}</p>
                          <Badge className="text-[10px]">{review.rating}/5</Badge>
                          {review.needsReply && <Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">Sem resposta</Badge>}
                          {review.lowRating && !review.needsReply && <Badge className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">Nota baixa</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{review.storeName || review.productName || 'Produto removido'}</p>
                        <p className="text-xs mt-1">{review.comment || 'Sem comentario'}</p>
                        {review.reply && (
                          <div className="mt-2 p-2 bg-secondary/30 rounded-lg">
                            <p className="text-[10px] font-semibold text-primary mb-0.5">Resposta:</p>
                            <p className="text-xs text-muted-foreground">{review.reply}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 justify-end">
                    <Button size="sm" variant="outline" className="h-8 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/20" disabled={actionLoading === review.id} onClick={() => setReplyDialog({ reviewId: review.id, reviewName: review.reviewerName })}>
                      <MessageSquare className="h-3 w-3 mr-1" /> Responder
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20" disabled={actionLoading === review.id} onClick={() => setConfirmDelete({ reviewId: review.id, reviewName: review.reviewerName })}>
                      <Trash2 className="h-3 w-3 mr-1" /> Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reply Dialog */}
      <AlertDialog open={!!replyDialog} onOpenChange={() => { setReplyDialog(null); setReplyText('') }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Responder avaliacao</AlertDialogTitle>
            <AlertDialogDescription>Resposta para a avaliacao de {replyDialog?.reviewName}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <textarea className="w-full h-24 rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Escreva sua resposta..." value={replyText} onChange={(e) => setReplyText(e.target.value)} maxLength={1000} />
            <p className="text-[10px] text-muted-foreground mt-1 text-right">{replyText.length}/1000</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading === replyDialog?.reviewId}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReply} disabled={actionLoading === replyDialog?.reviewId || !replyText.trim()}>
              {actionLoading === replyDialog?.reviewId ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover avaliacao</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja remover a avaliacao de {confirmDelete?.reviewName}? Esta acao nao pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading === confirmDelete?.reviewId}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={actionLoading === confirmDelete?.reviewId}>
              {actionLoading === confirmDelete?.reviewId ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}

// -- Financeiro Tab --
function FinanceTab() {
  const [state, setState] = useState<{ affiliates: PayoutAffiliate[]; totalPending: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{ affiliateId: string; action: string; name: string; amount: number } | null>(null)

  const fetchPayouts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/payouts')
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Erro ao carregar pagamentos')
      }
      const data = await res.json()
      setState({ affiliates: data.affiliates || [], totalPending: data.totalPendingPayouts || 0 })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pagamentos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPayouts() }, [fetchPayouts])

  const handlePayout = async (affiliateId: string, action: 'approve' | 'reject', amount: number) => {
    setActionLoading(affiliateId)
    try {
      const res = await fetch('/api/admin/payouts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliateId, action, amount }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || 'Acao realizada com sucesso!')
        fetchPayouts()
      } else {
        toast.error(data.error || 'Erro ao processar pagamento')
      }
    } catch {
      toast.error('Erro de conexao')
    } finally {
      setActionLoading(null)
      setConfirmDialog(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchPayouts} />
  }

  const affiliates = state?.affiliates || []
  const totalPending = state?.totalPending || 0

  return (
    <motion.div variants={tabVariants} initial="enter" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <p className="text-xl font-bold">{formatBRL(totalPending)}</p>
            <p className="text-[11px] text-muted-foreground">Pendentes total</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center mb-2">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <p className="text-xl font-bold">{affiliates.length}</p>
            <p className="text-[11px] text-muted-foreground">Afiliados com saldo</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-2" onClick={fetchPayouts}><RefreshCw className="h-4 w-4" /> Atualizar</Button>
      </div>

      {/* Affiliate Payouts */}
      {affiliates.length === 0 ? (
        <EmptyState icon={DollarSign} message="Nenhum pagamento pendente" />
      ) : (
        <div className="space-y-2">
          {affiliates.map((aff, i) => (
            <motion.div key={aff.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="border-border/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-amber-600">{aff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm truncate">{aff.name}</p>
                        <p className="text-sm font-bold text-primary">{formatBRL(aff.pendingEarnings)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{aff.email}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                        <span>{aff.totalReferrals} indicacoes</span>
                        <span>{aff.totalConversions} conversoes</span>
                        <span>Codigo: {aff.referralCode}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 justify-end">
                    <Button size="sm" variant="outline" className="h-8 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/20" disabled={actionLoading === aff.id} onClick={() => setConfirmDialog({ affiliateId: aff.id, action: 'approve', name: aff.name, amount: aff.pendingEarnings })}>
                      {actionLoading === aff.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><CheckCircle className="h-3 w-3 mr-1" /> Pagar</>}
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20" disabled={actionLoading === aff.id} onClick={() => setConfirmDialog({ affiliateId: aff.id, action: 'reject', name: aff.name, amount: aff.pendingEarnings })}>
                      <XCircle className="h-3 w-3 mr-1" /> Rejeitar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirm Dialog */}
      <AlertDialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog?.action === 'approve' ? 'Aprovar pagamento' : 'Rejeitar pagamento'}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.action === 'approve'
                ? `Aprovar pagamento de ${formatBRL(confirmDialog?.amount || 0)} para "${confirmDialog?.name}"?`
                : `Rejeitar pagamento de ${formatBRL(confirmDialog?.amount || 0)} para "${confirmDialog?.name}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDialog && handlePayout(confirmDialog.affiliateId, confirmDialog.action as 'approve' | 'reject', confirmDialog.amount)}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}

// -- Main Component --
export function AdminDashboard() {
  const { goBack } = useAppStore()
  const { isAdmin, isLoading: authLoading, isAuthenticated } = useAuth()

  const tabs = [
    { value: 'overview', label: 'Visao Geral', icon: LayoutDashboard },
    { value: 'stores', label: 'Lojas', icon: Store },
    { value: 'users', label: 'Usuarios', icon: Users },
    { value: 'orders', label: 'Pedidos', icon: Package },
    { value: 'moderation', label: 'Moderacao', icon: ShieldCheck },
    { value: 'finance', label: 'Financeiro', icon: DollarSign },
  ]

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen pb-24 md:pb-8">
        <div className="relative">
          <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-strong border-b border-border/50 -mx-4 px-4">
            <div className="flex items-center gap-3 py-3">
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={goBack}>
                <ChevronRight className="h-5 w-5 rotate-180" />
              </Button>
              <div className="flex-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-3 w-32 mt-1" />
              </div>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-4 pt-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Access denied - not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen pb-24 md:pb-8">
        <div className="relative">
          <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-strong border-b border-border/50 -mx-4 px-4">
            <div className="flex items-center gap-3 py-3">
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={goBack}>
                <ChevronRight className="h-5 w-5 rotate-180" />
              </Button>
              <div className="flex-1">
                <h1 className="text-lg font-bold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Painel de Administracao
                </h1>
              </div>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-4 pt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="h-20 w-20 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-5">
                <Shield className="h-10 w-10 text-red-500" />
              </div>
              <h2 className="text-xl font-bold mb-2">Acesso restrito</h2>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                {isAuthenticated
                  ? 'Voce nao tem permissao para acessar esta area. Somente administradores podem visualizar o painel de administracao.'
                  : 'Voce precisa estar autenticado como administrador para acessar esta area. Faca login com uma conta de administrador.'}
              </p>
              <Button onClick={goBack} className="gap-2">
                <ChevronRight className="h-4 w-4 rotate-180" />
                Voltar
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="absolute inset-0 grid-pattern pointer-events-none" />
      <div className="relative">
        {/* Header */}
        <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-strong border-b border-border/50 -mx-4 px-4">
          <div className="flex items-center gap-3 py-3">
            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={goBack}>
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Painel de Administracao
              </h1>
              <p className="text-[11px] text-muted-foreground">DomPlace · Dom Eliseu, PA</p>
            </div>
            <Badge className="bg-primary text-primary-foreground text-[10px] px-2.5">Admin</Badge>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full h-auto flex flex-wrap gap-1 bg-transparent p-0 mb-4 relative">
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-accent/50 to-transparent" />
              {tabs.map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 min-w-[70px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-lg px-2 py-2 text-xs gap-1.5 h-auto"
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="overview"><OverviewTab /></TabsContent>
              <TabsContent value="stores"><StoresTab /></TabsContent>
              <TabsContent value="users"><UsersTab /></TabsContent>
              <TabsContent value="orders"><OrdersTab /></TabsContent>
              <TabsContent value="moderation"><ModerationTab /></TabsContent>
              <TabsContent value="finance"><FinanceTab /></TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
