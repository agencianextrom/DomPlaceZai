'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Home, Search, ClipboardList, Heart, UserCircle, ShoppingCart, Sun, Moon, Bell } from 'lucide-react'
import { useAppStore, type AppView } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'

// ──────────────────────────────────────────────
// Stagger entrance variants for nav items
// ──────────────────────────────────────────────
const navItemStaggerVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 350, damping: 22, delay: i * 0.06 },
  }),
}

// ──────────────────────────────────────────────
// Nav item definitions
// ──────────────────────────────────────────────
const navItems: Array<{ id: AppView; icon: typeof Home; label: string }> = [
  { id: 'home', icon: Home, label: 'Início' },
  { id: 'search', icon: Search, label: 'Buscar' },
  { id: 'orders', icon: ClipboardList, label: 'Pedidos' },
  { id: 'favorites', icon: Heart, label: 'Favoritos' },
  { id: 'profile', icon: UserCircle, label: 'Perfil' },
]

// ──────────────────────────────────────────────
// Slide-up entrance animation (spring bounce)
// ──────────────────────────────────────────────
const navSlideVariants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 24,
      mass: 0.9,
    },
  },
}

// ──────────────────────────────────────────────
// Icon micro-animation variants
// ──────────────────────────────────────────────
const iconVariants = {
  idle: { scale: 1, y: 0 },
  active: { scale: 1.12, y: -1.5 },
  tap: { scale: 0.7 },
}

const iconSpring = { type: 'spring' as const, stiffness: 550, damping: 18 }

// ──────────────────────────────────────────────
// Ripple sub-component (haptic-like feedback)
// ──────────────────────────────────────────────
interface RippleData {
  id: number
  x: number
  y: number
}

function Ripple({ data, onDone }: { data: RippleData; onDone: () => void }) {
  return (
    <motion.span
      className="absolute rounded-full bg-primary/15 pointer-events-none"
      style={{
        left: data.x - 18,
        top: data.y - 18,
        width: 36,
        height: 36,
      }}
      initial={{ scale: 0, opacity: 0.7 }}
      animate={{ scale: 3, opacity: 0 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={onDone}
    />
  )
}

// ──────────────────────────────────────────────
// Reusable nav button with ripple + icon bounce
// ──────────────────────────────────────────────
function NavButton({
  item,
  isActive,
  onClick,
  registerRef,
}: {
  item: (typeof navItems)[number]
  isActive: boolean
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  registerRef: (el: HTMLButtonElement | null) => void
}) {
  const ariaLabel = isActive ? `${item.label} (página atual)` : `Ir para ${item.label}`
  // Small dot indicator below active tab
  const [dotWidth, setDotWidth] = useState(0)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isActive && btnRef.current) {
      const labelEl = btnRef.current.querySelector('span:last-child') as HTMLElement | null
      if (labelEl) {
        setDotWidth(labelEl.offsetWidth)
      }
    }
  }, [isActive])

  const [ripples, setRipples] = useState<RippleData[]>([])
  const nextId = useRef(0)

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const id = nextId.current++
      setRipples((prev) => [...prev, { id, x, y }])
      onClick(e)
    },
    [onClick],
  )

  const removeRipple = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id))
  }, [])

  return (
    <button
      ref={(el) => { registerRef(el); btnRef.current = el }}
      onClick={handleClick}
      className="relative flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[48px] rounded-xl overflow-hidden select-none active:scale-95 transition-transform duration-150"
      aria-current={isActive ? 'page' : undefined}
      aria-label={ariaLabel}
      role="tab"
    >
      {/* Ripple layer */}
      {ripples.map((r) => (
        <Ripple key={r.id} data={r} onDone={() => removeRipple(r.id)} />
      ))}

      {/* Icon with bounce animation */}
      <motion.div
        variants={iconVariants}
        animate={isActive ? 'active' : 'idle'}
        whileTap="tap"
        transition={iconSpring}
      >
        <item.icon
          className={`h-[22px] w-[22px] transition-colors duration-200 ${
            isActive ? 'text-primary' : 'text-muted-foreground'
          }`}
        />
      </motion.div>

      {/* Label */}
      <span
        className={`text-[10px] font-medium leading-tight transition-all duration-200 ${
          isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
        }`}
      >
        {item.label}
      </span>

      {/* Sliding active dot indicator */}
      <AnimatePresence>
        {isActive && dotWidth > 0 && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: dotWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
            className="absolute bottom-0.5 h-[3px] rounded-full bg-primary r44-mobnav-dot"
          />
        )}
      </AnimatePresence>
    </button>
  )
}

