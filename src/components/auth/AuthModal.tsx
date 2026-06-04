'use client'

import { useState, useMemo } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, Store, Truck, UserCircle, UserPlus, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'

// Dynamic import Turnstile to avoid SSR issues
const TurnstileWidget = dynamic(
  () => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      return import('react-turnstile').then(mod => mod.default)
    }
    return Promise.resolve(() => null)
  },
  { ssr: false }
)

type RegisterRole = 'USER' | 'STORE_OWNER' | 'DELIVERY_DRIVER' | 'AFFILIATE'

const roleOptions: { value: RegisterRole; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'USER', label: 'Usuário', icon: <UserCircle className="h-4 w-4" />, description: 'Comprar e pedir delivery' },
  { value: 'STORE_OWNER', label: 'Lojista', icon: <Store className="h-4 w-4" />, description: 'Vender produtos online' },
  { value: 'AFFILIATE', label: 'Afiliado', icon: <UserPlus className="h-4 w-4" />, description: 'Indicar e ganhar comissão' },
  { value: 'DELIVERY_DRIVER', label: 'Entregador', icon: <Truck className="h-4 w-4" />, description: 'Realizar entregas' },
]

// Check if OAuth providers are configured
const isGoogleConfigured = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const isFacebookConfigured = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID
const isTurnstileConfigured = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

