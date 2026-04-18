'use client'

import { useMemo } from 'react'
import { X, Star, TrendingDown, Package, Clock, Check, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const gradients = [
  'from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30',
  'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30',
  'from-teal-100 to-cyan-200 dark:from-teal-900/30 dark:to-cyan-800/30',
]

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function BestIndicator({ label }: { label: string }) {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-full"
    >
      <Check className="h-2.5 w-2.5" />
      {label}
    </motion.span>
  )
}

export function ProductComparison() {
  const { compareProductIds, clearComparison, navigate, goBack, selectProduct } = useAppStore()

  // Get full product data from all available sources
  const products = useMemo(() => {
    // Try to match with fallback data in the app
    const allProducts: ProductData[] = [
      { id: 'p1', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Arroz Tio João 5kg', slug: 'arroz-tio-joao', description: 'Arroz tipo 1 premium, ideal para o dia a dia.', price: 24.90, comparePrice: 29.90, images: '[]', stock: 50, rating: 4.5, totalReviews: 23, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["5kg","1kg"]', category: 'FOOD' },
      { id: 'p2', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Feijão Carioca 1kg', slug: 'feijao-carioca', description: 'Feijão carioca selecionado de alta qualidade.', price: 8.90, comparePrice: null, images: '[]', stock: 80, rating: 4.3, totalReviews: 15, isFeatured: false, isNew: false, isOffer: false, tags: '[]', variations: '["1kg","500g"]', category: 'FOOD' },
      { id: 'p3', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Óleo de Soja 900ml', slug: 'oleo-soja', description: 'Óleo de soja puro para cozinhar.', price: 7.49, comparePrice: 8.99, images: '[]', stock: 40, rating: 4.1, totalReviews: 8, isFeatured: false, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'FOOD' },
      { id: 'p5', storeId: 's2', storeName: 'Açaí da Boa', storeLogo: null, name: 'Açaí 500ml', slug: 'acai-500ml', description: 'Açaí cremoso feito com frutas frescas do Pará.', price: 15.00, comparePrice: 18.00, images: '[]', stock: 100, rating: 4.9, totalReviews: 89, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["300ml","500ml","700ml"]', category: 'FOOD' },
      { id: 'p6', storeId: 's2', storeName: 'Açaí da Boa', storeLogo: null, name: 'Açaí Premium 700ml', slug: 'acai-premium-700ml', description: 'Açaí premium com frutas da estação.', price: 22.00, comparePrice: null, images: '[]', stock: 50, rating: 4.8, totalReviews: 45, isFeatured: true, isNew: true, isOffer: false, tags: '[]', variations: null, category: 'FOOD' },
      { id: 'p9', storeId: 's3', storeName: 'Agropecuária São Paulo', storeLogo: null, name: 'Adubo NPK 20kg', slug: 'adubo-npk', description: 'Adubo NPK para culturas diversas.', price: 89.90, comparePrice: null, images: '[]', stock: 25, rating: 4.4, totalReviews: 12, isFeatured: true, isNew: false, isOffer: false, tags: '[]', variations: null, category: 'AGRICULTURE' },
      { id: 'p13', storeId: 's4', storeName: 'Farmácia Vida', storeLogo: null, name: 'Vitamina C 500mg', slug: 'vitamina-c', description: 'Suplemento de vitamina C 500mg.', price: 35.00, comparePrice: 42.00, images: '[]', stock: 100, rating: 4.7, totalReviews: 34, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["500mg","1000mg"]', category: 'HEALTH' },
      { id: 'p17', storeId: 's5', storeName: 'Padaria Pão Quente', storeLogo: null, name: 'Pão Francês (6 un)', slug: 'pao-frances', description: 'Pão francês fresquinho saindo do forno.', price: 6.00, comparePrice: null, images: '[]', stock: 200, rating: 4.9, totalReviews: 120, isFeatured: true, isNew: false, isOffer: false, tags: '[]', variations: null, category: 'FOOD' },
    ]
    return compareProductIds.map(id => allProducts.find(p => p.id === id)).filter(Boolean) as ProductData[]
  }, [compareProductIds])

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">Nenhum produto selecionado</h2>
          <p className="text-sm text-muted-foreground mb-6">Selecione até 3 produtos para comparar</p>
          <Button onClick={() => navigate('home')} className="gap-2">
            Explorar produtos
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    )
  }

  // Compute best values
  const lowestPrice = Math.min(...products.map(p => p.price))
  const highestRating = Math.max(...products.map(p => p.rating))
  const highestStock = Math.max(...products.map(p => p.stock))
  const highestReviews = Math.max(...products.map(p => p.totalReviews))
  const lowestDelivery = Math.min(...products.map(p => p.price > 50 ? 0 : 5))

  const getDeliveryLabel = (product: ProductData) => {
    if (product.price >= 50) return 'Grátis'
    return 'R$ 5,00'
  }

  const getDeliveryTime = (product: ProductData) => {
    const times = ['30-45 min', '40-60 min', '25-35 min']
    return times[products.indexOf(product) % times.length] || '30-50 min'
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
              <p className="text-xs text-muted-foreground">{products.length} de 3 selecionados</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-destructive h-8 text-xs" onClick={() => { clearComparison(); toast.success('Comparação limpa!') }}>
            <X className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={products.map(p => p.id).join(',')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Product cards at top */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.map((product, i) => {
                const gradient = gradients[i % gradients.length]
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="cursor-pointer"
                    onClick={() => {
                      selectProduct(product)
                      navigate('product')
                    }}
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-shadow border-border/50">
                      <div className={`aspect-square flex items-center justify-center bg-gradient-to-br ${gradient} relative`}>
                        <div className="h-14 w-14 rounded-2xl bg-white/70 dark:bg-black/20 flex items-center justify-center shadow-sm">
                          <Package className="h-8 w-8 text-primary/60" />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            useAppStore.getState().toggleCompareProduct(product.id)
                            toast.info('Produto removido da comparação')
                          }}
                          className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                        {product.comparePrice && (
                          <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0 text-[9px] px-1.5 py-0">
                            <TrendingDown className="h-2.5 w-2.5 mr-0.5" />
                            -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
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
                )
              })}
            </div>

            {/* Comparison Table */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_repeat(auto-fit,minmax(100px,1fr))] sm:grid-cols-[120px_1fr_1fr_1fr] bg-secondary/50 border-b border-border">
                  <div className="p-3 text-xs font-semibold text-muted-foreground">
                    Atributo
                  </div>
                  {products.map(product => (
                    <div key={product.id} className="p-3 text-xs font-semibold text-center border-l border-border">
                      {product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name}
                    </div>
                  ))}
                </div>

                {/* Rows */}
                {[
                  {
                    label: 'Preço',
                    render: (p: ProductData) => (
                      <div className="text-center">
                        <p className="text-sm font-bold text-primary">{formatBRL(p.price)}</p>
                        {p.comparePrice && (
                          <p className="text-[10px] text-muted-foreground line-through">{formatBRL(p.comparePrice)}</p>
                        )}
                        {p.price === lowestPrice && <BestIndicator label="Menor preço" />}
                      </div>
                    ),
                  },
                  {
                    label: 'Avaliação',
                    render: (p: ProductData) => (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-bold">{p.rating}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{p.totalReviews} avaliações</p>
                        {p.rating === highestRating && <BestIndicator label="Mais bem avaliado" />}
                      </div>
                    ),
                  },
                  {
                    label: 'Estoque',
                    render: (p: ProductData) => (
                      <div className="text-center">
                        <p className={`text-sm font-bold ${getStockColor(p.stock)}`}>{p.stock} un.</p>
                        <p className={`text-[10px] ${getStockColor(p.stock)}`}>{getStockLabel(p.stock)}</p>
                        {p.stock === highestStock && p.stock > 0 && <BestIndicator label="Mais disponível" />}
                      </div>
                    ),
                  },
                  {
                    label: 'Entrega',
                    render: (p: ProductData) => (
                      <div className="text-center">
                        <p className={`text-sm font-bold ${p.price >= 50 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                          {getDeliveryLabel(p)}
                        </p>
                        <div className="flex items-center justify-center gap-0.5 text-[10px] text-muted-foreground mt-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {getDeliveryTime(p)}
                        </div>
                        {p.price >= 50 && lowestDelivery === 0 && <BestIndicator label="Frete grátis" />}
                      </div>
                    ),
                  },
                  {
                    label: 'Loja',
                    render: (p: ProductData) => (
                      <div className="text-center">
                        <p className="text-xs font-semibold">{p.storeName}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{p.category === 'FOOD' ? 'Alimentação' : p.category === 'AGRICULTURE' ? 'Agricultura' : p.category === 'HEALTH' ? 'Saúde' : p.category}</p>
                      </div>
                    ),
                  },
                  {
                    label: 'Popularidade',
                    render: (p: ProductData) => (
                      <div className="text-center">
                        <div className="h-2 bg-muted rounded-full overflow-hidden mx-2">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                            style={{ width: `${Math.min((p.totalReviews / highestReviews) * 100, 100)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">{p.totalReviews} reviews</p>
                        {p.totalReviews === highestReviews && <BestIndicator label="Mais popular" />}
                      </div>
                    ),
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[1fr_repeat(auto-fit,minmax(100px,1fr))] sm:grid-cols-[120px_1fr_1fr_1fr] border-b border-border last:border-b-0"
                  >
                    <div className="p-3 text-xs font-medium text-muted-foreground flex items-center border-r border-border/50">
                      {row.label}
                    </div>
                    {products.map(product => (
                      <div key={product.id} className="p-3 border-l border-border/50">
                        {row.render(product)}
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Add more tip */}
            {products.length < 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4"
              >
                <p className="text-sm text-muted-foreground">
                  Você pode comparar até <span className="font-semibold text-primary">3 produtos</span>
                </p>
                <Button variant="outline" size="sm" className="mt-2 h-8 text-xs" onClick={() => navigate('search')}>
                  + Adicionar mais
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
