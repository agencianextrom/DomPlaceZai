'use client'

import { useState, useEffect, useCallback } from 'react'
import { Home, Building2, MapPin, Plus, Pencil, Trash2, Star, Check, Loader2, Search, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAppStore } from '@/store/useAppStore'

// --- Types ---
// API response shape (from /api/addresses)
interface ApiAddress {
  id: string
  street: string
  number: string | null
  complement: string | null
  neighborhood: string
  city: string
  state: string
  zipCode: string | null
  isDefault: boolean
  createdAt: string
}

// Local UI representation (extends API with a label for display)
interface Address {
  id: string
  label: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  zip: string
  complement: string
  isPrimary: boolean
}

interface AddressFormData {
  label: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  zip: string
  complement: string
}

const emptyForm: AddressFormData = {
  label: '',
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state: '',
  zip: '',
  complement: '',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}

function getIconForLabel(label: string) {
  const lower = label.toLowerCase()
  if (lower.includes('trabalho') || lower.includes('escritório') || lower.includes('escritorio')) {
    return Building2
  }
  return Home
}

// Map API address to local UI address
function mapApiToAddress(api: ApiAddress): Address {
  return {
    id: api.id,
    label: api.isDefault ? 'Casa' : '', // API doesn't have label — default-based
    street: api.street,
    number: api.number || '',
    neighborhood: api.neighborhood,
    city: api.city,
    state: api.state,
    zip: api.zipCode || '',
    complement: api.complement || '',
    isPrimary: api.isDefault,
  }
}

// Map local form data to API body
function formToApiBody(form: AddressFormData, isDefault: boolean) {
  return {
    street: form.street.trim(),
    number: form.number.trim() || null,
    complement: form.complement.trim() || null,
    neighborhood: form.neighborhood.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    zipCode: form.zip.trim() || null,
    isDefault,
  }
}

