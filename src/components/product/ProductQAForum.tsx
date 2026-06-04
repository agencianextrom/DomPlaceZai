'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Search,
  Send,
  X,
  Tag,
  Award,
  Clock,
  TrendingUp,
  Filter,
  Plus,
  CheckCircle,
  Loader2,
  User,
  Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cachedFetch } from '@/lib/api-cache'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { Separator } from '@/components/ui/separator'

// ─── Types ───────────────────────────────────────────────────────────────────

interface QAAnswer {
  id: string
  author: string
  authorInitial: string
  text: string
  timestamp: string
  helpfulCount: number
  isHelpful: boolean
  isVerifiedBuyer: boolean
}

interface QAQuestion {
  id: string
  author: string
  authorInitial: string
  text: string
  timestamp: string
  category: QuestionCategory
  upvotes: number
  downvotes: number
  userVote: 'up' | 'down' | null
  answers: QAAnswer[]
  isTopQuestion: boolean
}

type QuestionCategory = 'Qualidade' | 'Entrega' | 'Tamanho' | 'Compatibilidade' | 'Outro'

type SortOption = 'recent' | 'votes' | 'unanswered'

interface ProductQAForumProps {
  productId?: string
  productName?: string
  category?: string
}

// ─── Category Colors ─────────────────────────────────────────────────────────

const categoryColors: Record<QuestionCategory, { bg: string; text: string; border: string }> = {
  Qualidade: {
    bg: 'rgba(16, 185, 129, 0.1)',
    text: '#059669',
    border: 'rgba(16, 185, 129, 0.3)',
  },
  Entrega: {
    bg: 'rgba(59, 130, 246, 0.1)',
    text: '#2563eb',
    border: 'rgba(59, 130, 246, 0.3)',
  },
  Tamanho: {
    bg: 'rgba(245, 158, 11, 0.1)',
    text: '#d97706',
    border: 'rgba(245, 158, 11, 0.3)',
  },
  Compatibilidade: {
    bg: 'rgba(139, 92, 246, 0.1)',
    text: '#7c3aed',
    border: 'rgba(139, 92, 246, 0.3)',
  },
  Outro: {
    bg: 'rgba(107, 114, 128, 0.1)',
    text: '#4b5563',
    border: 'rgba(107, 114, 128, 0.3)',
  },
}

// ─── Sort Labels ────────────────────────────────────────────────────────────

const sortOptions: { value: SortOption; label: string; icon: typeof Clock }[] = [
  { value: 'recent', label: 'Mais recentes', icon: Clock },
  { value: 'votes', label: 'Mais votadas', icon: TrendingUp },
  { value: 'unanswered', label: 'Sem resposta', icon: MessageSquare },
]

// ─── Avatar Gradient Pairs ───────────────────────────────────────────────────

const avatarGradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
]

// ─── Mock Data ───────────────────────────────────────────────────────────────

