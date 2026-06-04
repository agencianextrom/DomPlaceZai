'use client';

import { useState, useEffect, useCallback, useRef, startTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CircleDollarSign,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Gift,
  Store,
  Clock,
  CheckCircle2,
  BarChart3,
  Wallet,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────
interface Transaction {
  id: string;
  store: string;
  amount: number;
  date: string;
  status: 'pending' | 'credited';
  rate: number;
}

interface StoreRate {
  name: string;
  rate: number;
  emoji: string;
}

interface DailyEarning {
  day: string;
  amount: number;
}

interface CashbackData {
  balance: number;
  totalEarned: number;
  totalPending: number;
  totalRedeemed: number;
  transactions: Transaction[];
  weeklyChart: DailyEarning[];
  lastUpdated: string;
}

const STORAGE_KEY = 'r39-cashback-data';

// ─── Default mock data ─────────────────────────────────
const DEFAULT_DATA: CashbackData = {
  balance: 47.8,
  totalEarned: 156.4,
  totalPending: 23.5,
  totalRedeemed: 85.1,
  transactions: [
    { id: 't1', store: 'Supermercado Pao de Acucar', amount: 5.2, date: '2025-01-12', status: 'credited', rate: 3 },
    { id: 't2', store: 'Loja do Mecanico', amount: 12.8, date: '2025-01-11', status: 'pending', rate: 5 },
    { id: 't3', store: 'Farmacia Drogasil', amount: 3.15, date: '2025-01-10', status: 'credited', rate: 2 },
    { id: 't4', store: 'Padaria Sabor Caseiro', amount: 1.8, date: '2025-01-09', status: 'credited', rate: 1 },
    { id: 't5', store: 'Pet Shop Amigo Fiel', amount: 8.45, date: '2025-01-08', status: 'pending', rate: 5 },
  ],
  weeklyChart: [
    { day: 'Seg', amount: 8.2 },
    { day: 'Ter', amount: 3.5 },
    { day: 'Qua', amount: 12.8 },
    { day: 'Qui', amount: 6.1 },
    { day: 'Sex', amount: 9.4 },
    { day: 'Sab', amount: 15.2 },
    { day: 'Dom', amount: 4.8 },
  ],
  lastUpdated: new Date().toISOString(),
};

const STORE_RATES: StoreRate[] = [
  { name: 'Supermercados', rate: 3, emoji: '🛒' },
  { name: 'Pet Shops', rate: 5, emoji: '🐾' },
  { name: 'Farmacias', rate: 2, emoji: '💊' },
  { name: 'Padarias', rate: 1, emoji: '🍞' },
  { name: 'Lojas Auto', rate: 5, emoji: '🔧' },
  { name: 'Restaurante', rate: 2, emoji: '🍽️' },
];

const MILESTONES = [50, 100, 200];

// ─── Sparkle component ─────────────────────────────────
function SparkleEffect() {
  const sparkles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 4,
    delay: Math.random() * 1.5,
    duration: Math.random() * 1.5 + 1,
  }));

  return (
    <div className="r39-sparkle-container">
      {sparkles.map((s) => (
        <motion.span
          key={s.id}
          className="r39-sparkle-particle"
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 0.5, 0],
            scale: [0, 1.2, 0.8, 0],
            rotate: [0, 180, 360],
            y: [0, -30, -60],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 2 + 1,
          }}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            fontSize: s.size,
          }}
        >
          ✦
        </motion.span>
      ))}
    </div>
  );
}

