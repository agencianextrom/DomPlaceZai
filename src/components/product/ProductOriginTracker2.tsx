'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  MapPin,
  ChevronDown,
  Leaf,
  Sprout,
  Factory,
  Truck,
  Warehouse,
  Home,
  Thermometer,
  ShieldCheck,
  Award,
  Star,
  ExternalLink,
  CheckCircle2,
  Handshake,
  CloudSun,
  Search,
  QrCode,
  Clock,
  Heart,
  Zap,
  TrendingUp,
  AlertTriangle,
  Info,
  User,
  Package,
  Route,
  BarChart3,
  Beef,
  Coffee,
  Grape,
  Wheat,
  XCircle,
} from 'lucide-react'

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface SupplyStep {
  id: string
  label: string
  icon: React.ElementType
  date: string
  location: string
  status: 'completed' | 'active' | 'pending'
  details: string
  temperature?: number
  handler?: string
  qualityBadge?: boolean
  tempBadge?: boolean
  carrier?: string
  duration?: string
  distance?: string
  eta?: string
}

interface CertificationBadge {
  id: string
  label: string
  icon: React.ElementType
  verified: boolean
  description: string
  color: string
}

interface QualityCheckpoint {
  id: string
  label: string
  status: 'pass' | 'fail' | 'pending'
  date: string
  inspector: string
  notes: string
}

interface ProductData2 {
  id: string
  name: string
  emoji: string
  category: string
  originCity: string
  originState: string
  destinationCity: string
  sustainabilityScore: number
  carbonFootprint: number
  daysFresh: number
  totalFreshDays: number
  supplyChain: SupplyStep[]
  certifications: CertificationBadge[]
  checkpoints: QualityCheckpoint[]
  temperatureLog: { hour: string; temp: number }[]
  producer: {
    name: string
    avatar: string
    city: string
    state: string
    sinceYear: number
    rating: number
    totalReviews: number
    productsCount: number
    story: string
  }
  routeWaypoints: { x: number; y: number; label: string }[]
  routePath: string
  distanceKm: number
  nutritionalInfo: { label: string; value: string; unit: string }[]
  qrCode: string
}

/* ═══════════════════════════════════════════
   MOCK PRODUCTS DATA
   ═══════════════════════════════════════════ */

