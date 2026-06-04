'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Leaf, TrendingDown, Info, Recycle, Truck, Package, Factory, Warehouse, Lightbulb, Award, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ImpactCategory {
  name: string
  icon: React.ElementType
  score: number
  rating: string
  ratingColor: string
  ratingBg: string
}

interface CarbonTip {
  icon: React.ElementType
  title: string
  description: string
  gradient: string
}

const impactCategories: ImpactCategory[] = [
  { name: 'Transporte', icon: Truck, score: 72, rating: 'Baixo', ratingColor: 'text-emerald-600 dark:text-emerald-400', ratingBg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { name: 'Embalagem', icon: Package, score: 58, rating: 'Médio', ratingColor: 'text-amber-600 dark:text-amber-400', ratingBg: 'bg-amber-50 dark:bg-amber-900/20' },
  { name: 'Produção', icon: Factory, score: 45, rating: 'Médio', ratingColor: 'text-amber-600 dark:text-amber-400', ratingBg: 'bg-amber-50 dark:bg-amber-900/20' },
  { name: 'Armazenamento', icon: Warehouse, score: 80, rating: 'Baixo', ratingColor: 'text-emerald-600 dark:text-emerald-400', ratingBg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { name: 'Reciclagem', icon: Recycle, score: 65, rating: 'Médio', ratingColor: 'text-amber-600 dark:text-amber-400', ratingBg: 'bg-amber-50 dark:bg-amber-900/20' },
]

const carbonTips: CarbonTip[] = [
  {
    icon: Leaf,
    title: 'Escolha produtos locais',
    description: 'Produtos da região emitem até 60% menos CO2 no transporte.',
    gradient: 'from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30',
  },
  {
    icon: Recycle,
    title: 'Prefira embalagens recicláveis',
    description: 'Embalagens recicláveis reduzem o impacto ambiental em até 40%.',
    gradient: 'from-blue-100 to-cyan-200 dark:from-blue-900/30 dark:to-cyan-800/30',
  },
  {
    icon: Lightbulb,
    title: 'Compre em quantidade',
    description: 'Pedidos maiores otimizam entregas e reduzem emissões por item.',
    gradient: 'from-amber-100 to-yellow-200 dark:from-amber-900/30 dark:to-yellow-800/30',
  },
]

function getEcoScoreColor(score: number): string {
  if (score >= 80) return 'rgba(16,185,129,1)'
  if (score >= 60) return 'rgba(132,204,22,1)'
  if (score >= 40) return 'rgba(245,158,11,1)'
  return 'rgba(239,68,68,1)'
}

function getEcoScoreGradient(score: number): string {
  if (score >= 80) return 'from-emerald-500 to-green-600'
  if (score >= 60) return 'from-lime-500 to-green-500'
  if (score >= 40) return 'from-amber-500 to-yellow-500'
  return 'from-red-500 to-orange-500'
}

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 1500
    const startTime = Date.now()

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(start + (target - start) * eased)
      setValue(current)
      if (progress >= 1) clearInterval(timer)
    }, 16)

    return () => clearInterval(timer)
  }, [target])

  return <span>{value.toFixed(1)}{suffix}</span>
}

