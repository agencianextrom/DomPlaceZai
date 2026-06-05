'use client'

import { useState, useEffect } from 'react'
import { 
  User, MapPin, CreditCard, Heart, ClipboardList, Gift, Users, Settings, LogOut, 
  Star, ChevronRight, Award, Edit3, Plus, Trash2, Package, ShoppingBag, Clock,
  Bell, Moon, MapPinned, Share2, Ticket, Copy, Check, ListChecks, LayoutDashboard,
  BellRing, Shield, Headphones, PartyPopper, Truck, UserPlus, Loader2, LogIn
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useAppStore } from '@/store/useAppStore'
import { motion } from 'framer-motion'
import { formatBRL } from '@/components/product/ProductCard'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { LoyaltyHistory } from './LoyaltyHistory'
import { FamilyAccountManager } from './FamilyAccountManager'
import { LoyaltyTier } from './LoyaltyTier'
import { LoyaltyCard } from './LoyaltyCard'
import { RewardsSection } from './RewardsSection'
import { SpendingTracker } from './SpendingTracker'
import { AchievementsPanel } from './AchievementsPanel'
import { ReferralProgram } from './ReferralProgram'
import { AddressManager } from './AddressManager'
import { SpinWheel } from '@/components/promotions/SpinWheel'
import { toast } from 'sonner'
import { signOut } from 'next-auth/react'

// Types
interface ProfileData {
  id: string
  email: string
  name: string | null
  phone: string | null
  avatar: string | null
  role: string
  status: string
  createdAt: string
  cpf: string | null
  bio: string | null
  dateOfBirth: string | null
  loyaltyBalance: number
  totalSpent: number
  orderCount: number
  addressCount: number
  favoriteCount: number
}

interface OrderItem {
  id: string
  orderNumber: string
  storeId: string
  storeName: string
  storeLogo: string | null
  status: string
  total: number
  items: { productName: string; quantity: number; price: number; total: number }[]
  createdAt: string
}

interface LoyaltyData {
  currentBalance: number
  totalEarned: number
  totalRedeemed: number
}

interface FavoriteStore {
  id: string
  name: string
  logo: string | null
  category: string
  rating: number
}

