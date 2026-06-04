'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  ChevronDown,
  Truck,
  CheckCircle,
  X,
  Navigation,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { cachedFetch } from '@/lib/api-cache';

// ── Types ──────────────────────────────────────────────────────────────────

interface OrderStep {
  id: string;
  label: string;
  icon: string;
  completed: boolean;
  active: boolean;
  time?: string;
}

interface ActiveOrder {
  id: string;
  orderNumber: string;
  storeName: string;
  storePhone?: string;
  status: string;
  estimatedMinutes?: number;
  driverName?: string;
  driverPhone?: string;
  driverVehicle?: string;
  createdAt: string;
  total: number;
}

interface OrdersResponse {
  orders: ActiveOrder[];
}

const STATUS_FLOW = [
  'CONFIRMED',
  'PREPARING',
  'READY',
  'DELIVERING',
  'DELIVERED',
] as const;

const ACTIVE_STATUSES = new Set<string>([
  'CONFIRMED',
  'PREPARING',
  'READY',
  'DELIVERING',
]);

const STEP_CONFIG: readonly { id: string; label: string; icon: string; statuses: readonly string[] }[] = [
  { id: 'placed', label: 'Pedido confirmado', icon: '✅', statuses: ['CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED'] },
  { id: 'preparing', label: 'Loja preparando', icon: '👨‍🍳', statuses: ['PREPARING', 'READY', 'DELIVERING', 'DELIVERED'] },
  { id: 'ready', label: 'Pronto para retirada', icon: '📦', statuses: ['READY', 'DELIVERING', 'DELIVERED'] },
  { id: 'delivering', label: 'A caminho', icon: '🚴', statuses: ['DELIVERING', 'DELIVERED'] },
  { id: 'delivered', label: 'Entregue', icon: '🎉', statuses: ['DELIVERED'] },
];

const REFRESH_INTERVAL = 30_000; // 30 seconds

// ── Helpers ────────────────────────────────────────────────────────────────

function buildSteps(status: string): OrderStep[] {
  return STEP_CONFIG.map((cfg) => ({
    id: cfg.id,
    label: cfg.label,
    icon: cfg.icon,
    completed: cfg.statuses.includes(status),
    active: cfg.statuses.includes(status) && !cfg.statuses.slice(1).some((s) => s === status && cfg.statuses[0] !== s),
  }));
}

function resolveActiveStatus(status: string): string {
  if (STATUS_FLOW.includes(status as typeof STATUS_FLOW[number])) return status;
  return 'CONFIRMED';
}

function formatEta(minutes?: number): string {
  if (!minutes) return 'Calculando...';
  const min = Math.max(0, Math.round(minutes));
  const max = min + 15;
  return `${min}–${max} minutos`;
}

function getStorePhone(order: ActiveOrder): string | undefined {
  return order.storePhone ?? undefined;
}

// ── Progress ring constants ──────────────────────────────────────────────────
const CIRCUMFERENCE = 2 * Math.PI * 15.5; // ~97.39

// ── Component ──────────────────────────────────────────────────────────────

interface MobileOrderTrackerProps {
  orderId?: string;
}

