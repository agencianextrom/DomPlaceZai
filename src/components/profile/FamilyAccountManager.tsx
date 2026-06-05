'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  UserPlus,
  Wallet,
  ShoppingCart,
  History,
  Shield,
  BarChart3,
  Activity,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Ban,
  Mail,
  Crown,
  Merge,
  Filter,
  Calendar,
  Store,
  Trash2,
  Clock,
  CheckCircle2,
  Package,
  Settings,
} from 'lucide-react'
import { formatBRL } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/* ── Types ── */

interface FamilyMember {
  id: string
  name: string
  email: string
  avatar: string
  role: 'admin' | 'member'
  spendingThisMonth: number
  spendingLimit: number
  permissions: {
    canOrder: boolean
    canViewOrders: boolean
    canAddToCart: boolean
  }
  joinedAt: string
}

interface SharedCartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  addedBy: string
  addedByName: string
  store: string
  image: string
}

interface FamilyOrder {
  id: string
  total: number
  status: string
  store: string
  memberName: string
  memberId: string
  date: string
  items: number
}

interface ActivityItem {
  id: string
  memberId: string
  memberName: string
  avatar: string
  action: string
  detail: string
  value?: number
  timestamp: string
  type: 'cart' | 'order' | 'limit' | 'join' | 'permission'
}

interface MonthlySpending {
  memberName: string
  thisMonth: number
  lastMonth: number
}

/* ── Mock Data ── */

const MOCK_MEMBERS: FamilyMember[] = [
  { id: 'm1', name: 'Carlos Silva', email: 'carlos@email.com', avatar: '', role: 'admin', spendingThisMonth: 342.5, spendingLimit: 600, permissions: { canOrder: true, canViewOrders: true, canAddToCart: true }, joinedAt: '2024-01-15' },
  { id: 'm2', name: 'Ana Silva', email: 'ana@email.com', avatar: '', role: 'member', spendingThisMonth: 218.9, spendingLimit: 400, permissions: { canOrder: true, canViewOrders: true, canAddToCart: true }, joinedAt: '2024-02-10' },
  { id: 'm3', name: 'João Silva', email: 'joao@email.com', avatar: '', role: 'member', spendingThisMonth: 389.0, spendingLimit: 350, permissions: { canOrder: true, canViewOrders: true, canAddToCart: true }, joinedAt: '2024-03-22' },
  { id: 'm4', name: 'Maria Silva', email: 'maria@email.com', avatar: '', role: 'member', spendingThisMonth: 89.9, spendingLimit: 250, permissions: { canOrder: false, canViewOrders: true, canAddToCart: true }, joinedAt: '2024-04-05' },
]

const MOCK_CART_ITEMS: SharedCartItem[] = [
  { id: 'c1', productId: 'p1', name: 'Arroz Tio João 5kg', price: 24.9, quantity: 2, addedBy: 'm1', addedByName: 'Carlos', store: 'Mercado do Zé', image: '' },
  { id: 'c2', productId: 'p2', name: 'Leite Integral 1L', price: 5.49, quantity: 6, addedBy: 'm2', addedByName: 'Ana', store: 'Mercado do Zé', image: '' },
  { id: 'c3', productId: 'p3', name: 'Sabonete Dove 3un', price: 18.9, quantity: 1, addedBy: 'm3', addedByName: 'João', store: 'Farmácia Vida', image: '' },
  { id: 'c4', productId: 'p4', name: 'Ração Premium 10kg', price: 89.9, quantity: 1, addedBy: 'm4', addedByName: 'Maria', store: 'Pet Shop Amigo', image: '' },
  { id: 'c5', productId: 'p5', name: 'Azeite Extra Virgem 500ml', price: 32.0, quantity: 1, addedBy: 'm1', addedByName: 'Carlos', store: 'Mercado do Zé', image: '' },
  { id: 'c6', productId: 'p6', name: 'Shampoo Pantene 400ml', price: 22.9, quantity: 2, addedBy: 'm2', addedByName: 'Ana', store: 'Farmácia Vida', image: '' },
  { id: 'c7', productId: 'p7', name: 'Café Pilão 500g', price: 19.9, quantity: 3, addedBy: 'm3', addedByName: 'João', store: 'Mercado do Zé', image: '' },
]

