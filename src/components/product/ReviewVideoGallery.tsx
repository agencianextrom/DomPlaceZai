'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, ThumbsUp, Eye, Star, Camera, Video, ChevronDown, Clock, Heart, HelpCircle, Filter, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

/* ── Mock review video data ── */
interface VideoReview {
  id: string
  reviewerName: string
  reviewerInitial: string
  rating: number
  date: string
  title: string
  duration: string
  views: number
  likes: number
  helpful: number
  gradient: string
  emoji: string
}

const mockVideoReviews: VideoReview[] = [
  {
    id: 'v1',
    reviewerName: 'Maria Silva',
    reviewerInitial: 'M',
    rating: 5,
    date: '2024-12-15',
    title: 'Produto excelente, superou expectativas!',
    duration: '2:34',
    views: 1243,
    likes: 89,
    helpful: 45,
    gradient: 'from-rose-400 to-pink-500',
    emoji: '🎉',
  },
  {
    id: 'v2',
    reviewerName: 'João Santos',
    reviewerInitial: 'J',
    rating: 5,
    date: '2024-12-10',
    title: 'Vale muito a pena, recomendo!',
    duration: '1:45',
    views: 876,
    likes: 62,
    helpful: 38,
    gradient: 'from-emerald-400 to-teal-500',
    emoji: '👍',
  },
  {
    id: 'v3',
    reviewerName: 'Ana Oliveira',
    reviewerInitial: 'A',
    rating: 4,
    date: '2024-12-05',
    title: 'Boa qualidade, entrega rápida',
    duration: '3:12',
    views: 654,
    likes: 41,
    helpful: 22,
    gradient: 'from-amber-400 to-orange-500',
    emoji: '⭐',
  },
  {
    id: 'v4',
    reviewerName: 'Carlos Lima',
    reviewerInitial: 'C',
    rating: 5,
    date: '2024-11-28',
    title: 'Melhor compra do ano!',
    duration: '1:58',
    views: 2100,
    likes: 156,
    helpful: 78,
    gradient: 'from-violet-400 to-purple-500',
    emoji: '🏆',
  },
  {
    id: 'v5',
    reviewerName: 'Patricia Costa',
    reviewerInitial: 'P',
    rating: 4,
    date: '2024-11-20',
    title: 'Produto bom, embalagem ok',
    duration: '2:05',
    views: 432,
    likes: 28,
    helpful: 15,
    gradient: 'from-sky-400 to-blue-500',
    emoji: '📦',
  },
  {
    id: 'v6',
    reviewerName: 'Roberto Alves',
    reviewerInitial: 'R',
    rating: 3,
    date: '2024-11-15',
    title: 'Atende bem, mas podia melhorar',
    duration: '4:22',
    views: 287,
    likes: 15,
    helpful: 10,
    gradient: 'from-slate-400 to-gray-500',
    emoji: '🤔',
  },
  {
    id: 'v7',
    reviewerName: 'Fernanda Souza',
    reviewerInitial: 'F',
    rating: 5,
    date: '2024-11-10',
    title: 'Amei demais, já é a segunda compra!',
    duration: '1:30',
    views: 1543,
    likes: 98,
    helpful: 52,
    gradient: 'from-pink-400 to-rose-500',
    emoji: '😍',
  },
  {
    id: 'v8',
    reviewerName: 'Lucas Mendes',
    reviewerInitial: 'L',
    rating: 4,
    date: '2024-11-05',
    title: 'Produto consistente, preço justo',
    duration: '2:50',
    views: 765,
    likes: 55,
    helpful: 30,
    gradient: 'from-teal-400 to-cyan-500',
    emoji: '✅',
  },
]

/* ── Sort options ── */
type SortOption = 'recent' | 'relevant' | 'liked'
const sortLabels: Record<SortOption, string> = {
  recent: 'Mais recentes',
  relevant: 'Mais relevantes',
  liked: 'Mais curtidos',
}

