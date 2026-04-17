'use client'

import { useState } from 'react'
import { 
  User, MapPin, CreditCard, Heart, ClipboardList, Gift, Users, Settings, LogOut, 
  Star, ChevronRight, Shield, Award, Edit3, Plus, Trash2, Package, ShoppingBag, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/store/useAppStore'
import { motion } from 'framer-motion'
import { formatBRL } from '@/components/product/ProductCard'

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

const menuItems = [
  { id: 'profile', icon: User, label: 'Meus Dados', desc: 'Nome, e-mail, telefone' },
  { id: 'addresses', icon: MapPin, label: 'Endereços', desc: 'Gerenciar endereços de entrega' },
  { id: 'payments', icon: CreditCard, label: 'Pagamentos', desc: 'Cartões e formas de pagamento' },
  { id: 'favorites', icon: Heart, label: 'Favoritos', desc: 'Lojas e produtos favoritos' },
  { id: 'orders', icon: ClipboardList, label: 'Pedidos', desc: 'Histórico de pedidos' },
  { id: 'loyalty', icon: Award, label: 'Programa de Fidelidade', desc: 'Pontos e recompensas' },
  { id: 'referral', icon: Users, label: 'Indique Amigos', desc: 'Ganhe com indicações' },
  { id: 'settings', icon: Settings, label: 'Configurações', desc: 'Notificações e preferências' },
]

export function ProfileView() {
  const { navigate } = useAppStore()
  const [activeSection, setActiveSection] = useState<string | null>(null)
  
  if (activeSection === 'loyalty') {
    return (
      <div className="min-h-screen p-4 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setActiveSection(null)} className="h-10 w-10">
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Button>
          <h1 className="text-lg font-bold">Programa de Fidelidade</h1>
        </div>
        
        <Card className="bg-gradient-to-br from-primary to-emerald-600 border-0 overflow-hidden">
          <CardContent className="p-6 text-white text-center relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-80" />
              <p className="text-4xl font-bold">1.250</p>
              <p className="text-sm text-white/80 mt-1">pontos acumulados</p>
              <div className="mt-4 bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                <p className="text-xs text-white/70">Próxima recompensa</p>
                <p className="font-semibold text-sm mt-0.5">Faltam 750 pontos para R$ 10 de desconto</p>
              </div>
              <div className="mt-3">
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white/60 rounded-full" style={{ width: '62.5%' }} />
                </div>
                <p className="text-xs text-white/60 mt-1">62% para próxima recompensa</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-4">
          <Card className="border-primary/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">Nível Bronze</p>
                <p className="text-xs text-muted-foreground">Gaste mais R$ 250 para subir de nível</p>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          
          <h3 className="font-semibold text-sm mt-4 mb-3">Histórico de Pontos</h3>
          <Card>
            <CardContent className="p-0 divide-y divide-border/30">
              {[
                { desc: 'Compra #DP000003', pts: '+350', date: 'Ontem' },
                { desc: 'Bônus de cadastro', pts: '+500', date: '15/04/2025' },
                { desc: 'Indicação aprovada', pts: '+200', date: '10/04/2025' },
                { desc: 'Compra #DP000001', pts: '+200', date: '08/04/2025' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{item.desc}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <span className="font-semibold text-sm text-primary">{item.pts}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  if (activeSection === 'addresses') {
    return (
      <div className="min-h-screen p-4 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setActiveSection(null)} className="h-10 w-10">
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
            <h1 className="text-lg font-bold">Endereços</h1>
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-1" />
            Novo
          </Button>
        </div>
        
        <Card className="border-2 border-primary">
          <CardContent className="p-4 relative">
            <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px]">Principal</Badge>
            <p className="font-semibold text-sm">Casa</p>
            <p className="text-sm text-muted-foreground mt-1">
              Rua Principal, 123<br />
              Centro<br />
              Dom Eliseu - PA, 68555-000
            </p>
            <div className="flex gap-2 mt-3">
              <Button variant="ghost" size="sm" className="text-xs h-8">
                <Edit3 className="h-3 w-3 mr-1" />
                Editar
              </Button>
              <Button variant="ghost" size="sm" className="text-xs h-8 text-destructive">
                <Trash2 className="h-3 w-3 mr-1" />
                Remover
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Profile header with avatar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-emerald-600 p-6 text-white mb-6"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative flex items-center gap-4">
          {/* Avatar with initial letter */}
          <div className="w-18 h-18 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold border-2 border-white/30" style={{ width: '72px', height: '72px' }}>
            M
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Maria Silva</h1>
            <p className="text-sm text-white/80 mt-0.5">maria@email.com</p>
            <Button 
              size="sm" 
              className="mt-2 bg-white/20 hover:bg-white/30 text-white border-0 text-sm backdrop-blur-sm"
              onClick={() => useAppStore.getState().openAuthModal()}
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Editar perfil
            </Button>
          </div>
        </div>
        
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <ShoppingBag className="h-4 w-4 mx-auto mb-1 opacity-80" />
            <p className="text-xl font-bold">3</p>
            <p className="text-[10px] text-white/70">Pedidos</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <Award className="h-4 w-4 mx-auto mb-1 opacity-80" />
            <p className="text-xl font-bold">1.250</p>
            <p className="text-[10px] text-white/70">Pontos</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <Gift className="h-4 w-4 mx-auto mb-1 opacity-80" />
            <p className="text-xl font-bold">R$10</p>
            <p className="text-[10px] text-white/70">Cashback</p>
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
      
      {/* Menu items */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <div className="space-y-1">
          {menuItems.map((item, idx) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + idx * 0.03 }}
              onClick={() => {
                if (item.id === 'orders') {
                  navigate('orders')
                } else if (item.id === 'favorites') {
                  navigate('favorites')
                } else if (item.id === 'loyalty' || item.id === 'addresses') {
                  setActiveSection(item.id)
                }
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors text-left"
            >
              <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
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