const MOCK_ORDERS: FamilyOrder[] = [
  { id: 'o1', total: 89.9, status: 'Entregue', store: 'Mercado do Zé', memberName: 'Carlos', memberId: 'm1', date: '2025-01-10', items: 8 },
  { id: 'o2', total: 156.4, status: 'Entregue', store: 'Farmácia Vida', memberName: 'Ana', memberId: 'm2', date: '2025-01-09', items: 5 },
  { id: 'o3', total: 234.5, status: 'Em trânsito', store: 'Pet Shop Amigo', memberName: 'João', memberId: 'm3', date: '2025-01-12', items: 12 },
  { id: 'o4', total: 45.0, status: 'Entregue', store: 'Mercado do Zé', memberName: 'Maria', memberId: 'm4', date: '2025-01-08', items: 3 },
  { id: 'o5', total: 178.3, status: 'Entregue', store: 'Mercado do Zé', memberName: 'Carlos', memberId: 'm1', date: '2025-01-05', items: 10 },
  { id: 'o6', total: 67.2, status: 'Preparando', store: 'Farmácia Vida', memberName: 'Ana', memberId: 'm2', date: '2025-01-13', items: 4 },
  { id: 'o7', total: 312.0, status: 'Entregue', store: 'Pet Shop Amigo', memberName: 'João', memberId: 'm3', date: '2025-01-03', items: 7 },
  { id: 'o8', total: 28.9, status: 'Entregue', store: 'Mercado do Zé', memberName: 'Maria', memberId: 'm4', date: '2025-01-01', items: 2 },
]

const MOCK_MONTHLY_SPENDING: MonthlySpending[] = [
  { memberName: 'Carlos', thisMonth: 342.5, lastMonth: 410.2 },
  { memberName: 'Ana', thisMonth: 218.9, lastMonth: 195.0 },
  { memberName: 'João', thisMonth: 389.0, lastMonth: 290.5 },
  { memberName: 'Maria', thisMonth: 89.9, lastMonth: 120.0 },
]

const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: 'a1', memberId: 'm3', memberName: 'João', avatar: '', action: 'adicionou 3 itens ao carrinho', detail: 'Café, Leite, Arroz', value: 89.9, timestamp: 'Há 5 minutos', type: 'cart' },
  { id: 'a2', memberId: 'm4', memberName: 'Maria', avatar: '', action: 'fez pedido', detail: 'Mercado do Zé', value: 89.9, timestamp: 'Há 1 hora', type: 'order' },
  { id: 'a3', memberId: 'm1', memberName: 'Carlos', avatar: '', action: 'atingiu 80% do limite', detail: 'Limite: R$ 600,00', value: 480, timestamp: 'Há 2 horas', type: 'limit' },
  { id: 'a2b', memberId: 'm2', memberName: 'Ana', avatar: '', action: 'adicionou 2 itens ao carrinho', detail: 'Shampoo, Sabonete', value: 41.8, timestamp: 'Há 3 horas', type: 'cart' },
  { id: 'a4', memberId: 'm3', memberName: 'João', avatar: '', action: 'bloqueado — limite atingido', detail: 'Limite mensal: R$ 350,00', value: 350, timestamp: 'Há 4 horas', type: 'limit' },
  { id: 'a5', memberId: 'm1', memberName: 'Carlos', avatar: '', action: 'atualizou permissões', detail: 'Maria pode visualizar pedidos', timestamp: 'Há 6 horas', type: 'permission' },
  { id: 'a6', memberId: 'm4', memberName: 'Maria', avatar: '', action: 'fez pedido', detail: 'Farmácia Vida', value: 28.9, timestamp: 'Há 1 dia', type: 'order' },
  { id: 'a7', memberId: 'm1', memberName: 'Carlos', avatar: '', action: 'adicionou 4 itens ao carrinho', detail: 'Azeite, Arroz, Feijão, Macarrão', value: 112.5, timestamp: 'Há 1 dia', type: 'cart' },
]

const MEMBER_COLORS: Record<string, string> = {
  m1: 'bg-emerald-500',
  m2: 'bg-violet-500',
  m3: 'bg-amber-500',
  m4: 'bg-sky-500',
}

