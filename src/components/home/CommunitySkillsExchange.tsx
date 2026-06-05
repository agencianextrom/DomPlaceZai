"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, GraduationCap, Clock, MapPin, Star, Heart, MessageCircle,
  ChevronRight, Users, TrendingUp, Search, Filter, Award, Zap, Video,
  Globe, Headphones, Languages, Dumbbell, Music, Code, Palette,
  Lightbulb, CheckCircle,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────
interface ClassCard {
  id: number;
  title: string;
  emoji: string;
  instructor: string;
  initials: string;
  gFrom: string;
  gTo: string;
  headerFrom: string;
  headerTo: string;
  rating: number;
  students: number;
  level: "Iniciante" | "Intermediário" | "Avançado";
  format: "Presencial" | "Online" | "Híbrido";
  duration: string;
  schedule: string;
  price: number | null;
  badge?: "🔥 Popular" | "⭐ Destaque";
}

interface Instructor {
  id: number;
  name: string;
  initials: string;
  gFrom: string;
  gTo: string;
  specialties: string;
  rating: number;
  classes: number;
}

interface LearningPath {
  id: number;
  title: string;
  level: string;
  courses: number;
  progress: number;
  color: string;
  icon: string;
}

interface LiveSession {
  id: number;
  topic: string;
  instructor: string;
  countdown: string;
  participants: number;
  initials: string;
  gFrom: string;
  gTo: string;
}

interface Review {
  id: number;
  name: string;
  course: string;
  rating: number;
  text: string;
}

// ── Data ──────────────────────────────────────────────────────────
const categories = [
  { key: "Todos", label: "Todos", emoji: "✨" },
  { key: "Idiomas", label: "Idiomas", emoji: "🌍" },
  { key: "Música", label: "Música", emoji: "🎵" },
  { key: "Programação", label: "Programação", emoji: "💻" },
  { key: "Arte", label: "Arte", emoji: "🎨" },
  { key: "Esporte", label: "Esporte", emoji: "🏋️" },
  { key: "Culinária", label: "Culinária", emoji: "🍳" },
  { key: "Fotografia", label: "Fotografia", emoji: "📸" },
  { key: "Matemática", label: "Matemática", emoji: "📐" },
  { key: "Negócios", label: "Negócios", emoji: "💼" },
];

const classes: ClassCard[] = [
  { id: 1, title: "Inglês Conversacional", emoji: "🇺🇸", instructor: "Ana Beatriz", initials: "AB", gFrom: "#8b5cf6", gTo: "#6366f1", headerFrom: "#7c3aed", headerTo: "#4f46e5", rating: 4.9, students: 234, level: "Iniciante", format: "Online", duration: "8 semanas", schedule: "Seg/Qui 19h", price: 89, badge: "🔥 Popular" },
  { id: 2, title: "Violão do Zero", emoji: "🎸", instructor: "Carlos Lima", initials: "CL", gFrom: "#f59e0b", gTo: "#ef4444", headerFrom: "#d97706", headerTo: "#dc2626", rating: 4.8, students: 178, level: "Iniciante", format: "Presencial", duration: "12 semanas", schedule: "Ter/Sex 18h", price: 120, badge: "⭐ Destaque" },
  { id: 3, title: "JavaScript Avançado", emoji: "💻", instructor: "Ricardo Mendes", initials: "RM", gFrom: "#10b981", gTo: "#06b6d4", headerFrom: "#059669", headerTo: "#0891b2", rating: 4.7, students: 156, level: "Avançado", format: "Híbrido", duration: "10 semanas", schedule: "Seg/Qua 20h", price: 199, badge: "🔥 Popular" },
  { id: 4, title: "Aquarela para Iniciantes", emoji: "🎨", instructor: "Juliana Martins", initials: "JM", gFrom: "#ec4899", gTo: "#f43f5e", headerFrom: "#db2777", headerTo: "#e11d48", rating: 4.9, students: 98, level: "Iniciante", format: "Presencial", duration: "6 semanas", schedule: "Sáb 10h", price: 75 },
  { id: 5, title: "Espanhol Rápido", emoji: "🇪🇸", instructor: "Fernanda Rocha", initials: "FR", gFrom: "#f97316", gTo: "#eab308", headerFrom: "#ea580c", headerTo: "#ca8a04", rating: 4.6, students: 142, level: "Intermediário", format: "Online", duration: "8 semanas", schedule: "Ter/Qui 20h", price: 69, badge: "⭐ Destaque" },
  { id: 6, title: "Yoga & Bem-Estar", emoji: "🧘", instructor: "Paulo Santos", initials: "PS", gFrom: "#14b8a6", gTo: "#22d3ee", headerFrom: "#0d9488", headerTo: "#06b6d4", rating: 5.0, students: 210, level: "Iniciante", format: "Presencial", duration: "Contínuo", schedule: "Seg/Sex 7h", price: null },
];

