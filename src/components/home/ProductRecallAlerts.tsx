'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, ShieldCheck, ChevronDown, ChevronUp, Store, Calendar, Hash, AlertTriangle, Info, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */
type Severity = 'Critical' | 'Warning' | 'Info'

interface RecallItem {
  id: string
  productName: string
  batchNumber: string
  reason: string
  severity: Severity
  date: string
  storeName: string
  details: string
}

type FilterType = 'all' | 'Critical' | 'Warning' | 'Info'

/* ═══════════════════════════════════════════════════════════════
   Severity Config
   ═══════════════════════════════════════════════════════════════ */
const SEVERITY_CONFIG: Record<Severity, {
  label: string
  borderColor: string
  bgColor: string
  textColor: string
  iconColor: string
  badgeBg: string
  badgeBorder: string
  hex: string
}> = {
  Critical: {
    label: 'Crítico',
    borderColor: 'border-l-red-500 dark:border-l-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    textColor: 'text-red-700 dark:text-red-300',
    iconColor: 'text-red-500 dark:text-red-400',
    badgeBg: 'bg-red-100 dark:bg-red-900/40',
    badgeBorder: 'border-red-200/60 dark:border-red-800/40',
    hex: '#ef4444',
  },
  Warning: {
    label: 'Aviso',
    borderColor: 'border-l-amber-500 dark:border-l-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    textColor: 'text-amber-700 dark:text-amber-300',
    iconColor: 'text-amber-500 dark:text-amber-400',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/40',
    badgeBorder: 'border-amber-200/60 dark:border-amber-800/40',
    hex: '#f59e0b',
  },
  Info: {
    label: 'Informativo',
    borderColor: 'border-l-sky-500 dark:border-l-sky-400',
    bgColor: 'bg-sky-50 dark:bg-sky-950/30',
    textColor: 'text-sky-700 dark:text-sky-300',
    iconColor: 'text-sky-500 dark:text-sky-400',
    badgeBg: 'bg-sky-100 dark:bg-sky-900/40',
    badgeBorder: 'border-sky-200/60 dark:border-sky-800/40',
    hex: '#0ea5e9',
  },
}

/* ═══════════════════════════════════════════════════════════════
   Mock Data
   ═══════════════════════════════════════════════════════════════ */
