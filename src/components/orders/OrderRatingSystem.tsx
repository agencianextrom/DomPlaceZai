'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PendingOrder {
  id: string;
  orderNumber: string;
  storeName: string;
  productName: string;
  productEmoji: string;
  totalPrice: number;
  deliveredAt: string;
  isReviewed: boolean;
}

interface ReviewSubmission {
  orderId: string;
  overallRating: number;
  qualityRating: number;
  speedRating: number;
  packagingRating: number;
  communicationRating: number;
  tags: string[];
  comment: string;
}

const PENDING_ORDERS: PendingOrder[] = [
  { id: 'o1', orderNumber: '#DP-4521', storeName: 'Supermercado Bom Preço', productName: 'Cesta de Frutas', productEmoji: '🍎', totalPrice: 89.9, deliveredAt: '2024-01-15T14:30:00', isReviewed: false },
  { id: 'o2', orderNumber: '#DP-4519', storeName: 'Farmácia Saúde+', productName: 'Kit Vitaminas', productEmoji: '💊', totalPrice: 156.0, deliveredAt: '2024-01-14T10:00:00', isReviewed: false },
  { id: 'o3', orderNumber: '#DP-4510', storeName: 'TechWorld', productName: 'Fone Bluetooth', productEmoji: '🎧', totalPrice: 299.9, deliveredAt: '2024-01-13T16:45:00', isReviewed: false },
  { id: 'o4', orderNumber: '#DP-4505', storeName: 'Padaria Pão Quente', productName: 'Encomenda de Bolo', productEmoji: '🎂', totalPrice: 75.0, deliveredAt: '2024-01-12T08:00:00', isReviewed: true },
  { id: 'o5', orderNumber: '#DP-4498', storeName: 'Pet Shop Amigo', productName: 'Ração Premium 15kg', productEmoji: '🐕', totalPrice: 189.9, deliveredAt: '2024-01-11T12:00:00', isReviewed: true },
  { id: 'o6', orderNumber: '#DP-4490', storeName: 'Açaí do Parque', productName: 'Açaí 500ml Família', productEmoji: '🫐', totalPrice: 42.0, deliveredAt: '2024-01-10T19:30:00', isReviewed: false },
];

const FEEDBACK_TAGS = [
  { id: 'fast', label: 'Entrega rápida', emoji: '⚡' },
  { id: 'intact', label: 'Produto intacto', emoji: '✅' },
  { id: 'packaging', label: 'Bom embalagem', emoji: '📦' },
  { id: 'recommend', label: 'Recomendo', emoji: '👍' },
  { id: 'return', label: 'Voltaria a comprar', emoji: '🔄' },
  { id: 'friendly', label: 'Atendimento simpático', emoji: '😊' },
  { id: 'fresh', label: 'Produto fresco', emoji: '🌿' },
  { id: 'value', label: 'Bom custo-benefício', emoji: '💰' },
];

const RATING_CATEGORIES = [
  { key: 'quality', label: 'Qualidade do Produto', emoji: '🎯', color: 'rgba(59, 130, 246, 1)' },
  { key: 'speed', label: 'Velocidade da Entrega', emoji: '🚀', color: 'rgba(34, 197, 94, 1)' },
  { key: 'packaging', label: 'Embalagem', emoji: '📦', color: 'rgba(168, 85, 247, 1)' },
  { key: 'communication', label: 'Comunicação', emoji: '💬', color: 'rgba(251, 146, 60, 1)' },
];

function AnimatedStar({ filled, onClick, delay }: { filled: boolean; onClick: () => void; delay: number }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0 }}
      animate={{ scale: 1, rotate: filled ? 0 : -15 }}
      transition={{ delay, type: 'spring' as const, stiffness: 400, damping: 15 }}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      className="r42-star-btn"
      style={{ color: filled ? 'rgba(255, 180, 0, 1)' : 'rgba(255, 255, 255, 0.2)' }}
      aria-label={filled ? 'Estrela preenchida' : 'Estrela vazia'}
    >
      ★
    </motion.button>
  );
}

