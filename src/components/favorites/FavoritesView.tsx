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
    transition: { staggerChildren: 0.06 },
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

export function FavoritesView({ products, onShareClick }: FavoritesViewProps) {
  const { selectProduct, navigate } = useAppStore()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc' | 'rating'>('recent')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

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

  // Empty state with animated floating hearts
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
          <div className="relative">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="r35-fav-empty-float"
            >
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-red-100 to-rose-200 dark:from-red-900/20 dark:to-rose-800/20 flex items-center justify-center">
                <Heart className="h-12 w-12 text-red-300 dark:text-red-700" />
              </div>
            </motion.div>
            {/* Animated floating heart emojis with different speeds/paths */}
            {floatingHearts.map((heart, i) => (
              <motion.div
                key={i}
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
            {/* Decorative orbiting ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-3 rounded-full border border-dashed border-red-200/50 dark:border-red-800/30"
            />
          </div>
          <h2 className="text-lg font-bold mt-6">Nenhum favorito ainda</h2>
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500 fill-red-500 r35-fav-heart" />
          Favoritos
          <motion.span
            key={filtered.length}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
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
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          {/* Sort */}
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => {
            const order: Array<'recent' | 'price_asc' | 'price_desc' | 'rating'> = ['recent', 'price_asc', 'price_desc', 'rating']
            const idx = order.indexOf(sortBy)
            setSortBy(order[(idx + 1) % order.length])
          }}>
            <ArrowUpDown className="h-3 w-3" />
            {{ recent: 'Recentes', price_asc: 'Menor preço', price_desc: 'Maior preço', rating: 'Avaliação' }[sortBy]}
          </Button>
        </div>
      </div>

      {/* Category filter pills with shimmer overlay animation */}
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
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all relative overflow-hidden ${
              !activeCategory
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
            }`}
          >
            {!activeCategory && (
              <motion.span
                className="absolute inset-0 rounded-full"
                animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', backgroundSize: '200% 100%' }}
              />
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
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all relative overflow-hidden ${
                cat === activeCategory
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {cat === activeCategory && (
                <motion.span
                  className="absolute inset-0 rounded-full"
                  animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', backgroundSize: '200% 100%' }}
                />
              )}
              <span className="relative z-10">{categoryLabels[cat] || cat} ({products.filter(p => p.category === cat).length})</span>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Products grid with staggered entrance */}
      {filtered.length > 0 ? (
        viewMode === 'grid' ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  variants={itemVariants}
                  whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
                  layout
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="r35-fav-card"
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
            className="space-y-2"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -30 }}
                  whileHover={{ y: -3, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-md transition-all cursor-pointer group r35-fav-card"
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
                    <p className="text-xs text-muted-foreground">{p.storeName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-primary">{formatBRL(p.price)}</span>
                      {p.comparePrice && p.comparePrice > p.price && (
                        <span className="text-[10px] text-muted-foreground line-through">{formatBRL(p.comparePrice)}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-medium">Nenhum produto nesta categoria</p>
          <button
            onClick={() => setActiveCategory(null)}
            className="text-sm text-primary hover:underline mt-1"
          >
            Ver todos os favoritos
          </button>
        </div>
      )}
    </motion.div>
  )
}
