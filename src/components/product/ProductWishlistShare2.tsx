'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
import {
  Heart, Share2, Lock, Unlock, Check, Copy, QrCode, MessageCircle,
  Gift, Trash2, Plus, GripVertical, Users, Clock, Star,
  ExternalLink, Eye, EyeOff, Sparkles, Package, PartyPopper,
  ChevronDown, AlertCircle, CircleDot, UserPlus, Minus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip, TooltipContent, TooltipTrigger
} from '@/components/ui/tooltip'
import { toast } from 'sonner'

/* ============================================================
   TYPE DEFINITIONS
   ============================================================ */

type WishlistCategory = 'Birthday' | 'Wedding' | 'Housewarming' | 'General'
type Priority = 'high' | 'medium' | 'low'
type ActivityAction = 'added' | 'removed' | 'fulfilled'

interface Contributor {
  id: string
  name: string
  initials: string
  color: string
}

interface WishlistItem {
  id: string
  name: string
  price: number
  image?: string
  emoji: string
  store: string
  priority: Priority
  fulfilled: boolean
  addedBy: Contributor
  addedAt: Date
}

interface ActivityEntry {
  id: string
  user: Contributor
  action: ActivityAction
  itemName: string
  timestamp: Date
}

interface WishlistShareData {
  id: string
  name: string
  category: WishlistCategory
  isPublic: boolean
  shareLink: string
  items: WishlistItem[]
  contributors: Contributor[]
  activities: ActivityEntry[]
  giftFundContributed: number
  expiryDate: Date | null
  createdAt: Date
}

/* ============================================================
   CONSTANTS & HELPERS
   ============================================================ */

const CATEGORY_CONFIG: Record<WishlistCategory, { emoji: string; gradient: string; label: string }> = {
  Birthday: { emoji: '🎂', gradient: 'r43-cat-birthday', label: 'Birthday' },
  Wedding: { emoji: '💍', gradient: 'r43-cat-wedding', label: 'Wedding' },
  Housewarming: { emoji: '🏡', gradient: 'r43-cat-housewarm', label: 'Housewarming' },
  General: { emoji: '📋', gradient: 'r43-cat-general', label: 'General' },
}

const PRIORITY_CONFIG: Record<Priority, { color: string; label: string; dotColor: string }> = {
  high: { color: 'r43-pri-high', label: 'High', dotColor: '#ef4444' },
  medium: { color: 'r43-pri-medium', label: 'Medium', dotColor: '#f59e0b' },
  low: { color: 'r43-pri-low', label: 'Low', dotColor: '#22c55e' },
}

const MOCK_CONTRIBUTORS: Contributor[] = [
  { id: 'u1', name: 'Ana Silva', initials: 'AS', color: '#10b981' },
  { id: 'u2', name: 'Carlos Mendes', initials: 'CM', color: '#6366f1' },
  { id: 'u3', name: 'Julia Rocha', initials: 'JR', color: '#f43f5e' },
  { id: 'u4', name: 'Pedro Lima', initials: 'PL', color: '#f59e0b' },
]

const FALLBACK_EMOJIS = ['🎁', '📦', '🎀', '✨', '🎈', '🌟', '💝', '🛍️', '🏷️', '🎯']

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function generateShareId(): string {
  return `wl_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`
}

function getCountdown(expiry: Date): { days: number; hours: number; minutes: number; isExpired: boolean } {
  const diff = expiry.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, isExpired: true }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    isExpired: false,
  }
}

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 25 }
const springGentle = { type: 'spring' as const, stiffness: 200, damping: 20 }
const springSnappy = { type: 'spring' as const, stiffness: 400, damping: 30 }

/* ============================================================
   MOCK QR CODE SVG
   ============================================================ */

