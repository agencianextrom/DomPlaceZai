'use client'

import { useState } from 'react'
import {
  Users, Copy, Check, Share2, QrCode, DollarSign, TrendingUp,
  Gift, ChevronRight, Star, Phone, Mail, Instagram, Facebook,
  BarChart3, Wallet, ArrowUpRight, ArrowDownRight, ExternalLink,
  UserPlus, ShoppingCart, Eye, Megaphone, Image as ImageIcon,
  Sparkles, Trophy, Clock, Filter
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAppStore } from '@/store/useAppStore'

// Mock data
const mockAffiliate = {
  name: 'Ana Oliveira',
  initials: 'AO',
  referralCode: 'ANADEP25',
  referralLink: 'https://domplace.com/convite/ANADEP25',
  commissionRate: 3,
  totalReferrals: 24,
  totalConversions: 18,
  pendingEarnings: 67.50,
  availableBalance: 215.00,
  totalEarnings: 842.50,
  monthlyTarget: 500,
  monthlyProgress: 65,
}

const mockReferrals = [
  { id: 'r1', name: 'Pedro Santos', date: '15/04/2025', status: 'active' as const, commission: 12.50, orderValue: 416.67 },
  { id: 'r2', name: 'Julia Costa', date: '14/04/2025', status: 'active' as const, commission: 8.25, orderValue: 275.00 },
  { id: 'r3', name: 'Lucas Mendes', date: '13/04/2025', status: 'converted' as const, commission: 15.00, orderValue: 500.00 },
  { id: 'r4', name: 'Camila Ferreira', date: '12/04/2025', status: 'active' as const, commission: 6.75, orderValue: 225.00 },
  { id: 'r5', name: 'Rafael Lima', date: '10/04/2025', status: 'converted' as const, commission: 18.00, orderValue: 600.00 },
  { id: 'r6', name: 'Beatriz Alves', date: '08/04/2025', status: 'converted' as const, commission: 9.00, orderValue: 300.00 },
  { id: 'r7', name: 'Gabriel Souza', date: '05/04/2025', status: 'pending' as const, commission: 0, orderValue: 0 },
  { id: 'r8', name: 'Isabela Pereira', date: '03/04/2025', status: 'active' as const, commission: 7.50, orderValue: 250.00 },
]

const mockMonthlyChart = [
  { month: 'Jan', amount: 85.00 },
  { month: 'Fev', amount: 120.00 },
  { month: 'Mar', amount: 95.00 },
  { month: 'Abr', amount: 180.00 },
  { month: 'Mai', amount: 145.00 },
  { month: 'Jun', amount: 215.00 },
]

const mockBanners = [
  { id: 'b1', title: 'Ganhe 10% de volta', desc: 'Indique amigos e ganhe 10% de cashback nas compras deles!', gradient: 'from-primary to-emerald-600' },
  { id: 'b2', title: 'Dom Eliseu entrega tudo', desc: 'De acai a agropecuaria, tudo chega na sua porta!', gradient: 'from-amber-500 to-orange-500' },
  { id: 'b3', title: 'Primeira compra gratis', desc: 'Seus indicados ganham frete gratis na primeira compra!', gradient: 'from-teal-500 to-cyan-500' },
]

const mockPostTemplates = [
  {
    id: 't1',
    platform: 'WhatsApp',
    text: 'Opa! Descobri o DomPlace, o app de entregas de Dom Eliseu! Tem de tudo: mercado, acai, farmacia, pet shop e mais. Baixe com meu link e ganhe R$10 de desconto: {link}',
    icon: 'MessageCircle',
    color: 'text-emerald-600',
  },
  {
    id: 't2',
    platform: 'Instagram',
    text: 'Dom Eliseu agora tem delivery de verdade! No DomPlace voce encontra de tudo com entrega rapida. Use meu codigo {code} e ganhe desconto na primeira compra! {link}',
    icon: 'Instagram',
    color: 'text-pink-600',
  },
  {
    id: 't3',
    platform: 'Facebook',
    text: 'Moradores de Dom Eliseu! O DomPlace facilitou minha vida. Encomendo de varias lojas sem sair de casa. Indico demais! {link}',
    icon: 'Facebook',
    color: 'text-sky-600',
  },
]

