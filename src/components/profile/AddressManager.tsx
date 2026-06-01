'use client'

import { useState } from 'react'
import { Home, Building2, MapPin, Plus, Pencil, Trash2, Star, Check, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

// --- Types ---
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

// --- Mock Data ---
const initialAddresses: Address[] = [
  {
    id: 'a1',
    label: 'Casa',
    street: 'Rua Principal',
    number: '123',
    neighborhood: 'Centro',
    city: 'Dom Eliseu',
    state: 'PA',
    zip: '68635-000',
    complement: '',
    isPrimary: true,
  },
  {
    id: 'a2',
    label: 'Trabalho',
    street: 'Av. Brasil',
    number: '456',
    neighborhood: 'Centro',
    city: 'Dom Eliseu',
    state: 'PA',
    zip: '68635-000',
    complement: 'Sala 201',
    isPrimary: false,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

function getIconForLabel(label: string) {
  const lower = label.toLowerCase()
  if (lower.includes('trabalho') || lower.includes('escritório') || lower.includes('escritorio')) {
    return Building2
  }
  return Home
}

export function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [form, setForm] = useState<AddressFormData>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({})
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState('')

  // ViaCEP auto-fill on CEP blur
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
    if (!form.label.trim()) newErrors.label = 'Campo obrigatório'
    if (!form.street.trim()) newErrors.street = 'Campo obrigatório'
    if (!form.number.trim()) newErrors.number = 'Campo obrigatório'
    if (!form.neighborhood.trim()) newErrors.neighborhood = 'Campo obrigatório'
    if (!form.city.trim()) newErrors.city = 'Campo obrigatório'
    if (!form.state.trim()) newErrors.state = 'Campo obrigatório'
    if (!form.zip.trim()) newErrors.zip = 'Campo obrigatório'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    if (editingAddress) {
      setAddresses((prev) =>
        prev.map((addr) =>
          addr.id === editingAddress.id
            ? { ...addr, ...form }
            : addr
        )
      )
      toast.success('Endereço atualizado com sucesso!')
    } else {
      const newAddress: Address = {
        id: `a-new-${Date.now()}`,
        ...form,
        isPrimary: addresses.length === 0,
      }
      setAddresses([...addresses, newAddress])
      toast.success('Endereço adicionado com sucesso!')
    }

    setIsDialogOpen(false)
    setForm(emptyForm)
    setErrors({})
  }

  const handleDelete = (addressId: string) => {
    const addr = addresses.find((a) => a.id === addressId)
    if (!addr) return

    setAddresses((prev) => {
      const filtered = prev.filter((a) => a.id !== addressId)
      // If we deleted the primary, make the first one primary
      if (addr.isPrimary && filtered.length > 0) {
        filtered[0] = { ...filtered[0], isPrimary: true }
      }
      return filtered
    })
    toast.success('Endereço removido')
  }

  const setPrimary = (addressId: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isPrimary: addr.id === addressId,
      }))
    )
    toast.success('Endereço principal atualizado')
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
          className="bg-primary text-primary-foreground gap-1 h-8 text-xs"
          onClick={openAddDialog}
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar endereço
        </Button>
      </div>

      {/* Address Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {addresses.map((address) => {
            const Icon = getIconForLabel(address.label)
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
                          <p className="font-semibold text-sm">{address.label}</p>
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
                          <br />
                          CEP: {address.zip}
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
                        >
                          <Star className="h-3.5 w-3.5" />
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
                        className="h-8 w-8"
                        onClick={() => openEditDialog(address)}
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(address.id)}
                        disabled={addresses.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
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
            {/* Apelido */}
            <div className="space-y-1.5">
              <Label htmlFor="addr-label" className="text-sm font-medium">
                Apelido <span className="text-destructive">*</span>
              </Label>
              <Input
                id="addr-label"
                placeholder="Ex: Casa, Trabalho, Mãe..."
                className={`h-10 text-sm ${errors.label ? 'border-destructive' : ''}`}
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
              {errors.label && <p className="text-[10px] text-destructive">{errors.label}</p>}
            </div>

            {/* Rua + Número */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
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
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
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
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 sm:flex-none bg-primary text-primary-foreground"
            >
              <Check className="h-4 w-4 mr-1.5" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
