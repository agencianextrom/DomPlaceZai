'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Cloud, CloudRain, CloudLightning, CloudSnow, CloudDrizzle,
  Wind, Thermometer, Droplets, Umbrella, ShoppingCart, Sparkles,
  RefreshCw, ChevronRight, X, MapPin, Clock, Flame, Snowflake as SnowflakeIcon,
  Coffee, Salad, Soup, IceCream2, Sandwich, Grape, Pizza, Cherry
} from 'lucide-react';

interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  condition: 'ensolarado' | 'nublado' | 'chuvoso' | 'tempestade' | 'garoa' | 'ventoso';
  conditionIcon: string;
  description: string;
  uvIndex: number;
  windSpeed: number;
  forecast: { day: string; temp: number; condition: string }[];
}

interface ProductSuggestion {
  id: string;
  name: string;
  emoji: string;
  price: string;
  originalPrice?: string;
  store: string;
  reason: string;
  category: string;
  rating: number;
  urgency: 'alta' | 'media' | 'baixa';
}

const weatherEmojis: Record<string, string> = {
  ensolarado: '☀️',
  nublado: '☁️',
  chuvoso: '🌧️',
  tempestade: '⛈️',
  garoa: '🌦️',
  ventoso: '💨',
};

const conditionIcons: Record<string, typeof Sun> = {
  ensolarado: Sun,
  nublado: Cloud,
  chuvoso: CloudRain,
  tempestade: CloudLightning,
  garoa: CloudDrizzle,
  ventoso: Wind,
};

const fallbackWeather: WeatherData = {
  temp: 33,
  feelsLike: 37,
  humidity: 72,
  condition: 'ensolarado',
  conditionIcon: '☀️',
  description: 'Céu limpo com calor intenso. Perfeito para produtos frescos!',
  uvIndex: 9,
  windSpeed: 12,
  forecast: [
    { day: 'Seg', temp: 34, condition: 'ensolarado' },
    { day: 'Ter', temp: 32, condition: 'nublado' },
    { day: 'Qua', temp: 28, condition: 'chuvoso' },
    { day: 'Qui', temp: 30, condition: 'garoa' },
    { day: 'Sex', temp: 33, condition: 'ensolarado' },
    { day: 'Sáb', temp: 31, condition: 'ventoso' },
    { day: 'Dom', temp: 29, condition: 'chuvoso' },
  ],
};

