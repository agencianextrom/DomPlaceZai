'use client'

import { ArrowLeft, Star, Clock, MapPin, Phone, MessageCircle, ShoppingBag, Heart, Share2, ChevronDown, ChevronUp, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore, type StoreData, type ProductData } from '@/store/useAppStore'
import { ProductCard, formatBRL } from '@/components/product/ProductCard'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface StoreProfileProps {
  store: StoreData
}

const categoryLabels: Record<string, string> = {
  AGRICULTURE: 'Agricultura',
  FOOD: 'Alimentação',
  SERVICES: 'Serviços',
  FASHION: 'Moda',
  ELECTRONICS: 'Eletrônicos',
  HEALTH: 'Saúde',
  HOME_GARDEN: 'Casa & Jardim',
  ANIMALS: 'Animais',
  EDUCATION: 'Educação',
  BEAUTY: 'Beleza',
  SPORTS: 'Esportes',
  OTHER: 'Outros',
}

const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function StoreProfile({ store }: StoreProfileProps) {
  const { goBack, navigate, isFavoriteStore, toggleFavoriteStore } = useAppStore()
  const [products, setProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  const [showFullDescription, setShowFullDescription] = useState(false)
  
  const isFav = isFavoriteStore(store.id)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/stores/${store.id}`)
        const data = await res.json()
        if (!cancelled) setProducts(data.products || [])
      } catch {
        if (!cancelled) setProducts([])
      }
      if (!cancelled) setLoading(false)
    }
    fetchData()
    return () => { cancelled = true }
  }, [store.id])
  
  const isOpen = store.opensAt && store.closesAt ? (() => {
    const now = new Date()
    // Use UTC-3 (Brasília timezone)
    const brasiliaOffset = -3
    const utc = now.getTime() + now.getTimezoneOffset() * 60000
    const brasiliaTime = new Date(utc + brasiliaOffset * 3600000)
    const [h, m] = store.opensAt!.split(':').map(Number)
    const [eh, em] = store.closesAt!.split(':').map(Number)
    const currentMins = brasiliaTime.getHours() * 60 + brasiliaTime.getMinutes()
    const openMins = h * 60 + m
    const closeMins = eh * 60 + em
    return currentMins >= openMins && currentMins <= closeMins
  })() : true

  // Parse open days
  const openDaysList = store.openDays ? store.openDays.split(',').map(Number) : [1,2,3,4,5,6,7]
  
  // Opening hours table
  const getHoursForDay = (dayNum: number) => {
    const isToday = new Date().getDay() === dayNum
    const isOpenDay = openDaysList.includes(dayNum)
    return {
      day: dayNames[dayNum],
      hours: isOpenDay ? `${store.opensAt} - ${store.closesAt}` : 'Fechado',
      isToday,
      isOpenDay,
    }
  }

  const handleWhatsApp = () => {
    const phone = store.whatsapp?.replace(/\D/g, '') || store.phone?.replace(/\D/g, '')
    if (phone) {
      window.open(`https://wa.me/55${phone}`, '_blank')
    }
  }
  
  return (
    <div className="min-h-screen pb-20 md:pb-4">
      {/* Cover */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-primary via-emerald-600 to-teal-700 -mx-4 -mt-4">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goBack}
          className="absolute top-4 left-4 h-10 w-10 bg-black/20 hover:bg-black/40 text-white border-0 z-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Action buttons on cover */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFavoriteStore(store.id)}
            className="h-10 w-10 bg-black/20 hover:bg-black/40 text-white border-0"
          >
            <Heart className={`h-5 w-5 ${isFav ? 'fill-red-400 text-red-400' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 bg-black/20 hover:bg-black/40 text-white border-0"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Store info */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="flex items-end gap-4">
          <div className="w-24 h-24 rounded-2xl bg-card border-4 border-background shadow-xl flex items-center justify-center text-3xl font-bold text-primary">
            {store.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div className="pb-1 min-w-0 flex-1">
            <h1 className="text-xl font-bold truncate">{store.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="secondary" className="text-xs">{categoryLabels[store.category] || store.category}</Badge>
              <span className="flex items-center gap-0.5 text-sm">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                {store.rating.toFixed(1)}
                <span className="text-muted-foreground text-xs">({store.totalReviews})</span>
              </span>
              {isOpen ? (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                  Aberto agora
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                  Fechado
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Store stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <Card className="border-0 bg-primary/5">
            <CardContent className="p-3 text-center">
              <ShoppingBag className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{products.length || 0}</p>
              <p className="text-[10px] text-muted-foreground">Produtos</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-amber-50 dark:bg-amber-900/10">
            <CardContent className="p-3 text-center">
              <Star className="h-5 w-5 mx-auto mb-1 text-amber-500" />
              <p className="text-lg font-bold">{store.rating.toFixed(1)}</p>
              <p className="text-[10px] text-muted-foreground">Avaliação</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-emerald-50 dark:bg-emerald-900/10">
            <CardContent className="p-3 text-center">
              <MessageCircle className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
              <p className="text-lg font-bold">{store.totalReviews || 0}</p>
              <p className="text-[10px] text-muted-foreground">Avaliações</p>
            </CardContent>
          </Card>
        </div>

        {/* Delivery info */}
        <div className="flex items-center gap-3 mt-4">
          {store.deliveryFee === 0 ? (
            <Badge variant="secondary" className="text-primary bg-primary/10 text-xs">
              🚚 Entrega grátis
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">
              🚚 Entrega: {formatBRL(store.deliveryFee)}
              {store.freeDeliveryAbove && (
                <span className="text-xs"> (grátis acima de {formatBRL(store.freeDeliveryAbove)})</span>
              )}
            </span>
          )}
        </div>
        
        {/* Contact actions */}
        <div className="flex gap-2 mt-4">
          {(store.whatsapp || store.phone) && (
            <Button 
              className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          )}
          {store.phone && (
            <Button variant="outline" className="flex-1 h-11">
              <Phone className="h-4 w-4 mr-2" />
              Ligar
            </Button>
          )}
        </div>
        
        {/* Address */}
        {store.address && (
          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            {store.address}, {store.neighborhood || ''} - {store.city}/{store.state}
          </div>
        )}
        
        {/* Description */}
        {store.description && (
          <div className="mt-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {showFullDescription || store.description.length < 100
                ? store.description
                : `${store.description.slice(0, 100)}...`}
            </p>
            {store.description.length > 100 && (
              <button 
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-sm text-primary hover:underline mt-1 flex items-center gap-1"
              >
                {showFullDescription ? 'Ver menos' : 'Ver mais'}
                {showFullDescription ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
          </div>
        )}

        <Separator className="my-4" />

        {/* Opening hours */}
        <div>
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Horário de funcionamento
          </h3>
          <Card className="border-border/50">
            <CardContent className="p-0">
              {[0,1,2,3,4,5,6].map((day, idx) => {
                const info = getHoursForDay(day)
                return (
                  <div key={day} className={`flex items-center justify-between px-4 py-2.5 ${idx < 6 ? 'border-b border-border/30' : ''} ${info.isToday ? 'bg-primary/5' : ''}`}>
                    <span className={`text-sm ${info.isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                      {info.day}{info.isToday ? ' (hoje)' : ''}
                    </span>
                    <span className={`text-sm ${!info.isOpenDay ? 'text-muted-foreground/50' : info.isToday ? 'font-semibold' : ''}`}>
                      {info.hours}
                    </span>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mt-6 -mx-4 px-4">
        <Tabs defaultValue="produtos">
          <TabsList className="w-full bg-secondary/50 rounded-lg">
            <TabsTrigger value="produtos" className="flex-1 rounded-md">
              <ShoppingBag className="h-4 w-4 mr-1.5" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="sobre" className="flex-1 rounded-md">Sobre</TabsTrigger>
            <TabsTrigger value="avaliacoes" className="flex-1 rounded-md">
              <Star className="h-4 w-4 mr-1.5" />
              Avaliações
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="produtos" className="mt-4">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-muted rounded-xl h-56 animate-pulse" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Store className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30" />
                Nenhum produto disponível no momento
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sobre" className="mt-4">
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-2">Sobre a loja</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {store.description || 'Nenhuma descrição disponível.'}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-3">Informações de contato</h3>
                  <div className="space-y-3">
                    {store.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Telefone</p>
                          <p className="font-medium">{store.phone}</p>
                        </div>
                      </div>
                    )}
                    {store.whatsapp && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                          <MessageCircle className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">WhatsApp</p>
                          <p className="font-medium">{store.whatsapp}</p>
                        </div>
                      </div>
                    )}
                    {store.address && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Endereço</p>
                          <p className="font-medium">{store.address}, {store.neighborhood} - {store.city}/{store.state}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="avaliacoes" className="mt-4">
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200/50 dark:border-amber-800/30">
                <CardContent className="p-6 text-center">
                  <Star className="h-10 w-10 mx-auto mb-2 text-amber-500 fill-amber-500" />
                  <p className="text-3xl font-bold">{store.rating.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground mt-1">{store.totalReviews} avaliações</p>
                  {/* Star distribution */}
                  <div className="mt-4 space-y-1.5 max-w-xs mx-auto">
                    {[5, 4, 3, 2, 1].map((s) => {
                      const percentage = s === 5 ? 65 : s === 4 ? 20 : s === 3 ? 10 : s === 2 ? 3 : 2
                      return (
                        <div key={s} className="flex items-center gap-2">
                          <span className="text-xs w-3">{s}</span>
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">{percentage}%</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
              
              {/* Sample reviews */}
              {[
                { name: 'Maria S.', rating: 5, comment: 'Loja excelente! Produtos de qualidade e atendimento ótimo.', date: '3 dias atrás' },
                { name: 'João P.', rating: 4, comment: 'Boa variedade de produtos e preços justos. Recomendo!', date: '1 semana atrás' },
              ].map((review, i) => (
                <Card key={i} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {review.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{review.name}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`h-2.5 w-2.5 ${s <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`} />
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
