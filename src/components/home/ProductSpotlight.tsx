'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Heart,
  ShoppingCart,
  Clock,
  Store,
  ChevronRight,
  Sparkles,
  Tag,
  Zap,
  Eye,
} from 'lucide-react';
import { cachedFetch } from '@/lib/api-cache';
import { useAppStore } from '@/store/useAppStore';
import { TiltCard } from '@/components/effects/TiltCard';

/** Rotating gradient backgrounds for each product card */
const BG_GRADIENTS = [
  'from-violet-500 via-purple-500 to-fuchsia-500',
  'from-amber-400 via-orange-500 to-red-500',
  'from-emerald-400 via-teal-500 to-cyan-500',
  'from-blue-400 via-indigo-500 to-purple-500',
  'from-rose-400 via-pink-500 to-red-400',
  'from-lime-400 via-green-500 to-emerald-500',
  'from-sky-400 via-blue-500 to-indigo-500',
  'from-orange-400 via-amber-500 to-yellow-500',
];

/** Decorative emoji per product slot */
const SLOT_EMOJIS = ['📱', '🎧', '🧴', '💊', '👟', '🎮', '💄', '🏠', '⌚', '🥤'];

/** Auto-rotation interval in milliseconds */
const ROTATION_INTERVAL = 8000;

/** Maximum visible dot indicators */
const MAX_DOTS = 5;

export function ProductSpotlight() {
  const [products, setProducts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const selectProduct = useAppStore((s) => s.selectProduct);
  const addToCart = useAppStore((s) => s.addToCart);
  const toggleFavoriteProduct = useAppStore((s) => s.toggleFavoriteProduct);
  const favoriteProductIds = useAppStore((s) => s.favoriteProductIds);
  const navigate = useAppStore((s) => s.navigate);

  // Fetch featured products from API
  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        const data = (await cachedFetch(
          '/api/products?isFeatured=true&limit=10'
        )) as any;
        if (!cancelled && data?.products?.length > 0) {
          setProducts(data.products);
        }
      } catch {
        // Empty fallback — component returns null
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-rotate through products
  useEffect(() => {
    if (products.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [products.length]);

  // --- Derived values ---
  const product = products[currentIndex] as any;
  const isFav = product ? favoriteProductIds.has(product.id) : false;

  const discount = useMemo(() => {
    if (!product?.comparePrice || product.comparePrice <= product.price) return 0;
    return Math.round(
      ((product.comparePrice - product.price) / product.comparePrice) * 100
    );
  }, [product?.comparePrice, product?.price]);

  const gradient = BG_GRADIENTS[currentIndex % BG_GRADIENTS.length];
  const emoji = SLOT_EMOJIS[currentIndex % SLOT_EMOJIS.length];

  // --- Handlers ---
  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addToCart(product, product.storeName || 'Loja', 1);
  }, [product, addToCart]);

  const handleViewProduct = useCallback(() => {
    if (!product) return;
    selectProduct(product);
    navigate('product');
  }, [product, selectProduct, navigate]);

  const handleToggleFavorite = useCallback(() => {
    if (!product) return;
    toggleFavoriteProduct(product.id);
  }, [product, toggleFavoriteProduct]);

  const handleDotClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // --- Guards ---
  if (!isLoaded || products.length === 0 || !product) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl r62-card-lift">
      <AnimatePresence mode="wait">
        <motion.div
          key={product.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, type: 'spring' as const, stiffness: 260, damping: 24 }}
          className="relative"
        >
          <TiltCard className="rounded-2xl" maxTilt={4} glare={true}>
          {/* ── Background gradient card ── */}
          <div
            className={`bg-gradient-to-br ${gradient} p-5 sm:p-6 rounded-t-2xl relative overflow-hidden`}
          >
            {/* Noise texture overlay */}
            <div className="absolute inset-0 opacity-20 r60-spotlight-noise pointer-events-none" />

            {/* Floating particles */}
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-2 h-2 rounded-full bg-white/30 pointer-events-none"
                style={{
                  top: `${20 + ((i * 37) % 60)}%`,
                  left: `${10 + ((i * 53) % 80)}%`,
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.2, 0.6, 0.2],
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: 'easeInOut',
                }}
              />
            ))}

            {/* ── Badge row ── */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <Sparkles className="h-3.5 w-3.5 text-white" />
                <span className="text-white text-xs font-semibold">Destaque</span>
              </div>

              {discount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                  className="bg-white text-red-600 rounded-full px-2.5 py-0.5 text-xs font-bold flex items-center gap-0.5"
                >
                  <Tag className="h-3 w-3" />
                  -{discount}%
                </motion.div>
              )}

              {product.isNew && (
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-0.5">
                  <Zap className="h-3 w-3 text-yellow-200" />
                  <span className="text-white text-[10px] font-semibold">Novo</span>
                </div>
              )}
            </div>

            {/* ── Product info ── */}
            <div className="relative z-10">
              <h3 className="text-white text-lg sm:text-xl font-bold mb-1 line-clamp-2 leading-tight r62-heading-gradient">
                {product.name}
              </h3>

              {/* Store + rating row */}
              <div className="flex items-center gap-2 mb-4">
                <Store className="h-3.5 w-3.5 text-white/80 shrink-0" />
                <span className="text-white/80 text-xs truncate">{product.storeName}</span>
                <span className="text-white/50 shrink-0">•</span>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Star className="h-3 w-3 text-amber-300 fill-amber-300" />
                  <span className="text-white text-xs font-medium">{product.rating ?? '-'}</span>
                  {product.totalReviews > 0 && (
                    <span className="text-white/60 text-[10px]">
                      ({product.totalReviews})
                    </span>
                  )}
                </div>
              </div>

              {/* ── Price ── */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-white text-2xl sm:text-3xl font-extrabold">
                  R$ {product.price.toFixed(2)}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-white/60 text-sm line-through">
                    R$ {product.comparePrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* ── Action buttons ── */}
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAddToCart}
                  className="flex-1 bg-white text-gray-900 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold active:scale-95 transition-transform"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Adicionar
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleToggleFavorite}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm active:scale-95 transition-all ${
                    isFav
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-white/20 text-white'
                  }`}
                  aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                  <Heart className={`h-5 w-5 transition-transform ${isFav ? 'fill-white scale-110' : ''}`} />
                </motion.button>
              </div>
            </div>

            {/* ── Decorative large emoji ── */}
            <motion.div
              className="absolute -right-4 -bottom-4 text-[100px] sm:text-[140px] opacity-20 select-none pointer-events-none"
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut' as const,
              }}
            >
              {emoji}
            </motion.div>
          </div>

            {/* ── Bottom CTA ── */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleViewProduct}
              className="w-full flex items-center justify-between bg-white rounded-b-2xl p-3 active:scale-[0.98] transition-transform border border-gray-100"
            >
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Ver detalhes do produto
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </motion.button>
          </TiltCard>

          {/* ── Dot indicators ── */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {products.slice(0, MAX_DOTS).map((_, i) => (
              <button
                key={`dot-${i}`}
                onClick={() => handleDotClick(i)}
                aria-label={`Produto ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'bg-gray-900 w-4 h-1.5'
                    : 'bg-gray-300 w-1.5 h-1.5'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
