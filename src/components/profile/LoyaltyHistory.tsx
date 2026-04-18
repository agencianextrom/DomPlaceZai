'use client'

import { useState, useMemo } from 'react'
import {
  Award, TrendingUp, TrendingDown, Clock, AlertTriangle,
  Gift, ShoppingBag, Star, ArrowUpRight, ArrowDownRight, Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface PointsEntry {
  id: string
  type: 'earned' | 'redeemed'
  points: number
  description: string
  source: string
  date: string
  expiresAt?: string
  balance: number
}

const pointsHistory: PointsEntry[] = [
  { id: 'p1', type: 'earned', points: 450, description: 'Pedido #DP000002', source: 'Compra no Mercado do Zé', date: new Date(Date.now() - 1 * 86400000).toISOString(), balance: 1250 },
  { id: 'p2', type: 'earned', points: 200, description: 'Pedido #DP000001', source: 'Compra no Açaí da Boa', date: new Date(Date.now() - 3 * 86400000).toISOString(), balance: 800 },
  { id: 'p3', type: 'redeemed', points: -100, description: 'Frete grátis', source: 'Resgate de recompensa', date: new Date(Date.now() - 5 * 86400000).toISOString(), balance: 600 },
  { id: 'p4', type: 'earned', points: 300, description: 'Pedido #DP000005', source: 'Salão da Bella', date: new Date(Date.now() - 7 * 86400000).toISOString(), balance: 700 },
  { id: 'p5', type: 'earned', points: 100, description: 'Indicação de amigo', source: 'Programa de indicação', date: new Date(Date.now() - 10 * 86400000).toISOString(), balance: 400 },
  { id: 'p6', type: 'redeemed', points: -50, description: 'Cupom R$5 desconto', source: 'Resgate de recompensa', date: new Date(Date.now() - 14 * 86400000).toISOString(), balance: 300 },
  { id: 'p7', type: 'earned', points: 200, description: 'Pedido #DP000004', source: 'Farmácia Vida', date: new Date(Date.now() - 18 * 86400000).toISOString(), balance: 350 },
  { id: 'p8', type: 'earned', points: 150, description: 'Avaliação enviada', source: 'Bônus de avaliação', date: new Date(Date.now() - 22 * 86400000).toISOString(), balance: 150 },
  { id: 'p9', type: 'earned', points: 500, description: 'Cadastro na plataforma', source: 'Bônus de boas-vindas', date: new Date(Date.now() - 30 * 86400000).toISOString(), expiresAt: new Date(Date.now() + 180 * 86400000).toISOString(), balance: 0 },
]

const monthlyData = [
  { month: 'Jan', earned: 200, redeemed: 0 },
  { month: 'Fev', earned: 350, redeemed: 50 },
  { month: 'Mar', earned: 150, redeemed: 0 },
  { month: 'Abr', earned: 450, redeemed: 100 },
  { month: 'Mai', earned: 300, redeemed: 50 },
  { month: 'Jun', earned: 600, redeemed: 100 },
]

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

type FilterType = 'all' | 'earned' | 'redeemed'

export function LoyaltyHistory() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [redeemModal, setRedeemModal] = useState(false)

  const filtered = useMemo(() => {
    if (filter === 'all') return pointsHistory
    return pointsHistory.filter(e => e.type === filter)
  }, [filter])

  const totalEarned = pointsHistory.filter(e => e.type === 'earned').reduce((s, e) => s + e.points, 0)
  const totalRedeemed = pointsHistory.filter(e => e.type === 'redeemed').reduce((s, e) => s + Math.abs(e.points), 0)
  const currentBalance = totalEarned - totalRedeemed

  const maxMonthly = Math.max(...monthlyData.map(m => Math.max(m.earned, m.redeemed)))

  const expiringPoints = pointsHistory.filter(
    e => e.type === 'earned' && e.expiresAt && daysUntil(e.expiresAt) <= 30 && daysUntil(e.expiresAt) > 0
  )

  return (
    <div className="space-y-5">
      {/* Balance overview */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200/50 dark:border-amber-800/30 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saldo atual</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{currentBalance.toLocaleString('pt-BR')} pontos</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/60 dark:bg-black/10 rounded-lg p-3">
              <div className="flex items-center gap-1 text-emerald-600">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium">Ganhos</span>
              </div>
              <p className="text-lg font-bold">{totalEarned.toLocaleString('pt-BR')}</p>
            </div>
            <div className="bg-white/60 dark:bg-black/10 rounded-lg p-3">
              <div className="flex items-center gap-1 text-orange-600">
                <ArrowDownRight className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium">Resgatados</span>
              </div>
              <p className="text-lg font-bold">{totalRedeemed.toLocaleString('pt-BR')}</p>
            </div>
          </div>
          <Button
            className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white gap-2 h-10"
            onClick={() => setRedeemModal(true)}
          >
            <Gift className="h-4 w-4" />
            Trocar pontos
          </Button>
        </CardContent>
      </Card>

      {/* Expiration warning */}
      <AnimatePresence>
        {expiringPoints.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-amber-300/50 bg-amber-50/80 dark:bg-amber-900/10 dark:border-amber-800/30">
              <CardContent className="p-3 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                    Pontos expirando em breve!
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {expiringPoints.length > 0 ? `${expiringPoints[0].points} pontos expiram em ${daysUntil(expiringPoints[0].expiresAt!)} dias` : ''}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Monthly chart */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Pontos por mês
          </h3>
          <div className="flex items-end gap-3 h-32">
            {monthlyData.map((m, i) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex gap-0.5 items-end h-24 w-full">
                  {/* Earned bar */}
                  <motion.div
                    className="flex-1 bg-gradient-to-t from-primary to-emerald-400 rounded-t-sm min-h-[2px]"
                    initial={{ height: 0 }}
                    animate={{ height: `${(m.earned / maxMonthly) * 100}%` }}
                    transition={{ delay: 0.1 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                  />
                  {/* Redeemed bar */}
                  {m.redeemed > 0 && (
                    <motion.div
                      className="flex-1 bg-gradient-to-t from-orange-400 to-amber-300 rounded-t-sm min-h-[2px]"
                      initial={{ height: 0 }}
                      animate={{ height: `${(m.redeemed / maxMonthly) * 100}%` }}
                      transition={{ delay: 0.15 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                    />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground">{m.month}</span>
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 justify-center">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
              <span className="text-[10px] text-muted-foreground">Ganhos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-orange-400" />
              <span className="text-[10px] text-muted-foreground">Resgatados</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {([
          { id: 'all' as FilterType, label: 'Todos' },
          { id: 'earned' as FilterType, label: 'Ganho' },
          { id: 'redeemed' as FilterType, label: 'Resgatado' },
        ]).map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === f.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        <AnimatePresence mode="popLayout">
          {filtered.map((entry, idx) => {
            const isEarned = entry.type === 'earned'
            const isFirst = idx === 0
            return (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: idx * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
              >
                <div className="flex gap-3 pb-4">
                  {/* Timeline line and dot */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.04 + 0.1 }}
                      className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        isEarned
                          ? 'bg-emerald-100 dark:bg-emerald-900/30'
                          : 'bg-orange-100 dark:bg-orange-900/30'
                      }`}
                    >
                      {isEarned ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      )}
                    </motion.div>
                    {idx < filtered.length - 1 && (
                      <div className="w-0.5 flex-1 bg-border mt-1" />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 ${isFirst ? '' : '-mt-0'}`}>
                    <Card className="border-border/50 hover:shadow-sm transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm">{entry.description}</p>
                              {isFirst && !entry.isRead !== undefined && (
                                <span className="h-2 w-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{entry.source}</p>
                          </div>
                          <span className={`text-sm font-bold ${isEarned ? 'text-emerald-600' : 'text-orange-600'}`}>
                            {isEarned ? '+' : ''}{entry.points}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {formatDate(entry.date)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Saldo: {entry.balance.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Redeem Modal */}
      <AnimatePresence>
        {redeemModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
            onClick={() => setRedeemModal(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-background rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Trocar Pontos</h3>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setRedeemModal(false)}>
                    ×
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Saldo disponível: <span className="font-bold text-amber-500">{currentBalance.toLocaleString('pt-BR')} pontos</span>
                </p>
                <div className="space-y-2">
                  {[
                    { points: 500, reward: 'R$5 de desconto', icon: ShoppingBag },
                    { points: 1000, reward: 'Frete grátis', icon: Gift },
                    { points: 2000, reward: 'R$25 de desconto', icon: Star },
                  ].map(item => {
                    const Icon = item.icon
                    const canAfford = currentBalance >= item.points
                    return (
                      <Card
                        key={item.points}
                        className={`border-border/50 ${canAfford ? 'cursor-pointer hover:border-primary/30 hover:shadow-sm' : 'opacity-50'}`}
                        onClick={() => {
                          if (canAfford) {
                            toast.success(`Resgate de ${item.reward} realizado! -${item.points} pontos`)
                            setRedeemModal(false)
                          }
                        }}
                      >
                        <CardContent className="p-3 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{item.reward}</p>
                            <p className="text-xs text-muted-foreground">{item.points} pontos</p>
                          </div>
                          <Button
                            size="sm"
                            disabled={!canAfford}
                            className="h-8 text-xs bg-primary text-primary-foreground"
                          >
                            Trocar
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
