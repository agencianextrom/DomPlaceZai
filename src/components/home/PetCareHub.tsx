'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PawPrint, Heart, Scissors, Stethoscope, ShoppingCart,
  Star, MapPin, Clock, ShieldCheck, ChevronRight, BadgeCheck,
  Sparkles, TrendingUp, Calendar
} from 'lucide-react'

interface PetProduct {
  id: number
  name: string
  emoji: string
  category: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  brand: string
  isOrganic?: boolean
  isVetRecommended?: boolean
  stock: number
}

interface VetService {
  id: number
  name: string
  emoji: string
  specialty: string
  rating: number
  reviews: number
  distance: string
  openNow: boolean
  nextSlot: string
  priceRange: string
  verified: boolean
}

interface PetTip {
  id: number
  title: string
  emoji: string
  category: string
  content: string
  isRead: boolean
}

const petCategories = [
  { id: 'all', label: 'Todos', emoji: '🐾' },
  { id: 'food', label: 'Alimentação', emoji: '🍖' },
  { id: 'hygiene', label: 'Higiene', emoji: '🧴' },
  { id: 'toys', label: 'Brinquedos', emoji: '🎾' },
  { id: 'health', label: 'Saúde', emoji: '💊' },
  { id: 'accessories', label: 'Acessórios', emoji: '🦮' },
  { id: 'beds', label: 'Camas', emoji: '🛏️' },
]

const petProducts: PetProduct[] = [
  { id: 1, name: 'Ração Premium Cães Adultos', emoji: '🦴', category: 'food', price: 89.90, originalPrice: 109.90, rating: 4.8, reviews: 234, brand: 'PetNaturais', isOrganic: true, stock: 45 },
  { id: 2, name: 'Shampoo Antipulgas 500ml', emoji: '🧴', category: 'hygiene', price: 34.90, rating: 4.6, reviews: 156, brand: 'VetCare', isVetRecommended: true, stock: 78 },
  { id: 3, name: 'Bolinha Interativa IQ', emoji: '🎾', category: 'toys', price: 24.90, rating: 4.7, reviews: 89, brand: 'PetPlay', stock: 120 },
  { id: 4, name: 'Vermífugo Comprimido Cães', emoji: '💊', category: 'health', price: 45.90, rating: 4.9, reviews: 312, brand: 'VetPlus', isVetRecommended: true, stock: 200 },
  { id: 5, name: 'Ração Gatos Filhotes', emoji: '🐟', category: 'food', price: 67.90, originalPrice: 79.90, rating: 4.7, reviews: 178, brand: 'Whiskas Natural', stock: 34 },
  { id: 6, name: 'Coleira GPS Rastreável', emoji: '📡', category: 'accessories', price: 189.90, originalPrice: 249.90, rating: 4.5, reviews: 67, brand: 'PetTech', stock: 15 },
  { id: 7, name: 'Cama Ortopédica Grande', emoji: '🛏️', category: 'beds', price: 159.90, rating: 4.8, reviews: 145, brand: 'PetComfort', stock: 22 },
  { id: 8, name: 'Escova Desembaraçadora', emoji: '✨', category: 'hygiene', price: 29.90, rating: 4.4, reviews: 98, brand: 'GroomPro', stock: 56 },
  { id: 9, name: 'Snack Dental Funcional', emoji: '🦷', category: 'food', price: 19.90, rating: 4.6, reviews: 203, brand: 'DentPet', isOrganic: true, isVetRecommended: true, stock: 180 },
  { id: 10, name: 'Arranhador para Gatos', emoji: '🐱', category: 'toys', price: 54.90, originalPrice: 69.90, rating: 4.5, reviews: 134, brand: 'CatWorld', stock: 41 },
]

const vetServices: VetService[] = [
  { id: 1, name: 'Dr. Carlos Mendes', emoji: '👨‍⚕️', specialty: 'Clínica Geral', rating: 4.9, reviews: 287, distance: '0.8 km', openNow: true, nextSlot: '14:30', priceRange: 'R$80-150', verified: true },
  { id: 2, name: 'Dra. Ana Beatriz', emoji: '👩‍⚕️', specialty: 'Dermatologia', rating: 4.8, reviews: 198, distance: '1.2 km', openNow: true, nextSlot: '15:00', priceRange: 'R$90-180', verified: true },
  { id: 3, name: 'Pet Shop Fofura', emoji: '✂️', specialty: 'Banho & Tosa', rating: 4.7, reviews: 456, distance: '0.5 km', openNow: false, nextSlot: 'Amanhã 9h', priceRange: 'R$50-120', verified: true },
  { id: 4, name: 'Clínica Vida Pet', emoji: '🏥', specialty: 'Cirurgia', rating: 4.9, reviews: 165, distance: '2.1 km', openNow: true, nextSlot: '16:00', priceRange: 'R$200-500', verified: true },
  { id: 5, name: 'Dr. Paulo Veterinário', emoji: '🩺', specialty: 'Ortopedia', rating: 4.6, reviews: 89, distance: '3.4 km', openNow: false, nextSlot: 'Amanhã 10h', priceRange: 'R$120-250', verified: true },
]