const GoogleIcon = () => (
  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const FacebookIcon = () => (
  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

// Floating particle component
function FloatingParticle({ index }: { index: number }) {
  const config = useMemo(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 3 + Math.random() * 5,
    duration: 8 + Math.random() * 12,
    delay: Math.random() * 4,
    opacity: 0.1 + Math.random() * 0.15,
  }), [])
  const colors = ['from-primary/40 to-emerald-400/30', 'from-purple-400/30 to-pink-400/20', 'from-teal-400/30 to-cyan-400/20', 'from-amber-400/20 to-orange-400/20']
  const color = colors[index % colors.length]
  return (
    <motion.div
      className={`absolute rounded-full bg-gradient-to-br ${color} blur-sm pointer-events-none`}
      style={{
        left: `${config.x}%`,
        top: `${config.y}%`,
        width: config.size,
        height: config.size,
      }}
      animate={{
        y: [0, -30, 10, -20, 0],
        x: [0, 15, -10, 20, 0],
        opacity: [config.opacity, config.opacity * 1.5, config.opacity * 0.5, config.opacity * 1.2, config.opacity],
        scale: [1, 1.3, 0.8, 1.1, 1],
      }}
      transition={{
        duration: config.duration,
        delay: config.delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useAppStore()
  const { login, register } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [regTermsAccepted, setRegTermsAccepted] = useState(false)
  const [regRole, setRegRole] = useState<RegisterRole>('USER')

  const [activeTab, setActiveTab] = useState('login')
  const [isSuccess, setIsSuccess] = useState(false)

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const pwd = regPassword
    if (!pwd) return { score: 0, label: '', color: '' }
    let score = 0
    if (pwd.length >= 6) score++
    if (pwd.length >= 10) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    if (score <= 1) return { score, label: 'Fraca', color: '#ef4444' }
    if (score <= 2) return { score, label: 'Razoável', color: '#f59e0b' }
    if (score <= 3) return { score, label: 'Boa', color: '#eab308' }
    if (score <= 4) return { score, label: 'Forte', color: '#22c55e' }
    return { score, label: 'Excelente', color: '#10b981' }
  }, [regPassword])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      toast.error('Preencha todos os campos')
      return
    }
    if (isTurnstileConfigured && !turnstileToken) {
      toast.error('Complete a verificação de segurança')
      return
    }
    setIsLoading(true)
    setIsSuccess(false)
    const success = await login(loginEmail, loginPassword)
    setIsLoading(false)
    if (success) {
      setIsSuccess(true)
      setTimeout(() => {
        setLoginEmail('')
        setLoginPassword('')
        setTurnstileToken(null)
        setIsSuccess(false)
        closeAuthModal()
      }, 800)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    if (regPassword !== regConfirmPassword) {
      toast.error('As senhas não conferem')
      return
    }
    if (regPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres')
      return
    }
    if (!regTermsAccepted) {
      toast.error('Você precisa aceitar os termos de uso')
      return
    }
    if (isTurnstileConfigured && !turnstileToken) {
      toast.error('Complete a verificação de segurança')
      return
    }
    setIsLoading(true)
    setIsSuccess(false)
    const success = await register({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      role: regRole,
      turnstileToken: turnstileToken || undefined,
    })
    setIsLoading(false)
    if (success) {
      setIsSuccess(true)
      setTimeout(() => {
        setRegName('')
        setRegEmail('')
        setRegPhone('')
        setRegPassword('')
        setRegConfirmPassword('')
        setRegTermsAccepted(false)
        setRegRole('USER')
        setTurnstileToken(null)
        setIsSuccess(false)
        closeAuthModal()
      }, 800)
    }
  }

  const handleGoogleSignIn = () => {
    if (typeof window !== 'undefined') {
      import('next-auth/react').then(({ signIn }) => {
        signIn('google', { callbackUrl: '/' })
      })
    }
  }

  const handleFacebookSignIn = () => {
    if (typeof window !== 'undefined') {
      import('next-auth/react').then(({ signIn }) => {
        signIn('facebook', { callbackUrl: '/' })
      })
    }
  }

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => { if (!open) closeAuthModal() }}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-y-auto inset-0 rounded-none sm:rounded-2xl sm:inset-auto sm:max-h-[90vh] r41-modal-card r43-modal-entrance r46-modal-border-glow">
        <motion.button
          onClick={() => closeAuthModal()}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
          className="absolute right-3 top-3 z-50 r43-modal-close r46-close-btn h-11 w-11 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </motion.button>
        {/* ── Animated floating particles ── */}
        {Array.from({ length: 12 }).map((_, i) => (
          <FloatingParticle key={`particle-${i}`} index={i} />
        ))}
        {/* ── 3-4 Floating gradient orbs with slow movement ── */}
        <motion.div
          className="absolute -top-10 -left-10 h-28 w-28 rounded-full bg-gradient-to-r from-primary/20 to-emerald-400/20 blur-2xl pointer-events-none"
          animate={{ y: [0, -12, 6, -8, 0], x: [0, 5, -3, 4, 0], scale: [1, 1.1, 0.95, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 -right-8 h-20 w-20 rounded-full bg-gradient-to-r from-purple-500/15 to-pink-500/15 blur-xl pointer-events-none"
          animate={{ y: [0, 10, -6, 8, 0], x: [0, -6, 4, -8, 0], scale: [1, 0.9, 1.1, 0.95, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 h-16 w-16 rounded-full bg-gradient-to-r from-teal-400/15 to-cyan-400/15 blur-lg pointer-events-none"
          animate={{ x: [0, 8, -12, 6, 0], y: [0, -8, 4, -6, 0], scale: [1, 1.08, 0.92, 1.05, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 h-14 w-14 rounded-full bg-gradient-to-r from-amber-400/10 to-orange-400/10 blur-md pointer-events-none"
          animate={{ y: [0, -10, 5, -7, 0], x: [0, 6, -4, 8, 0], scale: [1, 1.12, 0.88, 1.06, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />

        {/* ── Subtle noise texture overlay ── */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none z-[1]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />

        <Tabs defaultValue="login" className="w-full">
          {/* -- Header with gradient -- */}
          <div className="bg-gradient-to-br from-primary via-emerald-600 to-teal-600 px-6 pt-6 pb-4 sticky top-0 z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key="auth-header"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DialogHeader>
                  <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <Store className="h-4 w-4 text-white" />
                    </div>
                    DomPlace
                  </DialogTitle>
                  <DialogDescription className="text-white/80 text-sm">
                    Acesse sua conta ou cadastre-se
                  </DialogDescription>
                </DialogHeader>
                <TabsList className="mt-4 bg-white/20 min-h-11 p-0.5 rounded-lg w-full relative">
                  <motion.div
                    className="absolute top-0.5 bottom-0.5 rounded-md r41-tab-indicator r46-tab-bar-indicator"
                    animate={{ left: activeTab === 'login' ? '2px' : 'calc(50%)', width: 'calc(50% - 2px)' }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                  />
                  <TabsTrigger value="login" className="flex-1 rounded-md text-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-sm transition-all duration-200 relative z-10 r41-tab-text r43-tab-underline r46-tab-bar-indicator" onClick={() => setActiveTab('login')}>
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger value="register" className="flex-1 rounded-md text-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-sm transition-all duration-200 relative z-10 r41-tab-text r43-tab-underline r46-tab-bar-indicator" onClick={() => setActiveTab('register')}>
                    Cadastrar
                  </TabsTrigger>
                </TabsList>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* -- Login Tab -- */}
          <TabsContent value="login" className="p-6 mt-0" style={{ paddingBottom: 'max(24px, calc(16px + env(safe-area-inset-bottom)))' }}>
            <AnimatePresence mode="wait">
            <motion.form
              key="login-form"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, type: 'spring' as const, stiffness: 300, damping: 25 }}
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm r41-floating-label">E-mail</Label>
                <div className="relative r41-input-group r43-input-gradient">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground r41-input-icon" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-9 min-h-12 r41-input-field r46-input-glow w-full"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-sm r41-floating-label">Senha</Label>
                  <button type="button" className="text-xs text-primary hover:underline">
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative r41-input-group r43-input-gradient">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground r41-input-icon" />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-9 pr-10 min-h-12 r41-input-field r46-input-glow w-full"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground r46-pw-toggle"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Turnstile verification for login */}
              {isTurnstileConfigured && (
                <div className="flex justify-center">
                  <TurnstileWidget
                    sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                    onVerify={(token: string) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken(null)}
                    onError={() => setTurnstileToken(null)}
                    theme="light"
                    size="normal"
                  />
                </div>
              )}
              {isTurnstileConfigured && !turnstileToken && (
                <p className="text-[10px] text-center text-amber-600">
                  ⚠ Complete a verificação de segurança acima
                </p>
              )}

              <motion.div className="relative overflow-hidden rounded-lg r41-submit-wrap r43-submit-shimmer r46-submit-glow r60-touch-feedback">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent r41-shimmer-sweep"
                  animate={{ translateX: ['100%', '-100%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                />
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-primary via-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-60 relative active:scale-95 transition-transform min-h-12"
                  disabled={isLoading || isSuccess}
                >
                  {isLoading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="h-4 w-4 animate-spin r41-spinner r43-spinner-accent" />
                      Entrando...
                    </motion.div>
                  ) : isSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Sucesso!
                    </motion.div>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </motion.div>

              <div className="relative flex items-center justify-center">
                <Separator className="flex-1" />
                <span className="px-3 text-[10px] text-muted-foreground uppercase tracking-wider">ou continue com</span>
                <Separator className="flex-1" />
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  className="w-full min-h-11 border-border/60 hover:border-primary/30 transition-colors r41-social-google r43-social-google r46-social-btn min-h-12"
                  disabled={!isGoogleConfigured}
                  onClick={isGoogleConfigured ? handleGoogleSignIn : undefined}
                >
                  <GoogleIcon />
                  Entrar com Google
                  {!isGoogleConfigured && (
                    <span className="text-[10px] text-muted-foreground ml-2">(em breve)</span>
                  )}
                </Button>
              </motion.div>

              {isFacebookConfigured && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 border-border/60 hover:border-primary/30 transition-colors r41-social-facebook r43-social-facebook r46-social-btn min-h-12"
                    onClick={handleFacebookSignIn}
                  >
                    <FacebookIcon />
                    Entrar com Facebook
                  </Button>
                </motion.div>
              )}
            </motion.form>
            </AnimatePresence>
          </TabsContent>

          {/* -- Register Tab -- */}
          <TabsContent value="register" className="p-6 mt-0" style={{ paddingBottom: 'max(24px, calc(16px + env(safe-area-inset-bottom)))' }}>
            <AnimatePresence mode="wait">
            <motion.form
              key="register-form"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, type: 'spring' as const, stiffness: 300, damping: 25 }}
              onSubmit={handleRegister}
              className="space-y-3"
            >
              {/* Role selector */}
              <div className="space-y-2">
                <Label className="text-sm">Tipo de conta</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {roleOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      whileHover={{ y: -3, transition: { type: 'spring' as const, stiffness: 400, damping: 18 } }}
                      whileTap={{ scale: 0.95 }}
                      animate={regRole === option.value ? { scale: [1, 1.08, 1], borderColor: '#10b981' } : { scale: 1 }}
                      transition={regRole === option.value ? { duration: 0.4, type: 'spring' as const, stiffness: 400, damping: 15 } : { duration: 0.2 }}
                      onClick={() => setRegRole(option.value)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-center transition-colors duration-200 ${
                        regRole === option.value
                          ? 'border-primary bg-primary/5 text-primary r41-role-active r43-role-active-glow'
                          : 'border-border hover:border-muted-foreground/30 hover:bg-muted/50'
                      }`}
                    >
                      <motion.div
                        animate={regRole === option.value ? { rotate: [0, -5, 5, 0] } : {}}
                        transition={{ duration: 0.4, type: 'spring' as const, stiffness: 300 }}
                      >
                        {option.icon}
                      </motion.div>
                      <span className="text-xs font-medium">{option.label}</span>
                      <span className="text-[9px] text-muted-foreground leading-tight">{option.description}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="reg-name" className="text-sm r41-floating-label">Nome completo</Label>
                  <div className="relative r41-input-group r43-input-gradient">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground r41-input-icon" />
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="Maria Silva"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="pl-9 min-h-12 r41-input-field r46-input-glow w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-sm r41-floating-label">E-mail</Label>
                  <div className="relative r41-input-group r43-input-gradient">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground r41-input-icon" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="pl-9 min-h-12 r41-input-field r46-input-glow w-full"
                      autoComplete="email"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-phone" className="text-sm r41-floating-label">Telefone</Label>
                <div className="relative r41-input-group r43-input-gradient">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground r41-input-icon" />
                  <Input
                    id="reg-phone"
                    type="tel"
                    placeholder="(91) 99999-0000"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="pl-9 min-h-12 r41-input-field r46-input-glow w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-sm r41-floating-label">Senha</Label>
                  <div className="relative r41-input-group r43-input-gradient">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground r41-input-icon" />
                    <Input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="pl-9 pr-10 min-h-12 r41-input-field r46-input-glow w-full"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground r46-pw-toggle min-w-11 min-h-11 flex items-center justify-center"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-confirm-password" className="text-sm r41-floating-label">Confirmar senha</Label>
                  <div className="relative r41-input-group r43-input-gradient">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground r41-input-icon" />
                    <Input
                      id="reg-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repita a senha"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="pl-9 pr-10 min-h-12 r41-input-field r46-input-glow w-full"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground r46-pw-toggle min-w-11 min-h-11 flex items-center justify-center"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password strength meter */}
              <AnimatePresence>
                {regPassword.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="r41-strength-meter">
                      <div className="r41-strength-track">
                        <motion.div
                          className="r41-strength-fill"
                          animate={{ width: `${(passwordStrength.score / 5) * 100}%`, backgroundColor: passwordStrength.color }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="r41-strength-label" style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Turnstile verification for register */}
              {isTurnstileConfigured && (
                <div className="flex justify-center">
                  <TurnstileWidget
                    sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                    onVerify={(token: string) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken(null)}
                    onError={() => setTurnstileToken(null)}
                    theme="light"
                    size="normal"
                  />
                </div>
              )}
              {isTurnstileConfigured && !turnstileToken && (
                <p className="text-[10px] text-center text-amber-600">
                  ⚠ Complete a verificação de segurança acima
                </p>
              )}

              <div className="flex items-start gap-2 pt-1">
                <Checkbox
                  id="reg-terms"
                  checked={regTermsAccepted}
                  onCheckedChange={(checked) => setRegTermsAccepted(checked === true)}
                  className="mt-0.5"
                />
                <label htmlFor="reg-terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  Li e aceito os{' '}
                  <span className="text-primary hover:underline cursor-pointer font-medium">Termos de Uso</span>
                  {' '}e a{' '}
                  <span className="text-primary hover:underline cursor-pointer font-medium">Política de Privacidade</span>
                  {' '}conforme a LGPD.
                </label>
              </div>

              <motion.div className="relative overflow-hidden rounded-lg r41-submit-wrap r43-submit-shimmer r46-submit-glow r60-touch-feedback">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent r41-shimmer-sweep"
                  animate={{ translateX: ['100%', '-100%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                />
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-primary via-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-60 relative active:scale-95 transition-transform min-h-12"
                  disabled={isLoading || isSuccess}
                >
                  {isLoading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="h-4 w-4 animate-spin r41-spinner r43-spinner-accent" />
                      Cadastrando...
                    </motion.div>
                  ) : isSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Conta criada!
                    </motion.div>
                  ) : (
                    'Criar Conta'
                  )}
                </Button>
              </motion.div>

              <div className="relative flex items-center justify-center">
                <Separator className="flex-1" />
                <span className="px-3 text-[10px] text-muted-foreground uppercase tracking-wider">ou continue com</span>
                <Separator className="flex-1" />
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 border-border/60 hover:border-primary/30 transition-colors r41-social-google r43-social-google r46-social-btn"
                  disabled={!isGoogleConfigured}
                  onClick={isGoogleConfigured ? handleGoogleSignIn : undefined}
                >
                  <GoogleIcon />
                  Cadastrar com Google
                  {!isGoogleConfigured && (
                    <span className="text-[10px] text-muted-foreground ml-2">(em breve)</span>
                  )}
                </Button>
              </motion.div>

              {isFacebookConfigured && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 border-border/60 hover:border-primary/30 transition-colors r41-social-facebook r43-social-facebook r46-social-btn min-h-12"
                    onClick={handleFacebookSignIn}
                  >
                    <FacebookIcon />
                    Cadastrar com Facebook
                  </Button>
                </motion.div>
              )}
            </motion.form>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
