'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertTriangle, Info, CheckCircle2, ThumbsUp, MessageCircle, Phone, MapPin, Clock, Star, Eye, Send, Plus, ChevronRight, Zap, Heart } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

// ── Types ────────────────────────────────────────────────────────────────────
type AlertType = 'emergency' | 'alert' | 'info' | 'positive' | 'resolved'

interface SafetyScore { overall: number; lighting: number; traffic: number; security: number; cleanliness: number }

interface CommunityAlert { id: string; type: AlertType; title: string; description: string; author: string; time: string; location: string; likes: number; comments: number }

interface EmergencyContact { name: string; number: string; icon: React.ElementType; color: string }

// ── Constants & Mock Data ────────────────────────────────────────────────────
const safetyScore: SafetyScore = { overall: 7.8, lighting: 4, traffic: 3, security: 4, cleanliness: 3 }

const alerts: CommunityAlert[] = [
  { id: '1', type: 'alert', title: 'Buraco na Rua das Flores', description: 'Buraco grande na calçada em frente ao número 123. Cuidado ao passar, especialmente à noite.', author: 'Maria Silva', time: '2h atrás', location: 'Rua das Flores, 123', likes: 12, comments: 3 },
  { id: '2', type: 'info', title: 'Poste apagado na Av. Brasil', description: 'Poste de luz apagado há 3 dias. Período noturno muito escuro no trecho.', author: 'João Santos', time: '5h atrás', location: 'Av. Brasil, entre 450-460', likes: 8, comments: 1 },
  { id: '3', type: 'positive', title: 'Nova câmera instalada', description: 'A prefeitura instalou 2 novas câmeras de segurança na praça central.', author: 'Pedro Oliveira', time: '1d atrás', location: 'Praça Central', likes: 24, comments: 5 },
  { id: '4', type: 'emergency', title: 'Semáforo quebrado', description: 'Semáforo completamente apagado na esquina da Av. Paulista com R. Augusta. Muito perigoso.', author: 'Ana Costa', time: '30min atrás', location: 'Av. Paulista c/ R. Augusta', likes: 31, comments: 7 },
  { id: '5', type: 'resolved', title: 'Limpeza do parque completada', description: 'A prefeitura realizou a limpeza geral do Parque Municipal. Parque está excelente!', author: 'Carlos Lima', time: '2d atrás', location: 'Parque Municipal', likes: 18, comments: 2 },
  { id: '6', type: 'alert', title: 'Cão sem coleira', description: 'Cão de porte grande circulando sem coleira e sem dono próximo à escola municipal.', author: 'Fernanda Souza', time: '3h atrás', location: 'Escola Municipal, R. Ipê', likes: 15, comments: 4 },
]

const contacts: EmergencyContact[] = [
  { name: 'SAMU', number: '192', icon: Heart, color: '#ef4444' },
  { name: 'Polícia Militar', number: '190', icon: Shield, color: '#3b82f6' },
  { name: 'Bombeiros', number: '193', icon: Zap, color: '#f97316' },
  { name: 'Defesa Civil', number: '199', icon: AlertTriangle, color: '#8b5cf6' },
]

