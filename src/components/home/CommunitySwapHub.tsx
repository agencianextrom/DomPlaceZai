"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Handshake,
  Star,
  MapPin,
  Clock,
  MessageCircle,
  AlertTriangle,
  ArrowRightLeft,
  Shield,
  Users,
  Package,
  CheckCircle2,
  Headphones,
  Search,
  ChevronRight,
  TrendingUp,
  Send,
  Flag,
  Heart,
} from "lucide-react";
import type { Easing, Variants } from "framer-motion";

/* ================================================================
   Spring type-safe constant — avoids the forbidden 'bouncy' easing
   ================================================================ */
const sp = "spring" as const;

/* ================================================================
   Custom easing curve (type-safe Easing)
   ================================================================ */
const smoothEase: Easing = [0.43, 0.13, 0.23, 0.96];

/* ================================================================
   Animation Variants (complete map objects)
   ================================================================ */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: sp, stiffness: 300, damping: 24 },
  },
};

const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: sp, stiffness: 260, damping: 20 },
  },
};

const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: sp, stiffness: 280, damping: 22 },
  },
};

const stepVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: sp, stiffness: 320, damping: 26 },
  },
};

/* ================================================================
   TypeScript Interfaces
   ================================================================ */
interface StatCard {
  label: string;
  value: string;
  icon: typeof ArrowRightLeft;
  gradient: string;
}

interface CategoryItem {
  name: string;
  emoji: string;
}

interface SwapCard {
  id: number;
  queroEmoji: string;
  queroLabel: string;
  oferecoEmoji: string;
  oferecoLabel: string;
  user: {
    initials: string;
    name: string;
    neighborhood: string;
    rating: number;
  };
  category: string;
  categoryEmoji: string;
  swapType: "Item por Item" | "Item por Serviço" | "Serviço por Serviço";
  swapTypeColor: string;
  gradientBorder: string;
  postedAgo: string;
}

interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
  emoji: string;
  gradient: string;
}

interface ActivityItem {
  id: number;
  emoji: string;
  description: string;
  userA: string;
  userB: string;
  timeAgo: string;
}

interface TrustBadge {
  icon: typeof Shield;
  label: string;
  description: string;
}

/* ================================================================
   Static Mock Data
   ================================================================ */
const statsData: StatCard[] = [
  {
    label: "Trocas",
    value: "312+",
    icon: ArrowRightLeft,
    gradient: "from-purple-500 to-violet-600",
  },
  {
    label: "Usuários",
    value: "1.5k",
    icon: Users,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    label: "Itens",
    value: "2.8k",
    icon: Package,
    gradient: "from-fuchsia-500 to-purple-600",
  },
  {
    label: "Satisfação",
    value: "4.8★",
    icon: Star,
    gradient: "from-purple-400 to-fuchsia-500",
  },
];

const categories: CategoryItem[] = [
  { name: "Todos", emoji: "🔄" },
  { name: "Eletrônicos", emoji: "📱" },
  { name: "Roupas", emoji: "👕" },
  { name: "Móveis", emoji: "🪑" },
  { name: "Livros", emoji: "📚" },
  { name: "Brinquedos", emoji: "🧸" },
  { name: "Serviços", emoji: "🔧" },
  { name: "Alimentos", emoji: "🍎" },
];

const featuredSwaps: SwapCard[] = [
  {
    id: 1,
    queroEmoji: "📱",
    queroLabel: "Fone Bluetooth",
    oferecoEmoji: "📓",
    oferecoLabel: "Caderno Moleskine",
    user: { initials: "MP", name: "Marina P.", neighborhood: "Vila Madalena", rating: 5 },
    category: "Eletrônicos",
    categoryEmoji: "📱",
    swapType: "Item por Item",
    swapTypeColor: "bg-purple-100 text-purple-700",
    gradientBorder: "from-purple-400 to-violet-500",
    postedAgo: "há 2h",
  },
  {
    id: 2,
    queroEmoji: "👕",
    queroLabel: "Camisa Social M",
    oferecoEmoji: "🔧",
    oferecoLabel: "Reparo de Elétrica",
    user: { initials: "RC", name: "Rafael C.", neighborhood: "Pinheiros", rating: 4 },
    category: "Roupas",
    categoryEmoji: "👕",
    swapType: "Item por Serviço",
    swapTypeColor: "bg-amber-100 text-amber-700",
    gradientBorder: "from-amber-400 to-orange-500",
    postedAgo: "há 5h",
  },
  {
    id: 3,
    queroEmoji: "📚",
    queroLabel: "Livros de Ficção",
    oferecoEmoji: "🧸",
    oferecoLabel: "Quebra-Cabeça 1000pc",
    user: { initials: "LS", name: "Lucia S.", neighborhood: "Moema", rating: 5 },
    category: "Livros",
    categoryEmoji: "📚",
    swapType: "Item por Item",
    swapTypeColor: "bg-purple-100 text-purple-700",
    gradientBorder: "from-emerald-400 to-teal-500",
    postedAgo: "há 1d",
  },
  {
    id: 4,
    queroEmoji: "🔧",
    queroLabel: "Aula de Guitarra",
    oferecoEmoji: "💻",
    oferecoLabel: "Formatação de PC",
    user: { initials: "TS", name: "Thiago S.", neighborhood: "Lapa", rating: 4 },
    category: "Serviços",
    categoryEmoji: "🔧",
    swapType: "Serviço por Serviço",
    swapTypeColor: "bg-sky-100 text-sky-700",
    gradientBorder: "from-sky-400 to-blue-500",
    postedAgo: "há 3h",
  },
];

