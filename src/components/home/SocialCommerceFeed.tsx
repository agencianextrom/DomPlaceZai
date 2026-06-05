'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SocialProduct {
  id: number;
  productName: string;
  price: number;
  originalPrice?: number;
  store: string;
  storeAvatar: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  emoji: string;
  productTag: string;
  commentCount: number;
  shareCount: number;
  initialLikes: number;
  isLive?: boolean;
  viewers?: number;
  gradientFrom: string;
  gradientTo: string;
  description: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
}

interface LikeState { [key: number]: boolean; }
interface LikeCountState { [key: number]: number; }

const SOCIAL_PRODUCTS: SocialProduct[] = [
  { id: 1, productName: 'Tenis Runner Pro Max', price: 349.9, originalPrice: 499.9, store: 'SportLife Store', storeAvatar: '🏃', creatorName: 'Ana Oliveira', creatorHandle: '@anaoliveira', creatorAvatar: '👩‍🦰', emoji: '👟', productTag: 'Tenis', commentCount: 234, shareCount: 89, initialLikes: 4521, isLive: true, viewers: 1243, gradientFrom: '#1a1a2e', gradientTo: '#16213e', description: 'Conforto extremo para corridas longas', rating: 4.8, reviewCount: 1256, deliveryTime: '2-3 dias' },
  { id: 2, productName: 'Fone Bluetooth Noise X', price: 189.9, originalPrice: 259.9, store: 'TechWorld', storeAvatar: '🎧', creatorName: 'Carlos Mendes', creatorHandle: '@carlostech', creatorAvatar: '👨‍💻', emoji: '🎧', productTag: 'Eletronicos', commentCount: 156, shareCount: 67, initialLikes: 3287, gradientFrom: '#0f3460', gradientTo: '#533483', description: 'Cancelamento de ruido ativo 40h bateria', rating: 4.6, reviewCount: 892, deliveryTime: '1-2 dias' },
  { id: 3, productName: 'Skincare Set Premium', price: 279.9, store: 'BeautyZone', storeAvatar: '✨', creatorName: 'Julia Santos', creatorHandle: '@juliabeauty', creatorAvatar: '👩‍🎨', emoji: '🧴', productTag: 'Beleza', commentCount: 412, shareCount: 198, initialLikes: 8432, isLive: true, viewers: 3456, gradientFrom: '#e94560', gradientTo: '#1a1a2e', description: 'Kit skincare com vitamina C e acido hialuronico', rating: 4.9, reviewCount: 2341, deliveryTime: '3-5 dias' },
  { id: 4, productName: 'Smartwatch Fit Band Ultra', price: 459.9, originalPrice: 599.9, store: 'GadgetHouse', storeAvatar: '⌚', creatorName: 'Pedro Lima', creatorHandle: '@pedrofitness', creatorAvatar: '🏋️', emoji: '⌚', productTag: 'Wearables', commentCount: 89, shareCount: 45, initialLikes: 2156, gradientFrom: '#0a1128', gradientTo: '#1b262c', description: 'Monitor cardiaco GPS integrado IP68', rating: 4.7, reviewCount: 678, deliveryTime: '2-4 dias' },
  { id: 5, productName: 'Cafeteira Espresso Deluxe', price: 899.9, originalPrice: 1299.9, store: 'Casa & Co', storeAvatar: '☕', creatorName: 'Mariana Costa', creatorHandle: '@maricoffee', creatorAvatar: '👩‍🍳', emoji: '☕', productTag: 'Casa', commentCount: 567, shareCount: 234, initialLikes: 12453, isLive: true, viewers: 5678, gradientFrom: '#3d0c02', gradientTo: '#1a1205', description: 'Maquina profissional com moedor integrado', rating: 4.9, reviewCount: 3421, deliveryTime: '5-7 dias' },
  { id: 6, productName: 'Mochila Urban Explorer', price: 219.9, store: 'Adventure Gear', storeAvatar: '🎒', creatorName: 'Lucas Ferreira', creatorHandle: '@lucasadventure', creatorAvatar: '🧑‍🦱', emoji: '🎒', productTag: 'Acessorios', commentCount: 123, shareCount: 56, initialLikes: 2890, gradientFrom: '#2d4a3e', gradientTo: '#1a2f28', description: 'Mochila impermeavel laptop 15 antirroubo', rating: 4.5, reviewCount: 445, deliveryTime: '2-3 dias' },
  { id: 7, productName: 'Kit Organizacao Minimalista', price: 149.9, originalPrice: 199.9, store: 'OrganizaStore', storeAvatar: '📦', creatorName: 'Fernanda Alves', creatorHandle: '@fernandaorganiza', creatorAvatar: '👩‍💼', emoji: '📦', productTag: 'Organizacao', commentCount: 345, shareCount: 167, initialLikes: 6789, gradientFrom: '#f5f0e8', gradientTo: '#e8e0d0', description: '8 organizadores estilo escandinavo', rating: 4.4, reviewCount: 1123, deliveryTime: '3-5 dias' },
  { id: 8, productName: 'Drone Explorer 4K', price: 2499.9, originalPrice: 3299.9, store: 'DroneShop BR', storeAvatar: '🚁', creatorName: 'Rafael Torres', creatorHandle: '@rafaeldrones', creatorAvatar: '🧑‍✈️', emoji: '🚁', productTag: 'Drones', commentCount: 789, shareCount: 345, initialLikes: 18923, isLive: true, viewers: 8901, gradientFrom: '#0c1445', gradientTo: '#1a237e', description: 'Camera 4K 60fps gimbal 3 eixos 35min', rating: 4.8, reviewCount: 567, deliveryTime: '5-10 dias' },
  { id: 9, productName: 'Luminaria LED Smart Home', price: 329.9, store: 'LightDesign', storeAvatar: '💡', creatorName: 'Camila Rocha', creatorHandle: '@camiladesign', creatorAvatar: '👩‍🎤', emoji: '💡', productTag: 'Decoracao', commentCount: 201, shareCount: 89, initialLikes: 3456, gradientFrom: '#2c1810', gradientTo: '#1a0f0a', description: '16M cores compativel Alexa Google', rating: 4.6, reviewCount: 789, deliveryTime: '3-5 dias' },
  { id: 10, productName: 'Suplemento Whey Protein Pro', price: 159.9, originalPrice: 219.9, store: 'NutriFit Store', storeAvatar: '💪', creatorName: 'Thiago Neves', creatorHandle: '@thiagofit', creatorAvatar: '🧑‍🦳', emoji: '💪', productTag: 'Suplementos', commentCount: 456, shareCount: 178, initialLikes: 9876, gradientFrom: '#1a2332', gradientTo: '#0d1520', description: 'Whey Isolado 27g proteina por dose', rating: 4.7, reviewCount: 2345, deliveryTime: '1-3 dias' },
];

