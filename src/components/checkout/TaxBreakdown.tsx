'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, ShieldCheck, TrendingDown, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface TaxLine {
  id: string
  name: string
  acronym: string
  percentage: number
  description: string
  exempt: boolean
}

interface TaxCategory {
  label: string
  taxes: TaxLine[]
}

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const taxCategories: TaxCategory[] = [
  {
    label: 'Impostos Federais',
    taxes: [
      { id: 'pis', name: 'Programa de Integração Social', acronym: 'PIS', percentage: 1.65, description: 'Financiamento de benefícios do trabalhador', exempt: false },
      { id: 'cofins', name: 'Contribuição para Financiamento da Seguridade Social', acronym: 'COFINS', percentage: 7.60, description: 'Financiamento da seguridade social', exempt: false },
      { id: 'ipi', name: 'Imposto sobre Produtos Industrializados', acronym: 'IPI', percentage: 5.00, description: 'Imposto sobre produtos industrializados', exempt: false },
      { id: 'fcp', name: 'Fundo de Combate à Pobreza', acronym: 'FCP', percentage: 2.00, description: 'Fundo destinado a programas sociais', exempt: false },
    ],
  },
  {
    label: 'Impostos Estaduais',
    taxes: [
      { id: 'icms', name: 'Imposto sobre Circulação de Mercadorias', acronym: 'ICMS', percentage: 18.00, description: 'Imposto estadual sobre circulação de mercadorias e serviços', exempt: false },
    ],
  },
]

const maxPercentage = Math.max(...taxCategories.flatMap(c => c.taxes.map(t => t.percentage)))

function AnimatedCounter({ target, duration = 800 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let start = 0
    const startTime = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target * 100) / 100)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return <span>{value.toFixed(2)}</span>
}

function TaxBar({ percentage, color, delay = 0 }: { percentage: number; color: string; delay?: number }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth((percentage / maxPercentage) * 100)
    }, 100 + delay)
    return () => clearTimeout(timer)
  }, [percentage, delay])

  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ width: `${width}%`, background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: delay / 1000 }}
      />
    </div>
  )
}