const mockProducts: ProductData2[] = [
  {
    id: 'p2a-organic-coffee',
    name: 'Café Orgânico Cerrado Premium',
    emoji: '☕',
    category: 'Bebidas',
    originCity: 'Patrocínio',
    originState: 'MG',
    destinationCity: 'Dom Eliseu',
    sustainabilityScore: 9,
    carbonFootprint: 3.2,
    daysFresh: 12,
    totalFreshDays: 30,
    supplyChain: [
      { id: 'farm', label: 'Fazenda', icon: Sprout, date: '10 Jan 2025', location: 'Fazenda Boa Vista, Patrocínio-MG', status: 'completed', details: 'Colheita manual de grãos selecionados', temperature: 22, handler: 'Seu Joaquim Silva' },
      { id: 'processing', label: 'Processamento', icon: Factory, date: '12 Jan 2025', location: 'Café Brasil Indústria, Uberlândia-MG', status: 'completed', details: 'Torrefação artesanal e classificação', temperature: 18, handler: 'Dra. Maria Tavares', qualityBadge: true },
      { id: 'distribution', label: 'Distribuição', icon: Truck, date: '14 Jan 2025', location: 'Rod. BR-153 → PA', status: 'completed', details: 'Transporte refrigerado 2.340 km', temperature: 15, handler: 'TransLog Express', carrier: 'TransLog Express', duration: '36h', distance: '2.340 km' },
      { id: 'storage', label: 'Armazém', icon: Warehouse, date: '16 Jan 2025', location: 'Centro de Distribuição PA, Belém', status: 'completed', details: 'Armazenamento climatizado 18°C', temperature: 18, handler: 'Carlos Mendes', tempBadge: true },
      { id: 'store', label: 'Loja', icon: Home, date: '18 Jan 2025', location: 'Mercado do Zé, Dom Eliseu-PA', status: 'active', details: 'Pronto para retirada ou entrega', temperature: 20, handler: 'Roberto Alves' },
    ],
    certifications: [
      { id: 'organic', label: 'Organic', icon: Leaf, verified: true, description: 'Certificação orgânica IBD', color: 'rgba(16,185,129,1)' },
      { id: 'fair-trade', label: 'Fair Trade', icon: Handshake, verified: true, description: 'Comércio justo FLO-CERT', color: 'rgba(245,158,11,1)' },
      { id: 'non-gmo', label: 'Non-GMO', icon: ShieldCheck, verified: true, description: 'Sem transgênicos verificado', color: 'rgba(59,130,246,1)' },
      { id: 'local', label: 'Local', icon: MapPin, verified: true, description: 'Cultivado em Minas Gerais', color: 'rgba(16,185,129,1)' },
    ],
    checkpoints: [
      { id: 'qc1', label: 'Seleção de Grãos', status: 'pass', date: '10 Jan 2025', inspector: 'Equipe Fazenda', notes: 'Grãos classificados tipo 1' },
      { id: 'qc2', label: 'Teste de Umidade', status: 'pass', date: '11 Jan 2025', inspector: 'Lab. QA Centro', notes: 'Umidade 11.2% - dentro do padrão' },
      { id: 'qc3', label: 'Torrefação', status: 'pass', date: '12 Jan 2025', inspector: 'Mestre Torrefador', notes: 'Ponto médio alcançado com sucesso' },
      { id: 'qc4', label: 'Inspeção Visual', status: 'pass', date: '16 Jan 2025', inspector: 'Inspetor Belém', notes: 'Embalagem íntegra e sem defeitos' },
    ],
    temperatureLog: [
      { hour: '00h', temp: 18.2 }, { hour: '02h', temp: 17.8 }, { hour: '04h', temp: 18.0 },
      { hour: '06h', temp: 19.1 }, { hour: '08h', temp: 19.8 }, { hour: '10h', temp: 18.5 },
      { hour: '12h', temp: 17.2 }, { hour: '14h', temp: 16.8 }, { hour: '16h', temp: 17.5 },
      { hour: '18h', temp: 18.8 },
    ],
    producer: {
      name: 'Seu Joaquim Silva',
      avatar: '🧑‍🌾',
      city: 'Patrocínio',
      state: 'MG',
      sinceYear: 2015,
      rating: 4.9,
      totalReviews: 342,
      productsCount: 8,
      story: 'Terceira geração de cafeicultores. Produz café specialty há 9 anos com práticas sustentáveis e irrigação consciente.',
    },
    routeWaypoints: [
      { x: 55, y: 72, label: 'Fazenda' },
      { x: 52, y: 68, label: 'Uberlândia' },
      { x: 50, y: 60, label: 'BR-153' },
      { x: 55, y: 45, label: 'Belém' },
      { x: 58, y: 38, label: 'PA-279' },
      { x: 56, y: 32, label: 'Destino' },
    ],
    routePath: 'M55 72 Q52 68 50 60 Q55 45 58 38 Q57 35 56 32',
    distanceKm: 2340,
    nutritionalInfo: [
      { label: 'Calorias', value: '2', unit: 'kcal' },
      { label: 'Cafeína', value: '95', unit: 'mg' },
      { label: 'Antioxidantes', value: '200', unit: 'mg' },
      { label: 'Proteína', value: '0.3', unit: 'g' },
    ],
    qrCode: 'https://domplace.app/track/p2a-organic-coffee',
  },
  {
    id: 'p2b-acai-bowl',
    name: 'Açaí Orgânico do Pará',
    emoji: '🫐',
    category: 'Alimentos',
    originCity: 'Breves',
    originState: 'PA',
    destinationCity: 'Dom Eliseu',
    sustainabilityScore: 8,
    carbonFootprint: 1.8,
    daysFresh: 3,
    totalFreshDays: 7,
    supplyChain: [
      { id: 'farm', label: 'Coleta', icon: Sprout, date: '20 Jan 2025', location: 'Ilha do Combu, Breves-PA', status: 'completed', details: 'Coleta manual de açaí nativo', temperature: 4, handler: 'Dona Raimunda' },
      { id: 'processing', label: 'Polpa', icon: Factory, date: '20 Jan 2025', location: 'Agroindústria Amazônia, Belém-PA', status: 'completed', details: 'Processamento e congelamento -18°C', temperature: -18, handler: 'Téc. Ana Costa', qualityBadge: true },
      { id: 'distribution', label: 'Transporte', icon: Truck, date: '21 Jan 2025', location: 'Rod. PA-150 → Dom Eliseu', status: 'completed', details: 'Transporte refrigerado 320 km', temperature: -15, handler: 'FrioPar Express', carrier: 'FrioPar Express', duration: '6h', distance: '320 km', tempBadge: true },
      { id: 'store', label: 'Loja', icon: Home, date: '22 Jan 2025', location: 'Açaí da Boa, Dom Eliseu-PA', status: 'active', details: 'Disponível no freezer', temperature: -18, handler: 'Pedro Santos' },
    ],
    certifications: [
      { id: 'organic', label: 'Organic', icon: Leaf, verified: true, description: 'Certificação orgânica IBD', color: 'rgba(16,185,129,1)' },
      { id: 'fair-trade', label: 'Fair Trade', icon: Handshake, verified: true, description: 'Comércio justo FLO-CERT', color: 'rgba(245,158,11,1)' },
      { id: 'non-gmo', label: 'Non-GMO', icon: ShieldCheck, verified: true, description: 'Fruta nativa 100% natural', color: 'rgba(59,130,246,1)' },
      { id: 'local', label: 'Local', icon: MapPin, verified: true, description: 'Produzido no Pará', color: 'rgba(16,185,129,1)' },
    ],
    checkpoints: [
      { id: 'qc1', label: 'Qualidade da Fruta', status: 'pass', date: '20 Jan 2025', inspector: 'Dona Raimunda', notes: 'Frutos selecionados no ponto ideal' },
      { id: 'qc2', label: 'Teste de Acidez', status: 'pass', date: '20 Jan 2025', inspector: 'Lab. Belém', notes: 'pH 5.2 - padrão atingido' },
      { id: 'qc3', label: 'Congelamento', status: 'pass', date: '20 Jan 2025', inspector: 'Téc. Ana Costa', notes: '-18°C alcançado em 45 min' },
    ],
    temperatureLog: [
      { hour: '00h', temp: -18.2 }, { hour: '02h', temp: -18.5 }, { hour: '04h', temp: -18.1 },
      { hour: '06h', temp: -17.8 }, { hour: '08h', temp: -18.0 }, { hour: '10h', temp: -18.3 },
      { hour: '12h', temp: -17.5 }, { hour: '14h', temp: -18.1 }, { hour: '16h', temp: -18.4 },
      { hour: '18h', temp: -18.0 },
    ],
    producer: {
      name: 'Dona Raimunda',
      avatar: '👩‍🌾',
      city: 'Breves',
      state: 'PA',
      sinceYear: 2012,
      rating: 4.8,
      totalReviews: 189,
      productsCount: 5,
      story: 'Ribeirinha de nascença, colhe açaí desde criança. Hoje lidera uma cooperativa de 40 famílias no Marajó.',
    },
    routeWaypoints: [
      { x: 55, y: 38, label: 'Breves' },
      { x: 52, y: 42, label: 'Belém' },
      { x: 48, y: 52, label: 'PA-150' },
      { x: 42, y: 62, label: 'PA-279' },
      { x: 38, y: 66, label: 'Destino' },
    ],
    routePath: 'M55 38 Q52 42 48 52 Q42 62 38 66',
    distanceKm: 320,
    nutritionalInfo: [
      { label: 'Calorias', value: '70', unit: 'kcal' },
      { label: 'Antioxidantes', value: '350', unit: 'mg' },
      { label: 'Fibra', value: '4.0', unit: 'g' },
      { label: 'Gorduras Boas', value: '5.0', unit: 'g' },
    ],
    qrCode: 'https://domplace.app/track/p2b-acai-bowl',
  },
  {
    id: 'p2c-organic-honey',
    name: 'Mel Silvestre do Cerrado',
    emoji: '🍯',
    category: 'Alimentos',
    originCity: 'Cavalcante',
    originState: 'GO',
    destinationCity: 'Dom Eliseu',
    sustainabilityScore: 10,
    carbonFootprint: 5.1,
    daysFresh: 45,
    totalFreshDays: 365,
    supplyChain: [
      { id: 'farm', label: 'Apiário', icon: Sprout, date: '05 Jan 2025', location: 'Cerrado de Cavalcante, GO', status: 'completed', details: 'Extração manual sem fumaça', temperature: 25, handler: 'Sr. Antônio Ferreira' },
      { id: 'processing', label: 'Beneficiamento', icon: Factory, date: '08 Jan 2025', location: 'Mel do Cerrado Ltda, Goiânia-GO', status: 'completed', details: 'Decantação e envase artesanal', temperature: 22, handler: 'Eng. Lucia Prado', qualityBadge: true },
      { id: 'distribution', label: 'Transporte', icon: Truck, date: '10 Jan 2025', location: 'GO → PA via BR-153', status: 'completed', details: 'Transporte 1.890 km', temperature: 22, handler: 'LogiBR Transportes', carrier: 'LogiBR Transportes', duration: '28h', distance: '1.890 km' },
      { id: 'storage', label: 'Armazém', icon: Warehouse, date: '12 Jan 2025', location: 'Armazém Regional, Belém-PA', status: 'completed', details: 'Armazenamento seco e ventilado', temperature: 22, handler: 'Fernando Rocha' },
      { id: 'store', label: 'Loja', icon: Home, date: '15 Jan 2025', location: 'Mercado do Zé, Dom Eliseu-PA', status: 'active', details: 'Disponível na prateleira', temperature: 24, handler: 'Roberto Alves' },
    ],
    certifications: [
      { id: 'organic', label: 'Organic', icon: Leaf, verified: true, description: 'Certificação orgânica IBD', color: 'rgba(16,185,129,1)' },
      { id: 'fair-trade', label: 'Fair Trade', icon: Handshake, verified: true, description: 'Comércio justo FLO-CERT', color: 'rgba(245,158,11,1)' },
      { id: 'non-gmo', label: 'Non-GMO', icon: ShieldCheck, verified: false, description: 'Verificação pendente', color: 'rgba(59,130,246,1)' },
      { id: 'local', label: 'Local', icon: MapPin, verified: false, description: 'Importado de Goiás', color: 'rgba(16,185,129,1)' },
    ],
    checkpoints: [
      { id: 'qc1', label: 'Análise Polínica', status: 'pass', date: '08 Jan 2025', inspector: 'Lab. Goiânia', notes: 'Mel de florada silvestre confirmado' },
      { id: 'qc2', label: 'Teste de Pureza', status: 'pass', date: '08 Jan 2025', inspector: 'Lab. Goiânia', notes: 'Sem adulterantes detectados' },
      { id: 'qc3', label: 'Teor de Umidade', status: 'pass', date: '09 Jan 2025', inspector: 'INMETRO', notes: '18.5% - dentro do padrão' },
      { id: 'qc4', label: 'Embalagem', status: 'pass', date: '10 Jan 2025', inspector: 'Inspetor Goiânia', notes: 'Vidro hermético verificado' },
      { id: 'qc5', label: 'Chegada PA', status: 'fail', date: '12 Jan 2025', inspector: 'Inspetor Belém', notes: 'Pequena amassadura na caixa - produto OK' },
    ],
    temperatureLog: [
      { hour: '00h', temp: 22.2 }, { hour: '02h', temp: 22.0 }, { hour: '04h', temp: 22.1 },
      { hour: '06h', temp: 23.0 }, { hour: '08h', temp: 23.5 }, { hour: '10h', temp: 22.8 },
      { hour: '12h', temp: 22.2 }, { hour: '14h', temp: 21.8 }, { hour: '16h', temp: 22.5 },
      { hour: '18h', temp: 23.2 },
    ],
    producer: {
      name: 'Sr. Antônio Ferreira',
      avatar: '🧑‍🌾',
      city: 'Cavalcante',
      state: 'GO',
      sinceYear: 2008,
      rating: 4.7,
      totalReviews: 98,
      productsCount: 3,
      story: 'Agricultor familiar que mantém 120 colmeias no coração do Cerrado goiano. Preserva espécies nativas e promove apicultura sustentável.',
    },
    routeWaypoints: [
      { x: 60, y: 72, label: 'Cavalcante' },
      { x: 55, y: 68, label: 'Goiânia' },
      { x: 52, y: 58, label: 'BR-153' },
      { x: 55, y: 45, label: 'Belém' },
      { x: 52, y: 35, label: 'Destino' },
    ],
    routePath: 'M60 72 Q55 68 52 58 Q55 45 52 35',
    distanceKm: 1890,
    nutritionalInfo: [
      { label: 'Calorias', value: '64', unit: 'kcal' },
      { label: 'Açúcares', value: '17', unit: 'g' },
      { label: 'Vitaminas', value: 'B+C', unit: '' },
      { label: 'Antibiótico Nat.', value: 'Sim', unit: '' },
    ],
    qrCode: 'https://domplace.app/track/p2c-organic-honey',
  },
  {
    id: 'p2d-wagyu-beef',
    name: 'Carne Wagyu Marrombarato',
    emoji: '🥩',
    category: 'Carnes',
    originCity: 'Cachoeiro de Itapemirim',
    originState: 'ES',
    destinationCity: 'Dom Eliseu',
    sustainabilityScore: 5,
    carbonFootprint: 12.4,
    daysFresh: 5,
    totalFreshDays: 10,
    supplyChain: [
      { id: 'farm', label: 'Fazenda', icon: Sprout, date: '14 Jan 2025', location: 'Fazenda Nova Terra, Cachoeiro-ES', status: 'completed', details: 'Corte BMS 8+ maturação 21 dias', temperature: 2, handler: 'Dr. Ricardo Mendes' },
      { id: 'processing', label: 'Frigorífico', icon: Factory, date: '15 Jan 2025', location: 'Frigorífico Premium, Vitória-ES', status: 'completed', details: 'Desossa, embalagem vácuo e certificação', temperature: 1, handler: 'Inspetor Federal', qualityBadge: true, tempBadge: true },
      { id: 'distribution', label: 'Transporte', icon: Truck, date: '16 Jan 2025', location: 'ES → PA via BR-101 + BR-153', status: 'completed', details: 'Transporte refrigerado 3.100 km', temperature: 0, handler: 'ColdMeat Logistics', carrier: 'ColdMeat Logistics', duration: '42h', distance: '3.100 km', tempBadge: true },
      { id: 'storage', label: 'Câmara Fria', icon: Warehouse, date: '18 Jan 2025', location: 'Câmara Fria Central, Belém-PA', status: 'completed', details: 'Armazenamento a -2°C', temperature: -2, handler: 'Carlos Souza' },
      { id: 'store', label: 'Açougue', icon: Home, date: '19 Jan 2025', location: 'Açougue Premium, Dom Eliseu-PA', status: 'active', details: 'Exposição refrigerada', temperature: 2, handler: 'Sr. Paulo Açougueiro' },
    ],
    certifications: [
      { id: 'organic', label: 'Organic', icon: Leaf, verified: false, description: 'Criação convencional', color: 'rgba(16,185,129,1)' },
      { id: 'fair-trade', label: 'Fair Trade', icon: Handshake, verified: true, description: 'Trabalho digno certificado', color: 'rgba(245,158,11,1)' },
      { id: 'non-gmo', label: 'Non-GMO', icon: ShieldCheck, verified: true, description: 'Ração sem transgênicos', color: 'rgba(59,130,246,1)' },
      { id: 'local', label: 'Local', icon: MapPin, verified: false, description: 'Importado do Espírito Santo', color: 'rgba(16,185,129,1)' },
    ],
    checkpoints: [
      { id: 'qc1', label: 'Classificação BMS', status: 'pass', date: '14 Jan 2025', inspector: 'Dr. Ricardo Mendes', notes: 'Marmobabilidade BMS 8 confirmada' },
      { id: 'qc2', label: 'Inspeção Sanitária', status: 'pass', date: '15 Jan 2025', inspector: 'Serviço Federal', notes: 'SIF 8834 - Aprovado' },
      { id: 'qc3', label: 'Temperatura Transporte', status: 'pass', date: '17 Jan 2025', inspector: 'Sensor IoT', notes: 'Máxima de 0.8°C registrada' },
      { id: 'qc4', label: 'Chegada Belém', status: 'fail', date: '18 Jan 2025', inspector: 'Inspetor Belém', notes: 'Pico de 3.2°C detectado por 12min' },
      { id: 'qc5', label: 'Inspeção Final', status: 'pass', date: '19 Jan 2025', inspector: 'Sr. Paulo', notes: 'Aparência e odor normais' },
    ],
    temperatureLog: [
      { hour: '00h', temp: -2.2 }, { hour: '02h', temp: -2.0 }, { hour: '04h', temp: -1.8 },
      { hour: '06h', temp: -0.5 }, { hour: '08h', temp: 0.8 }, { hour: '10h', temp: 0.2 },
      { hour: '12h', temp: -1.2 }, { hour: '14h', temp: -1.8 }, { hour: '16h', temp: -2.0 },
      { hour: '18h', temp: -1.5 },
    ],
    producer: {
      name: 'Dr. Ricardo Mendes',
      avatar: '👨‍🔬',
      city: 'Cachoeiro de Itapemirim',
      state: 'ES',
      sinceYear: 2010,
      rating: 4.6,
      totalReviews: 67,
      productsCount: 4,
      story: 'Veterinário e pecuarista com mestrado em genética bovina. Criador de Wagyu de raça pura Kuroge com certificação internacional.',
    },
    routeWaypoints: [
      { x: 72, y: 72, label: 'Fazenda' },
      { x: 70, y: 68, label: 'Vitória' },
      { x: 68, y: 55, label: 'BR-101' },
      { x: 55, y: 45, label: 'Belém' },
      { x: 52, y: 35, label: 'Destino' },
    ],
    routePath: 'M72 72 Q70 68 68 55 Q62 45 55 45 Q52 40 52 35',
    distanceKm: 3100,
    nutritionalInfo: [
      { label: 'Calorias', value: '250', unit: 'kcal' },
      { label: 'Proteína', value: '26', unit: 'g' },
      { label: 'Gordura Marm.', value: '18', unit: 'g' },
      { label: 'Ômega-3', value: '0.15', unit: 'g' },
    ],
    qrCode: 'https://domplace.app/track/p2d-wagyu-beef',
  },
]

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const TEMP_CHART_W = 280
const TEMP_CHART_H = 90
const TEMP_PAD = 26

