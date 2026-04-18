'use client'

import { useState } from 'react'
import {
  Package, MapPin, Clock, DollarSign, Star, Phone, MessageCircle,
  ChevronRight, TrendingUp, Trophy, Navigation, CheckCircle2,
  Truck, Bike, Car, Power, PowerOff, History, Wallet,
  BarChart3, AlertCircle
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAppStore } from '@/store/useAppStore'

// Mock data
const mockDriver = {
  name: 'Carlos Souza',
  initials: 'CS',
  vehicleType: 'motorcycle' as const,
  rating: 4.8,
  totalDeliveries: 342,
  totalEarnings: 4250.00,
  todayDeliveries: 7,
  todayEarnings: 89.50,
  online: true,
}

const mockActiveDelivery = {
  orderNumber: 'DP000145',
  storeName: 'Acai da Boa',
  storeAddress: 'Av. Brasil, 456 - Centro',
  customerName: 'Maria Silva',
  customerAddress: 'Rua Principal, 123 - Centro',
  customerPhone: '(91) 99999-1234',
  status: 'delivering' as const,
  estimatedTime: '12 min',
  value: 8.50,
  tip: 3.00,
  progress: 65,
}

const mockAvailableOrders = [
  {
    id: 'o1',
    storeName: 'Mercado do Ze',
    pickupAddress: 'Rua Principal, 123 - Centro',
    deliveryAddress: 'Av. Brasil, 789 - Jardim Amazonia',
    estimatedTime: '25 min',
    value: 12.00,
    distance: '3.2 km',
  },
  {
    id: 'o2',
    storeName: 'Padaria Pao Quente',
    pickupAddress: 'Rua Amazonas, 321 - Centro',
    deliveryAddress: 'Rua Maranhao, 456 - Nova Esperanca',
    estimatedTime: '18 min',
    value: 9.50,
    distance: '2.1 km',
  },
  {
    id: 'o3',
    storeName: 'Farmacia Vida',
    pickupAddress: 'Rua Para, 789 - Centro',
    deliveryAddress: 'Rod. PA-279, Km 3 - Zona Rural',
    estimatedTime: '35 min',
    value: 15.00,
    distance: '5.8 km',
  },
  {
    id: 'o4',
    storeName: 'Pet Shop Amigo Fiel',
    pickupAddress: 'Rua Maranhao, 987 - Centro',
    deliveryAddress: 'Rua Tocantins, 234 - Centro',
    estimatedTime: '10 min',
    value: 6.00,
    distance: '1.0 km',
  },
]

const mockEarnings = {
  today: { deliveryFees: 62.50, tips: 27.00, bonuses: 10.00, total: 89.50 },
  week: { deliveryFees: 380.00, tips: 145.00, bonuses: 50.00, total: 575.00 },
  month: { deliveryFees: 1650.00, tips: 620.00, bonuses: 200.00, total: 2470.00 },
}

const mockWeeklyChart = [
  { day: 'Seg', amount: 72.00 },
  { day: 'Ter', amount: 95.00 },
  { day: 'Qua', amount: 88.00 },
  { day: 'Qui', amount: 110.00 },
  { day: 'Sex', amount: 125.00 },
  { day: 'Sab', amount: 85.00 },
  { day: 'Dom', amount: 89.50 },
]

const mockHistory = [
  { id: 'h1', orderNumber: 'DP000140', storeName: 'Salao da Bella', value: 10.00, date: 'Hoje, 14:32', rating: 5, items: 2 },
  { id: 'h2', orderNumber: 'DP000138', storeName: 'Agropecuaria SP', value: 18.00, date: 'Hoje, 12:15', rating: 5, items: 1 },
  { id: 'h3', orderNumber: 'DP000135', storeName: 'Loja do Eletronico', value: 7.50, date: 'Hoje, 10:45', rating: 4, items: 1 },
  { id: 'h4', orderNumber: 'DP000130', storeName: 'Mercado do Ze', value: 12.00, date: 'Ontem, 19:20', rating: 5, items: 4 },
  { id: 'h5', orderNumber: 'DP000128', storeName: 'Acai da Boa', value: 9.00, date: 'Ontem, 17:05', rating: 5, items: 2 },
  { id: 'h6', orderNumber: 'DP000125', storeName: 'Farmacia Vida', value: 6.50, date: 'Ontem, 14:30', rating: 4, items: 1 },
]

