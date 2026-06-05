'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, ChevronUp, Clock, HelpCircle, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface InstallationStep {
  id: string
  title: string
  description: string
  emoji: string
  estimatedTime: string
  tips: string[]
}

interface InstallationGuide {
  category: string
  title: string
  steps: InstallationStep[]
}

const guides: Record<string, InstallationGuide> = {
  ELECTRONICS: {
    category: 'ELECTRONICS',
    title: 'Guia de Instalação — Eletrônicos',
    steps: [
      { id: 'e1', title: 'Desembale com Cuidado', description: 'Retire o produto da caixa com cuidado. Verifique se todos os acessórios estão presentes conforme o manual.', emoji: '📦', estimatedTime: '3 min', tips: ['Guarde a caixa e nota fiscal por 30 dias para possível devolução.', 'Verifique se não há danos visíveis antes de ligar.'] },
      { id: 'e2', title: 'Conecte na Energia', description: 'Plug o cabo de alimentação na tomada. Certifique-se de que a voltagem do produto é compatível (110V ou 220V).', emoji: '🔌', estimatedTime: '2 min', tips: ['Não use extensões sobrecarregadas.', 'Se necessário, use um estabilizador de voltagem.'] },
      { id: 'e3', title: 'Configuração Inicial', description: 'Ligue o aparelho e siga as instruções de configuração na tela. Selecione idioma, Wi-Fi e outras preferências.', emoji: '⚙️', estimatedTime: '5 min', tips: ['Conecte ao Wi-Fi para receber atualizações.', 'Crie uma conta se o aparelho requerer.'] },
      { id: 'e4', title: 'Teste de Funcionamento', description: 'Teste todas as funcionalidades principais do aparelho. Verifique som, imagem, conectividade e botões.', emoji: '✅', estimatedTime: '5 min', tips: ['Teste cada entrada HDMI/USB.', 'Ajuste brilho e volume ao seu gosto.'] },
      { id: 'e5', title: 'Organize os Cabos', description: 'Organize os cabos usando presilhas ou canaletas. Mantenha a área ventilada e longe de fontes de calor.', emoji: '🔧', estimatedTime: '10 min', tips: ['Não dobre cabos excessivamente.', 'Deixe espaço para ventilação traseira.'] },
    ],
  },
  FURNITURE: {
    category: 'FURNITURE',
    title: 'Guia de Instalação — Móveis',
    steps: [
      { id: 'f1', title: 'Organize as Peças', description: 'Separe todas as peças e parafusos em grupos. Consulte o manual para identificar cada componente.', emoji: '📦', estimatedTime: '5 min', tips: ['Use um pano ou tapete para não riscar as peças.', 'Verifique se todas as peças estão presentes.'] },
      { id: 'f2', title: 'Ferramentas Necessárias', description: 'Tenha em mãos: chave Allen, chave Phillips, martelo de borracha e nível. Algumas peças podem precisar de cola.', emoji: '🛠️', estimatedTime: '2 min', tips: ['A cola de madeira ajuda a dar mais firmeza.', 'Use o nível para garantir alinhamento.'] },
      { id: 'f3', title: 'Monte a Estrutura', description: 'Comece montando a estrutura principal seguindo a sequência do manual. Não aperte os parafusos totalmente ainda.', emoji: '🔨', estimatedTime: '20 min', tips: ['Monte sobre superfície plana.', 'Peça ajuda para peças grandes.'] },
      { id: 'f4', title: 'Fixação Final', description: 'Após montar, ajuste e aperte todos os parafusos firmemente. Verifique estabilidade e nível.', emoji: '🔩', estimatedTime: '10 min', tips: ['Balance o móvel para testar estabilidade.', 'Adicione calços se necessário.'] },
      { id: 'f5', title: 'Acabamento', description: 'Limpe o móvel com pano seco. Aplique cera ou polidor se necessário. Posicione no local desejado.', emoji: '✨', estimatedTime: '5 min', tips: ['Use feltros nos pés para proteger o piso.', 'Evite exposição direta ao sol.'] },
    ],
  },
  APPLIANCES: {
    category: 'APPLIANCES',
    title: 'Guia de Instalação — Eletrodomésticos',
    steps: [
      { id: 'a1', title: 'Verifique o Local', description: 'Meça o espaço onde o aparelho será instalado. Certifique-se de que há ventilação adequada.', emoji: '📐', estimatedTime: '3 min', tips: ['Deixe pelo menos 5cm de espaço nas laterais.', 'O piso deve ser nivelado.'] },
      { id: 'a2', title: 'Instalação Elétrica', description: 'Verifique se a tomada é exclusiva para o eletrodoméstico. Para chuveiros, verifique a bitola da fiação.', emoji: '⚡', estimatedTime: '5 min', tips: ['Eletrodomésticos potentes precisam de tomada dedicada.', 'Desligue a chave geral antes de conectar.'] },
      { id: 'a3', title: 'Conexões de Água/Gás', description: 'Para produtos com água ou gás, verifique as conexões. Use fita veda-rosca para evitar vazamentos.', emoji: '💧', estimatedTime: '10 min', tips: ['Teste vazamentos com água e sabão.', 'Recomendamos contratar um profissional para gás.'] },
      { id: 'a4', title: 'Primeiro Uso', description: 'Antes de usar normalmente, faça um ciclo de teste vazio. Para geladeiras, espere 2h antes de colocar alimentos.', emoji: '🔄', estimatedTime: '15 min', tips: ['Geladeira: espere estabilizar a temperatura.', 'Máquina de lavar: limpe o tambor com pano úmido.'] },
      { id: 'a5', title: 'Ajuste Fino', description: 'Ajuste pés niveladores, verifique portas e gavetas. Configure temperatura e funções desejadas.', emoji: '🎯', estimatedTime: '5 min', tips: ['Use um nível de bolha para os pés.', 'Consulte o manual para temperaturas ideais.'] },
      { id: 'a6', title: 'Manutenção Preventiva', description: 'Anotar a data de instalação para controle de garantia. Agende limpeza periódica conforme manual.', emoji: '📅', estimatedTime: '2 min', tips: ['Registre o produto no site do fabricante.', 'Faça limpeza mensal do filtro.'] },
    ],
  },
  HOME_GARDEN: {
    category: 'HOME_GARDEN',
    title: 'Guia de Instalação — Casa e Jardim',
    steps: [
      { id: 'h1', title: 'Preparação do Ambiente', description: 'Limpe e prepare o local onde o produto será instalado. Verifique medidas e posição ideal.', emoji: '🏠', estimatedTime: '5 min', tips: ['Meça o espaço com antecedência.', 'Proteja móveis próximos com plástico.'] },
      { id: 'h2', title: 'Ferramentas Básicas', description: 'Reúna ferramentas: fita métrica, lápis, nível, furadeira, parafusos e buchas adequados.', emoji: '🔧', estimatedTime: '3 min', tips: ['Use buchas para parede de concreto.', 'Para gesso, use buchas específicas para drywall.'] },
      { id: 'h3', title: 'Fixação', description: 'Marque os pontos de fixação, faça os furos e instale o produto. Use o nível para garantir alinhamento.', emoji: '📌', estimatedTime: '15 min', tips: ['Fure com broca adequada ao material.', 'Não force parafusos.'] },
      { id: 'h4', title: 'Acabamento Final', description: 'Limpe resíduos, verifique fixação e faça os ajustes necessários. Aproveite o novo item!', emoji: '🌟', estimatedTime: '5 min', tips: ['Passe um pano úmido para limpar poeira.', 'Tire fotos do resultado final!'] },
    ],
  },
}