function tempToY(temp: number, min: number, max: number): number {
  const range = max - min
  const clamped = Math.max(min, Math.min(max, temp))
  const ratio = 1 - (clamped - min) / range
  return TEMP_PAD + ratio * (TEMP_CHART_H - TEMP_PAD * 2)
}

function getTempColor(temp: number, min: number, max: number): string {
  if (temp >= min && temp <= max) return 'rgba(16,185,129,1)'
  if (temp < min - 2 || temp > max + 2) return 'rgba(239,68,68,1)'
  return 'rgba(245,158,11,1)'
}

function getStepColor(status: 'completed' | 'active' | 'pending'): string {
  if (status === 'completed') return 'rgba(16,185,129,1)'
  if (status === 'active') return 'rgba(59,130,246,1)'
  return 'rgba(148,163,184,1)'
}

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════ */

function SustainabilityRing({ score, isVisible }: { score: number; isVisible: boolean }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 10)

  const ringColor = score >= 8 ? 'rgba(16,185,129,1)' : score >= 5 ? 'rgba(245,158,11,1)' : 'rgba(239,68,68,1)'
  const ringGlow = score >= 8 ? 'rgba(16,185,129,0.25)' : score >= 5 ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)'

  return (
    <div className="r44-ring-card relative flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border">
      <svg viewBox="0 0 80 80" className="r44-ring-svg w-20 h-20">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="6" />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={isVisible ? { strokeDashoffset: offset } : {}}
          transition={{ duration: 1.8, ease: 'easeOut' as const, delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${ringGlow})` }}
          transform="rotate(-90 40 40)"
        />
        <motion.text
          x="40"
          y="38"
          textAnchor="middle"
          fill={ringColor}
          fontSize="16"
          fontWeight="bold"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 1, type: 'spring' as const, stiffness: 400, damping: 18 }}
          className="select-none"
        >
          {score}
        </motion.text>
        <text x="40" y="50" textAnchor="middle" fill="rgba(148,163,184,0.7)" fontSize="6" className="select-none">
          /10
        </text>
      </svg>
      <span className="text-[10px] font-bold text-foreground">Sustentabilidade</span>
      <span className="text-[8px] text-muted-foreground text-center">
        {score >= 8 ? 'Excelente' : score >= 5 ? 'Moderado' : 'Baixo'}
      </span>
    </div>
  )
}

function CarbonDisplay({ kg, isVisible }: { kg: number; isVisible: boolean }) {
  const color = kg <= 3 ? 'rgba(16,185,129,1)' : kg <= 8 ? 'rgba(245,158,11,1)' : 'rgba(239,68,68,1)'
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isVisible ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay: 0.4, type: 'spring' as const, stiffness: 300, damping: 22 }}
      className="r44-carbon-card flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border"
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
        className="h-10 w-10 rounded-full flex items-center justify-center"
        style={{ background: `${color}15`, border: `2px solid ${color}30` }}
      >
        <CloudSun className="h-5 w-5" style={{ color }} />
      </motion.div>
      <div className="text-center">
        <span className="text-lg font-extrabold" style={{ color }}>{kg.toFixed(1)}</span>
        <span className="text-[9px] font-semibold text-muted-foreground ml-0.5">kg</span>
      </div>
      <span className="text-[9px] font-semibold text-muted-foreground">CO₂ na jornada</span>
    </motion.div>
  )
}

function FreshnessBar({ daysFresh, totalDays, isVisible }: { daysFresh: number; totalDays: number; isVisible: boolean }) {
  const pct = Math.round((daysFresh / totalDays) * 100)
  const color = pct >= 60 ? 'rgba(16,185,129,1)' : pct >= 30 ? 'rgba(245,158,11,1)' : 'rgba(239,68,68,1)'
  const gradientId = `freshGrad-${daysFresh}`
  return (
    <div className="r44-freshness-card flex flex-col gap-1.5 p-3 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" style={{ color }} />
          Frescor
        </span>
        <span className="text-[9px] text-muted-foreground">{daysFresh}/{totalDays} dias</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={isVisible ? { width: `${pct}%` } : {}}
          transition={{ duration: 1.5, ease: 'easeOut' as const, delay: 0.3 }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
      <span className="text-[8px] text-muted-foreground text-center">{pct}% restante</span>
    </div>
  )
}

function BrazilRouteMap({ product, isVisible }: { product: ProductData2; isVisible: boolean }) {
  const { routePath, routeWaypoints, distanceKm } = product
  return (
    <div className="r44-map-container relative rounded-xl overflow-hidden bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/15 dark:to-teal-950/15 border border-border">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(16,185,129,1) 1px, transparent 1px)',
          backgroundSize: '10px 10px',
        }}
      />
      <svg viewBox="0 0 100 85" className="w-full h-auto" fill="none">
        <path
          d="M60 8 C75 5 100 15 108 30 C115 45 110 65 100 80 C90 95 75 110 60 118 C45 110 25 100 18 85 C10 70 8 50 15 35 C22 20 45 10 60 8Z"
          fill="rgba(16,185,129,0.06)"
          stroke="rgba(16,185,129,0.2)"
          strokeWidth="0.6"
        />
        <path
          d="M48 10 C55 8 68 12 78 20 C85 26 92 35 88 42 C84 48 70 46 60 50 C52 52 42 46 38 38 C34 30 40 14 48 10Z"
          fill="rgba(16,185,129,0.15)"
          stroke="rgba(16,185,129,0.4)"
          strokeWidth="0.6"
        />
        <text x="60" y="22" textAnchor="middle" fill="rgba(16,185,129,0.6)" fontSize="3" fontWeight="bold" className="select-none">PARÁ</text>
        <path d={routePath} stroke="rgba(16,185,129,0.12)" strokeWidth="1.2" strokeDasharray="2 1.5" />
        <motion.path
          d={routePath}
          stroke="rgba(16,185,129,1)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ strokeDasharray: '400', strokeDashoffset: 400 }}
          animate={isVisible ? { strokeDashoffset: 0 } : {}}
          transition={{ duration: 2.5, ease: 'easeInOut' as const }}
        />
        {routeWaypoints.map((wp, idx) => (
          <motion.g key={wp.label}>
            <motion.circle
              cx={wp.x}
              cy={wp.y}
              r={idx === 0 || idx === routeWaypoints.length - 1 ? 2.5 : 1.5}
              fill={idx === 0 || idx === routeWaypoints.length - 1 ? 'rgba(16,185,129,1)' : 'rgba(16,185,129,0.7)'}
              initial={{ scale: 0, opacity: 0 }}
              animate={isVisible ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.5 + idx * 0.4, type: 'spring' as const, stiffness: 400, damping: 20 }}
            />
            {idx < routeWaypoints.length - 1 && (
              <motion.circle
                r="1"
                fill="rgba(16,185,129,1)"
                initial={{ cx: wp.x, cy: wp.y, opacity: 0 }}
                animate={isVisible ? { cx: [wp.x, routeWaypoints[idx + 1].x], cy: [wp.y, routeWaypoints[idx + 1].y], opacity: [0, 1, 1, 0] } : {}}
                transition={{ delay: 1 + idx * 0.5, duration: 1.2, ease: 'easeInOut' as const }}
              />
            )}
          </motion.g>
        ))}
        <motion.g initial={{ scale: 0, opacity: 0 }} animate={isVisible ? { scale: 1, opacity: 1 } : {}} transition={{ delay: 0.3, type: 'spring' as const, stiffness: 300, damping: 20 }}>
          <text x={routeWaypoints[0].x} y={routeWaypoints[0].y - 5} textAnchor="middle" fontSize="6" className="select-none">🌱</text>
        </motion.g>
        <motion.g initial={{ scale: 0, opacity: 0 }} animate={isVisible ? { scale: 1, opacity: 1 } : {}} transition={{ delay: 2.5, type: 'spring' as const, stiffness: 300, damping: 20 }}>
          <text x={routeWaypoints[routeWaypoints.length - 1].x} y={routeWaypoints[routeWaypoints.length - 1].y - 5} textAnchor="middle" fontSize="6" className="select-none">🏠</text>
        </motion.g>
        <motion.text x={routeWaypoints[0].x - 6} y={routeWaypoints[0].y + 4} fill="rgba(16,185,129,0.8)" fontSize="2.5" fontWeight="bold" initial={{ opacity: 0 }} animate={isVisible ? { opacity: 1 } : {}} transition={{ delay: 0.6 }} className="select-none">{product.originCity}</motion.text>
        <motion.text x={routeWaypoints[routeWaypoints.length - 1].x + 4} y={routeWaypoints[routeWaypoints.length - 1].y + 3} fill="rgba(16,185,129,1)" fontSize="2.5" fontWeight="bold" initial={{ opacity: 0 }} animate={isVisible ? { opacity: 1 } : {}} transition={{ delay: 2.8 }} className="select-none">{product.destinationCity}</motion.text>
      </svg>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 8 }}
        animate={isVisible ? { opacity: 1, scale: 1, y: 0 } : {}}
        transition={{ delay: 3, type: 'spring' as const, stiffness: 350, damping: 22 }}
        className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/80 dark:bg-black/60 backdrop-blur-sm border border-emerald-200/40 dark:border-emerald-700/30 shadow-sm"
      >
        <Route className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">{distanceKm.toLocaleString('pt-BR')} km percorridos</span>
      </motion.div>
    </div>
  )
}

function SupplyChainTimeline({ steps, isVisible }: { steps: SupplyStep[]; isVisible: boolean }) {
  return (
    <div className="relative pl-7">
      <svg className="absolute left-[11px] top-2 bottom-2 w-1 h-full" preserveAspectRatio="none" viewBox="0 0 4 200">
        <defs>
          <linearGradient id="r44TimelineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(16,185,129,1)" />
            <stop offset="60%" stopColor="rgba(16,185,129,0.6)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0.4)" />
          </linearGradient>
        </defs>
        <motion.line x1="2" y1="0" x2="2" y2="200" stroke="url(#r44TimelineGrad)" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={isVisible ? { pathLength: 1 } : {}} transition={{ duration: 2, ease: 'easeInOut' as const, delay: 0.5 }} />
      </svg>
      {steps.map((step, idx) => {
        const Icon = step.icon
        const statusColor = getStepColor(step.status)
        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -16 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.8 + idx * 0.2, type: 'spring' as const, stiffness: 280, damping: 24 }}
            className="relative pb-5 last:pb-0"
          >
            <motion.div className="absolute left-[-20px] top-0.5" initial={{ scale: 0 }} animate={isVisible ? { scale: 1 } : {}} transition={{ delay: 0.8 + idx * 0.2, type: 'spring' as const, stiffness: 400, damping: 18 }}>
              <div className="h-5 w-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 bg-card" style={{ boxShadow: `0 0 0 3px ${statusColor}30` }}>
                {step.status === 'completed' ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                ) : step.status === 'active' ? (
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                  </motion.div>
                ) : (
                  <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                )}
              </div>
            </motion.div>
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-card">
                <Icon className="h-4 w-4" style={{ color: statusColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-xs font-bold" style={{ color: statusColor }}>{step.label}</span>
                  {step.qualityBadge && (
                    <motion.span initial={{ opacity: 0, scale: 0 }} animate={isVisible ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 1.4, type: 'spring' as const, stiffness: 350, damping: 20 }} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      <ShieldCheck className="h-2.5 w-2.5" /> QC OK
                    </motion.span>
                  )}
                  {step.tempBadge && (
                    <motion.span initial={{ opacity: 0, scale: 0 }} animate={isVisible ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 1.8, type: 'spring' as const, stiffness: 350, damping: 20 }} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      <Thermometer className="h-2.5 w-2.5" /> {step.temperature}°C
                    </motion.span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">{step.details}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground flex-wrap">
                  <span>{step.date}</span>
                  <span className="text-muted-foreground/40">•</span>
                  <span>{step.location}</span>
                </div>
                {step.handler && (
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
                    <User className="h-2.5 w-2.5" />
                    <span>{step.handler}</span>
                  </div>
                )}
                {step.carrier && (
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                    <span>🚚 {step.carrier}</span>
                    <span>📏 {step.distance}</span>
                    <span>⏱️ {step.duration}</span>
                  </div>
                )}
                {step.temperature !== undefined && !step.tempBadge && (
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                    <Thermometer className="h-2.5 w-2.5" />
                    <span>{step.temperature}°C</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function CertificationBadge({ badge, isVisible, delay }: { badge: CertificationBadge; isVisible: boolean; delay: number }) {
  const Icon = badge.icon
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={isVisible ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ delay, type: 'spring' as const, stiffness: 320, damping: 22 }}
      whileHover={{ scale: 1.04 }}
      className="r44-cert-badge relative flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-default"
      style={{ background: `${badge.color}08`, borderColor: `${badge.color}25` }}
    >
      {badge.verified && (
        <motion.div className="absolute -top-1.5 -right-1.5" initial={{ scale: 0 }} animate={isVisible ? { scale: 1 } : {}} transition={{ delay: delay + 0.3, type: 'spring' as const, stiffness: 400, damping: 18 }}>
          <div className="h-4 w-4 rounded-full flex items-center justify-center" style={{ background: badge.color }}>
            <CheckCircle2 className="h-3 w-3 text-white" />
          </div>
        </motion.div>
      )}
      <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: `${badge.color}15` }}>
        <Icon className="h-4 w-4" style={{ color: badge.color }} />
      </div>
      <span className="text-[10px] font-bold text-center leading-tight">{badge.label}</span>
      <span className="text-[8px] text-muted-foreground text-center leading-tight">{badge.description}</span>
    </motion.div>
  )
}

function QualityCheckpointRow({ checkpoint, isVisible, delay }: { checkpoint: QualityCheckpoint; isVisible: boolean; delay: number }) {
  const isPass = checkpoint.status === 'pass'
  const isFail = checkpoint.status === 'fail'
  const color = isPass ? 'rgba(16,185,129,1)' : isFail ? 'rgba(239,68,68,1)' : 'rgba(148,163,184,1)'
  const Icon = isPass ? CheckCircle2 : isFail ? XCircle : AlertTriangle
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={isVisible ? { opacity: 1, x: 0 } : {}}
      transition={{ delay, type: 'spring' as const, stiffness: 300, damping: 22 }}
      className="r44-checkpoint-row flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/30 border border-border/50"
    >
      <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}15` }}>
        <Icon className="h-3.5 w-3.5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-foreground">{checkpoint.label}</span>
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ color, background: `${color}12`, border: `1px solid ${color}25` }}>
            {isPass ? 'APROVADO' : isFail ? 'REPROVADO' : 'PENDENTE'}
          </span>
        </div>
        <p className="text-[9px] text-muted-foreground mt-0.5">{checkpoint.notes}</p>
        <div className="flex items-center gap-2 mt-1 text-[9px] text-muted-foreground">
          <span>{checkpoint.date}</span>
          <span className="text-muted-foreground/40">•</span>
          <span>{checkpoint.inspector}</span>
        </div>
      </div>
    </motion.div>
  )
}

