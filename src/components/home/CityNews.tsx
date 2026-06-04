'use client'

import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ChevronRight, Newspaper, Globe, Clock, ExternalLink, Loader2, Sparkles, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useState, useEffect, useCallback, useRef } from 'react'

interface NewsItem {
  id: string
  title: string
  snippet: string
  source: string
  date: string
  url: string
  isRecent?: boolean
}

const newsGradients = [
  'from-emerald-500/15 to-teal-500/5 dark:from-emerald-600/20 dark:to-teal-600/10',
  'from-amber-500/15 to-orange-500/5 dark:from-amber-600/20 dark:to-orange-600/10',
  'from-rose-500/15 to-pink-500/5 dark:from-rose-600/20 dark:to-pink-600/10',
  'from-teal-500/15 to-cyan-500/5 dark:from-teal-600/20 dark:to-cyan-600/10',
  'from-lime-500/15 to-green-500/5 dark:from-lime-600/20 dark:to-green-600/10',
]

/* ── Section entrance animation variants ── */
const sectionVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      staggerChildren: 0.1,
    },
  },
} as const

/* ── Card entrance animation variants ── */
const cardVariants = {
  hidden: { opacity: 0, y: 30, x: 0 },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
} as const

/* ── "Nova" badge pulse keyframes ── */
const pulseRing = {
  scale: [1, 1.45, 1],
  opacity: [0.6, 0, 0.6],
}

/* ── Timestamp reveal variants ── */
const timestampVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.22, 0.61, 0.36, 1] as const,
    },
  },
} as const

function NewsCardSkeleton() {
  return (
    <div className="shrink-0 w-[280px] sm:w-[300px] rounded-xl bg-card border border-border/50 overflow-hidden">
      <div className="h-28">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      <div className="p-3 space-y-2.5">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-3 w-3/4 rounded" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-3 w-12 rounded" />
        </div>
      </div>
    </div>
  )
}

