'use client'

import { useState, useMemo } from 'react'
import { Heart, Share2, Grid3X3, List, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { ProductCard, formatBRL } from '@/components/product/ProductCard'
import { motion, AnimatePresence } from 'framer-motion'

interface FavoritesViewProps {
  products: ProductData[]
  onShareClick?: () => void
}

const categoryLabels: Record<string, string> = {
  FOOD: 'Alimentação', HEALTH: 'Saúde', AGRICULTURE: 'Agricultura', ELECTRONICS: 'Eletrônicos',
  BEAUTY: 'Beleza', ANIMALS: 'Animais', FASHION: 'Moda', SERVICES: 'Serviços',
  HOME_GARDEN: 'Casa & Jardim', EDUCATION: 'Educação', SPORTS: 'Esportes', OTHER: 'Outros',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
}

// Floating heart configurations for empty state
const floatingHearts = [
  { emoji: '❤️', size: 20, delay: 0, x: 15, yRange: 60, duration: 3 },
  { emoji: '💚', size: 16, delay: 0.8, x: 55, yRange: 50, duration: 3.5 },
  { emoji: '💜', size: 18, delay: 1.6, x: 80, yRange: 70, duration: 2.8 },
  { emoji: '🧡', size: 14, delay: 2.4, x: 35, yRange: 55, duration: 4 },
]

// Particle configurations for empty state
const floatingParticles = [
  { size: 4, delay: 0, x: 10, yRange: 80, duration: 5, color: 'rgba(239,68,68,0.4)' },
  { size: 3, delay: 1, x: 25, yRange: 70, duration: 4.5, color: 'rgba(236,72,153,0.3)' },
  { size: 5, delay: 2, x: 70, yRange: 90, duration: 6, color: 'rgba(239,68,68,0.3)' },
  { size: 3, delay: 3, x: 85, yRange: 65, duration: 5.5, color: 'rgba(168,85,247,0.3)' },
  { size: 4, delay: 1.5, x: 50, yRange: 75, duration: 4.8, color: 'rgba(251,146,60,0.3)' },
  { size: 2, delay: 2.5, x: 40, yRange: 85, duration: 5.2, color: 'rgba(239,68,68,0.25)' },
]

// Sort option labels
const sortLabels: Record<string, string> = {
  recent: 'Recentes', price_asc: 'Menor preço', price_desc: 'Maior preço', rating: 'Avaliação',
}

export function FavoritesView({ products, onShareClick }: FavoritesViewProps) {
  const { selectProduct, navigate } = useAppStore()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc' | 'rating'>('recent')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sortOpen, setSortOpen] = useState(false)

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category))
    return Array.from(cats)
  }, [products])

  const filtered = useMemo(() => {
    let result = activeCategory ? products.filter(p => p.category === activeCategory) : products
    switch (sortBy) {
      case 'price_asc': return [...result].sort((a, b) => a.price - b.price)
      case 'price_desc': return [...result].sort((a, b) => b.price - a.price)
      case 'rating': return [...result].sort((a, b) => b.rating - a.rating)
      default: return result
    }
  }, [products, activeCategory, sortBy])

  const sortOptions: Array<'recent' | 'price_asc' | 'price_desc' | 'rating'> = ['recent', 'price_asc', 'price_desc', 'rating']

  // Empty state with animated floating hearts, particles, and pulsing glow ring
  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-4 pt-4"
      >
        <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Favoritos
        </h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="r43-fav-empty-wrapper">
            {/* Animated orbiting ring */}
            <div className="r43-fav-empty-ring" />
            <div className="r43-fav-empty-ring-2" />
            {/* Pulsing glow ring behind heart */}
            <motion.div
              className="r39-fav-glow-ring absolute inset-0 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="r35-fav-empty-float"
            >
              <div className="r39-fav-empty-heart r43-fav-empty-heart-bg h-24 w-24 rounded-full flex items-center justify-center">
                <Heart className="h-12 w-12 text-red-400 dark:text-red-500 r39-fav-heart-icon" />
              </div>
            </motion.div>
            {/* Animated floating heart emojis with different speeds/paths */}
            {floatingHearts.map((heart, i) => (
              <motion.div
                key={`fh-${i}`}
                className="absolute pointer-events-none"
                style={{ left: `${heart.x}%`, top: `${10 + (i % 3) * 20}%` }}
                animate={{
                  y: [0, -heart.yRange, -heart.yRange * 1.5],
                  opacity: [0, 0.8, 0],
                  scale: [0.5, 1, 0.8],
                  rotate: [0, i * 25, i * 50],
                  x: [0, (i % 2 === 0 ? 1 : -1) * 20, (i % 2 === 0 ? 1 : -1) * 40],
                }}
                transition={{
                  duration: heart.duration,
                  delay: heart.delay,
                  repeat: Infinity,
                  repeatDelay: 1.5,
                  ease: 'easeOut',
                }}
              >
                <span style={{ fontSize: heart.size }}>{heart.emoji}</span>
              </motion.div>
            ))}
            {/* Floating particles */}
            {floatingParticles.map((particle, i) => (
              <motion.div
                key={`fp-${i}`}
                className="absolute pointer-events-none r39-fav-particle"
                style={{
                  left: `${particle.x}%`,
                  top: `${20 + (i % 4) * 15}%`,
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                }}
                animate={{
                  y: [0, -particle.yRange, -particle.yRange * 1.2],
                  opacity: [0, 0.7, 0],
                  scale: [0, 1, 0.5],
                  x: [0, (i % 2 === 0 ? 1 : -1) * 15, (i % 2 === 0 ? 1 : -1) * 30],
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: 'easeOut',
                }}
              />
            ))}
            {/* Decorative orbiting ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-3 rounded-full border border-dashed border-red-200/50 dark:border-red-800/30"
            />
          </div>
          <h2 className="text-lg font-bold mt-6 r43-fav-empty-title">Nenhum favorito ainda</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            Toque no ❤️ em produtos e lojas para salvá-los aqui e encontrá-los rapidamente
          </p>
          <motion.div whileTap={{ scale: 0.95 }} className="mt-6">
            <Button
              onClick={() => useAppStore.getState().navigate('home')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground btn-glow"
            >
              Explorar produtos
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 pt-4"
    >
      {/* Header with shimmer text and animated heart */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2 r62-heading-gradient">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="r39-fav-header-heart"
          >
            <Heart className="h-5 w-5 text-red-500 fill-red-500 r35-fav-heart" />
          </motion.div>
          <span className="r39-fav-shimmer-title">Favoritos</span>
          <motion.span
            key={filtered.length}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
            className="ml-1 inline-flex"
          >
            {/* Gradient animated badge on favorites count */}
            <motion.span
              className="relative overflow-hidden rounded-full"
              animate={{
                backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                backgroundImage: 'linear-gradient(90deg, rgba(239,68,68,0.15), rgba(236,72,153,0.15), rgba(239,68,68,0.15))',
                backgroundSize: '200% 100%',
              }}
            >
              <Badge variant="secondary" className="text-[10px] bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border-red-500/20 font-bold relative z-10 r35-fav-badge-pulse">
                {filtered.length}
              </Badge>
            </motion.span>
          </motion.span>
        </h1>
        <div className="flex items-center gap-1">
          {onShareClick && products.length > 0 && (
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 border-primary/30 hover:bg-primary/5"
                onClick={onShareClick}
              >
                <Share2 className="h-3.5 w-3.5 text-primary" />
                Compartilhar
              </Button>
            </motion.div>
          )}
          {/* Grid/List toggle */}
          <div className="flex bg-secondary/50 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`min-h-[44px] min-w-[44px] p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`min-h-[44px] min-w-[44px] p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          {/* Sort dropdown with smooth expand animation */}
          <div className="relative">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => setSortOpen(prev => !prev)}
              >
                <ArrowUpDown className="h-3 w-3" />
                {sortLabels[sortBy]}
              </Button>
            </motion.div>
            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="r39-fav-sort-dropdown r43-fav-sort-dropdown absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg overflow-hidden min-w-[140px]"
                >
                  {sortOptions.map((opt, i) => (
                    <motion.button
                      key={opt}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`r43-sort-option w-full text-left min-h-[44px] px-3 py-2 text-xs transition-colors hover:bg-accent hover:text-accent-foreground ${sortBy === opt ? 'bg-accent/50 font-semibold' : ''}`}
                      onClick={() => {
                        setSortBy(opt)
                        setSortOpen(false)
                      }}
                    >
                      {sortLabels[opt]}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            {/* Close dropdown on outside click */}
            {sortOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setSortOpen(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Category filter pills with shimmer overlay and breathing glow ring */}
      {categories.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 overflow-x-auto hide-scrollbar pb-3 mb-2"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(null)}
            className={`r39-fav-pill r43-fav-pill shrink-0 min-h-[44px] px-3 py-1.5 rounded-full text-xs font-medium border transition-all relative overflow-hidden ${
              !activeCategory
                ? 'bg-primary text-primary-foreground border-primary r43-fav-pill-active'
                : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
            }`}
          >
            {!activeCategory && (
              <>
                <motion.span
                  className="r39-fav-pill-shimmer absolute inset-0 rounded-full"
                  animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', backgroundSize: '200% 100%' }}
                />
                <motion.span
                  className="r39-fav-pill-glow absolute inset-0 rounded-full"
                  animate={{ boxShadow: ['0 0 0 0 rgba(255,255,255,0)', '0 0 8px 2px rgba(255,255,255,0.15)', '0 0 0 0 rgba(255,255,255,0)'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
              </>
            )}
            <span className="relative z-10">Todos ({products.length})</span>
          </motion.button>
          {categories.map((cat, i) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 + i * 0.04 }}
              className={`r39-fav-pill r43-fav-pill shrink-0 min-h-[44px] px-3 py-1.5 rounded-full text-xs font-medium border transition-all relative overflow-hidden ${
                cat === activeCategory
                  ? 'bg-primary text-primary-foreground border-primary r43-fav-pill-active'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {cat === activeCategory && (
                <>
                  <motion.span
                    className="r39-fav-pill-shimmer absolute inset-0 rounded-full"
                    animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', backgroundSize: '200% 100%' }}
                  />
                  <motion.span
                    className="r39-fav-pill-glow absolute inset-0 rounded-full"
                    animate={{ boxShadow: ['0 0 0 0 rgba(255,255,255,0)', '0 0 8px 2px rgba(255,255,255,0.15)', '0 0 0 0 rgba(255,255,255,0)'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </>
              )}
              <span className="relative z-10">{categoryLabels[cat] || cat} ({products.filter(p => p.category === cat).length})</span>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Products grid with staggered entrance and smooth layout transitions */}
      {filtered.length > 0 ? (
        viewMode === 'grid' ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={`grid-${activeCategory || 'all'}-${sortBy}`}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  variants={itemVariants}
                  whileHover={{ y: -4, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  layout
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.2 } }}
                  className="r35-fav-card r39-fav-grid-card r43-fav-grid-card r43-fav-card-shine rounded-xl r60-card-enter"
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={`list-${activeCategory || 'all'}-${sortBy}`}
            className="space-y-2"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -30, scale: 0.95, transition: { duration: 0.2 } }}
                  whileHover={{ y: -4, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-md transition-all cursor-pointer group r35-fav-card r39-fav-list-card r43-fav-list-card"
                  onClick={() => {
                    selectProduct(p)
                    navigate('product')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <span className="text-2xl">
                      {{ FOOD: '🍚', HEALTH: '💊', AGRICULTURE: '🌿', ELECTRONICS: '📱', BEAUTY: '💅', ANIMALS: '🐾' }[p.category] || '📦'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold line-clamp-1">{p.name}</p>
                    <span className="r43-store-badge mt-0.5">{p.storeName}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold r43-fav-price">{formatBRL(p.price)}</span>
                      {p.comparePrice && p.comparePrice > p.price && (
                        <span className="text-[10px] r43-fav-compare-price">{formatBRL(p.comparePrice)}</span>
                      )}
                    </div>
                  </div>
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    className="shrink-0 r43-fav-heart-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    <Heart className="h-4 w-4 text-red-500 fill-red-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 text-muted-foreground"
        >
          <p className="font-medium">Nenhum produto nesta categoria</p>
          <button
            onClick={() => setActiveCategory(null)}
            className="text-sm text-primary hover:underline mt-1"
          >
            Ver todos os favoritos
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
