'use client'

import { useState, useCallback, useEffect } from 'react'
import { ShieldCheck, HelpCircle, FileText, Lock, ArrowUp, QrCode, CreditCard, Banknote, Heart, MessageCircle, Instagram, Facebook, Phone, Mail, MapPin, Download, Store, Users, HeadphonesIcon, ChevronRight } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAppStore } from '@/store/useAppStore'
import { ScrollReveal } from '@/lib/use-scroll-reveal'
import { FloatingParticles } from '@/components/effects/FloatingParticles'

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

/* ─── Framer Motion animation variants ─── */
const footerFadeInVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 200, damping: 25, delay: 0.1 },
  },
}

const backToTopVariants = {
  hidden: { opacity: 0, scale: 0, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
  },
  exit: {
    opacity: 0,
    scale: 0,
    y: 20,
    transition: { duration: 0.2 },
  },
}

const socialBounceVariants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.2,
    y: -3,
    transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
  },
}

const logoHoverVariants = {
  rest: { scale: 1, filter: 'drop-shadow(0 0 0px transparent)' },
  hover: {
    scale: 1.08,
    filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))',
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
  },
}

const waveVariants = {
  animate: {
    d: [
      'M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1440,0 1620,40 C1800,80 1980,0 2160,40 L2160,0 L0,0 Z',
      'M0,40 C180,0 360,80 540,40 C720,0 900,80 1080,40 C1260,0 1440,80 1620,40 C1800,0 1980,80 2160,40 L2160,0 L0,0 Z',
    ],
  },
}

