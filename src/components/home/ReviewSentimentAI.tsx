'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  ThumbsDown,
  Minus,
  ChevronDown,
  Quote,
  Zap,
  BarChart3,
  Calendar,
  Tag,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

/* ═══════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════ */

interface ProductOption {
  id: string
  name: string
  category: string
}

interface ReviewData {
  id: string
  productId: string
  userName: string
  text: string
  rating: number
  date: string
  sentimentScore: number
  keywords: string[]
  topic: string
}

interface KeywordFreq {
  word: string
  count: number
  sentiment: 'positive' | 'negative' | 'neutral'
}

interface TrendPoint {
  date: string
  avgScore: number
}

interface TopicCount {
  name: string
  count: number
  positiveRatio: number
}

/* ═══════════════════════════════════════════════════════════════════
   Mock Data — 4 products, 18 reviews
   ═══════════════════════════════════════════════════════════════════ */

const MOCK_PRODUCTS: ProductOption[] = [
  { id: 'all', name: 'Todos os Produtos', category: 'geral' },
  { id: 'p1', name: 'Fone Bluetooth Pro', category: 'Eletrônicos' },
  { id: 'p2', name: 'Cadeira Ergonômica X', category: 'Móveis' },
  { id: 'p3', name: 'Cafeteira Premium', category: 'Eletrodomésticos' },
  { id: 'p4', name: 'Tênis Running Ultra', category: 'Esportes' },
]

