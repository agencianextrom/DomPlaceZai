'use client'

import { MapPin, ShoppingCart, Search, User, Menu, ArrowLeft, Home, ClipboardList, Heart, UserCircle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAppStore } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
import { MobileNav } from './MobileNav'
import { NotificationPanel } from '@/components/notifications/NotificationPanel'
import { useState, useEffect } from 'react'

const desktopNavItems = [
  { id: 'home', icon: Home, label: 'Início' },
  { id: 'search', icon: Search, label: 'Buscar' },
  { id: 'orders', icon: ClipboardList, label: 'Pedidos' },
  { id: 'favorites', icon: Heart, label: 'Favoritos' },
  { id: 'profile', icon: UserCircle, label: 'Perfil' },
]

export function Header() {
  const { 
    currentView, 
    navigate, 
    goBack, 
    getCartItemCount, 
    openSearch,
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    openSearch: openSearchStore,
    navigationHistory,
    selectedNeighborhood,
    openNeighborhoodSelector,
  } = useAppStore()

  const desktopSearchValue = !isSearchOpen ? searchQuery : ''

  const cartCount = getCartItemCount()
  const canGoBack = navigationHistory.length > 1 && currentView !== 'home'
  const [isScrolled, setIsScrolled] = useState(false)

  // Track scroll for header gradient effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  const handleDesktopSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim().length > 0) {
      openSearchStore()
    }
  }

  const handleDesktopSearchChange = (value: string) => {
    setSearchQuery(value)
    if (value.trim().length > 2 && !isSearchOpen) {
      openSearchStore()
    }
  }
  
  return (
    <>
      <header className={`sticky top-0 z-50 backdrop-blur-xl transition-all duration-300 ${isScrolled ? 'bg-background/95 shadow-md' : 'bg-background/70'} relative`}>
        {/* Gradient border-bottom that intensifies on scroll */}
        <motion.div
          initial={{ opacity: 0, scaleY: 1 }}
          animate={{ opacity: isScrolled ? 1 : 0.3, scaleY: isScrolled ? 1.5 : 1 }}
          className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none"
          style={{ originY: 1 }}
        />
        {/* Subtle gradient glow on scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isScrolled ? 1 : 0 }}
          className="absolute inset-x-0 top-0 h-8 header-scrolled-gradient pointer-events-none"
        />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Top bar */}
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Left side */}
            <div className="flex items-center gap-1.5 min-w-0">
              {canGoBack ? (
                <Button variant="ghost" size="icon" onClick={goBack} className="shrink-0 h-10 w-10">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              ) : (
                <button 
                  onClick={() => navigate('home')}
                  className="flex items-center gap-2 min-w-0"
                >
                  <img 
                    src="/domplace-logo.png" 
                    alt="DomPlace" 
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg shrink-0"
                  />
                  <span className="font-bold text-lg sm:text-xl text-primary">DomPlace</span>
                </button>
              )}
              
              {/* Location - opens NeighborhoodSelector */}
              <button 
                onClick={openNeighborhoodSelector}
                className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <div className="relative flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
                </div>
                <span className="truncate text-shadow-sm">{selectedNeighborhood}, Dom Eliseu</span>
              </button>
            </div>
            
            {/* Search bar - hidden on mobile, always visible on desktop */}
            <form 
              className="hidden md:flex flex-1 max-w-md mx-4 transition-all duration-300 focus-within:max-w-lg" 
              onSubmit={handleDesktopSearchSubmit}
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar produtos, lojas..." 
                  value={desktopSearchValue}
                  onChange={(e) => handleDesktopSearchChange(e.target.value)}
                  className="pl-9 pr-4 bg-secondary/50 h-10 focus:bg-background transition-all duration-300 search-pulse focus:shadow-[0_0_0_3px_oklch(0.45_0.1_155/0.15),0_0_12px_oklch(0.45_0.1_155/0.1)] dark:focus:shadow-[0_0_0_3px_oklch(0.55_0.12_155/0.2),0_0_16px_oklch(0.55_0.12_155/0.12)]"
                />
              </div>
            </form>
            
            {/* Right side actions */}
            <div className="flex items-center gap-1">
              {/* Mobile search toggle */}
              <Button variant="ghost" size="icon" className="md:hidden h-10 w-10" onClick={openSearch}>
                <Search className="h-5 w-5" />
              </Button>
              
              {/* Notifications */}
              <NotificationPanel />
              
              {/* Cart */}
              <Button 
                variant="ghost" 
                size="icon" 
                className={`relative h-10 w-10 transition-all duration-200 hover-glow ${currentView === 'cart' ? 'text-primary' : ''}`}
                onClick={() => navigate('cart')}
              >
                <ShoppingCart className="h-5 w-5" />
                <AnimatePresence mode="popLayout">
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0, y: -8 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0, y: 8 }}
                      transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                      className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-2 border-background rounded-full font-bold badge-ping"
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
              
              {/* Profile menu - hidden on desktop since nav has profile link */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <User className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-72 p-0">
                    <div className="flex flex-col h-full">
                      <div className="p-6 bg-primary text-primary-foreground">
                        <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mb-3">
                          <User className="h-8 w-8" />
                        </div>
                        <h3 className="font-semibold text-lg">Entrar ou Cadastrar</h3>
                        <p className="text-sm text-primary-foreground/80 mt-1">Acesse sua conta DomPlace</p>
                        <Button 
                          className="mt-4 w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                          onClick={() => useAppStore.getState().openAuthModal()}
                        >
                          Fazer Login
                        </Button>
                      </div>
                      <nav className="flex-1 py-2">
                        {[
                          { icon: User, label: 'Meus Dados' },
                          { icon: MapPin, label: 'Endereços' },
                          { icon: ShoppingCart, label: 'Pedidos', action: () => navigate('orders') },
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={() => {
                              if (item.action) item.action()
                            }}
                            className="w-full flex items-center gap-3 px-6 py-3 text-sm hover:bg-secondary transition-colors"
                          >
                            <item.icon className="h-5 w-5 text-muted-foreground" />
                            {item.label}
                          </button>
                        ))}
                      </nav>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
        
        {/* Desktop Navigation Bar - hidden on mobile */}
        <div className="hidden md:block border-t border-border/50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <nav className="flex items-center gap-1 h-11 overflow-x-auto">
              {desktopNavItems.map((item) => {
                const isActive = currentView === item.id || (item.id === 'search' && isSearchOpen)
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'search') {
                        openSearchStore()
                      } else {
                        navigate(item.id as 'home' | 'orders' | 'favorites' | 'profile')
                      }
                    }}
                    className={`nav-item-animated flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap focus-ring-emerald ${
                      isActive 
                        ? 'text-primary bg-primary/10 active'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="desktop-nav-underline"
                        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-primary via-primary/70 to-transparent"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    {item.id === 'cart' && cartCount > 0 && (
                      <span className="ml-1 h-5 min-w-5 px-1.5 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </button>
                )
              })}
              
              {/* Cart in desktop nav */}
              <button
                onClick={() => navigate('cart')}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  currentView === 'cart'
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                Carrinho
                {currentView === 'cart' && (
                  <motion.div
                    layoutId="desktop-nav-underline"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-primary via-primary/70 to-transparent"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {cartCount > 0 && (
                  <span className="h-5 min-w-5 px-1.5 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </>
  )
}
