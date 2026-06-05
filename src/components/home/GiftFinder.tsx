'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift, Heart, Sparkles, ShoppingCart, ChevronRight, RefreshCw, X, Clock,
  Star, TrendingUp, Filter, ChevronDown, MessageCircle, Package, Tag,
  PartyPopper, Baby, GraduationCap, Home as HomeIcon, Dumbbell, Palette,
  BookOpen, Music, ChefHat, Flower2
} from 'lucide-react';

interface RecipientProfile {
  id: string;
  name: string;
  emoji: string;
  relation: string;
  interests: string[];
  age?: string;
  gender?: string;
}

interface GiftIdea {
  id: string;
  name: string;
  emoji: string;
  price: string;
  originalPrice?: string;
  store: string;
  category: string;
  rating: number;
  reviews: number;
  reason: string;
  occasion: string[];
  tags: string[];
  delivery: string;
  wrapAvailable: boolean;
}

const recipientPresets: RecipientProfile[] = [
  { id: 'r1', name: 'Mãe', emoji: '👩', relation: 'Família', interests: ['Cozinha', 'Decoração', 'Beleza'], age: '45+', gender: 'F' },
  { id: 'r2', name: 'Pai', emoji: '👨', relation: 'Família', interests: ['Ferramentas', 'Esportes', 'Tecnologia'], age: '45+', gender: 'M' },
  { id: 'r3', name: 'Filho(a)', emoji: '👧', relation: 'Família', interests: ['Brinquedos', 'Educação', 'Games'], age: '6-12', gender: 'F' },
  { id: 'r4', name: 'Amigo(a)', emoji: '🧑', relation: 'Amizade', interests: ['Tecnologia', 'Moda', 'Gastronomia'], age: '25-35', gender: 'U' },
  { id: 'r5', name: 'Namorada(o)', emoji: '💑', relation: 'Romântico', interests: ['Joias', 'Perfume', 'Experiências'], age: '25-35', gender: 'F' },
  { id: 'r6', name: 'Colega de Trabalho', emoji: '💼', relation: 'Profissional', interests: ['Organização', 'Café', 'Mimo'], age: '30+', gender: 'U' },
];

const allGiftIdeas: GiftIdea[] = [
  { id: 'g1', name: 'Cesta de Café Artesanal Premium', emoji: '☕', price: 'R$89,90', store: 'Café Artesanal', category: 'Gastronomia', rating: 4.9, reviews: 342, reason: 'Perfeita para apreciadores de café!', occasion: ['aniversário', 'dia das mães', 'natal'], tags: ['premium', 'artesanal'], delivery: '2-3 dias', wrapAvailable: true },
  { id: 'g2', name: 'Kit Skincare Natural Completo', emoji: '🧴', price: 'R$149,90', originalPrice: 'R$199,90', store: 'Beleza Natural', category: 'Beleza', rating: 4.8, reviews: 256, reason: '25% de desconto — presente com economia!', occasion: ['aniversário', 'dia das mães', 'valentim'], tags: ['natural', 'desconto'], delivery: '1-2 dias', wrapAvailable: true },
  { id: 'g3', name: 'Ferramenta Multiuso 12 em 1', emoji: '🔧', price: 'R$79,90', store: 'Casa & Construção', category: 'Ferramentas', rating: 4.6, reviews: 189, reason: 'Presente prático que ele vai usar!', occasion: ['dia dos pais', 'aniversário', 'natal'], tags: ['prático', 'útil'], delivery: '3-5 dias', wrapAvailable: false },
  { id: 'g4', name: 'Lego City Construções 400+ peças', emoji: '🧱', price: 'R$199,90', store: 'Brinquedos & Cia', category: 'Brinquedos', rating: 4.9, reviews: 512, reason: 'Brinquedo educativo — #1 vendido!', occasion: ['aniversário infantil', 'natal', 'dia das crianças'], tags: ['educativo', 'bestseller'], delivery: '2-3 dias', wrapAvailable: true },
  { id: 'g5', name: 'Fone Bluetooth Noise Cancel', emoji: '🎧', price: 'R$259,90', originalPrice: 'R$329,90', store: 'Eletrônicos Plus', category: 'Tecnologia', rating: 4.7, reviews: 423, reason: '21% off — o presente tech mais desejado!', occasion: ['aniversário', 'natal', 'formatura'], tags: ['tech', 'desconto'], delivery: '1-2 dias', wrapAvailable: true },
  { id: 'g6', name: 'Buquê de Rosas Vermelhas Premium', emoji: '🌹', price: 'R$119,90', store: 'Floricultura Bela', category: 'Flores', rating: 4.8, reviews: 678, reason: 'Clássico para demonstrar amor!', occasion: ['valentim', 'aniversário namorada'], tags: ['romântico', 'clássico'], delivery: 'Mesmo dia', wrapAvailable: true },
  { id: 'g7', name: 'Agenda Personalizada Couro', emoji: '📓', price: 'R$69,90', store: 'Papelaria Elegante', category: 'Organização', rating: 4.5, reviews: 134, reason: 'Presente elegante para o dia a dia', occasion: ['aniversário', 'dia do colega', 'natal'], tags: ['elegante', 'personalizável'], delivery: '2-3 dias', wrapAvailable: true },
  { id: 'g8', name: 'Vale-presente Mercado R$100', emoji: '💳', price: 'R$100,00', store: 'Mercado Central', category: 'Vale-presente', rating: 4.9, reviews: 1205, reason: 'Presente flexível — eles escolhem!', occasion: ['qualquer', 'emergência', 'casamento'], tags: ['flexível', 'popular'], delivery: 'Imediato', wrapAvailable: true },
  { id: 'g9', name: 'Cachecol de Lã Merino', emoji: '🧣', price: 'R$89,90', store: 'Moda Elegante', category: 'Moda', rating: 4.6, reviews: 87, reason: 'Inverno chegando — presente quentinho!', occasion: ['aniversário', 'natal', 'dia dos pais'], tags: ['inverno', 'fashion'], delivery: '3-5 dias', wrapAvailable: true },
  { id: 'g10', name: 'Kit Churrasco Master Grill', emoji: '🥩', price: 'R$189,90', originalPrice: 'R$249,90', store: 'Açougue Premium', category: 'Gastronomia', rating: 4.8, reviews: 312, reason: '24% de desconto — churrasco premium!', occasion: ['dia dos pais', 'aniversário', 'natal'], tags: ['premium', 'desconto'], delivery: '1-2 dias', wrapAvailable: false },
  { id: 'g11', name: 'Livro Receitas Brasileiras Capa Dura', emoji: '📖', price: 'R$59,90', store: 'Livraria Cultura', category: 'Livros', rating: 4.7, reviews: 198, reason: 'Para quem ama cozinhar a brasileira!', occasion: ['dia das mães', 'natal', 'aniversário'], tags: ['cultural', 'gastronomia'], delivery: '2-3 dias', wrapAvailable: true },
  { id: 'g12', name: 'Kit Esportivo Running Completo', emoji: '🏃', price: 'R$159,90', store: 'Sport Fitness', category: 'Esportes', rating: 4.5, reviews: 267, reason: 'Presente saudável para o atleta!', occasion: ['aniversário', 'dia dos pais', 'formatura'], tags: ['esporte', 'saúde'], delivery: '2-4 dias', wrapAvailable: false },
];

