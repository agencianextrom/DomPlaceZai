'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { z } from 'zod'
import {
  Eye, Package, Tag, Check, Sparkles, Camera, Layers, Save, RotateCcw,
  GripVertical, Hash, DollarSign, Percent, Star, Info, X, Plus, TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { toast } from 'sonner'
import { useAppStore } from '@/store/useAppStore'
import { ImageUpload } from '@/components/ui/ImageUpload'

// --- Zod Validation Schema ---
const productSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  description: z.string().max(1000, 'Descrição muito longa').optional().default(''),
  price: z.coerce.number({ message: 'Preço inválido' }).positive('Preço deve ser maior que zero').max(999999, 'Preço muito alto'),
  comparePrice: z.coerce.number({ message: 'Preço comparativo inválido' }).positive('Deve ser maior que zero').max(999999, 'Preço muito alto').optional().default(0),
  cost: z.coerce.number({ message: 'Custo inválido' }).min(0, 'Custo não pode ser negativo').max(999999, 'Custo muito alto').optional().default(0),
  stock: z.coerce.number({ message: 'Estoque inválido' }).int('Estoque deve ser inteiro').min(0, 'Estoque não pode ser negativo').max(999999, 'Estoque muito alto').optional().default(0),
  sku: z.string().max(50, 'SKU muito longo').optional().default(''),
  category: z.string().min(1, 'Categoria é obrigatória'),
  tags: z.string().max(200, 'Tags muito longas').optional().default(''),
})

type ProductFormErrors = Partial<Record<string, string>>

interface ProductFormData {
  name: string
  description: string
  price: string
  comparePrice: string
  cost: string
  stock: string
  sku: string
  category: string
  tags: string
  variations: string
}

const categories = [
  { value: 'FOOD', label: 'Alimentação' },
  { value: 'HEALTH', label: 'Saúde' },
  { value: 'AGRICULTURE', label: 'Agricultura' },
  { value: 'BEAUTY', label: 'Beleza' },
  { value: 'ELECTRONICS', label: 'Eletrônicos' },
  { value: 'ANIMALS', label: 'Pets' },
  { value: 'HOME_GARDEN', label: 'Casa e Jardim' },
  { value: 'SERVICES', label: 'Serviços' },
  { value: 'FASHION', label: 'Moda' },
  { value: 'SPORTS', label: 'Esportes' },
  { value: 'AUTOMOTIVE', label: 'Automotivo' },
  { value: 'OTHER', label: 'Outros' },
]

const DRAFT_KEY = 'domplace-product-draft'
const AUTO_SAVE_INTERVAL = 5000

const initialForm: ProductFormData = {
  name: '',
  description: '',
  price: '',
  comparePrice: '',
  cost: '',
  stock: '',
  sku: '',
  category: 'FOOD',
  tags: '',
  variations: '',
}

function formatBRL(value: string) {
  const num = parseFloat(value)
  if (isNaN(num)) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
}

// --- Draft Auto-Save Hook ---
function useAutoSaveDraft(form: ProductFormData, images: string[]) {
  const [lastSaved, setLastSaved] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed.savedAt || null
      }
    } catch {
      // ignore
    }
    return null
  })
  const [hasDraft, setHasDraft] = useState(() => {
    try {
      return localStorage.getItem(DRAFT_KEY) !== null
    } catch {
      return false
    }
  })
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-save on change
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const hasContent = form.name.trim() || form.price.trim() || form.description.trim()
      if (hasContent) {
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify({
            ...form,
            images,
            savedAt: new Date().toISOString(),
          }))
          setLastSaved(new Date().toISOString())
          setHasDraft(true)
        } catch {
          // ignore quota errors
        }
      }
    }, AUTO_SAVE_INTERVAL)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [form, images])

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY)
    setHasDraft(false)
    setLastSaved(null)
  }, [])

  const loadDraft = useCallback((): { form: ProductFormData; images: string[] } | null => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (!saved) return null
      const parsed = JSON.parse(saved)
      return {
        form: {
          name: parsed.name || '',
          description: parsed.description || '',
          price: parsed.price || '',
          comparePrice: parsed.comparePrice || '',
          cost: parsed.cost || '',
          stock: parsed.stock || '',
          sku: parsed.sku || '',
          category: parsed.category || 'FOOD',
          tags: parsed.tags || '',
          variations: parsed.variations || '',
        },
        images: parsed.images || [],
      }
    } catch {
      return null
    }
  }, [])

  return { lastSaved, hasDraft, clearDraft, loadDraft }
}

