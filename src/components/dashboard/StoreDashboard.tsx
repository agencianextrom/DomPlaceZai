'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Store, ArrowLeft, DollarSign, ShoppingCart, Package, Star,
  TrendingUp, TrendingDown, Plus, Eye, MoreVertical, ChevronRight,
  Clock, User, BarChart3, ThumbsUp, ThumbsDown, Minus, MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
import { ReviewsManagement } from './ReviewsManagement'
import { ProductForm } from './ProductForm'

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

// ─── Mock Data ───
const weeklySales = [
  { day: 'Seg', value: 320 },
  { day: 'Ter', value: 450 },
  { day: 'Qua', value: 280 },
  { day: 'Qui', value: 520 },
  { day: 'Sex', value: 380 },
  { day: 'Sáb', value: 610 },
  { day: 'Dom', value: 420 },
]

const mockProducts = [
  { id: '1', name: 'Açaí 500ml', price: 15.0, stock: 85, status: 'ativo' as const, sales: 156, category: 'Alimentação' },
  { id: '2', name: 'Açaí Premium 700ml', price: 22.0, stock: 42, status: 'ativo' as const, sales: 98, category: 'Alimentação' },
  { id: '3', name: 'Smoothie de Açaí', price: 18.0, stock: 30, status: 'ativo' as const, sales: 67, category: 'Alimentação' },
  { id: '4', name: 'Açaí com Granola 300ml', price: 12.0, stock: 0, status: 'ativo' as const, sales: 124, category: 'Alimentação' },
  { id: '5', name: 'Tigela Especial', price: 28.0, stock: 15, status: 'rascunho' as const, sales: 0, category: 'Alimentação' },
  { id: '6', name: 'Combo Família 1L', price: 39.9, stock: 20, status: 'rascunho' as const, sales: 0, category: 'Alimentação' },
]

const mockOrders = [
  { id: 'o1', number: 'DP-0042', customer: 'Maria Silva', total: 45.0, status: 'preparando' as const, time: '10 min atrás', items: 3 },
  { id: 'o2', number: 'DP-0041', customer: 'João Santos', total: 67.5, status: 'pronto' as const, time: '25 min atrás', items: 5 },
  { id: 'o3', number: 'DP-0040', customer: 'Ana Oliveira', total: 30.0, status: 'entregue' as const, time: '1h atrás', items: 2 },
  { id: 'o4', number: 'DP-0039', customer: 'Pedro Costa', total: 52.0, status: 'entregue' as const, time: '2h atrás', items: 4 },
  { id: 'o5', number: 'DP-0038', customer: 'Carla Mendes', total: 15.0, status: 'cancelado' as const, time: '3h atrás', items: 1 },
]

const topProducts = [
  { name: 'Açaí 500ml', sales: 156 },
  { name: 'Açaí com Granola 300ml', sales: 124 },
  { name: 'Açaí Premium 700ml', sales: 98 },
  { name: 'Smoothie de Açaí', sales: 67 },
  { name: 'Tigela Especial', sales: 23 },
]

