'use client'

import { useState, useCallback, useEffect } from 'react'
import { ShieldCheck, HelpCircle, FileText, Lock, ArrowUp, QrCode, CreditCard, Banknote, Smartphone, Heart, MessageCircle, Instagram, Facebook, Phone, Mail, MapPin, Download, Store, Users, HeadphonesIcon, ChevronRight } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAppStore } from '@/store/useAppStore'

const footerCategories = [
  'Alimentação',
  'Saúde & Bem-estar',
  'Serviços',
  'Pets',
  'Beleza & Estética',
  'Compras & Variedades',
  'Tecnologia',
  'Construção',
]

const forMerchantLinks = [
  { label: 'Abrir sua loja', icon: Store },
  { label: 'Planos e tarifas', icon: CreditCard },
  { label: 'Central do vendedor', icon: Users },
  { label: 'Indique e ganhe', icon: Heart },
]

const supportLinks = [
  { label: 'Central de Ajuda', icon: HelpCircle },
  { label: 'Fale conosco', icon: HeadphonesIcon },
  { label: 'Termos de Uso', icon: FileText },
  { label: 'Privacidade (LGPD)', icon: Lock },
  { label: 'Segurança', icon: ShieldCheck },
]

const paymentMethods = [
  { name: 'Pix', icon: QrCode, label: 'Pix' },
  { name: 'Cartão', icon: CreditCard, label: 'Cartão' },
  { name: 'Boleto', icon: FileText, label: 'Boleto' },
  { name: 'Dinheiro', icon: Banknote, label: 'Dinheiro' },
]

