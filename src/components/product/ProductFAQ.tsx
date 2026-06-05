'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  Search,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Send,
  Wheat,
  HeartPulse,
  Sparkles,
  Clock,
  ShieldCheck,
  Scale,
  Leaf,
  Droplets,
  HelpCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

// ---- Category-specific FAQ questions ----
interface FAQItem {
  id: string
  question: string
  answer: string
  icon: React.ElementType
  category: string[]
}

const faqDatabase: FAQItem[] = [
  // FOOD questions
  {
    id: 'food-gluten',
    question: 'Este produto contém glúten?',
    answer: 'Verifique a lista de ingredientes na embalagem do produto. Alimentos como pães, massas e bolos geralmente contêm glúten. Se você tem intolerância ou doença celíaca, procure produtos com o selo "Sem Glúten".',
    icon: Wheat,
    category: ['FOOD'],
  },
  {
    id: 'food-validade',
    question: 'Qual a validade do produto?',
    answer: 'A validade está impressa na embalagem do produto. Nosso sistema sempre prioriza envio de produtos com prazo de validade adequado. Em caso de dúvidas, entre em contato com a loja.',
    icon: Clock,
    category: ['FOOD'],
  },
  {
    id: 'food-congelar',
    question: 'Pode ser congelado?',
    answer: 'A maioria dos alimentos pode ser congelada para maior durabilidade. Verifique as instruções do fabricante na embalagem. Alguns itens como saladas frescas e frutas maduras não são recomendados para congelamento.',
    icon: Droplets,
    category: ['FOOD'],
  },
  {
    id: 'food-organico',
    question: 'É orgânico?',
    answer: 'Produtos orgânicos possuem certificação do Ministério da Agricultura e o selo correspondente na embalagem. Confira a descrição do produto para mais detalhes sobre sua procedência.',
    icon: Leaf,
    category: ['FOOD'],
  },
  {
    id: 'food-conservantes',
    question: 'Possui conservantes artificiais?',
    answer: 'A presença de conservantes está listada nos ingredientes. Procure por produtos com a indicação "Sem conservantes artificiais" ou com selos de produtos naturais. Dúvidas? Fale com a loja.',
    icon: ShieldCheck,
    category: ['FOOD'],
  },
  {
    id: 'food-porcao',
    question: 'Qual a porção sugerida?',
    answer: 'A porção sugerida varia conforme o produto e está indicada na tabela nutricional da embalagem. Geralmente é calculada para um adulto. Consulte um nutricionista para dietas específicas.',
    icon: Scale,
    category: ['FOOD'],
  },
  {
    id: 'food-lactose',
    question: 'Possui lactose?',
    answer: 'Produtos derivados de leite (queijos, iogurtes, manteiga) contêm lactose. Procure versões "Zero Lactose" ou "Sem Lactose" se você tiver intolerância. Sempre verifique a embalagem.',
    icon: HeartPulse,
    category: ['FOOD'],
  },
  {
    id: 'food-diabeticos',
    question: 'É recomendado para diabéticos?',
    answer: 'Produtos "Diet" ou "Zero Açúcar" podem ser mais adequados para diabéticos, mas sempre consulte seu médico ou nutricionista antes de incluir novos itens na sua dieta. Verifique a tabela nutricional.',
    icon: HeartPulse,
    category: ['FOOD'],
  },
  // HEALTH questions
  {
    id: 'health-efeitos',
    question: 'Possui efeitos colaterais?',
    answer: 'Todo produto de saúde pode apresentar efeitos colaterais. Leia a bula completa antes do uso. Em caso de reações adversas, suspenda o uso e procure um médico imediatamente.',
    icon: ShieldCheck,
    category: ['HEALTH'],
  },
  {
    id: 'health-interacao',
    question: 'Pode ser usado com outros medicamentos?',
    answer: 'Consulte sempre um médico ou farmacêutico antes de combinar medicamentos. Interações podem reduzir a eficácia ou causar efeitos indesejados.',
    icon: HelpCircle,
    category: ['HEALTH'],
  },
  {
    id: 'health-anvisa',
    question: 'É registrado na ANVISA?',
    answer: 'Todos os produtos de saúde vendidos no DomPlace devem possuir registro na ANVISA. Verifique o número de registro na embalagem do produto ou na descrição do anúncio.',
    icon: CheckCircle,
    category: ['HEALTH'],
  },
  {
    id: 'health-contraindicacao',
    question: 'Possui contraindicações?',
    answer: 'Contraindicações estão descritas na bula do produto. Grávidas, lactantes, crianças e idosos devem ter atenção especial. Sempre consulte um profissional de saúde.',
    icon: HeartPulse,
    category: ['HEALTH'],
  },
  {
    id: 'health-dosagem',
    question: 'Qual a dosagem recomendada?',
    answer: 'Siga sempre a dosagem indicada na bula ou na embalagem. Não exceda a recomendação sem orientação médica. Dúvidas? Fale com nosso farmacêutico.',
    icon: Scale,
    category: ['HEALTH'],
  },
  {
    id: 'health-armazenamento',
    question: 'Como devo armazenar?',
    answer: 'Mantenha o produto em local seco e fresco, longe da luz solar direta. Alguns produtos podem necessitar de refrigeração — verifique a embalagem.',
    icon: Leaf,
    category: ['HEALTH'],
  },
  // Generic fallback questions
  {
    id: 'generic-garantia',
    question: 'Possui garantia?',
    answer: 'Todos os produtos possuem garantia de satisfação. Em caso de problemas, entre em contato com a loja dentro de até 7 dias após o recebimento para solicitar troca ou devolução.',
    icon: ShieldCheck,
    category: ['FOOD', 'HEALTH', 'AGRICULTURE', 'ELECTRONICS', 'BEAUTY', 'ANIMALS', 'FASHION', 'SERVICES', 'HOME_GARDEN', 'EDUCATION', 'SPORTS', 'OTHER'],
  },
  {
    id: 'generic-troca',
    question: 'Posso trocar ou devolver?',
    answer: 'Sim! Você pode solicitar troca ou devolução em até 7 dias após o recebimento. O produto deve estar em sua embalagem original e sem sinais de uso. Acesse sua área de pedidos para iniciar.',
    icon: Sparkles,
    category: ['FOOD', 'HEALTH', 'AGRICULTURE', 'ELECTRONICS', 'BEAUTY', 'ANIMALS', 'FASHION', 'SERVICES', 'HOME_GARDEN', 'EDUCATION', 'SPORTS', 'OTHER'],
  },
  {
    id: 'generic-entrega',
    question: 'Qual o prazo de entrega?',
    answer: 'O prazo de entrega varia de 30 a 45 minutos para a maioria dos pedidos. O horário pode variar conforme a loja e a demanda no momento. Acompanhe o status em tempo real no app.',
    icon: Clock,
    category: ['FOOD', 'HEALTH', 'AGRICULTURE', 'ELECTRONICS', 'BEAUTY', 'ANIMALS', 'FASHION', 'SERVICES', 'HOME_GARDEN', 'EDUCATION', 'SPORTS', 'OTHER'],
  },
]

