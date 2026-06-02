'use client'

import { useState, useEffect, useMemo } from 'react'
import { CalendarDays, Clock, Share2, ShoppingCart, Tag, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { resolveProductImage } from '@/lib/product-images'
import { toast } from 'sonner'

const weekendProducts: (ProductData & { discount: number })[] = [
  {
    id: 'we1', storeId: 's1', storeName: 'Mercado do Ze', storeLogo: null,
    name: 'Cesta de Frutas Especial', slug: 'cesta-frutas', description: 'Cesta com frutas frescas selecionadas.',
    price: 39.90, comparePrice: 59.90, images: '[]', stock: 30, rating: 4.8, totalReviews: 45,
    isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'FOOD', discount: 33,
  },
  {
    id: 'we2', storeId: 's2', storeName: 'Acai da Boa', storeLogo: null,
    name: 'Acai Família 2L', slug: 'acai-familia-2l', description: 'Acai cremoso 2 litros para toda a familia.',
    price: 49.90, comparePrice: 69.90, images: '[]', stock: 20, rating: 4.9, totalReviews: 78,
    isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'FOOD', discount: 29,
  },
  {
    id: 'we3', storeId: 's5', storeName: 'Padaria Pao Quente', storeLogo: null,
    name: 'Kit Churrasco para 8', slug: 'kit-churrasco', description: 'Pao, linguica, carvao e muito mais.',
    price: 89.90, comparePrice: 129.90, images: '[]', stock: 15, rating: 4.7, totalReviews: 34,
    isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'FOOD', discount: 31,
  },
  {
    id: 'we4', storeId: 's3', storeName: 'Agropecuaria SP', storeLogo: null,
    name: 'Mudas de Hortaliças (12 un)', slug: 'mudas-hortalicas', description: 'Kit com 12 mudas variadas.',
    price: 24.90, comparePrice: 39.90, images: '[]', stock: 40, rating: 4.5, totalReviews: 22,
    isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'AGRICULTURE', discount: 38,
  },
]

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const categoryIcons: Record<string, string> = {
  FOOD: 'frutas',
  AGRICULTURE: 'mudas',
}

const productGradients = [
  'from-amber-200/60 to-orange-200/60 dark:from-amber-800/30 dark:to-orange-800/30',
  'from-orange-200/60 to-red-200/60 dark:from-orange-800/30 dark:to-red-800/30',
  'from-yellow-200/60 to-amber-200/60 dark:from-yellow-800/30 dark:to-amber-800/30',
  'from-rose-200/60 to-amber-200/60 dark:from-rose-800/30 dark:to-amber-800/30',
]

const productEmojis: Record<string, string> = {
  FOOD: 'fruit',
  AGRICULTURE: 'seedling',
}

function useWeekendCountdown() {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isWeekend, setIsWeekend] = useState(false)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const day = now.getDay() // 0=Sun, 6=Sat
      const isWE = day === 0 || day === 6
      setIsWeekend(isWE)

      let target = new Date(now)
      if (isWE) {
        // Count to end of Sunday (23:59:59)
        if (day === 6) {
          target.setDate(target.getDate() + 1)
        }
        target.setHours(23, 59, 59, 999)
      } else {
        // Count to start of Saturday (00:00:00)
        const daysUntilSat = 6 - day
        target.setDate(target.getDate() + daysUntilSat)
        target.setHours(0, 0, 0, 0)
      }

      const diff = Math.max(0, target.getTime() - now.getTime())
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return { countdown, isWeekend }
}