const MEMBER_GRADIENTS: Record<string, string> = {
  m1: 'from-emerald-400 to-emerald-600',
  m2: 'from-violet-400 to-violet-600',
  m3: 'from-amber-400 to-amber-600',
  m4: 'from-sky-400 to-sky-600',
}

const STATUS_COLORS: Record<string, string> = {
  'Entregue': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'Em trânsito': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'Preparando': 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  'Cancelado': 'bg-red-500/10 text-red-600 border-red-500/20',
}

const ACTIVITY_ICONS: Record<string, string> = {
  cart: '🛒',
  order: '📦',
  limit: '⚠️',
  join: '👋',
  permission: '🔧',
}

/* ── Animation Variants ── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 22,
    },
  },
}

const fadeSlideUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 320,
      damping: 20,
    },
  },
}

const barGrowVariants = {
  hidden: { scaleX: 0 },
  visible: (width: number) => ({
    scaleX: width,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 16,
      delay: 0.2,
    },
  }),
}

/* ── Helpers ── */

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function getSpendingPercent(spent: number, limit: number): number {
  return limit > 0 ? Math.round((spent / limit) * 100) : 0
}

function getSpendingStatusColor(percent: number): string {
  if (percent >= 100) return 'bg-red-500'
  if (percent >= 80) return 'bg-amber-500'
  return 'bg-emerald-500'
}

function getSpendingLabel(percent: number): string {
  if (percent >= 100) return 'Limite atingido'
  if (percent >= 80) return 'Atenção: próximo do limite'
  return 'Dentro do limite'
}

/* ── Sub-components ── */

