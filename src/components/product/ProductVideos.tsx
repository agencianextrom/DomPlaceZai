'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Clock,
  Film,
  Eye,
  X,
  Volume2,
  Maximize2,
  Pause,
  SkipForward,
  SkipBack,
  Loader2,
  Video,
  PackageOpen,
  BookOpen,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ProductData } from '@/store/useAppStore'
import { CategoryIcon } from './ProductCard'

/* ── Types ── */
interface VideoItem {
  id: string
  title: string
  category: 'product' | 'tutorial' | 'unboxing'
  thumbnail: string | null
  duration: string // "3:45"
  views: number
  date: string
}

/* ── Category config ── */
const videoCategories = [
  {
    key: 'product' as const,
    label: 'Vídeo do Produto',
    icon: Video,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
  },
  {
    key: 'tutorial' as const,
    label: 'Tutorial de Uso',
    icon: BookOpen,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200/50 dark:border-amber-800/30',
  },
  {
    key: 'unboxing' as const,
    label: 'PackageOpening',
    icon: PackageOpen,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    border: 'border-rose-200/50 dark:border-rose-800/30',
  },
]

/* ── Placeholder video generation based on product ── */
function generatePlaceholderVideos(product: ProductData): VideoItem[] {
  const category = product.category
  const baseName = product.name

  const videos: VideoItem[] = []

  // Product video
  videos.push({
    id: `${product.id}-main`,
    title: `${baseName} — Apresentação Completa`,
    category: 'product',
    thumbnail: product.images ? JSON.parse(product.images)[0] || null : null,
    duration: '2:30',
    views: Math.floor(Math.random() * 2000) + 200,
    date: '2 semanas atrás',
  })

  // Tutorial video
  if (category === 'FOOD' || category === 'HEALTH' || category === 'BEAUTY') {
    videos.push({
      id: `${product.id}-tutorial`,
      title: `Como Usar ${baseName} — Dicas e Truques`,
      category: 'tutorial',
      thumbnail: null,
      duration: `${Math.floor(Math.random() * 4) + 3}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      views: Math.floor(Math.random() * 800) + 100,
      date: '1 mês atrás',
    })
  }

  // PackageOpening video
  if (category === 'ELECTRONICS' || category === 'ANIMALS' || category === 'BEAUTY') {
    videos.push({
      id: `${product.id}-unboxing`,
      title: `PackageOpening ${baseName} — Primeiras Impressões`,
      category: 'unboxing',
      thumbnail: null,
      duration: `${Math.floor(Math.random() * 3) + 2}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      views: Math.floor(Math.random() * 500) + 50,
      date: '3 semanas atrás',
    })
  }

  // Additional product demo
  videos.push({
    id: `${product.id}-demo`,
    title: `${baseName} em Ação — Demonstração`,
    category: 'product',
    thumbnail: null,
    duration: `${Math.floor(Math.random() * 2) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    views: Math.floor(Math.random() * 300) + 80,
    date: '1 semana atrás',
  })

  // Tutorial for remaining
  if (category === 'AGRICULTURE' || category === 'FOOD') {
    videos.push({
      id: `${product.id}-tips`,
      title: `Dicas de Uso — ${baseName}`,
      category: 'tutorial',
      thumbnail: null,
      duration: `${Math.floor(Math.random() * 5) + 4}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      views: Math.floor(Math.random() * 400) + 60,
      date: '2 meses atrás',
    })
  }

  return videos
}

