'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Copy, Check, Share2, Gift, Trophy, ChevronDown, ChevronUp,
  PartyPopper, Star, Clock, UserCheck, Zap, MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'

/* ── Types ── */
interface ReferralHistory {
  id: string
  name: string
  date: string
  status: 'ativo' | 'pendente' | 'expirado'
  bonus: number
}

/* ── Mock data ── */
const REFERRAL_CODE = 'DOMPLACE-7X4K'

const rewardTiers = [
  { friends: 1, bonus: 5, label: '1 amigo', color: '#84cc16' },
  { friends: 3, bonus: 15, label: '3 amigos', color: '#f59e0b' },
  { friends: 5, bonus: 30, label: '5 amigos', color: '#f97316' },
  { friends: 10, bonus: 75, label: '10 amigos', color: '#14b8a6' },
  { friends: 20, bonus: 200, label: '20 amigos', color: '#6366f1' },
]

const mockHistory: ReferralHistory[] = [
  { id: 'rh1', name: 'Maria Oliveira', date: '2025-01-15', status: 'ativo', bonus: 5 },
  { id: 'rh2', name: 'João Santos', date: '2025-01-10', status: 'ativo', bonus: 5 },
  { id: 'rh3', name: 'Ana Costa', date: '2025-01-05', status: 'pendente', bonus: 5 },
  { id: 'rh4', name: 'Pedro Lima', date: '2024-12-28', status: 'ativo', bonus: 5 },
  { id: 'rh5', name: 'Lucas Ferreira', date: '2024-12-20', status: 'expirado', bonus: 0 },
]

const accordionRules = [
  {
    title: 'Como funciona o programa?',
    content: 'Compartilhe seu código de indicação com amigos e familiares. Quando eles se cadastrarem no DomPlace usando seu código e fizerem uma compra, vocês dois ganham R$5 de bônus!',
  },
  {
    title: 'Quando recebo meu bônus?',
    content: 'O bônus é creditado automaticamente na sua conta quando o amigo indicado completa a primeira compra. O crédito fica disponível para uso imediato em qualquer loja do DomPlace.',
  },
  {
    title: 'Existe limite de indicações?',
    content: 'Não! Você pode indicar quantos amigos quiser. Quanto mais amigos indicar, maior será o bônus acumulado. Alcançar marcos de 1, 3, 5, 10 e 20 indicações ativas desbloqueia bônus extras progressivos.',
  },
  {
    title: 'O bônus expira?',
    content: 'Os créditos de indicação têm validade de 90 dias a partir do recebimento. Fique de olho no seu saldo e aproveite para usar em suas compras favoritas antes do vencimento.',
  },
]