const MOCK_REVIEWS: ReviewData[] = [
  // ─── Fone Bluetooth Pro ───
  {
    id: 'r1',
    productId: 'p1',
    userName: 'Lucas Mendes',
    text: 'Qualidade de som incrível! O cancelamento de ruído funciona perfeitamente. Melhor compra do ano, recomendo demais.',
    rating: 5,
    date: '2025-01-02',
    sentimentScore: 0.92,
    keywords: ['qualidade', 'som', 'cancelamento de ruído', 'recomendo'],
    topic: 'qualidade',
  },
  {
    id: 'r2',
    productId: 'p1',
    userName: 'Camila Rocha',
    text: 'Bom produto, mas a bateria dura menos do que prometido. O som é ótimo, porém a conexão Bluetooth cai algumas vezes.',
    rating: 3,
    date: '2025-01-05',
    sentimentScore: 0.42,
    keywords: ['bateria', 'som', 'bluetooth', 'conexão'],
    topic: 'qualidade',
  },
  {
    id: 'r3',
    productId: 'p1',
    userName: 'Pedro Almeida',
    text: 'Confortável para uso prolongado, design elegante. Entrega rápida e embalagem impecável. Super satisfeito!',
    rating: 5,
    date: '2025-01-08',
    sentimentScore: 0.95,
    keywords: ['confortável', 'design', 'entrega', 'embalagem', 'satisfeito'],
    topic: 'embalagem',
  },
  {
    id: 'r4',
    productId: 'p1',
    userName: 'Juliana Ferreira',
    text: 'Péssimo atendimento ao cliente. Produto veio com defeito e demoraram muito para trocar. Preço alto para a qualidade oferecida.',
    rating: 1,
    date: '2025-01-10',
    sentimentScore: 0.08,
    keywords: ['atendimento', 'defeito', 'troca', 'preço', 'qualidade'],
    topic: 'preço',
  },
  {
    id: 'r5',
    productId: 'p1',
    userName: 'Rafael Costa',
    text: 'Razoável. O fone é bonito e o som é aceitável, mas esperava mais pelo valor pago. Material parece frágil.',
    rating: 3,
    date: '2025-01-14',
    sentimentScore: 0.38,
    keywords: ['bonito', 'som', 'valor', 'material', 'frágil'],
    topic: 'preço',
  },
  // ─── Cadeira Ergonômica X ───
  {
    id: 'r6',
    productId: 'p2',
    userName: 'Amanda Souza',
    text: 'Melhor cadeira que já tive! Minhas costas agradecem. Material premium, montagem fácil. Vale cada centavo investido.',
    rating: 5,
    date: '2025-01-03',
    sentimentScore: 0.97,
    keywords: ['melhor', 'costas', 'material', 'montagem', 'investimento'],
    topic: 'qualidade',
  },
  {
    id: 'r7',
    productId: 'p2',
    userName: 'Bruno Oliveira',
    text: 'A cadeira é confortável, mas o encosto reclina sozinho depois de alguns meses. Esperava mais durabilidade.',
    rating: 3,
    date: '2025-01-07',
    sentimentScore: 0.35,
    keywords: ['confortável', 'encosto', 'durabilidade'],
    topic: 'qualidade',
  },
  {
    id: 'r8',
    productId: 'p2',
    userName: 'Daniela Santos',
    text: 'Excelente custo-benefício! Entrega no prazo e a embalagem veio super protegida. Uso o dia inteiro no home office.',
    rating: 4,
    date: '2025-01-11',
    sentimentScore: 0.82,
    keywords: ['custo-benefício', 'entrega', 'embalagem', 'home office'],
    topic: 'preço',
  },
  {
    id: 'r9',
    productId: 'p2',
    userName: 'Felipe Lima',
    text: 'Produto arrivedo, com cheiro forte de plástico barato. O estofado já está descascando após 2 semanas. Arrependimento total.',
    rating: 1,
    date: '2025-01-15',
    sentimentScore: 0.05,
    keywords: ['cheiro', 'plástico', 'estofado', 'arrependimento'],
    topic: 'qualidade',
  },
  // ─── Cafeteira Premium ───
  {
    id: 'r10',
    productId: 'p3',
    userName: 'Marina Gomes',
    text: 'Café perfeito todas as manhãs! Programa o horário e quando acordo já está pronto. Design moderno e fácil de limpar.',
    rating: 5,
    date: '2025-01-04',
    sentimentScore: 0.94,
    keywords: ['perfeito', 'programa', 'design', 'fácil', 'limpar'],
    topic: 'qualidade',
  },
  {
    id: 'r11',
    productId: 'p3',
    userName: 'Thiago Nascimento',
    text: 'Funciona bem, mas o reservatório é pequeno demais para uma família. O preço poderia ser mais acessível.',
    rating: 3,
    date: '2025-01-09',
    sentimentScore: 0.45,
    keywords: ['funciona', 'reservatório', 'família', 'preço'],
    topic: 'preço',
  },
  {
    id: 'r12',
    productId: 'p3',
    userName: 'Isabela Martins',
    text: 'Adorei! O café sai bem quente e com ótimo sabor. A entrega foi super rápida e chegou antes do prazo. Recomendo!',
    rating: 5,
    date: '2025-01-12',
    sentimentScore: 0.91,
    keywords: ['adorei', 'sabor', 'entrega', 'recomendo'],
    topic: 'entrega',
  },
  {
    id: 'r13',
    productId: 'p3',
    userName: 'Gustavo Pereira',
    text: 'Após um mês parou de funcionar. Contatei o suporte e ainda não resolveram. Produto caro com qualidade duvidosa.',
    rating: 2,
    date: '2025-01-16',
    sentimentScore: 0.12,
    keywords: ['funcionar', 'suporte', 'caro', 'qualidade'],
    topic: 'qualidade',
  },
  // ─── Tênis Running Ultra ───
  {
    id: 'r14',
    productId: 'p4',
    userName: 'Carolina Dias',
    text: 'Super leve e confortável! Corri 10km no primeiro uso e zero bolhas. Melhor tênis para corrida que já usei. Estética linda!',
    rating: 5,
    date: '2025-01-01',
    sentimentScore: 0.96,
    keywords: ['leve', 'confortável', 'corrida', 'bolhas', 'estética'],
    topic: 'qualidade',
  },
  {
    id: 'r15',
    productId: 'p4',
    userName: 'Matheus Barbosa',
    text: 'O tênis é bonito e macio, mas a sola desgastou muito rápido. Para o preço, esperava mais resistência.',
    rating: 3,
    date: '2025-01-06',
    sentimentScore: 0.40,
    keywords: ['bonito', 'macio', 'sola', 'preço', 'resistência'],
    topic: 'preço',
  },
  {
    id: 'r16',
    productId: 'p4',
    userName: 'Beatriz Cunha',
    text: 'Entrega rápida, veio bem embalado. Material de primeira qualidade e o cabedal é muito respirável. Amei!',
    rating: 5,
    date: '2025-01-13',
    sentimentScore: 0.93,
    keywords: ['entrega', 'embalado', 'qualidade', 'respirável'],
    topic: 'entrega',
  },
  {
    id: 'r17',
    productId: 'p4',
    userName: 'Rodrigo Ribeiro',
    text: 'Numeração totalmente errada! Pedi o 42 e veio equivalente a 40. Embalagem amassada. Precisei devolver.',
    rating: 2,
    date: '2025-01-17',
    sentimentScore: 0.10,
    keywords: ['numeração', 'embalagem', 'devolver'],
    topic: 'embalagem',
  },
  {
    id: 'r18',
    productId: 'p4',
    userName: 'Larissa Mendonça',
    text: 'Produto excelente, bom custo-benefício. A sola tem ótima aderência e o amortecimento é impressionante. Uso para academia e corrida.',
    rating: 4,
    date: '2025-01-18',
    sentimentScore: 0.85,
    keywords: ['excelente', 'custo-benefício', 'sola', 'amortecimento', 'academia'],
    topic: 'qualidade',
  },
]

/* ═══════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════ */

const TOPIC_LABELS: Record<string, string> = {
  qualidade: 'Qualidade',
  preço: 'Preço',
  entrega: 'Entrega',
  embalagem: 'Embalagem',
  atendimento: 'Atendimento',
}

