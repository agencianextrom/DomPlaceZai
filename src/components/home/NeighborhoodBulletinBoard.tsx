'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Pin,
  Heart,
  Bookmark,
  Share2,
  Search,
  MapPin,
  Clock,
  MessageCircle,
  Plus,
  X,
  Send,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Flame,
  ImagePlus,
  ChevronDown,
  ChevronUp,
  Map,
  Grid3X3,
  Bell,
  Check,
  Megaphone,
  ShoppingBag,
  Sparkles,
  Eye,
} from 'lucide-react'

/* ========================================
   Types & Interfaces
   ======================================== */
type PostCategory = 'events' | 'recommendations' | 'lost_found' | 'announcements' | 'services' | 'free_stuff'

interface BulletinPost {
  id: string
  title: string
  description: string
  category: PostCategory
  author: string
  authorInitial: string
  authorColor: string
  timestamp: string
  timeAgo: string
  likes: number
  bookmarks: number
  comments: BulletinComment[]
  imageUrl?: string
  imageEmoji?: string
  isPinned: boolean
  isUrgent: boolean
  isNew: boolean
  location?: { x: number; y: number; label: string }
}

interface BulletinComment {
  id: string
  author: string
  authorInitial: string
  authorColor: string
  text: string
  timeAgo: string
}

interface TrendingTopic {
  id: string
  tag: string
  count: number
  emoji: string
}

/* ========================================
   Constants & Mock Data
   ======================================== */
const MAX_CHAR_TITLE = 80
const MAX_CHAR_DESC = 500

const CATEGORIES: { key: PostCategory | 'all'; label: string; emoji: string; color: string }[] = [
  { key: 'all', label: 'Todos', emoji: '📌', color: '#10b981' },
  { key: 'events', label: 'Eventos', emoji: '🎉', color: '#8b5cf6' },
  { key: 'recommendations', label: 'Recomendações', emoji: '⭐', color: '#f59e0b' },
  { key: 'lost_found', label: 'Perdidos', emoji: '🔍', color: '#ef4444' },
  { key: 'announcements', label: 'Avisos', emoji: '📢', color: '#3b82f6' },
  { key: 'services', label: 'Serviços', emoji: '🔧', color: '#06b6d4' },
  { key: 'free_stuff', label: 'Grátis', emoji: '🎁', color: '#ec4899' },
]

const AUTHOR_COLORS = [
  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
  'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
  'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
]

const CATEGORY_BADGE_STYLES: Record<PostCategory, string> = {
  events: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  recommendations: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  lost_found: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  announcements: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  services: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  free_stuff: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
}

const CATEGORY_EMOJIS: Record<PostCategory, string> = {
  events: '🎉',
  recommendations: '⭐',
  lost_found: '🔍',
  announcements: '📢',
  services: '🔧',
  free_stuff: '🎁',
}