const statusConfig: Record<string, { label: string; className: string }> = {
  ativo: { label: 'Ativo', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  pendente: { label: 'Pendente', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  expirado: { label: 'Expirado', className: 'bg-gray-100 text-gray-500 dark:bg-gray-800/30 dark:text-gray-500' },
}

/* ── Helpers ── */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

/* ── Main component ── */
export function ReferralProgram() {
  const [copied, setCopied] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [totalReferred] = useState(7)
  const [activeReferrals] = useState(4)
  const [totalBonus] = useState(35)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [sharing, setSharing] = useState(false)

  // Determine current tier progress
  const currentTierIndex = rewardTiers.findIndex((t) => totalReferred < t.friends)
  const nextTier = currentTierIndex >= 0 ? rewardTiers[currentTierIndex] : null
  const prevTier = currentTierIndex > 0 ? rewardTiers[currentTierIndex - 1] : rewardTiers[0]
  const progressPercent = nextTier
    ? ((totalReferred - (prevTier?.friends ?? 0)) / (nextTier.friends - (prevTier?.friends ?? 0))) * 100
    : 100

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(REFERRAL_CODE)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  const handleShare = useCallback(async () => {
    setSharing(true)
    const shareData = {
      title: 'DomPlace - Indique Amigos',
      text: `Use meu código ${REFERRAL_CODE} e ganhe R$5 de desconto no DomPlace! Compre local em Dom Eliseu.`,
      url: 'https://domplace.com',
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled or not supported - fall back
        await navigator.clipboard.writeText(shareData.text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } else {
      // WhatsApp fallback
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text)}`
      window.open(whatsappUrl, '_blank')
    }
    setSharing(false)
  }, [])

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 2000)
  }, [])

  return (
    <div className="r32-referral-program">
      {/* ── Referral Code Display ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-emerald-600 to-teal-600 p-5 text-white"
      >
        {/* Decorative shapes */}
        <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="absolute top-2 left-1/2 w-10 h-10 rounded-full bg-white/[0.04]" />

        {/* Title */}
        <div className="relative flex items-center gap-2 mb-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Users className="h-6 w-6" />
          </motion.div>
          <h3 className="text-lg font-bold">Indique Amigos</h3>
        </div>

        <p className="relative text-sm text-white/80 mb-4">
          Compartilhe seu código e ganhe bônus a cada amigo que se cadastrar e comprar!
        </p>

        {/* Code display */}
        <div className="relative bg-white/15 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[10px] text-white/60">Seu código de indicação</p>
            <div className="flex items-center gap-2 mt-1">
              <motion.span
                className="text-lg font-mono font-bold tracking-wider"
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {REFERRAL_CODE}
              </motion.span>
            </div>
          </div>
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyCode}
              className="h-9 text-white hover:bg-white/20 shrink-0 gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center p-3 rounded-xl bg-card border border-border"
        >
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1.5">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="text-lg font-bold text-primary">
            <AnimatedCounter value={totalReferred} duration={1000} delay={200} locale />
          </p>
          <p className="text-[10px] text-muted-foreground">Total indicados</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center p-3 rounded-xl bg-card border border-border"
        >
          <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-1.5">
            <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            <AnimatedCounter value={activeReferrals} duration={1000} delay={300} locale />
          </p>
          <p className="text-[10px] text-muted-foreground">Ativos</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center p-3 rounded-xl bg-card border border-border"
        >
          <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-1.5">
            <Gift className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
            <span className="text-xs">R$</span>
            <AnimatedCounter value={totalBonus} duration={1000} delay={400} locale />
          </p>
          <p className="text-[10px] text-muted-foreground">Bônus ganho</p>
        </motion.div>
      </div>

      {/* ── Reward Ladder ── */}
      <div className="mt-5">
        <h4 className="font-semibold text-xs flex items-center gap-1.5 mb-3">
          <Trophy className="h-3.5 w-3.5 text-amber-500" />
          Escada de recompensas
        </h4>

        {/* Progress toward next tier */}
        {nextTier && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">Progresso até {nextTier.label}</span>
              <span className="text-[10px] font-bold text-primary">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full r32-progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Faltam <span className="font-semibold text-primary">{nextTier.friends - totalReferred}</span> indicações
            </p>
          </div>
        )}

        {/* Tier cards */}
        <div className="space-y-2">
          {rewardTiers.map((tier, tierIdx) => {
            const isReached = totalReferred >= tier.friends
            const isCurrent = currentTierIndex >= 0 && rewardTiers[currentTierIndex - 1]?.friends === tier.friends
            return (
              <motion.div
                key={tier.friends}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + tierIdx * 0.08 }}
                whileHover={{ x: 3 }}
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                  isCurrent
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : isReached
                    ? 'border-emerald-200/50 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-900/5'
                    : 'border-border bg-card'
                }`}
              >
                {/* Tier indicator */}
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isReached ? `${tier.color}22` : 'rgba(128,128,128,0.1)',
                  }}
                >
                  {isReached ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' as const }}>
                      <Check className="h-4 w-4" style={{ color: tier.color }} />
                    </motion.div>
                  ) : (
                    <Star className="h-4 w-4 text-muted-foreground/40" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${isReached ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {tier.label}
                  </p>
                </div>

                <Badge
                  variant="secondary"
                  className={`text-[10px] px-2 py-0.5 border-0 font-bold ${
                    isReached
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {formatBRL(tier.bonus)}
                </Badge>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ── Share button ── */}
      <motion.div
        ref={ctaRef}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-5 relative"
      >
        <Button
          onClick={handleShare}
          disabled={sharing}
          className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl gap-2 btn-glow"
        >
          {sharing ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Share2 className="h-4 w-4" />
            </motion.div>
          ) : (
            <Share2 className="h-4 w-4" />
          )}
          Compartilhar Link
        </Button>

        {/* Confetti effect */}
        <AnimatePresence>
          {showConfetti && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              {[...Array(10)].map((_, ci) => (
                <motion.div
                  key={ci}
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                  animate={{
                    x: (Math.random() - 0.5) * 180,
                    y: (Math.random() - 0.5) * 100 - 30,
                    scale: 0,
                    opacity: 0,
                    rotate: Math.random() * 360,
                  }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="absolute h-3 w-3 rounded-sm"
                  style={{
                    backgroundColor: ['#10b981', '#f59e0b', '#f43f5e', '#14b8a6', '#84cc16', '#6366f1'][ci % 6],
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Referral History ── */}
      <div className="mt-5">
        <h4 className="font-semibold text-xs flex items-center gap-1.5 mb-3">
          <Clock className="h-3.5 w-3.5 text-primary" />
          Histórico de indicações
        </h4>
        <Card className="border-border overflow-hidden">
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {mockHistory.map((entry, histIdx) => {
                const status = statusConfig[entry.status] || statusConfig.pendente
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + histIdx * 0.06 }}
                    className="flex items-center gap-3 p-3 last:p-3"
                  >
                    {/* Avatar */}
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {entry.name.split(' ').map((n) => n[0]).join('')}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{entry.name}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(entry.date)}</p>
                    </div>

                    {/* Status + Bonus */}
                    <div className="text-right shrink-0">
                      <Badge className={`${status.className} text-[9px] px-1.5 py-0 border-0 font-bold`}>
                        {status.label}
                      </Badge>
                      {entry.bonus > 0 && (
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          +{formatBRL(entry.bonus)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── How it works accordion ── */}
      <div className="mt-5">
        <h4 className="font-semibold text-xs flex items-center gap-1.5 mb-3">
          <MessageCircle className="h-3.5 w-3.5 text-primary" />
          Como funciona
        </h4>
        <Accordion type="single" collapsible className="space-y-1.5">
          {accordionRules.map((rule, ruleIdx) => (
            <AccordionItem
              key={ruleIdx}
              value={`rule-${ruleIdx}`}
              className="border rounded-lg px-0 bg-card border-border/50 data-[state=open]:border-primary/20"
            >
              <AccordionTrigger className="px-3 py-2.5 text-xs font-medium hover:no-underline">
                {rule.title}
              </AccordionTrigger>
              <AccordionContent className="px-3 text-[11px] text-muted-foreground leading-relaxed">
                {rule.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
