'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Search, ChevronDown, ChevronUp, MessageCircle, Phone, Mail, Clock, HelpCircle, Package, Truck, CreditCard, User, Store, Star, ThumbsUp, ThumbsDown, Send, CheckCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store/useAppStore'
import { toast } from 'sonner'

const faqCategories = [
  {
    id: 'pedidos',
    label: 'Pedidos',
    icon: Package,
    color: 'text-primary bg-primary/10 border-primary/20',
    faqs: [
      { q: 'Como acompanhar meu pedido?', a: 'Acesse a seção "Pedidos" no menu inferior. Lá você verá todos os seus pedidos com status em tempo real. Toque em um pedido para ver os detalhes e acompanhar a entrega no mapa.' },
      { q: 'Posso cancelar um pedido?', a: 'Sim! Você pode cancelar pedidos que ainda estão com status "Pendente" ou "Confirmado". Acesse o pedido e toque em "Cancelar pedido". O reembolso será feito em até 3 dias úteis.' },
      { q: 'Quanto tempo leva a entrega?', a: 'O prazo de entrega varia de 30 minutos a 2 horas para produtos locais. Pedidos agendados podem ser entregues no dia seguinte. Lojas de diferentes categorias podem ter prazos diferentes.' },
      { q: 'O que faço se receber um produto errado?', a: 'Entre em contato conosco imediatamente pelo WhatsApp ou chat. Envie fotos do produto recebido. Faremos a troca ou devolução sem custo adicional em até 48 horas.' },
      { q: 'Como repetir um pedido anterior?', a: 'Na seção "Pedidos", encontre o pedido desejado e toque no botão "Repetir pedido". Os itens serão adicionados ao seu carrinho automaticamente.' },
    ]
  },
  {
    id: 'entrega',
    label: 'Entrega',
    icon: Truck,
    color: 'text-teal-600 bg-teal-50 border-teal-200/50 dark:text-teal-400 dark:bg-teal-900/10 dark:border-teal-800/30',
    faqs: [
      { q: 'Qual a área de cobertura?', a: 'Atualmente atendemos toda a zona urbana de Dom Eliseu, PA. Para entregas em zonas rurais, entre em contato para verificar a disponibilidade e taxa adicional.' },
      { q: 'A entrega é gratuita?', a: 'Muitas lojas oferecem entrega grátis acima de um valor mínimo (geralmente R$ 25-R$ 50). Verifique a informação de frete grátis na página de cada loja ou produto.' },
      { q: 'Posso escolher o horário da entrega?', a: 'Sim! No checkout você pode escolher entre entrega imediata (30-90 min), agendar para amanhã, ou escolher uma data e hora específica.' },
      { q: 'Quem faz a entrega?', a: 'As entregas são feitas por entregadores parceiros do DomPlace, todos verificados e avaliados. Você pode acompanhar a localização do entregador em tempo real.' },
    ]
  },
  {
    id: 'pagamento',
    label: 'Pagamento',
    icon: CreditCard,
    color: 'text-amber-600 bg-amber-50 border-amber-200/50 dark:text-amber-400 dark:bg-amber-900/10 dark:border-amber-800/30',
    faqs: [
      { q: 'Quais formas de pagamento são aceitas?', a: 'Aceitamos Pix, cartão de crédito (em até 3x sem juros), boleto bancário e dinheiro na entrega. O Pix é processado instantaneamente.' },
      { q: 'É seguro pagar pelo DomPlace?', a: 'Sim! Utilizamos criptografia de ponta a ponta e suas dados são protegidos conforme a LGPD. O DomPlace nunca armazena dados completos do seu cartão.' },
      { q: 'Como funciona o reembolso?', a: 'O reembolso é feito pela mesma forma de pagamento utilizada. Pix: imediato. Cartão: até 2 faturas. Boleto/Dinheiro: via transferência bancária em até 3 dias úteis.' },
      { q: 'Posso usar cupom de desconto?', a: 'Sim! No checkout há um campo para inserir cupons. Fique atento às promoções na página inicial e no seu e-mail para ganhar cupons exclusivos.' },
    ]
  },
  {
    id: 'conta',
    label: 'Conta',
    icon: User,
    color: 'text-rose-600 bg-rose-50 border-rose-200/50 dark:text-rose-400 dark:bg-rose-900/10 dark:border-rose-800/30',
    faqs: [
      { q: 'Como criar uma conta?', a: 'Toque em "Entrar" no menu e selecione "Criar conta". Você pode se cadastrar com e-mail, Google ou WhatsApp. É rápido e gratuito!' },
      { q: 'Esqueci minha senha, o que faço?', a: 'Na tela de login, toque em "Esqueceu a senha?". Informe seu e-mail e enviaremos um link para redefinição. O link é válido por 24 horas.' },
      { q: 'Como excluir minha conta?', a: 'Em "Perfil" > "Configurações" > "Excluir conta". Confirmará com sua senha. Seus dados serão excluídos em até 30 dias conforme a LGPD. Pedidos anteriores são mantidos por 90 dias.' },
      { q: 'Meus dados estão seguros?', a: 'Absolutamente! Seguimos rigorosos padrões de segurança e conformidade com a LGPD. Seus dados nunca são compartilhados com terceiros sem seu consentimento.' },
    ]
  },
  {
    id: 'produtos',
    label: 'Produtos',
    icon: Star,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200/50 dark:text-emerald-400 dark:bg-emerald-900/10 dark:border-emerald-800/30',
    faqs: [
      { q: 'Como avaliar um produto?', a: 'Após receber seu pedido, vá em "Pedidos" > toque no pedido > "Avaliar". Dê uma nota de 1 a 5 estrelas e escreva um comentário. Sua avaliação ajuda outros compradores!' },
      { q: 'Os preços são atualizados?', a: 'Sim! Os preços são atualizados pelas próprias lojas em tempo real. Você sempre verá o preço atual no momento da visualização.' },
      { q: 'Posso comparar produtos?', a: 'Sim! Toque no ícone de comparação (GitCompareArrows) nos cards de produto. Você pode comparar até 3 produtos lado a lado em preço, avaliação e características.' },
    ]
  },
  {
    id: 'lojas',
    label: 'Lojas',
    icon: Store,
    color: 'text-orange-600 bg-orange-50 border-orange-200/50 dark:text-orange-400 dark:bg-orange-900/10 dark:border-orange-800/30',
    faqs: [
      { q: 'Como se tornar um lojista?', a: 'Acesse "Perfil" > "Configurações" > "Quero vender no DomPlace". Preencha o cadastro com dados da sua loja e documentos. A aprovação leva até 48 horas.' },
      { q: 'Quanto custa para vender no DomPlace?', a: 'A comissão varia de 5% a 15% por venda, dependendo do plano escolhido. Também oferecemos planos de anúncios pagos para aumentar a visibilidade da sua loja.' },
      { q: 'Como gerenciar meus produtos?', a: 'Após aprovação, acesse o "Painel da Loja" no menu. Lá você pode adicionar, editar e remover produtos, gerenciar pedidos e ver analytics de vendas.' },
    ]
  },
]

