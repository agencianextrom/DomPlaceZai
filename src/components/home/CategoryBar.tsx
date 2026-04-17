'use client'

import { useAppStore } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Store, UtensilsCrossed, Wrench, Sprout, Shirt, Smartphone, HeartPulse, Home, PawPrint, BookOpen, Scissors, Dumbbell, Package } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface CategoryItem {
  id: string
  label: string
  icon: LucideIcon
  color: string
  count: number
}

const categories: CategoryItem[] = [
  { id: 'TODOS', label: 'Todos', icon: Store, color: 'from-primary to-emerald-500', count: 32 },
  { id: 'FOOD', label: 'Alimentação', icon: UtensilsCrossed, color: 'from-orange-400 to-orange-500', count: 12 },
  { id: 'SERVICES', label: 'Serviços', icon: Wrench, color: 'from-emerald-400 to-emerald-500', count: 8 },
  { id: 'AGRICULTURE', label: 'Agricultura', icon: Sprout, color: 'from-yellow-400 to-yellow-600', count: 6 },
  { id: 'FASHION', label: 'Moda', icon: Shirt, color: 'from-pink-400 to-pink-500', count: 9 },
  { id: 'ELECTRONICS', label: 'Eletrônicos', icon: Smartphone, color: 'from-slate-400 to-slate-600', count: 7 },
  { id: 'HEALTH', label: 'Saúde', icon: HeartPulse, color: 'from-red-400 to-red-500', count: 5 },
  { id: 'HOME_GARDEN', label: 'Casa & Jardim', icon: Home, color: 'from-green-400 to-green-600', count: 10 },
  { id: 'ANIMALS', label: 'Animais', icon: PawPrint, color: 'from-amber-400 to-amber-600', count: 4 },
  { id: 'EDUCATION', label: 'Educação', icon: BookOpen, color: 'from-cyan-400 to-cyan-500', count: 3 },
  { id: 'BEAUTY', label: 'Beleza', icon: Scissors, color: 'from-rose-400 to-rose-500', count: 6 },
  { id: 'SPORTS', label: 'Esportes', icon: Dumbbell, color: 'from-lime-400 to-lime-600', count: 4 },
  { id: 'OTHER', label: 'Outros', icon: Package, color: 'from-gray-400 to-gray-500', count: 11 },
]

export function CategoryBar() {
  const { activeCategory, setActiveCategory } = useAppStore()

  return (
    <div className="w-full overflow-x-auto hide-scrollbar -mx-4 px-4">
      <div className="flex gap-3 py-2 min-w-max relative">
        {/* Subtle gradient background behind the bar */}
        <div className="absolute inset-x-0 -top-1 bottom-1 bg-gradient-to-r from-transparent via-primary/5 to-transparent rounded-lg pointer-events-none" />

        {categories.map((cat, index) => {
          const isActive = activeCategory === cat.id
          const IconComponent = cat.icon
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => setActiveCategory(isActive ? null : cat.id)}
              className="flex flex-col items-center gap-1 min-w-[68px] group relative"
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="category-active-ring"
                    className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </AnimatePresence>

              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${
                  isActive ? cat.color : 'from-muted to-muted/80'
                } flex items-center justify-center shadow-sm group-hover:scale-110 transition-all duration-200 ${
                  isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                }`}
              >
                <IconComponent className="h-6 w-6 text-white/90" />

                {/* Bounce animation on select */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.3, 1] }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-sm"
                    >
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <span
                className={`text-[11px] font-medium transition-colors text-center leading-tight ${
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground group-hover:text-foreground'
                }`}
              >
                {cat.label}
              </span>

              {/* Product count badge */}
              <span className="text-[9px] text-muted-foreground/70 font-medium">
                {cat.count}
              </span>

              {/* Tooltip on hover */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-medium px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 shadow-lg">
                {cat.label} &middot; {cat.count} itens
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground" />
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