function TemperatureLogChart({ product, isVisible }: { product: ProductData2; isVisible: boolean }) {
  const allTemps = product.temperatureLog.map(t => t.temp)
  const minTemp = Math.min(...allTemps) - 2
  const maxTemp = Math.max(...allTemps) + 2

  const points = product.temperatureLog.map((entry, idx) => {
    const x = (idx / (product.temperatureLog.length - 1)) * (TEMP_CHART_W - TEMP_PAD * 2) + TEMP_PAD
    const y = tempToY(entry.temp, minTemp, maxTemp)
    return { ...entry, x, y, color: getTempColor(entry.temp, minTemp, maxTemp) }
  })

  const pathD = points.map((p, i) => (i === 0 ? `M${p.x} ${p.y}` : `L${p.x} ${p.y}`)).join(' ')
  const areaD = `${pathD} L${points[points.length - 1].x} ${TEMP_CHART_H - TEMP_PAD} L${points[0].x} ${TEMP_CHART_H - TEMP_PAD} Z`

  return (
    <div className="r44-temp-chart-container relative rounded-xl overflow-hidden bg-card border border-border p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Thermometer className="h-3.5 w-3.5 text-blue-500" />
        <span className="text-[10px] font-semibold text-foreground">Log de Temperatura</span>
      </div>
      <svg viewBox={`0 0 ${TEMP_CHART_W} ${TEMP_CHART_H}`} className="w-full h-auto">
        <rect x={TEMP_PAD} y={tempToY(maxTemp, minTemp, maxTemp)} width={TEMP_CHART_W - TEMP_PAD * 2} height={tempToY(minTemp, minTemp, maxTemp) - tempToY(maxTemp, minTemp, maxTemp)} fill="rgba(16,185,129,0.06)" rx="3" />
        <line x1={TEMP_PAD} y1={tempToY(minTemp, minTemp, maxTemp)} x2={TEMP_CHART_W - TEMP_PAD} y2={tempToY(minTemp, minTemp, maxTemp)} stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" strokeDasharray="3 2" />
        <line x1={TEMP_PAD} y1={tempToY(maxTemp, minTemp, maxTemp)} x2={TEMP_CHART_W - TEMP_PAD} y2={tempToY(maxTemp, minTemp, maxTemp)} stroke="rgba(239,68,68,0.2)" strokeWidth="0.5" strokeDasharray="3 2" />
        <text x={TEMP_PAD + 2} y={tempToY(minTemp, minTemp, maxTemp) - 2} fill="rgba(59,130,246,0.5)" fontSize="3.5" className="select-none">{minTemp}°</text>
        <text x={TEMP_PAD + 2} y={tempToY(maxTemp, minTemp, maxTemp) + 6} fill="rgba(239,68,68,0.5)" fontSize="3.5" className="select-none">{maxTemp}°</text>
        <motion.path d={areaD} fill="rgba(16,185,129,0.08)" initial={{ opacity: 0 }} animate={isVisible ? { opacity: 1 } : {}} transition={{ duration: 1.5, delay: 0.5 }} />
        <motion.path d={pathD} fill="none" stroke="rgba(16,185,129,1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={isVisible ? { pathLength: 1 } : {}} transition={{ duration: 2, ease: 'easeInOut' as const, delay: 0.3 }} />
        {points.map((p, idx) => (
          <motion.circle key={p.hour} cx={p.x} cy={p.y} r="2" fill={p.color} stroke="white" strokeWidth="1" initial={{ scale: 0 }} animate={isVisible ? { scale: 1 } : {}} transition={{ delay: 0.5 + idx * 0.15, type: 'spring' as const, stiffness: 400, damping: 20 }} />
        ))}
        {points.map((p) => (
          <text key={`lbl-${p.hour}`} x={p.x} y={TEMP_CHART_H - 4} textAnchor="middle" fill="rgba(148,163,184,0.7)" fontSize="3.5" className="select-none">{p.hour}</text>
        ))}
      </svg>
    </div>
  )
}

