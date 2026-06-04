'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Package, Sparkles, Check, Tag, Utensils, Coffee, Droplets, Scissors, HeartPulse, PawPrint } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { resolveProductImage } from '@/lib/product-images'
import { formatBRL } from '@/lib/format'
import { useAppStore, type ProductData } from '@/store/useAppStore'

/* ────────────────────────── Types ────────────────────────── */

interface BundleItem {
  id: string
  name: string
  slug: string
  category: string
  price: number
  images: string
  storeId: string
  storeName: string
  emoji: string
}

interface BundleCombo {
  id: string
  category: string
  label: string
  items: BundleItem[]
  discountPercent: number
  tagline: string
}

interface ProductBundleDealProps {
  category: string
  currentProductId: string
}

/* ────────────────────────── Category emoji map ────────────────────────── */

const categoryEmojiMap: Record<string, string> = {
  FOOD: '🍔',
  BEVERAGES: '🥤',
  CLEANING: '🧹',
  PET: '🐕',
  HEALTH: '💊',
  BEAUTY: '💅',
  AGRICULTURE: '🌱',
  ELECTRONICS: '📱',
}

/* ────────────────────────── Mock bundle combos by category ────────────────────────── */

const BUNDLE_COMBOS: BundleCombo[] = [
  {
    id: 'bundle-food-bev',
    category: 'FOOD+BEVERAGES',
    label: 'Comida + Bebida',
    tagline: 'O combo perfeito para o almoço!',
    discountPercent: 12,
    items: [
      {
        id: 'bundle-arroz-1',
        name: 'Arroz Tio João 5kg',
        slug: 'arroz-tio-joao-5kg',
        category: 'FOOD',
        price: 24.90,
        images: '',
        storeId: 'mercado-do-ze',
        storeName: 'Mercado do Zé',
        emoji: '🍚',
      },
      {
        id: 'bundle-feijao-1',
        name: 'Feijão Carioca 1kg',
        slug: 'feijao-carioca-1kg',
        category: 'FOOD',
        price: 9.90,
        images: '',
        storeId: 'mercado-do-ze',
        storeName: 'Mercado do Zé',
        emoji: '🫘',
      },
      {
        id: 'bundle-leite-1',
        name: 'Leite Integral 1L',
        slug: 'leite-integral-1l',
        category: 'FOOD',
        price: 6.49,
        images: '',
        storeId: 'mercado-do-ze',
        storeName: 'Mercado do Zé',
        emoji: '🥛',
      },
      {
        id: 'bundle-cafe-1',
        name: 'Café Torrado Moído 500g',
        slug: 'cafe-torrado-moido-500g',
        category: 'BEVERAGES',
        price: 18.90,
        images: '',
        storeId: 'mercado-do-ze',
        storeName: 'Mercado do Zé',
        emoji: '☕',
      },
    ],
  },
  {
    id: 'bundle-cleaning',
    category: 'CLEANING',
    label: 'Kit Limpeza Completa',
    tagline: 'Sua casa brilhando por menos!',
    discountPercent: 15,
    items: [
      {
        id: 'bundle-detergente-1',
        name: 'Detergente Neutro 500ml',
        slug: '',
        category: 'CLEANING',
        price: 2.99,
        images: '',
        storeId: 'mercado-do-ze',
        storeName: 'Mercado do Zé',
        emoji: '🧴',
      },
      {
        id: 'bundle-amaciante-1',
        name: 'Amaciante Suave 2L',
        slug: '',
        category: 'CLEANING',
        price: 14.90,
        images: '',
        storeId: 'mercado-do-ze',
        storeName: 'Mercado do Zé',
        emoji: '🫧',
      },
      {
        id: 'bundle-desinf-1',
        name: 'Desinfetante Lavanda 1L',
        slug: '',
        category: 'CLEANING',
        price: 8.49,
        images: '',
        storeId: 'mercado-do-ze',
        storeName: 'Mercado do Zé',
        emoji: '✨',
      },
    ],
  },
  {
    id: 'bundle-pet',
    category: 'PET',
    label: 'Kit Pet Feliz',
    tagline: 'Tudo pro seu melhor amigo!',
    discountPercent: 10,
    items: [
      {
        id: 'bundle-racao-1',
        name: 'Ração Premium Cães 15kg',
        slug: 'racao-premium-caes-15kg',
        category: 'ANIMALS',
        price: 89.90,
        images: '',
        storeId: 'pet-shop-amigo-fiel',
        storeName: 'Pet Shop Amigo Fiel',
        emoji: '🦴',
      },
      {
        id: 'bundle-coleira-1',
        name: 'Coleira Anti-Pulgas',
        slug: 'coleira-anti-pulgas',
        category: 'ANIMALS',
        price: 32.90,
        images: '',
        storeId: 'pet-shop-amigo-fiel',
        storeName: 'Pet Shop Amigo Fiel',
        emoji: '🐾',
      },
      {
        id: 'bundle-brinquedo-1',
        name: 'Brinquedo Corda Resistente',
        slug: 'brinquedo-corda',
        category: 'ANIMALS',
        price: 15.90,
        images: '',
        storeId: 'pet-shop-amigo-fiel',
        storeName: 'Pet Shop Amigo Fiel',
        emoji: '🧸',
      },
    ],
  },
  {
    id: 'bundle-health',
    category: 'HEALTH',
    label: 'Kit Saúde e Bem-Estar',
    tagline: 'Cuide de você com desconto!',
    discountPercent: 18,
    items: [
      {
        id: 'bundle-vitc-1',
        name: 'Vitamina C 500mg 60 cáps',
        slug: 'vitamina-c-500mg-60caps',
        category: 'HEALTH',
        price: 34.90,
        images: '',
        storeId: 'farmacia-vida',
        storeName: 'Farmácia Vida',
        emoji: '🍊',
      },
      {
        id: 'bundle-solar-1',
        name: 'Protetor Solar FPS50 120ml',
        slug: 'protetor-solar-fps50-120ml',
        category: 'HEALTH',
        price: 42.90,
        images: '',
        storeId: 'farmacia-vida',
        storeName: 'Farmácia Vida',
        emoji: '☀️',
      },
      {
        id: 'bundle-bepantol-1',
        name: 'Pomada Bepantol 50g',
        slug: 'pomada-bepantol-50g',
        category: 'HEALTH',
        price: 22.90,
        images: '',
        storeId: 'farmacia-vida',
        storeName: 'Farmácia Vida',
        emoji: '🩹',
      },
    ],
  },
]

