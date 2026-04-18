'use client'

import { useState } from 'react'
import { Home, Search, ClipboardList, Heart, UserCircle, ShoppingCart } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { id: 'home', icon: Home, label: 'Início' },
  { id: 'search', icon: Search, label: 'Buscar' },
  { id: 'orders', icon: ClipboardList, label: 'Pedidos' },
  { id: 'favorites', icon: Heart, label: 'Favoritos' },
  { id: 'profile', icon: UserCircle, label: 'Perfil' },
]

export function MobileNav() {
  const { currentView, navigate, getCartItemCount } = useAppStore()
  const [activeTabX, setActiveTabX] = useState<number | undefined>(undefined)
  
  const cartCount = getCartItemCount()
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Glassmorphism top edge with gradient line */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 -top-3 h-3 bg-gradient-to-b from-transparent to-background/60 pointer-events-none" />
      <div className="bg-background/80 backdrop-blur-xl border-t border-border/40 relative">
        {/* Active tab indicator (slides between tabs) */}
        <AnimatePresence>
          {activeTabX !== undefined && (
            <motion.div
              layoutId="mobile-nav-slider"
              className="absolute top-0 h-[3px] w-12 bg-gradient-to-r from-primary/80 to-primary rounded-b-full pointer-events-none"
              style={{ left: `${activeTabX}px` }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </AnimatePresence>
        <div className="flex items-end justify-around h-[64px] px-2 pb-1">
          {/* Left side nav items */}
          {navItems.slice(0, 2).map((item) => {
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                ref={(el) => { if (el && isActive) setActiveTabX(el.offsetLeft + el.offsetWidth / 2 - 24) }}
                onClick={() => {
                  if (item.id === 'search') {
                    useAppStore.getState().openSearch()
                  } else {
                    navigate(item.id as 'home')
                  }
                }}
                className="relative flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[44px]"
              >
                {/* Active glow background */}
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-bg-left"
                    className="absolute inset-x-1 -top-1 bottom-0 rounded-xl bg-primary/5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                <motion.div
                  whileTap={{ scale: 0.78, rotate: -3 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 15 }}
                  animate={isActive ? { scale: 1.12 } : { scale: 1 }}
                >
                  <item.icon className={`h-[22px] w-[22px] transition-all duration-200 ${isActive ? 'text-primary text-shadow-primary' : 'text-muted-foreground'}`} />
                </motion.div>
                <span className={`text-[10px] font-medium transition-all duration-200 leading-tight ${isActive ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </button>
            )
          })}

          {/* Center cart button - elevated floating style */}
          <motion.button
            whileTap={{ scale: 0.85, rotate: -5 }}
            transition={{ type: 'spring', stiffness: 600, damping: 15 }}
            onClick={() => navigate('cart')}
            ref={(el) => { if (el && currentView === 'cart') setActiveTabX(el.offsetLeft + el.offsetWidth / 2 - 24) }}
            className="relative flex flex-col items-center justify-center -mt-5 min-w-[52px]"
          >
            <motion.div
              animate={{ 
                boxShadow: cartCount > 0 
                  ? '0 4px 20px oklch(0.45 0.1 155 / 0.35), 0 0 0 2px oklch(0.45 0.1 155 / 0.1)' 
                  : '0 2px 8px oklch(0 0 0 / 0.1)' 
              }}
              transition={{ duration: 0.3 }}
              className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground flex items-center justify-center shadow-lg ripple-wave"
            >
              <ShoppingCart className="h-5 w-5" />
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: cartCount > 0 ? 1 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-accent text-accent-foreground rounded-full shadow-sm border-2 border-background badge-spring"
              >
                {cartCount > 99 ? '99' : cartCount}
              </motion.span>
            </motion.div>
            <span className={`text-[10px] font-medium mt-0.5 leading-tight ${currentView === 'cart' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
              Carrinho
            </span>
          </motion.button>

          {/* Right side nav items */}
          {navItems.slice(2).map((item) => {
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                ref={(el) => { if (el && isActive) setActiveTabX(el.offsetLeft + el.offsetWidth / 2 - 24) }}
                onClick={() => navigate(item.id as 'orders' | 'favorites' | 'profile')}
                className="relative flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[44px]"
              >
                {/* Active glow background */}
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-bg-right"
                    className="absolute inset-x-1 -top-1 bottom-0 rounded-xl bg-primary/5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                <motion.div
                  whileTap={{ scale: 0.78, rotate: 3 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 15 }}
                  animate={isActive ? { scale: 1.12 } : { scale: 1 }}
                >
                  <item.icon className={`h-[22px] w-[22px] transition-all duration-200 ${isActive ? 'text-primary text-shadow-primary' : 'text-muted-foreground'}`} />
                </motion.div>
                <span className={`text-[10px] font-medium transition-all duration-200 leading-tight ${isActive ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
        {/* Safe area padding for iOS notch/home indicator */}
        <div style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }} />
      </div>
    </nav>
  )
}
