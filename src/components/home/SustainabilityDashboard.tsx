'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, Recycle, Droplets, TreePine, Truck, Package, Sparkles, CloudSun,
  ChevronRight, X, RefreshCw, Star, TrendingUp, Heart, Share2,
  Award, Zap, Globe, BarChart3, Target, CheckCircle2
} from 'lucide-react';

interface EcoTip {
  id: string;
  title: string;
  description: string;
  impact: string;
  icon: string;
  category: string;
  saved: boolean;
}

interface GreenMetric {
  id: string;
  label: string;
  value: string;
  unit: string;
  change: number;
  icon: typeof Leaf;
  color: string;
  description: string;
}

const greenMetrics: GreenMetric[] = [
  { id: 'gm1', label: 'CO₂ Evitado', value: '127.5', unit: 'kg', change: 12.3, icon: CloudSun, color: 'from-green-400 to-emerald-600', description: 'Emissões evitadas com entregas combinadas' },
  { id: 'gm2', label: 'Plástico Reciclado', value: '45.2', unit: 'kg', change: 8.7, icon: Recycle, color: 'from-cyan-400 to-blue-600', description: 'Embalagens recicladas este mês' },
  { id: 'gm3', label: 'Água Economizada', value: '834', unit: 'L', change: 5.2, icon: Droplets, color: 'from-blue-400 to-indigo-600', description: 'Com suppliers que usam irrigação eficiente' },
  { id: 'gm4', label: 'Árvores Plantadas', value: '23', unit: '', change: 3, icon: TreePine, color: 'from-emerald-400 to-green-600', description: 'Programa "Compre e Plante" — 1 árvore a cada R$100' },
];

interface LocalProducer {
  id: string;
  name: string;
  emoji: string;
  location: string;
  distance: string;
  practices: string[];
  products: number;
  rating: number;
  organic: boolean;
  hero: boolean;
}

const producers: LocalProducer[] = [
  { id: 'lp1', name: 'Sítio São José', emoji: '🌾', location: 'Km 12 Rod. PA-140', distance: '12 km', practices: ['Orgânico', 'Sem agrotóxico', 'Irrigação eficiente'], products: 45, rating: 4.9, organic: true, hero: true },
  { id: 'lp2', name: 'Horto Família Souza', emoji: '🥬', location: 'Centro, Dom Eliseu', distance: '1.5 km', practices: ['Hidroponia', 'Zero desperdício'], products: 28, rating: 4.8, organic: true, hero: false },
  { id: 'lp3', name: 'Apiário Mel do Pará', emoji: '🐝', location: 'Comunidade São Pedro', distance: '8 km', practices: ['Manejo sustentável', 'Sem fumaça'], products: 12, rating: 4.7, organic: true, hero: false },
  { id: 'lp4', name: 'Pesqueiro Rio Tauá', emoji: '🐟', location: 'Margem do Rio Tauá', distance: '5 km', practices: ['Piscicultura natural', 'Alimentação orgânica'], products: 8, rating: 4.6, organic: false, hero: false },
];

const ecoTips: EcoTip[] = [
  { id: 'et1', title: 'Sacas Reutilizáveis', description: 'Use sacas de pano nas compras. Economize 200 sacos plásticos por ano!', impact: 'Média de 200 sacos/ano', icon: '🛍️', category: 'redução', saved: false },
  { id: 'et2', title: 'Compre Local', description: 'Produtos locais viajam menos, geram menos CO₂ e apoiam a economia da região.', impact: '-40% emissões de transporte', icon: '🏠', category: 'transporte', saved: false },
  { id: 'et3', title: 'Frutas da Estação', description: 'Frutas da estação não precisam de estufas ou transporte de longa distância.', impact: '-60% pegada de carbono', icon: '🍓', category: 'alimentação', saved: false },
  { id: 'et4', title: 'Evite Desperdício', description: 'Planeje as refeições da semana. 30% do alimento produzido é desperdiçado no Brasil.', impact: 'Economize R$200/mês', icon: '📋', category: 'planejamento', saved: false },
  { id: 'et5', title: 'Embalagens Eco', description: 'Prefira produtos com embalagem reciclável ou retornável. Verifique o selo FSC.', impact: '-70% resíduos plásticos', icon: '♻️', category: 'reciclagem', saved: false },
  { id: 'et6', title: 'Certificação Orgânica', description: 'Produtos orgânicos são livres de agrotóxicos e protegem o solo e a água.', impact: 'Solo mais saudável por 5 anos', icon: '🌿', category: 'alimentação', saved: false },
];