const popularArticles = [
  { title: 'Primeira compra no DomPlace', icon: '🛒', reads: 2847, category: 'Conta' },
  { title: 'Como usar cupons de desconto', icon: '🏷️', reads: 1923, category: 'Pagamento' },
  { title: 'Acompanhe sua entrega em tempo real', icon: '📍', reads: 1654, category: 'Entrega' },
  { title: 'Programa de Fidelidade', icon: '⭐', reads: 1234, category: 'Conta' },
]

export function SupportCenter() {
  const { goBack } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [showContact, setShowContact] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [helpfulRatings, setHelpfulRatings] = useState<Record<string, boolean | null>>({})

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqCategories
    const q = searchQuery.toLowerCase()
    return faqCategories.map(cat => ({
      ...cat,
      faqs: cat.faqs.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q))
    })).filter(cat => cat.faqs.length > 0)
  }, [searchQuery])

  const totalResults = filteredFaqs.reduce((sum, cat) => sum + cat.faqs.length, 0)

  const handleSubmitContact = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
    toast.success('Mensagem enviada com sucesso!')
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-strong border-b border-border/50 -mx-4 px-4 -mt-4 pt-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-shadow-sm">Central de Ajuda</h1>
            <p className="text-xs text-muted-foreground">Estamos aqui para ajudar você</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto space-y-6">
        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar na Central de Ajuda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 search-pulse bg-card border-border/50"
          />
          {searchQuery && (
            <Badge variant="secondary" className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px]">
              {totalResults} resultado{totalResults !== 1 ? 's' : ''}
            </Badge>
          )}
        </motion.div>

        {/* Popular Articles */}
        {!searchQuery && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-primary" />
              Artigos populares
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {popularArticles.map((article, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-all text-left group"
                >
                  <span className="text-2xl">{article.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">{article.title}</p>
                    <p className="text-[10px] text-muted-foreground">{article.reads.toLocaleString('pt-BR')} leituras · {article.category}</p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <Separator className="bg-border/50" />

        {/* FAQ Categories */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">
            {searchQuery ? `Resultados para "${searchQuery}"` : 'Perguntas Frequentes'}
          </h3>

          {filteredFaqs.map((category) => {
            const CategoryIcon = category.icon
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border/50 overflow-hidden bg-card"
              >
                {/* Category header */}
                <div className={`flex items-center gap-2.5 p-3 ${category.color} rounded-t-xl`}>
                  <CategoryIcon className="h-4 w-4" />
                  <span className="text-sm font-semibold">{category.label}</span>
                  <Badge variant="secondary" className="text-[10px] ml-auto">{category.faqs.length}</Badge>
                </div>

                {/* FAQ items */}
                <div className="divide-y divide-border/30">
                  {category.faqs.map((faq, i) => {
                    const faqId = `${category.id}-${i}`
                    const isExpanded = expandedFaq === faqId
                    const rating = helpfulRatings[faqId]
                    return (
                      <div key={faqId}>
                        <button
                          onClick={() => setExpandedFaq(isExpanded ? null : faqId)}
                          className="w-full flex items-center gap-2 p-3 text-left hover:bg-muted/50 transition-colors"
                        >
                          <span className="text-sm flex-1 font-medium">{faq.q}</span>
                          {isExpanded
                            ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                            : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                          }
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 pb-3">
                                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                                {/* Helpful rating */}
                                <div className="mt-3 flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Isso foi útil?</span>
                                  {rating === null ? (
                                    <>
                                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setHelpfulRatings(prev => ({ ...prev, [faqId]: true }))} className="p-1 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors">
                                        <ThumbsUp className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                                      </motion.button>
                                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setHelpfulRatings(prev => ({ ...prev, [faqId]: false }))} className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                                        <ThumbsDown className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                                      </motion.button>
                                    </>
                                  ) : (
                                    <span className={`text-xs font-medium ${rating ? 'text-primary' : 'text-destructive'}`}>
                                      {rating ? 'Obrigado pelo feedback! 👍' : 'Obrigado, vamos melhorar!'}
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
              </motion.div>
            )
          })}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum resultado encontrado</p>
              <button onClick={() => setSearchQuery('')} className="text-xs text-primary hover:underline mt-1">Limpar busca</button>
            </div>
          )}
        </div>

        <Separator className="bg-border/50" />

        {/* Contact Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4 text-primary" />
            Falar com Suporte
          </h3>

          {/* Quick contact buttons */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/30 hover:shadow-md transition-all">
              <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-800/20 flex items-center justify-center">
                <Phone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300">WhatsApp</span>
            </motion.button>
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 hover:shadow-md transition-all">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-800/20 flex items-center justify-center">
                <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300">E-mail</span>
            </motion.button>
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => setShowContact(true)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-primary/5 border border-primary/20 hover:shadow-md transition-all">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Send className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[10px] font-medium text-primary">Formulário</span>
            </motion.button>
          </div>

          {/* Contact Form */}
          <AnimatePresence>
            {showContact && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {isSubmitted ? (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-6 text-center">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                        <CheckCircle className="h-12 w-12 text-primary mx-auto mb-3" />
                      </motion.div>
                      <h4 className="font-bold text-sm mb-1">Mensagem Enviada!</h4>
                      <p className="text-xs text-muted-foreground">Responderemos em até 24 horas úteis</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => { setShowContact(false); setIsSubmitted(false); setContactForm({ name: '', email: '', subject: '', message: '' }) }}>
                        Enviar outra mensagem
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-border/50">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">Enviar mensagem</h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Resposta em até 24h
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Nome *</Label>
                        <Input placeholder="Seu nome" value={contactForm.name} onChange={e => setContactForm(prev => ({ ...prev, name: e.target.value }))} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">E-mail *</Label>
                        <Input type="email" placeholder="seu@email.com" value={contactForm.email} onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Assunto</Label>
                        <select
                          value={contactForm.subject}
                          onChange={e => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                          className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="">Selecione...</option>
                          <option value="pedido">Problema com pedido</option>
                          <option value="pagamento">Problema com pagamento</option>
                          <option value="conta">Problema com conta</option>
                          <option value="loja">Quero ser lojista</option>
                          <option value="sugestao">Sugestão</option>
                          <option value="outro">Outro</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Mensagem *</Label>
                        <Textarea placeholder="Descreva seu problema ou dúvida..." value={contactForm.message} onChange={e => setContactForm(prev => ({ ...prev, message: e.target.value }))} className="mt-1 min-h-[80px] resize-none" />
                      </div>
                      <Button onClick={handleSubmitContact} disabled={isSubmitting} className="w-full bg-primary text-primary-foreground btn-glow ripple-effect">
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            Enviando...
                          </div>
                        ) : (
                          <>
                            Enviar mensagem
                            <Send className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