const howItWorksSteps: HowItWorksStep[] = [
  {
    step: 1,
    title: "Cadastre seu item",
    description: "Fotos, descrição e o que você quer em troca. Rápido e fácil!",
    emoji: "📦",
    gradient: "from-purple-500 to-violet-600",
  },
  {
    step: 2,
    title: "Encontre uma troca",
    description: "Navegue por categorias e descubra combinações perfeitas.",
    emoji: "🔍",
    gradient: "from-violet-500 to-fuchsia-600",
  },
  {
    step: 3,
    title: "Combine o encontro",
    description: "Converse, combine local e horário pela troca segura.",
    emoji: "🤝",
    gradient: "from-fuchsia-500 to-purple-600",
  },
  {
    step: 4,
    title: "Confirme a troca",
    description: "Realize a troca e avalie a experiência da comunidade.",
    emoji: "✅",
    gradient: "from-purple-400 to-fuchsia-500",
  },
];

const recentActivity: ActivityItem[] = [
  {
    id: 1,
    emoji: "🔄",
    description: "trocou um Console PlayStation por uma Bicicleta",
    userA: "Carlos M.",
    userB: "Ana R.",
    timeAgo: "há 15min",
  },
  {
    id: 2,
    emoji: "📱",
    description: "trocou um Tablet por 3 Livros de Programação",
    userA: "Fernando L.",
    userB: "Patricia T.",
    timeAgo: "há 42min",
  },
  {
    id: 3,
    emoji: "🔧",
    description: "ofereceu Aula de Yoga em troca de Aulas de Inglês",
    userA: "Beatriz F.",
    userB: "Diego G.",
    timeAgo: "há 1h",
  },
  {
    id: 4,
    emoji: "🪑",
    description: "trocou uma Estante por uma Cadeira de Escritório",
    userA: "Roberto S.",
    userB: "Juliana P.",
    timeAgo: "há 2h",
  },
  {
    id: 5,
    emoji: "🍎",
    description: "trocou Cestas Orgânicas por Conservas Artesanais",
    userA: "Maria L.",
    userB: "Lucas V.",
    timeAgo: "há 3h",
  },
];

const trustBadges: TrustBadge[] = [
  {
    icon: Shield,
    label: "Verificação de Identidade",
    description: "Perfis verificados com documentos",
  },
  {
    icon: Star,
    label: "Sistema de Avaliação",
    description: "Notas e comentários reais",
  },
  {
    icon: Headphones,
    label: "Suporte 24h",
    description: "Atendimento a qualquer momento",
  },
  {
    icon: CheckCircle2,
    label: "Troca Segura",
    description: "Garantia de troca protegida",
  },
];

/* ================================================================
   Section Wrapper — consistent spacing between sections
   ================================================================ */
function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`mt-8 ${className}`}>{children}</section>;
}

/* ================================================================
   Loading Skeleton — full skeleton for initial 1.5s delay
   ================================================================ */
