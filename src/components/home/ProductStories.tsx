'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import { X, Eye, Heart, ChevronDown, ShoppingBag, Play, Pause, Sparkles, Star, MessageCircle, Share2, BookmarkPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useAppStore, type ProductData } from '@/store/useAppStore'

/* ═══════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════ */

interface StorySlide {
  id: string
  type: 'showcase' | 'offer' | 'behind' | 'cta'
  emoji: string
  title: string
  subtitle: string
  body: string
  ctaLabel: string
  ctaAction: string
  gradient: string
  productId?: string
  price?: number
  comparePrice?: number | null
  badge?: string
  badgeColor?: string
  productName?: string
  storeName?: string
  discount?: number
}

interface StoryGroup {
  id: string
  storeName: string
  storeInitial: string
  storeLogo: string | null
  gradientFrom: string
  gradientTo: string
  avatarBg: string
  isLive: boolean
  views: number
  likes: number
  slides: StorySlide[]
}

interface StoryHighlight {
  id: string
  label: string
  emoji: string
  gradientFrom: string
  gradientTo: string
  coverBg: string
  storyCount: number
}

/* ═══════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════ */

const SLIDE_DURATION = 5000
const SWIPE_THRESHOLD = 80

const categoryIcons: Record<string, string> = {
  FOOD: '🍚',
  HEALTH: '💊',
  AGRICULTURE: '🌿',
  ANIMALS: '🐾',
  BEAUTY: '💅',
  ELECTRONICS: '📱',
  SERVICES: '🔧',
  FASHION: '👗',
  HOME_GARDEN: '🏡',
  EDUCATION: '📚',
  SPORTS: '⚽',
  OTHER: '📦',
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

/* ═══════════════════════════════════════════════════════════════════
   Mock Data — 10 stories from stores/products
   ═══════════════════════════════════════════════════════════════════ */

const storyData: StoryGroup[] = [
  {
    id: 'story-1',
    storeName: 'Açaí da Boa',
    storeInitial: 'A',
    storeLogo: '/images/acai.jpg',
    gradientFrom: '#8b5cf6',
    gradientTo: '#ec4899',
    avatarBg: 'from-violet-500 to-pink-500',
    isLive: true,
    views: 1243,
    likes: 389,
    slides: [
      {
        id: 's1-1',
        type: 'showcase',
        emoji: '🍇',
        title: 'Novo Açaí Premium',
        subtitle: 'Acabou de chegar',
        body: 'Açaí cremoso 700ml com granola artesanal, banana, leite condensado e frutas frescas da Amazônia.',
        ctaLabel: 'Veja o Produto',
        ctaAction: 'product',
        gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
        productId: 'p6',
        price: 22.0,
        comparePrice: 28.0,
        productName: 'Açaí Premium 700ml',
        storeName: 'Açaí da Boa',
        discount: 21,
        badge: 'Novo',
        badgeColor: 'bg-violet-500',
      },
      {
        id: 's1-2',
        type: 'offer',
        emoji: '🔥',
        title: 'Combo Especial',
        subtitle: 'Oferta por tempo limitado',
        body: 'Leve 2 Açaí 500ml por apenas R$ 25,00. Economize R$ 5,00! Promoção válida até o fim da semana.',
        ctaLabel: 'Aproveitar Oferta',
        ctaAction: 'product',
        gradient: 'from-orange-500 via-red-500 to-rose-600',
        productId: 'p5',
        price: 25.0,
        comparePrice: 30.0,
        productName: 'Combo Açaí 2x 500ml',
        storeName: 'Açaí da Boa',
        discount: 17,
        badge: '-17%',
        badgeColor: 'bg-red-500',
      },
      {
        id: 's1-3',
        type: 'behind',
        emoji: '🌿',
        title: 'Bastidores do Açaí',
        subtitle: 'Direto da Amazônia',
        body: 'Conheça a jornada dos frutos frescos do Pará até o seu copo. Colhidos manualmente por famílias locais de forma sustentável.',
        ctaLabel: 'Saiba Mais',
        ctaAction: 'product',
        gradient: 'from-emerald-500 via-green-600 to-teal-600',
      },
      {
        id: 's1-4',
        type: 'cta',
        emoji: '🛒',
        title: 'Peça Agora!',
        subtitle: 'Entrega em até 30 min',
        body: 'Com o melhor açaí de Dom Eliseu na porta da sua casa. Acompanhe o pedido em tempo real pelo app.',
        ctaLabel: 'Comprar Agora',
        ctaAction: 'cart',
        productId: 'p5',
        price: 15.0,
        comparePrice: 18.0,
        productName: 'Açaí 500ml',
        storeName: 'Açaí da Boa',
        discount: 17,
        badge: 'Entrega Grátis',
        badgeColor: 'bg-emerald-500',
        gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      },
    ],
  },
  {
    id: 'story-2',
    storeName: 'Padaria Pão Quente',
    storeInitial: 'P',
    storeLogo: '/images/bakery.jpg',
    gradientFrom: '#f97316',
    gradientTo: '#eab308',
    avatarBg: 'from-orange-500 to-yellow-500',
    isLive: false,
    views: 876,
    likes: 245,
    slides: [
      {
        id: 's2-1',
        type: 'showcase',
        emoji: '🍞',
        title: 'Pão Artesanal',
        subtitle: 'Receita exclusiva',
        body: 'Novo pão de fermentação natural com 48h de maturação. Crocante por fora, macio por dentro. Feito com farinha orgânica.',
        ctaLabel: 'Experimentar',
        ctaAction: 'product',
        gradient: 'from-amber-500 via-orange-500 to-yellow-600',
        productId: 'p17',
        price: 6.0,
        productName: 'Pão Francês (6 un)',
        storeName: 'Padaria Pão Quente',
        badge: 'Artesanal',
        badgeColor: 'bg-amber-600',
      },
      {
        id: 's2-2',
        type: 'offer',
        emoji: '🧁',
        title: 'Kit Café da Manhã',
        subtitle: 'Economize 30%',
        body: 'Pão + café + suco natural por apenas R$ 12,90. O café da manhã perfeito para começar o dia com energia!',
        ctaLabel: 'Pedir Kit',
        ctaAction: 'cart',
        gradient: 'from-rose-400 via-pink-500 to-red-500',
        price: 12.9,
        comparePrice: 18.5,
        productName: 'Kit Café da Manhã',
        storeName: 'Padaria Pão Quente',
        discount: 30,
        badge: '-30%',
        badgeColor: 'bg-red-500',
      },
      {
        id: 's2-3',
        type: 'behind',
        emoji: '👨‍🍳',
        title: 'Nosso Padeiro',
        subtitle: 'Mestre Joaquim',
        body: 'Há 25 anos preparando pão fresquinho toda madrugada às 4h. Cada pão carrega tradição e amor pela arte de assar.',
        ctaLabel: 'Conheça a Padaria',
        ctaAction: 'product',
        gradient: 'from-sky-500 via-blue-500 to-indigo-600',
      },
    ],
  },
  {
    id: 'story-3',
    storeName: 'Mercado do Zé',
    storeInitial: 'M',
    storeLogo: '/images/grocery.jpg',
    gradientFrom: '#10b981',
    gradientTo: '#06b6d4',
    avatarBg: 'from-emerald-500 to-teal-500',
    isLive: false,
    views: 2104,
    likes: 567,
    slides: [
      {
        id: 's3-1',
        type: 'showcase',
        emoji: '🍚',
        title: 'Arroz Tio João 5kg',
        subtitle: 'Mais vendido da semana',
        body: 'Arroz tipo 1 premium com grãos selecionados. Ideal para o dia a dia da sua família com qualidade garantida.',
        ctaLabel: 'Adicionar ao Carrinho',
        ctaAction: 'cart',
        gradient: 'from-green-500 via-emerald-500 to-teal-600',
        productId: 'p1',
        price: 24.9,
        comparePrice: 29.9,
        productName: 'Arroz Tio João 5kg',
        storeName: 'Mercado do Zé',
        discount: 17,
        badge: '-17%',
        badgeColor: 'bg-emerald-500',
      },
      {
        id: 's3-2',
        type: 'offer',
        emoji: '📦',
        title: 'Feira em Casa',
        subtitle: 'Compre pelo app',
        body: 'Entrega gratuita em compras acima de R$ 50. Mais de 500 produtos frescos com preços de feira direto na sua porta.',
        ctaLabel: 'Ver Produtos',
        ctaAction: 'product',
        gradient: 'from-teal-500 via-cyan-500 to-blue-600',
        badge: 'Frete Grátis',
        badgeColor: 'bg-teal-500',
      },
      {
        id: 's3-3',
        type: 'behind',
        emoji: '🏪',
        title: '50 Anos de Tradição',
        subtitle: 'História do Mercado',
        body: 'Desde 1975 servindo as famílias de Dom Eliseu com produtos frescos, preços justos e atendimento com carinho.',
        ctaLabel: 'Nossa História',
        ctaAction: 'product',
        gradient: 'from-amber-600 via-yellow-500 to-orange-500',
      },
      {
        id: 's3-4',
        type: 'cta',
        emoji: '🛒',
        title: 'Compre Sem Sair',
        subtitle: 'Conforto e praticidade',
        body: 'Faça suas compras no Mercado do Zé pelo app e receba em casa. Pagamento seguro e entrega rápida.',
        ctaLabel: 'Começar a Comprar',
        ctaAction: 'cart',
        productId: 'p2',
        price: 8.9,
        productName: 'Feijão Carioca 1kg',
        storeName: 'Mercado do Zé',
        gradient: 'from-emerald-500 via-green-500 to-teal-500',
      },
    ],
  },
  {
    id: 'story-4',
    storeName: 'Salão da Bella',
    storeInitial: 'B',
    storeLogo: '/images/beauty.jpg',
    gradientFrom: '#ec4899',
    gradientTo: '#f43f5e',
    avatarBg: 'from-pink-500 to-rose-500',
    isLive: true,
    views: 654,
    likes: 421,
    slides: [
      {
        id: 's4-1',
        type: 'showcase',
        emoji: '💇‍♀️',
        title: 'Mega Brush',
        subtitle: 'Tendência 2025',
        body: 'Escova progressiva com produtos orgânicos e sem formol. Resultado natural com brilho intenso por até 3 meses.',
        ctaLabel: 'Agendar Horário',
        ctaAction: 'product',
        gradient: 'from-pink-500 via-rose-500 to-red-500',
        badge: 'Trend',
        badgeColor: 'bg-pink-500',
      },
      {
        id: 's4-2',
        type: 'offer',
        emoji: '✨',
        title: 'Black Friday Bella',
        subtitle: 'Até 50% off',
        body: 'Corte + Coloração + Hidratação por R$ 89,90 (de R$ 180,00). Vagas limitadas para esta semana!',
        ctaLabel: 'Reservar Agora',
        ctaAction: 'product',
        gradient: 'from-violet-500 via-purple-600 to-fuchsia-600',
        price: 89.9,
        comparePrice: 180.0,
        productName: 'Combo Tratamento Completo',
        storeName: 'Salão da Bella',
        discount: 50,
        badge: '-50%',
        badgeColor: 'bg-violet-500',
      },
      {
        id: 's4-3',
        type: 'cta',
        emoji: '预约',
        title: 'Agende pelo App',
        subtitle: 'Prático e rápido',
        body: 'Escolha horário, profissional e serviço. Receba confirmação instantânea e lembretes automáticos.',
        ctaLabel: 'Agendar Agora',
        ctaAction: 'product',
        gradient: 'from-rose-400 via-pink-500 to-fuchsia-500',
      },
    ],
  },
  {
    id: 'story-5',
    storeName: 'Pet Shop Amigo Fiel',
    storeInitial: 'P',
    storeLogo: '/images/pets.jpg',
    gradientFrom: '#06b6d4',
    gradientTo: '#3b82f6',
    avatarBg: 'from-cyan-500 to-blue-500',
    isLive: false,
    views: 432,
    likes: 198,
    slides: [
      {
        id: 's5-1',
        type: 'showcase',
        emoji: '🐾',
        title: 'Ração Premium',
        subtitle: 'Novidade na loja',
        body: 'Ração super premium para cães e gatos com proteínas de alta qualidade. Linha completa para todas as idades.',
        ctaLabel: 'Ver Rações',
        ctaAction: 'product',
        gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
        badge: 'Novo',
        badgeColor: 'bg-blue-500',
      },
      {
        id: 's5-2',
        type: 'offer',
        emoji: '🛁',
        title: 'Banho + Tosa',
        subtitle: 'Preço especial',
        body: 'Banho completo com hidratação + tosa higiênica por R$ 45,00. Agende para esta semana e ganhe 10% de desconto!',
        ctaLabel: 'Agendar Banho',
        ctaAction: 'product',
        gradient: 'from-sky-400 via-blue-500 to-cyan-500',
        price: 45.0,
        comparePrice: 60.0,
        discount: 25,
        badge: '-25%',
        badgeColor: 'bg-sky-500',
      },
      {
        id: 's5-3',
        type: 'behind',
        emoji: '🐕',
        title: 'Dicas de Cuidado',
        subtitle: 'Bem-estar do pet',
        body: 'Aprenda com nossos veterinários as melhores dicas para manter seu pet saudável, feliz e cheio de energia.',
        ctaLabel: 'Ver Dicas',
        ctaAction: 'product',
        gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
      },
      {
        id: 's5-4',
        type: 'cta',
        emoji: '🛒',
        title: 'Compre pelo App',
        subtitle: 'Entrega rápida',
        body: 'Rações, brinquedos, higiene e muito mais com entrega rápida em Dom Eliseu. Seu pet merece o melhor!',
        ctaLabel: 'Comprar para Meu Pet',
        ctaAction: 'cart',
        gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
      },
    ],
  },
  {
    id: 'story-6',
    storeName: 'Loja do Eletrônico',
    storeInitial: 'E',
    storeLogo: '/images/electronics.jpg',
    gradientFrom: '#6366f1',
    gradientTo: '#8b5cf6',
    avatarBg: 'from-indigo-500 to-violet-500',
    isLive: false,
    views: 1567,
    likes: 432,
    slides: [
      {
        id: 's6-1',
        type: 'showcase',
        emoji: '📱',
        title: 'Smartphones em Promo',
        subtitle: 'Chegaram novidades',
        body: 'Novos smartphones com as melhores ofertas da região. Garantia de fábrica e parcelamento em até 12x sem juros.',
        ctaLabel: 'Ver Ofertas',
        ctaAction: 'product',
        gradient: 'from-indigo-500 via-violet-500 to-purple-600',
        badge: 'Hot',
        badgeColor: 'bg-indigo-500',
      },
      {
        id: 's6-2',
        type: 'offer',
        emoji: '🎧',
        title: 'Fone Bluetooth',
        subtitle: 'Super oferta',
        body: 'Fone de ouvido Bluetooth 5.0 com cancelamento de ruído ativo. Bateria de 24h por apenas R$ 79,90!',
        ctaLabel: 'Comprar Fone',
        ctaAction: 'cart',
        gradient: 'from-purple-500 via-fuchsia-500 to-pink-500',
        price: 79.9,
        comparePrice: 149.9,
        discount: 47,
        badge: '-47%',
        badgeColor: 'bg-purple-500',
      },
      {
        id: 's6-3',
        type: 'cta',
        emoji: '⚡',
        title: 'Aproveite Agora',
        subtitle: 'Ofertas por tempo limitado',
        body: 'Visite nossa loja virtual e confira centenas de produtos eletrônicos com os melhores preços de Dom Eliseu.',
        ctaLabel: 'Visitar Loja',
        ctaAction: 'product',
        gradient: 'from-blue-500 via-indigo-500 to-violet-600',
      },
    ],
  },
  {
    id: 'story-7',
    storeName: 'Farmácia Vida',
    storeInitial: 'F',
    storeLogo: '/images/pharmacy.jpg',
    gradientFrom: '#14b8a6',
    gradientTo: '#22d3ee',
    avatarBg: 'from-teal-500 to-cyan-400',
    isLive: false,
    views: 789,
    likes: 312,
    slides: [
      {
        id: 's7-1',
        type: 'showcase',
        emoji: '💊',
        title: 'Vitamina C 500mg',
        subtitle: 'Imunidade reforçada',
        body: 'Pote com 60 cápsulas de Vitamina C pura. Fortaleça sua imunidade com a melhor qualidade a preços acessíveis.',
        ctaLabel: 'Comprar Vitamina C',
        ctaAction: 'cart',
        gradient: 'from-teal-500 via-cyan-500 to-sky-500',
        productId: 'p13',
        price: 35.0,
        comparePrice: 42.0,
        productName: 'Vitamina C 500mg',
        storeName: 'Farmácia Vida',
        discount: 17,
        badge: 'Saúde',
        badgeColor: 'bg-teal-500',
      },
      {
        id: 's7-2',
        type: 'offer',
        emoji: '🧴',
        title: 'Kit Higiene',
        subtitle: 'Economize 40%',
        body: 'Shampoo + Condicionador + Sabonete líquido por R$ 29,90. Produtos dermatologicamente testados.',
        ctaLabel: 'Pegar Kit',
        ctaAction: 'cart',
        gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
        price: 29.9,
        comparePrice: 49.9,
        discount: 40,
        badge: '-40%',
        badgeColor: 'bg-emerald-500',
      },
      {
        id: 's7-3',
        type: 'behind',
        emoji: '👩‍⚕️',
        title: 'Dica da Farmacêutica',
        subtitle: 'Cuidado com a saúde',
        body: 'Nossa farmacêutica Dra. Maria explica como fortalecer a imunidade no inverno com vitaminas e alimentação adequada.',
        ctaLabel: 'Ver Mais Dicas',
        ctaAction: 'product',
        gradient: 'from-sky-400 via-cyan-500 to-blue-500',
      },
    ],
  },
  {
    id: 'story-8',
    storeName: 'Agropecuária SP',
    storeInitial: 'A',
    storeLogo: '/images/agriculture.jpg',
    gradientFrom: '#84cc16',
    gradientTo: '#22c55e',
    avatarBg: 'from-lime-500 to-green-500',
    isLive: false,
    views: 345,
    likes: 178,
    slides: [
      {
        id: 's8-1',
        type: 'showcase',
        emoji: '🌿',
        title: 'Adubo NPK 20kg',
        subtitle: 'Para sua lavoura',
        body: 'Alta eficiência para culturas diversas. O fertilizante mais vendido da região com qualidade garantida.',
        ctaLabel: 'Ver Produtos',
        ctaAction: 'product',
        gradient: 'from-lime-500 via-green-500 to-emerald-600',
        productId: 'p9',
        price: 89.9,
        productName: 'Adubo NPK 20kg',
        storeName: 'Agropecuária SP',
        badge: 'Top',
        badgeColor: 'bg-lime-600',
      },
      {
        id: 's8-2',
        type: 'offer',
        emoji: '🌱',
        title: 'Sementes Premium',
        subtitle: 'Nova safra',
        body: 'Kit de sementes de hortaliças com 8 variedades. Plante em casa e colha alimentos frescos e orgânicos!',
        ctaLabel: 'Comprar Sementes',
        ctaAction: 'cart',
        gradient: 'from-green-500 via-emerald-500 to-teal-500',
        price: 34.9,
        comparePrice: 49.9,
        discount: 30,
        badge: '-30%',
        badgeColor: 'bg-green-500',
      },
      {
        id: 's8-3',
        type: 'behind',
        emoji: '🧑‍🌾',
        title: 'Nosso Produtor',
        subtitle: 'Sr. Antônio',
        body: 'Conheça o produtor local que fornece as melhores sementes e mudas da região. 30 anos de experiência no campo.',
        ctaLabel: 'Conhecer',
        ctaAction: 'product',
        gradient: 'from-amber-500 via-yellow-500 to-lime-500',
      },
      {
        id: 's8-4',
        type: 'cta',
        emoji: '🚜',
        title: 'Tudo para o Campo',
        subtitle: 'Economize na compra',
        body: 'Ferramentas, sementes, adubos e equipamentos com entrega em Dom Eliseu. Confira nossas ofertas!',
        ctaLabel: 'Visitar Loja',
        ctaAction: 'product',
        gradient: 'from-emerald-600 via-green-600 to-lime-600',
      },
    ],
  },
  {
    id: 'story-9',
    storeName: 'DomPlace Oficial',
    storeInitial: 'D',
    storeLogo: '/domplace-logo.png',
    gradientFrom: '#f43f5e',
    gradientTo: '#fb923c',
    avatarBg: 'from-rose-500 to-orange-400',
    isLive: true,
    views: 5432,
    likes: 1289,
    slides: [
      {
        id: 's9-1',
        type: 'showcase',
        emoji: '🎉',
        title: 'Novidades no App!',
        subtitle: 'Atualização v2.0',
        body: 'Stories, cupons interativos e delivery mais rápido. O DomPlace ficou ainda melhor para você!',
        ctaLabel: 'Explorar',
        ctaAction: 'product',
        gradient: 'from-rose-500 via-orange-500 to-amber-500',
        badge: 'Novo',
        badgeColor: 'bg-rose-500',
      },
      {
        id: 's9-2',
        type: 'offer',
        emoji: '🎁',
        title: 'Cupom Exclusivo',
        subtitle: 'Só pelo story',
        body: 'Use o cupom STORY15 e ganhe 15% de desconto na primeira compra pelo app. Válido por 48h!',
        ctaLabel: 'Copiar Cupom',
        ctaAction: 'product',
        gradient: 'from-fuchsia-500 via-pink-500 to-rose-500',
        badge: 'STORY15',
        badgeColor: 'bg-fuchsia-500',
      },
      {
        id: 's9-3',
        type: 'cta',
        emoji: '🏪',
        title: 'Lojas Locais',
        subtitle: 'Apoie o comércio local',
        body: 'Mais de 50 lojas de Dom Eliseu no app. Produtos frescos, preços justos e entrega rápida.',
        ctaLabel: 'Ver Lojas',
        ctaAction: 'product',
        gradient: 'from-orange-500 via-red-500 to-rose-500',
      },
    ],
  },
  {
    id: 'story-10',
    storeName: 'Dom Eliseu News',
    storeInitial: 'N',
    storeLogo: null,
    gradientFrom: '#f59e0b',
    gradientTo: '#ef4444',
    avatarBg: 'from-amber-500 to-red-500',
    isLive: false,
    views: 2345,
    likes: 876,
    slides: [
      {
        id: 's10-1',
        type: 'showcase',
        emoji: '📣',
        title: 'Feira de Artesanato',
        subtitle: 'Este sábado!',
        body: 'A maior feira de artesanato de Dom Eliseu acontece no Centro Cultural. Mais de 40 expositores locais!',
        ctaLabel: 'Saiba Mais',
        ctaAction: 'product',
        gradient: 'from-amber-500 via-orange-500 to-red-500',
        badge: 'Evento',
        badgeColor: 'bg-amber-500',
      },
      {
        id: 's10-2',
        type: 'behind',
        emoji: '🏆',
        title: 'Esportes Locais',
        subtitle: 'Campeonato Regional',
        body: 'Time de Dom Eliseu avança para as semifinais do campeonato regional. Jogo sábado às 16h no estádio municipal.',
        ctaLabel: 'Ver Agenda',
        ctaAction: 'product',
        gradient: 'from-green-500 via-emerald-500 to-teal-500',
      },
      {
        id: 's10-3',
        type: 'cta',
        emoji: '❤️',
        title: 'Comunidade Forte',
        subtitle: 'Juntos somos mais',
        body: 'Acompanhe as principais notícias e eventos de Dom Eliseu. Ative as notificações para não perder nada!',
        ctaLabel: 'Ativar Notificações',
        ctaAction: 'product',
        gradient: 'from-red-500 via-rose-500 to-pink-500',
      },
    ],
  },
]

const highlightsData: StoryHighlight[] = [
  { id: 'hl-1', label: 'Ofertas', emoji: '🔥', gradientFrom: '#ef4444', gradientTo: '#f97316', coverBg: 'from-red-400 to-orange-400', storyCount: 12 },
  { id: 'hl-2', label: 'Novidades', emoji: '✨', gradientFrom: '#8b5cf6', gradientTo: '#ec4899', coverBg: 'from-violet-400 to-pink-400', storyCount: 8 },
  { id: 'hl-3', label: 'Receitas', emoji: '👨‍🍳', gradientFrom: '#10b981', gradientTo: '#06b6d4', coverBg: 'from-emerald-400 to-cyan-400', storyCount: 5 },
  { id: 'hl-4', label: 'Pets', emoji: '🐾', gradientFrom: '#06b6d4', gradientTo: '#3b82f6', coverBg: 'from-cyan-400 to-blue-400', storyCount: 6 },
  { id: 'hl-5', label: 'Beleza', emoji: '💅', gradientFrom: '#ec4899', gradientTo: '#f43f5e', coverBg: 'from-pink-400 to-rose-400', storyCount: 9 },
  { id: 'hl-6', label: 'Tech', emoji: '📱', gradientFrom: '#6366f1', gradientTo: '#8b5cf6', coverBg: 'from-indigo-400 to-violet-400', storyCount: 4 },
]

/* ═══════════════════════════════════════════════════════════════════
   Helper: Animated Rainbow Ring (CSS gradient rotation)
   ═══════════════════════════════════════════════════════════════════ */

function RainbowRing({ size = 72, strokeWidth = 3, className = '' }: { size?: number; strokeWidth?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`r52-stories-rainbow-ring ${className}`}
    >
      <defs>
        <linearGradient id="r52-rainbow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="16%" stopColor="#f97316" />
          <stop offset="33%" stopColor="#eab308" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="66%" stopColor="#3b82f6" />
          <stop offset="83%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={(size - strokeWidth) / 2}
        fill="none"
        stroke="url(#r52-rainbow-grad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Helper: Format engagement numbers
   ═══════════════════════════════════════════════════════════════════ */

function formatEngagement(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }
  return String(value)
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-component: New Story Notification Dot
   ═══════════════════════════════════════════════════════════════════ */

function NewStoryDot({ isUnviewed }: { isUnviewed: boolean }) {
  if (!isUnviewed) return null
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 500, damping: 25 }}
      className="absolute -top-0.5 -right-0.5 z-10 r52-stories-new-dot"
    >
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
        className="h-4 w-4 rounded-full bg-red-500 border-2 border-background flex items-center justify-center"
        style={{ boxShadow: '0 0 8px rgba(239,68,68,0.6)' }}
      >
        <span className="text-[7px] font-bold text-white leading-none">NEW</span>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-component: Story Engagement Indicators
   ═══════════════════════════════════════════════════════════════════ */

function EngagementIndicators({ views, likes, isLiked, onToggleLike }: {
  views: number
  likes: number
  isLiked: boolean
  onToggleLike: () => void
}) {
  return (
    <div className="flex items-center gap-3 r52-stories-engagement">
      <motion.div
        whileTap={{ scale: 0.9 }}
        className="flex items-center gap-1 text-white/70"
      >
        <Eye className="h-3.5 w-3.5" />
        <span className="text-[11px] font-medium">{formatEngagement(views)}</span>
      </motion.div>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onToggleLike}
        className="flex items-center gap-1 transition-colors"
      >
        <Heart
          className={`h-3.5 w-3.5 transition-colors ${isLiked ? 'text-red-400 fill-red-400' : 'text-white/70'}`}
        />
        <span className={`text-[11px] font-medium ${isLiked ? 'text-red-400' : 'text-white/70'}`}>
          {formatEngagement(likes + (isLiked ? 1 : 0))}
        </span>
      </motion.button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-component: Animated Close Button X
   ═══════════════════════════════════════════════════════════════════ */

function AnimatedCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={onClose}
      className="min-h-[44px] min-w-[44px] h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors active:scale-95 transition-transform r52-stories-close-btn"
      aria-label="Fechar story"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white">
        <motion.path
          d="M1 1L13 13M13 1L1 13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' as const }}
        />
      </svg>
    </motion.button>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-component: Progress Bars (timer at top)
   ═══════════════════════════════════════════════════════════════════ */

function StoryProgressBars({
  totalSlides,
  currentIndex,
  isPaused,
}: {
  totalSlides: number
  currentIndex: number
  isPaused: boolean
}) {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-3 pt-3 r52-stories-progress-row">
      {Array.from({ length: totalSlides }).map((_, idx) => (
        <div
          key={`progress-${idx}`}
          className="flex-1 h-[3px] bg-white/25 rounded-full overflow-hidden"
        >
          <motion.div
            className={`h-full rounded-full ${idx === currentIndex ? 'bg-white r52-stories-progress-active' : idx < currentIndex ? 'bg-white/60' : 'bg-transparent'}`}
            initial={{ width: idx < currentIndex ? '100%' : '0%' }}
            animate={
              idx < currentIndex
                ? { width: '100%' }
                : idx === currentIndex && !isPaused
                  ? { width: '100%' }
                  : { width: idx === currentIndex && isPaused ? undefined : '0%' }
            }
            transition={
              idx === currentIndex && !isPaused
                ? { duration: SLIDE_DURATION / 1000, ease: 'linear' as const }
                : { duration: 0.2 }
            }
          />
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-component: Story Slide Content Card
   ═══════════════════════════════════════════════════════════════════ */

function StorySlideContent({
  slide,
  onCtaClick,
}: {
  slide: StorySlide
  onCtaClick: (action: string, productId?: string) => void
}) {
  return (
    <motion.div
      key={slide.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' as const }}
      className="relative z-[2] flex flex-col items-center justify-center h-full px-6 sm:px-10 text-center r52-stories-slide-content"
    >
      {/* Product image area with emoji fallback */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.08, type: 'spring' as const, stiffness: 300, damping: 25 }}
        className="mb-5"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }}
            className="h-28 w-28 sm:h-36 sm:w-36 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-xl r52-stories-product-img-box"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
          >
            <span className="text-6xl sm:text-7xl">{slide.emoji}</span>
          </motion.div>

          {/* Badge */}
          {slide.badge && (
            <motion.div
              initial={{ scale: 0, x: 10 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20, delay: 0.2 }}
              className="absolute -top-2 -right-2 r52-stories-badge"
            >
              <span className={`text-[9px] font-bold text-white px-2 py-0.5 rounded-full shadow-md ${slide.badgeColor || 'bg-red-500'}`}>
                {slide.badge}
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="text-xl sm:text-2xl font-bold text-white mb-1 drop-shadow-lg r52-stories-slide-title"
      >
        {slide.title}
      </motion.h3>

      {/* Subtitle */}
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.25 }}
        className="text-xs sm:text-sm text-white/80 font-medium mb-2 r52-stories-slide-subtitle"
      >
        {slide.subtitle}
      </motion.p>

      {/* Body */}
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.25 }}
        className="text-sm sm:text-base text-white/90 leading-relaxed max-w-xs mb-5 drop-shadow r52-stories-slide-body"
      >
        {slide.body}
      </motion.p>

      {/* Price display */}
      {slide.price && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.25 }}
          className="flex items-center gap-2 mb-4 r52-stories-price-display"
        >
          <span className="text-lg sm:text-xl font-extrabold text-white">
            {formatBRL(slide.price)}
          </span>
          {slide.comparePrice && slide.comparePrice > slide.price && (
            <span className="text-xs text-white/50 line-through">
              {formatBRL(slide.comparePrice)}
            </span>
          )}
        </motion.div>
      )}

      {/* CTA Button */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, type: 'spring' as const, stiffness: 300, damping: 22 }}
        className="r52-stories-cta-wrap relative overflow-hidden"
      >
        <motion.div
          whileTap={{ scale: 0.95 }}
          className="relative overflow-hidden rounded-full"
        >
          <Button
            onClick={() => onCtaClick(slide.ctaAction, slide.productId)}
            className="px-6 py-2.5 bg-white text-gray-900 hover:bg-white/90 font-semibold text-sm rounded-full gap-2 shadow-lg r52-stories-cta-btn relative z-10"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
          >
            <ShoppingBag className="h-4 w-4" />
            {slide.ctaLabel}
          </Button>
        </motion.div>
      </motion.div>

      {/* Product name tag */}
      {slide.productName && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[10px] text-white/50 mt-2 r52-stories-product-label"
        >
          {slide.storeName && `${slide.storeName} · `}{slide.productName}
        </motion.p>
      )}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-component: Pause Indicator
   ═══════════════════════════════════════════════════════════════════ */

