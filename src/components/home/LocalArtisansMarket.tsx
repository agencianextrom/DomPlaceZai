'use client'
/* ─── LocalArtisansMarket ─── "Feira dos Artesãos 🎨" ───
   Local Artisans Market: discover unique handmade pieces, artisan profiles,
   trending products, commission services, and trust indicators. */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  Palette,
  Star,
  MapPin,
  Clock,
  Heart,
  MessageCircle,
  ShoppingBag,
  ChevronRight,
  Award,
  Gem,
  HandHeart,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Artisan {
  id: string
  name: string
  initials: string
  specialty: string
  location: string
  rating: number
  pieces: number
  bio: string
  gradient: string
  accent: string
}

interface TrendingPiece {
  id: string
  title: string
  artisan: string
  price: string
  badge: string
  badgeColor: string
  gradient: string
}

interface CommissionService {
  id: string
  title: string
  description: string
  icon: typeof HandHeart
}

interface StatItem {
  label: string
  value: string
  icon: typeof Palette
  color: string
}

interface TrustItem {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

// ─── Data ──────────────────────────────────────────────────────────────────────
const categories = [
  'Todos',
  'Cerâmica 🏺',
  'Têxtil 🧵',
  'Joalheria 💎',
  'Madeira 🪵',
  'Couro 👜',
  'Vidro 🥂',
  'Papel 📜',
  'Metal ⚒️',
  'Gravura ✏️',
]

const artisans: Artisan[] = [
  {
    id: '1',
    name: 'Maria Clara Santos',
    initials: 'MC',
    specialty: 'Cerâmica Artesanal',
    location: 'Centro, Belém',
    rating: 4.9,
    pieces: 42,
    bio: 'Ceramista há 15 anos, especializada em peças inspiradas na cultura paraense.',
    gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)',
    accent: 'rgba(244,63,94,0.1)',
  },
  {
    id: '2',
    name: 'João Pedro Oliveira',
    initials: 'JP',
    specialty: 'Esculturas em Madeira',
    location: 'Utinga, Ananindeua',
    rating: 4.8,
    pieces: 38,
    bio: 'Mestre marceneiro que transforma madeiras nativas em obras de arte.',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    accent: 'rgba(245,158,11,0.1)',
  },
  {
    id: '3',
    name: 'Ana Beatriz Lima',
    initials: 'AB',
    specialty: 'Joias Filigranadas',
    location: 'Nazaré, Belém',
    rating: 5.0,
    pieces: 27,
    bio: 'Ourives que combina técnicas tradicionais com design contemporâneo.',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    accent: 'rgba(139,92,246,0.1)',
  },
  {
    id: '4',
    name: 'Carlos Eduardo Souza',
    initials: 'CE',
    specialty: 'Vidro Soprado',
    location: 'São Brás, Belém',
    rating: 4.7,
    pieces: 19,
    bio: 'Artesão do vidro que cria peças únicas sopradas à mão desde 2008.',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    accent: 'rgba(6,182,212,0.1)',
  },
  {
    id: '5',
    name: 'Fernanda Costa',
    initials: 'FC',
    specialty: 'Têxtil e Bordados',
    location: 'Cidade Velha, Belém',
    rating: 4.9,
    pieces: 56,
    bio: 'Bordadeira que preserva técnicas ancestrais com fios naturais da Amazônia.',
    gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
    accent: 'rgba(236,72,153,0.1)',
  },
  {
    id: '6',
    name: 'Ricardo Mendes',
    initials: 'RM',
    specialty: 'Couro Artesanal',
    location: 'Marambaia, Belém',
    rating: 4.6,
    pieces: 31,
    bio: 'Trabalha couro vegano e reciclado para criar acessórios sustentáveis.',
    gradient: 'linear-gradient(135deg, #84cc16, #65a30d)',
    accent: 'rgba(132,204,22,0.1)',
  },
]