/* ── Filter options ── */
type FilterOption = 'all' | '5' | '4' | '3+'
const filterLabels: Record<FilterOption, string> = {
  all: 'Todas',
  '5': '5★',
  '4': '4★',
  '3+': '3★+',
}

/* ── Empty state component ── */
function EmptyVideoState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="relative">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="h-20 w-20 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Camera className="h-10 w-10 text-muted-foreground/50" />
          </motion.div>
        </motion.div>
        {/* Orbiting ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-2 rounded-full border border-dashed border-border/30"
        />
      </div>
      <h3 className="text-sm font-bold mt-5">Nenhum vídeo de avaliação</h3>
      <p className="text-xs text-muted-foreground mt-1.5 max-w-xs">
        Seja o primeiro a gravar um vídeo avaliando este produto e ajude outros compradores!
      </p>
      <motion.div whileTap={{ scale: 0.95 }} className="mt-4">
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => toast.info('Funcionalidade em breve!')}>
          <Video className="h-3.5 w-3.5" />
          Gravar meu vídeo
        </Button>
      </motion.div>
    </motion.div>
  )
}

/* ── Skeleton loader ── */
function VideoGallerySkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-7 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-video rounded-xl" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main component ── */
export function ReviewVideoGallery() {
  const [isLoading, setIsLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(6)
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set())
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // Filter and sort videos
  const filteredVideos = useMemo(() => {
    let result = [...mockVideoReviews]

    // Filter by rating
    switch (filterBy) {
      case '5':
        result = result.filter((v) => v.rating === 5)
        break
      case '4':
        result = result.filter((v) => v.rating === 4)
        break
      case '3+':
        result = result.filter((v) => v.rating >= 3)
        break
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
      case 'relevant':
        result.sort((a, b) => b.helpful - a.helpful)
        break
      case 'liked':
        result.sort((a, b) => b.likes - a.likes)
        break
    }

    return result
  }, [sortBy, filterBy])

  const visibleVideos = filteredVideos.slice(0, visibleCount)
  const hasMore = visibleCount < filteredVideos.length

  // Toggle like
  const toggleLike = (videoId: string) => {
    setLikedVideos((prev) => {
      const next = new Set(prev)
      if (next.has(videoId)) {
        next.delete(videoId)
      } else {
        next.add(videoId)
      }
      return next
    })
  }

  // Cycle sort options
  const cycleSort = () => {
    const order: SortOption[] = ['recent', 'relevant', 'liked']
    const idx = order.indexOf(sortBy)
    setSortBy(order[(idx + 1) % order.length])
  }

  // Cycle filter options
  const cycleFilter = () => {
    const order: FilterOption[] = ['all', '5', '4', '3+']
    const idx = order.indexOf(filterBy)
    setFilterBy(order[(idx + 1) % order.length])
  }

  // Format view count
  const formatViews = (n: number): string => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
    return String(n)
  }

  // Format date
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Hoje'
    if (diffDays === 1) return 'Ontem'
    if (diffDays < 7) return `${diffDays} dias atrás`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} sem atrás`
    return `${Math.floor(diffDays / 30)} mê${Math.floor(diffDays / 30) > 1 ? 's' : 's'} atrás`
  }

  if (isLoading) {
    return <VideoGallerySkeleton />
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Video className="h-5 w-5 text-primary" />
          </motion.div>
          <h3 className="text-base font-bold">Vídeos de Avaliação</h3>
          <Badge variant="secondary" className="text-[10px] font-semibold">
            {filteredVideos.length} {filteredVideos.length === 1 ? 'vídeo' : 'vídeos'}
          </Badge>
        </div>

        {/* Sort & Filter controls */}
        <div className="flex items-center gap-1.5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={cycleFilter}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-border bg-card hover:bg-muted transition-colors"
          >
            <Filter className="h-3 w-3" />
            {filterLabels[filterBy]}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={cycleSort}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-border bg-card hover:bg-muted transition-colors"
          >
            <ArrowUpDown className="h-3 w-3" />
            {sortLabels[sortBy]}
          </motion.button>
        </div>
      </div>

      {/* Video grid */}
      {filteredVideos.length === 0 ? (
        <EmptyVideoState />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {visibleVideos.map((video, i) => {
              const isLiked = likedVideos.has(video.id)
              const isPlaying = playingVideo === video.id

              return (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring' as const, stiffness: 250, damping: 20 }}
                  className="group"
                >
                  {/* Video thumbnail */}
                  <div
                    className="relative aspect-video rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => {
                      if (isPlaying) {
                        setPlayingVideo(null)
                      } else {
                        setPlayingVideo(video.id)
                        toast.info(`Reproduzindo: ${video.title}`, {
                          description: 'Vídeo de avaliação do cliente',
                        })
                        setTimeout(() => setPlayingVideo(null), 3000)
                      }
                    }}
                  >
                    {/* Gradient thumbnail background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${video.gradient}`} />

                    {/* Emoji placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.span
                        className="text-4xl"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        {video.emoji}
                      </motion.span>
                    </div>

                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
                          isPlaying
                            ? 'bg-white/90 scale-110'
                            : 'bg-white/80 group-hover:bg-white/95 group-hover:scale-110'
                        }`}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isPlaying ? (
                          <div className="flex items-center gap-1">
                            <motion.div
                              className="w-1 h-4 bg-gray-800 rounded-sm"
                              animate={{ scaleY: [1, 0.4, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.1 }}
                            />
                            <motion.div
                              className="w-1 h-4 bg-gray-800 rounded-sm"
                              animate={{ scaleY: [0.4, 1, 0.4] }}
                              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.1 }}
                            />
                            <motion.div
                              className="w-1 h-4 bg-gray-800 rounded-sm"
                              animate={{ scaleY: [1, 0.6, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.1 }}
                            />
                          </div>
                        ) : (
                          <Play className="h-5 w-5 text-gray-800 ml-0.5" fill="currentColor" />
                        )}
                      </motion.div>

                      {/* Pulse ring around play button */}
                      {!isPlaying && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-white/40"
                          animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </div>

                    {/* Duration badge */}
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {video.duration}
                    </div>

                    {/* Playing indicator */}
                    <AnimatePresence>
                      {isPlaying && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-red-500 text-white text-[9px] font-bold flex items-center gap-0.5"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          AO VIVO
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Video info */}
                  <div className="mt-2 space-y-1">
                    {/* Reviewer info */}
                    <div className="flex items-center gap-2">
                      {/* Avatar initial */}
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-primary">{video.reviewerInitial}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{video.reviewerName}</p>
                        <p className="text-[10px] text-muted-foreground">{formatDate(video.date)}</p>
                      </div>
                    </div>

                    {/* Title */}
                    <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed">{video.title}</p>

                    {/* Rating stars */}
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          className={`h-3 w-3 ${
                            starIdx < video.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Eye className="h-3 w-3" />
                        {formatViews(video.views)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLike(video.id)
                        }}
                        className={`flex items-center gap-0.5 transition-colors ${
                          isLiked ? 'text-red-500' : 'hover:text-red-400'
                        }`}
                      >
                        <Heart
                          className={`h-3 w-3 ${isLiked ? 'fill-red-500' : ''}`}
                        />
                        {video.likes + (isLiked ? 1 : 0)}
                      </button>
                      <span className="flex items-center gap-0.5">
                        <HelpCircle className="h-3 w-3" />
                        {video.helpful} úteis
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Load more */}
          <AnimatePresence>
            {hasMore && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex justify-center pt-2"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleCount((c) => c + 6)}
                  className="gap-1.5 text-xs border-primary/30 hover:bg-primary/5"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                  Carregar mais
                  <Badge variant="secondary" className="text-[9px] h-4 px-1 ml-1">
                    +{filteredVideos.length - visibleCount}
                  </Badge>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