const vehicleIcons = {
  motorcycle: Bike,
  bicycle: Bike,
  car: Truck,
}

export function DriverDashboard() {
  const { navigate } = useAppStore()
  const [isOnline, setIsOnline] = useState(mockDriver.online)
  const [earningsPeriod, setEarningsPeriod] = useState<'today' | 'week' | 'month'>('today')

  const VehicleIcon = vehicleIcons[mockDriver.vehicleType]

  const currentEarnings = mockEarnings[earningsPeriod]

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivering': return 'Em entrega'
      case 'pickup': return 'Retirando'
      default: return 'A caminho'
    }
  }

  const getActionButton = (status: string) => {
    switch (status) {
      case 'delivering': return 'Confirmar Entrega'
      case 'pickup': return 'Iniciar Entrega'
      default: return 'Aceitar Corrida'
    }
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
            <div className="w-10" />
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
                {mockDriver.initials}
              </div>
              <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-emerald-600 ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
            </motion.div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{mockDriver.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <VehicleIcon className="h-4 w-4 text-white/70" />
                <span className="text-sm text-white/70">Entregador</span>
                <div className="flex items-center gap-1 ml-2">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-semibold">{mockDriver.rating}</span>
                </div>
              </div>
            </div>
            {/* Online/Offline Toggle */}
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2"
            >
              {isOnline ? (
                <Power className="h-4 w-4 text-emerald-300" />
              ) : (
                <PowerOff className="h-4 w-4 text-white/60" />
              )}
              <Switch
                checked={isOnline}
                onCheckedChange={(checked) => {
                  setIsOnline(checked)
                  toast.success(checked ? 'Voce esta online! Aguardando pedidos...' : 'Voce esta offline.')
                }}
                className="data-[state=checked]:bg-emerald-400 data-[state=unchecked]:bg-white/30"
              />
            </motion.div>
          </div>

          {/* Today stats */}
          <div className="relative grid grid-cols-3 gap-3 mt-5">
            {[
              { icon: Package, label: 'Entregas Hoje', value: mockDriver.todayDeliveries, color: 'from-white/20 to-white/10' },
              { icon: DollarSign, label: 'Ganhos Hoje', value: `R$ ${mockDriver.todayEarnings.toFixed(2).replace('.', ',')}`, color: 'from-amber-400/30 to-orange-400/20' },
              { icon: Star, label: 'Avaliacao Media', value: mockDriver.rating.toFixed(1), color: 'from-amber-400/30 to-yellow-400/20' },
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
          {isOnline && mockActiveDelivery && (
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
                    {getStatusLabel(mockActiveDelivery.status)}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-[10px] font-mono">{mockActiveDelivery.orderNumber}</Badge>
                    <span className="text-xs text-muted-foreground">ETA: {mockActiveDelivery.estimatedTime}</span>
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
                        <p className="text-sm font-semibold">{mockActiveDelivery.storeName}</p>
                        <p className="text-xs text-muted-foreground">{mockActiveDelivery.storeAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center mt-1">
                        <div className="h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Entrega</p>
                        <p className="text-sm font-semibold">{mockActiveDelivery.customerName}</p>
                        <p className="text-xs text-muted-foreground">{mockActiveDelivery.customerAddress}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground">Progresso da entrega</span>
                      <span className="text-xs font-semibold text-primary">{mockActiveDelivery.progress}%</span>
                    </div>
                    <Progress value={mockActiveDelivery.progress} className="h-2" />
                  </div>

                  {/* Map placeholder */}
                  <div className="h-32 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center mb-4 border border-border/50">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 text-primary mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Mapa da rota</p>
                      <p className="text-[10px] text-muted-foreground">3.2 km ate o destino</p>
                    </div>
                  </div>

                  {/* Value info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Taxa</p>
                        <p className="text-sm font-bold text-primary">R$ {mockActiveDelivery.value.toFixed(2).replace('.', ',')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Gorjeta</p>
                        <p className="text-sm font-bold text-amber-500">R$ {mockActiveDelivery.tip.toFixed(2).replace('.', ',')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-sm font-bold">R$ {(mockActiveDelivery.value + mockActiveDelivery.tip).toFixed(2).replace('.', ',')}</p>
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
                      className="flex-1 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white rounded-xl h-10 font-semibold gap-2"
                      onClick={() => toast.success('Entrega confirmada com sucesso!')}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {getActionButton(mockActiveDelivery.status)}
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
            {isOnline ? (
              mockAvailableOrders.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      Pedidos disponiveis
                    </h3>
                    <Badge variant="secondary" className="text-[10px]">{mockAvailableOrders.length} pedidos</Badge>
                  </div>
                  {mockAvailableOrders.map((order, i) => (
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
                              <p className="font-semibold text-sm">{order.storeName}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{order.estimatedTime}</span>
                                <span className="text-xs text-muted-foreground mx-1">·</span>
                                <Navigation className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{order.distance}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">R$ {order.value.toFixed(2).replace('.', ',')}</p>
                            </div>
                          </div>

                          <div className="space-y-2 mb-3">
                            <div className="flex items-start gap-2">
                              <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                              <p className="text-xs text-muted-foreground">{order.pickupAddress}</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              <p className="text-xs text-muted-foreground">{order.deliveryAddress}</p>
                            </div>
                          </div>

                          <Button
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-9 rounded-xl font-semibold text-sm"
                            onClick={() => toast.success('Pedido aceito! Dirija-se a loja para retirada.')}
                          >
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
                <Button
                  className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => { setIsOnline(true); toast.success('Voce esta online!') }}
                >
                  Ficar Online
                </Button>
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
            <motion.div
              key={earningsPeriod}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-primary to-emerald-600 rounded-2xl p-5 text-white text-center mb-4"
            >
              <p className="text-sm text-white/70 mb-1">Total de Ganhos</p>
              <motion.p
                key={currentEarnings.total}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-bold"
              >
                R$ {currentEarnings.total.toFixed(2).replace('.', ',')}
              </motion.p>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-white/15 rounded-xl p-2.5">
                  <p className="text-[10px] text-white/70">Taxas</p>
                  <p className="text-sm font-bold">R$ {currentEarnings.deliveryFees.toFixed(0).replace('.', ',')}</p>
                </div>
                <div className="bg-white/15 rounded-xl p-2.5">
                  <p className="text-[10px] text-white/70">Gorjetas</p>
                  <p className="text-sm font-bold">R$ {currentEarnings.tips.toFixed(0).replace('.', ',')}</p>
                </div>
                <div className="bg-white/15 rounded-xl p-2.5">
                  <p className="text-[10px] text-white/70">Bonus</p>
                  <p className="text-sm font-bold">R$ {currentEarnings.bonuses.toFixed(0).replace('.', ',')}</p>
                </div>
              </div>
            </motion.div>

            {/* Weekly chart */}
            {earningsPeriod === 'week' && (
              <Card className="border-border/50 mb-4">
                <CardContent className="p-4">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Ganhos da Semana
                  </h3>
                  <div className="flex items-end gap-2 h-32">
                    {mockWeeklyChart.map((day, i) => {
                      const maxAmount = Math.max(...mockWeeklyChart.map(d => d.amount))
                      const height = (day.amount / maxAmount) * 100
                      const isToday = i === mockWeeklyChart.length - 1
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

            {/* Stats summary */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-border/50">
                <CardContent className="p-4 text-center">
                  <Trophy className="h-6 w-6 text-amber-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{mockDriver.totalDeliveries}</p>
                  <p className="text-[10px] text-muted-foreground">Total de Entregas</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-6 w-6 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold">R$ {mockDriver.totalEarnings.toFixed(0).replace('.', ',')}</p>
                  <p className="text-[10px] text-muted-foreground">Ganhos Totais</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-0">
            <div className="space-y-2">
              {mockHistory.map((item, i) => (
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
                          <p className="font-semibold text-sm text-primary shrink-0 ml-2">R$ {item.value.toFixed(2).replace('.', ',')}</p>
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
                    <p className="text-lg font-bold text-primary">{mockDriver.totalDeliveries}</p>
                    <p className="text-[10px] text-muted-foreground">Entregas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-amber-500">R$ {mockDriver.totalEarnings.toFixed(0).replace('.', ',')}</p>
                    <p className="text-[10px] text-muted-foreground">Ganhos</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <p className="text-lg font-bold">{mockDriver.rating}</p>
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
