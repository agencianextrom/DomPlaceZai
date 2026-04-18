'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Store, Users, ShieldCheck, DollarSign,
  TrendingUp, Eye, CheckCircle, XCircle, Clock, AlertTriangle,
  ChevronRight, Search, BarChart3, CreditCard, Calendar,
  ArrowUpRight, ArrowDownRight, Activity, Package, Star,
  Phone, Mail, MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useAppStore } from '@/store/useAppStore'

// ── Mock Data ──

const platformStats = {
  totalUsers: 2847,
  totalStores: 38,
  totalOrders: 12543,
  totalRevenue: 487320.50,
  growthUsers: 12.5,
  growthStores: 8.3,
  growthOrders: 23.1,
  growthRevenue: 18.7,
}

const monthlyGrowth = [
  { month: 'Jul', orders: 1450, revenue: 42000 },
  { month: 'Ago', orders: 1680, revenue: 49000 },
  { month: 'Set', orders: 1520, revenue: 44500 },
  { month: 'Out', orders: 1890, revenue: 55000 },
  { month: 'Nov', orders: 2100, revenue: 62000 },
  { month: 'Dez', orders: 2450, revenue: 72000 },
  { month: 'Jan', orders: 1980, revenue: 58000 },
  { month: 'Fev', orders: 2200, revenue: 65000 },
  { month: 'Mar', orders: 2350, revenue: 70000 },
  { month: 'Abr', orders: 2580, revenue: 76000 },
]

const recentActivity = [
  { id: 'a1', type: 'order', text: 'Novo pedido #DP012544 no Mercado do Zé', time: '2 min atrás', color: 'bg-emerald-500' },
  { id: 'a2', type: 'store', text: 'Nova loja "Pet Shop Amigo" aguardando aprovação', time: '15 min atrás', color: 'bg-amber-500' },
  { id: 'a3', type: 'review', text: 'Avaliação inadequada reportada no Salão da Bella', time: '32 min atrás', color: 'bg-red-500' },
  { id: 'a4', type: 'user', text: '47 novos usuários cadastrados hoje', time: '1h atrás', color: 'bg-primary' },
  { id: 'a5', type: 'finance', text: 'Pagamento de R$2.340 processado para Açaí da Boa', time: '2h atrás', color: 'bg-emerald-500' },
  { id: 'a6', type: 'order', text: 'Pedido #DP012541 entregue com sucesso', time: '3h atrás', color: 'bg-emerald-500' },
  { id: 'a7', type: 'store', text: 'Loja "Mercado do Zé" atualizou horário de funcionamento', time: '4h atrás', color: 'bg-amber-500' },
]

const stores = [
  { id: 's1', name: 'Mercado do Zé', owner: 'José da Silva', category: 'Alimentação', rating: 4.7, sales: 3420, status: 'Aprovada', joined: '12/01/2024', revenue: 156800 },
  { id: 's2', name: 'Açaí da Boa', owner: 'Ana Costa', category: 'Alimentação', rating: 4.9, sales: 5120, status: 'Aprovada', joined: '08/03/2024', revenue: 234500 },
  { id: 's3', name: 'Agropecuária São Paulo', owner: 'Carlos Mendes', category: 'Agricultura', rating: 4.5, sales: 890, status: 'Aprovada', joined: '22/06/2024', revenue: 89700 },
  { id: 's4', name: 'Farmácia Vida', owner: 'Dra. Lúcia Ferreira', category: 'Saúde', rating: 4.6, sales: 2100, status: 'Aprovada', joined: '15/02/2024', revenue: 112000 },
  { id: 's5', name: 'Padaria Pão Quente', owner: 'Roberto Santos', category: 'Alimentação', rating: 4.8, sales: 4780, status: 'Aprovada', joined: '05/01/2024', revenue: 178900 },
  { id: 's6', name: 'Pet Shop Amigo', owner: 'Fernanda Lima', category: 'Animais', rating: 0, sales: 0, status: 'Pendente', joined: '17/04/2025', revenue: 0 },
  { id: 's7', name: 'Loja do Eletrônico', owner: 'Pedro Oliveira', category: 'Eletrônicos', rating: 4.3, sales: 650, status: 'Aprovada', joined: '10/09/2024', revenue: 54300 },
  { id: 's8', name: 'Beleza Total', owner: 'Camila Rocha', category: 'Beleza', rating: 2.1, sales: 45, status: 'Suspensa', joined: '20/11/2024', revenue: 3200 },
]