/* ────────────────────────── Animation variants ────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 340,
      damping: 22,
    },
  },
}

const sparkleVariants = {
  hidden: { opacity: 0, scale: 0, rotate: 0 },
  visible: (i: number) => ({
    opacity: [0, 1, 0.6, 0] as number[],
    scale: [0, 1.2, 0.8, 0] as number[],
    rotate: [0, 180, 360] as number[],
    transition: {
      delay: i * 0.6,
      duration: 2.2,
      repeat: Infinity,
      repeatDelay: 3 + i * 0.5,
      ease: 'easeInOut' as const,
    },
  }),
}

const savingsVariants = {
  hidden: { opacity: 0, scale: 0.7, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 18,
    },
  },
}

const checkPopVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 500,
      damping: 14,
    },
  },
}

/* ────────────────────────── Sparkle Particle ────────────────────────── */

function SparkleParticle({ index }: { index: number }) {
  const positions = [
    { x: '10%', y: '20%' },
    { x: '85%', y: '15%' },
    { x: '70%', y: '80%' },
    { x: '20%', y: '75%' },
    { x: '50%', y: '5%' },
    { x: '40%', y: '90%' },
  ]
  const colors = [
    'text-amber-400',
    'text-emerald-400',
    'text-sky-400',
    'text-pink-400',
    'text-violet-400',
    'text-orange-400',
  ]
  const pos = positions[index % positions.length]
  const color = colors[index % colors.length]

  return (
    <motion.div
      custom={index}
      variants={sparkleVariants}
      initial="hidden"
      animate="visible"
      className={`absolute ${color} pointer-events-none`}
      style={{ left: pos.x, top: pos.y }}
    >
      <Sparkles className="h-3.5 w-3.5" />
    </motion.div>
  )
}

/* ────────────────────────── Bundle Item Card ────────────────────────── */