function RatingProgressBar({ value, max, color, label, emoji, delay }: {
  value: number; max: number; color: string; label: string; emoji: string; delay: number;
}) {
  const pct = (value / max) * 100;
  return (
    <motion.div className="r42-rating-progress" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, type: 'spring' as const, stiffness: 200, damping: 20 }}>
      <div className="r42-rating-progress-header">
        <span className="r42-rating-emoji">{emoji}</span>
        <span className="r42-rating-label">{label}</span>
        <span className="r42-rating-value">{value}/{max}</span>
      </div>
      <div className="r42-rating-bar-track">
        <motion.div className="r42-rating-bar-fill" initial={{ width: '0%' }} animate={{ width: pct + '%' }} transition={{ delay: delay + 0.2, duration: 0.6, ease: 'easeOut' as const }} style={{ background: color }} />
      </div>
    </motion.div>
  );
}

function ConfettiBurst({ show }: { show: boolean }) {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 400,
    y: -(Math.random() * 300 + 100),
    rotate: Math.random() * 720 - 360,
    color: ['rgba(255,45,85,1)', 'rgba(255,180,0,1)', 'rgba(34,197,94,1)', 'rgba(59,130,246,1)', 'rgba(168,85,247,1)'][Math.floor(Math.random() * 5)],
    size: Math.random() * 8 + 4,
    delay: Math.random() * 0.3,
  }));

  return (
    <AnimatePresence>
      {show && particles.map((p) => (
        <motion.div key={p.id} className="r42-confetti-particle" initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 0 }} animate={{ opacity: 0, x: p.x, y: p.y, rotate: p.rotate, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5, delay: p.delay, ease: 'easeOut' as const }} style={{ backgroundColor: p.color, width: p.size, height: p.size, borderRadius: Math.random() > 0.5 ? '50%' : '2px' }} />
      ))}
    </AnimatePresence>
  );
}