const instructors: Instructor[] = [
  { id: 1, name: "Ana Beatriz Silva", initials: "AB", gFrom: "#8b5cf6", gTo: "#6366f1", specialties: "Inglês, Espanhol, Francês", rating: 4.9, classes: 12 },
  { id: 2, name: "Carlos Eduardo Lima", initials: "CL", gFrom: "#f59e0b", gTo: "#ef4444", specialties: "Violão, Piano, Canto", rating: 4.8, classes: 8 },
  { id: 3, name: "Ricardo Mendes", initials: "RM", gFrom: "#10b981", gTo: "#06b6d4", specialties: "JavaScript, Python, React", rating: 4.7, classes: 15 },
  { id: 4, name: "Juliana Martins", initials: "JM", gFrom: "#ec4899", gTo: "#f43f5e", specialties: "Aquarela, Pintura, Design", rating: 4.9, classes: 6 },
];

const learningPaths: LearningPath[] = [
  { id: 1, title: "Trilha Básica", level: "Básico", courses: 12, progress: 0, color: "from-emerald-500 to-green-500", icon: "🌱" },
  { id: 2, title: "Trilha Intermediária", level: "Intermediário", courses: 18, progress: 35, color: "from-amber-500 to-orange-500", icon: "📚" },
  { id: 3, title: "Trilha Avançada", level: "Avançado", courses: 24, progress: 10, color: "from-purple-500 to-fuchsia-500", icon: "🎓" },
];

const liveSessions: LiveSession[] = [
  { id: 1, topic: "Introdução ao React Hooks", instructor: "Ricardo Mendes", countdown: "2h 15min", participants: 34, initials: "RM", gFrom: "#10b981", gTo: "#06b6d4" },
  { id: 2, topic: "Pronúncia em Inglês", instructor: "Ana Beatriz", countdown: "45min", participants: 28, initials: "AB", gFrom: "#8b5cf6", gTo: "#6366f1" },
  { id: 3, topic: "Acordes para Iniciantes", instructor: "Carlos Lima", countdown: "1h 30min", participants: 19, initials: "CL", gFrom: "#f59e0b", gTo: "#ef4444" },
];

const reviews: Review[] = [
  { id: 1, name: "Mariana Costa", course: "Inglês Conversacional", rating: 5, text: "Melhor aula que já fiz! A professora é muito paciente e o método funciona demais. Consegui manter uma conversa em inglês em apenas 2 meses!" },
  { id: 2, name: "João Pedro Alves", course: "JavaScript Avançado", rating: 5, text: "Conteúdo excelente e super atualizado. O professor explica de forma clara e as aulas ao vivo são muito interativas. Recomendo demais!" },
];

const trustItems = [
  { icon: <Award className="h-4 w-4" />, text: "Professores Verificados" },
  { icon: <CheckCircle className="h-4 w-4" />, text: "Certificado Incluso" },
  { icon: <Zap className="h-4 w-4" />, text: "Garantia 7 dias" },
  { icon: <Headphones className="h-4 w-4" />, text: "Suporte 24h" },
];

// ── Animation Variants ──────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