const MOCK_POSTS: BulletinPost[] = [
  {
    id: 'p1',
    title: 'Festa Junina na Praça Central',
    description: 'Venha celebrar a festa junina com muita dança, comida típica e diversão para toda a família! Barraca de quentão, pescaria e brincadeiras. Entrada gratuita, traga sua família!',
    category: 'events',
    author: 'Maria Santos',
    authorInitial: 'MS',
    authorColor: AUTHOR_COLORS[0],
    timestamp: '2025-06-15T14:00:00',
    timeAgo: '2h atrás',
    likes: 24,
    bookmarks: 8,
    isPinned: true,
    isUrgent: false,
    isNew: false,
    imageEmoji: '🎊',
    location: { x: 55, y: 40, label: 'Praça Central' },
    comments: [
      { id: 'c1', author: 'João Silva', authorInitial: 'JS', authorColor: AUTHOR_COLORS[1], text: 'Vou levar toda a família! Mal posso esperar pela pescaria 🎣', timeAgo: '1h atrás' },
      { id: 'c2', author: 'Ana Costa', authorInitial: 'AC', authorColor: AUTHOR_COLORS[2], text: 'Quentão caseiro vai ter? 😋', timeAgo: '30min atrás' },
    ],
  },
  {
    id: 'p2',
    title: '⚠️ Gato Persa Perdido — Bairro Sul',
    description: 'Nosso gato persa branco com olhos azuis desapareceu ontem à noite perto do supermercado. Responde pelo nome de "Neville". Se encontrarem, por favor entrem em contato!',
    category: 'lost_found',
    author: 'Roberto Lima',
    authorInitial: 'RL',
    authorColor: AUTHOR_COLORS[3],
    timestamp: '2025-06-15T10:00:00',
    timeAgo: '6h atrás',
    likes: 18,
    bookmarks: 12,
    isPinned: false,
    isUrgent: true,
    isNew: true,
    imageEmoji: '🐱',
    location: { x: 30, y: 65, label: 'Bairro Sul' },
    comments: [
      { id: 'c3', author: 'Carla Dias', authorInitial: 'CD', authorColor: AUTHOR_COLORS[4], text: 'Vou compartilhar! Espero que encontrem logo 😢', timeAgo: '5h atrás' },
    ],
  },
  {
    id: 'p3',
    title: 'Melhor Padeiro do Bairro!',
    description: 'Quem ainda não provou o pão de queijo da Padaria Nova, está perdendo! Os pães artesanais são incríveis e o atendimento é maravilhoso. Recomendo o pão de nozes e o croissant de chocolate.',
    category: 'recommendations',
    author: 'Fernanda Oliveira',
    authorInitial: 'FO',
    authorColor: AUTHOR_COLORS[5],
    timestamp: '2025-06-15T08:00:00',
    timeAgo: '8h atrás',
    likes: 35,
    bookmarks: 15,
    isPinned: false,
    isUrgent: false,
    isNew: false,
    imageEmoji: '🥐',
    comments: [
      { id: 'c4', author: 'Pedro Martins', authorInitial: 'PM', authorColor: AUTHOR_COLORS[6], text: 'Concordo totalmente! O café passado deles também é ótimo ☕', timeAgo: '7h atrás' },
      { id: 'c5', author: 'Lúcia Barros', authorInitial: 'LB', authorColor: AUTHOR_COLORS[7], text: 'Vou conferir hoje mesmo!', timeAgo: '6h atrás' },
      { id: 'c6', author: 'Marcos Souza', authorInitial: 'MS', authorColor: AUTHOR_COLORS[0], text: 'Já virou cliente fiel! 🙌', timeAgo: '5h atrás' },
    ],
  },
  {
    id: 'p4',
    title: 'Manutenção na Água — Av. Principal',
    description: 'A SAE informou que haverá manutenção no sistema de abastecimento na Av. Principal entre 08h e 16h de segunda-feira. Recomendamos que armazenem água com antecedência.',
    category: 'announcements',
    author: 'Associação de Moradores',
    authorInitial: 'AM',
    authorColor: AUTHOR_COLORS[1],
    timestamp: '2025-06-14T18:00:00',
    timeAgo: '1 dia',
    likes: 42,
    bookmarks: 28,
    isPinned: true,
    isUrgent: true,
    isNew: false,
    imageEmoji: '💧',
    comments: [
      { id: 'c7', author: 'Teresa Nunes', authorInitial: 'TN', authorColor: AUTHOR_COLORS[2], text: 'Obrigada por avisar! Vou encher as garrafas hoje.', timeAgo: '20h atrás' },
    ],
  },
  {
    id: 'p5',
    title: 'Eletricista de Confiança',
    description: 'Contratei o Sr. José para fazer a instalação elétrica da minha casa. Trabalho impecável, preço justo e muito profissional. Telefone: (99) 99999-1234. Recomendo para qualquer serviço elétrico!',
    category: 'services',
    author: 'Carlos Almeida',
    authorInitial: 'CA',
    authorColor: AUTHOR_COLORS[3],
    timestamp: '2025-06-14T12:00:00',
    timeAgo: '1 dia',
    likes: 22,
    bookmarks: 30,
    isPinned: false,
    isUrgent: false,
    isNew: false,
    imageEmoji: '⚡',
    comments: [
      { id: 'c8', author: 'Rita Farias', authorInitial: 'RF', authorColor: AUTHOR_COLORS[4], text: 'Também contratei ele! Muito bom mesmo 👷', timeAgo: '22h atrás' },
      { id: 'c9', author: 'Diego Rocha', authorInitial: 'DR', authorColor: AUTHOR_COLORS[5], text: 'Ele faz serviço de manutenção preventiva também?', timeAgo: '18h atrás' },
    ],
  },
  {
    id: 'p6',
    title: 'Sofá em Bom Estado — Grátis',
    description: 'Estou me mudando e preciso doar um sofá de 3 lugares em tecido cinza, em ótimo estado. Quem quiser, é só vir buscar no apartamento 302, Bloco B. Primeiro que chegar leva!',
    category: 'free_stuff',
    author: 'Paulo Mendes',
    authorInitial: 'PM',
    authorColor: AUTHOR_COLORS[6],
    timestamp: '2025-06-14T09:00:00',
    timeAgo: '2 dias',
    likes: 56,
    bookmarks: 45,
    isPinned: false,
    isUrgent: false,
    isNew: true,
    imageEmoji: '🛋️',
    location: { x: 70, y: 25, label: 'Bloco B' },
    comments: [
      { id: 'c10', author: 'Marta Leal', authorInitial: 'ML', authorColor: AUTHOR_COLORS[7], text: 'Ainda está disponível? Posso buscar hoje!', timeAgo: '1 dia atrás' },
    ],
  },
  {
    id: 'p7',
    title: 'Aula de Yoga Gratuita no Parque',
    description: 'Toda sábado às 7h, oferecemos aula de yoga gratuita no parque do bairro. Traga seu tapetinho e venha relaxar! Para todos os níveis, iniciantes são muito bem-vindos.',
    category: 'events',
    author: 'Studio Harmonia',
    authorInitial: 'SH',
    authorColor: AUTHOR_COLORS[7],
    timestamp: '2025-06-13T10:00:00',
    timeAgo: '2 dias',
    likes: 89,
    bookmarks: 62,
    isPinned: false,
    isUrgent: false,
    isNew: false,
    imageEmoji: '🧘',
    location: { x: 45, y: 50, label: 'Parque' },
    comments: [
      { id: 'c11', author: 'Beatriz Campos', authorInitial: 'BC', authorColor: AUTHOR_COLORS[0], text: 'Adoro essas aulas! Melhor começo de sábado possível 🧘‍♀️', timeAgo: '1 dia atrás' },
      { id: 'c12', author: 'Igor Nascimento', authorInitial: 'IN', authorColor: AUTHOR_COLORS[1], text: 'Posso levar meu filho de 10 anos?', timeAgo: '23h atrás' },
      { id: 'c13', author: 'Studio Harmonia', authorInitial: 'SH', authorColor: AUTHOR_COLORS[7], text: 'Claro! Temos exercícios adaptados para crianças também 😊', timeAgo: '22h atrás' },
    ],
  },
  {
    id: 'p8',
    title: 'Chaveiro Encontrado com 3 Chaves',
    description: 'Encontrei um chaveiro com 3 chaves na calçada em frente à farmácia. Parece ser de carro e casa. Deixei na recepção da farmácia para quem reconhecer.',
    category: 'lost_found',
    author: 'José Ferreira',
    authorInitial: 'JF',
    authorColor: AUTHOR_COLORS[2],
    timestamp: '2025-06-13T16:00:00',
    timeAgo: '2 dias',
    likes: 8,
    bookmarks: 5,
    isPinned: false,
    isUrgent: false,
    isNew: false,
    imageEmoji: '🔑',
    location: { x: 60, y: 55, label: 'Farmácia' },
    comments: [],
  },
  {
    id: 'p9',
    title: 'Dogwalker Disponível — Preço Justo',
    description: 'Ofereço serviço de passeio com cães no bairro. R$30/passeio de 45min. Tenho experiência com cães de todas as raças e portes. Agendo pelo WhatsApp. Referências disponíveis!',
    category: 'services',
    author: 'Gabriela Santos',
    authorInitial: 'GS',
    authorColor: AUTHOR_COLORS[4],
    timestamp: '2025-06-13T08:00:00',
    timeAgo: '3 dias',
    likes: 31,
    bookmarks: 22,
    isPinned: false,
    isUrgent: false,
    isNew: false,
    imageEmoji: '🐕',
    comments: [
      { id: 'c14', author: 'Hugo Vieira', authorInitial: 'HV', authorColor: AUTHOR_COLORS[5], text: 'Meu golden precisa de passeio diário. Qual seu horário?', timeAgo: '2 dias atrás' },
    ],
  },
  {
    id: 'p10',
    title: 'Armário Infantil — Doação',
    description: 'Doando armário infantil branco com 3 gavetas e cabideiro. Em bom estado, apenas pequenos arranhões. Ideal para quarto de bebê. Retirar no meu endereço.',
    category: 'free_stuff',
    author: 'Sandra Moraes',
    authorInitial: 'SM',
    authorColor: AUTHOR_COLORS[6],
    timestamp: '2025-06-12T14:00:00',
    timeAgo: '3 dias',
    likes: 19,
    bookmarks: 14,
    isPinned: false,
    isUrgent: false,
    isNew: false,
    imageEmoji: '👶',
    comments: [
      { id: 'c15', author: 'Renata Lima', authorInitial: 'RL', authorColor: AUTHOR_COLORS[3], text: 'Minha sobrinha está grávida! Posso levar?', timeAgo: '2 dias atrás' },
      { id: 'c16', author: 'Sandra Moraes', authorInitial: 'SM', authorColor: AUTHOR_COLORS[6], text: 'Claro! Me mande uma mensagem para combinar 🎉', timeAgo: '2 dias atrás' },
    ],
  },
]