const petTips: PetTip[] = [
  { id: 1, title: 'Vermificação trimestral é essencial', emoji: '💊', category: 'Saúde', content: 'Mantenha a vermificação do seu pet em dia, a cada 3 meses, para prevenir parasitas e garantir uma vida saudável.', isRead: false },
  { id: 2, title: 'Escovação regular previne nós', emoji: '✨', category: 'Higiene', content: 'Escove seu pet pelo menos 3 vezes por semana para evitar nós na pelagem e detectar pulgas e carrapatos cedo.', isRead: false },
  { id: 3, title: 'Água fresca sempre disponível', emoji: '💧', category: 'Alimentação', content: 'Troque a água do seu pet diariamente. Em dias quentes, adicione cubos de gelo para manter a temperatura agradável.', isRead: false },
  { id: 4, title: 'Passeios diários melhoram humor', emoji: '🚶', category: 'Bem-estar', content: 'Cães precisam de pelo menos 30 minutos de passeio diário para manter saúde física e mental equilibrada.', isRead: true },
  { id: 5, title: 'Vacinação em dia salva vidas', emoji: '💉', category: 'Saúde', content: 'Mantenha o calendário de vacinação atualizado. Vacinas como V10 e antirrábica são obrigatórias e salvam vidas.', isRead: true },
  { id: 6, title: 'Brinquedos evitam ansiedade', emoji: '🎾', category: 'Bem-estar', content: 'Brinquedos interativos estimulam a mente do pet e previnem destruição de móveis por tédio ou ansiedade de separação.', isRead: false },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
}