export function ProductCarbonFootprint() {
  const [ecoScore] = useState(68)
  const [co2Savings] = useState(2.4)
  const [categoryAvg] = useState(5.1)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  const circumference = 2 * Math.PI * 42
  const dashOffset = circumference - (ecoScore / 100) * circumference
  const isSustainable = ecoScore >= 80

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base">Pegada de Carbono</h3>
            <p className="text-xs text-muted-foreground">Impacto ambiental deste produto</p>
          </div>
        </div>
      </div>

      {/* Eco-Score Gauge */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-4 bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-900/10 dark:to-green-900/10 rounded-2xl p-4 border border-emerald-200/30 dark:border-emerald-800/30">
          <div className="relative shrink-0">
            <svg width="96" height="96" viewBox="0 0 100 100" className="transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="rgba(0,0,0,0.06)"
                strokeWidth="8"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={getEcoScoreColor(ecoScore)}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={isVisible ? { strokeDashoffset: dashOffset } : {}}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-xl font-bold"
                style={{ color: getEcoScoreColor(ecoScore) }}
                initial={{ scale: 0 }}
                animate={isVisible ? { scale: 1 } : {}}
                transition={{ delay: 0.5, type: 'spring' as const, stiffness: 300, damping: 20 }}
              >
                {ecoScore}
              </motion.span>
              <span className="text-[9px] text-muted-foreground">Eco-Score</span>
            </div>

            {/* Animated leaf */}
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Leaf className="h-5 w-5 text-emerald-500" />
            </motion.div>
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold mb-1">
              Classificação:{' '}
              <span className={`bg-gradient-to-r ${getEcoScoreGradient(ecoScore)} bg-clip-text text-transparent font-bold`}>
                {ecoScore >= 80 ? 'Excelente' : ecoScore >= 60 ? 'Bom' : ecoScore >= 40 ? 'Regular' : 'Baixo'}
              </span>
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Este produto tem um impacto ambiental{' '}
              {ecoScore >= 60 ? 'abaixo da média' : 'próximo da média'}{' '}
              comparado a produtos similares.
            </p>

            {/* CO2 savings counter */}
            <div className="mt-2 flex items-center gap-2 bg-white dark:bg-black/20 rounded-lg p-2 border border-border/50">
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <TrendingDown className="h-4 w-4 text-emerald-500" />
              </motion.div>
              <div>
                <p className="text-[10px] text-muted-foreground">Economia de CO₂</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  <AnimatedCounter target={co2Savings} suffix=" kg" /> CO₂e
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sustainable Badge */}
        {isSustainable && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ delay: 0.8, type: 'spring' as const, stiffness: 300, damping: 20 }}
            className="mt-3 flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-green-500/10 dark:from-emerald-500/20 dark:to-green-500/20 rounded-xl p-2.5 border border-emerald-300/30 dark:border-emerald-700/30"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </motion.div>
            <div>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Produto Sustentável</p>
              <p className="text-[10px] text-muted-foreground">Reconhecido por baixo impacto ambiental</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Impact Categories */}
      <div className="px-4 pb-4">
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
          <Info className="h-4 w-4 text-muted-foreground" />
          Categorias de impacto
        </h4>
        <div className="space-y-2.5">
          {impactCategories.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, x: -15 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 + idx * 0.1, type: 'spring' as const, stiffness: 300, damping: 25 }}
              className="flex items-center gap-3"
            >
              <div className="h-8 w-8 rounded-lg bg-secondary/80 flex items-center justify-center shrink-0">
                <cat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{cat.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold">{cat.score}/100</span>
                    <Badge className={`text-[9px] px-1.5 py-0 border-0 ${cat.ratingBg} ${cat.ratingColor}`}>
                      {cat.rating}
                    </Badge>
                  </div>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: getEcoScoreColor(cat.score) }}
                    initial={{ width: '0%' }}
                    animate={isVisible ? { width: `${cat.score}%` } : {}}
                    transition={{ duration: 1, delay: 0.4 + idx * 0.1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Comparison with Category Average */}
      <div className="px-4 pb-4">
        <div className="bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-xl p-3 border border-blue-200/30 dark:border-blue-800/30">
          <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
            <TrendingDown className="h-3.5 w-3.5 text-blue-500" />
            Comparar com similar
          </h4>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground mb-1">Este produto</p>
              <div className="flex items-end gap-1">
                <motion.div
                  className="w-full rounded-md bg-gradient-to-t from-emerald-500 to-emerald-400"
                  style={{ height: 40 }}
                  initial={{ height: 0 }}
                  animate={isVisible ? { height: 40 } : {}}
                  transition={{ duration: 0.8, delay: 1 }}
                />
              </div>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">3.2 kg CO₂e</p>
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground mb-1">Média da categoria</p>
              <div className="flex items-end gap-1">
                <motion.div
                  className="w-full rounded-md bg-gradient-to-t from-gray-400 to-gray-300 dark:from-gray-600 dark:to-gray-500"
                  style={{ height: 64 }}
                  initial={{ height: 0 }}
                  animate={isVisible ? { height: 64 } : {}}
                  transition={{ duration: 0.8, delay: 1.1 }}
                />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground mt-1">{categoryAvg} kg CO₂e</p>
            </div>
          </div>
          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-2 flex items-center gap-0.5">
            <TrendingDown className="h-3 w-3" />
            {Math.round(((categoryAvg - 3.2) / categoryAvg) * 100)}% menos emissões que a média
          </p>
        </div>
      </div>

      {/* Tips Section */}
      <div className="px-4 pb-4">
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Como reduzir
        </h4>
        <div className="space-y-2">
          {carbonTips.map((tip, idx) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.2 + idx * 0.15, type: 'spring' as const, stiffness: 300, damping: 25 }}
              whileHover={{ x: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
              className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r border border-border/50 cursor-default"
              style={{
                backgroundImage: `linear-gradient(90deg, transparent, transparent)`,
              }}
            >
              <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${tip.gradient} flex items-center justify-center shrink-0`}>
                <motion.div
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: idx * 0.5 }}
                >
                  <tip.icon className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                </motion.div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">{tip.title}</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{tip.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