const TRENDING_TOPICS: TrendingTopic[] = [
  { id: 't1', tag: 'FestaJunina', count: 142, emoji: '🎊' },
  { id: 't2', tag: 'ServiçosLocais', count: 98, emoji: '🔧' },
  { id: 't3', tag: 'PerdidosAchados', count: 76, emoji: '🔍' },
  { id: 't4', tag: 'Recomendações', count: 63, emoji: '⭐' },
  { id: 't5', tag: 'GrátisBairro', count: 51, emoji: '🎁' },
  { id: 't6', tag: 'AulasGratuitas', count: 45, emoji: '📚' },
]

/* ========================================
   Framer Motion Variants
   ======================================== */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
} as const

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
} as const

const filterTabVariants = {
  hidden: { opacity: 0, scale: 0.9, y: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 400, damping: 28 },
  },
} as const

const heartBurstVariants = {
  initial: { scale: 1, opacity: 1 },
  burst: {
    scale: [1, 1.4, 0.8, 1.15, 1],
    opacity: [1, 1, 0.6, 1, 1],
    transition: { type: 'spring' as const, stiffness: 500, damping: 12, duration: 0.6 },
  },
} as const

const heartParticleVariants = {
  initial: { scale: 0, opacity: 0 },
  burst: (i: number) => ({
    scale: [0, 1.2, 0],
    opacity: [0, 1, 0],
    x: [0, (i % 2 === 0 ? 1 : -1) * (12 + i * 4)],
    y: [0, -(8 + i * 5)],
    transition: { type: 'spring' as const, stiffness: 600, damping: 15, delay: i * 0.03 },
  }),
} as const