function fmtNum(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

function fmtPrice(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function discPct(o: number, c: number): number {
  return Math.round(((o - c) / o) * 100);
}

function HeartBurst({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="hb"
          className="r42-heart-burst"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 1.6, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' as const }}
        >
          ❤️
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LiveBadge({ viewers }: { viewers: number }) {
  return (
    <motion.div
      className="r42-live-badge"
      initial={{ scale: 0, x: 20 }}
      animate={{ scale: 1, x: 0 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
    >
      <span className="r42-live-dot" />
      <span className="r42-live-text">AO VIVO</span>
      <span className="r42-live-viewers">{fmtNum(viewers)} assistindo</span>
    </motion.div>
  );
}

function ProgressBar({ active }: { active: boolean }) {
  return (
    <div className="r42-progress-track">
      {active && (
        <motion.div
          className="r42-progress-fill"
          key="pf"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 8, ease: 'linear' as const }}
        />
      )}
    </div>
  );
}

function ProductTagOverlay({ tag }: { tag: string }) {
  return (
    <motion.div
      className="r42-product-tag"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: 'spring' as const, stiffness: 200, damping: 20 }}
    >
      <span className="r42-product-tag-icon">🏷️</span>
      <span className="r42-product-tag-text">{tag}</span>
    </motion.div>
  );
}

function ActionButton({ icon, count, active, activeColor, label, onClick }: {
  icon: React.ReactNode; count: number; active?: boolean; activeColor?: string; label: string; onClick?: () => void;
}) {
  return (
    <motion.div
      className="r42-action-btn-wrap"
      whileTap={{ scale: 0.85 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
      onClick={onClick}
      role="button"
      aria-label={label}
      tabIndex={0}
    >
      <motion.div
        className="r42-action-icon"
        animate={active ? { scale: [1, 1.3, 1], rotate: [0, -15, 0] } : { scale: 1, rotate: 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 15 }}
        style={active && activeColor ? { filter: 'drop-shadow(0 0 6px ' + activeColor + ')' } : undefined}
      >
        {icon}
      </motion.div>
      <span className="r42-action-count" style={active && activeColor ? { color: activeColor } : undefined}>
        {fmtNum(count)}
      </span>
    </motion.div>
  );
}

function QuickBuyButton({ price }: { price: number }) {
  return (
    <motion.div
      className="r42-quick-buy-wrap"
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
    >
      <button className="r42-quick-buy-btn" onClick={(e) => e.stopPropagation()}>
        <span className="r42-quick-buy-label">Comprar</span>
        <span className="r42-quick-buy-price">{fmtPrice(price)}</span>
      </button>
    </motion.div>
  );
}

function ProductDrawer({ product, open, onClose }: {
  product: SocialProduct | null; open: boolean; onClose: () => void;
}) {
  if (!product) return null;
  const hasDisc = product.originalPrice != null && product.originalPrice > product.price;
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="r42-drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="r42-drawer-panel" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}>
            <div className="r42-drawer-handle-wrap"><div className="r42-drawer-handle" /></div>
            <div className="r42-drawer-content">
              <div className="r42-drawer-header">
                <div className="r42-drawer-emoji">{product.emoji}</div>
                <div className="r42-drawer-title-section">
                  <h3 className="r42-drawer-product-name">{product.productName}</h3>
                  <div className="r42-drawer-rating-row">
                    <span className="r42-drawer-stars">{'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}</span>
                    <span className="r42-drawer-rating-value">{product.rating}</span>
                    <span className="r42-drawer-review-count">({fmtNum(product.reviewCount)})</span>
                  </div>
                </div>
              </div>
              <p className="r42-drawer-description">{product.description}</p>
              <div className="r42-drawer-info-grid">
                <div className="r42-drawer-info-item"><span className="r42-drawer-info-icon">🏪</span><span className="r42-drawer-info-label">Loja</span><span className="r42-drawer-info-value">{product.store}</span></div>
                <div className="r42-drawer-info-item"><span className="r42-drawer-info-icon">🚚</span><span className="r42-drawer-info-label">Entrega</span><span className="r42-drawer-info-value">{product.deliveryTime}</span></div>
                <div className="r42-drawer-info-item"><span className="r42-drawer-info-icon">🏷️</span><span className="r42-drawer-info-label">Categoria</span><span className="r42-drawer-info-value">{product.productTag}</span></div>
                <div className="r42-drawer-info-item"><span className="r42-drawer-info-icon">💰</span><span className="r42-drawer-info-label">Pagamento</span><span className="r42-drawer-info-value">12x sem juros</span></div>
              </div>
              <div className="r42-drawer-price-section">
                {hasDisc && <span className="r42-drawer-original-price">{fmtPrice(product.originalPrice!)}</span>}
                {hasDisc && <span className="r42-drawer-discount-tag">-{discPct(product.originalPrice!, product.price)}%</span>}
                <div className="r42-drawer-current-price">{fmtPrice(product.price)}</div>
                <div className="r42-drawer-installments">ou 12x de {fmtPrice(product.price / 12)}</div>
              </div>
              <div className="r42-drawer-actions">
                <motion.div className="r42-drawer-buy-wrap" whileTap={{ scale: 0.97 }} transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}>
                  <button className="r42-drawer-buy-btn"><span className="r42-drawer-buy-icon">🛒</span> Adicionar ao Carrinho</button>
                </motion.div>
                <motion.div className="r42-drawer-cart-wrap" whileTap={{ scale: 0.97 }} transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}>
                  <button className="r42-drawer-cart-btn">Comprar Agora</button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FeedCard({ product, index, isActive, liked, likeCount, saved, onTap, onDoubleTap, onLike, onSave, onShare, onSwipeUp }: {
  product: SocialProduct; index: number; isActive: boolean; liked: boolean; likeCount: number; saved: boolean;
  onTap: () => void; onDoubleTap: () => void; onLike: () => void; onSave: () => void; onShare: () => void; onSwipeUp: () => void;
}) {
  const lastTapRef = useRef<number>(0);
  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) { onDoubleTap(); } else { onTap(); }
    lastTapRef.current = now;
  }, [onTap, onDoubleTap]);

  return (
    <motion.div className="r42-feed-card" initial={{ opacity: 0, scale: 0.92, y: 60 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: index * 0.08, type: 'spring' as const, stiffness: 120, damping: 20 }}>
      <ProgressBar active={isActive} />
      <motion.div className="r42-card-inner" onClick={handleTap} drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.1} onDragEnd={(_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => { if (info.offset.y < -80 || info.velocity.y < -500) onSwipeUp(); }}>
        <div className="r42-product-image-area" style={{ background: 'linear-gradient(135deg,' + product.gradientFrom + ',' + product.gradientTo + ')' }}>
          <motion.div className="r42-product-emoji" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' as const, stiffness: 200, damping: 15 }}>
            <span className="r42-emoji-text">{product.emoji}</span>
          </motion.div>
          <motion.div className="r42-deco-circle r42-deco-circle-1" animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' as const }} />
          <motion.div className="r42-deco-circle r42-deco-circle-2" animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' as const }} />
        </div>
        <div className="r42-card-overlay">
          <div className="r42-card-left-col">
            <motion.div className="r42-creator-info" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, type: 'spring' as const, stiffness: 260, damping: 20 }}>
              <div className="r42-creator-row">
                <div className="r42-avatar-circle r42-creator-avatar">{product.creatorAvatar}</div>
                <div className="r42-creator-details">
                  <span className="r42-creator-name">{product.creatorName}</span>
                  <span className="r42-creator-handle">{product.creatorHandle}</span>
                </div>
              </div>
              <div className="r42-store-row">
                <span className="r42-store-avatar">{product.storeAvatar}</span>
                <span className="r42-store-name">{product.store}</span>
              </div>
            </motion.div>
            <motion.div className="r42-price-display" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, type: 'spring' as const, stiffness: 200, damping: 20 }}>
              {product.originalPrice && product.originalPrice > product.price && <span className="r42-price-original">{fmtPrice(product.originalPrice)}</span>}
              {product.originalPrice && product.originalPrice > product.price && <span className="r42-price-discount-badge">-{discPct(product.originalPrice, product.price)}%</span>}
              <span className="r42-price-current">{fmtPrice(product.price)}</span>
            </motion.div>
            <motion.div className="r42-product-name-wrap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, type: 'spring' as const, stiffness: 200, damping: 20 }}>
              <h3 className="r42-product-name">{product.productName}</h3>
            </motion.div>
            <motion.p className="r42-product-desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.4 }}>{product.description}</motion.p>
            <QuickBuyButton price={product.price} />
            <motion.div className="r42-swipe-hint" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.5 }}>
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' as const }}>↑</motion.div>
              <span className="r42-swipe-text">Deslize para detalhes</span>
            </motion.div>
          </div>
          <div className="r42-card-right-col">
            <div className="r42-actions-group">
              <ActionButton icon={<span>{liked ? '❤️' : '🤍'}</span>} count={likeCount} active={liked} activeColor="#ff2d55" label="Curtir" onClick={onLike} />
              <ActionButton icon={<span>💬</span>} count={product.commentCount} label="Comentarios" />
              <ActionButton icon={<span>↗️</span>} count={product.shareCount} label="Compartilhar" onClick={onShare} />
              <ActionButton icon={<span>{saved ? '🔖' : '📌'}</span>} count={0} active={saved} activeColor="#ffd700" label="Salvar" onClick={onSave} />
            </div>
          </div>
        </div>
        <HeartBurst show={liked && likeCount > product.initialLikes} />
        {product.isLive && product.viewers != null && <LiveBadge viewers={product.viewers} />}
        <div className="r42-product-tag-anchor"><ProductTagOverlay tag={product.productTag} /></div>
        {product.originalPrice != null && product.originalPrice > product.price && (
          <motion.div className="r42-discount-corner-badge" initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.6, type: 'spring' as const, stiffness: 260, damping: 15 }}>
            -{discPct(product.originalPrice, product.price)}% OFF
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function SocialCommerceFeed() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedState, setLikedState] = useState<LikeState>({});
  const [likeCountState, setLikeCountState] = useState<LikeCountState>(() => {
    const init: LikeCountState = {};
    SOCIAL_PRODUCTS.forEach((p) => { init[p.id] = p.initialLikes; });
    return init;
  });
  const [savedState, setSavedState] = useState<LikeState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerProduct, setDrawerProduct] = useState<SocialProduct | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleLike = useCallback((id: number) => {
    setLikedState((prev) => {
      const wasLiked = prev[id];
      setLikeCountState((counts) => ({ ...counts, [id]: counts[id] + (wasLiked ? -1 : 1) }));
      return { ...prev, [id]: !wasLiked };
    });
  }, []);

  const toggleSave = useCallback((id: number) => {
    setSavedState((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const openDrawer = useCallback((product: SocialProduct) => {
    setDrawerProduct(product);
    setDrawerOpen(true);
  }, []);

  const handleDoubleTap = useCallback((id: number) => {
    if (!likedState[id]) toggleLike(id);
  }, [likedState, toggleLike]);

  return (
    <section className="r42-feed-section r62-card-lift r94-social-feed-card" aria-label="Feed de Comercio Social">
      <div className="r42-feed-header">
        <motion.h2 className="r42-feed-title r62-heading-gradient" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}>
          <span className="r42-feed-title-icon">🔥</span> Trending Agora
        </motion.h2>
        <motion.p className="r42-feed-subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
          Descubra produtos em alta escolhidos por creators
        </motion.p>
      </div>
      <div className="r42-feed-container" ref={containerRef}>
        {SOCIAL_PRODUCTS.map((product, index) => (
          <div key={product.id} data-r42-card={index} className="r42-card-wrapper">
            <FeedCard
              product={product} index={index} isActive={index === activeIndex}
              liked={!!likedState[product.id]} likeCount={likeCountState[product.id] ?? product.initialLikes}
              saved={!!savedState[product.id]}
              onTap={() => {}} onDoubleTap={() => handleDoubleTap(product.id)}
              onLike={() => toggleLike(product.id)} onSave={() => toggleSave(product.id)}
              onShare={() => {}} onSwipeUp={() => openDrawer(product)}
            />
          </div>
        ))}
      </div>
      <div className="r42-feed-dots">
        {SOCIAL_PRODUCTS.map((_, idx) => (
          <motion.div key={idx} className={'r42-feed-dot ' + (idx === activeIndex ? 'r42-feed-dot-active' : '')}
            animate={{ scale: idx === activeIndex ? 1.4 : 1, backgroundColor: idx === activeIndex ? 'rgba(255,45,85,1)' : 'rgba(255,255,255,0.3)' }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
            onClick={() => setActiveIndex(idx)} role="button" tabIndex={0}
          />
        ))}
      </div>
      <ProductDrawer product={drawerProduct} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </section>
  );
}

export default SocialCommerceFeed;
