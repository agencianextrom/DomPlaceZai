'use client'

import { useState } from 'react'
import { Share2, Heart, GitCompareArrows, Link2, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { toast } from 'sonner'

interface ProductShareBarProps {
  product: ProductData
}

export function ProductShareBar({ product }: ProductShareBarProps) {
  const { toggleFavoriteProduct, isFavoriteProduct, toggleCompareProduct, compareProductIds, navigate } = useAppStore()
  const [linkCopied, setLinkCopied] = useState(false)

  const isFav = isFavoriteProduct(product.id)
  const isComparing = compareProductIds.includes(product.id)

  const heartBounce = isFav ? { scale: [1, 1.4, 0.9, 1.15, 1], transition: { duration: 0.6, type: 'spring' as const, stiffness: 400, damping: 10 } } : {}

  const copySuccessVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } },
    exit: { scale: 0, rotate: 180, transition: { duration: 0.2 } },
  }

  const compareShimmer = {
    animate: {
      background: ['rgba(245,158,11,0.1)', 'rgba(245,158,11,0.25)', 'rgba(245,158,11,0.1)'],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
    },
  }
  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Confira ${product.name} no DomPlace!`,
      url: typeof window !== 'undefined' ? `${window.location.origin}/product/${product.slug}` : '',
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled or fallback
        await copyToClipboard(shareData.url)
      }
    } else {
      await copyToClipboard(shareData.url)
    }
  }

  const handleCopyLink = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/product/${product.slug}` : ''
    await copyToClipboard(url)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setLinkCopied(true)
      toast.success('Link copiado!', { description: 'Cole no navegador para ver o produto' })
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      toast.error('Erro ao copiar link')
    }
  }

  const handleWishlist = () => {
    toggleFavoriteProduct(product.id)
    toast.success(isFav ? 'Removido dos favoritos' : 'Adicionado aos favoritos ❤️')
  }

  const handleCompare = () => {
    if (isComparing) {
      toast.info('Produto já está na comparação')
      return
    }
    if (compareProductIds.length >= 4) {
      toast.error('Máximo de 4 produtos para comparar')
      return
    }
    toggleCompareProduct(product.id)
    toast.success('Adicionado à comparação')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 25, delay: 0.05 }}
      className="share-bar-glass rounded-2xl border border-white/20 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg p-1.5"
    >
      <div className="flex items-center justify-around gap-1">
        {/* Share with glow */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleShare}
          className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors group share-btn-glow"
          aria-label="Compartilhar"
        >
          <motion.div
            whileHover={{ rotate: -12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all"
          >
            <Share2 className="h-4 w-4 text-primary" />
          </motion.div>
          <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary transition-colors">
            Compartilhar
          </span>
        </motion.button>

        {/* Wishlist with bounce */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleWishlist}
          className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors group wishlist-btn-glow"
          aria-label="Favoritar"
        >
          <motion.div
            whileTap={{ scale: 1.3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            className="h-8 w-8 rounded-full bg-gradient-to-br from-red-500/10 to-red-500/5 flex items-center justify-center group-hover:from-red-500/20 group-hover:to-red-500/10 transition-all"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isFav ? 'filled' : 'outline'}
                initial={{ scale: 0.5, rotate: -15 }}
                animate={{ scale: 1, rotate: 0, ...heartBounce }}
                exit={{ scale: 0.5, rotate: 15 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${
                    isFav
                      ? 'fill-red-500 text-red-500'
                      : 'text-red-400 group-hover:text-red-500'
                  }`}
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>
          <span className={`text-[10px] font-medium transition-colors ${
            isFav ? 'text-red-500' : 'text-muted-foreground group-hover:text-red-500'
          }`}>
            {isFav ? 'Salvo' : 'Favoritar'}
          </span>
        </motion.button>

        {/* Compare with shimmer */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleCompare}
          className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors group compare-btn-shimmer ${
            isComparing ? 'bg-primary/10' : 'hover:bg-amber-500/10'
          }`}
          aria-label="Comparar"
        >
          <motion.div
            className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
              isComparing
                ? 'bg-primary/20'
                : 'bg-gradient-to-br from-amber-500/10 to-amber-500/5 group-hover:from-amber-500/20 group-hover:to-amber-500/10'
            }`}
          >
            <motion.div
              animate={isComparing ? { rotate: [0, -8, 8, -4, 0] } : {}}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <GitCompareArrows
                className={`h-4 w-4 transition-colors ${
                  isComparing ? 'text-primary' : 'text-amber-500 group-hover:text-amber-600'
                }`}
              />
            </motion.div>
          </motion.div>
          <span className={`text-[10px] font-medium transition-colors ${
            isComparing ? 'text-primary' : 'text-muted-foreground group-hover:text-amber-600'
          }`}>
            {isComparing ? 'Comparando' : 'Comparar'}
          </span>
        </motion.button>

        {/* Copy Link with success animation */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleCopyLink}
          className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors group copy-btn-glow"
          aria-label="Copiar link"
        >
          <motion.div
            className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 flex items-center justify-center group-hover:from-emerald-500/20 group-hover:to-emerald-500/10 transition-all"
          >
            <AnimatePresence mode="wait">
              {linkCopied ? (
                <motion.div
                  key="check"
                  variants={copySuccessVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Check className="h-4 w-4 text-emerald-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="link"
                  variants={copySuccessVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Link2 className="h-4 w-4 text-emerald-500 group-hover:text-emerald-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <span className="text-[10px] font-medium text-muted-foreground group-hover:text-emerald-600 transition-colors">
            {linkCopied ? 'Copiado!' : 'Copiar link'}
          </span>
        </motion.button>
      </div>
    </motion.div>
  )
}
