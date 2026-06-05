'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Headphones, Plus, Search, Filter, ChevronDown, ChevronRight,
  Clock, MessageSquare, AlertTriangle, CheckCircle2, CircleX,
  Paperclip, Send, ArrowLeft, X, Package, CreditCard, Truck,
  UserCircle, Star, Loader2, Check, Ticket, TrendingUp,
  Heart, BarChart3, Inbox,
} from 'lucide-react'

// ---- Types ----
type Priority = 'alta' | 'media' | 'baixa'
type TicketStatus = 'aberto' | 'em_andamento' | 'resolvido' | 'fechado'
type Category = 'todos' | 'pedidos' | 'pagamentos' | 'entregas' | 'conta'

interface TicketMessage {
  id: string
  sender: 'user' | 'support'
  senderName: string
  content: string
  timestamp: string
  avatar?: string
}

interface SupportTicket {
  id: string
  ticketId: string
  subject: string
  category: Exclude<Category, 'todos'>
  priority: Priority
  status: TicketStatus
  orderId?: string
  lastUpdate: string
  createdAt: string
  messages: TicketMessage[]
}

// ---- Priority Config ----
const priorityConfig = {
  alta: { label: 'Alta', color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)', borderColor: '#ef4444', cssClass: 'r36-ticket-priority-high' },
  media: { label: 'Média', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)', borderColor: '#f59e0b', cssClass: 'r36-ticket-priority-medium' },
  baixa: { label: 'Baixa', color: '#22c55e', bgColor: 'rgba(34,197,94,0.1)', borderColor: '#22c55e', cssClass: 'r36-ticket-priority-low' },
}

// ---- Status Config ----
const statusConfig: Record<TicketStatus, { label: string; dotColor: string; textColor: string; bgColor: string }> = {
  aberto: { label: 'Aberto', dotColor: '#22c55e', textColor: '#16a34a', bgColor: 'rgba(34,197,94,0.1)' },
  em_andamento: { label: 'Em Andamento', dotColor: '#f59e0b', textColor: '#d97706', bgColor: 'rgba(245,158,11,0.1)' },
  resolvido: { label: 'Resolvido', dotColor: '#3b82f6', textColor: '#2563eb', bgColor: 'rgba(59,130,246,0.1)' },
  fechado: { label: 'Fechado', dotColor: '#6b7280', textColor: '#4b5563', bgColor: 'rgba(107,114,128,0.1)' },
}

// ---- Category Config ----
const categoryConfig: Record<Category, { label: string; icon: typeof Package }> = {
  todos: { label: 'Todos', icon: Filter },
  pedidos: { label: 'Pedidos', icon: Package },
  pagamentos: { label: 'Pagamentos', icon: CreditCard },
  entregas: { label: 'Entregas', icon: Truck },
  conta: { label: 'Conta', icon: UserCircle },
}