const users = [
  { id: 'u1', name: 'Maria Silva', email: 'maria@email.com', role: 'Usuário', status: 'Ativo', joined: '15/01/2025', orders: 23, spent: 1870 },
  { id: 'u2', name: 'José da Silva', email: 'jose@mercadodose.com', role: 'Lojista', status: 'Ativo', joined: '12/01/2024', orders: 0, spent: 0 },
  { id: 'u3', name: 'Ana Costa', email: 'ana@acaidaboa.com', role: 'Lojista', status: 'Ativo', joined: '08/03/2024', orders: 0, spent: 0 },
  { id: 'u4', name: 'Pedro Santos', email: 'pedro@email.com', role: 'Usuário', status: 'Ativo', joined: '22/02/2025', orders: 15, spent: 980 },
  { id: 'u5', name: 'Fernanda Lima', email: 'fernanda@petshop.com', role: 'Lojista', status: 'Pendente', joined: '17/04/2025', orders: 0, spent: 0 },
  { id: 'u6', name: 'Lucas Oliveira', email: 'lucas@email.com', role: 'Afiliado', status: 'Ativo', joined: '05/03/2025', orders: 8, spent: 540 },
  { id: 'u7', name: 'Ricardo Souza', email: 'ricardo@email.com', role: 'Entregador', status: 'Ativo', joined: '18/01/2025', orders: 0, spent: 0 },
  { id: 'u8', name: 'Camila Rocha', email: 'camila@belezatotal.com', role: 'Lojista', status: 'Suspenso', joined: '20/11/2024', orders: 0, spent: 0 },
  { id: 'u9', name: 'Carlos Mendes', email: 'carlos@agro.com', role: 'Lojista', status: 'Ativo', joined: '22/06/2024', orders: 0, spent: 0 },
  { id: 'u10', name: 'Admin DomPlace', email: 'admin@domplace.com', role: 'Admin', status: 'Ativo', joined: '01/01/2024', orders: 0, spent: 0 },
]

const flaggedItems = [
  { id: 'f1', type: 'review', target: 'Avaliação de "Beleza Total"', reason: 'Conteúdo ofensivo', reporter: 'Sistema', date: '17/04/2025', severity: 'alta' },
  { id: 'f2', type: 'review', target: 'Avaliação de "Mercado do Zé"', reason: 'Spam / avaliação falsa', reporter: 'Maria Silva', date: '16/04/2025', severity: 'média' },
  { id: 'f3', type: 'store', target: 'Beleza Total', reason: 'Práticas enganosas', reporter: 'Pedro Santos', date: '15/04/2025', severity: 'alta' },
  { id: 'f4', type: 'store', target: 'Pet Shop Amigo', reason: 'Documentação incompleta', reporter: 'Sistema', date: '17/04/2025', severity: 'baixa' },
  { id: 'f5', type: 'review', target: 'Avaliação de "Loja do Eletrônico"', reason: 'Imagens inadequadas', reporter: 'Carlos Mendes', date: '14/04/2025', severity: 'média' },
  { id: 'f6', type: 'review', target: 'Avaliação de "Salão da Bella"', reason: 'Linguagem imprópria', reporter: 'Fernanda Lima', date: '13/04/2025', severity: 'alta' },
]

