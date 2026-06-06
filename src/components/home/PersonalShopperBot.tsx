'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag,
  Sparkles,
  RotateCcw,
  Share2,
  Heart,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  Check,
  Star,
  ArrowRight,
} from 'lucide-react'
import { resolveProductImage } from '@/lib/product-images'
import { formatBRL } from '@/lib/format'
import { fireConfettiFromElement } from '@/lib/confetti'

/* ══════════════════════════════════════════
   Types
   ══════════════════════════════════════════ */
interface StyleOption {
  id: string
  label: string
  emoji: string
  description: string
  color: string
}

interface OccasionOption {
  id: string
  label: string
  emoji: string
  description: string
}

interface ColorSwatch {
  id: string
  name: string
  hex: string
}

interface BudgetLevel {
  value: number
  label: string
}

interface MockProduct {
  id: string
  name: string
  price: number
  category: string
  slug: string
  images?: string
  storeName: string
  rating: number
  styleTag: string
}

interface ChatMessage {
  id: string
  text: string
  sender: 'ai' | 'user'
  timestamp: number
}

interface SavedPreferences {
  style: string
  budget: number
  occasion: string
  colors: string[]
  outfitType: string
  timestamp: number
}

/* ══════════════════════════════════════════
   Data
   ══════════════════════════════════════════ */
const TOTAL_STEPS = 6

const styleOptions: StyleOption[] = [
  { id: 'casual', label: 'Casual', emoji: '😎', description: 'Confortável e descontraído', color: '#10b981' },
  { id: 'formal', label: 'Formal', emoji: '👔', description: 'Elegante e profissional', color: '#3b82f6' },
  { id: 'sporty', label: 'Esportivo', emoji: '🏃', description: 'Ativo e dinâmico', color: '#f59e0b' },
  { id: 'bohemian', label: 'Boêmio', emoji: '🌿', description: 'Livre e criativo', color: '#8b5cf6' },
  { id: 'minimalist', label: 'Minimalista', emoji: '✨', description: 'Simples e sofisticado', color: '#6b7280' },
  { id: 'streetwear', label: 'Streetwear', emoji: '🛹', description: 'Urbano e ousado', color: '#ef4444' },
]

const occasionOptions: OccasionOption[] = [
  { id: 'birthday', label: 'Aniversário', emoji: '🎂', description: 'Comemorar com estilo' },
  { id: 'wedding', label: 'Casamento', emoji: '💒', description: 'Elegância para o grande dia' },
  { id: 'everyday', label: 'Dia a Dia', emoji: '☀️', description: 'Para o uso cotidiano' },
  { id: 'office', label: 'Escritório', emoji: '💼', description: 'Profissional e confortável' },
  { id: 'party', label: 'Festa', emoji: '🎉', description: 'Arrasar na noite' },
  { id: 'datenight', label: 'Encontro', emoji: '💕', description: 'Perfeito para um date' },
]

const colorSwatches: ColorSwatch[] = [
  { id: 'black', name: 'Preto', hex: '#1a1a2e' },
  { id: 'white', name: 'Branco', hex: '#f8f9fa' },
  { id: 'navy', name: 'Azul Marinho', hex: '#1e3a5f' },
  { id: 'red', name: 'Vermelho', hex: '#dc2626' },
  { id: 'green', name: 'Verde', hex: '#059669' },
  { id: 'beige', name: 'Bege', hex: '#d4a574' },
  { id: 'pink', name: 'Rosa', hex: '#ec4899' },
  { id: 'gray', name: 'Cinza', hex: '#6b7280' },
  { id: 'brown', name: 'Marrom', hex: '#92400e' },
  { id: 'purple', name: 'Roxo', hex: '#7c3aed' },
]

const budgetLevels: BudgetLevel[] = [
  { value: 50, label: 'Até R$50' },
  { value: 100, label: 'Até R$100' },
  { value: 200, label: 'Até R$200' },
  { value: 500, label: 'Até R$500' },
]

const outfitTypes = [
  { id: 'complete', label: 'Look Completo', emoji: '👔' },
  { id: 'tops', label: 'Parte de Cima', emoji: '👕' },
  { id: 'bottoms', label: 'Parte de Baixo', emoji: '👖' },
  { id: 'accessories', label: 'Acessórios', emoji: '💍' },
]

