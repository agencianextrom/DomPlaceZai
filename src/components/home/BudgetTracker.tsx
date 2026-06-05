'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet, TrendingUp, TrendingDown, AlertTriangle, Lightbulb,
  ChevronDown, ChevronUp, Download, Bell, History,
  ShoppingBag, Pill, Car, Gamepad2, UtensilsCrossed,
  Receipt, MoreHorizontal, ArrowRight, Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'

// ─── Helpers ─────────────────────────────────────────────────────────────

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const SPRING = { type: 'spring' as const, stiffness: 120, damping: 20 }
const SPRING_SLOW = { type: 'spring' as const, stiffness: 80, damping: 18 }

// ─── Mock Data ───────────────────────────────────────────────────────────

const categories = [
  { id: 'mercado', name: 'Mercado', icon: ShoppingBag, amount: 1247.80, color: '#10b981' },
  { id: 'farmacia', name: 'Farmácia', icon: Pill, amount: 389.50, color: '#6366f1' },
  { id: 'transporte', name: 'Transporte', icon: Car, amount: 520.00, color: '#f59e0b' },
  { id: 'lazer', name: 'Lazer', icon: Gamepad2, amount: 312.90, color: '#ec4899' },
  { id: 'restaurantes', name: 'Restaurantes', icon: UtensilsCrossed, amount: 678.30, color: '#ef4444' },
  { id: 'contas', name: 'Contas', icon: Receipt, amount: 1450.00, color: '#8b5cf6' },
  { id: 'outros', name: 'Outros', icon: MoreHorizontal, amount: 234.70, color: '#64748b' },
]

const familyMembers = [
  { id: '1', name: 'Carlos', role: 'Pai', emoji: '👨', spent: 1890.00 },
  { id: '2', name: 'Ana', role: 'Mãe', emoji: '👩', spent: 1650.00 },
  { id: '3', name: 'Pedro', role: 'Filho', emoji: '👦', spent: 420.00 },
  { id: '4', name: 'Maria', role: 'Filha', emoji: '👧', spent: 872.20 },
]

const weeklyData = [
  { day: 'Seg', amount: 180.50 },
  { day: 'Ter', amount: 95.30 },
  { day: 'Qua', amount: 245.80 },
  { day: 'Qui', amount: 120.00 },
  { day: 'Sex', amount: 310.40 },
  { day: 'Sáb', amount: 520.90 },
  { day: 'Dom', amount: 380.60 },
]

const insights = [
  { type: 'alert' as const, title: 'Mercado acima da média', description: 'Gastos com supermercado estão 18% acima da média dos últimos 3 meses. Considere usar a lista inteligente para planejar compras.', icon: AlertTriangle },
  { type: 'suggestion' as const, title: 'Economize R$45 trocando marcas', description: 'Encontramos 3 produtos equivalentes mais baratos na DomPlace. Confira nas sugestões da IA.', icon: Lightbulb },
  { type: 'positive' as const, title: 'Transporte: -15% este mês', description: 'Parabéns! Gastos com transporte reduzidos graças ao uso de entrega combinada. Continue assim!', icon: TrendingUp },
  { type: 'suggestion' as const, title: 'Cupom ativo: DOMPLACE10', description: 'Use o cupom DOMPLACE10 para 10% de desconto na próxima compra acima de R$100.', icon: Zap },
]

// Simulated family category breakdown per member
const familyCategoryBreakdown: Record<string, { name: string; amount: number }[]> = {
  '1': [{ name: 'Restaurantes', amount: 620 }, { name: 'Transporte', amount: 450 }, { name: 'Mercado', amount: 520 }, { name: 'Outros', amount: 300 }],
  '2': [{ name: 'Mercado', amount: 727.80 }, { name: 'Farmácia', amount: 389.50 }, { name: 'Contas', amount: 532.70 }],
  '3': [{ name: 'Lazer', amount: 312.90 }, { name: 'Outros', amount: 107.10 }],
  '4': [{ name: 'Restaurantes', amount: 58.30 }, { name: 'Lazer', amount: 0 }, { name: 'Outros', amount: 234.70 }, { name: 'Contas', amount: 579.20 }],
}