export default function PetCareHub() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [favorites, setFavorites] = useState<number[]>([])
  const [readTips, setReadTips] = useState<Set<number>>(new Set(petTips.filter(t => t.isRead).map(t => t.id)))
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'products' | 'vets' | 'tips'>('products')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  const filteredProducts = selectedCategory === 'all'
    ? petProducts
    : petProducts.filter(p => p.category === selectedCategory)

  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  const markTipRead = (id: number) => {
    setReadTips(prev => new Set([...prev, id]))
  }

  const unreadCount = petTips.filter(t => !readTips.has(t.id)).length
  const totalSavings = petProducts.filter(p => p.originalPrice).reduce((acc, p) => acc + ((p.originalPrice || 0) - p.price), 0)

  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded-lg bg-amber-200/50" />
          <div className="flex gap-3 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 w-24 shrink-0 rounded-full bg-amber-200/40" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-52 rounded-xl bg-white/60" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.section
      id="pet-care-hub"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-5 sm:p-6 shadow-sm"
    >
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-200/50">
            <PawPrint className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
              Cuidados Pet 🐾
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">Tudo para seu melhor amigo</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalSavings > 0 && (
            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
              -{totalSavings.toFixed(0).replace('.', ',')}%
            </span>
          )}
          <button className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-amber-100 px-3 text-sm font-medium text-amber-700 hover:bg-amber-200 transition-colors">
            Ver Tudo
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-5 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        <div className="r94-pet-stat shrink-0 rounded-xl bg-white p-3 shadow-sm min-w-[140px]">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-gray-500">Produtos</span>
          </div>
          <p className="mt-1 text-lg font-bold text-gray-800">248+</p>
        </div>
        <div className="r94-pet-stat shrink-0 rounded-xl bg-white p-3 shadow-sm min-w-[140px]">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-gray-500">Veterinários</span>
          </div>
          <p className="mt-1 text-lg font-bold text-gray-800">12</p>
        </div>
        <div className="r94-pet-stat shrink-0 rounded-xl bg-white p-3 shadow-sm min-w-[140px]">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-gray-500">Avaliação</span>
          </div>
          <p className="mt-1 text-lg font-bold text-gray-800">4.7★</p>
        </div>
        <div className="r94-pet-stat shrink-0 rounded-xl bg-white p-3 shadow-sm min-w-[140px]">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-xs text-gray-500">Pedidos/mês</span>
          </div>
          <p className="mt-1 text-lg font-bold text-gray-800">1.2k</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-5 flex gap-2">
        {[
          { id: 'products' as const, label: 'Produtos', icon: ShoppingCart },
          { id: 'vets' as const, label: 'Veterinários', icon: Stethoscope },
          { id: 'tips' as const, label: 'Dicas', icon: Sparkles },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`r94-tab-btn flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all min-h-[44px] ${
              activeTab === tab.id
                ? 'bg-amber-500 text-white shadow-md shadow-amber-200/50'
                : 'bg-white text-gray-600 hover:bg-amber-50'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.id === 'tips' && unreadCount > 0 && (
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                activeTab === tab.id ? 'bg-white text-amber-500' : 'bg-amber-100 text-amber-700'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'products' && (
          <motion.div
            key="products"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Category Filter */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {petCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`r94-category-pill flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all min-h-[44px] ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-amber-50 border border-gray-200'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
            >
              {filteredProducts.map(product => (
                <motion.div
                  key={product.id}
                  variants={item}
                  layout
                  className="r94-product-card group relative rounded-xl bg-white p-3 shadow-sm"
                >
                  {/* Favorite */}
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute right-2 top-2 z-10 flex h-8 w-8 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all hover:scale-110"
                  >
                    <Heart className={`h-4 w-4 transition-colors ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>

                  {/* Product Image */}
                  <div className="r94-product-emoji mb-2 flex h-16 items-center justify-center rounded-lg bg-amber-50/80">
                    <span className="text-3xl">{product.emoji}</span>
                  </div>

                  {/* Product Info */}
                  <h3 className="r94-product-name text-sm font-semibold text-gray-800 line-clamp-2 leading-tight pr-6">
                    {product.name}
                  </h3>

                  {/* Badges */}
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {product.isOrganic && (
                      <span className="rounded-md bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">Orgânico</span>
                    )}
                    {product.isVetRecommended && (
                      <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">Vet✓</span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="mt-1.5 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium text-gray-700">{product.rating}</span>
                    <span className="text-[10px] text-gray-400">({product.reviews})</span>
                  </div>

                  {/* Price */}
                  <div className="mt-2 flex items-end gap-1.5">
                    <span className="text-base font-bold text-amber-600">
                      R${product.price.toFixed(2).replace('.', ',')}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        R${product.originalPrice.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart */}
                  <button className="r94-add-cart-btn mt-2 w-full rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-amber-600 active:scale-[0.98] min-h-[44px]">
                    Adicionar
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Vets Tab */}
        {activeTab === 'vets' && (
          <motion.div
            key="vets"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {vetServices.map(vet => (
              <motion.div
                key={vet.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="r94-vet-card flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-2xl">
                  {vet.emoji}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-800 truncate">{vet.name}</h3>
                    {vet.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-blue-500" />}
                  </div>
                  <p className="text-xs text-gray-500">{vet.specialty}</p>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {vet.rating} ({vet.reviews})
                    </span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      {vet.distance}
                    </span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                      vet.openNow ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {vet.openNow ? 'Aberto' : 'Fechado'}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Próximo: <span className="font-medium text-gray-600">{vet.nextSlot}</span> · {vet.priceRange}
                    </span>
                  </div>
                </div>

                <button className={`r94-vet-book-btn shrink-0 rounded-lg px-3 py-2 text-xs font-semibold min-h-[44px] transition-all ${
                  vet.openNow
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`} disabled={!vet.openNow}>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Agendar
                  </span>
                </button>
              </motion.div>
            ))}

            {/* Trust Indicators */}
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { icon: ShieldCheck, label: 'Veterinários Verificados' },
                { icon: BadgeCheck, label: 'Avaliações Reais' },
                { icon: Clock, label: 'Atendimento 24h' },
              ].map(trust => (
                <div key={trust.label} className="r94-trust-badge flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs text-gray-600 shadow-sm">
                  <trust.icon className="h-3.5 w-3.5 text-blue-500" />
                  {trust.label}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tips Tab */}
        {activeTab === 'tips' && (
          <motion.div
            key="tips"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {petTips.map(tip => (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => markTipRead(tip.id)}
                className={`r94-tip-card flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                  readTips.has(tip.id) ? 'opacity-60' : ''
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xl">
                  {tip.emoji}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-sm font-semibold ${readTips.has(tip.id) ? 'text-gray-500' : 'text-gray-800'}`}>
                      {tip.title}
                    </h3>
                    {!readTips.has(tip.id) && (
                      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                        Novo
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-amber-600">{tip.category}</span>
                  <p className={`mt-1 text-xs leading-relaxed ${readTips.has(tip.id) ? 'text-gray-400' : 'text-gray-600'}`}>
                    {tip.content}
                  </p>
                </div>

                <ChevronRight className={`h-4 w-4 shrink-0 mt-1 ${readTips.has(tip.id) ? 'text-gray-300' : 'text-gray-400'}`} />
              </motion.div>
            ))}

            {unreadCount === 0 && (
              <div className="flex flex-col items-center justify-center rounded-xl bg-white py-8 text-center shadow-sm">
                <span className="text-3xl mb-2">🎉</span>
                <p className="text-sm font-medium text-gray-600">Todas as dicas foram lidas!</p>
                <p className="text-xs text-gray-400 mt-1">Volte amanhã para novas dicas</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pet Services Quick Access */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { emoji: '🛁', label: 'Banho & Tosa', color: 'from-cyan-400 to-blue-500' },
          { emoji: '💉', label: 'Vacinação', color: 'from-green-400 to-emerald-500' },
          { emoji: '🏠', label: 'Pet Sitting', color: 'from-purple-400 to-violet-500' },
          { emoji: '🚗', label: 'Pet Taxi', color: 'from-rose-400 to-pink-500' },
        ].map(service => (
          <button
            key={service.label}
            className="r94-service-card flex flex-col items-center gap-2 rounded-xl bg-white p-3 shadow-sm transition-all hover:shadow-md min-h-[44px]"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${service.color} text-xl shadow-sm`}>
              {service.emoji}
            </div>
            <span className="text-xs font-medium text-gray-700">{service.label}</span>
          </button>
        ))}
      </div>
    </motion.section>
  )
}