// ---- Feedback storage key ----
function getFeedbackKey(productId: string): string {
  return `r26-faq-feedback-${productId}`
}

interface FeedbackState {
  [faqId: string]: 'up' | 'down' | null
}

function loadFeedback(productId: string): FeedbackState {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(getFeedbackKey(productId))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveFeedback(productId: string, state: FeedbackState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(getFeedbackKey(productId), JSON.stringify(state))
  } catch {
    // ignore
  }
}

// ---- Props ----
interface ProductFAQProps {
  productId: string
  category: string
  productName: string
}

// ---- FAQ Accordion Item ----
function FAQAccordionItem({
  faq,
  productId,
  feedback,
  onFeedback,
  index,
  isOpen,
  onToggle,
  searchQuery,
}: {
  faq: FAQItem
  productId: string
  feedback: FeedbackState
  onFeedback: (faqId: string, type: 'up' | 'down') => void
  index: number
  isOpen: boolean
  onToggle: () => void
  searchQuery: string
}) {
  const IconComp = faq.icon
  const currentFeedback = feedback[faq.id] || null
  const upCount = 12 + (faq.id.charCodeAt(faq.id.length - 1) % 30)
  const downCount = 2 + (faq.id.charCodeAt(faq.id.length - 2) % 8)

  // Highlight matching text
  const highlightMatch = (text: string) => {
    if (!searchQuery.trim()) return text
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-amber-200 dark:bg-amber-800/40 rounded px-0.5">{part}</mark>
      ) : (
        part
      )
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring' as const, stiffness: 300, damping: 25 }}
      className={`rounded-xl border transition-all duration-300 ${
        isOpen
          ? 'border-primary/30 bg-primary/[0.02] shadow-sm'
          : 'border-border bg-card hover:border-primary/20'
      }`}
    >
      {/* Question header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3.5 text-left group"
      >
        <div className={`shrink-0 h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
          isOpen
            ? 'bg-primary/10 text-primary'
            : 'bg-secondary/80 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
        }`}>
          <IconComp className="h-4 w-4" />
        </div>
        <span className={`flex-1 text-sm font-medium leading-snug ${isOpen ? 'text-foreground' : 'text-foreground/80'}`}>
          {highlightMatch(faq.question)}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
          className="shrink-0"
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Answer body with animated accordion */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 pl-14">
              <Separator className="mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {highlightMatch(faq.answer)}
              </p>

              {/* Feedback section */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <HelpCircle className="h-3 w-3" />
                  Foi útil?
                </span>
                <div className="flex items-center gap-1.5">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => onFeedback(faq.id, 'up')}
                    className={`min-h-[44px] flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium border transition-all ${
                      currentFeedback === 'up'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30'
                        : 'bg-transparent text-muted-foreground border-border hover:border-emerald-300 hover:text-emerald-600'
                    }`}
                  >
                    <ThumbsUp className="h-3 w-3" />
                    {upCount + (currentFeedback === 'up' ? 1 : 0)}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => onFeedback(faq.id, 'down')}
                    className={`min-h-[44px] flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium border transition-all ${
                      currentFeedback === 'down'
                        ? 'bg-red-50 text-red-500 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30'
                        : 'bg-transparent text-muted-foreground border-border hover:border-red-300 hover:text-red-500'
                    }`}
                  >
                    <ThumbsDown className="h-3 w-3" />
                    {downCount + (currentFeedback === 'down' ? 1 : 0)}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ---- Main ProductFAQ Component ----
export function ProductFAQ({ productId, category, productName }: ProductFAQProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const [feedback, setFeedback] = useState<FeedbackState>({})
  const [showAskForm, setShowAskForm] = useState(false)
  const [askName, setAskName] = useState('')
  const [askQuestion, setAskQuestion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isInitialMount = useRef(true)

  // Load feedback from localStorage on mount
  useEffect(() => {
    setFeedback(loadFeedback(productId))
    isInitialMount.current = false
  }, [productId])

  // Save feedback to localStorage when it changes
  useEffect(() => {
    if (isInitialMount.current) return
    saveFeedback(productId, feedback)
  }, [feedback, productId])

  // Filter FAQs by category
  const categoryFAQs = useMemo(() => {
    const categorySpecific = faqDatabase.filter(f => f.category.includes(category))
    const generic = faqDatabase.filter(f => f.id.startsWith('generic-') && !categorySpecific.some(cs => cs.id === f.id))
    return [...categorySpecific, ...generic]
  }, [category])

  // Filter by search query
  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) return categoryFAQs
    const q = searchQuery.toLowerCase()
    return categoryFAQs.filter(
      f => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
    )
  }, [categoryFAQs, searchQuery])

  const handleToggle = useCallback((id: string) => {
    setOpenItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleFeedback = useCallback((faqId: string, type: 'up' | 'down') => {
    setFeedback(prev => {
      const current = prev[faqId]
      if (current === type) {
        // Toggle off
        const next = { ...prev }
        delete next[faqId]
        return next
      }
      return { ...prev, [faqId]: type }
    })
  }, [])

  const handleSubmitQuestion = useCallback(async () => {
    if (!askName.trim() || !askQuestion.trim()) {
      toast.error('Preencha nome e pergunta')
      return
    }
    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      toast.success('Pergunta enviada!', {
        description: `Receberemos sua pergunta sobre "${productName}" em breve.`,
      })
      setAskName('')
      setAskQuestion('')
      setShowAskForm(false)
    } catch {
      toast.error('Erro ao enviar pergunta. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }, [askName, askQuestion, productName])

  const answeredCount = categoryFAQs.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="r62-card-lift r97-product-faq"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2 r62-heading-gradient">
          <MessageSquare className="h-4 w-4 text-primary" />
          Perguntas Frequentes
          <Badge variant="secondary" className="text-[10px] bg-primary/5 text-primary font-bold">
            {answeredCount} respondidas
          </Badge>
        </h3>
      </div>

      {/* Search input */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-3"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar perguntas..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>
      </motion.div>

      {/* FAQ Items */}
      <div className="space-y-2">
        {filteredFAQs.map((faq, i) => (
          <FAQAccordionItem
            key={faq.id}
            faq={faq}
            productId={productId}
            feedback={feedback}
            onFeedback={handleFeedback}
            index={i}
            isOpen={openItems.has(faq.id)}
            onToggle={() => handleToggle(faq.id)}
            searchQuery={searchQuery}
          />
        ))}

        {filteredFAQs.length === 0 && searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-muted-foreground"
          >
            <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhuma pergunta encontrada para &quot;{searchQuery}&quot;</p>
          </motion.div>
        )}
      </div>

      {/* Ask Question Button / Form */}
      <div className="mt-4">
        <AnimatePresence mode="wait">
          {!showAskForm ? (
            <motion.div
              key="btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Button
                variant="outline"
                onClick={() => setShowAskForm(true)}
                className="w-full h-10 text-sm gap-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 rounded-xl"
              >
                <MessageSquare className="h-4 w-4" />
                Enviar Pergunta
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="rounded-xl border border-primary/20 bg-primary/[0.02] p-4 space-y-3"
            >
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5 text-primary" />
                Envie sua pergunta sobre &quot;{productName}&quot;
              </h4>
              <input
                type="text"
                value={askName}
                onChange={(e) => setAskName(e.target.value)}
                placeholder="Seu nome"
                className="w-full h-9 px-3 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
              <textarea
                value={askQuestion}
                onChange={(e) => setAskQuestion(e.target.value)}
                placeholder="Escreva sua pergunta..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-all"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSubmitQuestion}
                  disabled={isSubmitting}
                  className="flex-1 min-h-[44px] text-xs gap-1.5 btn-glow"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  {isSubmitting ? 'Enviando...' : 'Enviar Pergunta'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAskForm(false)}
                  className="h-9 text-xs"
                >
                  Cancelar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
