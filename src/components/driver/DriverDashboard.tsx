'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Package, MapPin, Clock, DollarSign, Star, Phone, MessageCircle,
  ChevronRight, TrendingUp, Trophy, Navigation, CheckCircle2,
  Truck, Bike, Car, Power, PowerOff, History, Wallet, User,
  BarChart3, AlertCircle, RefreshCw, ShieldCheck, ShieldAlert,
  ShieldX, Loader2, XCircle, Send, Ban, PackageCheck, MapPinned,
  Lock
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'

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

interface GpsLocation {
  lat: number
  lng: number
  heading: number
  speed: number
  accuracy: number
}

const vehicleIcons: Record<string, typeof Bike> = {
  motorcycle: Bike,
  bicycle: Bike,
  car: Truck,
}

// Mock GPS coordinates (Dom Eliseu, PA)
const MOCK_BASE_LAT = -3.3917
const MOCK_BASE_LNG = -50.3558

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
    case 'PICKED_UP': return 'Retirado'
    case 'READY': return 'Pronto para retirar'
    case 'CONFIRMED': return 'Confirmado'
    case 'DELIVERED': return 'Entregue'
    case 'CANCELLED': return 'Cancelado'
    case 'PENDING': return 'Pendente'
    default: return status
  }
}

function getStatusBadgeVariant(status: string): string {
  switch (status) {
    case 'CONFIRMED': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700'
    case 'READY': return 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700'
    case 'PICKED_UP': return 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700'
    case 'DELIVERING': return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
    case 'DELIVERED': return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700'
    case 'CANCELLED': return 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700'
    default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-700'
  }
}

function getDeliveryProgress(status: string): number {
  switch (status) {
    case 'CONFIRMED': return 10
    case 'READY': return 25
    case 'PICKED_UP': return 50
    case 'DELIVERING': return 75
    case 'DELIVERED': return 100
    default: return 0
  }
}