const mockProducts: MockProduct[] = [
  { id: 'p1', name: 'Camiseta Premium Algodão', price: 79.90, category: 'FASHION', slug: 'camiseta-premium', storeName: 'Moda Urbana', rating: 4.8, styleTag: 'casual' },
  { id: 'p2', name: 'Calça Jeans Slim Fit', price: 159.90, category: 'FASHION', slug: 'calca-jeans-slim', storeName: 'Moda Urbana', rating: 4.6, styleTag: 'casual' },
  { id: 'p3', name: 'Blazer Formal Azul', price: 299.90, category: 'FASHION', slug: 'blazer-formal', storeName: 'Elegance Store', rating: 4.9, styleTag: 'formal' },
  { id: 'p4', name: 'Tênis Running Pro', price: 249.90, category: 'SPORTS', slug: 'tenis-running', storeName: 'Sport Life', rating: 4.7, styleTag: 'sporty' },
  { id: 'p5', name: 'Vestido Boho Floral', price: 189.90, category: 'FASHION', slug: 'vestido-boho', storeName: 'Boho Chic', rating: 4.5, styleTag: 'bohemian' },
  { id: 'p6', name: 'Moletom Streetwear', price: 199.90, category: 'FASHION', slug: 'moletom-street', storeName: 'Street Style', rating: 4.8, styleTag: 'streetwear' },
  { id: 'p7', name: 'Relógio Minimalista', price: 349.90, category: 'FASHION', slug: 'relogio-mini', storeName: 'Minimal Wear', rating: 4.9, styleTag: 'minimalist' },
  { id: 'p8', name: 'Bolsa Couro Legítimo', price: 279.90, category: 'FASHION', slug: 'bolsa-couro', storeName: 'Elegance Store', rating: 4.7, styleTag: 'formal' },
  { id: 'p9', name: 'Cinto Artigo Único', price: 89.90, category: 'FASHION', slug: 'cinto-artigo', storeName: 'Moda Urbana', rating: 4.4, styleTag: 'streetwear' },
  { id: 'p10', name: 'Óculos de Sol Polarizado', price: 179.90, category: 'FASHION', slug: 'oculos-polarizado', storeName: 'Sport Life', rating: 4.6, styleTag: 'sporty' },
  { id: 'p11', name: 'Camisa Linho Natural', price: 129.90, category: 'FASHION', slug: 'camisa-linho', storeName: 'Boho Chic', rating: 4.5, styleTag: 'bohemian' },
  { id: 'p12', name: 'Shorts Cargo Utility', price: 99.90, category: 'FASHION', slug: 'shorts-cargo', storeName: 'Street Style', rating: 4.3, styleTag: 'streetwear' },
]

const outfitSuggestions = [
  {
    id: 'o1',
    name: 'Casual Cool',
    emoji: '😎',
    products: ['p1', 'p2', 'p10'],
    description: 'Perfeito para o dia a dia com conforto e estilo',
  },
  {
    id: 'o2',
    name: 'Office Power',
    emoji: '💼',
    products: ['p3', 'p8', 'p7'],
    description: 'Elegância profissional para impressionar',
  },
  {
    id: 'o3',
    name: 'Night Out',
    emoji: '🌙',
    products: ['p5', 'p10', 'p9'],
    description: 'Arrasar na noite com muito charme',
  },
]

const STORAGE_KEY = 'r54-shopper-preferences'

const categoryEmojis: Record<string, string> = {
  FOOD: '🍽️', HEALTH: '💊', AGRICULTURE: '🌱', ELECTRONICS: '📱',
  ANIMALS: '🐾', BEAUTY: '✂️', FASHION: '👕', SERVICES: '🔧',
  HOME_GARDEN: '🏡', SPORTS: '🏋️',
}

/* ══════════════════════════════════════════
   Animation Variants
   ══════════════════════════════════════════ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } } as const,
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 16 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 20 },
  },
}

const chatBubbleVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.9 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring' as const, stiffness: 320, damping: 26 },
  },
}

const confettiBurstVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1, scale: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
  },
}

const progressFillVariants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { type: 'spring' as const, stiffness: 200, damping: 20 },
  },
}

const sliderThumbVariants = {
  idle: { scale: 1 },
  active: { scale: 1.25 },
}

const recommendationGridVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } } as const,
}

const recommendationCardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring' as const, stiffness: 280, damping: 22 },
  },
}

const outfitCardVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1, x: 0,
    transition: { type: 'spring' as const, stiffness: 240, damping: 20 },
  },
}

/* ══════════════════════════════════════════
   Typing Hook
   ══════════════════════════════════════════ */
function useTypingEffect(text: string, speed: number = 30) {
  const [displayed, setDisplayed] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    setDisplayed('')
    setIsTyping(true)
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        setIsTyping(false)
        clearInterval(timer)
      }
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed])

  return { displayed, isTyping }
}

/* ══════════════════════════════════════════
   Blinking Avatar
   ══════════════════════════════════════════ */
function ShopperAvatar({ size = 40 }: { size?: number }) {
  const [eyesOpen, setEyesOpen] = useState(true)

  useEffect(() => {
    const blink = () => {
      setEyesOpen(false)
      setTimeout(() => setEyesOpen(true), 180)
    }
    const interval = setInterval(blink, 3000 + Math.random() * 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="r54-personal-shopper-avatar rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #10b981, #059669)',
        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
      }}
    >
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
          {/* Face */}
          <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.9" />
          {/* Left eye */}
          <motion.ellipse
            cx="9"
            cy="10"
            rx="1.5"
            ry={eyesOpen ? 1.8 : 0.3}
            fill="#1a1a2e"
            animate={{ ry: eyesOpen ? 1.8 : 0.3 }}
            transition={{ duration: 0.12 }}
          />
          {/* Right eye */}
          <motion.ellipse
            cx="15"
            cy="10"
            rx="1.5"
            ry={eyesOpen ? 1.8 : 0.3}
            fill="#1a1a2e"
            animate={{ ry: eyesOpen ? 1.8 : 0.3 }}
            transition={{ duration: 0.12 }}
          />
          {/* Smile */}
          <path
            d="M8 15 Q12 19 16 15"
            stroke="#1a1a2e"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Sparkle on hat */}
          <circle cx="18" cy="5" r="1" fill="#f59e0b" />
        </svg>
      </motion.div>
    </div>
  )
}