const allSuggestions: Record<string, ProductSuggestion[]> = {
  ensolarado: [
    { id: 'ws1', name: 'Água de Coco Natural 500ml', emoji: '🥥', price: 'R$4,99', store: 'Mercado Bom Preço', reason: 'Hidratação essencial no calor!', category: 'Bebidas', rating: 4.8, urgency: 'alta' },
    { id: 'ws2', name: 'Salada Caesar Pronta', emoji: '🥗', price: 'R$12,90', store: 'Hortifruti Dom Eliseu', reason: 'Refeição leve para dias quentes', category: 'Hortifruti', rating: 4.5, urgency: 'alta' },
    { id: 'ws3', name: 'Picolé de Frutas Mix 10un', emoji: '🍦', price: 'R$16,90', originalPrice: 'R$21,90', store: 'Distribuidora Gelada', reason: 'Sorvete com 23% de desconto!', category: 'Sobremesas', rating: 4.7, urgency: 'media' },
    { id: 'ws4', name: 'Protetor Solar FPS 50', emoji: '🧴', price: 'R$29,90', store: 'Farmácia Popular', reason: 'UV alto: proteção é prioridade!', category: 'Saúde', rating: 4.9, urgency: 'alta' },
    { id: 'ws5', name: 'Suco de Laranja Natural 1L', emoji: '🍊', price: 'R$8,50', store: 'Mercado Central', reason: 'Vitamina C para o verão', category: 'Bebidas', rating: 4.6, urgency: 'media' },
    { id: 'ws6', name: 'Churrasco Completo para 6', emoji: '🥩', price: 'R$89,90', store: 'Açougue Premium', reason: 'Tempo perfeito para churrasco!', category: 'Carnes', rating: 4.8, urgency: 'baixa' },
  ],
  nublado: [
    { id: 'wn1', name: 'Café Especial Torrado 250g', emoji: '☕', price: 'R$24,90', store: 'Café Artesanal', reason: 'Dia perfeito para um café especial', category: 'Bebidas', rating: 4.9, urgency: 'media' },
    { id: 'wn2', name: 'Pão de Queijo Congelado 1kg', emoji: '🧀', price: 'R$18,90', store: 'Padaria Sabor', reason: 'Lanche quente para dia fresco', category: 'Padaria', rating: 4.7, urgency: 'media' },
    { id: 'wn3', name: 'Sopa de Legumes Congelada', emoji: '🍜', price: 'R$14,90', store: 'Prato Fino', reason: 'Conforto num dia nublado', category: 'Congelados', rating: 4.5, urgency: 'baixa' },
    { id: 'wn4', name: 'Queijo Minas Frescal 500g', emoji: '🧈', price: 'R$22,90', store: 'Laticínios Bom', reason: 'Perfeito com pão e café', category: 'Laticínios', rating: 4.8, urgency: 'media' },
    { id: 'wn5', name: 'Bolo de Chocolate Fatia', emoji: '🍫', price: 'R$8,90', store: 'Confeitaria Delícia', reason: 'Acompanhamento ideal pro café', category: 'Padaria', rating: 4.6, urgency: 'baixa' },
    { id: 'wn6', name: 'Chá Mate Gelado 1.5L', emoji: '🍵', price: 'R$6,90', store: 'Mercado Central', reason: 'Refrescante mesmo sem sol', category: 'Bebidas', rating: 4.4, urgency: 'baixa' },
  ],
  chuvoso: [
    { id: 'wr1', name: 'Caldinho de Feijão Pronto', emoji: '🥘', price: 'R$9,90', store: 'Prato Fino', reason: 'Caldo quente pro dia de chuva!', category: 'Congelados', rating: 4.8, urgency: 'alta' },
    { id: 'wr2', name: 'Guarda-chuva Compacto', emoji: '☂️', price: 'R$19,90', store: 'Varal do Povo', reason: 'Chuva prevista: não fique sem!', category: 'Utilidades', rating: 4.5, urgency: 'alta' },
    { id: 'wr3', name: 'Chocolate Quente em Pó 400g', emoji: '🍫', price: 'R$11,90', store: 'Mercado Central', reason: 'Tradição de dia chuvoso', category: 'Bebidas', rating: 4.7, urgency: 'alta' },
    { id: 'wr4', name: 'Macarrão com Molho Pronto', emoji: '🍝', price: 'R$7,90', store: 'Mercado Bom Preço', reason: 'Refeição fácil sem sair', category: 'Mercearia', rating: 4.4, urgency: 'media' },
    { id: 'wr5', name: 'Velas Aromáticas 3un', emoji: '🕯️', price: 'R$24,90', store: 'Casa & Cia', reason: 'Ambiente acolhedor para ficar em casa', category: 'Casa', rating: 4.6, urgency: 'baixa' },
    { id: 'wr6', name: 'Sopa Creme de Cebola', emoji: '🍲', price: 'R$12,90', store: 'Prato Fino', reason: 'Aqueça neste dia frio e úmido', category: 'Congelados', rating: 4.5, urgency: 'media' },
  ],
  tempestade: [
    { id: 'wt1', name: 'Kit Emergência: Água+Luz+Radio', emoji: '🚨', price: 'R$49,90', store: 'Loja de Segurança', reason: 'Preparação essencial para tempestade!', category: 'Segurança', rating: 4.9, urgency: 'alta' },
    { id: 'wt2', name: 'Lanterna LED Recarregável', emoji: '🔦', price: 'R$34,90', store: 'Casa & Cia', reason: 'Sem energia? Fique iluminado!', category: 'Utilidades', rating: 4.7, urgency: 'alta' },
    { id: 'wt3', name: 'Pilha AA Duracell 4un', emoji: '🔋', price: 'R$16,90', store: 'Farmácia Popular', reason: 'Pilhas para lanternas e rádios', category: 'Utilidades', rating: 4.6, urgency: 'alta' },
    { id: 'wt4', name: 'Comida Enlatada Variada 6un', emoji: '🥫', price: 'R$32,90', store: 'Mercado Central', reason: 'Alimentos não-perecíveis para emergência', category: 'Mercearia', rating: 4.4, urgency: 'media' },
    { id: 'wt5', name: 'Coberta Térmica Dupla Face', emoji: '🛏️', price: 'R$59,90', store: 'Casa & Cia', reason: 'Mantenha-se aquecido se a energia cair', category: 'Casa', rating: 4.8, urgency: 'media' },
    { id: 'wt6', name: 'Carregador Portátil 10000mAh', emoji: '📱', price: 'R$69,90', store: 'Eletrônicos Plus', reason: 'Carregue seu celular sem energia!', category: 'Eletrônicos', rating: 4.5, urgency: 'alta' },
  ],
  garoa: [
    { id: 'wd1', name: 'Café com Leite Pronto 1L', emoji: '☕', price: 'R$7,90', store: 'Padaria Sabor', reason: 'Aconchego na garoa', category: 'Bebidas', rating: 4.6, urgency: 'media' },
    { id: 'wd2', name: 'Tapioca Recheada 4un', emoji: '🫓', price: 'R$14,90', store: 'Tapiocaria da Dona Maria', reason: 'Lanche prático para clima fresco', category: 'Padaria', rating: 4.7, urgency: 'media' },
    { id: 'wd3', name: 'Caldo Verde com Linguiça', emoji: '🍲', price: 'R$16,90', store: 'Restaurante Sabor Nordeste', reason: 'Prato típico perfeito pra garoa', category: 'Refeições', rating: 4.8, urgency: 'alta' },
    { id: 'wd4', name: 'Bolo de Milho Fatias', emoji: '🌽', price: 'R$6,90', store: 'Padaria Sabor', reason: 'Tradição brasileira de vó', category: 'Padaria', rating: 4.5, urgency: 'baixa' },
    { id: 'wd5', name: 'Geléia de Goiabada 500g', emoji: '🍇', price: 'R$11,90', store: 'Mercado Central', reason: 'Romeu e Julieta com queijo', category: 'Mercearia', rating: 4.4, urgency: 'baixa' },
    { id: 'wd6', name: 'Casaco Impermeável Leve', emoji: '🧥', price: 'R$79,90', store: 'Loja de Roupas', reason: 'Garoa: leve mas proteja-se', category: 'Vestuário', rating: 4.6, urgency: 'alta' },
  ],
  ventoso: [
    { id: 'wv1', name: 'Casa de Pipa Colorida', emoji: '🪁', price: 'R$15,90', store: 'Brinquedos & Cia', reason: 'Vento perfeito para empinar pipa!', category: 'Brinquedos', rating: 4.9, urgency: 'baixa' },
    { id: 'wv2', name: 'Sanduíche Natural Mix 3un', emoji: '🥪', price: 'R$16,90', store: 'Lanchonete Natural', reason: 'Refeição prática ao ar livre', category: 'Lanches', rating: 4.5, urgency: 'media' },
    { id: 'wv3', name: 'Hortelã Fresca Maço', emoji: '🌿', price: 'R$3,90', store: 'Hortifruti Dom Eliseu', reason: 'Para chá e sucos refrescantes', category: 'Hortifruti', rating: 4.4, urgency: 'baixa' },
    { id: 'wv4', name: 'Esparadrapo Antialérgico', emoji: '🩹', price: 'R$8,90', store: 'Farmácia Popular', reason: 'Prevenção: vento traz poeira', category: 'Saúde', rating: 4.3, urgency: 'media' },
    { id: 'wv5', name: 'Cerveja Artesanal IPA 600ml', emoji: '🍺', price: 'R$18,90', store: 'Empório Cervejeiro', reason: 'Vento + cerveja gelada = perfeito', category: 'Bebidas', rating: 4.7, urgency: 'baixa' },
    { id: 'wv6', name: 'Cachecol de Algodão', emoji: '🧣', price: 'R$39,90', store: 'Loja de Roupas', reason: 'Proteção contra vento frio', category: 'Vestuário', rating: 4.6, urgency: 'media' },
  ],
};