const defaultGuide: InstallationGuide = {
  category: 'DEFAULT',
  title: 'Guia de Instalação',
  steps: [
    { id: 'd1', title: 'Desembale o Produto', description: 'Retire o produto da embalagem com cuidado. Verifique se todos os itens estão presentes.', emoji: '📦', estimatedTime: '3 min', tips: ['Guarde a nota fiscal.', 'Verifique condições do produto.'] },
    { id: 'd2', title: 'Leia as Instruções', description: 'Consulte o manual do produto para instruções específicas de montagem e uso.', emoji: '📖', estimatedTime: '5 min', tips: ['Manuais também estão disponíveis online.', 'Tire fotos das instruções para referência.'] },
    { id: 'd3', title: 'Montagem/Instalação', description: 'Siga as instruções passo a passo para montar ou instalar o produto corretamente.', emoji: '🔨', estimatedTime: '10 min', tips: ['Peça ajuda se necessário.', 'Não pule etapas.'] },
    { id: 'd4', title: 'Teste e Aproveite', description: 'Teste o produto e certifique-se de que tudo funciona corretamente. Aproveite sua compra!', emoji: '🎉', estimatedTime: '3 min', tips: ['Contate a loja se tiver problemas.', 'Deixe sua avaliação no app.'] },
  ],
}

const categoryLabels: Record<string, string> = {
  ELECTRONICS: 'Eletrônicos',
  FURNITURE: 'Móveis',
  APPLIANCES: 'Eletrodomésticos',
  HOME_GARDEN: 'Casa e Jardim',
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => setDisplay(value), 50)
    return () => clearTimeout(timer)
  }, [value])
  return <span>{display}</span>
}

