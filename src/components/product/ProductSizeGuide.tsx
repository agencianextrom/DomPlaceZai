'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ruler, ChevronDown, ChevronUp, Info, Save, Trash2, Lightbulb, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface ProductSizeGuideProps {
  productId?: string
  category?: string
}

// Clothing size data
const clothingSizes = [
  { size: 'PP', chest: '78-82', waist: '58-62', hip: '84-88', weight: '45-52', height: '150-157' },
  { size: 'P', chest: '83-87', waist: '63-67', hip: '89-93', weight: '53-60', height: '158-164' },
  { size: 'M', chest: '88-92', waist: '68-72', hip: '94-98', weight: '61-68', height: '165-171' },
  { size: 'G', chest: '93-97', waist: '73-77', hip: '99-103', weight: '69-76', height: '172-178' },
  { size: 'GG', chest: '98-104', waist: '78-86', hip: '104-110', weight: '77-86', height: '179-185' },
  { size: 'XG', chest: '105-112', waist: '87-96', hip: '111-118', weight: '87-98', height: '186-194' },
]

// Shoe size data
const shoeSizes = [
  { size: 34, length: '21.5' },
  { size: 35, length: '22.0' },
  { size: 36, length: '22.5' },
  { size: 37, length: '23.5' },
  { size: 38, length: '24.0' },
  { size: 39, length: '25.0' },
  { size: 40, length: '25.5' },
  { size: 41, length: '26.0' },
  { size: 42, length: '27.0' },
  { size: 43, length: '27.5' },
  { size: 44, length: '28.5' },
  { size: 45, length: '29.0' },
]

// Accessory size data
const accessorySizes = [
  { size: 'P', wrist: '14-16', head: '54-56' },
  { size: 'M', wrist: '16-18', head: '56-58' },
  { size: 'G', wrist: '18-20', head: '58-60' },
  { size: 'GG', wrist: '20-22', head: '60-62' },
]

// Tab categories
const categories = [
  { id: 'roupas', label: 'Roupas', emoji: '👕' },
  { id: 'calcados', label: 'Calçados', emoji: '👟' },
  { id: 'acessorios', label: 'Acessórios', emoji: '👒' },
]

// Helper tips for measuring
const measureTips = [
  { area: 'Peito', tip: 'Meça ao redor da parte mais larga do peito, mantendo a fita justa mas sem apertar.' },
  { area: 'Cintura', tip: 'Meça na parte mais estreita da cintura, normalmente entre as costelas e o quadril.' },
  { area: 'Quadril', tip: 'Meça na parte mais larga do quadril, com os pés juntos.' },
  { area: 'Pé', tip: 'Fique em pé sobre uma folha de papel e marque os extremos do pé. Meça a distância entre os pontos.' },
]

// Confetti particle component
function TapeMeasureParticle({ delay }: { delay: number }) {
  const particles = ['📏', '🔲', '📐', '📏', '📐']
  const emoji = particles[Math.floor(delay) % particles.length]
  return (
    <motion.span
      className="absolute text-lg pointer-events-none select-none"
      style={{ top: `${10 + (delay * 15) % 80}%`, left: `${5 + (delay * 23) % 90}%` }}
      initial={{ opacity: 0, scale: 0, rotate: -30 }}
      animate={{
        opacity: [0, 0.4, 0],
        scale: [0, 1, 0.5],
        rotate: [-30, 15, 45],
        y: [0, -20, -40],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        repeatDelay: delay * 0.5,
        ease: 'easeInOut',
      }}
    >
      {emoji}
    </motion.span>
  )
}