const MOCK_RECALLS: RecallItem[] = [
  {
    id: 'recall-001',
    productName: 'Leite Integral UHT — 1L',
    batchNumber: 'Lote: BR-2024-7832',
    reason: 'Possível contaminação por Listeria monocytogenes. Produto pode estar impróprio para consumo.',
    severity: 'Critical',
    date: '10 Jan 2025',
    storeName: 'Supermercado Bom Preço',
    details: 'A ANVISA identificou a presença de Listeria monocytogenes em amostras colhidas durante inspeção de rotina. Recomenda-se que consumidores que adquiriram o produto com o lote indicado não o consumam e devolvam ao ponto de venda. Sintomas podem incluir febre, dor de cabeça e náuseas. Pessoas imunossuprimidas devem buscar orientação médica.',
  },
  {
    id: 'recall-002',
    productName: 'Brinquedo Educativo Bloquinhos',
    batchNumber: 'Lote: BK-3891-X',
    reason: 'Peças soltas com risco de engasgo para crianças menores de 3 anos.',
    severity: 'Critical',
    date: '08 Jan 2025',
    storeName: 'Loja Mundo Infantil',
    details: 'O fabricante identificou que algumas unidades do lote BK-3891-X possuem peças que podem se soltar facilmente, representando risco de asfixia para crianças menores de 36 meses. Produto não atende à norma NBR 14614. Devolução com reembolso integral em qualquer loja da rede.',
  },
  {
    id: 'recall-003',
    productName: 'Cereal Matinal Granola Mix',
    batchNumber: 'Lote: GR-2024-5541',
    reason: 'Rótulo indevido: contém amendoim não declarado na lista de ingredientes.',
    severity: 'Warning',
    date: '05 Jan 2025',
    storeName: 'Mercado Central Express',
    details: 'Após análise laboratorial, constatou-se a presença de traços de amendoim em produto cujo rótulo não informava esse alérgeno. Consumidores alérgicos a amendoim devem evitar o consumo. O fabricante está atualizando os rótulos e recolhendo as unidades afetadas.',
  },
  {
    id: 'recall-004',
    productName: 'Suplemento Vitamínico Cápsulas',
    batchNumber: 'Lote: VS-0920-A',
    reason: 'Concentração de vitamina D acima do especificado — 2x a dose indicada.',
    severity: 'Warning',
    date: '03 Jan 2025',
    storeName: 'Farmácia SaúdeTotal',
    details: 'Lote VS-0920-A apresenta concentração de vitamina D3 equivalente ao dobro do declarado no rótulo. Consumo prolongado em doses elevadas pode causar hipercalcemia. Recomenda-se interromper o uso e procurar orientação farmacêutica para troca do produto.',
  },
  {
    id: 'recall-005',
    productName: 'Tinta Escolar Aquarela Kit 12 Cores',
    batchNumber: 'Lote: AQ-7720',
    reason: 'Atualização de certificação INMETRO. Produto seguro, mas etiqueta substituída.',
    severity: 'Info',
    date: '01 Jan 2025',
    storeName: 'Papelaria Criativa',
    details: 'O lote AQ-7720 teve seu certificado INMETRO renovado com nova numeração. O produto é totalmente seguro e não apresenta riscos ao consumidor. Esta notificação é meramente informativa para rastreamento de lotes. Não é necessário devolver ou trocar o produto.',
  },
]

/* ═══════════════════════════════════════════════════════════════
   localStorage helpers
   ═══════════════════════════════════════════════════════════════ */
const STORAGE_KEY = 'r39-acknowledged-recalls'

function loadAcknowledged(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveAcknowledged(ids: string[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // ignore
  }
}

/* ═══════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════ */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, x: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 280, damping: 24 },
  },
  exit: {
    opacity: 0,
    x: -60,
    scale: 0.9,
    transition: { duration: 0.35, ease: 'easeIn' as const },
  },
}

const filterVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
  },
}

/* ═══════════════════════════════════════════════════════════════
   AnimatedShieldIcon — pulsing shield in header
   ═══════════════════════════════════════════════════════════════ */
