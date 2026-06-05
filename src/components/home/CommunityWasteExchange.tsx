"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Recycle, Leaf, Truck, ArrowRightLeft, MapPin, Clock, Heart, Star,
  ChevronRight, Award, TrendingUp, Search, Filter, Package, Droplets, Zap,
} from "lucide-react";

interface ExchangeItem {
  id: number;
  title: string;
  emoji: string;
  gradient: string;
  condition: string;
  conditionColor: string;
  category: string;
  catEmoji: string;
  postedBy: string;
  rating: number;
  exType: "Doar" | "Trocar" | "Reciclar";
  exColor: string;
  distance: string;
  time: string;
  eco: string;
}

const exchangeItems: ExchangeItem[] = [
  { id: 1, title: "Notebook Dell Inspiron 2019", emoji: "💻", gradient: "from-emerald-400 to-teal-500",
    condition: "Como Novo", conditionColor: "bg-emerald-100 text-emerald-700",
    category: "Eletrônicos", catEmoji: "📱", postedBy: "Carlos M.", rating: 5,
    exType: "Trocar", exColor: "bg-amber-100 text-amber-700", distance: "2.3 km", time: "há 2h", eco: "3.2kg CO₂" },
  { id: 2, title: "Mesa de Jantar 4 Lugares", emoji: "🪑", gradient: "from-amber-400 to-orange-500",
    condition: "Bom Estado", conditionColor: "bg-blue-100 text-blue-700",
    category: "Móveis", catEmoji: "🪑", postedBy: "Ana P.", rating: 4,
    exType: "Doar", exColor: "bg-emerald-100 text-emerald-700", distance: "1.1 km", time: "há 5h", eco: "5.4kg CO₂" },
  { id: 3, title: "Jaqueta de Couro Masculina M", emoji: "🧥", gradient: "from-rose-400 to-pink-500",
    condition: "Aceitável", conditionColor: "bg-gray-100 text-gray-700",
    category: "Roupas", catEmoji: "👕", postedBy: "Fernando R.", rating: 4,
    exType: "Doar", exColor: "bg-emerald-100 text-emerald-700", distance: "3.7 km", time: "há 1d", eco: "1.8kg CO₂" },
  { id: 4, title: "Conjunto Harry Potter Completo", emoji: "📚", gradient: "from-violet-400 to-purple-500",
    condition: "Como Novo", conditionColor: "bg-emerald-100 text-emerald-700",
    category: "Livros", catEmoji: "📚", postedBy: "Lucia T.", rating: 5,
    exType: "Trocar", exColor: "bg-amber-100 text-amber-700", distance: "0.8 km", time: "há 3h", eco: "0.9kg CO₂" },
  { id: 5, title: "Kit Lego City 120 Peças", emoji: "🧸", gradient: "from-sky-400 to-cyan-500",
    condition: "Bom Estado", conditionColor: "bg-blue-100 text-blue-700",
    category: "Brinquedos", catEmoji: "🧸", postedBy: "Roberto S.", rating: 5,
    exType: "Reciclar", exColor: "bg-teal-100 text-teal-700", distance: "4.2 km", time: "há 8h", eco: "1.2kg CO₂" },
  { id: 6, title: "Panela de Pressão Tramontina", emoji: "🍳", gradient: "from-lime-400 to-green-500",
    condition: "Bom Estado", conditionColor: "bg-blue-100 text-blue-700",
    category: "Utensílios", catEmoji: "🍳", postedBy: "Maria L.", rating: 4,
    exType: "Trocar", exColor: "bg-amber-100 text-amber-700", distance: "1.5 km", time: "há 12h", eco: "2.1kg CO₂" },
];

const categories = [
  { name: "Todos", emoji: "♻️" }, { name: "Eletrônicos", emoji: "📱" },
  { name: "Móveis", emoji: "🪑" }, { name: "Roupas", emoji: "👕" },
  { name: "Livros", emoji: "📚" }, { name: "Brinquedos", emoji: "🧸" },
  { name: "Utensílios", emoji: "🍳" }, { name: "Orgânico", emoji: "🌱" },
];

