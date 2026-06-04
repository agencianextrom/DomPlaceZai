'use client';

import { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
const emptySubscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

import { motion, AnimatePresence } from 'framer-motion';

interface WeeklySpecial {
  id: string;
  name: string;
  emoji: string;
  originalPrice: number;
  specialPrice: number;
  discount: number;
  store: string;
}

type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const dayConfigs: Record<DayOfWeek, { label: string; shortLabel: string }> = {
  0: { label: 'Domingo', shortLabel: 'Dom' },
  1: { label: 'Segunda-feira', shortLabel: 'Seg' },
  2: { label: 'Terça-feira', shortLabel: 'Ter' },
  3: { label: 'Quarta-feira', shortLabel: 'Qua' },
  4: { label: 'Quinta-feira', shortLabel: 'Qui' },
  5: { label: 'Sexta-feira', shortLabel: 'Sex' },
  6: { label: 'Sábado', shortLabel: 'Sáb' },
};

const weeklySpecials: Record<DayOfWeek, WeeklySpecial[]> = {
  0: [
    { id: 'w1', name: 'Café Especial Torrado', emoji: '☕', originalPrice: 29.90, specialPrice: 19.90, discount: 33, store: 'Mercado Bom Sabor' },
    { id: 'w2', name: 'Pão de Queijo (500g)', emoji: '🧀', originalPrice: 18.50, specialPrice: 12.90, discount: 30, store: 'Padaria Nova Esperança' },
    { id: 'w3', name: 'Suco Natural 1L', emoji: '🧃', originalPrice: 14.90, specialPrice: 9.90, discount: 33, store: 'Frutas do Sítio' },
    { id: 'w4', name: 'Bolo de Chocolate', emoji: '🍰', originalPrice: 32.00, specialPrice: 22.40, discount: 30, store: 'Confeitaria Da Vovó' },
  ],
  1: [
    { id: 'w5', name: 'Arroz 5kg Premium', emoji: '🍚', originalPrice: 28.90, specialPrice: 19.90, discount: 31, store: 'Supermercado Central' },
    { id: 'w6', name: 'Feijão Carioca 1kg', emoji: '🫘', originalPrice: 9.90, specialPrice: 6.90, discount: 30, store: 'Supermercado Central' },
    { id: 'w7', name: 'Óleo de Soja 900ml', emoji: '🫒', originalPrice: 8.90, specialPrice: 5.90, discount: 34, store: 'Mercado Bom Sabor' },
  ],
  2: [
    { id: 'w8', name: 'Açaí na Tigela 500ml', emoji: '🫐', originalPrice: 22.00, specialPrice: 14.30, discount: 35, store: 'Açaí do Parque' },
    { id: 'w9', name: 'Carne Moída 500g', emoji: '🥩', originalPrice: 34.90, specialPrice: 23.90, discount: 32, store: 'Açougue Boi de Ouro' },
    { id: 'w10', name: 'Macarrão Espaguete 500g', emoji: '🍝', originalPrice: 7.90, specialPrice: 5.50, discount: 30, store: 'Supermercado Central' },
    { id: 'w11', name: 'Molho de Tomate 340g', emoji: '🍅', originalPrice: 4.50, specialPrice: 3.15, discount: 30, store: 'Supermercado Central' },
  ],
  3: [
    { id: 'w12', name: 'Frango Inteiro kg', emoji: '🍗', originalPrice: 16.90, specialPrice: 11.90, discount: 30, store: 'Açougue Boi de Ouro' },
    { id: 'w13', name: 'Banana Prata 1kg', emoji: '🍌', originalPrice: 6.90, specialPrice: 4.50, discount: 35, store: 'Frutas do Sítio' },
    { id: 'w14', name: 'Leite Integral 1L', emoji: '🥛', originalPrice: 6.49, specialPrice: 4.49, discount: 31, store: 'Laticínios São José' },
  ],
  4: [
    { id: 'w15', name: 'Pizza Grande Mussarela', emoji: '🍕', originalPrice: 45.00, specialPrice: 29.90, discount: 34, store: 'Pizzaria Napoli' },
    { id: 'w16', name: 'Refrigerante 2L', emoji: '🥤', originalPrice: 12.90, specialPrice: 8.90, discount: 31, store: 'Supermercado Central' },
    { id: 'w17', name: 'Batata Frita Congelada 500g', emoji: '🍟', originalPrice: 16.90, specialPrice: 11.90, discount: 30, store: 'Supermercado Central' },
    { id: 'w18', name: 'Ketchup 500g', emoji: '🫙', originalPrice: 9.90, specialPrice: 6.93, discount: 30, store: 'Mercado Bom Sabor' },
  ],
  5: [
    { id: 'w19', name: 'Peixe Fresco kg', emoji: '🐟', originalPrice: 39.90, specialPrice: 27.90, discount: 30, store: 'Peixaria do Porto' },
    { id: 'w20', name: 'Vinho Tinto Seco 750ml', emoji: '🍷', originalPrice: 54.90, specialPrice: 36.90, discount: 33, store: 'Empório Sabores' },
    { id: 'w21', name: 'Queijo Mussarela 400g', emoji: '🧀', originalPrice: 24.90, specialPrice: 16.90, discount: 32, store: 'Laticínios São José' },
  ],
  6: [
    { id: 'w22', name: 'Coxinha (unidade)', emoji: '🥟', originalPrice: 5.90, specialPrice: 3.90, discount: 34, store: 'Lanchonete da Praça' },
    { id: 'w23', name: 'Pastel de Carne (unidade)', emoji: '🥧', originalPrice: 7.00, specialPrice: 4.90, discount: 30, store: 'Lanchonete da Praça' },
    { id: 'w24', name: 'Caldo de Cana 500ml', emoji: '🎋', originalPrice: 10.00, specialPrice: 6.99, discount: 30, store: 'Cantinho do Açúcar' },
    { id: 'w25', name: 'Tapioca Recheada', emoji: '🫓', originalPrice: 12.00, specialPrice: 8.40, discount: 30, store: 'Tapioca da Dona Maria' },
  ],
};

function getCurrentDay(): DayOfWeek {
  return new Date().getDay() as DayOfWeek;
}

function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const dayProgress = 1 - diff / (24 * 60 * 60 * 1000);
  return { hours, minutes, seconds, totalSeconds, dayProgress };
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function padTwo(n: number): string {
  return n.toString().padStart(2, '0');
}

function CountdownDisplay({ hours, minutes, seconds }: { hours: number; minutes: number; seconds: number }) {
  return (
    <div className="flex items-center gap-1 font-mono text-sm r36-timer-glow">
      <span className="rounded bg-red-900/80 px-1.5 py-0.5 text-red-100">{padTwo(hours)}</span>
      <span className="text-red-400 font-bold">:</span>
      <span className="rounded bg-red-900/80 px-1.5 py-0.5 text-red-100">{padTwo(minutes)}</span>
      <span className="text-red-400 font-bold">:</span>
      <span className="rounded bg-red-900/80 px-1.5 py-0.5 text-red-100">{padTwo(seconds)}</span>
    </div>
  );
}

function SpecialCard({ special, index, isDayOfDeal }: { special: WeeklySpecial; index: number; isDayOfDeal: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      transition={{ type: 'spring' as const, stiffness: 340, damping: 26, delay: index * 0.08 }}
      whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
      className="relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 sm:p-5 r31-card-hover r36-weekly-card"
    >
      {/* r36 shimmer sweep overlay */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-10">
        <div className="absolute inset-0 r36-weekly-shimmer" />
      </div>
      {isDayOfDeal && index === 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
          className="absolute -top-3 left-4 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 px-3 py-1 text-xs font-bold text-amber-900 shadow-md weekly-deal-badge"
        >
          ⭐ Oferta do dia
        </motion.div>
      )}
      <motion.div
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
        className="absolute -top-2 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm r31-badge-glow r36-badge-pulse"
      >
        -{special.discount}%
      </motion.div>
      <motion.div
        initial={{ rotate: -10 }}
        animate={{ rotate: 0 }}
        transition={{ type: 'spring' as const, stiffness: 200, damping: 15, delay: index * 0.08 + 0.15 }}
        className="mb-3 text-center text-4xl"
      >
        {special.emoji}
      </motion.div>
      <h3 className="mb-1 text-sm font-semibold text-zinc-800 dark:text-zinc-100 sm:text-base">{special.name}</h3>
      <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">{special.store}</p>
      <div className="mb-4 flex items-end gap-2">
        <span className="text-sm text-zinc-400 line-through">{formatCurrency(special.originalPrice)}</span>
        <span className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(special.specialPrice)}</span>
      </div>
      <div className="mt-auto">
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-shadow hover:shadow-lg r31-cta-shimmer"
        >
          <span className="relative z-10">Comprar</span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, repeatType: 'loop' as const, duration: 2.5, ease: 'easeInOut' }}
          />
        </motion.button>
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="mb-2 h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mb-4 h-3 w-1/2 rounded bg-zinc-100 dark:bg-zinc-600" />
          <div className="mb-2 h-5 w-2/5 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-6 w-1/3 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-4 h-10 w-full rounded-xl bg-zinc-200 dark:bg-zinc-700" />
        </div>
      ))}
    </div>
  );
}