function MockQRCodeSVG({ size = 180 }: { size?: number }) {
  const cellSize = Math.floor(size / 21)
  const modules: boolean[][] = []
  for (let r = 0; r < 21; r++) {
    modules[r] = []
    for (let c = 0; c < 21; c++) {
      const isFinder = (
        (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7)
      )
      const isFinderBorder = (
        isFinder && (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
          (r >= 2 && r <= 4 && c >= 15 && c <= 17) ||
          (r >= 15 && r <= 17 && c >= 2 && c <= 4) ||
          (r >= 15 && r <= 17 && c >= 15 && c <= 17)
        )
      )
      const isDataZone = !isFinder
      const pseudoRand = ((r * 31 + c * 17 + r * c) % 7) > 2
      modules[r][c] = isFinderBorder || (isDataZone && pseudoRand)
    }
  }

  const rects: React.ReactElement[] = []
  for (let r = 0; r < 21; r++) {
    for (let c = 0; c < 21; c++) {
      if (modules[r][c]) {
        rects.push(
          <rect
            key={`${r}-${c}`}
            x={c * cellSize}
            y={r * cellSize}
            width={cellSize}
            height={cellSize}
            rx={1}
            fill="#1a1a2e"
          />
        )
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} rx={12} fill="#ffffff" />
      {rects}
    </svg>
  )
}

/* ============================================================
   EMPTY STATE
   ============================================================ */

function EmptyWishlistState() {
  return (
    <motion.div
      className="r43-empty-state flex flex-col items-center justify-center py-16 px-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
    >
      <motion.div
        className="r43-empty-gift relative mb-6"
        animate={{ y: [0, -8, 0], rotate: [0, 3, -3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="r43-empty-gift-box relative">
          <div className="r43-empty-gift-body w-24 h-20 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-3 bg-rose-600/40" />
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-2 bg-amber-300/70 rounded" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl">🎁</div>
          </div>
          <div className="r43-empty-gift-lid absolute -top-4 left-1/2 -translate-x-1/2 w-28 h-5 rounded-t-lg bg-gradient-to-b from-rose-500 to-rose-400 shadow-md">
            <motion.div
              className="absolute -top-5 left-1/2 -translate-x-1/2"
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
            </motion.div>
          </div>
          <motion.div
            className="absolute -bottom-2 left-2"
            animate={{ opacity: [0, 1, 0], y: [0, -10, -15] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          >
            <span className="text-lg">✨</span>
          </motion.div>
          <motion.div
            className="absolute -bottom-2 right-2"
            animate={{ opacity: [0, 1, 0], y: [0, -10, -15] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
          >
            <span className="text-lg">💫</span>
          </motion.div>
        </div>
      </motion.div>

      <h3 className="r43-empty-title text-lg font-bold text-foreground mb-2">
        Your wishlist is empty
      </h3>
      <p className="r43-empty-desc text-sm text-muted-foreground max-w-xs mb-6">
        Start adding items you love and share your wishlist with friends and family for the perfect gift.
      </p>
      <motion.div whileTap={{ scale: 0.95 }}>
        <Button className="r43-empty-add-btn gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md">
          <Plus className="w-4 h-4" />
          Add Your First Item
        </Button>
      </motion.div>
    </motion.div>
  )
}

/* ============================================================
   COUNTDOWN TIMER
   ============================================================ */

function CountdownTimer({ expiryDate }: { expiryDate: Date }) {
  const [countdown, setCountdown] = useState(getCountdown(expiryDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(expiryDate))
    }, 30000)
    return () => clearInterval(interval)
  }, [expiryDate])

  if (countdown.isExpired) {
    return (
      <div className="r43-countdown-expired flex items-center gap-2 text-sm font-medium text-rose-500">
        <AlertCircle className="w-4 h-4" />
        <span>Event has passed</span>
      </div>
    )
  }

  const units = [
    { value: countdown.days, label: 'Days' },
    { value: countdown.hours, label: 'Hrs' },
    { value: countdown.minutes, label: 'Min' },
  ]

  return (
    <div className="r43-countdown flex items-center gap-3">
      <Clock className="w-4 h-4 text-amber-500 shrink-0" />
      {units.map((unit) => (
        <div key={unit.label} className="flex flex-col items-center">
          <motion.span
            key={unit.value}
            className="r43-countdown-val text-lg font-bold text-foreground leading-none"
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={springSnappy}
          >
            {String(unit.value).padStart(2, '0')}
          </motion.span>
          <span className="r43-countdown-label text-[10px] text-muted-foreground">{unit.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ============================================================
   LOCK TOGGLE
   ============================================================ */

function PublicPrivateToggle({
  isPublic,
  onToggle,
}: {
  isPublic: boolean
  onToggle: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          className="r43-lock-toggle flex items-center gap-2 cursor-pointer select-none"
          onClick={onToggle}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isPublic ? 'unlocked' : 'locked'}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={springSnappy}
              className="r43-lock-icon flex items-center justify-center w-8 h-8 rounded-lg"
              style={{
                backgroundColor: isPublic ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
              }}
            >
              {isPublic ? (
                <Unlock className="w-4 h-4" style={{ color: '#10b981' }} />
              ) : (
                <Lock className="w-4 h-4" style={{ color: '#f43f5e' }} />
              )}
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center gap-1.5">
            <span className="r43-lock-label text-xs font-medium text-muted-foreground">
              {isPublic ? 'Public' : 'Private'}
            </span>
            <Switch checked={isPublic} onCheckedChange={onToggle} className="scale-75" />
          </div>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{isPublic ? 'Anyone with the link can view' : 'Only collaborators can view'}</p>
      </TooltipContent>
    </Tooltip>
  )
}

/* ============================================================
   CONTRIBUTOR AVATAR STACK
   ============================================================ */

function ContributorAvatarStack({
  contributors,
  max = 4,
}: {
  contributors: Contributor[]
  max?: number
}) {
  const visible = contributors.slice(0, max)
  const extra = contributors.length - max

  return (
    <div className="r43-avatar-stack flex items-center -space-x-2">
      {visible.map((c) => (
        <Tooltip key={c.id}>
          <TooltipTrigger asChild>
            <motion.div
              className="r43-avatar-ring flex items-center justify-center w-7 h-7 rounded-full border-2 border-background cursor-default"
              style={{ backgroundColor: c.color }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={springSnappy}
              whileHover={{ y: -2, zIndex: 10 }}
            >
              <span className="r43-avatar-initials text-[10px] font-bold text-white">{c.initials}</span>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{c.name}</p>
          </TooltipContent>
        </Tooltip>
      ))}
      {extra > 0 && (
        <motion.div
          className="r43-avatar-extra flex items-center justify-center w-7 h-7 rounded-full border-2 border-background text-[10px] font-bold text-muted-foreground"
          style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={springSnappy}
        >
          +{extra}
        </motion.div>
      )}
    </div>
  )
}

/* ============================================================
   ANIMATED PRICE COUNTER
   ============================================================ */

function AnimatedPriceCounter({ value }: { value: number }) {
  const prevValue = useRef(value)

  useEffect(() => {
    prevValue.current = value
  }, [value])

  return (
    <motion.span
      key={value}
      className="r43-price-counter font-extrabold text-primary"
      initial={{ scale: 1.15, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={springSnappy}
    >
      {formatBRL(value)}
    </motion.span>
  )
}

/* ============================================================
   GIFT FUND PROGRESS BAR
   ============================================================ */

function GiftFundBar({
  total,
  contributed,
}: {
  total: number
  contributed: number
}) {
  const pct = total > 0 ? Math.min((contributed / total) * 100, 100) : 0

  return (
    <div className="r43-gift-fund space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="r43-fund-icon flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ backgroundColor: 'rgba(168, 85, 247, 0.12)' }}>
            <Gift className="w-4 h-4" style={{ color: '#a855f7' }} />
          </div>
          <div>
            <p className="r43-fund-label text-xs font-semibold text-foreground">Gift Fund</p>
            <p className="r43-fund-sub text-[10px] text-muted-foreground">
              {Math.round(pct)}% of goal reached
            </p>
          </div>
        </div>
        <div className="text-right">
          <AnimatedPriceCounter value={contributed} />
          <p className="r43-fund-total text-[10px] text-muted-foreground">of {formatBRL(total)}</p>
        </div>
      </div>
      <div className="r43-fund-progress-wrap relative">
        <Progress
          value={pct}
          className="r43-fund-progress h-2.5 rounded-full"
        />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-md"
          style={{ backgroundColor: '#a855f7', left: `${Math.max(pct - 2, 0)}%` }}
          animate={{ left: `${Math.max(pct - 2, 0)}%` }}
          transition={springGentle}
        />
      </div>
    </div>
  )
}

/* ============================================================
   ACTIVITY FEED
   ============================================================ */

function ActivityFeed({ activities }: { activities: ActivityEntry[] }) {
  const actionConfig: Record<ActivityAction, { icon: typeof Plus; color: string; bg: string }> = {
    added: { icon: Plus, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
    removed: { icon: Trash2, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
    fulfilled: { icon: Check, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)' },
  }

  return (
    <div className="r43-activity-feed space-y-2">
      <h4 className="r43-activity-title text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
        <CircleDot className="w-3.5 h-3.5 text-muted-foreground" />
        Recent Activity
      </h4>
      <ScrollArea className="r43-activity-scroll max-h-48">
        <div className="r43-activity-list space-y-1.5 pr-1">
          <AnimatePresence initial={false}>
            {activities.map((entry) => {
              const cfg = actionConfig[entry.action]
              const Icon = cfg.icon
              return (
                <motion.div
                  key={entry.id}
                  className="r43-activity-entry flex items-center gap-2.5 p-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12, height: 0, padding: 0, margin: 0 }}
                  transition={springGentle}
                >
                  <div
                    className="r43-activity-icon-wrap flex items-center justify-center w-6 h-6 rounded-full shrink-0"
                    style={{ backgroundColor: cfg.bg }}
                  >
                    <Icon className="w-3 h-3" style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="r43-activity-text text-[11px] text-foreground leading-tight">
                      <span className="font-semibold">{entry.user.name}</span>{' '}
                      {entry.action === 'added' && 'added '}
                      {entry.action === 'removed' && 'removed '}
                      {entry.action === 'fulfilled' && 'bought '}
                      <span className="font-medium truncate">{entry.itemName}</span>
                    </p>
                    <p className="r43-activity-time text-[10px] text-muted-foreground">
                      {timeAgo(entry.timestamp)}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  )
}

/* ============================================================
   SHARE OPTIONS PANEL
   ============================================================ */

function ShareOptionsPanel({ shareLink, onQRClick }: { shareLink: string; onQRClick: () => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Could not copy link')
    }
  }, [shareLink])

  const handleWebShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: 'My Wishlist — DomPlace',
          text: 'Check out my wishlist on DomPlace!',
          url: shareLink,
        })
      } catch {
        handleCopy()
      }
    } else {
      handleCopy()
    }
  }, [shareLink, handleCopy])

  const handleWhatsApp = useCallback(() => {
    const message = `Check out my wishlist on DomPlace!\n\n${shareLink}`
    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
    toast.success('Opening WhatsApp...')
  }, [shareLink])

  const shareItems = [
    {
      icon: Copy,
      label: copied ? 'Copied!' : 'Copy Link',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
      action: handleCopy,
      disabled: false,
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      color: '#22c55e',
      bg: 'rgba(34, 197, 94, 0.12)',
      action: handleWhatsApp,
      disabled: false,
    },
    {
      icon: QrCode,
      label: 'QR Code',
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.12)',
      action: onQRClick,
      disabled: false,
    },
    {
      icon: Share2,
      label: 'More...',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)',
      action: handleWebShare,
      disabled: false,
    },
  ]

  return (
    <div className="r43-share-panel">
      <div className="r43-share-row flex items-center gap-2">
        {shareItems.map((item) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.label}
              className="r43-share-btn-wrap"
              whileTap={{ scale: 0.9 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    className="r43-share-btn flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border cursor-pointer min-w-0"
                    style={{
                      backgroundColor: item.bg,
                      borderColor: 'transparent',
                    }}
                    onClick={item.action}
                    whileHover={{ y: -2, boxShadow: `0 4px 12px rgba(0,0,0,0.1)` }}
                    transition={springGentle}
                  >
                    <Icon className="w-4 h-4 shrink-0" style={{ color: item.color }} />
                    <span className="r43-share-label text-[9px] font-medium text-foreground truncate w-full text-center">
                      {item.label}
                    </span>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ============================================================
   QR CODE DIALOG
   ============================================================ */

function QRCodeDialog({
  open,
  onOpenChange,
  shareLink,
  wishlistName,
  totalValue,
  itemCount,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  shareLink: string
  wishlistName: string
  totalValue: number
  itemCount: number
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="r43-qr-dialog max-w-xs p-0 gap-0 overflow-hidden rounded-2xl">
        <div className="r43-qr-header bg-gradient-to-r from-violet-600 to-purple-600 p-4 text-center text-white">
          <DialogTitle className="text-base font-bold flex items-center justify-center gap-2 text-white">
            <QrCode className="w-5 h-5" />
            QR Code for Wishlist
          </DialogTitle>
          <DialogDescription className="text-white/80 text-xs mt-1">
            Scan to open &quot;{wishlistName}&quot;
          </DialogDescription>
        </div>
        <div className="r43-qr-body p-6 flex flex-col items-center gap-4">
          <motion.div
            className="r43-qr-frame p-3 rounded-2xl shadow-lg border"
            style={{ borderColor: 'rgba(0,0,0,0.08)' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springTransition}
          >
            <MockQRCodeSVG size={180} />
          </motion.div>
          <div className="text-center space-y-1">
            <p className="r43-qr-items text-xs text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} &middot;{' '}
              <span className="font-semibold">{formatBRL(totalValue)}</span>
            </p>
            <p className="r43-qr-link text-[10px] text-muted-foreground/60 break-all max-w-[200px]">
              {shareLink}
            </p>
          </div>
        </div>
        <div className="r43-qr-footer p-3 border-t bg-muted/30 flex gap-2">
          <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
            <Button
              variant="outline"
              size="sm"
              className="r43-qr-copy-btn w-full gap-1.5 text-xs"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(shareLink)
                  toast.success('Link copied!')
                } catch {
                  toast.error('Could not copy')
                }
              }}
            >
              <Copy className="w-3 h-3" />
              Copy Link
            </Button>
          </motion.div>
          <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
            <Button size="sm" className="r43-qr-close-btn w-full text-xs" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ============================================================
   WISHLIST ITEM CARD (with drag reorder)
   ============================================================ */

function WishlistItemCard({
  item,
  index,
  onToggleFulfilled,
  onRemove,
  isDraggable = true,
}: {
  item: WishlistItem
  index: number
  onToggleFulfilled: (id: string) => void
  onRemove: (id: string) => void
  isDraggable?: boolean
}) {
  const y = useMotionValue(0)
  const [isDragging, setIsDragging] = useState(false)

  const priCfg = PRIORITY_CONFIG[item.priority]

  return (
    <motion.div
      className="r43-wl-item relative group"
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: item.fulfilled ? 0.55 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0, padding: 0 }}
      transition={springGentle}
      style={{ y, zIndex: isDragging ? 50 : 1 }}
      drag={isDraggable ? 'y' : false}
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      whileHover={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      <div className="r43-wl-item-inner flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card">
        {/* Drag Handle */}
        {isDraggable && (
          <div className="r43-drag-handle cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-60 transition-opacity shrink-0">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
        )}

        {/* Image / Emoji */}
        <div className="r43-item-img-wrap relative shrink-0">
          <motion.div
            className="r43-item-img flex items-center justify-center w-12 h-12 rounded-xl"
            style={{
              backgroundColor: item.fulfilled ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0,0,0,0.04)',
            }}
            whileHover={{ scale: 1.05 }}
            transition={springSnappy}
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="r43-item-image w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span className="r43-item-emoji text-2xl">{item.emoji}</span>
            )}
          </motion.div>

          {/* Fulfilled overlay */}
          <AnimatePresence>
            {item.fulfilled && (
              <motion.div
                className="r43-fulfilled-overlay absolute inset-0 flex items-center justify-center rounded-xl"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.85)' }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={springSnappy}
              >
                <Check className="w-6 h-6 text-white" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info */}
        <div className="r43-item-info flex-1 min-w-0">
          <div className="flex items-start gap-1.5">
            <p className={`r43-item-name text-sm font-semibold leading-tight truncate ${
              item.fulfilled ? 'line-through text-muted-foreground' : 'text-foreground'
            }`}>
              {item.name}
            </p>
            {/* Priority dot */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className="r43-pri-dot w-2 h-2 rounded-full shrink-0 mt-1.5 cursor-default"
                  style={{ backgroundColor: priCfg.dotColor }}
                  whileHover={{ scale: 1.5 }}
                  transition={springSnappy}
                />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Priority: {priCfg.label}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="r43-item-store text-[11px] text-muted-foreground truncate">{item.store}</p>

          {/* Contributor who added */}
          <div className="r43-item-contributor flex items-center gap-1.5 mt-1">
            <div
              className="r43-contrib-dot w-4 h-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: item.addedBy.color }}
            >
              <span className="r43-contrib-init text-[7px] font-bold text-white">{item.addedBy.initials}</span>
            </div>
            <span className="r43-contrib-name text-[10px] text-muted-foreground">{item.addedBy.name}</span>
          </div>
        </div>

        {/* Price */}
        <div className="r43-item-price-col flex flex-col items-end shrink-0 gap-1">
          <span className={`r43-item-price text-sm font-bold ${
            item.fulfilled ? 'line-through text-muted-foreground' : 'text-foreground'
          }`}>
            {formatBRL(item.price)}
          </span>
          <Badge variant="outline" className={`r43-pri-badge text-[9px] px-1.5 py-0 ${priCfg.color}`}>
            {priCfg.label}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="r43-item-actions flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  className="r43-fulfill-btn w-7 h-7 rounded-lg flex items-center justify-center border"
                  style={{
                    backgroundColor: item.fulfilled ? 'rgba(16, 185, 129, 0.12)' : 'rgba(0,0,0,0.03)',
                    borderColor: item.fulfilled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(0,0,0,0.06)',
                  }}
                  onClick={() => onToggleFulfilled(item.id)}
                  whileHover={{ scale: 1.1 }}
                  transition={springSnappy}
                >
                  <Check className="w-3.5 h-3.5" style={{ color: item.fulfilled ? '#10b981' : '#94a3b8' }} />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{item.fulfilled ? 'Unmark fulfilled' : 'Mark as fulfilled'}</p>
              </TooltipContent>
            </Tooltip>
          </motion.div>
          <motion.div whileTap={{ scale: 0.9 }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  className="r43-remove-btn w-7 h-7 rounded-lg flex items-center justify-center border"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.06)', borderColor: 'rgba(239, 68, 68, 0.15)' }}
                  onClick={() => onRemove(item.id)}
                  whileHover={{ scale: 1.1 }}
                  transition={springSnappy}
                >
                  <Trash2 className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Remove item</p>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

/* ============================================================
   DROP ZONE INDICATOR
   ============================================================ */

function DragDropZoneIndicator({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="r43-drop-zone rounded-xl border-2 border-dashed p-2 mx-1 my-1"
          style={{
            borderColor: 'rgba(99, 102, 241, 0.4)',
            backgroundColor: 'rgba(99, 102, 241, 0.04)',
          }}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 48 }}
          exit={{ opacity: 0, height: 0 }}
          transition={springGentle}
        >
          <div className="flex items-center justify-center gap-2 h-full">
            <GripVertical className="w-4 h-4" style={{ color: '#6366f1' }} />
            <span className="r43-drop-text text-xs font-medium" style={{ color: '#6366f1' }}>
              Drop here to reorder
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ============================================================
   CATEGORY SELECTOR
   ============================================================ */

function CategorySelector({
  selected,
  onSelect,
}: {
  selected: WishlistCategory
  onSelect: (cat: WishlistCategory) => void
}) {
  return (
    <div className="r43-cat-selector flex items-center gap-1.5 flex-wrap">
      {(Object.keys(CATEGORY_CONFIG) as WishlistCategory[]).map((cat) => {
        const cfg = CATEGORY_CONFIG[cat]
        const isActive = cat === selected
        return (
          <motion.div key={cat} whileTap={{ scale: 0.93 }}>
            <motion.button
              className={`r43-cat-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                isActive ? 'r43-cat-btn-active' : 'r43-cat-btn-default'
              }`}
              onClick={() => onSelect(cat)}
              animate={{
                scale: isActive ? 1.05 : 1,
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.1)' : '0 0 0 transparent',
              }}
              transition={springSnappy}
              style={{
                backgroundColor: isActive ? 'rgba(168, 85, 247, 0.1)' : 'rgba(0,0,0,0.03)',
                borderColor: isActive ? 'rgba(168, 85, 247, 0.3)' : 'rgba(0,0,0,0.06)',
                color: isActive ? '#a855f7' : '#64748b',
              }}
            >
              <span className="text-sm">{cfg.emoji}</span>
              <span>{cfg.label}</span>
            </motion.button>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ============================================================
   MAIN COMPONENT: ProductWishlistShare2
   ============================================================ */

export function ProductWishlistShare2() {
  /* ---- State ---- */
  const [wishlist, setWishlist] = useState<WishlistShareData>(() => ({
    id: generateShareId(),
    name: 'Birthday Gifts for Ana',
    category: 'Birthday' as WishlistCategory,
    isPublic: true,
    shareLink: `https://domplace.com/wl/${generateShareId()}`,
    items: [
      {
        id: 'i1', name: 'Wireless Headphones Pro', price: 349.90,
        emoji: '🎧', store: 'TechStore', priority: 'high' as Priority,
        fulfilled: false, addedBy: MOCK_CONTRIBUTORS[0], addedAt: new Date(Date.now() - 3600000),
      },
      {
        id: 'i2', name: 'Artisan Coffee Maker', price: 189.90,
        emoji: '☕', store: 'KitchenWorld', priority: 'medium' as Priority,
        fulfilled: false, addedBy: MOCK_CONTRIBUTORS[1], addedAt: new Date(Date.now() - 7200000),
      },
      {
        id: 'i3', name: 'Yoga Mat Premium', price: 129.90,
        emoji: '🧘', store: 'FitGear', priority: 'low' as Priority,
        fulfilled: true, addedBy: MOCK_CONTRIBUTORS[2], addedAt: new Date(Date.now() - 86400000),
      },
      {
        id: 'i4', name: 'Scented Candle Collection', price: 79.90,
        emoji: '🕯️', store: 'HomeDecor', priority: 'medium' as Priority,
        fulfilled: false, addedBy: MOCK_CONTRIBUTORS[0], addedAt: new Date(Date.now() - 43200000),
      },
      {
        id: 'i5', name: 'Silk Pillow Set', price: 219.90,
        emoji: '🛏️', store: 'LuxHome', priority: 'high' as Priority,
        fulfilled: false, addedBy: MOCK_CONTRIBUTORS[3], addedAt: new Date(Date.now() - 172800000),
      },
      {
        id: 'i6', name: 'Organic Tea Gift Box', price: 59.90,
        emoji: '🍵', store: 'TeaHouse', priority: 'low' as Priority,
        fulfilled: true, addedBy: MOCK_CONTRIBUTORS[1], addedAt: new Date(Date.now() - 259200000),
      },
    ],
    contributors: MOCK_CONTRIBUTORS,
    activities: [
      { id: 'a1', user: MOCK_CONTRIBUTORS[0], action: 'added', itemName: 'Wireless Headphones Pro', timestamp: new Date(Date.now() - 3600000) },
      { id: 'a2', user: MOCK_CONTRIBUTORS[1], action: 'added', itemName: 'Artisan Coffee Maker', timestamp: new Date(Date.now() - 7200000) },
      { id: 'a3', user: MOCK_CONTRIBUTORS[2], action: 'fulfilled', itemName: 'Yoga Mat Premium', timestamp: new Date(Date.now() - 86400000) },
      { id: 'a4', user: MOCK_CONTRIBUTORS[0], action: 'added', itemName: 'Scented Candle Collection', timestamp: new Date(Date.now() - 43200000) },
      { id: 'a5', user: MOCK_CONTRIBUTORS[3], action: 'added', itemName: 'Silk Pillow Set', timestamp: new Date(Date.now() - 172800000) },
      { id: 'a6', user: MOCK_CONTRIBUTORS[1], action: 'fulfilled', itemName: 'Organic Tea Gift Box', timestamp: new Date(Date.now() - 259200000) },
    ],
    giftFundContributed: 320.00,
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  }))

  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [showActivity, setShowActivity] = useState(false)
  const [filterFulfilled, setFilterFulfilled] = useState(false)
  const [showDropZone, setShowDropZone] = useState(false)
  const [activeTab, setActiveTab] = useState('items')

  /* ---- Derived values ---- */
  const totalValue = useMemo(
    () => wishlist.items.reduce((sum, i) => sum + i.price, 0),
    [wishlist.items]
  )
  const fulfilledCount = useMemo(
    () => wishlist.items.filter(i => i.fulfilled).length,
    [wishlist.items]
  )
  const fulfilledValue = useMemo(
    () => wishlist.items.filter(i => i.fulfilled).reduce((sum, i) => sum + i.price, 0),
    [wishlist.items]
  )
  const remainingValue = totalValue - fulfilledValue

  const displayItems = useMemo(() => {
    if (filterFulfilled) return wishlist.items.filter(i => !i.fulfilled)
    return wishlist.items
  }, [wishlist.items, filterFulfilled])

  const catConfig = CATEGORY_CONFIG[wishlist.category]

  /* ---- Handlers ---- */
  const togglePublic = useCallback(() => {
    setWishlist(prev => ({ ...prev, isPublic: !prev.isPublic }))
  }, [])

  const toggleFulfilled = useCallback((id: string) => {
    setWishlist(prev => {
      const item = prev.items.find(i => i.id === id)
      const newAction: ActivityAction = item?.fulfilled ? 'added' : 'fulfilled'
      const newActivity: ActivityEntry = {
        id: `a_${Date.now()}`,
        user: MOCK_CONTRIBUTORS[0],
        action: newAction,
        itemName: item?.name || 'Unknown',
        timestamp: new Date(),
      }
      return {
        ...prev,
        items: prev.items.map(i => i.id === id ? { ...i, fulfilled: !i.fulfilled } : i),
        activities: [newActivity, ...prev.activities],
      }
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setWishlist(prev => {
      const item = prev.items.find(i => i.id === id)
      const newActivity: ActivityEntry = {
        id: `a_${Date.now()}`,
        user: MOCK_CONTRIBUTORS[0],
        action: 'removed',
        itemName: item?.name || 'Unknown',
        timestamp: new Date(),
      }
      return {
        ...prev,
        items: prev.items.filter(i => i.id !== id),
        activities: [newActivity, ...prev.activities],
      }
    })
    toast.success('Item removed from wishlist')
  }, [])

  const changeCategory = useCallback((cat: WishlistCategory) => {
    setWishlist(prev => ({ ...prev, category: cat }))
  }, [])

  /* ---- Render ---- */
  return (
    <div className="r43-root w-full max-w-2xl mx-auto">
      {/* ===== HEADER CARD ===== */}
      <motion.div
        className="r43-header-card rounded-2xl overflow-hidden shadow-sm border border-border/60 mb-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springTransition}
      >
        {/* Category banner */}
        <div className="r43-header-banner relative px-5 py-6 overflow-hidden"
          style={{ backgroundColor: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(236, 72, 153, 0.08))' }}>
          <div className="r43-banner-bg absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              className="r43-banner-blob absolute -top-8 -right-8 w-32 h-32 rounded-full"
              style={{ backgroundColor: 'rgba(168, 85, 247, 0.06)' }}
              animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="r43-banner-blob2 absolute -bottom-4 -left-4 w-24 h-24 rounded-full"
              style={{ backgroundColor: 'rgba(236, 72, 153, 0.06)' }}
              animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <motion.span
                  className="r43-cat-emoji text-2xl"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {catConfig.emoji}
                </motion.span>
                <Badge variant="outline" className="r43-cat-badge text-[10px] px-2 py-0"
                  style={{ borderColor: 'rgba(168, 85, 247, 0.3)', color: '#a855f7' }}>
                  {catConfig.label}
                </Badge>
              </div>
              <h2 className="r43-wl-name text-xl font-bold text-foreground mb-0.5">{wishlist.name}</h2>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="r43-item-count flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {wishlist.items.length} items
                </span>
                <span className="r43-fulfilled-count flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {fulfilledCount} fulfilled
                </span>
              </div>
            </div>

            {/* Public / Private Toggle */}
            <PublicPrivateToggle isPublic={wishlist.isPublic} onToggle={togglePublic} />
          </div>
        </div>

        {/* Share link row */}
        <div className="r43-share-link-row px-5 py-3 flex items-center gap-3 border-b border-border/40"
          style={{ backgroundColor: 'rgba(0,0,0,0.01)' }}>
          <div className="r43-link-icon flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
            style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
            <ExternalLink className="w-3.5 h-3.5" style={{ color: '#6366f1' }} />
          </div>
          <div className="r43-link-text flex-1 min-w-0">
            <p className="text-[11px] text-muted-foreground">Shareable Link</p>
            <p className="r43-link-url text-xs font-mono text-foreground truncate">{wishlist.shareLink}</p>
          </div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              className="r43-copy-link-btn min-h-[44px] min-w-[44px] text-[11px] h-7 gap-1 shrink-0 active:scale-95 transition-transform"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(wishlist.shareLink)
                  toast.success('Link copied!')
                } catch {
                  toast.error('Could not copy')
                }
              }}
            >
              <Copy className="w-3 h-3" />
              Copy
            </Button>
          </motion.div>
        </div>

        {/* Contributors row */}
        <div className="r43-contributors-row px-5 py-3 flex items-center justify-between border-b border-border/40">
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-muted-foreground" />
            <ContributorAvatarStack contributors={wishlist.contributors} />
            <span className="r43-contrib-count text-xs text-muted-foreground">
              {wishlist.contributors.length} collaborators
            </span>
          </div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="sm" className="r43-invite-btn text-[11px] h-7 gap-1 text-primary">
              <UserPlus className="w-3 h-3" />
              Invite
            </Button>
          </motion.div>
        </div>

        {/* Category Selector */}
        <div className="r43-cat-row px-5 py-3 border-b border-border/40">
          <CategorySelector selected={wishlist.category} onSelect={changeCategory} />
        </div>

        {/* Share Options */}
        <div className="r43-share-options px-5 py-3">
          <ShareOptionsPanel
            shareLink={wishlist.shareLink}
            onQRClick={() => setQrDialogOpen(true)}
          />
        </div>
      </motion.div>

      {/* ===== STATS ROW ===== */}
      <motion.div
        className="r43-stats-row grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springTransition, delay: 0.1 }}
      >
        {[
          { label: 'Total Value', value: formatBRL(totalValue), icon: Star, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
          { label: 'Fulfilled', value: formatBRL(fulfilledValue), icon: Check, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
          { label: 'Remaining', value: formatBRL(remainingValue), icon: Gift, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="r43-stat-card py-3 px-4 gap-2">
              <CardContent className="p-0 flex items-center gap-2.5">
                <div className="r43-stat-icon flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                  style={{ backgroundColor: stat.bg }}>
                  <Icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <div className="min-w-0">
                  <p className="r43-stat-label text-[10px] text-muted-foreground truncate">{stat.label}</p>
                  <p className="r43-stat-value text-sm font-bold text-foreground truncate">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      {/* ===== COUNTDOWN ===== */}
      {wishlist.expiryDate && (
        <motion.div
          className="r43-countdown-card rounded-xl border border-border/60 p-4 mb-4"
          style={{ backgroundColor: 'rgba(245, 158, 11, 0.04)' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: 0.15 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PartyPopper className="w-4 h-4 text-amber-500" />
              <span className="r43-event-label text-xs font-semibold text-foreground">Event Countdown</span>
            </div>
            <CountdownTimer expiryDate={wishlist.expiryDate} />
          </div>
        </motion.div>
      )}

      {/* ===== GIFT FUND ===== */}
      <motion.div
        className="r43-fund-card rounded-xl border border-border/60 p-4 mb-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springTransition, delay: 0.2 }}
      >
        <GiftFundBar total={totalValue} contributed={wishlist.giftFundContributed} />
        <div className="r43-fund-actions flex gap-2 mt-3">
          <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
            <Button size="sm" className="r43-contribute-btn w-full text-xs gap-1.5"
              style={{ backgroundColor: '#a855f7' }}
              onClick={() => {
                setWishlist(prev => ({ ...prev, giftFundContributed: Math.min(prev.giftFundContributed + 50, totalValue) }))
                toast.success('Contributed R$ 50 to the gift fund!')
              }}>
              <Plus className="w-3 h-3" />
              Contribute R$ 50
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" className="r43-fund-detail-btn text-xs gap-1.5">
              <Eye className="w-3 h-3" />
              Details
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* ===== MAIN CONTENT TABS ===== */}
      <motion.div
        className="r43-main-content rounded-2xl border border-border/60 overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springTransition, delay: 0.25 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="r43-tabs w-full">
          <div className="r43-tabs-bar px-4 pt-4">
            <TabsList className="r43-tabs-list w-full">
              <TabsTrigger value="items" className="r43-tab-trigger flex-1 gap-1.5 text-xs">
                <Package className="w-3.5 h-3.5" />
                Items ({wishlist.items.length})
              </TabsTrigger>
              <TabsTrigger value="activity" className="r43-tab-trigger flex-1 gap-1.5 text-xs">
                <CircleDot className="w-3.5 h-3.5" />
                Activity ({wishlist.activities.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="items" className="r43-items-tab">
            {/* Filter bar */}
            <div className="r43-filter-bar px-4 py-2.5 flex items-center justify-between border-b border-border/40">
              <div className="flex items-center gap-2">
                <motion.div whileTap={{ scale: 0.93 }}>
                  <motion.button
                    className={`r43-filter-btn flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                      filterFulfilled ? 'r43-filter-active' : 'r43-filter-default'
                    }`}
                    onClick={() => setFilterFulfilled(!filterFulfilled)}
                    whileHover={{ scale: 1.03 }}
                    transition={springSnappy}
                    style={{
                      backgroundColor: filterFulfilled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.03)',
                      borderColor: filterFulfilled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(0,0,0,0.06)',
                      color: filterFulfilled ? '#10b981' : '#64748b',
                    }}
                  >
                    {filterFulfilled ? (
                      <>
                        <Eye className="w-3 h-3" />
                        Show All
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        Hide Fulfilled
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </div>

              <div className="flex items-center gap-2">
                <span className="r43-range-label text-[11px] text-muted-foreground">
                  Price Range
                </span>
                <span className="r43-range-value text-xs font-bold text-primary">
                  {wishlist.items.length > 0
                    ? `${formatBRL(Math.min(...wishlist.items.map(i => i.price)))} – ${formatBRL(Math.max(...wishlist.items.map(i => i.price)))}`
                    : '—'}
                </span>
              </div>
            </div>

            {/* Items List */}
            {wishlist.items.length === 0 ? (
              <EmptyWishlistState />
            ) : (
              <div className="r43-items-list p-3 space-y-1.5 max-h-96 overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {displayItems.map((item, idx) => (
                    <div key={item.id}>
                      <DragDropZoneIndicator visible={showDropZone && idx === 0} />
                      <WishlistItemCard
                        item={item}
                        index={idx}
                        onToggleFulfilled={toggleFulfilled}
                        onRemove={removeItem}
                      />
                    </div>
                  ))}
                </AnimatePresence>
                <DragDropZoneIndicator visible={showDropZone} />
              </div>
            )}

            {/* Total footer */}
            {wishlist.items.length > 0 && (
              <div className="r43-items-footer px-4 py-3 border-t border-border/40 flex items-center justify-between"
                style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <span className="r43-footer-label text-xs text-muted-foreground font-medium">
                  Total ({displayItems.length} {displayItems.length === 1 ? 'item' : 'items'})
                </span>
                <AnimatedPriceCounter
                  value={displayItems.reduce((sum, i) => sum + i.price, 0)}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="r43-activity-tab">
            <div className="p-4">
              <ActivityFeed activities={wishlist.activities} />
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* ===== QR CODE DIALOG ===== */}
      <QRCodeDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        shareLink={wishlist.shareLink}
        wishlistName={wishlist.name}
        totalValue={totalValue}
        itemCount={wishlist.items.length}
      />
    </div>
  )
}