const weatherTips: Record<string, string[]> = {
  ensolarado: ['Use protetor solar FPS 50+', 'Beba ao menos 2L de água por dia', 'Evite exposição entre 11h e 15h'],
  nublado: ['Dia bom para compras sem fila!', 'Aproveite para planejar a semana', 'Visite feiras ao ar livre'],
  chuvoso: ['Verifique a previsão antes de sair', 'Leve guarda-chuva sempre', 'Peça delivery e evite trânsito'],
  tempestade: ['Fique em local seguro', 'Tenha kit de emergência em casa', 'Evite áreas alagáveis'],
  garoa: ['Use capa impermeável leve', 'Cuidado com piso molhado', 'Dia perfeito para sopa e cinema'],
  ventoso: ['Proteja objetos leves', 'Use óculos de proteção', 'Bom dia para atividades ao ar livre'],
};

function getTempColor(temp: number): string {
  if (temp >= 35) return 'text-red-400';
  if (temp >= 30) return 'text-orange-400';
  if (temp >= 25) return 'text-yellow-400';
  if (temp >= 20) return 'text-green-400';
  if (temp >= 15) return 'text-cyan-400';
  return 'text-blue-400';
}

function getTempGradient(temp: number): string {
  if (temp >= 35) return 'from-orange-500 via-red-500 to-rose-600';
  if (temp >= 30) return 'from-amber-400 via-orange-500 to-red-500';
  if (temp >= 25) return 'from-yellow-400 via-amber-500 to-orange-500';
  if (temp >= 20) return 'from-emerald-400 via-teal-500 to-cyan-500';
  if (temp >= 15) return 'from-cyan-400 via-blue-500 to-indigo-500';
  return 'from-blue-400 via-indigo-500 to-purple-600';
}

