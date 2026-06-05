'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  Package,
  Wrench,
  Hammer,
  CircleCheck,
  Eye,
  EyeOff,
  Trophy,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ConfettiBurst } from '@/components/ui/ConfettiBurst'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Difficulty = 'fácil' | 'moderado' | 'avançado'

type CalloutType = 'dica' | 'atenção' | 'perigo'

interface Tip {
  text: string
  type: CalloutType
}

interface MaterialItem {
  id: string
  name: string
  emoji: string
  optional?: boolean
}

interface SetupStep {
  id: string
  title: string
  description: string
  emoji: string
  estimatedMinutes: number
  difficulty: Difficulty
  tips: Tip[]
  materials: MaterialItem[]
  details: string
  videoThumbnail?: string
}

interface SetupGuide {
  id: string
  title: string
  subtitle: string
  category: string
  emoji: string
  totalEstimatedMinutes: number
  steps: SetupStep[]
}

/* ------------------------------------------------------------------ */
/*  Mock Data — 3 Guias de Instalação                                  */
/* ------------------------------------------------------------------ */

const SETUP_GUIDES: SetupGuide[] = [
  {
    id: 'estante',
    title: 'Montagem de Estante',
    subtitle: 'Guia completo para montar sua estante modular de forma segura',
    category: 'Móveis',
    emoji: '🗄️',
    totalEstimatedMinutes: 45,
    steps: [
      {
        id: 'est-1',
        title: 'Desembalar e Organizar Peças',
        description:
          'Retire todas as peças da embalagem e organize-as sobre um tapete ou cobertor para evitar riscos. Confira o inventário com o manual.',
        emoji: '📦',
        estimatedMinutes: 8,
        difficulty: 'fácil',
        tips: [
          { text: 'Tire foto de cada peça solta para referência futura caso precise identificar peças sobressalentes.', type: 'dica' },
          { text: 'Verifique se todas as peças e parafusos estão presentes antes de começar a montagem.', type: 'atenção' },
          { text: 'Não descarte a embalagem até concluir a montagem — ela será necessária em caso de devolução.', type: 'dica' },
        ],
        materials: [
          { id: 'm1', name: 'Tapete ou cobertor', emoji: '🧹' },
          { id: 'm2', name: 'Fita adesiva para marcar grupos de parafusos', emoji: '📎' },
          { id: 'm3', name: 'Manual de instruções', emoji: '📖' },
        ],
        details:
          'Separe os parafusos em potes ou copos plásticos por tamanho. As prateleiras devem ser agrupadas por tipo. Verifique se há madeira compensada, MDF ou metal no kit e se os acabamentos estão intactos. Caso perceba riscos profundos, entre em contato com o suporte antes de iniciar.',
      },
      {
        id: 'est-2',
        title: 'Montar a Estrutura Base',
        description:
          'Inicie montando a estrutura base lateral. Use os parafusos longos para as conexões principais e não aperte totalmente ainda.',
        emoji: '🔨',
        estimatedMinutes: 15,
        difficulty: 'moderado',
        tips: [
          { text: 'Use o nível de bolha para garantir que a base está perfeitamente horizontal antes de continuar.', type: 'dica' },
          { text: 'Não force parafusos. Se não entrarem facilmente, verifique se os furos estão alinhados.', type: 'atenção' },
          { text: 'Evite montar sobre carpete grosso — a superfície instável pode desalinhar a estrutura.', type: 'perigo' },
        ],
        materials: [
          { id: 'm4', name: 'Chave Allen (inclusa)', emoji: '🔧' },
          { id: 'm5', name: 'Chave Phillips', emoji: '🔩' },
          { id: 'm6', name: 'Martelo de borracha', emoji: '🔨' },
          { id: 'm7', name: 'Nível de bolha', emoji: '📐' },
        ],
        details:
          'Posicione os painéis laterais no chão. Conecte a prateleira inferior usando os suportes em L. Inicie os parafusos com os dedos antes de usar a chave, para evitar cross-threading. Deixe cada parafuso com 1-2 voltas soltas para ajuste final.',
      },
      {
        id: 'est-3',
        title: 'Fixar Prateleiras Intermediárias',
        description:
          'Encaixe os suportes de prateleira nos furos pré-perfurados e insira as prateleiras. Verifique o nivelamento a cada inserção.',
        emoji: '📏',
        estimatedMinutes: 10,
        difficulty: 'moderado',
        tips: [
          { text: 'Distribua o peso dos itens pesados entre as prateleiras inferiores para maior estabilidade.', type: 'dica' },
          { text: 'Se uma prateleira balançar, verifique se os suportes estão firmemente encaixados.', type: 'atenção' },
        ],
        materials: [
          { id: 'm4', name: 'Chave Allen (inclusa)', emoji: '🔧' },
          { id: 'm5', name: 'Chave Phillips', emoji: '🔩' },
        ],
        details:
          'Os suportes de metal devem entrar nos furos até o fundo. Se sentir resistência, gire levemente. Para estantes com mais de 5 prateleiras, é recomendável fixar um suporte central adicional em prateleiras que suportarão mais de 15 kg.',
      },
      {
        id: 'est-4',
        title: 'Aperto Final e Estabilidade',
        description:
          'Aperte todos os parafusos firmemente na sequência inversa da montagem. Teste a estabilidade empurrando levemente a estante.',
        emoji: '✅',
        estimatedMinutes: 7,
        difficulty: 'fácil',
        tips: [
          { text: 'Parafuse em padrão de estrela (cruz) para distribuir a pressão uniformemente.', type: 'dica' },
          { text: 'Fixe a estante à parede se ela tiver mais de 1,5m de altura — isso é obrigatório por segurança.', type: 'perigo' },
        ],
        materials: [
          { id: 'm8', name: 'Kit fixação parede (parafusos + buchas)', emoji: '🪛', optional: true },
          { id: 'm9', name: 'Feltros protetores de piso', emoji: '🟤' },
        ],
        details:
          'Comece pelos parafusos dos cantos e vá para o centro. Após apertar todos, sacuda suavemente a estante. Se houver rangido, identifique qual conexão está solta. Para fixação na parede, use buchas de nylon 8mm e parafusos de 60mm em concreto.',
      },
      {
        id: 'est-5',
        title: 'Acabamento e Organização',
        description:
          'Limpe eventuais marcas de dedo, aplique feltros nos pés e comece a organizar seus itens. Parabéns pelo trabalho!',
        emoji: '✨',
        estimatedMinutes: 5,
        difficulty: 'fácil',
        tips: [
          { text: 'Passe um pano úmido com detergente neutro para remover poeira de montagem.', type: 'dica' },
          { text: 'Coloque os itens mais pesados nas prateleiras mais baixas.', type: 'dica' },
        ],
        materials: [
          { id: 'm10', name: 'Pano macio', emoji: '🧽' },
          { id: 'm9', name: 'Feltros protetores de piso', emoji: '🟤' },
        ],
        details:
          'Verifique se não há rebarbas ou cantos afiados. Aplique cera para madeira se desejar um brilho extra. Tire fotos do resultado final e avalie o produto na DomPlace!',
      },
    ],
  },
  {
    id: 'ar-condicionado',
    title: 'Instalação de Ar-condicionado',
    subtitle: 'Guia de instalação passo a passo para ar-condicionado split',
    category: 'Eletrodomésticos',
    emoji: '❄️',
    totalEstimatedMinutes: 90,
    steps: [
      {
        id: 'ac-1',
        title: 'Preparação do Local',
        description:
          'Escolha o local ideal para a unidade interna e externa. Verifique a distância máxima entre elas e a disponibilidade de dreno.',
        emoji: '🏠',
        estimatedMinutes: 15,
        difficulty: 'fácil',
        tips: [
          { text: 'A unidade interna deve ficar a pelo menos 2,3m do chão e longe de fontes de calor.', type: 'dica' },
          { text: 'Verifique se a parede suporta o peso do equipamento — consulte um engenheiro se necessário.', type: 'atenção' },
          { text: 'Nunca instale em áreas com gás inflamável ou poeira excessiva.', type: 'perigo' },
        ],
        materials: [
          { id: 't1', name: 'Fita métrica', emoji: '📏' },
          { id: 't2', name: 'Lápis de carpinteiro', emoji: '✏️' },
          { id: 't3', name: 'Nível de bolha', emoji: '📐' },
        ],
        details:
          'Marque na parede a posição dos furos de fixação com distância exata conforme o template do manual. A unidade externa deve ficar em local ventilado, longe de janelas de quarto e preferencialmente na sombra. Considere o caminho dos tubos de cobre.',
      },
      {
        id: 'ac-2',
        title: 'Instalação do Suporte e Unidade Interna',
        description:
          'Fixe o suporte de parede perfurando e usando buchas apropriadas. Em seguida, encaixe a unidade interna no suporte.',
        emoji: '🔩',
        estimatedMinutes: 25,
        difficulty: 'avançado',
        tips: [
          { text: 'Use broca de 10mm para concreto e buchas de nylon — nunca use buchas de plástico para este peso.', type: 'dica' },
          { text: 'Desligue a chave geral de energia antes de qualquer instalação elétrica.', type: 'perigo' },
          { text: 'A unidade deve ter uma leve inclinação para trás (3-5 graus) para facilitar o dreno.', type: 'dica' },
        ],
        materials: [
          { id: 't4', name: 'Furadeira com broca de concreto', emoji: '🔨' },
          { id: 't5', name: 'Buchas e parafusos de fixação', emoji: '🔩' },
          { id: 't6', name: 'Chave Philips e torquímetro', emoji: '🔧' },
          { id: 't7', name: 'Suporte de parede (incluso)', emoji: '🧱' },
        ],
        details:
          'Perfure 4 furos no padrão do suporte. Insira as buchas até o fundo. Fixe o suporte com parafusos e verifique nivelamento. Levante a unidade com ajuda de outra pessoa (peso médio: 10-15 kg). Conecte os tubos de cobre e o cabo elétrico antes de fixar completamente.',
      },
      {
        id: 'ac-3',
        title: 'Conexão dos Tubos e Fiação',
        description:
          'Conecte os tubos de cobre, cabo de energia e mangueira de dreno entre as unidades interna e externa.',
        emoji: '🔌',
        estimatedMinutes: 20,
        difficulty: 'avançado',
        tips: [
          { text: 'Use fita veda-rosca em todas as conexões de rosca para evitar vazamentos de gás refrigerante.', type: 'dica' },
          { text: 'O cabo de energia deve seguir normas NBR 5410 — se não tem experiência, contrate um eletricista.', type: 'perigo' },
          { text: 'A mangueira de dreno deve ter declive contínuo para evitar acúmulo de água.', type: 'atenção' },
        ],
        materials: [
          { id: 't8', name: 'Fita veda-rosca', emoji: '🩹' },
          { id: 't9', name: 'Isolamento térmico para tubos', emoji: '🧣' },
          { id: 't10', name: 'Cabo de energia adequado (bitola)', emoji: '⚡' },
          { id: 't11', name: 'Mangueira de dreno', emoji: '💧' },
        ],
        details:
          'Conecte o tubo de gás (mais grosso) e o tubo de líquido (mais fino) usando as porcas de conexão. Aplique isolamento térmico em ambos. O cabo deve ter a bitola correta conforme a potência do aparelho. Teste vazamentos com espuma de sabão antes de finalizar.',
      },
      {
        id: 'ac-4',
        title: 'Fixação da Unidade Externa',
        description:
          'Instale a unidade externa no suporte externo ou laje. Garanta boa ventilação e fixação firme.',
        emoji: '🏗️',
        estimatedMinutes: 20,
        difficulty: 'avançado',
        tips: [
          { text: 'A unidade externa nunca deve ficar em ambiente fechado — precisa de fluxo de ar livre.', type: 'atenção' },
          { text: 'Para andares altos, use cinto de segurança e considere contratar um profissional.', type: 'perigo' },
          { text: 'Instale protetores anti-pássaros na unidade externa para evitar obstrução.', type: 'dica' },
        ],
        materials: [
          { id: 't12', name: 'Suporte externo (suporte L ou bracket)', emoji: '🔩' },
          { id: 't13', name: 'Buchas químicas para concreto', emoji: '🧱' },
          { id: 't14', name: 'Protetores anti-vibração (borracha)', emoji: '⚫' },
        ],
        details:
          'Fixe o suporte tipo L usando buchas químicas de 12mm para laje. Posicione a unidade sobre coxins de borracha para reduzir vibração. Conecte os tubos pela parte de baixo para facilitar o fluxo. Certifique-se de que não há obstrução em um raio de 50cm ao redor.',
      },
      {
        id: 'ac-5',
        title: 'Teste e Configuração Final',
        description:
          'Ligue o aparelho e realize teste de funcionamento. Verifique refrigeração, dreno e ruídos anormais.',
        emoji: '🧪',
        estimatedMinutes: 10,
        difficulty: 'moderado',
        tips: [
          { text: 'Deixe o aparelho ligado no modo automático por 30 minutos para avaliar performance.', type: 'dica' },
          { text: 'Se ouvir ruídos metálicos fortes, desligue imediatamente e verifique as fixações.', type: 'perigo' },
        ],
        materials: [
          { id: 't15', name: 'Termômetro de ambiente', emoji: '🌡️', optional: true },
          { id: 't16', name: 'Manual do usuário', emoji: '📖' },
        ],
        details:
          'Ligue o disjuntor e teste no modo refrigeração. Após 15 minutos, verifique se o ar da saída está frio. Teste também o modo aquecimento. Verifique se há água saindo pelo dreno externo. Configure a temperatura inicial em 24°C e o timer se desejar.',
      },
    ],
  },
  {
    id: 'router',
    title: 'Configuração de Router Wi-Fi',
    subtitle: 'Guia para configurar seu router e obter o melhor sinal Wi-Fi',
    category: 'Eletrônicos',
    emoji: '📡',
    totalEstimatedMinutes: 25,
    steps: [
      {
        id: 'rt-1',
        title: 'Posicionar o Router',
        description:
          'Escolha um local central na casa, longe de paredes espessas e fontes de interferência como micro-ondas.',
        emoji: '📍',
        estimatedMinutes: 5,
        difficulty: 'fácil',
        tips: [
          { text: 'Posicione o router a pelo menos 1,5m do chão em uma estante ou mesa.', type: 'dica' },
          { text: 'Evite colocar atrás de móveis grandes ou dentro de gabinetes fechados.', type: 'atenção' },
          { text: 'Distância ideal do router a dispositivos: até 10m sem obstáculos.', type: 'dica' },
        ],
        materials: [
          { id: 'r1', name: 'Router Wi-Fi', emoji: '📡' },
          { id: 'r2', name: 'Cabo de energia', emoji: '🔌' },
          { id: 'r3', name: 'Cabo Ethernet (RJ-45)', emoji: '🔗' },
        ],
        details:
          'O melhor local é o centro geográfico da sua casa. Paredes de concreto reduzem o sinal em até 70%. Se você tem dois andares, considere colocar o router no andar intermediário ou usar um repetidor. Micro-ondas e telefones sem fio operam em 2.4GHz e causam interferência.',
      },
      {
        id: 'rt-2',
        title: 'Conectar Cabos e Energia',
        description:
          'Conecte o cabo Ethernet do modem ao router e ligue na tomada. Aguarde os LEDs estabilizarem.',
        emoji: '🔌',
        estimatedMinutes: 3,
        difficulty: 'fácil',
        tips: [
          { text: 'Use o cabo Ethernet incluso na caixa — geralmente vem pré-crimpado com conectores RJ-45.', type: 'dica' },
          { text: 'Conecte na porta WAN (geralmente azul ou destacada) do router.', type: 'atenção' },
          { text: 'Use um no-break ou estabilizador para proteger contra surtos de energia.', type: 'dica' },
        ],
        materials: [
          { id: 'r1', name: 'Router Wi-Fi', emoji: '📡' },
          { id: 'r2', name: 'Cabo de energia', emoji: '🔌' },
          { id: 'r3', name: 'Cabo Ethernet (RJ-45)', emoji: '🔗' },
          { id: 'r4', name: 'Modem de internet', emoji: '🖥️' },
        ],
        details:
          'O cabo WAN vai do modem à porta WAN do router. As portas LAN (1-4) são para dispositivos cabeados. Aguarde 2-3 minutos após ligar para o router inicializar completamente. Os LEDs de "Internet" e "Wi-Fi" devem acender em verde ou branco.',
      },
      {
        id: 'rt-3',
        title: 'Configurar Rede Wi-Fi',
        description:
          'Acesse o painel de administração do router e configure o nome da rede (SSID), senha e tipo de segurança.',
        emoji: '⚙️',
        estimatedMinutes: 10,
        difficulty: 'moderado',
        tips: [
          { text: 'Use WPA3 ou WPA2 como segurança. Nunca deixe a rede aberta.', type: 'perigo' },
          { text: 'Crie uma senha com pelo menos 12 caracteres incluindo números e símbolos.', type: 'dica' },
          { text: 'Separe as redes 2.4GHz e 5GHz com nomes distintos para melhor controle.', type: 'dica' },
        ],
        materials: [
          { id: 'r5', name: 'Smartphone ou computador', emoji: '📱' },
          { id: 'r6', name: 'Senha padrão do router (no adesivo)', emoji: '🏷️' },
        ],
        details:
          'Abra o navegador e acesse 192.168.0.1 ou 192.168.1.1 (verifique no manual). Use admin/admin como login padrão. Na seção Wireless, altere o SSID para um nome de sua preferência. Em Security, selecione WPA2-Personal e crie uma senha forte. Salve e reinicie.',
      },
      {
        id: 'rt-4',
        title: 'Testar Conexão e Sinal',
        description:
          'Conecte seus dispositivos e teste a velocidade em diferentes cômodos. Ajuste as antenas se necessário.',
        emoji: '📶',
        estimatedMinutes: 7,
        difficulty: 'fácil',
        tips: [
          { text: 'Se o sinal estiver fraco em determinado cômodo, tente ajustar a direção das antenas.', type: 'dica' },
          { text: 'Use a banda 5GHz para streaming e jogos — é mais rápida mas tem menos alcance.', type: 'dica' },
          { text: 'Atualize o firmware do router para obter melhor performance e segurança.', type: 'atenção' },
        ],
        materials: [
          { id: 'r5', name: 'Smartphone ou computador', emoji: '📱' },
          { id: 'r7', name: 'Aplicativo de teste de velocidade', emoji: '📊', optional: true },
        ],
        details:
          'Ande pela casa com o celular conectado ao Wi-Fi e verifique a intensidade do sinal. O ideal é ter pelo menos 3 barras em todos os cômodos. Execute um speed test em speedtest.net. Se a velocidade estiver abaixo do contratado, tente mudar o canal Wi-Fi no painel do router.',
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Difficulty badge color mapping                                     */
/* ------------------------------------------------------------------ */

const DIFFICULTY_CONFIG: Record<Difficulty, { color: string; bgColor: string; label: string }> = {
  fácil: {
    color: 'rgba(22, 163, 74, 0.9)',
    bgColor: 'rgba(22, 163, 74, 0.1)',
    label: 'Fácil',
  },
  moderado: {
    color: 'rgba(217, 119, 6, 0.9)',
    bgColor: 'rgba(217, 119, 6, 0.1)',
    label: 'Moderado',
  },
  avançado: {
    color: 'rgba(220, 38, 38, 0.9)',
    bgColor: 'rgba(220, 38, 38, 0.1)',
    label: 'Avançado',
  },
}

/* ------------------------------------------------------------------ */
/*  Callout config                                                     */
/* ------------------------------------------------------------------ */

const CALLOUT_CONFIG: Record<
  CalloutType,
  { icon: typeof Lightbulb; borderColor: string; bgColor: string; label: string; textColor: string }
> = {
  dica: {
    icon: Lightbulb,
    borderColor: 'rgba(22, 163, 74, 0.4)',
    bgColor: 'rgba(22, 163, 74, 0.06)',
    label: 'Dica',
    textColor: 'rgba(22, 163, 74, 0.95)',
  },
  atenção: {
    icon: AlertTriangle,
    borderColor: 'rgba(217, 119, 6, 0.4)',
    bgColor: 'rgba(217, 119, 6, 0.06)',
    label: 'Atenção',
    textColor: 'rgba(217, 119, 6, 0.95)',
  },
  perigo: {
    icon: ShieldAlert,
    borderColor: 'rgba(220, 38, 38, 0.4)',
    bgColor: 'rgba(220, 38, 38, 0.06)',
    label: 'Perigo',
    textColor: 'rgba(220, 38, 38, 0.95)',
  },
}

/* ------------------------------------------------------------------ */
/*  Helper — format seconds to MM:SS                                    */
/* ------------------------------------------------------------------ */

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/* ------------------------------------------------------------------ */
/*  Sub-component: TipCallout                                          */
/* ------------------------------------------------------------------ */

function TipCallout({ tip, index }: { tip: Tip; index: number }) {
  const config = CALLOUT_CONFIG[tip.type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35, type: 'spring' as const, stiffness: 260, damping: 22 }}
      className={`r40-tip-callout flex items-start gap-3 rounded-lg border-l-4 p-3 text-sm`}
      style={{
        borderLeftColor: config.borderColor,
        backgroundColor: config.bgColor,
      }}
    >
      <div
        className="r40-tip-icon shrink-0 mt-0.5 rounded-full p-1"
        style={{ backgroundColor: config.bgColor }}
      >
        <Icon className="r40-tip-icon-svg h-4 w-4" style={{ color: config.textColor }} />
      </div>
      <div className="r40-tip-content flex-1 min-w-0">
        <span
          className="r40-tip-label text-xs font-bold uppercase tracking-wide"
          style={{ color: config.textColor }}
        >
          {config.label}
        </span>
        <p className="r40-tip-text text-xs leading-relaxed mt-0.5" style={{ color: config.textColor }}>
          {tip.text}
        </p>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-component: MaterialsChecklist                                  */
/* ------------------------------------------------------------------ */

function MaterialsChecklist({ materials, checkedItems, onToggle }: { materials: MaterialItem[]; checkedItems: Set<string>; onToggle: (id: string) => void }) {
  const checkedCount = materials.filter((m) => checkedItems.has(m.id)).length
  const allChecked = checkedCount === materials.length

  return (
    <div className="r40-materials-checklist">
      <div className="r40-materials-header flex items-center justify-between mb-2">
        <div className="r40-materials-title flex items-center gap-2">
          <Wrench className="r40-materials-icon h-4 w-4" style={{ color: 'rgba(100, 116, 139, 0.8)' }} />
          <span className="r40-materials-label text-xs font-semibold" style={{ color: 'rgba(100, 116, 139, 0.9)' }}>
            Materiais Necessários
          </span>
        </div>
        {allChecked && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 18 }}
            className="r40-materials-all-done text-xs font-bold flex items-center gap-1"
            style={{ color: 'rgba(22, 163, 74, 0.9)' }}
          >
            <CircleCheck className="h-3.5 w-3.5" />
            Todos prontos
          </motion.span>
        )}
      </div>
      <div className="r40-materials-list space-y-1.5">
        {materials.map((material, idx) => {
          const isChecked = checkedItems.has(material.id)
          return (
            <motion.label
              key={material.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.25 }}
              className={`r40-material-item flex items-center gap-2.5 rounded-md px-2.5 py-1.5 cursor-pointer transition-colors duration-200 ${
                isChecked ? 'r40-material-item-checked' : 'r40-material-item-unchecked'
              }`}
              style={{
                backgroundColor: isChecked ? 'rgba(22, 163, 74, 0.06)' : 'transparent',
              }}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => onToggle(material.id)}
                className="r40-material-checkbox"
              />
              <span className="r40-material-emoji text-sm">{material.emoji}</span>
              <span
                className={`r40-material-name flex-1 text-xs transition-all duration-200 ${
                  isChecked ? 'r40-material-name-checked' : ''
                }`}
                style={{
                  textDecoration: isChecked ? 'line-through' : 'none',
                  color: isChecked ? 'rgba(148, 163, 184, 0.7)' : 'rgba(30, 41, 59, 0.85)',
                }}
              >
                {material.name}
              </span>
              {material.optional && (
                <Badge variant="outline" className="r40-material-optional-badge text-[9px] px-1.5 py-0" style={{ color: 'rgba(100, 116, 139, 0.6)', borderColor: 'rgba(100, 116, 139, 0.3)' }}>
                  Opcional
                </Badge>
              )}
            </motion.label>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-component: StepTimer                                            */
/* ------------------------------------------------------------------ */

function StepTimer({ estimatedMinutes, stepKey }: { estimatedMinutes: number; stepKey: number }) {
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isOvertime, setIsOvertime] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const estimatedSeconds = estimatedMinutes * 60

  const start = useCallback(() => {
    setIsRunning(true)
  }, [])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    setIsRunning(false)
    setElapsed(0)
    setIsOvertime(false)
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1
          if (next > estimatedSeconds && !isOvertime) {
            setIsOvertime(true)
          }
          return next
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, estimatedSeconds, isOvertime])

  const progressPercent = Math.min((elapsed / estimatedSeconds) * 100, 100)

  return (
    <div className="r40-step-timer flex items-center gap-3 rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(241, 245, 249, 0.7)' }}>
      <Clock className="r40-timer-icon h-4 w-4 shrink-0" style={{ color: isOvertime ? 'rgba(220, 38, 38, 0.8)' : 'rgba(100, 116, 139, 0.7)' }} />
      <div className="r40-timer-content flex-1 min-w-0">
        <div className="r40-timer-row flex items-center justify-between mb-1">
          <span className="r40-timer-label text-[10px] font-medium" style={{ color: 'rgba(100, 116, 139, 0.7)' }}>
            Tempo Estimado: {estimatedMinutes} min
          </span>
          <span
            className={`r40-timer-display text-xs font-mono font-bold ${
              isOvertime ? 'r40-timer-overtime' : ''
            }`}
            style={{ color: isOvertime ? 'rgba(220, 38, 38, 0.9)' : 'rgba(30, 41, 59, 0.85)' }}
          >
            {formatTime(elapsed)}
          </span>
        </div>
        <Progress
          value={progressPercent}
          className="r40-timer-progress h-1.5"
        />
        {isOvertime && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="r40-timer-overtime-msg text-[10px] mt-1"
            style={{ color: 'rgba(220, 38, 38, 0.7)' }}
          >
            ⏰ Tempo estimado ultrapassado — tudo bem, cada instalação é diferente!
          </motion.p>
        )}
      </div>
      <div className="r40-timer-buttons flex items-center gap-1 shrink-0">
        {!isRunning ? (
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={start}
              className="r40-timer-start-btn min-h-[44px] min-w-[44px] h-7 w-7"
            >
              <Play className="h-3.5 w-3.5" style={{ color: 'rgba(22, 163, 74, 0.8)' }} />
            </Button>
          </motion.div>
        ) : (
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={pause}
              className="r40-timer-pause-btn min-h-[44px] min-w-[44px] h-7 w-7"
            >
              <Pause className="h-3.5 w-3.5" style={{ color: 'rgba(217, 119, 6, 0.8)' }} />
            </Button>
          </motion.div>
        )}
        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={reset}
            className="r40-timer-reset-btn min-h-[44px] min-w-[44px] h-7 w-7"
          >
            <RotateCcw className="h-3.5 w-3.5" style={{ color: 'rgba(100, 116, 139, 0.6)' }} />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-component: VideoPlaceholder                                    */
/* ------------------------------------------------------------------ */

function VideoPlaceholder({ stepTitle }: { stepTitle: string }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="r40-video-placeholder relative w-full aspect-video rounded-xl overflow-hidden cursor-pointer"
      style={{
        background: `linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.8) 50%, rgba(30, 41, 59, 0.9) 100%)`,
      }}
    >
      {/* Grid pattern overlay */}
      <div
        className="r40-video-grid absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Thumbnail icon */}
      <div className="r40-video-content absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.25 }}
          className="r40-video-emoji text-5xl mb-3"
        >
          🎬
        </motion.div>
        <p className="r40-video-title text-xs font-medium text-center px-4" style={{ color: 'rgba(226, 232, 240, 0.8)' }}>
          Vídeo tutorial: {stepTitle}
        </p>
        <p className="r40-video-subtitle text-[10px] mt-1" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
          Clique para assistir
        </p>
      </div>

      {/* Play button */}
      <motion.div
        animate={{
          scale: isHovered ? 1.15 : 1,
          opacity: isHovered ? 1 : 0.85,
        }}
        transition={{ duration: 0.2 }}
        className="r40-video-play-btn absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div
          className="r40-video-play-circle flex items-center justify-center rounded-full"
          style={{
            width: 56,
            height: 56,
            backgroundColor: 'rgba(22, 163, 74, 0.85)',
            boxShadow: '0 4px 20px rgba(22, 163, 74, 0.3)',
          }}
        >
          <Play className="r40-video-play-icon h-6 w-6" style={{ color: '#ffffff', marginLeft: 2 }} fill="#ffffff" />
        </div>
      </motion.div>

      {/* Duration badge */}
      <div
        className="r40-video-duration absolute bottom-2 right-2 rounded px-1.5 py-0.5"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      >
        <span className="r40-video-duration-text text-[10px] font-mono font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          3:42
        </span>
      </div>

      {/* HD badge */}
      <div
        className="r40-video-hd-badge absolute top-2 right-2 rounded px-1.5 py-0.5"
        style={{ backgroundColor: 'rgba(22, 163, 74, 0.8)' }}
      >
        <span className="r40-video-hd-text text-[9px] font-bold" style={{ color: '#ffffff' }}>
          HD
        </span>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-component: StepProgressBar                                      */
/* ------------------------------------------------------------------ */

function StepProgressBar({
  steps,
  currentStepIndex,
  completedSteps,
}: {
  steps: SetupStep[]
  currentStepIndex: number
  completedSteps: Set<string>
}) {
  return (
    <div className="r40-step-progress-bar">
      <div className="r40-progress-track flex items-center justify-between relative px-2">
        {/* Connecting line behind */}
        <div className="r40-progress-line-bg absolute top-5 left-8 right-8 h-0.5" style={{ backgroundColor: 'rgba(226, 232, 240, 0.3)' }} />
        {/* Animated connecting line */}
        <motion.div
          className="r40-progress-line-active absolute top-5 left-8 h-0.5"
          style={{
            backgroundColor: 'rgba(22, 163, 74, 0.7)',
            boxShadow: '0 0 8px rgba(22, 163, 74, 0.3)',
          }}
          initial={{ width: 0 }}
          animate={{
            width: `calc(${Math.min(completedSteps.size, steps.length) / Math.max(steps.length, 1) * 100}% - 0px)`,
          }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
        />

        {steps.map((step, idx) => {
          const isCompleted = completedSteps.has(step.id)
          const isCurrent = idx === currentStepIndex

          return (
            <div key={step.id} className="r40-progress-node flex flex-col items-center relative z-10">
              <motion.div
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                className="r40-progress-circle flex items-center justify-center rounded-full"
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: isCompleted
                    ? 'rgba(22, 163, 74, 0.15)'
                    : isCurrent
                    ? 'rgba(59, 130, 246, 0.12)'
                    : 'rgba(241, 245, 249, 0.8)',
                  border: isCompleted
                    ? '2px solid rgba(22, 163, 74, 0.6)'
                    : isCurrent
                    ? '2px solid rgba(59, 130, 246, 0.5)'
                    : '2px solid rgba(226, 232, 240, 0.5)',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none',
                }}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 16 }}
                  >
                    <Check className="r40-progress-check h-4 w-4" style={{ color: 'rgba(22, 163, 74, 0.9)' }} />
                  </motion.div>
                ) : (
                  <span className="r40-progress-emoji text-lg">{step.emoji}</span>
                )}
              </motion.div>
              <span
                className={`r40-progress-step-label text-[10px] mt-1.5 font-medium text-center max-w-[60px] truncate ${
                  isCurrent ? 'r40-progress-label-active' : isCompleted ? 'r40-progress-label-done' : ''
                }`}
                style={{
                  color: isCompleted
                    ? 'rgba(22, 163, 74, 0.9)'
                    : isCurrent
                    ? 'rgba(59, 130, 246, 0.9)'
                    : 'rgba(148, 163, 184, 0.6)',
                }}
              >
                Passo {idx + 1}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-component: CompletionCard                                      */
/* ------------------------------------------------------------------ */

function CompletionCard({ guideTitle, onRestart }: { guideTitle: string; onRestart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
      className="r40-completion-card relative overflow-hidden rounded-2xl p-8 text-center"
      style={{
        background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.08) 0%, rgba(20, 184, 166, 0.08) 50%, rgba(59, 130, 246, 0.06) 100%)',
        border: '1px solid rgba(22, 163, 74, 0.2)',
        boxShadow: '0 8px 40px rgba(22, 163, 74, 0.12)',
      }}
    >
      {/* Confetti burst */}
      <ConfettiBurst active={true} particleCount={50} spread={250} duration={1200} />

      {/* Trophy icon */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' as const }}
        className="r40-completion-trophy text-6xl mb-4"
      >
        🏆
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="r40-completion-title text-2xl font-bold mb-2"
        style={{ color: 'rgba(22, 163, 74, 0.95)' }}
      >
        Parabéns!
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="r40-completion-text text-sm mb-1"
        style={{ color: 'rgba(30, 41, 59, 0.8)' }}
      >
        Você concluiu a instalação de
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="r40-completion-product text-lg font-bold mb-4"
        style={{ color: 'rgba(30, 41, 59, 0.9)' }}
      >
        {guideTitle}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="r40-completion-badges flex items-center justify-center gap-3 mb-6"
      >
        <div className="r40-completion-badge flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)', border: '1px solid rgba(22, 163, 74, 0.2)' }}>
          <Check className="h-3.5 w-3.5" style={{ color: 'rgba(22, 163, 74, 0.8)' }} />
          <span className="r40-completion-badge-text text-[11px] font-semibold" style={{ color: 'rgba(22, 163, 74, 0.9)' }}>
            Todos os passos concluídos
          </span>
        </div>
        <div className="r40-completion-stars flex gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + i * 0.1, type: 'spring' as const, stiffness: 400, damping: 15 }}
              className="r40-star text-xl"
            >
              ⭐
            </motion.span>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="r40-completion-actions flex items-center justify-center gap-3"
      >
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Button
            variant="outline"
            onClick={onRestart}
            className="r40-completion-restart-btn gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Refazer Guia
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Button
            className="r40-completion-rate-btn gap-2"
            style={{ backgroundColor: 'rgba(22, 163, 74, 0.9)' }}
          >
            Avaliar Produto
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-component: GuideSelector                                        */
/* ------------------------------------------------------------------ */

function GuideSelector({
  guides,
  selectedGuideId,
  onSelect,
}: {
  guides: SetupGuide[]
  selectedGuideId: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="r40-guide-selector">
      <h4 className="r40-guide-selector-title text-sm font-semibold mb-3" style={{ color: 'rgba(30, 41, 59, 0.85)' }}>
        Escolha o Guia de Instalação
      </h4>
      <div className="r40-guide-options grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide, idx) => {
          const isSelected = guide.id === selectedGuideId
          return (
            <motion.div
              key={guide.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.35 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(guide.id)}
              className={`r40-guide-option cursor-pointer rounded-xl p-4 transition-all duration-200 ${
                isSelected ? 'r40-guide-option-selected' : 'r40-guide-option-unselected'
              }`}
              style={{
                backgroundColor: isSelected ? 'rgba(22, 163, 74, 0.06)' : 'rgba(248, 250, 252, 0.8)',
                border: isSelected
                  ? '2px solid rgba(22, 163, 74, 0.4)'
                  : '2px solid rgba(226, 232, 240, 0.5)',
                boxShadow: isSelected
                  ? '0 4px 16px rgba(22, 163, 74, 0.1)'
                  : '0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div className="r40-guide-option-header flex items-start justify-between mb-2">
                <span className="r40-guide-option-emoji text-2xl">{guide.emoji}</span>
                <Badge
                  variant="secondary"
                  className="r40-guide-option-category text-[9px] px-1.5"
                  style={{ backgroundColor: 'rgba(241, 245, 249, 0.8)' }}
                >
                  {guide.category}
                </Badge>
              </div>
              <p className="r40-guide-option-title text-sm font-bold mb-0.5" style={{ color: 'rgba(30, 41, 59, 0.9)' }}>
                {guide.title}
              </p>
              <p className="r40-guide-option-subtitle text-[11px] leading-snug" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
                {guide.subtitle}
              </p>
              <div className="r40-guide-option-meta flex items-center gap-2 mt-3">
                <span className="r40-guide-option-time flex items-center gap-1 text-[10px] font-medium" style={{ color: 'rgba(100, 116, 139, 0.7)' }}>
                  <Clock className="h-3 w-3" />
                  ~{guide.totalEstimatedMinutes} min
                </span>
                <span className="r40-guide-option-steps flex items-center gap-1 text-[10px] font-medium" style={{ color: 'rgba(100, 116, 139, 0.7)' }}>
                  <Package className="h-3 w-3" />
                  {guide.steps.length} passos
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component: ProductSetupWizard                                  */
/* ------------------------------------------------------------------ */

export function ProductSetupWizard() {
  /* State */
  const [selectedGuideId, setSelectedGuideId] = useState<string>(SETUP_GUIDES[0].id)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const [checkedMaterials, setCheckedMaterials] = useState<Set<string>>(new Set())
  const [showCompletion, setShowCompletion] = useState(false)

  /* Derived */
  const guide = SETUP_GUIDES.find((g) => g.id === selectedGuideId) ?? SETUP_GUIDES[0]
  const currentStep = guide.steps[currentStepIndex]
  const allStepsCompleted = guide.steps.every((s) => completedSteps.has(s.id))

  // Reset completion immediately when steps are no longer all completed (adjust state during render)
  if (showCompletion && (!allStepsCompleted || guide.steps.length === 0)) {
    setShowCompletion(false)
  }

  /* Show completion card after a short delay when all done */
  useEffect(() => {
    if (allStepsCompleted && guide.steps.length > 0) {
      const timer = setTimeout(() => setShowCompletion(true), 600)
      return () => clearTimeout(timer)
    }
  }, [allStepsCompleted, guide.steps.length])

  /* Handlers */
  const handleSelectGuide = useCallback((id: string) => {
    setSelectedGuideId(id)
    setCurrentStepIndex(0)
    setCompletedSteps(new Set())
    setExpandedSteps(new Set())
    setCheckedMaterials(new Set())
    setShowCompletion(false)
  }, [])

  const handleCompleteStep = useCallback(
    (stepId: string) => {
      setCompletedSteps((prev) => {
        const next = new Set(prev)
        if (next.has(stepId)) {
          next.delete(stepId)
          return next
        }
        next.add(stepId)
        return next
      })
    },
    []
  )

  const handleToggleExpand = useCallback((stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(stepId)) {
        next.delete(stepId)
      } else {
        next.add(stepId)
      }
      return next
    })
  }, [])

  const handleToggleMaterial = useCallback((materialId: string) => {
    setCheckedMaterials((prev) => {
      const next = new Set(prev)
      if (next.has(materialId)) {
        next.delete(materialId)
      } else {
        next.add(materialId)
      }
      return next
    })
  }, [])

  const guideStepsLength = guide.steps.length
  const handleNextStep = useCallback(() => {
    if (currentStepIndex < guideStepsLength - 1) {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }, [currentStepIndex, guideStepsLength])

  const handlePrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }, [currentStepIndex])

  const handleRestart = useCallback(() => {
    setCompletedSteps(new Set())
    setCurrentStepIndex(0)
    setExpandedSteps(new Set())
    setCheckedMaterials(new Set())
    setShowCompletion(false)
  }, [])

  const isStepExpanded = expandedSteps.has(currentStep.id)

  /* Completion percentage for overall progress */
  const completionPercent = guide.steps.length > 0
    ? Math.round((completedSteps.size / guide.steps.length) * 100)
    : 0

  return (
    <div className="r40-wizard-root">
      {/* Guide selector */}
      <div className="r40-wizard-guide-section mb-8">
        <GuideSelector
          guides={SETUP_GUIDES}
          selectedGuideId={selectedGuideId}
          onSelect={handleSelectGuide}
        />
      </div>

      {/* Completion card */}
      <AnimatePresence>
        {showCompletion && (
          <motion.div
            key="completion"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="r40-wizard-completion-section mb-8"
          >
            <CompletionCard guideTitle={guide.title} onRestart={handleRestart} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wizard body */}
      {!showCompletion && (
        <div className="r40-wizard-body space-y-6">
          {/* Header card with title and overall progress */}
          <Card className="r40-wizard-header-card overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <CardHeader className="r40-wizard-header-content pb-2">
              <div className="r40-wizard-header-row flex items-start justify-between gap-4">
                <div className="r40-wizard-title-section flex-1 min-w-0">
                  <div className="r40-wizard-category-badge mb-2">
                    <Badge variant="secondary" className="r40-wizard-category text-[10px] px-2">
                      {guide.category}
                    </Badge>
                  </div>
                  <CardTitle className="r40-wizard-title text-lg flex items-center gap-2">
                    <span>{guide.emoji}</span>
                    <span>{guide.title}</span>
                  </CardTitle>
                  <CardDescription className="r40-wizard-subtitle text-xs mt-1">
                    {guide.subtitle}
                  </CardDescription>
                </div>
                <div className="r40-wizard-stats flex items-center gap-4">
                  <div className="r40-wizard-stat text-center">
                    <span className="r40-wizard-stat-value text-xl font-bold" style={{ color: 'rgba(59, 130, 246, 0.9)' }}>
                      {completionPercent}%
                    </span>
                    <span className="r40-wizard-stat-label block text-[10px]" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
                      Progresso
                    </span>
                  </div>
                  <div className="r40-wizard-stat text-center">
                    <span className="r40-wizard-stat-value text-xl font-bold" style={{ color: 'rgba(22, 163, 74, 0.9)' }}>
                      {completedSteps.size}/{guide.steps.length}
                    </span>
                    <span className="r40-wizard-stat-label block text-[10px]" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
                      Concluídos
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="r40-wizard-progress-section pt-2">
              <div className="r40-wizard-overall-progress">
                <div className="r40-wizard-progress-label flex items-center justify-between mb-1.5">
                  <span className="r40-wizard-progress-text text-xs font-medium" style={{ color: 'rgba(100, 116, 139, 0.7)' }}>
                    Progresso Geral
                  </span>
                  <span className="r40-wizard-progress-percent text-xs font-bold" style={{ color: 'rgba(59, 130, 246, 0.85)' }}>
                    {completionPercent}%
                  </span>
                </div>
                <Progress value={completionPercent} className="r40-wizard-progress-bar h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Step progress bar */}
          <div className="r40-wizard-step-progress">
            <StepProgressBar
              steps={guide.steps}
              currentStepIndex={currentStepIndex}
              completedSteps={completedSteps}
            />
          </div>

          {/* Current step card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: 'easeOut' as const }}
            >
              <Card
                className="r40-step-card overflow-hidden"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
              >
                <CardHeader className="r40-step-header">
                  <div className="r40-step-header-top flex items-start justify-between gap-3">
                    <div className="r40-step-info flex-1 min-w-0">
                      <div className="r40-step-number-badge flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="r40-step-badge text-[10px] px-2" style={{ borderColor: 'rgba(226, 232, 240, 0.5)', color: 'rgba(100, 116, 139, 0.7)' }}>
                          Passo {currentStepIndex + 1} de {guide.steps.length}
                        </Badge>
                        <Badge
                          className="r40-step-difficulty-badge text-[10px] px-2"
                          style={{
                            backgroundColor: DIFFICULTY_CONFIG[currentStep.difficulty].bgColor,
                            color: DIFFICULTY_CONFIG[currentStep.difficulty].color,
                            border: 'none',
                          }}
                        >
                          {DIFFICULTY_CONFIG[currentStep.difficulty].label}
                        </Badge>
                      </div>
                      <CardTitle className="r40-step-title text-base flex items-center gap-2 mt-2">
                        <motion.span
                          className="r40-step-emoji text-xl"
                          animate={{ rotate: [0, -5, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 3, repeatDelay: 5 }}
                        >
                          {currentStep.emoji}
                        </motion.span>
                        <span>{currentStep.title}</span>
                      </CardTitle>
                      <CardDescription className="r40-step-description text-xs mt-1.5 leading-relaxed">
                        {currentStep.description}
                      </CardDescription>
                    </div>
                    <div className="r40-step-time-badge flex items-center gap-1.5 rounded-lg px-3 py-1.5 shrink-0" style={{ backgroundColor: 'rgba(241, 245, 249, 0.8)' }}>
                      <Clock className="r40-step-time-icon h-3.5 w-3.5" style={{ color: 'rgba(100, 116, 139, 0.6)' }} />
                      <span className="r40-step-time-text text-xs font-semibold" style={{ color: 'rgba(100, 116, 139, 0.8)' }}>
                        ~{currentStep.estimatedMinutes} min
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="r40-step-content space-y-5">
                  {/* Timer */}
                  <StepTimer
                    key={currentStepIndex}
                    estimatedMinutes={currentStep.estimatedMinutes}
                    stepKey={currentStepIndex}
                  />

                  {/* Video placeholder */}
                  <div className="r40-step-video-section">
                    <h5 className="r40-step-video-heading text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'rgba(100, 116, 139, 0.7)' }}>
                      📹 Vídeo Tutorial
                    </h5>
                    <VideoPlaceholder stepTitle={currentStep.title} />
                  </div>

                  {/* Tips & Warnings */}
                  {currentStep.tips.length > 0 && (
                    <div className="r40-step-tips-section">
                      <h5 className="r40-step-tips-heading text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'rgba(100, 116, 139, 0.7)' }}>
                        💡 Dicas e Avisos
                      </h5>
                      <div className="r40-step-tips-list space-y-2">
                        {currentStep.tips.map((tip, idx) => (
                          <TipCallout key={idx} tip={tip} index={idx} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Materials checklist */}
                  <div className="r40-step-materials-section">
                    <MaterialsChecklist
                      materials={currentStep.materials}
                      checkedItems={checkedMaterials}
                      onToggle={handleToggleMaterial}
                    />
                  </div>

                  {/* Expandable details */}
                  <div className="r40-step-details-section">
                    <motion.button
                      onClick={() => handleToggleExpand(currentStep.id)}
                      className="r40-step-details-toggle flex items-center gap-2 text-xs font-semibold w-full text-left py-2 px-1 rounded-lg transition-colors duration-200"
                      style={{ color: 'rgba(59, 130, 246, 0.8)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        animate={{ rotate: isStepExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="r40-step-details-chevron h-4 w-4" />
                      </motion.div>
                      <span>{isStepExpanded ? 'Ocultar detalhes' : 'Ver mais detalhes'}</span>
                    </motion.button>

                    <AnimatePresence>
                      {isStepExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeOut' as const }}
                          className="r40-step-details-content overflow-hidden"
                        >
                          <div
                            className="r40-step-details-inner rounded-lg p-4 text-xs leading-relaxed"
                            style={{
                              backgroundColor: 'rgba(241, 245, 249, 0.6)',
                              color: 'rgba(51, 65, 85, 0.85)',
                              borderLeft: '3px solid rgba(59, 130, 246, 0.3)',
                            }}
                          >
                            {currentStep.details}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Step actions */}
                  <div className="r40-step-actions flex items-center justify-between pt-2 border-t" style={{ borderColor: 'rgba(226, 232, 240, 0.5)' }}>
                    <div className="r40-step-nav flex items-center gap-2">
                      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePrevStep}
                          disabled={currentStepIndex === 0}
                          className="r40-step-prev-btn gap-1.5"
                        >
                          <ChevronRight className="r40-step-prev-icon h-4 w-4 rotate-180" />
                          Anterior
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                        <Button
                          size="sm"
                          onClick={handleNextStep}
                          disabled={currentStepIndex === guide.steps.length - 1}
                          className="r40-step-next-btn gap-1.5"
                          style={{ backgroundColor: 'rgba(59, 130, 246, 0.9)' }}
                        >
                          Próximo
                          <ChevronRight className="r40-step-next-icon h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>

                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                      <Button
                        variant={completedSteps.has(currentStep.id) ? 'secondary' : 'default'}
                        size="sm"
                        onClick={() => handleCompleteStep(currentStep.id)}
                        className="r40-step-complete-btn gap-2"
                        style={
                          completedSteps.has(currentStep.id)
                            ? { backgroundColor: 'rgba(22, 163, 74, 0.15)', color: 'rgba(22, 163, 74, 0.9)', border: '1px solid rgba(22, 163, 74, 0.3)' }
                            : undefined
                        }
                      >
                        {completedSteps.has(currentStep.id) ? (
                          <>
                            <Check className="r40-step-complete-check h-4 w-4" />
                            Concluído
                          </>
                        ) : (
                          <>
                            <CircleCheck className="r40-step-complete-circle h-4 w-4" />
                            Marcar como Concluído
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* All steps overview */}
          <div className="r40-wizard-overview">
            <h4 className="r40-wizard-overview-title text-sm font-semibold mb-3" style={{ color: 'rgba(30, 41, 59, 0.8)' }}>
              Visão Geral dos Passos
            </h4>
            <div className="r40-wizard-steps-list space-y-2">
              {guide.steps.map((step, idx) => {
                const isCompleted = completedSteps.has(step.id)
                const isCurrent = idx === currentStepIndex

                return (
                  <motion.div
                    key={step.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`r40-overview-step flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-all duration-200 ${
                      isCurrent ? 'r40-overview-step-active' : isCompleted ? 'r40-overview-step-completed' : 'r40-overview-step-pending'
                    }`}
                    style={{
                      backgroundColor: isCurrent
                        ? 'rgba(59, 130, 246, 0.06)'
                        : isCompleted
                        ? 'rgba(22, 163, 74, 0.04)'
                        : 'rgba(248, 250, 252, 0.6)',
                      border: isCurrent
                        ? '1.5px solid rgba(59, 130, 246, 0.3)'
                        : isCompleted
                        ? '1.5px solid rgba(22, 163, 74, 0.2)'
                        : '1.5px solid rgba(226, 232, 240, 0.4)',
                      boxShadow: isCurrent ? '0 2px 12px rgba(59, 130, 246, 0.08)' : 'none',
                    }}
                  >
                    <div
                      className="r40-overview-step-indicator flex items-center justify-center rounded-full shrink-0"
                      style={{
                        width: 32,
                        height: 32,
                        backgroundColor: isCompleted
                          ? 'rgba(22, 163, 74, 0.15)'
                          : isCurrent
                          ? 'rgba(59, 130, 246, 0.12)'
                          : 'rgba(241, 245, 249, 0.9)',
                      }}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4" style={{ color: 'rgba(22, 163, 74, 0.8)' }} />
                      ) : (
                        <span className="r40-overview-step-emoji text-base">{step.emoji}</span>
                      )}
                    </div>
                    <div className="r40-overview-step-info flex-1 min-w-0">
                      <p
                        className={`r40-overview-step-title text-xs font-semibold ${
                          isCompleted ? 'r40-overview-step-title-done' : ''
                        }`}
                        style={{
                          color: isCompleted
                            ? 'rgba(22, 163, 74, 0.8)'
                            : isCurrent
                            ? 'rgba(59, 130, 246, 0.9)'
                            : 'rgba(30, 41, 59, 0.75)',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                        }}
                      >
                        {idx + 1}. {step.title}
                      </p>
                      <div className="r40-overview-step-meta flex items-center gap-2 mt-0.5">
                        <span className="r40-overview-step-time flex items-center gap-0.5 text-[10px]" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
                          <Clock className="h-2.5 w-2.5" />
                          {step.estimatedMinutes} min
                        </span>
                        <span
                          className="r40-overview-step-diff text-[9px] font-medium px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: DIFFICULTY_CONFIG[step.difficulty].bgColor,
                            color: DIFFICULTY_CONFIG[step.difficulty].color,
                          }}
                        >
                          {DIFFICULTY_CONFIG[step.difficulty].label}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      className={`r40-overview-step-chevron h-4 w-4 transition-transform duration-200 ${
                        isCurrent ? 'rotate-90' : ''
                      }`}
                      style={{ color: isCurrent ? 'rgba(59, 130, 246, 0.5)' : 'rgba(226, 232, 240, 0.5)' }}
                    />
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Quick stats footer */}
          <div className="r40-wizard-footer rounded-xl p-4 flex items-center justify-between" style={{ backgroundColor: 'rgba(248, 250, 252, 0.6)', border: '1px solid rgba(226, 232, 240, 0.4)' }}>
            <div className="r40-wizard-footer-left flex items-center gap-4">
              <div className="r40-wizard-footer-stat flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" style={{ color: 'rgba(100, 116, 139, 0.5)' }} />
                <span className="r40-wizard-footer-stat-text text-[11px] font-medium" style={{ color: 'rgba(100, 116, 139, 0.7)' }}>
                  Tempo total: ~{guide.totalEstimatedMinutes} min
                </span>
              </div>
              <div className="r40-wizard-footer-stat flex items-center gap-1.5">
                <Hammer className="h-3.5 w-3.5" style={{ color: 'rgba(100, 116, 139, 0.5)' }} />
                <span className="r40-wizard-footer-stat-text text-[11px] font-medium" style={{ color: 'rgba(100, 116, 139, 0.7)' }}>
                  {guide.steps.length} passos
                </span>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRestart}
                className="r40-wizard-footer-reset-btn gap-1.5 text-[11px]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reiniciar Guia
              </Button>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  )
}
