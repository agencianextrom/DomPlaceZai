'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users, Copy, Check, Share2, QrCode, DollarSign, TrendingUp,
  Gift, ChevronRight, Star, Phone, Mail, Instagram, Facebook,
  BarChart3, Wallet, ExternalLink,
  UserPlus, ShoppingCart, Megaphone, Image as ImageIcon,
  Sparkles, Trophy, Clock, AlertCircle, RefreshCw, Loader2,
  ShieldX, LogIn, ChevronDown, History, User,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'

// -- Types --
interface DashboardData {
  referralCode: string
  commissionRate: number
  totalEarnings: number
  pendingEarnings: number
  totalReferrals: number
  totalConversions: number
  status: string
  availableBalance: number
  recentReferrals: ReferralItem[]
  monthlyStats: { referrals: number; conversions: number }
}

interface ReferralItem {
  id: string
  referredUserName: string
  referredUserEmail?: string
  order: { orderNumber: string; total: number } | null
  amount: number
  commission: number
  status: string
  createdAt: string
}

interface PayoutInfo {
  availableBalance: number
  pendingPayouts: number
  recentPayoutHistory: PayoutHistoryItem[]
  minPayoutAmount: number
}

interface PayoutHistoryItem {
  id: string
  details: string
  createdAt: string
}

import QRCode from 'qrcode'

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatBRLShort(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR')
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// -- Framer animation helpers --
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
}

const staggerChild = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
}