export function MobileOrderTracker({ orderId }: MobileOrderTrackerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [order, setOrder] = useState<ActiveOrder | null>(null);
  const [steps, setSteps] = useState<OrderStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  // ── Fetch active order ───────────────────────────────────────────────────
  const checkActiveOrder = useCallback(async () => {
    try {
      let activeOrder: ActiveOrder | null = null;

      // If a specific orderId is provided, fetch that order directly
      if (orderId) {
        const data = await cachedFetch<{ order: ActiveOrder }>(`/api/orders/${orderId}`);
        if (data?.order && ACTIVE_STATUSES.has(data.order.status)) {
          activeOrder = data.order;
        }
      }

      // Otherwise, look for any active order
      if (!activeOrder) {
        const data = await cachedFetch<OrdersResponse>('/api/orders?status=DELIVERING&limit=1');
        if (data?.orders?.length > 0) {
          activeOrder = data.orders[0];
        }
      }

      // Also try PREPARING and READY statuses if no DELIVERING found
      if (!activeOrder) {
        const [preparingRes, readyRes] = await Promise.allSettled([
          cachedFetch<OrdersResponse>('/api/orders?status=PREPARING&limit=1'),
          cachedFetch<OrdersResponse>('/api/orders?status=READY&limit=1'),
        ]);

        const preparingOrder = preparingRes.status === 'fulfilled' ? preparingRes.value?.orders?.[0] : null;
        const readyOrder = readyRes.status === 'fulfilled' ? readyRes.value?.orders?.[0] : null;

        activeOrder = preparingOrder ?? readyOrder ?? null;
      }

      if (activeOrder) {
        const effectiveStatus = resolveActiveStatus(activeOrder.status);
        setOrder({ ...activeOrder, status: effectiveStatus });
        setSteps(buildSteps(effectiveStatus));
        setIsLoading(false);
        return;
      }
    } catch {
      // API failed — try localStorage fallback for development
    }

    // Fallback: localStorage mock data
    if (typeof window !== 'undefined') {
      try {
        const mockRaw = localStorage.getItem('r60-active-order');
        if (mockRaw) {
          const mockOrder = JSON.parse(mockRaw) as ActiveOrder;
          const effectiveStatus = resolveActiveStatus(mockOrder.status);
          setOrder({ ...mockOrder, status: effectiveStatus });
          setSteps(buildSteps(effectiveStatus));
          setIsLoading(false);
          return;
        }
      } catch {
        // Ignore parse errors
      }
    }

    // No active order found
    setOrder(null);
    setIsLoading(false);
  }, [orderId]);

  useEffect(() => {
    checkActiveOrder();
    const interval = setInterval(() => {
      setLastRefresh(Date.now());
      checkActiveOrder();
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [checkActiveOrder]);

  // ── Derived values ───────────────────────────────────────────────────────
  const activeStep = steps.find((s) => s.active);
  const completedCount = steps.filter((s) => s.completed).length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  // ── Early returns ─────────────────────────────────────────────────────────
  if (isDismissed || isLoading || !order) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -120, opacity: 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
        className="fixed top-14 sm:top-16 left-2 right-2 z-40 lg:hidden"
        role="status"
        aria-label={`Rastreador de pedido ${order.orderNumber}`}
      >
        <div className="r60-order-tracker-card rounded-2xl bg-white overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)' }}>
          {/* ── Collapsed header ──────────────────────────────────────────── */}
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="w-full flex items-center gap-3 p-3 text-left active:scale-[0.98] transition-transform"
            aria-expanded={isExpanded}
            aria-controls="r60-tracker-panel"
          >
            {/* Progress ring */}
            <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
              <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
                <circle
                  cx="18" cy="18" r="15.5"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="3"
                />
                <motion.circle
                  cx="18" cy="18" r="15.5"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: CIRCUMFERENCE.toString(), strokeDashoffset: CIRCUMFERENCE.toString() }}
                  animate={{
                    strokeDashoffset: CIRCUMFERENCE - (CIRCUMFERENCE * progress / 100),
                  }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              <span className="absolute text-sm font-bold text-gray-800">
                {completedCount}/{steps.length}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {activeStep ? activeStep.label : 'Acompanhe seu pedido'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                Pedido #{order.orderNumber || '---'} • {order.storeName || 'Loja'}
              </p>
            </div>

            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 p-1"
            >
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </motion.div>
          </button>

          {/* ── Expanded content ──────────────────────────────────────────── */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                id="r60-tracker-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3 space-y-3">
                  {/* ── Step timeline ─────────────────────────────────────── */}
                  <div className="flex items-start gap-0">
                    {steps.map((step, i) => (
                      <div key={step.id} className="flex-1 flex flex-col items-center gap-1">
                        <motion.div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-colors ${
                            step.completed && !step.active
                              ? 'bg-emerald-500 text-white'
                              : step.active
                                ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-300'
                                : 'bg-gray-100 text-gray-400'
                          } r60-step-node`}
                          animate={step.active ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                          transition={
                            step.active
                              ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }
                              : { duration: 0 }
                          }
                          aria-current={step.active ? 'step' : undefined}
                        >
                          {step.completed && !step.active ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <span className="text-sm" aria-hidden="true">{step.icon}</span>
                          )}
                        </motion.div>

                        {i < steps.length - 1 && (
                          <div className="w-full h-0.5 rounded-full bg-gray-200 relative self-start mt-4">
                            <motion.div
                              className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full"
                              initial={{ width: '0%' }}
                              animate={{ width: step.completed ? '100%' : '0%' }}
                              transition={{ duration: 0.5, ease: 'easeOut' as const }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Step labels */}
                  <div className="flex items-center gap-0">
                    {steps.map((step) => (
                      <div
                        key={`${step.id}-label`}
                        className={`flex-1 text-center text-[9px] leading-tight px-0.5 ${
                          step.active ? 'font-bold text-indigo-600' : step.completed ? 'text-emerald-600' : 'text-gray-400'
                        }`}
                      >
                        {step.label.split(' ')[0]}
                      </div>
                    ))}
                  </div>

                  {/* ── ETA info card ──────────────────────────────────────── */}
                  <div className="flex items-center gap-3 bg-indigo-50 rounded-xl p-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-indigo-900">Previsão de entrega</p>
                      <p className="text-xs text-indigo-600">
                        {order.status === 'DELIVERED'
                          ? 'Pedido entregue!'
                          : formatEta(order.estimatedMinutes)}
                      </p>
                    </div>
                    {order.estimatedMinutes && order.status !== 'DELIVERED' && (
                      <div className="shrink-0">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 rounded-lg text-[10px] font-bold text-indigo-700">
                          <Truck className="h-3 w-3" />
                          {order.estimatedMinutes} min
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ── Driver info strip ──────────────────────────────────── */}
                  {order.status === 'DELIVERING' && order.driverName && (
                    <div className="flex items-center gap-2.5 bg-emerald-50 rounded-xl p-2.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 text-white text-sm font-bold">
                        {order.driverName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-emerald-900 truncate">{order.driverName}</p>
                        <p className="text-[10px] text-emerald-600">
                          {order.driverVehicle ?? 'Entregador'} • A caminho
                        </p>
                      </div>
                      <Navigation className="h-4 w-4 text-emerald-500 shrink-0" />
                    </div>
                  )}

                  {/* ── Action buttons ────────────────────────────────────── */}
                  <div className="flex gap-2">
                    {/* Call button — 44px min height */}
                    <button
                      className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 rounded-xl min-h-[44px] text-xs font-medium active:scale-95 transition-transform"
                      aria-label={`Ligar para ${order.storeName}`}
                      disabled={!getStorePhone(order)}
                    >
                      <Phone className="h-4 w-4" />
                      <span>Ligar</span>
                    </button>

                    {/* Chat button — 44px min height */}
                    <button
                      className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-700 rounded-xl min-h-[44px] text-xs font-medium active:scale-95 transition-transform"
                      aria-label="Abrir chat com a loja"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Chat</span>
                    </button>

                    {/* Map button — 44px min height */}
                    <button
                      className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 text-gray-700 rounded-xl min-h-[44px] text-xs font-medium active:scale-95 transition-transform"
                      aria-label="Ver no mapa"
                    >
                      <MapPin className="h-4 w-4" />
                      <span>Mapa</span>
                    </button>
                  </div>

                  {/* ── Order total ────────────────────────────────────────── */}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400">Total do pedido</span>
                    <span className="text-xs font-bold text-gray-800">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  {/* ── Last refreshed ──────────────────────────────────────── */}
                  <p className="text-[9px] text-gray-300 text-center">
                    Atualizado há{' '}
                    {Math.max(0, Math.floor((Date.now() - lastRefresh) / 1000))}s
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Dismiss button ───────────────────────────────────────────────── */}
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute -top-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center border border-gray-200 active:scale-90 transition-transform"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          aria-label="Fechar rastreador"
        >
          <X className="h-3.5 w-3.5 text-gray-500" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