function ProducerCard({ producer, isVisible }: { producer: ProductData2['producer']; isVisible: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={isVisible ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5, type: 'spring' as const, stiffness: 280, damping: 24 }} className="r44-producer-card rounded-xl bg-gradient-to-br from-amber-50/80 to-orange-50/60 dark:from-amber-950/15 dark:to-orange-950/10 border border-amber-200/40 dark:border-amber-800/25 p-4">
      <div className="flex items-start gap-3">
        <motion.div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-2xl shrink-0" initial={{ scale: 0 }} animate={isVisible ? { scale: 1 } : {}} transition={{ delay: 0.7, type: 'spring' as const, stiffness: 350, damping: 18 }}>
          {producer.avatar}
        </motion.div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100">{producer.name}</h4>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            <span className="text-[10px] text-muted-foreground">{producer.city}, {producer.state}</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <StarRating rating={producer.rating} />
            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">{producer.rating}</span>
            <span className="text-[10px] text-muted-foreground">({producer.totalReviews})</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">{producer.story}</p>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
            <span>🌱 Desde {producer.sinceYear}</span>
            <span>📦 {producer.productsCount} produtos</span>
          </div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-2.5">
            <motion.button className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[44px] rounded-lg bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white text-[10px] font-bold transition-colors cursor-pointer">
              <ExternalLink className="h-3 w-3" />
              Ver Produtor
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

function NutritionalInfoPanel({ items, isVisible }: { items: ProductData2['nutritionalInfo']; isVisible: boolean }) {
  return (
    <div className="r44-nutrition-panel rounded-xl bg-card border border-border p-4">
      <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5 text-foreground">
        <Heart className="h-3.5 w-3.5 text-rose-500" />
        Informação Nutricional
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 + idx * 0.1, type: 'spring' as const, stiffness: 300, damping: 22 }}
            className="r44-nutrition-item flex items-center gap-2 p-2 rounded-lg bg-muted/30"
          >
            <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <Zap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <span className="text-[9px] text-muted-foreground block">{item.label}</span>
              <span className="text-xs font-bold text-foreground">{item.value}{item.unit ? ` ${item.unit}` : ''}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function QRCodeBlock({ qrCode, isVisible }: { qrCode: string; isVisible: boolean }) {
  const qrSize = 80
  const blocks = 7
  const cellSize = qrSize / (blocks + 2)
  const offset = cellSize

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isVisible ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay: 0.5, type: 'spring' as const, stiffness: 300, damping: 22 }}
      className="r44-qrcode-block flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border"
    >
      <span className="text-[10px] font-bold text-foreground flex items-center gap-1">
        <QrCode className="h-3.5 w-3.5" />
        Escaneie para rastrear
      </span>
      <div className="p-2 rounded-lg bg-white dark:bg-slate-900">
        <svg viewBox={`0 0 ${qrSize} ${qrSize}`} className="w-16 h-16">
          {Array.from({ length: blocks }).map((_, row) =>
            Array.from({ length: blocks }).map((_, col) => {
              const x = offset + col * cellSize
              const y = offset + row * cellSize
              const isCorner = (row < 2 && col < 2) || (row < 2 && col >= blocks - 2) || (row >= blocks - 2 && col < 2)
              const filled = isCorner || Math.random() > 0.5
              return (
                <rect
                  key={`${row}-${col}`}
                  x={x}
                  y={y}
                  width={cellSize * 0.85}
                  height={cellSize * 0.85}
                  rx={1}
                  fill={filled ? 'rgba(16,185,129,0.8)' : 'rgba(148,163,184,0.15)'}
                />
              )
            })
          )}
        </svg>
      </div>
      <span className="text-[8px] text-muted-foreground text-center max-w-[140px] break-all">{qrCode}</span>
    </motion.div>
  )
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`${cls} ${star <= Math.floor(rating) ? 'text-amber-400 fill-amber-400' : star - 0.5 <= rating ? 'text-amber-400 fill-amber-400/50' : 'text-slate-300 dark:text-slate-600'}`} />
      ))}
    </div>
  )
}

