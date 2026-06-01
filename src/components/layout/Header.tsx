'use client'

import { MapPin, ShoppingCart, Search, User, Menu, ArrowLeft, Home, ClipboardList, Heart, UserCircle, Megaphone, ChevronDown, Store, Package, Settings, LogOut, Star, X, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAppStore } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
import { MobileNav } from './MobileNav'
import { NotificationPanel } from '@/components/notifications/NotificationPanel'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

const desktopNavItems = [
  { id: 'home', icon: Home, label: 'Início' },
  { id: 'search', icon: Search, label: 'Buscar' },
  { id: 'orders', icon: ClipboardList, label: 'Pedidos' },
  { id: 'favorites', icon: Heart, label: 'Favoritos' },
  { id: 'profile', icon: UserCircle, label: 'Perfil' },
]

const mobileMenuSections = [
  {
    label: 'Navegação',
    items: [
      { id: 'home', icon: Home, label: 'Início', action: 'navigate' as const },
      { id: 'search', icon: Search, label: 'Buscar', action: 'search' as const },
      { id: 'favorites', icon: Heart, label: 'Favoritos', action: 'navigate' as const },
      { id: 'orders', icon: ClipboardList, label: 'Meus Pedidos', action: 'navigate' as const },
    ],
  },
  {
    label: 'Para Lojistas',
    items: [
      { id: 'store-dashboard', icon: Store, label: 'Painel da Loja', action: 'navigate' as const },
    ],
  },
  {
    label: 'Minha Conta',
    items: [
      { id: 'profile', icon: UserCircle, label: 'Meu Perfil', action: 'navigate' as const },
      { id: 'notifications', icon: Star, label: 'Notificações', action: 'navigate' as const },
      { id: 'settings', icon: Settings, label: 'Configurações', action: 'navigate' as const },
    ],
  },
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
    currentUser,
    logoutUser,
    openAuthModal,
  } = useAppStore()

  const desktopSearchValue = !isSearchOpen ? searchQuery : ''

  const cartCount = getCartItemCount()
  const canGoBack = navigationHistory.length > 1 && currentView !== 'home'
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const mounted = useRef(false)
  useEffect(() => { mounted.current = true }, [])

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

  const handleMobileMenuAction = (action: string, viewId: string) => {
    if (action === 'search') {
      openSearchStore()
    } else {
      navigate(viewId as 'home' | 'orders' | 'favorites' | 'profile' | 'store-dashboard' | 'notifications')
    }
    setMobileMenuOpen(false)
  }

  const handleAdvertiseClick = () => {
    navigate('store-dashboard')
  }

  const userInitials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : null
  
  return (
    <>
      <header className={`sticky top-0 z-50 backdrop-blur-xl transition-all duration-300 safe-top ${isScrolled ? 'bg-background/95 shadow-md shadow-black/[0.03]' : 'bg-background/70'} relative`}>
        {/* Gradient border-bottom that intensifies on scroll */}
        <motion.div
          initial={{ opacity: 0, scaleY: 1 }}
          animate={{ opacity: isScrolled ? 1 : 0, scaleY: isScrolled ? 1 : 0.5 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none"
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
              {/* Mobile hamburger menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden shrink-0 h-10 w-10">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
                  <div className="flex flex-col h-full">
                    {/* Header with branding */}
                    <div className="p-5 bg-gradient-to-br from-primary to-emerald-700 text-primary-foreground">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <img src="/domplace-logo.png" alt="DomPlace" className="h-9 w-9 rounded-lg" />
                          <span className="font-bold text-lg">DomPlace</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      {/* Location */}
                      <button
                        onClick={() => {
                          openNeighborhoodSelector()
                          setMobileMenuOpen(false)
                        }}
                        className="flex items-center gap-2 text-sm text-primary-foreground/90 hover:text-primary-foreground transition-colors"
                      >
                        <div className="relative flex items-center justify-center">
                          <MapPin className="h-4 w-4" />
                          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-primary animate-pulse" />
                        </div>
                        <span className="font-medium">{selectedNeighborhood}, Dom Eliseu</span>
                        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                      </button>
                    </div>

                    {/* Menu sections */}
                    <nav className="flex-1 overflow-y-auto custom-scrollbar py-2">
                      {mobileMenuSections.map((section, sectionIdx) => (
                        <div key={section.label}>
                          {sectionIdx > 0 && <Separator className="my-2" />}
                          <p className="px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {section.label}
                          </p>
                          {section.items.map((item) => {
                            const isActive = currentView === item.id
                            return (
                              <button
                                key={item.id}
                                onClick={() => handleMobileMenuAction(item.action, item.id)}
                                className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                                  isActive 
                                    ? 'text-primary bg-primary/[0.06] border-r-2 border-primary' 
                                    : 'text-foreground hover:bg-secondary/60'
                                }`}
                              >
                                <item.icon className={`h-[18px] w-[18px] ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                {item.label}
                                {item.id === 'store-dashboard' && (
                                  <Badge className="ml-auto text-[9px] px-1.5 py-0 bg-accent/10 text-accent border-0 font-semibold">NOVO</Badge>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      ))}
                    </nav>

                    {/* Footer section */}
                    <div className="p-4 border-t border-border/50">
                      {currentUser ? (
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-primary/20">
                            {currentUser.avatar ? (
                              <AvatarImage src={currentUser.avatar} alt={currentUser.name || 'Usuário'} />
                            ) : null}
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                              {userInitials || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{currentUser.name || 'Usuário'}</p>
                            <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              logoutUser()
                              setMobileMenuOpen(false)
                            }}
                          >
                            <LogOut className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="w-full bg-primary hover:bg-primary/90 btn-shine"
                          onClick={() => {
                            openAuthModal()
                            setMobileMenuOpen(false)
                          }}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Entrar ou Cadastrar
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {canGoBack ? (
                <Button variant="ghost" size="icon" onClick={goBack} className="shrink-0 h-10 w-10">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              ) : (
                <button 
                  onClick={() => navigate('home')}
                  className="flex items-center gap-2.5 min-w-0 group"
                >
                  <img 
                    src="/domplace-logo.png" 
                    alt="DomPlace" 
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg shrink-0 transition-transform duration-200 group-hover:scale-105"
                  />
                  <span className="font-bold text-lg sm:text-xl text-primary gradient-text">DomPlace</span>
                </button>
              )}
              
              {/* Location + Area Selector - inline on desktop */}
              <button 
                onClick={openNeighborhoodSelector}
                className="hidden sm:flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0 group"
              >
                <div className="relative flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
                </div>
                <span className="truncate text-shadow-sm group-hover:text-foreground">{selectedNeighborhood}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground/50" />
              </button>
            </div>
            
            {/* Search bar - hidden on mobile, always visible on desktop */}
            <form 
              className="hidden md:flex flex-1 max-w-md mx-4 transition-all duration-300 focus-within:max-w-lg" 
              onSubmit={handleDesktopSearchSubmit}
            >
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar em Dom Eliseu..." 
                  value={desktopSearchValue}
                  onChange={(e) => handleDesktopSearchChange(e.target.value)}
                  className="pl-10 pr-4 h-10 rounded-full bg-secondary/50 border-border/50 focus:bg-background focus:border-primary/30 transition-all duration-300 search-pulse focus:shadow-[0_0_0_3px_oklch(0.45_0.1_155/0.15),0_0_12px_oklch(0.45_0.1_155/0.1)] dark:focus:shadow-[0_0_0_3px_oklch(0.55_0.12_155/0.2),0_0_16px_oklch(0.55_0.12_155/0.12)]"
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
              
              {/* Theme toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10 transition-all duration-300 hover-glow"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={theme}
                      initial={{ scale: 0, rotate: -90, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      exit={{ scale: 0, rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.25, type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      {theme === 'dark' ? (
                        <Sun className="h-5 w-5 text-amber-400" />
                      ) : (
                        <Moon className="h-5 w-5" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </Button>
              )}
              
              {/* Cart - enhanced with animation */}
              <Button 
                variant="ghost" 
                size="icon" 
                className={`relative h-10 w-10 transition-all duration-200 hover-glow ${currentView === 'cart' ? 'text-primary bg-primary/5' : ''}`}
                onClick={() => navigate('cart')}
              >
                <ShoppingCart className="h-5 w-5" />
                <AnimatePresence mode="popLayout">
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0, y: -10 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0, y: 10 }}
                      transition={{ type: 'spring', stiffness: 700, damping: 18 }}
                      className="absolute -top-1 -right-1 h-[18px] min-w-[18px] px-1 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-2 border-background rounded-full font-bold shadow-sm"
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                      {/* Ping animation when count changes */}
                      <motion.span
                        key={`ping-${cartCount}`}
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 rounded-full bg-primary"
                      />
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>

              {/* Anunciar CTA - hidden on mobile, shown on desktop */}
              <Button
                onClick={handleAdvertiseClick}
                className="hidden lg:flex items-center gap-2 h-9 px-4 rounded-full bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-primary-foreground text-sm font-semibold shadow-sm btn-glow btn-shine transition-all duration-200"
              >
                <Megaphone className="h-4 w-4" />
                Anunciar
              </Button>
              
              {/* Auth button - Entrar or Avatar */}
              <div className="hidden md:block">
                {currentUser ? (
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 h-10 px-2 hover:bg-secondary/50"
                    onClick={() => navigate('profile')}
                  >
                    <Avatar className="h-7 w-7 border border-primary/20">
                      {currentUser.avatar ? (
                        <AvatarImage src={currentUser.avatar} alt={currentUser.name || 'Usuário'} />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                        {userInitials || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium max-w-[100px] truncate">{currentUser.name || 'Usuário'}</span>
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1.5 h-10 px-3 text-sm font-medium hover:bg-secondary/50"
                    onClick={openAuthModal}
                  >
                    <User className="h-4 w-4" />
                    <span>Entrar</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Desktop Navigation Bar - hidden on mobile */}
        <div className="hidden md:block border-t border-border/50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <nav className="flex items-center gap-1 h-11 overflow-x-auto hide-scrollbar">
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
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                      isActive 
                        ? 'text-primary bg-primary/10'
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
                  </button>
                )
              })}
              
              {/* Cart in desktop nav */}
              <button
                onClick={() => navigate('cart')}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
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
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    className="h-5 min-w-5 px-1.5 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground rounded-full"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
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