// ─── Loading Skeleton ────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <section className="r82-budget-tracker" aria-label="Carregando controle de gastos">
      <div className="rounded-2xl overflow-hidden glassmorphism-strong animate-pulse">
        <div className="h-8 w-56 bg-muted rounded-lg mb-4" />
        <div className="h-12 w-48 bg-muted rounded-lg mb-2" />
        <div className="h-3 w-32 bg-muted rounded-lg mb-6" />
        <div className="h-4 w-40 bg-muted rounded-lg mb-3" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex gap-3 mb-3">
            <div className="h-8 w-8 rounded-lg bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-muted rounded" style={{ width: `${60 + (i * 5) % 35}%` }} />
              <div className="h-2 bg-muted rounded w-3/4" />
            </div>
          </div>
        ))}
        <div className="flex gap-3 mt-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-11 flex-1 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Animated Counter ────────────────────────────────────────────────────

function AnimatedCounter({ target, prefix = 'R$ ' }: { target: number; prefix?: string }) {
  const [val, setVal] = useState(0)

  useEffect(() => {
    const duration = 1200
    const t0 = Date.now()
    let raf: number
    const step = () => {
      const p = Math.min((Date.now() - t0) / duration, 1)
      setVal((1 - Math.pow(1 - p, 3)) * target)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target])

  return (
    <span className="tabular-nums font-bold">
      {prefix}{val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  )
}

// ─── Progress Ring ───────────────────────────────────────────────────────

function ProgressRing({ percentage }: { percentage: number }) {
  const size = 80
  const strokeWidth = 7
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference

  const color = percentage > 85 ? '#ef4444' : percentage > 60 ? '#f59e0b' : '#10b981'

  return (
    <div className="r82-budget-progress-ring relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-muted/30" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ ...SPRING, delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold tabular-nums" style={{ color }}>
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}

// ─── Insight Card ────────────────────────────────────────────────────────

function InsightCard({ insight, index }: { insight: typeof insights[number]; index: number }) {
  const Icon = insight.icon
  const styleMap = {
    alert: { bg: 'bg-red-500/10', border: 'border-red-500/20', iconColor: 'text-red-500', badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
    suggestion: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', iconColor: 'text-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
    positive: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', iconColor: 'text-emerald-500', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
  }
  const labelMap = { alert: 'Alerta', suggestion: 'Dica', positive: 'Positivo' }
  const s = styleMap[insight.type]

  return (
    <motion.div
      className={`r82-budget-insight-card r62-card-lift rounded-xl p-3 border ${s.bg} ${s.border} flex items-start gap-2.5`}
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...SPRING, delay: 0.1 + index * 0.08 }}
    >
      <div className="w-8 h-8 min-w-[32px] rounded-lg flex items-center justify-center flex-shrink-0 bg-background/60">
        <Icon className={`w-4 h-4 ${s.iconColor}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-xs font-semibold truncate">{insight.title}</p>
          <Badge className={`text-[8px] px-1.5 py-0 h-4 border-0 ${s.badge}`}>{labelMap[insight.type]}</Badge>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{insight.description}</p>
      </div>
    </motion.div>
  )
}

// ─── Family Member Row ───────────────────────────────────────────────────

function FamilyMemberRow({ member, familyTotal, index }: { member: typeof familyMembers[number]; familyTotal: number; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const pct = familyTotal > 0 ? (member.spent / familyTotal) * 100 : 0
  const breakdown = familyCategoryBreakdown[member.id] ?? []

  return (
    <motion.div
      className="r82-budget-family-row"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...SPRING, delay: 0.6 + index * 0.07 }}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/30 transition-colors min-h-[44px]"
      >
        <Avatar className="w-9 h-9">
          <AvatarFallback className="text-lg">{member.emoji}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold">{member.name}</p>
            <Badge variant="secondary" className="text-[8px] px-1.5 py-0 h-4">{member.role}</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">{formatBRL(member.spent)} · {pct.toFixed(0)}% do total</p>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={SPRING}>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </motion.div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={SPRING_SLOW}
            className="overflow-hidden"
          >
            <div className="ml-12 pr-2 pb-2 space-y-1">
              {breakdown.filter((c) => c.amount > 0).map((cat) => {
                const catPct = member.spent > 0 ? (cat.amount / member.spent) * 100 : 0
                return (
                  <div key={cat.name} className="flex items-center gap-2 text-[10px]">
                    <span className="w-20 truncate text-muted-foreground">{cat.name}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary/60"
                        initial={{ width: 0 }}
                        animate={{ width: `${catPct}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                    <span className="w-16 text-right tabular-nums font-medium">{formatBRL(cat.amount)}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────

export function BudgetTracker() {
  const [isLoading, setIsLoading] = useState(true)
  const [budget, setBudget] = useState(6000)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const totalSpent = useMemo(() => categories.reduce((s, c) => s + c.amount, 0), [])
  const familyTotal = useMemo(() => familyMembers.reduce((s, m) => s + m.spent, 0), [])
  const weeklyTotal = useMemo(() => weeklyData.reduce((s, d) => s + d.amount, 0), [])
  const maxDay = useMemo(() => weeklyData.reduce((m, d) => d.amount > m.amount ? d : m, weeklyData[0]), [])
  const budgetPercent = budget > 0 ? (totalSpent / budget) * 100 : 0
  const lastMonthDiff = -12 // simulated: 12% less than last month

  if (isLoading) return <LoadingSkeleton />

  return (
    <section className="r82-budget-tracker" aria-label="Controle de gastos familiar">
      <div className="rounded-2xl overflow-hidden glassmorphism-strong relative r62-card-lift">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(20,184,166,0.05) 50%, rgba(13,148,136,0.03) 100%)' }} />
        <div className="relative z-10">
          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="flex items-center gap-2.5 p-4 pb-2">
            <div className="w-10 h-10 min-h-[40px] rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669, #0d9488)', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold r62-heading-gradient" style={{ background: 'linear-gradient(135deg, #10b981, #059669, #0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Controle de Gastos
              </h2>
              <p className="text-[10px] text-muted-foreground">Acompanhe os gastos da família</p>
            </div>
          </div>

          {/* ── Monthly Overview ───────────────────────────────────────── */}
          <div className="px-4 pt-2 pb-3">
            <Card className="bg-background/50 border-border/30">
              <CardContent className="p-4 space-y-3">
                {/* Total counter */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Total gasto este mês</p>
                    <div className="text-2xl font-bold r82-budget-counter">
                      <AnimatedCounter target={totalSpent} />
                    </div>
                  </div>
                  <ProgressRing percentage={budgetPercent} />
                </div>

                {/* Budget limit input */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">Limite:</span>
                  <div className="flex items-center gap-1 bg-muted/50 rounded-lg px-2 py-1.5 border border-border/40">
                    <span className="text-xs font-semibold text-muted-foreground">R$</span>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v) && v >= 0) setBudget(v) }}
                      className="w-20 bg-transparent text-sm font-bold outline-none tabular-nums min-h-[44px]"
                      min={0}
                      step={100}
                    />
                  </div>
                </div>

                {/* Budget progress bar */}
                <div>
                  <Progress
                    value={Math.min(budgetPercent, 100)}
                    className="h-2.5 r82-budget-progress-bar"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-muted-foreground">
                      {formatBRL(totalSpent)} ({budgetPercent.toFixed(0)}%)
                    </span>
                    <span className="text-[9px] text-muted-foreground">{formatBRL(Math.max(budget - totalSpent, 0))} restante</span>
                  </div>
                </div>

                {/* Comparison vs last month */}
                <div className="flex items-center gap-1.5">
                  {lastMonthDiff < 0 ? (
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <TrendingUp className="w-3.5 h-3.5 text-red-500" />
                  )}
                  <span className={`text-xs font-semibold ${lastMonthDiff < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    {lastMonthDiff > 0 ? '+' : ''}{lastMonthDiff}% vs mês passado
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Category Breakdown ─────────────────────────────────────── */}
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold">Gastos por Categoria</h3>
              <Badge variant="secondary" className="text-[9px]">{categories.length} categorias</Badge>
            </div>
            <div className="space-y-2">
              {categories.map((cat, i) => {
                const Icon = cat.icon
                const pct = totalSpent > 0 ? (cat.amount / totalSpent) * 100 : 0
                return (
                  <motion.div
                    key={cat.id}
                    className="r82-budget-category flex items-center gap-2.5"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...SPRING, delay: 0.3 + i * 0.05 }}
                  >
                    <div className="w-8 h-8 min-w-[32px] rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat.color}15` }}>
                      <Icon className="w-4 h-4" style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] font-medium">{cat.name}</span>
                        <span className="text-[10px] font-semibold tabular-nums">{formatBRL(cat.amount)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full r82-budget-bar"
                          style={{ backgroundColor: cat.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5, delay: 0.4 + i * 0.05 }}
                        />
                      </div>
                    </div>
                    <span className="text-[9px] text-muted-foreground w-8 text-right tabular-nums">{pct.toFixed(0)}%</span>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <Separator className="opacity-30" />

          {/* ── Family Members ─────────────────────────────────────────── */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold">Membros da Família</h3>
              <Badge variant="secondary" className="text-[9px]">{formatBRL(familyTotal)} total</Badge>
            </div>
            <div className="space-y-0.5">
              {familyMembers.map((member, i) => (
                <FamilyMemberRow key={member.id} member={member} familyTotal={familyTotal} index={i} />
              ))}
            </div>
          </div>

          <Separator className="opacity-30" />

          {/* ── AI Insights ────────────────────────────────────────────── */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Insights da IA
              </h3>
              <Badge variant="secondary" className="text-[9px]">{insights.length} insights</Badge>
            </div>
            <div className="space-y-2">
              {insights.map((insight, i) => (
                <InsightCard key={insight.title} insight={insight} index={i} />
              ))}
            </div>
          </div>

          <Separator className="opacity-30" />

          {/* ── Weekly Trend (CSS Bar Chart) ───────────────────────────── */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold">Tendência Semanal</h3>
              <Badge variant="secondary" className="text-[9px]">{formatBRL(weeklyTotal)}</Badge>
            </div>
            <div className="r82-budget-weekly-chart flex items-end justify-between gap-2" style={{ height: 100 }}>
              {weeklyData.map((d, i) => {
                const h = (d.amount / maxDay.amount) * 100
                const isMax = d.day === maxDay.day
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <motion.span
                      className="text-[8px] tabular-nums text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.06 }}
                    >
                      {d.amount.toFixed(0)}
                    </motion.span>
                    <motion.div
                      className={`w-full rounded-t-md r82-budget-weekly-bar ${isMax ? 'ring-2 ring-primary/40' : ''}`}
                      style={{ backgroundColor: isMax ? '#10b981' : '#10b98160', maxWidth: 36 }}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ ...SPRING, delay: 0.3 + i * 0.07 }}
                    />
                    <span className={`text-[9px] font-medium ${isMax ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                      {d.day}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Action Buttons ─────────────────────────────────────────── */}
          <div className="px-4 pb-4 flex gap-2">
            <Button
              variant="outline"
              className="flex-1 min-h-[44px] text-xs font-semibold gap-1.5 r82-budget-btn"
              onClick={() => toast.success('Relatório exportado!')}
            >
              <Download className="w-4 h-4" />
              Exportar Relatório
            </Button>
            <Button
              variant="outline"
              className="flex-1 min-h-[44px] text-xs font-semibold gap-1.5 r82-budget-btn"
              onClick={() => toast.success('Alerta configurado!')}
            >
              <Bell className="w-4 h-4" />
              Definir Alerta
            </Button>
            <Button
              variant="outline"
              className="flex-1 min-h-[44px] text-xs font-semibold gap-1.5 r82-budget-btn"
              onClick={() => toast.success('Abrindo histórico...')}
            >
              <History className="w-4 h-4" />
              Ver Histórico
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BudgetTracker
