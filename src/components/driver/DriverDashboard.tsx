'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Package, MapPin, Clock, DollarSign, Star, Phone, MessageCircle,
  ChevronRight, TrendingUp, Trophy, Navigation, CheckCircle2,
  Truck, Bike, Car, Power, PowerOff, History, Wallet,
  BarChart3, AlertCircle, RefreshCw, ShieldCheck, ShieldAlert,
  ShieldX, Loader2, XCircle
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAppStore } from '@/store/useAppStore'

// Types
interface DriverAccount {
  name: string
  phone: string | null
  avatar: string | null
}

interface DriverData {
  status: string
  verification: string
  vehicleType: string
  vehiclePlate: string | null
  cnhNumber: string | null
  rating: number
  totalDeliveries: number
  totalEarnings: number
  commissionRate: number
  createdAt: string
}

interface DriverProfile {
  account: DriverAccount
  driver: DriverData
}

interface OrderItem {
  id: string
  orderNumber: string
  status: string
  storeName: string | null
  storeLogo: string | null
  storeAddress: string | null
  storeNeighborhood: string | null
  customerName: string | null
  customerPhone: string | null
  deliveryAddress: string | null
  items: any[]
  total: number
  commission: number
  deliveryType: string | null
  estimatedTime: string | null
  createdAt: string
  updatedAt: string
  deliveredAt: string | null
  cancelledAt: string | null
  cancelReason: string | null
  statusHistory: any[]
}

interface EarningsData {
  totalEarnings: number
  periodEarnings: number
  deliveryCount: number
  averagePerDelivery: number
  recentDeliveries: {
    orderNumber: string
    storeName: string | null
    commission: number
    deliveredAt: string | null
  }[]
}

const vehicleIcons: Record<string, typeof Bike> = {
  motorcycle: Bike,
  bicycle: Bike,
  car: Truck,
}

function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'DELIVERING': return 'Em entrega'
    case 'READY': return 'Pronto para retirar'
    case 'CONFIRMED': return 'Confirmado'
    case 'DELIVERED': return 'Entregue'
    case 'CANCELLED': return 'Cancelado'
    default: return status
  }
}

function getActionButton(status: string): string {
  switch (status) {
    case 'DELIVERING': return 'Confirmar Entrega'
    case 'CONFIRMED': return 'Iniciar Entrega'
    default: return 'Aceitar Corrida'
  }
}

function VerificationBadge({ verification }: { verification: string }) {
  if (verification === 'VERIFIED') {
    return (
      <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 text-[10px] gap-1">
        <ShieldCheck className="h-3 w-3" />
        Verificado
      </Badge>
    )
  }
  if (verification === 'PENDING') {
    return (
      <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 text-[10px] gap-1">
        <ShieldAlert className="h-3 w-3" />
        Aguardando verificacao
      </Badge>
    )
  }
  if (verification === 'REJECTED') {
    return (
      <Badge className="bg-red-500/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700 text-[10px] gap-1">
        <ShieldX className="h-3 w-3" />
        Rejeitado
      </Badge>
    )
  }
  return null
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen pb-24">
      {/* Header skeleton */}
      <div className="relative overflow-hidden rounded-b-3xl">
        <div className="relative bg-gradient-to-br from-primary via-emerald-600 to-teal-600 pt-6 pb-8 text-white px-4">
          <div className="flex items-center justify-between mb-5">
            <Skeleton className="h-10 w-10 rounded-full bg-white/15" />
            <Skeleton className="h-5 w-40 rounded bg-white/15" />
            <div className="w-10" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-2xl bg-white/15" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-36 rounded bg-white/15" />
              <Skeleton className="h-4 w-48 rounded bg-white/15" />
            </div>
            <Skeleton className="h-10 w-24 rounded-xl bg-white/15" />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl bg-white/15" />
            ))}
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 right-0 z-10" viewBox="0 0 1440 24" fill="none" preserveAspectRatio="none">
          <path d="M0 12C240 22 480 2 720 12C960 22 1200 2 1440 12V24H0V12Z" fill="oklch(0.99 0.002 120)" className="dark:hidden" />
          <path d="M0 12C240 22 480 2 720 12C960 22 1200 2 1440 12V24H0V12Z" fill="oklch(0.15 0.015 150)" className="hidden dark:block" />
        </svg>
      </div>
      <div className="px-4 mt-2">
        <Skeleton className="h-10 w-full rounded-xl mb-4" />
        <Skeleton className="h-64 w-full rounded-xl mb-4" />
        <Skeleton className="h-64 w-full rounded-xl mb-4" />
      </div>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen pb-24 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm"
      >
        <div className="h-20 w-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
          <XCircle className="h-10 w-10 text-red-400" />
        </div>
        <h3 className="font-bold text-sm mb-1">Erro ao carregar dados</h3>
        <p className="text-xs text-muted-foreground mb-4">{message}</p>
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          onClick={onRetry}
        >
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
      </motion.div>
    </div>
  )
}