const ALERT_CONFIG: Record<AlertType, { label: string; emoji: string; bg: string; text: string }> = {
  emergency: { label: 'Emergência', emoji: '🔴', bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300' },
  alert: { label: 'Alerta', emoji: '🟡', bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300' },
  info: { label: 'Informação', emoji: '🔵', bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300' },
  positive: { label: 'Positivo', emoji: '🟢', bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300' },
  resolved: { label: 'Resolvido', emoji: '⚫', bg: 'bg-gray-100 dark:bg-gray-800/40', text: 'text-gray-700 dark:text-gray-300' },
}

const SCORE_CATEGORIES = [
  { key: 'lighting' as const, label: 'Iluminação' },
  { key: 'traffic' as const, label: 'Trânsito' },
  { key: 'security' as const, label: 'Segurança' },
  { key: 'cleanliness' as const, label: 'Limpeza' },
]

const CATEGORY_OPTIONS = [
  { value: 'buraco', label: 'Buraco' },
  { value: 'iluminacao', label: 'Iluminação' },
  { value: 'transito', label: 'Trânsito' },
  { value: 'limpeza', label: 'Limpeza' },
  { value: 'seguranca', label: 'Segurança' },
  { value: 'outros', label: 'Outros' },
]

const PRIORITY_OPTIONS = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
]

// ── Animation Variants ───────────────────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 280, damping: 22 } },
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-500'
  if (score >= 5) return 'text-yellow-500'
  return 'text-red-500'
}

function getScoreBadge(score: number): string {
  if (score >= 8) return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
  if (score >= 5) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
  return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="r84-watch-stars flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
        />
      ))}
    </div>
  )
}

// ── Loading Skeleton ─────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="r84-watch-skeleton animate-pulse space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-muted" />
        <div className="h-8 w-48 rounded-lg bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-32 rounded-xl bg-muted" />
        <div className="h-32 rounded-xl bg-muted" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 rounded-xl bg-muted" />
      ))}
    </div>
  )
}

