'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, Brain, GripVertical, Trophy, Timer, Zap, ChevronRight, Star, RotateCcw, Play, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

// ==================== TYPES ====================
type GameTab = 'memory' | 'quiz' | 'drag'

interface MemoryCard {
  id: number
  emoji: string
  name: string
  isFlipped: boolean
  isMatched: boolean
}

interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
}

interface DragItem {
  id: number
  name: string
  price: number
  rating: number
}

interface LeaderboardEntry {
  name: string
  points: number
  avatar: string
}

// ==================== MOCK DATA ====================
const GAME_EMOJIS = ['🍎', '🥑', '🍌', '🫐', '🥭', '🍍']
const PRODUCT_NAMES = ['Maçã Gala', 'Abacate', 'Banana', 'Mirtilo', 'Manga', 'Abacaxi']

const QUIZ_QUESTIONS: QuizQuestion[] = [
  { question: 'Qual fruta é conhecida como "ouro da Amazônia"?', options: ['Cupuaçu', 'Açaí', 'Graviola', 'Cajá'], correctIndex: 1 },
  { question: 'Quantas estrelas tem a constelação do Cruzeiro do Sul?', options: ['3', '5', '7', '9'], correctIndex: 1 },
  { question: 'Qual é a capital do Pará?', options: ['Manaus', 'Belém', 'Fortaleza', 'Salvador'], correctIndex: 1 },
  { question: 'Qual produto brasileiro é o mais exportado?', options: ['Café', 'Açúcar', 'Soja', 'Carne'], correctIndex: 2 },
  { question: 'Em qual mês começa o verão no Brasil?', options: ['Março', 'Junho', 'Dezembro', 'Setembro'], correctIndex: 2 },
  { question: 'Qual é a moeda oficial do Brasil?', options: ['Peso', 'Real', 'Dólar', 'Cruzado'], correctIndex: 1 },
  { question: 'Qual fruta é usada para fazer o doce "goiabada"?', options: ['Goiaba', 'Manga', 'Jabuticaba', 'Pitaya'], correctIndex: 0 },
  { question: 'Qual estado é o maior produtor de açaí?', options: ['Maranhão', 'Tocantins', 'Pará', 'Amapá'], correctIndex: 2 },
  { question: 'Qual é o bairro mais famoso de São Paulo?', options: ['Copacabana', 'Vila Madalena', 'Leblon', 'Ipanema'], correctIndex: 1 },
  { question: 'Quantas cores tem a bandeira do Brasil?', options: ['3', '4', '5', '6'], correctIndex: 1 },
]

const DRAG_ITEMS: DragItem[] = [
  { id: 1, name: 'Açaí 500ml', price: 15.00, rating: 4.9 },
  { id: 2, name: 'Arroz 5kg', price: 24.90, rating: 4.5 },
  { id: 3, name: 'Feijão 1kg', price: 8.90, rating: 4.3 },
  { id: 4, name: 'Pão Francês', price: 6.00, rating: 4.8 },
  { id: 5, name: 'Vitamina C', price: 35.00, rating: 4.7 },
]

const LEADERBOARD: LeaderboardEntry[] = [
  { name: 'Maria Silva', points: 2450, avatar: '👩‍🦰' },
  { name: 'João Santos', points: 2180, avatar: '👨‍🦱' },
  { name: 'Ana Costa', points: 1920, avatar: '👩‍🦳' },
  { name: 'Pedro Lima', points: 1750, avatar: '🧑' },
  { name: 'Você', points: 0, avatar: '😊' },
]

const GAME_TABS: { id: GameTab; label: string; icon: typeof Brain }[] = [
  { id: 'memory', label: 'Memória', icon: Brain },
  { id: 'quiz', label: 'Quiz', icon: Gamepad2 },
  { id: 'drag', label: 'Arraste e Solte', icon: GripVertical },
]

const springConfig = { type: 'spring' as const, stiffness: 400, damping: 25 }