function AnimatedShieldIcon() {
  return (
    <motion.div
      className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center shadow-md"
      animate={{ rotate: [0, 4, -4, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
    >
      <ShieldAlert className="h-4.5 w-4.5 text-white relative z-10" />
      <motion.div
        className="absolute inset-0 rounded-lg"
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(239,68,68,0.35)',
            '0 0 0 6px rgba(239,68,68,0)',
            '0 0 0 0 rgba(239,68,68,0)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
      />
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SeverityIcon — returns the appropriate icon per severity
   ═══════════════════════════════════════════════════════════════ */
function SeverityIcon({ severity }: { severity: Severity }) {
  const cfg = SEVERITY_CONFIG[severity]
  if (severity === 'Critical') {
    return (
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute h-3 w-3 rounded-full"
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(239,68,68,0.6)',
              '0 0 0 5px rgba(239,68,68,0)',
              '0 0 0 0 rgba(239,68,68,0)',
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
        />
        <X className={`h-3.5 w-3.5 ${cfg.iconColor} relative z-10`} />
      </div>
    )
  }
  if (severity === 'Warning') {
    return <AlertTriangle className={`h-3.5 w-3.5 ${cfg.iconColor}`} />
  }
  return <Info className={`h-3.5 w-3.5 ${cfg.iconColor}`} />
}

/* ═══════════════════════════════════════════════════════════════
   PulsingDot — pulsing dot for critical alerts
   ═══════════════════════════════════════════════════════════════ */
function PulsingDot({ color }: { color: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full opacity-75"
        animate={{
          scale: [1, 1.8],
          opacity: [0.7, 0],
        }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' as const }}
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex rounded-full h-2.5 w-2.5"
        style={{ backgroundColor: color }}
      />
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════════
   UnreadBadge — count badge with pulse
   ═══════════════════════════════════════════════════════════════ */
function UnreadBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <motion.span
      key={count}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
      className="relative flex items-center justify-center ml-2"
    >
      <span className="r39-badge-pulse inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full text-[10px] font-bold bg-red-500 text-white">
        {count}
      </span>
      <motion.span
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(239,68,68,0.5)',
            '0 0 0 5px rgba(239,68,68,0)',
            '0 0 0 0 rgba(239,68,68,0)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
      />
    </motion.span>
  )
}

/* ═══════════════════════════════════════════════════════════════
   FilterPills — Todos, Críticos, Avisos, Informativos
   ═══════════════════════════════════════════════════════════════ */
const FILTER_OPTIONS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'Critical', label: 'Críticos' },
  { key: 'Warning', label: 'Avisos' },
  { key: 'Info', label: 'Informativos' },
]

function FilterPills({
  active,
  onChange,
  counts,
}: {
  active: FilterType
  onChange: (f: FilterType) => void
  counts: Record<FilterType, number>
}) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-0.5">
      {FILTER_OPTIONS.map((opt) => {
        const isActive = active === opt.key
        const count = counts[opt.key]
        return (
          <motion.button
            key={opt.key}
            variants={filterVariants}
            onClick={() => onChange(opt.key)}
            className={`
              r39-filter-pill
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold
              border transition-colors shrink-0 whitespace-nowrap
              ${isActive
                ? 'bg-foreground text-background border-foreground shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground'
              }
            `}
          >
            {opt.label}
            {count > 0 && (
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-background/20 text-background'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {count}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   RecallCard — individual recall alert card
   ═══════════════════════════════════════════════════════════════ */
function RecallCard({
  recall,
  onAcknowledge,
}: {
  recall: RecallItem
  onAcknowledge: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const cfg = SEVERITY_CONFIG[recall.severity]

  return (
    <motion.div
      variants={cardVariants}
      layout
      className={`
        r39-recall-card glass-card rounded-xl overflow-hidden
        border-l-4 ${cfg.borderColor}
        transition-shadow duration-200 hover:shadow-md
      `}
    >
      <div className={`p-3.5 ${cfg.bgColor}`}>
        {/* Top row: severity badge + date + pulsing dot */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {recall.severity === 'Critical' && <PulsingDot color={cfg.hex} />}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.badgeBg} ${cfg.textColor} ${cfg.badgeBorder}`}
            >
              <SeverityIcon severity={recall.severity} />
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {recall.date}
          </div>
        </div>

        {/* Product name + store */}
        <h4 className={`text-sm font-bold ${cfg.textColor} leading-tight`}>
          {recall.productName}
        </h4>

        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Store className="h-3 w-3" />
            <span>{recall.storeName}</span>
          </div>
          <span className="text-muted-foreground/40">·</span>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Hash className="h-3 w-3" />
            <span>{recall.batchNumber}</span>
          </div>
        </div>

        {/* Reason */}
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">
          {recall.reason}
        </p>

        {/* Expand/Collapse toggle */}
        <motion.button
          onClick={() => setExpanded((prev) => !prev)}
          className="flex items-center gap-1 mt-2 text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors"
          whileTap={{ scale: 0.97 }}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Menos detalhes
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              Ver detalhes
            </>
          )}
        </motion.button>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' as const }}
              className="overflow-hidden"
            >
              <div className="mt-2 pt-2 border-t border-border/50">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {recall.details}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Acknowledge button */}
        <div className="mt-3 flex justify-end">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="inline-flex"
          >
            <button
              onClick={() => onAcknowledge(recall.id)}
              className={`
                r39-acknowledge-btn
                inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg
                text-[11px] font-semibold transition-colors
                bg-secondary/80 hover:bg-secondary text-foreground
                border border-border/60 hover:border-primary/30
              `}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Estou ciente
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   EmptyState
   ═══════════════════════════════════════════════════════════════ */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex flex-col items-center justify-center py-12 text-center r39-empty-state"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
        className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mb-4"
      >
        <ShieldCheck className="h-7 w-7 text-emerald-500" />
      </motion.div>
      <h3 className="text-sm font-bold text-foreground">
        ✅ Todos os alertas foram verificados
      </h3>
      <p className="text-xs text-muted-foreground mt-1.5 max-w-xs">
        Não há novos alertas de recall no momento. Fique atento para atualizações futuras.
      </p>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT — ProductRecallAlerts
   ═══════════════════════════════════════════════════════════════ */
export function ProductRecallAlerts() {
  const [acknowledgedIds, setAcknowledgedIds] = useState<string[]>(() => loadAcknowledged())
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const hasMountedRef = useRef(false)

  // Persist to localStorage whenever acknowledgedIds changes (skip initial mount)
  useEffect(() => {
    if (hasMountedRef.current) {
      saveAcknowledged(acknowledgedIds)
    }
    hasMountedRef.current = true
  }, [acknowledgedIds])

  // Acknowledge handler
  const handleAcknowledge = useCallback((id: string) => {
    setAcknowledgedIds((prev) => [...prev, id])
  }, [])

  // Filtered recalls
  const visibleRecalls = useMemo(() => {
    const unacked = MOCK_RECALLS.filter((r) => !acknowledgedIds.includes(r.id))
    if (activeFilter === 'all') return unacked
    return unacked.filter((r) => r.severity === activeFilter)
  }, [acknowledgedIds, activeFilter])

  // Counts per filter (based on unacknowledged)
  const filterCounts = useMemo(() => {
    const unacked = MOCK_RECALLS.filter((r) => !acknowledgedIds.includes(r.id))
    return {
      all: unacked.length,
      Critical: unacked.filter((r) => r.severity === 'Critical').length,
      Warning: unacked.filter((r) => r.severity === 'Warning').length,
      Info: unacked.filter((r) => r.severity === 'Info').length,
    }
  }, [acknowledgedIds])

  const allDismissed = MOCK_RECALLS.every((r) => acknowledgedIds.includes(r.id))

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' as const }}
      className="space-y-4"
    >
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AnimatedShieldIcon />
          <div>
            <h2 className="text-base font-bold flex items-center">
              Alertas de Recall
              <UnreadBadge count={filterCounts.all} />
            </h2>
            <p className="text-[10px] text-muted-foreground">
              Avisos de segurança e recall de produtos
            </p>
          </div>
        </div>
        {!allDismissed && (
          <Badge
            variant="secondary"
            className="text-[10px] font-semibold bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/30"
          >
            {filterCounts.Critical > 0 ? `${filterCounts.Critical} crítico${filterCounts.Critical > 1 ? 's' : ''}` : 'Ativo'}
          </Badge>
        )}
      </div>

      {/* Filter pills */}
      {!allDismissed && (
        <FilterPills
          active={activeFilter}
          onChange={setActiveFilter}
          counts={filterCounts}
        />
      )}

      {/* Empty state when all dismissed */}
      {allDismissed && <EmptyState />}

      {/* Empty state for active filter with no results */}
      {!allDismissed && visibleRecalls.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-8 text-center"
        >
          <Info className="h-6 w-6 text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">
            Nenhum alerta nesta categoria
          </p>
        </motion.div>
      )}

      {/* Recall cards list */}
      {!allDismissed && visibleRecalls.length > 0 && (
        <motion.div
          className="space-y-3 r39-recall-container"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          <AnimatePresence mode="popLayout">
            {visibleRecalls.map((recall) => (
              <RecallCard
                key={recall.id}
                recall={recall}
                onAcknowledge={handleAcknowledge}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.section>
  )
}