/* ══════════════════════════════════════════
   Confetti Particles (inline, lightweight)
   ══════════════════════════════════════════ */
function MiniConfetti() {
  const particles = useMemo(() => {
    const colors = ['#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6', '#84cc16']
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      color: colors[i % colors.length],
      x: Math.random() * 300 - 150,
      y: -(Math.random() * 200 + 50),
      rotation: Math.random() * 360,
      size: Math.random() * 6 + 4,
      delay: Math.random() * 0.5,
    }))
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 50 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y + 400,
            opacity: [1, 1, 0],
            rotate: p.rotation + 720,
          }}
          transition={{
            duration: 2.5,
            delay: p.delay,
            ease: 'easeIn',
          }}
          className="absolute left-1/2 top-1/2"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════ */
export function PersonalShopperBot() {
  /* ── State ── */
  const [step, setStep] = useState(0)
  const [started, setStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [selectedBudget, setSelectedBudget] = useState<number>(200)
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null)
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set())
  const [selectedOutfitType, setSelectedOutfitType] = useState<string>('complete')
  const [savedPrefs, setSavedPrefs] = useState<SavedPreferences | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as SavedPreferences) : null
    } catch { return null }
  })

  const chatEndRef = useRef<HTMLDivElement>(null)
  const confettiRef = useRef<HTMLDivElement>(null)
  const sliderTrackRef = useRef<HTMLDivElement>(null)

  /* ── AI question text per step ── */
  const aiQuestions = useMemo(() => [
    `Oi! 👋 Eu sou sua Personal Shopper virtual! Vou te ajudar a encontrar os produtos perfeitos. Qual é o seu estilo?`,
    `Ótima escolha! 💚 E qual é o seu orçamento para essa compra?`,
    `Entendi! Agora me conta: para qual ocasião você está procurando?`,
    `Que legal! 🎨 Quais cores você prefere? Pode escolher várias!`,
    `Perfeito! E que tipo de peça você está buscando?`,
    `Excelente! Estou montando suas recomendações personalizadas... ✨`,
  ], [])

  const { displayed: currentAIGreeting, isTyping } = useTypingEffect(
    started && !showResults ? (aiQuestions[step] || '') : '',
    28
  )

  /* ── Scroll chat to bottom ── */
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatHistory, currentAIGreeting])

  /* ── Filter products by selections ── */
  const recommendedProducts = useMemo(() => {
    return mockProducts.filter((p) => {
      if (selectedStyle && p.styleTag !== selectedStyle) return false
      if (p.price > selectedBudget) return false
      return true
    }).slice(0, 8)
  }, [selectedStyle, selectedBudget])

  const relevantOutfits = useMemo(() => {
    return outfitSuggestions.filter((o) => {
      const styleMatch = o.products.some((pid) => {
        const prod = mockProducts.find((mp) => mp.id === pid)
        return prod ? (!selectedStyle || prod.styleTag === selectedStyle) : false
      })
      return styleMatch
    })
  }, [selectedStyle])

  /* ── Progress percentage ── */
  const progressPercent = showResults ? 100 : Math.round((step / TOTAL_STEPS) * 100)

  /* ── Handlers ── */
  const handleStart = useCallback(() => {
    setStarted(true)
    setStep(0)
    setChatHistory([])
    setShowResults(false)
    setSelectedStyle(null)
    setSelectedBudget(200)
    setSelectedOccasion(null)
    setSelectedColors(new Set())
    setSelectedOutfitType('complete')
    setFavorites(new Set())
  }, [])

  const handleStyleSelect = useCallback((id: string) => {
    setSelectedStyle(id)
    const label = styleOptions.find((s) => s.id === id)?.label || id
    setChatHistory((prev) => [
      ...prev,
      { id: `msg-${Date.now()}`, text: label, sender: 'user' as const, timestamp: Date.now() },
    ])
    setTimeout(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)), 400)
  }, [])

  const handleOccasionSelect = useCallback((id: string) => {
    setSelectedOccasion(id)
    const label = occasionOptions.find((o) => o.id === id)?.label || id
    setChatHistory((prev) => [
      ...prev,
      { id: `msg-${Date.now()}`, text: label, sender: 'user' as const, timestamp: Date.now() },
    ])
    setTimeout(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)), 400)
  }, [])

  const handleColorToggle = useCallback((id: string) => {
    setSelectedColors((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleColorConfirm = useCallback(() => {
    const names = Array.from(selectedColors).map((id) =>
      colorSwatches.find((c) => c.id === id)?.name || id
    )
    setChatHistory((prev) => [
      ...prev,
      { id: `msg-${Date.now()}`, text: `Cores: ${names.join(', ')}`, sender: 'user' as const, timestamp: Date.now() },
    ])
    setTimeout(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)), 400)
  }, [selectedColors])

  const handleOutfitSelect = useCallback((id: string) => {
    setSelectedOutfitType(id)
    const label = outfitTypes.find((t) => t.id === id)?.label || id
    setChatHistory((prev) => [
      ...prev,
      { id: `msg-${Date.now()}`, text: label, sender: 'user' as const, timestamp: Date.now() },
    ])
    setTimeout(() => {
      setStep(TOTAL_STEPS - 1)
      setIsGenerating(true)
      setTimeout(() => {
        setIsGenerating(false)
        setShowResults(true)
        if (confettiRef.current) {
          fireConfettiFromElement(confettiRef.current)
        }
      }, 2000)
    }, 400)
  }, [])

  const handleToggleFavorite = useCallback((productId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }, [])

  const handleStartOver = useCallback(() => {
    setShowResults(false)
    setStep(0)
    setStarted(true)
    setChatHistory([])
    setSelectedStyle(null)
    setSelectedBudget(200)
    setSelectedOccasion(null)
    setSelectedColors(new Set())
    setSelectedOutfitType('complete')
    setFavorites(new Set())
  }, [])

  const handleSavePreferences = useCallback(() => {
    const prefs: SavedPreferences = {
      style: selectedStyle || '',
      budget: selectedBudget,
      occasion: selectedOccasion || '',
      colors: Array.from(selectedColors),
      outfitType: selectedOutfitType,
      timestamp: Date.now(),
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
      setSavedPrefs(prefs)
    } catch { /* ignore */ }
  }, [selectedStyle, selectedBudget, selectedOccasion, selectedColors, selectedOutfitType])

  const handleShare = useCallback(async () => {
    const text = `🛍️ Minhas recomendações da Personal Shopper DomPlace:\n\n` +
      (selectedStyle ? `Estilo: ${styleOptions.find((s) => s.id === selectedStyle)?.label}\n` : '') +
      `Orçamento: Até R$${selectedBudget}\n` +
      (selectedOccasion ? `Ocasião: ${occasionOptions.find((o) => o.id === selectedOccasion)?.label}\n` : '') +
      `\nVenha conferir na DomPlace! 🚀`

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'DomPlace - Personal Shopper', text })
      } catch { /* user cancelled */ }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    }
  }, [selectedStyle, selectedBudget, selectedOccasion])

  const handleLoadSaved = useCallback(() => {
    if (!savedPrefs) return
    setSelectedStyle(savedPrefs.style || null)
    setSelectedBudget(savedPrefs.budget)
    setSelectedOccasion(savedPrefs.occasion || null)
    setSelectedColors(new Set(savedPrefs.colors))
    setSelectedOutfitType(savedPrefs.outfitType)
    setShowResults(true)
    setStarted(true)
    setStep(TOTAL_STEPS - 1)
  }, [savedPrefs])

  /* ── Slider percentage from track click ── */
  const handleSliderClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderTrackRef.current) return
    const rect = sliderTrackRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = Math.max(0, Math.min(1, x / rect.width))
    const val = Math.round(pct * (budgetLevels[budgetLevels.length - 1].value - budgetLevels[0].value) + budgetLevels[0].value)
    setSelectedBudget(val)
  }, [])

  const sliderPercent = ((selectedBudget - budgetLevels[0].value) / (budgetLevels[budgetLevels.length - 1].value - budgetLevels[0].value)) * 100

  const activeBudgetLabel = budgetLevels.reduce((acc, lvl) =>
    selectedBudget >= lvl.value ? lvl : acc, budgetLevels[0]
  ).label

  /* ══════════════════════════════════════════
     Render
     ══════════════════════════════════════════ */
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 200, damping: 22 }}
      className="w-full r54-personal-shopper-container"
    >
      <div
        className="rounded-2xl overflow-hidden border r54-personal-shopper-main r62-card-lift"
        style={{
          background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.04), rgba(245, 158, 11, 0.03))',
          borderColor: 'rgba(16, 185, 129, 0.15)',
        }}
      >
        {/* ── Header ── */}
        <div
          className="px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between r54-personal-shopper-header"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.06))',
            borderBottom: '1px solid rgba(16, 185, 129, 0.12)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ShoppingBag className="h-5 w-5" style={{ color: '#10b981' }} />
            </motion.div>
            <div>
              <h2 className="text-base sm:text-lg font-bold r62-heading-gradient">Personal Shopper</h2>
              <p className="text-[11px] text-muted-foreground">AI-powered style assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {started && (
              <motion.div whileTap={{ scale: 0.92 }} className="cursor-pointer">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleStartOver}
                  className="min-h-[44px] min-w-[44px] p-1.5 rounded-full border r54-personal-shopper-reset-btn"
                  style={{ borderColor: 'rgba(16, 185, 129, 0.25)' }}
                >
                  <RotateCcw className="h-3.5 w-3.5" style={{ color: '#10b981' }} />
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>

        {/* ── Progress Bar ── */}
        {started && (
          <div className="px-4 sm:px-5 py-2 r54-personal-shopper-progress-wrap">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-muted-foreground">
                {showResults ? 'Concluído!' : `Etapa ${Math.min(step + 1, TOTAL_STEPS)} de ${TOTAL_STEPS}`}
              </span>
              <span className="text-[11px] font-bold" style={{ color: '#10b981' }}>
                {progressPercent}%
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden r54-personal-shopper-progress-track"
              style={{ background: 'rgba(16, 185, 129, 0.1)' }}
            >
              <motion.div
                className="h-full rounded-full r54-personal-shopper-progress-fill"
                variants={progressFillVariants}
                initial="hidden"
                animate="visible"
                key={`progress-${progressPercent}`}
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #10b981, #059669, #10b981)',
                  backgroundSize: '200% 100%',
                  transformOrigin: 'left center',
                }}
              />
            </div>
          </div>
        )}

        {/* ── Body ── */}
        <div className="p-4 sm:p-5">
          {/* ── Landing (not started) ── */}
          {!started && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-center py-6 sm:py-10"
            >
              <motion.div
                variants={itemVariants}
                className="mb-4 flex justify-center"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  <ShopperAvatar size={80} />
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="h-5 w-5" style={{ color: '#f59e0b' }} />
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.h3
                variants={itemVariants}
                className="text-lg sm:text-xl font-bold mb-2"
              >
                Encontre seu estilo perfeito
              </motion.h3>
              <motion.p
                variants={itemVariants}
                className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto"
              >
                Responda algumas perguntas e nossa IA vai curar as melhores recomendações para você
              </motion.p>

              {savedPrefs && (
                <motion.div
                  variants={itemVariants}
                  className="mb-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLoadSaved}
                    className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer text-sm font-medium r54-personal-shopper-saved-btn"
                    style={{
                      borderColor: 'rgba(16, 185, 129, 0.25)',
                      background: 'rgba(16, 185, 129, 0.06)',
                      color: '#10b981',
                    }}
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                    Carregar preferências salvas
                  </motion.div>
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <button
                    onClick={handleStart}
                    className="px-8 py-3 rounded-xl text-white font-semibold text-sm flex items-center gap-2 mx-auto r54-personal-shopper-start-btn"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      boxShadow: '0 4px 20px rgba(16, 185, 129, 0.35)',
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                    Começar
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* ── Interview Flow ── */}
          {started && !showResults && (
            <div className="space-y-4">
              {/* ── Chat messages ── */}
              <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar r54-personal-shopper-chat-area pr-1">
                {chatHistory.map((msg) => (
                  <motion.div
                    key={msg.id}
                    variants={chatBubbleVariants}
                    initial="hidden"
                    animate="visible"
                    className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'ai' && <ShopperAvatar size={28} />}
                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm ${
                        msg.sender === 'user'
                          ? 'r54-personal-shopper-bubble-user'
                          : 'r54-personal-shopper-bubble-ai'
                      }`}
                      style={
                        msg.sender === 'user'
                          ? { background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', borderBottomRightRadius: 4 }
                          : { background: 'rgba(241, 245, 249, 0.9)', color: '#1a1a2e', borderBottomLeftRadius: 4 }
                      }
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {/* Current AI message with typing effect */}
                {currentAIGreeting && (
                  <motion.div
                    variants={chatBubbleVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex gap-2 justify-start"
                  >
                    <ShopperAvatar size={28} />
                    <div
                      className="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm r54-personal-shopper-bubble-ai"
                      style={{ background: 'rgba(241, 245, 249, 0.9)', color: '#1a1a2e', borderBottomLeftRadius: 4 }}
                    >
                      {currentAIGreeting}
                      {isTyping && (
                        <motion.span
                          className="inline-block ml-0.5"
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        >
                          |
                        </motion.span>
                      )}
                    </div>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* ── Step Content ── */}
              <AnimatePresence mode="wait">
                {/* Step 0: Style Selection */}
                {step === 0 && (
                  <motion.div
                    key="step-style"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-2"
                  >
                    {styleOptions.map((opt) => (
                      <motion.button
                        key={opt.id}
                        variants={cardVariants}
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleStyleSelect(opt.id)}
                        className="p-3 rounded-xl border text-left transition-all r54-personal-shopper-style-card"
                        style={{
                          borderColor: selectedStyle === opt.id ? opt.color : 'rgba(0,0,0,0.08)',
                          background: selectedStyle === opt.id
                            ? `linear-gradient(135deg, ${opt.color}15, ${opt.color}08)`
                            : 'white',
                          boxShadow: selectedStyle === opt.id
                            ? `0 4px 16px ${opt.color}30`
                            : '0 1px 3px rgba(0,0,0,0.04)',
                        }}
                      >
                        <span className="text-2xl block mb-1">{opt.emoji}</span>
                        <span className="text-xs font-bold block">{opt.label}</span>
                        <span className="text-[10px] text-muted-foreground">{opt.description}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {/* Step 1: Budget Slider */}
                {step === 1 && (
                  <motion.div
                    key="step-budget"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4"
                  >
                    <div className="text-center mb-4">
                      <motion.span
                        key={selectedBudget}
                        initial={{ scale: 1.3, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                        className="text-2xl sm:text-3xl font-extrabold block r54-personal-shopper-budget-amount"
                        style={{ color: '#10b981' }}
                      >
                        {formatBRL(selectedBudget)}
                      </motion.span>
                      <span className="text-xs text-muted-foreground block mt-1">{activeBudgetLabel}</span>
                    </div>

                    <div className="px-2">
                      <div
                        ref={sliderTrackRef}
                        onClick={handleSliderClick}
                        className="relative h-10 flex items-center cursor-pointer r54-personal-shopper-slider-track"
                      >
                        {/* Track bg */}
                        <div
                          className="absolute w-full h-2 rounded-full"
                          style={{ background: 'rgba(16, 185, 129, 0.12)' }}
                        />
                        {/* Filled portion */}
                        <div
                          className="absolute h-2 rounded-full"
                          style={{
                            width: `${sliderPercent}%`,
                            background: 'linear-gradient(90deg, #10b981, #059669)',
                            boxShadow: '0 0 8px rgba(16, 185, 129, 0.3)',
                          }}
                        />
                        {/* Thumb */}
                        <motion.div
                          variants={sliderThumbVariants}
                          whileHover="active"
                          whileTap="active"
                          className="absolute w-6 h-6 rounded-full border-2 border-white z-10 r54-personal-shopper-slider-thumb"
                          style={{
                            left: `${sliderPercent}%`,
                            transform: 'translateX(-50%)',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            boxShadow: '0 2px 10px rgba(16, 185, 129, 0.4)',
                          }}
                        />
                        {/* Labels */}
                        {budgetLevels.map((lvl) => {
                          const pct = ((lvl.value - budgetLevels[0].value) / (budgetLevels[budgetLevels.length - 1].value - budgetLevels[0].value)) * 100
                          return (
                            <span
                              key={lvl.value}
                              className="absolute text-[10px] text-muted-foreground -bottom-0.5"
                              style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
                            >
                              {lvl.label}
                            </span>
                          )
                        })}
                      </div>
                    </div>

                    <motion.div whileTap={{ scale: 0.95 }} className="mt-6 flex justify-center">
                      <motion.div whileHover={{ scale: 1.04 }}>
                        <button
                          onClick={() => {
                            setChatHistory((prev) => [
                              ...prev,
                              { id: `msg-${Date.now()}`, text: activeBudgetLabel, sender: 'user' as const, timestamp: Date.now() },
                            ])
                            setTimeout(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)), 400)
                          }}
                          className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-2 r54-personal-shopper-next-btn"
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                          }}
                        >
                          Próximo
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 2: Occasion */}
                {step === 2 && (
                  <motion.div
                    key="step-occasion"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-2"
                  >
                    {occasionOptions.map((occ) => (
                      <motion.button
                        key={occ.id}
                        variants={cardVariants}
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleOccasionSelect(occ.id)}
                        className="p-3 rounded-xl border text-left transition-all r54-personal-shopper-occasion-card"
                        style={{
                          borderColor: selectedOccasion === occ.id ? '#f59e0b' : 'rgba(0,0,0,0.08)',
                          background: selectedOccasion === occ.id
                            ? 'rgba(245, 158, 11, 0.08)'
                            : 'white',
                          boxShadow: selectedOccasion === occ.id
                            ? '0 4px 16px rgba(245, 158, 11, 0.25)'
                            : '0 1px 3px rgba(0,0,0,0.04)',
                        }}
                      >
                        <span className="text-2xl block mb-1">{occ.emoji}</span>
                        <span className="text-xs font-bold block">{occ.label}</span>
                        <span className="text-[10px] text-muted-foreground">{occ.description}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {/* Step 3: Color Preference */}
                {step === 3 && (
                  <motion.div
                    key="step-colors"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2"
                  >
                    <motion.div
                      className="flex flex-wrap justify-center gap-2.5 mb-5"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {colorSwatches.map((swatch) => {
                        const isSelected = selectedColors.has(swatch.id)
                        return (
                          <motion.button
                            key={swatch.id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.15, y: -3 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleColorToggle(swatch.id)}
                            className="relative flex flex-col items-center gap-1 r54-personal-shopper-color-btn"
                          >
                            <div
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all r54-personal-shopper-color-swatch"
                              style={{
                                borderColor: isSelected ? '#10b981' : 'rgba(0,0,0,0.1)',
                                background: swatch.hex,
                                boxShadow: isSelected
                                  ? '0 0 0 3px rgba(16, 185, 129, 0.25), 0 4px 12px rgba(0,0,0,0.15)'
                                  : '0 1px 3px rgba(0,0,0,0.1)',
                              }}
                            >
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                                  className="absolute inset-0 flex items-center justify-center"
                                >
                                  <Check className="h-4 w-4" style={{ color: swatch.id === 'white' ? '#1a1a2e' : 'white' }} />
                                </motion.div>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium">{swatch.name}</span>
                          </motion.button>
                        )
                      })}
                    </motion.div>

                    <motion.div whileTap={{ scale: 0.95 }} className="flex justify-center">
                      <motion.div whileHover={{ scale: 1.04 }}>
                        <button
                          onClick={handleColorConfirm}
                          className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-2 r54-personal-shopper-next-btn"
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                          }}
                        >
                          Confirmar cores ({selectedColors.size})
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 4: Outfit Type */}
                {step === 4 && (
                  <motion.div
                    key="step-outfit"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-2 gap-2.5 mt-2"
                  >
                    {outfitTypes.map((type) => (
                      <motion.button
                        key={type.id}
                        variants={cardVariants}
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleOutfitSelect(type.id)}
                        className="p-3 rounded-xl border text-center transition-all r54-personal-shopper-outfit-card"
                        style={{
                          borderColor: selectedOutfitType === type.id ? '#8b5cf6' : 'rgba(0,0,0,0.08)',
                          background: selectedOutfitType === type.id
                            ? 'rgba(139, 92, 246, 0.08)'
                            : 'white',
                          boxShadow: selectedOutfitType === type.id
                            ? '0 4px 16px rgba(139, 92, 246, 0.25)'
                            : '0 1px 3px rgba(0,0,0,0.04)',
                        }}
                      >
                        <span className="text-2xl block mb-1">{type.emoji}</span>
                        <span className="text-xs font-bold">{type.label}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {/* Step 5: Generating */}
                {step === TOTAL_STEPS - 1 && isGenerating && (
                  <motion.div
                    key="step-generating"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center py-10"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="h-8 w-8" style={{ color: '#10b981' }} />
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-2 mt-4"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Sparkles className="h-4 w-4" style={{ color: '#f59e0b' }} />
                      <span className="text-sm font-medium">Montando suas recomendações...</span>
                      <Sparkles className="h-4 w-4" style={{ color: '#f59e0b' }} />
                    </motion.div>
                    <div className="flex gap-1.5 mt-4">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: '#10b981' }}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ── Results ── */}
          {started && showResults && (
            <motion.div
              variants={recommendationGridVariants}
              initial="hidden"
              animate="visible"
              ref={confettiRef}
              className="space-y-5 relative"
            >
              {/* Confetti burst */}
              <MiniConfetti />

              {/* Results header */}
              <motion.div variants={recommendationCardVariants} className="text-center pt-2">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <ShopperAvatar size={36} />
                  <h3 className="text-base sm:text-lg font-bold">Suas Recomendações</h3>
                  <Star className="h-4 w-4" style={{ color: '#f59e0b' }} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Selecionado especialmente para você com base no seu perfil
                </p>

                {/* Summary tags */}
                <motion.div
                  variants={containerVariants}
                  className="flex flex-wrap justify-center gap-1.5 mt-3"
                  initial="hidden"
                  animate="visible"
                >
                  {selectedStyle && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold r54-personal-shopper-tag"
                      style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                    >
                      {styleOptions.find((s) => s.id === selectedStyle)?.emoji}{' '}
                      {styleOptions.find((s) => s.id === selectedStyle)?.label}
                    </span>
                  )}
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold r54-personal-shopper-tag"
                    style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.2)' }}
                  >
                    💰 {formatBRL(selectedBudget)}
                  </span>
                  {selectedOccasion && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold r54-personal-shopper-tag"
                      style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed', border: '1px solid rgba(139, 92, 246, 0.2)' }}
                    >
                      {occasionOptions.find((o) => o.id === selectedOccasion)?.emoji}{' '}
                      {occasionOptions.find((o) => o.id === selectedOccasion)?.label}
                    </span>
                  )}
                </motion.div>
              </motion.div>

              {/* ── Outfit Suggestions ── */}
              {relevantOutfits.length > 0 && (
                <motion.div variants={recommendationCardVariants}>
                  <h4 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" style={{ color: '#8b5cf6' }} />
                    Sugestões de Look
                  </h4>
                  <div className="space-y-2.5">
                    {relevantOutfits.map((outfit) => (
                      <motion.div
                        key={outfit.id}
                        variants={outfitCardVariants}
                        whileHover={{ x: 4 }}
                        className="flex gap-3 p-3 rounded-xl border r54-personal-shopper-outfit-card-result"
                        style={{
                          borderColor: 'rgba(139, 92, 246, 0.15)',
                          background: 'rgba(139, 92, 246, 0.04)',
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg r54-personal-shopper-outfit-icon"
                          style={{ background: 'rgba(139, 92, 246, 0.1)' }}
                        >
                          {outfit.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold">{outfit.name}</p>
                          <p className="text-[10px] text-muted-foreground">{outfit.description}</p>
                          {/* Mini product thumbnails */}
                          <div className="flex gap-1.5 mt-2">
                            {outfit.products.map((pid) => {
                              const prod = mockProducts.find((mp) => mp.id === pid)
                              const img = prod ? resolveProductImage({ slug: prod.slug, category: prod.category, images: prod.images }) : null
                              const emoji = prod ? (categoryEmojis[prod.category] || '📦') : '📦'
                              return (
                                <div
                                  key={pid}
                                  className="w-8 h-8 rounded-md overflow-hidden border flex-shrink-0 r54-personal-shopper-outfit-thumb"
                                  style={{ borderColor: 'rgba(0,0,0,0.06)' }}
                                >
                                  {img ? (
                                    <img src={img} alt={prod?.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs">{emoji}</div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        <motion.div whileTap={{ scale: 0.9 }} className="self-center">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Product Grid ── */}
              <motion.div variants={recommendationCardVariants}>
                <h4 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                  <ShoppingBag className="h-4 w-4" style={{ color: '#10b981' }} />
                  Produtos Recomendados
                </h4>

                {recommendedProducts.length > 0 ? (
                  <motion.div
                    variants={recommendationGridVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5"
                  >
                    {recommendedProducts.map((product) => {
                      const imageUrl = resolveProductImage({
                        slug: product.slug,
                        category: product.category,
                        images: product.images,
                      })
                      const emoji = categoryEmojis[product.category] || '📦'
                      const isFav = favorites.has(product.id)

                      return (
                        <motion.div
                          key={product.id}
                          variants={recommendationCardVariants}
                          whileHover={{
                            scale: 1.03,
                            y: -4,
                            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.1)',
                          }}
                          className="bg-white rounded-xl border overflow-hidden group r54-personal-shopper-product-card"
                          style={{ borderColor: 'rgba(0,0,0,0.06)' }}
                        >
                          {/* Image */}
                          <div
                            className="relative aspect-square overflow-hidden r54-personal-shopper-product-img"
                            style={{ background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.06), rgba(245, 158, 11, 0.04))' }}
                          >
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-3xl">{emoji}</span>
                              </div>
                            )}

                            {/* AI pick badge */}
                            <motion.div
                              variants={confettiBurstVariants}
                              className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold text-white flex items-center gap-0.5 r54-personal-shopper-pick-badge"
                              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)' }}
                            >
                              <Sparkles className="h-2.5 w-2.5" />
                              AI Pick
                            </motion.div>

                            {/* Favorite button */}
                            <motion.button
                              whileTap={{ scale: 0.8 }}
                              onClick={() => handleToggleFavorite(product.id)}
                              className="absolute top-1.5 right-1.5 w-7 h-7 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center transition-colors r54-personal-shopper-fav-btn"
                              style={{
                                background: isFav ? 'rgba(239, 68, 68, 0.9)' : 'rgba(255, 255, 255, 0.85)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              }}
                            >
                              <AnimatePresence mode="wait">
                                {isFav ? (
                                  <motion.div key="filled" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                    <Heart className="h-3.5 w-3.5" fill="white" style={{ color: 'white' }} />
                                  </motion.div>
                                ) : (
                                  <motion.div key="outline" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                    <Heart className="h-3.5 w-3.5" style={{ color: '#9ca3af' }} />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.button>
                          </div>

                          {/* Info */}
                          <div className="p-2.5">
                            <p className="text-[10px] font-medium truncate" style={{ color: '#10b981' }}>
                              {product.storeName}
                            </p>
                            <h5 className="text-xs font-semibold line-clamp-2 leading-tight mt-0.5">{product.name}</h5>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-2.5 w-2.5" fill="#f59e0b" style={{ color: '#f59e0b' }} />
                              <span className="text-[10px] font-medium">{product.rating}</span>
                            </div>
                            <div className="mt-1.5">
                              <span className="text-sm font-extrabold" style={{ color: '#10b981' }}>
                                {formatBRL(product.price)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="text-4xl mb-2"
                    >
                      🔍
                    </motion.div>
                    <p className="text-sm font-medium text-muted-foreground">Nenhum produto encontrado</p>
                    <p className="text-xs text-muted-foreground mt-1">Tente aumentar o orçamento</p>
                  </motion.div>
                )}
              </motion.div>

              {/* ── Action Buttons ── */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap gap-2 justify-center pt-2 pb-2"
              >
                <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSavePreferences}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 border r54-personal-shopper-save-btn"
                    style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      color: '#10b981',
                      borderColor: 'rgba(16, 185, 129, 0.2)',
                    }}
                  >
                    <motion.div
                      initial={false}
                      animate={savedPrefs ? { rotate: 360 } : { rotate: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {savedPrefs ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </motion.div>
                    {savedPrefs ? 'Salvo!' : 'Salvar Preferências'}
                  </motion.button>
                </motion.div>

                <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleShare}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 border r54-personal-shopper-share-btn"
                    style={{
                      background: 'rgba(59, 130, 246, 0.08)',
                      color: '#3b82f6',
                      borderColor: 'rgba(59, 130, 246, 0.2)',
                    }}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Compartilhar
                  </motion.button>
                </motion.div>

                <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleStartOver}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 border r54-personal-shopper-restart-btn"
                    style={{
                      background: 'rgba(107, 114, 128, 0.08)',
                      color: '#6b7280',
                      borderColor: 'rgba(107, 114, 128, 0.2)',
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Recomeçar
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  )
}