// ==================== HELPER ====================
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function loadGamePoints(): number {
  if (typeof window === 'undefined') return 0
  try { return parseInt(localStorage.getItem('domplace-game-points') || '0', 10) } catch { return 0 }
}

function saveGamePoints(pts: number): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem('domplace-game-points', String(pts)) } catch { /* ignore */ }
}

// ==================== MEMORY GAME ====================
function useMemoryGame() {
  const [cards, setCards] = useState<MemoryCard[]>(() => {
    const pairs = GAME_EMOJIS.map((emoji, i) => [
      { id: i * 2, emoji, name: PRODUCT_NAMES[i], isFlipped: false, isMatched: false },
      { id: i * 2 + 1, emoji, name: PRODUCT_NAMES[i], isFlipped: false, isMatched: false },
    ]).flat()
    return shuffleArray(pairs)
  })
  const [moves, setMoves] = useState(0)
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [flippedIds, setFlippedIds] = useState<number[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const initGame = useCallback(() => {
    const pairs = GAME_EMOJIS.map((emoji, i) => [
      { id: i * 2, emoji, name: PRODUCT_NAMES[i], isFlipped: false, isMatched: false },
      { id: i * 2 + 1, emoji, name: PRODUCT_NAMES[i], isFlipped: false, isMatched: false },
    ]).flat()
    setCards(shuffleArray(pairs))
    setMoves(0)
    setMatchedPairs(0)
    setFlippedIds([])
    setIsChecking(false)
    setTimer(0)
    setIsRunning(false)
    setGameWon(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    if (isRunning && !gameWon) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isRunning, gameWon])

  const handleFlip = useCallback((id: number) => {
    if (isChecking || flippedIds.length >= 2) return
    const card = cards.find(c => c.id === id)
    if (!card || card.isFlipped || card.isMatched) return

    if (!isRunning) setIsRunning(true)
    const newFlipped = [...flippedIds, id]
    setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c))
    setFlippedIds(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      setIsChecking(true)
      const [first, second] = newFlipped
      const card1 = cards.find(c => c.id === first)
      const card2 = cards.find(c => c.id === second)

      if (card1?.emoji === card2?.emoji) {
        setMatchedPairs(mp => mp + 1)
        setCards(prev => prev.map(c =>
          c.id === first || c.id === second ? { ...c, isMatched: true } : c
        ))
        setFlippedIds([])
        setIsChecking(false)
        if (matchedPairs + 1 === GAME_EMOJIS.length) {
          setGameWon(true)
          setIsRunning(false)
          const pointsEarned = Math.max(100 - moves * 5, 10)
          const current = loadGamePoints()
          saveGamePoints(current + pointsEarned)
        }
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === first || c.id === second ? { ...c, isFlipped: false } : c
          ))
          setFlippedIds([])
          setIsChecking(false)
        }, 800)
      }
    }
  }, [cards, flippedIds, isChecking, isRunning, matchedPairs, moves])

  return { cards, moves, matchedPairs, timer, gameWon, handleFlip, initGame }
}

// ==================== QUIZ GAME ====================
function useQuizGame() {
  const [questionPool, setQuestionPool] = useState<QuizQuestion[]>(() => shuffleArray([...QUIZ_QUESTIONS]).slice(0, 10))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  const currentQuestion = questionPool[currentIndex]

  const handleAnswer = useCallback((index: number) => {
    if (isRevealed || !currentQuestion) return
    setSelectedAnswer(index)
    setIsRevealed(true)

    const isCorrect = index === currentQuestion.correctIndex
    if (isCorrect) {
      const newScore = score + 10 + streak * 2
      setScore(newScore)
      const newStreak = streak + 1
      setStreak(newStreak)
      if (newStreak > bestStreak) setBestStreak(newStreak)
    } else {
      setStreak(0)
    }

    if (currentIndex + 1 >= questionPool.length) {
      setTimeout(() => {
        setIsFinished(true)
        const current = loadGamePoints()
        saveGamePoints(current + score + (isCorrect ? 10 + streak * 2 : 0))
      }, 1200)
    }
  }, [isRevealed, currentQuestion, currentIndex, score, streak, bestStreak, questionPool.length])

  const nextQuestion = useCallback(() => {
    if (currentIndex + 1 < questionPool.length) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setIsRevealed(false)
    }
  }, [currentIndex, questionPool.length])

  const restart = useCallback(() => {
    setQuestionPool(shuffleArray([...QUIZ_QUESTIONS]).slice(0, 10))
    setCurrentIndex(0)
    setScore(0)
    setStreak(0)
    setBestStreak(0)
    setSelectedAnswer(null)
    setIsRevealed(false)
    setIsFinished(false)
  }, [])

  return { currentQuestion, currentIndex, selectedAnswer, isRevealed, score, streak, bestStreak, isFinished, totalQuestions: questionPool.length, handleAnswer, nextQuestion, restart }
}