function getUvLabel(uv: number): { text: string; color: string } {
  if (uv >= 11) return { text: 'Extremo', color: 'text-purple-400 bg-purple-400/10' };
  if (uv >= 8) return { text: 'Muito Alto', color: 'text-red-400 bg-red-400/10' };
  if (uv >= 6) return { text: 'Alto', color: 'text-orange-400 bg-orange-400/10' };
  if (uv >= 3) return { text: 'Moderado', color: 'text-yellow-400 bg-yellow-400/10' };
  return { text: 'Baixo', color: 'text-green-400 bg-green-400/10' };
}

export function WeatherShopper() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const [showTips, setShowTips] = useState(false);
  const [addedToCart, setAddedToCart] = useState<string[]>([]);
  const [locationName] = useState('Dom Eliseu, PA');

  useEffect(() => {
    const timer = setTimeout(() => {
      setWeather(fallbackWeather);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const activeCondition = selectedCondition || weather?.condition || 'ensolarado';
  const suggestions = useMemo(() => {
    const items = allSuggestions[activeCondition] || allSuggestions.ensolarado;
    return items.filter(item => !dismissedSuggestions.includes(item.id));
  }, [activeCondition, dismissedSuggestions]);

  const tips = weatherTips[activeCondition] || weatherTips.ensolarado;
  const ConditionIcon = conditionIcons[activeCondition] || Sun;
  const uvInfo = weather ? getUvLabel(weather.uvIndex) : getUvLabel(6);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setWeather(fallbackWeather);
      setLoading(false);
    }, 600);
  };

  const handleDismiss = (id: string) => {
    setDismissedSuggestions(prev => [...prev, id]);
  };

  const handleAddToCart = (id: string) => {
    setAddedToCart(prev => [...prev, id]);
    setTimeout(() => {
      setAddedToCart(prev => prev.filter(i => i !== id));
    }, 2000);
  };

  const handleResetDismissed = () => {
    setDismissedSuggestions([]);
  };

  if (loading) {
    return (
      <div className="r62-card-lift rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 animate-pulse" />
          <div className="h-6 w-48 rounded-lg bg-white/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="r62-card-lift rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Cloud className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-sky-300 via-blue-400 to-cyan-400 bg-clip-text text-transparent r62-heading-gradient">
              Compras pelo Clima
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-400">{locationName}</span>
              <span className="text-xs text-slate-500">•</span>
              <Clock className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-400">Atualizado agora</span>
            </div>
          </div>
        </div>
        <motion.button
          onClick={handleRefresh}
          className="min-h-[44px] min-w-[44px] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="h-4 w-4 text-slate-300" />
        </motion.button>
      </div>

      {/* Weather Display Card */}
      <motion.div
        className={`r77-weather-card rounded-2xl bg-gradient-to-br ${getTempGradient(weather?.temp || 30)} p-5 mb-6 relative overflow-hidden`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex flex-col sm:flex-row items-center gap-4">
          {/* Big weather icon and temp */}
          <div className="flex items-center gap-4">
            <motion.span
              className="text-5xl"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {weatherEmojis[activeCondition]}
            </motion.span>
            <div>
              <div className={`text-4xl font-bold ${getTempColor(weather?.temp || 30)} drop-shadow-lg`}>
                {weather?.temp || 33}°C
              </div>
              <div className="text-sm text-white/80 flex items-center gap-1">
                <Thermometer className="h-3 w-3" />
                Sensação: {weather?.feelsLike || 37}°C
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 sm:ml-auto">
            <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
              <Droplets className="h-3.5 w-3.5 text-blue-200" />
              <span className="text-sm text-white/90">{weather?.humidity || 72}%</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
              <Wind className="h-3.5 w-3.5 text-blue-200" />
              <span className="text-sm text-white/90">{weather?.windSpeed || 12} km/h</span>
            </div>
            <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${uvInfo.color}`}>
              <Flame className="h-3.5 w-3.5" />
              <span className="text-sm font-medium">UV {weather?.uvIndex || 9}</span>
            </div>
          </div>
        </div>

        {/* Condition description */}
        <p className="text-white/80 text-sm mt-3 italic">{weather?.description}</p>

        {/* 5-day forecast strip */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {weather?.forecast.map((day, i) => (
            <motion.div
              key={day.day}
              className="r77-forecast-day flex-shrink-0 rounded-xl bg-white/15 backdrop-blur-sm px-3 py-2 text-center min-w-[52px]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-xs text-white/60 font-medium">{day.day}</div>
              <div className="text-lg my-1">{weatherEmojis[day.condition] || '☀️'}</div>
              <div className="text-sm font-bold text-white/90">{day.temp}°</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Condition Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {Object.entries(weatherEmojis).map(([key, emoji]) => (
          <motion.button
            key={key}
            onClick={() => setSelectedCondition(key === activeCondition ? null : key)}
            className={`r77-condition-tab flex-shrink-0 rounded-xl px-4 py-2.5 min-h-[44px] flex items-center gap-2 text-sm font-medium border transition-all ${
              activeCondition === key
                ? 'bg-sky-500/20 border-sky-400/40 text-sky-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{emoji}</span>
            <span className="capitalize">{key}</span>
          </motion.button>
        ))}
      </div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        <AnimatePresence mode="popLayout">
          {suggestions.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ delay: index * 0.05 }}
              className={`r77-suggestion-card rounded-xl border bg-white/5 p-4 relative overflow-hidden`}
            >
              {/* Urgency badge */}
              <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                item.urgency === 'alta'
                  ? 'bg-red-500/20 text-red-400'
                  : item.urgency === 'media'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {item.urgency === 'alta' ? '🔥 Urgente' : item.urgency === 'media' ? '⚡ Boa ideia' : '💡 Opcional'}
              </div>

              {/* Product info */}
              <div className="flex gap-3">
                <span className="text-3xl flex-shrink-0 mt-1">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white text-sm leading-tight pr-20">{item.name}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs text-slate-400">{item.store}</span>
                    <span className="text-yellow-400 text-xs">★ {item.rating}</span>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="mt-3 flex items-start gap-1.5 bg-sky-500/10 rounded-lg px-3 py-2">
                <Sparkles className="h-3.5 w-3.5 text-sky-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-sky-300">{item.reason}</span>
              </div>

              {/* Price and action */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-emerald-400">{item.price}</span>
                  {item.originalPrice && (
                    <span className="text-xs text-slate-500 line-through">{item.originalPrice}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => handleDismiss(item.id)}
                    className="min-h-[44px] min-w-[44px] rounded-lg bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-colors text-slate-400"
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleAddToCart(item.id)}
                    className={`min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center transition-all ${
                      addedToCart.includes(item.id)
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-sky-500/20 text-sky-400 hover:bg-sky-500/30'
                    }`}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {suggestions.length === 0 && (
        <motion.div
          className="text-center py-8 text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Umbrella className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Todas as sugestões foram dispensadas</p>
          <motion.button
            onClick={handleResetDismissed}
            className="mt-2 text-sky-400 text-sm underline underline-offset-2 hover:text-sky-300 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
            whileTap={{ scale: 0.95 }}
          >
            Mostrar todas novamente
          </motion.button>
        </motion.div>
      )}

      {/* Weather Tips */}
      <motion.button
        onClick={() => setShowTips(!showTips)}
        className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-sky-500/10 to-blue-500/10 border border-sky-500/20 px-4 py-3 flex items-center justify-between hover:from-sky-500/20 hover:to-blue-500/20 transition-all"
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2">
          <Umbrella className="h-4 w-4 text-sky-400" />
          <span className="text-sm font-medium text-sky-300">Dicas para o clima atual</span>
        </div>
        <motion.div
          animate={{ rotate: showTips ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-4 w-4 text-sky-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {showTips && (
          <motion.div
            className="r77-tips-panel mt-3 rounded-xl bg-white/5 border border-white/10 p-4 space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {tips.map((tip, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="h-6 w-6 rounded-full bg-sky-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-sky-400">{i + 1}</span>
                </div>
                <p className="text-sm text-slate-300">{tip}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>Dados simulados para Dom Eliseu, PA</span>
        <span className="flex items-center gap-1">
          <ConditionIcon className="h-3 w-3" />
          Clima: {activeCondition}
        </span>
      </div>
    </div>
  );
}

export default WeatherShopper;
