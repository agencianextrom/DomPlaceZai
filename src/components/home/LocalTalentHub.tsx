"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  Clock,
  Heart,
  MessageCircle,
  Briefcase,
  Camera,
  Music,
  Dumbbell,
  GraduationCap,
  Palette,
  Wrench,
  ChevronRight,
  Award,
  TrendingUp,
  Users,
  Search,
  Filter,
  Zap,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────
interface Talent {
  id: number;
  name: string;
  initials: string;
  category: string;
  categoryKey: string;
  rating: number;
  reviews: number;
  specialty: string;
  priceMin: number;
  priceMax: number;
  available: boolean;
  responseTime: string;
  verified: boolean;
  gFrom: string;
  gTo: string;
}

// ── Data ──────────────────────────────────────────────────────────
const categories = [
  { key: "all", label: "Todos", emoji: "✨" },
  { key: "fotografia", label: "Fotografia", emoji: "📸" },
  { key: "musica", label: "Música", emoji: "🎵" },
  { key: "personal", label: "Personal Trainer", emoji: "💪" },
  { key: "tutoria", label: "Tutoria", emoji: "📚" },
  { key: "design", label: "Design", emoji: "🎨" },
  { key: "manutencao", label: "Manutenção", emoji: "🔧" },
  { key: "culinaria", label: "Culinária", emoji: "🍳" },
];

const talents: Talent[] = [
  { id: 1, name: "Ana Beatriz Silva", initials: "AB", category: "Fotografia", categoryKey: "fotografia",
    rating: 4.9, reviews: 127, specialty: "Ensaios personalizados e eventos", priceMin: 120, priceMax: 250,
    available: true, responseTime: "~30min", verified: true, gFrom: "#f59e0b", gTo: "#ef4444" },
  { id: 2, name: "Carlos Eduardo Lima", initials: "CL", category: "Música", categoryKey: "musica",
    rating: 4.8, reviews: 89, specialty: "Aulas de violão e produção musical", priceMin: 80, priceMax: 150,
    available: true, responseTime: "~45min", verified: true, gFrom: "#8b5cf6", gTo: "#3b82f6" },
  { id: 3, name: "Fernanda Rocha", initials: "FR", category: "Personal Trainer", categoryKey: "personal",
    rating: 5.0, reviews: 203, specialty: "Treinamento funcional e corrida", priceMin: 100, priceMax: 200,
    available: true, responseTime: "~20min", verified: true, gFrom: "#10b981", gTo: "#06b6d4" },
  { id: 4, name: "Ricardo Mendes", initials: "RM", category: "Tutoria", categoryKey: "tutoria",
    rating: 4.7, reviews: 56, specialty: "Matemática e física para vestibulares", priceMin: 70, priceMax: 120,
    available: false, responseTime: "~1h", verified: true, gFrom: "#f97316", gTo: "#eab308" },
  { id: 5, name: "Juliana Martins", initials: "JM", category: "Design", categoryKey: "design",
    rating: 4.9, reviews: 145, specialty: "Branding e design de interfaces", priceMin: 150, priceMax: 300,
    available: true, responseTime: "~15min", verified: true, gFrom: "#ec4899", gTo: "#f43f5e" },
  { id: 6, name: "Paulo Henrique Santos", initials: "PS", category: "Manutenção", categoryKey: "manutencao",
    rating: 4.6, reviews: 78, specialty: "Reparos elétricos e hidráulicos", priceMin: 90, priceMax: 180,
    available: true, responseTime: "~40min", verified: true, gFrom: "#6366f1", gTo: "#a855f7" },
];

const trendingTalents = [
  { id: 101, name: "Ana Beatriz Silva", initials: "AB", category: "Fotografia",
    views: "3.2k visualizações", gFrom: "#f59e0b", gTo: "#ef4444" },
  { id: 102, name: "Fernanda Rocha", initials: "FR", category: "Personal Trainer",
    views: "2.8k visualizações", gFrom: "#10b981", gTo: "#06b6d4" },
  { id: 103, name: "Juliana Martins", initials: "JM", category: "Design",
    views: "2.1k visualizações", gFrom: "#ec4899", gTo: "#f43f5e" },
];