// ==================== DRAG SORT GAME ====================
function useDragSortGame() {
  const [items, setItems] = useState<DragItem[]>(() => {
    const shuffled = shuffleArray([...DRAG_ITEMS])
    const sorted = [...shuffled].sort((a, b) => a.price - b.price)
    if (shuffled.every((item, i) => item.id === sorted[i].id) && shuffled.length >= 2) {
      ;[shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]]
    }
    return shuffled
  })
  const [sortMode, setSortMode] = useState<'price' | 'rating'>('price')
  const [isComplete, setIsComplete] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const dragItemRef = useRef<HTMLDivElement>(null)

  const initGame = useCallback((mode: 'price' | 'rating') => {
    setSortMode(mode)
    const shuffled = shuffleArray([...DRAG_ITEMS])
    const sorted = [...shuffled].sort((a, b) => mode === 'price' ? a.price - b.price : b.rating - a.rating)
    if (shuffled.every((item, i) => item.id === sorted[i].id)) {
      if (shuffled.length >= 2) {
        ;[shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]]
      }
    }
    setItems(shuffled)
    setIsComplete(false)
    setDragIndex(null)
  }, [])

  const checkOrder = useCallback((currentItems: DragItem[], mode: 'price' | 'rating') => {
    const sorted = [...currentItems].sort((a, b) => mode === 'price' ? a.price - b.price : b.rating - a.rating)
    return currentItems.every((item, i) => item.id === sorted[i].id)
  }, [])

  const swapItems = useCallback((from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return
    const newItems = [...items]
    const temp = newItems[from]
    newItems[from] = newItems[to]
    newItems[to] = temp
    setItems(newItems)
    if (checkOrder(newItems, sortMode)) {
      setIsComplete(true)
      const current = loadGamePoints()
      saveGamePoints(current + 50)
    }
  }, [items, sortMode, checkOrder])

  const handleDragStart = useCallback((index: number) => { setDragIndex(index) }, [])
  const handleDragEnd = useCallback(() => { setDragIndex(null) }, [])

  const handleDrop = useCallback((targetIndex: number) => {
    if (dragIndex !== null && dragIndex !== targetIndex) {
      swapItems(dragIndex, targetIndex)
    }
    setDragIndex(null)
  }, [dragIndex, swapItems])

  const handleTouchStart = useCallback((e: React.TouchEvent, index: number) => {
    setDragIndex(index)
    setTouchStartY(e.touches[0].clientY)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent, index: number) => {
    if (touchStartY === null || dragIndex === null || !dragItemRef.current) return
    e.preventDefault()
    const currentY = e.touches[0].clientY
    const delta = currentY - touchStartY
    const itemHeight = 64
    const offset = Math.round(delta / itemHeight)
    if (offset !== 0) {
      const targetIndex = Math.max(0, Math.min(items.length - 1, index + offset))
      if (targetIndex !== index && targetIndex !== dragIndex) {
        swapItems(dragIndex, targetIndex)
        setDragIndex(targetIndex)
        setTouchStartY(currentY)
      }
    }
  }, [touchStartY, dragIndex, items.length, swapItems])

  const handleTouchEnd = useCallback(() => {
    setDragIndex(null)
    setTouchStartY(null)
  }, [])

  return { items, sortMode, isComplete, dragIndex, dragItemRef, initGame, handleDragStart, handleDragEnd, handleDrop, handleTouchStart, handleTouchMove, handleTouchEnd }
}

