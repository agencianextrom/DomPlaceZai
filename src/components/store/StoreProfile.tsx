'use client'

import { ArrowLeft, Star, Clock, MapPin, Phone, MessageCircle, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore, type StoreData, type ProductData } from '@/store/useAppStore'
import { ProductCard, formatBRL } from '@/components/product/ProductCard'
import { useState, useEffect } from 'react'

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

export function StoreProfile({ store }: StoreProfileProps) {
  const { goBack, navigate } = useAppStore()
  const [products, setProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  
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
    const [h, m] = store.opensAt!.split(':').map(Number)
    const [eh, em] = store.closesAt!.split(':').map(Number)
    const currentMins = now.getHours() * 60 + now.getMinutes()
    return currentMins >= (h * 60 + m) && currentMins <= (eh * 60 + em)
  })() : true
  
  return (
    <div className="min-h-screen">
      {/* Cover */}
      <div className="relative h-36 sm:h-44 bg-gradient-to-br from-primary to-emerald-600 -mx-4 -mt-4">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goBack}
          className="absolute top-4 left-4 h-10 w-10 bg-black/20 hover:bg-black/40 text-white border-0 z-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Store info */}
      <div className="px-4 -mt-10 relative z-10">
        <div className="flex items-end gap-3">
          <div className="w-20 h-20 rounded-2xl bg-card border-2 border-background shadow-lg flex items-center justify-center text-2xl font-bold text-primary">
            {store.name.charAt(0)}
          </div>
          <div className="pb-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{store.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary">{categoryLabels[store.category] || store.category}</Badge>
              <span className="flex items-center gap-0.5 text-sm">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                {store.rating.toFixed(1)}
                <span className="text-muted-foreground text-xs">({store.totalReviews})</span>
              </span>
            </div>
          </div>
        </div>
        
        {/* Status and actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <Badge className={`${isOpen ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700'} border-0`}>
              <Clock className="h-3 w-3 mr-1" />
              {isOpen ? 'Aberto agora' : 'Fechado'}
            </Badge>
            {store.deliveryFee > 0 && (
              <span className="text-sm text-muted-foreground">
                Entrega: {formatBRL(store.deliveryFee)}
              </span>
            )}
            {store.deliveryFee === 0 && (
              <Badge variant="secondary" className="text-primary">Entrega grátis</Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Info cards */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
            <p className="text-xs text-muted-foreground">Pedidos</p>
            <p className="font-bold text-sm">{store.totalSales || 0}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
            <p className="text-xs text-muted-foreground">Avaliação</p>
            <p className="font-bold text-sm">{store.rating.toFixed(1)} ⭐</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
            <p className="text-xs text-muted-foreground">Horário</p>
            <p className="font-bold text-xs">{store.opensAt || '--'} - {store.closesAt || '--'}</p>
          </div>
        </div>
        
        {store.address && (
          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            {store.address}, {store.neighborhood || ''} - {store.city}/{store.state}
          </div>
        )}
        
        {store.description && (
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{store.description}</p>
        )}
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
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {products.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum produto disponível no momento
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sobre" className="mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm">Sobre a loja</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {store.description || 'Nenhuma descrição disponível.'}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Informações</h3>
                <div className="mt-2 space-y-2">
                  {store.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {store.phone}
                    </div>
                  )}
                  {store.whatsapp && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp: {store.whatsapp}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="avaliacoes" className="mt-4">
            <div className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-2 text-amber-500/30" />
                <p className="font-semibold text-lg">{store.rating.toFixed(1)}</p>
                <p className="text-sm">{store.totalReviews} avaliações</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