const challengeData = {
  title: 'Desafio Verde de Junho',
  description: 'Complete 5 ações sustentáveis este mês e ganhe 500 pontos de lealdade!',
  total: 5,
  completed: 3,
  actions: [
    { name: 'Fazer compra com saca reutilável', done: true },
    { name: 'Comprar pelo menos 3 produtos locais', done: true },
    { name: 'Escolher 1 produto orgânico', done: true },
    { name: 'Reciclar embalagens da última compra', done: false },
    { name: 'Indicar o desafio para um amigo', done: false },
  ],
  reward: 500,
  daysLeft: 18,
};

export function SustainabilityDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'producers' | 'tips' | 'challenge'>('overview');
  const [savedTips, setSavedTips] = useState<string[]>([]);
  const [showBadgeAnimation, setShowBadgeAnimation] = useState(false);

  const toggleSaveTip = (id: string) => {
    setSavedTips(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const tabs = [
    { id: 'overview' as const, label: 'Visão Geral', icon: BarChart3 },
    { id: 'producers' as const, label: 'Produtores Locais', icon: Leaf },
    { id: 'tips' as const, label: 'Dicas Verdes', icon: Sparkles },
    { id: 'challenge' as const, label: 'Desafio', icon: Target },
  ];

  return (
    <div className="r62-card-lift rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <motion.div
            className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Leaf className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-green-300 via-emerald-400 to-teal-400 bg-clip-text text-transparent r62-heading-gradient">
              Sustentabilidade
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Compre consciente, apoie Dom Eliseu</p>
          </div>
        </div>
        <motion.button
          onClick={() => setShowBadgeAnimation(true)}
          className="min-h-[44px] min-w-[44px] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <Award className="h-4 w-4 text-emerald-400" />
        </motion.button>
      </div>

      {/* Badge animation */}
      <AnimatePresence>
        {showBadgeAnimation && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBadgeAnimation(false)}
          >
            <motion.div
              className="r80-badge-glow rounded-2xl bg-gradient-to-br from-emerald-900 to-green-800 border border-emerald-500/30 p-8 max-w-sm mx-4 text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <motion.div
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center mb-4"
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <Leaf className="h-10 w-10 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Eco-Consumidor 🌱</h3>
              <p className="text-sm text-emerald-200 mb-2">Nível Verde — Top 10% de compradores sustentáveis</p>
              <div className="flex items-center justify-center gap-1 text-xs text-emerald-400 mb-4">
                <Star className="h-3 w-3 fill-current" />
                <Star className="h-3 w-3 fill-current" />
                <Star className="h-3 w-3 fill-current" />
                <Star className="h-3 w-3 fill-current" />
                <Star className="h-3 w-3 text-emerald-600" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-center mb-4">
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="text-lg font-bold text-emerald-400">127kg</div>
                  <div className="text-[10px] text-slate-400">CO₂ evitado</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="text-lg font-bold text-emerald-400">23</div>
                  <div className="text-[10px] text-slate-400">Árvores plantadas</div>
                </div>
              </div>
              <motion.button
                onClick={(e) => { e.stopPropagation(); setShowBadgeAnimation(false); }}
                className="min-h-[44px] rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-medium px-6"
                whileTap={{ scale: 0.95 }}
              >
                Compartilhar badge
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(tab => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 rounded-lg px-4 py-2.5 min-h-[44px] flex items-center gap-2 text-xs font-medium border transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
            whileTap={{ scale: 0.97 }}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Green Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {greenMetrics.map((metric, i) => (
              <motion.div
                key={metric.id}
                className={`r80-metric-card rounded-xl bg-white/5 border border-white/5 p-4`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center mb-2`}>
                  <metric.icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-xl font-bold text-white">{metric.value}<span className="text-xs text-slate-400 ml-0.5">{metric.unit}</span></div>
                <div className="text-[10px] text-slate-400 mt-0.5">{metric.label}</div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  <span className="text-[10px] text-green-400 font-medium">+{metric.change}% este mês</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Eco Stats */}
          <div className="r80-stats-bar rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 p-4">
            <div className="flex flex-wrap items-center justify-around gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-400">87%</div>
                <div className="text-[10px] text-slate-400">das entregas são combinadas</div>
              </div>
              <div className="hidden sm:block h-8 w-px bg-emerald-500/20" />
              <div>
                <div className="text-2xl font-bold text-cyan-400">62%</div>
                <div className="text-[10px] text-slate-400">embalagens recicláveis</div>
              </div>
              <div className="hidden sm:block h-8 w-px bg-emerald-500/20" />
              <div>
                <div className="text-2xl font-bold text-teal-400">4</div>
                <div className="text-[10px] text-slate-400">produtores orgânicos locais</div>
              </div>
            </div>
          </div>

          {/* Featured Producer */}
          <div className="r80-featured-producer rounded-xl bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-emerald-500/20 p-5">
            <div className="flex items-start gap-4">
              <motion.span
                className="text-4xl"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {producers[0].emoji}
              </motion.span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">{producers[0].name}</h3>
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">Orgânico</span>
                  <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30">Destaque</span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{producers[0].location} — {producers[0].distance}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {producers[0].practices.map(p => (
                    <span key={p} className="text-[10px] bg-white/5 text-emerald-300 px-2 py-0.5 rounded-full">{p}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-yellow-400"><Star className="h-3 w-3 fill-current" />{producers[0].rating}</span>
                  <span className="text-xs text-slate-400">{producers[0].products} produtos</span>
                  <motion.button
                    className="ml-auto min-h-[44px] rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium px-3 flex items-center gap-1"
                    whileTap={{ scale: 0.97 }}
                  >
                    Ver produtos <ChevronRight className="h-3 w-3" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Producers Tab */}
      {activeTab === 'producers' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {producers.map((producer, i) => (
            <motion.div
              key={producer.id}
              className="r80-producer-row rounded-xl bg-white/5 border border-white/5 p-4 flex items-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 2, backgroundColor: 'rgba(255,255,255,0.06)' }}
            >
              <span className="text-3xl">{producer.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-white text-sm">{producer.name}</h4>
                  {producer.organic && (
                    <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">Orgânico</span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{producer.location}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {producer.practices.slice(0, 2).map(p => (
                    <span key={p} className="text-[10px] bg-white/5 text-slate-300 px-1.5 py-0.5 rounded-full">{p}</span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-slate-400">{producer.distance}</div>
                <div className="flex items-center gap-0.5 text-xs text-yellow-400">
                  <Star className="h-3 w-3 fill-current" />{producer.rating}
                </div>
                <div className="text-[10px] text-slate-500">{producer.products} produtos</div>
              </div>
              <motion.button
                className="min-h-[44px] min-w-[44px] rounded-lg bg-emerald-500/20 flex items-center justify-center"
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="h-4 w-4 text-emerald-400" />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Tips Tab */}
      {activeTab === 'tips' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {ecoTips.map((tip, i) => (
            <motion.div
              key={tip.id}
              className="r80-tip-card rounded-xl bg-white/5 border border-white/5 p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -1, boxShadow: '0 4px 16px rgba(16, 185, 129, 0.08)' }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{tip.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white text-sm">{tip.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tip.description}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Zap className="h-3 w-3 text-emerald-400" />
                    <span className="text-[10px] text-emerald-400 font-medium">{tip.impact}</span>
                  </div>
                </div>
                <motion.button
                  onClick={() => toggleSaveTip(tip.id)}
                  className={`min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center transition-all shrink-0 ${
                    savedTips.includes(tip.id)
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/5 text-slate-400 hover:text-emerald-400'
                  }`}
                  whileTap={{ scale: 0.8 }}
                >
                  <Heart className={`h-4 w-4 ${savedTips.includes(tip.id) ? 'fill-current' : ''}`} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Challenge Tab */}
      {activeTab === 'challenge' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Challenge header */}
          <div className="r80-challenge-header rounded-xl bg-gradient-to-br from-emerald-900/40 to-green-900/40 border border-emerald-500/20 p-5 text-center">
            <motion.div
              className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center mb-3"
              animate={{ rotate: [0, -3, 3, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Target className="h-8 w-8 text-white" />
            </motion.div>
            <h3 className="text-lg font-bold text-white mb-1">{challengeData.title}</h3>
            <p className="text-xs text-slate-400 mb-3">{challengeData.description}</p>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">{challengeData.completed}/{challengeData.total}</div>
                <div className="text-[10px] text-slate-400">Completadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">{challengeData.daysLeft}</div>
                <div className="text-[10px] text-slate-400">Dias restantes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">{challengeData.reward}</div>
                <div className="text-[10px] text-slate-400">Pontos de prêmio</div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-3 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${(challengeData.completed / challengeData.total) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Action checklist */}
          <div className="space-y-2">
            {challengeData.actions.map((action, i) => (
              <motion.div
                key={i}
                className={`flex items-center gap-3 rounded-xl p-3 border transition-all ${
                  action.done
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-white/5 border-white/5'
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className={`min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center ${
                  action.done ? 'bg-emerald-500/20' : 'bg-white/5 border border-dashed border-white/20'
                }`}>
                  {action.done ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <div className="h-3 w-3 rounded-full bg-white/20" />
                  )}
                </div>
                <span className={`text-sm flex-1 ${action.done ? 'text-emerald-300 line-through opacity-70' : 'text-slate-300'}`}>
                  {action.name}
                </span>
                {action.done && (
                  <span className="text-[10px] text-emerald-400 font-medium">✅ Completa</span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Globe className="h-3 w-3 text-emerald-400" />
          Compromisso com o meio ambiente
        </span>
        <span>{savedTips.length} dicas salvas</span>
      </div>
    </div>
  );
}

export default SustainabilityDashboard;
