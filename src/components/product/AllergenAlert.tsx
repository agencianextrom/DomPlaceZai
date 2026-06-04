'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, ShieldCheck, ChevronDown, ChevronUp, Settings2, Leaf, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// --- Types ---
export interface AllergenAlertProps {
  productName?: string
  description?: string
  tags?: string
  category?: string
}

interface AllergenEntry {
  id: string
  name: string
  keywords: string[]
  emoji: string
  severity: 'high' | 'medium'
}

interface DietaryFilter {
  id: string
  name: string
  description: string
  incompatibleAllergens: string[]
  emoji: string
}

// --- Allergen definitions ---
const ALLERGENS: AllergenEntry[] = [
  { id: 'gluten', name: 'Glúten', keywords: ['glúten', 'gluten', 'trigo', 'cevada', 'centeio', 'aveia', 'farinha', 'pão', 'massa', 'biscoito', 'bolacha', 'torrada', 'pizza', 'macarrão', 'cerveja'], emoji: '🌾', severity: 'high' },
  { id: 'lactose', name: 'Lactose', keywords: ['lactose', 'leite', 'queijo', 'creme', 'manteiga', 'iogurte', 'cream cheese', 'requeijão', 'nata', 'sorvete'], emoji: '🥛', severity: 'high' },
  { id: 'nuts', name: 'Nozes', keywords: ['nozes', 'amêndoas', 'castanha', 'avelã', 'noz', 'macadâmia', 'pistache', 'castanhas'], emoji: '🥜', severity: 'high' },
  { id: 'soy', name: 'Soja', keywords: ['soja', 'soy', 'tofu', 'molho de soja', 'shoyu', 'leite de soja', 'proteína de soja', 'óleo de soja'], emoji: '🫘', severity: 'medium' },
  { id: 'eggs', name: 'Ovos', keywords: ['ovo', 'ovos', 'clara', 'gema', 'maionese', 'massa de bolo'], emoji: '🥚', severity: 'high' },
  { id: 'fish', name: 'Peixe', keywords: ['peixe', 'atum', 'salmão', 'tilápia', 'sardinha', 'bacalhau', 'anchova', 'cação'], emoji: '🐟', severity: 'high' },
  { id: 'shellfish', name: 'Frutos do mar', keywords: ['camarão', 'caranguejo', 'lagosta', 'lula', 'polvo', 'marisco', 'ostra', 'molusco', 'crustáceo', 'shrimp'], emoji: '🦐', severity: 'high' },
  { id: 'peanut', name: 'Amendoim', keywords: ['amendoim', 'peanut', 'pasta de amendoim', 'creme de amendoim'], emoji: '🥜', severity: 'high' },
]

const DIETARY_FILTERS: DietaryFilter[] = [
  { id: 'vegan', name: 'Vegano', description: 'Sem produtos de origem animal', incompatibleAllergens: ['eggs', 'fish', 'shellfish', 'lactose'], emoji: '🌱' },
  { id: 'vegetarian', name: 'Vegetariano', description: 'Sem carne ou peixe', incompatibleAllergens: ['fish', 'shellfish'], emoji: '🥬' },
  { id: 'gluten-free', name: 'Sem Glúten', description: 'Zero glúten no produto', incompatibleAllergens: ['gluten'], emoji: '🌾' },
  { id: 'lactose-free', name: 'Sem Lactose', description: 'Zero lactose no produto', incompatibleAllergens: ['lactose'], emoji: '🥛' },
  { id: 'halal', name: 'Halal', description: 'Conforme preceitos islâmicos', incompatibleAllergens: ['pork'], emoji: '☪️' },
  { id: 'kosher', name: 'Kosher', description: 'Conforme preceitos judaicos', incompatibleAllergens: ['pork', 'shellfish'], emoji: '✡️' },
]

const STORAGE_KEY = 'domplace-allergen-prefs'