const orderStatusConfig = {
  preparando: { label: 'Preparando', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  pronto: { label: 'Pronto', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  entregue: { label: 'Entregue', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

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

// ─── Main Component ───
export function StoreDashboard() {
  const { goBack } = useAppStore()

  // Animated stats
  const totalRevenue = useAnimatedCounter(4580, 1400)
  const todayRevenue = useAnimatedCounter(320, 1000)
  const totalOrders = useAnimatedCounter(45, 1000)
  const todayOrders = useAnimatedCounter(12, 800)
  const activeProducts = useAnimatedCounter(8, 800)
  const draftProducts = useAnimatedCounter(2, 600)
  const ratingValue = useAnimatedCounter(4.7, 1200, 1)

  const maxSaleValue = Math.max(...weeklySales.map(s => s.value))

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
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full sm:w-auto overflow-x-auto hide-scrollbar mb-4 relative">
            {/* Animated underline indicator */
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
            <TabsTrigger value="reviews" className="gap-1.5 text-xs sm:text-sm">
              <MessageSquare className="h-3.5 w-3.5" />
              Avaliações
            </TabsTrigger>
            <TabsTrigger value="new-product" className="gap-1.5 text-xs sm:text-sm">
              <Plus className="h-3.5 w-3.5" />
              Novo Produto
            </TabsTrigger>
          </TabsList>

          {/* ── Overview Tab ── */}
          <TabsContent value="overview">
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
                      <div className="rounded-lg bg-gradient-to-b from-primary/[0.03] to-transparent grid-pattern p-3"
                        <div className="flex items-end gap-2 h-36">
                          {weeklySales.map((day, i) => {
                            const isToday = i === new Date().getDay() - 1
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
                                  {day.value}
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
                            <p className="text-xl font-bold">{activeProducts}</p>
                            <p className="text-[10px] text-muted-foreground">Ativos</p>
                          </div>
                          <Separator orientation="vertical" className="h-8" />
                          <div>
                            <p className="text-xl font-bold text-muted-foreground">{draftProducts}</p>
                            <p className="text-[10px] text-muted-foreground">Rascunho</p>
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
                                  className={`h-3.5 w-3.5 ${s <= 4 ? 'text-amber-500 fill-amber-500' : 'text-amber-200'}`}
                                />
                              ))}
                            </div>
                            <p className="text-[10px] text-muted-foreground">4.7 de 5.0</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
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
                  <Button size="sm" className="bg-primary text-primary-foreground gap-1 h-8 text-xs">
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar Produto
                  </Button>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2"
                >
                  {mockProducts.map((product) => (
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
                                    product.status === 'ativo'
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {product.status === 'ativo' ? 'Ativo' : 'Rascunho'}
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
                                  {product.sales} vendas
                                </span>
                              </div>
                            </div>

                            {/* Edit button */}
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
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
                  <Badge variant="secondary" className="text-[10px]">{mockOrders.length} pedidos</Badge>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2"
                >
                  {mockOrders.map((order) => {
                    const statusCfg = orderStatusConfig[order.status]
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
                                  <p className="font-semibold text-sm">{order.customer}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                    <Clock className="h-2.5 w-2.5" />
                                    {order.time}
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
                                <span className="text-xs text-muted-foreground font-mono">#{order.number}</span>
                                <span className="text-xs text-muted-foreground">{order.items} itens</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-sm">{formatBRL(order.total)}</span>
                                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 px-2 btn-shine">
                                  <Eye className="h-3 w-3" />
                                  Ver detalhes
                                </Button>
                              </div>
                            </div>

                            {/* Mini gradient accent line */}
                            <div className="mt-3 h-[1px] bg-gradient-to-r from-primary/20 via-accent/20 to-transparent" />
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </motion.div>
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
                      {topProducts.map((product, i) => (
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
                                animate={{ width: `${(product.sales / topProducts[0].sales) * 100}%` }}
                                transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
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
                          <p className="text-2xl font-bold text-primary">R$ 2.980</p>
                          <p className="text-xs text-muted-foreground mt-1">Esta semana</p>
                          <Badge className="text-[10px] mt-1 text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 border-0 gap-0.5">
                            <TrendingUp className="h-2.5 w-2.5" />
                            +15%
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-muted-foreground">R$ 2.590</p>
                          <p className="text-xs text-muted-foreground mt-1">Semana passada</p>
                          <Badge variant="secondary" className="text-[10px] mt-1 gap-0.5">
                            <Minus className="h-2.5 w-2.5" />
                            Sem mudança
                          </Badge>
                        </div>
                      </div>
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
                        { label: 'Positivo', value: 92, color: 'bg-emerald-500' },
                        { label: 'Neutro', value: 5, color: 'bg-amber-500' },
                        { label: 'Negativo', value: 3, color: 'bg-red-500' },
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
      </div>
      </div>
    </div>
  )
}
