'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface StorySlide {
  emoji: string
  title: string
  text: string
  gradient: string
}

interface StoryEntry {
  id: string
  name: string
  initial: string
  category: string
  categoryLabel: string
  gradientFrom: string
  gradientTo: string
  avatarBg: string
  seen: boolean
  slides: StorySlide[]
}

const storyData: StoryEntry[] = [
  {
    id: 's1',
    name: 'Festa do Açaí',
    initial: 'F',
    category: 'eventos',
    categoryLabel: 'Eventos',
    gradientFrom: '#f59e0b',
    gradientTo: '#ef4444',
    avatarBg: 'from-amber-500 to-red-500',
    seen: false,
    slides: [
      { emoji: '🎉', title: 'Festa do Açaí 2025!', text: 'A maior festa do Pará chega a Dom Eliseu com muita música e sabor.', gradient: 'from-amber-500 via-orange-500 to-red-500' },
      { emoji: '🎵', title: 'Shows ao Vivo', text: 'Banda regional e DJs locais animando a noite de sábado.', gradient: 'from-rose-500 via-pink-500 to-fuchsia-500' },
      { emoji: '🍇', title: 'Açaí Gratuito', text: 'Primeiras 100 pessoas ganham açaí cremoso grátis!', gradient: 'from-purple-500 via-violet-500 to-indigo-500' },
    ],
  },
  {
    id: 's2',
    name: 'Dona Maria',
    initial: 'M',
    category: 'pessoas',
    categoryLabel: 'Pessoas',
    gradientFrom: '#10b981',
    gradientTo: '#06b6d4',
    avatarBg: 'from-emerald-500 to-teal-500',
    seen: false,
    slides: [
      { emoji: '👩‍🍳', title: 'Dona Maria do Açaí', text: '30 anos servindo o melhor açaí de Dom Eliseu. Uma história de amor pela culinária paraense.', gradient: 'from-emerald-500 via-teal-500 to-cyan-500' },
      { emoji: '🏆', title: 'Prêmio Estadual', text: 'Reconhecida como a melhor produtora de açaí artesanal do sudeste do Pará.', gradient: 'from-teal-500 via-cyan-500 to-blue-500' },
      { emoji: '❤️', title: 'Legado Familiar', text: 'A filha já segue os passos e promete manter a tradição viva.', gradient: 'from-pink-500 via-rose-500 to-red-500' },
      { emoji: '🌿', title: 'Sustentabilidade', text: 'Utiliza apenas frutos colhidos de forma sustentável da região.', gradient: 'from-green-500 via-emerald-500 to-teal-500' },
    ],
  },
  {
    id: 's3',
    name: 'Mercado do Zé',
    initial: 'M',
    category: 'negocios',
    categoryLabel: 'Negócios',
    gradientFrom: '#06b6d4',
    gradientTo: '#3b82f6',
    avatarBg: 'from-cyan-500 to-blue-500',
    seen: false,
    slides: [
      { emoji: '🏪', title: '50 Anos de História', text: 'O Mercado do Zé comemora meio século atendendo as famílias de Dom Eliseu.', gradient: 'from-cyan-500 via-blue-500 to-indigo-500' },
      { emoji: '📦', title: 'Novas Seções', text: 'Ampliação completa com sessão de produtos orgânicos e especiais.', gradient: 'from-blue-500 via-indigo-500 to-violet-500' },
      { emoji: '💰', title: 'Preços Justos', text: 'Compromisso com preços acessíveis para toda a comunidade.', gradient: 'from-emerald-500 via-green-500 to-lime-500' },
    ],
  },
  {
    id: 's4',
    name: 'Praça Renovada',
    initial: 'P',
    category: 'comunidade',
    categoryLabel: 'Comunidade',
    gradientFrom: '#8b5cf6',
    gradientTo: '#ec4899',
    avatarBg: 'from-violet-500 to-pink-500',
    seen: false,
    slides: [
      { emoji: '🌳', title: 'Praça Central Renovada', text: 'A Praça Central ganhou nova fase com playground, academia ao ar livre e Wi-Fi grátis.', gradient: 'from-violet-500 via-purple-500 to-fuchsia-500' },
      { emoji: '🏃', title: 'Academia ao Ar Livre', text: 'Equipamentos novos para toda a comunidade exercitar-se gratuitamente.', gradient: 'from-fuchsia-500 via-pink-500 to-rose-500' },
      { emoji: '✨', title: 'Iluminação LED', text: 'Praça completamente iluminada com energia sustentável solar.', gradient: 'from-amber-400 via-yellow-400 to-orange-400' },
    ],
  },
  {
    id: 's5',
    name: 'Padaria Pão Quente',
    initial: 'P',
    category: 'negocios',
    categoryLabel: 'Negócios',
    gradientFrom: '#f97316',
    gradientTo: '#eab308',
    avatarBg: 'from-orange-500 to-yellow-500',
    seen: true,
    slides: [
      { emoji: '🍞', title: 'Pão Fresco Todo Dia', text: 'A Padaria Pão Quente agora abre às 4h com pão saindo quentinho do forno.', gradient: 'from-orange-500 via-amber-500 to-yellow-500' },
      { emoji: '🧁', title: 'Novos Doces', text: 'Cardápio expandido com bolos artesanais e doces paraenses.', gradient: 'from-pink-500 via-rose-500 to-red-500' },
      { emoji: '🚚', title: 'Entrega Expressa', text: 'Entrega de café da manhã em até 20 minutos pela manhã!', gradient: 'from-emerald-500 via-teal-500 to-cyan-500' },
    ],
  },
  {
    id: 's6',
    name: 'Time do Bairro',
    initial: 'T',
    category: 'eventos',
    categoryLabel: 'Eventos',
    gradientFrom: '#22c55e',
    gradientTo: '#14b8a6',
    avatarBg: 'from-green-500 to-teal-500',
    seen: false,
    slides: [
      { emoji: '⚽', title: 'Campeonato Local', text: 'O Campeonato Inter-Bairros 2025 começou! 8 equipes disputando o título.', gradient: 'from-green-500 via-emerald-500 to-teal-500' },
      { emoji: '🥇', title: 'Classificação', text: 'Primeira fase com jogos aos sábados na quadra da escola municipal.', gradient: 'from-teal-500 via-cyan-500 to-sky-500' },
      { emoji: '🏟️', title: 'Final no Mês', text: 'Grande final com premiação e show musical na praça central.', gradient: 'from-indigo-500 via-blue-500 to-sky-500' },
    ],
  },
  {
    id: 's7',
    name: 'Profa. Ana',
    initial: 'A',
    category: 'pessoas',
    categoryLabel: 'Pessoas',
    gradientFrom: '#ec4899',
    gradientTo: '#f43f5e',
    avatarBg: 'from-pink-500 to-rose-500',
    seen: false,
    slides: [
      { emoji: '👩‍🏫', title: 'Professora Ana Silva', text: 'Professora da escola municipal premiada por projeto de leitura comunitária.', gradient: 'from-pink-500 via-rose-500 to-red-500' },
      { emoji: '📚', title: 'Biblioteca Comunitária', text: 'Criou uma pequena biblioteca comunitária que já atendeu mais de 200 crianças.', gradient: 'from-rose-500 via-red-500 to-orange-500' },
      { emoji: '🌟', title: 'Reconhecimento', text: 'Recebeu o prêmio Educadora do Ano da região sudeste do Pará.', gradient: 'from-amber-500 via-yellow-500 to-lime-500' },
    ],
  },
  {
    id: 's8',
    name: 'Feira Livre',
    initial: 'F',
    category: 'comunidade',
    categoryLabel: 'Comunidade',
    gradientFrom: '#84cc16',
    gradientTo: '#22c55e',
    avatarBg: 'from-lime-500 to-green-500',
    seen: true,
    slides: [
      { emoji: '🥬', title: 'Feira do Produtor', text: 'Toda manhã de sábado, produtores locais vendem direto da fazenda.', gradient: 'from-lime-500 via-green-500 to-emerald-500' },
      { emoji: '🧑‍🌾', title: 'Produtores Locais', text: 'Mais de 30 famílias de agricultores participam da feira semanal.', gradient: 'from-emerald-500 via-teal-500 to-cyan-500' },
      { emoji: '🛒', title: 'Preços Direto', text: 'Produtos frescos a preços justos, sem intermediários.', gradient: 'from-yellow-500 via-amber-500 to-orange-500' },
    ],
  },
]

