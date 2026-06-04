'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileQuickActionsProps {
  onScan?: () => void;
  onSearch?: () => void;
  onCart?: () => void;
  onChat?: () => void;
}

export function MobileQuickActions({ onScan, onSearch, onCart, onChat }: MobileQuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: '📸', label: 'Escanear', action: onScan, color: 'bg-blue-500' },
    { icon: '🔍', label: 'Buscar', action: onSearch, color: 'bg-green-500' },
    { icon: '🛒', label: 'Carrinho', action: onCart, color: 'bg-orange-500' },
    { icon: '💬', label: 'Chat', action: onChat, color: 'bg-purple-500' },
  ];

  const handleAction = (action?: () => void) => {
    setIsOpen(false);
    action?.();
  };

  return (
    <div className="fixed bottom-24 right-4 z-30 lg:hidden" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 z-[-1]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <AnimatePresence>
        {isOpen && actions.map((a, i) => (
          <motion.div
            key={a.label}
            className="absolute right-0 flex items-center gap-3"
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: -56 * (i + 1), scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.5 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 20, delay: i * 0.05 }}
          >
            <span className="bg-white text-gray-700 text-xs font-medium px-2 py-1 rounded-lg shadow-lg whitespace-nowrap">
              {a.label}
            </span>
            <button
              onClick={() => handleAction(a.action)}
              className={`w-12 h-12 ${a.color} text-white rounded-full flex items-center justify-center text-xl shadow-lg active:scale-90 transition-transform`}
              aria-label={a.label}
            >
              {a.icon}
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center text-2xl active:scale-90 transition-transform"
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Fechar ações' : 'Ações rápidas'}
      >
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
        >
          {isOpen ? '✕' : '⚡'}
        </motion.span>
      </motion.button>
    </div>
  );
}
