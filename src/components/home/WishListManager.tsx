'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  Heart,
  Plus,
  Trash2,
  X,
  Check,
  Copy,
  Share2,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ShoppingCart,
  Star,
  Bell,
  BellRing,
  TrendingDown,
  Eye,
  ExternalLink,
  Gift,
  Sparkles,
  Package,
  ShoppingBag,
  Tag,
  ArrowUpDown,
  Grid3X3,
  List,
  MoreHorizontal,
  Pencil,
  FolderPlus,
  Trash,
  MoveRight,
  Crown,
  Clock,
  Filter,
  Mail,
  Facebook,
  Twitter,
  MessageCircle,
  AlertTriangle,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

// ─── Types ───────────────────────────────────────────────────────────

interface WishlistProduct {
  id: string
  name: string
  price: number
  originalPrice: number
  image: string
  store: string
  storeId: string
  addedDate: string
  targetPrice: number | null
  priceDropped: boolean
  rating: number
  category: string
  description: string
}

interface WishlistCollection {
  id: string
  name: string
  description: string
  isDefault: boolean
  coverGradient: string
  createdAt: string
  items: WishlistProduct[]
}

interface RecommendedProduct {
  id: string
  name: string
  price: number
  image: string
  store: string
  rating: number
  category: string
  reason: string
}

type SortOption = 'price-asc' | 'price-desc' | 'date-added' | 'name-az' | 'store'

// ─── Constants ───────────────────────────────────────────────────────

const STORAGE_KEY = 'domplace-wishlist-manager-v1'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'date-added', label: 'Recently Added' },
  { value: 'name-az', label: 'Name A → Z' },
  { value: 'store', label: 'By Store' },
]

const COVER_GRADIENTS = [
  'linear-gradient(135deg, #059669, #0891b2)',
  'linear-gradient(135deg, #d97706, #dc2626)',
  'linear-gradient(135deg, #7c3aed, #db2777)',
  'linear-gradient(135deg, #2563eb, #06b6d4)',
  'linear-gradient(135deg, #059669, #d97706)',
  'linear-gradient(135deg, #e11d48, #9333ea)',
]

// ─── Mock Data ────────────────────────────────────────────────────────

const MOCK_PRODUCTS: WishlistProduct[] = [
  {
    id: 'wp-1',
    name: 'Organic Açaí Bowl 500g',
    price: 24.90,
    originalPrice: 32.90,
    image: '/images/acai.jpg',
    store: 'Açaí da Terra',
    storeId: 'store-1',
    addedDate: '2025-06-10T14:30:00Z',
    targetPrice: 20.0,
    priceDropped: true,
    rating: 4.8,
    category: 'Food',
    description: 'Fresh organic açaí bowl with granola and banana.',
  },
  {
    id: 'wp-2',
    name: 'Artisan Sourdough Bread',
    price: 18.50,
    originalPrice: 18.50,
    image: '/images/bakery.jpg',
    store: 'Padaria Bella',
    storeId: 'store-2',
    addedDate: '2025-06-08T09:15:00Z',
    targetPrice: null,
    priceDropped: false,
    rating: 4.6,
    category: 'Bakery',
    description: 'Handcrafted sourdough bread baked fresh daily.',
  },
  {
    id: 'wp-3',
    name: 'Free-Range Eggs 12pk',
    price: 16.90,
    originalPrice: 19.90,
    image: '/images/grocery.jpg',
    store: 'Fazenda Feliz',
    storeId: 'store-3',
    addedDate: '2025-06-07T11:00:00Z',
    targetPrice: 14.0,
    priceDropped: false,
    rating: 4.9,
    category: 'Grocery',
    description: 'Premium free-range eggs from happy hens.',
  },
  {
    id: 'wp-4',
    name: 'Natural Face Serum 30ml',
    price: 89.90,
    originalPrice: 129.90,
    image: '/images/beauty.jpg',
    store: 'Beauté Naturale',
    storeId: 'store-4',
    addedDate: '2025-06-06T16:45:00Z',
    targetPrice: 75.0,
    priceDropped: true,
    rating: 4.7,
    category: 'Beauty',
    description: 'Anti-aging vitamin C face serum with hyaluronic acid.',
  },
  {
    id: 'wp-5',
    name: 'Wireless Earbuds Pro',
    price: 199.90,
    originalPrice: 299.90,
    image: '/images/electronics.jpg',
    store: 'TechZone',
    storeId: 'store-5',
    addedDate: '2025-06-05T10:20:00Z',
    targetPrice: 150.0,
    priceDropped: false,
    rating: 4.5,
    category: 'Electronics',
    description: 'Noise-cancelling wireless earbuds with 24h battery.',
  },
  {
    id: 'wp-6',
    name: 'Premium Pet Food 3kg',
    price: 64.90,
    originalPrice: 79.90,
    image: '/images/pets.jpg',
    store: 'PetLovers Store',
    storeId: 'store-6',
    addedDate: '2025-06-04T13:10:00Z',
    targetPrice: null,
    priceDropped: false,
    rating: 4.8,
    category: 'Pets',
    description: 'Grain-free premium dog food with real chicken.',
  },
  {
    id: 'wp-7',
    name: 'Organic Honey 500ml',
    price: 34.90,
    originalPrice: 42.90,
    image: '/images/agriculture.jpg',
    store: 'Sabor do Campo',
    storeId: 'store-7',
    addedDate: '2025-06-03T08:30:00Z',
    targetPrice: 28.0,
    priceDropped: true,
    rating: 4.9,
    category: 'Food',
    description: 'Raw organic wildflower honey from local beekeepers.',
  },
  {
    id: 'wp-8',
    name: 'Pharmacy Multivitamins',
    price: 45.90,
    originalPrice: 54.90,
    image: '/images/pharmacy.jpg',
    store: 'Farmácia Vida',
    storeId: 'store-8',
    addedDate: '2025-06-02T15:00:00Z',
    targetPrice: 38.0,
    priceDropped: false,
    rating: 4.4,
    category: 'Health',
    description: 'Complete daily multivitamin complex with minerals.',
  },
  {
    id: 'wp-9',
    name: 'Ceramic Plant Pot Set',
    price: 56.90,
    originalPrice: 56.90,
    image: '/images/grocery.jpg',
    store: 'Verde Vida',
    storeId: 'store-9',
    addedDate: '2025-06-01T12:00:00Z',
    targetPrice: null,
    priceDropped: false,
    rating: 4.3,
    category: 'Home',
    description: 'Set of 3 handmade ceramic plant pots in pastel tones.',
  },
  {
    id: 'wp-10',
    name: 'Artisan Coffee Beans 1kg',
    price: 42.90,
    originalPrice: 52.90,
    image: '/images/grocery.jpg',
    store: 'Café Premium',
    storeId: 'store-10',
    addedDate: '2025-05-30T09:00:00Z',
    targetPrice: 35.0,
    priceDropped: false,
    rating: 4.7,
    category: 'Food',
    description: 'Single-origin specialty coffee beans, medium roast.',
  },
  {
    id: 'wp-11',
    name: 'Yoga Mat Premium',
    price: 79.90,
    originalPrice: 99.90,
    image: '/images/grocery.jpg',
    store: 'FitLife Store',
    storeId: 'store-11',
    addedDate: '2025-05-28T07:45:00Z',
    targetPrice: 60.0,
    priceDropped: false,
    rating: 4.6,
    category: 'Sports',
    description: 'Eco-friendly non-slip yoga mat with carrying strap.',
  },
  {
    id: 'wp-12',
    name: 'Handmade Chocolate Box',
    price: 54.90,
    originalPrice: 54.90,
    image: '/images/bakery.jpg',
    store: 'Chocolateria Arte',
    storeId: 'store-12',
    addedDate: '2025-05-27T18:00:00Z',
    targetPrice: null,
    priceDropped: false,
    rating: 4.8,
    category: 'Food',
    description: 'Luxury handmade chocolate box with 16 assorted truffles.',
  },
]