const occasions = ['Todos', 'Aniversário', 'Dia das Mães', 'Dia dos Pais', 'Natal', 'Valentim', 'Formatura', 'Casamento'];
const priceRanges = [
  { id: 'all', label: 'Todos os preços', min: 0, max: Infinity },
  { id: 'budget', label: 'Até R$80', min: 0, max: 80 },
  { id: 'mid', label: 'R$80 – R$150', min: 80, max: 150 },
  { id: 'premium', label: 'Acima de R$150', min: 150, max: Infinity },
];

const occasionIcons: Record<string, typeof Gift> = {
  'Todos': Gift,
  'Aniversário': PartyPopper,
  'Dia das Mães': Heart,
  'Dia dos Pais': HomeIcon,
  'Natal': Sparkles,
  'Valentim': Heart,
  'Formatura': GraduationCap,
  'Casamento': Flower2,
};

function parsePrice(priceStr: string): number {
  return parseFloat(priceStr.replace('R$', '').replace('.', '').replace(',', '.').trim());
}

export function GiftFinder() {
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState('Todos');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [addedToCart, setAddedToCart] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'rating'>('popular');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('r78-gift-favorites');
    if (saved) setFavorites(JSON.parse(saved));
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (favorites.length > 0) {
      localStorage.setItem('r78-gift-favorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  const filteredGifts = useMemo(() => {
    let items = [...allGiftIdeas];

    // Filter by recipient interests
    if (selectedRecipient) {
      const recipient = recipientPresets.find(r => r.id === selectedRecipient);
      if (recipient) {
        items = items.filter(item =>
          item.tags.some(t => recipient.interests.some(i =>
            t.toLowerCase().includes(i.toLowerCase()) ||
            i.toLowerCase().includes(t.toLowerCase())
          )) ||
          item.category.toLowerCase().includes(recipient.relation.toLowerCase()) ||
          recipient.interests.some(i => item.category.toLowerCase().includes(i.toLowerCase()))
        );
      }
    }

    // Filter by occasion
    if (selectedOccasion !== 'Todos') {
      items = items.filter(item =>
        item.occasion.some(o => o.toLowerCase().includes(selectedOccasion.toLowerCase()))
      );
    }

    // Filter by price range
    const range = priceRanges.find(r => r.id === selectedPriceRange);
    if (range) {
      items = items.filter(item => {
        const p = parsePrice(item.price);
        return p >= range.min && p <= range.max;
      });
    }

    // Sort
    switch (sortBy) {
      case 'price-low': items.sort((a, b) => parsePrice(a.price) - parsePrice(b.price)); break;
      case 'price-high': items.sort((a, b) => parsePrice(b.price) - parsePrice(a.price)); break;
      case 'rating': items.sort((a, b) => b.rating - a.rating); break;
      default: items.sort((a, b) => b.reviews - a.reviews);
    }

    return items;
  }, [selectedRecipient, selectedOccasion, selectedPriceRange, sortBy]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleAddToCart = (id: string) => {
    setAddedToCart(prev => [...prev, id]);
    setTimeout(() => setAddedToCart(prev => prev.filter(i => i !== id)), 2000);
  };

  const OccasionIcon = occasionIcons[selectedOccasion] || Gift;
  const activeRecipient = recipientPresets.find(r => r.id === selectedRecipient);

  if (loading) {
    return (
      <div className="r62-card-lift rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-600 animate-pulse" />
          <div className="h-6 w-48 rounded-lg bg-white/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="r62-card-lift rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <motion.div
            className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20"
            whileHover={{ scale: 1.05, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Gift className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-pink-300 via-rose-400 to-red-400 bg-clip-text text-transparent r62-heading-gradient">
              Guia de Presentes
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Encontre o presente perfeito para cada pessoa</p>
          </div>
        </div>
        <motion.button
          onClick={() => { setSelectedRecipient(null); setSelectedOccasion('Todos'); setSelectedPriceRange('all'); setSortBy('popular'); }}
          className="min-h-[44px] min-w-[44px] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="h-4 w-4 text-slate-300" />
        </motion.button>
      </div>

      {/* Recipient Selection */}
      <div className="mb-5">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Para quem é o presente?</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <AnimatePresence>
            {recipientPresets.map(recipient => (
              <motion.button
                key={recipient.id}
                onClick={() => setSelectedRecipient(selectedRecipient === recipient.id ? null : recipient.id)}
                className={`r78-recipient-btn flex-shrink-0 rounded-xl px-4 py-2.5 min-h-[44px] flex items-center gap-2.5 border transition-all ${
                  selectedRecipient === recipient.id
                    ? 'bg-pink-500/20 border-pink-400/40 text-pink-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                layout
              >
                <span className="text-xl">{recipient.emoji}</span>
                <div className="text-left">
                  <div className="text-sm font-medium">{recipient.name}</div>
                  <div className="text-[10px] opacity-70">{recipient.relation}</div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-3 mb-5">
        {/* Occasion tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1">
          {occasions.map(occ => (
            <motion.button
              key={occ}
              onClick={() => setSelectedOccasion(occ)}
              className={`r78-occasion-tab flex-shrink-0 rounded-lg px-3 py-2 min-h-[44px] flex items-center gap-1.5 text-xs font-medium border transition-all ${
                selectedOccasion === occ
                  ? 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
              whileTap={{ scale: 0.97 }}
            >
              {selectedOccasion === occ && <span className="text-sm">🎁</span>}
              <span>{occ}</span>
            </motion.button>
          ))}
        </div>

        {/* Filter toggle */}
        <motion.button
          onClick={() => setShowFilters(!showFilters)}
          className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center border transition-all shrink-0 ${
            showFilters ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/10 text-slate-400'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <Filter className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Expandable Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="r78-filter-panel mb-5 rounded-xl bg-white/5 border border-white/10 p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Price Range */}
              <div>
                <h4 className="text-xs font-medium text-slate-400 mb-2">Faixa de Preço</h4>
                <div className="flex flex-wrap gap-2">
                  {priceRanges.map(range => (
                    <motion.button
                      key={range.id}
                      onClick={() => setSelectedPriceRange(range.id)}
                      className={`rounded-lg px-3 py-1.5 min-h-[44px] text-xs font-medium border transition-all ${
                        selectedPriceRange === range.id
                          ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                      whileTap={{ scale: 0.97 }}
                    >
                      {range.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h4 className="text-xs font-medium text-slate-400 mb-2">Ordenar por</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'popular' as const, label: 'Mais Populares', icon: TrendingUp },
                    { id: 'price-low' as const, label: 'Menor Preço', icon: Tag },
                    { id: 'price-high' as const, label: 'Maior Preço', icon: Tag },
                    { id: 'rating' as const, label: 'Melhor Avaliação', icon: Star },
                  ].map(sort => (
                    <motion.button
                      key={sort.id}
                      onClick={() => setSortBy(sort.id)}
                      className={`rounded-lg px-3 py-1.5 min-h-[44px] flex items-center gap-1.5 text-xs font-medium border transition-all ${
                        sortBy === sort.id
                          ? 'bg-sky-500/20 border-sky-400/40 text-sky-300'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                      whileTap={{ scale: 0.97 }}
                    >
                      <sort.icon className="h-3 w-3" />
                      {sort.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active recipient badge */}
      {activeRecipient && (
        <motion.div
          className="mb-4 flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 rounded-lg px-3 py-2"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-lg">{activeRecipient.emoji}</span>
          <span className="text-sm text-pink-300">
            Sugestões para <strong>{activeRecipient.name}</strong>
            <span className="text-pink-400/60 ml-1">({activeRecipient.interests.join(', ')})</span>
          </span>
          <button
            onClick={() => setSelectedRecipient(null)}
            className="ml-auto min-h-[44px] min-w-[44px] flex items-center justify-center text-pink-400/60 hover:text-pink-300"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-slate-500">
          {filteredGifts.length} presente{filteredGifts.length !== 1 ? 's' : ''} encontrado{filteredGifts.length !== 1 ? 's' : ''}
          {favorites.length > 0 && (
            <span className="ml-2 text-pink-400">• {favorites.length} favorito{favorites.length !== 1 ? 's' : ''}</span>
          )}
        </span>
        {selectedOccasion !== 'Todos' && (
          <span className="flex items-center gap-1 text-xs text-rose-400">
            <OccasionIcon className="h-3 w-3" />
            {selectedOccasion}
          </span>
        )}
      </div>

      {/* Gift Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredGifts.map((gift, index) => (
            <motion.div
              key={gift.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.03 }}
              className={`r78-gift-card rounded-xl border bg-white/5 overflow-hidden relative`}
            >
              {/* Image placeholder + discount badge */}
              <div className="relative h-36 bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
                <span className="text-5xl">{gift.emoji}</span>
                {gift.originalPrice && (
                  <div className="absolute top-2 left-2 bg-red-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    -{Math.round((1 - parsePrice(gift.price) / parsePrice(gift.originalPrice)) * 100)}%
                  </div>
                )}
                {gift.wrapAvailable && (
                  <div className="absolute top-2 right-2 bg-pink-500/90 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Package className="h-2.5 w-2.5" />
                    Embalagem
                  </div>
                )}
                {/* Favorite */}
                <motion.button
                  onClick={() => toggleFavorite(gift.id)}
                  className={`absolute bottom-2 right-2 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
                    favorites.includes(gift.id)
                      ? 'bg-pink-500/30 text-pink-400'
                      : 'bg-black/30 text-white/60 hover:text-pink-400'
                  }`}
                  whileTap={{ scale: 0.8 }}
                >
                  <Heart className={`h-5 w-5 ${favorites.includes(gift.id) ? 'fill-current' : ''}`} />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-4">
                <h4 className="font-semibold text-white text-sm leading-tight mb-1">{gift.name}</h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-slate-400">{gift.store}</span>
                  <div className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-yellow-400 font-medium">{gift.rating}</span>
                    <span className="text-[10px] text-slate-500">({gift.reviews})</span>
                  </div>
                </div>

                {/* AI reason */}
                <div className="flex items-start gap-1.5 bg-rose-500/10 rounded-lg px-2.5 py-1.5 mb-3">
                  <Sparkles className="h-3 w-3 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span className="text-[11px] text-rose-300 leading-tight">{gift.reason}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {gift.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Bottom: price + actions */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-emerald-400">{gift.price}</span>
                    {gift.originalPrice && (
                      <span className="text-xs text-slate-500 line-through ml-1">{gift.originalPrice}</span>
                    )}
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3 text-slate-500" />
                      <span className="text-[10px] text-slate-500">{gift.delivery}</span>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => handleAddToCart(gift.id)}
                    className={`min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center transition-all ${
                      addedToCart.includes(gift.id)
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                    }`}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredGifts.length === 0 && (
        <motion.div
          className="text-center py-12 text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Gift className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium mb-1">Nenhum presente encontrado</p>
          <p className="text-xs text-slate-500">Tente outros filtros ou selecione outra pessoa</p>
          <motion.button
            onClick={() => { setSelectedRecipient(null); setSelectedOccasion('Todos'); setSelectedPriceRange('all'); }}
            className="mt-3 text-pink-400 text-sm underline underline-offset-2 hover:text-pink-300 min-h-[44px] inline-flex items-center"
            whileTap={{ scale: 0.95 }}
          >
            Limpar filtros
          </motion.button>
        </motion.div>
      )}

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          Precisa de ajuda? Chat com especialista em presentes
        </span>
        <span>{allGiftIdeas.length} presentes disponíveis</span>
      </div>
    </div>
  );
}

export default GiftFinder;