export function ProductInstallationGuide({ category }: { category: string }) {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [expandedTips, setExpandedTips] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [direction, setDirection] = useState(1)

  const guide = guides[category] || defaultGuide

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const totalSteps = guide.steps.length
  const completedCount = completedSteps.size
  const completionPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0
  const totalEstimatedTime = guide.steps.reduce((acc, s) => {
    const match = s.estimatedTime.match(/(\d+)/)
    return acc + (match ? parseInt(match[1], 10) : 0)
  }, 0)

  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev => {
      const next = new Set(prev)
      if (next.has(stepId)) {
        next.delete(stepId)
      } else {
        next.add(stepId)
      }
      return next
    })
  }

  const toggleTips = (stepId: string) => {
    setExpandedTips(prev => {
      const next = new Set(prev)
      if (next.has(stepId)) {
        next.delete(stepId)
      } else {
        next.add(stepId)
      }
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border/50 p-4 space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-32" />
        <div className="space-y-2 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            {guide.title}
          </h3>
          <Badge variant="secondary" className="text-[9px]">
            {categoryLabels[category] || 'Geral'}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' as const }}
              />
            </div>
          </div>
          <span className="text-xs font-bold text-primary">
            <AnimatedNumber value={completionPercent} />%
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            ~{totalEstimatedTime} min total
          </span>
          <span>
            {completedCount}/{totalSteps} concluídos
          </span>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Steps */}
      <div className="p-4 pt-3">
        <div className="space-y-3">
          {guide.steps.map((step, stepIdx) => {
            const isCompleted = completedSteps.has(step.id)
            const isExpanded = expandedTips.has(step.id)

            return (
              <AnimatePresence key={step.id} mode="popLayout">
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: stepIdx * 0.05, duration: 0.25 }}
                  className={`rounded-lg border transition-all duration-200 ${
                    isCompleted
                      ? 'border-emerald-300/50 bg-emerald-50/30 dark:border-emerald-800/30 dark:bg-emerald-900/10'
                      : 'border-border/50 bg-muted/30'
                  }`}
                >
                  <div className="flex items-start gap-3 p-3">
                    {/* Step indicator */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="relative shrink-0"
                    >
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
                          isCompleted
                            ? 'bg-emerald-500 shadow-sm'
                            : 'bg-muted'
                        }`}
                      >
                        {isCompleted ? (
                          <motion.div
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                          >
                            <Check className="h-5 w-5 text-white" />
                          </motion.div>
                        ) : (
                          <span className={`text-lg ${isCompleted ? 'opacity-0' : ''}`}>{step.emoji}</span>
                        )}
                      </div>
                      {stepIdx < totalSteps - 1 && (
                        <div className={`absolute left-1/2 top-full w-0.5 h-3 -translate-x-1/2 mt-0.5 ${
                          isCompleted ? 'bg-emerald-400/60' : 'bg-border/60'
                        }`} />
                      )}
                    </motion.div>

                    {/* Step content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={`text-sm font-semibold leading-tight ${isCompleted ? 'text-emerald-700 dark:text-emerald-400' : ''}`}>
                            {stepIdx + 1}. {step.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {step.description}
                          </p>
                        </div>

                        {/* Time badge */}
                        <span className="shrink-0 text-[9px] font-medium bg-muted px-1.5 py-0.5 rounded text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {step.estimatedTime}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-2">
                        {/* Complete toggle */}
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleStep(step.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all duration-200 ${
                            isCompleted
                              ? 'bg-emerald-500 text-white'
                              : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                          }`}
                        >
                          <div className={`h-3 w-3 rounded-full border-2 flex items-center justify-center transition-all ${
                            isCompleted ? 'border-white bg-white' : 'border-current'
                          }`}>
                            {isCompleted && (
                              <Check className="h-2 w-2 text-emerald-500" />
                            )}
                          </div>
                          {isCompleted ? 'Concluído' : 'Marcar como concluído'}
                        </motion.button>

                        {/* Tips toggle */}
                        {step.tips.length > 0 && (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleTips(step.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] text-muted-foreground hover:bg-muted/60 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                            Dicas ({step.tips.length})
                          </motion.button>
                        )}
                      </div>

                      {/* Tips accordion */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 space-y-1.5 pl-1 border-l-2 border-primary/20">
                              {step.tips.map((tip, tipIdx) => (
                                <motion.p
                                  key={tipIdx}
                                  initial={{ x: -10, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: tipIdx * 0.05 }}
                                  className="text-[10px] text-muted-foreground leading-relaxed flex items-start gap-1.5"
                                >
                                  <span className="text-primary mt-0.5 shrink-0">•</span>
                                  {tip}
                                </motion.p>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )
          })}
        </div>

        {/* Completion celebration */}
        {completionPercent === 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
            className="mt-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/15 dark:to-teal-900/15 rounded-xl p-3 border border-emerald-200/50 dark:border-emerald-800/30 text-center"
          >
            <p className="text-lg mb-1">🎉</p>
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Instalação concluída!</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Parabéns! Você concluiu todos os passos.</p>
          </motion.div>
        )}

        {/* Help CTA */}
        <div className="mt-4 p-3 bg-muted/40 rounded-xl flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <HelpCircle className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold">Precisa de ajuda?</p>
            <p className="text-[10px] text-muted-foreground">Entre em contato com nosso suporte técnico</p>
          </div>
          <Button size="sm" className="min-h-[44px] text-[10px] bg-primary hover:bg-primary/90 text-primary-foreground px-3">
            Contato
          </Button>
        </div>
      </div>
    </div>
  )
}