// --- Draggable Image Gallery ---
function DraggableImageGallery({
  images,
  onChange,
}: {
  images: string[]
  onChange: (images: string[]) => void
}) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index)
    onChange(updated)
  }

  if (images.length === 0) return null

  return (
    <Reorder.Group
      axis="x"
      values={images}
      onReorder={onChange}
      className="flex gap-2 overflow-x-auto hide-scrollbar pb-1"
    >
      {images.map((url, index) => (
        <Reorder.Item
          key={`${url}-${index}`}
          value={url}
          className="relative group shrink-0 cursor-grab active:cursor-grabbing"
          onDragStart={() => setDraggedIndex(index)}
          onDragEnd={() => setDraggedIndex(null)}
          whileDrag={{ scale: 1.05, rotate: 2 }}
        >
          <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-colors ${draggedIndex === index ? 'border-primary shadow-lg' : index === 0 ? 'border-primary/50' : 'border-border'} relative`}>
            <img src={url} alt={`Imagem ${index + 1}`} className="h-full w-full object-cover" />
            {/* Position badge */}
            <span className={`absolute top-0.5 left-0.5 px-1 py-0 rounded text-[8px] font-bold ${index === 0 ? 'bg-primary text-primary-foreground' : 'bg-black/60 text-white'}`}>
              {index === 0 ? '★' : index + 1}
            </span>
            {/* Delete button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeImage(index) }}
              className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <X className="h-2.5 w-2.5" />
            </button>
            {/* Drag handle */}
            <div className="absolute bottom-0.5 right-0.5 h-4 w-4 rounded bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  )
}

export function ProductForm() {
  const [form, setForm] = useState<ProductFormData>(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<ProductFormErrors>({})
  const [showPreview, setShowPreview] = useState(true)
  const [productImages, setProductImages] = useState<string[]>([])
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)

  const { lastSaved, hasDraft, clearDraft, loadDraft } = useAutoSaveDraft(form, autoSaveEnabled ? productImages : [])

  const updateField = (field: keyof ProductFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Offer to restore draft on mount
  useEffect(() => {
    if (hasDraft) {
      const draft = loadDraft()
      if (draft && (draft.form.name || draft.form.price || draft.form.description)) {
        const restore = window.confirm('Um rascunho anterior foi encontrado. Deseja restaurá-lo?')
        if (restore) {
          setForm(draft.form)
          setProductImages(draft.images)
          toast.info('Rascunho restaurado')
        } else {
          clearDraft()
        }
      }
    }
  }, [])

  const validate = (): boolean => {
    try {
      productSchema.parse({
        name: form.name,
        description: form.description,
        price: form.price || '0',
        comparePrice: form.comparePrice || '0',
        cost: form.cost || '0',
        stock: form.stock || '0',
        sku: form.sku,
        category: form.category,
        tags: form.tags,
      })
      setErrors({})
      return true
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: ProductFormErrors = {}
        for (const issue of err.issues) {
          const field = issue.path[0]
          if (typeof field === 'string' && field !== 'description' && field !== 'tags') {
            newErrors[field] = issue.message
          }
        }
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Corrija os erros antes de enviar')
      return
    }
    setIsSubmitting(true)
    try {
      const { currentUser } = useAppStore.getState()
      if (!currentUser?.id) {
        toast.error('Você precisa estar logado para criar um produto')
        setIsSubmitting(false)
        return
      }

      const storeRes = await fetch(`/api/stores?accountId=${currentUser.id}&limit=1`)
      const storeData = await storeRes.json()
      const store = storeData.stores?.[0]
      if (!store) {
        toast.error('Nenhuma loja encontrada para sua conta')
        setIsSubmitting(false)
        return
      }

      const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean)
      const variationsArray = form.variations.split(',').map(v => v.trim()).filter(Boolean)

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        cost: form.cost ? parseFloat(form.cost) : null,
        sku: form.sku.trim() || null,
        stock: form.stock ? parseInt(form.stock) : 0,
        category: form.category,
        tags: JSON.stringify(tagsArray),
        variations: variationsArray.length > 0 ? JSON.stringify(variationsArray) : null,
        images: productImages,
        storeId: store.id,
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Erro ao criar produto')
      }

      setIsSubmitting(false)
      setSubmitted(true)
      clearDraft()
      toast.success('Produto criado com sucesso!')
      setTimeout(() => {
        setSubmitted(false)
        setForm(initialForm)
        setProductImages([])
      }, 3000)
    } catch (error: unknown) {
      setIsSubmitting(false)
      const message = error instanceof Error ? error.message : 'Erro ao criar produto'
      toast.error(message)
    }
  }

  const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean)
  const variationsArray = form.variations.split(',').map(v => v.trim()).filter(Boolean)

  const discount = useMemo(() => {
    const price = parseFloat(form.price)
    const compare = parseFloat(form.comparePrice)
    if (isNaN(price) || isNaN(compare) || compare <= price) return 0
    return Math.round(((compare - price) / compare) * 100)
  }, [form.price, form.comparePrice])

  const profitMargin = useMemo(() => {
    const price = parseFloat(form.price)
    const cost = parseFloat(form.cost)
    if (isNaN(price) || isNaN(cost) || price <= 0 || cost <= 0) return 0
    return Math.round(((price - cost) / price) * 100)
  }, [form.price, form.cost])

  const categoryLabel = categories.find(c => c.value === form.category)?.label || 'Outros'

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center mb-4 shadow-lg"
        >
          <Check className="h-10 w-10 text-white" strokeWidth={3} />
        </motion.div>
        <h3 className="text-xl font-bold mb-2">Produto Criado!</h3>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          &ldquo;{form.name}&rdquo; foi adicionado com sucesso ao seu catálogo.
        </p>
        <Button
          variant="outline"
          className="mt-6 gap-2"
          onClick={() => { setSubmitted(false); setForm(initialForm); setProductImages([]) }}
        >
          <Plus className="h-4 w-4" />
          Criar outro produto
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Draft indicator & preview toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {lastSaved && autoSaveEnabled && (
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Save className="h-3 w-3 text-primary" />
              Rascunho salvo
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Switch
              checked={autoSaveEnabled}
              onCheckedChange={setAutoSaveEnabled}
              className="scale-75"
            />
            <span className="text-[10px] text-muted-foreground">Auto-save</span>
          </div>
          <Button variant="outline" size="sm" className="text-xs gap-1 min-h-[44px] min-w-[44px] h-7 sm:hidden" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-3 w-3" />
            {showPreview ? 'Ocultar' : 'Mostrar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Informações do Produto
          </h3>

          {/* Name */}
          <div>
            <Label className="text-xs text-muted-foreground">Nome do produto *</Label>
            <Input
              placeholder="Ex: Açaí 500ml"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-[10px] text-destructive mt-1">{errors.name}</p>}
          </div>

          {/* SKU */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Hash className="h-3 w-3" />
              SKU (Código do produto)
            </Label>
            <Input
              placeholder="Ex: ACAI-500"
              value={form.sku}
              onChange={(e) => updateField('sku', e.target.value)}
              className={errors.sku ? 'border-destructive' : ''}
              maxLength={50}
            />
            {errors.sku && <p className="text-[10px] text-destructive mt-1">{errors.sku}</p>}
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs text-muted-foreground">Descrição</Label>
            <Textarea
              placeholder="Descreva o produto detalhadamente..."
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="resize-none"
              maxLength={1000}
            />
            <p className="text-[10px] text-muted-foreground mt-0.5 text-right">{form.description.length}/1000</p>
          </div>

          {/* Price row */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Preço *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                <Input
                  placeholder="0,00"
                  value={form.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  className={`pl-9 ${errors.price ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.price && <p className="text-[10px] text-destructive mt-1">{errors.price}</p>}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-0.5">
                <Percent className="h-2.5 w-2.5" />
                Comparativo
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                <Input
                  placeholder="0,00"
                  value={form.comparePrice}
                  onChange={(e) => updateField('comparePrice', e.target.value)}
                  className={`pl-9 ${errors.comparePrice ? 'border-destructive' : ''}`}
                />
              </div>
              {discount > 0 && (
                <p className="text-[10px] text-emerald-600 mt-1 font-medium">-{discount}% desconto</p>
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-0.5">
                <DollarSign className="h-2.5 w-2.5" />
                Custo
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                <Input
                  placeholder="0,00"
                  value={form.cost}
                  onChange={(e) => updateField('cost', e.target.value)}
                  className={`pl-9 ${errors.cost ? 'border-destructive' : ''}`}
                />
              </div>
              {profitMargin > 0 && (
                <p className="text-[10px] text-emerald-600 mt-1 font-medium">{profitMargin}% margem</p>
              )}
            </div>
          </div>

          {/* Stock and Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Estoque</Label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="0"
                  type="number"
                  value={form.stock}
                  onChange={(e) => updateField('stock', e.target.value)}
                  className={`pl-9 ${errors.stock ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.stock && <p className="text-[10px] text-destructive mt-1">{errors.stock}</p>}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Categoria *</Label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className={`w-full h-10 rounded-md border ${errors.category ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              {errors.category && <p className="text-[10px] text-destructive mt-1">{errors.category}</p>}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Tags (separadas por vírgula)
            </Label>
            <Input
              placeholder="Ex: orgânico, artesanal, fresco"
              value={form.tags}
              onChange={(e) => updateField('tags', e.target.value)}
            />
            {tagsArray.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {tagsArray.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Variations */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Variações (separadas por vírgula)
            </Label>
            <Input
              placeholder="Ex: 300ml, 500ml, 700ml"
              value={form.variations}
              onChange={(e) => updateField('variations', e.target.value)}
            />
            {variationsArray.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {variationsArray.map((v, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">{v}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
              <Camera className="h-3 w-3" />
              Imagens do produto
            </Label>
            <ImageUpload
              images={productImages}
              onChange={setProductImages}
              maxFiles={5}
              label="Clique ou arraste para enviar imagens"
            />
            <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Arraste as imagens para reordenar. A primeira será a imagem principal.
            </p>
          </div>

          {/* Draggable Image Gallery */}
          {productImages.length > 0 && (
            <DraggableImageGallery
              images={productImages}
              onChange={setProductImages}
            />
          )}

          <Separator />

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              className="flex-1 h-12 bg-primary text-primary-foreground font-semibold btn-glow gap-2"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Criando...
                </div>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Criar Produto
                </>
              )}
            </Button>
            {(form.name.trim() || form.price.trim()) && (
              <Button variant="outline" className="h-12 gap-1" onClick={() => { setForm(initialForm); setProductImages([]); clearDraft(); toast.info('Formulário limpo') }}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </motion.div>

        {/* Preview Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`${showPreview ? '' : 'hidden sm:block'}`}
        >
          <div className="sticky top-36">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
              <Eye className="h-4 w-4 text-primary" />
              Pré-visualização
            </h3>
            <Card className="overflow-hidden border-border/50">
              <CardContent className="p-0">
                {/* Image area */}
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-emerald-100 dark:from-primary/5 dark:to-emerald-900/20 flex items-center justify-center relative overflow-hidden">
                  {productImages.length > 0 ? (
                    <img src={productImages[0]} alt={form.name || 'Preview'} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-16 w-16 rounded-2xl bg-white/70 dark:bg-black/20 flex items-center justify-center shadow-sm">
                      <Package className="h-8 w-8 text-primary/60" />
                    </div>
                  )}

                  {discount > 0 && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0 text-[10px] font-bold">-{discount}%</Badge>
                  )}

                  {productImages.length > 1 && (
                    <Badge className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-medium border-0 backdrop-blur-sm">{productImages.length} fotos</Badge>
                  )}

                  {tagsArray.length > 0 && (
                    <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                      {tagsArray.slice(0, 3).map((tag, i) => (
                        <Badge key={i} className="bg-black/50 text-white text-[8px] px-1.5 py-0 border-0 backdrop-blur-sm">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-[10px] text-muted-foreground">{categoryLabel}</p>
                  <h4 className="font-semibold text-sm mt-0.5 line-clamp-2">{form.name || 'Nome do produto'}</h4>
                  {form.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{form.description}</p>
                  )}

                  {form.sku && (
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono flex items-center gap-0.5"><Hash className="h-2.5 w-2.5" /> {form.sku}</p>
                  )}

                  {variationsArray.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {variationsArray.map((v, i) => (
                        <button key={i} className={`px-2 py-0.5 rounded-md text-[10px] border transition-colors ${i === 0 ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border hover:border-primary/30'}`}>
                          {v}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-lg font-bold text-primary">{formatBRL(form.price)}</span>
                    {form.comparePrice && parseFloat(form.comparePrice) > parseFloat(form.price) && parseFloat(form.price) > 0 && (
                      <span className="text-xs text-muted-foreground line-through">{formatBRL(form.comparePrice)}</span>
                    )}
                  </div>

                  {/* Profit info */}
                  {profitMargin > 0 && (
                    <div className="mt-1.5 flex items-center gap-1">
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20">
                        <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                        {profitMargin}% margem
                      </Badge>
                      {form.cost && parseFloat(form.cost) > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          Lucro: {formatBRL(String(parseFloat(form.price) - parseFloat(form.cost)))}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stock */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${parseInt(form.stock) > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className="text-[10px] text-muted-foreground">
                      {parseInt(form.stock) > 0 ? `${form.stock || '0'} em estoque` : 'Sem estoque'}
                    </span>
                  </div>

                  {/* Rating placeholder */}
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] text-muted-foreground">Novo produto</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
