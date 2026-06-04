'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Star, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Spec row type
interface SpecRow {
  label: string
  value: string
  maxValue?: number
  currentValue?: number
  isHighlight?: boolean
  highlightText?: string
}

// Category-specific spec definitions
const categorySpecs: Record<string, Array<{ label: string; mockValues: string[]; maxVal?: number; unit?: string; highlight?: boolean }>> = {
  FOOD: [
    { label: 'Peso Líquido', mockValues: ['500g', '1kg', '250ml', '750g', '900ml'], maxVal: 1000, unit: 'g', highlight: false },
    { label: 'Ingredientes', mockValues: ['Arroz, Feijão, Sal', 'Trigo, Ovos, Leite', 'Frutas da Estação', 'Cevada, Lúpulo, Água', 'Soja, Sal, Antioxidante'], highlight: false },
    { label: 'Validade', mockValues: ['12 meses', '6 meses', '90 dias', '3 meses', '24 meses'], maxVal: 24, unit: 'meses', highlight: false },
    { label: 'Informação Nutricional', mockValues: ['170 kcal por 100g', '350 kcal por 100g', '45 kcal por 100ml', '280 kcal por porção', '120 kcal por 100g'], maxVal: 500, unit: 'kcal', highlight: false },
    { label: 'Tipo de Conservação', mockValues: ['Ambiente Seco', 'Refrigerado', 'Congelado', 'Ambiente Fresco', 'Refrigerado após aberto'], highlight: false },
    { label: 'Alérgenos', mockValues: ['Contém Glúten', 'Livre de Lactose', 'Pode conter Nozes', 'Sem Alérgenos Registrados', 'Contém Soja'], highlight: true },
    { label: 'Sabor', mockValues: ['Natural', 'Tradicional', 'Orgânico', 'Premium', 'Zero Açúcar'], highlight: false },
    { label: 'Lote', mockValues: ['L2024-0891', 'L2024-0732', 'L2024-0145', 'L2024-0567', 'L2024-0398'], highlight: false },
  ],
  ELECTRONICS: [
    { label: 'Tensão de Entrada', mockValues: ['110V / 220V', '220V', '5V (USB)', '12V', 'Bivolt Automático'], maxVal: 220, unit: 'V', highlight: true },
    { label: 'Potência', mockValues: ['60W', '1200W', '5W', '500W', '200W'], maxVal: 2000, unit: 'W', highlight: true },
    { label: 'Garantia do Fabricante', mockValues: ['12 meses', '24 meses', '6 meses', '36 meses', '90 dias'], maxVal: 36, unit: 'meses', highlight: true },
    { label: 'Conectividade', mockValues: ['Wi-Fi, Bluetooth 5.0', 'USB-C, HDMI', 'Bluetooth 5.3', 'Wi-Fi 6', '4G LTE'], highlight: false },
    { label: 'Resolução', mockValues: ['1920x1080 (Full HD)', '3840x2160 (4K)', '1280x720 (HD)', '2560x1440 (QHD)', '1080x2400 (FHD+)'], maxVal: 3840, unit: 'px', highlight: false },
    { label: 'Capacidade de Armazenamento', mockValues: ['128GB', '256GB', '64GB', '512GB', '1TB'], maxVal: 1000, unit: 'GB', highlight: false },
    { label: 'Tipo de Bateria', mockValues: ['Li-ion 4000mAh', 'Li-Po 3000mAh', 'Li-ion 5000mAh', 'Li-Po 2000mAh', 'Li-ion 6000mAh'], maxVal: 6000, unit: 'mAh', highlight: false },
    { label: 'Cor', mockValues: ['Preto', 'Branco', 'Prata', 'Azul', 'Rose Gold'], highlight: false },
  ],
  HEALTH: [
    { label: 'Dosagem Recomendada', mockValues: ['1 cápsula/dia', '2 comprimidos/dia', '10ml/dia', '1 sachê/dia', '3 gotas 2x/dia'], highlight: true },
    { label: 'Registro ANVISA', mockValues: ['MS 6.5238.0012.001-4', 'MS 1.2345.0067.001-1', 'MS 8.9012.0034.002-7', 'MS 3.4567.0089.001-3', 'MS 5.6789.0023.001-9'], highlight: true },
    { label: 'Princípio Ativo', mockValues: ['Vitamina C (Ácido Ascórbico)', 'Paracetamol 500mg', 'Ibuprofeno 400mg', 'Dipirona 500mg', 'Ômega 3 (EPA + DHA)'], highlight: false },
    { label: 'Forma Farmacêutica', mockValues: ['Cápsula Gelatinosa', 'Comprimido Revestido', 'Xarope', 'Solução Oral', 'Pó para Suspensão'], highlight: false },
    { label: 'Quantidade por Embalagem', mockValues: ['60 cápsulas', '30 comprimidos', '120ml', '20 sachês', '10 ampolas'], maxVal: 60, unit: 'un', highlight: false },
    { label: 'Indicação', mockValues: ['Suplemento Vitamínico', 'Analgésico / Antitérmico', 'Anti-inflamatório', 'Imunidade', 'Controle de Colesterol'], highlight: false },
    { label: 'Contraindicações', mockValues: ['Gestantes e lactantes', 'Menores de 12 anos', 'Alergia ao princípio ativo', 'Pacientes com úlcera', 'Pacientes renais crônicos'], highlight: true },
    { label: 'Laboratório', mockValues: ['Farm. São Paulo', 'Vitamed', 'Eurofarma', 'Medley', 'Bayer'], highlight: false },
  ],
}