const donateCards = [
  { icon: "🔋", title: "Eletrônicos", desc: "Celulares, notebooks e cabos descartados",
    count: "127 itens", urgency: "Urgente", uColor: "text-red-600", border: "border-red-300", bg: "bg-red-50" },
  { icon: "👕", title: "Roupas", desc: "Roupas em bom estado para doação",
    count: "342 itens", urgency: "Alta", uColor: "text-amber-600", border: "border-amber-300", bg: "bg-amber-50" },
  { icon: "📖", title: "Livros", desc: "Livros didáticos e literatura",
    count: "89 itens", urgency: "Média", uColor: "text-blue-600", border: "border-blue-300", bg: "bg-blue-50" },
  { icon: "🌿", title: "Orgânico", desc: "Resíduos para compostagem comunitária",
    count: "56 itens", urgency: "Contínuo", uColor: "text-emerald-600", border: "border-emerald-300", bg: "bg-emerald-50" },
];

const recyclingTips = [
  { emoji: "♻️", title: "Separar materiais recicláveis",
    desc: "Plástico, papel, vidro e metal devem ser separados para coleta seletiva eficiente." },
  { emoji: "🌱", title: "Compostar resíduos orgânicos",
    desc: "Restos de comida viram adubo natural para hortas comunitárias e jardins." },
  { emoji: "🔧", title: "Reparar ao invés de descartar",
    desc: "Consertar eletrônicos e móveis evita descarte desnecessário e economiza recursos." },
];

const statCards = [
  { label: "Itens Disponíveis", value: "892+", Icon: Package },
  { label: "Trocas Realizadas", value: "3.4k", Icon: ArrowRightLeft },
  { label: "CO₂ Economizado", value: "12t", Icon: Droplets },
  { label: "Participantes", value: "1.5k", Icon: Recycle },
];

