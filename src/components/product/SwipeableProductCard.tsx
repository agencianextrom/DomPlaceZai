'use client';
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from 'framer-motion';
import { useState, useCallback } from 'react';

interface SwipeableProductCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftLabel?: string;
  rightLabel?: string;
  leftColor?: string;
  rightColor?: string;
}

export function SwipeableProductCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftLabel = 'Adicionar',
  rightLabel = 'Favoritar',
  leftColor = 'bg-green-500',
  rightColor = 'bg-pink-500',
}: SwipeableProductCardProps) {
  const x = useMotionValue(0);
  const [action, setAction] = useState<'left' | 'right' | null>(null);

  const bgLeft = useTransform(x, [-100, 0], [1, 0]);
  const bgRight = useTransform(x, [0, 100], [0, 1]);

  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -80 && onSwipeLeft) {
      setAction('left');
      onSwipeLeft();
      setTimeout(() => setAction(null), 1500);
    } else if (info.offset.x > 80 && onSwipeRight) {
      setAction('right');
      onSwipeRight();
      setTimeout(() => setAction(null), 1500);
    }
  }, [onSwipeLeft, onSwipeRight]);

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Left action background */}
      <motion.div
        className={`absolute inset-y-0 left-0 ${leftColor} flex items-center justify-start pl-4 rounded-xl`}
        style={{ opacity: bgLeft }}
      >
        <span className="text-white font-medium text-sm">{leftLabel} 🛒</span>
      </motion.div>

      {/* Right action background */}
      <motion.div
        className={`absolute inset-y-0 right-0 ${rightColor} flex items-center justify-end pr-4 rounded-xl`}
        style={{ opacity: bgRight }}
      >
        <span className="text-white font-medium text-sm">❤️ {rightLabel}</span>
      </motion.div>

      {/* Draggable content */}
      <motion.div
        className="relative z-10 bg-white rounded-xl cursor-grab active:cursor-grabbing"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -120, right: 120 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
      >
        {children}
        {/* Action feedback overlay */}
        <AnimatePresence>
          {action && (
            <motion.div
              className={`absolute inset-0 flex items-center justify-center rounded-xl ${
                action === 'left' ? 'bg-green-500/20' : 'bg-pink-500/20'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="text-2xl">{action === 'left' ? '✓ Adicionado' : '❤️ Favoritado'}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