function getNextAction(status: string): { label: string; action: string; icon: typeof CheckCircle2 } | null {
  switch (status) {
    case 'CONFIRMED':
    case 'READY':
      return { label: 'Confirmar Retirada', action: 'pick_up', icon: PackageCheck }
    case 'PICKED_UP':
      return { label: 'Iniciar Entrega', action: 'delivering', icon: Navigation }
    case 'DELIVERING':
      return { label: 'Confirmar Entrega', action: 'delivered', icon: CheckCircle2 }
    default:
      return null
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
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

function ErrorState({ message, onRetry, retryCount }: { message: string; onRetry: () => void; retryCount: number }) {
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
        <p className="text-xs text-muted-foreground mb-1">{message}</p>
        {retryCount > 0 && (
          <p className="text-[10px] text-muted-foreground mb-4">
            Tentativas realizadas: {retryCount}
          </p>
        )}
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

function AccessDenied() {
  const { navigate } = useAppStore()
  return (
    <div className="min-h-screen pb-24 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm"
      >
        <div className="h-20 w-20 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
          <Lock className="h-10 w-10 text-amber-500" />
        </div>
        <h3 className="font-bold text-sm mb-1">Acesso Restrito</h3>
        <p className="text-xs text-muted-foreground mb-4 max-w-xs">
          Apenas entregadores verificados podem acessar o painel de entregas. Faca login com uma conta de entregador.
        </p>
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          onClick={() => navigate('home')}
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          Voltar ao inicio
        </Button>
      </motion.div>
    </div>
  )
}

// -- Order detail skeleton for when fetching detail --
function OrderDetailSkeleton() {
  return (
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-4 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  )
}

export function DriverDashboard() {
  const { navigate } = useAppStore()
  const { isAuthenticated, isLoading: authLoading, isDeliveryDriver, user } = useAuth()
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
  const [retryCount, setRetryCount] = useState(0)
  const [gpsSimulating, setGpsSimulating] = useState(false)
  const [lastGpsUpdate, setLastGpsUpdate] = useState<string | null>(null)
  const gpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [orderDetail, setOrderDetail] = useState<OrderItem | null>(null)
  const [orderDetailLoading, setOrderDetailLoading] = useState(false)

  const isOnline = driverProfile?.driver.status === 'ONLINE'
  const isBusy = driverProfile?.driver.status === 'BUSY'
  const activeDelivery = activeOrders.length > 0 ? activeOrders[0] : null

  const VehicleIcon = driverProfile
    ? (vehicleIcons[driverProfile.driver.vehicleType] || Bike)
    : Bike

  const initials = driverProfile ? getInitials(driverProfile.account.name) : ''
  const verification = driverProfile?.driver.verification || 'PENDING'

  // -- Fetch driver profile --
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

  // -- Fetch orders by type --
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

  // -- Fetch order detail --
  const fetchOrderDetail = useCallback(async (orderId: string) => {
    setOrderDetailLoading(true)
    setExpandedOrderId(orderId)
    try {
      const res = await fetch(`/api/driver/orders/${orderId}`)
      if (!res.ok) {
        setOrderDetail(null)
        return
      }
      const data = await res.json()
      setOrderDetail(data.order || data)
    } catch {
      setOrderDetail(null)
    } finally {
      setOrderDetailLoading(false)
    }
  }, [])

  // -- Fetch earnings --
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

  // -- Fetch all data --
  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    setRetryCount((c) => c + 1)
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

  // -- Initial load --
  useEffect(() => {
    if (!authLoading && isAuthenticated && isDeliveryDriver) {
      fetchAll()
    }
  }, [isAuthenticated, isDeliveryDriver, authLoading])

  // -- Refresh orders when profile status changes --
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

  // -- Fetch earnings when period changes --
  useEffect(() => {
    if (!loading) {
      fetchEarnings(earningsPeriod).then(setEarnings)
    }
  }, [earningsPeriod, fetchEarnings, loading])

  // -- Handle status toggle (PATCH /api/driver/status) --
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

  // -- Handle accept order --
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
      const [available, active] = await Promise.all([
        fetchOrders('available'),
        fetchOrders('active'),
      ])
      setAvailableOrders(available)
      setActiveOrders(active)
      setDriverProfile((prev) =>
        prev
          ? { ...prev, driver: { ...prev.driver, status: 'BUSY' } }
          : prev
      )
      setExpandedOrderId(null)
      setOrderDetail(null)
    } catch {
      toast.error('Erro de conexao. Tente novamente.')
    } finally {
      setActionInProgress(null)
    }
  }

  // -- Handle decline order --
  const handleDeclineOrder = async (orderId: string) => {
    setActionInProgress(orderId)
    try {
      const res = await fetch(`/api/driver/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline' }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erro ao recusar pedido')
        return
      }
      toast.success('Pedido recusado.')
      const available = await fetchOrders('available')
      setAvailableOrders(available)
      setExpandedOrderId(null)
      setOrderDetail(null)
    } catch {
      toast.error('Erro de conexao. Tente novamente.')
    } finally {
      setActionInProgress(null)
    }
  }

  // -- Handle order status update (pick_up / delivering / delivered) --
  const handleUpdateOrderStatus = async (orderId: string, action: string) => {
    setActionInProgress(orderId)
    try {
      const res = await fetch(`/api/driver/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erro ao atualizar pedido')
        return
      }
      const messages: Record<string, string> = {
        pick_up: 'Pedido retirado! Inicie a entrega.',
        delivering: 'Entrega iniciada! Dirija-se ao cliente.',
        delivered: 'Entrega confirmada com sucesso!',
      }
      toast.success(messages[action] || 'Pedido atualizado!')

      // Refresh all data after delivered
      if (action === 'delivered') {
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
      } else {
        const [active, available] = await Promise.all([
          fetchOrders('active'),
          fetchOrders('available'),
        ])
        setActiveOrders(active)
        setAvailableOrders(available)
      }
    } catch {
      toast.error('Erro de conexao. Tente novamente.')
    } finally {
      setActionInProgress(null)
    }
  }

  // -- Send real browser geolocation to server --
  const sendRealLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        })
      })
      const location: GpsLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        heading: position.coords.heading || Math.floor(Math.random() * 360),
        speed: position.coords.speed || 0,
        accuracy: position.coords.accuracy || 10,
      }
      const res = await fetch('/api/driver/location', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location),
      })
      if (res.ok) {
        setLastGpsUpdate(new Date().toLocaleTimeString('pt-BR'))
      }
    } catch {
      // Silently ignore GPS errors (permission denied, not available, etc.)
    }
  }

  // -- Send real location periodically when online --
  useEffect(() => {
    if (!isOnline && !isBusy) {
      if (gpsIntervalRef.current) {
        clearInterval(gpsIntervalRef.current)
        gpsIntervalRef.current = null
      }
      return
    }
    // Send real location immediately, then every 30s
    sendRealLocation()
    if (gpsIntervalRef.current) clearInterval(gpsIntervalRef.current)
    gpsIntervalRef.current = setInterval(sendRealLocation, 30000)
  }, [isOnline, isBusy])

  // -- Simulate GPS location update (for demo/testing) --
  const toggleGpsSimulation = async () => {
    if (gpsSimulating) {
      // Stop simulation
      if (gpsIntervalRef.current) {
        clearInterval(gpsIntervalRef.current)
        gpsIntervalRef.current = null
      }
      setGpsSimulating(false)
      toast.info('Simulacao GPS desativada.')
      return
    }

    // Start simulation
    setGpsSimulating(true)
    toast.success('Simulacao GPS ativada. Enviando localizacao...')

    // Send initial position
    const sendLocation = async () => {
      try {
        const location: GpsLocation = {
          lat: MOCK_BASE_LAT + (Math.random() - 0.5) * 0.01,
          lng: MOCK_BASE_LNG + (Math.random() - 0.5) * 0.01,
          heading: Math.floor(Math.random() * 360),
          speed: 20 + Math.random() * 40,
          accuracy: 5 + Math.random() * 15,
        }
        const res = await fetch('/api/driver/location', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(location),
        })
        if (res.ok) {
          setLastGpsUpdate(new Date().toLocaleTimeString('pt-BR'))
        }
      } catch {
        // Silently ignore GPS errors
      }
    }

    await sendLocation()

    gpsIntervalRef.current = setInterval(async () => {
      await sendLocation()
    }, 10000) // Every 10 seconds
  }

  // -- Handle refresh --
  const handleRefresh = () => {
    setRetryCount(0)
    fetchAll()
  }

  // -- Auth loading --
  if (authLoading) {
    return <LoadingSkeleton />
  }

  // -- Access denied: not authenticated or not a delivery driver --
  if (!isAuthenticated || !isDeliveryDriver) {
    return <AccessDenied />
  }

  // -- Loading state --
  if (loading) {
    return <LoadingSkeleton />
  }

  // -- Error state --
  if (error) {
    return <ErrorState message={error} onRetry={handleRefresh} retryCount={retryCount} />
  }

  if (!driverProfile) {
    return <ErrorState message="Perfil do entregador nao encontrado" onRetry={handleRefresh} retryCount={retryCount} />
  }

  const profile = driverProfile
  const driver = driverProfile.driver

  // -- Build weekly chart data --
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
    const dailyAvg = earnings.periodEarnings / 7
    weeklyChartData.forEach((d, i) => {
      const variance = 1 + (Math.sin(i * 1.5) * 0.25)
      d.amount = Math.round(dailyAvg * variance * 100) / 100
    })
  }

  // -- History items --
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
        rating: 5,
      })
    })
  }

  return (
    <div className="min-h-screen pb-24">
      {/* -- Header -- */}
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
                disabled={loading}
                className="text-white hover:bg-white/15 h-10 w-10"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </motion.div>
          </div>

          {/* -- Driver info -- */}
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
            {/* -- Online/Offline Toggle -- */}
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

          {/* -- Today stats -- */}
          <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
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
        {/* -- GPS Simulation Button -- */}
        <AnimatePresence>
          {(isOnline || isBusy) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4"
            >
              <Card className="border-primary/20 overflow-hidden">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPinned className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs font-semibold">Localizacao GPS</p>
                      <p className="text-[10px] text-muted-foreground">
                        {gpsSimulating
                          ? `Simulacao ativa - Ultima: ${lastGpsUpdate || 'enviando...'}`
                          : lastGpsUpdate
                            ? `Ultima atualizacao: ${lastGpsUpdate}`
                            : 'Localizacao enviada automaticamente'
                        }
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={gpsSimulating ? 'destructive' : 'default'}
                    className={`h-8 text-[10px] font-semibold gap-1 rounded-lg ${!gpsSimulating ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}`}
                    onClick={toggleGpsSimulation}
                  >
                    {gpsSimulating ? (
                      <XCircle className="h-3.5 w-3.5" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    {gpsSimulating ? 'Parar Simulacao' : 'Simular GPS'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -- Active Delivery Card -- */}
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
                  <Badge className={`${getStatusBadgeVariant(activeDelivery.status)} border text-[10px]`}>
                    {getStatusLabel(activeDelivery.status)}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-[10px] font-mono">{activeDelivery.orderNumber}</Badge>
                    <span className="text-xs text-muted-foreground">ETA: {activeDelivery.estimatedTime || '--'}</span>
                  </div>

                  {/* -- Route visualization -- */}
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

                  {/* -- Progress -- */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground">Progresso da entrega</span>
                      <span className="text-xs font-semibold text-primary">{getDeliveryProgress(activeDelivery.status)}%</span>
                    </div>
                    <Progress value={getDeliveryProgress(activeDelivery.status)} className="h-2" />
                  </div>

                  {/* -- Map placeholder -- */}
                  <div className="h-32 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center mb-4 border border-border/50">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 text-primary mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Mapa da rota</p>
                      <p className="text-[10px] text-muted-foreground">Rota ate o destino</p>
                    </div>
                  </div>

                  {/* -- Value info -- */}
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

                  {/* -- Customer contact + Status action -- */}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-primary/30 hover:bg-primary/5">
                      <Phone className="h-4 w-4 text-primary" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-primary/30 hover:bg-primary/5">
                      <MessageCircle className="h-4 w-4 text-primary" />
                    </Button>
                    {(() => {
                      const nextAction = getNextAction(activeDelivery.status)
                      if (!nextAction) return null
                      const ActionIcon = nextAction.icon
                      return (
                        <Button
                          disabled={actionInProgress === activeDelivery.id}
                          className="flex-1 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white rounded-xl h-10 font-semibold gap-2"
                          onClick={() => handleUpdateOrderStatus(activeDelivery.id, nextAction.action)}
                        >
                          {actionInProgress === activeDelivery.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ActionIcon className="h-4 w-4" />
                          )}
                          {nextAction.label}
                        </Button>
                      )
                    })()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -- Earnings Overview Cards (Hoje, Semana, Mês) -- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          <Card className="border-border/50 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-emerald-600 px-3 py-2">
              <p className="text-[10px] text-white/70">Hoje</p>
              <p className="text-sm font-bold text-white">{formatCurrency(earnings?.periodEarnings || 0)}</p>
            </div>
          </Card>
          <Card className="border-border/50 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-2">
              <p className="text-[10px] text-white/70">Esta Semana</p>
              <p className="text-sm font-bold text-white">{formatCurrency(Math.round((earnings?.totalEarnings || 0) * 0.4))}</p>
            </div>
          </Card>
          <Card className="border-border/50 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2">
              <p className="text-[10px] text-white/70">Este Mês</p>
              <p className="text-sm font-bold text-white">{formatCurrency(earnings?.totalEarnings || 0)}</p>
            </div>
          </Card>
        </div>

        {/* -- Sua Avaliação Section -- */}
        <Card className="border-border/50 mb-4">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-800/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-bold">Sua Avaliacao</p>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-amber-500">{driver.rating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">/ {driver.totalDeliveries} entregas</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`h-4 w-4 ${s <= Math.round(driver.rating) ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* -- Map Placeholder when offline -- */}
        {!isOnline && !isBusy && (
          <Card className="border-primary/20 mb-4 overflow-hidden">
            <CardContent className="p-4">
              <div className="h-40 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center border border-dashed border-primary/30">
                <div className="text-center">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <MapPin className="h-10 w-10 text-primary/40 mx-auto mb-2" />
                  </motion.div>
                  <p className="text-sm font-semibold text-muted-foreground">Ative-se para ver entregas proximas</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Fique online para receber pedidos na sua regiao</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* -- Tabs content -- */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-4">
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
            <TabsTrigger value="profile" className="text-xs gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User className="h-3.5 w-3.5" />
              Perfil
            </TabsTrigger>
          </TabsList>

          {/* -- Available Orders Tab -- */}
          <TabsContent value="orders" className="mt-0">
            {isOnline || isBusy ? (
              availableOrders.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      </motion.div>
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

                          {/* -- Expanded order detail -- */}
                          <AnimatePresence>
                            {expandedOrderId === order.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                {orderDetailLoading ? (
                                  <OrderDetailSkeleton />
                                ) : orderDetail ? (
                                  <div className="border-t border-border/50 pt-3 mb-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-[10px] font-mono">{orderDetail.orderNumber}</Badge>
                                      <Badge className={`${getStatusBadgeVariant(orderDetail.status)} border text-[10px]`}>
                                        {getStatusLabel(orderDetail.status)}
                                      </Badge>
                                    </div>
                                    {orderDetail.items && orderDetail.items.length > 0 && (
                                      <div className="space-y-1">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Itens do pedido</p>
                                        {orderDetail.items.map((item: any, idx: number) => (
                                          <p key={idx} className="text-xs text-muted-foreground">
                                            {item.productName || item.name || `Item ${idx + 1}`}
                                            {item.quantity ? ` x${item.quantity}` : ''}
                                            {item.total ? ` - ${formatCurrency(item.total)}` : item.price ? ` - ${formatCurrency(item.price)}` : ''}
                                          </p>
                                        ))}
                                      </div>
                                    )}
                                    {orderDetail.customerName && (
                                      <p className="text-xs text-muted-foreground">
                                        Cliente: {orderDetail.customerName}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-3">
                                      <p className="text-xs text-muted-foreground">
                                        Total: {formatCurrency(orderDetail.total)}
                                      </p>
                                      <p className="text-xs font-semibold text-primary">
                                        Taxa: {formatCurrency(orderDetail.commission)}
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground border-t border-border/50 pt-3 mb-3">
                                    Detalhes nao disponiveis
                                  </p>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex items-center gap-2">
                            <Button
                              disabled={actionInProgress === order.id}
                              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-9 rounded-xl font-semibold text-sm gap-2"
                              onClick={() => handleAcceptOrder(order.id)}
                            >
                              {actionInProgress === order.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                              Aceitar Pedido
                            </Button>
                            {expandedOrderId === order.id ? (
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 rounded-xl border-border/50 shrink-0"
                                onClick={() => {
                                  setExpandedOrderId(null)
                                  setOrderDetail(null)
                                }}
                              >
                                <ChevronRight className="h-4 w-4 rotate-90" />
                              </Button>
                            ) : (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-9 w-9 rounded-xl border-border/50 shrink-0"
                                  onClick={() => fetchOrderDetail(order.id)}
                                >
                                  <ChevronRight className="h-4 w-4 rotate-90" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-9 w-9 rounded-xl border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                                  onClick={() => handleDeclineOrder(order.id)}
                                  disabled={actionInProgress === order.id}
                                >
                                  {actionInProgress === order.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Ban className="h-4 w-4 text-red-500" />
                                  )}
                                </Button>
                              </>
                            )}
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

          {/* -- Earnings Tab -- */}
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white/15 rounded-xl p-2.5">
                      <Skeleton className="h-3 w-16 bg-white/20 mb-1 mx-auto" />
                      <Skeleton className="h-4 w-12 bg-white/20 mx-auto" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Weekly chart with recharts */}
            <Card className="border-border/50 mb-4">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  {earningsPeriod === 'week' ? 'Ganhos da Semana' : earningsPeriod === 'month' ? 'Ganhos do Mes' : 'Ganhos de Hoje'}
                </h3>
                {weeklyChartData.some(d => d.amount > 0) ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                        <Tooltip
                          contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid hsl(var(--border))' }}
                          formatter={(value) => [`R$ ${(value as number).toFixed(2)}`, 'Ganhos']}
                        />
                        <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={40}>
                          {weeklyChartData.map((entry, index) => {
                            const dayOfWeek = new Date().getDay()
                            const adjustedIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1
                            return (
                              <Cell
                                key={`cell-${index}`}
                                fill={index === adjustedIndex ? '#10b981' : '#10b98140'}
                              />
                            )
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-24 text-center">
                    <p className="text-xs text-muted-foreground">Nenhuma entrega neste periodo</p>
                  </div>
                )}
              </CardContent>
            </Card>

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

          {/* -- History Tab -- */}
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

          {/* -- Profile Tab -- */}
          <TabsContent value="profile" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Driver identity card */}
              <Card className="border-primary/20 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-emerald-600 p-4 flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold border-2 border-white/30">
                    {initials}
                  </div>
                  <div className="text-white">
                    <h3 className="font-bold text-lg">{profile.account.name}</h3>
                    <p className="text-sm text-white/70">{profile.account.phone || 'Telefone nao informado'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 text-amber-300 fill-amber-300" />
                      <span className="text-sm font-semibold">{driver.rating}</span>
                      <VerificationBadge verification={verification} />
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <VehicleIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Veiculo</p>
                        <p className="text-xs font-semibold capitalize">{driver.vehicleType === 'motorcycle' ? 'Moto' : driver.vehicleType === 'bicycle' ? 'Bicicleta' : driver.vehicleType === 'car' ? 'Carro' : driver.vehicleType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">CNH</p>
                        <p className="text-xs font-semibold">{driver.cnhNumber || 'Nao informada'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Comissao</p>
                        <p className="text-xs font-semibold">{(driver.commissionRate * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center">
                        <MapPinned className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Placa</p>
                        <p className="text-xs font-semibold">{driver.vehiclePlate || 'Nao informada'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CNH Status */}
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Status da Verificacao
                  </h4>
                  <div className={`p-3 rounded-xl border ${verification === 'VERIFIED' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : verification === 'PENDING' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'}`}>
                    <div className="flex items-center gap-2">
                      {verification === 'VERIFIED' ? (
                        <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      ) : verification === 'PENDING' ? (
                        <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <ShieldX className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                      <div>
                        <p className="text-sm font-semibold">
                          {verification === 'VERIFIED' ? 'Documento Verificado' : verification === 'PENDING' ? 'Verificacao Pendente' : 'Verificacao Rejeitada'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {verification === 'VERIFIED'
                            ? 'Sua CNH foi verificada e voce esta apto a realizar entregas'
                            : verification === 'PENDING'
                            ? 'Envie fotos da sua CNH para comecar a entregar'
                            : 'Houve um problema com sua verificacao. Entre em contato com suporte.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Member since */}
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Membro desde
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(driver.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
