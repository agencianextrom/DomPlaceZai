'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Clock, Trophy, Flame, Sparkles, ChevronRight, BarChart3, Users, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { fireConfetti } from '@/lib/confetti'

/* ═══════════════════════════════════════════════════════════════
   Poll types
   ═══════════════════════════════════════════════════════════════ */
interface PollOption {
  id: string
  text: string
  emoji: string
}

interface PollData {
  id: string
  question: string
  options: PollOption[]
  totalVotes: number
  startDate: string
  endDate: string
  category: string
}

interface VotedPoll {
  pollId: string
  votedOptionId: string
  votedAt: string
}

/* ═══════════════════════════════════════════════════════════════
   Weekly poll dataset — rotates weekly
   ═══════════════════════════════════════════════════════════════ */
const weeklyPolls: PollData[] = [
  {
    id: 'poll-1',
    question: 'Qual categoria de produto você mais compra no DomPlace?',
    options: [
      { id: 'opt-1a', text: 'Alimentação', emoji: '🍚' },
      { id: 'opt-1b', text: 'Saúde & Bem-estar', emoji: '💊' },
      { id: 'opt-1c', text: 'Agricultura', emoji: '🌿' },
      { id: 'opt-1d', text: 'Eletrônicos', emoji: '📱' },
    ],
    totalVotes: 342,
    startDate: '2025-01-06',
    endDate: '2025-01-12',
    category: 'compras',
  },
  {
    id: 'poll-2',
    question: 'O que você mais valoriza ao escolher uma loja?',
    options: [
      { id: 'opt-2a', text: 'Preço baixo', emoji: '💰' },
      { id: 'opt-2b', text: 'Entrega rápida', emoji: '🚀' },
      { id: 'opt-2c', text: 'Atendimento bom', emoji: '😊' },
    ],
    totalVotes: 256,
    startDate: '2025-01-13',
    endDate: '2025-01-19',
    category: 'preferencias',
  },
  {
    id: 'poll-3',
    question: 'Qual horário prefere receber suas entregas?',
    options: [
      { id: 'opt-3a', text: 'Manhã (6h-12h)', emoji: '🌅' },
      { id: 'opt-3b', text: 'Tarde (12h-18h)', emoji: '☀️' },
      { id: 'opt-3c', text: 'Noite (18h-22h)', emoji: '🌙' },
      { id: 'opt-3d', text: 'Qualquer horário', emoji: '⏰' },
    ],
    totalVotes: 189,
    startDate: '2025-01-20',
    endDate: '2025-01-26',
    category: 'entrega',
  },
  {
    id: 'poll-4',
    question: 'Qual serviço do DomPlace você gostaria de ver?',
    options: [
      { id: 'opt-4a', text: 'Programa de cashback', emoji: '💳' },
      { id: 'opt-4b', text: 'Agendamento de entregas', emoji: '📅' },
      { id: 'opt-4c', text: 'Assinatura mensal', emoji: '📦' },
    ],
    totalVotes: 412,
    startDate: '2025-01-27',
    endDate: '2025-02-02',
    category: 'sugestoes',
  },
  {
    id: 'poll-5',
    question: 'Qual forma de pagamento você usa mais?',
    options: [
      { id: 'opt-5a', text: 'PIX', emoji: '⚡' },
      { id: 'opt-5b', text: 'Cartão de crédito', emoji: '💳' },
      { id: 'opt-5c', text: 'Dinheiro', emoji: '💵' },
      { id: 'opt-5d', text: 'Cartão de débito', emoji: '🏦' },
    ],
    totalVotes: 528,
    startDate: '2025-02-03',
    endDate: '2025-02-09',
    category: 'pagamento',
  },
]

/* ═══════════════════════════════════════════════════════════════
   Simulated vote distribution per poll (deterministic pseudo-random)
   ═══════════════════════════════════════════════════════════════ */
function getSimulatedVotes(poll: PollData): Record<string, number> {
  const votes: Record<string, number> = {}
  let remaining = poll.totalVotes
  poll.options.forEach((opt, i) => {
    if (i === poll.options.length - 1) {
      votes[opt.id] = remaining
    } else {
      // Deterministic hash-based distribution
      const hash = (opt.id.charCodeAt(4) * 31 + poll.id.charCodeAt(5) * 17) % 100
      const share = Math.max(1, Math.floor(poll.totalVotes * (hash / 100)))
      votes[opt.id] = share
      remaining -= share
    }
  })
  return votes
}

/* ═══════════════════════════════════════════════════════════════
   Animation variants
   ═══════════════════════════════════════════════════════════════ */
const optionContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const optionVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 22 },
  },
}

const voteSpringVariants = {
  initial: { scale: 1 },
  voted: {
    scale: [1, 1.04, 0.98, 1],
    transition: { type: 'spring' as const, stiffness: 400, damping: 14, duration: 0.6 },
  },
}

const resultBarVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: (i: number) => ({
    scaleX: 1,
    opacity: 1,
    transition: {
      delay: 0.1 + i * 0.12,
      duration: 0.8,
      ease: 'easeOut' as const,
    },
  }),
}

const avatarStackVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.6 },
  },
}

const avatarItemVariants = {
  hidden: { opacity: 0, scale: 0, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 400, damping: 18 },
  },
}

/* ═══════════════════════════════════════════════════════════════
   LocalStorage helpers
   ═══════════════════════════════════════════════════════════════ */
function getVotedPolls(): VotedPoll[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('domplace-poll-history')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveVote(pollId: string, optionId: string): void {
  const history = getVotedPolls()
  history.push({ pollId, votedOptionId: optionId, votedAt: new Date().toISOString() })
  if (typeof window !== 'undefined') {
    localStorage.setItem('domplace-poll-history', JSON.stringify(history))
  }
}

function hasVoted(pollId: string): VotedPoll | undefined {
  return getVotedPolls().find((v) => v.pollId === pollId)
}

/* ═══════════════════════════════════════════════════════════════
   AnimatedCounter — animates from 0 to target number
   ═══════════════════════════════════════════════════════════════ */
function AnimatedCounter({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const prevRef = useRef(0)

  useEffect(() => {
    const start = prevRef.current
    const end = value
    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
    prevRef.current = value
  }, [value, duration])

  return <span>{display}</span>
}

/* ═══════════════════════════════════════════════════════════════
   CountdownTimer — "Próxima Enquete" countdown
   ═══════════════════════════════════════════════════════════════ */
function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calculate = () => {
      const now = new Date()
      const end = new Date(endDate)
      const diff = Math.max(0, end.getTime() - now.getTime())
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    calculate()
    const timer = setInterval(calculate, 1000)
    return () => clearInterval(timer)
  }, [endDate])

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 12
  const isVeryUrgent = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes < 30

  return (
    <div className={`flex items-center gap-2 text-[10px] text-muted-foreground ${isVeryUrgent ? 'r39-poll-countdown-pulse' : ''}`}>
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' as const }}
      >
        <Clock className={`h-3 w-3 ${isUrgent ? 'text-amber-500' : ''}`} />
      </motion.div>
      <span>Próxima enquete:</span>
      <div className="flex items-center gap-0.5 font-mono font-bold">
        {timeLeft.days > 0 && (
          <>
            <span className={isVeryUrgent ? 'r39-poll-countdown-urgent' : isUrgent ? 'text-amber-600 dark:text-amber-400' : ''}>{timeLeft.days}d</span>
            <span className="mx-0.5">:</span>
          </>
        )}
        <span className={isVeryUrgent ? 'r39-poll-countdown-urgent' : isUrgent ? 'text-amber-600 dark:text-amber-400' : ''}>{String(timeLeft.hours).padStart(2, '0')}</span>
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' as const }}
        >
          :
        </motion.span>
        <span className={isVeryUrgent ? 'r39-poll-countdown-urgent' : isUrgent ? 'text-amber-600 dark:text-amber-400' : ''}>{String(timeLeft.minutes).padStart(2, '0')}</span>
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.3 }}
        >
          :
        </motion.span>
        <span className={isVeryUrgent ? 'r39-poll-countdown-urgent' : isUrgent ? 'text-amber-600 dark:text-amber-400' : ''}>{String(timeLeft.seconds).padStart(2, '0')}</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PollOptionButton — animated option with emoji, vote bar, %
   ═══════════════════════════════════════════════════════════════ */