const pulseGlowVariants = {
  animate: {
    boxShadow: '0 0 12px rgba(239,68,68,0.6)',
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
  },
} as const

const pinnedGlowVariants = {
  animate: {
    boxShadow: '0 0 12px rgba(59,130,246,0.6)',
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
  },
} as const

const slideUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
} as const

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
} as const

const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 350, damping: 28 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.15 },
  },
} as const

const sidebarVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 280, damping: 24 },
  },
} as const

const topicVariants = {
  hidden: { opacity: 0, x: 12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 350, damping: 22 },
  },
} as const

const emptyFloatVariants = [
  { animate: { y: [0, -10, 0], rotate: [0, 8, -8, 0] }, transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const, delay: 0 } },
  { animate: { y: [0, -12, 0], rotate: [0, -6, 6, 0] }, transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.5 } },
  { animate: { y: [0, -8, 0], rotate: [0, 4, -4, 0] }, transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const, delay: 1 } },
  { animate: { y: [0, -14, 0], rotate: [0, -10, 10, 0] }, transition: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' as const, delay: 1.5 } },
]

const commentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 400, damping: 26 },
  },
} as const

const refreshSpinVariants = {
  animate: { rotate: 360 },
  transition: { duration: 1, repeat: Infinity, ease: 'linear' as const },
}

const newPostBadgeVariants = {
  initial: { scale: 0 },
  animate: {
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 500, damping: 15 },
  },
} as const

/* ========================================
   Sub-components
   ======================================== */