// ---- Mock Tickets ----
const mockTickets: SupportTicket[] = [
  {
    id: 't1',
    ticketId: 'SUP-2847',
    subject: 'Pedido não foi entregue após 5 dias',
    category: 'entregas',
    priority: 'alta',
    status: 'aberto',
    orderId: 'PED-98234',
    lastUpdate: 'Atualizado há 2h',
    createdAt: '2024-01-15T10:30:00',
    messages: [
      { id: 'm1', sender: 'user', senderName: 'Maria Silva', content: 'Olá, fiz um pedido há 5 dias e ele ainda não foi entregue. O prazo informado era de até 3 dias úteis. Gostaria de saber o que está acontecendo.', timestamp: '15/01/2024 10:30' },
      { id: 'm2', sender: 'support', senderName: 'Rafael — Suporte', content: 'Olá Maria! Verifiquei seu pedido PED-98234 e identificamos que houve um problema na rota de entrega. Já acionamos o entregador. Vamos resolver isso o mais rápido possível. Você será notificada assim que tivermos atualizações.', timestamp: '15/01/2024 11:45' },
      { id: 'm3', sender: 'user', senderName: 'Maria Silva', content: 'Obrigada pelo retorno. Quando devo esperar a entrega?', timestamp: '15/01/2024 12:00' },
    ],
  },
  {
    id: 't2',
    ticketId: 'SUP-2846',
    subject: 'Pagamento duplicado no cartão de crédito',
    category: 'pagamentos',
    priority: 'alta',
    status: 'em_andamento',
    orderId: 'PED-98156',
    lastUpdate: 'Atualizado há 5h',
    createdAt: '2024-01-15T08:00:00',
    messages: [
      { id: 'm4', sender: 'user', senderName: 'João Santos', content: 'Fui cobrado duas vezes pelo mesmo pedido no meu cartão de crédito. Valor de R$ 89,90 debitado duas vezes.', timestamp: '15/01/2024 08:00' },
      { id: 'm5', sender: 'support', senderName: 'Carla — Suporte', content: 'Oi João! Desculpe pelo transtorno. Estou verificando a transação junto à operadora do cartão. O estorno da cobrança duplicada será processado em até 2 faturas. Vou manter você informado.', timestamp: '15/01/2024 09:20' },
    ],
  },
  {
    id: 't3',
    ticketId: 'SUP-2845',
    subject: 'Produto veio com defeito de fabricação',
    category: 'pedidos',
    priority: 'media',
    status: 'aberto',
    orderId: 'PED-97988',
    lastUpdate: 'Atualizado há 1d',
    createdAt: '2024-01-14T16:45:00',
    messages: [
      { id: 'm6', sender: 'user', senderName: 'Ana Costa', content: 'Recebi um fone de bluetooth que não liga de jeito nenhum. Testei em vários aparelhos e nada. Preciso de uma troca urgente.', timestamp: '14/01/2024 16:45' },
      { id: 'm7', sender: 'support', senderName: 'Pedro — Suporte', content: 'Oi Ana! Pode nos enviar fotos do produto e da embalagem? Precisamos documentar para acionar a garantia do fabricante. Assim que receber as fotos, iniciaremos o processo de troca.', timestamp: '14/01/2024 17:30' },
      { id: 'm8', sender: 'user', senderName: 'Ana Costa', content: 'Claro, vou enviar as fotos agora mesmo.', timestamp: '14/01/2024 17:35' },
    ],
  },
  {
    id: 't4',
    ticketId: 'SUP-2844',
    subject: 'Não consigo acessar minha conta',
    category: 'conta',
    priority: 'media',
    status: 'resolvido',
    lastUpdate: 'Atualizado há 2d',
    createdAt: '2024-01-13T09:15:00',
    messages: [
      { id: 'm9', sender: 'user', senderName: 'Carlos Oliveira', content: 'Tentei fazer login várias vezes mas não consigo. Sempre aparece "E-mail ou senha incorretos" mesmo tendo certeza das credenciais.', timestamp: '13/01/2024 09:15' },
      { id: 'm10', sender: 'support', senderName: 'Luciana — Suporte', content: 'Carlos, encontrei o problema. Sua conta estava com verificação de e-mail pendente. Enviamos um novo link de verificação. Por favor, verifique sua caixa de entrada e spam.', timestamp: '13/01/2024 09:50' },
      { id: 'm11', sender: 'user', senderName: 'Carlos Oliveira', content: 'Funcionou! Obrigado pela ajuda rápida!', timestamp: '13/01/2024 10:05' },
      { id: 'm12', sender: 'support', senderName: 'Luciana — Suporte', content: 'Que bom! Estou marcando este ticket como resolvido. Qualquer dúvida, estamos à disposição. 😊', timestamp: '13/01/2024 10:10' },
    ],
  },
  {
    id: 't5',
    ticketId: 'SUP-2843',
    subject: 'Entregador não seguiu as instruções de entrega',
    category: 'entregas',
    priority: 'baixa',
    status: 'fechado',
    orderId: 'PED-97802',
    lastUpdate: 'Atualizado há 3d',
    createdAt: '2024-01-12T14:20:00',
    messages: [
      { id: 'm13', sender: 'user', senderName: 'Fernanda Lima', content: 'Deixaram o pacote na portaria quando a instrução era para entregar na porta do apartamento 302. Tive que ir buscar no térreo.', timestamp: '12/01/2024 14:20' },
      { id: 'm14', sender: 'support', senderName: 'Tiago — Suporte', content: 'Fernanda, pedimos desculpas pela inconveniência. Registramos uma notificação para o entregador e atualizamos suas instruções de entrega no sistema. Isso não deve se repetir.', timestamp: '12/01/2024 15:00' },
    ],
  },
  {
    id: 't6',
    ticketId: 'SUP-2842',
    subject: 'Dúvida sobre cupom de desconto não aplicado',
    category: 'pagamentos',
    priority: 'baixa',
    status: 'resolvido',
    orderId: 'PED-97701',
    lastUpdate: 'Atualizado há 4d',
    createdAt: '2024-01-11T11:30:00',
    messages: [
      { id: 'm15', sender: 'user', senderName: 'Roberto Almeida', content: 'Usei o cupom DOMPLACE10 na compra mas o desconto de 10% não foi aplicado no valor final.', timestamp: '11/01/2024 11:30' },
      { id: 'm16', sender: 'support', senderName: 'Mariana — Suporte', content: 'Roberto, verifiquei e o cupom estava com uma restrição: válido apenas para compras acima de R$ 50. Seu carrinho tinha R$ 42,90. No entanto, como o cupom é válido até o final do mês, você pode usá-lo na próxima compra!', timestamp: '11/01/2024 12:15' },
      { id: 'm17', sender: 'user', senderName: 'Roberto Almeida', content: 'Entendi, obrigado por explicar! Vou aproveitar na próxima.', timestamp: '11/01/2024 12:30' },
    ],
  },
]

