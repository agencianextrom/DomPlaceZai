'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Search, ChevronDown, MessageCircle, Phone, Mail, Clock,
  HelpCircle, Package, Truck, CreditCard, User, Star, ThumbsUp, ThumbsDown,
  Send, CheckCircle, Headphones, Zap, ShoppingBag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store/useAppStore'
import { toast } from 'sonner'

// ---- FAQ Categories (4 categories as requested) ----
const faqCategories = [
  {
    id: 'pedidos',
    label: 'Pedidos',
    icon: Package,
    color: 'text-primary bg-primary/10 border-primary/20',
    glassColor: 'from-primary/5 to-transparent',
    faqs: [
      {
        q: 'Como acompanhar meu pedido?',
        a: 'Acesse a seção "Pedidos" no menu inferior. Lá você verá todos os seus pedidos com status em tempo real. Toque em um pedido para ver os detalhes e acompanhar a entrega no mapa.',
      },
      {
        q: 'Posso cancelar um pedido?',
        a: 'Sim! Você pode cancelar pedidos que ainda estão com status "Pendente" ou "Confirmado". Acesse o pedido e toque em "Cancelar pedido". O reembolso será feito em até 3 dias úteis.',
      },
      {
        q: 'Quanto tempo leva a entrega?',
        a: 'O prazo de entrega varia de 30 minutos a 2 horas para produtos locais. Pedidos agendados podem ser entregues no dia seguinte. Lojas de diferentes categorias podem ter prazos diferentes.',
      },
      {
        q: 'O que faço se receber um produto errado?',
        a: 'Entre em contato conosco imediatamente pelo WhatsApp ou chat. Envie fotos do produto recebido. Faremos a troca ou devolução sem custo adicional em até 48 horas.',
      },
      {
        q: 'Como repetir um pedido anterior?',
        a: 'Na seção "Pedidos", encontre o pedido desejado e toque no botão "Repetir pedido". Os itens serão adicionados ao seu carrinho automaticamente.',
      },
    ],
  },
  {
    id: 'pagamentos',
    label: 'Pagamentos',
    icon: CreditCard,
    color: 'text-amber-600 bg-amber-50 border-amber-200/50 dark:text-amber-400 dark:bg-amber-900/10 dark:border-amber-800/30',
    glassColor: 'from-amber-500/5 to-transparent',
    faqs: [
      {
        q: 'Quais formas de pagamento são aceitas?',
        a: 'Aceitamos Pix, cartão de crédito (em até 3x sem juros), boleto bancário e dinheiro na entrega. O Pix é processado instantaneamente.',
      },
      {
        q: 'É seguro pagar pelo DomPlace?',
        a: 'Sim! Utilizamos criptografia de ponta a ponta e suas dados são protegidos conforme a LGPD. O DomPlace nunca armazena dados completos do seu cartão.',
      },
      {
        q: 'Como funciona o reembolso?',
        a: 'O reembolso é feito pela mesma forma de pagamento utilizada. Pix: imediato. Cartão: até 2 faturas. Boleto/Dinheiro: via transferência bancária em até 3 dias úteis.',
      },
      {
        q: 'Posso usar cupom de desconto?',
        a: 'Sim! No checkout há um campo para inserir cupons. Fique atento às promoções na página inicial e no seu e-mail para ganhar cupons exclusivos.',
      },
    ],
  },
  {
    id: 'entregas',
    label: 'Entregas',
    icon: Truck,
    color: 'text-teal-600 bg-teal-50 border-teal-200/50 dark:text-teal-400 dark:bg-teal-900/10 dark:border-teal-800/30',
    glassColor: 'from-teal-500/5 to-transparent',
    faqs: [
      {
        q: 'Qual a área de cobertura?',
        a: 'Atualmente atendemos toda a zona urbana de Dom Eliseu, PA. Para entregas em zonas rurais, entre em contato para verificar a disponibilidade e taxa adicional.',
      },
      {
        q: 'A entrega é gratuita?',
        a: 'Muitas lojas oferecem entrega grátis acima de um valor mínimo (geralmente R$ 25-R$ 50). Verifique a informação de frete grátis na página de cada loja ou produto.',
      },
      {
        q: 'Posso escolher o horário da entrega?',
        a: 'Sim! No checkout você pode escolher entre entrega imediata (30-90 min), agendar para amanhã, ou escolher uma data e hora específica.',
      },
      {
        q: 'Quem faz a entrega?',
        a: 'As entregas são feitas por entregadores parceiros do DomPlace, todos verificados e avaliados. Você pode acompanhar a localização do entregador em tempo real.',
      },
      {
        q: 'E se o entregador não encontrar meu endereço?',
        a: 'O entregador entrará em contato pelo WhatsApp ou telefone. Certifique-se de que seu endereço está completo e correto no perfil. Você também pode adicionar pontos de referência.',
      },
    ],
  },
  {
    id: 'conta',
    label: 'Conta',
    icon: User,
    color: 'text-rose-600 bg-rose-50 border-rose-200/50 dark:text-rose-400 dark:bg-rose-900/10 dark:border-rose-800/30',
    glassColor: 'from-rose-500/5 to-transparent',
    faqs: [
      {
        q: 'Como criar uma conta?',
        a: 'Toque em "Entrar" no menu e selecione "Criar conta". Você pode se cadastrar com e-mail, Google ou WhatsApp. É rápido e gratuito!',
      },
      {
        q: 'Esqueci minha senha, o que faço?',
        a: 'Na tela de login, toque em "Esqueceu a senha?". Informe seu e-mail e enviaremos um link para redefinição. O link é válido por 24 horas.',
      },
      {
        q: 'Como excluir minha conta?',
        a: 'Em "Perfil" > "Configurações" > "Excluir conta". Confirme com sua senha. Seus dados serão excluídos em até 30 dias conforme a LGPD.',
      },
      {
        q: 'Meus dados estão seguros?',
        a: 'Absolutamente! Seguimos rigorosos padrões de segurança e conformidade com a LGPD. Seus dados nunca são compartilhados com terceiros sem seu consentimento.',
      },
    ],
  },
]