// Body measurement SVG illustration
function BodyMeasureSVG() {
  return (
    <motion.svg
      viewBox="0 0 200 320"
      className="w-28 h-44 mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Body outline */}
      <motion.ellipse
        cx="100"
        cy="35"
        rx="22"
        ry="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-primary/40"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      />
      {/* Torso */}
      <motion.path
        d="M78 60 L72 140 L100 150 L128 140 L122 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-primary/40"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
      />
      {/* Arms */}
      <motion.path
        d="M78 65 L55 120 L60 125"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-primary/40"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      />
      <motion.path
        d="M122 65 L145 120 L140 125"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-primary/40"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      />
      {/* Legs */}
      <motion.path
        d="M85 150 L80 250 L75 280"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-primary/40"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      />
      <motion.path
        d="M115 150 L120 250 L125 280"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-primary/40"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      />

      {/* Measurement points */}
      {/* Chest line */}
      <motion.line
        x1="58" y1="85" x2="142" y2="85"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="3 3"
        className="text-emerald-500"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      />
      <motion.circle cx="58" cy="85" r="3" fill="currentColor" className="text-emerald-500" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5 }} />
      <motion.circle cx="142" cy="85" r="3" fill="currentColor" className="text-emerald-500" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5 }} />
      <motion.text x="148" y="88" fontSize="8" fill="currentColor" className="text-emerald-600 dark:text-emerald-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }}>Peito</motion.text>

      {/* Waist line */}
      <motion.line
        x1="68" y1="115" x2="132" y2="115"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="3 3"
        className="text-amber-500"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 1.4 }}
      />
      <motion.circle cx="68" cy="115" r="3" fill="currentColor" className="text-amber-500" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.6 }} />
      <motion.circle cx="132" cy="115" r="3" fill="currentColor" className="text-amber-500" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.6 }} />
      <motion.text x="138" y="118" fontSize="8" fill="currentColor" className="text-amber-600 dark:text-amber-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>Cintura</motion.text>

      {/* Hip line */}
      <motion.line
        x1="65" y1="140" x2="135" y2="140"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="3 3"
        className="text-rose-500"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 1.6 }}
      />
      <motion.circle cx="65" cy="140" r="3" fill="currentColor" className="text-rose-500" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.8 }} />
      <motion.circle cx="135" cy="140" r="3" fill="currentColor" className="text-rose-500" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.8 }} />
      <motion.text x="141" y="143" fontSize="8" fill="currentColor" className="text-rose-600 dark:text-rose-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0 }}>Quadril</motion.text>
    </motion.svg>
  )
}