function LoadingSkeleton() {
  return (
    <div className="w-full space-y-8" aria-label="Carregando Troca Solidária">
      {/* Header skeleton */}
      <Skeleton className="h-48 w-full rounded-3xl" />
      {/* Stats skeleton */}
      <div className="flex gap-3 overflow-x-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="min-w-[130px] flex-1 h-24 rounded-2xl" />
        ))}
      </div>
      {/* Category pills skeleton */}
      <div className="flex gap-2 overflow-x-auto">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="min-w-[100px] h-11 rounded-full" />
        ))}
      </div>
      {/* Featured swaps skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-2xl" />
        ))}
      </div>
      {/* How it works skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
      {/* Activity feed skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   Swap Card Component
   ================================================================ */
function SwapCardComponent({
  swap,
  onInterest,
}: {
  swap: SwapCard;
  onInterest: (id: number) => void;
}) {
  return (
    <motion.div
      variants={fadeUpVariants}
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
      style={{ boxShadow: "0 2px 12px rgba(139, 92, 246, 0.08)" }}
    >
      {/* Gradient top border accent */}
      <div
        className={`h-2 w-full bg-gradient-to-r ${swap.gradientBorder}`}
      />

      <CardContent className="p-4">
        {/* Swap info: Quero ↔ Ofereço */}
        <div className="mb-4 flex items-center gap-3">
          {/* Quero item */}
          <div className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-purple-50 p-3">
            <span className="text-2xl">{swap.queroEmoji}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-purple-600">
              Quero
            </span>
            <span className="text-xs font-medium text-gray-700 text-center leading-tight">
              {swap.queroLabel}
            </span>
          </div>

          {/* Arrow icon */}
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ type: sp, stiffness: 400, damping: 20 }}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-purple-100 text-purple-600"
            style={{ transformOrigin: "center center" }}
          >
            <ArrowRightLeft className="h-5 w-5" />
          </motion.div>

          {/* Ofereço item */}
          <div className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-fuchsia-50 p-3">
            <span className="text-2xl">{swap.oferecoEmoji}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-fuchsia-600">
              Ofereço
            </span>
            <span className="text-xs font-medium text-gray-700 text-center leading-tight">
              {swap.oferecoLabel}
            </span>
          </div>
        </div>

        {/* User info row */}
        <div className="mb-3 flex items-center gap-3">
          {/* Avatar circle with gradient and initials */}
          <div
            className={`flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full bg-gradient-to-br ${swap.gradientBorder} text-xs font-bold text-white shadow-sm`}
          >
            {swap.user.initials}
          </div>
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-sm font-semibold text-gray-900">
              {swap.user.name}
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-0.5 text-xs text-gray-500">
                <MapPin className="h-3 w-3" />
                {swap.user.neighborhood}
              </span>
              <span className="flex items-center gap-0.5 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {swap.postedAgo}
              </span>
            </div>
          </div>
          {/* Rating */}
          <div className="flex items-center gap-0.5 rounded-lg bg-amber-50 px-2 py-1">
            {Array.from({ length: swap.user.rating }).map((_, i) => (
              <Star
                key={i}
                className="h-3 w-3 fill-amber-400 text-amber-400"
              />
            ))}
          </div>
        </div>

        {/* Category & swap type badges */}
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          <Badge
            variant="secondary"
            className="rounded-full border-purple-200 bg-purple-50 text-xs font-medium text-purple-700 hover:bg-purple-100"
          >
            {swap.categoryEmoji} {swap.category}
          </Badge>
          <Badge
            variant="secondary"
            className={`rounded-full text-xs font-medium ${swap.swapTypeColor}`}
          >
            {swap.swapType}
          </Badge>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {/* Tenho Interesse button (primary) */}
          <motion.div whileTap={{ scale: 0.96 }} className="flex-1">
            <Button
              onClick={() => onInterest(swap.id)}
              className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-sm font-semibold text-white shadow-sm transition-all hover:from-purple-700 hover:to-violet-700"
              aria-label={`Tenho interesse na troca de ${swap.queroLabel}`}
            >
              <Heart className="h-4 w-4" />
              Tenho Interesse
            </Button>
          </motion.div>

          {/* Mensagem button */}
          <motion.div whileTap={{ scale: 0.96 }}>
            <Button
              variant="outline"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl border-gray-200 text-sm font-medium text-gray-600 transition-colors hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
              aria-label="Enviar mensagem"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Mensagem</span>
            </Button>
          </motion.div>

          {/* Denunciar button */}
          <motion.div whileTap={{ scale: 0.96 }}>
            <Button
              variant="ghost"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
              aria-label="Denunciar troca"
            >
              <AlertTriangle className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </motion.div>
  );
}

/* ================================================================
   How It Works Step Card
   ================================================================ */