// ── Safety Score Card ────────────────────────────────────────────────────────
function SafetyScoreCard({ score }: { score: SafetyScore }) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    let current = 0
    const target = score.overall
    const step = target / 30
    const interval = setInterval(() => {
      current += step
      if (current >= target) { setAnimatedScore(target); clearInterval(interval) }
      else { setAnimatedScore(Number(current.toFixed(1))) }
    }, 30)
    return () => clearInterval(interval)
  }, [score.overall])

  return (
    <motion.div variants={cardVariants} className="r84-watch-score-card">
      <Card className="r62-card-lift overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Nota de Segurança</p>
              <div className="flex items-center gap-3">
                <motion.span
                  className={`text-4xl font-black ${getScoreColor(animatedScore)}`}
                  key={Math.round(animatedScore)}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {animatedScore.toFixed(1)}
                </motion.span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getScoreBadge(animatedScore)}`}>
                  {animatedScore >= 8 ? 'Bom' : animatedScore >= 5 ? 'Moderado' : 'Baixo'}
                </span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="space-y-3">
            {SCORE_CATEGORIES.map((cat) => (
              <div key={cat.key} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{cat.label}</span>
                <StarRating rating={score[cat.key]} />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Última atualização: 2 horas atrás</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ── Alert Card ────────────────────────────────────────────────────────────────
function AlertCard({ alert, onLike }: { alert: CommunityAlert; onLike: (id: string) => void }) {
  const config = ALERT_CONFIG[alert.type]

  return (
    <motion.div variants={cardVariants} layout className="r84-watch-alert-card">
      <Card className="r62-card-lift overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0 mt-0.5" aria-hidden="true">{config.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="secondary" className={`text-[10px] font-bold px-2 py-0.5 rounded-full border-0 ${config.bg} ${config.text}`}>
                  {config.label}
                </Badge>
                <h4 className="text-sm font-bold text-foreground leading-snug">{alert.title}</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">{alert.description}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 flex-wrap">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{alert.location}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{alert.time}</span>
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{alert.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => onLike(alert.id)}
                  className="r84-watch-like-btn flex items-center gap-1.5 min-h-[44px] min-w-[44px] px-3 rounded-lg text-xs font-semibold bg-muted/50 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-colors"
                  aria-label="Curtir"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{alert.likes}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  className="r84-watch-comment-btn flex items-center gap-1.5 min-h-[44px] min-w-[44px] px-3 rounded-lg text-xs font-semibold bg-muted/50 text-muted-foreground hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 transition-colors"
                  aria-label="Comentar"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{alert.comments}</span>
                </motion.button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ── Report Incident Form ────────────────────────────────────────────────────
function ReportForm() {
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = () => {
    if (!category || !priority || !description.trim()) {
      toast.error('Preencha todos os campos obrigatórios.')
      return
    }
    toast.success('Relato enviado com sucesso! Obrigado por contribuir.')
    setCategory('')
    setPriority('')
    setDescription('')
  }

  return (
    <motion.div variants={cardVariants} className="r84-watch-form">
      <Card className="r62-card-lift overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-5 w-5 text-amber-500" />
            Enviar Relato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Categoria</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="min-h-[44px] w-full">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Prioridade</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="min-h-[44px] w-full">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Descrição</label>
            <Input
              placeholder="Descreva a situação..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[44px]"
            />
          </div>
          <Button
            onClick={handleSubmit}
            className="r84-watch-submit-btn min-h-[44px] w-full bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-bold"
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar Relato
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ── Emergency Contacts ────────────────────────────────────────────────────────
function EmergencyContacts() {
  return (
    <motion.div variants={cardVariants} className="r84-watch-contacts">
      <Card className="r62-card-lift overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-5 w-5 text-red-500" />
            Contatos de Emergência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {contacts.map((contact) => {
              const IconComp = contact.icon
              return (
                <motion.div
                  key={contact.number}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="r84-watch-contact-card flex flex-col items-center gap-2 p-3 rounded-xl border border-border/50 bg-muted/30 text-center"
                >
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${contact.color}20`, color: contact.color }}
                  >
                    <IconComp className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold text-foreground leading-tight">{contact.name}</p>
                  <p className="text-lg font-black leading-none" style={{ color: contact.color }}>{contact.number}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="r84-watch-call-btn min-h-[44px] min-w-[44px] text-xs font-semibold mt-1"
                  >
                    <Phone className="h-3.5 w-3.5 mr-1" />
                    Ligar
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ── Community Stats ───────────────────────────────────────────────────────────
function CommunityStats() {
  const total = 12
  const resolved = 8
  const pending = 4
  const rate = Math.round((resolved / total) * 100)

  return (
    <motion.div variants={cardVariants} className="r84-watch-stats">
      <Card className="r62-card-lift overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <ChevronRight className="h-4 w-4 text-amber-500" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Esta semana</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <p className="text-2xl font-black text-foreground">{total}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Relatos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-green-500">{resolved}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Resolvidos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-amber-500">{pending}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Em andamento</p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-muted-foreground">Taxa de resolução</span>
              <span className="text-xs font-bold text-green-600">{rate}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${rate}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
export function NeighborhoodWatch() {
  const [loading, setLoading] = useState(true)
  const [alertList, setAlertList] = useState(alerts)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleLike = (id: string) => {
    setAlertList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, likes: a.likes + 1 } : a))
    )
  }

  if (loading) return <Skeleton />

  return (
    <section className="r62-card-lift w-full max-w-7xl mx-auto px-4 sm:px-6 py-6" aria-label="Vizinho Solidário">
      {/* Header */}
      <div className="r84-watch-header mb-6">
        <div className="flex items-center gap-3 mb-1">
          <motion.div
            className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Shield className="h-5 w-5 text-white" />
          </motion.div>
          <h2 className="r62-heading-gradient text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Vizinho Solidário
          </h2>
        </div>
        <p className="text-sm text-muted-foreground ml-13">Segurança comunitária e observação do bairro</p>
      </div>

      {/* Safety Score + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <SafetyScoreCard score={safetyScore} />
        <CommunityStats />
      </div>

      <Separator className="mb-6" />

      {/* Community Alerts */}
      <div className="r84-watch-alerts mb-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className="r62-heading-gradient text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            Alertas da Comunidade
          </h3>
        </div>
        <AnimatePresence>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {alertList.map((alert) => (
              <AlertCard key={alert.id} alert={alert} onLike={handleLike} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <Separator className="mb-6" />

      {/* Report Form + Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ReportForm />
        <EmergencyContacts />
      </div>
    </section>
  )
}

export default NeighborhoodWatch