const trustBadges = [
  "✓ Itens Verificados",
  "✓ Trocas Monitoradas",
  "✓ Coleta Agendada",
  "✓ Impacto Rastreável",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-200 p-4 space-y-3">
      <div className="h-28 rounded-xl bg-gray-200 animate-pulse" />
      <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
      <div className="h-3 w-1/2 rounded bg-gray-200 animate-pulse" />
      <div className="flex gap-2">
        <div className="h-8 w-20 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-8 w-16 rounded-full bg-gray-200 animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="h-11 flex-1 rounded-lg bg-gray-200 animate-pulse" />
        <div className="h-11 flex-1 rounded-lg bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}

function ExchangeTypeIcon({ type }: { type: string }) {
  if (type === "Doar") return <Heart className="mr-0.5 h-3 w-3" />;
  if (type === "Trocar") return <ArrowRightLeft className="mr-0.5 h-3 w-3" />;
  return <Recycle className="mr-0.5 h-3 w-3" />;
}

export default function CommunityWasteExchange() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [impactSaved] = useState(8.5);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const filteredItems = exchangeItems.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === "Todos" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const circumference = 2 * Math.PI * 54;
  const progressPercent = Math.min((impactSaved / 20) * 100, 100);
  const dashOffset = circumference - (progressPercent / 100) * circumference;

  return (
    <section className="w-full" aria-label="Troca Solidária - Community Waste Exchange">
      {/* ===== Header ===== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-teal-600 to-emerald-600 px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Troca Solidária ♻️</h2>
              <p className="text-sm text-emerald-100">Transforme seu lixo em oportunidade</p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
            <Recycle className="h-3.5 w-3.5" /> 892+ itens disponíveis
          </span>
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar itens para troca, doação ou reciclagem..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border-0 bg-white/95 py-3 pl-10 pr-4 text-sm text-gray-800 shadow-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label="Buscar itens"
            />
          </div>
        </div>
      </div>

      {/* ===== Stats Row ===== */}
      <div className="mt-5 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {statCards.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.03 }}
            className="flex min-w-[130px] flex-1 flex-col items-center gap-1.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm r99-stat-card"
          >
            <div className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xl bg-emerald-50">
              <stat.Icon className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">{stat.value}</span>
            <span className="text-xs text-gray-500">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* ===== Category Filter ===== */}
      <div className="mt-5">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Categorias</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex min-h-[44px] min-w-[44px] shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors ${
                selectedCategory === cat.name
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50/50"
              }`}
              aria-pressed={selectedCategory === cat.name}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== Exchange Items Grid ===== */}
      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Itens Disponíveis</h3>
          <span className="text-sm text-gray-500">{filteredItems.length} resultados</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCategory}-${searchQuery}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-4 sm:grid-cols-3"
            >
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  variants={cardVariants}
                  whileHover={{ y: -4 }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm r99-waste-card"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                >
                  <div className={`relative flex h-28 items-center justify-center bg-gradient-to-br ${item.gradient} sm:h-32`}>
                    <span className="text-4xl sm:text-5xl">{item.emoji}</span>
                    <span className={`absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold shadow-sm ${item.conditionColor}`}>
                      {item.condition}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <h4 className="line-clamp-2 text-sm font-semibold leading-tight text-gray-900">{item.title}</h4>

                    <div className="flex flex-wrap gap-1.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${item.conditionColor}`}>
                        {item.catEmoji} {item.category}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${item.exColor}`}>
                        <ExchangeTypeIcon type={item.exType} />
                        {item.exType}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{item.postedBy}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{item.distance}</span>
                      <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{item.time}</span>
                    </div>

                    <div className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                      🌱 Economiza {item.eco}
                    </div>

                    <div className="mt-auto flex gap-2 pt-1">
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className={`flex min-h-[44px] min-w-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl text-sm font-medium transition-colors ${
                          favorites.has(item.id)
                            ? "bg-red-50 text-red-600"
                            : "bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-500"
                        }`}
                        aria-label={favorites.has(item.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                      >
                        <Heart className={`h-4 w-4 ${favorites.has(item.id) ? "fill-red-500 text-red-500" : ""}`} />
                        <span>Quero</span>
                      </button>
                      <button
                        className="flex min-h-[44px] min-w-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-50 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                        aria-label="Entrar em contato"
                      >
                        💬 Contato
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {filteredItems.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Recycle className="mb-3 h-12 w-12 text-gray-300" />
            <p className="text-sm text-gray-500">Nenhum item encontrado nesta categoria.</p>
          </div>
        )}
      </div>

      {/* ===== Quick Donate Section ===== */}
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Truck className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-bold text-gray-900">Doação Rápida</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {donateCards.map((card) => (
            <motion.div
              key={card.title}
              whileHover={{ scale: 1.02 }}
              className={`flex flex-col gap-2 rounded-2xl border-2 ${card.border} ${card.bg} p-4 r99-donate-card`}
            >
              <span className="text-3xl">{card.icon}</span>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-800">{card.title}</h4>
                <span className={`text-xs font-semibold ${card.uColor}`}>{card.urgency}</span>
              </div>
              <p className="text-xs leading-relaxed text-gray-600">{card.desc}</p>
              <span className="text-xs font-medium text-gray-500">{card.count}</span>
              <button
                className="flex min-h-[44px] min-w-[44px] w-full items-center justify-center rounded-xl bg-white text-sm font-semibold text-emerald-700 shadow-sm transition-colors hover:bg-emerald-50"
                aria-label={`Doar ${card.title} agora`}
              >
                Doar Agora
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ===== Eco Impact Tracker ===== */}
      <div className="mt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring" as const, stiffness: 260, damping: 20 }}
          className="flex flex-col items-center gap-4 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 sm:flex-row sm:gap-6"
        >
          <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
            <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <motion.circle
                cx="60" cy="60" r="54" fill="none" stroke="#10b981" strokeWidth="8"
                strokeLinecap="round" strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <Leaf className="h-5 w-5 text-emerald-600" />
              <span className="mt-1 text-lg font-bold text-emerald-700">{impactSaved}kg</span>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center gap-2 text-center sm:items-start sm:text-left">
            <h3 className="text-lg font-bold text-gray-900">
              Você já economizou <span className="text-emerald-600">{impactSaved}kg de CO₂</span>
            </h3>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">+2.1kg este mês</span>
            </div>
            <p className="text-sm text-gray-500">
              Continue trocando e doando para aumentar seu impacto ambiental positivo.
            </p>
            <button
              className="flex min-h-[44px] min-w-[44px] items-center gap-1 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              aria-label="Ver histórico de impacto"
            >
              Ver Histórico
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* ===== Recycling Tips ===== */}
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-bold text-gray-900">Dicas de Reciclagem</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {recyclingTips.map((tip) => (
            <motion.div
              key={tip.title}
              whileHover={{ scale: 1.02 }}
              className="flex min-w-[220px] flex-col gap-2 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-4 r99-tip-card"
            >
              <span className="text-3xl">{tip.emoji}</span>
              <h4 className="text-sm font-bold text-gray-800">{tip.title}</h4>
              <p className="text-xs leading-relaxed text-gray-600">{tip.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ===== Trust Bar ===== */}
      <div className="mt-8 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm r99-impact-ring">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {trustBadges.map((badge) => (
            <div key={badge} className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-3">
              <Award className="h-4 w-4 shrink-0 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