// ---- localStorage persistence for support tickets ----
interface SupportTicket {
  id: string
  category: string
  subject: string
  message: string
  status: 'open' | 'resolved'
  createdAt: string
}

function loadTicketHistory(): SupportTicket[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('domplace-support-tickets')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveTicketHistory(tickets: SupportTicket[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('domplace-support-tickets', JSON.stringify(tickets))
  } catch {
    // ignore
  }
}

// ---- Floating headset emoji particles ----
function FloatingHeadsetParticles() {
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  if (prefersReducedMotion) return null

  const particles = [
    { left: '8%', delay: 0, size: 18 },
    { left: '25%', delay: 1.2, size: 14 },
    { left: '55%', delay: 0.6, size: 20 },
    { left: '78%', delay: 1.8, size: 12 },
    { left: '92%', delay: 0.3, size: 16 },
  ]

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: p.left, bottom: '-30px' }}
          animate={{
            y: [0, -120, -240],
            opacity: [0, 0.5, 0],
            rotate: [0, i % 2 === 0 ? 15 : -15, 0],
          }}
          transition={{
            duration: 4 + i * 0.5,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: 2,
            ease: 'easeOut',
          }}
        >
          <span style={{ fontSize: p.size }}>🎧</span>
        </motion.div>
      ))}
    </div>
  )
}

