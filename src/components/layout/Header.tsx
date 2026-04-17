'use client'

import { MapPin, Bell, ShoppingCart, Search, User, Menu, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAppStore } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
import { MobileNav } from './MobileNav'

export function Header() {
  const { 
    currentView, 
    navigate, 
    goBack, 
    getCartItemCount, 
    openSearch, 
    navigationHistory,
    isSearchOpen,
  } = useAppStore()
  
  const cartCount = getCartItemCount()
  const canGoBack = navigationHistory.length > 1 && currentView !== 'home'
  
  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Top bar */}
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Left side */}
            <div className="flex items-center gap-2 min-w-0">
              {canGoBack ? (
                <Button variant="ghost" size="icon" onClick={goBack} className="shrink-0 h-10 w-10">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              ) : (
                <div className="flex items-center gap-2 min-w-0">
                  <img 
                    src="/domplace-logo.png" 
                    alt="DomPlace" 
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg shrink-0"
                  />
                  <span className="font-bold text-lg sm:text-xl text-primary hidden xs:block">DomPlace</span>
                </div>
              )}
              
              {/* Location */}
              <button 
                onClick={() => navigate('home')}
                className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline">Dom Eliseu, PA</span>
              </button>
            </div>
            
            {/* Search bar - hidden on mobile, shown in nav */}
            <div 
              className="hidden md:flex flex-1 max-w-md mx-4 cursor-pointer" 
              onClick={openSearch}
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  readOnly
                  placeholder="Buscar produtos, lojas..." 
                  className="pl-9 pr-10 bg-secondary/50 cursor-pointer h-10"
                />
                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </Button>
              </div>
            </div>
            
            {/* Right side actions */}
            <div className="flex items-center gap-1">
              {/* Mobile search toggle */}
              <Button variant="ghost" size="icon" className="md:hidden h-10 w-10" onClick={openSearch}>
                <Search className="h-5 w-5" />
              </Button>
              
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative h-10 w-10">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-accent text-accent-foreground border-0">
                  3
                </Badge>
              </Button>
              
              {/* Cart */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-10 w-10"
                onClick={() => navigate('cart')}
              >
                <ShoppingCart className="h-5 w-5" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-0">
                        {cartCount > 99 ? '99+' : cartCount}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
              
              {/* Profile menu */}
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
                      <Button className="mt-4 w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                        Fazer Login
                      </Button>
                    </div>
                    <nav className="flex-1 py-2">
                      {[
                        { icon: User, label: 'Meus Dados' },
                        { icon: MapPin, label: 'Endereços' },
                        { icon: ShoppingCart, label: 'Pedidos', action: () => navigate('orders') },
                        { icon: Bell, label: 'Notificações' },
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
      </header>
      
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <div className="flex items-center gap-2 p-3 border-b border-border">
              <Button variant="ghost" size="icon" onClick={() => useAppStore.getState().closeSearch()} className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Input 
                autoFocus
                placeholder="Buscar produtos, lojas..." 
                value={useAppStore.getState().searchQuery}
                onChange={(e) => useAppStore.getState().setSearchQuery(e.target.value)}
                className="flex-1 h-11"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
