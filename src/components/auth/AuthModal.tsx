'use client'

import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, Store, Truck, UserCircle } from 'lucide-react'
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

type RegisterRole = 'USER' | 'STORE_OWNER' | 'DELIVERY_DRIVER'

const roleOptions: { value: RegisterRole; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'USER', label: 'Usuário', icon: <UserCircle className="h-4 w-4" />, description: 'Comprar e pedir delivery' },
  { value: 'STORE_OWNER', label: 'Lojista', icon: <Store className="h-4 w-4" />, description: 'Vender produtos online' },
  { value: 'DELIVERY_DRIVER', label: 'Entregador', icon: <Truck className="h-4 w-4" />, description: 'Realizar entregas' },
]

// Check if OAuth providers are configured
const isGoogleConfigured = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const isFacebookConfigured = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID
const isTurnstileConfigured = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      toast.error('Preencha todos os campos')
      return
    }
    // Check Turnstile if configured
    if (isTurnstileConfigured && !turnstileToken) {
      toast.error('Complete a verificação de segurança')
      return
    }
    setIsLoading(true)
    const success = await login(loginEmail, loginPassword)
    setIsLoading(false)
    if (success) {
      setLoginEmail('')
      setLoginPassword('')
      setTurnstileToken(null)
      closeAuthModal()
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
    // Check Turnstile if configured
    if (isTurnstileConfigured && !turnstileToken) {
      toast.error('Complete a verificação de segurança')
      return
    }
    setIsLoading(true)
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
      setRegName('')
      setRegEmail('')
      setRegPhone('')
      setRegPassword('')
      setRegConfirmPassword('')
      setRegTermsAccepted(false)
      setRegRole('USER')
      setTurnstileToken(null)
      closeAuthModal()
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

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => { if (!open) closeAuthModal() }}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <Tabs defaultValue="login" className="w-full">
          <div className="bg-gradient-to-r from-primary to-emerald-600 px-6 pt-6 pb-4">
            <DialogHeader>
              <DialogTitle className="text-white text-lg font-bold">
                DomPlace
              </DialogTitle>
              <DialogDescription className="text-white/80 text-sm">
                Acesse sua conta ou cadastre-se
              </DialogDescription>
            </DialogHeader>
            <TabsList className="mt-4 bg-white/20 h-10 p-0.5 rounded-lg w-full">
              <TabsTrigger value="login" className="flex-1 rounded-md text-white data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-sm">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="register" className="flex-1 rounded-md text-white data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-sm">
                Cadastrar
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Login */}
          <TabsContent value="login" className="p-6 mt-0">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-9 h-11"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-sm">Senha</Label>
                  <button type="button" className="text-xs text-primary hover:underline">
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-9 pr-10 h-11"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

              <Button
                type="submit"
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>

              <Separator />

              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                disabled={!isGoogleConfigured}
                onClick={isGoogleConfigured ? handleGoogleSignIn : undefined}
              >
                <GoogleIcon />
                Entrar com Google
                {!isGoogleConfigured && (
                  <span className="text-[10px] text-muted-foreground ml-2">(em breve)</span>
                )}
              </Button>

              {isFacebookConfigured && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={handleFacebookSignIn}
                >
                  <FacebookIcon />
                  Entrar com Facebook
                </Button>
              )}
            </form>
          </TabsContent>

          {/* Register */}
          <TabsContent value="register" className="p-6 mt-0">
            <form onSubmit={handleRegister} className="space-y-3">
              {/* Role selector */}
              <div className="space-y-2">
                <Label className="text-sm">Tipo de conta</Label>
                <div className="grid grid-cols-3 gap-2">
                  {roleOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRegRole(option.value)}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 text-center transition-all ${
                        regRole === option.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-muted hover:border-muted-foreground/30'
                      }`}
                    >
                      {option.icon}
                      <span className="text-xs font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-name" className="text-sm">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="Maria Silva"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-sm">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="pl-9 h-11"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-phone" className="text-sm">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-phone"
                    type="tel"
                    placeholder="(91) 99999-0000"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-sm">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="pl-9 pr-10 h-11"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-confirm-password" className="text-sm">Confirmar senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repita a senha"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="pl-9 pr-10 h-11"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

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
                  <span className="text-primary hover:underline cursor-pointer">Termos de Uso</span>
                  {' '}e a{' '}
                  <span className="text-primary hover:underline cursor-pointer">Política de Privacidade</span>
                  {' '}conforme a LGPD.
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </Button>

              <Separator />

              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                disabled={!isGoogleConfigured}
                onClick={isGoogleConfigured ? handleGoogleSignIn : undefined}
              >
                <GoogleIcon />
                Cadastrar com Google
                {!isGoogleConfigured && (
                  <span className="text-[10px] text-muted-foreground ml-2">(em breve)</span>
                )}
              </Button>

              {isFacebookConfigured && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={handleFacebookSignIn}
                >
                  <FacebookIcon />
                  Cadastrar com Facebook
                </Button>
              )}
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
