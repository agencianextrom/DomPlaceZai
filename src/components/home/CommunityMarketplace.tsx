'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store,
  Plus,
  Heart,
  Star,
  Shield,
  Users,
  MapPin,
  Clock,
  ArrowRight,
  Eye,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

/* ───────────────────────── Animation Variants ───────────────────────── */

const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 220, damping: 20 },
  },
}
const cardV = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
}
const pressV = { scale: 1 }
const tapV = { scale: 0.93 }

/* ───────────────────────── Types & Data ───────────────────────── */

type CategoryKey = 'Todos' | 'Eletrônicos' | 'Móveis' | 'Roupas' | 'Brinquedos' | 'Livros'

interface Category {
  key: CategoryKey
  emoji: string
  label: string
}

const categories: Category[] = [
  { key: 'Todos', emoji: '🏪', label: 'Todos' },
  { key: 'Eletrônicos', emoji: '📱', label: 'Eletrônicos' },
  { key: 'Móveis', emoji: '🛋️', label: 'Móveis' },
  { key: 'Roupas', emoji: '👕', label: 'Roupas' },
  { key: 'Brinquedos', emoji: '🧸', label: 'Brinquedos' },
  { key: 'Livros', emoji: '📚', label: 'Livros' },
]

type ConditionBadge = 'Novo' | 'Seminovo' | 'Usado'
type ListingBadge = '🆕 Novo' | '🔥 Destaque' | '⚡ Troca'

interface ProductListing {
  id: string
  name: string
  emoji: string
  gradient: string
  seller: string
  sellerInitial: string
  price: number
  condition: ConditionBadge
  distance: string
  badge?: ListingBadge
  category: CategoryKey
  isFavorited: boolean
}

const mockListings: ProductListing[] = [
  {
    id: 'p1',
    name: 'iPhone 13 128GB',
    emoji: '📱',
    gradient: 'from-violet-100 to-purple-200',
    seller: 'Carlos Oliveira',
    sellerInitial: 'CO',
    price: 2890,
    condition: 'Seminovo',
    distance: '500m',
    badge: '🔥 Destaque',
    category: 'Eletrônicos',
    isFavorited: false,
  },
  {
    id: 'p2',
    name: 'Sofá Retrátil Cinza',
    emoji: '🛋️',
    gradient: 'from-amber-100 to-orange-200',
    seller: 'Maria Santos',
    sellerInitial: 'MS',
    price: 1200,
    condition: 'Usado',
    distance: '1.2km',
    badge: '⚡ Troca',
    category: 'Móveis',
    isFavorited: true,
  },
  {
    id: 'p3',
    name: 'Camiseta Nike M',
    emoji: '👕',
    gradient: 'from-sky-100 to-cyan-200',
    seller: 'Ana Costa',
    sellerInitial: 'AC',
    price: 89,
    condition: 'Novo',
    distance: '300m',
    badge: '🆕 Novo',
    category: 'Roupas',
    isFavorited: false,
  },
  {
    id: 'p4',
    name: 'LEGO Star Wars Set',
    emoji: '🧸',
    gradient: 'from-yellow-100 to-amber-200',
    seller: 'Pedro Lima',
    sellerInitial: 'PL',
    price: 350,
    condition: 'Novo',
    distance: '800m',
    badge: '🔥 Destaque',
    category: 'Brinquedos',
    isFavorited: false,
  },
  {
    id: 'p5',
    name: 'Kindle Paperwhite',
    emoji: '📖',
    gradient: 'from-emerald-100 to-teal-200',
    seller: 'Fernanda Rocha',
    sellerInitial: 'FR',
    price: 420,
    condition: 'Seminovo',
    distance: '1.5km',
    badge: undefined,
    category: 'Eletrônicos',
    isFavorited: true,
  },
  {
    id: 'p6',
    name: 'Mesa de Jantar 6 Lugares',
    emoji: '🪑',
    gradient: 'from-rose-100 to-pink-200',
    seller: 'João Ferreira',
    sellerInitial: 'JF',
    price: 750,
    condition: 'Usado',
    distance: '2.0km',
    badge: '⚡ Troca',
    category: 'Móveis',
    isFavorited: false,
  },
  {
    id: 'p7',
    name: 'Vestido Floral G',
    emoji: '👗',
    gradient: 'from-fuchsia-100 to-violet-200',
    seller: 'Lúcia Almeida',
    sellerInitial: 'LA',
    price: 65,
    condition: 'Novo',
    distance: '400m',
    badge: '🆕 Novo',
    category: 'Roupas',
    isFavorited: false,
  },
  {
    id: 'p8',
    name: 'Harry Potter Box Completo',
    emoji: '📚',
    gradient: 'from-indigo-100 to-purple-200',
    seller: 'Roberto Souza',
    sellerInitial: 'RS',
    price: 180,
    condition: 'Seminovo',
    distance: '900m',
    badge: '🔥 Destaque',
    category: 'Livros',
    isFavorited: false,
  },
]