export function Footer() {
  const [email, setEmail] = useState('')
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [isEmailFocused, setIsEmailFocused] = useState(false)
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
    <motion.div
      className="relative mt-auto"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={footerFadeInVariants}
    >
      {/* ──────────────────────────────────────
          FEATURE 1: Animated Wave SVG Divider
          ────────────────────────────────────── */}
      <motion.div
        className="relative w-full overflow-hidden leading-[0] -mb-px"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg
          viewBox="0 0 2160 60"
          preserveAspectRatio="none"
          className="relative w-full h-[40px] sm:h-[50px] md:h-[60px]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.45 0.1 155 / 0.15)" />
              <stop offset="50%" stopColor="oklch(0.55 0.08 140 / 0.2)" />
              <stop offset="100%" stopColor="oklch(0.78 0.16 70 / 0.1)" />
            </linearGradient>
            <linearGradient id="wave-fade-to-footer" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.45 0.1 155 / 0.0)" />
              <stop offset="40%" stopColor="oklch(0.55 0.08 140 / 0.12)" />
              <stop offset="100%" stopColor="oklch(0.95 0.02 120 / 0.9)" />
            </linearGradient>
          </defs>
          <motion.path
            fill="url(#wave-fade-to-footer)"
            variants={waveVariants}
            animate="animate"
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
          <motion.path
            fill="url(#wave-gradient)"
            animate={{
              d: [
                'M0,35 C240,65 480,5 720,35 C960,65 1200,5 1440,35 C1680,65 1920,5 2160,35 L2160,0 L0,0 Z',
                'M0,35 C240,5 480,65 720,35 C960,5 1200,65 1440,35 C1680,5 1920,65 2160,35 L2160,0 L0,0 Z',
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
          {/* Decorative dots along wave */}
          {[360, 720, 1080, 1440, 1800].map((cx, i) => (
            <motion.circle
              key={cx}
              cx={cx}
              cy={30 + (i % 2 === 0 ? 8 : -3)}
              r="1.5"
              fill="oklch(0.45 0.1 155)"
              fillOpacity="0.15"
              animate={{ opacity: [0.15, 0.4, 0.15] }}
              transition={{ duration: 3, delay: i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </svg>
      </motion.div>

      {/* ──────────────────────────────────────
          FEATURE 2: Animated Gradient Mesh Background
          ────────────────────────────────────── */}
      <footer className="footer-glass relative footer-gradient-mesh r43-footer-glass-enhanced r59-safe-bottom pb-[max(16px,env(safe-area-inset-bottom))]" role="contentinfo">
        {/* Animated gradient orbs */}
        <div className="footer-mesh-orb footer-mesh-orb-1" />
        {/* Floating gradient orbs */}
        <div className="footer-orb footer-orb-1" />
        <div className="footer-orb footer-orb-2" />
        <div className="footer-orb footer-orb-3" />
        <div className="footer-mesh-orb footer-mesh-orb-2" />
        <div className="footer-mesh-orb footer-mesh-orb-3" />
        <div className="gradient-mesh-2 absolute inset-0 pointer-events-none" />

        {/* Enhanced floating gradient orbs (r41) */}
        <div className="r41-floating-orb r41-floating-orb-1" />
        <div className="r41-floating-orb r41-floating-orb-2" />
        <div className="r41-floating-orb r41-floating-orb-3" />
        {/* r43-footer: Additional floating background orbs */}
        <div className="r43-footer-bg-orb r43-footer-bg-orb-1" />
        <div className="r43-footer-bg-orb r43-footer-bg-orb-2" />
        <div className="r43-footer-bg-orb r43-footer-bg-orb-3" />
        <div className="r43-footer-bg-orb r43-footer-bg-orb-4" />

        {/* Top glassmorphism edge + gradient line */}
        <div className="absolute inset-x-0 -top-4 h-4 bg-gradient-to-b from-transparent via-background/80 to-background pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent r41-gradient-line r43-footer-top-line" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
          {/* Newsletter section with animated gradient shimmer border */}
          <motion.div
            className="mb-8 p-4 sm:p-6 rounded-xl overflow-hidden relative"
            animate={{
              background: [
                `linear-gradient(0deg, rgba(16,185,129,0.05) 0%, rgba(16,185,129,0.1) 40%, rgba(245,158,11,0.05) 100%)`,
                `linear-gradient(90deg, rgba(16,185,129,0.05) 0%, rgba(16,185,129,0.1) 40%, rgba(245,158,11,0.05) 100%)`,
                `linear-gradient(180deg, rgba(16,185,129,0.05) 0%, rgba(16,185,129,0.1) 40%, rgba(245,158,11,0.05) 100%)`,
                `linear-gradient(270deg, rgba(16,185,129,0.05) 0%, rgba(16,185,129,0.1) 40%, rgba(245,158,11,0.05) 100%)`,
                `linear-gradient(360deg, rgba(16,185,129,0.05) 0%, rgba(16,185,129,0.1) 40%, rgba(245,158,11,0.05) 100%)`,
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            {/* Animated gradient shimmer border */}
            <motion.div
              className="absolute inset-[-2px] rounded-xl pointer-events-none"
              animate={{
                background: [
                  `conic-gradient(from 0deg, rgba(16,185,129,0.5), rgba(245,158,11,0.4), rgba(99,102,241,0.4), rgba(236,72,153,0.4), rgba(16,185,129,0.5))`,
                  `conic-gradient(from 90deg, rgba(16,185,129,0.5), rgba(245,158,11,0.4), rgba(99,102,241,0.4), rgba(236,72,153,0.4), rgba(16,185,129,0.5))`,
                  `conic-gradient(from 180deg, rgba(16,185,129,0.5), rgba(245,158,11,0.4), rgba(99,102,241,0.4), rgba(236,72,153,0.4), rgba(16,185,129,0.5))`,
                  `conic-gradient(from 270deg, rgba(16,185,129,0.5), rgba(245,158,11,0.4), rgba(99,102,241,0.4), rgba(236,72,153,0.4), rgba(16,185,129,0.5))`,
                  `conic-gradient(from 360deg, rgba(16,185,129,0.5), rgba(245,158,11,0.4), rgba(99,102,241,0.4), rgba(236,72,153,0.4), rgba(16,185,129,0.5))`,
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
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
            <FloatingParticles count={10} color="oklch(0.45 0.1 155)" maxSize={3} className="opacity-30" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-sm sm:text-base">Receba ofertas exclusivas</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Promoções e novidades direto no seu e-mail. Sem spam!
                </p>
              </div>
              <div className="flex w-full sm:w-auto gap-2">
                <motion.div animate={isEmailFocused ? { y: [0, -2, 0], scale: [1, 1.01, 1] } : {}} transition={{ duration: 0.5, ease: 'easeInOut' }}>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  className={`h-9 text-sm bg-background border-primary/20 flex-1 sm:w-52 transition-all duration-300 r41-newsletter-input r46-newsletter-glow`}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                />
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}>
                <Button
                  size="sm"
                  className="min-h-[44px] px-4 text-sm shrink-0 card-shine r41-submit-btn r43-footer-submit-glow"
                  onClick={handleSubscribe}
                  disabled={subscribed}
                >
                  {subscribed ? '✓ Inscrito' : 'Inscrever'}
                </Button>
                </motion.div>
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

          {/* Main Footer Columns — staggered reveal */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } },
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } },
              }}
            >
            {/* Column 1: Brand + About */}
            <div className="col-span-2 sm:col-span-1">
              {/* ──────────────────────────────────────
                  FEATURE 3: Logo Animation on Hover
                  ────────────────────────────────────── */}
              <motion.div
                className="flex items-center gap-2 mb-3 cursor-pointer"
                variants={logoHoverVariants}
                initial="rest"
                whileHover="hover"
              >
                <img src="/domplace-logo.png" alt="DomPlace" className="h-8 w-8 rounded-lg r41-logo-glow r43-footer-logo-glow" />
                <span className="font-bold text-lg footer-brand-shimmer r41-brand-shimmer r43-footer-brand-pulse r46-brand-shimmer-text">DomPlace</span>
                {/* Animated gradient accent line under brand */}
                <div className="footer-accent-line h-[2px] w-12 rounded-full mt-0.5 r43-footer-accent-line" />
              </motion.div>
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

              {/* ──────────────────────────────────────
                  FEATURE 4: Social Link Hover Effects
                  ────────────────────────────────────── */}
              <div className="flex gap-2">
                <motion.a
                  href="https://wa.me/5591999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full bg-secondary text-muted-foreground flex items-center justify-center hover:bg-green-600 hover:text-white hover:shadow-lg hover:shadow-green-600/20 transition-all duration-300 relative r41-social-icon r41-social-icon-green r43-social-ring r43-social-ring-green r46-social-green r60-touch-feedback"
                  aria-label="WhatsApp"
                  whileHover={{ scale: 1.25, y: -4, boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)' }}
                  whileTap={{ scale: 0.85 }}
                >
                  <motion.span
                    className="absolute inset-0 rounded-full border-2 border-green-500/40 pointer-events-none"
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                  />
                  <MessageCircle className="h-4 w-4 relative z-10" />
                </motion.a>
                <motion.a
                  href="#"
                  className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full bg-secondary text-muted-foreground flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:text-white hover:shadow-lg transition-all duration-300 relative r41-social-icon r41-social-icon-purple r43-social-ring r43-social-ring-purple r46-social-purple r60-touch-feedback"
                  aria-label="Instagram"
                  whileHover={{ scale: 1.25, y: -4, boxShadow: '0 4px 16px rgba(168, 85, 247, 0.3)' }}
                  whileTap={{ scale: 0.85 }}
                >
                  <motion.span
                    className="absolute inset-0 rounded-full border-2 border-purple-500/40 pointer-events-none"
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                  />
                  <Instagram className="h-4 w-4 relative z-10" />
                </motion.a>
                <motion.a
                  href="#"
                  className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full bg-secondary text-muted-foreground flex items-center justify-center hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 relative r41-social-icon r41-social-icon-blue r43-social-ring r43-social-ring-blue r46-social-blue r60-touch-feedback"
                  aria-label="Facebook"
                  whileHover={{ scale: 1.25, y: -4, boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)' }}
                  whileTap={{ scale: 0.85 }}
                >
                  <motion.span
                    className="absolute inset-0 rounded-full border-2 border-blue-500/40 pointer-events-none"
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 1 }}
                  />
                  <Facebook className="h-4 w-4 relative z-10" />
                </motion.a>
              </div>
            </div>

            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } },
              }}
            >
            {/* Column 2: Sobre + Categorias */}
            <div>
              <h4 className="font-semibold text-sm mb-3 r62-heading-gradient">Sobre</h4>
              <ul className="space-y-2 mb-5">
                {['Sobre o DomPlace', 'Central de Ajuda', 'Trabalhe Conosco', 'Blog'].map((link) => (
                  <li key={link}>
                    {/* ──────────────────────────────────────
                        FEATURE 6: Link Hover Underline Animation
                        ────────────────────────────────────── */}
                    <button className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:translate-x-0.5 transition-transform duration-200 inline-flex items-center gap-1 footer-link-hover r41-link-hover r43-footer-link-anim r46-footer-link r60-touch-feedback">
                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link}
                    </button>
                  </li>
                ))}
              </ul>

              <h4 className="font-semibold text-sm mb-3 r62-heading-gradient">Categorias</h4>
              <ul className="space-y-1.5">
                {footerCategories.slice(0, 5).map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => handleCategoryClick(cat)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors hover:translate-x-0.5 transition-transform duration-200 footer-link-hover r41-link-hover r43-footer-link-anim r46-footer-link r60-touch-feedback"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } },
              }}
            >
            {/* Column 3: Para Lojistas */}
            <div>
              <h4 className="font-semibold text-sm mb-3 r62-heading-gradient">Para Lojistas</h4>
              <ul className="space-y-2.5 mb-5">
                {forMerchantLinks.map((link) => (
                  <li key={link.label}>
                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group w-full r60-touch-feedback">
                      <link.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors r41-icon-bounce" />
                      <span className="group-hover:translate-x-0.5 transition-transform duration-200 footer-link-hover r41-link-hover r43-footer-link-anim r46-footer-link">{link.label}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <h4 className="font-semibold text-sm mb-3 r62-heading-gradient">Suporte</h4>
              <ul className="space-y-2.5">
                {supportLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleSupportClick(link.label)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group w-full r60-touch-feedback"
                    >
                      <link.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors r41-icon-bounce" />
                      <span className="group-hover:translate-x-0.5 transition-transform duration-200 footer-link-hover r41-link-hover r43-footer-link-anim r46-footer-link">{link.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } },
              }}
            >
            {/* Column 4: Payment + App Download */}
            <div className="space-y-5">
              <div>
                <h4 className="font-semibold text-sm mb-3 r62-heading-gradient">Formas de Pagamento</h4>
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map((method) => (
                    <motion.div
                      key={method.name}
                      whileHover={{ scale: 1.05, boxShadow: '0 0 16px rgba(16, 185, 129, 0.3), 0 0 4px rgba(16, 185, 129, 0.15)' }}
                      transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/80 text-xs font-medium text-muted-foreground border border-border/50 cursor-default r41-payment-icon r43-payment-stagger r46-payment-lift r62-card-lift"
                    >
                      <method.icon className="h-3.5 w-3.5" />
                      {method.label}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* PWA Install Prompt */}
              <div>
                <h4 className="font-semibold text-sm mb-3 r62-heading-gradient">Baixe o App</h4>
                <motion.div
                  className="relative group"
                >
                  {/* Animated gradient border — always visible, shimmer on hover */}
                  <div
                    className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-primary via-emerald-400 to-teal-500 opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      backgroundSize: '300% 100%',
                      animation: 'pill-shimmer 3s ease-in-out infinite',
                    }}
                  />
                  <Button
                    onClick={handlePWAInstall}
                    className="relative w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-primary-foreground text-sm font-semibold btn-glow btn-shine"
                  >
                    <Download className="h-4 w-4" />
                    Instalar App
                  </Button>
                </motion.div>
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
            </motion.div>
          </motion.div>

          {/* Marquee scroll partners/payment section */}
          <div className="marquee-scroll py-4 -mx-4 px-4 border-y border-border/50 mb-4" aria-label="Métodos de pagamento aceitos">
            <div className="inline-flex items-center gap-8">
              {paymentMethods.map((method, i) => (
                <div
                  key={`marquee-original-${i}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-xs font-medium text-muted-foreground/60 shrink-0 select-none"
                >
                  <method.icon className="h-3 w-3" />
                  {method.label}
                </div>
              ))}
              {/* Duplicated copies for infinite scroll effect — hidden from screen readers */}
              <div aria-hidden="true">
                {[...paymentMethods, ...paymentMethods, ...paymentMethods].map((method, i) => (
                  <div
                    key={`marquee-dup-${i}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-xs font-medium text-muted-foreground/60 shrink-0 select-none"
                  >
                    <method.icon className="h-3 w-3" />
                    {method.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="r46-footer-divider my-4" />

          {/* Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>DomPlace © {new Date().getFullYear()} — Todos os direitos reservados.</p>
            {/* ──────────────────────────────────────
                FEATURE 7: Heartbeat "Feito com ❤️" Animation
                ────────────────────────────────────── */}
            <p className="flex items-center gap-1.5">
              Feito com{' '}
              <span className="footer-heartbeat">
                <Heart className="h-3 w-3 text-red-500 fill-red-500" />
              </span>{' '}
              em Dom Eliseu, PA
            </p>
          </div>
        </div>

        {/* ──────────────────────────────────────
            FEATURE 5: Scroll-to-top Animated Button
            ────────────────────────────────────── */}
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              variants={backToTopVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToTop}
              className="fixed bottom-24 md:bottom-6 right-4 z-40 h-11 w-11 min-h-[44px] min-w-[44px] rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors footer-scroll-top r41-back-to-top r43-back-to-top-gradient r46-back-to-top-bounce r60-touch-feedback"
              aria-label="Voltar ao topo"
            >
              <ArrowUp className="h-5 w-5 footer-chevron-bounce" />
            </motion.button>
          )}
        </AnimatePresence>
      </footer>
    </motion.div>
  )
}