export function Footer() {
  const [email, setEmail] = useState('')
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [gradientAngle, setGradientAngle] = useState(0)
  const navigate = useAppStore((s) => s.navigate)

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientAngle((prev) => (prev + 0.3) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const handleSubscribe = useCallback(() => {
    if (email && email.includes('@') && email.includes('.')) {
      setSubscribed(true)
      toast.success('Inscrição confirmada!', {
        description: 'Você receberá nossas novidades e ofertas exclusivas.',
      })
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    } else {
      toast.error('E-mail inválido', {
        description: 'Por favor, insira um e-mail válido para se inscrever.',
      })
    }
  }, [email])

  const handlePWAInstall = useCallback(() => {
    toast.info('Em breve disponível!', {
      description: 'O app DomPlace estará disponível na loja de apps.',
    })
  }, [])

  const handleCategoryClick = useCallback((category: string) => {
    useAppStore.getState().setActiveCategory(category)
    useAppStore.getState().openSearch()
  }, [])

  const handleSupportClick = useCallback((label: string) => {
    if (label === 'Central de Ajuda') {
      navigate('notifications')
    }
  }, [navigate])

  return (
    <div className="relative mt-auto">
      {/* Gradient mesh decorative background */}
      <div className="gradient-mesh-2 absolute inset-0 pointer-events-none" />
      <footer className="bg-secondary/30 relative">
        {/* Glassmorphism top edge with gradient divider */}
        <div className="absolute inset-x-0 -top-4 h-4 bg-gradient-to-b from-transparent via-background/80 to-background pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8 relative z-10">
          {/* Newsletter section with animated gradient */}
          <motion.div
            className="mb-8 p-4 sm:p-6 rounded-xl border border-primary/10 overflow-hidden relative"
            style={{
              background: `linear-gradient(${gradientAngle}deg, rgba(16,185,129,0.05) 0%, rgba(16,185,129,0.1) 40%, rgba(245,158,11,0.05) 100%)`,
            }}
          >
            {/* Subtle animated gradient orbs */}
            <motion.div
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/5 blur-2xl"
              animate={{ x: [0, 20, 0], y: [0, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-accent/5 blur-2xl"
              animate={{ x: [0, -15, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-sm sm:text-base">Receba ofertas exclusivas</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Promoções e novidades direto no seu e-mail. Sem spam!
                </p>
              </div>
              <div className="flex w-full sm:w-auto gap-2">
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-sm bg-background border-primary/20 flex-1 sm:w-52"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                />
                <Button
                  size="sm"
                  className="h-9 px-4 text-sm shrink-0"
                  onClick={handleSubscribe}
                  disabled={subscribed}
                >
                  {subscribed ? '✓ Inscrito' : 'Inscrever'}
                </Button>
              </div>
            </div>
            <AnimatePresence>
              {subscribed && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="relative text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium"
                >
                  🎉 Obrigado! Você receberá nossas novidades em breve.
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Main Footer Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Column 1: Brand + About */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <img src="/domplace-logo.png" alt="DomPlace" className="h-8 w-8 rounded-lg" />
                <span className="font-bold text-lg gradient-text">DomPlace</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Seu marketplace local em Dom Eliseu, Pará. Conectando a comunidade local com os melhores produtos e serviços.
              </p>

              {/* Contact info */}
              <div className="space-y-2 mb-4">
                <a
                  href="https://wa.me/5591999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
                >
                  <Phone className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
                  (91) 99999-9999
                </a>
                <a
                  href="mailto:contato@domplace.com.br"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <Mail className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
                  contato@domplace.com.br
                </a>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Dom Eliseu, PA - Brasil
                </div>
              </div>

              {/* Social Media with proper Lucide icons */}
              <div className="flex gap-2">
                <a
                  href="https://wa.me/5591999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-secondary text-muted-foreground flex items-center justify-center transition-all duration-300 hover:bg-green-600 hover:text-white hover:scale-110 hover:shadow-lg hover:shadow-green-600/20"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="h-9 w-9 rounded-full bg-secondary text-muted-foreground flex items-center justify-center transition-all duration-300 hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:text-white hover:scale-110 hover:shadow-lg"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="h-9 w-9 rounded-full bg-secondary text-muted-foreground flex items-center justify-center transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-110 hover:shadow-lg hover:shadow-blue-600/20"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              </div>
            </div>
            
            {/* Column 2: Sobre + Categorias */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Sobre</h4>
              <ul className="space-y-2 mb-5">
                {['Sobre o DomPlace', 'Central de Ajuda', 'Trabalhe Conosco', 'Blog'].map((link) => (
                  <li key={link}>
                    <button className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:translate-x-0.5 transition-transform duration-200 inline-flex items-center gap-1">
                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link}
                    </button>
                  </li>
                ))}
              </ul>

              <h4 className="font-semibold text-sm mb-3">Categorias</h4>
              <ul className="space-y-1.5">
                {footerCategories.slice(0, 5).map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => handleCategoryClick(cat)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors hover:translate-x-0.5 transition-transform duration-200"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Column 3: Para Lojistas */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Para Lojistas</h4>
              <ul className="space-y-2.5 mb-5">
                {forMerchantLinks.map((link) => (
                  <li key={link.label}>
                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group w-full">
                      <link.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="group-hover:translate-x-0.5 transition-transform duration-200">{link.label}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <h4 className="font-semibold text-sm mb-3">Suporte</h4>
              <ul className="space-y-2.5">
                {supportLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleSupportClick(link.label)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group w-full"
                    >
                      <link.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="group-hover:translate-x-0.5 transition-transform duration-200">{link.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Column 4: Payment + App Download */}
            <div className="space-y-5">
              <div>
                <h4 className="font-semibold text-sm mb-3">Formas de Pagamento</h4>
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.name}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/80 text-xs font-medium text-muted-foreground border border-border/50"
                    >
                      <method.icon className="h-3.5 w-3.5" />
                      {method.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* PWA Install Prompt */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Baixe o App</h4>
                <Button
                  onClick={handlePWAInstall}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-primary-foreground text-sm font-semibold btn-glow btn-shine"
                >
                  <Download className="h-4 w-4" />
                  Instalar App
                </Button>
                <p className="text-[11px] text-muted-foreground mt-2 text-center">
                  Acesso rápido sem abrir o navegador
                </p>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <span>LGPD</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Lock className="h-3.5 w-3.5 text-primary" />
                  <span>Seguro</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <QrCode className="h-3.5 w-3.5 text-primary" />
                  <span>Pix</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Marquee scroll partners/payment section */}
          <div className="marquee-scroll py-4 -mx-4 px-4 border-y border-border/50 mb-4">
            <div className="inline-flex items-center gap-8">
              {[...paymentMethods, ...paymentMethods, ...paymentMethods, ...paymentMethods].map((method, i) => (
                <div
                  key={`marquee-${i}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-xs font-medium text-muted-foreground/60 shrink-0 select-none"
                >
                  <method.icon className="h-3 w-3" />
                  {method.label}
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-4" />
          
          {/* Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>DomPlace © {new Date().getFullYear()} — Todos os direitos reservados.</p>
            <p className="flex items-center gap-1.5">
              Feito com <Heart className="h-3 w-3 text-red-500 fill-red-500" /> em Dom Eliseu, PA
            </p>
          </div>
        </div>

        {/* Back to top button */}
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToTop}
              className="fixed bottom-24 md:bottom-6 right-4 z-40 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
              aria-label="Voltar ao topo"
            >
              <ArrowUp className="h-5 w-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </footer>
    </div>
  )
}
