'use client'

import { useState, useMemo } from 'react'
import {
  ImagePlus, Upload, X, Eye, Package, DollarSign, Tag, Hash,
  Check, Sparkles, Camera, Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface ProductFormData {
  name: string
  description: string
  price: string
  comparePrice: string
  stock: string
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

const initialForm: ProductFormData = {
  name: '',
  description: '',
  price: '',
  comparePrice: '',
  stock: '',
  category: 'FOOD',
  tags: '',
  variations: '',
}

function formatBRL(value: string) {
  const num = parseFloat(value)
  if (isNaN(num)) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
}

export function ProductForm() {
  const [form, setForm] = useState<ProductFormData>(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({})
  const [showPreview, setShowPreview] = useState(true)

  const updateField = (field: keyof ProductFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {}
    if (!form.name.trim()) newErrors.name = 'Nome é obrigatório'
    if (!form.price.trim() || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
      newErrors.price = 'Preço válido é obrigatório'
    }
    if (form.comparePrice && (isNaN(parseFloat(form.comparePrice)) || parseFloat(form.comparePrice) <= 0)) {
      newErrors.comparePrice = 'Preço de comparação inválido'
    }
    if (form.stock && (isNaN(parseInt(form.stock)) || parseInt(form.stock) < 0)) {
      newErrors.stock = 'Estoque inválido'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setSubmitted(true)
    toast.success('Produto criado com sucesso!')
    setTimeout(() => {
      setSubmitted(false)
      setForm(initialForm)
    }, 3000)
  }

  const tagsArray = form.tags
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)

  const variationsArray = form.variations
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)

  const discount = useMemo(() => {
    const price = parseFloat(form.price)
    const compare = parseFloat(form.comparePrice)
    if (isNaN(price) || isNaN(compare) || compare <= price) return 0
    return Math.round(((compare - price) / compare) * 100)
  }, [form.price, form.comparePrice])

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
        <h3 className="text-xl font-bold mb-2">Produto Criado! 🎉</h3>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          &ldquo;{form.name}&rdquo; foi adicionado com sucesso ao seu catálogo.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mobile preview toggle */}
      <div className="sm:hidden">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs gap-2"
          onClick={() => setShowPreview(!showPreview)}
        >
          <Eye className="h-3 w-3" />
          {showPreview ? 'Ocultar pré-visualização' : 'Mostrar pré-visualização'}
        </Button>
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

          {/* Description */}
          <div>
            <Label className="text-xs text-muted-foreground">Descrição</Label>
            <Textarea
              placeholder="Descreva o produto..."
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Price row */}
          <div className="grid grid-cols-2 gap-3">
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
              <Label className="text-xs text-muted-foreground">Preço comparativo</Label>
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
                <p className="text-[10px] text-emerald-600 mt-1 font-medium">-{discount}% de desconto</p>
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
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Categoria</Label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
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
                  <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {tag}
                  </Badge>
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
                  <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
                    {v}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Image upload placeholder */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Imagens</Label>
            <motion.div
              whileHover={{ borderColor: 'oklch(0.45 0.1 155)' }}
              className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => toast.info('Upload de imagens em breve!')}
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Clique ou arraste para enviar</p>
              <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG até 5MB</p>
            </motion.div>
          </div>

          <Separator />

          {/* Submit */}
          <Button
            className="w-full h-12 bg-primary text-primary-foreground font-semibold btn-glow gap-2"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Criando produto...
              </div>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Criar Produto
              </>
            )}
          </Button>
        </motion.div>

        {/* Preview Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`${showPreview ? '' : 'hidden sm:block'}`}
        >
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
            <Eye className="h-4 w-4 text-primary" />
            Pré-visualização
          </h3>
          <Card className="overflow-hidden border-border/50">
            <CardContent className="p-0">
              {/* Image area */}
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-emerald-100 dark:from-primary/5 dark:to-emerald-900/20 flex items-center justify-center relative">
                <div className="h-16 w-16 rounded-2xl bg-white/70 dark:bg-black/20 flex items-center justify-center shadow-sm">
                  <Package className="h-8 w-8 text-primary/60" />
                </div>

                {/* Discount badge */}
                {discount > 0 && (
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0 text-[10px] font-bold">
                    -{discount}%
                  </Badge>
                )}

                {/* Tags overlay */}
                {tagsArray.length > 0 && (
                  <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                    {tagsArray.slice(0, 3).map((tag, i) => (
                      <Badge key={i} className="bg-black/50 text-white text-[8px] px-1.5 py-0 border-0 backdrop-blur-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Info area */}
              <div className="p-3">
                <p className="text-[10px] text-muted-foreground">{categoryLabel}</p>
                <h4 className="font-semibold text-sm mt-0.5 line-clamp-2">
                  {form.name || 'Nome do produto'}
                </h4>
                {form.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{form.description}</p>
                )}

                {/* Variations */}
                {variationsArray.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {variationsArray.map((v, i) => (
                      <button
                        key={i}
                        className={`px-2 py-0.5 rounded-md text-[10px] border transition-colors ${i === 0 ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border hover:border-primary/30'}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-lg font-bold text-primary">
                    {formatBRL(form.price)}
                  </span>
                  {form.comparePrice && parseFloat(form.comparePrice) > parseFloat(form.price) && parseFloat(form.price) > 0 && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatBRL(form.comparePrice)}
                    </span>
                  )}
                </div>

                {/* Stock indicator */}
                <div className="flex items-center gap-2 mt-2">
                  <div className={`h-1.5 w-1.5 rounded-full ${parseInt(form.stock) > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span className="text-[10px] text-muted-foreground">
                    {parseInt(form.stock) > 0 ? `${form.stock || '0'} em estoque` : 'Sem estoque'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
