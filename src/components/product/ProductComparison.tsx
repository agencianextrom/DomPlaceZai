'use client'

import { useMemo, useState, useEffect, Fragment } from 'react'
import { X, Star, TrendingDown, Package, Clock, Check, ChevronRight, Share2, Trophy, Award, Trash2, ShoppingCart, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { resolveProductImage } from '@/lib/product-images'

const gradients = [
  'from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30',
  'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30',
  'from-teal-100 to-cyan-200 dark:from-teal-900/30 dark:to-cyan-800/30',
  'from-rose-100 to-pink-200 dark:from-rose-900/30 dark:to-pink-800/30',
]

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function BestIndicator({ label }: { label: string }) {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
      className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-full r26-badge-wobble"
    >
      <Trophy className="h-2.5 w-2.5" />
      {label}
    </motion.span>
  )
}

function AnimatedBar({ value, max, color, isWinner }: { value: number; max: number; color: string; isWinner: boolean }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="relative h-2.5 bg-muted rounded-full overflow-hidden mx-2 mt-1">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        className={`h-full rounded-full ${color} ${isWinner ? 'shadow-sm r26-stagger-fill relative overflow-hidden' : 'r26-stagger-fill relative overflow-hidden'}`}
      />
    </div>
  )
}

function VsBadge() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 20, delay: 0.3 }}
      className="relative flex items-center justify-center my-2 r26-vs-triple-ring"
    >
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
        className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30 z-10"
      >
        <span className="text-white font-black text-sm tracking-tighter">VS</span>
      </motion.div>
    </motion.div>
  )
}

function CategoryLabel({ category }: { category: string }) {
  const labels: Record<string, string> = {
    FOOD: 'Alimentação', HEALTH: 'Saúde', AGRICULTURE: 'Agricultura', ELECTRONICS: 'Eletrônicos',
    BEAUTY: 'Beleza', ANIMALS: 'Animais', FASHION: 'Moda', SERVICES: 'Serviços',
    HOME_GARDEN: 'Casa & Jardim', EDUCATION: 'Educação', SPORTS: 'Esportes', OTHER: 'Outros',
  }
  return <>{labels[category] || category}</>
}