const quickServices = [
  { id: 1, name: "Ensaio Fotográfico", Icon: Camera, priceFrom: 150, color: "from-amber-500 to-orange-500" },
  { id: 2, name: "Aula Particular", Icon: GraduationCap, priceFrom: 70, color: "from-violet-500 to-purple-500" },
  { id: 3, name: "Personal Training", Icon: Dumbbell, priceFrom: 100, color: "from-emerald-500 to-teal-500" },
  { id: 4, name: "Consultoria Design", Icon: Palette, priceFrom: 120, color: "from-pink-500 to-rose-500" },
];

const trustItems = [
  "✓ Verificação de Identidade",
  "✓ Avaliações Reais",
  "✓ Pagamento Seguro",
  "✓ Garantia de Satisfação",
];

// ── Animation Variants ──────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

const pulseVariant = {
  animate: {
    opacity: [0.4, 0.7, 0.4],
    transition: { repeat: Infinity, duration: 1.2, ease: "easeInOut" as const },
  },
};

// ── Helpers ────────────────────────────────────────────────────────
function renderStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return Array.from({ length: 5 }, (_, i) => {
    if (i < full) return <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />;
    if (i === full && half) return <Star key={i} className="h-3.5 w-3.5 fill-amber-400/50 text-amber-400" />;
    return <Star key={i} className="h-3.5 w-3.5 text-gray-300" />;
  });
}