function PauseIndicator({ isPaused }: { isPaused: boolean }) {
  return (
    <AnimatePresence>
      {isPaused && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.15 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] pointer-events-none r52-stories-pause-indicator"
        >
          <div className="h-14 w-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            <Pause className="h-6 w-6 text-white" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-component: Story Circle (Avatar in the horizontal row)
   ═══════════════════════════════════════════════════════════════════ */

function StoryCircle({
  story,
  isViewed,
  onClick,
}: {
  story: StoryGroup
  isViewed: boolean
  onClick: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.button
      whileHover={{ scale: 1.08, y: -4 }}
      whileTap={{ scale: 0.93 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col items-center gap-1.5 shrink-0 r52-stories-circle-btn"
    >
      <div className="relative">
        {/* Animated rainbow ring for unviewed stories */}
        {!isViewed && (
          <motion.div
            className="absolute inset-0 z-0 r52-stories-ring-animated"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' as const }}
          >
            <RainbowRing size={72} strokeWidth={3} />
          </motion.div>
        )}

        {/* Gradient ring (viewed = gray, unviewed = gradient) */}
        <div
          className={`relative z-[1] h-[66px] w-[66px] rounded-full p-[2.5px] r52-stories-ring ${isViewed ? 'r52-stories-ring-viewed' : 'r52-stories-ring-unviewed'}`}
          style={{
            background: isViewed
              ? 'rgba(128,128,128,0.3)'
              : `linear-gradient(135deg, ${story.gradientFrom}, ${story.gradientTo})`,
          }}
        >
          <div className="h-full w-full rounded-full bg-background flex items-center justify-center">
            <span
              className={`h-[56px] w-[56px] rounded-full bg-gradient-to-br ${story.avatarBg} flex items-center justify-center text-white font-bold text-xl transition-all r52-stories-avatar ${isViewed ? 'opacity-40' : ''}`}
            >
              {story.storeInitial}
            </span>
          </div>
        </div>

        {/* Live indicator */}
        {story.isLive && !isViewed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 500, damping: 25 }}
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-10 r52-stories-live-badge"
          >
            <span className="text-[8px] font-bold text-white bg-red-500 px-1.5 py-0 rounded-full shadow-sm">
              LIVE
            </span>
          </motion.div>
        )}

        {/* Hover tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap r52-stories-tooltip"
            >
              <div className="bg-gray-900 text-white text-[10px] font-medium px-2 py-1 rounded-lg shadow-lg">
                {story.storeName}
                <span className="ml-1.5 text-white/50">{formatEngagement(story.views)} views</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New story notification dot */}
        <NewStoryDot isUnviewed={!isViewed} />
      </div>

      <span className={`text-[10px] font-medium leading-tight max-w-[64px] truncate r52-stories-circle-name ${isViewed ? 'text-muted-foreground' : 'text-foreground'}`}>
        {story.storeName}
      </span>
    </motion.button>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-component: Story Highlight Circle
   ═══════════════════════════════════════════════════════════════════ */

function StoryHighlightCircle({ highlight }: { highlight: StoryHighlight }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.button
      whileHover={{ scale: 1.08, y: -3 }}
      whileTap={{ scale: 0.93 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col items-center gap-1.5 shrink-0 r52-stories-highlight-btn"
    >
      <div className="relative">
        <div
          className="h-[62px] w-[62px] rounded-full border-[2.5px] border-gray-300 dark:border-gray-600 flex items-center justify-center r52-stories-highlight-ring"
          style={{
            background: `linear-gradient(135deg, ${highlight.gradientFrom}20, ${highlight.gradientTo}20)`,
          }}
        >
          <div className={`h-[52px] w-[52px] rounded-full bg-gradient-to-br ${highlight.coverBg} flex items-center justify-center r52-stories-highlight-cover`}>
            <span className="text-2xl">{highlight.emoji}</span>
          </div>
        </div>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap r52-stories-highlight-tooltip"
            >
              <div className="bg-gray-900 text-white text-[10px] font-medium px-2 py-1 rounded-lg shadow-lg">
                {highlight.label}
                <span className="ml-1 text-white/50">{highlight.storyCount}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[64px] r52-stories-highlight-name">
        {highlight.label}
      </span>
    </motion.button>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-component: Swipe Down Dismiss Indicator
   ═══════════════════════════════════════════════════════════════════ */

function SwipeDownIndicator() {
  return (
    <motion.div
      animate={{ y: [0, 5, 0] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
      className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 r52-stories-swipe-indicator"
    >
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-white/40 text-[9px] font-medium">Deslize para fechar</span>
        <ChevronDown className="h-3 w-3 text-white/40" />
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-component: Interaction Bar (heart, comment, share, save)
   ═══════════════════════════════════════════════════════════════════ */

function InteractionBar({
  isLiked,
  onToggleLike,
  storyId,
}: {
  isLiked: boolean
  onToggleLike: () => void
  storyId: string
}) {
  return (
    <div className="flex items-center justify-between px-4 pb-3 z-10 r52-stories-interaction-bar">
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={(e) => {
            e.stopPropagation()
            onToggleLike()
          }}
          className="relative"
        >
          <AnimatePresence mode="wait">
            {isLiked ? (
              <motion.div
                key="liked"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.5 }}
                transition={{ type: 'spring' as const, stiffness: 500, damping: 20 }}
              >
                <Heart className="h-6 w-6 text-red-500 fill-red-500" />
              </motion.div>
            ) : (
              <motion.div
                key="unliked"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.5 }}
                transition={{ type: 'spring' as const, stiffness: 500, damping: 20 }}
              >
                <Heart className="h-6 w-6 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => e.stopPropagation()}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation()
            if (typeof navigator !== 'undefined' && navigator.share) {
              navigator.share({
                title: 'DomPlace Story',
                text: 'Confira esta story no DomPlace!',
                url: window.location.href,
              }).catch(() => {})
            } else {
              toast.success('Link copiado!')
            }
          }}
        >
          <Share2 className="h-6 w-6 text-white" />
        </motion.button>
      </div>

      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={(e) => {
          e.stopPropagation()
          toast.success('Story salva nos destaques!')
        }}
      >
        <BookmarkPlus className="h-6 w-6 text-white" />
      </motion.button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-component: Floating Like Particles
   ═══════════════════════════════════════════════════════════════════ */

function LikeParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      id: `like-p-${i}`,
      xOff: -30 + i * 12,
      delay: i * 0.15,
      emoji: ['❤️', '💕', '🩷', '💖', '✨', '⭐'][i],
    }))
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none z-[4] overflow-hidden r52-stories-like-particles">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute text-lg"
          style={{ left: `calc(50% + ${p.xOff}px)`, bottom: '15%' }}
          animate={{
            y: [0, -80, -160],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.4],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeOut' as const,
            repeatDelay: 3,
          }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-component: Header with store info in viewer
   ═══════════════════════════════════════════════════════════════════ */

function StoryViewerHeader({
  story,
  slideIndex,
  totalSlides,
  isPaused,
  onTogglePause,
  onClose,
  isLiked,
  onToggleLike,
  onMarkAllSeen,
  unseenCount,
}: {
  story: StoryGroup
  slideIndex: number
  totalSlides: number
  isPaused: boolean
  onTogglePause: () => void
  onClose: () => void
  isLiked: boolean
  onToggleLike: () => void
  onMarkAllSeen: () => void
  unseenCount: number
}) {
  return (
    <div className="absolute top-8 left-0 right-0 z-10 flex items-center justify-between px-4 r52-stories-viewer-header">
      <div className="flex items-center gap-2.5">
        {/* Store avatar with animated glow ring */}
        <motion.div
          className="h-9 w-9 rounded-full p-[1.5px] r52-stories-viewer-avatar-ring"
          animate={{
            boxShadow: `0 0 18px ${story.gradientTo}70`,
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
          style={{
            background: `linear-gradient(135deg, ${story.gradientFrom}, ${story.gradientTo})`,
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
            className="h-full w-full rounded-full bg-black/80 flex items-center justify-center"
          >
            <span className={`h-7 w-7 rounded-full bg-gradient-to-br ${story.avatarBg} flex items-center justify-center text-white font-bold text-xs`}>
              {story.storeInitial}
            </span>
          </motion.div>
        </motion.div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <p className="text-white text-xs font-semibold">{story.storeName}</p>
            {story.isLive && (
              <span className="text-[8px] font-bold text-white bg-red-500 px-1 py-px rounded r52-stories-live-tag">LIVE</span>
            )}
            <span className="text-white/50 text-[9px]">{slideIndex + 1}/{totalSlides}</span>
          </div>
          <p className="text-white/50 text-[9px]">Há 2h</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Pause/Play button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation()
            onTogglePause()
          }}
          className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors r52-stories-pause-btn"
        >
          {isPaused ? (
            <Play className="h-3 w-3 text-white fill-white" />
          ) : (
            <Pause className="h-3 w-3 text-white" />
          )}
        </motion.button>

        {/* Mark all seen */}
        {unseenCount > 0 && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onMarkAllSeen}
            className="text-white/60 text-[10px] font-medium px-2 py-1 rounded-full border border-white/20 hover:bg-white/10 transition-colors r52-stories-mark-all-btn"
          >
            Ver tudo
          </motion.button>
        )}

        <AnimatedCloseButton onClose={onClose} />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT — ProductStories
   ═══════════════════════════════════════════════════════════════════ */

export function ProductStories() {
  const { addToCart, selectProduct, navigate } = useAppStore()

  // Story viewer state
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [seenStories, setSeenStories] = useState<Set<string>>(new Set())
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set())

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const viewerRef = useRef<HTMLDivElement>(null)

  const y = useMotionValue(0)
  const opacity = useTransform(y, [0, 200], [1, 0])
  const backdropFilter = useTransform(y, [0, 200], ['blur(0px)', 'blur(20px)'])

  // Current story/slide
  const currentStory = activeStoryIndex !== null ? storyData[activeStoryIndex] : null
  const currentSlide = currentStory ? currentStory.slides[activeSlideIndex] : null
  const unseenCount = storyData.filter(s => !seenStories.has(s.id)).length

  // Mark as seen
  const markAsSeen = useCallback((storyId: string) => {
    setSeenStories(prev => {
      const next = new Set(prev)
      next.add(storyId)
      return next
    })
  }, [])

  // Close viewer
  const handleClose = useCallback(() => {
    if (activeStoryIndex !== null) {
      markAsSeen(storyData[activeStoryIndex].id)
    }
    setActiveStoryIndex(null)
    setActiveSlideIndex(0)
    setIsPaused(false)
  }, [activeStoryIndex, markAsSeen])

  // Next slide / story
  const goNextSlide = useCallback(() => {
    if (activeStoryIndex === null || !currentStory) return
    if (activeSlideIndex < currentStory.slides.length - 1) {
      setActiveSlideIndex(prev => prev + 1)
    } else {
      const nextIdx = activeStoryIndex + 1
      if (nextIdx < storyData.length) {
        markAsSeen(storyData[activeStoryIndex].id)
        setActiveStoryIndex(nextIdx)
        setActiveSlideIndex(0)
      } else {
        markAsSeen(storyData[activeStoryIndex].id)
        handleClose()
      }
    }
  }, [currentStory, activeSlideIndex, activeStoryIndex, markAsSeen, handleClose])

  // Previous slide / story
  const goPrevSlide = useCallback(() => {
    if (activeStoryIndex === null) return
    if (activeSlideIndex > 0) {
      setActiveSlideIndex(prev => prev - 1)
    } else if (activeStoryIndex > 0) {
      const prevStory = storyData[activeStoryIndex - 1]
      setActiveStoryIndex(activeStoryIndex - 1)
      setActiveSlideIndex(prevStory.slides.length - 1)
    }
  }, [activeSlideIndex, activeStoryIndex])

  // Auto-progress timer
  useEffect(() => {
    if (activeStoryIndex === null || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      goNextSlide()
    }, SLIDE_DURATION)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [activeStoryIndex, isPaused, goNextSlide])

  // Open story
  const openStory = useCallback((index: number) => {
    setActiveStoryIndex(index)
    setActiveSlideIndex(0)
    setIsPaused(false)
  }, [])

  // Toggle pause
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev)
  }, [])

  // Toggle like
  const toggleLike = useCallback((storyId: string) => {
    setLikedStories(prev => {
      const next = new Set(prev)
      if (next.has(storyId)) {
        next.delete(storyId)
      } else {
        next.add(storyId)
      }
      return next
    })
  }, [])

  // Mark all seen
  const markAllSeen = useCallback(() => {
    setSeenStories(new Set(storyData.map(s => s.id)))
    setActiveStoryIndex(null)
    setActiveSlideIndex(0)
  }, [])

  // CTA action handler
  const handleCtaClick = useCallback((action: string, productId?: string) => {
    if (action === 'cart' && productId) {
      // Find product data from mock or create a basic one
      const mockProducts: ProductData[] = [
        { id: 'p1', storeId: 's1', storeName: 'Mercado do Zé', name: 'Arroz Tio João 5kg', slug: 'arroz-tio-joao', description: null, price: 24.9, comparePrice: 29.9, images: '[]', stock: 50, rating: 4.5, totalReviews: 23, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'FOOD' },
        { id: 'p2', storeId: 's1', storeName: 'Mercado do Zé', name: 'Feijão Carioca 1kg', slug: 'feijao-carioca', description: null, price: 8.9, comparePrice: null, images: '[]', stock: 80, rating: 4.3, totalReviews: 15, isFeatured: false, isNew: false, isOffer: false, tags: '[]', variations: null, category: 'FOOD' },
        { id: 'p5', storeId: 's2', storeName: 'Açaí da Boa', name: 'Açaí 500ml', slug: 'acai-500ml', description: null, price: 15.0, comparePrice: 18.0, images: '[]', stock: 100, rating: 4.9, totalReviews: 89, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'FOOD' },
        { id: 'p6', storeId: 's2', storeName: 'Açaí da Boa', name: 'Açaí Premium 700ml', slug: 'acai-premium-700ml', description: null, price: 22.0, comparePrice: null, images: '[]', stock: 50, rating: 4.8, totalReviews: 45, isFeatured: true, isNew: true, isOffer: false, tags: '[]', variations: null, category: 'FOOD' },
        { id: 'p9', storeId: 's3', storeName: 'Agropecuária SP', name: 'Adubo NPK 20kg', slug: 'adubo-npk', description: null, price: 89.9, comparePrice: null, images: '[]', stock: 25, rating: 4.4, totalReviews: 12, isFeatured: true, isNew: false, isOffer: false, tags: '[]', variations: null, category: 'AGRICULTURE' },
        { id: 'p13', storeId: 's4', storeName: 'Farmácia Vida', name: 'Vitamina C 500mg', slug: 'vitamina-c', description: null, price: 35.0, comparePrice: 42.0, images: '[]', stock: 100, rating: 4.7, totalReviews: 34, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'HEALTH' },
        { id: 'p17', storeId: 's5', storeName: 'Padaria Pão Quente', name: 'Pão Francês (6 un)', slug: 'pao-frances', description: null, price: 6.0, comparePrice: null, images: '[]', stock: 200, rating: 4.9, totalReviews: 120, isFeatured: true, isNew: false, isOffer: false, tags: '[]', variations: null, category: 'FOOD' },
      ]
      const product = mockProducts.find(p => p.id === productId)
      if (product) {
        addToCart(product, product.storeName || 'Loja')
        toast.success(`${product.name} adicionado ao carrinho!`)
      } else {
        toast.success('Produto adicionado ao carrinho!')
      }
    } else if (action === 'product') {
      handleClose()
    }
  }, [addToCart, handleClose])

  // Long press handlers for pause
  const handlePointerDown = useCallback(() => {
    longPressTimerRef.current = setTimeout(() => {
      setIsPaused(true)
    }, 200)
  }, [])

  const handlePointerUp = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }
    // If we paused via long press, resume on release
    setIsPaused(prev => {
      if (prev) return false
      return prev
    })
  }, [])

  // Swipe down to dismiss
  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > SWIPE_THRESHOLD) {
      handleClose()
    }
  }, [handleClose])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeStoryIndex === null) return
      switch (e.key) {
        case 'ArrowRight':
          goNextSlide()
          break
        case 'ArrowLeft':
          goPrevSlide()
          break
        case 'Escape':
          handleClose()
          break
        case ' ':
          e.preventDefault()
          togglePause()
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeStoryIndex, goNextSlide, goPrevSlide, handleClose, togglePause])

  // Lock body scroll when viewer is open
  useEffect(() => {
    if (activeStoryIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [activeStoryIndex])

  // Check if all viewed
  const allViewed = useMemo(
    () => seenStories.size === storyData.length && storyData.length > 0,
    [seenStories, storyData.length]
  )

  return (
    <>
      {/* ── Section Wrapper ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring' as const, stiffness: 200, damping: 25 }}
        className="relative r52-stories-section"
      >
        <div className="mb-1">
          {/* ── Section Header ── */}
          <div className="flex items-center justify-between mb-3 px-1 r52-stories-section-header">
            <h2 className="text-base font-bold flex items-center gap-2 r52-stories-section-title">
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
                className="text-xl"
              >
                <Sparkles className="h-5 w-5 text-violet-500" />
              </motion.span>
              Product Stories
            </h2>
            <div className="flex items-center gap-2">
              {allViewed && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full r52-stories-all-seen-badge"
                >
                  ✓ Tudo visto
                </motion.span>
              )}
              {!allViewed && unseenCount > 0 && (
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
                  className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full r52-stories-unseen-badge"
                >
                  {unseenCount} novas
                </motion.span>
              )}
            </div>
          </div>

          {/* ── Horizontal Story Circles Row ── */}
          <div className="flex gap-3.5 overflow-x-auto hide-scrollbar pb-2 px-1 r52-stories-row">
            {storyData.map((story, idx) => (
              <StoryCircle
                key={story.id}
                story={story}
                isViewed={seenStories.has(story.id)}
                onClick={() => openStory(idx)}
              />
            ))}
          </div>
        </div>

        {/* ── Story Highlights Section (Saved Past Stories) ── */}
        <div className="mt-2 px-1">
          <div className="flex items-center gap-1.5 mb-2.5">
            <BookmarkPlus className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-sm font-semibold r52-stories-highlights-title">Destaques</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 r52-stories-highlights-row">
            {highlightsData.map((hl) => (
              <StoryHighlightCircle key={hl.id} highlight={hl} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Full-Screen Story Viewer Overlay ── */}
      <AnimatePresence>
        {activeStoryIndex !== null && currentSlide && currentStory && (
          <motion.div
            ref={viewerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col r52-stories-viewer-overlay"
            style={{ opacity }}
          >
            {/* Progress bars at top */}
            <StoryProgressBars
              totalSlides={currentStory.slides.length}
              currentIndex={activeSlideIndex}
              isPaused={isPaused}
            />

            {/* Header with store info */}
            <StoryViewerHeader
              story={currentStory}
              slideIndex={activeSlideIndex}
              totalSlides={currentStory.slides.length}
              isPaused={isPaused}
              onTogglePause={togglePause}
              onClose={handleClose}
              isLiked={likedStories.has(currentStory.id)}
              onToggleLike={() => toggleLike(currentStory.id)}
              onMarkAllSeen={markAllSeen}
              unseenCount={unseenCount}
            />

            {/* Swipeable story content area */}
            <motion.div
              className="flex-1 relative flex items-center justify-center r52-stories-content-area"
              style={{ y, backdropFilter }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.3}
              onDragEnd={handleDragEnd}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {/* Slide background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${currentSlide.gradient} r52-stories-slide-bg`} />

              {/* Tap zones for navigation */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goPrevSlide()
                }}
                className="absolute left-0 top-0 bottom-0 w-1/3 z-[5] r52-stories-tap-left"
                aria-label="Story anterior"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goNextSlide()
                }}
                className="absolute right-0 top-0 bottom-0 w-1/3 z-[5] r52-stories-tap-right"
                aria-label="Próximo story"
              />

              {/* Center tap to pause */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  togglePause()
                }}
                className="absolute top-[60px] left-1/3 right-1/3 bottom-0 z-[5] r52-stories-tap-center"
                aria-label="Pausar story"
              />

              {/* Animated slide content */}
              <AnimatePresence mode="wait">
                <StorySlideContent
                  slide={currentSlide}
                  onCtaClick={handleCtaClick}
                />
              </AnimatePresence>

              {/* Pause indicator overlay */}
              <PauseIndicator isPaused={isPaused} />

              {/* Like particles (when liked) */}
              {likedStories.has(currentStory.id) && <LikeParticles />}
            </motion.div>

            {/* Engagement indicators + interaction bar */}
            <div className="relative z-10 r52-stories-bottom-bar">
              {/* Engagement info */}
              <div className="px-4 py-1">
                <EngagementIndicators
                  views={currentStory.views}
                  likes={currentStory.likes}
                  isLiked={likedStories.has(currentStory.id)}
                  onToggleLike={() => toggleLike(currentStory.id)}
                />
              </div>

              {/* Interaction bar (heart, comment, share, save) */}
              <InteractionBar
                isLiked={likedStories.has(currentStory.id)}
                onToggleLike={() => toggleLike(currentStory.id)}
                storyId={currentStory.id}
              />

              {/* Swipe down hint */}
              <SwipeDownIndicator />
            </div>

            {/* Bottom navigation arrows */}
            <div className="absolute bottom-16 left-0 right-0 z-10 flex items-center justify-center gap-8 r52-stories-nav-arrows">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={goPrevSlide}
                disabled={activeSlideIndex === 0 && activeStoryIndex === 0}
                className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-20 r52-stories-nav-prev"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white">
                  <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>

              <span className="text-white/50 text-xs font-medium tabular-nums r52-stories-slide-counter">
                {activeSlideIndex + 1} / {currentStory.slides.length}
              </span>

              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={goNextSlide}
                className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors r52-stories-nav-next"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white">
                  <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            </div>

            {/* Background ambient glow behind slide */}
            <motion.div
              className="absolute inset-0 pointer-events-none z-0 r52-stories-ambient-glow"
              animate={{
                background: `radial-gradient(ellipse at center, ${currentStory.gradientFrom}10, transparent 70%)`,
              }}
              transition={{ duration: 1 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
