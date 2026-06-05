'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Gift, Clock, Check, X, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  discount: string;
  description: string;
  minOrder: number;
  expiry: string;
  type: 'percentage' | 'fixed' | 'free_delivery';
  isClaimed: boolean;
}

const defaultCoupons: Coupon[] = [
  {
    id: '1',
    code: 'BEMVINDO',
    discount: '15%',
    description: 'Em todo o site',
    minOrder: 50,
    expiry: '30 dias',
    type: 'percentage',
    isClaimed: false,
  },
  {
    id: '2',
    code: 'FRETEZERO',
    discount: 'Frete grátis',
    description: 'Pedidos acima de R$80',
    minOrder: 80,
    expiry: '7 dias',
    type: 'free_delivery',
    isClaimed: false,
  },
  {
    id: '3',
    code: 'DESCONTO10',
    discount: 'R$ 10 off',
    description: 'Acima de R$60',
    minOrder: 60,
    expiry: '15 dias',
    type: 'fixed',
    isClaimed: false,
  },
  {
    id: '4',
    code: 'COMBO20',
    discount: '20%',
    description: 'Combos especiais',
    minOrder: 40,
    expiry: '20 dias',
    type: 'percentage',
    isClaimed: false,
  },
];

const STORAGE_KEY = 'r60-claimed-coupons';

const gradients = [
  'from-indigo-500 via-purple-500 to-pink-500',
  'from-amber-500 via-orange-500 to-red-500',
  'from-emerald-500 via-teal-500 to-cyan-500',
  'from-rose-500 via-fuchsia-500 to-violet-500',
];

const iconMap: Record<string, typeof Gift> = {
  percentage: Tag,
  fixed: Sparkles,
  free_delivery: Gift,
};

function getIconForType(type: Coupon['type']) {
  return iconMap[type] || Tag;
}

function saveClaimedIds(claimedIds: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(claimedIds));
  } catch {
    // silently fail on storage errors
  }
}

function loadClaimedIds(): Set<string> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? new Set(JSON.parse(saved) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function CouponClaimBanner() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const { currentUser } = useAppStore();

  // Load coupons from defaults + localStorage sync
  useEffect(() => {
    const claimedIds = loadClaimedIds();
    const updated = defaultCoupons.map((c) => ({
      ...c,
      isClaimed: claimedIds.has(c.id),
    }));
    setCoupons(updated);
  }, []);

  // Auto-rotate every 5s when visible and more than 1 unclaimed
  useEffect(() => {
    const unclaimed = coupons.filter((c) => !c.isClaimed);
    if (!isVisible || unclaimed.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % unclaimed.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isVisible, coupons]);

  // Clamp index when unclaimed list changes
  useEffect(() => {
    const unclaimed = coupons.filter((c) => !c.isClaimed);
    if (unclaimed.length === 0) return;
    if (currentIndex >= unclaimed.length) {
      setCurrentIndex(0);
    }
  }, [coupons, currentIndex]);

  const unclaimed = coupons.filter((c) => !c.isClaimed);

  if (unclaimed.length === 0 || !isVisible) return null;

  const coupon = unclaimed[currentIndex];
  const CouponIcon = getIconForType(coupon.type);

  const handleClaim = useCallback(() => {
    if (isClaiming) return;
    setIsClaiming(true);

    const updated = coupons.map((c) =>
      c.id === coupon.id ? { ...c, isClaimed: true } : c
    );
    setCoupons(updated);

    const claimedIds = updated.filter((c) => c.isClaimed).map((c) => c.id);
    saveClaimedIds(claimedIds);

    // Copy code to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(coupon.code).then(() => {
        toast.success(`Cupom ${coupon.code} copiado! ${coupon.discount} de desconto`);
      }).catch(() => {
        toast.success(`Cupom ${coupon.code} resgatado! ${coupon.discount} de desconto`);
      });
    } else {
      toast.success(`Cupom ${coupon.code} resgatado! ${coupon.discount} de desconto`);
    }

    setIsClaiming(false);
  }, [isClaiming, coupon, coupons]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => {
      const len = unclaimed.length;
      return (prev - 1 + len) % len;
    });
  }, [unclaimed.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % unclaimed.length);
  }, [unclaimed.length]);

  return (
    <AnimatePresence>
      {isVisible && coupon && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
          className="px-4 mt-3"
        >
          <div
            className={`bg-gradient-to-r ${gradients[currentIndex % gradients.length]} rounded-2xl p-4 sm:p-5 relative overflow-hidden`}
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 w-7 h-7 min-h-[44px] min-w-[44px] rounded-full bg-white/20 flex items-center justify-center active:scale-90 transition-transform z-20"
              aria-label="Fechar cupom"
            >
              <X className="h-3.5 w-3.5 text-white" />
            </button>

            {/* Floating particles */}
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute rounded-full bg-white/20"
                style={{
                  width: 4 + (i % 3) * 2,
                  height: 4 + (i % 3) * 2,
                  top: `${12 + ((i * 17) % 76)}%`,
                  left: `${8 + ((i * 23) % 84)}%`,
                }}
                animate={{
                  y: [0, -20 - i * 5, 0],
                  opacity: [0.15, 0.45, 0.15],
                }}
                transition={{
                  duration: 2.5 + i * 0.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}

            {/* Decorative dashed circle */}
            <motion.div
              className="absolute -right-6 -top-6 w-24 h-24 rounded-full border border-dashed border-white/15"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />

            <div className="relative z-10">
              {/* Badge row */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-0.5 backdrop-blur-sm">
                  <CouponIcon className="h-3.5 w-3.5 text-white" />
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider">
                    Cupom
                  </span>
                </div>
                <span className="text-white/50 text-[10px]">•</span>
                <span className="text-white/70 text-[10px]">
                  {unclaimed.length} disponí{unclaimed.length === 1 ? 'vel' : 'veis'}
                </span>
              </div>

              {/* Coupon discount & info */}
              <div className="mb-3">
                <motion.div
                  key={coupon.code}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                  className="flex items-baseline gap-2 mb-1"
                >
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">
                    {coupon.discount}
                  </span>
                  <span className="text-white/60 text-[10px] uppercase tracking-wider font-semibold">
                    OFF
                  </span>
                </motion.div>
                <p className="text-white/80 text-sm font-medium">
                  {coupon.description}
                </p>
                <p className="text-white/60 text-xs mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    Válido por {coupon.expiry} • Mínimo R${coupon.minOrder}
                  </span>
                </p>
              </div>

              {/* Coupon code display */}
              <motion.div
                key={`code-${coupon.code}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2 mb-3 flex items-center justify-between border border-dashed border-white/25"
              >
                <span className="text-white font-mono text-sm font-bold tracking-widest">
                  {coupon.code}
                </span>
                <Tag className="h-3.5 w-3.5 text-white/60" />
              </motion.div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClaim}
                  disabled={isClaiming}
                  className="flex-1 bg-white text-gray-900 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-bold active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isClaiming ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-500" />
                      Resgatado!
                    </>
                  ) : (
                    <>
                      <Gift className="h-4 w-4" />
                      Resgatar Cupom
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrev}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm text-white rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                  aria-label="Cupom anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm text-white rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                  aria-label="Próximo cupom"
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            {/* Pagination dots */}
            <div className="flex justify-center gap-1.5 mt-3">
              {unclaimed.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  whileTap={{ scale: 0.85 }}
                  className={`rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? 'bg-white w-4 h-1.5'
                      : 'bg-white/40 w-1.5 h-1.5'
                  }`}
                  aria-label={`Ir para cupom ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
