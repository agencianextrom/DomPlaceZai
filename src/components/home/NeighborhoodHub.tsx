'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Star,
  Clock,
  TrendingUp,
  Users,
  ChevronRight,
  Store,
  MessageSquare,
  Bell,
  Sparkles,
  Heart,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import { cachedFetch } from '@/lib/api-cache';
import { useAppStore } from '@/store/useAppStore';

// ── Interfaces ────────────────────────────────────────────────────────────

interface StoreCard {
  id: string;
  name: string;
  category: string;
  rating: number;
  deliveryFee: number;
  deliveryTime: number;
  emoji: string;
  isOnline: boolean;
}

interface ActivityItem {
  id: string;
  type: 'new_product' | 'promo' | 'review' | 'milestone';
  storeName: string;
  message: string;
  time: string;
  emoji: string;
}

interface LocalTip {
  id: string;
  title: string;
  description: string;
  emoji: string;
  likes: number;
}

interface NeighborhoodStats {
  totalStores: number;
  onlineStores: number;
  newThisWeek: number;
  avgRating: number;
}

type ActiveTab = 'stores' | 'activity' | 'tips';

// ── Helpers ───────────────────────────────────────────────────────────────

const CATEGORY_EMOJIS: Record<string, string> = {
  FOOD: '🍽️',
  SERVICES: '🔧',
  AGRICULTURE: '🌿',
  FASHION: '👗',
  ELECTRONICS: '📱',
  HEALTH: '💊',
  HOME_GARDEN: '🏠',
  ANIMALS: '🐾',
  BEAUTY: '💅',
  SPORTS: '⚽',
  EDUCATION: '📚',
  OTHER: '🏪',
};

const CATEGORY_LABELS: Record<string, string> = {
  FOOD: 'Alimentação',
  SERVICES: 'Serviços',
  AGRICULTURE: 'Agricultura',
  FASHION: 'Moda',
  ELECTRONICS: 'Eletrônicos',
  HEALTH: 'Saúde',
  HOME_GARDEN: 'Casa & Jardim',
  ANIMALS: 'Animais',
  BEAUTY: 'Beleza',
  SPORTS: 'Esportes',
  EDUCATION: 'Educação',
  OTHER: 'Outros',
};

const ACTIVITY_TYPES = ['new_product', 'promo', 'review', 'milestone'] as const;
const ACTIVITY_EMOJIS: Record<string, string> = {
  new_product: '🆕',
  promo: '🔥',
  review: '⭐',
  milestone: '🎉',
};

function formatDeliveryFee(fee: number): string {
  if (fee === 0) return 'Grátis';
  return `R$${fee.toFixed(fee % 1 === 0 ? 0 : 2)}`;
}

// ── Component ──────────────────────────────────────────────────────────────