/* ── Animation variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const videoCardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
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

const playButtonVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 18,
      delay: 0.2,
    },
  },
}

const pulseGlowVariants = {
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(16, 185, 129, 0)',
      '0 0 0 8px rgba(16, 185, 129, 0.3)',
      '0 0 0 16px rgba(16, 185, 129, 0)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

const modalVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const modalContentVariants = {
  hidden: { scale: 0.9, opacity: 0, y: 20 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
  exit: { scale: 0.9, opacity: 0, y: 20, transition: { duration: 0.15 } },
}

const controlButtonVariants = {
  hidden: { scale: 0 },
  visible: (i: number) => ({
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 20,
      delay: 0.1 + i * 0.05,
    },
  }),
}

const shimmerVariants = {
  animate: {
    x: ['-100%', '100%'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
      repeatDelay: 1,
    },
  },
}

/* ── Empty State ── */
function EmptyVideoState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col items-center py-12 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4">
          <Video className="h-10 w-10 text-muted-foreground/40" />
        </div>
      </motion.div>
      <h3 className="text-sm font-bold text-muted-foreground">Nenhum vídeo disponível</h3>
      <p className="text-xs text-muted-foreground/70 mt-1.5 max-w-[240px]">
        Este produto ainda não possui vídeos. Confira as fotos e descrições para saber mais!
      </p>

      {/* Decorative floating elements */}
      <div className="relative mt-4 w-full max-w-[200px]">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute pointer-events-none"
            style={{ left: `${10 + i * 20}%`, top: `${10 + (i % 3) * 25}%` }}
            animate={{
              y: [0, -20, -40],
              opacity: [0, 0.4, 0],
              scale: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              delay: i * 0.5,
              repeat: Infinity,
              repeatDelay: 1.5,
              ease: 'easeOut',
            }}
          >
            <Film className="h-3 w-3 text-muted-foreground/20" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