function SearchBar({ onSelect }: { onSelect: (product: ProductData2) => void }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const filtered = query.length > 0 ? mockProducts.filter(p => p.name.toLowerCase().includes(query.toLowerCase())) : []

  return (
    <div className="r44-search-bar relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Rastrear outro produto..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted/50 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
        />
        {query && (
          <button onClick={() => { setQuery(''); inputRef.current?.focus() }} className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 min-h-[44px] min-w-[44px] rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors cursor-pointer">
            <XCircle className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>
      <AnimatePresence>
        {filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="absolute z-20 top-full mt-1 left-0 right-0 rounded-lg bg-card border border-border shadow-lg overflow-hidden max-h-48 overflow-y-auto custom-scrollbar"
          >
            {filtered.map((product) => (
              <motion.button
                key={product.id}
                whileHover={{ backgroundColor: 'rgba(16,185,129,0.05)' }}
                onClick={() => { onSelect(product); setQuery('') }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left cursor-pointer transition-colors"
              >
                <span className="text-lg">{product.emoji}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-foreground block truncate">{product.name}</span>
                  <span className="text-[9px] text-muted-foreground">{product.originCity}, {product.originState}</span>
                </div>
                <BarChart3 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export function ProductOriginTracker2() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductData2>(mockProducts[0])
  const [activeTab, setActiveTab] = useState<'overview' | 'quality' | 'nutrition'>('overview')

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  const handleProductSelect = (product: ProductData2) => {
    setSelectedProduct(product)
    setIsExpanded(true)
    setActiveTab('overview')
  }

  return (
    <div className="r44-origin-tracker bg-card rounded-2xl border border-border overflow-hidden">
      {/* ── Header ── */}
      <motion.button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-4 cursor-pointer"
        whileHover={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={isVisible ? { scale: 1 } : {}}
            transition={{ type: 'spring' as const, stiffness: 350, damping: 20 }}
          >
            <Globe className="h-5 w-5 text-white" />
          </motion.div>
          <div className="text-left">
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              Rastreio de Origem
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold">v2</span>
            </h3>
            <p className="text-[10px] text-muted-foreground">Transparência completa da cadeia</p>
          </div>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}>
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </motion.button>

      {/* ── Expandable Content ── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring' as const, stiffness: 200, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-5">
              {/* ── Product Selector ── */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: 'spring' as const, stiffness: 280, damping: 22 }}>
                <SearchBar onSelect={handleProductSelect} />
                <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar pb-1">
                  {mockProducts.map((p) => (
                    <motion.div
                      key={p.id}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleProductSelect(p)}
                      className={`r44-product-chip shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border cursor-pointer transition-all ${
                        selectedProduct.id === p.id
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 shadow-sm'
                          : 'bg-card border-border hover:border-emerald-200 dark:hover:border-emerald-800'
                      }`}
                    >
                      <span className="text-base">{p.emoji}</span>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-foreground block truncate max-w-[120px]">{p.name}</span>
                        <span className="text-[8px] text-muted-foreground">{p.originCity}-{p.originState}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* ── Stats Row ── */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, type: 'spring' as const, stiffness: 280, damping: 22 }} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <SustainabilityRing score={selectedProduct.sustainabilityScore} isVisible={isVisible} />
                <CarbonDisplay kg={selectedProduct.carbonFootprint} isVisible={isVisible} />
                <FreshnessBar daysFresh={selectedProduct.daysFresh} totalDays={selectedProduct.totalFreshDays} isVisible={isVisible} />
              </motion.div>

              {/* ── Tabs ── */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, type: 'spring' as const, stiffness: 280, damping: 22 }} className="flex bg-muted/50 rounded-lg p-0.5">
                {(['overview', 'quality', 'nutrition'] as const).map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-1.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                      activeTab === tab ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {{ overview: '🔍 Rota & Cadeia', quality: '✅ Qualidade', nutrition: '🥗 Nutrição' }[tab]}
                  </motion.button>
                ))}
              </motion.div>

              {/* ── Overview Tab ── */}
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  {/* Route Map */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, type: 'spring' as const, stiffness: 280, damping: 22 }}>
                    <h4 className="text-xs font-bold mb-2.5 flex items-center gap-1.5 text-foreground">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                      Mapa da Jornada — {selectedProduct.originState} → {selectedProduct.destinationCity}
                    </h4>
                    <BrazilRouteMap product={selectedProduct} isVisible={isVisible} />
                  </motion.div>

                  {/* Supply Chain Timeline */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: 'spring' as const, stiffness: 280, damping: 22 }}>
                    <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5 text-foreground">
                      <Truck className="h-3.5 w-3.5 text-emerald-500" />
                      Cadeia de Suprimento Completa
                    </h4>
                    <SupplyChainTimeline steps={selectedProduct.supplyChain} isVisible={isVisible} />
                  </motion.div>

                  {/* Certifications */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, type: 'spring' as const, stiffness: 280, damping: 22 }}>
                    <h4 className="text-xs font-bold mb-2.5 flex items-center gap-1.5 text-foreground">
                      <Award className="h-3.5 w-3.5 text-amber-500" />
                      Certificações
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {selectedProduct.certifications.map((badge, idx) => (
                        <CertificationBadge key={badge.id} badge={badge} isVisible={isVisible} delay={0.4 + idx * 0.12} />
                      ))}
                    </div>
                  </motion.div>

                  {/* Temperature Log */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, type: 'spring' as const, stiffness: 280, damping: 22 }}>
                    <h4 className="text-xs font-bold mb-2.5 flex items-center gap-1.5 text-foreground">
                      <Thermometer className="h-3.5 w-3.5 text-blue-500" />
                      Monitoramento de Temperatura
                    </h4>
                    <TemperatureLogChart product={selectedProduct} isVisible={isVisible} />
                  </motion.div>

                  {/* Producer */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, type: 'spring' as const, stiffness: 280, damping: 22 }}>
                    <h4 className="text-xs font-bold mb-2.5 flex items-center gap-1.5 text-foreground">
                      <Sprout className="h-3.5 w-3.5 text-emerald-500" />
                      Produtor
                    </h4>
                    <ProducerCard producer={selectedProduct.producer} isVisible={isVisible} />
                  </motion.div>

                  {/* QR Code */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, type: 'spring' as const, stiffness: 280, damping: 22 }}>
                    <QRCodeBlock qrCode={selectedProduct.qrCode} isVisible={isVisible} />
                  </motion.div>
                </div>
              )}

              {/* ── Quality Tab ── */}
              {activeTab === 'quality' && (
                <div className="space-y-3">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: 'spring' as const, stiffness: 280, damping: 22 }}>
                    <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5 text-foreground">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      Pontos de Inspeção de Qualidade
                    </h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                      {selectedProduct.checkpoints.map((cp, idx) => (
                        <QualityCheckpointRow key={cp.id} checkpoint={cp} isVisible={isVisible} delay={0.2 + idx * 0.1} />
                      ))}
                    </div>
                  </motion.div>
                  {/* Summary */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, type: 'spring' as const, stiffness: 280, damping: 22 }} className="r44-quality-summary flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200/40 dark:border-emerald-800/25">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-200 block">
                        {selectedProduct.checkpoints.filter(c => c.status === 'pass').length}/{selectedProduct.checkpoints.length} inspeções aprovadas
                      </span>
                      <span className="text-[9px] text-emerald-700/70 dark:text-emerald-300/70">
                        {selectedProduct.checkpoints.some(c => c.status === 'fail') ? 'Atenção: 1 observação registrada' : 'Todas as etapas dentro do padrão'}
                      </span>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* ── Nutrition Tab ── */}
              {activeTab === 'nutrition' && (
                <div className="space-y-5">
                  <NutritionalInfoPanel items={selectedProduct.nutritionalInfo} isVisible={isVisible} />
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: 'spring' as const, stiffness: 280, damping: 22 }} className="r44-nutrition-note flex items-start gap-2 p-3 rounded-xl bg-muted/30 border border-border">
                    <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-foreground block">Nota Nutricional</span>
                      <span className="text-[9px] text-muted-foreground">Valores por porção padrão. Consulte o rótulo oficial para informações completas.</span>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