export function NeighborhoodHub() {
  const [stores, setStores] = useState<StoreCard[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [tips, setTips] = useState<LocalTip[]>([]);
  const [stats, setStats] = useState<NeighborhoodStats | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('stores');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  const { selectStore, navigate } = useAppStore();

  // ── Data Fetching ──────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      const [storesData, productsData] = await Promise.all([
        cachedFetch('/api/stores?limit=8'),
        cachedFetch('/api/products?limit=8'),
      ]);

      if (storesData && 'stores' in storesData && Array.isArray(storesData.stores)) {
        const mapped = storesData.stores.slice(0, 6).map((s: Record<string, unknown>) => ({
          id: String(s.id ?? ''),
          name: String(s.name ?? 'Loja'),
          category: String(s.category ?? 'OTHER'),
          rating: Number(s.rating ?? 0),
          deliveryFee: Number(s.deliveryFee ?? 5),
          deliveryTime: Number(s.deliveryTime ?? 30),
          emoji: CATEGORY_EMOJIS[String(s.category)] ?? '🏪',
          isOnline: s.status === 'ACTIVE',
        }));
        setStores(mapped);
        setStats({
          totalStores: storesData.stores.length,
          onlineStores: mapped.filter((s: StoreCard) => s.isOnline).length,
          newThisWeek: Math.min(storesData.stores.length, 3),
          avgRating:
            mapped.reduce((sum: number, s: StoreCard) => sum + s.rating, 0) / (mapped.length || 1),
        });
      }

      if (productsData && 'products' in productsData && Array.isArray(productsData.products)) {
        const mockActivities: ActivityItem[] = productsData.products.slice(0, 5).map(
          (p: Record<string, unknown>, i: number) => ({
            id: `act-${i}`,
            type: ACTIVITY_TYPES[i % 4],
            storeName: String(p.storeName ?? 'Loja Local'),
            message:
              i % 2 === 0
                ? `${String(p.name ?? 'Produto')} adicionado ao catálogo`
                : `${String(p.storeName ?? 'Loja')} está com oferta especial`,
            time: `${i + 1}h atrás`,
            emoji: ACTIVITY_EMOJIS[ACTIVITY_TYPES[i % 4]],
          }),
        );
        setActivities(mockActivities);
      }

      // Local tips (static curated content)
      setTips([
        {
          id: 'tip-1',
          title: 'Entrega mais rápida nos fins de semana',
          description: 'Pedidos feitos até às 10h costumam chegar em até 20 minutos nas manhãs de sábado.',
          emoji: '🚀',
          likes: 42,
        },
        {
          id: 'tip-2',
          title: 'Frete grátis em compras acima de R$30',
          description: 'A maioria das lojas da região oferece entrega gratuita para pedidos acima de R$30.',
          emoji: '🎁',
          likes: 38,
        },
        {
          id: 'tip-3',
          title: 'Novos produtos toda terça',
          description: 'As lojas costumam lançar novidades nas terças-feiras. Fique atento!',
          emoji: '✨',
          likes: 27,
        },
      ]);
    } catch {
      // Fallback data when API is unavailable
      setStores([
        { id: '1', name: 'Padaria Sol', category: 'FOOD', rating: 4.8, deliveryFee: 3, deliveryTime: 25, emoji: '🍞', isOnline: true },
        { id: '2', name: 'Tech House', category: 'ELECTRONICS', rating: 4.5, deliveryFee: 5, deliveryTime: 40, emoji: '📱', isOnline: true },
        { id: '3', name: 'Farmácia Vida', category: 'HEALTH', rating: 4.7, deliveryFee: 0, deliveryTime: 20, emoji: '💊', isOnline: true },
        { id: '4', name: 'Pet Shop Amigo', category: 'ANIMALS', rating: 4.6, deliveryFee: 4, deliveryTime: 35, emoji: '🐾', isOnline: false },
        { id: '5', name: 'Açaí da Terra', category: 'FOOD', rating: 4.9, deliveryFee: 3, deliveryTime: 30, emoji: '🫐', isOnline: true },
        { id: '6', name: 'Horti Fruti', category: 'AGRICULTURE', rating: 4.4, deliveryFee: 2, deliveryTime: 20, emoji: '🥬', isOnline: true },
      ]);
      setActivities([
        { id: 'a1', type: 'new_product', storeName: 'Padaria Sol', message: 'Pão integral artesanal adicionado', time: '1h atrás', emoji: '🆕' },
        { id: 'a2', type: 'promo', storeName: 'Tech House', message: '20% off em acessórios', time: '2h atrás', emoji: '🔥' },
        { id: 'a3', type: 'review', storeName: 'Farmácia Vida', message: 'Nova avaliação 5 estrelas', time: '3h atrás', emoji: '⭐' },
        { id: 'a4', type: 'milestone', storeName: 'Pet Shop Amigo', message: '500 pedidos entregues!', time: '5h atrás', emoji: '🎉' },
      ]);
      setStats({ totalStores: 6, onlineStores: 5, newThisWeek: 2, avgRating: 4.6 });
      setTips([
        { id: 'tip-1', title: 'Entrega mais rápida nos fins de semana', description: 'Pedidos feitos até às 10h costumam chegar mais rápido.', emoji: '🚀', likes: 42 },
        { id: 'tip-2', title: 'Frete grátis em compras acima de R$30', description: 'A maioria das lojas oferece entrega gratuita acima de R$30.', emoji: '🎁', likes: 38 },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleStoreTap = useCallback(
    (store: StoreCard) => {
      navigate('store');
    },
    [navigate],
  );

  const handleToggleTip = useCallback((id: string) => {
    setExpandedTip((prev) => (prev === id ? null : id));
  }, []);

  // ── Loading Skeleton ───────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <div className="h-5 w-40 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <div className="flex-1 h-8 rounded-lg animate-pulse" />
          <div className="flex-1 h-8 rounded-lg animate-pulse ml-1" />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ── Stats Summary Bar ──────────────────────────────────────────────────

  const StatsBar = () => {
    if (!stats) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring' as const, stiffness: 300, damping: 25 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2"
      >
        {[
          { value: stats.totalStores, label: 'Lojas', icon: Store, color: 'text-blue-500' },
          { value: stats.onlineStores, label: 'Online', icon: Zap, color: 'text-emerald-500' },
          { value: stats.newThisWeek, label: 'Novas', icon: Sparkles, color: 'text-amber-500' },
          { value: stats.avgRating.toFixed(1), label: 'Avaliação', icon: Star, color: 'text-yellow-500' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg bg-gray-50 dark:bg-gray-800/50"
          >
            <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
            <span className="text-sm font-bold">{stat.value}</span>
            <span className="text-[9px] text-muted-foreground leading-tight">{stat.label}</span>
          </div>
        ))}
      </motion.div>
    );
  };

  // ── Store Card ──────────────────────────────────────────────────────────

  const StoreCardComponent = ({ store, index }: { store: StoreCard; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring' as const, stiffness: 300, damping: 25 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => handleStoreTap(store)}
      className="bg-card border border-border/60 rounded-xl p-3 active:scale-[0.98] transition-all hover:border-primary/30 cursor-pointer relative overflow-hidden group"
    >
      {/* Category badge */}
      <div className="absolute top-2 right-2 text-[8px] font-medium text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded-md">
        {CATEGORY_LABELS[store.category] ?? store.category}
      </div>

      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{store.emoji}</span>
        {store.isOnline && <span className="w-2 h-2 rounded-full bg-emerald-500 r60-online-dot shrink-0 mt-1" />}
      </div>

      <h4 className="text-xs font-semibold truncate pr-14">{store.name}</h4>

      <div className="flex items-center gap-1 mt-1">
        <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
        <span className="text-[10px] font-medium text-muted-foreground">{store.rating}</span>
      </div>

      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
        <Clock className="h-2.5 w-2.5" />
        <span>{store.deliveryTime} min</span>
        <span className="mx-0.5">·</span>
        {store.deliveryFee === 0 ? (
          <span className="text-emerald-600 font-semibold">Grátis</span>
        ) : (
          <span>{formatDeliveryFee(store.deliveryFee)}</span>
        )}
      </div>

      {/* Hover glow overlay */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none r60-store-glow" />
    </motion.div>
  );

  // ── Activity Item ───────────────────────────────────────────────────────

  const ActivityItemComponent = ({ activity, index }: { activity: ActivityItem; index: number }) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, type: 'spring' as const, stiffness: 300, damping: 25 }}
      className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border/40"
    >
      <span className="text-xl mt-0.5 shrink-0">{activity.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
          {activity.message}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
          <span>{activity.storeName}</span>
          <span>·</span>
          <span>{activity.time}</span>
        </p>
      </div>
      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
    </motion.div>
  );

  // ── Tip Card ────────────────────────────────────────────────────────────

  const TipCardComponent = ({ tip }: { tip: LocalTip }) => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
      onClick={() => handleToggleTip(tip.id)}
      className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-200/60 dark:border-amber-800/30 cursor-pointer active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start gap-2">
        <span className="text-lg shrink-0">{tip.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{tip.title}</p>
          <AnimatePresence>
            {expandedTip === tip.id && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-[10px] text-muted-foreground mt-1 leading-relaxed overflow-hidden"
              >
                {tip.description}
              </motion.p>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-2 mt-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleTip(tip.id);
              }}
              className="text-[10px] text-amber-700 dark:text-amber-400 font-medium min-h-[44px] inline-flex items-center"
            >
              {expandedTip === tip.id ? 'Ver menos' : 'Saiba mais'}
            </button>
            <div className="flex items-center gap-0.5 text-muted-foreground">
              <Heart className="h-2.5 w-2.5" />
              <span className="text-[9px]">{tip.likes}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // ── Tab Config ──────────────────────────────────────────────────────────

  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'stores', label: 'Lojas', icon: <Store className="h-3.5 w-3.5" />, count: stores.length },
    { key: 'activity', label: 'Atividades', icon: <Bell className="h-3.5 w-3.5" />, count: activities.length },
    { key: 'tips', label: 'Dicas', icon: <MessageSquare className="h-3.5 w-3.5" />, count: tips.length },
  ];

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 r62-card-lift r100-neighborhood-card">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-sm">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold leading-tight r62-heading-gradient">Vizinhança</h3>
            <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <TrendingUp className="h-2.5 w-2.5 text-emerald-500" />
              Dom Eliseu, PA
            </p>
          </div>
        </div>
        <button className="text-xs text-primary font-medium flex items-center gap-0.5 active:scale-95 transition-transform min-h-[44px]">
          Ver tudo <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {/* Stats Summary */}
      <StatsBar />

      {/* Tab Switcher */}
      <div className="flex bg-gray-100 dark:bg-gray-800/60 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 min-h-[44px] rounded-lg text-xs font-medium transition-all active:scale-[0.97] ${
              activeTab === tab.key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <span className="inline-flex items-center gap-1">
              {tab.icon}
              {tab.label}
              <span className="text-[9px] opacity-60">({tab.count})</span>
            </span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="space-y-2"
        >
          {activeTab === 'stores' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {stores.map((store, i) => (
                <StoreCardComponent key={store.id} store={store} index={i} />
              ))}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-2">
              {activities.map((activity, i) => (
                <ActivityItemComponent key={activity.id} activity={activity} index={i} />
              ))}
              {activities.length === 0 && (
                <div className="text-center py-10">
                  <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Nenhuma atividade recente</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-2">
              {tips.map((tip) => (
                <TipCardComponent key={tip.id} tip={tip} />
              ))}
              {tips.length === 0 && (
                <div className="text-center py-10">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Nenhuma dica disponível</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-2 pt-1 pb-1"
      >
        <Users className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">
          {stats ? `${stats.onlineStores} lojas atendendo agora` : 'Carregando...'}
        </span>
      </motion.div>
    </div>
  );
}