const pulseVariant = {
  animate: {
    opacity: [0.4, 0.7, 0.4],
    transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" as const },
  },
};

// ── Helpers ────────────────────────────────────────────────────────
function renderStars(rating: number) {
  const full = Math.floor(rating);
  return Array.from({ length: 5 }, (_, i) =>
    i < full ? (
      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
    ) : (
      <Star key={i} className="h-3.5 w-3.5 text-gray-300" />
    )
  );
}

function LevelBadge({ level }: { level: ClassCard["level"] }) {
  const colors = {
    Iniciante: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Intermediário: "bg-blue-50 text-blue-700 border-blue-200",
    Avançado: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${colors[level]}`}>
      {level}
    </span>
  );
}

function FormatBadge({ format }: { format: ClassCard["format"] }) {
  const config = {
    Presencial: { icon: <MapPin className="h-3 w-3" />, cls: "text-orange-600 bg-orange-50" },
    Online: { icon: <Video className="h-3 w-3" />, cls: "text-blue-600 bg-blue-50" },
    Híbrido: { icon: <Globe className="h-3 w-3" />, cls: "text-purple-600 bg-purple-50" },
  };
  const c = config[format];
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${c.cls}`}>
      {c.icon} {format}
    </span>
  );
}

// ── Component ──────────────────────────────────────────────────────
export default function CommunitySkillsExchange() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [savedReminders, setSavedReminders] = useState<Set<number>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleReminder = useCallback((id: number) => {
    setSavedReminders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filteredClasses = classes.filter((c) => {
    const catMatch = selectedCategory === "Todos" || c.level === selectedCategory || c.format === selectedCategory;
    const q = searchQuery.toLowerCase();
    const searchMatch =
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.instructor.toLowerCase().includes(q);
    return catMatch && searchMatch;
  });

  // ── Loading Skeleton ──────────────────────────────────────────
  if (loading) {
    return (
      <section className="w-full space-y-6" aria-label="Carregando Escola do Bairro">
        <motion.div
          className="w-full rounded-2xl p-6"
          style={{ background: "linear-gradient(to right, #7c3aed, #9333ea, #c026d3)" }}
          variants={pulseVariant}
          animate="animate"
        >
          <div className="h-8 w-56 rounded-lg bg-white/30 mb-3" />
          <div className="h-5 w-72 rounded-lg bg-white/20 mb-4" />
          <div className="h-11 w-full max-w-md rounded-xl bg-white/25" />
        </motion.div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 4 }, (_, i) => (
            <motion.div key={i} className="h-24 w-40 flex-shrink-0 rounded-xl bg-gray-200" variants={pulseVariant} animate="animate" />
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 10 }, (_, i) => (
            <motion.div key={i} className="h-[44px] w-28 flex-shrink-0 rounded-full bg-gray-200" variants={pulseVariant} animate="animate" />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <motion.div key={i} className="h-96 rounded-2xl bg-gray-200" variants={pulseVariant} animate="animate" />
          ))}
        </div>
      </section>
    );
  }

  // ── Main Render ───────────────────────────────────────────────
  return (
    <section className="w-full space-y-6 r101-section-accent" aria-label="Escola do Bairro - Troca de Conhecimentos">

      {/* ─── 1. Header ────────────────────────────────────────── */}
      <motion.div
        className="relative w-full rounded-2xl p-6 text-white overflow-hidden"
        style={{ background: "linear-gradient(to right, #7c3aed, #9333ea, #c026d3)" }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring" as const, stiffness: 260, damping: 20 }}
      >
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.15), transparent)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <BookOpen className="h-6 w-6" />
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight r62-heading-gradient">Escola do Bairro 📚</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                <GraduationCap className="h-3.5 w-3.5" /> 156+ aulas disponíveis
              </span>
            </div>
            <p className="text-sm sm:text-base text-white/90">Aprenda com quem sabe, ensine quem precisa</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-200" />
            <input
              type="text"
              placeholder="Buscar aulas, professores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-white/20 backdrop-blur-sm pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/60 outline-none border border-white/20 focus:border-white/40 transition-colors min-h-[44px]"
              aria-label="Buscar aulas e professores"
            />
          </div>
        </div>
      </motion.div>

      {/* ─── 2. Stats Row ─────────────────────────────────────── */}
      <motion.div className="flex gap-3 overflow-x-auto pb-2" variants={containerVariants} initial="hidden" animate="visible">
        {[
          { icon: <BookOpen className="h-5 w-5 text-violet-500" />, value: "156+", label: "Aulas" },
          { icon: <Users className="h-5 w-5 text-emerald-500" />, value: "89", label: "Professores" },
          { icon: <GraduationCap className="h-5 w-5 text-amber-500" />, value: "2.3k", label: "Alunos" },
          { icon: <Star className="h-5 w-5 text-fuchsia-500" />, value: "4.9★", label: "Satisfação" },
        ].map((s) => (
          <motion.div
            key={s.label}
            className="flex-shrink-0 w-40 rounded-xl bg-white border border-gray-100 p-4 flex flex-col gap-1 r100-stat-card r62-card-lift"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            variants={itemVariants}
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
        className="flex gap-2 overflow-x-auto pb-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        role="tablist"
        aria-label="Filtrar por categoria"
      >
        {categories.map((cat) => (
          <motion.button
            key={cat.key}
            role="tab"
            aria-selected={selectedCategory === cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors min-h-[44px] min-w-[44px] ${
              selectedCategory === cat.key
                ? "bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            style={{
              boxShadow: selectedCategory === cat.key ? "0 4px 12px rgba(139,92,246,0.35)" : "none",
            }}
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* ─── 4. Featured Classes ─────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Aulas em Destaque</h3>
          <button className="flex items-center gap-1 text-sm text-violet-600 font-medium min-h-[44px] min-w-[44px] px-2" aria-label="Ver todas as aulas">
            Ver todas <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {filteredClasses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Search className="h-10 w-10 mb-3" />
            <p className="text-sm font-medium">Nenhuma aula encontrada</p>
            <p className="text-xs mt-1">Tente outro termo ou categoria</p>
          </div>
        ) : (
          <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-4" variants={containerVariants} initial="hidden" animate="visible">
            {filteredClasses.map((cls) => (
              <motion.div
                key={cls.id}
                className="relative rounded-2xl bg-white border border-gray-100 overflow-hidden flex flex-col r100-class-card r62-card-lift"
                style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
                variants={itemVariants}
                whileHover={{
                  y: -4,
                  boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
                  transition: { type: "spring" as const, stiffness: 400, damping: 25 },
                }}
              >
                {/* Gradient header */}
                <div
                  className="relative h-24 flex items-center justify-center text-3xl"
                  style={{ background: `linear-gradient(135deg, ${cls.headerFrom}, ${cls.headerTo})` }}
                >
                  {cls.emoji}
                  {cls.badge && (
                    <span className="absolute top-2 left-2 rounded-full bg-white/25 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white">
                      {cls.badge}
                    </span>
                  )}
                </div>

                <div className="p-4 flex flex-col gap-2 flex-1">
                  {/* Title */}
                  <h4 className="text-sm font-bold text-gray-900 truncate">{cls.title}</h4>

                  {/* Instructor */}
                  <div className="flex items-center gap-2">
                    <div
                      className="flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-white font-bold text-[10px]"
                      style={{ background: `linear-gradient(135deg, ${cls.gFrom}, ${cls.gTo})` }}
                    >
                      {cls.initials}
                    </div>
                    <span className="text-xs text-gray-600 truncate">{cls.instructor}</span>
                  </div>

                  {/* Rating + Students */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-px">{renderStars(cls.rating)}</div>
                    <span className="text-[11px] font-semibold text-gray-700">{cls.rating}</span>
                    <span className="text-[10px] text-gray-400">({cls.students})</span>
                  </div>

                  {/* Level + Format */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <LevelBadge level={cls.level} />
                    <FormatBadge format={cls.format} />
                  </div>

                  {/* Duration + Schedule */}
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {cls.duration}</span>
                    <span>{cls.schedule}</span>
                  </div>

                  {/* Price */}
                  <div className="mt-auto pt-2">
                    {cls.price ? (
                      <span className="text-base font-bold text-gray-900">R$ {cls.price}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-bold border border-emerald-200">
                        <Lightbulb className="h-3 w-3" /> Gratuito
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                    <motion.button
                      className="flex items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-medium min-h-[44px] min-w-[44px] transition-colors"
                      style={{
                        backgroundColor: favorites.has(cls.id) ? "#fef2f2" : "#f9fafb",
                        color: favorites.has(cls.id) ? "#ef4444" : "#6b7280",
                      }}
                      onClick={() => toggleFavorite(cls.id)}
                      aria-label={favorites.has(cls.id) ? "Remover dos favoritos" : "Salvar aula"}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Heart className="h-3.5 w-3.5" fill={favorites.has(cls.id) ? "currentColor" : "none"} />
                      <span className="hidden sm:inline">{favorites.has(cls.id) ? "Salvo" : "Salvar"}</span>
                    </motion.button>
                    <motion.button
                      className="flex items-center gap-1 rounded-lg bg-violet-50 text-violet-700 px-2 py-2 text-[11px] font-medium min-h-[44px] min-w-[44px] transition-colors hover:bg-violet-100"
                      aria-label="Contato com professor"
                      whileTap={{ scale: 0.9 }}
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Contato</span>
                    </motion.button>
                    <motion.button
                      className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-3 py-2 text-[11px] font-medium min-h-[44px] min-w-[44px] ml-auto transition-colors"
                      aria-label="Inscrever-se na aula"
                      whileTap={{ scale: 0.9 }}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Inscrever</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ─── 5. Top Instructors ──────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-bold text-gray-900">Top Professores</h3>
        </div>
        <motion.div className="flex gap-4 overflow-x-auto pb-2" variants={containerVariants} initial="hidden" animate="visible">
          {instructors.map((inst) => (
            <motion.div
              key={inst.id}
              className="flex-shrink-0 w-64 rounded-2xl bg-white border border-gray-100 p-5 r100-instructor-card"
              style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
              variants={itemVariants}
              whileHover={{
                y: -3,
                boxShadow: "0 10px 24px rgba(0,0,0,0.1)",
                transition: { type: "spring" as const, stiffness: 400, damping: 25 },
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: `linear-gradient(135deg, ${inst.gFrom}, ${inst.gTo})` }}
                >
                  {inst.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{inst.name}</h4>
                  <span className="text-[11px] text-gray-500">{inst.specialties}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-gray-700">{inst.rating}</span>
                </span>
                <span className="flex items-center gap-0.5">
                  <BookOpen className="h-3 w-3" /> {inst.classes} aulas
                </span>
              </div>
              <motion.button
                className="w-full rounded-xl bg-gray-100 text-gray-700 px-4 py-2.5 text-xs font-semibold min-h-[44px] transition-colors hover:bg-gray-200"
                aria-label={`Ver perfil de ${inst.name}`}
                whileTap={{ scale: 0.97 }}
              >
                Ver Perfil <ChevronRight className="h-3.5 w-3.5 inline ml-1" />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ─── 6. Learning Paths ───────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-violet-500" />
          <h3 className="text-lg font-bold text-gray-900">Trilhas de Aprendizado</h3>
        </div>
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={containerVariants} initial="hidden" animate="visible">
          {learningPaths.map((path) => (
            <motion.div
              key={path.id}
              className="rounded-2xl bg-white border border-gray-100 p-5 r100-path-card"
              style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
              variants={itemVariants}
              whileHover={{
                y: -3,
                boxShadow: "0 10px 24px rgba(0,0,0,0.1)",
                transition: { type: "spring" as const, stiffness: 400, damping: 25 },
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br ${path.color} text-white text-lg`}>
                  {path.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{path.title}</h4>
                  <span className="text-[11px] text-gray-500">{path.level} • {path.courses} cursos</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-gray-100 mb-1 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${path.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${path.progress}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                />
              </div>
              <span className="text-[10px] text-gray-400">{path.progress}% concluído</span>
              <motion.button
                className="w-full mt-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-4 py-2.5 text-xs font-semibold min-h-[44px] transition-colors"
                aria-label={`Iniciar trilha ${path.title}`}
                whileTap={{ scale: 0.97 }}
              >
                Iniciar Trilha <ChevronRight className="h-3.5 w-3.5 inline ml-1" />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ─── 7. Upcoming Live Sessions ────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Video className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-bold text-gray-900">Aulas Ao Vivo</h3>
          <span className="rounded-full bg-red-50 text-red-600 px-2 py-0.5 text-[11px] font-semibold animate-pulse">● AO VIVO</span>
        </div>
        <motion.div className="space-y-3" variants={containerVariants} initial="hidden" animate="visible">
          {liveSessions.map((session) => (
            <motion.div
              key={session.id}
              className="flex items-center gap-4 rounded-xl bg-white border border-gray-100 p-4 r100-live-session"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              variants={itemVariants}
              whileHover={{
                boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                transition: { type: "spring" as const, stiffness: 400, damping: 25 },
              }}
            >
              <div
                className="flex-shrink-0 h-11 w-11 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ background: `linear-gradient(135deg, ${session.gFrom}, ${session.gTo})` }}
              >
                {session.initials}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900 truncate">{session.topic}</h4>
                <span className="text-[11px] text-gray-500">{session.instructor}</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[11px] font-semibold text-red-500">Começa em {session.countdown}</span>
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Users className="h-3 w-3" /> {session.participants} inscritos
                </div>
              </div>
              <motion.button
                className={`flex-shrink-0 flex items-center gap-1 rounded-lg px-3 py-2 text-[11px] font-medium min-h-[44px] min-w-[44px] transition-colors ${
                  savedReminders.has(session.id)
                    ? "bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => toggleReminder(session.id)}
                aria-label={savedReminders.has(session.id) ? "Lembrete salvo" : "Lembrar desta aula"}
                whileTap={{ scale: 0.9 }}
              >
                <Zap className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{savedReminders.has(session.id) ? "Salvo" : "Lembrar"}</span>
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ─── 8. Community Reviews ──────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-5 w-5 text-violet-500" />
          <h3 className="text-lg font-bold text-gray-900">Avaliações da Comunidade</h3>
        </div>
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" variants={containerVariants} initial="hidden" animate="visible">
          {reviews.map((rev) => (
            <motion.div
              key={rev.id}
              className="rounded-2xl bg-white border border-gray-100 p-5 r100-review-card"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
              variants={itemVariants}
              whileHover={{
                y: -2,
                boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                transition: { type: "spring" as const, stiffness: 400, damping: 25 },
              }}
            >
              <div className="flex items-center gap-0.5 mb-2">{renderStars(rev.rating)}</div>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">&ldquo;{rev.text}&rdquo;</p>
              <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                <div>
                  <span className="text-xs font-bold text-gray-900">{rev.name}</span>
                  <span className="text-[11px] text-gray-400 block">em {rev.course}</span>
                </div>
                <span className="rounded-full bg-violet-50 text-violet-600 px-2 py-0.5 text-[10px] font-semibold">Aluno verificado</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ─── 9. Trust Bar ─────────────────────────────────────── */}
      <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-3" variants={containerVariants} initial="hidden" animate="visible">
        {trustItems.map((item) => (
          <motion.div
            key={item.text}
            className="flex items-center gap-2 rounded-xl bg-violet-50 border border-violet-100 px-4 py-3 min-h-[44px]"
            variants={itemVariants}
          >
            <span className="text-violet-600">{item.icon}</span>
            <span className="text-xs font-medium text-violet-700">✓ {item.text}</span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