// ==================== CONFETTI PARTICLES ====================
function ConfettiEffect() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)],
    size: 4 + Math.random() * 6,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ width: p.size, height: p.size, backgroundColor: p.color, left: `${p.x}%` }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: 400, opacity: 0, rotate: 360 }}
          transition={{ duration: 1.5 + Math.random(), delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

// ==================== STAR RATING MINI ====================
function MiniStars({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`}
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  )
}

// ==================== ANIMATED POINTS COUNTER ====================
function AnimatedPoints({ points }: { points: number }) {
  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-amber-600/10 dark:from-amber-500/20 dark:to-amber-600/20 rounded-xl px-4 py-2 border border-amber-500/20">
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      >
        <Zap className="h-5 w-5 text-amber-500" />
      </motion.div>
      <div>
        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Seus Pontos</p>
        <motion.p
          key={points}
          initial={{ scale: 1.3, color: 'rgb(16, 185, 129)' }}
          animate={{ scale: 1, color: 'rgb(245, 158, 11)' }}
          transition={{ duration: 0.4, type: 'spring' as const, stiffness: 300 }}
          className="text-lg font-bold text-amber-600 dark:text-amber-400"
        >
          {points.toLocaleString('pt-BR')}
        </motion.p>
      </div>
    </div>
  )
}

// ==================== LEADERBOARD ====================
function MiniLeaderboard({ userPoints }: { userPoints: number }) {
  const sorted = [...LEADERBOARD].sort((a, b) => b.points - a.points).map(e =>
    e.name === 'Você' ? { ...e, points: userPoints } : e
  ).sort((a, b) => b.points - a.points)

  return (
    <div className="bg-card/60 dark:bg-card/40 rounded-xl p-4 border border-border/50 r62-card-lift">
      <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
        <Trophy className="h-4 w-4 text-amber-500" />
        Ranking Semanal
      </h3>
      <div className="space-y-2">
        {sorted.map((entry, i) => (
          <motion.div
            key={entry.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`flex items-center gap-2.5 p-2 rounded-lg ${entry.name === 'Você' ? 'bg-primary/10 border border-primary/20' : ''}`}
          >
            <span className="text-base">{entry.avatar}</span>
            <span className="flex-1 text-xs font-medium truncate">{entry.name}</span>
            <span className="text-xs font-bold text-primary">{entry.points.toLocaleString('pt-BR')}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ==================== MEMORY GAME UI ====================
function MemoryGameUI({ cards, moves, matchedPairs, timer, gameWon, onFlip, onRestart }: {
  cards: MemoryCard[]; moves: number; matchedPairs: number; timer: number; gameWon: boolean; onFlip: (id: number) => void; onRestart: () => void
}) {
  return (
    <div className="relative">
      {gameWon && <ConfettiEffect />}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-[10px] gap-1">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
              <RotateCcw className="h-3 w-3" />
            </motion.div>
            {moves} jogadas
          </Badge>
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Timer className="h-3 w-3" />
            {timer}s
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {matchedPairs}/{GAME_EMOJIS.length} pares
          <motion.div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${(matchedPairs / GAME_EMOJIS.length) * 100}%` }}
              transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
            />
          </motion.div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameWon ? (
          <motion.div
            key="won"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: 2 }}
              className="text-5xl mb-3"
            >
              🎉
            </motion.div>
            <h3 className="text-lg font-bold mb-1">Parabéns!</h3>
            <p className="text-sm text-muted-foreground mb-4">Você completou em {moves} jogadas e {timer}s</p>
            <Button onClick={onRestart} className="gap-2 btn-glow bg-primary hover:bg-primary/90 text-primary-foreground r61-game-glow">
              <Play className="h-4 w-4" /> Jogar Novamente
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {cards.map((card, i) => (
              <motion.button
                key={card.id}
                onClick={() => onFlip(card.id)}
                className={`aspect-square rounded-xl text-2xl sm:text-3xl flex items-center justify-center relative overflow-hidden transition-colors ${
                  card.isMatched
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-400 dark:border-emerald-600'
                    : card.isFlipped
                      ? 'bg-primary/10 dark:bg-primary/20 border-2 border-primary'
                      : 'bg-gradient-to-br from-primary to-emerald-600 dark:from-emerald-700 dark:to-teal-700 border-2 border-primary/20 hover:border-primary/50'
                }`}
                whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.05 } : {}}
                whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, ...springConfig }}
              >
                <AnimatePresence mode="wait">
                  {(card.isFlipped || card.isMatched) ? (
                    <motion.span
                      key="front"
                      initial={{ rotateY: 90, scale: 0 }}
                      animate={{ rotateY: 0, scale: 1 }}
                      exit={{ rotateY: -90, scale: 0 }}
                      transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                    >
                      {card.emoji}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="back"
                      initial={{ rotateY: -90, scale: 0 }}
                      animate={{ rotateY: 0, scale: 1 }}
                      exit={{ rotateY: 90, scale: 0 }}
                      transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                      className="text-white/60 text-lg sm:text-xl"
                    >
                      ?
                    </motion.span>
                  )}
                </AnimatePresence>
                {card.isMatched && (
                  <motion.div
                    className="absolute inset-0 bg-emerald-500/20 rounded-xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' as const }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== QUIZ GAME UI ====================
function QuizGameUI({ currentQuestion, currentIndex, selectedAnswer, isRevealed, score, streak, bestStreak, isFinished, totalQuestions, onAnswer, onNext, onRestart }: {
  currentQuestion: QuizQuestion | undefined; currentIndex: number; selectedAnswer: number | null; isRevealed: boolean; score: number; streak: number; bestStreak: number; isFinished: boolean; totalQuestions: number; onAnswer: (i: number) => void; onNext: () => void; onRestart: () => void
}) {
  if (isFinished) {
    return (
      <div className="relative">
        <ConfettiEffect />
        <div className="text-center py-6">
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.5, repeat: 2 }} className="text-4xl mb-3">🏆</motion.div>
          <h3 className="text-lg font-bold mb-1">Quiz Finalizado!</h3>
          <p className="text-2xl font-bold text-primary mb-1">{score} pontos</p>
          <p className="text-xs text-muted-foreground mb-1">Melhor sequência: {bestStreak} acertos seguidos</p>
          <Button onClick={onRestart} className="mt-4 gap-2 btn-glow bg-primary hover:bg-primary/90 text-primary-foreground r61-game-glow">
            <RotateCcw className="h-4 w-4" /> Jogar Novamente
          </Button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Badge variant="secondary" className="text-[10px]">
          Pergunta {currentIndex + 1}/{totalQuestions}
        </Badge>
        <div className="flex items-center gap-2">
          {streak > 1 && (
            <motion.span
              key={streak}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-xs font-bold text-amber-500"
            >
              🔥 Sequência: {streak}
            </motion.span>
          )}
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
            {score}
          </Badge>
        </div>
      </div>

      <div className="h-1.5 w-full rounded-full bg-secondary mb-4 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-sm font-semibold mb-4">{currentQuestion.question}</h3>
        <div className="space-y-2">
          {currentQuestion.options.map((option, i) => {
            let bgClass = 'bg-card hover:bg-secondary/50 border-border/50'
            if (isRevealed) {
              if (i === currentQuestion.correctIndex) bgClass = 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-600'
              else if (i === selectedAnswer && i !== currentQuestion.correctIndex) bgClass = 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-600'
            }

            return (
              <motion.button
                key={i}
                onClick={() => onAnswer(i)}
                disabled={isRevealed}
                className={`w-full text-left p-3 rounded-xl border-2 text-sm font-medium transition-all ${bgClass}`}
                whileHover={!isRevealed ? { scale: 1.01, x: 4 } : {}}
                whileTap={!isRevealed ? { scale: 0.98 } : {}}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {isRevealed && i === currentQuestion.correctIndex && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-600">✓</motion.span>
                  )}
                  {isRevealed && i === selectedAnswer && i !== currentQuestion.correctIndex && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-red-600">✗</motion.span>
                  )}
                </span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {isRevealed && currentIndex + 1 < totalQuestions && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex justify-end"
        >
          <Button onClick={onNext} className="gap-1.5 btn-glow bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
            Próxima Pergunta <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  )
}

// ==================== DRAG SORT GAME UI ====================
function DragSortGameUI({ items, sortMode, isComplete, dragIndex, dragItemRef, onInitGame, onDragStart, onDragEnd, onDrop, onTouchStart, onTouchMove, onTouchEnd }: {
  items: DragItem[]; sortMode: 'price' | 'rating'; isComplete: boolean; dragIndex: number | null; dragItemRef: React.RefObject<HTMLDivElement | null>; onInitGame: (mode: 'price' | 'rating') => void; onDragStart: (i: number) => void; onDragEnd: () => void; onDrop: (i: number) => void; onTouchStart: (e: React.TouchEvent, i: number) => void; onTouchMove: (e: React.TouchEvent, i: number) => void; onTouchEnd: () => void
}) {
  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  const label = sortMode === 'price' ? 'menor preço → maior preço' : 'melhor avaliação → pior avaliação'

  return (
    <div className="relative">
      {isComplete && <ConfettiEffect />}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] text-muted-foreground">Ordene por: <span className="font-semibold text-foreground">{label}</span></p>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={sortMode === 'price' ? 'default' : 'outline'}
            className="h-7 min-h-[44px] text-[10px] px-2"
            onClick={() => onInitGame('price')}
          >
            💰 Preço
          </Button>
          <Button
            size="sm"
            variant={sortMode === 'rating' ? 'default' : 'outline'}
            className="h-7 min-h-[44px] text-[10px] px-2"
            onClick={() => onInitGame('rating')}
          >
            ⭐ Avaliação
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isComplete ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: 2 }} className="text-4xl mb-3">🎯</motion.div>
            <h3 className="text-lg font-bold mb-1">Perfeito!</h3>
            <p className="text-sm text-muted-foreground mb-4">Ordem correta!</p>
            <Button onClick={() => onInitGame(sortMode)} className="gap-2 btn-glow bg-primary hover:bg-primary/90 text-primary-foreground r61-game-glow">
              <Play className="h-4 w-4" /> Tentar Novamente
            </Button>
          </motion.div>
        ) : (
          <motion.div key="items" className="space-y-2" layout>
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                ref={dragIndex === i ? dragItemRef : undefined}
                layout
                draggable
                onDragStart={() => onDragStart(i)}
                onDragEnd={onDragEnd}
                onDragOver={(e) => { e.preventDefault() }}
                onDrop={() => onDrop(i)}
                onTouchStart={(e) => onTouchStart(e, i)}
                onTouchMove={(e) => onTouchMove(e, i)}
                onTouchEnd={onTouchEnd}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-grab active:cursor-grabbing transition-colors ${
                  dragIndex === i
                    ? 'border-primary bg-primary/5 shadow-lg z-10'
                    : isComplete
                      ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-border/50 bg-card hover:border-primary/30 hover:shadow-md'
                }`}
                whileHover={!isComplete ? { scale: 1.01 } : {}}
                style={{ touchAction: 'none' }}
              >
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-primary font-bold">{formatBRL(item.price)}</span>
                    <MiniStars rating={item.rating} size={10} />
                  </div>
                </div>
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== LOADING SKELETON ====================
function GameZoneSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <Skeleton className="h-7 w-48 mb-4" />
      <Skeleton className="h-10 w-full mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
      </div>
      <div className="flex gap-4">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
        <Skeleton className="w-48 h-40 rounded-xl" />
      </div>
    </div>
  )
}

// ==================== MAIN COMPONENT ====================
export function InteractiveGameZone() {
  const [activeTab, setActiveTab] = useState<GameTab>('memory')
  const [totalPoints, setTotalPoints] = useState(() => loadGamePoints())
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 600)
    return () => clearTimeout(t)
  }, [])

  // Listen for storage changes from games
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalPoints(loadGamePoints())
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const memoryGame = useMemoryGame()
  const quizGame = useQuizGame()
  const dragGame = useDragSortGame()

  if (!isLoaded) return <GameZoneSkeleton />

  return (
    <section className="glass-card rounded-2xl p-5 r27-game-zone r62-card-lift relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-md"
          >
            <Gamepad2 className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-base font-bold flex items-center gap-1.5 r62-heading-gradient">
              Zona de Jogos
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            </h2>
            <p className="text-[10px] text-muted-foreground">Jogue e ganhe pontos de fidelidade</p>
          </div>
        </div>
        <AnimatedPoints points={totalPoints} />
      </div>

      {/* Tab selector with animated indicator */}
      <div className="relative flex bg-secondary/50 dark:bg-secondary/30 rounded-xl p-1 mb-5">
        {GAME_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 relative z-10 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === tab.id ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
        <motion.div
          layoutId="game-tab-indicator"
          className="absolute top-1 bottom-1 bg-primary rounded-lg shadow-md"
          style={{
            width: `calc(100% / 3)`,
            left: `${GAME_TABS.findIndex(t => t.id === activeTab) * 33.333}%`,
          }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
        />
      </div>

      {/* Game area + leaderboard layout */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Game area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === 'memory' && (
              <motion.div
                key="memory"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <MemoryGameUI
                  cards={memoryGame.cards}
                  moves={memoryGame.moves}
                  matchedPairs={memoryGame.matchedPairs}
                  timer={memoryGame.timer}
                  gameWon={memoryGame.gameWon}
                  onFlip={memoryGame.handleFlip}
                  onRestart={memoryGame.initGame}
                />
              </motion.div>
            )}
            {activeTab === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <QuizGameUI
                  currentQuestion={quizGame.currentQuestion}
                  currentIndex={quizGame.currentIndex}
                  selectedAnswer={quizGame.selectedAnswer}
                  isRevealed={quizGame.isRevealed}
                  score={quizGame.score}
                  streak={quizGame.streak}
                  bestStreak={quizGame.bestStreak}
                  isFinished={quizGame.isFinished}
                  totalQuestions={quizGame.totalQuestions}
                  onAnswer={quizGame.handleAnswer}
                  onNext={quizGame.nextQuestion}
                  onRestart={quizGame.restart}
                />
              </motion.div>
            )}
            {activeTab === 'drag' && (
              <motion.div
                key="drag"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <DragSortGameUI
                  items={dragGame.items}
                  sortMode={dragGame.sortMode}
                  isComplete={dragGame.isComplete}
                  dragIndex={dragGame.dragIndex}
                  dragItemRef={dragGame.dragItemRef}
                  onInitGame={dragGame.initGame}
                  onDragStart={dragGame.handleDragStart}
                  onDragEnd={dragGame.handleDragEnd}
                  onDrop={dragGame.handleDrop}
                  onTouchStart={dragGame.handleTouchStart}
                  onTouchMove={dragGame.handleTouchMove}
                  onTouchEnd={dragGame.handleTouchEnd}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Leaderboard sidebar */}
        <div className="w-full lg:w-52 shrink-0">
          <MiniLeaderboard userPoints={totalPoints} />
        </div>
      </div>
    </section>
  )
}
