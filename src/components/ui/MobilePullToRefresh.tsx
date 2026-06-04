'use client';
import { motion, useMotionValue, useTransform, useAnimation, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';

interface MobilePullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  pullThreshold?: number;
}

export function MobilePullToRefresh({ onRefresh, children, pullThreshold = 80 }: MobilePullToRefreshProps) {
  const y = useMotionValue(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const controls = useAnimation();

  const spinnerRotation = useTransform(y, [0, pullThreshold], [0, 360]);
  const spinnerOpacity = useTransform(y, [0, pullThreshold * 0.5], [0, 1]);

  const handleDragEnd = useCallback(async () => {
    if (y.get() > pullThreshold && !isRefreshing) {
      setIsRefreshing(true);
      await controls.start({ y: 60, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } });
      try {
        await onRefresh();
      } finally {
        await controls.start({ y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } });
        setIsRefreshing(false);
      }
    } else {
      await controls.start({ y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } });
    }
  }, [y, pullThreshold, isRefreshing, onRefresh, controls]);

  return (
    <motion.div
      className="relative overflow-hidden"
      style={{ y }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.1, bottom: 0.4 }}
      onDragEnd={handleDragEnd}
      animate={controls}
    >
      {/* Pull indicator */}
      <div className="flex justify-center py-2">
        <AnimatePresence>
          {(y.get() > 10 || isRefreshing) && (
            <motion.div
              className="flex items-center gap-2 text-gray-500 text-sm"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <motion.div
                className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full"
                style={{ rotate: isRefreshing ? 360 : spinnerRotation }}
                transition={isRefreshing ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : undefined}
              />
              <span>{isRefreshing ? 'Atualizando...' : 'Puxe para atualizar'}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {children}
    </motion.div>
  );
}