// ---- Helper: get initials ----
function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

// ---- Confetti particles ----
function ConfettiParticles() {
  const particles = useMemo(() => {
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 300 - 150,
      y: -(Math.random() * 200 + 80),
      rotation: Math.random() * 360,
      scale: 0.6 + Math.random() * 0.8,
      color: colors[i % colors.length],
      delay: Math.random() * 0.3,
    }))
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            width: 8,
            height: 8,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            backgroundColor: p.color,
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotation, scale: p.scale }}
          transition={{ duration: 1.2, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

// ---- Toast Component ----
interface ToastData {
  id: string
  type: 'success' | 'error'
  message: string
}

function ToastNotification({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: string) => void }) {
  const config = toast.type === 'success'
    ? { icon: CheckCircle2, borderColor: 'rgba(34,197,94,0.3)', bgColor: 'rgba(34,197,94,0.08)', iconColor: '#22c55e' }
    : { icon: CircleX, borderColor: 'rgba(239,68,68,0.3)', bgColor: 'rgba(239,68,68,0.08)', iconColor: '#ef4444' }
  const Icon = config.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm max-w-sm"
      style={{
        borderColor: config.borderColor,
        backgroundColor: config.bgColor,
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      }}
    >
      <Icon className="h-5 w-5 shrink-0" style={{ color: config.iconColor }} />
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

// ---- Main Component ----
export function SupportTicketSystem() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null)
  const [showNewTicketModal, setShowNewTicketModal] = useState(false)
  const [toasts, setToasts] = useState<ToastData[]>([])

  // New ticket form state
  const [newTicketSubject, setNewTicketSubject] = useState('')
  const [newTicketCategory, setNewTicketCategory] = useState<Exclude<Category, 'todos'> | ''>('')
  const [newTicketPriority, setNewTicketPriority] = useState<Priority | ''>('')
  const [newTicketDescription, setNewTicketDescription] = useState('')
  const [newTicketOrderId, setNewTicketOrderId] = useState('')
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false)
  const [isTicketSubmitted, setIsTicketSubmitted] = useState(false)

  // Reply state
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  // Toast helpers
  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = `toast-${Date.now()}`
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Filter tickets
  const filteredTickets = useMemo(() => {
    let result = mockTickets
    if (selectedCategory !== 'todos') {
      result = result.filter((t) => t.category === selectedCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.ticketId.toLowerCase().includes(q) ||
          t.orderId?.toLowerCase().includes(q)
      )
    }
    return result
  }, [selectedCategory, searchQuery])

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = {
      todos: mockTickets.length,
      pedidos: 0,
      pagamentos: 0,
      entregas: 0,
      conta: 0,
    }
    mockTickets.forEach((t) => {
      if (t.category in counts) {
        counts[t.category]++
      }
    })
    return counts
  }, [])

  // Quick stats
  const quickStats = useMemo(() => ({
    openTickets: mockTickets.filter((t) => t.status === 'aberto').length,
    avgResponseTime: '2h 15min',
    satisfactionRate: '94% satisfeitos',
    resolutionRate: '87% resolvidos',
  }), [])

  // Toggle ticket detail
  const toggleTicketDetail = (ticketId: string) => {
    setExpandedTicketId((prev) => (prev === ticketId ? null : ticketId))
    setReplyText('')
  }

  // Send reply
  const handleSendReply = async () => {
    if (!replyText.trim()) return
    setSendingReply(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setSendingReply(false)
    setReplyText('')
    addToast('success', 'Resposta enviada com sucesso!')
  }

  // Submit new ticket
  const handleSubmitNewTicket = async () => {
    if (!newTicketSubject.trim() || !newTicketCategory || !newTicketPriority || !newTicketDescription.trim()) {
      addToast('error', 'Preencha todos os campos obrigatórios')
      return
    }
    setIsSubmittingTicket(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSubmittingTicket(false)
    setIsTicketSubmitted(true)
    addToast('success', `Ticket #SUP-${Math.floor(Math.random() * 9000) + 1000} criado com sucesso!`)
  }

  // Reset new ticket form
  const resetNewTicketForm = () => {
    setShowNewTicketModal(false)
    setIsTicketSubmitted(false)
    setNewTicketSubject('')
    setNewTicketCategory('')
    setNewTicketPriority('')
    setNewTicketDescription('')
    setNewTicketOrderId('')
  }

  return (
    <div className="min-h-screen pb-24 relative">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastNotification key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30 -mx-4 px-4 -mt-4 pt-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
            className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg"
            style={{ boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}
          >
            <Headphones className="h-5 w-5 text-white" />
          </motion.div>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Central de Atendimento</h1>
            <p className="text-xs text-muted-foreground">Gerencie seus tickets de suporte</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">{quickStats.openTickets}</span>
              <span className="text-[10px] text-amber-600/70 dark:text-amber-500/70">abertos</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setShowNewTicketModal(true); setIsTicketSubmitted(false) }}
              className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold overflow-hidden"
              style={{ boxShadow: '0 4px 16px rgba(16,185,129,0.25)' }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-[shimmer_2s_infinite]" />
              <Plus className="h-4 w-4 relative" />
              <span className="relative">Novo Ticket</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto space-y-5">

        {/* Quick Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2"
        >
          {[
            { label: 'Abertos', value: quickStats.openTickets.toString(), icon: Ticket, color: '#f59e0b', glow: 'rgba(245,158,11,0.15)' },
            { label: 'Tempo médio', value: quickStats.avgResponseTime, icon: Clock, color: '#3b82f6', glow: 'rgba(59,130,246,0.15)' },
            { label: 'Satisfação', value: quickStats.satisfactionRate, icon: Heart, color: '#22c55e', glow: 'rgba(34,197,94,0.15)' },
            { label: 'Resolução', value: quickStats.resolutionRate, icon: BarChart3, color: '#8b5cf6', glow: 'rgba(139,92,246,0.15)' },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              whileHover={{ y: -2 }}
              className="r36-quick-stat relative overflow-hidden rounded-xl border border-border/40 dark:border-border/30 p-3 text-center"
              style={{ boxShadow: `0 2px 12px ${stat.glow}` }}
            >
              <stat.icon className="h-4 w-4 mx-auto mb-1" style={{ color: stat.color }} />
              {stat.label === 'Abertos' && (
                <motion.div
                  className="r36-quick-stat-glow absolute top-2 right-2 h-2 w-2 rounded-full"
                  style={{ backgroundColor: stat.color }}
                  animate={{ opacity: [1, 0.4, 1], scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <p className="text-xs font-bold mt-0.5">{stat.value}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="relative bg-white/70 dark:bg-card/70 backdrop-blur-xl rounded-xl border border-white/40 dark:border-border/40"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por assunto ou ID do ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm bg-transparent border-0 focus:outline-none focus-visible:ring-0 rounded-xl placeholder:text-muted-foreground/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        >
          {(Object.keys(categoryConfig) as Category[]).map((cat) => {
            const isActive = selectedCategory === cat
            const CategoryIcon = categoryConfig[cat].icon
            return (
              <motion.button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
                style={{
                  color: isActive ? '#ffffff' : 'rgba(107,114,128,1)',
                  backgroundColor: isActive ? 'rgba(16,185,129,1)' : 'rgba(243,244,246,1)',
                  boxShadow: isActive ? '0 2px 8px rgba(16,185,129,0.3)' : 'none',
                }}
                whileTap={{ scale: 0.95 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="r36-category-indicator"
                    className="absolute inset-0 rounded-full bg-emerald-600"
                    style={{ boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <CategoryIcon className="h-3.5 w-3.5" />
                  {categoryConfig[cat].label}
                  {categoryCounts[cat] > 0 && (
                    <span
                      className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[9px] font-bold"
                      style={{
                        backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(209,213,219,1)',
                        color: isActive ? '#ffffff' : 'rgba(75,85,99,1)',
                      }}
                    >
                      {categoryCounts[cat]}
                    </span>
                  )}
                </span>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Ticket List */}
        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {filteredTickets.map((ticket, idx) => {
              const pCfg = priorityConfig[ticket.priority]
              const sCfg = statusConfig[ticket.status]
              const isExpanded = expandedTicketId === ticket.id
              const TicketCategoryIcon = categoryConfig[ticket.category].icon

              return (
                <motion.div
                  key={ticket.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: idx * 0.08, type: 'spring' as const, stiffness: 350, damping: 30 }}
                >
                  {/* Ticket Card */}
                  <motion.button
                    onClick={() => toggleTicketDetail(ticket.id)}
                    className={`r36-ticket-card ${isExpanded ? 'r36-ticket-card-expand' : 'r36-ticket-card-hover'} w-full relative overflow-hidden rounded-xl border border-border/40 dark:border-border/30 text-left transition-all`}
                    style={{
                      boxShadow: isExpanded
                        ? '0 4px 24px rgba(16,185,129,0.1)'
                        : '0 1px 4px rgba(0,0,0,0.04)',
                      borderLeftWidth: 3,
                      borderLeftColor: pCfg.borderColor,
                    }}
                    whileHover={!isExpanded ? { y: -1, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' } : undefined}
                  >
                    <div className="p-3.5">
                      <div className="flex items-start gap-3">
                        {/* Status dot */}
                        <div className="relative pt-0.5">
                          <div
                            className={`r36-ticket-status-dot h-2.5 w-2.5 rounded-full`}
                            style={{ backgroundColor: sCfg.dotColor }}
                          />
                          {ticket.status === 'aberto' && (
                            <motion.div
                              className="r36-ticket-status-pulse absolute inset-0 rounded-full"
                              style={{ backgroundColor: sCfg.dotColor }}
                              animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.8, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono font-bold text-muted-foreground">{ticket.ticketId}</span>
                            <span
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold"
                              style={{ backgroundColor: pCfg.bgColor, color: pCfg.color }}
                            >
                              {pCfg.label}
                            </span>
                          </div>
                          <p className="text-sm font-semibold truncate">{ticket.subject}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold"
                              style={{ backgroundColor: 'rgba(243,244,246,1)', color: 'rgba(75,85,99,1)' }}
                            >
                              <TicketCategoryIcon className="h-2.5 w-2.5" />
                              {categoryConfig[ticket.category].label}
                            </span>
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold"
                              style={{ backgroundColor: sCfg.bgColor, color: sCfg.textColor }}
                            >
                              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sCfg.dotColor }} />
                              {sCfg.label}
                            </span>
                            {ticket.orderId && (
                              <span className="text-[9px] text-muted-foreground font-mono">{ticket.orderId}</span>
                            )}
                          </div>
                        </div>

                        {/* Expand indicator */}
                        <motion.div
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
                          className="shrink-0 mt-1"
                        >
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </motion.div>
                      </div>

                      {/* Last update */}
                      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border/20">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {ticket.lastUpdate}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {ticket.messages.length} mensagen{ticket.messages.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </motion.button>

                  {/* Ticket Detail Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="mt-2 rounded-xl border border-border/40 dark:border-border/30 overflow-hidden"
                          style={{ boxShadow: '0 4px 24px rgba(16,185,129,0.08)' }}
                        >
                          {/* Detail header */}
                          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10 border-b border-border/20">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-xs font-semibold">Conversa</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {/* Status dropdown */}
                              <div className="relative group">
                                <button
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border"
                                  style={{
                                    backgroundColor: sCfg.bgColor,
                                    borderColor: 'transparent',
                                    color: sCfg.textColor,
                                  }}
                                >
                                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sCfg.dotColor }} />
                                  {sCfg.label}
                                  <ChevronDown className="h-3 w-3" />
                                </button>
                              </div>
                              {/* Priority indicator */}
                              <span
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold"
                                style={{ backgroundColor: pCfg.bgColor, color: pCfg.color }}
                              >
                                <AlertTriangle className="h-3 w-3" />
                                {pCfg.label}
                              </span>
                            </div>
                          </div>

                          {/* Messages */}
                          <div className="p-3 space-y-3 max-h-80 overflow-y-auto">
                            {ticket.messages.map((msg, msgIdx) => (
                              <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: msgIdx * 0.05 }}
                                className={`flex gap-2.5 ${msg.sender === 'user' ? '' : 'flex-row-reverse'}`}
                              >
                                {/* Avatar */}
                                <div
                                  className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    msg.sender === 'user'
                                      ? 'bg-emerald-100 dark:bg-emerald-800/30 text-emerald-700 dark:text-emerald-300'
                                      : 'r36-message-support bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300'
                                  }`}
                                >
                                  {getInitials(msg.senderName)}
                                </div>
                                {/* Bubble */}
                                <div className={`flex-1 min-w-0 ${msg.sender === 'user' ? '' : 'text-right'}`}>
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    {msg.sender === 'user' && (
                                      <>
                                        <span className="text-[10px] font-semibold">{msg.senderName}</span>
                                        <span className="text-[9px] text-muted-foreground">{msg.timestamp}</span>
                                      </>
                                    )}
                                  </div>
                                  <div
                                    className={`r36-message-bubble inline-block px-3 py-2 rounded-xl text-xs leading-relaxed ${
                                      msg.sender === 'user'
                                        ? 'bg-emerald-50 dark:bg-emerald-900/15 text-foreground rounded-tl-sm'
                                        : 'bg-blue-50 dark:bg-blue-900/15 text-foreground rounded-tr-sm text-left'
                                    }`}
                                  >
                                    {msg.content}
                                  </div>
                                  {msg.sender !== 'user' && (
                                    <div className="flex items-center gap-1.5 mt-0.5 justify-end">
                                      <span className="text-[10px] font-semibold">{msg.senderName}</span>
                                      <span className="text-[9px] text-muted-foreground">{msg.timestamp}</span>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          {/* Reply Input */}
                          <div className="p-3 border-t border-border/20 bg-gradient-to-t from-muted/20 to-transparent">
                            <div className="flex items-end gap-2">
                              <button className="shrink-0 h-9 w-9 rounded-lg border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                                <Paperclip className="h-4 w-4" />
                              </button>
                              <div
                                className="flex-1 relative rounded-xl border border-border/40 overflow-hidden"
                                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}
                              >
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Escreva sua resposta..."
                                  rows={2}
                                  className="w-full px-3 py-2 text-xs bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground/60"
                                />
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSendReply}
                                disabled={!replyText.trim() || sendingReply}
                                className="shrink-0 h-9 w-9 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-center disabled:opacity-40 transition-opacity"
                                style={{ boxShadow: '0 2px 8px rgba(16,185,129,0.25)' }}
                              >
                                {sendingReply ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Empty State */}
          {filteredTickets.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center"
              >
                <Inbox className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </motion.div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">Nenhum ticket encontrado</h3>
              <p className="text-xs text-muted-foreground/70 max-w-xs mx-auto">
                {searchQuery
                  ? `Não encontramos tickets para "${searchQuery}". Tente outro termo.`
                  : 'Não há tickets nesta categoria. Crie um novo ticket para iniciar.'}
              </p>
              {(searchQuery || selectedCategory !== 'todos') && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSearchQuery(''); setSelectedCategory('todos') }}
                  className="mt-3 px-4 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200/50 dark:border-emerald-800/30"
                >
                  Limpar filtros
                </motion.button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {showNewTicketModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={resetNewTicketForm}
            />

            {/* Modal */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring' as const, stiffness: 350, damping: 30 }}
              className="relative w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-background border border-border/40 m-0 sm:m-4"
              style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}
            >
              {isTicketSubmitted ? (
                /* Success State */
                <div className="relative p-8 text-center">
                  <ConfettiParticles />
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring' as const, stiffness: 200, damping: 15 }}
                    className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center"
                    style={{ boxShadow: '0 8px 32px rgba(16,185,129,0.2)' }}
                  >
                    <Check className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                  </motion.div>
                  <h3 className="text-lg font-bold mb-1">Ticket Criado!</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    Número: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">#{`SUP-${Math.floor(Math.random() * 9000) + 1000}`}</span>
                  </p>
                  <p className="text-xs text-muted-foreground/70 mb-6">
                    Você receberá atualizações por e-mail e notificação push
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetNewTicketForm}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold"
                    style={{ boxShadow: '0 4px 16px rgba(16,185,129,0.25)' }}
                  >
                    Fechar
                  </motion.button>
                </div>
              ) : (
                /* Form */
                <div className="p-5 space-y-4">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"
                        style={{ boxShadow: '0 2px 8px rgba(16,185,129,0.2)' }}
                      >
                        <MessageSquare className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">Novo Ticket</h3>
                        <p className="text-[10px] text-muted-foreground">Descreva seu problema</p>
                      </div>
                    </div>
                    <button onClick={resetNewTicketForm} className="h-8 w-8 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-muted/50 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Assunto *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newTicketSubject}
                        onChange={(e) => setNewTicketSubject(e.target.value.slice(0, 120))}
                        placeholder="Resumo do problema..."
                        maxLength={120}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border/40 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 placeholder:text-muted-foreground/50 transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                        {newTicketSubject.length}/120
                      </span>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Categoria *</label>
                    <div className="relative">
                      <select
                        value={newTicketCategory}
                        onChange={(e) => setNewTicketCategory(e.target.value as Exclude<Category, 'todos'>)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border/40 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 appearance-none transition-all"
                      >
                        <option value="">Selecione uma categoria...</option>
                        <option value="pedidos">📦 Pedidos</option>
                        <option value="pagamentos">💳 Pagamentos</option>
                        <option value="entregas">🚚 Entregas</option>
                        <option value="conta">👤 Conta</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Prioridade *</label>
                    <div className="flex gap-2">
                      {(['alta', 'media', 'baixa'] as Priority[]).map((p) => {
                        const cfg = priorityConfig[p]
                        const isSelected = newTicketPriority === p
                        return (
                          <motion.button
                            key={p}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setNewTicketPriority(p)}
                            className="flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all"
                            style={{
                              backgroundColor: isSelected ? cfg.bgColor : 'transparent',
                              borderColor: isSelected ? cfg.color : 'rgba(229,231,235,1)',
                              color: isSelected ? cfg.color : 'rgba(107,114,128,1)',
                              boxShadow: isSelected ? `0 2px 8px ${cfg.bgColor}` : 'none',
                            }}
                          >
                            <AlertTriangle className="h-3.5 w-3.5 mx-auto mb-1" />
                            {cfg.label}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Descrição *</label>
                    <div className="relative">
                      <textarea
                        value={newTicketDescription}
                        onChange={(e) => setNewTicketDescription(e.target.value.slice(0, 1000))}
                        placeholder="Descreva o problema em detalhes..."
                        rows={4}
                        maxLength={1000}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border/40 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 resize-none placeholder:text-muted-foreground/50 transition-all"
                      />
                      <span className="absolute bottom-2.5 right-3 text-[10px] text-muted-foreground">
                        {newTicketDescription.length}/1000
                      </span>
                    </div>
                  </div>

                  {/* Order ID (optional) */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      ID do Pedido <span className="text-muted-foreground/50">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={newTicketOrderId}
                      onChange={(e) => setNewTicketOrderId(e.target.value)}
                      placeholder="Ex: PED-12345"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border/40 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 placeholder:text-muted-foreground/50 transition-all"
                    />
                  </div>

                  {/* Submit */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitNewTicket}
                    disabled={isSubmittingTicket}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold disabled:opacity-60 transition-all"
                    style={{ boxShadow: '0 4px 16px rgba(16,185,129,0.25)' }}
                  >
                    {isSubmittingTicket ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Criando ticket...
                      </span>
                    ) : (
                      'Criar Ticket'
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
