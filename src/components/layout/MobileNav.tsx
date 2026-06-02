'use client'

import { useState, useEffect, useRef } from 'react'
import { Home, Search, ClipboardList, Heart, UserCircle, ShoppingCart, Sun, Moon } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'

const navItems = [
  { id: 'home', icon: Home, label: 'Início' },
  { id: 'search', icon: Search, label: 'Buscar' },
  { id: 'orders', icon: ClipboardList, label: 'Pedidos' },
  { id: 'favorites', icon: Heart, label: 'Favoritos' },
  { id: 'profile', icon: UserCircle, label: 'Perfil' },
]

export function MobileNav() {
  const { currentView, navigate, cartItems } = useAppStore()
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)
  const [activeTabX, setActiveTabX] = useState<number | undefined>(undefined)
  const { theme, setTheme } = useTheme()
  const mounted = useRef(false)
  useEffect(() => { mounted.current = true }, [])
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Top shadow edge + gradient accent */}
      <div className="absolute inset-x-0 -top-2 h-2 bg-gradient-to-b from-transparent to-black/[0.04] pointer-events-none dark:from-transparent dark:to-black/10" />
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/25 to-transparent pointer-events-none" />
      <div className="bg-background/85 backdrop-blur-xl border-t border-border/30 relative shadow-[0_-1px_12px_oklch(0_0_0/0.04)] dark:shadow-[0_-1px_12px_oklch(0_0_0/0.15)]">
        {/* Theme toggle floating button - top right of nav */}
        {mounted && (
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="absolute -top-12 right-3 z-10 h-10 w-10 rounded-full bg-card border border-border/60 shadow-md flex items-center justify-center transition-colors hover:bg-secondary"
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-muted-foreground" />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        )}
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
                className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[44px] rounded-xl transition-colors duration-200 active:scale-95 ${isActive ? 'bg-primary/[0.06]' : 'active:bg-secondary/60'}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-bg-left"
                    className="absolute inset-x-1 -top-1 bottom-0 rounded-xl bg-primary/[0.04]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 15 }}
                  animate={isActive ? { scale: 1.1, y: -1 } : { scale: 1, y: 0 }}
                >
                  <item.icon className={`h-[22px] w-[22px] transition-all duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                </motion.div>
                <span className={`text-[10px] font-medium transition-all duration-200 leading-tight ${isActive ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
                {/* Tap pulse ring feedback */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1.2, opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-xl bg-primary/10 pointer-events-none"
                  />
                )}
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
                  ? '0 6px 24px oklch(0.45 0.1 155 / 0.4), 0 2px 8px oklch(0.45 0.1 155 / 0.15)' 
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
                className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[44px] rounded-xl transition-colors duration-200 active:scale-95 ${isActive ? 'bg-primary/[0.06]' : 'active:bg-secondary/60'}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-bg-right"
                    className="absolute inset-x-1 -top-1 bottom-0 rounded-xl bg-primary/[0.04]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 15 }}
                  animate={isActive ? { scale: 1.1, y: -1 } : { scale: 1, y: 0 }}
                >
                  <item.icon className={`h-[22px] w-[22px] transition-all duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                </motion.div>
                <span className={`text-[10px] font-medium transition-all duration-200 leading-tight ${isActive ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
                {/* Tap pulse ring feedback */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1.2, opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-xl bg-primary/10 pointer-events-none"
                  />
                )}
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