const TOPIC_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  qualidade: {
    bg: 'rgba(56, 189, 248, 0.12)',
    text: 'rgba(56, 189, 248, 0.95)',
    border: 'rgba(56, 189, 248, 0.25)',
  },
  preço: {
    bg: 'rgba(251, 146, 60, 0.12)',
    text: 'rgba(251, 146, 60, 0.95)',
    border: 'rgba(251, 146, 60, 0.25)',
  },
  entrega: {
    bg: 'rgba(52, 211, 153, 0.12)',
    text: 'rgba(52, 211, 153, 0.95)',
    border: 'rgba(52, 211, 153, 0.25)',
  },
  embalagem: {
    bg: 'rgba(167, 139, 250, 0.12)',
    text: 'rgba(167, 139, 250, 0.95)',
    border: 'rgba(167, 139, 250, 0.25)',
  },
  atendimento: {
    bg: 'rgba(244, 114, 182, 0.12)',
    text: 'rgba(244, 114, 182, 0.95)',
    border: 'rgba(244, 114, 182, 0.25)',
  },
}

const WORD_CLOUD_POSITIVE_COLORS = [
  'rgba(34, 197, 94, 0.85)',
  'rgba(16, 185, 129, 0.80)',
  'rgba(52, 211, 153, 0.78)',
  'rgba(74, 222, 128, 0.75)',
  'rgba(34, 197, 94, 0.90)',
]

const WORD_CLOUD_NEGATIVE_COLORS = [
  'rgba(239, 68, 68, 0.85)',
  'rgba(239, 68, 68, 0.75)',
  'rgba(248, 113, 113, 0.78)',
]

const WORD_CLOUD_NEUTRAL_COLORS = [
  'rgba(148, 163, 184, 0.75)',
  'rgba(148, 163, 184, 0.65)',
]

/* ═══════════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════════ */

const r39ContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
}

const r39CardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 280,
      damping: 22,
    },
  },
}

const r39FadeInVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 200, damping: 20 },
  },
}

const r39ScaleInVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 350, damping: 20 },
  },
}

const r39BarVariants = {
  hidden: { scaleX: 0 },
  visible: (custom: number) => ({
    scaleX: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 16,
      delay: custom * 0.06,
    },
  }),
}

/* ═══════════════════════════════════════════════════════════════════
   Helper: animated counter
   ═══════════════════════════════════════════════════════════════════ */

function useCounter(target: number, duration = 1100): number {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (target === 0) return
    const t0 = Date.now()
    let raf: number
    const tick = () => {
      const p = Math.min((Date.now() - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(eased * target * 10) / 10)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return val
}

/* ═══════════════════════════════════════════════════════════════════
   Helpers: sentiment utilities
   ═══════════════════════════════════════════════════════════════════ */

function r39GetSentimentLabel(score: number): {
  label: string
  color: string
  bg: string
} {
  if (score >= 0.65)
    return { label: 'Positivo', color: 'rgba(34,197,94,0.95)', bg: 'rgba(34,197,94,0.12)' }
  if (score <= 0.35)
    return { label: 'Negativo', color: 'rgba(239,68,68,0.95)', bg: 'rgba(239,68,68,0.12)' }
  return { label: 'Neutro', color: 'rgba(148,163,184,0.95)', bg: 'rgba(148,163,184,0.12)' }
}

function r39BuildKeywords(reviews: ReviewData[]): KeywordFreq[] {
  const map = new Map<string, { count: number; totalSentiment: number }>()
  for (const r of reviews) {
    for (const kw of r.keywords) {
      const lower = kw.toLowerCase()
      const existing = map.get(lower)
      if (existing) {
        existing.count++
        existing.totalSentiment += r.sentimentScore
      } else {
        map.set(lower, { count: 1, totalSentiment: r.sentimentScore })
      }
    }
  }
  return Array.from(map.entries())
    .map(([word, data]) => {
      const avg = data.totalSentiment / data.count
      return {
        word,
        count: data.count,
        sentiment: (avg >= 0.65 ? 'positive' : avg <= 0.35 ? 'negative' : 'neutral') as 'positive' | 'neutral' | 'negative',
      }
    })
    .sort((a, b) => b.count - a.count)
}

function r39BuildTrend(reviews: ReviewData[]): TrendPoint[] {
  const grouped = new Map<string, number[]>()
  for (const r of reviews) {
    const d = r.date.slice(0, 10)
    const arr = grouped.get(d) || []
    arr.push(r.sentimentScore)
    grouped.set(d, arr)
  }
  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, scores]) => ({
      date,
      avgScore: scores.reduce((s, v) => s + v, 0) / scores.length,
    }))
}