/** Heart burst effect when liking a post */
function HeartBurstEffect({ show }: { show: boolean }) {
  return (
    <div className="r54-heart-burst absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
      <AnimatePresence>
        {show && (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.span
                key={i}
                className="absolute text-red-500 text-sm"
                variants={heartParticleVariants}
                initial="initial"
                animate="burst"
                custom={i}
              >
                ♥
              </motion.span>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Animated urgent badge with pulsing glow */
function UrgentBadge() {
  return (
    <motion.span
      className="r54-urgent-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-red-100 bg-red-500"
      variants={pulseGlowVariants}
      animate="animate"
    >
      <AlertTriangle className="h-3 w-3" />
      URGENTE
    </motion.span>
  )
}

/** Animated pinned badge with blue glow */
function PinnedBadge() {
  return (
    <motion.span
      className="r54-pinned-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-blue-100 bg-blue-500"
      variants={pinnedGlowVariants}
      animate="animate"
    >
      <Pin className="h-3 w-3" />
      FIXADO
    </motion.span>
  )
}

/** New post notification badge */
function NewPostBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <motion.span
      className="r54-new-post-badge absolute -top-2 -right-2 h-5 min-w-[20px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1"
      variants={newPostBadgeVariants}
      initial="initial"
      animate="animate"
    >
      {count > 9 ? '9+' : count}
    </motion.span>
  )
}

/** Character limit indicator bar */
function CharIndicator({ current, max }: { current: number; max: number }) {
  const pct = Math.min(current / max, 1)
  const color = pct < 0.7 ? '#10b981' : pct < 0.9 ? '#f59e0b' : '#ef4444'
  return (
    <div className="r54-char-indicator w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mt-1">
      <motion.div
        className="h-full rounded-full"
        animate={{ width: `${pct * 100}%`, backgroundColor: color }}
        transition={{ duration: 0.2 }}
      />
    </div>
  )
}

/** Auto-refresh animation indicator */
function RefreshIndicator({ isRefreshing }: { isRefreshing: boolean }) {
  return (
    <AnimatePresence>
      {isRefreshing && (
        <motion.div
          className="r54-refresh-indicator flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
        >
          <motion.div animate={refreshSpinVariants.animate} transition={refreshSpinVariants.transition}>
            <RefreshCw className="h-3 w-3" />
          </motion.div>
          Atualizando...
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Simplified SVG map view */
function MapView({ posts }: { posts: BulletinPost[] }) {
  const locationPosts = posts.filter((p) => p.location)
  return (
    <div className="r54-map-view relative w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-border/50 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/30 dark:to-teal-900/20">
      {/* Grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="r54-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#r54-grid)" />
      </svg>

      {/* Roads */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M 10 50 L 90 50" stroke="rgba(107,114,128,0.3)" strokeWidth="1.5" strokeDasharray="4 2" />
        <path d="M 50 10 L 50 90" stroke="rgba(107,114,128,0.3)" strokeWidth="1.5" strokeDasharray="4 2" />
        <path d="M 20 20 Q 50 50 80 80" stroke="rgba(107,114,128,0.2)" strokeWidth="1" strokeDasharray="3 2" />
      </svg>

      {/* Pins */}
      {locationPosts.map((post) => {
        if (!post.location) return null
        return (
          <motion.div
            key={post.id}
            className="r54-map-pin absolute z-10"
            style={{ left: `${post.location.x}%`, top: `${post.location.y}%` }}
            initial={{ scale: 0, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 18, delay: 0.1 }}
          >
            <div className="relative group">
              <motion.div
                className="h-8 w-8 rounded-full flex items-center justify-center text-base cursor-default"
                style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                whileHover={{ scale: 1.2, y: -4 }}
              >
                {post.imageEmoji || CATEGORY_EMOJIS[post.category]}
              </motion.div>
              {/* Tooltip */}
              <div className="r54-map-tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                {post.title.length > 25 ? post.title.slice(0, 25) + '...' : post.title}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
              </div>
              {/* Location label */}
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-muted-foreground whitespace-nowrap font-medium">
                {post.location.label}
              </span>
            </div>
          </motion.div>
        )
      })}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
        {CATEGORIES.filter((c) => c.key !== 'all').map((cat) => (
          <span key={cat.key} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/80 dark:bg-gray-800/80 text-[9px] font-medium backdrop-blur-sm">
            {cat.emoji} {cat.label}
          </span>
        ))}
      </div>

      {/* Compass */}
      <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white/80 dark:bg-gray-800/80 flex items-center justify-center backdrop-blur-sm text-xs">
        🧭
      </div>
    </div>
  )
}

/** Empty state illustration */
function EmptyState() {
  return (
    <motion.div
      className="r54-empty-state relative flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border/60 bg-muted/20 overflow-hidden"
      variants={slideUpVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {emptyFloatVariants.map((v, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-15"
            style={{
              top: `${15 + i * 20}%`,
              left: `${10 + i * 22}%`,
            }}
            {...v}
          >
            {['📌', '🎉', '🔍', '⭐'][i]}
          </motion.div>
        ))}
      </div>

      <motion.div
        className="relative"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
      >
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mb-4">
          <Megaphone className="h-9 w-9 text-emerald-500" />
        </div>
      </motion.div>
      <h3 className="r54-empty-title relative text-base font-bold mb-1">Nenhum post encontrado</h3>
      <p className="r54-empty-desc relative text-sm text-muted-foreground max-w-[280px]">
        Seja o primeiro a compartilhar algo com a vizinhança!
      </p>
      <motion.div whileTap={{ scale: 0.93 }} whileHover={{ scale: 1.04 }} className="relative mt-4">
        <Button size="sm" className="gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Criar primeiro post
        </Button>
      </motion.div>
    </motion.div>
  )
}

/** Skeleton loading */
function BoardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Category tabs skeleton */}
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full shrink-0" />
        ))}
      </div>
      {/* Card skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Trending topics sidebar */
function TrendingSidebar({ topics }: { topics: TrendingTopic[] }) {
  return (
    <motion.aside
      className="r54-trending-sidebar hidden lg:block w-64 shrink-0 space-y-4"
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Flame className="h-3.5 w-3.5 text-white" />
          </div>
          <h3 className="text-sm font-bold">Em Alta</h3>
        </div>
        <div className="space-y-2.5">
          {topics.map((topic, i) => (
            <motion.div
              key={topic.id}
              className="r54-trending-item flex items-center justify-between group cursor-default"
              variants={topicVariants}
              initial="hidden"
              animate="visible"
              custom={i}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm">{topic.emoji}</span>
                <span className="text-xs font-medium truncate group-hover:text-primary transition-colors">
                  #{topic.tag}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{topic.count} posts</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <TrendingUp className="h-3.5 w-3.5 text-white" />
          </div>
          <h3 className="text-sm font-bold">Estatísticas</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Posts Hoje', value: '12', icon: Megaphone, color: 'text-blue-500' },
            { label: 'Ativos', value: '48', icon: Eye, color: 'text-emerald-500' },
            { label: 'Resolvidos', value: '35', icon: Check, color: 'text-amber-500' },
            { label: 'Comentários', value: '124', icon: MessageCircle, color: 'text-pink-500' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg bg-muted/50 p-2 text-center">
              <stat.icon className={`h-3.5 w-3.5 ${stat.color} mx-auto mb-0.5`} />
              <p className="text-base font-bold">{stat.value}</p>
              <p className="text-[9px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.aside>
  )
}

/** Single post card */
function PostCard({
  post,
  onLike,
  onBookmark,
  onExpand,
  isLiked,
  isBookmarked,
}: {
  post: BulletinPost
  onLike: () => void
  onBookmark: () => void
  onExpand: () => void
  isLiked: boolean
  isBookmarked: boolean
}) {
  const [heartBurst, setHeartBurst] = useState(false)

  const handleLike = () => {
    if (!isLiked) {
      setHeartBurst(true)
      setTimeout(() => setHeartBurst(false), 600)
    }
    onLike()
  }

  const emojiHeight = post.category === 'events' || post.isUrgent ? 'h-28' : 'h-24'

  return (
    <motion.div variants={cardVariants} layout>
      <Card className="r54-post-card group relative overflow-hidden border-border/50 hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-default">
        <CardContent className="p-4">
          {/* Badges row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`r54-category-badge text-[10px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_BADGE_STYLES[post.category]}`}>
                {CATEGORY_EMOJIS[post.category]} {CATEGORIES.find((c) => c.key === post.category)?.label}
              </span>
              {post.isUrgent && <UrgentBadge />}
              {post.isPinned && <PinnedBadge />}
              {post.isNew && (
                <motion.span
                  className="r54-new-badge inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 500, damping: 18 }}
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  NOVO
                </motion.span>
              )}
            </div>
            {post.location && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <MapPin className="h-2.5 w-2.5" />
                {post.location.label}
              </span>
            )}
          </div>

          {/* Image / emoji placeholder */}
          {post.imageEmoji && (
            <div className={`r54-post-image relative ${emojiHeight} w-full rounded-lg mb-3 flex items-center justify-center text-4xl bg-gradient-to-br from-muted/80 to-muted/40 overflow-hidden`}>
              <motion.span
                className="text-5xl"
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
              >
                {post.imageEmoji}
              </motion.span>
              {/* Shimmer overlay on hover */}
              <div className="r54-post-image-overlay absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
            </div>
          )}

          {/* Title */}
          <h3 className="r54-post-title text-sm font-bold leading-snug mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          {/* Description */}
          <p className="r54-post-desc text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
            {post.description}
          </p>

          {/* Author & timestamp */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative shrink-0">
              <Avatar className="h-6 w-6 ring-1 ring-background">
                <AvatarFallback className={`text-[9px] font-bold ${post.authorColor}`}>
                  {post.authorInitial}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold truncate">{post.author}</p>
              <p className="text-[10px] text-muted-foreground">{post.timeAgo}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Like */}
              <motion.div
                className="relative"
                whileTap={{ scale: 0.85 }}
              >
                <motion.button
                  onClick={handleLike}
                  className={`r54-like-btn flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    isLiked
                      ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <Heart className="h-3 w-3" fill={isLiked ? 'currentColor' : 'none'} />
                  {post.likes + (isLiked ? 1 : 0)}
                </motion.button>
                <HeartBurstEffect show={heartBurst} />
              </motion.div>

              {/* Bookmark */}
              <motion.button
                onClick={onBookmark}
                className={`r54-bookmark-btn flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  isBookmarked
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : 'text-muted-foreground hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                }`}
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.05 }}
              >
                <Bookmark className="h-3 w-3" fill={isBookmarked ? 'currentColor' : 'none'} />
                {post.bookmarks + (isBookmarked ? 1 : 0)}
              </motion.button>

              {/* Share */}
              <motion.button
                className="r54-share-btn flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.05 }}
              >
                <Share2 className="h-3 w-3" />
              </motion.button>
            </div>

            {/* Expand / comments */}
            <motion.button
              onClick={onExpand}
              className="r54-expand-btn flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
            >
              <MessageCircle className="h-3 w-3" />
              {post.comments.length}
            </motion.button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/** Expanded post with comments */
function ExpandedPost({
  post,
  onClose,
  isLiked,
  isBookmarked,
  onLike,
  onBookmark,
}: {
  post: BulletinPost
  onClose: () => void
  isLiked: boolean
  isBookmarked: boolean
  onLike: () => void
  onBookmark: () => void
}) {
  const [newComment, setNewComment] = useState('')

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="r54-expanded-post-dialog max-w-lg max-h-[85vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-5 pb-3">
          <DialogTitle className="text-base">{post.title}</DialogTitle>
          <DialogDescription className="sr-only">Detalhes do post do mural</DialogDescription>
        </DialogHeader>

        <div className="px-5 pb-2 space-y-3">
          {/* Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_BADGE_STYLES[post.category]}`}>
              {CATEGORY_EMOJIS[post.category]} {CATEGORIES.find((c) => c.key === post.category)?.label}
            </span>
            {post.isUrgent && <UrgentBadge />}
            {post.isPinned && <PinnedBadge />}
          </div>

          {/* Image */}
          {post.imageEmoji && (
            <div className="h-40 w-full rounded-lg flex items-center justify-center text-6xl bg-gradient-to-br from-muted/80 to-muted/40">
              {post.imageEmoji}
            </div>
          )}

          {/* Full description */}
          <p className="text-sm text-foreground leading-relaxed">{post.description}</p>

          {/* Author info */}
          <div className="flex items-center gap-2 pt-1 border-t border-border/50">
            <Avatar className="h-8 w-8">
              <AvatarFallback className={`text-xs font-bold ${post.authorColor}`}>
                {post.authorInitial}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-semibold">{post.author}</p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {post.timeAgo}
                {post.location && (
                  <>
                    {' · '}
                    <MapPin className="h-2.5 w-2.5" />
                    {post.location.label}
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
              <Button variant={isLiked ? 'default' : 'outline'} size="sm" className="gap-1.5 text-xs" onClick={onLike}>
                <Heart className="h-3.5 w-3.5" fill={isLiked ? 'currentColor' : 'none'} />
                {post.likes + (isLiked ? 1 : 0)} Curtir
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
              <Button variant={isBookmarked ? 'default' : 'outline'} size="sm" className="gap-1.5 text-xs" onClick={onBookmark}>
                <Bookmark className="h-3.5 w-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
                Salvar
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Share2 className="h-3.5 w-3.5" />
                Compartilhar
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Comments section */}
        <div className="px-5 py-3 border-t border-border/50 space-y-3">
          <h4 className="text-xs font-bold flex items-center gap-1.5">
            <MessageCircle className="h-3.5 w-3.5" />
            Comentários ({post.comments.length})
          </h4>

          {post.comments.length === 0 ? (
            <p className="text-[11px] text-muted-foreground py-2">Nenhum comentário ainda. Seja o primeiro!</p>
          ) : (
            <motion.div className="space-y-2.5" variants={containerVariants} initial="hidden" animate="visible">
              {post.comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  className="r54-comment flex items-start gap-2 p-2 rounded-lg bg-muted/40"
                  variants={commentVariants}
                >
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarFallback className={`text-[8px] font-bold ${comment.authorColor}`}>
                      {comment.authorInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold">{comment.author}</span>
                      <span className="text-[9px] text-muted-foreground">{comment.timeAgo}</span>
                    </div>
                    <p className="text-[11px] text-foreground/80 mt-0.5">{comment.text}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* New comment input */}
          <div className="flex gap-2 pt-1">
            <Input
              placeholder="Escreva um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="h-8 text-xs flex-1"
              maxLength={200}
            />
            <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
              <Button size="sm" className="h-8 w-8 min-h-[44px] min-w-[44px] p-0" disabled={!newComment.trim()}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** New post creation modal */
function NewPostModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; description: string; category: PostCategory; contact: string }) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<PostCategory>('events')
  const [contact, setContact] = useState('')
  const [step, setStep] = useState(1)

  const canSubmit = title.trim().length > 0 && description.trim().length > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="r54-new-post-dialog max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Plus className="h-4 w-4 text-white" />
            </div>
            Novo Post
          </DialogTitle>
          <DialogDescription>Compartilhe algo com a vizinhança</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Category selection */}
          <div>
            <label className="text-xs font-semibold mb-2 block">Categoria</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.filter((c) => c.key !== 'all').map((cat) => {
                const isActive = category === cat.key
                return (
                  <motion.button
                    key={cat.key}
                    className={`r54-cat-select-btn flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium border transition-colors ${
                      isActive
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                    onClick={() => setCategory(cat.key as PostCategory)}
                    whileTap={{ scale: 0.92 }}
                    whileHover={{ scale: 1.04 }}
                  >
                    <span>{cat.emoji}</span>
                    {cat.label}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block">
              Título <span className="text-muted-foreground font-normal">({title.length}/{MAX_CHAR_TITLE})</span>
            </label>
            <Input
              placeholder="Título do seu post..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={MAX_CHAR_TITLE}
              className="text-sm"
            />
            <CharIndicator current={title.length} max={MAX_CHAR_TITLE} />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block">
              Descrição <span className="text-muted-foreground font-normal">({description.length}/{MAX_CHAR_DESC})</span>
            </label>
            <Textarea
              placeholder="Descreva em detalhes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={MAX_CHAR_DESC}
              className="text-sm min-h-[80px] resize-none"
            />
            <CharIndicator current={description.length} max={MAX_CHAR_DESC} />
          </div>

          {/* Image placeholder */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block">Imagem (opcional)</label>
            <div className="r54-image-placeholder border-2 border-dashed border-border/60 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-primary/40 transition-colors cursor-pointer">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <ImagePlus className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Clique para adicionar uma imagem</p>
              <p className="text-[10px] text-muted-foreground/60">JPG, PNG até 5MB</p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block">Contato (opcional)</label>
            <Input
              placeholder="Telefone, e-mail ou WhatsApp..."
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}>
              <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
                Cancelar
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}>
              <Button
                size="sm"
                className="text-xs gap-1.5"
                disabled={!canSubmit}
                onClick={() => {
                  onSubmit({ title: title.trim(), description: description.trim(), category, contact: contact.trim() })
                  onClose()
                }}
              >
                <Send className="h-3.5 w-3.5" />
                Publicar
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ========================================
   Main Component
   ======================================== */
export function NeighborhoodBulletinBoard() {
  const [posts, setPosts] = useState<BulletinPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<PostCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isMapView, setIsMapView] = useState(false)
  const [isNewPostOpen, setIsNewPostOpen] = useState(false)
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [newPostsCount, setNewPostsCount] = useState(0)

  // Initialize with mock data
  useEffect(() => {
    const timer = setTimeout(() => {
      setPosts(MOCK_POSTS)
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // Auto-refresh simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setNewPostsCount((prev) => prev + 1)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    setTimeout(() => {
      setPosts(MOCK_POSTS)
      setNewPostsCount(0)
      setIsRefreshing(false)
    }, 1200)
  }, [])

  const handleLike = useCallback((postId: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) {
        next.delete(postId)
      } else {
        next.add(postId)
      }
      return next
    })
  }, [])

  const handleBookmark = useCallback((postId: string) => {
    setBookmarkedPosts((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) {
        next.delete(postId)
      } else {
        next.add(postId)
      }
      return next
    })
  }, [])

  const handleNewPost = useCallback((data: { title: string; description: string; category: PostCategory; contact: string }) => {
    const newPost: BulletinPost = {
      id: `p-new-${Date.now()}`,
      title: data.title,
      description: data.description,
      category: data.category,
      author: 'Você',
      authorInitial: 'V',
      authorColor: AUTHOR_COLORS[0],
      timestamp: new Date().toISOString(),
      timeAgo: 'Agora',
      likes: 0,
      bookmarks: 0,
      comments: [],
      isPinned: false,
      isUrgent: false,
      isNew: true,
      imageEmoji: CATEGORY_EMOJIS[data.category],
    }
    setPosts((prev) => [newPost, ...prev])
  }, [])

  // Filtered posts
  const filteredPosts = useMemo(() => {
    let result = posts

    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q)
      )
    }

    // Sort: pinned first, then by timestamp desc
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

    return result
  }, [posts, activeCategory, searchQuery])

  // Map view posts (only those with locations)
  const mapPosts = useMemo(() => {
    return posts.filter((p) => p.location)
  }, [posts])

  const expandedPost = expandedPostId ? posts.find((p) => p.id === expandedPostId) : null

  return (
    <section className="r54-bulletin-board w-full">
      {/* Section header */}
      <motion.div
        className="r54-bulletin-header flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5"
        variants={slideUpVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center"
            animate={{ rotate: [0, -5, 5, -3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
          >
            <Megaphone className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 r62-heading-gradient">
              Mural do Bairro
              <motion.span
                className="r54-header-badge text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 18, delay: 0.3 }}
              >
                {posts.length} posts
              </motion.span>
            </h2>
            <p className="text-xs text-muted-foreground">Eventos, dicas, avisos e muito mais</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RefreshIndicator isRefreshing={isRefreshing} />

          {/* Notification bell */}
          <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="relative">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={handleRefresh}
            >
              <Bell className="h-3.5 w-3.5" />
            </Button>
            <NewPostBadge count={newPostsCount} />
          </motion.div>

          {/* Map toggle */}
          <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
            <Button
              variant={isMapView ? 'default' : 'outline'}
              size="sm"
              className="h-8 gap-1.5 text-xs rounded-full"
              onClick={() => setIsMapView(!isMapView)}
            >
              <Map className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mapa</span>
            </Button>
          </motion.div>

          {/* Grid/list toggle (always grid for masonry) */}
          <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              title="Visualização em grade"
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </Button>
          </motion.div>

          {/* New post */}
          <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs rounded-full"
              onClick={() => setIsNewPostOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Novo Post</span>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Loading */}
      {loading && <BoardSkeleton />}

      {/* Main content */}
      {!loading && (
        <div className="r54-bulletin-body flex gap-5">
          {/* Left: Main bulletin content */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Search bar */}
            <motion.div
              className="r54-search-bar relative"
              variants={slideUpVariants}
              initial="hidden"
              animate="visible"
            >
              <Search className="r54-search-icon absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar no mural..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="r54-search-input pl-9 h-9 text-sm rounded-full border-border/50 focus:border-primary/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="r54-search-clear absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </motion.div>

            {/* Category filter tabs */}
            <motion.div
              className="r54-filter-tabs flex gap-2 overflow-x-auto hide-scrollbar pb-1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.key
                const count = cat.key === 'all'
                  ? posts.length
                  : posts.filter((p) => p.category === cat.key).length
                return (
                  <motion.button
                    key={cat.key}
                    className={`r54-filter-tab flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors shrink-0 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    onClick={() => setActiveCategory(cat.key as PostCategory | 'all')}
                    whileTap={{ scale: 0.92 }}
                    whileHover={{ scale: 1.05 }}
                    variants={filterTabVariants}
                  >
                    <span>{cat.emoji}</span>
                    {cat.label}
                    <span
                      className={`text-[9px] font-bold px-1 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-foreground/5 text-muted-foreground'
                      }`}
                    >
                      {count}
                    </span>
                  </motion.button>
                )
              })}
            </motion.div>

            {/* Map view */}
            <AnimatePresence mode="wait">
              {isMapView && (
                <motion.div
                  key="map-view"
                  className="r54-map-container"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring' as const, stiffness: 200, damping: 22 }}
                >
                  <MapView posts={mapPosts} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Posts grid - masonry style using CSS columns */}
            {filteredPosts.length > 0 ? (
              <motion.div
                className="r54-posts-grid columns-1 sm:columns-2 lg:columns-2 xl:columns-3 gap-4 space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key={`${activeCategory}-${searchQuery}`}
              >
                <AnimatePresence mode="popLayout">
                  {filteredPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      className="r54-post-wrapper break-inside-avoid"
                      layout
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    >
                      <PostCard
                        post={post}
                        onLike={() => handleLike(post.id)}
                        onBookmark={() => handleBookmark(post.id)}
                        onExpand={() => setExpandedPostId(post.id)}
                        isLiked={likedPosts.has(post.id)}
                        isBookmarked={bookmarkedPosts.has(post.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <EmptyState />
            )}
          </div>

          {/* Right: Trending sidebar */}
          <TrendingSidebar topics={TRENDING_TOPICS} />
        </div>
      )}

      {/* New post modal — key forces remount to reset form state */}
      <NewPostModal
        key={isNewPostOpen ? 'open' : 'closed'}
        isOpen={isNewPostOpen}
        onClose={() => setIsNewPostOpen(false)}
        onSubmit={handleNewPost}
      />

      {/* Expanded post modal */}
      <AnimatePresence>
        {expandedPost && (
          <ExpandedPost
            post={expandedPost}
            onClose={() => setExpandedPostId(null)}
            isLiked={likedPosts.has(expandedPost.id)}
            isBookmarked={bookmarkedPosts.has(expandedPost.id)}
            onLike={() => handleLike(expandedPost.id)}
            onBookmark={() => handleBookmark(expandedPost.id)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
