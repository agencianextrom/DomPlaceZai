'use client'

import { motion } from 'framer-motion'
import { Package, Store, Sparkles, Clock, TrendingUp, MessageCircle } from 'lucide-react'

// Mock data for the quick info panel
const quickStats = [
  { label: 'Produtos', value: '32', icon: Package, color: 'text-emerald-500 bg-emerald-500/10' },
  { label: 'Lojas', value: '8', icon: Store, color: 'text-amber-500 bg-amber-500/10' },
  { label: 'Ofertas Novas', value: '3', icon: Sparkles, color: 'text-violet-500 bg-violet-500/10' },
]

const recentOrders = [
  {
    id: 'o1',
    storeName: 'Açaí da Boa',
    productName: 'Açaí 500ml',
    status: 'Em andamento',
    time: 'Há 15 min',
    statusColor: 'text-amber-500 bg-amber-500/10',
  },
  {
    id: 'o2',
    storeName: 'Mercado do Zé',
    productName: 'Arroz Tio João 5kg',
    status: 'Entregue',
    time: 'Ontem',
    statusColor: 'text-emerald-500 bg-emerald-500/10',
  },
]

const dailyTips = [
  {
    id: 't1',
    storeName: 'Açaí da Boa',
    tip: 'Experimente o Açaí Premium com granola artesanal — clientes ganham 10% de cashback na primeira compra!',
    icon: MessageCircle,
  },
  {
    id: 't2',
    storeName: 'Padaria Pão Quente',
    tip: 'Pão francês fresquinho todo dia até 7h da manhã. Peça 6 unidades por apenas R$ 6,00!',
    icon: TrendingUp,
  },
]

export function QuickInfo() {
  return (
    <aside className="hidden lg:block w-[300px] xl:w-[340px] shrink-0">
      <div className="sticky top-20 space-y-4 stagger-children">
        {/* Resumo Rápido Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl border border-primary/10 overflow-hidden"
        >
          <div className="gradient-mesh noise-bg relative p-4">
            <div className="relative z-10">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary animate-breathe" />
                Resumo Rápido
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {quickStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-card/80 border border-border/50"
                  >
                    <div className={`h-9 w-9 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="h-4 w-4" />
                    </div>
                    <span className="text-lg font-bold leading-none">{stat.value}</span>
                    <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pedidos Recentes Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card rounded-xl border border-primary/10 p-4"
        >
          <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            Pedidos Recentes
          </h3>
          <div className="space-y-2.5">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-start gap-3 p-2.5 rounded-lg bg-card/60 border border-border/40 hover:border-primary/20 transition-colors"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Package className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate">{order.productName}</p>
                  <p className="text-[10px] text-muted-foreground">{order.storeName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${order.statusColor}`}>
                      {order.status}
                    </span>
                    <span className="text-[9px] text-muted-foreground">{order.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dicas do Dia Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-xl border border-primary/10 p-4"
        >
          <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Dicas do Dia
          </h3>
          <div className="space-y-3">
            {dailyTips.map((tip) => (
              <div
                key={tip.id}
                className="p-3 rounded-lg bg-gradient-to-r from-accent/5 to-primary/5 border border-accent/10"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <tip.icon className="h-3 w-3 text-accent" />
                  <span className="text-[10px] font-semibold text-accent">{tip.storeName}</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{tip.tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </aside>
  )
}
