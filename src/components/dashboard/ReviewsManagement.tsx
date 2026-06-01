'use client'

import { useState, useMemo } from 'react'
import {
  Star, MessageSquare, Reply, Filter, ThumbsUp, ThumbsDown, Minus,
  CheckCircle2, XCircle, AlertCircle, User, Clock, Send, ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface ReviewData {
  id: string
  customerName: string
  customerInitials: string
  rating: number
  comment: string
  date: string
  productName: string
  isVerified: boolean
  reply?: string
  replyDate?: string
  sentiment: 'positive' | 'neutral' | 'negative'
}

const mockReviews: ReviewData[] = [
  { id: 'r1', customerName: 'Maria Silva', customerInitials: 'MS', rating: 5, comment: 'Melhor açaí da cidade! Sempre fresquinho e com acompanhamentos deliciosos. Recomendo demais!', date: '2 horas atrás', productName: 'Açaí 500ml', isVerified: true, reply: 'Obrigado Maria! Ficamos felizes com seu feedback! 🥰', replyDate: '1 hora atrás', sentiment: 'positive' },
  { id: 'r2', customerName: 'João Santos', customerInitials: 'JS', rating: 4, comment: 'Muito bom, mas a entrega demorou um pouco mais do que o esperado. Produto de qualidade.', date: '5 horas atrás', productName: 'Açaí Premium 700ml', isVerified: true, sentiment: 'positive' },
  { id: 'r3', customerName: 'Ana Oliveira', customerInitials: 'AO', rating: 5, comment: 'Amei! O combo família é perfeito para reuniões. Já é a terceira vez que peço.', date: '1 dia atrás', productName: 'Combo Família 1L', isVerified: true, sentiment: 'positive' },
  { id: 'r4', customerName: 'Pedro Costa', customerInitials: 'PC', rating: 3, comment: 'Produto ok, mas achei a porção pequena para o preço. O sabor é bom.', date: '2 dias atrás', productName: 'Smoothie de Açaí', isVerified: false, sentiment: 'neutral' },
  { id: 'r5', customerName: 'Carla Mendes', customerInitials: 'CM', rating: 5, comment: 'Incrível! Chegou super rápido e estava perfeito. A granola artesanal faz toda a diferença!', date: '2 dias atrás', productName: 'Açaí 500ml', isVerified: true, reply: 'Que ótimo saber, Carla! A granola é nossa especial! 🌟', replyDate: '2 dias atrás', sentiment: 'positive' },
  { id: 'r6', customerName: 'Lucas Ferreira', customerInitials: 'LF', rating: 2, comment: 'Pedi o açaí com granola e veio sem granola. Precisa melhorar o atendimento.', date: '3 dias atrás', productName: 'Açaí com Granola 300ml', isVerified: true, sentiment: 'negative' },
  { id: 'r7', customerName: 'Beatriz Souza', customerInitials: 'BS', rating: 4, comment: 'Muito saboroso! Só acho que poderia ter mais opções de acompanhamentos.', date: '4 dias atrás', productName: 'Tigela Especial', isVerified: false, sentiment: 'positive' },
  { id: 'r8', customerName: 'Ricardo Lima', customerInitials: 'RL', rating: 1, comment: 'Entrega atrasou mais de 1 hora e o produto veio completamente derretido. Péssimo!', date: '5 dias atrás', productName: 'Açaí 500ml', isVerified: true, reply: 'Sentimos muito pelo transtorno, Ricardo. Já acionamos nossa equipe de entregas para resolver isso. Gostaríamos de reembolsar seu pedido. Entre em contato conosco!', replyDate: '5 dias atrás', sentiment: 'negative' },
]

const sentimentConfig = {
  positive: { label: 'Positivo', color: 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30', icon: ThumbsUp, borderColor: 'border-emerald-200 dark:border-emerald-800/30' },
  neutral: { label: 'Neutro', color: 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30', icon: Minus, borderColor: 'border-amber-200 dark:border-amber-800/30' },
  negative: { label: 'Negativo', color: 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30', icon: ThumbsDown, borderColor: 'border-red-200 dark:border-red-800/30' },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}

export function ReviewsManagement() {
  const [reviews] = useState<ReviewData[]>(mockReviews)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [replyingTo, setReplyingTo] = useState<ReviewData | null>(null)
  const [replyText, setReplyText] = useState('')

  // Stats
  const stats = useMemo(() => {
    const total = reviews.length
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / total
    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
      star,
      count: reviews.filter(r => r.rating === star).length,
      percent: Math.round((reviews.filter(r => r.rating === star).length / total) * 100),
    }))
    const sentimentCounts = {
      positive: reviews.filter(r => r.sentiment === 'positive').length,
      neutral: reviews.filter(r => r.sentiment === 'neutral').length,
      negative: reviews.filter(r => r.sentiment === 'negative').length,
    }
    const totalReplied = reviews.filter(r => r.reply).length
    const replyRate = Math.round((totalReplied / total) * 100)
    return { total, avgRating, ratingDistribution, sentimentCounts, totalReplied, replyRate }
  }, [reviews])

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    if (selectedFilter === 'all') return reviews
    if (selectedFilter === 'pending') return reviews.filter(r => !r.reply)
    if (selectedFilter === 'negative') return reviews.filter(r => r.sentiment === 'negative')
    return reviews.filter(r => r.rating === parseInt(selectedFilter))
  }, [reviews, selectedFilter])

  const handleReply = () => {
    if (!replyText.trim()) {
      toast.error('Digite uma resposta antes de enviar')
      return
    }
    toast.success('Resposta enviada com sucesso!')
    setReplyDialogOpen(false)
    setReplyText('')
    setReplyingTo(null)
  }

  const openReplyDialog = (review: ReviewData) => {
    setReplyingTo(review)
    setReplyText('')
    setReplyDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-border/50 overflow-hidden">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              Resumo das Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {/* Rating overview */}
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.avgRating.toFixed(1)}</p>
                <div className="flex gap-0.5 mt-1 justify-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`h-3.5 w-3.5 ${star <= Math.round(stats.avgRating) ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{stats.total} avaliações</p>
              </div>

              {/* Rating distribution */}
              <div className="flex-1 space-y-1">
                {stats.ratingDistribution.map(item => (
                  <div key={item.star} className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-muted-foreground w-2">{item.star}</span>
                    <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500 shrink-0" />
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percent}%` }}
                        transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-5 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-3" />

            {/* Sentiment + Reply stats */}
            <div className="grid grid-cols-2 gap-3">
              {/* Sentiment */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Sentimento
                </p>
                <div className="space-y-1.5">
                  {(Object.entries(stats.sentimentCounts) as [keyof typeof sentimentConfig, number][]).map(([sentiment, count]) => {
                    const config = sentimentConfig[sentiment]
                    const SentimentIcon = config.icon
                    return (
                      <div key={sentiment} className="flex items-center gap-2">
                        <SentimentIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] flex-1">{config.label}</span>
                        <Badge className={`${config.color} text-[9px] px-1.5 py-0 border-0`}>
                          {count}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Reply stats */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                  <Reply className="h-3 w-3" />
                  Respostas
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px]">Total respondidas</span>
                    <span className="text-xs font-bold">{stats.totalReplied}/{stats.total}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.replyRate}%` }}
                      transition={{ delay: 0.4, duration: 0.8 }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{stats.replyRate}% de taxa de resposta</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filter tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          <Button
            size="sm"
            variant={selectedFilter === 'all' ? 'default' : 'outline'}
            className={`h-8 text-xs shrink-0 ${selectedFilter === 'all' ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => setSelectedFilter('all')}
          >
            Todas ({reviews.length})
          </Button>
          {['5', '4', '3', '2', '1'].map(star => (
            <Button
              key={star}
              size="sm"
              variant={selectedFilter === star ? 'default' : 'outline'}
              className={`h-8 text-xs shrink-0 gap-1 ${selectedFilter === star ? 'bg-primary text-primary-foreground' : ''}`}
              onClick={() => setSelectedFilter(star)}
            >
              <Star className={`h-3 w-3 ${selectedFilter === star ? 'text-white fill-white' : 'text-amber-500 fill-amber-500'}`} />
              {star} ({reviews.filter(r => r.rating === parseInt(star)).length})
            </Button>
          ))}
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button
            size="sm"
            variant={selectedFilter === 'pending' ? 'default' : 'outline'}
            className={`h-8 text-xs shrink-0 ${selectedFilter === 'pending' ? 'bg-amber-500 hover:bg-amber-600 text-white border-0' : ''}`}
            onClick={() => setSelectedFilter('pending')}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Sem resposta ({reviews.filter(r => !r.reply).length})
          </Button>
          <Button
            size="sm"
            variant={selectedFilter === 'negative' ? 'default' : 'outline'}
            className={`h-8 text-xs shrink-0 ${selectedFilter === 'negative' ? 'bg-red-500 hover:bg-red-600 text-white border-0' : ''}`}
            onClick={() => setSelectedFilter('negative')}
          >
            <ThumbsDown className="h-3 w-3 mr-1" />
            Negativas ({stats.sentimentCounts.negative})
          </Button>
        </div>
      </motion.div>

      {/* Reviews list */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedFilter}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0 }}
          className="space-y-3"
        >
          {filteredReviews.length === 0 ? (
            <motion.div variants={itemVariants} className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhuma avaliação encontrada</p>
            </motion.div>
          ) : (
            filteredReviews.map(review => {
              const sentimentCfg = sentimentConfig[review.sentiment]
              const SentimentIcon = sentimentCfg.icon

              return (
                <motion.div key={review.id} variants={itemVariants}>
                  <Card className={`border ${sentimentCfg.borderColor} overflow-hidden`}>
                    <CardContent className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0">
                            {review.customerInitials}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold">{review.customerName}</p>
                              {review.isVerified && (
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[8px] px-1 py-0 border-0 gap-0.5">
                                  <ShieldCheck className="h-2.5 w-2.5" />
                                  Verificado
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 ${star <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Clock className="h-2.5 w-2.5" />
                                {review.date}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge className={`${sentimentCfg.color} text-[9px] px-1.5 py-0 border-0 gap-0.5 shrink-0`}>
                          <SentimentIcon className="h-2.5 w-2.5" />
                          {sentimentCfg.label}
                        </Badge>
                      </div>

                      {/* Product */}
                      <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                        <span className="font-medium">Produto:</span>
                        {review.productName}
                      </p>

                      {/* Comment */}
                      <p className="text-sm mt-2 leading-relaxed">{review.comment}</p>

                      {/* Reply */}
                      {review.reply && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 bg-primary/5 dark:bg-primary/10 rounded-lg p-3 border border-primary/10"
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Reply className="h-3 w-3 text-primary" />
                            <span className="text-[10px] font-semibold text-primary">Resposta da loja</span>
                            {review.replyDate && (
                              <span className="text-[10px] text-muted-foreground">• {review.replyDate}</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{review.reply}</p>
                        </motion.div>
                      )}

                      {/* Actions */}
                      {!review.reply && (
                        <div className="mt-3 flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs gap-1"
                            onClick={() => openReplyDialog(review)}
                          >
                            <Reply className="h-3 w-3" />
                            Responder
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}
        </motion.div>
      </AnimatePresence>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Reply className="h-4 w-4 text-primary" />
              Responder Avaliação
            </DialogTitle>
          </DialogHeader>
          {replyingTo && (
            <div className="space-y-4">
              {/* Review preview */}
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                    {replyingTo.customerInitials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{replyingTo.customerName}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`h-2.5 w-2.5 ${star <= replyingTo.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{replyingTo.comment}</p>
              </div>

              {/* Reply textarea */}
              <div className="space-y-2">
                <label className="text-xs font-medium">Sua resposta</label>
                <Textarea
                  placeholder="Digite sua resposta..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[80px] resize-none text-sm"
                />
                <p className="text-[10px] text-muted-foreground">
                  Sua resposta será visível publicamente
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)} className="h-9 text-xs">
              Cancelar
            </Button>
            <Button onClick={handleReply} className="h-9 text-xs gap-1 bg-primary text-primary-foreground">
              <Send className="h-3 w-3" />
              Enviar Resposta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