/* ── Video Thumbnail Card ── */
function VideoThumbnailCard({
  video,
  index,
  onPlay,
}: {
  video: VideoItem
  index: number
  onPlay: (video: VideoItem) => void
}) {
  const categoryConfig = videoCategories.find((c) => c.key === video.category)
  const gradientMap: Record<string, string> = {
    product: 'from-primary/10 to-emerald-500/10',
    tutorial: 'from-amber-500/10 to-orange-500/10',
    unboxing: 'from-rose-500/10 to-pink-500/10',
  }

  return (
    <motion.div
      variants={videoCardVariants}
      custom={index}
      whileHover={{
        y: -3,
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
      }}
      transition={{ type: 'spring' as const, stiffness: 320, damping: 24 }}
      className="r33-thumb-hover"
    >
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={() => onPlay(video)}
        className="cursor-pointer group"
      >
        <Card className="border-border/50 overflow-hidden hover:border-primary/20 transition-colors">
          {/* Thumbnail area */}
          <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
            {/* Placeholder content */}
            {video.thumbnail ? (
              <img
                src={video.thumbnail}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover opacity-80"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gradientMap[video.category] || 'from-muted to-muted/50'}`}
              >
                {/* Animated shimmer */}
                <motion.div
                  variants={shimmerVariants}
                  animate="animate"
                  className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                />
              </div>
            )}

            {/* Category icon in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                variants={pulseGlowVariants}
                animate="animate"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative r33-play-glow"
              >
                <div className="h-14 w-14 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center shadow-lg shadow-primary/30 transition-colors">
                  <Play className="h-6 w-6 text-white fill-white ml-1" />
                </div>
              </motion.div>
            </div>

            {/* Duration badge */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="absolute bottom-2 right-2"
            >
              <div className="h-6 px-2 rounded-md bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold flex items-center gap-1 tabular-nums r33-duration-badge">
                <Clock className="h-2.5 w-2.5" />
                {video.duration}
              </div>
            </motion.div>

            {/* Category badge */}
            {categoryConfig && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + index * 0.05 }}
                className="absolute top-2 left-2"
              >
                <Badge
                  variant="secondary"
                  className={`text-[9px] ${categoryConfig.bg} ${categoryConfig.border} border font-semibold gap-0.5`}
                >
                  <categoryConfig.icon className={`h-2.5 w-2.5 ${categoryConfig.color}`} />
                  {categoryConfig.label}
                </Badge>
              </motion.div>
            )}

            {/* Gradient overlay at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
          </div>

          <CardContent className="p-3">
            <h4 className="text-xs font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {video.title}
            </h4>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Eye className="h-3 w-3" />
                <span>{video.views.toLocaleString('pt-BR')} views</span>
              </div>
              <span className="text-[10px] text-muted-foreground/60">•</span>
              <span className="text-[10px] text-muted-foreground">{video.date}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

/* ── Video Player Modal ── */
function VideoPlayerModal({
  video,
  isOpen,
  onClose,
  product,
}: {
  video: VideoItem | null
  isOpen: boolean
  onClose: () => void
  product: ProductData
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Reset on video change
  const prevVideoIdRef = React.useRef<string | null>(null)
  useEffect(() => {
    if (video?.id !== prevVideoIdRef.current) {
      prevVideoIdRef.current = video?.id || null
      // Schedule state updates to avoid synchronous setState in effect
      queueMicrotask(() => {
        setIsPlaying(false)
        setProgress(0)
        setIsLoading(false)
      })
    }
  }, [video?.id])

  // Simulate progress
  useEffect(() => {
    if (!isPlaying || !isOpen) return
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false)
          return 0
        }
        return prev + 0.5
      })
    }, 100)
    return () => clearInterval(timer)
  }, [isPlaying, isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && video && (
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[640px] rounded-2xl overflow-hidden bg-card shadow-2xl"
          >
            {/* Close button */}
            <motion.button
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              onClick={onClose}
              className="absolute top-3 right-3 z-20 h-9 w-9 min-h-[44px] min-w-[44px] rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-white" />
            </motion.button>

            {/* Video area (mock player) */}
            <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50">
              {/* Placeholder content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 className="h-10 w-10 text-primary" />
                  </motion.div>
                ) : (
                  <>
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                      <CategoryIcon category={product.category} />
                    </div>
                    <p className="text-sm font-semibold text-foreground/80">{video.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Vídeo demonstrativo • {video.duration}
                    </p>

                    {/* Play overlay */}
                    {!isPlaying && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setIsLoading(true)
                          setTimeout(() => {
                            setIsLoading(false)
                            setIsPlaying(true)
                          }, 800)
                        }}
                        className="mt-4 h-16 w-16 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center shadow-xl shadow-primary/30"
                      >
                        <Play className="h-7 w-7 text-white fill-white ml-1" />
                      </motion.button>
                    )}
                  </>
                )}
              </div>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                <motion.div
                  className="h-full bg-primary"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>

            {/* Controls bar */}
            <div className="p-4">
              {/* Title and info */}
              <h3 className="text-sm font-bold">{video.title}</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant="secondary" className="text-[9px]">
                  {video.category === 'product'
                    ? 'Vídeo do Produto'
                    : video.category === 'tutorial'
                      ? 'Tutorial de Uso'
                      : 'PackageOpening'}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {video.views.toLocaleString('pt-BR')} visualizações
                </span>
              </div>

              <Separator className="my-3" />

              {/* Playback controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.button
                    custom={0}
                    variants={controlButtonVariants}
                    initial="hidden"
                    animate="visible"
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setProgress(Math.max(0, progress - 10))}
                    className="h-9 w-9 min-h-[44px] min-w-[44px] rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                  >
                    <SkipBack className="h-4 w-4" />
                  </motion.button>

                  <motion.button
                    custom={1}
                    variants={controlButtonVariants}
                    initial="hidden"
                    animate="visible"
                    whileTap={{ scale: 0.88 }}
                    onClick={() => {
                      if (isPlaying) setIsPlaying(false)
                      else {
                        setIsLoading(true)
                        setTimeout(() => {
                          setIsLoading(false)
                          setIsPlaying(true)
                        }, 500)
                      }
                    }}
                    className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 fill-primary-foreground ml-0.5" />
                    )}
                  </motion.button>

                  <motion.button
                    custom={2}
                    variants={controlButtonVariants}
                    initial="hidden"
                    animate="visible"
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setProgress(Math.min(100, progress + 10))}
                    className="h-9 w-9 min-h-[44px] min-w-[44px] rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                  >
                    <SkipForward className="h-4 w-4" />
                  </motion.button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Volume */}
                  <motion.button
                    custom={3}
                    variants={controlButtonVariants}
                    initial="hidden"
                    animate="visible"
                    whileTap={{ scale: 0.88 }}
                    className="h-9 w-9 min-h-[44px] min-w-[44px] rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                  >
                    <Volume2 className="h-4 w-4" />
                  </motion.button>

                  {/* Fullscreen */}
                  <motion.button
                    custom={4}
                    variants={controlButtonVariants}
                    initial="hidden"
                    animate="visible"
                    whileTap={{ scale: 0.88 }}
                    className="h-9 w-9 min-h-[44px] min-w-[44px] rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </motion.button>

                  {/* Time */}
                  <span className="text-[10px] text-muted-foreground tabular-nums font-medium">
                    {formatTimeFromProgress(progress, video.duration)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Helper: format time from progress percentage ── */
function formatTimeFromProgress(progress: number, totalDuration: string): string {
  const parts = totalDuration.split(':')
  const totalSeconds = (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0)
  const currentSeconds = Math.round((progress / 100) * totalSeconds)
  const mins = Math.floor(currentSeconds / 60)
  const secs = currentSeconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

/* ── Category Tabs with counts ── */
function CategoryTabs({
  activeCategory,
  onChange,
  videos,
}: {
  activeCategory: string
  onChange: (cat: string) => void
  videos: VideoItem[]
}) {
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: videos.length }
    videos.forEach((v) => {
      map[v.category] = (map[v.category] || 0) + 1
    })
    return map
  }, [videos])

  const tabs = [
    { key: 'all', label: 'Todos' },
    ...videoCategories.map((c) => ({ key: c.key, label: c.label })),
  ].filter((t) => counts[t.key] > 0)

  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
      {tabs.map((tab, i) => {
        const isActive = activeCategory === tab.key
        return (
          <motion.button
            key={tab.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 + i * 0.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(tab.key)}
            className={`relative shrink-0 px-3.5 py-2 rounded-full text-xs font-medium border transition-all ${
              isActive
                ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
            }`}
          >
            {tab.label}
            <span className={`ml-1 text-[10px] ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground/60'}`}>
              {counts[tab.key] || 0}
            </span>
            {isActive && (
              <motion.div
                layoutId="video-tab-active"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                style={{
                  boxShadow: '0 0 12px rgba(16, 185, 129, 0.3), 0 0 24px rgba(16, 185, 129, 0.15)',
                }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT — ProductVideos
   ═══════════════════════════════════════════════════ */
export function ProductVideos({ product }: { product: ProductData }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const videos = useMemo(() => generatePlaceholderVideos(product), [product])

  const filteredVideos = useMemo(() => {
    if (activeCategory === 'all') return videos
    return videos.filter((v) => v.category === activeCategory)
  }, [videos, activeCategory])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handlePlay = (video: VideoItem) => {
    setPlayingVideo(video)
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setTimeout(() => setPlayingVideo(null), 300)
  }

  // If no videos at all (shouldn't happen with our generation, but safety)
  if (videos.length === 0) {
    return (
      <section className="mt-6">
        <EmptyVideoState />
      </section>
    )
  }

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.4 }}
        className="mt-6"
      >
        {/* Section header */}
        <div className="flex items-center gap-2.5 mb-4">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-sm"
          >
            <Film className="h-4 w-4 text-white" />
          </motion.div>
          <div>
            <h2 className="text-base font-bold flex items-center gap-1.5 r33-video-shimmer">
              Vídeos
              <Sparkles className="h-4 w-4 text-rose-400" />
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {videos.length} {videos.length === 1 ? 'vídeo disponível' : 'vídeos disponíveis'} para {product.name}
            </p>
          </div>
        </div>

        {/* Category tabs */}
        <CategoryTabs
          activeCategory={activeCategory}
          onChange={setActiveCategory}
          videos={videos}
        />

        {/* Video grid */}
        <AnimatePresence mode="wait">
          {isLoaded ? (
            <motion.div
              key={activeCategory}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredVideos.map((video, index) => (
                <VideoThumbnailCard
                  key={video.id}
                  video={video}
                  index={index}
                  onPlay={handlePlay}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4"
            >
              {Array.from({ length: Math.min(filteredVideos.length, 4) }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-video rounded-xl" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2.5 w-1/2" />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No videos in selected category */}
        {filteredVideos.length === 0 && activeCategory !== 'all' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <p className="text-sm text-muted-foreground">
              Nenhum vídeo nesta categoria
            </p>
            <button
              onClick={() => setActiveCategory('all')}
              className="text-xs text-primary hover:underline mt-1"
            >
              Ver todos os vídeos
            </button>
          </motion.div>
        )}
      </motion.section>

      {/* Video player modal */}
      <VideoPlayerModal
        video={playingVideo}
        isOpen={isModalOpen}
        onClose={handleClose}
        product={product}
      />
    </>
  )
}