function r39BuildTopics(reviews: ReviewData[]): TopicCount[] {
  const map = new Map<string, { count: number; positive: number }>()
  for (const r of reviews) {
    const t = r.topic
    const existing = map.get(t) || { count: 0, positive: 0 }
    existing.count++
    if (r.sentimentScore >= 0.65) existing.positive++
    map.set(t, existing)
  }
  return Array.from(map.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      positiveRatio: data.count > 0 ? data.positive / data.count : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

function r39PickHighlights(reviews: ReviewData[]) {
  const sorted = [...reviews].sort((a, b) => b.sentimentScore - a.sentimentScore)
  const best = sorted[0] ?? null
  const worst = sorted[sorted.length - 1] ?? null
  return { best, worst }
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-component: Sentiment Ring
   ═══════════════════════════════════════════════════════════════════ */

function SentimentRing({ score, animated }: { score: number; animated: boolean }) {
  const percentage = Math.round(score * 100)
  const animatedPct = useCounter(animated ? percentage : 0, 1300)
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedPct / 100) * circumference
  const { label, color, bg } = r39GetSentimentLabel(score)

  const strokeColor =
    score >= 0.65
      ? 'rgba(34,197,94,1)'
      : score <= 0.35
      ? 'rgba(239,68,68,1)'
      : 'rgba(148,163,184,1)'

  return (
    <div className="r39-sentiment-ring flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
          {/* background track */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="rgba(148,163,184,0.15)"
            strokeWidth="10"
          />
          {/* progress arc */}
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{
              type: 'spring' as const,
              stiffness: 80,
              damping: 18,
              duration: 1.5,
            }}
          />
        </svg>
        {/* center text */}
        <div className="r39-sentiment-ring-label absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <motion.span
            className="text-2xl font-extrabold"
            style={{ color }}
            key={Math.round(animatedPct)}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
          >
            {Math.round(animatedPct)}%
          </motion.span>
          <span className="text-[10px] font-semibold" style={{ color: 'rgba(148,163,184,0.8)' }}>
            confiança
          </span>
        </div>
      </div>
      <span
        className="r39-sentiment-ring-badge text-[11px] font-bold rounded-full px-3 py-1"
        style={{ backgroundColor: bg, color }}
      >
        {label}
      </span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-component: Word Cloud
   ═══════════════════════════════════════════════════════════════════ */

function WordCloud({ keywords }: { keywords: KeywordFreq[] }) {
  const top = keywords.slice(0, 20)
  const maxCount = top.length > 0 ? top[0].count : 1

  const sizes = top.map((kw) => {
    const ratio = kw.count / maxCount
    if (ratio > 0.8) return { fontSize: 22, fontWeight: 800 }
    if (ratio > 0.6) return { fontSize: 17, fontWeight: 700 }
    if (ratio > 0.4) return { fontSize: 14, fontWeight: 600 }
    return { fontSize: 11, fontWeight: 500 }
  })

  const getColor = (sentiment: 'positive' | 'negative' | 'neutral', idx: number) => {
    if (sentiment === 'positive') return WORD_CLOUD_POSITIVE_COLORS[idx % WORD_CLOUD_POSITIVE_COLORS.length]
    if (sentiment === 'negative') return WORD_CLOUD_NEGATIVE_COLORS[idx % WORD_CLOUD_NEGATIVE_COLORS.length]
    return WORD_CLOUD_NEUTRAL_COLORS[idx % WORD_CLOUD_NEUTRAL_COLORS.length]
  }

  return (
    <div className="r39-word-cloud flex flex-wrap gap-2 items-center justify-center min-h-[140px] py-4">
      {top.map((kw, idx) => (
        <motion.span
          key={kw.word}
          className="r39-word-cloud-item cursor-default select-none whitespace-nowrap"
          style={{
            fontSize: sizes[idx].fontSize,
            fontWeight: sizes[idx].fontWeight,
            color: getColor(kw.sentiment, idx),
          }}
          initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{
            type: 'spring' as const,
            stiffness: 260,
            damping: 18,
            delay: idx * 0.04,
          }}
          whileHover={{
            scale: 1.18,
            transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
          }}
          title={`${kw.word}: ${kw.count} menções`}
        >
          {kw.word}
        </motion.span>
      ))}
      {top.length === 0 && (
        <span className="text-xs text-muted-foreground">Nenhuma palavra-chave disponível</span>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-component: Sentiment Breakdown (horizontal bars)
   ═══════════════════════════════════════════════════════════════════ */

function SentimentBreakdown({ keywords }: { keywords: KeywordFreq[] }) {
  const positive = keywords.filter((k) => k.sentiment === 'positive')
  const negative = keywords.filter((k) => k.sentiment === 'negative')
  const maxP = positive.length > 0 ? positive[0].count : 1
  const maxN = negative.length > 0 ? negative[0].count : 1

  return (
    <div className="r39-sentiment-breakdown space-y-4">
      {/* positive keywords */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <ThumbsUp className="h-3.5 w-3.5 text-green-500" />
          <span className="text-[11px] font-bold text-green-500">Palavras Positivas</span>
          <span className="text-[10px] text-muted-foreground">({positive.length})</span>
        </div>
        <div className="space-y-1.5">
          {positive.slice(0, 6).map((kw, idx) => (
            <div key={kw.word} className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-muted-foreground w-24 truncate text-right">
                {kw.word}
              </span>
              <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(34,197,94,0.12)' }}>
                <motion.div
                  custom={idx}
                  variants={r39BarVariants}
                  initial="hidden"
                  animate="visible"
                  className="h-full rounded-full"
                  style={{
                    width: `${(kw.count / maxP) * 100}%`,
                    backgroundColor: 'rgba(34,197,94,0.7)',
                    transformOrigin: 'left',
                  }}
                />
              </div>
              <span className="text-[9px] font-semibold text-green-600 w-4 text-right">{kw.count}</span>
            </div>
          ))}
          {positive.length === 0 && (
            <span className="text-[10px] text-muted-foreground">Nenhum dado</span>
          )}
        </div>
      </div>
      {/* negative keywords */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
          <span className="text-[11px] font-bold text-red-500">Palavras Negativas</span>
          <span className="text-[10px] text-muted-foreground">({negative.length})</span>
        </div>
        <div className="space-y-1.5">
          {negative.slice(0, 6).map((kw, idx) => (
            <div key={kw.word} className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-muted-foreground w-24 truncate text-right">
                {kw.word}
              </span>
              <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}>
                <motion.div
                  custom={idx}
                  variants={r39BarVariants}
                  initial="hidden"
                  animate="visible"
                  className="h-full rounded-full"
                  style={{
                    width: `${(kw.count / maxN) * 100}%`,
                    backgroundColor: 'rgba(239,68,68,0.7)',
                    transformOrigin: 'left',
                  }}
                />
              </div>
              <span className="text-[9px] font-semibold text-red-600 w-4 text-right">{kw.count}</span>
            </div>
          ))}
          {negative.length === 0 && (
            <span className="text-[10px] text-muted-foreground">Nenhum dado</span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-component: Review Highlights
   ═══════════════════════════════════════════════════════════════════ */

function ReviewHighlights({ best, worst }: { best: ReviewData | null; worst: ReviewData | null }) {
  return (
    <div className="r39-review-highlights space-y-3">
      {/* Best review */}
      {best && (
        <motion.div
          variants={r39FadeInVariants}
          initial="hidden"
          animate="visible"
          className="relative rounded-xl p-3 border border-green-200/60"
          style={{ backgroundColor: 'rgba(34,197,94,0.04)' }}
        >
          <div className="absolute top-0 left-0 w-1 h-full rounded-r bg-green-500" />
          <div className="flex items-center gap-1.5 mb-1.5 pl-2">
            <Quote className="h-3 w-3 text-green-500" />
            <span className="text-[10px] font-bold text-green-600">Melhor Avaliação</span>
            <Badge
              className="ml-auto text-[8px] font-bold px-1.5 py-0"
              style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: 'rgba(34,197,94,0.95)', borderColor: 'rgba(34,197,94,0.25)' }}
            >
              {(best.sentimentScore * 100).toFixed(0)}%
            </Badge>
          </div>
          <p className="text-xs leading-relaxed text-foreground/80 pl-2 line-clamp-3">
            &ldquo;{best.text}&rdquo;
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 pl-2">
            <span className="text-[10px] font-semibold text-muted-foreground">{best.userName}</span>
            <span className="text-[9px] text-muted-foreground/60">• {best.date}</span>
          </div>
        </motion.div>
      )}

      {/* Worst review */}
      {worst && (
        <motion.div
          variants={r39FadeInVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15 }}
          className="relative rounded-xl p-3 border border-red-200/60"
          style={{ backgroundColor: 'rgba(239,68,68,0.04)' }}
        >
          <div className="absolute top-0 left-0 w-1 h-full rounded-r bg-red-500" />
          <div className="flex items-center gap-1.5 mb-1.5 pl-2">
            <Quote className="h-3 w-3 text-red-500" />
            <span className="text-[10px] font-bold text-red-600">Pior Avaliação</span>
            <Badge
              className="ml-auto text-[8px] font-bold px-1.5 py-0"
              style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: 'rgba(239,68,68,0.95)', borderColor: 'rgba(239,68,68,0.25)' }}
            >
              {(worst.sentimentScore * 100).toFixed(0)}%
            </Badge>
          </div>
          <p className="text-xs leading-relaxed text-foreground/80 pl-2 line-clamp-3">
            &ldquo;{worst.text}&rdquo;
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 pl-2">
            <span className="text-[10px] font-semibold text-muted-foreground">{worst.userName}</span>
            <span className="text-[9px] text-muted-foreground/60">• {worst.date}</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-component: Trend Line (mini chart)
   ═══════════════════════════════════════════════════════════════════ */

function TrendLine({ trend }: { trend: TrendPoint[] }) {
  if (trend.length < 2) {
    return (
      <div className="r39-trend-line flex items-center justify-center h-[100px]">
        <span className="text-[10px] text-muted-foreground">Dados insuficientes</span>
      </div>
    )
  }

  const w = 320
  const h = 100
  const padX = 12
  const padY = 12
  const plotW = w - padX * 2
  const plotH = h - padY * 2

  const points = trend.map((pt, idx) => {
    const x = padX + (idx / (trend.length - 1)) * plotW
    const y = padY + plotH - pt.avgScore * plotH
    return { x, y, score: pt.avgScore, date: pt.date }
  })

  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x},${pt.y}`
    const prev = points[i - 1]
    const cpx = (prev.x + pt.x) / 2
    return `${acc} C ${cpx},${prev.y} ${cpx},${pt.y} ${pt.x},${pt.y}`
  }, '')

  const areaD = `${pathD} L ${points[points.length - 1].x},${padY + plotH} L ${points[0].x},${padY + plotH} Z`

  const isTrendingUp =
    trend.length >= 2 &&
    trend[trend.length - 1].avgScore > trend[0].avgScore

  return (
    <div className="r39-trend-line w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] font-bold text-muted-foreground">Últimos 30 dias</span>
        </div>
        {isTrendingUp ? (
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            <span className="text-[10px] font-bold text-green-600">Tendência positiva</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            <span className="text-[10px] font-bold text-red-600">Tendência negativa</span>
          </div>
        )}
      </div>

      <motion.div
        className="r39-trend-chart overflow-hidden rounded-lg"
        style={{ backgroundColor: 'rgba(148,163,184,0.06)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring' as const, stiffness: 200, damping: 20 }}
      >
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
          {/* gradient fill */}
          <defs>
            <linearGradient id="r39TrendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(56,189,248,0.25)" />
              <stop offset="100%" stopColor="rgba(56,189,248,0.02)" />
            </linearGradient>
          </defs>
          {/* area */}
          <motion.path
            d={areaD}
            fill="url(#r39TrendGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          />
          {/* line */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="rgba(56,189,248,0.8)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3, duration: 1.2, ease: 'easeOut' }}
          />
          {/* dots */}
          {points.map((pt, idx) => (
            <motion.circle
              key={pt.date}
              cx={pt.x}
              cy={pt.y}
              r={3}
              fill="rgba(56,189,248,1)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring' as const,
                stiffness: 300,
                damping: 18,
                delay: 0.5 + idx * 0.06,
              }}
            />
          ))}
        </svg>
      </motion.div>

      {/* date labels */}
      <div className="flex items-center justify-between mt-1 px-1">
        <span className="text-[8px] text-muted-foreground/60">{trend[0]?.date.slice(5)}</span>
        <span className="text-[8px] text-muted-foreground/60">{trend[trend.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-component: Topic Tags
   ═══════════════════════════════════════════════════════════════════ */

function TopicTags({ topics }: { topics: TopicCount[] }) {
  return (
    <div className="r39-topic-tags flex flex-wrap gap-2">
      {topics.map((topic, idx) => {
        const colors = TOPIC_COLORS[topic.name] || {
          bg: 'rgba(148,163,184,0.12)',
          text: 'rgba(148,163,184,0.95)',
          border: 'rgba(148,163,184,0.25)',
        }
        const label = TOPIC_LABELS[topic.name] || topic.name

        return (
          <motion.div
            key={topic.name}
            variants={r39ScaleInVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: idx * 0.05 }}
            whileHover={{
              scale: 1.08,
              transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
            }}
            className="r39-topic-tag relative group cursor-default"
          >
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border"
              style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
            >
              <Tag className="h-3 w-3" />
              <span className="text-[11px] font-bold">{label}</span>
              <span className="text-[9px] font-semibold opacity-70">{topic.count}</span>
            </div>
            {/* ratio tooltip */}
            <div className="r39-topic-tooltip absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div
                className="text-[9px] font-semibold px-2 py-1 rounded-md whitespace-nowrap"
                style={{ backgroundColor: 'rgba(15,23,42,0.9)', color: 'rgba(255,255,255,0.95)' }}
              >
                {Math.round(topic.positiveRatio * 100)}% positivas
              </div>
            </div>
          </motion.div>
        )
      })}
      {topics.length === 0 && (
        <span className="text-[10px] text-muted-foreground">Nenhum tópico disponível</span>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-component: Product Selector Dropdown
   ═══════════════════════════════════════════════════════════════════ */

function ProductSelector({
  products,
  selected,
  onChange,
}: {
  products: ProductOption[]
  selected: string
  onChange: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const current = products.find((p) => p.id === selected) || products[0]

  return (
    <div className="r39-product-selector relative">
      <motion.button
        className="r39-product-selector-btn flex items-center gap-2 rounded-xl border border-border/60 px-3 py-2 text-xs font-semibold text-foreground/80 hover:border-primary/40 transition-colors bg-card"
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.97 }}
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        <BarChart3 className="h-3.5 w-3.5 text-primary" />
        <span className="truncate max-w-[160px] sm:max-w-[240px]">{current.name}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
        >
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="r39-product-selector-dropdown absolute top-full left-0 mt-1 z-30 w-64 rounded-xl border border-border/60 bg-card shadow-lg overflow-hidden"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
          >
            {products.map((p) => (
              <button
                key={p.id}
                className={`r39-product-selector-option w-full text-left px-3 py-2.5 text-xs font-medium transition-colors ${
                  p.id === selected
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-accent'
                }`}
                onClick={() => {
                  onChange(p.id)
                  setOpen(false)
                }}
              >
                <div className="flex items-center justify-between">
                  <span>{p.name}</span>
                  {p.id !== 'all' && (
                    <span className="text-[9px] text-muted-foreground">{p.category}</span>
                  )}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-component: Sentiment Stats Row
   ═══════════════════════════════════════════════════════════════════ */

function SentimentStatsRow({
  positive,
  neutral,
  negative,
  total,
}: {
  positive: number
  neutral: number
  negative: number
  total: number
}) {
  const stats = [
    {
      icon: ThumbsUp,
      label: 'Positivos',
      count: positive,
      pct: total > 0 ? Math.round((positive / total) * 100) : 0,
      color: 'rgba(34,197,94,0.95)',
      bg: 'rgba(34,197,94,0.08)',
    },
    {
      icon: Minus,
      label: 'Neutros',
      count: neutral,
      pct: total > 0 ? Math.round((neutral / total) * 100) : 0,
      color: 'rgba(148,163,184,0.95)',
      bg: 'rgba(148,163,184,0.08)',
    },
    {
      icon: ThumbsDown,
      label: 'Negativos',
      count: negative,
      pct: total > 0 ? Math.round((negative / total) * 100) : 0,
      color: 'rgba(239,68,68,0.95)',
      bg: 'rgba(239,68,68,0.08)',
    },
  ]

  return (
    <div className="r39-stats-row grid grid-cols-3 gap-2 sm:gap-3">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          variants={r39FadeInVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: idx * 0.08 }}
          className="r39-stats-item rounded-xl p-3 text-center border border-border/40"
          style={{ backgroundColor: stat.bg }}
        >
          <stat.icon className="h-4 w-4 mx-auto mb-1" style={{ color: stat.color }} />
          <span className="block text-base font-extrabold" style={{ color: stat.color }}>
            {stat.count}
          </span>
          <span className="block text-[9px] font-semibold text-muted-foreground">{stat.label}</span>
          <span className="block text-[10px] font-bold mt-0.5" style={{ color: stat.color }}>
            {stat.pct}%
          </span>
        </motion.div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-component: Loading Skeleton
   ═══════════════════════════════════════════════════════════════════ */

function LoadingSkeleton() {
  return (
    <div className="r39-loading-skeleton space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <Skeleton className="h-8 w-28 rounded-xl" />
      </div>

      {/* Dashboard grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column skeleton */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          {/* Word cloud */}
          <Skeleton className="h-[180px] rounded-xl" />
          {/* Breakdown */}
          <Skeleton className="h-[200px] rounded-xl" />
        </div>

        {/* Right column skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-[140px] rounded-xl" />
          <Skeleton className="h-[180px] rounded-xl" />
          <Skeleton className="h-[140px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Main Component: ReviewSentimentAI
   ═══════════════════════════════════════════════════════════════════ */

export function ReviewSentimentAI() {
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  /* ── Fetch reviews (simulated) ── */
  const fetchReviews = useCallback(() => {
    setLoading(true)
    setRefreshing(true)

    // Simulate API call with timeout
    const timer = setTimeout(() => {
      try {
        // In production, this would be:
        // const res = await cachedFetch('/api/reviews')
        // setReviews(res.reviews || MOCK_REVIEWS)
        setReviews(MOCK_REVIEWS)
      } catch {
        setReviews(MOCK_REVIEWS)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const cleanup = fetchReviews()
    return cleanup
  }, [fetchReviews])

  /* ── Filter reviews by product ── */
  const filteredReviews = useMemo(() => {
    if (selectedProduct === 'all') return reviews
    return reviews.filter((r) => r.productId === selectedProduct)
  }, [reviews, selectedProduct])

  /* ── Computed data ── */
  const avgScore = useMemo(() => {
    if (filteredReviews.length === 0) return 0
    return (
      Math.round(
        (filteredReviews.reduce((s, r) => s + r.sentimentScore, 0) / filteredReviews.length) *
          100
      ) / 100
    )
  }, [filteredReviews])

  const positiveCount = useMemo(
    () => filteredReviews.filter((r) => r.sentimentScore >= 0.65).length,
    [filteredReviews]
  )
  const neutralCount = useMemo(
    () => filteredReviews.filter((r) => r.sentimentScore > 0.35 && r.sentimentScore < 0.65).length,
    [filteredReviews]
  )
  const negativeCount = useMemo(
    () => filteredReviews.filter((r) => r.sentimentScore <= 0.35).length,
    [filteredReviews]
  )

  const keywords = useMemo(() => r39BuildKeywords(filteredReviews), [filteredReviews])
  const trend = useMemo(() => r39BuildTrend(filteredReviews), [filteredReviews])
  const topics = useMemo(() => r39BuildTopics(filteredReviews), [filteredReviews])
  const highlights = useMemo(() => r39PickHighlights(filteredReviews), [filteredReviews])

  const animatedAvg = useCounter(!loading ? Math.round(avgScore * 100) : 0, 1400)

  /* ── Refresh handler ── */
  const handleRefresh = () => {
    fetchReviews()
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <section className="w-full">
        <LoadingSkeleton />
      </section>
    )
  }

  return (
    <section className="w-full">
      <motion.div
        className="r39-root space-y-5"
        variants={r39ContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ─── Section Header ─── */}
        <motion.div
          variants={r39CardVariants}
          className="flex items-center justify-between flex-wrap gap-2"
        >
          <div className="flex items-center gap-2.5">
            <motion.div
              className="r39-icon-wrap h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"
              animate={{ rotate: [0, 6, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}
            >
              <Brain className="h-4.5 w-4.5 text-white" />
            </motion.div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Análise de Sentimentos
              </h2>
              <p className="text-[11px] text-muted-foreground">
                IA analisando{' '}
                <span className="text-primary font-semibold">{filteredReviews.length}</span>{' '}
                avaliações
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ProductSelector
              products={MOCK_PRODUCTS}
              selected={selectedProduct}
              onChange={setSelectedProduct}
            />
            <motion.div whileTap={{ scale: 0.92 }}>
              <button
                onClick={handleRefresh}
                className="r39-refresh-btn h-9 w-9 rounded-xl border border-border/60 bg-card flex items-center justify-center hover:border-primary/40 transition-colors"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                disabled={refreshing}
              >
                <motion.div
                  animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                  transition={refreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
                >
                  <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                </motion.div>
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* ─── Dashboard Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ═══ Left Column (2/3) ═══ */}
          <div className="lg:col-span-2 space-y-4">
            {/* Sentiment Ring + Stats */}
            <motion.div variants={r39CardVariants}>
              <Card className="r39-dashboard-card overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-1.5 mb-4">
                    <Zap className="h-4 w-4 text-violet-500" />
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Painel Geral
                    </span>
                    <motion.div
                      className="ml-auto"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Badge
                        className="text-[8px] font-bold gap-0.5"
                        style={{
                          backgroundColor: 'rgba(139,92,246,0.12)',
                          color: 'rgba(139,92,246,0.9)',
                          borderColor: 'rgba(139,92,246,0.2)',
                        }}
                      >
                        <Sparkles className="h-2.5 w-2.5" />
                        IA
                      </Badge>
                    </motion.div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Ring */}
                    <div className="shrink-0">
                      <SentimentRing score={avgScore} animated={!loading} />
                    </div>

                    {/* Stats row + summary */}
                    <div className="flex-1 w-full space-y-4">
                      <SentimentStatsRow
                        positive={positiveCount}
                        neutral={neutralCount}
                        negative={negativeCount}
                        total={filteredReviews.length}
                      />

                      {/* Average score text */}
                      <div className="flex items-center gap-3 rounded-lg p-2.5" style={{ backgroundColor: 'rgba(139,92,246,0.05)' }}>
                        <span className="text-[10px] font-semibold text-muted-foreground">Média geral:</span>
                        <motion.span
                          className="text-sm font-extrabold text-violet-600"
                          key={animatedAvg}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                        >
                          {animatedAvg}/100
                        </motion.span>
                        {avgScore >= 0.65 ? (
                          <TrendingUp className="h-3.5 w-3.5 text-green-500 ml-auto" />
                        ) : avgScore <= 0.35 ? (
                          <TrendingDown className="h-3.5 w-3.5 text-red-500 ml-auto" />
                        ) : (
                          <Minus className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Word Cloud */}
            <motion.div variants={r39CardVariants}>
              <Card className="r39-wordcloud-card" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-violet-500" />
                    Nuvem de Palavras
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedProduct}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ type: 'spring' as const, stiffness: 200, damping: 22 }}
                    >
                      <WordCloud keywords={keywords} />
                    </motion.div>
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sentiment Breakdown */}
            <motion.div variants={r39CardVariants}>
              <Card className="r39-breakdown-card" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-violet-500" />
                    Análise Detalhada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedProduct}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <SentimentBreakdown keywords={keywords} />
                    </motion.div>
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* ═══ Right Column (1/3) ═══ */}
          <div className="space-y-4">
            {/* Trend Line */}
            <motion.div variants={r39CardVariants}>
              <Card className="r39-trend-card" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-violet-500" />
                    Tendência
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedProduct}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <TrendLine trend={trend} />
                    </motion.div>
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Review Highlights */}
            <motion.div variants={r39CardVariants}>
              <Card className="r39-highlights-card" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Quote className="h-4 w-4 text-violet-500" />
                    Destaques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedProduct}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ type: 'spring' as const, stiffness: 200, damping: 22 }}
                    >
                      <ReviewHighlights best={highlights.best} worst={highlights.worst} />
                    </motion.div>
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Topic Tags */}
            <motion.div variants={r39CardVariants}>
              <Card className="r39-topics-card" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Tag className="h-4 w-4 text-violet-500" />
                    Tópicos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedProduct}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <TopicTags topics={topics} />
                    </motion.div>
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* ─── Footer ─── */}
        <motion.div
          variants={r39FadeInVariants}
          className="r39-footer text-center py-3"
        >
          <p className="text-[10px] text-muted-foreground/60 flex items-center justify-center gap-1.5">
            <Sparkles className="h-3 w-3 text-violet-400/50" />
            Análise gerada por IA • Atualizado em tempo real
          </p>
        </motion.div>
      </motion.div>
    </section>
  )
}