export function AddressManager() {
  const currentUser = useAppStore(s => s.currentUser)
  const openAuthModal = useAppStore(s => s.openAuthModal)

  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [form, setForm] = useState<AddressFormData>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({})
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState('')

  // Fetch addresses from API on mount
  const fetchAddresses = useCallback(async () => {
    if (!currentUser?.id) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch('/api/addresses')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.addresses) {
          setAddresses(data.addresses.map(mapApiToAddress))
        }
      } else if (res.status === 401) {
        setAddresses([])
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false)
    }
  }, [currentUser?.id])

  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  // ViaCEP auto-fill on CEP change
  const handleCepChange = (value: string) => {
    // Apply CEP mask: 00000-000
    const digits = value.replace(/\D/g, '').slice(0, 8)
    let masked = ''
    for (let i = 0; i < digits.length; i++) {
      if (i === 5) masked += '-'
      masked += digits[i]
    }
    setForm({ ...form, zip: masked })
    setCepError('')

    // Auto-fetch when 8 digits entered
    if (digits.length === 8) {
      fetchCepData(digits)
    }
  }

  const fetchCepData = async (digits: string) => {
    setCepLoading(true)
    setCepError('')
    try {
      const res = await fetch(`/api/cep/${digits}`)
      if (res.ok) {
        const data = await res.json()
        if (data.erro) {
          setCepError('CEP não encontrado. Preencha manualmente.')
          return
        }
        setForm(prev => ({
          ...prev,
          street: data.street || prev.street,
          neighborhood: data.neighborhood || prev.neighborhood,
          city: data.city || prev.city,
          state: data.state || prev.state,
          zip: data.zip || prev.zip,
        }))
        toast.success('Endereço preenchido automaticamente')
      } else {
        setCepError('CEP não encontrado. Preencha manualmente.')
      }
    } catch {
      // Silently fail, user can type manually
    } finally {
      setCepLoading(false)
    }
  }

  const openAddDialog = () => {
    setEditingAddress(null)
    setForm(emptyForm)
    setErrors({})
    setIsDialogOpen(true)
  }

  const openEditDialog = (address: Address) => {
    setEditingAddress(address)
    setForm({
      label: address.label,
      street: address.street,
      number: address.number,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zip: address.zip,
      complement: address.complement,
    })
    setErrors({})
    setIsDialogOpen(true)
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AddressFormData, string>> = {}
    if (!form.street.trim()) newErrors.street = 'Campo obrigatório'
    if (!form.number.trim()) newErrors.number = 'Campo obrigatório'
    if (!form.neighborhood.trim()) newErrors.neighborhood = 'Campo obrigatório'
    if (!form.city.trim()) newErrors.city = 'Campo obrigatório'
    if (!form.state.trim()) newErrors.state = 'Campo obrigatório'
    if (!form.zip.trim()) newErrors.zip = 'Campo obrigatório'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    setIsSaving(true)
    try {
      const isDefault = editingAddress ? editingAddress.isPrimary : addresses.length === 0
      const body = formToApiBody(form, isDefault)

      if (editingAddress) {
        // Update existing address
        const res = await fetch(`/api/addresses/${editingAddress.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (res.ok) {
          toast.success('Endereço atualizado com sucesso!')
          await fetchAddresses()
        } else {
          const data = await res.json()
          toast.error(data.error || 'Erro ao atualizar endereço')
        }
      } else {
        // Create new address
        const res = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (res.ok) {
          toast.success('Endereço adicionado com sucesso!')
          await fetchAddresses()
        } else {
          const data = await res.json()
          toast.error(data.error || 'Erro ao criar endereço')
        }
      }

      setIsDialogOpen(false)
      setForm(emptyForm)
      setErrors({})
    } catch {
      toast.error('Erro de conexão. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (addressId: string) => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Endereço removido')
        await fetchAddresses()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao remover endereço')
      }
    } catch {
      toast.error('Erro de conexão. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const setPrimary = async (addressId: string) => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/addresses/${addressId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      })
      if (res.ok) {
        toast.success('Endereço principal atualizado')
        await fetchAddresses()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao atualizar endereço')
      }
    } catch {
      toast.error('Erro de conexão. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  // Not authenticated — show login prompt
  if (!currentUser?.id) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Meus Endereços
          </h2>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <LogIn className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Faça login para gerenciar seus endereços</p>
          <Button
            className="mt-3 gap-1 bg-primary text-primary-foreground"
            onClick={openAuthModal}
          >
            <LogIn className="h-3.5 w-3.5" />
            Entrar na conta
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Meus Endereços
        </h2>
        <Button
          size="sm"
          className="bg-primary text-primary-foreground gap-1 h-8 min-h-[44px] text-xs"
          onClick={openAddDialog}
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar endereço
        </Button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Address Cards */}
      {!isLoading && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {addresses.map((address) => {
              const Icon = getIconForLabel(address.label || (address.isPrimary ? 'Casa' : 'Endereço'))
              return (
                <motion.div
                  key={address.id}
                  variants={itemVariants}
                  layout
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0, transition: { duration: 0.25 } }}
                >
                  <Card
                    className={`border-border/50 hover:shadow-sm transition-all ${
                      address.isPrimary ? 'border-2 border-primary' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      {/* Top row: icon, label, badges */}
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm">{address.label || (address.isPrimary ? 'Casa' : 'Endereço')}</p>
                            {address.isPrimary && (
                              <Badge className="text-[9px] px-1.5 py-0 gap-0.5 bg-primary text-primary-foreground border-0">
                                <Star className="h-2.5 w-2.5" />
                                Principal
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                            {address.street}, {address.number}
                            {address.complement ? ` - ${address.complement}` : ''}
                            <br />
                            {address.neighborhood}, {address.city} - {address.state}
                            {address.zip ? (
                              <><br />CEP: {address.zip}</>
                            ) : null}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/50">
                        {!address.isPrimary && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs gap-1.5 text-muted-foreground"
                            onClick={() => setPrimary(address.id)}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Star className="h-3.5 w-3.5" />
                            )}
                            Definir como principal
                          </Button>
                        )}
                        {address.isPrimary && (
                          <div className="flex items-center gap-1.5 text-xs text-primary">
                            <Check className="h-3.5 w-3.5" />
                            Endereço principal
                          </div>
                        )}
                        <div className="flex-1" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 min-h-[44px] min-w-[44px]"
                          onClick={() => openEditDialog(address)}
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 min-h-[44px] min-w-[44px]"
                          onClick={() => handleDelete(address.id)}
                          disabled={addresses.length === 1 || isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {addresses.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum endereço cadastrado</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 gap-1"
                onClick={openAddDialog}
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar primeiro endereço
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* -- Add/Edit Dialog -- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {editingAddress ? 'Editar Endereço' : 'Novo Endereço'}
            </DialogTitle>
            <DialogDescription>
              {editingAddress
                ? 'Atualize as informações do endereço abaixo.'
                : 'Preencha as informações do novo endereço.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Apelido (label) */}
            <div className="space-y-1.5">
              <Label htmlFor="addr-label" className="text-sm font-medium">
                Apelido <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Input
                id="addr-label"
                placeholder="Ex: Casa, Trabalho, Mãe..."
                className="h-10 text-sm"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>

            {/* Rua + Número */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 col-span-1 space-y-1.5">
                <Label htmlFor="addr-street" className="text-sm font-medium">
                  Rua <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="addr-street"
                  placeholder="Nome da rua"
                  className={`h-10 text-sm ${errors.street ? 'border-destructive' : ''}`}
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                />
                {errors.street && <p className="text-[10px] text-destructive">{errors.street}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="addr-number" className="text-sm font-medium">
                  Nº <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="addr-number"
                  placeholder="123"
                  className={`h-10 text-sm ${errors.number ? 'border-destructive' : ''}`}
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                />
                {errors.number && <p className="text-[10px] text-destructive">{errors.number}</p>}
              </div>
            </div>

            {/* Bairro */}
            <div className="space-y-1.5">
              <Label htmlFor="addr-neighborhood" className="text-sm font-medium">
                Bairro <span className="text-destructive">*</span>
              </Label>
              <Input
                id="addr-neighborhood"
                placeholder="Nome do bairro"
                className={`h-10 text-sm ${errors.neighborhood ? 'border-destructive' : ''}`}
                value={form.neighborhood}
                onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
              />
              {errors.neighborhood && (
                <p className="text-[10px] text-destructive">{errors.neighborhood}</p>
              )}
            </div>

            {/* Cidade + Estado */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 col-span-1 space-y-1.5">
                <Label htmlFor="addr-city" className="text-sm font-medium">
                  Cidade <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="addr-city"
                  placeholder="Sua cidade"
                  className={`h-10 text-sm ${errors.city ? 'border-destructive' : ''}`}
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
                {errors.city && <p className="text-[10px] text-destructive">{errors.city}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="addr-state" className="text-sm font-medium">
                  Estado <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="addr-state"
                  placeholder="UF"
                  className={`h-10 text-sm uppercase ${errors.state ? 'border-destructive' : ''}`}
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  maxLength={2}
                />
                {errors.state && <p className="text-[10px] text-destructive">{errors.state}</p>}
              </div>
            </div>

            {/* CEP */}
            <div className="space-y-1.5">
              <Label htmlFor="addr-zip" className="text-sm font-medium">
                CEP <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="addr-zip"
                  placeholder="00000-000"
                  className={`h-10 text-sm pr-10 ${errors.zip ? 'border-destructive' : ''} ${cepLoading ? 'opacity-70' : ''}`}
                  value={form.zip}
                  onChange={(e) => handleCepChange(e.target.value)}
                  maxLength={9}
                  disabled={cepLoading}
                />
                {cepLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                )}
                {!cepLoading && form.zip.replace(/\D/g, '').length >= 8 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              {errors.zip && <p className="text-[10px] text-destructive">{errors.zip}</p>}
              {cepError && <p className="text-[10px] text-amber-600 flex items-center gap-1"><span>⚠</span>{cepError}</p>}
            </div>

            {/* Complemento */}
            <div className="space-y-1.5">
              <Label htmlFor="addr-complement" className="text-sm font-medium">
                Complemento <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Input
                id="addr-complement"
                placeholder="Apto, sala, bloco..."
                className="h-10 text-sm"
                value={form.complement}
                onChange={(e) => setForm({ ...form, complement: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="flex-1 sm:flex-none"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 sm:flex-none bg-primary text-primary-foreground"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Check className="h-4 w-4 mr-1.5" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
