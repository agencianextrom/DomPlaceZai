'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Star, MessageSquare, Reply, Filter, ThumbsUp, ThumbsDown, Minus,
  CheckCircle2, AlertCircle, Clock, Send, ShieldCheck, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

// -- Types --
interface ApiReview {
  id: string
  accountId: string
  rating: number
  comment: string
  images?: string[]
  reply?: string | null
  replyDate?: string | null
  isVerified: boolean
  createdAt: string
}

interface ApiReviewsResponse {
  reviews: ApiReview[]
  averageRating: number
  ratingDistribution: { rating: number; count: number }[]
}

interface ReviewData {
  id: string
  customerName: string
  customerInitials: string
  rating: number
  comment: string
  date: string
  isVerified: boolean
  reply?: string | null
  replyDate?: string | null
  sentiment: 'positive' | 'neutral' | 'negative'
}

interface ReviewsManagementProps {
  storeId: string | null
}

const sentimentConfig = {
  positive: { label: 'Positivo', color: 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30', icon: ThumbsUp, borderColor: 'border-emerald-200 dark:border-emerald-800/30' },
  neutral: { label: 'Neutro', color: 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30', icon: Minus, borderColor: 'border-amber-200 dark:border-amber-800/30' },
  negative: { label: 'Negativo', color: 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30', icon: ThumbsDown, borderColor: 'border-red-200 dark:border-red-800/30' },
}

function getSentiment(rating: number): 'positive' | 'neutral' | 'negative' {
  if (rating >= 4) return 'positive'
  if (rating === 3) return 'neutral'
  return 'negative'
}

function getInitials(id: string): string {
  const hash = id.slice(-6).toUpperCase()
  return hash.slice(0, 2)
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Agora'
  if (mins < 60) return `${mins} min atrás`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h atrás`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Ontem'
  return `${days} dias atrás`
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}

// -- Loading skeleton --
function ReviewsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-5 w-48" />
          <div className="flex gap-4">
            <Skeleton className="h-16 w-16 rounded" />
            <div className="flex-1 space-y-2">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-2 w-full" />)}
            </div>
          </div>
        </CardContent>
      </Card>
      {[1,2,3].map(i => (
        <Skeleton key={i} className="h-40 w-full rounded-xl" />
      ))}
    </div>
  )
}

export function ReviewsManagement({ storeId }: ReviewsManagementProps) {
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [averageRating, setAverageRating] = useState<number>(0)
  const [ratingDistribution, setRatingDistribution] = useState<{ star: number; count: number; percent: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [replying, setReplying] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [replyingTo, setReplyingTo] = useState<ReviewData | null>(null)
  const [replyText, setReplyText] = useState('')

  // Fetch reviews from API
  const fetchReviews = useCallback(async () => {
    if (!storeId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/reviews?storeId=${storeId}`)
      if (!res.ok) {
        throw new Error('Erro ao carregar avaliações')
      }
      const data: ApiReviewsResponse = await res.json()

      // Map API reviews to ReviewData
      const mappedReviews: ReviewData[] = (data.reviews || []).map((r: ApiReview) => ({
        id: r.id,
        customerName: `Cliente #${r.id.slice(-6).toUpperCase()}`,
        customerInitials: getInitials(r.id),
        rating: r.rating,
        comment: r.comment,
        date: formatTimeAgo(r.createdAt),
        isVerified: r.isVerified,
        reply: r.reply || null,
        replyDate: r.replyDate ? formatTimeAgo(r.replyDate) : null,
        sentiment: getSentiment(r.rating),
      }))

      setReviews(mappedReviews)
      setAverageRating(data.averageRating || 0)

      const total = mappedReviews.length
      const dist = [5, 4, 3, 2, 1].map(star => {
        const apiDist = (data.ratingDistribution || []).find(d => d.rating === star)
        const count = apiDist?.count || mappedReviews.filter(r => r.rating === star).length
        return {
          star,
          count,
          percent: total > 0 ? Math.round((count / total) * 100) : 0,
        }
      })
      setRatingDistribution(dist)
    } catch {
      toast.error('Erro ao carregar avaliações')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [storeId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // Stats
  const stats = useMemo(() => {
    const total = reviews.length
    const sentimentCounts = {
      positive: reviews.filter(r => r.sentiment === 'positive').length,
      neutral: reviews.filter(r => r.sentiment === 'neutral').length,
      negative: reviews.filter(r => r.sentiment === 'negative').length,
    }
    const totalReplied = reviews.filter(r => r.reply).length
    const replyRate = total > 0 ? Math.round((totalReplied / total) * 100) : 0
    return { total, avgRating: averageRating, ratingDistribution, sentimentCounts, totalReplied, replyRate }
  }, [reviews, averageRating, ratingDistribution])

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    if (selectedFilter === 'all') return reviews
    if (selectedFilter === 'pending') return reviews.filter(r => !r.reply)
    if (selectedFilter === 'negative') return reviews.filter(r => r.sentiment === 'negative')
    return reviews.filter(r => r.rating === parseInt(selectedFilter))
  }, [reviews, selectedFilter])

  // Handle reply submission
  const handleReply = async () => {
    if (!replyText.trim() || !replyingTo || !storeId) {
      toast.error('Digite uma resposta antes de enviar')
      return
    }
    setReplying(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          reviewId: replyingTo.id,
          reply: replyText.trim(),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erro ao enviar resposta')
      }
      toast.success('Resposta enviada com sucesso!')
      setReplyDialogOpen(false)
      setReplyText('')
      setReplyingTo(null)
      // Refresh reviews
      fetchReviews()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar resposta')
    } finally {
      setReplying(false)
    }
  }

  const openReplyDialog = (review: ReviewData) => {
    setReplyingTo(review)
    setReplyText('')
    setReplyDialogOpen(true)
  }

  if (loading) {
    return <ReviewsLoadingSkeleton />
  }

  if (!storeId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">Nenhuma loja encontrada</p>
      </div>
    )
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
            <Button onClick={handleReply} disabled={replying} className="h-9 text-xs gap-1 bg-primary text-primary-foreground">
              {replying ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Send className="h-3 w-3" />
              )}
              Enviar Resposta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