interface RecentActivity {
  id: string
  emoji: string
  text: string
  timestamp: string
}

const recentActivities: RecentActivity[] = [
  { id: 'a1', emoji: '💰', text: 'Maria vendeu Sofá para João — R$450', timestamp: '5 min atrás' },
  { id: 'a2', emoji: '🔄', text: 'Pedro trocou Bicicleta por Tablet', timestamp: '12 min atrás' },
  { id: 'a3', emoji: '🛒', text: 'Ana comprou Livro de Carlos — R$25', timestamp: '28 min atrás' },
  { id: 'a4', emoji: '🎁', text: 'Família Silva doou Roupas', timestamp: '1h atrás' },
]

interface StatItem {
  label: string
  value: string
}

const stats: StatItem[] = [
  { label: 'Anúncios ativos', value: '234' },
  { label: 'Vendas esta semana', value: '89' },
  { label: 'Transacionado', value: 'R$12.450' },
  { label: 'Vizinhos', value: '156' },
]

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const conditionColors: Record<ConditionBadge, string> = {
  Novo: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Seminovo: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Usado: 'bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400',
}

/* ───────────────────────── Skeleton ───────────────────────── */

function SkeletonMarketplace() {
  return (
    <div className="r88-marketplace-skeleton space-y-4 animate-pulse">
      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-10 w-20 rounded-lg bg-muted/40 shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/30 bg-background/60 p-3 space-y-2"
          >
            <div className="aspect-square rounded-lg bg-muted/40" />
            <div className="h-3 w-3/4 rounded bg-muted/30" />
            <div className="h-3 w-1/2 rounded bg-muted/20" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───────────────────────── Sub-components ───────────────────────── */

function CategoryFilters({
  active,
  onSelect,
}: {
  active: CategoryKey
  onSelect: (cat: CategoryKey) => void
}) {
  return (
    <div className="r88-marketplace-categories flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
      {categories.map((cat) => (
        <motion.button
          key={cat.key}
          variants={fadeUp}
          whileHover={{ scale: 1.04 }}
          whileTap={tapV}
          onClick={() => onSelect(cat.key)}
          className={`r88-marketplace-cat-btn shrink-0 min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
            active === cat.key
              ? 'text-white'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50'
          }`}
          style={
            active === cat.key
              ? { background: 'linear-gradient(135deg, #8b5cf6, #7c3aed, #6d28d9)' }
              : undefined
          }
        >
          <span className="text-base">{cat.emoji}</span>
          <span>{cat.label}</span>
        </motion.button>
      ))}
    </div>
  )
}

function ProductCard({
  product,
  onToggleFavorite,
  onViewListing,
}: {
  product: ProductListing
  onToggleFavorite: (id: string) => void
  onViewListing: (name: string) => void
}) {
  return (
    <motion.div variants={cardV} whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(139,92,246,0.12)' }} className="r88-marketplace-card">
      <Card className="overflow-hidden border-border/40 hover:border-primary/20 transition-colors h-full r62-card-lift r90-marketplace-card">
        {/* Image placeholder */}
        <div className={`relative aspect-square bg-gradient-to-br ${product.gradient} flex items-center justify-center`}>
          <motion.span
            className="text-5xl"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {product.emoji}
          </motion.span>

          {/* Listing badge */}
          {product.badge && (
            <Badge className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 bg-white/90 dark:bg-black/60 text-foreground border-0 shadow-sm">
              {product.badge}
            </Badge>
          )}

          {/* Favorite toggle */}
          <motion.button
            whileTap={tapV}
            whileHover={{ scale: 1.15 }}
            onClick={() => onToggleFavorite(product.id)}
            className="absolute top-2 right-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Favoritar"
          >
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                product.isFavorited
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-white/80 dark:bg-black/40'
              }`}
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  product.isFavorited
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-500'
                }`}
              />
            </div>
          </motion.button>

          {/* Distance badge */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/80 dark:bg-black/50 rounded-full px-2 py-0.5 text-[10px] font-medium shadow-sm">
            <MapPin className="h-3 w-3 text-purple-500" />
            {product.distance}
          </div>
        </div>

        <CardContent className="p-3 space-y-2">
          {/* Product name */}
          <h4 className="text-sm font-semibold line-clamp-1 leading-tight">{product.name}</h4>

          {/* Seller */}
          <div className="flex items-center gap-1.5">
            <div
              className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}
            >
              {product.sellerInitial}
            </div>
            <span className="text-xs text-muted-foreground truncate">{product.seller}</span>
          </div>

          {/* Price & Condition */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-base font-bold text-purple-600 dark:text-purple-400">
              {formatBRL(product.price)}
            </span>
            <Badge
              variant="secondary"
              className={`text-[10px] px-1.5 py-0 border-0 ${conditionColors[product.condition]}`}
            >
              {product.condition}
            </Badge>
          </div>

          {/* View listing button */}
          <motion.div whileTap={tapV} className="pt-1">
            <Button
              size="sm"
              className="w-full min-h-[44px] text-xs font-medium gap-1.5"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
              onClick={() => onViewListing(product.name)}
            >
              <Eye className="h-3.5 w-3.5" />
              Ver Anúncio
              <ArrowRight className="h-3 w-3 ml-auto" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function TrustIndicators() {
  const indicators = [
    { icon: Shield, emoji: '🔒', label: 'Pagamento Seguro' },
    { icon: Users, emoji: '👥', label: 'Vizinhos Verificados' },
    { icon: Star, emoji: '⭐', label: 'Avaliações Reais' },
  ]

  return (
    <motion.div variants={containerV} initial="hidden" animate="visible" className="r88-marketplace-trust">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {indicators.map((item) => (
          <motion.div
            key={item.label}
            variants={fadeUp}
            whileHover={{ scale: 1.03 }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/40 border border-border/30"
          >
            <span className="text-xl">{item.emoji}</span>
            <span className="text-[11px] font-medium text-center text-muted-foreground leading-tight">
              {item.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function ActivityFeed() {
  return (
    <motion.div variants={containerV} initial="hidden" animate="visible" className="r88-marketplace-activity space-y-2">
      {recentActivities.map((activity) => (
        <motion.div
          key={activity.id}
          variants={fadeUp}
          className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/20"
        >
          <span className="text-xl shrink-0 mt-0.5">{activity.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium leading-relaxed">{activity.text}</p>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="text-[10px]">{activity.timestamp}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

function StatsBar() {
  return (
    <motion.div variants={containerV} initial="hidden" animate="visible" className="r88-marketplace-stats">
      <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            className="shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-muted/40 border border-border/20 min-w-[100px]"
          >
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
              {stat.value}
            </span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

/* ───────────────────────── Main Component ───────────────────────── */

export function CommunityMarketplace() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('Todos')
  const [listings, setListings] = useState<ProductListing[]>(mockListings)
  const { toast } = useToast()

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  const filteredListings = useMemo(() => {
    if (activeCategory === 'Todos') return listings
    return listings.filter((p) => p.category === activeCategory)
  }, [listings, activeCategory])

  const handleToggleFavorite = (id: string) => {
    setListings((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isFavorited: !p.isFavorited } : p
      )
    )
    const product = listings.find((p) => p.id === id)
    if (product) {
      const action = product.isFavorited ? 'removido dos favoritos' : 'adicionado aos favoritos'
      toast({
        title: `"${product.name}" ${action}`,
        description: product.isFavorited
          ? 'O item foi removido da sua lista de favoritos.'
          : 'O item foi salvo na sua lista de favoritos.',
      })
    }
  }

  const handleViewListing = (name: string) => {
    toast({
      title: `Ver anúncio: ${name}`,
      description: 'Abrindo detalhes do anúncio...',
    })
  }

  const handleSellItem = () => {
    toast({
      title: 'Formulário de venda aberto!',
      description: 'Preencha as informações do item que deseja vender.',
    })
  }

  return (
    <section className="r88-marketplace-widget space-y-5 r62-heading-gradient">
      {/* ── Header ── */}
      <motion.div
        variants={containerV}
        initial="hidden"
        animate="visible"
        className="flex items-center gap-3"
      >
        <motion.div
          variants={fadeUp}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shrink-0"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed, #6d28d9)',
            boxShadow: '0 4px 16px rgba(109,40,217,0.35)',
          }}
        >
          <Store className="h-5 w-5 text-white" />
        </motion.div>
        <div className="min-w-0">
          <motion.h3
            variants={fadeUp}
            className="text-lg font-bold"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed, #6d28d9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Mercado Comunitário
          </motion.h3>
          <motion.p variants={fadeUp} className="text-xs text-muted-foreground">
            Compre, venda e troque com seus vizinhos
          </motion.p>
        </div>
      </motion.div>

      {/* ── Sell Item CTA ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.01 }}
        whileTap={tapV}
      >
        <Button
          onClick={handleSellItem}
          className="w-full min-h-[44px] text-sm font-semibold gap-2 text-white border-0"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed, #6d28d9)',
            boxShadow: '0 4px 16px rgba(109,40,217,0.25)',
          }}
        >
          <Plus className="h-4 w-4" />
          Vender Item
          <ArrowRight className="h-4 w-4 ml-auto" />
        </Button>
      </motion.div>

      {isLoading ? (
        <SkeletonMarketplace />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            variants={containerV}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-5"
          >
            {/* ── Category Filters ── */}
            <CategoryFilters active={activeCategory} onSelect={setActiveCategory} />

            {/* ── Listings Grid ── */}
            <motion.div
              variants={containerV}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
            >
              <AnimatePresence mode="popLayout">
                {filteredListings.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onToggleFavorite={handleToggleFavorite}
                    onViewListing={handleViewListing}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* ── Empty state ── */}
            {filteredListings.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <Tag className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nenhum anúncio nesta categoria
                </p>
                <button
                  onClick={() => setActiveCategory('Todos')}
                  className="text-xs text-purple-500 hover:text-purple-600 mt-2 font-medium"
                >
                  Ver todos os anúncios
                </button>
              </motion.div>
            )}

            <Separator className="bg-border/30" />

            {/* ── Trust & Safety ── */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-500" />
                Confiança e Segurança
              </h4>
              <TrustIndicators />
            </div>

            <Separator className="bg-border/30" />

            {/* ── Stats Bar ── */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-500" />
                Números do Bairro
              </h4>
              <StatsBar />
            </div>

            <Separator className="bg-border/30" />

            {/* ── Recent Activity Feed ── */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                Atividade Recente
              </h4>
              <ActivityFeed />
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  )
}

export default CommunityMarketplace