// ── Component ──────────────────────────────────────────────────────
export default function LocalTalentHub() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const filteredTalents = talents.filter((t) => {
    const catMatch = selectedCategory === "all" || t.categoryKey === selectedCategory;
    const q = searchQuery.toLowerCase();
    const searchMatch = !q || t.name.toLowerCase().includes(q) ||
      t.specialty.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    return catMatch && searchMatch;
  });

  // ── Loading Skeleton ──────────────────────────────────────────
  if (loading) {
    return (
      <section className="w-full" aria-label="Carregando talentos">
        <motion.div
          className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 mb-6"
          variants={pulseVariant} animate="animate"
        >
          <div className="h-8 w-48 rounded-lg bg-white/30 mb-3" />
          <div className="h-5 w-64 rounded-lg bg-white/20 mb-4" />
          <div className="h-11 w-full max-w-md rounded-xl bg-white/25" />
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {Array.from({ length: 4 }, (_, i) => (
            <motion.div key={i} className="h-24 rounded-xl bg-gray-200" variants={pulseVariant} animate="animate" />
          ))}
        </div>
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {Array.from({ length: 8 }, (_, i) => (
            <motion.div key={i} className="h-[44px] w-28 flex-shrink-0 rounded-full bg-gray-200"
              variants={pulseVariant} animate="animate" />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <motion.div key={i} className="h-80 rounded-2xl bg-gray-200" variants={pulseVariant} animate="animate" />
          ))}
        </div>
      </section>
    );
  }

  // ── Main Render ───────────────────────────────────────────────
  return (
    <section className="w-full space-y-6" aria-label="Talento Local - Hub de Profissionais">

      {/* ─── 1. Header ────────────────────────────────────────── */}
      <motion.div
        className="relative w-full rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 text-white"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring" as const, stiffness: 260, damping: 20 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Talento Local 🌟</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                <Users className="h-3.5 w-3.5" /> 238+ profissionais
              </span>
            </div>
            <p className="text-sm sm:text-base text-white/90">Encontre os melhores talentos do seu bairro</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-200" />
            <input
              type="text" placeholder="Buscar profissional ou serviço..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-white/20 backdrop-blur-sm pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/60 outline-none border border-white/20 focus:border-white/40 transition-colors min-h-[44px]"
              aria-label="Buscar profissionais"
            />
          </div>
        </div>
      </motion.div>

      {/* ─── 2. Stats Row ─────────────────────────────────────── */}
      <motion.div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" variants={containerVariants} initial="hidden" animate="visible">
        {[
          { icon: <Users className="h-5 w-5 text-orange-500" />, value: "238+", label: "Profissionais" },
          { icon: <Star className="h-5 w-5 text-amber-500" />, value: "4.9★", label: "Avaliação" },
          { icon: <Briefcase className="h-5 w-5 text-emerald-500" />, value: "5.2k", label: "Serviços Realizados" },
          { icon: <TrendingUp className="h-5 w-5 text-rose-500" />, value: "97%", label: "Satisfação" },
        ].map((s) => (
          <motion.div
            key={s.label} className="flex-shrink-0 w-44 rounded-xl bg-white border border-gray-100 p-4 flex flex-col gap-1 r98-stat-card"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }} variants={itemVariants}
          >
            <div className="flex items-center gap-2">
              {s.icon}
              <span className="text-lg font-bold text-gray-900">{s.value}</span>
            </div>
            <span className="text-xs text-gray-500">{s.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── 3. Category Filter ───────────────────────────────── */}
      <motion.div
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        variants={containerVariants} initial="hidden" animate="visible"
        role="tablist" aria-label="Filtrar por categoria"
      >
        {categories.map((cat) => (
          <motion.button
            key={cat.key} role="tab" aria-selected={selectedCategory === cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors min-h-[44px] min-w-[44px] r98-category-pill ${
              selectedCategory === cat.key
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            style={{ boxShadow: selectedCategory === cat.key ? "0 4px 12px rgba(249,115,22,0.3)" : "none" }}
            variants={itemVariants} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          >
            <Filter className="h-3.5 w-3.5 opacity-70" />
            <span>{cat.emoji} {cat.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* ─── 4. Featured Talents ─────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Profissionais em Destaque</h3>
          <button className="flex items-center gap-1 text-sm text-orange-600 font-medium min-h-[44px] min-w-[44px] px-2"
            aria-label="Ver todos os profissionais">
            Ver todos <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {filteredTalents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Search className="h-10 w-10 mb-3" />
            <p className="text-sm font-medium">Nenhum profissional encontrado</p>
            <p className="text-xs mt-1">Tente outro termo ou categoria</p>
          </div>
        ) : (
          <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-4" variants={containerVariants} initial="hidden" animate="visible">
            {filteredTalents.map((t) => (
              <motion.div
                key={t.id}
                className="relative rounded-2xl bg-white border border-gray-100 p-4 flex flex-col gap-3 r98-talent-card"
                style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
                variants={itemVariants}
                whileHover={{
                  y: -4, boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
                  transition: { type: "spring" as const, stiffness: 400, damping: 25 },
                }}
              >
                {/* Status badges */}
                <div className="flex items-center justify-between">
                  {t.available && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[11px] font-medium">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Disponível agora
                    </span>
                  )}
                  {t.verified && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 text-blue-600 px-2 py-0.5 text-[11px] font-medium">
                      <Award className="h-3 w-3" /> Verificado
                    </span>
                  )}
                </div>

                {/* Avatar + Name + Category */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: `linear-gradient(135deg, ${t.gFrom}, ${t.gTo})` }} aria-hidden="true">
                    {t.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{t.name}</h4>
                    <span className="inline-block mt-0.5 rounded-md bg-orange-50 text-orange-700 px-2 py-0.5 text-[10px] font-semibold">
                      {t.category}
                    </span>
                  </div>
                </div>

                {/* Star rating */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-px">{renderStars(t.rating)}</div>
                  <span className="text-xs font-semibold text-gray-700">{t.rating}</span>
                  <span className="text-[11px] text-gray-400">({t.reviews} avaliações)</span>
                </div>

                {/* Specialty */}
                <p className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-medium text-gray-700">Especialidade:</span> {t.specialty}
                </p>

                {/* Price range */}
                <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                  <span className="text-xs font-normal text-gray-500">A partir de</span>
                  <Zap className="h-3.5 w-3.5 text-orange-500" />
                  R$ {t.priceMin} - R$ {t.priceMax}
                  <span className="text-xs font-normal text-gray-400">/hora</span>
                </div>

                {/* Response time + Location */}
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Responde em {t.responseTime}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> São Paulo</span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                  <motion.button
                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-[11px] font-medium min-h-[44px] min-w-[44px] transition-colors"
                    style={{
                      backgroundColor: favorites.has(t.id) ? "#fef2f2" : "#f9fafb",
                      color: favorites.has(t.id) ? "#ef4444" : "#6b7280",
                    }}
                    onClick={() => toggleFavorite(t.id)}
                    aria-label={favorites.has(t.id) ? `Remover ${t.name} dos favoritos` : `Favoritar ${t.name}`}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart className="h-3.5 w-3.5" fill={favorites.has(t.id) ? "currentColor" : "none"} />
                    <span className="hidden sm:inline">{favorites.has(t.id) ? "Salvo" : "Favoritar"}</span>
                  </motion.button>
                  <motion.button
                    className="flex items-center gap-1 rounded-lg bg-orange-50 text-orange-700 px-3 py-2 text-[11px] font-medium min-h-[44px] min-w-[44px] transition-colors hover:bg-orange-100"
                    aria-label={`Entrar em contato com ${t.name}`} whileTap={{ scale: 0.9 }}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Contato</span>
                  </motion.button>
                  <motion.button
                    className="flex items-center gap-1 rounded-lg bg-gray-100 text-gray-700 px-3 py-2 text-[11px] font-medium min-h-[44px] min-w-[44px] transition-colors hover:bg-gray-200 ml-auto"
                    aria-label={`Ver portfólio de ${t.name}`} whileTap={{ scale: 0.9 }}
                  >
                    <Briefcase className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Portfólio</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ─── 5. Trending Talents ──────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-rose-500" />
          <h3 className="text-lg font-bold text-gray-900">Em Alta</h3>
          <span className="rounded-full bg-rose-50 text-rose-600 px-2 py-0.5 text-[11px] font-semibold">🔥 Trending</span>
        </div>
        <motion.div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" variants={containerVariants} initial="hidden" animate="visible">
          {trendingTalents.map((t) => (
            <motion.div
              key={t.id}
              className="flex-shrink-0 w-64 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-5 text-white relative overflow-hidden r98-trending-card"
              style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
              variants={itemVariants}
              whileHover={{
                scale: 1.02, boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
                transition: { type: "spring" as const, stiffness: 400, damping: 25 },
              }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
                style={{ background: `radial-gradient(circle, ${t.gFrom}, transparent)`, transform: "translate(30%, -30%)" }} />
              <div className="flex items-center gap-3 mb-3">
                <div className="h-11 w-11 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: `linear-gradient(135deg, ${t.gFrom}, ${t.gTo})` }}>
                  {t.initials}
                </div>
                <div>
                  <h4 className="text-sm font-bold">{t.name}</h4>
                  <span className="text-[11px] text-gray-400">{t.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" /> {t.views} esta semana
              </div>
              <div className="flex items-center gap-1 mt-2 text-rose-400 text-xs font-medium">
                <TrendingUp className="h-3.5 w-3.5" /> Em alta <ChevronRight className="h-3 w-3" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ─── 6. Quick Book Section ────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-bold text-gray-900">Agendar Rápido</h3>
        </div>
        <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-3" variants={containerVariants} initial="hidden" animate="visible">
          {quickServices.map((svc) => (
            <motion.button
              key={svc.id}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white border border-gray-100 p-4 text-center min-h-[44px] min-w-[44px] transition-colors hover:border-orange-200 r98-quick-book-card"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              variants={itemVariants}
              whileHover={{
                y: -2, boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                transition: { type: "spring" as const, stiffness: 400, damping: 25 },
              }}
              whileTap={{ scale: 0.97 }}
              aria-label={`Agendar ${svc.name}`}
            >
              <div className={`flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br ${svc.color} text-white`}>
                <svc.Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-gray-800">{svc.name}</span>
              <span className="text-[10px] text-gray-400">A partir de R$ {svc.priceFrom}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* ─── 7. Trust Indicators Bar ──────────────────────────── */}
      <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-3" variants={containerVariants} initial="hidden" animate="visible">
        {trustItems.map((item) => (
          <motion.div key={item} className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 min-h-[44px]" variants={itemVariants}>
            <span className="text-xs font-medium text-emerald-700">{item}</span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
