'use client'

import { useAppStore } from '@/store/useAppStore'
import { motion } from 'framer-motion'

const categories = [
  { id: 'alimentacao', label: 'Alimentação', icon: '🍽️', color: 'from-orange-400 to-orange-500' },
  { id: 'servicos', label: 'Serviços', icon: '🔧', color: 'from-emerald-400 to-emerald-500' },
  { id: 'agricultura', label: 'Agricultura', icon: '🌾', color: 'from-yellow-400 to-yellow-600' },
  { id: 'moda', label: 'Moda', icon: '👗', color: 'from-pink-400 to-pink-500' },
  { id: 'eletronicos', label: 'Eletrônicos', icon: '📱', color: 'from-slate-400 to-slate-600' },
  { id: 'saude', label: 'Saúde', icon: '💊', color: 'from-red-400 to-red-500' },
  { id: 'casa-jardim', label: 'Casa & Jardim', icon: '🏡', color: 'from-green-400 to-green-600' },
  { id: 'animais', label: 'Animais', icon: '🐾', color: 'from-amber-400 to-amber-600' },
  { id: 'educacao', label: 'Educação', icon: '📚', color: 'from-blue-400 to-blue-500' },
  { id: 'beleza', label: 'Beleza', icon: '💄', color: 'from-rose-400 to-rose-500' },
  { id: 'esportes', label: 'Esportes', icon: '⚽', color: 'from-lime-400 to-lime-600' },
  { id: 'outros', label: 'Outros', icon: '📦', color: 'from-gray-400 to-gray-500' },
]

export function CategoryBar() {
  const { navigate, openSearch } = useAppStore()
  
  return (
    <div className="w-full overflow-x-auto hide-scrollbar -mx-4 px-4">
      <div className="flex gap-3 py-2 min-w-max">
        {categories.map((cat, index) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => {
              useAppStore.getState().setSearchQuery(cat.label)
              openSearch()
            }}
            className="flex flex-col items-center gap-1.5 min-w-[68px] group"
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-200`}>
              {cat.icon}
            </div>
            <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
              {cat.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
