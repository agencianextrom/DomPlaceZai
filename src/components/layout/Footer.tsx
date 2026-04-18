'use client'

import { useState, useCallback, useEffect } from 'react'
import { ShieldCheck, HelpCircle, FileText, Lock, ArrowUp, QrCode, CreditCard, Banknote, Smartphone, Heart } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const socialLinks = [
  { name: 'Instagram', initial: 'In', color: 'hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500' },
  { name: 'Facebook', initial: 'Fb', color: 'hover:bg-blue-600' },
  { name: 'WhatsApp', initial: 'Wp', color: 'hover:bg-green-600' },
  { name: 'TikTok', initial: 'Tk', color: 'hover:bg-foreground' },
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

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Show back-to-top button on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Animate newsletter gradient
  useEffect(() => {
    const interval = setInterval(() => {
      setGradientAngle((prev) => (prev + 0.3) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const handleSubscribe = useCallback(() => {
    if (email && email.includes('@') && email.includes('.')) {
      setSubscribed(true)
      toast.success('Inscrição confirmada! 🎉', {
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

  return (
    <div className="relative mt-auto">
      {/* Gradient mesh-2 decorative background */}
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
            animate={{
              x: [0, 20, 0],
              y: [0, -15, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-accent/5 blur-2xl"
            animate={{
              x: [0, -15, 0],
              y: [0, 20, 0],
              scale: [1, 1.1, 1],
            }}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/domplace-logo.png" alt="DomPlace" className="h-8 w-8 rounded-lg" />
              <span className="font-bold text-lg gradient-text">DomPlace</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Seu marketplace local em Dom Eliseu, Pará. Conectando a comunidade local com os melhores produtos e serviços.
            </p>

            {/* Social Media */}
            <div className="flex gap-2.5 mt-4">
              {socialLinks.map((social) => (
                <button
                  key={social.name}
                  className={`h-9 w-9 rounded-full bg-secondary text-xs font-semibold flex items-center justify-center transition-all duration-300 hover:text-white magnetic-btn ${social.color}`}
                  aria-label={social.name}
                >
                  {social.initial}
                </button>
              ))}
            </div>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Sobre</h4>
            <ul className="space-y-2">
              {['Sobre o DomPlace', 'Central de Ajuda', 'Seja Parceiro', 'Trabalhe Conosco'].map((link) => (
                <li key={link}>
                  <button className="text-sm text-muted-foreground hover:text-foreground transition-colors link-underline">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2">
              {[
                { icon: FileText, label: 'Termos de Uso' },
                { icon: Lock, label: 'Privacidade (LGPD)' },
                { icon: ShieldCheck, label: 'Segurança' },
                { icon: HelpCircle, label: 'FAQ' },
              ].map((link) => (
                <li key={link.label}>
                  <button className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 link-underline">
                    <link.icon className="h-3.5 w-3.5" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Payment Methods & App Download */}
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

            <div>
              <h4 className="font-semibold text-sm mb-3">Baixe o App</h4>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/80 border border-border/50 hover:bg-secondary transition-colors group">
                  <Smartphone className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="text-left">
                    <div className="text-[9px] text-muted-foreground leading-none">Disponível no</div>
                    <div className="text-[11px] font-semibold leading-tight mt-0.5">Google Play</div>
                  </div>
                </button>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/80 border border-border/50 hover:bg-secondary transition-colors group">
                  <Smartphone className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="text-left">
                    <div className="text-[9px] text-muted-foreground leading-none">Baixe na</div>
                    <div className="text-[11px] font-semibold leading-tight mt-0.5">App Store</div>
                  </div>
                </button>
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
          <p>DomPlace © 2025 — Todos os direitos reservados.</p>
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