export function CityNews() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* Ref for scroll‑into‑view detection */
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-40px' })

  /* Ref for the horizontal scroll container */
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchNews = useCallback(async (pageNum: number, append = false) => {
    if (append) {
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
    }
    setError(null)

    try {
      const res = await fetch(`/api/news?page=${pageNum}&limit=5`)
      if (!res.ok) throw new Error('Erro ao carregar notícias')
      const data = await res.json()

      if (append) {
        setNews(prev => [...prev, ...data.news])
      } else {
        setNews(data.news)
      }
      setHasMore(data.hasMore)
    } catch {
      setError('Não foi possível carregar as notícias. Tente novamente.')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchNews(1)
  }, [fetchNews])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchNews(nextPage, true)
  }

  const handleRetry = () => {
    fetchNews(1)
  }

  /**
   * Determine if a news item counts as "recent" (published ≤ 24 h ago).
   * We naïvely check whether the date string contains "hora" or "agora".
   */
  const isRecent = (dateStr: string) =>
    /agora|\d+\s*hora/i.test(dateStr)

  return (
    <motion.section
      ref={sectionRef}
      variants={sectionVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      aria-label="Notícias da cidade"
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
            <Newspaper className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-gradient-primary bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent news-title-shimmer">
            Notícias de Dom Eliseu
          </span>
        </h2>
        <motion.button
          whileHover={{ x: 3 }}
          className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
          aria-label="Ver mais notícias"
        >
          <span>Ver mais</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </motion.button>
        {/* Atualizar button with spinning refresh icon */}
        <motion.button
          whileHover={{ scale: 1.05, rotate: 0 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRetry}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors group/btn"
          aria-label="Atualizar notícias"
        >
          <motion.span
            animate={{ rotate: isLoading ? 360 : 0 }}
            whileHover={{ rotate: 360 }}
            transition={{ duration: isLoading ? 0.8 : 0.5, repeat: isLoading ? Infinity : 0, ease: 'linear' as const }}
          >
            <RefreshCw className="h-3 w-3 transition-transform" />
          </motion.span>
          <span>Atualizar</span>
        </motion.button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 snap-x snap-mandatory scroll-smooth">
          {Array.from({ length: 3 }).map((_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && news.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <Newspaper className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 h-8 text-xs gap-1.5 border-primary/30 hover:bg-primary/5"
            onClick={handleRetry}
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {/* News cards — horizontal scroll with snap */}
      {!isLoading && news.length > 0 && (
        <motion.div
          variants={cardVariants}
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 snap-x snap-mandatory scroll-smooth"
        >
          {news.map((item, index) => {
            const showNova = isRecent(item.date)

            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1] as const,
                }}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                  boxShadow: '0 0 0 1px oklch(0.55 0.12 155 / 0.3), 0 12px 28px -6px oklch(0 0 0 / 0.15)',
                  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
                }}
                whileTap={{ scale: 0.98 }}
                className={`shrink-0 w-[280px] sm:w-[300px] snap-start rounded-xl bg-card border border-border/50 overflow-hidden cursor-pointer group news-card-hover relative`}
                onClick={() => {
                  if (item.url && item.url !== '#') {
                    window.open(item.url, '_blank', 'noopener,noreferrer')
                  }
                }}
              >
                {/* Header gradient area — image zoom on hover */}
                <div
                  className={`relative h-28 bg-gradient-to-br ${newsGradients[index % newsGradients.length]} flex items-center justify-center overflow-hidden`}
                >
                  {/* Background dot pattern */}
                  <div className="absolute inset-0 dot-pattern opacity-30" />

                  {/* Icon container — zoom on hover */}
                  <div className="relative z-10 transition-transform duration-500 ease-out group-hover:scale-125">
                    <Newspaper className="h-10 w-10 text-primary/40 group-hover:text-primary/60 transition-colors duration-300" />
                  </div>

                  {/* Source badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Globe className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[100px]">
                      {item.source}
                    </span>
                  </div>

                  {/* "Nova" badge — pulse animation for recent items */}
                  {showNova && (
                    <div className="absolute top-2 right-2 z-20">
                      {/* Expanding ring */}
                      <motion.span
                        className="absolute inset-0 rounded-full bg-primary/40"
                        animate={pulseRing}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                      {/* Badge itself */}
                      <motion.span
                        className="relative flex items-center gap-1 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: index * 0.08 + 0.3,
                          duration: 0.35,
                          ease: [0.34, 1.56, 0.64, 1] as const,
                        }}
                      >
                        <Sparkles className="h-2.5 w-2.5" />
                        Nova
                      </motion.span>
                    </div>
                  )}

                  {/* Date / timestamp — animated reveal with live dot */}
                  <motion.div
                    variants={timestampVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{
                      delay: index * 0.1 + 0.2,
                    }}
                    className="absolute bottom-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full"
                  >
                    {showNova && (
                    <span className="relative inline-flex items-center justify-center">
                      <span className="absolute h-2.5 w-2.5 rounded-full bg-emerald-400/60 news-live-dot-ring" />
                      <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 news-live-dot" />
                    </span>
                  )}
                    <Clock className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-medium text-primary">{item.date}</span>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-3">
                  {/* Animated gradient accent line */}
                  <div className="news-accent-line mb-2" />
                  <h3 className="text-sm font-semibold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                    {item.snippet}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-[10px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Ler mais
                    <ExternalLink className="h-2.5 w-2.5" />
                  </div>
                </div>
              </motion.article>
            )
          })}
        </motion.div>
      )}

      {/* Load more button */}
      {!isLoading && news.length > 0 && hasMore && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="h-9 px-6 text-xs font-medium gap-2 border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-colors"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                <Newspaper className="h-3.5 w-3.5" />
                Carregar mais notícias
              </>
            )}
          </Button>
        </div>
      )}
    </motion.section>
  )
}