export function DriverDashboard() {
  const { navigate } = useAppStore()
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null)
  const [availableOrders, setAvailableOrders] = useState<OrderItem[]>([])
  const [activeOrders, setActiveOrders] = useState<OrderItem[]>([])
  const [completedOrders, setCompletedOrders] = useState<OrderItem[]>([])
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [earningsPeriod, setEarningsPeriod] = useState<'today' | 'week' | 'month'>('today')
  const [statusChanging, setStatusChanging] = useState(false)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)

  const isOnline = driverProfile?.driver.status === 'ONLINE'
  const isBusy = driverProfile?.driver.status === 'BUSY'
  const activeDelivery = activeOrders.length > 0 ? activeOrders[0] : null

  const VehicleIcon = driverProfile
    ? (vehicleIcons[driverProfile.driver.vehicleType] || Bike)
    : Bike

  const initials = driverProfile ? getInitials(driverProfile.account.name) : ''
  const verification = driverProfile?.driver.verification || 'PENDING'

  // Fetch driver profile
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/driver/profile')
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao carregar perfil')
      }
      const data = await res.json()
      setDriverProfile(data)
      setError(null)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    }
  }, [])

  // Fetch orders by type
  const fetchOrders = useCallback(async (type: string) => {
    try {
      const res = await fetch(`/api/driver/orders?type=${type}&limit=50`)
      if (!res.ok) return []
      const data = await res.json()
      return data.orders || []
    } catch {
      return []
    }
  }, [])

  // Fetch earnings
  const fetchEarnings = useCallback(async (period: string) => {
    try {
      const res = await fetch(`/api/driver/earnings?period=${period}`)
      if (!res.ok) return null
      const data = await res.json()
      return data
    } catch {
      return null
    }
  }, [])

  // Fetch all data
  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    const success = await fetchProfile()
    if (success) {
      const [available, active, completed, earningsData] = await Promise.all([
        fetchOrders('available'),
        fetchOrders('active'),
        fetchOrders('completed'),
        fetchEarnings(earningsPeriod),
      ])
      setAvailableOrders(available)
      setActiveOrders(active)
      setCompletedOrders(completed)
      setEarnings(earningsData)
    }
    setLoading(false)
  }, [fetchProfile, fetchOrders, fetchEarnings, earningsPeriod])

  // Initial load
  useEffect(() => {
    fetchAll()
  }, [])

  // Refresh orders when profile status changes
  useEffect(() => {
    if (!loading && driverProfile) {
      Promise.all([
        fetchOrders('available'),
        fetchOrders('active'),
        fetchOrders('completed'),
      ]).then(([available, active, completed]) => {
        setAvailableOrders(available)
        setActiveOrders(active)
        setCompletedOrders(completed)
      })
    }
  }, [driverProfile?.driver.status])

  // Fetch earnings when period changes
  useEffect(() => {
    if (!loading) {
      fetchEarnings(earningsPeriod).then(setEarnings)
    }
  }, [earningsPeriod, fetchEarnings, loading])

  // Handle status toggle
  const handleStatusToggle = async (checked: boolean) => {
    setStatusChanging(true)
    try {
      const newStatus = checked ? 'ONLINE' : 'OFFLINE'
      const res = await fetch('/api/driver/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erro ao alterar status')
        return
      }
      // Update local profile state
      setDriverProfile((prev) =>
        prev
          ? { ...prev, driver: { ...prev.driver, status: newStatus } }
          : prev
      )
      toast.success(checked ? 'Voce esta online! Aguardando pedidos...' : 'Voce esta offline.')
    } catch {
      toast.error('Erro de conexao. Tente novamente.')
    } finally {
      setStatusChanging(false)
    }
  }

  // Handle accept order
  const handleAcceptOrder = async (orderId: string) => {
    setActionInProgress(orderId)
    try {
      const res = await fetch(`/api/driver/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erro ao aceitar pedido')
        return
      }
      toast.success('Pedido aceito! Dirija-se a loja para retirada.')
      // Refresh orders
      const [available, active] = await Promise.all([
        fetchOrders('available'),
        fetchOrders('active'),
      ])
      setAvailableOrders(available)
      setActiveOrders(active)
      // Update status to BUSY (server does this but let's sync)
      setDriverProfile((prev) =>
        prev
          ? { ...prev, driver: { ...prev.driver, status: 'BUSY' } }
          : prev
      )
    } catch {
      toast.error('Erro de conexao. Tente novamente.')
    } finally {
      setActionInProgress(null)
    }
  }

  // Handle complete delivery
  const handleCompleteDelivery = async (orderId: string) => {
    setActionInProgress(orderId)
    try {
      const res = await fetch(`/api/driver/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erro ao confirmar entrega')
        return
      }
      toast.success('Entrega confirmada com sucesso!')
      // Refresh all data
      const [profileOk, available, active, completed, earningsData] = await Promise.all([
        fetchProfile(),
        fetchOrders('available'),
        fetchOrders('active'),
        fetchOrders('completed'),
        fetchEarnings(earningsPeriod),
      ])
      if (!profileOk) return
      setAvailableOrders(available)
      setActiveOrders(active)
      setCompletedOrders(completed)
      setEarnings(earningsData)
    } catch {
      toast.error('Erro de conexao. Tente novamente.')
    } finally {
      setActionInProgress(null)
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchAll()
  }

  // Loading state
  if (loading) {
    return <LoadingSkeleton />
  }

  // Error state
  if (error) {
    return <ErrorState message={error} onRetry={handleRefresh} />
  }

  if (!driverProfile) {
    return <ErrorState message="Perfil do entregador nao encontrado" onRetry={handleRefresh} />
  }

  const profile = driverProfile
  const driver = driverProfile.driver

  // Build weekly chart data from earnings
  const weeklyChartData = [
    { day: 'Seg', amount: 0 },
    { day: 'Ter', amount: 0 },
    { day: 'Qua', amount: 0 },
    { day: 'Qui', amount: 0 },
    { day: 'Sex', amount: 0 },
    { day: 'Sab', amount: 0 },
    { day: 'Dom', amount: 0 },
  ]
  if (earnings && earningsPeriod === 'week' && earnings.deliveryCount > 0) {
    // Distribute period earnings evenly across 7 days with slight variation
    const dailyAvg = earnings.periodEarnings / 7
    weeklyChartData.forEach((d, i) => {
      const variance = 1 + (Math.sin(i * 1.5) * 0.25)
      d.amount = Math.round(dailyAvg * variance * 100) / 100
    })
  }

  // History items from recentDeliveries or completedOrders
  const historyItems: {
    id: string
    orderNumber: string
    storeName: string
    value: number
    date: string
    rating: number
  }[] = []
  if (earnings && earnings.recentDeliveries.length > 0) {
    earnings.recentDeliveries.forEach((d) => {
      const deliveredAt = d.deliveredAt ? new Date(d.deliveredAt) : null
      let dateStr = ''
      if (deliveredAt) {
        const now = new Date()
        const isToday = deliveredAt.toDateString() === now.toDateString()
        const yesterday = new Date(now)
        yesterday.setDate(now.getDate() - 1)
        const isYesterday = deliveredAt.toDateString() === yesterday.toDateString()
        if (isToday) {
          dateStr = `Hoje, ${deliveredAt.getHours().toString().padStart(2, '0')}:${deliveredAt.getMinutes().toString().padStart(2, '0')}`
        } else if (isYesterday) {
          dateStr = `Ontem, ${deliveredAt.getHours().toString().padStart(2, '0')}:${deliveredAt.getMinutes().toString().padStart(2, '0')}`
        } else {
          dateStr = deliveredAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        }
      }
      historyItems.push({
        id: d.orderNumber,
        orderNumber: d.orderNumber,
        storeName: d.storeName || 'Loja',
        value: d.commission,
        date: dateStr,
        rating: 5, // API doesn't return per-delivery rating
      })
    })
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-b-3xl"
      >
        <div className="relative bg-gradient-to-br from-primary via-emerald-600 to-teal-600 pt-6 pb-8 text-white px-4">
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }} />
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative flex items-center justify-between mb-5">
            <Button variant="ghost" size="icon" onClick={() => navigate('home')} className="text-white hover:bg-white/15 h-10 w-10">
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
            <h1 className="text-lg font-bold">Painel do Entregador</h1>
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                className="text-white hover:bg-white/15 h-10 w-10"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* Driver info */}
          <div className="relative flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring' }}
              className="relative"
            >
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-md flex items-center justify-center text-2xl font-bold border-2 border-white/30">
                {initials}
              </div>
              <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-emerald-600 ${isOnline || isBusy ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
            </motion.div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{profile.account.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <VehicleIcon className="h-4 w-4 text-white/70" />
                <span className="text-sm text-white/70">Entregador</span>
                <div className="flex items-center gap-1 ml-2">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-semibold">{driver.rating}</span>
                </div>
              </div>
              <div className="mt-1">
                <VerificationBadge verification={verification} />
              </div>
            </div>
            {/* Online/Offline Toggle */}
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2"
            >
              {isOnline || isBusy ? (
                <Power className="h-4 w-4 text-emerald-300" />
              ) : (
                <PowerOff className="h-4 w-4 text-white/60" />
              )}
              <Switch
                checked={isOnline || isBusy}
                disabled={statusChanging}
                onCheckedChange={(checked) => {
                  if (checked && verification !== 'VERIFIED') {
                    toast.error('Voce precisa estar verificado para ficar online.')
                    return
                  }
                  handleStatusToggle(checked)
                }}
                className="data-[state=checked]:bg-emerald-400 data-[state=unchecked]:bg-white/30"
              />
            </motion.div>
          </div>

          {/* Today stats */}
          <div className="relative grid grid-cols-3 gap-3 mt-5">
            {[
              { icon: Package, label: 'Entregas Hoje', value: earnings?.deliveryCount ?? 0, color: 'from-white/20 to-white/10' },
              { icon: DollarSign, label: 'Ganhos Hoje', value: earnings ? formatCurrency(earnings.periodEarnings) : 'R$ 0,00', color: 'from-amber-400/30 to-orange-400/20' },
              { icon: Star, label: 'Avaliacao Media', value: driver.rating.toFixed(1), color: 'from-amber-400/30 to-yellow-400/20' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="bg-gradient-to-br rounded-xl p-3 text-center"
              >
                <stat.icon className="h-5 w-5 mx-auto mb-1 opacity-80" />
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[10px] text-white/70">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <svg className="absolute bottom-0 left-0 right-0 z-10" viewBox="0 0 1440 24" fill="none" preserveAspectRatio="none">
          <path d="M0 12C240 22 480 2 720 12C960 22 1200 2 1440 12V24H0V12Z" fill="oklch(0.99 0.002 120)" className="dark:hidden" />
          <path d="M0 12C240 22 480 2 720 12C960 22 1200 2 1440 12V24H0V12Z" fill="oklch(0.15 0.015 150)" className="hidden dark:block" />
        </svg>
      </motion.div>

      <div className="px-4 mt-2">
        {/* Active Delivery Card */}
        <AnimatePresence>
          {(isOnline || isBusy) && activeDelivery && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-primary/20 overflow-hidden mb-4">
                <div className="bg-gradient-to-r from-primary to-emerald-600 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <Navigation className="h-4 w-4" />
                    <span className="text-sm font-semibold">Entrega em andamento</span>
                  </div>
                  <Badge className="bg-white/20 text-white border-0 text-[10px]">
                    {getStatusLabel(activeDelivery.status)}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-[10px] font-mono">{activeDelivery.orderNumber}</Badge>
                    <span className="text-xs text-muted-foreground">ETA: {activeDelivery.estimatedTime || '--'}</span>
                  </div>

                  {/* Route visualization */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center mt-1">
                        <div className="h-3 w-3 rounded-full bg-amber-500 ring-2 ring-amber-200" />
                        <div className="w-0.5 h-8 bg-gradient-to-b from-amber-500 to-emerald-500" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Retirada</p>
                        <p className="text-sm font-semibold">{activeDelivery.storeName || 'Loja'}</p>
                        <p className="text-xs text-muted-foreground">{activeDelivery.storeAddress || 'Endereco nao disponivel'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center mt-1">
                        <div className="h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Entrega</p>
                        <p className="text-sm font-semibold">{activeDelivery.customerName || 'Cliente'}</p>
                        <p className="text-xs text-muted-foreground">{activeDelivery.deliveryAddress || 'Endereco nao disponivel'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground">Progresso da entrega</span>
                      <span className="text-xs font-semibold text-primary">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>

                  {/* Map placeholder */}
                  <div className="h-32 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center mb-4 border border-border/50">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 text-primary mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Mapa da rota</p>
                      <p className="text-[10px] text-muted-foreground">Rota ate o destino</p>
                    </div>
                  </div>

                  {/* Value info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Taxa</p>
                        <p className="text-sm font-bold text-primary">{formatCurrency(activeDelivery.commission)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Total do Pedido</p>
                        <p className="text-sm font-bold">{formatCurrency(activeDelivery.total)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer contact + Action */}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-primary/30 hover:bg-primary/5">
                      <Phone className="h-4 w-4 text-primary" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-primary/30 hover:bg-primary/5">
                      <MessageCircle className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      disabled={actionInProgress === activeDelivery.id}
                      className="flex-1 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white rounded-xl h-10 font-semibold gap-2"
                      onClick={() => handleCompleteDelivery(activeDelivery.id)}
                    >
                      {actionInProgress === activeDelivery.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      {getActionButton(activeDelivery.status)}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs content */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="orders" className="text-xs gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Package className="h-3.5 w-3.5" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="earnings" className="text-xs gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Wallet className="h-3.5 w-3.5" />
              Ganhos
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <History className="h-3.5 w-3.5" />
              Historico
            </TabsTrigger>
          </TabsList>

          {/* Available Orders Tab */}
          <TabsContent value="orders" className="mt-0">
            {isOnline || isBusy ? (
              availableOrders.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      Pedidos disponiveis
                    </h3>
                    <Badge variant="secondary" className="text-[10px]">{availableOrders.length} pedidos</Badge>
                  </div>
                  {availableOrders.map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Card className="border-border/50 hover:border-primary/20 hover:shadow-sm transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-sm">{order.storeName || 'Loja'}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{order.estimatedTime || '--'}</span>
                                <span className="text-xs text-muted-foreground mx-1">·</span>
                                <Navigation className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{order.items?.length || 0} itens</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">{formatCurrency(order.commission)}</p>
                            </div>
                          </div>

                          <div className="space-y-2 mb-3">
                            <div className="flex items-start gap-2">
                              <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                              <p className="text-xs text-muted-foreground">{order.storeAddress || 'Endereco da loja'}</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              <p className="text-xs text-muted-foreground">{order.deliveryAddress || 'Endereco de entrega'}</p>
                            </div>
                          </div>

                          <Button
                            disabled={actionInProgress === order.id}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-9 rounded-xl font-semibold text-sm gap-2"
                            onClick={() => handleAcceptOrder(order.id)}
                          >
                            {actionInProgress === order.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : null}
                            Aceitar Pedido
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="h-20 w-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
                    <Package className="h-10 w-10 text-emerald-300 dark:text-emerald-700" />
                  </div>
                  <h3 className="font-bold text-sm">Nenhum pedido disponivel</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Aguarde, novos pedidos aparecerao aqui automaticamente
                  </p>
                </motion.div>
              )
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="h-20 w-20 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4"
                >
                  <PowerOff className="h-10 w-10 text-amber-400" />
                </motion.div>
                <h3 className="font-bold text-sm">Voce esta offline</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Ative o modo online para receber pedidos
                </p>
                {verification !== 'VERIFIED' ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 max-w-xs">
                    Voce precisa estar verificado para ficar online
                  </p>
                ) : (
                  <Button
                    className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => handleStatusToggle(true)}
                    disabled={statusChanging}
                  >
                    {statusChanging ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Ficar Online
                  </Button>
                )}
              </motion.div>
            )}
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="mt-0">
            {/* Period selector */}
            <div className="flex bg-secondary/50 rounded-xl p-1 mb-4">
              {(['today', 'week', 'month'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setEarningsPeriod(period)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    earningsPeriod === period
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {{ today: 'Hoje', week: 'Semana', month: 'Mes' }[period]}
                </button>
              ))}
            </div>

            {/* Total card */}
            {earnings ? (
              <motion.div
                key={earningsPeriod}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-primary to-emerald-600 rounded-2xl p-5 text-white text-center mb-4"
              >
                <p className="text-sm text-white/70 mb-1">Total de Ganhos</p>
                <motion.p
                  key={earnings.periodEarnings}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold"
                >
                  {formatCurrency(earnings.periodEarnings)}
                </motion.p>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-white/15 rounded-xl p-2.5">
                    <p className="text-[10px] text-white/70">Entregas</p>
                    <p className="text-sm font-bold">{earnings.deliveryCount}</p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-2.5">
                    <p className="text-[10px] text-white/70">Media/Entrega</p>
                    <p className="text-sm font-bold">{formatCurrency(earnings.averagePerDelivery)}</p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-2.5">
                    <p className="text-[10px] text-white/70">Total Geral</p>
                    <p className="text-sm font-bold">{formatCurrency(earnings.totalEarnings)}</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-br from-primary/80 to-emerald-600/80 rounded-2xl p-5 text-white text-center mb-4"
              >
                <p className="text-sm text-white/70 mb-1">Total de Ganhos</p>
                <p className="text-3xl font-bold">R$ 0,00</p>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white/15 rounded-xl p-2.5">
                      <Skeleton className="h-3 w-16 bg-white/20 mb-1 mx-auto" />
                      <Skeleton className="h-4 w-12 bg-white/20 mx-auto" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Weekly chart */}
            {earningsPeriod === 'week' && earnings && earnings.deliveryCount > 0 && (
              <Card className="border-border/50 mb-4">
                <CardContent className="p-4">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Ganhos da Semana
                  </h3>
                  <div className="flex items-end gap-2 h-32">
                    {weeklyChartData.map((day, i) => {
                      const maxAmount = Math.max(...weeklyChartData.map(d => d.amount), 1)
                      const height = (day.amount / maxAmount) * 100
                      const isToday = i === 6
                      return (
                        <motion.div
                          key={day.day}
                          className="flex-1 flex flex-col items-center gap-1"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ delay: i * 0.08 }}
                        >
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            R$ {day.amount.toFixed(0)}
                          </span>
                          <div className="w-full flex items-end" style={{ height: '80px' }}>
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              transition={{ delay: i * 0.08, duration: 0.5 }}
                              className={`w-full rounded-t-lg ${isToday ? 'bg-gradient-to-t from-primary to-emerald-400' : 'bg-gradient-to-t from-primary/30 to-primary/50'}`}
                            />
                          </div>
                          <span className={`text-[10px] ${isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                            {day.day}
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {earningsPeriod === 'week' && earnings && earnings.deliveryCount === 0 && (
              <Card className="border-border/50 mb-4">
                <CardContent className="p-4">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Ganhos da Semana
                  </h3>
                  <div className="flex items-center justify-center h-24 text-center">
                    <p className="text-xs text-muted-foreground">Nenhuma entrega esta semana</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats summary */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-border/50">
                <CardContent className="p-4 text-center">
                  <Trophy className="h-6 w-6 text-amber-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{driver.totalDeliveries}</p>
                  <p className="text-[10px] text-muted-foreground">Total de Entregas</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-6 w-6 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold">{formatCurrency(driver.totalEarnings)}</p>
                  <p className="text-[10px] text-muted-foreground">Ganhos Totais</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-0">
            {historyItems.length > 0 ? (
              <div className="space-y-2">
                {historyItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="border-border/50 hover:border-primary/20 transition-all cursor-pointer">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm truncate">{item.storeName}</p>
                            <p className="font-semibold text-sm text-primary shrink-0 ml-2">{formatCurrency(item.value)}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground font-mono">#{item.orderNumber}</span>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <span className="text-[10px] text-muted-foreground">{item.date}</span>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <div className="flex items-center gap-0.5">
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                              <span className="text-[10px] font-semibold">{item.rating}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <History className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-sm">Nenhum historico</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Suas entregas concluidas aparecerao aqui
                </p>
              </motion.div>
            )}

            <Separator className="my-4 bg-border/50" />

            {/* Lifetime stats */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200/50 dark:border-amber-800/30">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Resumo Geral
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">{driver.totalDeliveries}</p>
                    <p className="text-[10px] text-muted-foreground">Entregas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-amber-500">{formatCurrency(driver.totalEarnings)}</p>
                    <p className="text-[10px] text-muted-foreground">Ganhos</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <p className="text-lg font-bold">{driver.rating}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Avaliacao</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