export function OrderRatingSystem() {
  const [pendingOrders] = useState<PendingOrder[]>(PENDING_ORDERS.filter(o => !o.isReviewed));
  const [reviewedOrders] = useState<PendingOrder[]>(PENDING_ORDERS.filter(o => o.isReviewed));
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({ quality: 0, speed: 0, packaging: 0, communication: 0 });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const reviewStreak = 3;
  const reviewReward = 5.0;
  const couponCode = 'REVIEW' + Math.random().toString(36).substring(2, 6).toUpperCase();

  const toggleTag = useCallback((tagId: string) => {
    setSelectedTags(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]);
  }, []);

  const submitReview = useCallback(() => {
    if (overallRating === 0) return;
    setShowConfetti(true);
    setTimeout(() => { setShowConfetti(false); setShowThankYou(true); }, 1500);
  }, [overallRating]);

  const aiSuggestion = 'Produto excelente, entregue antes do prazo. Embalagem muito bem feita, sem nenhum dano. Recomendo!';
  const overallStats = { avgRating: 4.7, totalReviews: 23, mostCommonTags: ['Recomendo', 'Entrega rápida', 'Bom custo-benefício'] };

  return (
    <section className="r42-rating-section">
      <ConfettiBurst show={showConfetti} />
      <div className="r42-rating-header">
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }} className="r42-rating-title">
          ⭐ Avalie seus Pedidos
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="r42-rating-subtitle">
          Compartilhe sua experiência e ganhe descontos
        </motion.p>
      </div>

      {/* Review Stats */}
      <motion.div className="r42-stats-row" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="r42-stat-card">
          <span className="r42-stat-value">{'★'.repeat(Math.floor(overallStats.avgRating))}</span>
          <span className="r42-stat-label">Média Geral</span>
        </div>
        <div className="r42-stat-card">
          <span className="r42-stat-value">{overallStats.totalReviews}</span>
          <span className="r42-stat-label">Avaliações</span>
        </div>
        <div className="r42-stat-card">
          <span className="r42-streak-value">{reviewStreak} 🔥</span>
          <span className="r42-stat-label">Sequência</span>
        </div>
      </motion.div>

      {/* Reward Badge */}
      <motion.div className="r42-reward-badge" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: 'spring' as const, stiffness: 300, damping: 15 }}>
        <span className="r42-reward-icon">🎁</span>
        <div className="r42-reward-info">
          <span className="r42-reward-title">Review #4 = R$ {reviewReward.toFixed(2)} OFF</span>
          <span className="r42-reward-desc">Avalie mais 1 pedido para ganhar</span>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="r42-tabs">
        <motion.button className={'r42-tab ' + (activeTab === 'pending' ? 'r42-tab-active' : '')} onClick={() => setActiveTab('pending')} whileTap={{ scale: 0.95 }}>
          Pendentes ({pendingOrders.length})
        </motion.button>
        <motion.button className={'r42-tab ' + (activeTab === 'history' ? 'r42-tab-active' : '')} onClick={() => setActiveTab('history')} whileTap={{ scale: 0.95 }}>
          Histórico ({reviewedOrders.length})
        </motion.button>
      </div>

      {/* Pending Orders */}
      {activeTab === 'pending' && (
        <div className="r42-orders-list">
          {pendingOrders.map((order, idx) => (
            <motion.div key={order.id} className="r42-order-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1, type: 'spring' as const, stiffness: 200, damping: 20 }} whileHover={{ scale: 1.02, y: -2 }}>
              <div className="r42-order-left">
                <span className="r42-order-emoji">{order.productEmoji}</span>
                <div className="r42-order-info">
                  <span className="r42-order-name">{order.productName}</span>
                  <span className="r42-order-store">{order.storeName}</span>
                  <span className="r42-order-number">{order.orderNumber}</span>
                </div>
              </div>
              <motion.button className="r42-review-btn min-h-[44px] min-w-[44px]" onClick={() => setSelectedOrder(order)} whileTap={{ scale: 0.95 }}>
                Avaliar ⭐
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="r42-history-section">
          <div className="r42-filter-row">
            {[5, 4, 3, 2, 1].map(r => (
              <motion.button key={r} className={'r42-filter-star min-h-[44px] min-w-[44px] ' + (filterRating === r ? 'r42-filter-active' : '')} onClick={() => setFilterRating(filterRating === r ? null : r)} whileTap={{ scale: 0.9 }}>
                {'★'.repeat(r)}{'☆'.repeat(5 - r)}
              </motion.button>
            ))}
          </div>
          <div className="r42-common-tags">
            {overallStats.mostCommonTags.map((tag, i) => (
              <span key={i} className="r42-common-tag">🏷️ {tag}</span>
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {selectedOrder && !showThankYou && (
          <motion.div className="r42-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)}>
            <motion.div className="r42-modal-panel" initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }} onClick={e => e.stopPropagation()}>
              <div className="r42-modal-handle" />
              <div className="r42-modal-header">
                <span className="r42-modal-emoji">{selectedOrder.productEmoji}</span>
                <div>
                  <h3 className="r42-modal-title">Avaliar Pedido</h3>
                  <span className="r42-modal-order">{selectedOrder.orderNumber} • {selectedOrder.storeName}</span>
                </div>
                <button className="r42-close-btn" onClick={() => setSelectedOrder(null)}>✕</button>
              </div>

              {/* Overall Rating */}
              <div className="r42-overall-rating">
                <span className="r42-overall-label">Avaliação Geral</span>
                <div className="r42-stars-row">
                  {[1, 2, 3, 4, 5].map(s => (
                    <AnimatedStar key={s} filled={s <= overallRating} onClick={() => setOverallRating(s)} delay={s * 0.1} />
                  ))}
                </div>
                {overallRating > 0 && (
                  <motion.span className="r42-rating-text" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' as const }}>
                    {['', 'Ruim', 'Regular', 'Bom', 'Muito Bom', 'Excelente'][overallRating]}
                  </motion.span>
                )}
              </div>

              {/* Category Ratings */}
              <div className="r42-category-ratings">
                {RATING_CATEGORIES.map((cat, i) => (
                  <div key={cat.key} className="r42-category-item">
                    <div className="r42-category-header">
                      <span className="r42-category-emoji">{cat.emoji}</span>
                      <span className="r42-category-label">{cat.label}</span>
                    </div>
                    <div className="r42-mini-stars">
                      {[1, 2, 3, 4, 5].map(s => (
                        <motion.button key={s} className="r42-mini-star min-h-[44px] min-w-[44px]" onClick={() => setCategoryRatings(prev => ({ ...prev, [cat.key]: s }))} whileHover={{ scale: 1.3 }} animate={{ color: s <= (categoryRatings[cat.key] || 0) ? cat.color : 'rgba(255,255,255,0.2)' }} transition={{ type: 'spring' as const }}>
                          ★
                        </motion.button>
                      ))}
                    </div>
                    <div className="r42-cat-bar-track">
                      <motion.div className="r42-cat-bar-fill" animate={{ width: ((categoryRatings[cat.key] || 0) / 5 * 100) + '%' }} transition={{ duration: 0.3 }} style={{ background: cat.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Feedback Tags */}
              <div className="r42-tags-section">
                <span className="r42-tags-label">Feedback Rápido</span>
                <div className="r42-tags-grid">
                  {FEEDBACK_TAGS.map(tag => (
                    <motion.button key={tag.id} className={'r42-tag-chip ' + (selectedTags.includes(tag.id) ? 'r42-tag-selected' : '')} onClick={() => toggleTag(tag.id)} whileTap={{ scale: 0.9 }}>
                      <span>{tag.emoji}</span> {tag.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="r42-comment-section">
                <span className="r42-comment-label">Comentário</span>
                <div className="r42-textarea-wrap">
                  <textarea className="r42-textarea" value={comment} onChange={e => setComment(e.target.value)} placeholder="Conte sobre sua experiência..." maxLength={500} />
                  <span className="r42-char-count">{comment.length}/500</span>
                </div>
                {comment.length === 0 && (
                  <motion.button className="r42-ai-suggest-btn min-h-[44px] min-w-[44px]" onClick={() => setComment(aiSuggestion)} whileTap={{ scale: 0.95 }}>
                    ✨ Sugestão IA
                  </motion.button>
                )}
              </div>

              {/* Photo Upload */}
              <div className="r42-photo-section">
                <span className="r42-photo-label">Adicionar Fotos</span>
                <div className="r42-photo-grid">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="r42-photo-slot">
                      <span className="r42-photo-plus">+</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <motion.button className={'r42-submit-btn ' + (overallRating > 0 ? 'r42-submit-active' : '')} onClick={submitReview} whileTap={{ scale: 0.95 }} disabled={overallRating === 0}>
                {overallRating > 0 ? 'Enviar Avaliação 🎉' : 'Selecione uma avaliação'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thank You Modal */}
      <AnimatePresence>
        {showThankYou && (
          <motion.div className="r42-thank-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="r42-thank-panel" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}>
              <motion.div className="r42-thank-emoji" animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                🎉
              </motion.div>
              <h3 className="r42-thank-title">Obrigado pela avaliação!</h3>
              <p className="r42-thank-text">Sua opinião ajuda a comunidade Dom Eliseu</p>
              <div className="r42-coupon-card">
                <span className="r42-coupon-label">Cupom de desconto</span>
                <span className="r42-coupon-code">{couponCode}</span>
                <span className="r42-coupon-value">R$ {reviewReward.toFixed(2)} OFF</span>
              </div>
              <motion.button className="r42-thank-close-btn min-h-[44px] min-w-[44px]" onClick={() => { setShowThankYou(false); setSelectedOrder(null); setOverallRating(0); setCategoryRatings({ quality: 0, speed: 0, packaging: 0, communication: 0 }); setSelectedTags([]); setComment(''); }} whileTap={{ scale: 0.95 }}>
                Fechar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default OrderRatingSystem;