// Status mapping
const statusMap: Record<string, { label: string; color: string }> = {
  DELIVERED: { label: 'Entregue', color: 'bg-emerald-100 text-emerald-700' },
  DELIVERING: { label: 'Em Entrega', color: 'bg-purple-100 text-purple-700' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700' },
  PREPARING: { label: 'Preparando', color: 'bg-amber-100 text-amber-700' },
  PENDING: { label: 'Pendente', color: 'bg-gray-100 text-gray-700' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
}

function formatStatus(status: string) {
  return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700' }
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Agora'
  if (diffMin < 60) return `${diffMin}min atrás`
  if (diffHr < 24) return `${diffHr}h atrás`
  if (diffDay === 1) return 'Ontem'
  if (diffDay < 7) return `${diffDay} dias atrás`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

// Coupons (promo UI - kept as-is)
const coupons = [
  { code: 'ACAI10', desc: '10% de desconto em pedidos acima de R$30', discount: '10%', validUntil: '30/06/2025', used: false },
  { code: 'FRETE5', desc: 'R$5 de desconto no frete', discount: 'R$5', validUntil: '15/05/2025', used: false },
  { code: 'BEMVINDO', desc: '20% de desconto na primeira compra', discount: '20%', validUntil: '31/12/2025', used: true },
]

const menuItems = [
  { id: 'profile', icon: User, label: 'Meus Dados', desc: 'Nome, e-mail, telefone' },
  { id: 'addresses', icon: MapPin, label: 'Endereços', desc: 'Gerenciar endereços de entrega' },
  { id: 'payments', icon: CreditCard, label: 'Pagamentos', desc: 'Cartões e formas de pagamento' },
  { id: 'favorites', icon: Heart, label: 'Favoritos', desc: 'Lojas e produtos favoritos' },
  { id: 'orders', icon: ClipboardList, label: 'Pedidos', desc: 'Histórico de pedidos' },
  { id: 'loyalty', icon: Award, label: 'Programa de Fidelidade', desc: 'Pontos e recompensas' },
  { id: 'family', icon: Users, label: 'Conta Familiar', desc: 'Compartilhe com a família' },
  { id: 'notifications', icon: BellRing, label: 'Notificações', desc: 'Central de notificações' },
  { id: 'shopping-lists', icon: ListChecks, label: 'Listas de Compras', desc: 'Organize suas compras' },
  { id: 'referral', icon: Users, label: 'Indique Amigos', desc: 'Ganhe com indicações' },
  { id: 'driver-dashboard', icon: Truck, label: 'Painel do Entregador', desc: 'Gerencie suas entregas' },
  { id: 'affiliate-dashboard', icon: UserPlus, label: 'Painel do Afiliado', desc: 'Ganhe com indicações' },
  { id: 'store-dashboard', icon: LayoutDashboard, label: 'Painel da Loja', desc: 'Gerencie sua loja' },
  { id: 'admin-dashboard', icon: Shield, label: 'Painel do Admin', desc: 'Administração da plataforma' },
  { id: 'support-center', icon: Headphones, label: 'Ajuda & Suporte', desc: 'FAQ, chamados e contato' },
  { id: 'settings', icon: Settings, label: 'Configuracoes', desc: 'Notificacoes e preferencias' },
  { id: 'spin-wheel', icon: PartyPopper, label: 'Roleta de Premios', desc: 'Gire e ganhe descontos exclusivos' },
]

export function ProfileView() {
  const { navigate, currentUser } = useAppStore()
  // Client-side favorites from Zustand store (may differ from DB count)
  const clientFavoriteCount = useAppStore(
    (s) => s.favoriteProductIds.size + s.favoriteStoreIds.size
  )
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = useState(false)
  const [locationEnabled, setLocationEnabled] = useState(true)
  const [copiedReferral, setCopiedReferral] = useState(false)

  // API data
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([])
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null)
  const [favoriteStores, setFavoriteStores] = useState<FavoriteStore[]>([])
  const [loading, setLoading] = useState(true)

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [profileRes, ordersRes, loyaltyRes, favsRes] = await Promise.allSettled([
          fetch('/api/profile').then(r => r.json()),
          currentUser?.id ? fetch(`/api/orders?accountId=${currentUser.id}&limit=3`).then(r => r.json()) : Promise.resolve({ orders: [] }),
          fetch('/api/loyalty').then(r => r.json()),
          currentUser?.id ? fetch(`/api/favorites?accountId=${currentUser.id}&type=store&limit=5`).then(r => r.json()) : Promise.resolve({ favorites: [] }),
        ])

        if (profileRes.status === 'fulfilled' && profileRes.value.success) {
          setProfile(profileRes.value.profile)
          setEditName(profileRes.value.profile.name || '')
          setEditPhone(profileRes.value.profile.phone || '')
          setEditBio(profileRes.value.profile.bio || '')
        }

        if (ordersRes.status === 'fulfilled' && ordersRes.value.orders) {
          setRecentOrders(ordersRes.value.orders)
        }

        if (loyaltyRes.status === 'fulfilled' && loyaltyRes.value.success) {
          setLoyaltyData(loyaltyRes.value.data)
        }

        if (favsRes.status === 'fulfilled' && favsRes.value.favorites) {
          setFavoriteStores(
            favsRes.value.favorites
              .filter((f: { store: FavoriteStore | null }) => f.store !== null)
              .map((f: { store: FavoriteStore }) => f.store)
          )
        }
      } catch (error) {
        console.error('Erro ao carregar dados do perfil:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentUser?.id])

  // Save profile
  async function handleSaveProfile() {
    setEditSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, phone: editPhone, bio: editBio }),
      })
      const data = await res.json()
      if (data.success) {
        setProfile(data.profile)
        setEditOpen(false)
        toast.success('Perfil atualizado com sucesso!')
      } else {
        toast.error(data.error || 'Erro ao atualizar perfil')
      }
    } catch {
      toast.error('Erro ao atualizar perfil. Tente novamente.')
    } finally {
      setEditSaving(false)
    }
  }

  // Handle logout
  function handleLogout() {
    signOut({ callbackUrl: '/' })
  }

  // Derived values
  const displayName = profile?.name || currentUser?.name || 'Usuário'
  const displayEmail = profile?.email || currentUser?.email || ''
  const avatarInitial = displayName.charAt(0).toUpperCase()
  const orderCount = profile?.orderCount ?? 0
  // Use the max of DB favorites and client-side favorites to stay in sync
  const favoriteCount = Math.max(
    profile?.favoriteCount ?? 0,
    clientFavoriteCount
  )
  const loyaltyPoints = loyaltyData?.currentBalance ?? profile?.loyaltyBalance ?? 0

  if (activeSection === 'loyalty') {
    return (
      <div className="min-h-screen p-4 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setActiveSection(null)} className="h-10 w-10 min-h-[44px] min-w-[44px]">
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Button>
          <h1 className="text-lg font-bold">Programa de Fidelidade</h1>
        </div>
        <LoyaltyHistory />
      </div>
    )
  }

  if (activeSection === 'family') {
    return (
      <div className="min-h-screen p-4 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setActiveSection(null)} className="h-10 w-10 min-h-[44px] min-w-[44px]">
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Button>
          <h1 className="text-lg font-bold">Conta Familiar</h1>
        </div>
        <FamilyAccountManager />
      </div>
    )
  }

  if (activeSection === 'addresses') {
    return (
      <div className="min-h-screen p-4 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setActiveSection(null)} className="h-10 w-10 min-h-[44px] min-w-[44px]">
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Button>
          <h1 className="text-lg font-bold">Endereços</h1>
        </div>
        <AddressManager />
      </div>
    )
  }

  if (activeSection === 'coupons') {
    return (
      <div className="min-h-screen p-4 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setActiveSection(null)} className="h-10 w-10 min-h-[44px] min-w-[44px]">
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Button>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            Meus Cupons
          </h1>
        </div>
        
        <div className="space-y-3">
          {coupons.map((coupon) => (
            <Card key={coupon.code} className={coupon.used ? 'opacity-60' : 'border-primary/20'}>
              <CardContent className="p-0">
                <div className="flex">
                  {/* Coupon left side */}
                  <div className={`w-28 flex flex-col items-center justify-center p-3 border-r border-dashed border-border ${coupon.used ? 'bg-muted' : 'bg-gradient-to-b from-primary to-emerald-600 text-white'}`}>
                    <span className={`text-xl font-bold ${coupon.used ? 'text-muted-foreground' : ''}`}>
                      {coupon.discount}
                    </span>
                    <span className={`text-[10px] mt-0.5 ${coupon.used ? 'text-muted-foreground/60' : 'text-white/80'}`}>
                      {coupon.used ? 'Usado' : 'Desconto'}
                    </span>
                  </div>
                  {/* Coupon right side */}
                  <div className="flex-1 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm">{coupon.code}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 min-h-[44px] text-xs"
                        onClick={() => {
                          navigator.clipboard.writeText(coupon.code)
                          toast.success(`Cupom ${coupon.code} copiado!`)
                        }}
                        disabled={coupon.used}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copiar
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{coupon.desc}</p>
                    <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      Válido até {coupon.validUntil}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (activeSection === 'referral') {
    const referralLink = `https://domplace.com/invite/${displayName.toLowerCase().replace(/\s+/g, '-')}`
    return (
      <div className="min-h-screen p-4 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setActiveSection(null)} className="h-10 w-10 min-h-[44px] min-w-[44px]">
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Button>
          <h1 className="text-lg font-bold">Indique Amigos</h1>
        </div>

        <Card className="bg-gradient-to-br from-primary to-emerald-600 border-0 mb-4">
          <CardContent className="p-6 text-center text-white">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-80" />
            <h2 className="text-xl font-bold">Ganhe R$10 por indicação!</h2>
            <p className="text-sm text-white/80 mt-2">
              Compartilhe seu link e ganhe R$10 de desconto para cada amigo que se cadastrar e fizer uma compra.
            </p>
            <div className="bg-white/15 rounded-xl p-3 mt-4 backdrop-blur-sm">
              <p className="text-xs text-white/70 mb-1">Seu link de indicação</p>
              <div className="flex items-center gap-2">
                <code className="text-xs flex-1 truncate text-left">{referralLink}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-white hover:bg-white/20 shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(referralLink)
                    setCopiedReferral(true)
                    toast.success('Link copiado!')
                    setTimeout(() => setCopiedReferral(false), 2000)
                  }}
                >
                  {copiedReferral ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white/15 rounded-xl p-3">
                <p className="text-2xl font-bold">5</p>
                <p className="text-[10px] text-white/70">Amigos indicados</p>
              </div>
              <div className="bg-white/15 rounded-xl p-3">
                <p className="text-2xl font-bold">R$50</p>
                <p className="text-[10px] text-white/70">Ganhos totais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Share2 className="h-4 w-4" />
          Compartilhar no WhatsApp
        </Button>
      </div>
    )
  }

  if (activeSection === 'settings') {
    return (
      <div className="min-h-screen p-4 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setActiveSection(null)} className="h-10 w-10 min-h-[44px] min-w-[44px]">
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Button>
          <h1 className="text-lg font-bold">Configurações</h1>
        </div>

        <div className="space-y-2">
          {[
            { label: 'Notificações push', desc: 'Receba atualizações de pedidos e promoções', icon: Bell, value: notificationsEnabled, onToggle: () => setNotificationsEnabled(v => !v) },
            { label: 'Modo escuro', desc: 'Ativar tema escuro no aplicativo', icon: Moon, value: darkModeEnabled, onToggle: () => setDarkModeEnabled(v => !v) },
            { label: 'Localização', desc: 'Permitir acesso à localização para entregas', icon: MapPinned, value: locationEnabled, onToggle: () => setLocationEnabled(v => !v) },
          ].map((setting) => (
            <Card key={setting.label} className="border-border/50 r38-profile-toggle-card r43-toggle-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <setting.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{setting.label}</p>
                  <p className="text-xs text-muted-foreground">{setting.desc}</p>
                </div>
                <Switch
                  checked={setting.value}
                  onCheckedChange={setting.onToggle}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (activeSection === 'spin-wheel') {
    return (
      <div className="min-h-screen p-4 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setActiveSection(null)} className="h-10 w-10 min-h-[44px] min-w-[44px]">
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Button>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <PartyPopper className="h-5 w-5 text-amber-500" />
            Roleta de Premios
          </h1>
        </div>

        <div className="max-w-sm mx-auto">
          {/* Spin Wheel Info */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200/50 dark:border-amber-800/30 mb-6">
            <CardContent className="p-4 text-center">
              <h2 className="font-bold text-sm mb-1">Gire a roleta e ganhe!</h2>
              <p className="text-xs text-muted-foreground">
                Uma girada gratis por dia. Descontos exclusivos esperando por voce!
              </p>
            </CardContent>
          </Card>

          {/* Spin Wheel Component */}
          <SpinWheel />
        </div>
      </div>
    )
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen p-4 pb-24">
        {/* Cover skeleton */}
        <div className="relative overflow-hidden rounded-2xl mb-5">
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
          {[0, 1, 2].map(i => (
            <Card key={i} className="border-border">
              <CardContent className="p-3 text-center">
                <Skeleton className="h-8 w-8 rounded-lg mx-auto mb-2" />
                <Skeleton className="h-5 w-10 mx-auto mb-1" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loyalty skeleton */}
        <Skeleton className="h-20 w-full rounded-xl mb-4" />

        {/* Orders skeleton */}
        <div className="mb-6">
          <Skeleton className="h-4 w-28 mb-3" />
          <div className="space-y-2">
            {[0, 1].map(i => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>

        {/* Menu skeleton */}
        <div className="space-y-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Non-authenticated user: show login prompt */}
      {!currentUser ? (
        <div className="min-h-screen p-4 pb-24">
          {/* Profile header with gradient cover area and wave bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl mb-5"
          >
            {/* Cover gradient area */}
            <div className="relative bg-gradient-to-br from-primary via-emerald-600 to-teal-600 pt-6 pb-8 text-white">
              {/* Background decorations */}
              <div className="absolute inset-0 opacity-[0.06]" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }} />
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
              <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/[0.03] rounded-full" />
              
              {/* Profile info - login prompt */}
              <div className="relative px-6">
                <div className="flex items-end gap-4">
                  {/* Avatar placeholder */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring' as const, stiffness: 300, damping: 25 }}
                    className="relative"
                  >
                    <div className="r38-profile-avatar-ring">
                      <div className="h-22 w-22 sm:h-26 sm:w-26 rounded-[13px] bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-md flex items-center justify-center text-4xl sm:text-5xl font-bold border-2 border-white/30 shadow-lg">
                        <User className="h-10 w-10 sm:h-12 sm:w-12 text-white/70" />
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-400 border-[3px] border-emerald-600 pulse-dot" />
                  </motion.div>
                  <div className="flex-1 pb-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-shadow-lg">Visitante</h1>
                    <p className="text-sm text-white/70 mt-0.5">Faça login para ver seu perfil</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-white/15 hover:bg-white/25 text-white border border-white/20 text-sm backdrop-blur-sm shrink-0"
                    onClick={() => useAppStore.getState().openAuthModal()}
                  >
                    <LogIn className="h-3 w-3 mr-1" />
                    Entrar
                  </Button>
                </div>
              </div>
              
              {/* SVG wave bottom edge */}
              <svg className="absolute bottom-0 left-0 right-0 z-10" viewBox="0 0 1440 32" fill="none" preserveAspectRatio="none">
                <path d="M0 16C180 28 360 4 540 16C720 28 900 4 1080 16C1260 28 1440 16 1440 16V32H0V16Z" fill="oklch(0.99 0.002 120)" className="dark:hidden" />
                <path d="M0 16C180 28 360 4 540 16C720 28 900 4 1080 16C1260 28 1440 16 1440 16V32H0V16Z" fill="oklch(0.15 0.015 150)" className="hidden dark:block" />
              </svg>
            </div>
          </motion.div>

          {/* Empty state - login prompt */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/10 to-emerald-100 dark:from-primary/20 dark:to-emerald-900/20 flex items-center justify-center">
                <User className="h-10 w-10 text-primary/40" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-3 rounded-full border border-dashed border-primary/15"
              />
            </motion.div>
            <h2 className="text-lg font-bold mt-5">Faça login para ver seu perfil</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              Acesse sua conta para ver pedidos, favoritos, pontos de fidelidade e muito mais.
            </p>
            <Button
              className="mt-5 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8 btn-glow"
              onClick={() => useAppStore.getState().openAuthModal()}
            >
              <LogIn className="h-4 w-4" />
              Entrar na conta
            </Button>
          </motion.div>

          <Separator className="my-4 section-divider" />
          
          {/* Menu items - visible but prompt login when clicked */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <div className="space-y-1.5">
              {menuItems.map((item, idx) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + idx * 0.06 }}
                  whileHover={{ x: 3, y: -3, boxShadow: '0 4px 16px rgba(16,185,129,0.12), 0 2px 4px rgba(0,0,0,0.06)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    toast.info('Faça login para acessar esta funcionalidade')
                    useAppStore.getState().openAuthModal()
                  }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border/40 hover:border-primary/15 transition-all text-left group r38-profile-menu-item r43-menu-item-border r46-menu-item-hover"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/[0.06] group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 shrink-0 transition-all" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      ) : (
      <>
      {/* Profile header with animated gradient border effect */}
      <div className="profile-card-animated-border r43-conic-gradient-border r46-profile-card-glow mb-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 260, damping: 25 }}
        className="relative overflow-hidden rounded-[14px]"
      >
        {/* Cover gradient area */}
        <div className="relative bg-gradient-to-br from-primary via-emerald-600 to-teal-600 pt-6 pb-8 text-white">
          {/* Background decorations */}
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }} />
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/[0.03] rounded-full" />
          
          {/* Profile info */}
          <div className="relative px-6">
            <div className="flex items-end gap-4">
              {/* Avatar with rotating gradient ring */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring' as const, stiffness: 300, damping: 25 }}
                className="relative"
              >
                <div className="r38-profile-avatar-ring r43-avatar-ring-pulse r46-avatar-ring-glow">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={displayName}
                      className="h-22 w-22 sm:h-26 sm:w-26 rounded-[13px] object-cover border-2 border-white/30 shadow-lg"
                    />
                  ) : (
                    <div className="h-22 w-22 sm:h-26 sm:w-26 rounded-[13px] bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-md flex items-center justify-center text-4xl sm:text-5xl font-bold border-2 border-white/30 shadow-lg">
                      {avatarInitial}
                    </div>
                  )}
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-400 border-[3px] border-emerald-600 pulse-dot" />
              </motion.div>
              <div className="flex-1 pb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-shadow-lg">{displayName}</h1>
                <p className="text-sm text-white/70 mt-0.5">{displayEmail}</p>
                {profile?.createdAt && (
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-white/10 text-white/80 text-[10px] font-medium r38-profile-member-badge r43-member-badge">
                    Membro desde {new Date(profile.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
              <Button 
                size="sm" 
                className="r38-profile-edit-btn r43-edit-btn r46-edit-btn-shimmer text-white border border-white/20 text-sm backdrop-blur-sm shrink-0"
                onClick={() => {
                  setEditName(profile?.name || '')
                  setEditPhone(profile?.phone || '')
                  setEditBio(profile?.bio || '')
                  setEditOpen(true)
                }}
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Editar
              </Button>
            </div>
          </div>
          
          {/* SVG wave bottom edge */}
          <svg className="absolute bottom-0 left-0 right-0 z-10" viewBox="0 0 1440 32" fill="none" preserveAspectRatio="none">
            <path d="M0 16C180 28 360 4 540 16C720 28 900 4 1080 16C1260 28 1440 16 1440 16V32H0V16Z" fill="oklch(0.99 0.002 120)" className="dark:hidden" />
            <path d="M0 16C180 28 360 4 540 16C720 28 900 4 1080 16C1260 28 1440 16 1440 16V32H0V16Z" fill="oklch(0.15 0.015 150)" className="hidden dark:block" />
          </svg>
        </div>
        
        {/* Stats row (overlapping the wave) */}
        <div className="relative z-20 px-4 -mt-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' as const, stiffness: 260, damping: 20 }}
              className="bg-card rounded-xl border border-border p-3 text-center shadow-sm r38-profile-stat-card r43-stat-card-glow r46-stat-card-lift"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1.5">
                <ShoppingBag className="h-4 w-4 text-primary" />
              </div>
              <p className="text-lg font-bold text-primary animate-count-up text-glow-emerald"><AnimatedCounter value={orderCount} duration={1000} locale /></p>
              <p className="text-[10px] text-muted-foreground">Pedidos</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' as const, stiffness: 260, damping: 20 }}
              className="bg-card rounded-xl border border-border p-3 text-center shadow-sm r38-profile-stat-card r43-stat-card-glow r46-stat-card-lift"
            >
              <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-1.5">
                <Heart className="h-4 w-4 text-red-500" />
              </div>
              <p className="text-lg font-bold text-red-500 animate-count-up" style={{ animationDelay: '0.1s' }}><AnimatedCounter value={favoriteCount} duration={1000} delay={100} locale /></p>
              <p className="text-[10px] text-muted-foreground">Favoritos</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' as const, stiffness: 260, damping: 20 }}
              className="bg-card rounded-xl border border-border p-3 text-center shadow-sm r38-profile-stat-card r43-stat-card-glow r46-stat-card-lift"
            >
              <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-1.5">
                <Award className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-lg font-bold text-amber-500 animate-count-up text-glow-emerald" style={{ animationDelay: '0.2s' }}><AnimatedCounter value={loyaltyPoints} duration={1000} delay={200} locale /></p>
              <p className="text-[10px] text-muted-foreground">Pontos</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
      </div>

      {/* Profile completion ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35, type: 'spring' as const, stiffness: 200, damping: 22 }}
        className="mb-6 flex items-center gap-3"
      >
        <div className="relative h-14 w-14 shrink-0 r38-profile-progress-ring">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <defs>
              <linearGradient id="r38-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <circle className="progress-bg" cx="50" cy="50" r="45" fill="none" strokeWidth="6" />
            <circle className="progress-fill" cx="50" cy="50" r="45" fill="none" strokeWidth="6" strokeLinecap="round" style={{ '--ring-offset': 85 } as React.CSSProperties} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">70%</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Perfil 70% completo</p>
          <p className="text-xs text-muted-foreground">Adicione mais detalhes para aproveitar ao máximo</p>
        </div>
      </motion.div>

      {/* Loyalty Tier Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, type: 'spring' as const, stiffness: 200, damping: 22 }}
      >
        <LoyaltyTier />
      </motion.div>

      {/* Loyalty Card — glass morphism with animated points */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring' as const, stiffness: 200, damping: 22 }}
        className="mb-6"
      >
        <LoyaltyCard
          points={loyaltyPoints}
          nextReward={500}
          nextRewardName="R$5 de desconto"
        />
      </motion.div>

      {/* Rewards Section — redeemable rewards, level badge, points history */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, type: 'spring' as const, stiffness: 200, damping: 22 }}
        className="mb-6"
      >
        <RewardsSection />
      </motion.div>

      {/* Achievements Panel — gamification badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, type: 'spring' as const, stiffness: 200, damping: 22 }}
        className="mb-6"
      >
        <AchievementsPanel />
      </motion.div>

      {/* Referral Program — Indique Amigos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, type: 'spring' as const, stiffness: 200, damping: 22 }}
        className="mb-6"
      >
        <ReferralProgram />
      </motion.div>

      {/* Spending Tracker — spending insights, budget, categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.19, type: 'spring' as const, stiffness: 200, damping: 22 }}
        className="mb-6"
      >
        <SpendingTracker />
      </motion.div>

      {/* Recent orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.21, type: 'spring' as const, stiffness: 200, damping: 22 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm r38-profile-section-title r46-section-shimmer">Pedidos recentes</h2>
          <button 
            onClick={() => navigate('orders')}
            className="text-xs text-primary hover:underline"
          >
            Ver todos
          </button>
        </div>
        {recentOrders.length > 0 ? (
          <div className="space-y-2">
            {recentOrders.map((order) => {
              const statusInfo = formatStatus(order.status)
              const itemCount = order.items?.length ?? 0
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: 'spring' as const, stiffness: 200, damping: 22 }}
                >
                <Card className="cursor-pointer r38-profile-activity-item" onClick={() => navigate('orders')}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm truncate">{order.storeName}</p>
                        <span className="font-semibold text-sm text-primary">{formatBRL(order.total)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">#{order.orderNumber} · {itemCount} {itemCount === 1 ? 'item' : 'itens'}</span>
                        <Badge className={`${statusInfo.color} text-[10px] px-1.5 py-0 border-0`}>{statusInfo.label}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {timeAgo(order.createdAt)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <Package className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum pedido ainda</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Faça sua primeira compra!</p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Coupons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, type: 'spring' as const, stiffness: 200, damping: 22 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm flex items-center gap-1.5 r38-profile-section-title">
            <Ticket className="h-4 w-4" />
            Meus Cupons
          </h2>
          <button 
            onClick={() => setActiveSection('coupons')}
            className="text-xs text-primary hover:underline"
          >
            Ver todos
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar">
          {coupons.filter(c => !c.used).map((coupon) => (
            <Card key={coupon.code} className="min-w-[200px] shrink-0 border-primary/20 cursor-pointer hover:shadow-sm transition-shadow" onClick={() => setActiveSection('coupons')}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {coupon.discount}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs">{coupon.code}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{coupon.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Favorite stores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26, type: 'spring' as const, stiffness: 200, damping: 22 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm r38-profile-section-title">Lojas favoritas</h2>
          <button 
            onClick={() => navigate('favorites')}
            className="text-xs text-primary hover:underline"
          >
            Ver todos
          </button>
        </div>
        {favoriteStores.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto hide-scrollbar">
            {favoriteStores.map((store) => (
              <Card key={store.id} className="min-w-[160px] shrink-0 cursor-pointer hover:shadow-sm transition-shadow">
                <CardContent className="p-3 text-center">
                  {store.logo ? (
                    <img src={store.logo} alt={store.name} className="h-12 w-12 rounded-full object-cover mx-auto mb-2" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 text-sm font-bold text-primary">
                      {store.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <p className="font-semibold text-sm truncate">{store.name}</p>
                  <p className="text-[10px] text-muted-foreground">{store.category}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs">{store.rating.toFixed(1)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma loja favorita</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Explore lojas e adicione aos favoritos!</p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Spin Wheel Promo Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring' as const, stiffness: 200, damping: 22 }}
        className="mb-4"
      >
        <Card
          className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200/50 dark:border-amber-800/30 cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
          onClick={() => setActiveSection('spin-wheel')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-md"
              >
                <PartyPopper className="h-6 w-6 text-white" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">Roleta de Premios</p>
                <p className="text-xs text-muted-foreground">Gire e ganhe descontos exclusivos hoje!</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Separator className="my-3 section-divider" />
      
      {/* Menu items - with premium card hover */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.32 }}
      >
        <div className="space-y-1.5 r43-section-stagger">
          {menuItems.map((item, idx) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.32 + idx * 0.05, type: 'spring' as const, stiffness: 200, damping: 22 }}
              whileHover={{ x: 3, y: -3, boxShadow: '0 4px 16px rgba(16,185,129,0.12), 0 2px 4px rgba(0,0,0,0.06)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (item.id === 'orders') {
                  navigate('orders')
                } else if (item.id === 'favorites') {
                  navigate('favorites')
                } else if (item.id === 'shopping-lists') {
                  navigate('shopping-lists')
                } else if (item.id === 'store-dashboard') {
                  navigate('store-dashboard')
                } else if (item.id === 'driver-dashboard') {
                  navigate('driver-dashboard')
                } else if (item.id === 'affiliate-dashboard') {
                  navigate('affiliate-dashboard')
                } else if (item.id === 'notifications') {
                  navigate('notifications')
                } else if (item.id === 'admin-dashboard') {
                  navigate('admin-dashboard')
                } else if (['loyalty', 'addresses', 'coupons', 'referral', 'settings'].includes(item.id)) {
                  setActiveSection(item.id)
                } else if (item.id === 'support-center') {
                  navigate('support-center')
                } else if (item.id === 'spin-wheel') {
                  setActiveSection('spin-wheel')
                }
              }}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border/40 hover:border-primary/15 transition-all text-left group r38-profile-menu-item r43-menu-item-border"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/[0.06] group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 shrink-0 transition-all" />
            </motion.button>
          ))}
        </div>
      </motion.div>
      
      <Separator className="my-3 section-divider" />
      
      {/* Logout */}
      <Button variant="ghost" className="w-full justify-start text-destructive h-12 r38-profile-logout r43-menu-item-border r46-logout-glow" onClick={handleLogout}>
        <LogOut className="h-5 w-5 mr-2" />
        Sair da conta
      </Button>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Seu nome completo"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="(99) 99999-9999"
                maxLength={20}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-bio">Bio</Label>
              <Input
                id="edit-bio"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Conte um pouco sobre você..."
                maxLength={500}
              />
              <p className="text-[10px] text-muted-foreground text-right">{editBio.length}/500</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={editSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSaveProfile} disabled={editSaving || !editName.trim()}>
              {editSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </>
      )}
    </div>
  )
}
