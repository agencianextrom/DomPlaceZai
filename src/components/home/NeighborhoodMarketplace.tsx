'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, MapPin, Star, MessageCircle, Eye, Plus, Grid3X3, List, ArrowUpDown, Megaphone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

type Category = 'Comida' | 'Roupas' | 'Eletrônicos' | 'Livros' | 'Plantas' | 'Serviços' | 'Artesanato' | 'Outros'

type SortMode = 'nearest' | 'rating' | 'recent'

type ViewMode = 'grid' | 'list'

interface NeighborListing {
  id: string
  sellerName: string
  sellerInitial: string
  distance: string
  rating: number
  category: Category
  title: string
  price: number
  gradient: string
  emoji: string
  createdAt: string
}

const categoryEmojis: Record<Category, string> = {
  Comida: '🍽️',
  Roupas: '👕',
  Eletrônicos: '📱',
  Livros: '📚',
  Plantas: '🌿',
  Serviços: '🔧',
  Artesanato: '🎨',
  Outros: '📦',
}

const mockListings: NeighborListing[] = [
  { id: 'n1', sellerName: 'Dona Maria', sellerInitial: 'M', distance: '120m', rating: 4.8, category: 'Comida', title: 'Bolo de Banana Caseiro', price: 18.00, gradient: 'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30', emoji: '🍰', createdAt: '2h atrás' },
  { id: 'n2', sellerName: 'João Pedro', sellerInitial: 'J', distance: '200m', rating: 4.5, category: 'Roupas', title: 'Camiseta Estampada', price: 35.00, gradient: 'from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-800/30', emoji: '👕', createdAt: '5h atrás' },
  { id: 'n3', sellerName: 'Ana Clara', sellerInitial: 'A', distance: '350m', rating: 4.9, category: 'Plantas', title: 'Muda de Suculenta', price: 12.00, gradient: 'from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30', emoji: '🌱', createdAt: '1h atrás' },
  { id: 'n4', sellerName: 'Carlos Eduardo', sellerInitial: 'C', distance: '500m', rating: 4.2, category: 'Eletrônicos', title: 'Carregador USB-C', price: 28.00, gradient: 'from-purple-100 to-violet-200 dark:from-purple-900/30 dark:to-violet-800/30', emoji: '🔌', createdAt: '3h atrás' },
  { id: 'n5', sellerName: 'Fernanda Lima', sellerInitial: 'F', distance: '180m', rating: 4.7, category: 'Livros', title: 'Livro Usado — Romance', price: 15.00, gradient: 'from-rose-100 to-pink-200 dark:from-rose-900/30 dark:to-pink-800/30', emoji: '📖', createdAt: '6h atrás' },
  { id: 'n6', sellerName: 'Lucas Santos', sellerInitial: 'L', distance: '300m', rating: 4.6, category: 'Artesanato', title: 'Colar de Sementes', price: 22.00, gradient: 'from-teal-100 to-cyan-200 dark:from-teal-900/30 dark:to-cyan-800/30', emoji: '📿', createdAt: '4h atrás' },
  { id: 'n7', sellerName: 'Patrícia Souza', sellerInitial: 'P', distance: '420m', rating: 4.4, category: 'Serviços', title: 'Aula de Costura', price: 40.00, gradient: 'from-sky-100 to-blue-200 dark:from-sky-900/30 dark:to-blue-800/30', emoji: '🧵', createdAt: '1h atrás' },
  { id: 'n8', sellerName: 'Roberto Alves', sellerInitial: 'R', distance: '250m', rating: 4.3, category: 'Outros', title: 'Caixa de Madeira Artesanal', price: 25.00, gradient: 'from-lime-100 to-green-200 dark:from-lime-900/30 dark:to-green-800/30', emoji: '🪵', createdAt: '8h atrás' },
]

const formatBRL = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

function NeighborhoodMarketplaceSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
      </div>
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function NeighborhoodMarketplace() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortMode>('nearest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [listings] = useState<NeighborListing[]>(mockListings)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 900)
    return () => clearTimeout(timer)
  }, [])

  const categories = useMemo(() => {
    const counts: Record<string, number> = { all: listings.length }
    listings.forEach(l => {
      counts[l.category] = (counts[l.category] || 0) + 1
    })
    return Object.entries(counts) as [string, number][]
  }, [listings])

  const filteredListings = useMemo(() => {
    const filtered = activeCategory === 'all' ? listings : listings.filter(l => l.category === activeCategory)

    const parseDist = (d: string) => parseInt(d)
    switch (sortBy) {
      case 'nearest':
        return [...filtered].sort((a, b) => parseDist(a.distance) - parseDist(b.distance))
      case 'rating':
        return [...filtered].sort((a, b) => b.rating - a.rating)
      case 'recent':
        return [...filtered].sort((a, b) => parseInt(a.createdAt) - parseInt(b.createdAt))
      default:
        return filtered
    }
  }, [listings, activeCategory, sortBy])

  const sortLabels: Record<SortMode, string> = {
    nearest: 'Mais próximos',
    rating: 'Melhor avaliados',
    recent: 'Recentes',
  }

  const sortOptions: SortMode[] = ['nearest', 'rating', 'recent']

  return (
    <div className="r62-card-lift bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }}
            className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md"
            style={{ boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}
          >
            <Users className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <motion.h3
              className="font-bold text-base r37-shimmer-text r62-heading-gradient"
              animate={{ backgroundPosition: ['0% 50%', '200% 50%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
              style={{ background: 'linear-gradient(90deg, #8b5cf6, #c4b5fd, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% 100%' }}
            >
              Vizinhos Vendem
            </motion.h3>
            <p className="text-xs text-muted-foreground">Marketplace comunitário do seu bairro</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="px-4 pb-4">
          <NeighborhoodMarketplaceSkeleton />
        </div>
      ) : (
        <>
          {/* CTA Banner — Anunciar Grátis */}
          <div className="px-4 pb-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
              whileHover={{ boxShadow: '0 4px 16px rgba(139,92,246,0.15)' }}
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 p-4 text-white cursor-pointer"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Megaphone className="h-5 w-5" />
                  <p className="font-bold text-sm">Anunciar Grátis</p>
                </div>
                <p className="text-xs opacity-90">Venda para seus vizinhos sem taxa. Cadastre agora!</p>
              </div>
              {/* Decorative circles */}
              <motion.div
                className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute right-8 -bottom-2 h-12 w-12 rounded-full bg-white/10"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              />
            </motion.div>
          </div>

          {/* Category Filter Pills */}
          <div className="px-4 pb-3">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {categories.map(([cat, count]) => (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(cat as Category | 'all')}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    activeCategory === cat
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary/50 text-muted-foreground border-border hover:border-primary/30'
                  }`}
                >
                  {cat === 'all' ? (
                    <Users className="h-3 w-3" />
                  ) : (
                    <span className="text-xs">{categoryEmojis[cat as Category] || '📦'}</span>
                  )}
                  {cat === 'all' ? 'Todos' : cat}
                  <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 h-4 ${
                    activeCategory === cat ? 'bg-white/20 text-white border-0' : ''
                  }`}>
                    {count}
                  </Badge>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Sort & View Toggle */}
          <div className="px-4 pb-3 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={() => {
                const idx = sortOptions.indexOf(sortBy)
                setSortBy(sortOptions[(idx + 1) % sortOptions.length])
              }}
            >
              <ArrowUpDown className="h-3 w-3" />
              {sortLabels[sortBy]}
            </Button>
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
          </div>

          {/* Listings */}
          <div className="px-4 pb-4">
            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.div
                  key="grid-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 gap-3"
                >
                  {filteredListings.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 16, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: idx * 0.06, type: 'spring' as const, stiffness: 300, damping: 25 }}
                      whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                      className="rounded-xl border border-border/50 overflow-hidden bg-card hover:border-primary/20 transition-colors r37-market-card"
                    >
                      {/* Product Image */}
                      <div className={`h-28 bg-gradient-to-br ${item.gradient} flex items-center justify-center relative`}>
                        <motion.span
                          className="text-4xl"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.3 }}
                        >
                          {item.emoji}
                        </motion.span>
                        <motion.div
                          animate={{ boxShadow: ['0 0 0 rgba(139,92,246,0)', '0 0 8px rgba(139,92,246,0.3)', '0 0 0 rgba(139,92,246,0)'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const, delay: idx * 0.2 }}
                          className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-white/80 dark:bg-black/40 rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                        >
                          <MapPin className="h-2.5 w-2.5 text-primary" />
                          {item.distance}
                        </motion.div>
                        <div className="absolute top-1.5 left-1.5">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm r37-seller-avatar-ring" style={{ boxShadow: '0 0 0 2px rgba(139,92,246,0.3), 0 0 8px rgba(139,92,246,0.2)' }}>
                            {item.sellerInitial}
                          </div>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-2.5">
                        <p className="text-xs font-semibold line-clamp-1">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-0.5">
                          <span className="font-medium">{item.sellerName}</span>
                          <span>· {categoryEmojis[item.category]}</span>
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <p className="text-sm font-bold text-primary">{formatBRL(item.price)}</p>
                          <div className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                            <span className="text-[10px] font-medium">{item.rating}</span>
                          </div>
                        </div>
                        <div className="flex gap-1.5 mt-2">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex-1 h-7 min-h-[44px] rounded-lg bg-secondary/80 text-[10px] font-medium flex items-center justify-center gap-1 text-muted-foreground hover:text-foreground"
                          >
                            <MessageCircle className="h-3 w-3" />
                            Mensagem
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex-1 h-7 min-h-[44px] rounded-lg bg-primary/90 text-[10px] font-medium flex items-center justify-center gap-1 text-primary-foreground"
                          >
                            <Eye className="h-3 w-3" />
                            Ver Produto
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="list-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {filteredListings.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05, type: 'spring' as const, stiffness: 300, damping: 25 }}
                      whileHover={{ x: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/20 transition-colors cursor-pointer r37-market-card"
                    >
                      <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0 relative`}>
                        <span className="text-2xl">{item.emoji}</span>
                        <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center text-[8px] font-bold border-2 border-background r37-seller-avatar-ring" style={{ boxShadow: '0 0 0 2px rgba(139,92,246,0.3)' }}>
                          {item.sellerInitial}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold line-clamp-1">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {item.sellerName} · {categoryEmojis[item.category]} · {item.distance}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-primary">{formatBRL(item.price)}</span>
                          <div className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                            <span className="text-[10px] font-medium">{item.rating}</span>
                          </div>
                          <span className="text-[9px] text-muted-foreground">{item.createdAt}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="h-7 w-7 rounded-full bg-secondary/80 flex items-center justify-center"
                          aria-label="Enviar mensagem"
                        >
                          <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center"
                          aria-label="Ver produto"
                        >
                          <Eye className="h-3.5 w-3.5 text-primary" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {filteredListings.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <p className="text-sm text-muted-foreground">Nenhum anúncio nesta categoria</p>
                <button
                  onClick={() => setActiveCategory('all')}
                  className="text-xs text-primary hover:underline mt-1"
                >
                  Ver todos os anúncios
                </button>
              </motion.div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="px-4 pb-4">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 4px 16px rgba(139,92,246,0.15)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md"
            >
              <Plus className="h-4 w-4" />
              Criar meu anúncio
            </motion.button>
          </div>
        </>
      )}
    </div>
  )
}
