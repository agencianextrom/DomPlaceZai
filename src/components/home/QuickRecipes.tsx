'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChefHat, Clock, Users, Flame, Heart, ShoppingCart, X, RefreshCw,
  Filter, ChevronDown, Star, Sparkles, CheckCircle2, Plus, Minus,
  ArrowRight, BookmarkPlus, Share2
} from 'lucide-react';

interface Recipe {
  id: string;
  name: string;
  emoji: string;
  description: string;
  difficulty: 'fácil' | 'médio' | 'avançado';
  prepTime: number;
  cookTime: number;
  servings: number;
  calories: number;
  ingredients: { name: string; amount: string; emoji: string }[];
  steps: string[];
  category: string;
  tags: string[];
  rating: number;
  author: string;
  costPerServing: string;
  nutritionScore: number;
}

const allRecipes: Recipe[] = [
  {
    id: 'qr1', name: 'Moqueca de Peixe', emoji: '🐟',
    description: 'Prato paraense clássico com peixe fresco, leite de coco e dendê. Sabor autêntico da culinária amazônica.',
    difficulty: 'médio', prepTime: 20, cookTime: 35, servings: 4, calories: 380,
    ingredients: [
      { name: 'Filé de peixe', amount: '800g', emoji: '🐟' },
      { name: 'Leite de coco', amount: '400ml', emoji: '🥥' },
      { name: 'Azeite de dendê', amount: '3 colheres', emoji: '🫒' },
      { name: 'Pimentão', amount: '2 unidades', emoji: '🫑' },
      { name: 'Cebola', amount: '2 unidades', emoji: '🧅' },
      { name: 'Tomate', amount: '3 unidades', emoji: '🍅' },
      { name: 'Cilantro', amount: '1 maço', emoji: '🌿' },
      { name: 'Limão', amount: '2 unidades', emoji: '🍋' },
    ],
    steps: ['Temperar o peixe com limão, sal e pimenta por 30 min', 'Refogar cebola, pimentão e tomate no dendê', 'Adicionar o peixe e cozinhar 15 min', 'Acrescentar leite de coco e cozinhar mais 20 min', 'Finalizar com cilantro fresco e servir com arroz branco'],
    category: 'Prato Principal', tags: ['paraense', 'peixe', 'tradicional', 'almoco'],
    rating: 4.9, author: 'Dona Maria', costPerServing: 'R$12,50', nutritionScore: 82
  },
  {
    id: 'qr2', name: 'Açaí na Tigela', emoji: '🍇',
    description: 'Tigela de açaí cremoso com granola, banana, mel e frutas frescas. Energia para o dia todo!',
    difficulty: 'fácil', prepTime: 10, cookTime: 0, servings: 2, calories: 320,
    ingredients: [
      { name: 'Polpa de açaí', amount: '400g', emoji: '🍇' },
      { name: 'Banana', amount: '2 unidades', emoji: '🍌' },
      { name: 'Granola', amount: '100g', emoji: '🥣' },
      { name: 'Mel', amount: '2 colheres', emoji: '🍯' },
      { name: 'Morango', amount: '100g', emoji: '🍓' },
      { name: 'Leite condensado', amount: '50ml', emoji: '🥛' },
    ],
    steps: ['Bater açaí no liquidificador até cremoso', 'Cortar banana em rodelas', 'Montar a tigela: açaí no fundo', 'Decorar com banana, granola, morangos e mel', 'Finalizar com leite condensado'],
    category: 'Café da Manhã', tags: ['brasileiro', 'energia', 'rapido', 'saudavel'],
    rating: 4.8, author: 'Tia Nena', costPerServing: 'R$8,90', nutritionScore: 75
  },
  {
    id: 'qr3', name: 'Pão de Queijo Mineiro', emoji: '🧀',
    description: 'Pãozinhos de queijo crocantes por fora e macios por dentro. Receita tradicional mineira.',
    difficulty: 'fácil', prepTime: 15, cookTime: 25, servings: 20, calories: 150,
    ingredients: [
      { name: 'Polvilho azedo', amount: '500g', emoji: '🌾' },
      { name: 'Queijo meia cura', amount: '300g', emoji: '🧀' },
      { name: 'Ovo', amount: '3 unidades', emoji: '🥚' },
      { name: 'Leite', amount: '200ml', emoji: '🥛' },
      { name: 'Óleo', amount: '4 colheres', emoji: '🫗' },
      { name: 'Sal', amount: '1 colher', emoji: '🧂' },
    ],
    steps: ['Ferver leite com óleo e sal', 'Despejar sobre o polvilho e misturar', 'Agregar queijo ralado e ovos', 'Sovar até a massa ficar homogênea', 'Enrolar bolinhas e assar a 200°C por 25 min'],
    category: 'Lanche', tags: ['mineiro', 'queijo', 'petisco', 'festa'],
    rating: 4.7, author: 'Vó Benedita', costPerServing: 'R$1,50', nutritionScore: 55
  },
  {
    id: 'qr4', name: 'Feijoada Completa', emoji: '🥘',
    description: 'O prato mais brasileiro! Feijão preto com carnes variadas, acompanhamentos clássicos.',
    difficulty: 'avançado', prepTime: 30, cookTime: 120, servings: 8, calories: 520,
    ingredients: [
      { name: 'Feijão preto', amount: '1kg', emoji: '🫘' },
      { name: 'Costela de porco', amount: '500g', emoji: '🥩' },
      { name: 'Linguiça calabresa', amount: '300g', emoji: '🌭' },
      { name: 'Paio', amount: '200g', emoji: '🥓' },
      { name: 'Bacon', amount: '150g', emoji: '🥓' },
      { name: 'Couve', amount: '1 maço', emoji: '🥬' },
      { name: 'Laranja', amount: '4 unidades', emoji: '🍊' },
      { name: 'Arroz branco', amount: '500g', emoji: '🍚' },
    ],
    steps: ['Deixar feijão de molho na noite anterior', 'Cozinhar carnes na panela de pressão 40 min', 'Adicionar feijão e temperos, cozinhar 1h30', 'Preparar couve refogada e arroz branco', 'Servir com farofa, laranja fatiada e couve'],
    category: 'Prato Principal', tags: ['brasileiro', 'tradicional', 'almoco', 'sabado'],
    rating: 4.9, author: 'Seu Joaquim', costPerServing: 'R$9,80', nutritionScore: 62
  },
  {
    id: 'qr5', name: 'Brigadeiro Gourmet', emoji: '🍫',
    description: 'Brigadeiro cremoso com chocolate belga e granulado fino. Perfeito para festas!',
    difficulty: 'fácil', prepTime: 10, cookTime: 15, servings: 30, calories: 85,
    ingredients: [
      { name: 'Chocolate belga', amount: '200g', emoji: '🍫' },
      { name: 'Leite condensado', amount: '395g', emoji: '🥫' },
      { name: 'Creme de leite', amount: '200g', emoji: '🥛' },
      { name: 'Manteiga', amount: '1 colher', emoji: '🧈' },
      { name: 'Granulado', amount: '200g', emoji: '✨' },
    ],
    steps: ['Derreter chocolate em banho-maria', 'Misturar com leite condensado e creme de leite', 'Cozinhar em fogo baixo por 15 min', 'Esfriar e enrolar os brigadeiros', 'Passar no granulado e colocar em forminhas'],
    category: 'Sobremesa', tags: ['brasileiro', 'doce', 'festa', 'facil'],
    rating: 4.8, author: 'Confeitaria Delícia', costPerServing: 'R$1,20', nutritionScore: 35
  },
  {
    id: 'qr6', name: 'Tapioca Recheada', emoji: '🫓',
    description: 'Massa de tapioca crocante recheada com queijo, presunto e tomate. Lanche rápido e saboroso!',
    difficulty: 'fácil', prepTime: 5, cookTime: 8, servings: 2, calories: 280,
    ingredients: [
      { name: 'Goma de tapioca', amount: '200g', emoji: '🌾' },
      { name: 'Queijo muçarela', amount: '150g', emoji: '🧀' },
      { name: 'Presunto', amount: '100g', emoji: '🥩' },
      { name: 'Tomate', amount: '1 unidade', emoji: '🍅' },
      { name: 'Manteiga', amount: '1 colher', emoji: '🧈' },
    ],
    steps: ['Hidratar goma com água se necessário', 'Espalhar goma na frigideira quente', 'Adicionar recheio em metade', 'Dobrar ao meio e dourar dos dois lados', 'Servir quente com manteiga'],
    category: 'Café da Manhã', tags: ['nordestino', 'rapido', 'pratico', 'cafe'],
    rating: 4.6, author: 'Dona Lúcia', costPerServing: 'R$5,50', nutritionScore: 58
  },
];