export function AffiliateDashboard() {
  const { navigate, openAuthModal } = useAppStore()
  const { isAuthenticated, isAffiliate, isLoading: authLoading } = useAuth()

  // UI state
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [referralFilter, setReferralFilter] = useState<'all' | 'active' | 'converted' | 'pending'>('all')
  const [activeTab, setActiveTab] = useState('referrals')

  // API state
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [referrals, setReferrals] = useState<ReferralItem[]>([])
  const [referralsTotal, setReferralsTotal] = useState(0)
  const [referralsHasMore, setReferralsHasMore] = useState(false)
  const [payoutInfo, setPayoutInfo] = useState<PayoutInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [referralsLoading, setReferralsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [payoutLoading, setPayoutLoading] = useState(false)
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [referralStatuses, setReferralStatuses] = useState<Record<string, string>>({})
  const [referralOffset, setReferralOffset] = useState(0)
  const [customLinkId, setCustomLinkId] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)

  // Generate QR code when dashboard loads
  const referralLink = dashboard?.referralCode
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://domplace.com'}?ref=${dashboard.referralCode}`
    : ''

  useEffect(() => {
    if (referralLink) {
      QRCode.toDataURL(referralLink, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      }).then(dataUrl => setQrCodeDataUrl(dataUrl)).catch(() => {})
    }
  }, [referralLink])

  const initials = dashboard?.referralCode?.slice(0, 2) || 'AF'

  // -- API fetchers --
  const fetchDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      setRetryCount(0)
      const res = await fetch('/api/affiliate/dashboard')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erro ao carregar dados')
      }
      const json = await res.json()
      if (json.success) {
        setDashboard(json.data)
      } else {
        throw new Error(json.error || 'Erro ao carregar dados')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const fetchReferrals = useCallback(async (status: string = 'all', offset = 0, append = false) => {
    try {
      setReferralsLoading(true)
      const res = await fetch(`/api/affiliate/referrals?status=${status}&limit=20&offset=${offset}`)
      if (res.ok) {
        const json = await res.json()
        if (json.success) {
          const newReferrals = json.data.referrals as ReferralItem[]
          if (append) {
            setReferrals(prev => [...prev, ...newReferrals])
          } else {
            setReferrals(newReferrals)
          }
          setReferralsTotal(json.data.pagination.total)
          setReferralsHasMore(json.data.pagination.hasMore)
          setReferralOffset(offset)
          const statusMap: Record<string, string> = {}
          newReferrals.forEach((r: ReferralItem) => {
            statusMap[r.id] = r.status
          })
          setReferralStatuses(prev => ({ ...prev, ...statusMap }))
        }
      }
    } catch {
      // Silently fail for referrals
    } finally {
      setReferralsLoading(false)
    }
  }, [])

  const fetchPayoutInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/affiliate/payout')
      if (res.ok) {
        const json = await res.json()
        if (json.success) {
          setPayoutInfo(json.data)
        }
      }
    } catch {
      // Silently fail
    }
  }, [])

  // Retry handler with increasing delay
  const handleRetry = useCallback(async () => {
    const newCount = retryCount + 1
    setRetryCount(newCount)
    await fetchDashboard()
  }, [fetchDashboard, retryCount])

  // -- Effects --
  useEffect(() => {
    if (isAuthenticated && isAffiliate) {
      fetchDashboard()
    }
  }, [isAuthenticated, isAffiliate, fetchDashboard])

  useEffect(() => {
    if (dashboard) {
      fetchReferrals()
      fetchPayoutInfo()
    }
  }, [dashboard, fetchReferrals, fetchPayoutInfo])

  // Fetch referrals when filter changes
  useEffect(() => {
    if (dashboard) {
      const apiStatus = referralFilter === 'all' ? 'all' : referralFilter === 'converted' ? 'approved' : referralFilter === 'pending' ? 'pending' : referralFilter
      fetchReferrals(apiStatus)
    }
  }, [referralFilter, dashboard, fetchReferrals])

  // -- Actions --
  const copyCode = () => {
    if (!dashboard) return
    navigator.clipboard.writeText(dashboard.referralCode)
    setCopiedCode(true)
    toast.success('Codigo copiado!')
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopiedLink(true)
    toast.success('Link copiado!')
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const shareReferralLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DomPlace - Indique e ganhe!',
          text: 'Opa! Descobri o DomPlace, o app de entregas de Dom Eliseu! Baixe com meu link e ganhe desconto!',
          url: referralLink,
        })
      } catch {
        copyLink()
      }
    } else {
      copyLink()
    }
  }

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Opa! Descobri o DomPlace, o app de entregas de Dom Eliseu! Baixe com meu link e ganhe R$10 de desconto: ${referralLink}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const shareInstagram = () => {
    copyLink()
    toast.success('Link copiado! Cole no seu Instagram Stories ou bio.')
  }

  const shareFacebook = () => {
    const url = encodeURIComponent(referralLink)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
  }

  const shareEmail = () => {
    const subject = encodeURIComponent('Conheca o DomPlace - Entregas em Dom Eliseu!')
    const body = encodeURIComponent(`Ola!\n\nDescobri o DomPlace, o app de entregas de Dom Eliseu. Tem de tudo: mercado, acai, farmacia, pet shop e muito mais, com entrega rapida na sua porta.\n\nUse meu link e ganhe desconto na primeira compra:\n${referralLink}\n\nAproveite!`)
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
  }

  const handlePayout = async () => {
    const amount = parseFloat(payoutAmount)
    if (!amount || amount <= 0) {
      toast.error('Insira um valor valido')
      return
    }
    const minAmount = payoutInfo?.minPayoutAmount || 50
    if (amount < minAmount) {
      toast.error(`O valor minimo para saque e R$${minAmount},00`)
      return
    }
    const available = dashboard?.availableBalance || 0
    if (amount > available) {
      toast.error('Saldo insuficiente')
      return
    }

    setPayoutLoading(true)
    try {
      const res = await fetch('/api/affiliate/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success(json.message || 'Solicitacao de saque enviada! Voce recebera em ate 2 dias uteis.')
        setPayoutDialogOpen(false)
        setPayoutAmount('')
        fetchDashboard(true)
        fetchPayoutInfo()
      } else {
        toast.error(json.error || 'Erro ao solicitar saque')
      }
    } catch {
      toast.error('Erro de conexao. Tente novamente.')
    } finally {
      setPayoutLoading(false)
    }
  }

  const handleLoadMoreReferrals = () => {
    const apiStatus = referralFilter === 'all' ? 'all' : referralFilter === 'converted' ? 'approved' : referralFilter === 'pending' ? 'pending' : referralFilter
    fetchReferrals(apiStatus, referralOffset + 20, true)
  }

  const handleGenerateCustomLink = () => {
    if (!customLinkId.trim()) {
      toast.error('Insira um identificador para a campanha')
      return
    }
    const link = `${referralLink}?utm_source=${encodeURIComponent(customLinkId.trim())}`
    navigator.clipboard.writeText(link)
    toast.success('Link personalizado gerado e copiado!')
    setCustomLinkId('')
  }

  const getReferralStatus = (ref: ReferralItem): string => {
    if (referralStatuses[ref.id]) return referralStatuses[ref.id]
    if (ref.status === 'paid') return 'converted'
    if (ref.status === 'approved') return 'converted'
    if (ref.status === 'pending') return 'pending'
    return 'active'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] border-0">Ativo</Badge>
      case 'converted':
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] border-0">Convertido</Badge>
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-[10px] border-0">Pendente</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-[10px] border-0">{status}</Badge>
    }
  }

  const filteredReferrals = referralFilter === 'all'
    ? referrals
    : referrals.filter(r => getReferralStatus(r) === referralFilter)

  const referralCounts = {
    all: referralsTotal,
    active: referrals.filter(r => getReferralStatus(r) === 'active').length,
    converted: referrals.filter(r => getReferralStatus(r) === 'converted').length,
    pending: referrals.filter(r => getReferralStatus(r) === 'pending').length,
  }

  // -- Auth checks (after all hooks) --
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center px-4">
        <motion.div
          {...fadeUp}
          className="max-w-sm w-full"
        >
          <Card className="border-border/50">
            <CardContent className="p-6 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
                <LogIn className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-lg font-bold">Acesso restrito</h2>
              <p className="text-sm text-muted-foreground">
                Faca login para acessar o painel do afiliado e comecar a ganhar dinheiro indicando amigos.
              </p>
              <Button onClick={openAuthModal} className="w-full bg-primary hover:bg-primary/90">
                Entrar na minha conta
              </Button>
              <Button variant="ghost" onClick={() => navigate('home')} className="w-full text-muted-foreground">
                Voltar ao inicio
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (!authLoading && isAuthenticated && !isAffiliate) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center px-4">
        <motion.div
          {...fadeUp}
          className="max-w-sm w-full"
        >
          <Card className="border-border/50">
            <CardContent className="p-6 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
                <ShieldX className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-lg font-bold">Acesso negado</h2>
              <p className="text-sm text-muted-foreground">
                O painel de afiliado esta disponivel apenas para usuarios com perfil de afiliado ativo.
              </p>
              <Button variant="outline" onClick={() => navigate('home')} className="w-full">
                Voltar ao inicio
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // -- Loading State --
  if (loading) {
    return (
      <div className="min-h-screen pb-24">
        <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 pt-6 pb-8 text-white px-4">
          <div className="flex items-center justify-between mb-5">
            <Skeleton className="h-10 w-10 rounded-full bg-white/20" />
            <Skeleton className="h-5 w-36 bg-white/20" />
            <div className="w-10" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-2xl bg-white/20" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-32 bg-white/20" />
              <Skeleton className="h-4 w-40 bg-white/20" />
            </div>
          </div>
          <div className="mt-4">
            <Skeleton className="h-16 w-full rounded-2xl bg-white/15" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl bg-white/15" />
            ))}
          </div>
        </div>
        <div className="px-4 mt-4 space-y-4">
          <Skeleton className="h-52 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  // -- Error State --
  if (error) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center px-4">
        <motion.div
          {...fadeUp}
          className="max-w-sm w-full"
        >
          <Card className="border-border/50">
            <CardContent className="p-6 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-lg font-bold">Erro ao carregar</h2>
              <p className="text-sm text-muted-foreground">{error}</p>
              {retryCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  Tentativa {retryCount} de 5
                </p>
              )}
              <Button
                onClick={handleRetry}
                className="w-full"
                variant="outline"
                disabled={retryCount >= 5}
              >
                {retryCount >= 5 ? (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Limite de tentativas atingido
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar novamente
                  </>
                )}
              </Button>
              <Button variant="ghost" onClick={() => navigate('home')} className="w-full text-muted-foreground text-sm">
                Voltar ao inicio
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (!dashboard) return null

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <motion.div
        {...fadeUp}
        className="relative overflow-hidden rounded-b-3xl"
      >
        <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 pt-6 pb-8 text-white px-4">
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }} />
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

          <div className="relative flex items-center justify-between mb-5">
            <Button variant="ghost" size="icon" onClick={() => navigate('home')} className="text-white hover:bg-white/15 h-10 w-10">
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
            <h1 className="text-lg font-bold r62-heading-gradient">Painel do Afiliado</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchDashboard(true)}
              className="text-white hover:bg-white/15 h-10 w-10"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Affiliate info */}
          <div className="relative flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring' }}
              className="relative"
            >
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-md flex items-center justify-center text-2xl font-bold border-2 border-white/30">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-amber-300 border-2 border-orange-500 flex items-center justify-center">
                <Star className="h-3 w-3 text-orange-700" />
              </div>
            </motion.div>
            <div className="flex-1">
              <h2 className="text-xl font-bold r62-heading-gradient">Afiliado</h2>
              <p className="text-sm text-white/70 mt-0.5">Status: {dashboard.status === 'ACTIVE' ? 'Ativo' : dashboard.status}</p>
            </div>
          </div>

          {/* Referral code card */}
          <motion.div
            {...staggerChild}
            transition={{ delay: 0.2 }}
            className="relative mt-4 bg-white/15 backdrop-blur-sm rounded-2xl p-4"
          >
            <p className="text-[10px] text-white/60 uppercase tracking-wider mb-2">Seu codigo de indicacao</p>
            <div className="flex items-center gap-2">
              <code className="text-xl font-bold tracking-widest flex-1">{dashboard.referralCode}</code>
              <Button
                size="sm"
                variant="ghost"
                className="h-9 text-white hover:bg-white/20 shrink-0"
                onClick={copyCode}
              >
                {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="relative grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4"
          >
            {[
              { icon: Users, label: 'Indicacoes', value: dashboard.totalReferrals },
              { icon: ShoppingCart, label: 'Conversoes', value: dashboard.totalConversions },
              { icon: TrendingUp, label: 'Taxa Conv.', value: dashboard.totalReferrals > 0 ? `${((dashboard.totalConversions / dashboard.totalReferrals) * 100).toFixed(0)}%` : '--' },
              { icon: Trophy, label: 'Total', value: formatBRLShort(dashboard.totalEarnings) },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={staggerChild}
                className="bg-white/15 backdrop-blur-sm rounded-xl p-2.5 text-center"
              >
                <stat.icon className="h-4 w-4 mx-auto mb-1 opacity-80" />
                <p className="text-sm font-bold">{stat.value}</p>
                <p className="text-[9px] text-white/60">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <svg className="absolute bottom-0 left-0 right-0 z-10" viewBox="0 0 1440 24" fill="none" preserveAspectRatio="none">
          <path d="M0 12C240 22 480 2 720 12C960 22 1200 2 1440 12V24H0V12Z" fill="oklch(0.99 0.002 120)" className="dark:hidden" />
          <path d="M0 12C240 22 480 2 720 12C960 22 1200 2 1440 12V24H0V12Z" fill="oklch(0.15 0.015 150)" className="hidden dark:block" />
        </svg>
      </motion.div>

      <div className="px-4 mt-2">
        {/* -- Como Funciona Section -- */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.05 }}
          className="mb-4"
        >
          <Card className="border-primary/20 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-emerald-50/50 dark:from-primary/10 dark:via-background dark:to-emerald-900/10">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Como Funciona?
              </h3>
              <div className="flex items-start gap-3">
                {[
                  { step: 1, title: 'Compartilhe', desc: 'Envie seu link unico para amigos, familia e redes sociais', icon: Share2, color: 'from-primary to-emerald-600' },
                  { step: 2, title: 'Cadastre-se', desc: 'Seus indicados se cadastram e fazem compras no DomPlace', icon: UserPlus, color: 'from-emerald-500 to-teal-600' },
                  { step: 3, title: 'Ganhe', desc: 'Receba comissao de cada compra realizada pelos seus indicados', icon: Trophy, color: 'from-amber-500 to-orange-500' },
                ].map((item) => (
                  <div key={item.step} className="flex-1 text-center">
                    <motion.div
                      whileHover={{ y: -3 }}
                      className="relative"
                    >
                      <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                        <item.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">{item.step}</span>
                      </div>
                    </motion.div>
                    <p className="text-xs font-bold mb-0.5">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              {dashboard.totalReferrals > 0 && dashboard.totalConversions > 0 && (
                <div className="mt-4 p-3 bg-background rounded-xl border border-primary/20">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-sm font-bold text-primary">{dashboard.totalReferrals}</p>
                      <p className="text-[9px] text-muted-foreground">Indicacoes</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-500">{dashboard.totalReferrals > 0 ? ((dashboard.totalConversions / dashboard.totalReferrals) * 100).toFixed(1) : '0'}%</p>
                      <p className="text-[9px] text-muted-foreground">Conversao</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-500">{((dashboard.commissionRate || 0) * 100).toFixed(0)}%</p>
                      <p className="text-[9px] text-muted-foreground">Comissao</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Referral Link Section */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <Card className="border-primary/20 overflow-hidden">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Share2 className="h-4 w-4 text-primary" />
                Compartilhe e ganhe
              </h3>

              {/* Link */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 bg-muted/50 rounded-xl px-3 py-2.5">
                  <code className="text-xs truncate block">{referralLink}</code>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 px-3 border-primary/30 hover:bg-primary/5 text-primary shrink-0"
                  onClick={copyLink}
                >
                  {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Button
                  className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-xl font-semibold text-sm"
                  onClick={shareWhatsApp}
                >
                  <Phone className="h-4 w-4" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="h-11 border-primary/30 hover:bg-primary/5 text-primary gap-2 rounded-xl font-semibold text-sm"
                  onClick={shareReferralLink}
                >
                  <Share2 className="h-4 w-4" />
                  Compartilhar
                </Button>
              </div>

              {/* Social buttons row */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Compartilhar:</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="h-8 w-8 min-h-[44px] min-w-[44px] rounded-lg bg-muted/50 flex items-center justify-center hover:bg-pink-100 dark:hover:bg-pink-900/20 transition-colors"
                  onClick={shareInstagram}
                >
                  <Instagram className="h-4 w-4 text-muted-foreground" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="h-8 w-8 min-h-[44px] min-w-[44px] rounded-lg bg-muted/50 flex items-center justify-center hover:bg-sky-100 dark:hover:bg-sky-900/20 transition-colors"
                  onClick={shareFacebook}
                >
                  <Facebook className="h-4 w-4 text-muted-foreground" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="h-8 w-8 min-h-[44px] min-w-[44px] rounded-lg bg-muted/50 flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors"
                  onClick={shareEmail}
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="h-8 w-8 min-h-[44px] min-w-[44px] rounded-lg bg-muted/50 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-colors"
                  onClick={copyLink}
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </motion.button>
              </div>

              {/* QR Code */}
              <div className="mt-4 flex items-center justify-center">
                <div className="h-32 w-32 bg-white rounded-xl border-2 border-primary/30 flex items-center justify-center overflow-hidden">
                  {qrCodeDataUrl ? (
                    <img src={qrCodeDataUrl} alt="QR Code de indicacao" className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1">
                      <QrCode className="h-10 w-10 text-primary/40" />
                      <p className="text-[10px] text-muted-foreground">QR Code</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Earnings Section */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.15 }}
          className="mb-4"
        >
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            Seus Ganhos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <Card className="border-amber-200/50 dark:border-amber-800/30 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10">
              <CardContent className="p-4 text-center">
                <p className="text-[10px] text-muted-foreground mb-1">Disponivel para saque</p>
                <p className="text-2xl font-bold text-primary">{formatBRLShort(dashboard.availableBalance)}</p>
                <Button
                  className="w-full mt-3 h-9 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-xs"
                  onClick={() => {
                    if (payoutInfo) {
                      setPayoutAmount(String(dashboard.availableBalance))
                    }
                    setPayoutDialogOpen(true)
                  }}
                  disabled={dashboard.availableBalance < (payoutInfo?.minPayoutAmount || 50)}
                >
                  <Wallet className="h-3.5 w-3.5 mr-1.5" />
                  {dashboard.availableBalance < (payoutInfo?.minPayoutAmount || 50)
                    ? `Min. R$${payoutInfo?.minPayoutAmount || 50}`
                    : 'Solicitar saque'}
                </Button>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-[10px] text-muted-foreground mb-1">Pendente (aguardando confirmacao)</p>
                <p className="text-2xl font-bold text-amber-500">{formatBRLShort(dashboard.pendingEarnings)}</p>
                <div className="mt-3 h-9 flex items-center justify-center">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Ate 7 dias</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bônus por Meta - Progress Bars */}
          <motion.div {...fadeUp} transition={{ delay: 0.18 }} className="mb-4">
            <Card className="border-amber-200/50 dark:border-amber-800/30 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Trophy className="h-4 w-4" />
                  Bônus por Meta
                </h4>
              </div>
              <CardContent className="p-4 space-y-4">
                {[
                  { target: 10, bonus: 50, label: '10 indicacoes', color: 'from-emerald-400 to-primary' },
                  { target: 25, bonus: 150, label: '25 indicacoes', color: 'from-amber-400 to-orange-500' },
                  { target: 50, bonus: 400, label: '50 indicacoes', color: 'from-purple-400 to-pink-500' },
                ].map((milestone, idx) => {
                  const progress = Math.min(100, ((dashboard.totalReferrals || 0) / milestone.target) * 100)
                  const isComplete = dashboard.totalReferrals >= milestone.target
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{milestone.label}</span>
                          {isComplete && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px] border-0 gap-1"><Check className="h-2.5 w-2.5" /> Concluido</Badge>}
                        </div>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">+R$ {milestone.bonus}</span>
                      </div>
                      <div className="h-2.5 bg-secondary/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ delay: 0.5 + idx * 0.15, duration: 0.6 }}
                          className={`h-full rounded-full bg-gradient-to-r ${milestone.color}`}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground">{dashboard.totalReferrals || 0}/{milestone.target}</span>
                        <span className="text-[10px] text-muted-foreground">{progress.toFixed(0)}%</span>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Ranking de Afiliados - Leaderboard */}
          <motion.div {...fadeUp} transition={{ delay: 0.20 }} className="mb-4">
            <Card className="border-border/50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Ranking de Afiliados
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {[
                    { name: 'Maria Silva', referrals: 47, earnings: 890, initials: 'MS' },
                    { name: 'Joao Santos', referrals: 35, earnings: 620, initials: 'JS' },
                    { name: 'Ana Oliveira', referrals: 28, earnings: 480, initials: 'AO' },
                    { name: 'Carlos Lima', referrals: 19, earnings: 310, initials: 'CL' },
                    { name: 'Voce', referrals: dashboard.totalReferrals, earnings: dashboard.totalEarnings, initials: 'EU', isYou: true },
                  ].map((affiliate, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + idx * 0.05 }}
                      className={`flex items-center gap-3 p-2 rounded-lg ${affiliate.isYou ? 'bg-primary/5 border border-primary/20' : 'hover:bg-secondary/50'} transition-colors`}
                    >
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : idx === 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' : idx === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-secondary text-muted-foreground'}`}>
                        {idx + 1}
                      </div>
                      <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${affiliate.isYou ? 'from-primary to-emerald-600' : idx === 0 ? 'from-amber-400 to-yellow-500' : 'from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-800/30'} flex items-center justify-center text-[10px] font-bold shrink-0`}>
                        {affiliate.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${affiliate.isYou ? 'text-primary' : ''}`}>{affiliate.name}</p>
                        <p className="text-[10px] text-muted-foreground">{affiliate.referrals} indicacoes</p>
                      </div>
                      <span className={`text-xs font-bold shrink-0 ${affiliate.isYou ? 'text-primary' : ''}`}>{formatBRLShort(affiliate.earnings)}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Comissões Recentes */}
          <motion.div {...fadeUp} transition={{ delay: 0.22 }} className="mb-4">
            <Card className="border-border/50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  Comissoes Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ScrollArea className="max-h-48">
                  <div className="space-y-2">
                    {dashboard.recentReferrals && dashboard.recentReferrals.length > 0 ? dashboard.recentReferrals.slice(0, 5).map((ref, idx) => (
                      <motion.div
                        key={ref.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + idx * 0.04 }}
                        className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{ref.referredUserName}</p>
                            <p className="text-[10px] text-muted-foreground">{formatDate(ref.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+{formatBRLShort(ref.commission)}</p>
                          <Badge className={`text-[9px] border-0 ${ref.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                            {ref.status === 'paid' ? 'Pago' : ref.status === 'pending' ? 'Pendente' : 'Ativo'}
                          </Badge>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="text-center py-4">
                        <p className="text-xs text-muted-foreground">Nenhuma comissao ainda</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Monthly target progress */}
          <Card className="border-border/50 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold flex items-center gap-1.5">
                  <TargetIcon className="h-4 w-4 text-amber-500" />
                  Indicacoes este mes
                </h4>
                <span className="text-xs font-semibold text-primary">
                  {dashboard.monthlyStats?.conversions || 0} conversoes
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{dashboard.monthlyStats?.referrals || 0} indicacoes no mes</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Comissao: {((dashboard.commissionRate || 0) * 100).toFixed(0)}%</p>
            </CardContent>
          </Card>

          {/* Payout History */}
          {payoutInfo?.recentPayoutHistory && payoutInfo.recentPayoutHistory.length > 0 && (
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              <Card className="border-border/50">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                    <History className="h-4 w-4 text-amber-500" />
                    Historico de saques
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ScrollArea className="max-h-48">
                    <div className="space-y-2">
                      {payoutInfo.recentPayoutHistory.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                              <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{item.details}</p>
                              <p className="text-[10px] text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400">
                            Pendente
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                  {payoutInfo.pendingPayouts > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-2 text-center">
                      {payoutInfo.pendingPayouts} saque{payoutInfo.pendingPayouts > 1 ? 's' : ''} pendente{payoutInfo.pendingPayouts > 1 ? 's' : ''}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Summary stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            <motion.div {...fadeUp} transition={{ delay: 0.22 }}>
              <Card className="border-border/50">
                <CardContent className="p-3 text-center">
                  <TrendingUp className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
                  <p className="text-sm font-bold">{formatBRLShort(dashboard.totalEarnings)}</p>
                  <p className="text-[9px] text-muted-foreground">Total ganho</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.24 }}>
              <Card className="border-border/50">
                <CardContent className="p-3 text-center">
                  <Gift className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                  <p className="text-sm font-bold">{((dashboard.commissionRate || 0) * 100).toFixed(0)}%</p>
                  <p className="text-[9px] text-muted-foreground">Comissao</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.26 }}>
              <Card className="border-border/50">
                <CardContent className="p-3 text-center">
                  <Star className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <p className="text-sm font-bold">{dashboard.totalConversions}</p>
                  <p className="text-[9px] text-muted-foreground">Conversoes</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Tabs for Referrals and Marketing */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="referrals" className="text-xs gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-3.5 w-3.5" />
              Indicacoes
            </TabsTrigger>
            <TabsTrigger value="marketing" className="text-xs gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Megaphone className="h-3.5 w-3.5" />
              Marketing
            </TabsTrigger>
          </TabsList>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="mt-0">
            {/* Filter chips */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3 mb-3">
              {[
                { key: 'all' as const, label: 'Todos', count: referralCounts.all },
                { key: 'active' as const, label: 'Ativos', count: referralCounts.active },
                { key: 'converted' as const, label: 'Convertidos', count: referralCounts.converted },
                { key: 'pending' as const, label: 'Pendentes', count: referralCounts.pending },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setReferralFilter(filter.key)}
                  className={`shrink-0 min-h-[44px] px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    referralFilter === filter.key
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/30'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* Referrals loading skeleton */}
            {referralsLoading && referrals.length === 0 ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="border-border/50">
                    <CardContent className="p-3 flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Referrals list */
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {filteredReferrals.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Card className="border-border/50">
                        <CardContent className="p-6 text-center">
                          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Nenhuma indicacao encontrada</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Compartilhe seu link e comece a indicar amigos!
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    filteredReferrals.map((referral, i) => (
                      <motion.div
                        key={referral.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Card className="border-border/50 hover:border-primary/20 transition-all">
                          <CardContent className="p-3 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/10 to-emerald-100 dark:from-primary/20 dark:to-emerald-900/20 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                              {referral.referredUserName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-sm truncate">{referral.referredUserName}</p>
                                <p className="font-semibold text-sm text-primary shrink-0 ml-2">
                                  {referral.commission > 0 ? `+${formatBRLShort(referral.commission)}` : '--'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-muted-foreground">{formatDate(referral.createdAt)}</span>
                                {getStatusBadge(getReferralStatus(referral))}
                              </div>
                              {/* Show order info if available */}
                              {referral.order && (
                                <div className="flex items-center gap-1 mt-1">
                                  <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-[10px] text-muted-foreground">
                                    Pedido {referral.order.orderNumber} - {formatBRLShort(referral.order.total)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>

                {/* Load more button */}
                {referralsHasMore && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-2"
                  >
                    <Button
                      variant="outline"
                      className="w-full h-10 text-xs gap-2 border-primary/20 hover:bg-primary/5 text-primary"
                      onClick={handleLoadMoreReferrals}
                      disabled={referralsLoading}
                    >
                      {referralsLoading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Carregando...
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          Carregar mais indicacoes
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Marketing Tab */}
          <TabsContent value="marketing" className="mt-0">
            {/* Banners */}
            <div className="mb-4">
              <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-primary" />
                Banners para compartilhar
              </h4>
              <div className="space-y-3">
                {[
                  { id: 'b1', gradient: 'from-primary to-emerald-600', title: 'DomPlace - Entregas em Dom Eliseu', desc: 'Peça online e receba na sua porta!' },
                  { id: 'b2', gradient: 'from-emerald-600 to-teal-600', title: 'Ganhe R$10 no primeiro pedido', desc: `Use o código ${dashboard?.referralCode || '...'}` },
                  { id: 'b3', gradient: 'from-amber-500 to-orange-600', title: 'Indique amigos, ganhe comissões', desc: 'Programa de afiliados DomPlace' },
                ].map((banner, i) => (
                  <motion.div
                    key={banner.id}
                    {...fadeUp}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card className="overflow-hidden">
                      <div className={`bg-gradient-to-r ${banner.gradient} p-5 text-white`}>
                        <p className="font-bold text-base">{banner.title}</p>
                        <p className="text-sm text-white/80 mt-1">{banner.desc}</p>
                      </div>
                      <CardContent className="p-3 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">DomPlace - {dashboard?.referralCode}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 min-h-[44px] min-w-[44px] text-xs text-primary hover:bg-primary/5 gap-1"
                          onClick={() => toast.success('Banner copiado!')}
                        >
                          <Copy className="h-3 w-3" />
                          Copiar
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            <Separator className="my-4 bg-border/50" />

            {/* Post templates */}
            <div className="mb-4">
              <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Modelos de postagem
              </h4>
              <div className="space-y-2">
                {[
                  { id: 't1', platform: 'WhatsApp', text: 'Ola! Descobri o DomPlace, o app de entregas de Dom Eliseu! Tem de tudo com entrega rapida. Use meu link e ganhe desconto: {link}' },
                  { id: 't2', platform: 'Instagram', text: '🚀 DomPlace - O marketplace de Dom Eliseu agora no seu celular! Mercado, acai, farmacia e muito mais com entrega na porta. Baixe agora: {link}' },
                  { id: 't3', platform: 'Facebook', text: 'Gente, descobri um app incrivel para pedidos em Dom Eliseu! O DomPlace tem tudo: mercado, restaurantes, farmacia, pet shop... Entrega rapida e preco bom. Indico demais! Link: {link}' },
                ].map((template, i) => (
                  <motion.div
                    key={template.id}
                    {...fadeUp}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card className="border-border/50">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-[10px] gap-1">
                            {template.platform === 'WhatsApp' && <Phone className="h-3 w-3" />}
                            {template.platform}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                          {template.text.replace('{link}', referralLink).replace('{code}', dashboard?.referralCode)}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 min-h-[44px] min-w-[44px] text-xs text-primary hover:bg-primary/5 gap-1"
                          onClick={() => {
                            navigator.clipboard.writeText(template.text.replace('{link}', referralLink).replace('{code}', dashboard?.referralCode))
                            toast.success('Texto copiado!')
                          }}
                        >
                          <Copy className="h-3 w-3" />
                          Copiar texto
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            <Separator className="my-4 bg-border/50" />

            {/* Custom link generator */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-emerald-50 dark:from-primary/10 dark:to-emerald-900/10">
              <CardContent className="p-4">
                <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5">
                  <UserPlus className="h-4 w-4 text-primary" />
                  Gerar link personalizado
                </h4>
                <p className="text-[10px] text-muted-foreground mb-3">
                  Adicione um identificador para rastrear suas campanhas
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: instagram-story, grupo-whatsapp"
                    className="h-9 text-xs"
                    value={customLinkId}
                    onChange={(e) => setCustomLinkId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateCustomLink()}
                  />
                  <Button
                    size="sm"
                    className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs shrink-0"
                    onClick={handleGenerateCustomLink}
                  >
                    Gerar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payout Confirmation Dialog */}
      <AlertDialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar saque</AlertDialogTitle>
            <AlertDialogDescription>
              Voce esta solicitando um saque de{' '}
              <span className="font-bold text-foreground">{formatBRL(parseFloat(payoutAmount) || 0)}</span>.
              O valor sera creditado em ate 2 dias uteis.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label className="text-xs text-muted-foreground mb-1 block">Valor do saque (R$)</Label>
            <Input
              type="number"
              min={payoutInfo?.minPayoutAmount || 50}
              max={dashboard.availableBalance}
              step={0.01}
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              className="h-11"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Minimo: R$ {payoutInfo?.minPayoutAmount || 50},00 | Disponivel: {formatBRLShort(dashboard.availableBalance)}
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={payoutLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handlePayout} disabled={payoutLoading}>
              {payoutLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar saque'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