const SLIDE_DURATION = 5000

const categoryColors: Record<string, string> = {
  eventos: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  pessoas: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  negocios: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  comunidade: 'bg-violet-500/15 text-violet-700 dark:text-violet-400',
}

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => setDisplay(value), 100)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <span>{display}</span>
  )
}

export function DomEliseuStories() {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [seenStories, setSeenStories] = useState<Set<string>>(new Set())
  const allViewed = useMemo(() => seenStories.size === storyData.length && storyData.length > 0, [seenStories, storyData.length])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const currentStory = activeStoryIndex !== null ? storyData[activeStoryIndex] : null
  const currentSlide = currentStory ? currentStory.slides[activeSlideIndex] : null
  const unseenCount = storyData.filter(s => !seenStories.has(s.id)).length

  const markAsSeen = useCallback((storyId: string) => {
    setSeenStories(prev => {
      const next = new Set(prev)
      next.add(storyId)
      return next
    })
  }, [])

  const handleClose = useCallback(() => {
    if (activeStoryIndex !== null) {
      markAsSeen(storyData[activeStoryIndex].id)
    }
    setActiveStoryIndex(null)
    setActiveSlideIndex(0)
  }, [activeStoryIndex, markAsSeen])

  const goNextSlide = useCallback(() => {
    if (activeStoryIndex === null || !currentStory) return
    if (activeSlideIndex < currentStory.slides.length - 1) {
      setActiveSlideIndex(prev => prev + 1)
    } else {
      const nextStoryIdx = activeStoryIndex + 1
      if (nextStoryIdx < storyData.length) {
        markAsSeen(storyData[activeStoryIndex].id)
        setActiveStoryIndex(nextStoryIdx)
        setActiveSlideIndex(0)
      } else {
        markAsSeen(storyData[activeStoryIndex].id)
        handleClose()
      }
    }
  }, [currentStory, activeSlideIndex, activeStoryIndex, markAsSeen, handleClose])

  const goPrevSlide = useCallback(() => {
    if (activeStoryIndex === null) return
    if (activeSlideIndex > 0) {
      setActiveSlideIndex(prev => prev - 1)
    } else if (activeStoryIndex > 0) {
      const prevStory = storyData[activeStoryIndex - 1]
      setActiveStoryIndex(activeStoryIndex - 1)
      setActiveSlideIndex(prevStory.slides.length - 1)
    }
  }, [activeSlideIndex, activeStoryIndex])

  const handleViewAll = useCallback(() => {
    setSeenStories(new Set(storyData.map(s => s.id)))
    setActiveStoryIndex(null)
    setActiveSlideIndex(0)
  }, [])

  useEffect(() => {
    if (activeStoryIndex === null || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      goNextSlide()
    }, SLIDE_DURATION)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [activeStoryIndex, isPaused, goNextSlide])

  return (
    <>
      {/* Horizontal scrollable story circles */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="text-base font-bold flex items-center gap-2">
            <span className="text-xl">📖</span>
            Histórias de Dom Eliseu
          </h2>
          {allViewed && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
            >
              Vi todas
            </motion.span>
          )}
        </div>

        <div ref={scrollRef} className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 px-1">
          {storyData.map((story, idx) => {
            const isSeen = seenStories.has(story.id)
            return (
              <motion.button
                key={story.id}
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                onClick={() => {
                  setActiveStoryIndex(idx)
                  setActiveSlideIndex(0)
                  setIsPaused(false)
                }}
                className="flex flex-col items-center gap-1 shrink-0 r37-story-card"
              >
                {/* Story circle with gradient ring */}
                <div className="relative">
                  <div
                    className="h-16 w-16 rounded-full p-[2.5px] r37-story-ring"
                    style={{
                      background: isSeen
                        ? 'rgba(128,128,128,0.3)'
                        : `linear-gradient(135deg, ${story.gradientFrom}, ${story.gradientTo})`,
                    }}
                  >
                    <div className="h-full w-full rounded-full bg-background flex items-center justify-center">
                      <span
                        className={`h-12 w-12 rounded-full bg-gradient-to-br ${story.avatarBg} flex items-center justify-center text-white font-bold text-lg ${isSeen ? 'opacity-50' : ''}`}
                      >
                        {story.initial}
                      </span>
                    </div>
                  </div>
                  {/* NOVO badge */}
                  {!isSeen && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' as const, stiffness: 500, damping: 25 }}
                      className="absolute -top-0.5 -right-0.5 h-4 px-1.5 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-[8px] font-bold text-white leading-none">NOVO</span>
                    </motion.div>
                  )}
                </div>
                <span className={`text-[10px] font-medium leading-tight max-w-[64px] truncate ${isSeen ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {story.name}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* Category chips */}
        <div className="flex gap-1.5 mt-1 px-1">
          {['eventos', 'pessoas', 'negocios', 'comunidade'].map(cat => {
            const labels: Record<string, string> = {
              eventos: 'Eventos',
              pessoas: 'Pessoas',
              negocios: 'Negócios',
              comunidade: 'Comunidade',
            }
            const count = storyData.filter(s => s.category === cat).length
            return (
              <span
                key={cat}
                className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${categoryColors[cat]}`}
              >
                {labels[cat]} ({count})
              </span>
            )
          })}
        </div>
      </div>

      {/* Full-screen Story Viewer */}
      <AnimatePresence>
        {activeStoryIndex !== null && currentSlide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
            {/* Progress bars */}
            <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 px-3 pt-3">
              {storyData[activeStoryIndex!].slides.map((_, slideIdx) => (
                <div key={slideIdx} className="flex-1 h-[3px] bg-white/25 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: slideIdx < activeSlideIndex ? '100%' : '0%' }}
                    animate={
                      slideIdx < activeSlideIndex
                        ? { width: '100%' }
                        : slideIdx === activeSlideIndex
                          ? { width: isPaused ? undefined : '100%' }
                          : { width: '0%' }
                    }
                    transition={
                      slideIdx === activeSlideIndex && !isPaused
                        ? { duration: SLIDE_DURATION / 1000, ease: 'linear' as const }
                        : { duration: 0.3 }
                    }
                  >
                    {slideIdx === activeSlideIndex && !isPaused && (
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent r37-story-shimmer"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                      />
                    )}
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-6 left-0 right-0 z-10 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <motion.div
                  className="h-8 w-8 rounded-full p-[1.5px] r37-story-active-ring"
                  animate={{ boxShadow: [`0 0 6px ${currentStory!.gradientFrom}50`, `0 0 16px ${currentStory!.gradientTo}60`, `0 0 6px ${currentStory!.gradientFrom}50`] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                  style={{
                    background: `linear-gradient(135deg, ${currentStory!.gradientFrom}, ${currentStory!.gradientTo})`,
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                    className="h-full w-full rounded-full bg-black/80 flex items-center justify-center"
                  >
                    <span className={`h-6 w-6 rounded-full bg-gradient-to-br ${currentStory!.avatarBg} flex items-center justify-center text-white font-bold text-[10px]`}>
                      {currentStory!.initial}
                    </span>
                  </motion.div>
                </motion.div>
                <div>
                  <p className="text-white text-xs font-semibold">{currentStory!.name}</p>
                  <p className="text-white/60 text-[9px]">{currentStory!.categoryLabel}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unseenCount > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleViewAll}
                    className="text-white/70 text-[10px] font-medium px-2.5 py-1 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
                  >
                    Marcar todas como lidas
                  </motion.button>
                )}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="h-8 w-8 min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Slide content — click left/right halves to navigate */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeStoryIndex}-${activeSlideIndex}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex items-center justify-center relative"
                onClick={() => setIsPaused(prev => !prev)}
              >
                {/* Slide background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${currentSlide.gradient}`} />

                {/* Tap zones for navigation */}
                <button
                  onClick={(e) => { e.stopPropagation(); goPrevSlide(); }}
                  className="absolute left-0 top-0 bottom-0 w-1/3 z-[5]"
                  aria-label="História anterior"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); goNextSlide(); }}
                  className="absolute right-0 top-0 bottom-0 w-1/3 z-[5]"
                  aria-label="Próxima história"
                />

                {/* Slide content */}
                <div className="relative z-[2] text-center px-8 max-w-sm mx-auto">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 300, damping: 25, delay: 0.1 }}
                    className="text-7xl sm:text-8xl mb-4"
                  >
                    {currentSlide.emoji}
                  </motion.div>
                  <motion.h3
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                    className="text-xl sm:text-2xl font-bold text-white mb-3 drop-shadow-lg"
                  >
                    {currentSlide.title}
                  </motion.h3>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25, duration: 0.3 }}
                    className="text-sm sm:text-base text-white/90 leading-relaxed drop-shadow"
                  >
                    {currentSlide.text}
                  </motion.p>
                </div>

                {/* Pause indicator */}
                <AnimatePresence>
                  {isPaused && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] pointer-events-none"
                    >
                      <div className="h-12 w-12 rounded-full bg-black/50 flex items-center justify-center">
                        <span className="text-2xl">⏸️</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>

            {/* Bottom navigation hints */}
            <div className="absolute bottom-6 left-0 right-0 z-10 flex items-center justify-center gap-6">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={goPrevSlide}
                disabled={activeSlideIndex === 0 && activeStoryIndex === 0}
                className="h-9 w-9 min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4 text-white" />
              </motion.button>

              <span className="text-white/60 text-xs font-medium">
                {activeSlideIndex + 1} / {currentStory!.slides.length}
              </span>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={goNextSlide}
                className="h-9 w-9 min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-white" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
