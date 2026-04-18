'use client'

import { useState } from 'react'
import { 
  User, MapPin, CreditCard, Heart, ClipboardList, Gift, Users, Settings, LogOut, 
  Star, ChevronRight, Award, Edit3, Plus, Trash2, Package, ShoppingBag, Clock,
  Bell, Moon, MapPinned, Share2, Ticket, Copy, Check, ListChecks, LayoutDashboard,
  BellRing, Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useAppStore } from '@/store/useAppStore'
import { motion } from 'framer-motion'
import { formatBRL } from '@/components/product/ProductCard'
import { RewardsSection } from './RewardsSection'
import { LoyaltyHistory } from './LoyaltyHistory'
import { ShoppingLists } from './ShoppingLists'
import { AddressManager } from './AddressManager'
import { toast } from 'sonner'

// Demo recent orders
const recentOrders = [
  {
    id: 'o1',
    orderNumber: 'DP000003',
    storeName: 'Mercado do Zé',
    status: 'Entregue',
    statusColor: 'bg-emerald-100 text-emerald-700',
    total: 67.80,
    date: 'Ontem',
    items: 4,
  },
  {
    id: 'o2',
    orderNumber: 'DP000001',
    storeName: 'Açaí da Boa',
    status: 'Entregue',
    statusColor: 'bg-emerald-100 text-emerald-700',
    total: 45.00,
    date: '08/04/2025',
    items: 3,
  },
]

// Demo favorite stores
const favoriteStores = [
  { id: 's1', name: 'Açaí da Boa', category: 'Alimentação', rating: 4.9, initials: 'AB' },
  { id: 's2', name: 'Padaria Pão Quente', category: 'Alimentação', rating: 4.8, initials: 'PP' },
]

// Saved addresses
const savedAddresses = [
  { id: 'a1', label: 'Casa', address: 'Rua Principal, 123', neighborhood: 'Centro', city: 'Dom Eliseu - PA', zip: '68555-000', isPrimary: true },
  { id: 'a2', label: 'Trabalho', address: 'Av. Brasil, 456', neighborhood: 'Centro', city: 'Dom Eliseu - PA', zip: '68555-000', isPrimary: false },
]

// Coupons
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
  { id: 'notifications', icon: BellRing, label: 'Notificações', desc: 'Central de notificações' },
  { id: 'shopping-lists', icon: ListChecks, label: 'Listas de Compras', desc: 'Organize suas compras' },
  { id: 'referral', icon: Users, label: 'Indique Amigos', desc: 'Ganhe com indicações' },
  { id: 'store-dashboard', icon: LayoutDashboard, label: 'Painel da Loja', desc: 'Gerencie sua loja' },
  { id: 'admin-dashboard', icon: Shield, label: 'Painel do Admin', desc: 'Administração da plataforma' },
  { id: 'settings', icon: Settings, label: 'Configurações', desc: 'Notificações e preferências' },
]