function StepCard({ stepData }: { stepData: HowItWorksStep }) {
  return (
    <motion.div
      variants={stepVariants}
      whileHover={{ y: -3, scale: 1.02 }}
      className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm transition-shadow duration-300 hover:shadow-md"
      style={{ boxShadow: "0 2px 8px rgba(139, 92, 246, 0.06)" }}
    >
      {/* Numbered gradient circle */}
      <div
        className={`flex min-h-[56px] min-w-[56px] items-center justify-center rounded-full bg-gradient-to-br ${stepData.gradient} text-lg font-bold text-white shadow-md`}
        style={{ boxShadow: "0 4px 16px rgba(139, 92, 246, 0.3)" }}
      >
        {stepData.step}
      </div>

      {/* Emoji */}
      <span className="text-3xl">{stepData.emoji}</span>

      {/* Title */}
      <h4 className="text-sm font-bold text-gray-900">{stepData.title}</h4>

      {/* Description */}
      <p className="text-xs leading-relaxed text-gray-500">
        {stepData.description}
      </p>
    </motion.div>
  );
}

/* ================================================================
   Activity Feed Item
   ================================================================ */
function ActivityFeedItem({ activity }: { activity: ActivityItem }) {
  return (
    <motion.div
      variants={slideLeftVariants}
      className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
      {/* Emoji avatar */}
      <div className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full bg-purple-50 text-xl">
        {activity.emoji}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-0.5">
        <p className="text-sm leading-snug text-gray-700">
          <span className="font-semibold text-gray-900">{activity.userA}</span>{" "}
          {activity.description} com{" "}
          <span className="font-semibold text-gray-900">{activity.userB}</span>
        </p>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="h-3 w-3" />
          {activity.timeAgo}
        </span>
      </div>
    </motion.div>
  );
}

/* ================================================================
   Main Component — CommunitySwapHub
   ================================================================ */
