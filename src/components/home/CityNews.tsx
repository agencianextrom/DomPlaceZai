'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Newspaper, Globe, Clock, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useState, useEffect, useCallback } from 'react'

interface NewsItem {
  id: string
  title: string
  snippet: string
  source: string
  date: string
  url: string
}

const newsGradients = [
  'from-emerald-500/15 to-teal-500/5 dark:from-emerald-600/20 dark:to-teal-600/10',
  'from-amber-500/15 to-orange-500/5 dark:from-amber-600/20 dark:to-orange-600/10',
  'from-rose-500/15 to-pink-500/5 dark:from-rose-600/20 dark:to-pink-600/10',
  'from-teal-500/15 to-cyan-500/5 dark:from-teal-600/20 dark:to-cyan-600/10',
  'from-lime-500/15 to-green-500/5 dark:from-lime-600/20 dark:to-green-600/10',
]

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

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
            <Newspaper className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-gradient-primary bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
            Notícias de Dom Eliseu
          </span>
        </h2>
        <motion.button
          whileHover={{ x: 3 }}
          className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
        >
          Ver mais
          <ChevronRight className="h-3.5 w-3.5" />
        </motion.button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
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

      {/* News cards */}
      {!isLoading && news.length > 0 && (
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 snap-x snap-mandatory">
          {news.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`shrink-0 w-[280px] sm:w-[300px] snap-start rounded-xl bg-card border border-border/50 overflow-hidden cursor-pointer group hover:shadow-lg hover:border-primary/20 transition-all`}
              onClick={() => {
                if (item.url && item.url !== '#') {
                  window.open(item.url, '_blank', 'noopener,noreferrer')
                }
              }}
            >
              {/* Header gradient area */}
              <div className={`relative h-28 bg-gradient-to-br ${newsGradients[index % newsGradients.length]} flex items-center justify-center overflow-hidden`}>
                <div className="absolute inset-0 dot-pattern opacity-30" />
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative z-10"
                >
                  <Newspaper className="h-10 w-10 text-primary/40 group-hover:text-primary/60 transition-colors" />
                </motion.div>
                {/* Source badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                  <Globe className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[100px]">{item.source}</span>
                </div>
                {/* Date badge */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                  <Clock className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-medium text-primary">{item.date}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-3">
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
          ))}
        </div>
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
    </section>
  )
}