function BundleItemCard({
  item,
  index,
  isInCart,
}: {
  item: BundleItem
  index: number
  isInCart: boolean
}) {
  const [imgError, setImgError] = useState(false)

  const imageUrl = !imgError
    ? resolveProductImage({ slug: item.slug, category: item.category, images: item.images })
    : null

  const gradients = [
    'from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30',
    'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30',
    'from-teal-100 to-cyan-200 dark:from-teal-900/30 dark:to-cyan-800/30',
    'from-rose-100 to-pink-200 dark:from-rose-900/30 dark:to-pink-800/30',
  ]
  const gradient = gradients[index % gradients.length]

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3, boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12)' }}
      className="relative flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card transition-colors hover:border-primary/20 group"
    >
      {/* Cart checkmark overlay */}
      <AnimatePresence>
        {isInCart && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute inset-0 z-10 bg-primary/10 backdrop-blur-[1px] rounded-xl flex items-center justify-center"
          >
            <motion.div
              variants={checkPopVariants}
              initial="hidden"
              animate="visible"
              className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg r29-item-check"
              style={{ boxShadow: '0 4px 16px rgba(34,197,94,0.3)' }}
            >
              <Check className="h-5 w-5" strokeWidth={3} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product image / emoji fallback */}
      <div className="relative h-14 w-14 rounded-xl overflow-hidden shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="text-2xl">{item.emoji}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold line-clamp-1 leading-tight">{item.name}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-xs font-bold text-primary">{formatBRL(item.price)}</span>
        </div>
      </div>

      {/* Quantity badge */}
      <div className="shrink-0 h-6 w-6 rounded-full bg-muted/60 flex items-center justify-center">
        <span className="text-[10px] font-bold text-muted-foreground">1x</span>
      </div>
    </motion.div>
  )
}

/* ────────────────────────── Main Component ────────────────────────── */