export function ProductComparison() {
  const { compareProductIds, clearComparison, navigate, goBack, selectProduct, addToCart } = useAppStore()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [apiProducts, setApiProducts] = useState<ProductData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch products from API
  useEffect(() => {
    if (compareProductIds.length === 0) {
      setIsLoading(false)
      return
    }
    let cancelled = false
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const promises = compareProductIds.map(id => fetch(`/api/products/${id}`).then(r => r.json() as Promise<any>).catch(() => null))
        const results = await Promise.all(promises)
        if (!cancelled) {
          const valid = results.filter(Boolean)
          setApiProducts(valid)
        }
      } catch {
        setApiProducts([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchProducts()
    return () => { cancelled = true }
  }, [compareProductIds])

  const products = useMemo(() => {
    if (apiProducts.length > 0) {
      return compareProductIds.map(id => apiProducts.find((p: ProductData) => p.id === id)).filter(Boolean) as ProductData[]
    }
    // Fallback: check recentlyViewed
    return compareProductIds.map(id => useAppStore.getState().recentlyViewed.find(p => p.id === id)).filter(Boolean) as ProductData[]
  }, [compareProductIds, apiProducts])

  const handleClearAll = () => {
    clearComparison()
    setShowClearConfirm(false)
    toast.success('Comparação limpa!')
  }

  const handleAddToCart = (product: ProductData) => {
    addToCart(product, product.storeName || 'Loja')
    toast.success(`${product.name} adicionado ao carrinho!`)
  }

  if (products.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-lg font-bold mb-2">Nenhum produto selecionado</h2>
          <p className="text-sm text-muted-foreground mb-6">Selecione até 4 produtos para comparar lado a lado</p>
          <Button onClick={() => navigate('home')} className="gap-2">
            Explorar produtos
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    )
  }

  // Compute best values
  const lowestPrice = products.length > 0 ? Math.min(...products.map(p => p.price)) : 0
  const highestRating = products.length > 0 ? Math.max(...products.map(p => p.rating)) : 0
  const highestStock = products.length > 0 ? Math.max(...products.map(p => p.stock)) : 0
  const highestReviews = products.length > 0 ? Math.max(...products.map(p => p.totalReviews)) : 0

  const getDeliveryLabel = (product: ProductData) => {
    if ((product.freeDeliveryAbove !== null && product.freeDeliveryAbove !== undefined && product.price >= product.freeDeliveryAbove) || product.storeDeliveryFee === 0) return 'Grátis'
    return formatBRL(product.storeDeliveryFee || 5)
  }

  const getStockLabel = (stock: number) => {
    if (stock > 100) return 'Em estoque'
    if (stock > 30) return 'Poucas unidades'
    if (stock > 0) return 'Últimas unidades!'
    return 'Indisponível'
  }

  const getStockColor = (stock: number) => {
    if (stock > 100) return 'text-emerald-600 dark:text-emerald-400'
    if (stock > 30) return 'text-amber-600 dark:text-amber-400'
    if (stock > 0) return 'text-red-600 dark:text-red-400'
    return 'text-muted-foreground'
  }

  // Responsive grid columns based on product count
  const gridCols = products.length <= 2 ? 'minmax(0, 1fr)' : 'minmax(0, 1fr)'
  const labelCol = products.length <= 2 ? '140px' : '110px'

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border -mx-4 px-4 -mt-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={goBack} className="h-10 w-10">
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Comparar Produtos</h1>
              <p className="text-xs text-muted-foreground">{products.length} de 4 selecionados</p>
            </div>
          </div>
          <AnimatePresence mode="wait">
            {showClearConfirm ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-1.5"
              >
                <Button
                  size="sm"
                  className="h-8 text-xs bg-red-500 hover:bg-red-600 text-white gap-1"
                  onClick={handleClearAll}
                >
                  <Trash2 className="h-3 w-3" />
                  Confirmar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancelar
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="clear"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive h-8 text-xs gap-1"
                  onClick={() => setShowClearConfirm(true)}
                >
                  <X className="h-3 w-3" />
                  Limpar
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto">
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {Array.from({ length: compareProductIds.length || 2 }).map((_, i) => (
                <Skeleton key={i} className="flex-1 aspect-[4/5] rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-xl" />
          </div>
        )}

        <AnimatePresence mode="wait">
          {!isLoading && products.length > 0 && (
            <motion.div
              key={products.map(p => p.id).join(',')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Product cards at top — with VS badges between them */}
              <div className="flex items-start gap-0 overflow-x-auto hide-scrollbar pb-2">
                {products.map((product, i) => {
                  const gradient = gradients[i % gradients.length]
                  const imgUrl = resolveProductImage({ slug: product.slug, category: product.category, images: product.images })
                  return (
                    <div key={product.id} className="flex items-center flex-1 min-w-[140px] max-w-[200px]">
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: i * 0.15, type: 'spring' as const, stiffness: 320, damping: 22 }}
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => {
                          selectProduct(product)
                          navigate('product')
                        }}
                      >
                        <Card className="overflow-hidden border-border/50 group">
                          <div className={`aspect-[4/5] flex items-center justify-center bg-gradient-to-br ${gradient} relative transition-transform duration-300 group-hover:scale-[1.03] group-hover:shadow-lg overflow-hidden`}>
                            {imgUrl ? (
                              <img src={imgUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                            ) : (
                              <div className="h-14 w-14 rounded-2xl bg-white/70 dark:bg-black/20 flex items-center justify-center shadow-sm">
                                <Package className="h-8 w-8 text-primary/60" />
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                useAppStore.getState().toggleCompareProduct(product.id)
                                toast.info('Produto removido da comparação')
                              }}
                              className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors z-10"
                            >
                              <X className="h-3 w-3 text-white" />
                            </button>
                            {product.comparePrice && (
                              <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0 text-[9px] px-1.5 py-0 z-10">
                                <TrendingDown className="h-2.5 w-2.5 mr-0.5" />
                                -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                              </Badge>
                            )}
                            {product.isOffer && (
                              <Badge className="absolute bottom-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[8px] px-1.5 py-0 z-10">
                                <Zap className="h-2 w-2 mr-0.5 fill-white" />
                                Oferta
                              </Badge>
                            )}
                          </div>
                          <CardContent className="p-3">
                            <p className="text-[10px] text-primary font-medium">{product.storeName}</p>
                            <p className="text-xs font-semibold mt-0.5 line-clamp-2">{product.name}</p>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-sm font-bold text-primary">{formatBRL(product.price)}</span>
                              {product.comparePrice && (
                                <span className="text-[10px] text-muted-foreground line-through">{formatBRL(product.comparePrice)}</span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                      {/* VS badge between products */}
                      {i < products.length - 1 && (
                        <div className="flex flex-col items-center justify-center px-1 pt-20 shrink-0">
                          <VsBadge />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Detailed Comparison Table — desktop: table, mobile: card stack */}
              {/* Mobile: horizontal scrollable comparison cards */}
              <div className="lg:hidden">
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 snap-x snap-mandatory -mx-4 px-4">
                  {products.map((product, i) => {
                    const gradient = gradients[i % gradients.length]
                    const imgUrl = resolveProductImage({ slug: product.slug, category: product.category, images: product.images })
                    return (
                      <Fragment key={product.id}>
                        {/* VS badge between cards */}
                        {i > 0 && (
                          <div className="flex flex-col items-center justify-center shrink-0 pt-8">
                            <VsBadge />
                          </div>
                        )}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.15, type: 'spring' as const, stiffness: 320, damping: 22 }}
                          className="flex-shrink-0 w-[80vw] max-w-[280px] snap-start"
                        >
                          <Card className="overflow-hidden">
                            <div className={`aspect-[3/4] flex items-center justify-center bg-gradient-to-br ${gradient} relative`}>
                              {imgUrl ? (
                                <img src={imgUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                              ) : (
                                <div className="h-14 w-14 rounded-2xl bg-white/70 dark:bg-black/20 flex items-center justify-center shadow-sm">
                                  <Package className="h-8 w-8 text-primary/60" />
                                </div>
                              )}
                              {product.comparePrice && (
                                <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0 text-[9px] px-1.5 py-0 z-10">
                                  <TrendingDown className="h-2.5 w-2.5 mr-0.5" />
                                  -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                                </Badge>
                              )}
                              {/* Best value indicators */}
                              {product.price === lowestPrice && products.length > 1 && (
                                <div className="absolute top-2 right-2 z-10">
                                  <BestIndicator label="Menor preço" />
                                </div>
                              )}
                              {product.rating === highestRating && products.length > 1 && (
                                <div className="absolute top-8 right-2 z-10">
                                  <BestIndicator label="Mais bem avaliado" />
                                </div>
                              )}
                            </div>
                            <CardContent className="p-3 space-y-2">
                              <p className="text-[10px] text-primary font-medium truncate">{product.storeName}</p>
                              <p className="text-xs font-semibold line-clamp-2">{product.name}</p>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-lg font-bold text-primary">{formatBRL(product.price)}</span>
                                {product.comparePrice && (
                                  <span className="text-[10px] text-muted-foreground line-through">{formatBRL(product.comparePrice)}</span>
                                )}
                              </div>
                              {/* Compact specs */}
                              <div className="space-y-1.5 text-[10px]">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Avaliação</span>
                                  <span className="font-bold flex items-center gap-0.5">
                                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                    {product.rating} ({product.totalReviews})
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Estoque</span>
                                  <span className={`font-bold ${getStockColor(product.stock)}`}>{getStockLabel(product.stock)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Entrega</span>
                                  <span className="font-bold">{getDeliveryLabel(product)}</span>
                                </div>
                              </div>
                              <motion.div whileTap={{ scale: 0.95 }}>
                                <Button
                                  size="sm"
                                  className="w-full h-11 text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 active:scale-95 transition-transform"
                                  onClick={(e) => { e.stopPropagation(); handleAddToCart(product) }}
                                >
                                  <ShoppingCart className="h-3.5 w-3.5" />
                                  Adicionar ao Carrinho
                                </Button>
                              </motion.div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Fragment>
                    )
                  })}
                </div>
              </div>
              {/* Desktop: table comparison */}
              <Card className="overflow-hidden hidden lg:block">
                <CardContent className="p-0 overflow-x-auto">
                  <div className="min-w-[400px]">
                    {/* Table header */}
                    <div className="grid bg-secondary/50 border-b border-border r26-header-gradient" style={{ gridTemplateColumns: `${labelCol} repeat(${products.length}, ${gridCols})` }}>
                      <div className="p-3 text-xs font-semibold text-muted-foreground">
                        Atributo
                      </div>
                      {products.map(product => (
                        <div key={product.id} className="p-3 text-xs font-semibold text-center border-l border-border">
                          {product.name.length > 18 ? product.name.substring(0, 18) + '...' : product.name}
                        </div>
                      ))}
                    </div>

                    {/* Rows */}
                    {[
                      {
                        label: 'Preço',
                        icon: '💰',
                        render: (p: ProductData) => (
                          <div className="text-center">
                            <p className="text-sm font-bold text-primary">{formatBRL(p.price)}</p>
                            {p.comparePrice && (
                              <p className="text-[10px] text-muted-foreground line-through">{formatBRL(p.comparePrice)}</p>
                            )}
                            {p.price === lowestPrice && products.length > 1 && <BestIndicator label="Menor preço" />}
                          </div>
                        ),
                      },
                      {
                        label: 'Avaliação',
                        icon: '⭐',
                        render: (p: ProductData) => (
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-0.5">
                              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                              <span className="text-sm font-bold">{p.rating}</span>
                            </div>
                            <div className="relative h-2.5 bg-muted rounded-full overflow-hidden mx-2 mt-1">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(p.rating / 5) * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                                className={`h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 r26-stagger-fill relative overflow-hidden ${p.rating === highestRating && products.length > 1 ? 'shadow-sm shadow-amber-400/50' : ''}`}
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{p.totalReviews} avaliações</p>
                            {p.rating === highestRating && products.length > 1 && <BestIndicator label="Mais bem avaliado" />}
                          </div>
                        ),
                      },
                      {
                        label: 'Reviews',
                        icon: '📝',
                        render: (p: ProductData) => (
                          <div className="text-center">
                            <AnimatedBar value={p.totalReviews} max={Math.max(highestReviews, 1)} color="bg-gradient-to-r from-primary to-emerald-400" isWinner={p.totalReviews === highestReviews && products.length > 1} />
                            <p className="text-[10px] text-muted-foreground mt-1">{p.totalReviews} reviews</p>
                            {p.totalReviews === highestReviews && products.length > 1 && <BestIndicator label="Mais popular" />}
                          </div>
                        ),
                      },
                      {
                        label: 'Estoque',
                        icon: '📦',
                        render: (p: ProductData) => (
                          <div className="text-center">
                            <p className={`text-sm font-bold ${getStockColor(p.stock)}`}>{p.stock} un.</p>
                            <AnimatedBar value={p.stock} max={Math.max(highestStock, 1)} color="bg-gradient-to-r from-emerald-400 to-teal-400" isWinner={p.stock === highestStock && p.stock > 0 && products.length > 1} />
                            <p className={`text-[10px] ${getStockColor(p.stock)}`}>{getStockLabel(p.stock)}</p>
                            {p.stock === highestStock && p.stock > 0 && products.length > 1 && <BestIndicator label="Mais disponível" />}
                          </div>
                        ),
                      },
                      {
                        label: 'Entrega',
                        icon: '🚚',
                        render: (p: ProductData) => {
                          const isFree = (p.freeDeliveryAbove !== null && p.freeDeliveryAbove !== undefined && p.price >= p.freeDeliveryAbove) || p.storeDeliveryFee === 0
                          return (
                            <div className="text-center">
                              <p className={`text-sm font-bold ${isFree ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                                {getDeliveryLabel(p)}
                              </p>
                              <div className="flex items-center justify-center gap-0.5 text-[10px] text-muted-foreground mt-0.5">
                                <Clock className="h-2.5 w-2.5" />
                                30-45 min
                              </div>
                              {isFree && lowestPrice > 0 && <BestIndicator label="Frete grátis" />}
                            </div>
                          )
                        },
                      },
                      {
                        label: 'Loja',
                        icon: '🏪',
                        render: (p: ProductData) => (
                          <div className="text-center">
                            <p className="text-xs font-semibold">{p.storeName}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5"><CategoryLabel category={p.category} /></p>
                          </div>
                        ),
                      },
                      {
                        label: 'Ação',
                        icon: '🛒',
                        render: (p: ProductData) => (
                          <div className="flex justify-center">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                size="sm"
                                className="min-h-[44px] text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1 active:scale-95 transition-transform"
                                onClick={(e) => { e.stopPropagation(); handleAddToCart(p) }}
                              >
                                <ShoppingCart className="h-3.5 w-3.5" />
                                Adicionar
                              </Button>
                            </motion.div>
                          </div>
                        ),
                      },
                    ].map((row, rowIdx) => (
                      <motion.div
                        key={row.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + rowIdx * 0.05 }}
                        className="grid border-b border-border last:border-b-0"
                        style={{ gridTemplateColumns: `${labelCol} repeat(${products.length}, ${gridCols})` }}
                      >
                        <div className="p-3 text-xs font-medium text-muted-foreground flex items-center gap-1.5 border-r border-border/50">
                          <span>{row.icon}</span>
                          {row.label}
                        </div>
                        {products.map(product => (
                          <div key={product.id} className="p-3 border-l border-border/50">
                            {row.render(product)}
                          </div>
                        ))}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Verdict summary */}
              {products.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-emerald-500/5 border-primary/20 overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <Award className="h-5 w-5 text-primary" />
                        </motion.div>
                        <h3 className="font-bold text-sm r26-verdict-shimmer">Veredicto</h3>
                      </div>
                      {(() => {
                        const winners: string[] = []
                        const cheapest = products.reduce((a, b) => a.price < b.price ? a : b)
                        const bestRated = products.reduce((a, b) => a.rating > b.rating ? a : b)
                        const mostPopular = products.reduce((a, b) => a.totalReviews > b.totalReviews ? a : b)
                        if (cheapest.id !== bestRated.id) {
                          winners.push(`${cheapest.name} é melhor em preço, ${bestRated.name} em avaliação`)
                        } else {
                          winners.push(`${cheapest.name} lidera em preço e avaliação`)
                        }
                        if (mostPopular.id !== cheapest.id && mostPopular.id !== bestRated.id) {
                          winners.push(`e ${mostPopular.name} em popularidade`)
                        }
                        return <p className="text-sm text-muted-foreground leading-relaxed">{winners.join(', ')}</p>
                      })()}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Share comparison button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs r26-share-glow"
                  onClick={() => {
                    const lines = products.map(p =>
                      `🛍 ${p.name}\n   Preço: ${formatBRL(p.price)}${p.comparePrice ? ` ~~${formatBRL(p.comparePrice)}~~` : ''}\n   ⭐ ${p.rating} (${p.totalReviews} avaliações)\n   🏪 ${p.storeName}\n   📦 Estoque: ${p.stock} un.`
                    )
                    const text = `📋 Comparação DomPlace\n${'═'.repeat(30)}\n\n${lines.join('\n\n')}`
                    navigator.clipboard.writeText(text)
                    toast.success('Comparação copiada!')
                  }}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Compartilhar comparação
                </Button>
              </motion.div>

              {/* Add more tip */}
              {products.length < 4 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-4"
                >
                  <p className="text-sm text-muted-foreground">
                    Você pode comparar até <span className="font-semibold text-primary">4 produtos</span>
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 h-8 text-xs" onClick={() => navigate('search')}>
                    <Check className="h-3 w-3 mr-1" />
                    Adicionar mais
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