function PollOptionButton({
  option,
  index,
  totalVotes,
  simulatedCount,
  isVoted,
  isWinner,
  hasVotedPoll,
  onVote,
}: {
  option: PollOption
  index: number
  totalVotes: number
  simulatedCount: number
  isVoted: boolean
  isWinner: boolean
  hasVotedPoll: boolean
  onVote: (optionId: string) => void
}) {
  const percentage = totalVotes > 0 ? Math.round((simulatedCount / totalVotes) * 100) : 0
  const optionRef = useRef<HTMLButtonElement>(null)
  const staggerClass = `r39-poll-stagger-${Math.min(index + 1, 4)}`

  // Colors per position for non-voted state
  const colorSchemes = [
    { border: 'border-primary/30', bg: 'hover:bg-primary/5', text: 'text-foreground' },
    { border: 'border-emerald-500/30', bg: 'hover:bg-emerald-500/5', text: 'text-foreground' },
    { border: 'border-amber-500/30', bg: 'hover:bg-amber-500/5', text: 'text-foreground' },
    { border: 'border-rose-500/30', bg: 'hover:bg-rose-500/5', text: 'text-foreground' },
  ]
  const scheme = colorSchemes[index % colorSchemes.length]

  return (
    <motion.button
      ref={optionRef}
      variants={optionVariants}
      whileTap={!hasVotedPoll ? { scale: 0.97 } : undefined}
      whileHover={!hasVotedPoll ? { scale: 1.02, x: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } : undefined}
      onClick={() => {
        if (!hasVotedPoll) {
          onVote(option.id)
          // Fire confetti from button center
          if (optionRef.current) {
            const rect = optionRef.current.getBoundingClientRect()
            fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2)
          }
        }
      }}
      disabled={hasVotedPoll}
      className={`w-full relative overflow-hidden rounded-xl border-2 transition-all text-left r39-poll-vote-btn ${
        hasVotedPoll
          ? isVoted
            ? 'border-primary bg-primary/5 shadow-sm r39-poll-option-voted-spring'
            : isWinner
              ? 'border-emerald-400/50 bg-emerald-50/50 dark:bg-emerald-950/20 r39-poll-winner-glow'
              : 'border-border bg-card opacity-80'
          : `${scheme.border} ${scheme.bg} cursor-pointer`
      }`}
    >
      {/* Vote bar fill (animated after voting with gradient + shimmer) */}
      {hasVotedPoll && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: 0.1 + index * 0.12, ease: 'easeOut' as const }}
          className={`absolute inset-y-0 left-0 rounded-xl r39-poll-option-bar r39-poll-bar-entrance ${staggerClass} ${
            isVoted
              ? 'bg-gradient-to-r from-primary/20 via-primary/12 to-primary/5'
              : isWinner
                ? 'bg-gradient-to-r from-emerald-400/20 via-emerald-400/12 to-emerald-400/5'
                : 'bg-gradient-to-r from-muted/60 via-muted/40 to-transparent'
          }`}
        />
      )}

      {/* Shimmer overlay flash on vote */}
      {isVoted && hasVotedPoll && (
        <div className="r39-poll-voted-overlay" />
      )}

      <div className="relative z-10 flex items-center gap-3 px-4 py-3">
        {/* Emoji icon */}
        <motion.span
          className="text-2xl shrink-0"
          animate={hasVotedPoll && isVoted ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {option.emoji}
        </motion.span>

        {/* Text + percentage */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-sm font-semibold truncate ${hasVotedPoll && isVoted ? 'text-primary' : scheme.text}`}>
              {option.text}
            </span>
            {hasVotedPoll && (
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.12, type: 'spring' as const, stiffness: 400, damping: 15 }}
                className={`text-xs font-bold tabular-nums shrink-0 r39-poll-percent-counter ${staggerClass} ${
                  isVoted
                    ? 'text-primary'
                    : isWinner
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-muted-foreground'
                }`}
              >
                <AnimatedCounter value={percentage} />%
              </motion.span>
            )}
          </div>
          {/* Vote count text */}
          {hasVotedPoll && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.08 }}
              className="text-[10px] text-muted-foreground mt-0.5"
            >
              {simulatedCount} votos
            </motion.p>
          )}
        </div>

        {/* Winner badge */}
        {hasVotedPoll && isWinner && !isVoted && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.6, type: 'spring' as const, stiffness: 400, damping: 12 }}
            className="shrink-0"
          >
            <Trophy className="h-4 w-4 text-amber-500" />
          </motion.div>
        )}

        {/* Checkmark for user's vote */}
        {hasVotedPoll && isVoted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' as const, stiffness: 500, damping: 12 }}
            className="shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <svg className="h-3.5 w-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.button>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PollHistoryIndicator — shows how many polls the user has voted on
   ═══════════════════════════════════════════════════════════════ */
function PollHistoryIndicator() {
  const history = getVotedPolls()
  const count = history.length

  if (count === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
      className="ml-auto hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200/40 dark:border-violet-800/30"
    >
      <BarChart3 className="h-3.5 w-3.5 text-violet-500" />
      <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">
        {count} {count === 1 ? 'enquete respondida' : 'enquetes respondidas'}
      </span>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PreviousPollResult — mini view of last poll results
   ═══════════════════════════════════════════════════════════════ */
function PreviousPollResult({ poll }: { poll: PollData }) {
  const votes = getSimulatedVotes(poll)
  const winner = poll.options.reduce((best, opt) => (votes[opt.id] || 0) > (votes[best.id] || 0) ? opt : best, poll.options[0])
  const userVote = hasVoted(poll.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
      className="bg-card border border-border rounded-xl p-3"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] text-muted-foreground font-medium">Enquete anterior</span>
        <Badge variant="secondary" className="text-[9px] bg-secondary text-muted-foreground">
          {poll.totalVotes} votos
        </Badge>
      </div>
      <p className="text-xs font-medium line-clamp-1 mb-1.5">{poll.question}</p>
      <div className="flex items-center gap-2">
        <span className="text-lg">{winner.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate">{winner.text}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round(((votes[winner.id] || 0) / poll.totalVotes) * 100)}%` }} />
            </div>
            <span className="text-[9px] text-muted-foreground font-mono">
              {Math.round(((votes[winner.id] || 0) / poll.totalVotes) * 100)}%
            </span>
          </div>
        </div>
        {userVote && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="shrink-0"
          >
            <Badge variant="secondary" className="text-[9px] bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border-violet-200/40">
              ✓ Você votou
            </Badge>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   VoterAvatarStack — overlapping avatar stack with gradient ring
   ═══════════════════════════════════════════════════════════════ */
function VoterAvatarStack({ totalVotes }: { totalVotes: number }) {
  // Show up to 5 avatars with "+N" label
  const avatarEmojis = ['😊', '🎉', '🛒', '👍', '💜']
  const showCount = Math.min(Math.max(1, Math.floor(totalVotes / 50)), 5)

  return (
    <motion.div
      className="r39-poll-avatar-stack"
      variants={avatarStackVariants}
      initial="hidden"
      animate="visible"
    >
      {Array.from({ length: showCount }).map((_, i) => (
        <motion.div
          key={i}
          variants={avatarItemVariants}
          className="r39-poll-avatar r39-poll-avatar-enter"
          style={{ animationDelay: `${i * 0.08}s`, zIndex: showCount - i }}
        >
          {avatarEmojis[i % avatarEmojis.length]}
        </motion.div>
      ))}
      {totalVotes > showCount * 50 && (
        <motion.div
          variants={avatarItemVariants}
          className="r39-poll-avatar r39-poll-avatar-enter"
          style={{
            animationDelay: `${showCount * 0.08}s`,
            zIndex: 0,
            fontSize: '9px',
            fontWeight: 700,
            color: 'rgba(139, 92, 246, 0.8)',
          }}
        >
          +{Math.floor((totalVotes - showCount * 50) / 50)}
        </motion.div>
      )}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT — CommunityPoll
   ═══════════════════════════════════════════════════════════════ */
export function CommunityPoll() {
  const [currentPollIndex, setCurrentPollIndex] = useState(0)
  const [votedHistory, setVotedHistory] = useState<VotedPoll[]>([])
  const [mounted, setMounted] = useState(false)

  // Get the current poll (cycle through weekly polls)
  const currentPoll = useMemo(() => weeklyPolls[currentPollIndex], [currentPollIndex])
  const simulatedVotes = useMemo(() => getSimulatedVotes(currentPoll), [currentPoll])
  const userVote = useMemo(() => hasVoted(currentPoll.id), [currentPoll.id])

  // Previous poll for mini result display
  const previousPoll = useMemo(() => {
    const prevIdx = (currentPollIndex - 1 + weeklyPolls.length) % weeklyPolls.length
    return weeklyPolls[prevIdx]
  }, [currentPollIndex])

  // Get winner option
  const winnerOptionId = useMemo(() => {
    let maxVotes = 0
    let winner = currentPoll.options[0].id
    for (const opt of currentPoll.options) {
      const v = simulatedVotes[opt.id] || 0
      if (v > maxVotes) {
        maxVotes = v
        winner = opt.id
      }
    }
    return winner
  }, [currentPoll, simulatedVotes])

  // Load voted history and determine current poll on mount
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    const history = getVotedPolls()
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 3600 * 1000)) % weeklyPolls.length
    // Defer all state updates to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      setVotedHistory(history)
      setCurrentPollIndex(weekNumber)
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  // Handle vote
  const handleVote = useCallback((optionId: string) => {
    saveVote(currentPoll.id, optionId)
    setVotedHistory(getVotedPolls())
    // Increment total votes (simulated)
    currentPoll.totalVotes += 1
  }, [currentPoll])

  const hasVotedCurrentPoll = userVote !== undefined
  const totalVotesWithUser = hasVotedCurrentPoll ? currentPoll.totalVotes : currentPoll.totalVotes

  // Calculate next poll end date (next Sunday at 23:59)
  const getNextPollEnd = useCallback(() => {
    const now = new Date()
    const daysUntilSunday = (7 - now.getDay()) % 7
    const nextSunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday + 7, 23, 59, 59)
    return nextSunday.toISOString()
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' as const }}
      className="space-y-4 r62-card-lift r97-community-poll"
    >
      {/* Section header */}
      <div className="flex items-center gap-2">
        <motion.div
          className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center r39-poll-section-icon"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
        >
          <MessageCircle className="h-4 w-4 text-white" />
        </motion.div>
        <div>
          <h2 className="text-base font-bold flex items-center gap-1.5 r62-heading-gradient">
            <span className="r39-poll-header-gradient">Enquete da Comunidade</span>
            <Badge variant="secondary" className="text-[9px] bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border-violet-200/40 font-bold">
              Semanal
            </Badge>
          </h2>
          <p className="text-[10px] text-muted-foreground">Participe e ajude a comunidade a crescer</p>
        </div>
        <PollHistoryIndicator />
      </div>

      {/* Poll card */}
      <motion.div
        className="bg-card border border-border rounded-2xl overflow-hidden relative r39-poll-card"
        whileHover={{ boxShadow: '0 12px 32px rgba(139,92,246,0.12), 0 4px 12px rgba(0,0,0,0.08)' }}
        transition={{ duration: 0.3 }}
      >
        {/* Shimmer overlay */}
        <div className="r39-poll-card-shimmer" />

        {/* Decorative header gradient */}
        <div className="h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 relative overflow-hidden">
          <motion.span
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.4) 55%, transparent 60%)',
              backgroundSize: '300% 100%',
            }}
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' as const, repeatDelay: 1 }}
          />
        </div>

        <div className="p-4 sm:p-5">
          {/* Question */}
          <motion.div
            className="flex items-start gap-3 mb-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.5 }}
              className="text-2xl shrink-0 mt-0.5"
            >
              📊
            </motion.div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug">
                {currentPoll.question}
              </h3>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>Votos: <strong className="text-foreground">{totalVotesWithUser}</strong></span>
                </div>
                {/* Voter avatar stack */}
                <VoterAvatarStack totalVotes={totalVotesWithUser} />
                {!hasVotedCurrentPoll && (
                  <motion.div
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center gap-1 text-[10px] text-violet-600 dark:text-violet-400 font-medium"
                  >
                    <Sparkles className="h-3 w-3" />
                    Aguardando seu voto
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Options */}
          <motion.div
            className="space-y-2.5"
            variants={optionContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-20px' }}
          >
            {currentPoll.options.map((option, index) => (
              <PollOptionButton
                key={option.id}
                option={option}
                index={index}
                totalVotes={totalVotesWithUser}
                simulatedCount={simulatedVotes[option.id] || 0}
                isVoted={userVote?.votedOptionId === option.id}
                isWinner={winnerOptionId === option.id}
                hasVotedPoll={hasVotedCurrentPoll}
                onVote={handleVote}
              />
            ))}
          </motion.div>

          {/* After voting: results summary bar */}
          {hasVotedCurrentPoll && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: 'spring' as const, stiffness: 200, damping: 20 }}
              className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                >
                  <PartyPopper className="h-4 w-4 text-amber-500" />
                </motion.div>
                <span className="text-[10px] text-muted-foreground">
                  Obrigado por participar! Sua opinião importa.
                </span>
              </div>
              <CountdownTimer endDate={getNextPollEnd()} />
            </motion.div>
          )}

          {/* Before voting: countdown to poll close */}
          {!hasVotedCurrentPoll && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4"
            >
              <CountdownTimer endDate={getNextPollEnd()} />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Previous poll mini result (if user voted on it) */}
      {hasVoted(previousPoll.id) && (
        <PreviousPollResult poll={previousPoll} />
      )}

      {/* Voting streak indicator */}
      {votedHistory.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-200/40 dark:border-amber-800/30 p-3 flex items-center gap-3"
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
          >
            <Flame className="h-5 w-5 text-amber-500" />
          </motion.div>
          <div className="flex-1">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
              Participante ativo! 🔥
            </p>
            <p className="text-[10px] text-amber-600 dark:text-amber-500">
              Você já respondeu {votedHistory.length} enquetes. Continue participando!
            </p>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: Math.min(votedHistory.length, 5) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 + i * 0.1, type: 'spring' as const }}
                className="h-5 w-5 rounded-full bg-amber-400 flex items-center justify-center text-[10px]"
              >
                ⭐
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.section>
  )
}