const trendingPieces: TrendingPiece[] = [
  {
    id: '1',
    title: 'Vaso Amazônico',
    artisan: 'Maria Clara Santos',
    price: 'R$ 189,90',
    badge: 'Novo',
    badgeColor: 'rgba(244,63,94,0.9)',
    gradient: 'linear-gradient(135deg, #fecdd3, #fda4af)',
  },
  {
    id: '2',
    title: 'Colar Filigrana Dourada',
    artisan: 'Ana Beatriz Lima',
    price: 'R$ 459,90',
    badge: 'Exclusivo',
    badgeColor: 'rgba(139,92,246,0.9)',
    gradient: 'linear-gradient(135deg, #e9d5ff, #d8b4fe)',
  },
  {
    id: '3',
    title: 'Escultura Curupira',
    artisan: 'João Pedro Oliveira',
    price: 'R$ 320,00',
    badge: 'Edição Limitada',
    badgeColor: 'rgba(245,158,11,0.9)',
    gradient: 'linear-gradient(135deg, #fef3c7, #fde68a)',
  },
]

const commissionServices: CommissionService[] = [
  {
    id: '1',
    title: 'Pedido Personalizado',
    description: 'Solicite uma peça exclusiva feita sob medida para você.',
    icon: Sparkles,
  },
  {
    id: '2',
    title: 'Presente Especial',
    description: 'Presentes artesanais únicos embrulhados com carinho.',
    icon: HandHeart,
  },
  {
    id: '3',
    title: 'Decoração Home',
    description: 'Peças decorativas que transformam ambientes com arte local.',
    icon: Palette,
  },
  {
    id: '4',
    title: 'Enxoval Baby',
    description: 'Enxovals artesanais feitos com amor e materiais naturais.',
    icon: Gem,
  },
]

const stats: StatItem[] = [
  { label: 'Artesãos', value: '240+', icon: Palette, color: '#f43f5e' },
  { label: 'Peças', value: '1.8k', icon: Gem, color: '#8b5cf6' },
  { label: 'Pedidos', value: '890+', icon: ShoppingBag, color: '#f59e0b' },
  { label: 'Avaliação', value: '4.9★', icon: Star, color: '#22c55e' },
]

const trustItems: TrustItem[] = [
  {
    id: '1',
    label: 'Artesão Verificado',
    description: 'Todos os artesãos passam por verificação',
    icon: Award,
  },
  {
    id: '2',
    label: 'Garantia 30 dias',
    description: 'Garantia em todas as peças artesanais',
    icon: ShieldCheck,
  },
  {
    id: '3',
    label: 'Pagamento Seguro',
    description: 'Transações protegidas com criptografia',
    icon: Lock,
  },
  {
    id: '4',
    label: 'Avaliação Real',
    description: 'Avaliações verificadas de compradores reais',
    icon: MessageCircle,
  },
]

const sp = 'spring' as const