const categories = ['Todos', 'Prato Principal', 'Café da Manhã', 'Lanche', 'Sobremesa'];
const difficulties = ['Todos', 'fácil', 'médio', 'avançado'];

const difficultyColors: Record<string, string> = {
  fácil: 'bg-green-500/20 text-green-400 border-green-500/30',
  médio: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  avançado: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

function getScoreGradient(score: number): string {
  if (score >= 80) return 'from-green-500 to-emerald-600';
  if (score >= 60) return 'from-yellow-500 to-amber-600';
  return 'from-red-500 to-orange-600';
}

export function QuickRecipes() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todos');
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [addedToCart, setAddedToCart] = useState<string[]>([]);
  const [servingsOverride, setServingsOverride] = useState<Record<string, number>>({});
  const [sortBy, setSortBy] = useState<'popular' | 'quick' | 'healthy' | 'cheap'>('popular');

  const filteredRecipes = useMemo(() => {
    let items = [...allRecipes];
    if (selectedCategory !== 'Todos') items = items.filter(r => r.category === selectedCategory);
    if (selectedDifficulty !== 'Todos') items = items.filter(r => r.difficulty === selectedDifficulty);
    switch (sortBy) {
      case 'quick': items.sort((a, b) => (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime)); break;
      case 'healthy': items.sort((a, b) => b.nutritionScore - a.nutritionScore); break;
      case 'cheap': items.sort((a, b) => parseFloat(a.costPerServing.replace('R$', '').replace(',', '.')) - parseFloat(b.costPerServing.replace('R$', '').replace(',', '.'))); break;
      default: items.sort((a, b) => b.rating - a.rating);
    }
    return items;
  }, [selectedCategory, selectedDifficulty, sortBy]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleAddToCart = (recipeId: string) => {
    setAddedToCart(prev => [...prev, recipeId]);
    setTimeout(() => setAddedToCart(prev => prev.filter(i => i !== recipeId)), 2000);
  };

  const getServings = (recipe: Recipe) => servingsOverride[recipe.id] || recipe.servings;
  const adjustServings = (recipeId: string, delta: number) => {
    setServingsOverride(prev => {
      const current = prev[recipeId] || allRecipes.find(r => r.id === recipeId)!.servings;
      const next = Math.max(1, current + delta);
      return { ...prev, [recipeId]: next };
    });
  };

  return (
    <div className="r62-card-lift rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <motion.div
            className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20"
            whileHover={{ scale: 1.05, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChefHat className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-orange-300 via-red-400 to-pink-400 bg-clip-text text-transparent r62-heading-gradient">
              Receitas Rápidas
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Inspiração culinária brasileira para o dia a dia</p>
          </div>
        </div>
        <motion.button
          onClick={() => { setSelectedCategory('Todos'); setSelectedDifficulty('Todos'); setSortBy('popular'); setExpandedRecipe(null); }}
          className="min-h-[44px] min-w-[44px] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="h-4 w-4 text-slate-300" />
        </motion.button>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(cat => (
          <motion.button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-lg px-3 py-2 min-h-[44px] text-xs font-medium border transition-all ${
              selectedCategory === cat
                ? 'bg-orange-500/20 border-orange-400/40 text-orange-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
            whileTap={{ scale: 0.97 }}
          >
            {cat}
          </motion.button>
        ))}
        <div className="h-auto w-px bg-white/10 mx-1" />
        {difficulties.map(diff => (
          <motion.button
            key={diff}
            onClick={() => setSelectedDifficulty(diff)}
            className={`rounded-lg px-3 py-2 min-h-[44px] text-xs font-medium border transition-all ${
              selectedDifficulty === diff
                ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
            whileTap={{ scale: 0.97 }}
          >
            {diff === 'Todos' ? 'Difficulty' : diff}
          </motion.button>
        ))}
      </div>

      {/* Sort row */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { id: 'popular' as const, label: 'Mais Populares', icon: Star },
          { id: 'quick' as const, label: 'Mais Rápidos', icon: Clock },
          { id: 'healthy' as const, label: 'Mais Saudáveis', icon: Flame },
          { id: 'cheap' as const, label: 'Mais Baratos', icon: BookmarkPlus },
        ].map(s => (
          <motion.button
            key={s.id}
            onClick={() => setSortBy(s.id)}
            className={`flex-shrink-0 rounded-lg px-3 py-1.5 min-h-[44px] flex items-center gap-1.5 text-xs font-medium border transition-all ${
              sortBy === s.id
                ? 'bg-red-500/20 border-red-400/40 text-red-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
            whileTap={{ scale: 0.97 }}
          >
            <s.icon className="h-3 w-3" />
            {s.label}
          </motion.button>
        ))}
      </div>

      {/* Recipe Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        <AnimatePresence mode="popLayout">
          {filteredRecipes.map((recipe, index) => {
            const isExpanded = expandedRecipe === recipe.id;
            const isFavorite = favorites.includes(recipe.id);
            const isAdded = addedToCart.includes(recipe.id);
            const servings = getServings(recipe);

            return (
              <motion.div
                key={recipe.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.04 }}
                className={`r79-recipe-card rounded-xl border bg-white/5 overflow-hidden`}
              >
                {/* Recipe hero */}
                <div className="relative h-32 bg-gradient-to-br from-orange-900/50 to-red-900/50 flex items-center justify-center">
                  <motion.span
                    className="text-5xl"
                    animate={isExpanded ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {recipe.emoji}
                  </motion.span>
                  {/* Difficulty badge */}
                  <div className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${difficultyColors[recipe.difficulty]}`}>
                    {recipe.difficulty}
                  </div>
                  {/* Nutrition score */}
                  <div className="absolute top-2 right-2 flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getScoreGradient(recipe.nutritionScore)} flex items-center justify-center`}>
                      <span className="text-[10px] font-bold text-white">{recipe.nutritionScore}</span>
                    </div>
                    <span className="text-[8px] text-slate-400 mt-0.5">nutri</span>
                  </div>
                  {/* Favorite */}
                  <motion.button
                    onClick={() => toggleFavorite(recipe.id)}
                    className={`absolute bottom-2 right-2 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
                      isFavorite ? 'bg-red-500/30 text-red-400' : 'bg-black/30 text-white/60 hover:text-red-400'
                    }`}
                    whileTap={{ scale: 0.8 }}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </motion.button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h4 className="font-semibold text-white text-sm mb-1">{recipe.name}</h4>
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">{recipe.description}</p>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 mb-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {recipe.prepTime + recipe.cookTime}min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {servings} porções
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      {recipe.rating}
                    </span>
                  </div>

                  {/* Cost + author */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-500">Por {recipe.author}</span>
                    <span className="text-sm font-bold text-emerald-400">{recipe.costPerServing}/porção</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {recipe.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-full">#{tag}</span>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => setExpandedRecipe(isExpanded ? null : recipe.id)}
                      className="flex-1 min-h-[44px] rounded-lg bg-orange-500/20 text-orange-300 flex items-center justify-center gap-1.5 text-xs font-medium hover:bg-orange-500/30 transition-colors"
                      whileTap={{ scale: 0.97 }}
                    >
                      {isExpanded ? 'Fechar' : 'Ver Receita'}
                      <ArrowRight className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </motion.button>
                    <motion.button
                      onClick={() => handleAddToCart(recipe.id)}
                      className={`min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center transition-all ${
                        isAdded ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-slate-300 hover:bg-white/15'
                      }`}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      className="min-h-[44px] min-w-[44px] rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 transition-colors"
                      whileTap={{ scale: 0.9 }}
                    >
                      <Share2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Expanded: Ingredients + Steps */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      className="border-t border-white/10 p-4 space-y-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Servings adjuster */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Porções</span>
                        <div className="flex items-center gap-2">
                          <motion.button
                            onClick={() => adjustServings(recipe.id, -1)}
                            className="min-h-[44px] min-w-[44px] rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10"
                            whileTap={{ scale: 0.9 }}
                          >
                            <Minus className="h-3 w-3" />
                          </motion.button>
                          <span className="text-sm font-bold text-white min-w-[2rem] text-center">{servings}</span>
                          <motion.button
                            onClick={() => adjustServings(recipe.id, 1)}
                            className="min-h-[44px] min-w-[44px] rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10"
                            whileTap={{ scale: 0.9 }}
                          >
                            <Plus className="h-3 w-3" />
                          </motion.button>
                        </div>
                      </div>

                      {/* Ingredients */}
                      <div>
                        <h5 className="text-xs font-medium text-orange-300 mb-2 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Ingredientes
                        </h5>
                        <div className="space-y-1.5">
                          {recipe.ingredients.map((ing, i) => {
                            const multiplier = servings / recipe.servings;
                            return (
                              <motion.div
                                key={i}
                                className="flex items-center gap-2 text-xs text-slate-300"
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                              >
                                <span>{ing.emoji}</span>
                                <span className="flex-1">{ing.name}</span>
                                <span className="text-slate-500">{parseFloat(ing.amount) > 0 ? `${Math.round(parseFloat(ing.amount) * multiplier)}${ing.amount.replace(/[\d.]+/, '')}` : ing.amount}</span>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Steps */}
                      <div>
                        <h5 className="text-xs font-medium text-orange-300 mb-2 flex items-center gap-1">
                          <Flame className="h-3 w-3" />
                          Modo de Preparo
                        </h5>
                        <div className="space-y-2">
                          {recipe.steps.map((step, i) => (
                            <motion.div
                              key={i}
                              className="flex gap-2 text-xs text-slate-300"
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.08 }}
                            >
                              <div className="h-5 w-5 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-[10px] font-bold text-orange-400">{i + 1}</span>
                              </div>
                              <span className="leading-relaxed">{step}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Add all ingredients to cart */}
                      <motion.button
                        onClick={() => handleAddToCart(recipe.id)}
                        className="w-full min-h-[44px] rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-orange-300 flex items-center justify-center gap-2 text-xs font-medium hover:from-orange-500/30 hover:to-red-500/30 transition-all"
                        whileTap={{ scale: 0.97 }}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Adicionar ingredientes ao carrinho
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <ChefHat className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhuma receita encontrada</p>
          <p className="text-xs text-slate-500 mt-1">Tente outros filtros</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{allRecipes.length} receitas brasileiras</span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-green-400" />
          {allRecipes.filter(r => r.difficulty === 'fácil').length} receitas fáceis
        </span>
      </div>
    </div>
  );
}

export default QuickRecipes;