export function SupportCenter() {
  const { goBack, toggleChat } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [showContact, setShowContact] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [helpfulRatings, setHelpfulRatings] = useState<
    Record<string, boolean | null>
  >({})
  const [ticketHistory, setTicketHistory] = useState<SupportTicket[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Load ticket history from localStorage on mount
  useEffect(() => {
    setTicketHistory(loadTicketHistory())
  }, [])

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqCategories
    const q = searchQuery.toLowerCase()
    return faqCategories
      .map((cat) => ({
        ...cat,
        faqs: cat.faqs.filter(
          (f) =>
            f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.faqs.length > 0)
  }, [searchQuery])

  const totalResults = filteredFaqs.reduce(
    (sum, cat) => sum + cat.faqs.length,
    0
  )

  const handleSubmitContact = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)

    // Persist ticket to localStorage
    const newTicket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      category: contactForm.category || 'outro',
      subject: contactForm.subject || 'Sem assunto',
      message: contactForm.message,
      status: 'open',
      createdAt: new Date().toISOString(),
    }
    const updated = [newTicket, ...ticketHistory].slice(0, 20)
    setTicketHistory(updated)
    saveTicketHistory(updated)

    setIsSubmitted(true)
    toast.success('Ticket enviado com sucesso!')
  }

  return (
    <div className="min-h-screen pb-24 relative">
      {/* Floating headset emoji particles */}
      <div className="r40-particles">
        <FloatingHeadsetParticles />
      </div>

      {/* Header with animated gradient background */}
      <div className="r40-header sticky top-14 sm:top-16 z-40 bg-gradient-to-r from-primary/5 via-background to-emerald-50/30 dark:from-primary/8 dark:via-background dark:to-emerald-900/5 backdrop-blur-xl border-b border-border/30 -mx-4 px-4 -mt-4 pt-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">
              <span className="shimmer-text">Central de Ajuda</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Estamos aqui para ajudar você
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto space-y-6">
        {/* Search with glassmorphism effect */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="r40-search-wrapper relative rounded-xl">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 via-emerald-500/5 to-amber-500/10 blur-sm" />
            <div className="relative bg-white/70 dark:bg-card/70 backdrop-blur-xl rounded-xl border border-white/40 dark:border-border/40 shadow-lg">
              <Search className="r40-search-icon absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar na Central de Ajuda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-0 bg-transparent focus-visible:ring-0 shadow-none"
              />
              {searchQuery && (
                <Badge
                  variant="secondary"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px]"
                >
                  {totalResults} resultado{totalResults !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </motion.div>

        {/* Como funciona — 3 steps with glassmorphism card */}
        {!searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="r40-help-card r62-card-lift r94-support-center-card relative overflow-hidden rounded-2xl border border-white/30 dark:border-border/30 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-emerald-50/50 dark:from-primary/10 dark:via-background dark:to-emerald-900/10 backdrop-blur-xl" />
              <div className="relative p-4 bg-white/40 dark:bg-card/40 backdrop-blur-sm">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <Zap className="r40-step-icon h-4 w-4 text-primary" />
                  Como funciona o DomPlace?
                </h3>
                <div className="flex items-start gap-3">
                  {[
                    {
                      step: 1,
                      title: 'Escolha',
                      desc: 'Navegue por lojas e produtos locais de Dom Eliseu',
                      icon: ShoppingBag,
                      color: 'from-primary to-emerald-600',
                    },
                    {
                      step: 2,
                      title: 'Peça',
                      desc: 'Adicione ao carrinho, escolha pagamento e entrega',
                      icon: Zap,
                      color: 'from-emerald-500 to-teal-600',
                    },
                    {
                      step: 3,
                      title: 'Receba',
                      desc: 'Acompanhe em tempo real e receba na sua porta',
                      icon: Truck,
                      color: 'from-amber-500 to-orange-500',
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex-1 text-center">
                      <motion.div
                        whileHover={{ y: -3 }}
                        className="r40-category-icon relative inline-block"
                      >
                        <div
                          className={`r40-category-glow h-12 w-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-2 shadow-lg`}
                        >
                          <item.icon className="r40-step-icon h-6 w-6 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                          <span className="text-[10px] font-bold text-primary">
                            {item.step}
                          </span>
                        </div>
                      </motion.div>
                      <p className="text-xs font-bold mb-0.5">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <Separator className="bg-border/30" />

        {/* FAQ Categories — Glassmorphism cards with animated chevron */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-1.5 r62-heading-gradient">
            <HelpCircle className="h-4 w-4 text-primary" />
            {searchQuery
              ? `Resultados para "${searchQuery}"`
              : 'Perguntas Frequentes'}
          </h3>

          <AnimatePresence mode="popLayout">
            {filteredFaqs.map((category, catIdx) => {
              const CategoryIcon = category.icon
              const hasActiveFaq = category.faqs.some((_, i) => expandedFaq === `${category.id}-${i}`)
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIdx * 0.06, type: 'spring' as const, stiffness: 260, damping: 24 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`r40-faq-card r40-category-card r40-category-shimmer relative overflow-hidden rounded-2xl border border-white/30 dark:border-border/30 shadow-md ${hasActiveFaq ? 'r40-faq-active' : ''}`}
                >
                  {/* Glassmorphism background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${category.glassColor} backdrop-blur-xl opacity-50`}
                  />
                  <div className="relative bg-white/50 dark:bg-card/50 backdrop-blur-md rounded-2xl">
                    {/* Category header */}
                    <div
                      className={`flex items-center gap-2.5 p-3.5 ${category.color} rounded-t-2xl`}
                    >
                      <CategoryIcon className="h-4 w-4" />
                      <span className="text-sm font-semibold">{category.label}</span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] ml-auto"
                      >
                        {category.faqs.length}
                      </Badge>
                    </div>

                    {/* FAQ items with animated chevron rotation */}
                    <div className="divide-y divide-border/20">
                      {category.faqs.map((faq, i) => {
                        const faqId = `${category.id}-${i}`
                        const isExpanded = expandedFaq === faqId
                        const rating = helpfulRatings[faqId]
                        return (
                          <div key={faqId}>
                            <button
                              onClick={() =>
                                setExpandedFaq(isExpanded ? null : faqId)
                              }
                              className="w-full flex items-center gap-2 p-3.5 text-left hover:bg-white/30 dark:hover:bg-white/5 transition-colors"
                            >
                              <span className={`text-sm flex-1 font-medium ${isExpanded ? 'text-primary' : ''}`}>
                                {faq.q}
                              </span>
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{
                                  duration: 0.3,
                                  type: 'spring' as const,
                                  stiffness: 300,
                                  damping: 25,
                                }}
                                className="r40-faq-chevron shrink-0"
                              >
                                <ChevronDown className={`h-4 w-4 ${isExpanded ? 'text-primary' : 'text-muted-foreground'}`} />
                              </motion.div>
                            </button>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-3.5 pb-3.5">
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                      {faq.a}
                                    </p>
                                    {/* Helpful rating */}
                                    <div className="mt-3 flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">
                                        Isso foi útil?
                                      </span>
                                      {rating === null ? (
                                        <>
                                          <motion.button
                                            whileTap={{ scale: 0.85 }}
                                            onClick={() =>
                                              setHelpfulRatings((prev) => ({
                                                ...prev,
                                                [faqId]: true,
                                              }))
                                            }
                                            className="p-1 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors"
                                          >
                                            <ThumbsUp className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                                          </motion.button>
                                          <motion.button
                                            whileTap={{ scale: 0.85 }}
                                            onClick={() =>
                                              setHelpfulRatings((prev) => ({
                                                ...prev,
                                                [faqId]: false,
                                              }))
                                            }
                                            className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                          >
                                            <ThumbsDown className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                                          </motion.button>
                                        </>
                                      ) : (
                                        <span
                                          className={`text-xs font-medium ${
                                            rating
                                              ? 'text-primary'
                                              : 'text-destructive'
                                          }`}
                                        >
                                          {rating
                                            ? 'Obrigado pelo feedback! 👍'
                                            : 'Obrigado, vamos melhorar!'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filteredFaqs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <HelpCircle className="r40-no-results h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhum resultado encontrado
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="min-h-[44px] px-2 text-xs text-primary hover:underline mt-1"
              >
                Limpar busca
              </button>
            </motion.div>
          )}
        </div>

        <Separator className="bg-border/30" />

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4 text-primary" />
            Falar com Suporte
          </h3>

          {/* Quick contact buttons with animated icons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <motion.button
              whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(16,185,129,0.15)' }}
              whileTap={{ scale: 0.95 }}
              className="r40-contact-card relative flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/50 dark:bg-card/50 backdrop-blur-md border border-white/30 dark:border-border/30 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/80 to-transparent dark:from-emerald-900/10 dark:to-transparent" />
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="r40-contact-icon-bounce relative"
              >
                <div className="r40-contact-glow relative h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-800/30 flex items-center justify-center shadow-sm">
                  <Phone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </motion.div>
              <span className="relative text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                WhatsApp
              </span>
              <span className="relative text-[8px] text-emerald-600/60 dark:text-emerald-400/50">
                (91) 99999-0000
              </span>
            </motion.button>

            <motion.button
              whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(245,158,11,0.15)' }}
              whileTap={{ scale: 0.95 }}
              className="r40-contact-card relative flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/50 dark:bg-card/50 backdrop-blur-md border border-white/30 dark:border-border/30 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-amber-50/80 to-transparent dark:from-amber-900/10 dark:to-transparent" />
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                className="r40-contact-icon-bounce relative"
              >
                <div className="r40-contact-glow relative h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center shadow-sm">
                  <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </motion.div>
              <span className="relative text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                E-mail
              </span>
              <span className="relative text-[8px] text-amber-600/60 dark:text-amber-400/50">
                suporte@domplace
              </span>
            </motion.button>

            <motion.button
              whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(16,185,129,0.15)' }}
              whileTap={{ scale: 0.95 }}
              className="r40-contact-card relative flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/50 dark:bg-card/50 backdrop-blur-md border border-white/30 dark:border-border/30 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent" />
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                className="r40-contact-icon-bounce relative"
              >
                <div className="r40-contact-glow relative h-12 w-12 rounded-full bg-teal-100 dark:bg-teal-800/30 flex items-center justify-center shadow-sm">
                  <Phone className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
              </motion.div>
              <span className="relative text-[10px] font-semibold text-teal-700 dark:text-teal-300">
                Telefone
              </span>
              <span className="relative text-[8px] text-teal-600/60 dark:text-teal-400/50">
                (91) 4002-8922
              </span>
            </motion.button>
          </div>

          {/* Enviar Ticket form */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground">Ou envie um ticket de suporte</p>
            {ticketHistory.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs text-primary hover:underline"
              >
                {showHistory ? 'Ocultar' : 'Ver'} histórico ({ticketHistory.length})
              </button>
            )}
          </div>

          {/* Ticket history */}
          <AnimatePresence>
            {showHistory && ticketHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {ticketHistory.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="relative overflow-hidden rounded-xl border border-white/30 dark:border-border/30 shadow-sm"
                    >
                      <div className="absolute inset-0 bg-white/40 dark:bg-card/40 backdrop-blur-md" />
                      <div className="relative p-3 flex items-center gap-3">
                        <div
                          className={`h-2 w-2 rounded-full shrink-0 ${
                            ticket.status === 'open'
                              ? 'bg-amber-400 animate-pulse'
                              : 'bg-emerald-500'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold truncate">
                              {ticket.subject}
                            </span>
                            <Badge
                              variant="secondary"
                              className={`text-[8px] px-1.5 shrink-0 ${
                                ticket.status === 'open'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                              }`}
                            >
                              {ticket.status === 'open' ? 'Aberto' : 'Resolvido'}
                            </Badge>
                          </div>
                          <span className="text-[9px] text-muted-foreground">
                            {new Date(ticket.createdAt).toLocaleDateString('pt-BR')} ·{' '}
                            {faqCategories.find((c) => c.id === ticket.category)?.label || ticket.category}
                          </span>
                        </div>
                        <Star className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ticket form toggle */}
          <AnimatePresence>
            {showContact && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                {isSubmitted ? (
                  /* Success animation */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden rounded-2xl border border-primary/20 shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-emerald-500/5 backdrop-blur-xl" />
                    <div className="relative p-6 text-center bg-white/50 dark:bg-card/50 backdrop-blur-md rounded-2xl">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: 'spring' as const,
                          stiffness: 200,
                          damping: 15,
                        }}
                      >
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                          <CheckCircle className="h-10 w-10 text-primary" />
                        </div>
                      </motion.div>
                      <h4 className="font-bold text-sm mb-1">Ticket Enviado!</h4>
                      <p className="text-xs text-muted-foreground mb-4">
                        Número: <span className="font-mono font-bold text-primary">{`TKT-${Date.now().toString().slice(-6)}`}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Responderemos em até 24 horas úteis
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => {
                          setShowContact(false)
                          setIsSubmitted(false)
                          setContactForm({
                            name: '',
                            email: '',
                            subject: '',
                            category: '',
                            message: '',
                          })
                        }}
                      >
                        Enviar outro ticket
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  /* Form with glassmorphism */
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 220, damping: 22 } }}
                    className="r40-ticket-form relative overflow-hidden rounded-2xl border border-white/30 dark:border-border/30 shadow-lg"
                  >
                    <div className="absolute inset-0 bg-white/50 dark:bg-card/50 backdrop-blur-xl" />
                    <div className="relative p-4 space-y-3 bg-white/30 dark:bg-card/30 backdrop-blur-md rounded-2xl">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">Enviar Ticket</h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Resposta em até 24h
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Nome *
                        </Label>
                        <Input
                          placeholder="Seu nome"
                          value={contactForm.name}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="mt-1 bg-white/60 dark:bg-card/60 border-white/40 dark:border-border/40"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          E-mail *
                        </Label>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          value={contactForm.email}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          className="mt-1 bg-white/60 dark:bg-card/60 border-white/40 dark:border-border/40"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Categoria
                        </Label>
                        <select
                          value={contactForm.category}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              category: e.target.value,
                            }))
                          }
                          className="mt-1 w-full h-9 rounded-md border border-input bg-white/60 dark:bg-card/60 border-white/40 dark:border-border/40 px-3 text-sm"
                        >
                          <option value="">Selecione...</option>
                          <option value="pedidos">Pedidos</option>
                          <option value="pagamentos">Pagamentos</option>
                          <option value="entregas">Entregas</option>
                          <option value="conta">Conta</option>
                          <option value="sugestao">Sugestão</option>
                          <option value="outro">Outro</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Assunto
                        </Label>
                        <Input
                          placeholder="Resumo do problema"
                          value={contactForm.subject}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              subject: e.target.value,
                            }))
                          }
                          className="mt-1 bg-white/60 dark:bg-card/60 border-white/40 dark:border-border/40"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Mensagem *
                        </Label>
                        <Textarea
                          placeholder="Descreva seu problema ou dúvida em detalhes..."
                          value={contactForm.message}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              message: e.target.value,
                            }))
                          }
                          className="mt-1 min-h-[90px] resize-none bg-white/60 dark:bg-card/60 border-white/40 dark:border-border/40"
                        />
                      </div>
                      <Button
                        onClick={handleSubmitContact}
                        disabled={isSubmitting}
                        className="w-full bg-primary text-primary-foreground"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            Enviando...
                          </div>
                        ) : (
                          <>
                            Enviar Ticket
                            <Send className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle form button */}
          {!showContact && !isSubmitted && (
            <motion.div
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 220, damping: 22 } }}
            >
              <div className="r40-action-btn rounded-xl">
                <Button
                  variant="outline"
                  className="w-full border-primary/30 hover:bg-primary/5 gap-2"
                  onClick={() => setShowContact(true)}
                >
                  <Send className="h-4 w-4 text-primary" />
                  Enviar Ticket de Suporte
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>

        <Separator className="bg-border/30" />

        {/* Chat com Suporte — Glassmorphism card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="r40-chat-card relative overflow-hidden rounded-2xl border border-white/30 dark:border-border/30 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-emerald-50/50 dark:from-primary/10 dark:to-emerald-900/10 backdrop-blur-xl" />
            <div className="relative p-4 bg-white/40 dark:bg-card/40 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="r40-category-glow h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-md">
                      <Headphones className="h-6 w-6 text-white" />
                    </div>
                    <div className="r40-chat-badge absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-background" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Precisa de mais ajuda?</p>
                    <p className="text-[10px] text-muted-foreground">
                      Converse com nosso assistente virtual
                    </p>
                  </div>
                </div>
                <div className="r40-action-btn rounded-xl">
                  <Button
                    onClick={toggleChat}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl text-xs font-semibold"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