export function WeekendSpecials() {
  const { addToCart, selectProduct, navigate } = useAppStore()
  const { countdown, isWeekend } = useWeekendCountdown()
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative rounded-2xl overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 opacity-[0.07] dark:opacity-[0.15]" />
        <div className="absolute inset-0 border border-amber-300/30 dark:border-amber-700/30 rounded-2xl" />

        <div className="relative bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-900/10 dark:to-orange-900/10 rounded-2xl p-4 sm:p-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg"
              >
                <CalendarDays className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <h2 className="font-bold text-base sm:text-lg flex items-center gap-1.5">
                  <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    Ofertas de Fim de Semana
                  </span>
                  <Sparkles className="h-4 w-4 text-amber-500" />
                </h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {isWeekend
                    ? 'As ofertas estao no ar! Aproveite ate domingo'
                    : 'Promocoes exclusivas que comecam no sabado'}
                </p>
              </div>
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 hidden sm:block" />
              <div className="flex items-center gap-1 bg-white/90 dark:bg-card/90 backdrop-blur-sm rounded-xl px-3 py-2 border border-amber-200/50 dark:border-amber-800/30 shadow-sm">
                {countdown.days > 0 && (
                  <>
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold text-amber-700 dark:text-amber-300 tabular-nums">
                        {pad(countdown.days)}
                      </span>
                      <span className="text-[8px] text-muted-foreground">dias</span>
                    </div>
                    <span className="text-amber-400 font-bold mx-0.5">:</span>
                  </>
                )}
                {[
                  { value: pad(countdown.hours), label: 'h' },
                  { value: pad(countdown.minutes), label: 'm' },
                  { value: pad(countdown.seconds), label: 's' },
                ].map((unit, idx) => (
                  <span key={unit.label} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold text-amber-700 dark:text-amber-300 tabular-nums">
                        {unit.value}
                      </span>
                      <span className="text-[8px] text-muted-foreground">{unit.label}</span>
                    </div>
                    {idx < 2 && <span className="text-amber-400 font-bold mx-0.5">:</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Product cards grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {weekendProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
              >
                <Card className="overflow-hidden h-full hover:shadow-lg transition-all border-amber-200/30 dark:border-amber-800/20 group cursor-pointer" onClick={() => { selectProduct(product); navigate('product') }}>
                  <CardContent className="p-0 h-full flex flex-col">
                    {/* Image area */}
                    <div className={`relative aspect-[4/3] flex items-center justify-center bg-gradient-to-br ${productGradients[idx % productGradients.length]} overflow-hidden`}>
                      {(() => {
                        const imgUrl = resolveProductImage({ slug: product.slug, category: product.category, images: product.images })
                        return imgUrl ? (
                          <img src={imgUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} loading="lazy" />
                        ) : null
                      })()}
                      <motion.div
                        className="h-14 w-14 rounded-2xl bg-white/70 dark:bg-black/20 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform z-10"
                      >
                        <span className="text-3xl">
                          {product.category === 'FOOD' ? '\uD83C\uDF4E' : '\uD83C\uDF31'}
                        </span>
                      </motion.div>

                      {/* Weekend badge */}
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + idx * 0.1 }}
                      >
                        <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[9px] px-1.5 py-0 font-bold shadow-sm">
                          <CalendarDays className="h-2.5 w-2.5 mr-0.5" />
                          Fim de Semana
                        </Badge>
                      </motion.div>

                      {/* Discount badge */}
                      <Badge className="absolute top-2 right-2 bg-red-500 text-white border-0 text-[10px] px-1.5 py-0 font-bold">
                        -{product.discount}%
                      </Badge>
                    </div>

                    {/* Info */}
                    <div className="p-2.5 flex flex-col flex-1">
                      <p className="text-[10px] text-muted-foreground">{product.storeName}</p>
                      <h3 className="text-xs font-semibold mt-0.5 line-clamp-2 leading-tight min-h-[1.75rem]">
                        {product.name}
                      </h3>

                      <div className="mt-auto pt-2">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-extrabold text-amber-700 dark:text-amber-300">{formatBRL(product.price)}</span>
                          {product.comparePrice && (
                            <span className="text-[10px] text-muted-foreground line-through">{formatBRL(product.comparePrice)}</span>
                          )}
                        </div>

                        <div className="flex gap-1.5 mt-2">
                          <Button
                            size="sm"
                            className="flex-1 h-7 text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 gap-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              addToCart(product, product.storeName || 'Loja')
                              toast.success(`${product.name} adicionado!`)
                            }}
                          >
                            <ShoppingCart className="h-3 w-3" />
                            Comprar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0 border-amber-300/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (navigator.share) {
                                navigator.share({
                                  title: product.name,
                                  text: `Confira esta oferta de fim de semana: ${product.name} por ${formatBRL(product.price)} no DomPlace!`,
                                })
                              } else {
                                const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
                                navigator.clipboard.writeText(shareUrl).then(() => {
                                  toast.success('Link copiado!')
                                }).catch(() => {
                                  toast.error('Nao foi possivel copiar o link')
                                })
                              }
                            }}
                          >
                            <Share2 className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Bottom decorative bar */}
          <div className="h-1 mt-4 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full overflow-hidden relative">
            <motion.div
              className="absolute inset-0 w-1/2"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
            >
              <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
