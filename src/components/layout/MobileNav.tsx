'use client'

import { Home, Search, ClipboardList, Heart, UserCircle, ShoppingCart } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { motion } from 'framer-motion'

const navItems = [
  { id: 'home', icon: Home, label: 'Início' },
  { id: 'search', icon: Search, label: 'Buscar' },
  { id: 'orders', icon: ClipboardList, label: 'Pedidos' },
  { id: 'favorites', icon: Heart, label: 'Favoritos' },
  { id: 'profile', icon: UserCircle, label: 'Perfil' },
]

export function MobileNav() {
  const { currentView, navigate, getCartItemCount } = useAppStore()
  
  const cartCount = getCartItemCount()
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/60 md:hidden">
      <div className="flex items-end justify-around h-[64px] px-2 pb-1">
        {/* Left side nav items */}
        {navItems.slice(0, 2).map((item) => {
          const isActive = currentView === item.id
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'search') {
                  useAppStore.getState().openSearch()
                } else {
                  navigate(item.id as 'home')
                }
              }}
              className="relative flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[44px]"
            >
              <motion.div
                whileTap={{ scale: 0.82 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
              >
                <item.icon className={`h-[22px] w-[22px] transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              </motion.div>
              <span className={`text-[10px] font-medium transition-colors duration-200 leading-tight ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-[3px] bg-gradient-to-r from-primary/80 to-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          )
        })}

        {/* Center cart button - elevated floating style */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          onClick={() => navigate('cart')}
          className="relative flex flex-col items-center justify-center -mt-5 min-w-[52px]"
        >
          <motion.div
            animate={{ 
              boxShadow: cartCount > 0 
                ? '0 4px 16px oklch(0.45 0.1 155 / 0.3)' 
                : '0 2px 8px oklch(0 0 0 / 0.1)' 
            }}
            transition={{ duration: 0.3 }}
            className="relative h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
          >
            <ShoppingCart className="h-5 w-5" />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: cartCount > 0 ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-accent text-accent-foreground rounded-full shadow-sm border-2 border-background"
            >
              {cartCount > 99 ? '99' : cartCount}
            </motion.span>
          </motion.div>
          <span className={`text-[10px] font-medium mt-0.5 leading-tight ${currentView === 'cart' ? 'text-primary' : 'text-muted-foreground'}`}>
            Carrinho
          </span>
        </motion.button>

        {/* Right side nav items */}
        {navItems.slice(2).map((item) => {
          const isActive = currentView === item.id
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id as 'orders' | 'favorites' | 'profile')}
              className="relative flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[44px]"
            >
              <motion.div
                whileTap={{ scale: 0.82 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
              >
                <item.icon className={`h-[22px] w-[22px] transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              </motion.div>
              <span className={`text-[10px] font-medium transition-colors duration-200 leading-tight ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-[3px] bg-gradient-to-r from-primary/80 to-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>
      {/* Safe area for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