const financialData = {
  totalRevenue: 487320.50,
  platformCommission: 58478.46,
  payoutsPending: 32100.00,
  payoutsCompleted: 26378.46,
  avgTicket: 38.80,
  monthlyBreakdown: [
    { month: 'Jan', revenue: 58000, commission: 6960, payouts: 5104 },
    { month: 'Fev', revenue: 65000, commission: 7800, payouts: 5700 },
    { month: 'Mar', revenue: 70000, commission: 8400, payouts: 6140 },
    { month: 'Abr', revenue: 76000, commission: 9120, payouts: 6665 },
  ],
  payoutSchedule: [
    { store: 'Mercado do Zé', amount: 4870, date: '20/04/2025', status: 'Pendente' },
    { store: 'Açaí da Boa', amount: 6230, date: '20/04/2025', status: 'Pendente' },
    { store: 'Padaria Pão Quente', amount: 3950, date: '20/04/2025', status: 'Pendente' },
    { store: 'Farmácia Vida', amount: 2890, date: '20/04/2025', status: 'Processando' },
    { store: 'Agropecuária São Paulo', amount: 1750, date: '15/04/2025', status: 'Pago' },
  ],
  commissionTiers: [
    { range: 'Até R$5.000/mês', rate: '5%', color: 'bg-emerald-500' },
    { range: 'R$5.000 - R$15.000/mês', rate: '8%', color: 'bg-emerald-500' },
    { range: 'R$15.000 - R$30.000/mês', rate: '10%', color: 'bg-amber-500' },
    { range: 'R$30.000 - R$50.000/mês', rate: '12%', color: 'bg-amber-500' },
    { range: 'Acima de R$50.000/mês', rate: '15%', color: 'bg-amber-500' },
  ],
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

const statusColors: Record<string, string> = {
  Aprovada: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0',
  Pendente: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0',
  Suspensa: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0',
  Ativo: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0',
  Suspenso: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0',
  Pago: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0',
  Processando: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0',
}

const roleColors: Record<string, string> = {
  Usuário: 'bg-secondary text-secondary-foreground border-0',
  Lojista: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0',
  Afiliado: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0',
  Entregador: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-0',
  Admin: 'bg-primary/10 text-primary border-0',
}

const severityColors: Record<string, string> = {
  alta: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0',
  média: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0',
  baixa: 'bg-secondary text-secondary-foreground border-0',
}

const tabVariants = {
  enter: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

// ── Visão Geral Tab ──
function OverviewTab() {
  const maxRevenue = Math.max(...monthlyGrowth.map(m => m.revenue))

  return (
    <motion.div variants={tabVariants} initial="enter" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-5">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Usuários', value: formatNumber(platformStats.totalUsers), growth: platformStats.growthUsers, icon: Users, gradient: 'from-primary to-emerald-600' },
          { label: 'Lojas', value: formatNumber(platformStats.totalStores), growth: platformStats.growthStores, icon: Store, gradient: 'from-emerald-600 to-teal-600' },
          { label: 'Pedidos', value: formatNumber(platformStats.totalOrders), growth: platformStats.growthOrders, icon: Package, gradient: 'from-amber-500 to-orange-500' },
          { label: 'Receita', value: formatBRL(platformStats.totalRevenue), growth: platformStats.growthRevenue, icon: DollarSign, gradient: 'from-emerald-500 to-emerald-700' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="border-border/50 overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight className="h-3 w-3" />
                    <span className="text-xs font-semibold">+{stat.growth}%</span>
                  </div>
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Growth Chart */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Crescimento mensal
          </h3>
          <div className="flex items-end gap-1.5 sm:gap-3 h-40 overflow-x-auto hide-scrollbar">
            {monthlyGrowth.map((m, i) => (
              <div key={m.month} className="flex flex-col items-center gap-1 min-w-[32px] sm:min-w-[48px] flex-1">
                <div className="w-full relative group">
                  <motion.div
                    className="w-full bg-gradient-to-t from-primary to-emerald-400 rounded-t-md min-h-[4px] cursor-pointer hover:from-primary/90 hover:to-emerald-300 transition-colors"
                    initial={{ height: 0 }}
                    animate={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                    transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}
                    title={`${m.month}: ${formatBRL(m.revenue)} · ${m.orders} pedidos`}
                  />
                  {/* Tooltip */}
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] rounded-lg p-2 shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    <p className="font-semibold">{formatBRL(m.revenue)}</p>
                    <p className="text-muted-foreground">{m.orders} pedidos</p>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">{m.month}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Atividade recente
          </h3>
          <div className="space-y-2">
            {recentActivity.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className={`h-2.5 w-2.5 rounded-full ${item.color} mt-1.5 shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{item.text}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.time}</p>
                </div>
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
  const [storeList, setStoreList] = useState(stores)
  const [search, setSearch] = useState('')

  const filtered = storeList.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.owner.toLowerCase().includes(search.toLowerCase())
  )

  const handleAction = (storeId: string, action: 'approve' | 'suspend') => {
    setStoreList(prev => prev.map(s => {
      if (s.id !== storeId) return s
      if (action === 'approve') return { ...s, status: 'Aprovada' }
      return { ...s, status: 'Suspensa' }
    }))
    toast.success(action === 'approve' ? 'Loja aprovada com sucesso!' : 'Loja suspensa com sucesso!')
  }

  return (
    <motion.div variants={tabVariants} initial="enter" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar lojas..."
          className="pl-9 h-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Desktop Table */}
      <Card className="border-border/50 hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Loja</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-center">Avaliação</TableHead>
                <TableHead className="text-center">Vendas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((store) => (
                <TableRow key={store.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-sm">{store.name}</p>
                      <p className="text-xs text-muted-foreground">{store.owner}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{store.category}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span className="text-sm">{store.rating > 0 ? store.rating.toFixed(1) : '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm">{formatNumber(store.sales)}</TableCell>
                  <TableCell>
                    <Badge className={`text-[11px] ${statusColors[store.status]}`}>{store.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {store.status !== 'Aprovada' && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" onClick={() => handleAction(store.id, 'approve')}>
                          <CheckCircle className="h-3 w-3 mr-1" /> Aprovar
                        </Button>
                      )}
                      {store.status !== 'Suspensa' && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleAction(store.id, 'suspend')}>
                          <XCircle className="h-3 w-3 mr-1" /> Suspender
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 text-xs">
                        <Eye className="h-3 w-3" />
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
        {filtered.map((store, i) => (
          <motion.div
            key={store.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {store.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{store.name}</p>
                      <p className="text-xs text-muted-foreground">{store.category} · {store.owner}</p>
                    </div>
                  </div>
                  <Badge className={`text-[10px] ${statusColors[store.status]}`}>{store.status}</Badge>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      {store.rating > 0 ? store.rating.toFixed(1) : '-'}
                    </span>
                    <span>{formatNumber(store.sales)} vendas</span>
                  </div>
                  <div className="flex gap-1">
                    {store.status !== 'Aprovada' && (
                      <Button size="sm" variant="ghost" className="h-7 text-[11px] px-2 text-emerald-600" onClick={() => handleAction(store.id, 'approve')}>
                        Aprovar
                      </Button>
                    )}
                    {store.status !== 'Suspensa' && (
                      <Button size="sm" variant="ghost" className="h-7 text-[11px] px-2 text-red-600" onClick={() => handleAction(store.id, 'suspend')}>
                        Suspender
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 px-2">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ── Usuários Tab ──
function UsersTab() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string | null>(null)

  const roles = ['Todos', 'Usuário', 'Lojista', 'Afiliado', 'Entregador', 'Admin']

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleFilter || roleFilter === 'Todos' || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <motion.div variants={tabVariants} initial="enter" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar usuários..." className="pl-9 h-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Role filter pills */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {roles.map(r => (
          <button
            key={r}
            onClick={() => setRoleFilter(r === 'Todos' ? null : r)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              (r === 'Todos' && !roleFilter) || roleFilter === r
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Desktop Table */}
      <Card className="border-border/50 hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Usuário</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="text-center">Pedidos</TableHead>
                <TableHead className="text-right">Gasto</TableHead>
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
                  <TableCell>
                    <Badge className={`text-[11px] ${roleColors[user.role]}`}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[11px] ${statusColors[user.status]}`}>{user.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{user.joined}</TableCell>
                  <TableCell className="text-center text-sm">{user.orders}</TableCell>
                  <TableCell className="text-right text-sm font-medium">{user.spent > 0 ? formatBRL(user.spent) : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2">
        {filtered.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex gap-1">
                    <Badge className={`text-[10px] ${roleColors[user.role]}`}>{user.role}</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{user.joined}</span>
                    <span>{user.orders} pedidos</span>
                    {user.spent > 0 && <span>{formatBRL(user.spent)}</span>}
                  </div>
                  <Badge className={`text-[10px] ${statusColors[user.status]}`}>{user.status}</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ── Moderação Tab ──
function ModerationTab() {
  const [items, setItems] = useState(flaggedItems)
  const [severityFilter, setSeverityFilter] = useState<string | null>(null)

  const filtered = items.filter(f => !severityFilter || f.severity === severityFilter)

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    setItems(prev => prev.filter(f => f.id !== id))
    toast.success(action === 'approve' ? 'Conteúdo aprovado!' : 'Conteúdo rejeitado e removido!')
  }

  return (
    <motion.div variants={tabVariants} initial="enter" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total sinalizados', value: items.length, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Alta prioridade', value: items.filter(f => f.severity === 'alta').length, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Resolvidos hoje', value: 3, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
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

      {/* Severity filter */}
      <div className="flex gap-2">
        {['Todos', 'alta', 'média', 'baixa'].map(s => (
          <button
            key={s}
            onClick={() => setSeverityFilter(s === 'Todos' ? null : s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
              (s === 'Todos' && !severityFilter) || severityFilter === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Flagged Items */}
      <div className="space-y-2">
        {filtered.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <div className={`h-9 w-9 rounded-lg ${item.type === 'review' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'} flex items-center justify-center shrink-0 mt-0.5`}>
                      {item.type === 'review' ? (
                        <Star className="h-4 w-4 text-amber-500" />
                      ) : (
                        <Store className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{item.target}</p>
                        <Badge className={`text-[10px] capitalize ${severityColors[item.severity]}`}>
                          {item.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.reason}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Reportado por {item.reporter} · {item.date}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/20"
                    onClick={() => handleAction(item.id, 'approve')}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" /> Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                    onClick={() => handleAction(item.id, 'reject')}
                  >
                    <XCircle className="h-3 w-3 mr-1" /> Rejeitar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ── Financeiro Tab ──
function FinanceTab() {
  const maxCommission = Math.max(...financialData.monthlyBreakdown.map(m => m.commission))

  return (
    <motion.div variants={tabVariants} initial="enter" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-5">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Receita total', value: formatBRL(financialData.totalRevenue), icon: DollarSign, gradient: 'from-primary to-emerald-600' },
          { label: 'Comissão plataforma', value: formatBRL(financialData.platformCommission), icon: TrendingUp, gradient: 'from-emerald-600 to-teal-600' },
          { label: 'Pagamentos pendentes', value: formatBRL(financialData.payoutsPending), icon: Clock, gradient: 'from-amber-500 to-orange-500' },
          { label: 'Ticket médio', value: formatBRL(financialData.avgTicket), icon: BarChart3, gradient: 'from-emerald-500 to-emerald-700' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="border-border/50 overflow-hidden">
              <CardContent className="p-4">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-2`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Commission Chart */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            Receita vs Comissão (mensal)
          </h3>
          <div className="flex items-end gap-3 h-36">
            {financialData.monthlyBreakdown.map((m, i) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex gap-1 items-end h-28 w-full">
                  <motion.div
                    className="flex-1 bg-gradient-to-t from-primary to-emerald-400 rounded-t-sm min-h-[3px]"
                    initial={{ height: 0 }}
                    animate={{ height: `${(m.revenue / 80000) * 100}%` }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    title={`Receita: ${formatBRL(m.revenue)}`}
                  />
                  <motion.div
                    className="flex-1 bg-gradient-to-t from-amber-400 to-amber-300 rounded-t-sm min-h-[3px]"
                    initial={{ height: 0 }}
                    animate={{ height: `${(m.commission / maxCommission) * 100}%` }}
                    transition={{ delay: i * 0.08 + 0.05, duration: 0.5 }}
                    title={`Comissão: ${formatBRL(m.commission)}`}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{m.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 justify-center">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
              <span className="text-[10px] text-muted-foreground">Receita</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
              <span className="text-[10px] text-muted-foreground">Comissão</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Tiers */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Faixas de comissão
          </h3>
          <div className="space-y-2">
            {financialData.commissionTiers.map((tier) => (
              <div key={tier.range} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30">
                <div className={`h-3 w-8 rounded-sm ${tier.color}`} />
                <div className="flex-1">
                  <p className="text-xs font-medium">{tier.range}</p>
                </div>
                <span className="text-sm font-bold text-primary">{tier.rate}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payout Schedule */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Agenda de pagamentos
          </h3>
          <div className="space-y-2">
            {financialData.payoutSchedule.map((payout) => (
              <div key={payout.store + payout.date} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{payout.store}</p>
                  <p className="text-[11px] text-muted-foreground">{payout.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatBRL(payout.amount)}</p>
                  <Badge className={`text-[10px] ${statusColors[payout.status]}`}>{payout.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ── Main Component ──
export function AdminDashboard() {
  const { goBack } = useAppStore()

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border -mx-4 px-4">
        <div className="flex items-center gap-3 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10" onClick={goBack}>
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Painel de Administração
            </h1>
            <p className="text-[11px] text-muted-foreground">DomPlace · Dom Eliseu, PA</p>
          </div>
          <Badge className="bg-primary text-primary-foreground text-[10px] px-2.5">Admin</Badge>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full h-auto flex flex-wrap gap-1 bg-transparent p-0 mb-4">
            {[
              { value: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
              { value: 'stores', label: 'Lojas', icon: Store },
              { value: 'users', label: 'Usuários', icon: Users },
              { value: 'moderation', label: 'Moderação', icon: ShieldCheck },
              { value: 'finance', label: 'Financeiro', icon: DollarSign },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex-1 min-w-[90px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-lg px-3 py-2 text-xs gap-1.5 h-auto"
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="overview" forceMount={false}>
              <OverviewTab />
            </TabsContent>
            <TabsContent value="stores" forceMount={false}>
              <StoresTab />
            </TabsContent>
            <TabsContent value="users" forceMount={false}>
              <UsersTab />
            </TabsContent>
            <TabsContent value="moderation" forceMount={false}>
              <ModerationTab />
            </TabsContent>
            <TabsContent value="finance" forceMount={false}>
              <FinanceTab />
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  )
}