export function AffiliateDashboard() {
  const { navigate } = useAppStore()
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [referralFilter, setReferralFilter] = useState<'all' | 'active' | 'converted' | 'pending'>('all')

  const filteredReferrals = referralFilter === 'all'
    ? mockReferrals
    : mockReferrals.filter(r => r.status === referralFilter)

  const copyCode = () => {
    navigator.clipboard.writeText(mockAffiliate.referralCode)
    setCopiedCode(true)
    toast.success('Codigo copiado!')
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(mockAffiliate.referralLink)
    setCopiedLink(true)
    toast.success('Link copiado!')
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Opa! Descobri o DomPlace, o app de entregas de Dom Eliseu! Baixe com meu link e ganhe R$10 de desconto: ${mockAffiliate.referralLink}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
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
        return null
    }
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
            <h1 className="text-lg font-bold">Painel do Afiliado</h1>
            <div className="w-10" />
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
                {mockAffiliate.initials}
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-amber-300 border-2 border-orange-500 flex items-center justify-center">
                <Star className="h-3 w-3 text-orange-700" />
              </div>
            </motion.div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{mockAffiliate.name}</h2>
              <p className="text-sm text-white/70 mt-0.5">Afiliado desde Jan 2025</p>
            </div>
          </div>

          {/* Referral code card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative mt-4 bg-white/15 backdrop-blur-sm rounded-2xl p-4"
          >
            <p className="text-[10px] text-white/60 uppercase tracking-wider mb-2">Seu codigo de indicacao</p>
            <div className="flex items-center gap-2">
              <code className="text-xl font-bold tracking-widest flex-1">{mockAffiliate.referralCode}</code>
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
          <div className="relative grid grid-cols-4 gap-2 mt-4">
            {[
              { icon: Users, label: 'Indicacoes', value: mockAffiliate.totalReferrals },
              { icon: ShoppingCart, label: 'Conversoes', value: mockAffiliate.totalConversions },
              { icon: Clock, label: 'Pendente', value: `R$ ${mockAffiliate.pendingEarnings.toFixed(0).replace('.', ',')}` },
              { icon: Trophy, label: 'Total', value: `R$ ${mockAffiliate.totalEarnings.toFixed(0).replace('.', ',')}` },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.06 }}
                className="bg-white/15 backdrop-blur-sm rounded-xl p-2.5 text-center"
              >
                <stat.icon className="h-4 w-4 mx-auto mb-1 opacity-80" />
                <p className="text-sm font-bold">{stat.value}</p>
                <p className="text-[9px] text-white/60">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <svg className="absolute bottom-0 left-0 right-0 z-10" viewBox="0 0 1440 24" fill="none" preserveAspectRatio="none">
          <path d="M0 12C240 22 480 2 720 12C960 22 1200 2 1440 12V24H0V12Z" fill="oklch(0.99 0.002 120)" className="dark:hidden" />
          <path d="M0 12C240 22 480 2 720 12C960 22 1200 2 1440 12V24H0V12Z" fill="oklch(0.15 0.015 150)" className="hidden dark:block" />
        </svg>
      </motion.div>

      <div className="px-4 mt-2">
        {/* Referral Link Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
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
                  <code className="text-xs truncate block">{mockAffiliate.referralLink}</code>
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
                  onClick={copyLink}
                >
                  <Share2 className="h-4 w-4" />
                  Copiar Link
                </Button>
              </div>

              {/* Social buttons row */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Compartilhar:</span>
                {[Instagram, Facebook, Mail, ExternalLink].map((Icon, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
                    onClick={() => toast.success('Link copiado para compartilhar!')}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </motion.button>
                ))}
              </div>

              {/* QR Code placeholder */}
              <div className="mt-4 flex items-center justify-center">
                <div className="h-32 w-32 bg-white rounded-xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-1">
                  <QrCode className="h-10 w-10 text-primary/40" />
                  <p className="text-[10px] text-muted-foreground">QR Code</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Earnings Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4"
        >
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            Seus Ganhos
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card className="border-amber-200/50 dark:border-amber-800/30 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10">
              <CardContent className="p-4 text-center">
                <p className="text-[10px] text-muted-foreground mb-1">Disponivel para saque</p>
                <p className="text-2xl font-bold text-primary">R$ {mockAffiliate.availableBalance.toFixed(2).replace('.', ',')}</p>
                <Button
                  className="w-full mt-3 h-9 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-xs"
                  onClick={() => toast.success('Solicitacao de saque enviada! Voce recebera em ate 2 dias uteis.')}
                >
                  Sacar
                </Button>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-[10px] text-muted-foreground mb-1">Pendente (aguardando confirmacao)</p>
                <p className="text-2xl font-bold text-amber-500">R$ {mockAffiliate.pendingEarnings.toFixed(2).replace('.', ',')}</p>
                <div className="mt-3 h-9 flex items-center justify-center">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Ate 7 dias</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly target progress */}
          <Card className="border-border/50 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold flex items-center gap-1.5">
                  <TargetIcon className="h-4 w-4 text-amber-500" />
                  Meta mensal
                </h4>
                <span className="text-xs font-semibold text-primary">{mockAffiliate.monthlyProgress}%</span>
              </div>
              <Progress value={mockAffiliate.monthlyProgress} className="h-2.5 mb-2" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">R$ {mockAffiliate.monthlyProgress * mockAffiliate.monthlyTarget / 100} de R$ {mockAffiliate.monthlyTarget}</span>
                <span className="text-[10px] text-muted-foreground">Comissao: {mockAffiliate.commissionRate}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Monthly chart */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-primary" />
                Ganhos por mes
              </h4>
              <div className="flex items-end gap-2 h-28">
                {mockMonthlyChart.map((m, i) => {
                  const maxAmount = Math.max(...mockMonthlyChart.map(d => d.amount))
                  const height = (m.amount / maxAmount) * 100
                  const isCurrentMonth = i === mockMonthlyChart.length - 1
                  return (
                    <motion.div
                      key={m.month}
                      className="flex-1 flex flex-col items-center gap-1"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <span className="text-[9px] font-medium text-muted-foreground">R${m.amount.toFixed(0)}</span>
                      <div className="w-full flex items-end" style={{ height: '64px' }}>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: i * 0.08, duration: 0.5 }}
                          className={`w-full rounded-t-lg ${isCurrentMonth ? 'bg-gradient-to-t from-amber-500 to-orange-400' : 'bg-gradient-to-t from-primary/30 to-primary/50'}`}
                        />
                      </div>
                      <span className={`text-[9px] ${isCurrentMonth ? 'font-bold text-amber-600' : 'text-muted-foreground'}`}>
                        {m.month}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs for Referrals and Marketing */}
        <Tabs defaultValue="referrals" className="w-full">
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
                { key: 'all' as const, label: 'Todos', count: mockReferrals.length },
                { key: 'active' as const, label: 'Ativos', count: mockReferrals.filter(r => r.status === 'active').length },
                { key: 'converted' as const, label: 'Convertidos', count: mockReferrals.filter(r => r.status === 'converted').length },
                { key: 'pending' as const, label: 'Pendentes', count: mockReferrals.filter(r => r.status === 'pending').length },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setReferralFilter(filter.key)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    referralFilter === filter.key
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/30'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* Referrals list */}
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredReferrals.map((referral, i) => (
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
                          {referral.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm truncate">{referral.name}</p>
                            <p className="font-semibold text-sm text-primary shrink-0 ml-2">
                              {referral.commission > 0 ? `+R$ ${referral.commission.toFixed(2).replace('.', ',')}` : '--'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">{referral.date}</span>
                            {getStatusBadge(referral.status)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
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
                {mockBanners.map((banner, i) => (
                  <motion.div
                    key={banner.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card className="overflow-hidden">
                      <div className={`bg-gradient-to-r ${banner.gradient} p-5 text-white`}>
                        <p className="font-bold text-base">{banner.title}</p>
                        <p className="text-sm text-white/80 mt-1">{banner.desc}</p>
                      </div>
                      <CardContent className="p-3 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">DomPlace - {mockAffiliate.referralCode}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-primary hover:bg-primary/5 gap-1"
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
                {mockPostTemplates.map((template, i) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
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
                          {template.text.replace('{link}', mockAffiliate.referralLink).replace('{code}', mockAffiliate.referralCode)}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-primary hover:bg-primary/5 gap-1"
                          onClick={() => {
                            navigator.clipboard.writeText(template.text.replace('{link}', mockAffiliate.referralLink).replace('{code}', mockAffiliate.referralCode))
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
                  />
                  <Button
                    size="sm"
                    className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs shrink-0"
                    onClick={() => toast.success('Link personalizado gerado!')}
                  >
                    Gerar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
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