export function ProductSizeGuide({ productId, category }: ProductSizeGuideProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(
    category === 'SHOES' ? 'calcados' : category === 'ACCESSORIES' ? 'acessorios' : 'roupas'
  )
  const [savedSize, setSavedSize] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('domplace-saved-size')
    }
    return null
  })
  const [heightInput, setHeightInput] = useState('')
  const [weightInput, setWeightInput] = useState('')
  const [showTips, setShowTips] = useState(false)
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null)

  // Size recommendation based on height/weight
  const handleRecommend = () => {
    const h = parseFloat(heightInput)
    const w = parseFloat(weightInput)
    if (!h || !w || h < 100 || h > 220 || w < 30 || w > 200) {
      setRecommendedSize(null)
      return
    }
    let idx = 0
    if (h >= 158 && w >= 53) idx = 1
    if (h >= 165 && w >= 61) idx = 2
    if (h >= 172 && w >= 69) idx = 3
    if (h >= 179 && w >= 77) idx = 4
    if (h >= 186 && w >= 87) idx = 5
    setRecommendedSize(clothingSizes[idx].size)
  }

  const handleSaveSize = (size: string) => {
    setSavedSize(size)
    if (typeof window !== 'undefined') {
      localStorage.setItem('domplace-saved-size', size)
    }
  }

  const handleClearSize = () => {
    setSavedSize(null)
    setRecommendedSize(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('domplace-saved-size')
    }
  }

  const activeSizeToHighlight = savedSize || recommendedSize

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="mt-4"
    >
      <Card className="border-primary/20 overflow-hidden relative r62-card-lift r90-size-guide-card">
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[0, 1, 2, 3, 4].map(i => (
            <TapeMeasureParticle key={i} delay={i * 0.7} />
          ))}
        </div>

        {/* Header with shimmer effect */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 hover:from-primary/8 hover:via-primary/12 hover:to-primary/8 transition-all relative z-10"
        >
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ rotate: [0, -15, 15, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-xl"
            >
              📏
            </motion.span>
            <div className="text-left">
              <h3 className="font-bold text-sm flex items-center gap-2 r62-heading-gradient">
                Guia de Tamanhos
                <motion.span
                  className="relative overflow-hidden rounded px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                  />
                  Referência
                </motion.span>
              </h3>
              <p className="text-xs text-muted-foreground">Encontre o tamanho ideal para você</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
          >
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <CardContent className="p-4 relative z-10 space-y-4">
                {/* Category tabs */}
                <div className="relative flex bg-secondary/50 rounded-xl p-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveTab(cat.id)}
                      className="relative flex-1 py-2 text-xs font-semibold rounded-lg z-10 transition-colors"
                    >
                      <span className={activeTab === cat.id ? 'text-primary-foreground' : 'text-muted-foreground'}>
                        {cat.emoji} {cat.label}
                      </span>
                    </button>
                  ))}
                  {activeTab && (
                    <motion.div
                      layoutId="size-guide-tab"
                      className="absolute top-1 bottom-1 rounded-lg bg-primary"
                      style={{ width: `${100 / categories.length}%` }}
                      transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>

                {/* Size recommendation for clothing */}
                {activeTab === 'roupas' && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 dark:bg-amber-900/15 rounded-xl p-3 border border-amber-200/50 dark:border-amber-800/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">Recomendação de tamanho</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Altura (cm)"
                        value={heightInput}
                        onChange={(e) => setHeightInput(e.target.value)}
                        className="flex-1 h-8 px-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <input
                        type="number"
                        placeholder="Peso (kg)"
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                        className="flex-1 h-8 px-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <Button size="sm" onClick={handleRecommend} className="min-h-[44px] min-w-[44px] h-8 text-xs px-3 active:scale-95 transition-transform">
                        Calcular
                      </Button>
                    </div>
                    <AnimatePresence>
                      {recommendedSize && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="text-xs text-primary font-semibold mt-2"
                        >
                          Seu tamanho sugerido: <span className="text-base">{recommendedSize}</span>
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Saved size */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {savedSize ? (
                        <span>Meu tamanho salvo: <span className="font-bold text-primary">{savedSize}</span></span>
                      ) : (
                        'Nenhum tamanho salvo'
                      )}
                    </span>
                  </div>
                  {savedSize && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleClearSize}
                      className="text-xs text-destructive hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Limpar
                    </motion.button>
                  )}
                </div>

                {/* Body illustration + size chart layout */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Body measurement SVG */}
                  <div className="sm:col-span-1 bg-secondary/30 rounded-xl p-3 flex flex-col items-center justify-center">
                    <BodyMeasureSVG />
                    <p className="text-[10px] text-muted-foreground text-center mt-2">
                      Pontos de medida do corpo
                    </p>
                  </div>

                  {/* Size table */}
                  <div className="sm:col-span-2 overflow-x-auto">
                    <AnimatePresence mode="wait">
                      {activeTab === 'roupas' && (
                        <motion.div
                          key="roupas"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="py-2 px-1.5 text-left font-semibold text-muted-foreground">Tamanho</th>
                                <th className="py-2 px-1.5 text-center font-semibold text-emerald-600 dark:text-emerald-400">Peito</th>
                                <th className="py-2 px-1.5 text-center font-semibold text-amber-600 dark:text-amber-400">Cintura</th>
                                <th className="py-2 px-1.5 text-center font-semibold text-rose-600 dark:text-rose-400">Quadril</th>
                                <th className="py-2 px-1.5 text-center font-semibold text-muted-foreground">Peso</th>
                                <th className="py-2 px-1.5 text-center font-semibold text-muted-foreground">Altura</th>
                              </tr>
                            </thead>
                            <tbody>
                              {clothingSizes.map((row) => {
                                const isHighlighted = activeSizeToHighlight === row.size
                                return (
                                  <motion.tr
                                    key={row.size}
                                    className={`border-b border-border/50 ${isHighlighted ? 'bg-primary/5' : ''}`}
                                    whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                                  >
                                    <td className="py-2 px-1.5">
                                      <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleSaveSize(row.size)}
                                        className={`font-bold text-sm px-2 py-0.5 rounded-lg transition-all ${
                                          isHighlighted
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'bg-secondary/50 hover:bg-primary/10 hover:text-primary'
                                        }`}
                                      >
                                        {row.size}
                                      </motion.button>
                                    </td>
                                    <td className="py-2 px-1.5 text-center">{row.chest} cm</td>
                                    <td className="py-2 px-1.5 text-center">{row.waist} cm</td>
                                    <td className="py-2 px-1.5 text-center">{row.hip} cm</td>
                                    <td className="py-2 px-1.5 text-center">{row.weight} kg</td>
                                    <td className="py-2 px-1.5 text-center">{row.height} cm</td>
                                  </motion.tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </motion.div>
                      )}

                      {activeTab === 'calcados' && (
                        <motion.div
                          key="calcados"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="py-2 px-1.5 text-left font-semibold text-muted-foreground">Número</th>
                                <th className="py-2 px-1.5 text-center font-semibold text-primary">Comprimento do pé (cm)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {shoeSizes.map((row) => {
                                const isHighlighted = activeSizeToHighlight === String(row.size)
                                return (
                                  <motion.tr
                                    key={row.size}
                                    className={`border-b border-border/50 ${isHighlighted ? 'bg-primary/5' : ''}`}
                                    whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                                  >
                                    <td className="py-2 px-1.5">
                                      <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleSaveSize(String(row.size))}
                                        className={`font-bold text-sm px-2.5 py-0.5 rounded-lg transition-all ${
                                          isHighlighted
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'bg-secondary/50 hover:bg-primary/10 hover:text-primary'
                                        }`}
                                      >
                                        {row.size}
                                      </motion.button>
                                    </td>
                                    <td className="py-2 px-1.5 text-center">{row.length}</td>
                                  </motion.tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </motion.div>
                      )}

                      {activeTab === 'acessorios' && (
                        <motion.div
                          key="acessorios"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="py-2 px-1.5 text-left font-semibold text-muted-foreground">Tamanho</th>
                                <th className="py-2 px-1.5 text-center font-semibold text-primary">Pulso (cm)</th>
                                <th className="py-2 px-1.5 text-center font-semibold text-primary">Cabeça (cm)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {accessorySizes.map((row) => {
                                const isHighlighted = activeSizeToHighlight === row.size
                                return (
                                  <motion.tr
                                    key={row.size}
                                    className={`border-b border-border/50 ${isHighlighted ? 'bg-primary/5' : ''}`}
                                    whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                                  >
                                    <td className="py-2 px-1.5">
                                      <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleSaveSize(row.size)}
                                        className={`font-bold text-sm px-2.5 py-0.5 rounded-lg transition-all ${
                                          isHighlighted
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'bg-secondary/50 hover:bg-primary/10 hover:text-primary'
                                        }`}
                                      >
                                        {row.size}
                                      </motion.button>
                                    </td>
                                    <td className="py-2 px-1.5 text-center">{row.wrist}</td>
                                    <td className="py-2 px-1.5 text-center">{row.head}</td>
                                  </motion.tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <Separator className="my-2" />

                {/* Tips toggle */}
                <button
                  onClick={() => setShowTips(!showTips)}
                  className="flex items-center gap-2 text-xs text-primary font-semibold hover:underline w-full"
                >
                  <Lightbulb className="h-4 w-4" />
                  <span>Dica de medida</span>
                  <motion.div animate={{ rotate: showTips ? 180 : 0 }}>
                    <ChevronUp className="h-3 w-3" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showTips && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 pt-2">
                        {measureTips.map((tip, i) => (
                          <motion.div
                            key={tip.area}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-2 bg-secondary/30 rounded-lg p-2"
                          >
                            <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-xs">{tip.area}: </span>
                              <span className="text-xs text-muted-foreground">{tip.tip}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
