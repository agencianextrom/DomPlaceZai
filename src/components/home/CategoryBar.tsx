'use client'

import { useAppStore } from '@/store/useAppStore'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const categories = [
  { id: 'TODOS', label: 'Todos', icon: '🏪', color: 'from-primary to-emerald-500' },
  { id: 'FOOD', label: 'Alimentação', icon: '🍽️', color: 'from-orange-400 to-orange-500' },
  { id: 'SERVICES', label: 'Serviços', icon: '🔧', color: 'from-emerald-400 to-emerald-500' },
  { id: 'AGRICULTURE', label: 'Agricultura', icon: '🌾', color: 'from-yellow-400 to-yellow-600' },
  { id: 'FASHION', label: 'Moda', icon: '👗', color: 'from-pink-400 to-pink-500' },
  { id: 'ELECTRONICS', label: 'Eletrônicos', icon: '📱', color: 'from-slate-400 to-slate-600' },
  { id: 'HEALTH', label: 'Saúde', icon: '💊', color: 'from-red-400 to-red-500' },
  { id: 'HOME_GARDEN', label: 'Casa & Jardim', icon: '🏡', color: 'from-green-400 to-green-600' },
  { id: 'ANIMALS', label: 'Animais', icon: '🐾', color: 'from-amber-400 to-amber-600' },
  { id: 'EDUCATION', label: 'Educação', icon: '📚', color: 'from-cyan-400 to-cyan-500' },
  { id: 'BEAUTY', label: 'Beleza', icon: '💄', color: 'from-rose-400 to-rose-500' },
  { id: 'SPORTS', label: 'Esportes', icon: '⚽', color: 'from-lime-400 to-lime-600' },
  { id: 'OTHER', label: 'Outros', icon: '📦', color: 'from-gray-400 to-gray-500' },
]

export function CategoryBar() {
  const { activeCategory, setActiveCategory } = useAppStore()
  
  return (
    <div className="w-full overflow-x-auto hide-scrollbar -mx-4 px-4">
      <div className="flex gap-3 py-2 min-w-max">
        {categories.map((cat, index) => {
          const isActive = activeCategory === cat.id
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => setActiveCategory(isActive ? null : cat.id)}
              className="flex flex-col items-center gap-1.5 min-w-[68px] group relative"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${isActive ? cat.color : 'from-muted to-muted/80'} flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-all duration-200 ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                {cat.icon}
                {isActive && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </motion.div>
                )}
              </div>
              <span className={`text-[11px] font-medium transition-colors text-center leading-tight ${isActive ? 'text-primary font-semibold' : 'text-muted-foreground group-hover:text-foreground'}`}>
                {cat.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