export default function CommunitySwapHub() {
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [interestedSwaps, setInterestedSwaps] = useState<Set<number>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");

  /* 1.5s loading delay */
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  /* Filter featured swaps by category and search */
  const filteredSwaps = featuredSwaps.filter((swap) => {
    const matchesCategory =
      selectedCategory === "Todos" || swap.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === "" ||
      swap.queroLabel.toLowerCase().includes(q) ||
      swap.oferecoLabel.toLowerCase().includes(q) ||
      swap.user.name.toLowerCase().includes(q) ||
      swap.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  /* Handle interest toggle */
  const handleInterest = useCallback((id: number) => {
    setInterestedSwaps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  /* ──────────────────────────────────────────────────────────────
     Loading State — full skeleton for first 1.5s
     ────────────────────────────────────────────────────────────── */
  if (!mounted) {
    return (
      <section
        className="w-full r103-section-accent"
        aria-label="Troca Solidária"
      >
        <LoadingSkeleton />
      </section>
    );
  }

  return (
    <section
      className="w-full r103-section-accent"
      aria-label="Troca Solidária — Hub de Trocas Comunitárias"
    >
      {/* =============================================================
          1. GRADIENT HEADER
          ============================================================== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: sp, stiffness: 300, damping: 24 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 px-5 py-8 sm:px-8 sm:py-10"
        style={{ boxShadow: "0 8px 32px rgba(139, 92, 246, 0.3)" }}
      >
        {/* Decorative background circles */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute bottom-4 right-20 h-20 w-20 rounded-full bg-white/8" />

        <div className="relative flex flex-col gap-4">
          {/* Title row */}
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: sp,
                stiffness: 400,
                damping: 18,
                delay: 0.2,
              }}
              className="flex min-h-[52px] min-w-[52px] items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm"
            >
              <Handshake className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl r62-heading-gradient">
                Troca Solidária 🤝
              </h2>
              <p className="text-sm text-purple-100">
                Troque itens e serviços com seus vizinhos
              </p>
            </div>
          </div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: sp, stiffness: 260, damping: 20, delay: 0.3 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              <TrendingUp className="h-3.5 w-3.5" />
              312+ trocas realizadas na comunidade
            </span>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: sp, stiffness: 300, damping: 22, delay: 0.4 }}
            className="relative mt-1"
          >
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar trocas por item, serviço ou pessoa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border-0 bg-white/95 py-3 pl-10 pr-4 text-sm text-gray-800 shadow-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              aria-label="Buscar trocas"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* =============================================================
          2. STATS ROW — 4 horizontal-scroll cards
          ============================================================== */}
      <Section>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {statsData.map((stat) => (
            <motion.div
              key={stat.label}
              variants={scaleInVariants}
              whileHover={{ scale: 1.04 }}
              className={`flex min-w-[130px] flex-1 flex-col items-center gap-1.5 rounded-2xl bg-gradient-to-br ${stat.gradient} p-4 text-white shadow-md`}
              style={{
                boxShadow: "0 4px 16px rgba(139, 92, 246, 0.25)",
              }}
            >
              <div className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">{stat.value}</span>
              <span className="text-xs font-medium text-white/80">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* =============================================================
          3. CATEGORY FILTER — 8 pills horizontal scroll
          ============================================================== */}
      <Section>
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">
            Filtrar Categorias
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <motion.button
              key={cat.name}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex min-h-[44px] min-w-[44px] shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-all ${
                selectedCategory === cat.name
                  ? "border-purple-400 bg-purple-50 text-purple-700 shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50/50"
              }`}
              aria-pressed={selectedCategory === cat.name}
            >
              <span className="text-base">{cat.emoji}</span>
              <span>{cat.name}</span>
            </motion.button>
          ))}
        </div>
      </Section>

      {/* =============================================================
          4. FEATURED SWAPS — 4 cards in grid-cols-1 sm:grid-cols-2
          ============================================================== */}
      <Section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 r62-heading-gradient">
            Trocas em Destaque
          </h3>
          <span className="text-sm text-gray-500">
            {filteredSwaps.length} disponíveis
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedCategory}-${searchQuery}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {filteredSwaps.map((swap) => (
              <SwapCardComponent
                key={swap.id}
                swap={swap}
                onInterest={handleInterest}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty state */}
        {filteredSwaps.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <Handshake className="mb-3 h-12 w-12 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">
              Nenhuma troca encontrada nesta categoria.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Tente outra categoria ou faça uma busca diferente.
            </p>
          </motion.div>
        )}
      </Section>

      {/* =============================================================
          5. HOW IT WORKS — 4 step cards
          ============================================================== */}
      <Section>
        <div className="mb-4 flex items-center gap-2">
          <ChevronRight className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900 r62-heading-gradient">
            Como Funciona
          </h3>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {howItWorksSteps.map((stepData) => (
            <StepCard key={stepData.step} stepData={stepData} />
          ))}
        </motion.div>
      </Section>

      {/* =============================================================
          6. RECENT ACTIVITY FEED — 5 items
          ============================================================== */}
      <Section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900 r62-heading-gradient">
              Atividade Recente
            </h3>
          </div>
          <motion.div whileTap={{ scale: 0.96 }}>
            <Button
              variant="ghost"
              className="flex min-h-[44px] items-center gap-1 text-sm font-medium text-purple-600 hover:bg-purple-50 hover:text-purple-700"
              aria-label="Ver toda a atividade"
            >
              Ver Tudo
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {recentActivity.map((activity) => (
            <ActivityFeedItem key={activity.id} activity={activity} />
          ))}
        </motion.div>
      </Section>

      {/* =============================================================
          7. TRUST BAR — 4 badges
          ============================================================== */}
      <Section>
        <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/60 to-violet-50/60 p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <h3 className="text-base font-bold text-gray-900 r62-heading-gradient">
              Por Que Confiar na Troca Solidária?
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {trustBadges.map((badge) => (
              <motion.div
                key={badge.label}
                variants={fadeUpVariants}
                whileHover={{ scale: 1.03 }}
                className="flex items-center gap-3 rounded-xl bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm transition-shadow duration-200 hover:shadow-md"
                style={{
                  boxShadow: "0 2px 8px rgba(139, 92, 246, 0.06)",
                }}
              >
                <div className="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-sm">
                  <badge.icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-gray-900">
                    {badge.label}
                  </span>
                  <span className="text-[11px] leading-snug text-gray-500">
                    {badge.description}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* =============================================================
          8. CTA FOOTER — Encourage participation
          ============================================================== */}
      <Section className="mb-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: sp,
            stiffness: 280,
            damping: 22,
            ease: smoothEase,
          }}
          className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 p-6 text-center shadow-lg sm:p-8"
          style={{
            boxShadow: "0 8px 32px rgba(139, 92, 246, 0.35)",
            transformOrigin: "center top",
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <Handshake className="h-10 w-10 text-white" />
            <h3 className="text-xl font-bold text-white sm:text-2xl">
              Comece a Trocar Agora! 🚀
            </h3>
            <p className="max-w-md text-sm text-purple-100">
              Junte-se a mais de 1.500 vizinhos que já estão trocando itens
              e serviços sem usar dinheiro. A comunidade espera por você!
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <motion.div whileTap={{ scale: 0.96 }}>
              <Button
                className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-purple-700 shadow-lg transition-all hover:bg-purple-50"
                aria-label="Cadastrar meu primeiro item"
              >
                <Package className="h-4 w-4" />
                Cadastrar Meu Item
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.96 }}>
              <Button
                variant="outline"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl border-white/30 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                aria-label="Explorar todas as trocas"
              >
                Explorar Trocas
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </Section>
    </section>
  );
}