export function WeeklySpecials() {
  const mounted = useHydrated();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => getCurrentDay());
  const [currentDay, setCurrentDay] = useState<DayOfWeek>(() => getCurrentDay());
  const [countdown, setCountdown] = useState(() => getTimeUntilMidnight());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setCountdown(getTimeUntilMidnight());
      const day = getCurrentDay();
      if (day !== currentDay) {
        setCurrentDay(day);
        setSelectedDay(day);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [mounted, currentDay]);

  const handleDaySelect = useCallback((day: DayOfWeek) => setSelectedDay(day), []);
  const specials = useMemo(() => weeklySpecials[selectedDay], [selectedDay]);
  const isDayOfDeal = selectedDay === currentDay;

  const days = useMemo(() => [0, 1, 2, 3, 4, 5, 6] as DayOfWeek[], []);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 24 }}
          className="weekly-specials-title text-2xl font-bold text-zinc-800 dark:text-zinc-100 sm:text-3xl r31-weekly-shimmer"
        >
          🔥 Ofertas da Semana
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-1 text-sm text-zinc-500 dark:text-zinc-400"
        >
          Promoções exclusivas todos os dias em Dom Eliseu
        </motion.p>
      </div>

      <div className="relative mb-6 overflow-hidden rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
        <div className="relative grid grid-cols-7 gap-1">
          {days.map((day) => {
            const config = dayConfigs[day];
            const isToday = day === currentDay;
            const isActive = day === selectedDay;
            return (
              <motion.button
                key={day}
                onClick={() => handleDaySelect(day)}
                whileTap={{ scale: 0.95 }}
                className={`relative z-10 flex flex-col items-center gap-0.5 rounded-lg py-2 text-xs font-medium transition-colors sm:text-sm ${
                  isActive
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                    : isToday
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <span className="font-bold">{config.shortLabel}</span>
                {isToday && !isActive && <span className="h-1.5 w-1.5 rounded-full bg-green-500" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isDayOfDeal && mounted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 24 }}
            className="mb-6 overflow-hidden"
          >
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-4 py-3 text-white shadow-md sm:px-6">
              <div className="flex items-center gap-2">
                <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }} className="text-xl">⏰</motion.span>
                <span className="text-sm font-medium sm:text-base">Ofertas de {dayConfigs[currentDay].label}</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs opacity-80">Acaba em</span>
                <CountdownDisplay hours={countdown.hours} minutes={countdown.minutes} seconds={countdown.seconds} />
              </div>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400"
                initial={{ width: 0 }}
                animate={{ width: `${countdown.dayProgress * 100}%` }}
                transition={{ duration: 1, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {specials.map((special, index) => (
              <SpecialCard key={special.id} special={special} index={index} isDayOfDeal={isDayOfDeal} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 text-center">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">* Preços válidos somente para o dia selecionado. Sujeito a disponibilidade.</p>
      </motion.div>
    </section>
  );
}

export default WeeklySpecials;