// ─── Section wrapper with scroll-triggered animation ───────────────────────────
function AnimatedSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ type: sp, stiffness: 220, damping: 24, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────────
export default function LocalArtisansMarket() {
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [animatedStats, setAnimatedStats] = useState<Record<string, string>>({})

  const statsRef = useRef<HTMLDivElement>(null)
  const statsInView = useInView(statsRef, { once: true, margin: '-40px' })

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (statsInView) {
      const delays: Record<string, number> = {
        '240+': 200,
        '1.8k': 400,
        '890+': 600,
        '4.9★': 800,
      }
      stats.forEach(stat => {
        setTimeout(() => {
          setAnimatedStats(prev => ({ ...prev, [stat.label]: stat.value }))
        }, delays[stat.value] ?? 0)
      })
    }
  }, [statsInView])

  const toggleFav = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const filteredArtisans =
    activeCategory === 'Todos'
      ? artisans
      : artisans.filter(a => {
          const catMap: Record<string, string> = {
            'Cerâmica 🏺': 'Cerâmica Artesanal',
            'Madeira 🪵': 'Esculturas em Madeira',
            'Joalheria 💎': 'Joias Filigranadas',
            'Vidro 🥂': 'Vidro Soprado',
            'Têxtil 🧵': 'Têxtil e Bordados',
            'Couro 👜': 'Couro Artesanal',
          }
          return a.specialty === catMap[activeCategory]
        })

  if (loading) return <LoadingSkeleton />

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: sp, stiffness: 260, damping: 24 }}
      className="space-y-6"
    >
      {/* ════════════════════════════════════════════════════════════════════════
          1. HEADER
          ════════════════════════════════════════════════════════════════════════ */}
      <AnimatedSection>
        <div
          className="relative overflow-hidden rounded-xl px-5 py-6 sm:px-8 sm:py-8"
          style={{
            background: 'linear-gradient(135deg, #f43f5e, #ec4899, #d946ef)',
            boxShadow: '0 4px 24px rgba(244,63,94,0.3)',
          }}
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm shrink-0">
              <Palette className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Feira dos Artesãos 🎨
              </h2>
              <p className="text-sm text-white/80 mt-1">
                Descubra o talento local — peças únicas feitas com amor
              </p>
            </div>
          </div>
          <div className="relative z-10 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-sm font-bold text-white">
              <Sparkles className="h-4 w-4" />
              240+ artesãos ativos
            </span>
          </div>
        </div>
      </AnimatedSection>

      {/* ════════════════════════════════════════════════════════════════════════
          2. STATS ROW
          ════════════════════════════════════════════════════════════════════════ */}
      <div ref={statsRef}>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
          {stats.map((stat, i) => {
            const IconComp = stat.icon
            return (
              <AnimatedSection key={stat.label} delay={i * 0.08}>
                <div
                  className="r101-stat-card shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border/40"
                  style={{ minWidth: 140, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <IconComp className="h-5 w-5" style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-lg font-black leading-tight" style={{ color: stat.color }}>
                      {animatedStats[stat.label] ?? '—'}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-medium">{stat.label}</p>
                  </div>
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          3. CATEGORY FILTER
          ════════════════════════════════════════════════════════════════════════ */}
      <AnimatedSection delay={0.1}>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
          {categories.map(cat => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className={`r101-category-pill shrink-0 flex items-center gap-1.5 px-4 rounded-full text-sm font-semibold border transition-all min-h-[44px] ${
                activeCategory === cat
                  ? 'border-rose-500 bg-rose-500 text-white'
                  : 'border-border bg-card text-muted-foreground hover:border-rose-300'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </AnimatedSection>

      {/* ════════════════════════════════════════════════════════════════════════
          4. FEATURED ARTISANS
          ════════════════════════════════════════════════════════════════════════ */}
      <AnimatedSection delay={0.15}>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-bold">Artesãos em Destaque</h3>
          <span className="text-xs text-muted-foreground">{filteredArtisans.length} artesãos</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredArtisans.map((artisan, i) => (
              <motion.div
                key={artisan.id}
                layout
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: sp, stiffness: 300, damping: 26, delay: i * 0.04 }}
                className="r101-artisan-card rounded-xl border border-border/40 bg-card overflow-hidden"
                style={{
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  borderTop: `3px solid ${artisan.gradient.includes('#f43f5e') ? '#f43f5e' : artisan.gradient.includes('#f59e0b') ? '#f59e0b' : artisan.gradient.includes('#8b5cf6') ? '#8b5cf6' : artisan.gradient.includes('#06b6d4') ? '#06b6d4' : artisan.gradient.includes('#ec4899') ? '#ec4899' : '#84cc16'}`,
                }}
              >
                {/* Card header with avatar */}
                <div className="p-4 pb-3">
                  <div className="flex items-start gap-3">
                    {/* Avatar with gradient circle and initials */}
                    <div
                      className="flex items-center justify-center w-12 h-12 rounded-full shrink-0 text-white font-bold text-sm"
                      style={{ background: artisan.gradient }}
                    >
                      {artisan.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold truncate">{artisan.name}</h4>
                      <p className="text-xs text-muted-foreground font-medium">{artisan.specialty}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {artisan.location}
                        </span>
                        <span className="flex items-center gap-0.5 text-[11px] font-semibold text-amber-500">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {artisan.rating}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{artisan.pieces} peças</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{artisan.bio}</p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 p-4 pt-0">
                  <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                    <Button
                      variant={favorites.has(artisan.id) ? 'default' : 'outline'}
                      className="w-full min-h-[44px] text-xs font-semibold gap-1.5"
                      style={
                        favorites.has(artisan.id)
                          ? { background: '#f43f5e', borderColor: '#f43f5e' }
                          : undefined
                      }
                      onClick={() => toggleFav(artisan.id)}
                    >
                      <Heart
                        className={`h-3.5 w-3.5 ${
                          favorites.has(artisan.id) ? 'fill-white' : ''
                        }`}
                      />
                      Favoritar
                    </Button>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full min-h-[44px] text-xs font-semibold gap-1.5"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Mensagem
                    </Button>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                    <Button className="w-full min-h-[44px] text-xs font-semibold gap-1.5">
                      <ShoppingBag className="h-3.5 w-3.5" />
                      Ver Loja
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </AnimatedSection>

      {/* ════════════════════════════════════════════════════════════════════════
          5. TRENDING PIECES
          ════════════════════════════════════════════════════════════════════════ */}
      <AnimatedSection delay={0.2}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-rose-500" />
            Peças em Alta
          </h3>
          <Button variant="ghost" size="sm" className="text-rose-500 gap-1 text-xs font-semibold">
            Ver todas
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
          {trendingPieces.map((piece, i) => (
            <motion.div
              key={piece.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ type: sp, stiffness: 260, damping: 24, delay: i * 0.08 }}
              className="r101-trending-card shrink-0 w-64 rounded-xl border border-border/40 bg-card overflow-hidden"
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
            >
              {/* Image placeholder */}
              <div
                className="relative w-full h-40 flex items-center justify-center"
                style={{ background: piece.gradient }}
              >
                <span className="text-4xl opacity-50">
                  {piece.badge === 'Novo'
                    ? '🏺'
                    : piece.badge === 'Exclusivo'
                    ? '💎'
                    : '🪵'}
                </span>
                <span
                  className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: piece.badgeColor }}
                >
                  {piece.badge}
                </span>
              </div>
              {/* Info */}
              <div className="p-4">
                <h4 className="text-sm font-bold truncate">{piece.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{piece.artisan}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-base font-black text-rose-600">{piece.price}</span>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    className="flex items-center gap-1 min-h-[44px] min-w-[44px] px-3 rounded-lg text-xs font-semibold text-white"
                    style={{
                      background: 'linear-gradient(135deg, #f43f5e, #ec4899)',
                      boxShadow: '0 2px 8px rgba(244,63,94,0.25)',
                    }}
                  >
                    Ver
                    <ArrowRight className="h-3 w-3" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* ════════════════════════════════════════════════════════════════════════
          6. QUICK COMMISSION SECTION
          ════════════════════════════════════════════════════════════════════════ */}
      <AnimatedSection delay={0.25}>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <HandHeart className="h-5 w-5 text-pink-500" />
            Encomende Artesanal
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {commissionServices.map((service, i) => {
            const ServiceIcon = service.icon
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: sp, stiffness: 260, damping: 24, delay: i * 0.06 }}
                className="r101-commission-card group relative overflow-hidden rounded-xl border border-border/40 bg-card p-4 cursor-pointer"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              >
                {/* Gradient accent top border */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{
                    background: `linear-gradient(90deg, #f43f5e, #ec4899, #d946ef)`,
                  }}
                />
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-xl mb-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(244,63,94,0.1), rgba(217,70,239,0.1))',
                  }}
                >
                  <ServiceIcon className="h-5 w-5 text-rose-500" />
                </div>
                <h4 className="text-sm font-bold mb-1 group-hover:text-rose-500 transition-colors">
                  {service.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Solicitar
                  <ArrowRight className="h-3 w-3" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </AnimatedSection>

      {/* ════════════════════════════════════════════════════════════════════════
          7. TRUST BAR
          ════════════════════════════════════════════════════════════════════════ */}
      <AnimatedSection delay={0.3}>
        <div
          className="rounded-xl p-5 border border-border/40"
          style={{
            background: 'linear-gradient(135deg, rgba(244,63,94,0.03), rgba(217,70,239,0.05))',
          }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {trustItems.map((item, i) => {
              const TrustIcon = item.icon
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: sp, stiffness: 260, damping: 24, delay: i * 0.06 }}
                  className="r101-trust-badge flex flex-col items-center text-center gap-2 p-3 rounded-xl"
                >
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(244,63,94,0.1), rgba(236,72,153,0.1))',
                    }}
                  >
                    <TrustIcon className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* ════════════════════════════════════════════════════════════════════════
          CTA FOOTER
          ════════════════════════════════════════════════════════════════════════ */}
      <AnimatedSection delay={0.35}>
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2 min-h-[52px] rounded-xl text-white font-semibold text-sm"
          style={{
            background: 'linear-gradient(135deg, #f43f5e, #ec4899, #d946ef)',
            boxShadow: '0 4px 16px rgba(244,63,94,0.3)',
          }}
        >
          <Clock className="h-4 w-4" />
          Explore todos os artesãos
          <ArrowRight className="h-4 w-4" />
        </motion.div>
      </AnimatedSection>
    </motion.div>
  )
}

// ─── Loading Skeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div
        className="h-36 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(244,63,94,0.2), rgba(236,72,153,0.2), rgba(217,70,239,0.2))',
        }}
      />

      {/* Stats row skeleton */}
      <div className="flex gap-3 overflow-hidden">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="shrink-0 h-16 rounded-xl bg-muted/40"
            style={{ width: 140 }}
          />
        ))}
      </div>

      {/* Category filter skeleton */}
      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className="shrink-0 h-11 w-24 rounded-full bg-muted/40"
          />
        ))}
      </div>

      {/* Artisan cards skeleton */}
      <div>
        <div className="h-6 w-40 rounded-lg bg-muted/40 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="rounded-xl border border-border/20 bg-muted/30"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted/50" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-3/4 rounded bg-muted/50" />
                    <div className="h-3 w-1/2 rounded bg-muted/40" />
                  </div>
                </div>
                <div className="h-3 w-full rounded bg-muted/40" />
                <div className="h-3 w-5/6 rounded bg-muted/30" />
              </div>
              <div className="flex gap-2 p-4 pt-0">
                {[1, 2, 3].map(j => (
                  <div
                    key={j}
                    className="flex-1 h-11 rounded-lg bg-muted/40"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending pieces skeleton */}
      <div>
        <div className="h-6 w-40 rounded-lg bg-muted/40 mb-4" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="shrink-0 w-64 rounded-xl bg-muted/30"
            >
              <div className="h-40 bg-muted/40" />
              <div className="p-4 space-y-2">
                <div className="h-3.5 w-3/4 rounded bg-muted/50" />
                <div className="h-3 w-1/2 rounded bg-muted/40" />
                <div className="h-5 w-1/3 rounded bg-muted/50" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Commission section skeleton */}
      <div>
        <div className="h-6 w-48 rounded-lg bg-muted/40 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="h-32 rounded-xl bg-muted/30 border border-border/20"
            />
          ))}
        </div>
      </div>

      {/* Trust bar skeleton */}
      <div className="rounded-xl h-24 bg-muted/20" />

      {/* CTA skeleton */}
      <div className="h-14 rounded-xl bg-muted/30" />
    </div>
  )
}