const MOCK_RECOMMENDATIONS: RecommendedProduct[] = [
  {
    id: 'rec-1',
    name: 'Organic Granola Mix 400g',
    price: 19.90,
    image: '/images/grocery.jpg',
    store: 'Açaí da Terra',
    rating: 4.5,
    category: 'Food',
    reason: 'Because you liked Organic Açaí Bowl',
  },
  {
    id: 'rec-2',
    name: 'Whole Wheat Croissant',
    price: 8.90,
    image: '/images/bakery.jpg',
    store: 'Padaria Bella',
    rating: 4.6,
    category: 'Bakery',
    reason: 'Because you liked Artisan Sourdough Bread'
  },
  {
    id: 'rec-3',
    name: 'Vitamin C Moisturizer',
    price: 69.90,
    image: '/images/beauty.jpg',
    store: 'Beauté Naturale',
    rating: 4.4,
    category: 'Beauty',
    reason: 'Because you liked Natural Face Serum'
  },
  {
    id: 'rec-4',
    name: 'USB-C Charging Cable',
    price: 24.90,
    image: '/images/electronics.jpg',
    store: 'TechZone',
    rating: 4.3,
    category: 'Electronics',
    reason: 'Because you liked Wireless Earbuds Pro'
  },
  {
    id: 'rec-5',
    name: 'Pet Dental Treats',
    price: 22.90,
    image: '/images/pets.jpg',
    store: 'PetLovers Store',
    rating: 4.7,
    category: 'Pets',
    reason: 'Because you liked Premium Pet Food'
  },
  {
    id: 'rec-6',
    name: 'Matcha Green Tea 100g',
    price: 38.90,
    image: '/images/grocery.jpg',
    store: 'Café Premium',
    rating: 4.8,
    category: 'Food',
    reason: 'Because you liked Artisan Coffee Beans'
  },
]

function createDefaultCollections(): WishlistCollection[] {
  return [
    {
      id: 'col-1',
      name: 'Everyday Favorites',
      description: 'Products I buy regularly',
      isDefault: true,
      coverGradient: COVER_GRADIENTS[0],
      createdAt: '2025-06-01T00:00:00Z',
      items: MOCK_PRODUCTS.slice(0, 4),
    },
    {
      id: 'col-2',
      name: 'Tech & Gadgets',
      description: 'Electronics and accessories I want',
      isDefault: false,
      coverGradient: COVER_GRADIENTS[3],
      createdAt: '2025-05-28T00:00:00Z',
      items: MOCK_PRODUCTS.slice(4, 7),
    },
    {
      id: 'col-3',
      name: 'Gift Ideas',
      description: 'Perfect gifts for friends and family',
      isDefault: false,
      coverGradient: COVER_GRADIENTS[2],
      createdAt: '2025-05-20T00:00:00Z',
      items: MOCK_PRODUCTS.slice(7, 12),
    },
  ]
}