// ──────────────────────────────────────────────
// Main MobileNav component
// ──────────────────────────────────────────────
export function MobileNav() {
  const { currentView, navigate, cartItems } = useAppStore()
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  // Track cart count changes for pulse animation
  const [prevCartCount, setPrevCartCount] = useState(cartCount)
  const [cartPulse, setCartPulse] = useState(false)
  useEffect(() => {
    if (cartCount > prevCartCount) {
      setCartPulse(true)
      setPrevCartCount(cartCount)
      const timer = setTimeout(() => setCartPulse(false), 600)
      return () => clearTimeout(timer)
    } else {
      setPrevCartCount(cartCount)
    }
  }, [cartCount, prevCartCount])
  const { theme, setTheme } = useTheme()
  const mounted = useRef(false)
  const [activeTabX, setActiveTabX] = useState<number | undefined>(undefined)

  useEffect(() => {
    mounted.current = true
  }, [])

  const handleNavClick = useCallback(
    (item: (typeof navItems)[number]) => {
      if (item.id === 'search') {
        useAppStore.getState().openSearch()
      } else {
        navigate(item.id)
      }
    },
    [navigate],
  )

  const registerTabRef = useCallback(
    (itemId: AppView) => (el: HTMLButtonElement | null) => {
      if (el && currentView === itemId) {
        setActiveTabX(el.offsetLeft + el.offsetWidth / 2 - 26)
      }
    },
    [currentView],
  )

  const registerCartRef = useCallback(
    (el: HTMLButtonElement | null) => {
      if (el && currentView === 'cart') {
        setActiveTabX(el.offsetLeft + el.offsetWidth / 2 - 26)
      }
    },
    [currentView],
  )

  return (
    <motion.nav
      variants={navSlideVariants}
      initial="hidden"
      animate="visible"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      role="tablist"
      aria-label="Navegação principal"
    >
      {/* ── Top gradient accents ── */}
      <div className="absolute inset-x-0 -top-3 h-3 bg-gradient-to-b from-transparent to-black/[0.04] pointer-events-none dark:from-transparent dark:to-black/10 r44-mobnav-fade-top" />
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none r44-mobnav-top-line" />

      {/* ── Glassmorphism container with enhanced glass effect ── */}
      <div className="nav-gradient-animated bg-background/60 backdrop-blur-[24px] backdrop-saturate-[1.5] border-t border-white/10 dark:border-white/5 relative r44-mobnav-bg r44-mobnav-glass r44-mobnav-shadow">
        {/* ── Notification bell (floating above nav, left of theme toggle) ── */}
        {mounted && (
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => navigate('notifications')}
            className="absolute -top-12 right-14 z-10 h-10 w-10 rounded-full bg-card/80 backdrop-blur-md border border-border/50 shadow-md flex items-center justify-center transition-colors hover:bg-secondary active:scale-95"
            aria-label="Abrir notificações"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
          </motion.button>
        )}

        {/* ── Theme toggle (floating above nav) ── */}
        {mounted && (
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="absolute -top-12 right-3 z-10 h-10 w-10 rounded-full bg-card/80 backdrop-blur-md border border-border/50 shadow-md flex items-center justify-center transition-colors hover:bg-secondary active:scale-95"
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

        {/* ── Active tab pill indicator (layoutId for smooth sliding) ── */}
        <AnimatePresence>
          {activeTabX !== undefined && (
            <motion.div
              layoutId="mobile-nav-pill"
              className="absolute top-0.5 h-[42px] w-[52px] bg-primary/[0.07] rounded-xl pointer-events-none"
              style={{ left: `${activeTabX - 1}px` }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 28 }}
            />
          )}
        </AnimatePresence>

        <div className="flex items-end justify-around h-[64px] px-2 pb-1">
          {/* ── Left nav items (Início, Buscar) ── */}
          {navItems.slice(0, 2).map((item, i) => (
            <motion.div
              key={item.id}
              className={`${currentView === item.id ? 'nav-active-shimmer r44-mobnav-shimmer' : ''} ${currentView === item.id ? 'nav-active-glow' : ''} r44-mobnav-stagger r44-mobnav-item`}
              style={{ '--r44-stagger-delay': `${i * 60}ms` } as React.CSSProperties}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={navItemStaggerVariants}
            >
              <NavButton
                item={item}
                isActive={currentView === item.id}
                onClick={() => handleNavClick(item)}
                registerRef={registerTabRef(item.id)}
              />
            </motion.div>
          ))}

          {/* ── Center cart button (elevated floating style) ── */}
          <motion.button
            whileTap={{ scale: 0.85, rotate: -5 }}
            transition={iconSpring}
            onClick={() => navigate('cart')}
            ref={registerCartRef}
            className="relative flex flex-col items-center justify-center -mt-5 min-w-[52px]"
            aria-label={cartCount > 0 ? `Carrinho (${cartCount} itens)` : 'Carrinho vazio'}
          >
            <motion.div
              animate={{
                boxShadow:
                  cartCount > 0
                    ? '0 6px 24px rgba(16,185,129,0.4), 0 2px 8px rgba(16,185,129,0.15)'
                    : '0 2px 8px rgba(0,0,0,0.1)',
              }}
              transition={{ duration: 0.3 }}
              className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground flex items-center justify-center shadow-lg r44-mobnav-cart-btn"
            >
              <ShoppingCart className="h-5 w-5" />

              {/* Cart badge — spring bounce on count change via key */}
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0, y: -4 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0, y: 4 }}
                    transition={{ type: 'spring' as const, stiffness: 500, damping: 20 }}
                    className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-accent text-accent-foreground rounded-full shadow-sm border-2 border-background cart-badge-glow r44-mobnav-cart-glow"
                  >
                    {cartCount > 99 ? '99' : cartCount}
                    {/* Pulse ring animation when count increases */}
                    {cartPulse && (
                      <motion.span
                        initial={{ scale: 1, opacity: 0.7 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        transition={{ duration: 0.55, ease: 'easeOut' as const }}
                        className="absolute inset-0 rounded-full bg-accent"
                      />
                    )}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
            <span
              className={`text-[10px] font-medium mt-0.5 leading-tight ${
                currentView === 'cart'
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground'
              }`}
            >
              Carrinho
            </span>
          </motion.button>

          {/* ── Right nav items (Pedidos, Favoritos, Perfil) ── */}
          {navItems.slice(2).map((item, i) => (
            <motion.div
              key={item.id}
              className={`${currentView === item.id ? 'nav-active-shimmer r44-mobnav-shimmer' : ''} ${currentView === item.id ? 'nav-active-glow' : ''} r44-mobnav-stagger r44-mobnav-item`}
              style={{ '--r44-stagger-delay': `${(i + 2) * 60}ms` } as React.CSSProperties}
              custom={i + 2}
              initial="hidden"
              animate="visible"
              variants={navItemStaggerVariants}
            >
              <NavButton
                item={item}
                isActive={currentView === item.id}
                onClick={() => handleNavClick(item)}
                registerRef={registerTabRef(item.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* ── Safe area padding for iOS notch / home indicator ── */}
        <div
          className="r44-mobnav-safe-area"
          style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
        />
      </div>
    </motion.nav>
  )
}