function generateMockQuestions(): QAQuestion[] {
  return [
    {
      id: 'q1',
      author: 'Maria Silva',
      authorInitial: 'M',
      text: 'A qualidade do material é boa? Parece ser durável para uso diário?',
      timestamp: '2025-06-10T14:30:00Z',
      category: 'Qualidade',
      upvotes: 7,
      downvotes: 0,
      userVote: null,
      isTopQuestion: true,
      answers: [
        {
          id: 'a1',
          author: 'Carlos M.',
          authorInitial: 'C',
          text: 'Sim, o material é excelente! Tenho usado há 3 meses e continua como novo. A costura é reforçada e o tecido não desbota.',
          timestamp: '2025-06-10T16:45:00Z',
          helpfulCount: 5,
          isHelpful: false,
          isVerifiedBuyer: true,
        },
        {
          id: 'a2',
          author: 'Ana R.',
          authorInitial: 'A',
          text: 'Concordo com o Carlos. Comprei uma unidade e a qualidade superou minhas expectativas, especialmente pelo preço.',
          timestamp: '2025-06-11T09:20:00Z',
          helpfulCount: 3,
          isHelpful: false,
          isVerifiedBuyer: true,
        },
      ],
    },
    {
      id: 'q2',
      author: 'João Santos',
      authorInitial: 'J',
      text: 'Quanto tempo leva a entrega para São Paulo? Preciso para um presente de aniversário dia 20.',
      timestamp: '2025-06-12T08:15:00Z',
      category: 'Entrega',
      upvotes: 5,
      downvotes: 0,
      userVote: null,
      isTopQuestion: true,
      answers: [
        {
          id: 'a3',
          author: 'Loja Oficial',
          authorInitial: 'L',
          text: 'Olá! Para São Paulo capital, a entrega costuma levar de 3 a 5 dias úteis. Se solicitar até o dia 14, chegará a tempo!',
          timestamp: '2025-06-12T10:00:00Z',
          helpfulCount: 4,
          isHelpful: false,
          isVerifiedBuyer: false,
        },
        {
          id: 'a4',
          author: 'Patrícia L.',
          authorInitial: 'P',
          text: 'Eu moro em São Paulo e minha encomenda chegou em 2 dias! Super rápido.',
          timestamp: '2025-06-12T11:30:00Z',
          helpfulCount: 2,
          isHelpful: false,
          isVerifiedBuyer: true,
        },
      ],
    },
    {
      id: 'q3',
      author: 'Fernanda Oliveira',
      authorInitial: 'F',
      text: 'Qual o tamanho ideal para quem usa 42? Serve grande ou pequeno?',
      timestamp: '2025-06-09T19:00:00Z',
      category: 'Tamanho',
      upvotes: 3,
      downvotes: 1,
      userVote: null,
      isTopQuestion: false,
      answers: [
        {
          id: 'a5',
          author: 'Roberto C.',
          authorInitial: 'R',
          text: 'Eu uso 42 e comprei o M. Serviu perfeito! Se gosta mais folgado, pode ir no G.',
          timestamp: '2025-06-10T08:30:00Z',
          helpfulCount: 6,
          isHelpful: false,
          isVerifiedBuyer: true,
        },
        {
          id: 'a6',
          author: 'Luana T.',
          authorInitial: 'L',
          text: 'Serve um pouco menor que o normal. Recomendo pegar um número acima do seu usual.',
          timestamp: '2025-06-10T14:00:00Z',
          helpfulCount: 3,
          isHelpful: false,
          isVerifiedBuyer: true,
        },
        {
          id: 'a7',
          author: 'Marcos P.',
          authorInitial: 'M',
          text: 'Eu uso 43 e peguei o G. Ficou confortável com espaço para sobrar.',
          timestamp: '2025-06-11T07:15:00Z',
          helpfulCount: 1,
          isHelpful: false,
          isVerifiedBuyer: true,
        },
      ],
    },
    {
      id: 'q4',
      author: 'Pedro Almeida',
      authorInitial: 'P',
      text: 'Funciona com aparelhos Samsung Galaxy S24? Quero ter certeza da compatibilidade.',
      timestamp: '2025-06-13T11:45:00Z',
      category: 'Compatibilidade',
      upvotes: 2,
      downvotes: 0,
      userVote: null,
      isTopQuestion: false,
      answers: [
        {
          id: 'a8',
          author: 'TechExpert',
          authorInitial: 'T',
          text: 'Sim, é totalmente compatível com Galaxy S24! Testei pessoalmente e funciona perfeitamente.',
          timestamp: '2025-06-13T13:20:00Z',
          helpfulCount: 3,
          isHelpful: false,
          isVerifiedBuyer: true,
        },
      ],
    },
    {
      id: 'q5',
      author: 'Luciana Costa',
      authorInitial: 'L',
      text: 'Vocês fazem troca caso o produto tenha defeito? Qual a política de garantia?',
      timestamp: '2025-06-08T10:00:00Z',
      category: 'Outro',
      upvotes: 4,
      downvotes: 0,
      userVote: null,
      isTopQuestion: false,
      answers: [
        {
          id: 'a9',
          author: 'Loja Oficial',
          authorInitial: 'L',
          text: 'Olá Luciana! Oferecemos 30 dias de garantia com troca gratuita. Basta entrar em contato pelo chat da loja que resolvemos rapidinho.',
          timestamp: '2025-06-08T12:30:00Z',
          helpfulCount: 4,
          isHelpful: false,
          isVerifiedBuyer: false,
        },
        {
          id: 'a10',
          author: 'Diego F.',
          authorInitial: 'D',
          text: 'Tive um problema e a troca foi super rápida. Entrei no chat e em 24h já tinha o produto novo em mãos!',
          timestamp: '2025-06-09T09:00:00Z',
          helpfulCount: 2,
          isHelpful: false,
          isVerifiedBuyer: true,
        },
      ],
    },
    {
      id: 'q6',
      author: 'Ricardo Mendes',
      authorInitial: 'R',
      text: 'O produto vem com manual de instruções em português? Sou leigo e preciso entender como usar.',
      timestamp: '2025-06-11T17:30:00Z',
      category: 'Qualidade',
      upvotes: 1,
      downvotes: 0,
      userVote: null,
      isTopQuestion: false,
      answers: [
        {
          id: 'a11',
          author: 'Sandra M.',
          authorInitial: 'S',
          text: 'Sim! Veio com manual em português bem detalhado, com ilustrações passo a passo. Super fácil de seguir.',
          timestamp: '2025-06-12T08:00:00Z',
          helpfulCount: 2,
          isHelpful: false,
          isVerifiedBuyer: true,
        },
      ],
    },
    {
      id: 'q7',
      author: 'Beatriz Lima',
      authorInitial: 'B',
      text: 'Fazem entrega aos finais de semana para Belo Horizonte? Quero receber logo!',
      timestamp: '2025-06-14T07:00:00Z',
      category: 'Entrega',
      upvotes: 0,
      downvotes: 0,
      userVote: null,
      isTopQuestion: false,
      answers: [],
    },
    {
      id: 'q8',
      author: 'Thiago Barbosa',
      authorInitial: 'T',
      text: 'Posso usar na chuva? É resistente à água ou preciso ter cuidado extra?',
      timestamp: '2025-06-13T22:15:00Z',
      category: 'Outro',
      upvotes: 0,
      downvotes: 0,
      userVote: null,
      isTopQuestion: false,
      answers: [],
    },
  ]
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
}

const questionCardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
}

const answerVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
}

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 200, damping: 18 },
  },
}

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const modalContentVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 320, damping: 28 },
  },
  exit: {
    opacity: 0,
    y: 40,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
}

// ─── Helper Functions ────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `${diffDays} dias atrás`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} sem${Math.floor(diffDays / 7) > 1 ? 'anas' : 'ana'} atrás`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} mê${Math.floor(diffDays / 30) > 1 ? 'ses' : 's'} atrás`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getInitials(name: string): string {
  return name.charAt(0).toUpperCase()
}

function getAvatarGradient(index: number): string {
  return avatarGradients[index % avatarGradients.length]
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ProductQAForum({ productId, productName, category }: ProductQAForumProps) {
  const [questions, setQuestions] = useState<QAQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSort, setActiveSort] = useState<SortOption>('recent')
  const [activeCategory, setActiveCategory] = useState<QuestionCategory | 'Todos'>('Todos')
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newQuestionText, setNewQuestionText] = useState('')
  const [newQuestionCategory, setNewQuestionCategory] = useState<QuestionCategory>('Qualidade')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({})
  const [helpfulAnswers, setHelpfulAnswers] = useState<Set<string>>(new Set())
  const [helpfulBounce, setHelpfulBounce] = useState<string | null>(null)
  const [justSubmitted, setJustSubmitted] = useState(false)

  // ── Fetch Questions ──

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true)
    try {
      if (productId) {
        const data = await cachedFetch(`/api/products/qa?productId=${productId}`)
        if (data && data.questions) {
          setQuestions(data.questions)
          return
        }
      }
    } catch {
      // Fall through to mock data
    }
    // Use mock data
    setQuestions(generateMockQuestions())
    setIsLoading(false)
  }, [productId])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  useEffect(() => {
    if (questions.length > 0) {
      setIsLoading(false)
    }
  }, [questions])

  // ── Computed Values ──

  const totalQuestions = questions.length
  const totalAnswers = questions.reduce((acc, q) => acc + q.answers.length, 0)

  const filteredQuestions = useMemo(() => {
    let filtered = [...questions]

    // Category filter
    if (activeCategory !== 'Todos') {
      filtered = filtered.filter((q) => q.category === activeCategory)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (q) =>
          q.text.toLowerCase().includes(query) ||
          q.author.toLowerCase().includes(query) ||
          q.answers.some((a) => a.text.toLowerCase().includes(query))
      )
    }

    // Sort
    switch (activeSort) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        break
      case 'votes':
        filtered.sort((a, b) => b.upvotes - a.upvotes)
        break
      case 'unanswered':
        filtered.sort((a, b) => a.answers.length - b.answers.length)
        break
    }

    return filtered
  }, [questions, activeCategory, searchQuery, activeSort])

  const unansweredCount = questions.filter((q) => q.answers.length === 0).length

  // ── Handlers ──

  const handleVote = (questionId: string, voteType: 'up' | 'down') => {
    setUserVotes((prev) => {
      const current = prev[questionId]
      if (current === voteType) {
        const next = { ...prev }
        delete next[questionId]
        return next
      }
      return { ...prev, [questionId]: voteType }
    })
  }

  const handleHelpful = (answerId: string) => {
    setHelpfulBounce(answerId)
    setTimeout(() => setHelpfulBounce(null), 400)
    setHelpfulAnswers((prev) => {
      const next = new Set(prev)
      if (next.has(answerId)) {
        next.delete(answerId)
      } else {
        next.add(answerId)
      }
      return next
    })
  }

  const toggleExpand = (questionId: string) => {
    setExpandedQuestion((prev) => (prev === questionId ? null : questionId))
  }

  const handleSubmitQuestion = async () => {
    if (newQuestionText.trim().length < 10) return

    setIsSubmitting(true)
    try {
      if (productId) {
        const res = await fetch('/api/products/qa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            text: newQuestionText.trim(),
            category: newQuestionCategory,
          }),
        })
        const data = await res.json()
        if (res.ok && data.success) {
          toast.success('Pergunta enviada com sucesso!')
        }
      }
    } catch {
      // fall through
    }

    // Add to local state
    const newQuestion: QAQuestion = {
      id: `q_${Date.now()}`,
      author: 'Você',
      authorInitial: 'V',
      text: newQuestionText.trim(),
      timestamp: new Date().toISOString(),
      category: newQuestionCategory,
      upvotes: 0,
      downvotes: 0,
      userVote: null,
      isTopQuestion: false,
      answers: [],
    }

    setQuestions((prev) => [newQuestion, ...prev])
    setNewQuestionText('')
    setNewQuestionCategory('Qualidade')
    setIsModalOpen(false)
    setIsSubmitting(false)
    setJustSubmitted(true)
    setTimeout(() => setJustSubmitted(false), 3000)
    if (!productId) {
      toast.success('Pergunta enviada com sucesso!')
    }
  }

  const isFormValid = newQuestionText.trim().length >= 10

  // ── Render ──

  return (
    <div className="space-y-6 r38-qa-container">
      {/* ─── Gradient Header ─── */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-2xl"
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.85) 50%, rgba(236, 72, 153, 0.8) 100%)',
          }}
        />
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-10" style={{ background: 'rgba(255,255,255,0.3)' }} />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full opacity-10" style={{ background: 'rgba(255,255,255,0.2)' }} />

        <div className="relative p-5 sm:p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const, repeatDelay: 3 }}
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg"
            >
              <HelpCircle className="h-6 w-6" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold r38-qa-header-shimmer">
                Perguntas e Respostas
              </h2>
              {productName && (
                <p className="text-xs text-white/70 truncate mt-0.5">{productName}</p>
              )}
            </div>
          </div>

          {/* Stats counters */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/15">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Perguntas</p>
                <AnimatedCounter
                  value={totalQuestions}
                  duration={800}
                  className="text-xl font-bold leading-tight"
                />
              </div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/15">
                <Send className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Respostas</p>
                <AnimatedCounter
                  value={totalAnswers}
                  duration={800}
                  delay={200}
                  className="text-xl font-bold leading-tight"
                />
              </div>
            </div>
            {unansweredCount > 0 && (
              <>
                <div className="w-px h-8 bg-white/20" />
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{unansweredCount} sem resposta</span>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* ─── Ask Question Button ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 280, damping: 24, delay: 0.15 }}
      >
        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full h-12 border-dashed border-2 gap-2 text-sm font-medium rounded-xl hover:shadow-lg transition-all r38-qa-ask-btn"
          style={{
            background: 'rgba(99, 102, 241, 0.06)',
            borderColor: 'rgba(99, 102, 241, 0.3)',
            color: '#6366f1',
          }}
        >
          <Plus className="h-4 w-4" />
          Faça uma pergunta sobre este produto
        </Button>
      </motion.div>

      {/* ─── Search & Filters ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 280, damping: 24, delay: 0.2 }}
        className="space-y-3"
      >
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar perguntas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border/60 bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <Filter className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          {(['Todos', 'Qualidade', 'Entrega', 'Tamanho', 'Compatibilidade', 'Outro'] as const).map((cat) => {
            const isActive = activeCategory === cat
            return (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat)}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                  color: isActive ? '#6366f1' : '#6b7280',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                }}
              >
                {cat}
              </motion.button>
            )
          })}
        </div>

        {/* Sort options */}
        <div className="flex items-center gap-1">
          {sortOptions.map((opt) => {
            const isActive = activeSort === opt.value
            const Icon = opt.icon
            return (
              <motion.button
                key={opt.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSort(opt.value)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
                style={{
                  background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  color: isActive ? '#6366f1' : '#9ca3af',
                }}
              >
                <Icon className="h-3 w-3" />
                {opt.label}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* ─── Question List ─── */}
      <div>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full animate-pulse" style={{ background: 'rgba(148, 163, 184, 0.2)' }} />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-28 rounded animate-pulse" style={{ background: 'rgba(148, 163, 184, 0.2)' }} />
                      <div className="h-3 w-full rounded animate-pulse" style={{ background: 'rgba(148, 163, 184, 0.15)' }} />
                      <div className="h-3 w-3/4 rounded animate-pulse" style={{ background: 'rgba(148, 163, 184, 0.15)' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((question, qIdx) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    index={qIdx}
                    isExpanded={expandedQuestion === question.id}
                    onToggleExpand={() => toggleExpand(question.id)}
                    userVote={userVotes[question.id] || null}
                    onVote={(voteType) => handleVote(question.id, voteType)}
                    helpfulAnswers={helpfulAnswers}
                    helpfulBounce={helpfulBounce}
                    onHelpful={handleHelpful}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
                >
                  <EmptyState searchQuery={searchQuery} onAskQuestion={() => setIsModalOpen(true)} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ─── Ask Question Modal ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Modal content */}
            <motion.div
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-lg bg-background rounded-2xl shadow-2xl overflow-hidden"
              style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
              {/* Modal gradient header */}
              <div
                className="px-5 py-4 relative"
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500/10">
                      <HelpCircle className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Faça sua pergunta</h3>
                      {productName && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[250px]">{productName}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Category selector */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Categoria da pergunta</p>
                  <div className="flex flex-wrap gap-2">
                    {(['Qualidade', 'Entrega', 'Tamanho', 'Compatibilidade', 'Outro'] as QuestionCategory[]).map((cat) => {
                      const isSelected = newQuestionCategory === cat
                      const colors = categoryColors[cat]
                      return (
                        <motion.button
                          key={cat}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setNewQuestionCategory(cat)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{
                            background: isSelected ? colors.bg : 'rgba(148, 163, 184, 0.08)',
                            color: isSelected ? colors.text : '#9ca3af',
                            border: isSelected ? `1px solid ${colors.border}` : '1px solid transparent',
                          }}
                        >
                          <Tag className="h-3 w-3" />
                          {cat}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* Question textarea */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Sua pergunta</p>
                  <Textarea
                    placeholder="Descreva sua dúvida sobre o produto..."
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="min-h-[100px] resize-none text-sm rounded-xl"
                  />
                  <p
                    className="text-[10px] mt-1.5 transition-colors"
                    style={{ color: newQuestionText.trim().length >= 10 ? '#059669' : '#9ca3af' }}
                  >
                    {newQuestionText.trim().length}/10 caracteres mínimos
                  </p>
                </div>

                {/* Submit */}
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    onClick={handleSubmitQuestion}
                    disabled={!isFormValid || isSubmitting}
                    className="flex-1 gap-2 rounded-xl h-11 text-sm font-medium"
                    style={{
                      background: isFormValid && !isSubmitting
                        ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                        : undefined,
                    }}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isSubmitting ? 'Enviando...' : 'Enviar pergunta'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs rounded-xl h-11"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Success Toast ─── */}
      <AnimatePresence>
        {justSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-24 md:bottom-8 left-1/2 z-50"
          >
            <Card
              className="border-0 shadow-lg"
              style={{ background: '#059669' }}
            >
              <CardContent className="p-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-white" />
                <span className="text-sm font-medium text-white">Pergunta enviada com sucesso!</span>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Question Card Component ────────────────────────────────────────────────

interface QuestionCardProps {
  question: QAQuestion
  index: number
  isExpanded: boolean
  onToggleExpand: () => void
  userVote: 'up' | 'down' | null
  onVote: (voteType: 'up' | 'down') => void
  helpfulAnswers: Set<string>
  helpfulBounce: string | null
  onHelpful: (answerId: string) => void
}

function QuestionCard({
  question,
  index,
  isExpanded,
  onToggleExpand,
  userVote,
  onVote,
  helpfulAnswers,
  helpfulBounce,
  onHelpful,
}: QuestionCardProps) {
  const colors = categoryColors[question.category]
  const gradientIndex = index % avatarGradients.length
  const effectiveUpvotes = question.upvotes + (userVote === 'up' ? 1 : 0) - (userVote === 'down' && question.upvotes > 0 ? 1 : 0)

  return (
    <motion.div
      variants={questionCardVariants}
      layout
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
    >
      <Card
        className="border-border/50 overflow-hidden r38-qa-card r38-qa-card-hover transition-all duration-300"
        style={{
          boxShadow: isExpanded
            ? '0 4px 20px -4px rgba(99, 102, 241, 0.15), 0 0 0 1px rgba(99, 102, 241, 0.08)'
            : 'none',
        }}
      >
        <CardContent className="p-4">
          {/* ── Question Header ── */}
          <div className="flex items-start gap-3">
            {/* Avatar with gradient border */}
            <div className="relative flex-shrink-0">
              <div
                className="w-10 h-10 rounded-full p-[2px] r38-qa-avatar-ring"
                style={{ background: getAvatarGradient(gradientIndex) }}
              >
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: getAvatarGradient(gradientIndex) }}
                >
                  {question.authorInitial}
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {/* Author + meta row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">{question.author}</span>

                {/* Top Question Badge */}
                {question.isTopQuestion && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-700 dark:text-amber-400 r38-qa-top-badge"
                    style={{
                      background: 'rgba(251, 191, 36, 0.15)',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                    }}
                  >
                    <Award className="h-3 w-3" />
                    Top
                  </motion.span>
                )}

                {/* Category badge */}
                <span
                  className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-medium"
                  style={{
                    background: colors.bg,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <Tag className="h-2.5 w-2.5" />
                  {question.category}
                </span>
              </div>

              {/* Timestamp */}
              <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {formatDate(question.timestamp)}
              </p>

              {/* Question text */}
              <p className="text-sm text-foreground/90 leading-relaxed mt-2">{question.text}</p>
            </div>
          </div>

          {/* ── Action Bar ── */}
          <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.12)' }}>
            {/* Upvote */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => onVote('up')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
              style={{
                background: userVote === 'up' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                color: userVote === 'up' ? '#6366f1' : '#9ca3af',
              }}
            >
              <motion.span
                animate={userVote === 'up' ? { scale: [1, 1.3, 0.9, 1.05, 1] } : { scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 10 }}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </motion.span>
              {effectiveUpvotes}
            </motion.button>

            {/* Downvote */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => onVote('down')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
              style={{
                background: userVote === 'down' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                color: userVote === 'down' ? '#ef4444' : '#9ca3af',
              }}
            >
              <motion.span
                animate={userVote === 'down' ? { scale: [1, 1.3, 0.9, 1.05, 1] } : { scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 10 }}
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </motion.span>
              {question.downvotes}
            </motion.button>

            {/* Answer count + expand toggle */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onToggleExpand}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ml-auto"
              style={{
                background: isExpanded ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                color: isExpanded ? '#6366f1' : '#6b7280',
              }}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {question.answers.length} {question.answers.length === 1 ? 'resposta' : 'respostas'}
              <motion.span
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </motion.span>
            </motion.button>
          </div>

          {/* ── Answers Section (Expandable) ── */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <Separator className="my-3" style={{ background: 'rgba(148, 163, 184, 0.1)' }} />

                {question.answers.length > 0 ? (
                  <div className="space-y-3">
                    {question.answers.map((answer, aIdx) => (
                      <AnswerItem
                        key={answer.id}
                        answer={answer}
                        index={aIdx}
                        questionIndex={index}
                        isHelpful={helpfulAnswers.has(answer.id)}
                        isBouncing={helpfulBounce === answer.id}
                        onHelpful={() => onHelpful(answer.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-muted-foreground">Nenhuma resposta ainda</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Seja o primeiro a responder!</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Answer Item Component ───────────────────────────────────────────────────

interface AnswerItemProps {
  answer: QAAnswer
  index: number
  questionIndex: number
  isHelpful: boolean
  isBouncing: boolean
  onHelpful: () => void
}

function AnswerItem({ answer, index, questionIndex, isHelpful, isBouncing, onHelpful }: AnswerItemProps) {
  const gradientIdx = (questionIndex * 3 + index + 1) % avatarGradients.length

  return (
    <motion.div
      variants={answerVariants}
      initial="hidden"
      animate="visible"
      className="flex items-start gap-2.5 rounded-xl p-3 transition-colors"
      style={{
        background: 'rgba(99, 102, 241, 0.03)',
        border: '1px solid rgba(148, 163, 184, 0.08)',
      }}
    >
      {/* Answerer avatar */}
      <div className="relative flex-shrink-0">
        <div
          className="w-8 h-8 rounded-full p-[1.5px] r38-qa-avatar-ring"
          style={{ background: getAvatarGradient(gradientIdx) }}
        >
          <div
            className="w-full h-full rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: getAvatarGradient(gradientIdx) }}
          >
            {answer.authorInitial}
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {/* Author row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-xs">{answer.author}</span>
          {answer.isVerifiedBuyer && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-medium"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#059669',
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}
            >
              <CheckCircle className="h-2.5 w-2.5" />
              Compra verificada
            </span>
          )}
          <span className="text-[10px] text-muted-foreground">{formatDate(answer.timestamp)}</span>
        </div>

        {/* Answer text */}
        <p className="text-sm text-muted-foreground leading-relaxed mt-1">{answer.text}</p>

        {/* Helpful button */}
        <div className="flex items-center gap-3 mt-2">
          <motion.div
            animate={isBouncing ? { scale: [1, 1.35, 0.85, 1.1, 1] } : { scale: 1 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 10 }}
          >
            <motion.button
              onClick={onHelpful}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-all r38-qa-helpful-btn"
              style={{
                background: isHelpful ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                color: isHelpful ? '#6366f1' : '#9ca3af',
              }}
            >
              <motion.span
                animate={isHelpful ? { scale: [1, 1.25, 0.95, 1] } : { scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
              >
                <ThumbsUp className="h-3 w-3" />
              </motion.span>
              Útil
              <span className="font-semibold">({answer.helpfulCount + (isHelpful ? 1 : 0)})</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Empty State Component ───────────────────────────────────────────────────

interface EmptyStateProps {
  searchQuery: string
  onAskQuestion: () => void
}

function EmptyState({ searchQuery, onAskQuestion }: EmptyStateProps) {
  return (
    <Card className="border-border/50 overflow-hidden">
      <CardContent className="p-8 text-center">
        {/* Illustration */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' as const, stiffness: 200, damping: 15 }}
          className="relative mx-auto w-24 h-24 mb-4"
        >
          {/* Question mark circle */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.12) 100%)',
              border: '2px dashed rgba(99, 102, 241, 0.2)',
            }}
          >
            <span className="text-4xl font-bold" style={{ color: 'rgba(99, 102, 241, 0.3)' }}>?</span>
          </motion.div>
          {/* Decorative dots */}
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full r38-qa-empty-dot-1" style={{ background: 'rgba(99, 102, 241, 0.2)' }} />
          <div className="absolute -bottom-2 -left-1 w-2 h-2 rounded-full r38-qa-empty-dot-2" style={{ background: 'rgba(139, 92, 246, 0.2)' }} />
        </motion.div>

        <h3 className="font-semibold text-sm mb-1 r38-qa-empty-title">
          {searchQuery ? 'Nenhuma pergunta encontrada' : 'Nenhuma pergunta ainda'}
        </h3>
        <p className="text-xs text-muted-foreground max-w-[260px] mx-auto leading-relaxed">
          {searchQuery
            ? `Não encontramos resultados para "${searchQuery}". Tente outra busca.`
            : 'Seja o primeiro a perguntar sobre este produto e ajude outros compradores!'}
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring' as const, stiffness: 200, damping: 20 }}
          className="mt-4"
        >
          <Button
            onClick={onAskQuestion}
            className="gap-2 rounded-xl text-sm"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            }}
          >
            <Plus className="h-4 w-4" />
            Faça a primeira pergunta
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  )
}