export function TaxBreakdown({ subtotal = 100 }: { subtotal?: number }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const allTaxes = taxCategories.flatMap(c => c.taxes)
  const totalTaxPercentage = allTaxes.filter(t => !t.exempt).reduce((sum, t) => sum + t.percentage, 0)
  const totalTaxAmount = (subtotal * totalTaxPercentage) / 100
  const nonLocalTaxRate = totalTaxPercentage + 5.0
  const nonLocalTaxAmount = (subtotal * nonLocalTaxRate) / 100
  const savings = nonLocalTaxAmount - totalTaxAmount
  const hasExemptions = allTaxes.some(t => t.exempt)

  const taxColors: Record<string, string> = {
    icms: '#10b981',
    pis: '#06b6d4',
    cofins: '#3b82f6',
    fcp: '#8b5cf6',
    ipi: '#f59e0b',
  }

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ShieldCheck className="h-4 w-4 text-primary" />
            </motion.div>
            <h4 className="font-semibold text-sm">Resumo Fiscal</h4>
          </div>
          <Badge variant="secondary" className="text-[9px] bg-primary/5 text-primary border-primary/20">
            Fiscalidade local
          </Badge>
        </div>

        <p className="text-[10px] text-muted-foreground mb-3">
          Detalhamento dos impostos aplicáveis conforme legislação vigente
        </p>

        {/* Total Tax Amount Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/5 to-emerald-500/5 rounded-xl p-3 border border-primary/10 mb-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">Total de impostos</p>
              <p className="text-lg font-bold text-primary">
                R$ <AnimatedCounter target={totalTaxAmount} />
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Alíquota efetiva</p>
              <p className="text-lg font-bold text-foreground">
                <AnimatedCounter target={totalTaxPercentage} />%
              </p>
            </div>
          </div>
        </motion.div>

        {/* Expandable details */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsExpanded(prev => !prev)}
          className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
        >
          <span className="text-xs font-medium text-muted-foreground">
            {isExpanded ? 'Ocultar detalhes' : 'Ver detalhes dos impostos'}
          </span>
          <AnimatePresence mode="wait">
            <motion.div
              key={isExpanded ? 'up' : 'down'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Tax Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-4">
                {taxCategories.map((cat, catIdx) => (
                  <div key={cat.label}>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {cat.label}
                    </p>
                    <div className="space-y-2.5">
                      {cat.taxes.map((tax, taxIdx) => {
                        const taxAmount = (subtotal * tax.percentage) / 100
                        const color = taxColors[tax.id] || '#6b7280'
                        return (
                          <motion.div
                            key={tax.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: catIdx * 0.1 + taxIdx * 0.05 }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-2.5 w-2.5 rounded-sm shrink-0"
                                  style={{ backgroundColor: color }}
                                />
                                <span className="text-xs font-medium">{tax.acronym}</span>
                                <span className="text-[9px] text-muted-foreground">{tax.percentage}%</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {tax.exempt && (
                                  <Badge variant="secondary" className="text-[8px] bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30">
                                    Isento?
                                  </Badge>
                                )}
                                <span className="text-xs font-semibold">
                                  R$ <AnimatedCounter target={taxAmount} duration={600 + catIdx * 100 + taxIdx * 50} />
                                </span>
                              </div>
                            </div>
                            <TaxBar
                              percentage={tax.percentage}
                              color={color}
                              delay={catIdx * 100 + taxIdx * 80}
                            />
                            <p className="text-[9px] text-muted-foreground mt-1 leading-relaxed">
                              {tax.description}
                            </p>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Separator className="my-3" />

        {/* Comparison Section: "Se comprasse fora" */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-amber-50/60 dark:bg-amber-900/10 rounded-xl p-3 border border-amber-200/50 dark:border-amber-800/30"
        >
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingDown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Comparativo</p>
          </div>

          <div className="space-y-1.5">
            {/* Local purchase */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Comprando em Dom Eliseu (local)</span>
              <span className="font-semibold text-primary">
                R$ <AnimatedCounter target={totalTaxAmount} duration={1000} />
              </span>
            </div>

            {/* Non-local purchase */}
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Se comprasse fora</span>
                <div className="relative group">
                  <Info className="h-3 w-3 text-muted-foreground" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-card rounded-lg shadow-lg border border-border text-[9px] text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Inclui ICMS interestadual + frete adicional
                  </div>
                </div>
              </div>
              <span className="font-semibold text-amber-700 dark:text-amber-400 line-through">
                R$ <AnimatedCounter target={nonLocalTaxAmount} duration={1200} />
              </span>
            </div>

            <Separator className="my-1.5" />

            {/* Savings */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                💰 Economia Fiscal
              </span>
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 20, delay: 0.5 }}
                className="text-sm font-bold text-emerald-600 dark:text-emerald-400"
              >
                -R$ <AnimatedCounter target={savings} duration={1400} />
              </motion.span>
            </div>

            {/* Visual comparison bars */}
            <div className="flex gap-1 mt-2">
              <div className="flex-1">
                <p className="text-[8px] text-muted-foreground mb-0.5 text-center">Local</p>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(totalTaxPercentage / nonLocalTaxRate) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[8px] text-muted-foreground mb-0.5 text-center">Fora</p>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tax exemptions info */}
        {hasExemptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-3 flex items-center gap-2 text-[9px] text-muted-foreground bg-emerald-50/50 dark:bg-emerald-900/5 rounded-lg p-2 border border-emerald-200/30 dark:border-emerald-800/20"
          >
            <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Este produto possui isenção fiscal parcial. Os impostos isentos não serão cobrados.</span>
          </motion.div>
        )}

        {/* Disclaimer */}
        <p className="text-[8px] text-muted-foreground mt-3 leading-relaxed">
          * Valores aproximados para fins informativos. Impostos reais podem variar conforme categoria tributária do produto e políticas vigentes. DomPlace não é responsável por alterações na legislação tributária.
        </p>
      </CardContent>
    </Card>
  )
}