// Generic fallback specs
const genericSpecs = [
  { label: 'Material', mockValues: ['Plástico Reciclável', 'Alumínio', 'Vidro', 'Aço Inox', 'Madeira Certificada'], highlight: false },
  { label: 'Dimensões', mockValues: ['20x15x10cm', '30x20x8cm', '15x15x25cm', '25x18x5cm', '40x30x20cm'], highlight: false },
  { label: 'Peso', mockValues: ['200g', '500g', '1.2kg', '350g', '800g'], maxVal: 1200, unit: 'g', highlight: false },
  { label: 'Cor Principal', mockValues: ['Preto', 'Branco', 'Azul', 'Verde', 'Vermelho'], highlight: false },
  { label: 'Garantia', mockValues: ['3 meses', '6 meses', '12 meses', '24 meses', 'Sem garantia'], maxVal: 24, unit: 'meses', highlight: true },
  { label: 'Fabricante', mockValues: ['Indústria Brasileira', 'Importado', 'Artesanal', 'Cooperativa Local', 'Premium'], highlight: false },
  { label: 'Certificações', mockValues: ['ISO 9001', 'INMETRO', 'CE', 'FSC', 'Orgânico Certificado'], highlight: true },
  { label: 'Modelo', mockValues: ['Standard', 'Pro', 'Premium', 'Basic', 'Ultra'], highlight: false },
]

// Deterministic hash from string to index
function hashStr(s: string): number {
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return Math.abs(hash)
}

// Generate mock specs for a category/product
function generateSpecs(category: string, productName: string): SpecRow[] {
  const specDefs = categorySpecs[category] || genericSpecs
  const nameHash = hashStr(productName)

  return specDefs.map((def, idx) => {
    const mockIdx = (nameHash + idx) % def.mockValues.length
    const value = def.mockValues[mockIdx]
    const spec: SpecRow = {
      label: def.label,
      value,
      isHighlight: def.highlight || false,
    }

    if (def.maxVal) {
      const numMatch = value.match(/[\d,.]+/)
      if (numMatch) {
        const num = parseFloat(numMatch[0].replace(',', '.'))
        if (!isNaN(num)) {
          spec.currentValue = num
          spec.maxValue = def.maxVal
        }
      }
    }

    if (def.highlight) {
      spec.highlightText = value.length > 20 ? value.slice(0, 20) + '...' : value
    }

    return spec
  })
}

// Visual percentage bar for comparison
function SpecValueBar({ current, max }: { current: number; max: number }) {
  const pct = Math.min((current / max) * 100, 100)
  return (
    <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, delay: 0.1, type: 'spring' as const, stiffness: 200, damping: 20 }}
      />
    </div>
  )
}

interface ProductSpecsTableProps {
  category: string
  specs?: SpecRow[]
  productName?: string
}

export function ProductSpecsTable({ category, specs: propSpecs, productName }: ProductSpecsTableProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [loadedRows, setLoadedRows] = useState(0)

  const specs = useMemo(() => {
    if (propSpecs && propSpecs.length > 0) return propSpecs
    return generateSpecs(category, productName || category)
  }, [propSpecs, category, productName])

  // Staggered row loading
  useMemo(() => {
    setLoadedRows(isExpanded ? specs.length : 4)
  }, [isExpanded, specs.length])

  const displaySpecs = isExpanded ? specs : specs.slice(0, 4)
  const hasMore = specs.length > 4

  return (
    <div className="r28-specs-table">
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Info className="h-4 w-4 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold">Especificações Técnicas</h3>
              <p className="text-[10px] text-muted-foreground">
                {specs.length} especificações · {category.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
          >
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </motion.div>
        </button>

        {/* Specs table body */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isExpanded ? 'expanded' : 'collapsed'}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/30">
              {displaySpecs.map((spec, idx) => (
                <motion.div
                  key={spec.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: idx * 0.04,
                    type: 'spring' as const,
                    stiffness: 300,
                    damping: 25,
                  }}
                  className={`flex items-start gap-3 px-4 py-3 text-sm border-b border-border/20 last:border-b-0 transition-colors hover:bg-primary/[0.03] ${
                    idx % 2 === 0 ? 'bg-background/50' : 'bg-muted/20'
                  }`}
                >
                  {/* Label column */}
                  <div className="w-1/3 shrink-0">
                    <span className="text-xs font-medium text-muted-foreground">
                      {spec.label}
                    </span>
                  </div>

                  {/* Value column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold">{spec.value}</span>

                      {/* Highlight badge */}
                      {spec.isHighlight && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 + idx * 0.04, type: 'spring' as const, stiffness: 400, damping: 20 }}
                        >
                          <Badge className="text-[8px] px-1.5 py-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold gap-0.5">
                            <Star className="h-2.5 w-2.5" />
                            Destaque
                          </Badge>
                        </motion.span>
                      )}
                    </div>

                    {/* Value comparison bar */}
                    {spec.currentValue !== undefined && spec.maxValue !== undefined && spec.maxValue > 0 && (
                      <SpecValueBar current={spec.currentValue} max={spec.maxValue} />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Expand/Collapse toggle */}
            {hasMore && (
              <div className="border-t border-border/30 p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full h-8 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg gap-1"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5" />
                      Mostrar menos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" />
                      Ver todas as {specs.length} especificações
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ProductSpecsTable
