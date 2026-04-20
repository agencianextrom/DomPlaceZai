'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Store, Users, ShieldCheck, DollarSign,
  TrendingUp, Eye, CheckCircle, XCircle, Clock, AlertTriangle,
  ChevronRight, Search, BarChart3, CreditCard, Calendar,
  ArrowUpRight, ArrowDownRight, Activity, Package, Star,
  Phone, Mail, MoreHorizontal, RefreshCw, Loader2, Ban, Shield,
  Trash2, MessageSquare, UserCog,
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

// ── Types ──
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

// ── Visão Geral Tab ──
function OverviewTab() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error('Erro ao carregar estatisticas')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar estatisticas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  if (loading || !stats) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border/50"><CardContent className="p-4 space-y-2"><Skeleton className="h-10 w-10 rounded-xl" /><Skeleton className="h-6 w-24" /><Skeleton className="h-4 w-16" /></CardContent></Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  const totalUsers = stats.totalAccounts.total
  const totalStores = stats.totalStores.total
  const totalOrders = stats.totalOrders.total

  return (
    <motion.div variants={tabVariants} initial="enter" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-5">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Usuarios', value: formatNumber(totalUsers), icon: Users, gradient: 'from-primary to-emerald-600', extra: `${stats.totalAccounts.byRole.affiliates} afiliados` },
          { label: 'Lojas', value: formatNumber(totalStores), icon: Store, gradient: 'from-emerald-600 to-teal-600', extra: `${stats.totalStores.byStatus.pending} pendentes` },
          { label: 'Pedidos', value: formatNumber(totalOrders), icon: Package, gradient: 'from-amber-500 to-orange-500', extra: `${stats.ordersToday} hoje` },
          { label: 'Receita', value: formatBRL(stats.totalRevenue), icon: DollarSign, gradient: 'from-emerald-500 to-emerald-700', extra: `${formatBRL(stats.revenueToday)} hoje` },
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

      {/* Order Status Breakdown */}
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Status dos pedidos
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(stats.totalOrders.byStatus).filter(([k]) => k !== 'total').map(([status, count]) => (
              <div key={status} className="p-2.5 rounded-lg bg-secondary/30 text-center">
                <p className="text-lg font-bold">{count as number}</p>
                <p className="text-[10px] text-muted-foreground">{status.replace('_', ' ')}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Registrations */}
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-4 relative">
          <div className="absolute top-0 left-0 w-8 h-[2px] bg-gradient-to-r from-primary/60 to-transparent rounded-full" />
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Cadastros recentes
          </h3>
          <div className="space-y-2">
            {stats.recentRegistrations.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{item.name} <span className="text-muted-foreground">({roleLabels[item.role] || item.role})</span></p>
                  <p className="text-[11px] text-muted-foreground">{item.email}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{formatDate(item.createdAt)}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ── Lojas Tab ──
function StoresTab() {
  const [stores, setStores] = useState<StoreItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{ storeId: string; action: string; storeName: string } | null>(null)

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/stores?limit=20')
      if (!res.ok) throw new Error('Erro ao carregar lojas')
      const data = await res.json()
      setStores(data.stores || [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar lojas')
    } finally {
      setLoading(false)
    }
  }, [])

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

  const filtered = stores.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.ownerName.toLowerCase().includes(search.toLowerCase())
  )

  const getStoreStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'Aprovada', PENDING_APPROVAL: 'Pendente', SUSPENDED: 'Suspensa', INACTIVE: 'Inativa'
    }
    return map[status] || status
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    )
  }

  return (
    <motion.div variants={tabVariants} initial="enter" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar lojas..." className="pl-9 h-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" size="icon" className="h-10 w-10" onClick={fetchStores}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

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

// ── Usuarios Tab ──
function UsersTab() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{ userId: string; action: string; userName: string } | null>(null)
  const [roleDialog, setRoleDialog] = useState<{ userId: string; userName: string } | null>(null)
  const [newRole, setNewRole] = useState('')

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ limit: '20' })
      if (roleFilter && roleFilter !== 'Todos') params.set('role', roleFilter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error('Erro ao carregar usuarios')
      const data = await res.json()
      setUsers(data.accounts || [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar usuarios')
    } finally {
      setLoading(false)
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

  const filtered = users

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-20 rounded-full" />)}</div>
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    )
  }

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
              {filtered.map(user => (
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
                  <TableCell className="text-right text-sm font-medium">{user.roleInfo.user?.totalSpent > 0 ? formatBRL(user.roleInfo.user.totalSpent) : '-'}</TableCell>
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
        {filtered.map((user, i) => (
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
                    {user.roleInfo.user?.totalSpent > 0 && <span>{formatBRL(user.roleInfo.user.totalSpent)}</span>}
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

// ── Pedidos Tab ──
function OrdersTab() {
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/orders?limit=20')
      if (!res.ok) throw new Error('Erro ao carregar pedidos')
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar pedidos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    )
  }

  return (
    <motion.div variants={tabVariants} initial="enter" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-2" onClick={fetchOrders}><RefreshCw className="h-4 w-4" /> Atualizar</Button>
      </div>

      {/* Desktop Table */}
      <Card className="border-border/50 hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Loja</TableHead>
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
                  <p className="text-xs text-muted-foreground">{order.customerName} · {formatDate(order.createdAt)}</p>
                  <p className="text-sm font-bold">{formatBRL(order.total)}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ── Moderacao Tab ──
function ModerationTab() {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [replyDialog, setReplyDialog] = useState<{ reviewId: string; reviewName: string } | null>(null)
  const [replyText, setReplyText] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<{ reviewId: string; reviewName: string } | null>(null)

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/reviews?limit=20')
      if (!res.ok) throw new Error('Erro ao carregar avaliacoes')
      const data = await res.json()
      setReviews(data.reviews || [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar avaliacoes')
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    )
  }

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
      <div className="space-y-2">
        {reviews.length === 0 ? (
          <Card className="border-border/50"><CardContent className="p-6 text-center"><p className="text-sm text-muted-foreground">Nenhuma avaliacao sinalizada</p></CardContent></Card>
        ) : (
          reviews.map((review, i) => (
            <motion.div key={review.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      <div className={`h-9 w-9 rounded-lg ${review.lowRating ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20'} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Star className={`h-4 w-4 ${review.lowRating ? 'text-red-500' : 'text-amber-500'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{review.reviewerName}</p>
                          <Badge className="text-[10px]">{review.rating}/5</Badge>
                          {review.needsReply && <Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">Sem resposta</Badge>}
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
          ))
        )}
      </div>

      {/* Reply Dialog */}
      <AlertDialog open={!!replyDialog} onOpenChange={() => setReplyDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Responder avaliacao</AlertDialogTitle>
            <AlertDialogDescription>Resposta para a avaliacao de {replyDialog?.reviewName}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <textarea className="w-full h-24 rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none" placeholder="Escreva sua resposta..." value={replyText} onChange={(e) => setReplyText(e.target.value)} />
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
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}

// ── Financeiro Tab ──
function FinanceTab() {
  const [affiliates, setAffiliates] = useState<PayoutAffiliate[]>([])
  const [totalPending, setTotalPending] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{ affiliateId: string; action: string; name: string; amount: number } | null>(null)

  const fetchPayouts = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/payouts')
      if (!res.ok) throw new Error('Erro ao carregar pagamentos')
      const data = await res.json()
      setAffiliates(data.affiliates || [])
      setTotalPending(data.totalPendingPayouts || 0)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar pagamentos')
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
      <div className="space-y-2">
        {affiliates.length === 0 ? (
          <Card className="border-border/50"><CardContent className="p-6 text-center"><p className="text-sm text-muted-foreground">Nenhum pagamento pendente</p></CardContent></Card>
        ) : (
          affiliates.map((aff, i) => (
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
          ))
        )}
      </div>

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

// ── Main Component ──
export function AdminDashboard() {
  const { goBack } = useAppStore()

  const tabs = [
    { value: 'overview', label: 'Visao Geral', icon: LayoutDashboard },
    { value: 'stores', label: 'Lojas', icon: Store },
    { value: 'users', label: 'Usuarios', icon: Users },
    { value: 'orders', label: 'Pedidos', icon: Package },
    { value: 'moderation', label: 'Moderacao', icon: ShieldCheck },
    { value: 'finance', label: 'Financeiro', icon: DollarSign },
  ]

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
              <TabsContent value="overview" forceMount={false}><OverviewTab /></TabsContent>
              <TabsContent value="stores" forceMount={false}><StoresTab /></TabsContent>
              <TabsContent value="users" forceMount={false}><UsersTab /></TabsContent>
              <TabsContent value="orders" forceMount={false}><OrdersTab /></TabsContent>
              <TabsContent value="moderation" forceMount={false}><ModerationTab /></TabsContent>
              <TabsContent value="finance" forceMount={false}><FinanceTab /></TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