// --- Helpers ---
function loadPreferences(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function savePreferences(prefs: string[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

function detectAllergens(text: string): { allergen: AllergenEntry; matchedKeyword: string }[] {
  const lower = text.toLowerCase()
  const matches: { allergen: AllergenEntry; matchedKeyword: string }[] = []

  for (const allergen of ALLERGENS) {
    for (const keyword of allergen.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        matches.push({ allergen, matchedKeyword: keyword })
        break
      }
    }
  }

  return matches
}

// --- Main Component ---
export function AllergenAlert({ productName = '', description = '', tags = '', category = '' }: AllergenAlertProps) {
  const [savedAllergenPrefs, setSavedAllergenPrefs] = useState<string[]>(() => loadPreferences())
  const [savedDietaryPrefs, setSavedDietaryPrefs] = useState<string[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [isLoaded] = useState(true)

  const toggleAllergenPref = useCallback((id: string) => {
    setSavedAllergenPrefs((prev) => {
      const updated = prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
      savePreferences(updated)
      return updated
    })
  }, [])

  const toggleDietaryPref = useCallback((id: string) => {
    setSavedDietaryPrefs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    )
  }, [])

  // Build text for analysis
  const analysisText = useMemo(() => {
    return [productName, description, tags, category].filter(Boolean).join(' ')
  }, [productName, description, tags, category])

  const detectedAllergens = useMemo(() => detectAllergens(analysisText), [analysisText])

  // Filter to only user-alert-relevant allergens
  const userAlerts = useMemo(
    () => detectedAllergens.filter((d) => savedAllergenPrefs.includes(d.allergen.id)),
    [detectedAllergens, savedAllergenPrefs]
  )

  // Check dietary compatibility
  const dietaryCompatibility = useMemo(() => {
    const results: { filter: DietaryFilter; compatible: boolean; blockingAllergens: string[] }[] = []
    for (const diet of DIETARY_FILTERS) {
      if (!savedDietaryPrefs.includes(diet.id)) continue
      const blocking: string[] = []
      for (const allergenId of diet.incompatibleAllergens) {
        if (detectedAllergens.some((d) => d.allergen.id === allergenId)) {
          const allergen = ALLERGENS.find((a) => a.id === allergenId)
          blocking.push(allergen?.name || allergenId)
        }
      }
      results.push({ filter: diet, compatible: blocking.length === 0, blockingAllergens: blocking })
    }
    return results
  }, [detectedAllergens, savedDietaryPrefs])

  const hasAlerts = userAlerts.length > 0
  const hasIncompatible = dietaryCompatibility.some((d) => !d.compatible)
  const showBanner = hasAlerts || hasIncompatible

  if (!isLoaded) return null

  return (
    <div className="space-y-3">
      {/* Red alert banner for matching allergens */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
            className="relative overflow-hidden rounded-xl border-2 border-red-300 dark:border-red-800/50 bg-red-50 dark:bg-red-950/20"
          >
            {/* Pulse animation overlay */}
            <motion.div
              className="absolute inset-0 bg-red-100/60 dark:bg-red-900/20 pointer-events-none"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative z-10 p-3 sm:p-4">
              <div className="flex items-start gap-2">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-700 dark:text-red-400">Alerta de Alérgenos</p>

                  {/* Allergen alerts */}
                  {userAlerts.map((alert) => (
                    <motion.div
                      key={alert.allergen.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-1.5 mt-1"
                    >
                      <span className="text-base">{alert.allergen.emoji}</span>
                      <span className="text-xs text-red-600 dark:text-red-300">
                        <strong>{alert.allergen.name}</strong> detectado — <span className="text-[10px]">"{alert.matchedKeyword}"</span>
                      </span>
                    </motion.div>
                  ))}

                  {/* Dietary incompatibility alerts */}
                  {dietaryCompatibility.filter((d) => !d.compatible).map((d) => (
                    <motion.div
                      key={d.filter.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-1.5 mt-1"
                    >
                      <span className="text-base">{d.filter.emoji}</span>
                      <span className="text-xs text-red-600 dark:text-red-300">
                        <strong>{d.filter.name}</strong> incompatível — contém {d.blockingAllergens.join(', ')}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No alerts green badge */}
      <AnimatePresence>
        {!showBanner && savedAllergenPrefs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/30"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Sem alertas</span>
            <span className="text-[10px] text-muted-foreground">— Nenhum alérgeno da sua lista foi detectado</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings toggle */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Settings2 className="h-3.5 w-3.5" />
        Configurar restrições alimentares
        {showSettings ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-card border border-border space-y-4">
              {/* Allergen preferences */}
              <div>
                <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                  Alérgenos a alertar
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {ALLERGENS.map((allergen) => {
                    const isActive = savedAllergenPrefs.includes(allergen.id)
                    return (
                      <motion.button
                        key={allergen.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleAllergenPref(allergen.id)}
                        className={`relative shrink-0 px-2.5 py-1.5 rounded-full text-[11px] font-medium border transition-all overflow-hidden flex items-center gap-1 ${
                          isActive
                            ? 'bg-red-500 text-white border-red-500'
                            : 'bg-card text-muted-foreground border-border hover:border-red-300 hover:text-red-500'
                        }`}
                      >
                        <span>{allergen.emoji}</span>
                        <span>{allergen.name}</span>
                        {isActive && (
                          <motion.div
                            layoutId={`allergen-check-${allergen.id}`}
                            className="h-3 w-3 rounded-full bg-white/30 flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring' as const, stiffness: 500, damping: 25 }}
                          >
                            <span className="text-[8px]">✓</span>
                          </motion.div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              <Separator />

              {/* Dietary preferences */}
              <div>
                <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <Leaf className="h-3.5 w-3.5 text-emerald-500" />
                  Preferências alimentares
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {DIETARY_FILTERS.map((diet) => {
                    const isActive = savedDietaryPrefs.includes(diet.id)
                    return (
                      <motion.button
                        key={diet.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleDietaryPref(diet.id)}
                        className={`relative shrink-0 px-2.5 py-1.5 rounded-full text-[11px] font-medium border transition-all overflow-hidden flex items-center gap-1 ${
                          isActive
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'bg-card text-muted-foreground border-border hover:border-emerald-300 hover:text-emerald-500'
                        }`}
                      >
                        <span>{diet.emoji}</span>
                        <span>{diet.name}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expandable ingredient analysis */}
      {detectedAllergens.length > 0 && (
        <div>
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Info className="h-3.5 w-3.5" />
            Análise de ingredientes ({detectedAllergens.length} {detectedAllergens.length === 1 ? 'item detectado' : 'itens detectados'})
            {showAnalysis ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          <AnimatePresence>
            {showAnalysis && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-3 rounded-xl bg-card border border-border">
                  <div className="space-y-2">
                    {detectedAllergens.map((d, i) => (
                      <motion.div
                        key={d.allergen.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{d.allergen.emoji}</span>
                          <div>
                            <p className="text-xs font-medium">{d.allergen.name}</p>
                            <p className="text-[10px] text-muted-foreground">Detectado via: &quot;{d.matchedKeyword}&quot;</p>
                          </div>
                        </div>
                        <Badge
                          variant={d.allergen.severity === 'high' ? 'destructive' : 'secondary'}
                          className="text-[9px]"
                        >
                          {d.allergen.severity === 'high' ? 'Alto risco' : 'Médio risco'}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Dietary compatibility checks */}
      {dietaryCompatibility.length > 0 && !showBanner && (
        <div className="flex flex-wrap gap-2">
          {dietaryCompatibility.map((d) => (
            <motion.div
              key={d.filter.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium border bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/30"
            >
              <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-400">{d.filter.emoji} {d.filter.name}: OK</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