function SpendingProgressBar({ spent, limit }: { spent: number; limit: number }) {
  const pct = getSpendingPercent(spent, limit)
  const statusColor = getSpendingStatusColor(pct)
  const isBlocked = pct >= 100
  const isWarning = pct >= 80

  return (
    <div className="r41-spending-bar">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold">{formatBRL(spent)} de {formatBRL(limit)}</span>
        <span className={`text-[10px] font-bold ${isBlocked ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-emerald-500'}`}>
          {pct}%
        </span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${statusColor}`}
          custom={Math.min(pct / 100, 1)}
          variants={barGrowVariants}
          initial="hidden"
          animate="visible"
          style={{ transformOrigin: 'left' }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
        className={`flex items-center gap-1 text-[10px] font-semibold mt-1.5 ${
          isBlocked ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-emerald-500'
        }`
      }
      >
        {isBlocked ? <Ban className="h-3 w-3" /> : isWarning ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
        {getSpendingLabel(pct)}
      </motion.div>
    </div>
  )
}

/* ── Main Component ── */

export function FamilyAccountManager() {
  const [members, setMembers] = useState<FamilyMember[]>(MOCK_MEMBERS)
  const [activeTab, setActiveTab] = useState('members')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'member'>('member')
  const [newMemberLimit, setNewMemberLimit] = useState(300)
  const [orderFilterMember, setOrderFilterMember] = useState('all')
  const [orderFilterStore, setOrderFilterStore] = useState('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [selectedPermissionMember, setSelectedPermissionMember] = useState<string | null>(null)

  const cartItems = useMemo(() => MOCK_CART_ITEMS, [])
  const orders = useMemo(() => MOCK_ORDERS, [])
  const activities = useMemo(() => MOCK_ACTIVITIES, [])
  const monthlySpending = useMemo(() => MOCK_MONTHLY_SPENDING, [])

  const totalFamilySpending = useMemo(
    () => monthlySpending.reduce((acc, m) => acc + m.thisMonth, 0),
    [monthlySpending]
  )
  const totalLastMonth = useMemo(
    () => monthlySpending.reduce((acc, m) => acc + m.lastMonth, 0),
    [monthlySpending]
  )
  const spendingChangePercent = useMemo(() => {
    if (totalLastMonth === 0) return 0
    return Math.round(((totalFamilySpending - totalLastMonth) / totalLastMonth) * 100)
  }, [totalFamilySpending, totalLastMonth])

  const cartTotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems]
  )

  const uniqueStores = useMemo(() => {
    const stores = new Set(orders.map((o) => o.store))
    return Array.from(stores)
  }, [orders])

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderFilterMember !== 'all' && o.memberId !== orderFilterMember) return false
      if (orderFilterStore !== 'all' && o.store !== orderFilterStore) return false
      return true
    })
  }, [orders, orderFilterMember, orderFilterStore])

  const maxSpendingMember = useMemo(
    () => Math.max(...monthlySpending.map((m) => Math.max(m.thisMonth, m.lastMonth)), 1),
    [monthlySpending]
  )

  /* ── Handlers ── */

  function handleAddMember() {
    if (!newMemberName.trim() || !newMemberEmail.trim()) return
    const newMember: FamilyMember = {
      id: `m${Date.now()}`,
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      avatar: '',
      role: newMemberRole,
      spendingThisMonth: 0,
      spendingLimit: newMemberLimit,
      permissions: { canOrder: true, canViewOrders: true, canAddToCart: true },
      joinedAt: new Date().toISOString().split('T')[0],
    }
    setMembers((prev) => [...prev, newMember])
    setNewMemberName('')
    setNewMemberEmail('')
    setNewMemberRole('member')
    setNewMemberLimit(300)
    setShowAddModal(false)
  }

  function handleTogglePermission(memberId: string, permission: keyof FamilyMember['permissions']) {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? { ...m, permissions: { ...m.permissions, [permission]: !m.permissions[permission] } }
          : m
      )
    )
  }

  function handleRemoveFromCart(itemId: string) {
    void itemId
  }

  /* ── Tabs Config ── */

  const tabs = [
    { key: 'members', label: 'Membros', icon: Users },
    { key: 'limits', label: 'Limite de Gastos', icon: Wallet },
    { key: 'cart', label: 'Carrinho Compartilhado', icon: ShoppingCart },
    { key: 'history', label: 'Histórico', icon: History },
    { key: 'permissions', label: 'Permissões', icon: Shield },
    { key: 'summary', label: 'Resumo Mensal', icon: BarChart3 },
    { key: 'activity', label: 'Atividade Recente', icon: Activity },
  ] as const

  /* ── Tab: Family Members ── */

  function renderMembersTab() {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
        {/* Header with add button */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Membros da Família</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{members.length} membro{members.length !== 1 ? 's' : ''}</p>
          </div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => setShowAddModal(true)}
            >
              <UserPlus className="h-3.5 w-3.5" />
              Adicionar Membro
            </Button>
          </motion.div>
        </motion.div>

        {/* Avatar Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {members.map((member, idx) => (
            <motion.div
              key={member.id}
              variants={scaleIn}
              custom={idx}
              className="r41-member-card flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-card p-4 cursor-pointer"
              style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.06)' }}
              onClick={() => setSelectedPermissionMember(member.id === selectedPermissionMember ? null : member.id)}
            >
              <motion.div
                className="relative"
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 18 }}
              >
                <Avatar className="h-14 w-14">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className={`text-white font-bold text-lg ${MEMBER_COLORS[member.id] || 'bg-primary'}`}>
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                {member.role === 'admin' && (
                  <motion.div
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: 0.3 + idx * 0.1 }}
                  >
                    <Crown className="h-3 w-3 text-white" />
                  </motion.div>
                )}
              </motion.div>
              <div className="text-center">
                <p className="text-sm font-bold truncate max-w-full">{member.name}</p>
                <Badge
                  variant={member.role === 'admin' ? 'default' : 'secondary'}
                  className="mt-1 text-[10px]"
                >
                  {member.role === 'admin' ? 'Admin' : 'Membro'}
                </Badge>
              </div>
              <div className="text-center w-full">
                <p className="text-[10px] text-muted-foreground">Gastos este mês</p>
                <p className="text-sm font-extrabold text-primary">{formatBRL(member.spendingThisMonth)}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Add Member Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Adicionar Membro
              </DialogTitle>
              <DialogDescription>
                Convide um membro da família para compartilhar a conta
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <label className="r41-label text-xs font-semibold">Nome completo</label>
                <Input
                  placeholder="Ex: Pedro Silva"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="r41-input"
                />
              </div>
              <div className="space-y-2">
                <label className="r41-label text-xs font-semibold flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  E-mail
                </label>
                <Input
                  placeholder="pedro@email.com"
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="r41-input"
                />
              </div>
              <div className="space-y-2">
                <label className="r41-label text-xs font-semibold">Função</label>
                <div className="flex gap-2">
                  {(['admin', 'member'] as const).map((role) => (
                    <motion.div
                      key={role}
                      whileTap={{ scale: 0.96 }}
                      className={`r41-role-btn flex-1 rounded-xl p-2.5 text-center text-xs font-bold cursor-pointer border transition-colors ${
                        newMemberRole === role
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card border-border/50 text-muted-foreground'
                      }`}
                      onClick={() => setNewMemberRole(role)}
                    >
                      {role === 'admin' ? '👑 Admin' : '👤 Membro'}
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="r41-label text-xs font-semibold flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5" />
                  Limite mensal (R$)
                </label>
                <Input
                  type="number"
                  placeholder="300"
                  value={newMemberLimit}
                  onChange={(e) => setNewMemberLimit(Number(e.target.value))}
                  className="r41-input"
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <motion.div whileTap={{ scale: 0.96 }} className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 text-xs"
                  onClick={handleAddMember}
                  disabled={!newMemberName.trim() || !newMemberEmail.trim()}
                >
                  <UserPlus className="h-3.5 w-3.5 mr-1" />
                  Convidar
                </Button>
              </motion.div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    )
  }

  /* ── Tab: Spending Limits ── */

  function renderLimitsTab() {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">Limite de Gastos</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Controle mensal por membro</p>
            </div>
            <motion.div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
            >
              <Wallet className="h-3.5 w-3.5" />
              Total: {formatBRL(totalFamilySpending)}
            </motion.div>
          </div>
        </motion.div>

        {members.map((member, idx) => {
          const pct = getSpendingPercent(member.spendingThisMonth, member.spendingLimit)
          return (
            <motion.div
              key={member.id}
              variants={itemVariants}
              className="r41-limit-card rounded-2xl border border-border/50 bg-card p-4"
              style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={`text-white font-bold text-sm ${MEMBER_COLORS[member.id] || 'bg-primary'}`}>
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold truncate">{member.name}</p>
                    {member.role === 'admin' && (
                      <Badge variant="outline" className="text-[9px] py-0 px-1.5">
                        <Crown className="h-2.5 w-2.5 mr-0.5" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{member.email}</p>
                </div>
                <div className={`text-right ${pct >= 100 ? 'text-red-500' : pct >= 80 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  <p className="text-lg font-extrabold">{pct}%</p>
                </div>
              </div>
              <SpendingProgressBar spent={member.spendingThisMonth} limit={member.spendingLimit} />
              <Separator className="my-3" />
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">
                  Restam {formatBRL(Math.max(0, member.spendingLimit - member.spendingThisMonth))}
                </p>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm" className="min-h-[44px] min-w-[44px] text-[10px] h-7 px-2 active:scale-95 transition-transform">
                    <Settings className="h-3 w-3 mr-1" />
                    Ajustar
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    )
  }

  /* ── Tab: Shared Cart ── */

  function renderCartTab() {
    const groupedByMember = useMemo(() => {
      const groups: Record<string, SharedCartItem[]> = {}
      cartItems.forEach((item) => {
        if (!groups[item.addedBy]) groups[item.addedBy] = []
        groups[item.addedBy].push(item)
      })
      return groups
    }, [cartItems])

    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Carrinho Compartilhado</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{cartItems.length} itens de {Object.keys(groupedByMember).length} membro{Object.keys(groupedByMember).length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                <Merge className="h-3.5 w-3.5" />
                Mesclar Carts
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Cart Total Banner */}
        <motion.div
          variants={itemVariants}
          className="r41-cart-total rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold">Total do Carrinho</span>
            </div>
            <motion.span
              className="text-xl font-extrabold text-primary"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
            >
              {formatBRL(cartTotal)}
            </motion.span>
          </div>
        </motion.div>

        {/* Grouped by member */}
        {Object.entries(groupedByMember).map(([memberId, items]) => {
          const member = members.find((m) => m.id === memberId)
          const memberName = member?.name || items[0].addedByName
          const memberTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
          return (
            <motion.div
              key={memberId}
              variants={itemVariants}
              className="r41-cart-group rounded-2xl border border-border/50 bg-card overflow-hidden"
              style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}
            >
              <div className={`px-4 py-3 bg-gradient-to-r ${MEMBER_GRADIENTS[memberId] || 'from-gray-400 to-gray-600'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border-2 border-white/30">
                      <AvatarFallback className="text-white text-xs font-bold">
                        {getInitials(memberName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-white">{memberName}</p>
                      <p className="text-[10px] text-white/70">{items.length} itens</p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-white">{formatBRL(memberTotal)}</span>
                </div>
              </div>
              <div className="divide-y divide-border/50">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring' as const, stiffness: 300, damping: 22, delay: 0.1 }}
                    className="r41-cart-item flex items-center gap-3 px-4 py-3"
                  >
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">{item.store} · Qtd: {item.quantity}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold">{formatBRL(item.price * item.quantity)}</p>
                      <p className="text-[10px] text-muted-foreground">{formatBRL(item.price)} un</p>
                    </div>
                    <motion.div whileTap={{ scale: 0.85 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="min-h-[44px] min-w-[44px] h-7 w-7 p-0 text-muted-foreground hover:text-red-500 active:scale-95 transition-transform"
                        onClick={() => handleRemoveFromCart(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    )
  }

  /* ── Tab: Order History ── */

  function renderHistoryTab() {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
        <motion.div variants={itemVariants}>
          <h3 className="text-base font-bold">Histórico de Pedidos</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Pedidos de todos os membros da família</p>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="r41-order-filters flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            Filtrar:
          </div>
          <motion.div whileTap={{ scale: 0.96 }}>
            <select
              value={orderFilterMember}
              onChange={(e) => setOrderFilterMember(e.target.value)}
              className="r41-filter-select text-xs bg-card border border-border/50 rounded-lg px-2.5 py-1.5 font-medium"
            >
              <option value="all">Todos os Membros</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </motion.div>
          <motion.div whileTap={{ scale: 0.96 }}>
            <select
              value={orderFilterStore}
              onChange={(e) => setOrderFilterStore(e.target.value)}
              className="r41-filter-select text-xs bg-card border border-border/50 rounded-lg px-2.5 py-1.5 font-medium"
            >
              <option value="all">Todas as Lojas</option>
              {uniqueStores.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </motion.div>
        </motion.div>

        {/* Orders List */}
        <AnimatePresence mode="popLayout">
          {filteredOrders.map((order, idx) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 24 }}
              className="r41-order-card rounded-2xl border border-border/50 bg-card overflow-hidden"
              style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}
            >
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className={`text-white text-xs font-bold ${MEMBER_COLORS[order.memberId] || 'bg-primary'}`}>
                    {getInitials(order.memberName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold truncate">{order.memberName}</p>
                    <Badge
                      variant="outline"
                      className={`text-[9px] py-0 px-1.5 ${STATUS_COLORS[order.status] || ''}`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Store className="h-2.5 w-2.5" />
                    {order.store} · {order.items} itens
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-extrabold">{formatBRL(order.total)}</p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="h-2.5 w-2.5" />
                    {order.date}
                  </div>
                </div>
                {expandedOrder === order.id ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </div>
              <AnimatePresence>
                {expandedOrder === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
                    className="overflow-hidden"
                  >
                    <Separator />
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Package className="h-3.5 w-3.5" />
                          <span>{order.items} itens</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Store className="h-3.5 w-3.5" />
                          <span>{order.store}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Pedido #{order.id.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredOrders.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="r41-empty-state text-center py-8"
          >
            <History className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum pedido encontrado</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tente ajustar os filtros</p>
          </motion.div>
        )}
      </motion.div>
    )
  }

  /* ── Tab: Permissions ── */

  function renderPermissionsTab() {
    const permissionLabels: Record<string, { label: string; description: string }> = {
      canOrder: { label: 'Pode fazer pedidos', description: 'Permitir que este membro finalize compras' },
      canViewOrders: { label: 'Pode ver pedidos', description: 'Permitir acesso ao histórico de pedidos' },
      canAddToCart: { label: 'Pode adicionar ao carrinho', description: 'Permitir adicionar itens ao carrinho compartilhado' },
    }

    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
        <motion.div variants={itemVariants}>
          <h3 className="text-base font-bold">Permissões</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Gerencie o que cada membro pode fazer</p>
        </motion.div>

        {members.map((member) => (
          <motion.div
            key={member.id}
            variants={itemVariants}
            className="r41-perm-card rounded-2xl border border-border/50 bg-card p-4"
            style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className={`text-white font-bold text-sm ${MEMBER_COLORS[member.id] || 'bg-primary'}`}>
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold truncate">{member.name}</p>
                  {member.role === 'admin' && (
                    <Badge variant="default" className="text-[9px] py-0 px-1.5">
                      <Crown className="h-2.5 w-2.5 mr-0.5" />
                      Admin
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">{member.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              {(Object.keys(permissionLabels) as Array<keyof FamilyMember['permissions']>).map((perm) => {
                const info = permissionLabels[perm]
                const isDisabled = member.role === 'admin' && perm === 'canOrder'
                return (
                  <div
                    key={perm}
                    className="r41-perm-row flex items-center justify-between py-2 px-3 rounded-xl bg-muted/30"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-xs font-semibold">{info.label}</p>
                      <p className="text-[10px] text-muted-foreground">{info.description}</p>
                    </div>
                    <Switch
                      checked={member.permissions[perm]}
                      disabled={isDisabled}
                      onCheckedChange={() => {
                        if (!isDisabled) handleTogglePermission(member.id, perm)
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </motion.div>
    )
  }

  /* ── Tab: Monthly Summary ── */

  function renderSummaryTab() {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
        <motion.div variants={itemVariants} className="r41-summary-header rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold">Resumo Mensal</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Janeiro 2025</p>
            </div>
            <motion.div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                spendingChangePercent < 0
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-red-500/10 text-red-600'
              }`}
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
            >
              {spendingChangePercent < 0 ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5" />
              )}
              {Math.abs(spendingChangePercent)}% vs mês anterior
            </motion.div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-card/60 backdrop-blur-sm p-3">
              <p className="text-[10px] text-muted-foreground font-medium">Este Mês</p>
              <motion.p
                className="text-xl font-extrabold mt-0.5"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 260, damping: 20, delay: 0.2 }}
              >
                {formatBRL(totalFamilySpending)}
              </motion.p>
            </div>
            <div className="rounded-xl bg-card/60 backdrop-blur-sm p-3">
              <p className="text-[10px] text-muted-foreground font-medium">Mês Anterior</p>
              <p className="text-xl font-extrabold text-muted-foreground mt-0.5">
                {formatBRL(totalLastMonth)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Per-Member Comparison Chart */}
        <motion.div
          variants={itemVariants}
          className="r41-chart-card rounded-2xl border border-border/50 bg-card p-4"
          style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-bold">Gastos por Membro</h4>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="text-[10px] text-muted-foreground font-medium">Este mês</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <span className="text-[10px] text-muted-foreground font-medium">Mês anterior</span>
            </div>
          </div>

          <div className="space-y-4">
            {monthlySpending.map((entry, idx) => {
              const thisWidth = maxSpendingMember > 0 ? entry.thisMonth / maxSpendingMember : 0
              const lastWidth = maxSpendingMember > 0 ? entry.lastMonth / maxSpendingMember : 0
              const change = entry.lastMonth > 0
                ? Math.round(((entry.thisMonth - entry.lastMonth) / entry.lastMonth) * 100)
                : 0
              return (
                <div key={entry.memberName}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className={`text-white text-[9px] font-bold ${MEMBER_COLORS[members[idx]?.id || ''] || 'bg-primary'}`}>
                          {getInitials(entry.memberName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-bold">{entry.memberName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold">{formatBRL(entry.thisMonth)}</span>
                      <span className={`text-[10px] font-bold ${change < 0 ? 'text-emerald-500' : change > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {change > 0 ? '+' : ''}{change}%
                      </span>
                    </div>
                  </div>
                  {/* Last month bar (background) */}
                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
                    <motion.div
                      className="h-full rounded-full bg-muted-foreground/20"
                      custom={lastWidth}
                      variants={barGrowVariants}
                      initial="hidden"
                      animate="visible"
                      style={{ transformOrigin: 'left' }}
                    />
                  </div>
                  {/* This month bar (foreground) */}
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                      custom={thisWidth}
                      variants={barGrowVariants}
                      initial="hidden"
                      animate="visible"
                      style={{ transformOrigin: 'left' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Family Total Progress */}
        <motion.div
          variants={itemVariants}
          className="r41-family-progress rounded-2xl border border-border/50 bg-card p-4"
          style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-bold">Total Familiar</h4>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Orçamento familiar mensal</span>
            <span className="text-xs font-bold">{formatBRL(2000)}</span>
          </div>
          <Progress value={Math.min((totalFamilySpending / 2000) * 100, 100)} className="h-3" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-bold">{formatBRL(totalFamilySpending)} gastos</span>
            <span className="text-xs text-muted-foreground">
              Restam {formatBRL(Math.max(0, 2000 - totalFamilySpending))}
            </span>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  /* ── Tab: Activity Feed ── */

  function renderActivityTab() {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
        <motion.div variants={itemVariants}>
          <h3 className="text-base font-bold">Atividade Recente</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Últimas ações dos membros da família</p>
        </motion.div>

        <div className="r41-activity-feed space-y-1">
          {activities.map((activity, idx) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: 'spring' as const,
                stiffness: 300,
                damping: 22,
                delay: idx * 0.06,
              }}
              className="r41-activity-item flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-muted/30 transition-colors"
            >
              <div className="relative shrink-0 mt-0.5">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={`text-white text-[10px] font-bold ${MEMBER_COLORS[activity.memberId] || 'bg-primary'}`}>
                    {getInitials(activity.memberName)}
                  </AvatarFallback>
                </Avatar>
                <motion.div
                  className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-card flex items-center justify-center text-[10px]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: 0.3 + idx * 0.06 }}
                >
                  {ACTIVITY_ICONS[activity.type] || '📋'}
                </motion.div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs">
                  <span className="font-bold">{activity.memberName}</span>{' '}
                  <span className="text-muted-foreground">{activity.action}</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{activity.detail}</p>
                {activity.value !== undefined && (
                  <motion.p
                    className="text-xs font-bold text-primary mt-0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + idx * 0.06 }}
                  >
                    {formatBRL(activity.value)}
                  </motion.p>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                {activity.timestamp}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    )
  }

  /* ── Render Active Tab ── */

  function renderActiveTab() {
    switch (activeTab) {
      case 'members': return renderMembersTab()
      case 'limits': return renderLimitsTab()
      case 'cart': return renderCartTab()
      case 'history': return renderHistoryTab()
      case 'permissions': return renderPermissionsTab()
      case 'summary': return renderSummaryTab()
      case 'activity': return renderActivityTab()
      default: return renderMembersTab()
    }
  }

  /* ── Main Render ── */

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="r41-family-manager space-y-4 r62-card-lift r95-family-acct-card"
    >
      {/* Title Header */}
      <motion.div variants={fadeSlideUp} className="r41-header flex items-center gap-3">
        <motion.div
          className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center"
          style={{ boxShadow: '0 2px 8px 0 rgba(99,102,241,0.25)' }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }}
        >
          <Users className="h-5 w-5 text-white" />
        </motion.div>
        <div>
          <h2 className="text-lg font-extrabold r62-heading-gradient">Conta Familiar</h2>
          <p className="text-xs text-muted-foreground">Gerencie membros, limites e permissões</p>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        variants={itemVariants}
        className="r41-tabs-nav flex gap-1.5 overflow-x-auto pb-1 scrollbar-none"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <motion.div
              key={tab.key}
              whileTap={{ scale: 0.95 }}
              className="shrink-0"
            >
              <button
                onClick={() => setActiveTab(tab.key)}
                className={`r41-tab-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground border border-border/50 hover:bg-muted/50'
                }`}
                style={isActive ? { boxShadow: '0 2px 8px 0 rgba(99,102,241,0.2)' } : undefined}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 26 }}
        >
          {renderActiveTab()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
