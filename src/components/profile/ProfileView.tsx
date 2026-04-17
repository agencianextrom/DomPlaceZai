'use client'

import { useState } from 'react'
import { 
  User, MapPin, CreditCard, Heart, ClipboardList, Gift, Users, Settings, LogOut, 
  Star, ChevronRight, Shield, Award, Edit3, Plus, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store/useAppStore'
import { motion } from 'framer-motion'

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
        
        <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-2xl p-6 text-white text-center">
          <Award className="h-12 w-12 mx-auto mb-3 opacity-80" />
          <p className="text-3xl font-bold">1.250</p>
          <p className="text-sm text-white/80 mt-1">pontos acumulados</p>
          <div className="mt-4 bg-white/20 rounded-xl p-3">
            <p className="text-xs text-white/70">Próxima recompensa</p>
            <p className="font-semibold text-sm mt-0.5">Faltam 750 pontos para R$ 10 de desconto</p>
          </div>
        </div>
        
        <div className="mt-4 space-y-3">
          <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Nível Bronze</p>
              <p className="text-xs text-muted-foreground">Gaste mais R$ 250 para subir de nível</p>
            </div>
            <Shield className="h-5 w-5 text-amber-500" />
          </div>
          
          <h3 className="font-semibold text-sm mt-4">Histórico de Pontos</h3>
          {[
            { desc: 'Compra #DP000003', pts: '+350', date: 'Ontem' },
            { desc: 'Bônus de cadastro', pts: '+500', date: '15/04/2025' },
            { desc: 'Indicação aprovada', pts: '+200', date: '10/04/2025' },
            { desc: 'Compra #DP000001', pts: '+200', date: '08/04/2025' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm">{item.desc}</p>
                <p className="text-xs text-muted-foreground">{item.date}</p>
              </div>
              <span className="font-semibold text-sm text-primary">{item.pts}</span>
            </div>
          ))}
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
        
        <div className="space-y-3">
          <div className="bg-card rounded-xl border-2 border-primary p-4 relative">
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
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary to-emerald-600 rounded-2xl p-6 text-white mb-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <h1 className="text-xl font-bold">Olá, Visitante!</h1>
            <p className="text-sm text-white/80 mt-0.5">Bem-vindo ao DomPlace</p>
            <Button size="sm" className="mt-2 bg-white/20 hover:bg-white/30 text-white border-0 text-sm">
              Fazer Login
            </Button>
          </div>
        </div>
        
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-xl font-bold">0</p>
            <p className="text-[10px] text-white/70">Pedidos</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-xl font-bold">1.250</p>
            <p className="text-[10px] text-white/70">Pontos</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-xl font-bold">R$0</p>
            <p className="text-[10px] text-white/70">Cashback</p>
          </div>
        </div>
      </motion.div>
      
      {/* Menu */}
      <div className="space-y-1">
        {menuItems.map((item, idx) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
            onClick={() => {
              if (item.id === 'orders') {
                navigate('orders')
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
      
      <Separator className="my-4" />
      
      {/* Logout */}
      <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-12">
        <LogOut className="h-5 w-5 mr-2" />
        Sair da conta
      </Button>
    </div>
  )
}
