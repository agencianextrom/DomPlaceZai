'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Clock, X, TrendingUp, Sparkles, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'

interface SearchHistoryProps {
  /** Max number of items to display (default: 8) */
  maxItems?: number
  /** Show trending section below */
  showTrending?: boolean
  /** Custom onSearch callback - if not provided, uses store's setSearchQuery */
  onSearch?: (query: string) => void
  /** Compact mode for inline display */
  compact?: boolean
}

const trendingTerms = [
  'Acai congelado',
  'Racao premium',
  'Pao de queijo',
  'Adubo NPK',
  'Vitamina C',
  'Corte feminino',
  'Celular Xiaomi',
  'Brinquedo pet',
]

const colors = [
  'bg-primary/10 text-primary border-primary/20',
  'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
]

function getColorForTerm(term: string): string {
  let hash = 0
  for (let i = 0; i < term.length; i++) {
    hash = term.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

// Parent stagger container variants
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

// Individual item stagger variants
const staggerItem = {
  hidden: { opacity: 0, y: 12, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
    },
  },
}

// Slide-out exit variant
const slideOutVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: {
    opacity: 0,
    x: -60,
    scale: 0.8,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
}

export function SearchHistory({
  maxItems = 8,
  showTrending = true,
  onSearch,
  compact = false,
}: SearchHistoryProps) {
  const { recentSearches, clearRecentSearches, setSearchQuery } = useAppStore()

  const handleSearch = (query: string) => {
    if (onSearch) {
      onSearch(query)
    } else {
      setSearchQuery(query)
    }
  }

  const handleClearAll = () => {
    clearRecentSearches()
  }

  const displaySearches = recentSearches.slice(0, maxItems)

  return (
    <div className="space-y-5">
      {/* Recent Searches Cloud */}
      {displaySearches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              {/* Clock icon with rotation animation */}
              <motion.div
                className="sh-clock-spin"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                <Clock className="h-4 w-4 text-muted-foreground" />
              </motion.div>
              <h3 className="text-sm font-semibold">
                {compact ? 'Recentes' : 'Historico de buscas'}
              </h3>
              <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                {recentSearches.length}
              </span>
            </div>
            {/* "Limpar" button with shake on hover */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2 sh-shake"
                onClick={handleClearAll}
              >
                <X className="h-3 w-3" />
                Limpar tudo
              </Button>
            </motion.div>
          </div>

          {/* Cloud layout - varied sizes with staggered entrance */}
          <motion.div
            className="flex flex-wrap gap-2"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {displaySearches.map((term, index) => {
                // Vary the visual weight based on index for cloud effect
                const sizeClass = index < 2
                  ? 'text-sm px-3.5 py-2 font-semibold'
                  : index < 5
                    ? 'text-xs px-3 py-1.5 font-medium'
                    : 'text-[11px] px-2.5 py-1.5 font-normal'

                const colorClass = getColorForTerm(term)

                return (
                  <motion.button
                    key={term}
                    variants={slideOutVariant}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    whileHover={{ scale: 1.08, y: -2, boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)' }}
                    whileTap={{ scale: 0.93 }}
                    transition={{
                      delay: index * 0.04,
                      duration: 0.3,
                      type: 'spring' as const,
                      stiffness: 300,
                      damping: 20,
                    }}
                    onClick={() => handleSearch(term)}
                    className={`
                      relative group
                      shrink-0 flex items-center gap-1.5 rounded-full border transition-colors
                      ${sizeClass} ${colorClass}
                      sh-item-glow
                    `}
                  >
                    {/* Only show clock icon on the first few */}
                    {index < 3 && (
                      <motion.span
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 }}
                      >
                        <Clock className="h-3 w-3 opacity-60" />
                      </motion.span>
                    )}
                    <span>{term}</span>

                    {/* Remove individual term on hover */}
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="ml-0.5 h-4 w-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Remove individual search (add to store if needed)
                      }}
                    >
                      <X className="h-2.5 w-2.5" />
                    </motion.span>
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}

      {/* Trending section */}
      {showTrending && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
        >
          <div className="flex items-center gap-1.5 mb-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <TrendingUp className="h-4 w-4 text-primary" />
            </motion.div>
            <h3 className="text-sm font-semibold">
              {compact ? 'Em alta' : 'Tendencias em Dom Eliseu'}
            </h3>
          </div>

          <motion.div
            className="space-y-1"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {trendingTerms.slice(0, compact ? 5 : 7).map((term, index) => (
              <motion.button
                key={term}
                variants={staggerItem}
                whileHover={{ x: 4, boxShadow: '0 2px 12px rgba(16, 185, 129, 0.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSearch(term)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-secondary/70 transition-colors group"
              >
                <span
                  className={`
                    w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0
                    ${index === 0
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm shadow-amber-500/20'
                      : index === 1
                        ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-sm'
                        : index === 2
                          ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-sm'
                          : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {index + 1}
                </span>
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm group-hover:text-primary transition-colors text-left">
                  {term}
                </span>
                {index < 3 && (
                  <motion.div className="ml-auto">
                    <Sparkles className="h-3 w-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Empty state with search emoji bounce */}
      {displaySearches.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-8 text-center"
        >
          <motion.div
            className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-3"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Search className="h-7 w-7 text-muted-foreground/40" />
          </motion.div>
          <p className="text-sm font-medium text-muted-foreground">
            Nenhuma busca recente
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Suas buscas aparecerao aqui
          </p>
        </motion.div>
      )}
    </div>
  )
}