// ─── Circular Progress Ring ─────────────────────────────
function CircularProgressRing({ percentage, size = 80 }: { percentage: number; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="r39-ring-wrapper" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="r39-ring-svg -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(34,197,94,0.15)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(34,197,94,0.85)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="r39-ring-label">
        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

// ─── Mini Bar Chart ─────────────────────────────────────
function WeeklyBarChart({ data }: { data: DailyEarning[] }) {
  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="r39-chart-container">
      <div className="flex items-end justify-between gap-1" style={{ height: 80 }}>
        {data.map((item, index) => {
          const height = (item.amount / maxAmount) * 100;
          return (
            <div key={item.day} className="flex flex-col items-center gap-1 flex-1">
              <motion.div
                className="r39-chart-bar"
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{
                  duration: 0.6,
                  delay: 0.8 + index * 0.08,
                  type: 'spring' as const,
                  stiffness: 100,
                  damping: 15,
                }}
                title={`R$ ${item.amount.toFixed(2)}`}
              />
              <span className="r39-chart-label">{item.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Animated coin counter ──────────────────────────────
function AnimatedCounter({ target, prefix = 'R$ ' }: { target: number; prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
    const duration = 1200;

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(eased * target);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [target]);

  return (
    <span className="r39-coin-value">
      {prefix}
      {displayValue.toFixed(2).replace('.', ',')}
    </span>
  );
}

// ─── Main Component ─────────────────────────────────────
export function CashbackTracker() {
  const [data, setData] = useState<CashbackData | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const initializedRef = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const loadFromStorage = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as CashbackData;
          startTransition(() => setData(parsed));
        } else {
          startTransition(() => setData(DEFAULT_DATA));
        }
      } catch {
        startTransition(() => setData(DEFAULT_DATA));
      }
    };
    loadFromStorage();
  }, []);

  // Save to localStorage on changes
  const persistData = useCallback((newData: CashbackData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch {
      // ignore storage errors
    }
  }, []);

  // Don't render until hydrated from localStorage
  if (!data) return null;

  // Find next milestone
  const nextMilestone = MILESTONES.find((m) => m > data.balance) ?? MILESTONES[MILESTONES.length - 1] + 100;
  const progressPercent = Math.min((data.balance / nextMilestone) * 100, 100);

  // Handle redemption
  const handleRedeem = useCallback(() => {
    if (isRedeeming || data.balance < 10) return;
    setIsRedeeming(true);
    setShowSparkles(true);

    const redeemed = Math.min(data.balance, 30);
    const newData: CashbackData = {
      ...data,
      balance: Math.round((data.balance - redeemed) * 100) / 100,
      totalRedeemed: Math.round((data.totalRedeemed + redeemed) * 100) / 100,
      lastUpdated: new Date().toISOString(),
    };

    setTimeout(() => {
      setData(newData);
      persistData(newData);
      setIsRedeeming(false);
    }, 1500);

    setTimeout(() => setShowSparkles(false), 2500);
  }, [data, isRedeeming, persistData]);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { type: 'spring' as const, stiffness: 120, damping: 20 },
  };

  return (
    <section className="r39-cashback-container" aria-label="Cashback Tracker">
      {/* ── Header ─────────────────────────────── */}
      <motion.div
        className="r39-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 150, damping: 20 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <h2 className="r39-title">Cashback Tracker</h2>
        </div>
        <p className="r39-subtitle">Ganhe dinheiro de volta em cada compra</p>
      </motion.div>

      {/* ── Balance Card ────────────────────────── */}
      <motion.div
        className="r39-balance-card relative overflow-hidden rounded-2xl p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring' as const, stiffness: 100, damping: 18, delay: 0.1 }}
      >
        <div className="r39-balance-gradient" />
        <AnimatePresence>
          {showSparkles && <SparkleEffect />}
        </AnimatePresence>

        <div className="relative z-10 flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-emerald-300" />
              <span className="r39-balance-label">Saldo Disponivel</span>
            </div>
            <div className="r39-balance-amount">
              <span className="text-xl mr-1">🪙</span>
              <AnimatedCounter target={data.balance} />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-0 text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{data.totalEarned.toFixed(2).replace('.', ',')} este mes
              </Badge>
            </div>
          </div>

          <div className="r39-ring-section">
            <CircularProgressRing percentage={progressPercent} size={88} />
            <p className="text-xs text-center text-emerald-200 mt-1">
              ate R$ {nextMilestone}
            </p>
          </div>
        </div>

        {/* Milestone progress bar */}
        <div className="relative z-10 mt-5">
          <div className="flex justify-between text-xs text-emerald-200/80 mb-1.5">
            <span>Progresso para proximo milestone</span>
            <span>R$ {data.balance.toFixed(2).replace('.', ',')} / R$ {nextMilestone}</span>
          </div>
          <div className="r39-progress-track">
            <motion.div
              className="r39-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
            />
          </div>
          <div className="flex gap-3 mt-2">
            {MILESTONES.map((m) => (
              <span
                key={m}
                className={`text-xs px-2 py-0.5 rounded-full ${
                  data.balance >= m
                    ? 'bg-emerald-400/30 text-emerald-100'
                    : 'bg-white/10 text-emerald-200/60'
                }`}
              >
                {data.balance >= m ? '✅' : '🎯'} R$ {m}
              </span>
            ))}
          </div>
        </div>

        {/* Redeem button */}
        <div className="relative z-10 mt-5">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              className="r39-redeem-btn w-full"
              onClick={handleRedeem}
              disabled={isRedeeming || data.balance < 10}
              size="lg"
            >
              {isRedeeming ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  ⏳
                </motion.span>
              ) : (
                <Gift className="w-4 h-4 mr-2" />
              )}
              {isRedeeming
                ? 'Processando resgate...'
                : data.balance < 10
                  ? 'Minimo R$ 10 para resgatar'
                  : 'Resgatar ate R$ 30,00'}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Monthly Summary ─────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          {
            label: 'Ganho este mes',
            value: data.totalEarned,
            icon: <CircleDollarSign className="w-4 h-4" />,
            color: 'r39-stat-earned',
          },
          {
            label: 'Pendente',
            value: data.totalPending,
            icon: <Clock className="w-4 h-4" />,
            color: 'r39-stat-pending',
          },
          {
            label: 'Resgatado',
            value: data.totalRedeemed,
            icon: <CheckCircle2 className="w-4 h-4" />,
            color: 'r39-stat-redeemed',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className={`r39-stat-card ${stat.color} rounded-xl p-3 text-center`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'spring' as const,
              stiffness: 120,
              damping: 20,
              delay: 0.25 + index * 0.08,
            }}
          >
            <div className="flex items-center justify-center gap-1 mb-1 text-muted-foreground">
              {stat.icon}
              <span className="text-xs">{stat.label}</span>
            </div>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
              R$ {stat.value.toFixed(2).replace('.', ',')}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── Weekly Chart ────────────────────────── */}
      <motion.div
        className="r39-chart-card mt-4 rounded-xl p-4 border border-border/50 bg-card/50"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...fadeInUp.transition, delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-semibold">Ultimos 7 dias</span>
          </div>
          <span className="text-xs text-muted-foreground">
            Total: R$ {data.weeklyChart.reduce((s, d) => s + d.amount, 0).toFixed(2).replace('.', ',')}
          </span>
        </div>
        <WeeklyBarChart data={data.weeklyChart} />
      </motion.div>

      {/* ── Store Rates ─────────────────────────── */}
      <motion.div
        className="r39-rates-card mt-4 rounded-xl p-4 border border-border/50 bg-card/50"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...fadeInUp.transition, delay: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold">Cashback por Loja</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {STORE_RATES.map((store, i) => (
            <motion.div
              key={store.name}
              className="r39-rate-chip"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'spring' as const,
                stiffness: 140,
                damping: 18,
                delay: 0.7 + i * 0.05,
              }}
            >
              <span className="mr-1">{store.emoji}</span>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                {store.rate}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">{store.name}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Recent Transactions ──────────────────── */}
      <motion.div
        className="r39-transactions-card mt-4 rounded-xl p-4 border border-border/50 bg-card/50"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...fadeInUp.transition, delay: 0.75 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-semibold">Transacoes Recentes</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            {data.transactions.length}
          </Badge>
        </div>

        <div className="r39-transaction-list max-h-64 overflow-y-auto custom-scrollbar space-y-2">
          {data.transactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              className="r39-transaction-item glass-card rounded-lg px-3 py-2.5 flex items-center justify-between"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: 'spring' as const,
                stiffness: 120,
                damping: 20,
                delay: 0.85 + index * 0.07,
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg">🏪</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{tx.store}</p>
                  <p className="text-xs text-muted-foreground">{tx.date} · {tx.rate}% cashback</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="r39-tx-amount text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  +R$ {tx.amount.toFixed(2).replace('.', ',')}
                </span>
                <Badge
                  className={`text-[10px] px-1.5 py-0 ${
                    tx.status === 'credited'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                  }`}
                >
                  {tx.status === 'credited' ? 'Creditado' : 'Pendente'}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