export function ProductBundleDeal({ category, currentProductId }: ProductBundleDealProps) {
  const { addToCart, cartItems } = useAppStore()
  const [addedToCart, setAddedToCart] = useState(false)

  // Find the best matching bundle for the current category
  const bundle = useMemo(() => {
    // Try exact match first
    let match = BUNDLE_COMBOS.find(b => b.category === category)
    // Fallback to category contains match
    if (!match) {
      match = BUNDLE_COMBOS.find(b =>
        b.items.some(item =>
          item.category === category ||
          b.category.toLowerCase().includes(category.toLowerCase())
        )
      )
    }
    // Filter out the current product from bundle items if present
    if (match) {
      return {
        ...match,
        items: match.items.filter(item => item.id !== currentProductId),
      }
    }
    return match
  }, [category, currentProductId])

  // Calculate bundle prices
  const originalTotal = useMemo(
    () => (bundle?.items.reduce((sum, item) => sum + item.price, 0) || 0),
    [bundle]
  )

  const discountPercent = bundle?.discountPercent || 0
  const bundlePrice = useMemo(
    () => Math.round(originalTotal * (1 - discountPercent / 100) * 100) / 100,
    [originalTotal, discountPercent]
  )
  const savings = useMemo(() => Math.round((originalTotal - bundlePrice) * 100) / 100, [originalTotal, bundlePrice])

  // Check which bundle items are already in the cart
  const bundleItemIds = useMemo(() => bundle?.items.map(i => i.id) || [], [bundle])
  const cartProductIds = useMemo(() => new Set(cartItems.map(c => c.productId)), [cartItems])
  const cartStatusMap = useMemo(
    () => new Map(bundleItemIds.map(id => [id, cartProductIds.has(id)])),
    [bundleItemIds, cartProductIds]
  )

  // Handle add all to cart
  const handleAddBundleToCart = useCallback(() => {
    if (!bundle) return
    bundle.items.forEach(item => {
      const mockProduct: ProductData = {
        id: item.id,
        storeId: item.storeId,
        storeName: item.storeName,
        name: item.name,
        slug: item.slug,
        description: null,
        price: item.price,
        comparePrice: null,
        images: item.images,
        stock: 10,
        rating: 4.5,
        totalReviews: 12,
        isFeatured: false,
        isNew: false,
        isOffer: false,
        tags: '',
        variations: null,
        category: item.category,
      }
      addToCart(mockProduct, item.storeName, 1)
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 3000)
  }, [bundle, addToCart])

  // Don't render if no bundle or no items left after filtering
  if (!bundle || bundle.items.length === 0) return null

  const allInCart = bundle.items.every(item => cartStatusMap.get(item.id))
  const cartCount = bundle.items.filter(item => cartStatusMap.get(item.id)).length

  return (
    <section className="w-full relative overflow-hidden">
      {/* Inject shimmer styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
@keyframes bundle-shimmer {
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(200%) skewX(-15deg); }
}
.bundle-shimmer-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.15) 55%, transparent 60%);
  animation: bundle-shimmer 3s ease-in-out infinite;
  pointer-events: none;
  z-index: 2;
  border-radius: inherit;
}
@keyframes savings-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
.savings-pulse {
  animation: savings-pulse 2s ease-in-out infinite;
}`,
      }} />

      {/* 6 floating sparkle particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <SparkleParticle key={`sparkle-${i}`} index={i} />
      ))}

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 260, damping: 20 }}
        className="relative rounded-2xl border border-border/60 bg-gradient-to-br from-amber-50/40 via-orange-50/30 to-emerald-50/20 dark:from-amber-950/20 dark:via-orange-950/15 dark:to-emerald-950/10 overflow-hidden"
      >
        {/* Shimmer overlay */}
        <div className="bundle-shimmer-overlay absolute inset-0 pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 p-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: [0, 6, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
              className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md"
              style={{ boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}
            >
              <Package className="h-4.5 w-4.5 text-white" />
            </motion.div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight r29-bundle-shimmer">
                {bundle.label}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{bundle.tagline}</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 text-[10px] font-bold px-2.5 py-0.5 shadow-sm savings-pulse">
            <Tag className="h-2.5 w-2.5 mr-0.5" />
            -{discountPercent}%
          </Badge>
        </div>

        {/* Bundle items */}
        <div className="relative z-10 px-4 pb-2">
          <motion.div
            className="space-y-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {bundle.items.map((item, idx) => (
              <BundleItemCard
                key={item.id}
                item={item}
                index={idx}
                isInCart={cartStatusMap.get(item.id) || false}
              />
            ))}
          </motion.div>
        </div>

        {/* Pricing summary + CTA */}
        <div className="relative z-10 px-4 pt-3 pb-4">
          <div className="flex items-end justify-between mb-3 p-3 rounded-xl bg-white/60 dark:bg-black/20 border border-border/30">
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Preço dos itens separados
              </p>
              <p className="text-sm text-muted-foreground line-through mt-0.5 r29-price-slash">
                {formatBRL(originalTotal)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                Preço do kit
              </p>
              <motion.p
                className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 350, damping: 18, delay: 0.3 }}
              >
                {formatBRL(bundlePrice)}
              </motion.p>
            </div>
          </div>

          {/* Savings badge */}
          <motion.div
            variants={savingsVariants}
            initial="hidden"
            animate="visible"
            className="mb-3"
          >
            <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Você economiza {formatBRL(savings)}!
              </span>
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            </div>
          </motion.div>

          {/* Cart status text */}
          {cartCount > 0 && !allInCart && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] text-muted-foreground text-center mb-2"
            >
              {cartCount} de {bundle.items.length} itens já no carrinho
            </motion.p>
          )}

          {/* CTA Button */}
          <AnimatePresence mode="wait">
            {addedToCart || allInCart ? (
              <motion.div
                key="added"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center gap-2 font-semibold text-sm"
                style={{ boxShadow: '0 4px 16px rgba(16,185,129,0.25)' }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 500, damping: 12 }}
                >
                  <Check className="h-4 w-4" strokeWidth={3} />
                </motion.div>
                Kit completo no carrinho!
              </motion.div>
            ) : (
              <motion.div
                key="add"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleAddBundleToCart}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm gap-2 shadow-md transition-all r29-cta-glow"
                    style={{ boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Comprar Kit Completo — {formatBRL(bundlePrice)}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Item count badge */}
          <div className="flex items-center justify-center gap-1 mt-2">
            <Package className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              {bundle.items.length} itens incluídos
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