// ─── Helpers ─────────────────────────────────────────────────────────

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const uid = () => `r56-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

// ─── localStorage persistence ───────────────────────────────────────

interface PersistedWishlistState {
  collections: WishlistCollection[]
}

function loadWishlistState(): PersistedWishlistState {
  if (typeof window === 'undefined') {
    return { collections: createDefaultCollections() }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.collections && parsed.collections.length > 0) return parsed
    }
  } catch { /* ignore */ }
  return { collections: createDefaultCollections() }
}

function saveWishlistState(state: PersistedWishlistState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* ignore */ }
}

// ─── Animation Variants ──────────────────────────────────────────────

const springConfig = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
} satisfies { type: 'spring'; stiffness: number; damping: number }

const collectionCardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.95 },
} satisfies Variants

const productCardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.9, x: -40 },
} satisfies Variants

const heartBurstVariants = {
  hidden: { opacity: 0, scale: 0 },
  burst: { opacity: [0, 1, 0], scale: [0, 1.2, 0] },
} satisfies Variants

const particleVariants = {
  hidden: { opacity: 0, scale: 0 },
  explode: (i: number) => ({
    opacity: [0, 1, 0],
    scale: [0, 1, 0.3],
    x: Math.cos((i * 2 * Math.PI) / 6) * 20,
    y: Math.sin((i * 2 * Math.PI) / 6) * 20,
  }),
} satisfies Variants

const badgePulseVariants = {
  idle: { scale: 1 },
  pulse: { scale: [1, 1.25, 1] },
} satisfies Variants

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
} satisfies Variants

const modalContentVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.97 },
} satisfies Variants

const stripSlideVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
} satisfies Variants

const emptyBounceVariants = {
  idle: { y: 0 },
  bounce: {
    y: [0, -12, 0],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
  },
} satisfies Variants

// ─── Sub-Components ──────────────────────────────────────────────────

function HeartToggle({
  isFilled,
  onToggle,
}: {
  isFilled: boolean
  onToggle: () => void
}) {
  const [particles, setParticles] = useState(false)

  const handleToggle = () => {
    if (!isFilled) setParticles(true)
    onToggle()
    setTimeout(() => setParticles(false), 600)
  }

  return (
    <div className="r56-heart-toggle relative">
      <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}>
        <button
          onClick={handleToggle}
          className="r56-heart-btn w-9 h-9 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-colors"
          aria-label="Toggle wishlist"
        >
          <motion.div
            animate={{ scale: isFilled ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={`r56-heart-icon h-5 w-5 transition-colors ${
                isFilled
                  ? 'text-red-500 fill-red-500'
                  : 'text-gray-400'
              }`}
            />
          </motion.div>
        </button>
      </motion.div>
      <AnimatePresence>
        {particles && (
          <div className="r56-particle-container absolute inset-0 pointer-events-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                variants={particleVariants}
                initial="hidden"
                animate="explode"
                exit="hidden"
                custom={i}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="r56-particle absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: i % 2 === 0 ? '#ef4444' : '#f97316' }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SwipeableProductCard({
  product,
  collection,
  onRemove,
  onToggleHeart,
  onSetTargetPrice,
  onViewDetail,
  selected,
  onSelect,
  index,
}: {
  product: WishlistProduct
  collection: WishlistCollection
  onRemove: (productId: string) => void
  onToggleHeart: (productId: string) => void
  onSetTargetPrice: (productId: string, price: number) => void
  onViewDetail: (product: WishlistProduct) => void
  selected: boolean
  onSelect: () => void
  index: number
}) {
  const [swiped, setSwiped] = useState(false)
  const dragX = useRef(0)

  return (
    <motion.div
      variants={productCardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ delay: index * 0.05, ...springConfig }}
      className="r56-product-card-wrapper relative overflow-hidden rounded-xl"
    >
      {/* Delete button behind */}
      <AnimatePresence>
        {swiped && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="r56-swipe-delete absolute inset-y-0 right-0 w-20 bg-red-500 flex items-center justify-center"
          >
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <button
                onClick={() => onRemove(product.id)}
                className="r56-delete-btn p-2 min-h-[44px] min-w-[44px]"
              >
                <Trash2 className="h-5 w-5 text-white" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) {
            setSwiped(true)
          } else {
            setSwiped(false)
          }
        }}
        onDrag={(_, info) => {
          dragX.current = info.offset.x
        }}
        animate={{ x: swiped ? -80 : 0 }}
        transition={springConfig}
        className={`r56-product-card relative rounded-xl border border-border/50 bg-card cursor-pointer ${
          selected ? 'ring-2 ring-primary' : ''
        }`}
        onClick={(e) => {
          if (dragX.current > -20) {
            onSelect()
          }
        }}
      >
        <div className="flex gap-3 p-3">
          {/* Selection checkbox */}
          <div className="flex items-start pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSelect()
              }}
              className={`r56-checkbox w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                selected
                  ? 'bg-primary border-primary'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {selected && <Check className="h-3 w-3 text-white" />}
            </button>
          </div>

          {/* Product image */}
          <div
            className="r56-product-img w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted"
            onClick={(e) => {
              e.stopPropagation()
              onViewDetail(product)
            }}
          >
            <div
              className="w-full h-full"
              style={{ background: product.image ? `url(${product.image}) center/cover` : collection.coverGradient }}
            />
          </div>

          {/* Product info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="r56-product-name text-xs font-semibold truncate max-w-[180px]">
                {product.name}
              </h4>
              <HeartToggle
                isFilled={true}
                onToggle={() => onToggleHeart(product.id)}
              />
            </div>

            <p className="r56-product-store text-[10px] text-muted-foreground mt-0.5">
              {product.store}
            </p>

            <div className="flex items-center gap-2 mt-1.5">
              <span className="r56-product-price text-xs font-bold text-primary">
                {formatBRL(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="r56-product-original text-[10px] text-muted-foreground line-through">
                  {formatBRL(product.originalPrice)}
                </span>
              )}
              {product.priceDropped && product.targetPrice !== null && product.price <= product.targetPrice && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Badge className="r56-price-drop-badge text-[8px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 h-4 px-1.5">
                    <TrendingDown className="h-2.5 w-2.5 mr-0.5" />
                    Price Alert!
                  </Badge>
                </motion.div>
              )}
            </div>

            {/* Price alert target */}
            {product.targetPrice !== null && (
              <div className="r56-target-price flex items-center gap-1 mt-1">
                <Bell className="h-2.5 w-2.5 text-amber-500" />
                <span className="text-[9px] text-amber-600 dark:text-amber-400">
                  Target: {formatBRL(product.targetPrice)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between mt-1">
              <span className="r56-product-date text-[9px] text-muted-foreground/70 flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" />
                {formatDate(product.addedDate)}
              </span>
              <div className="flex items-center gap-0.5">
                <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
                <span className="text-[9px] text-muted-foreground">{product.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function CollectionCard({
  collection,
  isActive,
  onClick,
  onSetDefault,
  onRename,
  onDelete,
  index,
}: {
  collection: WishlistCollection
  isActive: boolean
  onClick: () => void
  onSetDefault: () => void
  onRename: () => void
  onDelete: () => void
  index: number
}) {
  const itemCount = collection.items.length
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <motion.div
      variants={collectionCardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ delay: index * 0.08, ...springConfig }}
      className="r56-collection-card relative"
    >
      <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}>
        <button
          onClick={onClick}
          className={`r56-collection-card-inner w-full rounded-xl overflow-hidden border-2 text-left transition-all ${
            isActive
              ? 'border-primary shadow-lg'
              : 'border-border/50 hover:border-primary/40'
          }`}
        >
          {/* Cover gradient */}
          <div
            className="r56-collection-cover h-24 relative"
            style={{ background: collection.coverGradient }}
          >
            {collection.isDefault && (
              <div className="absolute top-2 right-2">
                <Badge className="r56-default-badge text-[8px] bg-white/20 text-white border-white/30 backdrop-blur-sm h-5 px-1.5">
                  <Crown className="h-2.5 w-2.5 mr-0.5" />
                  Default
                </Badge>
              </div>
            )}
            <div className="absolute bottom-2 left-3">
              <h3 className="r56-collection-name text-sm font-bold text-white drop-shadow-sm">
                {collection.name}
              </h3>
            </div>
          </div>

          <div className="p-3 bg-card">
            <p className="r56-collection-desc text-[10px] text-muted-foreground line-clamp-1">
              {collection.description}
            </p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Badge className="r56-count-badge text-[9px] bg-primary/10 text-primary border-primary/20 h-5 px-1.5">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </Badge>
                </motion.div>
              </div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpen(!menuOpen)
                  }}
                  className="r56-more-btn w-6 h-6 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </motion.div>
            </div>
          </div>
        </button>
      </motion.div>

      {/* Dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="r56-collection-menu absolute top-2 right-2 z-20 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[140px]"
          >
            <div className="absolute top-2 right-8 z-10" onClick={() => setMenuOpen(false)}>
              <div className="fixed inset-0" />
            </div>
            <button
              onClick={() => { onSetDefault(); setMenuOpen(false) }}
              className="r56-menu-item w-full text-left px-3 py-1.5 text-[11px] hover:bg-accent flex items-center gap-2 transition-colors"
            >
              <Crown className="h-3 w-3" />
              Set as Default
            </button>
            <button
              onClick={() => { onRename(); setMenuOpen(false) }}
              className="r56-menu-item w-full text-left px-3 py-1.5 text-[11px] hover:bg-accent flex items-center gap-2 transition-colors"
            >
              <Pencil className="h-3 w-3" />
              Rename
            </button>
            <button
              onClick={() => { onDelete(); setMenuOpen(false) }}
              className="r56-menu-item w-full text-left px-3 py-1.5 text-[11px] hover:bg-accent flex items-center gap-2 text-red-500 transition-colors"
            >
              <Trash className="h-3 w-3" />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function PriceAlertModal({
  product,
  onSet,
  open,
  onOpenChange,
}: {
  product: WishlistProduct | null
  onSet: (productId: string, price: number) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [targetPrice, setTargetPrice] = useState('')

  useEffect(() => {
    if (product?.targetPrice) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTargetPrice(product.targetPrice.toString())
    } else if (product) {
      setTargetPrice((product.price * 0.8).toFixed(2))
    }
  }, [product])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="r56-price-modal sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="r56-modal-title text-sm">
            <BellRing className="h-4 w-4 mr-2 text-amber-500 inline" />
            Set Price Alert
          </DialogTitle>
          <DialogDescription className="r56-modal-desc text-xs">
            {product ? `Get notified when "${product.name}" drops below your target price.` : ''}
          </DialogDescription>
        </DialogHeader>
        <div className="r56-price-input-group space-y-3 py-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-xs text-muted-foreground">Current Price</span>
            <span className="text-sm font-bold text-primary">
              {product ? formatBRL(product.price) : ''}
            </span>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Target Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
              <input
                type="number"
                step="0.01"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="r56-price-input w-full h-10 pl-8 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="0.00"
              />
            </div>
          </div>
          {product && parseFloat(targetPrice) > product.price && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-500">
              <AlertTriangle className="h-3.5 w-3.5" />
              Target price is above the current price
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (product && targetPrice) {
                onSet(product.id, parseFloat(targetPrice))
                onOpenChange(false)
              }
            }}
          >
            <Bell className="h-3.5 w-3.5 mr-1" />
            Set Alert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ProductQuickViewModal({
  product,
  open,
  onOpenChange,
  onSetPriceAlert,
}: {
  product: WishlistProduct | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSetPriceAlert: (product: WishlistProduct) => void
}) {
  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="r56-quickview-modal sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="r56-quickview-title text-sm font-semibold">
            Product Details
          </DialogTitle>
        </DialogHeader>
        <div className="r56-quickview-content space-y-4">
          {/* Image */}
          <div
            className="r56-quickview-img w-full h-48 rounded-xl overflow-hidden"
            style={{
              background: product.image
                ? `url(${product.image}) center/cover`
                : 'linear-gradient(135deg, #059669, #0891b2)',
            }}
          />
          {/* Info */}
          <div>
            <h3 className="r56-quickview-name text-base font-bold">{product.name}</h3>
            <p className="r56-quickview-store text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <ShoppingBag className="h-3 w-3" />
              {product.store}
            </p>
          </div>
          {/* Price row */}
          <div className="flex items-center gap-3">
            <span className="r56-quickview-price text-xl font-bold text-primary">
              {formatBRL(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="r56-quickview-original text-sm text-muted-foreground line-through">
                {formatBRL(product.originalPrice)}
              </span>
            )}
            {product.originalPrice > product.price && (
              <Badge className="r56-discount-badge text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </Badge>
            )}
          </div>
          {/* Rating */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(product.rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">{product.rating}</span>
          </div>
          {/* Description */}
          <p className="r56-quickview-desc text-xs text-muted-foreground">{product.description}</p>
          {/* Target price */}
          {product.targetPrice !== null && (
            <div className="r56-quickview-alert flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Bell className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Price Alert Active</p>
                <p className="text-[10px] text-amber-500">
                  Target: {formatBRL(product.targetPrice)}
                </p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onSetPriceAlert(product)
                onOpenChange(false)
              }}
            >
              <BellRing className="h-3.5 w-3.5 mr-1" />
              Price Alert
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button size="sm">
              <ShoppingCart className="h-3.5 w-3.5 mr-1" />
              Add to Cart
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ShareModal({
  collectionName,
  open,
  onOpenChange,
}: {
  collectionName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [copied, setCopied] = useState(false)
  const shareUrl = `https://domplace.com/wishlist/shared/${Date.now().toString(36)}`

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {})
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="r56-share-modal sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="r56-share-title text-sm">
            Share "{collectionName}"
          </DialogTitle>
          <DialogDescription className="r56-share-desc text-xs">
            Share your wishlist with friends and family.
          </DialogDescription>
        </DialogHeader>
        <div className="r56-share-content space-y-4 py-2">
          {/* Copy link */}
          <div className="r56-share-link flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              className="r56-share-url flex-1 h-9 px-3 rounded-lg border border-border bg-muted/50 text-xs text-muted-foreground"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="sm" variant="outline" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </motion.div>
          </div>

          {/* Email */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <button className="r56-share-email w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 bg-card transition-colors">
              <Mail className="h-4 w-4 text-blue-500" />
              <div className="text-left">
                <p className="text-xs font-medium">Send via Email</p>
                <p className="text-[10px] text-muted-foreground">Share via email placeholder</p>
              </div>
              <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto" />
            </button>
          </motion.div>

          {/* Social */}
          <div className="r56-share-social grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { icon: Facebook, label: 'Facebook', color: '#1877f2' },
              { icon: Twitter, label: 'Twitter', color: '#1da1f2' },
              { icon: MessageCircle, label: 'WhatsApp', color: '#25d366' },
            ].map((social) => (
              <motion.div key={social.label} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button className="r56-share-social-btn w-full flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border hover:border-primary/30 bg-card transition-colors">
                  <social.icon className="h-5 w-5" style={{ color: social.color }} />
                  <span className="text-[10px] font-medium text-muted-foreground">{social.label}</span>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Component ──────────────────────────────────────────────────

export function WishListManager() {
  const [mounted, setMounted] = useState(false)
  const [collections, setCollections] = useState<WishlistCollection[]>([])
  const [activeCollectionId, setActiveCollectionId] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('date-added')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showPriceAlertModal, setShowPriceAlertModal] = useState(false)
  const [showQuickViewModal, setShowQuickViewModal] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [renameName, setRenameName] = useState('')
  const [targetCollectionId, setTargetCollectionId] = useState('')
  const [activeProduct, setActiveProduct] = useState<WishlistProduct | null>(null)
  const [activeCollectionForAction, setActiveCollectionForAction] = useState<WishlistCollection | null>(null)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [filterStore, setFilterStore] = useState<string>('all')
  const [toastMessage, setToastMessage] = useState('')

  const recentlyAddedRef = useRef<HTMLDivElement>(null)
  const [toastVisible, setToastVisible] = useState(false)

  // Hydration guard
  useEffect(() => {
    const state = loadWishlistState()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollections(state.collections)
    setActiveCollectionId(
      state.collections.find((c) => c.isDefault)?.id ?? state.collections[0]?.id ?? ''
    )
    setMounted(true)
  }, [])

  // Persist
  useEffect(() => {
    if (!mounted) return
    saveWishlistState({ collections })
  }, [mounted, collections])

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToastVisible(true)
      const timer = setTimeout(() => {
        setToastVisible(false)
        setTimeout(() => setToastMessage(''), 300)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // ─── Derived state ──────────────────────────────────────────────

  const activeCollection = useMemo(
    () => collections.find((c) => c.id === activeCollectionId) ?? null,
    [collections, activeCollectionId]
  )

  const allItems = useMemo(
    () => activeCollection?.items ?? [],
    [activeCollection]
  )

  const uniqueStores = useMemo(() => {
    const stores = new Set<string>()
    allItems.forEach((item) => stores.add(item.store))
    return Array.from(stores).sort()
  }, [allItems])

  const filteredAndSortedItems = useMemo(() => {
    let items = [...allItems]

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.store.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      )
    }

    // Filter by store
    if (filterStore !== 'all') {
      items = items.filter((item) => item.store === filterStore)
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        items.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        items.sort((a, b) => b.price - a.price)
        break
      case 'date-added':
        items.sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
        break
      case 'name-az':
        items.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'store':
        items.sort((a, b) => a.store.localeCompare(b.store))
        break
    }

    return items
  }, [allItems, sortBy, searchQuery, filterStore])

  const recentlyAdded = useMemo(
    () =>
      [...allItems]
        .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
        .slice(0, 8),
    [allItems]
  )

  const recommendations = useMemo(() => {
    const categories = new Set(allItems.map((item) => item.category))
    return MOCK_RECOMMENDATIONS.filter((r) => categories.has(r.category)).slice(0, 6)
  }, [allItems])

  const totalPriceAlerts = useMemo(
    () => allItems.filter((item) => item.targetPrice !== null).length,
    [allItems]
  )

  const priceDropCount = useMemo(
    () => allItems.filter((item) => item.priceDropped && item.targetPrice !== null && item.price <= item.targetPrice).length,
    [allItems]
  )

  // ─── Handlers ──────────────────────────────────────────────────

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
  }, [])

  const createCollection = useCallback(() => {
    if (!newCollectionName.trim()) return
    const gradient = COVER_GRADIENTS[collections.length % COVER_GRADIENTS.length]
    const newCol: WishlistCollection = {
      id: uid(),
      name: newCollectionName.trim(),
      description: 'A new wishlist collection',
      isDefault: collections.length === 0,
      coverGradient: gradient,
      createdAt: new Date().toISOString(),
      items: [],
    }
    setCollections((prev) => [...prev, newCol])
    setActiveCollectionId(newCol.id)
    setNewCollectionName('')
    setShowCreateModal(false)
    showToast(`"${newCol.name}" created!`)
  }, [newCollectionName, collections.length, showToast])

  const renameCollection = useCallback(
    (col: WishlistCollection) => {
      if (!renameName.trim()) return
      setCollections((prev) =>
        prev.map((c) => (c.id === col.id ? { ...c, name: renameName.trim() } : c))
      )
      setRenameName('')
      setShowRenameModal(false)
      showToast(`Renamed to "${renameName.trim()}"`)
    },
    [renameName, showToast]
  )

  const deleteCollection = useCallback(
    (colId: string) => {
      setCollections((prev) => {
        const next = prev.filter((c) => c.id !== colId)
        if (activeCollectionId === colId) {
          setActiveCollectionId(next[0]?.id ?? '')
        }
        return next
      })
      setShowDeleteConfirm(false)
      showToast('Collection deleted')
    },
    [activeCollectionId, showToast]
  )

  const setDefaultCollection = useCallback(
    (colId: string) => {
      setCollections((prev) =>
        prev.map((c) => ({ ...c, isDefault: c.id === colId }))
      )
      showToast('Default collection updated')
    },
    [showToast]
  )

  const removeItem = useCallback(
    (productId: string) => {
      if (!activeCollectionId) return
      setCollections((prev) =>
        prev.map((c) =>
          c.id === activeCollectionId
            ? { ...c, items: c.items.filter((i) => i.id !== productId) }
            : c
        )
      )
      setSelectedItems((prev) => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
      showToast('Item removed')
    },
    [activeCollectionId, showToast]
  )

  const toggleItemHeart = useCallback((productId: string) => {
    // For this component, all items are in wishlist, so removing = unfavorite
  }, [])

  const setTargetPrice = useCallback(
    (productId: string, price: number) => {
      if (!activeCollectionId) return
      setCollections((prev) =>
        prev.map((c) =>
          c.id === activeCollectionId
            ? {
                ...c,
                items: c.items.map((i) =>
                  i.id === productId
                    ? { ...i, targetPrice: price, priceDropped: i.price <= price }
                    : i
                ),
              }
            : c
        )
      )
      showToast(`Price alert set for ${formatBRL(price)}`)
    },
    [activeCollectionId, showToast]
  )

  const moveItemsToCollection = useCallback(
    (targetId: string) => {
      if (!activeCollectionId || selectedItems.size === 0) return
      const itemIds = Array.from(selectedItems)
      setCollections((prev) => {
        const sourceItems = prev
          .find((c) => c.id === activeCollectionId)
          ?.items.filter((i) => itemIds.includes(i.id)) ?? []
        return prev.map((c) => {
          if (c.id === targetId) {
            return { ...c, items: [...c.items, ...sourceItems] }
          }
          if (c.id === activeCollectionId) {
            return { ...c, items: c.items.filter((i) => !itemIds.includes(i.id)) }
          }
          return c
        })
      })
      setSelectedItems(new Set())
      setShowMoveModal(false)
      showToast(`${itemIds.length} item(s) moved`)
    },
    [activeCollectionId, selectedItems, showToast]
  )

  const removeSelected = useCallback(() => {
    if (!activeCollectionId || selectedItems.size === 0) return
    const count = selectedItems.size
    setCollections((prev) =>
      prev.map((c) =>
        c.id === activeCollectionId
          ? { ...c, items: c.items.filter((i) => !selectedItems.has(i.id)) }
          : c
      )
    )
    setSelectedItems(new Set())
    showToast(`${count} item(s) removed`)
  }, [activeCollectionId, selectedItems, showToast])

  const addAllToCart = useCallback(() => {
    showToast(`${allItems.length} item(s) added to cart`)
  }, [allItems.length, showToast])

  const toggleSelectAll = useCallback(() => {
    if (selectedItems.size === allItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(allItems.map((i) => i.id)))
    }
  }, [selectedItems, allItems])

  const toggleSelectItem = useCallback((itemId: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }, [])

  const viewDetail = useCallback((product: WishlistProduct) => {
    setActiveProduct(product)
    setShowQuickViewModal(true)
  }, [])

  const openPriceAlert = useCallback((product: WishlistProduct) => {
    setActiveProduct(product)
    setShowPriceAlertModal(true)
  }, [])

  const openRename = useCallback((col: WishlistCollection) => {
    setActiveCollectionForAction(col)
    setRenameName(col.name)
    setShowRenameModal(true)
  }, [])

  const openDelete = useCallback((col: WishlistCollection) => {
    setActiveCollectionForAction(col)
    setShowDeleteConfirm(true)
  }, [])

  const openShare = useCallback((col: WishlistCollection) => {
    setActiveCollectionForAction(col)
    setShowShareModal(true)
  }, [])

  // ─── Hydration skeleton ────────────────────────────────────────

  if (!mounted) {
    return (
      <div className="r56-wishlist-root">
        <div className="r56-skeleton rounded-2xl p-6 glassmorphism-strong animate-pulse">
          <div className="h-6 w-48 bg-muted rounded mb-4" />
          <div className="h-40 bg-muted rounded mb-4" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  // ─── Render: Empty state ───────────────────────────────────────

  if (collections.length === 0) {
    return (
      <div className="r56-wishlist-root">
        <div className="r56-empty-state rounded-2xl overflow-hidden glassmorphism-strong relative">
          <div className="absolute inset-0 gradient-mesh opacity-10 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center justify-center py-16 px-6">
            <motion.div variants={emptyBounceVariants} animate="bounce" className="r56-empty-icon mb-6">
              <Heart className="h-16 w-16 text-muted-foreground/30" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <h3 className="r56-empty-title text-lg font-bold text-foreground">Your Wishlist is Empty</h3>
              <p className="r56-empty-desc text-sm text-muted-foreground mt-1.5">
                Start saving your favorite products to keep track of them.
              </p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-6 w-full max-w-xs">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="r56-start-shopping-btn w-full h-11 text-sm font-bold rounded-xl bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 text-white"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Start Shopping
              </Button>
            </motion.div>

            {/* Create collection dialog still works */}
            <div className="r56-empty-actions flex items-center gap-3 mt-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(true)}
                  className="r56-create-btn"
                >
                  <FolderPlus className="h-3.5 w-3.5 mr-1" />
                  Create Collection
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Create Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="r56-create-modal sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm">Create New Collection</DialogTitle>
              <DialogDescription className="text-xs">
                Organize your wishlist into themed collections.
              </DialogDescription>
            </DialogHeader>
            <input
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') createCollection()
              }}
              placeholder="Collection name..."
              className="r56-create-input w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              autoFocus
            />
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={createCollection} disabled={!newCollectionName.trim()}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // ─── Render: Main ─────────────────────────────────────────────

  return (
    <div className="r56-wishlist-root">
      <div className="r56-wishlist-container r62-card-lift rounded-2xl overflow-hidden glassmorphism-strong relative">
        {/* Background mesh */}
        <div className="absolute inset-0 gradient-mesh opacity-10 pointer-events-none" />

        <div className="relative z-10">
          {/* ─── Header ─── */}
          <div className="r56-header flex items-center justify-between p-4 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="r56-header-icon h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-rose-500 flex items-center justify-center">
                <Heart className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h3 className="r56-title text-sm font-bold r62-heading-gradient">Wishlist Manager</h3>
                <p className="r56-subtitle text-[10px] text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {collections.length} collections · {allItems.length} items
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {priceDropCount > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Badge className="r56-alert-badge text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 h-5 px-1.5">
                    <BellRing className="h-2.5 w-2.5 mr-0.5" />
                    {priceDropCount} alert{priceDropCount > 1 ? 's' : ''}
                  </Badge>
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(true)}
                  className="r56-add-collection-btn h-7 min-h-[44px] min-w-[44px] px-2 text-[10px] font-semibold"
                >
                  <Plus className="h-3 w-3 mr-0.5" />
                  New
                </Button>
              </motion.div>
            </div>
          </div>

          {/* ─── Collection Cards Grid ─── */}
          <div className="r56-collections-section px-4 pb-4">
            <div className="flex items-center justify-between mb-2.5">
              <p className="r56-section-label text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Grid3X3 className="h-3 w-3" />
                Collections
              </p>
            </div>
            <div className="r56-collections-grid grid grid-cols-2 sm:grid-cols-3 gap-3">
              {collections.map((col, i) => (
                <CollectionCard
                  key={col.id}
                  collection={col}
                  isActive={col.id === activeCollectionId}
                  onClick={() => setActiveCollectionId(col.id)}
                  onSetDefault={() => setDefaultCollection(col.id)}
                  onRename={() => openRename(col)}
                  onDelete={() => openDelete(col)}
                  index={i}
                />
              ))}
              {/* Create new collection card */}
              <motion.div
                variants={collectionCardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: collections.length * 0.08, ...springConfig }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
              >
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="r56-create-card w-full h-full min-h-[140px] rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 bg-primary/5 hover:bg-primary/10 flex flex-col items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="h-6 w-6 text-primary/50" />
                  <span className="text-[11px] font-semibold text-primary/60">New Collection</span>
                </button>
              </motion.div>
            </div>
          </div>

          {/* ─── Active Collection: Recently Added Timeline ─── */}
          {activeCollection && recentlyAdded.length > 0 && (
            <div className="r56-recently-added-section px-4 pb-4">
              <div className="flex items-center justify-between mb-2.5">
                <p className="r56-section-label text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Recently Added
                </p>
              </div>
              <div className="r56-recent-strip relative">
                <div className="r56-recent-scroll flex gap-3 overflow-x-auto hide-scrollbar pb-2" ref={recentlyAddedRef}>
                  {recentlyAdded.map((item, i) => (
                    <motion.div
                      key={item.id}
                      variants={stripSlideVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ scale: 1.05, y: -3 }}
                      className="r56-recent-card flex-shrink-0 w-28 rounded-xl overflow-hidden border border-border/50 bg-card cursor-pointer"
                      onClick={() => viewDetail(item)}
                    >
                      <div
                        className="r56-recent-img w-full h-20"
                        style={{
                          background: item.image
                            ? `url(${item.image}) center/cover`
                            : activeCollection.coverGradient,
                        }}
                      />
                      <div className="p-2">
                        <p className="r56-recent-name text-[10px] font-semibold truncate">{item.name}</p>
                        <p className="r56-recent-price text-[10px] font-bold text-primary mt-0.5">
                          {formatBRL(item.price)}
                        </p>
                        <p className="r56-recent-date text-[8px] text-muted-foreground mt-0.5">
                          {formatDate(item.addedDate)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── Active Collection: Toolbar ─── */}
          {activeCollection && (
            <div className="r56-toolbar px-4 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="r56-search-wrapper relative flex-1 min-w-[150px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search items..."
                    className="r56-search-input w-full h-8 pl-8 pr-3 rounded-lg border border-border/50 bg-background/50 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  )}
                </div>

                {/* Sort */}
                <div className="relative">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <button
                      onClick={() => {
                        setShowSortDropdown(!showSortDropdown)
                        setShowFilterDropdown(false)
                      }}
                      className="r56-sort-btn flex items-center gap-1 h-8 px-2.5 rounded-lg border border-border/50 bg-background/50 text-[10px] font-medium hover:border-primary/30 text-muted-foreground transition-colors"
                    >
                      <ArrowUpDown className="h-3 w-3" />
                      Sort
                      <ChevronDown className="h-2.5 w-2.5" />
                    </button>
                  </motion.div>
                  <AnimatePresence>
                    {showSortDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="r56-sort-dropdown absolute top-full mt-1 right-0 z-30 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[160px]"
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setSortBy(opt.value)
                              setShowSortDropdown(false)
                            }}
                            className={`r56-sort-option w-full text-left px-3 py-1.5 text-[11px] hover:bg-accent transition-colors ${
                              sortBy === opt.value ? 'text-primary font-semibold' : 'text-muted-foreground'
                            }`}
                          >
                            {opt.label}
                            {sortBy === opt.value && <Check className="h-3 w-3 inline ml-auto" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Filter */}
                {uniqueStores.length > 1 && (
                  <div className="relative">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <button
                        onClick={() => {
                          setShowFilterDropdown(!showFilterDropdown)
                          setShowSortDropdown(false)
                        }}
                        className="r56-filter-btn flex items-center gap-1 h-8 px-2.5 rounded-lg border border-border/50 bg-background/50 text-[10px] font-medium hover:border-primary/30 text-muted-foreground transition-colors"
                      >
                        <Filter className="h-3 w-3" />
                        Filter
                        {filterStore !== 'all' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </button>
                    </motion.div>
                    <AnimatePresence>
                      {showFilterDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="r56-filter-dropdown absolute top-full mt-1 right-0 z-30 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[160px]"
                        >
                          <button
                            onClick={() => {
                              setFilterStore('all')
                              setShowFilterDropdown(false)
                            }}
                            className={`r56-filter-option w-full text-left px-3 py-1.5 text-[11px] hover:bg-accent transition-colors ${
                              filterStore === 'all' ? 'text-primary font-semibold' : 'text-muted-foreground'
                            }`}
                          >
                            All Stores
                          </button>
                          {uniqueStores.map((store) => (
                            <button
                              key={store}
                              onClick={() => {
                                setFilterStore(store)
                                setShowFilterDropdown(false)
                              }}
                              className={`r56-filter-option w-full text-left px-3 py-1.5 text-[11px] hover:bg-accent transition-colors truncate ${
                                filterStore === store ? 'text-primary font-semibold' : 'text-muted-foreground'
                              }`}
                            >
                              {store}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* View mode toggle */}
                <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`r56-view-btn p-1.5 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-card shadow-sm' : ''
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`r56-view-btn p-1.5 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-card shadow-sm' : ''
                    }`}
                  >
                    <Grid3X3 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Collection actions + Batch actions */}
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                {/* Share */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => openShare(activeCollection)}
                    className="r56-action-btn flex items-center gap-1 px-2 py-1 min-h-[44px] rounded-md text-[10px] font-medium bg-background/40 border border-border/50 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Share2 className="h-2.5 w-2.5" />
                    Share
                  </button>
                </motion.div>

                {/* Select All */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={toggleSelectAll}
                    className="r56-action-btn flex items-center gap-1 px-2 py-1 min-h-[44px] rounded-md text-[10px] font-medium bg-background/40 border border-border/50 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {selectedItems.size === allItems.length && allItems.length > 0 ? (
                      <Check className="h-2.5 w-2.5 text-primary" />
                    ) : (
                      <div className="r56-mini-checkbox w-3 h-3 rounded-sm border-2 border-current" />
                    )}
                    {selectedItems.size === allItems.length ? 'Deselect' : 'Select All'}
                  </button>
                </motion.div>

                {/* Batch actions */}
                <AnimatePresence>
                  {selectedItems.size > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center gap-2"
                    >
                      <Badge className="r56-selected-badge text-[9px] h-5 px-1.5">
                        {selectedItems.size} selected
                      </Badge>

                      {collections.length > 1 && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <button
                            onClick={() => setShowMoveModal(true)}
                            className="r56-batch-btn flex items-center gap-1 px-2 py-1 min-h-[44px] rounded-md text-[10px] font-medium bg-primary/10 border border-primary/30 text-primary transition-colors"
                          >
                            <MoveRight className="h-2.5 w-2.5" />
                            Move
                          </button>
                        </motion.div>
                      )}

                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <button
                          onClick={removeSelected}
                          className="r56-batch-btn flex items-center gap-1 px-2 py-1 min-h-[44px] rounded-md text-[10px] font-medium bg-red-500/10 border border-red-500/30 text-red-500 transition-colors"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                          Remove
                        </button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <button
                          onClick={addAllToCart}
                          className="r56-batch-btn flex items-center gap-1 px-2 py-1 min-h-[44px] rounded-md text-[10px] font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 transition-colors"
                        >
                          <ShoppingCart className="h-2.5 w-2.5" />
                          Add to Cart
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* ─── Product Grid ─── */}
          {activeCollection && (
            <div className="r56-products-section px-4 pb-4">
              {filteredAndSortedItems.length === 0 ? (
                <div className="r56-no-results flex flex-col items-center justify-center py-12 text-center">
                  <Search className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="r56-no-results-title text-sm font-semibold text-muted-foreground">No items found</p>
                  <p className="r56-no-results-desc text-xs text-muted-foreground/60 mt-1">
                    Try adjusting your search or filters.
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="r56-products-grid grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <AnimatePresence mode="popLayout">
                    {filteredAndSortedItems.map((product, i) => (
                      <motion.div
                        key={product.id}
                        variants={productCardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ delay: i * 0.04, ...springConfig }}
                        className="r56-grid-card rounded-xl border border-border/50 bg-card overflow-hidden"
                      >
                        <div
                          className="r56-grid-img w-full h-28 cursor-pointer"
                          style={{
                            background: product.image
                              ? `url(${product.image}) center/cover`
                              : activeCollection.coverGradient,
                          }}
                          onClick={() => viewDetail(product)}
                        >
                          {/* Badges on image */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {product.originalPrice > product.price && (
                              <Badge className="r56-discount-badge text-[8px] bg-red-500/90 text-white h-4 px-1">
                                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                              </Badge>
                            )}
                            {product.priceDropped && product.targetPrice !== null && product.price <= product.targetPrice && (
                              <Badge className="r56-price-drop-badge text-[8px] bg-emerald-500/90 text-white h-4 px-1">
                                <TrendingDown className="h-2 w-2 mr-0.5" />
                                Alert!
                              </Badge>
                            )}
                          </div>
                          {/* Heart button */}
                          <div className="absolute top-2 right-2">
                            <HeartToggle
                              isFilled={true}
                              onToggle={() => toggleItemHeart(product.id)}
                            />
                          </div>
                        </div>
                        <div className="p-2.5">
                          <h4 className="r56-grid-name text-[11px] font-semibold truncate">{product.name}</h4>
                          <p className="r56-grid-store text-[9px] text-muted-foreground mt-0.5">{product.store}</p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="r56-grid-price text-xs font-bold text-primary">
                              {formatBRL(product.price)}
                            </span>
                            {product.originalPrice > product.price && (
                              <span className="r56-grid-original text-[9px] text-muted-foreground line-through">
                                {formatBRL(product.originalPrice)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-0.5">
                              <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
                              <span className="text-[9px] text-muted-foreground">{product.rating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <button
                                  onClick={() => openPriceAlert(product)}
                                  className="r56-grid-alert-btn p-1 rounded-md hover:bg-muted transition-colors"
                                  title="Set Price Alert"
                                >
                                  <Bell className="h-3 w-3 text-amber-500" />
                                </button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <button
                                  onClick={() => viewDetail(product)}
                                  className="r56-grid-view-btn p-1 rounded-md hover:bg-muted transition-colors"
                                  title="Quick View"
                                >
                                  <Eye className="h-3 w-3 text-muted-foreground" />
                                </button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <button
                                  onClick={() => removeItem(product.id)}
                                  className="r56-grid-remove-btn p-1 rounded-md hover:bg-red-500/10 transition-colors"
                                  title="Remove"
                                >
                                  <Trash2 className="h-3 w-3 text-red-400" />
                                </button>
                              </motion.div>
                            </div>
                          </div>
                          {product.targetPrice !== null && (
                            <div className="r56-grid-target flex items-center gap-1 mt-1.5 pt-1.5 border-t border-border/30">
                              <BellRing className="h-2.5 w-2.5 text-amber-500" />
                              <span className="text-[8px] text-amber-600 dark:text-amber-400">
                                Target: {formatBRL(product.targetPrice)}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="r56-products-list space-y-2">
                  <AnimatePresence mode="popLayout">
                    {filteredAndSortedItems.map((product, i) => (
                      <SwipeableProductCard
                        key={product.id}
                        product={product}
                        collection={activeCollection}
                        onRemove={removeItem}
                        onToggleHeart={toggleItemHeart}
                        onSetTargetPrice={setTargetPrice}
                        onViewDetail={viewDetail}
                        selected={selectedItems.has(product.id)}
                        onSelect={() => toggleSelectItem(product.id)}
                        index={i}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {/* ─── Recommendations Section ─── */}
          {recommendations.length > 0 && (
            <div className="r56-recommendations-section px-4 pb-4">
              <div className="flex items-center justify-between mb-2.5">
                <p className="r56-section-label text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                  <Gift className="h-3 w-3" />
                  Recommended for You
                </p>
                <span className="text-[9px] text-muted-foreground/60">Based on your wishlist</span>
              </div>
              <div className="r56-recommendations-scroll flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                {recommendations.map((rec, i) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    className="r56-recommendation-card flex-shrink-0 w-36 rounded-xl border border-border/50 bg-card overflow-hidden cursor-pointer"
                  >
                    <div
                      className="r56-rec-img w-full h-24"
                      style={{
                        background: `linear-gradient(135deg, ${
                          i % 2 === 0 ? '#059669, #0891b2' : '#d97706, #dc2626'
                        })`,
                      }}
                    />
                    <div className="p-2.5">
                      <p className="r56-rec-name text-[10px] font-semibold truncate">{rec.name}</p>
                      <p className="r56-rec-price text-[10px] font-bold text-primary mt-0.5">
                        {formatBRL(rec.price)}
                      </p>
                      <p className="r56-rec-reason text-[8px] text-muted-foreground mt-1 line-clamp-2">
                        {rec.reason}
                      </p>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-2">
                        <button className="r56-rec-add-btn w-full py-1 min-h-[44px] rounded-md bg-primary/10 text-primary text-[9px] font-semibold hover:bg-primary/20 transition-colors">
                          <Plus className="h-2.5 w-2.5 inline mr-0.5" />
                          Add to Wishlist
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Stats Footer ─── */}
          {activeCollection && (
            <div className="r56-stats-footer px-4 pb-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="r56-stat-value text-sm font-bold text-foreground">{allItems.length}</p>
                    <p className="r56-stat-label text-[9px] text-muted-foreground">Total Items</p>
                  </div>
                  <div className="w-px h-6 bg-border/50" />
                  <div className="text-center">
                    <p className="r56-stat-value text-sm font-bold text-foreground">
                      {formatBRL(allItems.reduce((s, i) => s + i.price, 0))}
                    </p>
                    <p className="r56-stat-label text-[9px] text-muted-foreground">Total Value</p>
                  </div>
                  <div className="w-px h-6 bg-border/50" />
                  <div className="text-center">
                    <p className="r56-stat-value text-sm font-bold text-amber-500">{totalPriceAlerts}</p>
                    <p className="r56-stat-label text-[9px] text-muted-foreground">Price Alerts</p>
                  </div>
                  <div className="w-px h-6 bg-border/50" />
                  <div className="text-center">
                    <p className="r56-stat-value text-sm font-bold text-emerald-500">
                      {allItems.filter((i) => i.originalPrice > i.price).length}
                    </p>
                    <p className="r56-stat-label text-[9px] text-muted-foreground">On Sale</p>
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addAllToCart}
                    className="r56-cart-all-btn h-8 min-h-[44px] text-[10px] font-semibold"
                  >
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Add All to Cart
                  </Button>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Toast Notification ─── */}
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="r56-toast fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-card border border-border shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Modals ─── */}

      {/* Create Collection Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="r56-create-modal sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Create New Collection</DialogTitle>
            <DialogDescription className="text-xs">
              Organize your wishlist into themed collections.
            </DialogDescription>
          </DialogHeader>
          <input
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') createCollection()
            }}
            placeholder="Collection name..."
            className="r56-create-input w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={createCollection} disabled={!newCollectionName.trim()}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Collection Modal */}
      <Dialog open={showRenameModal} onOpenChange={setShowRenameModal}>
        <DialogContent className="r56-rename-modal sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Rename Collection</DialogTitle>
            <DialogDescription className="text-xs">
              {activeCollectionForAction ? `Renaming "${activeCollectionForAction.name}"` : ''}
            </DialogDescription>
          </DialogHeader>
          <input
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && activeCollectionForAction) renameCollection(activeCollectionForAction)
            }}
            placeholder="New name..."
            className="r56-rename-input w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowRenameModal(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => activeCollectionForAction && renameCollection(activeCollectionForAction)}
              disabled={!renameName.trim()}
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="r56-delete-confirm-modal">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">Delete Collection?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              {activeCollectionForAction
                ? `This will permanently delete "${activeCollectionForAction.name}" and all its ${activeCollectionForAction.items.length} items. This action cannot be undone.`
                : 'This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="text-xs bg-destructive text-white hover:bg-destructive/90"
              onClick={() => activeCollectionForAction && deleteCollection(activeCollectionForAction.id)}
            >
              <Trash className="h-3.5 w-3.5 mr-1" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Price Alert Modal */}
      <PriceAlertModal
        product={activeProduct}
        onSet={setTargetPrice}
        open={showPriceAlertModal}
        onOpenChange={setShowPriceAlertModal}
      />

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={activeProduct}
        open={showQuickViewModal}
        onOpenChange={setShowQuickViewModal}
        onSetPriceAlert={openPriceAlert}
      />

      {/* Share Modal */}
      {activeCollectionForAction && (
        <ShareModal
          collectionName={activeCollectionForAction.name}
          open={showShareModal}
          onOpenChange={setShowShareModal}
        />
      )}

      {/* Move to Collection Modal */}
      <Dialog open={showMoveModal} onOpenChange={setShowMoveModal}>
        <DialogContent className="r56-move-modal sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Move Items</DialogTitle>
            <DialogDescription className="text-xs">
              Move {selectedItems.size} item(s) to another collection.
            </DialogDescription>
          </DialogHeader>
          <div className="r56-move-list space-y-2 py-2">
            {collections
              .filter((c) => c.id !== activeCollectionId)
              .map((col) => (
                <motion.div
                  key={col.id}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => setTargetCollectionId(col.id)}
                    className={`r56-move-option w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      targetCollectionId === col.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 hover:border-primary/30'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex-shrink-0"
                      style={{ background: col.coverGradient }}
                    />
                    <div className="text-left">
                      <p className="text-[11px] font-semibold">{col.name}</p>
                      <p className="text-[9px] text-muted-foreground">{col.items.length} items</p>
                    </div>
                  </button>
                </motion.div>
              ))}
            {collections.filter((c) => c.id !== activeCollectionId).length === 0 && (
              <div className="flex items-center gap-2 py-4 justify-center text-muted-foreground">
                <Info className="h-4 w-4" />
                <span className="text-xs">No other collections available</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowMoveModal(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => moveItemsToCollection(targetCollectionId)}
              disabled={!targetCollectionId}
            >
              <MoveRight className="h-3.5 w-3.5 mr-1" />
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