export function ProfileView() {
  const { navigate } = useAppStore()
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = useState(false)
  const [locationEnabled, setLocationEnabled] = useState(true)
  const [copiedReferral, setCopiedReferral] = useState(false)
  
  if (activeSection === 'loyalty') {
    return (
      <div className="min-h-screen p-4 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setActiveSection(null)} className="h-10 w-10">
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Button>
          <h1 className="text-lg font-bold">Programa de Fidelidade</h1>
        </div>
        <LoyaltyHistory />
      </div>
    )
  }

  if (activeSection === 'addresses') {
    return (
      <div className="min-h-screen p-4 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setActiveSection(null)} className="h-10 w-10">
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
          <Button variant="ghost" size="icon" onClick={() => setActiveSection(null)} className="h-10 w-10">
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
                        className="h-7 text-xs"
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
    const referralLink = 'https://domplace.com/invite/maria-silva'
    return (
      <div className="min-h-screen p-4 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setActiveSection(null)} className="h-10 w-10">
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
          <Button variant="ghost" size="icon" onClick={() => setActiveSection(null)} className="h-10 w-10">
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
            <Card key={setting.label} className="border-border/50">
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
  
  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Profile header with gradient cover area and wave bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl mb-6"
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
              {/* Avatar with ring and gradient border */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
                className="relative"
              >
                <div className="h-22 w-22 sm:h-26 sm:w-26 rounded-2xl bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-md flex items-center justify-center text-4xl sm:text-5xl font-bold border-2 border-white/30 shadow-lg">
                  M
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-400 border-[3px] border-emerald-600" />
              </motion.div>
              <div className="flex-1 pb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-shadow-lg">Maria Silva</h1>
                <p className="text-sm text-white/70 mt-0.5">maria@email.com</p>
              </div>
              <Button 
                size="sm" 
                className="bg-white/15 hover:bg-white/25 text-white border border-white/20 text-sm backdrop-blur-sm shrink-0"
                onClick={() => useAppStore.getState().openAuthModal()}
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
          <div className="grid grid-cols-3 gap-2.5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl border border-border p-3 text-center shadow-sm card-premium-hover"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1.5">
                <ShoppingBag className="h-4 w-4 text-primary" />
              </div>
              <p className="text-lg font-bold text-primary animate-count-up text-glow-emerald">3</p>
              <p className="text-[10px] text-muted-foreground">Pedidos</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-xl border border-border p-3 text-center shadow-sm card-premium-hover"
            >
              <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-1.5">
                <Heart className="h-4 w-4 text-red-500" />
              </div>
              <p className="text-lg font-bold text-red-500 animate-count-up" style={{ animationDelay: '0.1s' }}>12</p>
              <p className="text-[10px] text-muted-foreground">Favoritos</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card rounded-xl border border-border p-3 text-center shadow-sm card-premium-hover"
            >
              <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-1.5">
                <Award className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-lg font-bold text-amber-500 animate-count-up text-glow-emerald" style={{ animationDelay: '0.2s' }}>1.250</p>
              <p className="text-[10px] text-muted-foreground">Pontos</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Loyalty points card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200/50 dark:border-amber-800/30 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveSection('loyalty')}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm">1.250 pontos</p>
                <p className="text-xs text-muted-foreground">Nível Bronze · Faltam 750 p/ próximo</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Pedidos recentes</h2>
          <button 
            onClick={() => navigate('orders')}
            className="text-xs text-primary hover:underline"
          >
            Ver todos
          </button>
        </div>
        <div className="space-y-2">
          {recentOrders.map((order) => (
            <Card key={order.id} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => navigate('orders')}>
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
                    <span className="text-xs text-muted-foreground">#{order.orderNumber} · {order.items} itens</span>
                    <Badge className={`${order.statusColor} text-[10px] px-1.5 py-0 border-0`}>{order.status}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {order.date}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Coupons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm flex items-center gap-1.5">
            <Ticket className="h-4 w-4 text-primary" />
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
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Lojas favoritas</h2>
          <button 
            onClick={() => navigate('favorites')}
            className="text-xs text-primary hover:underline"
          >
            Ver todos
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar">
          {favoriteStores.map((store) => (
            <Card key={store.id} className="min-w-[160px] shrink-0 cursor-pointer hover:shadow-sm transition-shadow">
              <CardContent className="p-3 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 text-sm font-bold text-primary">
                  {store.initials}
                </div>
                <p className="font-semibold text-sm truncate">{store.name}</p>
                <p className="text-[10px] text-muted-foreground">{store.category}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  <span className="text-xs">{store.rating}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      <Separator className="my-4" />
      
      {/* Menu items - with premium card hover */}
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
              transition={{ delay: 0.25 + idx * 0.03 }}
              whileHover={{ x: 4, transition: { duration: 0.2 } }}
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
                } else if (item.id === 'notifications') {
                  navigate('notifications')
                } else if (item.id === 'admin-dashboard') {
                  navigate('admin-dashboard')
                } else if (['loyalty', 'addresses', 'coupons', 'referral', 'settings'].includes(item.id)) {
                  setActiveSection(item.id)
                }
              }}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all text-left group elevated-card ripple-effect"
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
      
      <Separator className="my-4" />
      
      {/* Logout */}
      <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-12">
        <LogOut className="h-5 w-5 mr-2" />
        Sair da conta
      </Button>
    </div>
  )
}
