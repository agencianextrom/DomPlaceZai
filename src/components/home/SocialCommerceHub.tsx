'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type FilterTabValue = 'all' | 'friends' | 'trending' | 'following';

interface MockUser {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  emoji: string;
  isVerified: boolean;
  isInfluencer: boolean;
  followers: number;
  purchasesShared: number;
  likesReceived: number;
}

interface MockComment {
  id: string;
  userId: string;
  userName: string;
  userEmoji: string;
  text: string;
  timestamp: string;
  likes: number;
}

interface PurchaseStory {
  id: string;
  user: MockUser;
  productId: string;
  productName: string;
  productEmoji: string;
  productImage: string | null;
  productPrice: number;
  productOriginalPrice: number | null;
  store: string;
  comment: string;
  timestamp: string;
  likes: number;
  comments: MockComment[];
  isTrending: boolean;
  isFriend: boolean;
  isFollowing: boolean;
  shares: number;
  gradientFrom: string;
  gradientTo: string;
}

interface TrendingItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  purchasesCount: number;
  rank: number;
}

interface InfluencerPick {
  id: string;
  user: MockUser;
  productName: string;
  productEmoji: string;
  price: number;
  discount: number;
  reason: string;
  badge: string;
}

/* ================================================================== */
/*  Mock Data                                                          */
/* ================================================================== */

const MOCK_USERS: MockUser[] = [
  { id: 'u1', name: 'Ana Oliveira', handle: '@anaoli', avatar: '👩‍🦰', emoji: '🛍️', isVerified: true, isInfluencer: false, followers: 1240, purchasesShared: 23, likesReceived: 456 },
  { id: 'u2', name: 'Carlos Mendes', handle: '@carlostech', avatar: '👨‍💻', emoji: '📱', isVerified: false, isInfluencer: false, followers: 890, purchasesShared: 15, likesReceived: 234 },
  { id: 'u3', name: 'Julia Santos', handle: '@juliabeauty', avatar: '👩‍🎨', emoji: '💄', isVerified: true, isInfluencer: true, followers: 45600, purchasesShared: 89, likesReceived: 12300 },
  { id: 'u4', name: 'Pedro Lima', handle: '@pedrofit', avatar: '🏋️', emoji: '💪', isVerified: false, isInfluencer: false, followers: 567, purchasesShared: 8, likesReceived: 123 },
  { id: 'u5', name: 'Mariana Costa', handle: '@maricoffee', avatar: '👩‍🍳', emoji: '☕', isVerified: true, isInfluencer: true, followers: 89200, purchasesShared: 134, likesReceived: 45600 },
  { id: 'u6', name: 'Lucas Ferreira', handle: '@lucasadv', avatar: '🧑‍🦱', emoji: '🎒', isVerified: false, isInfluencer: false, followers: 340, purchasesShared: 11, likesReceived: 89 },
  { id: 'u7', name: 'Fernanda Alves', handle: '@fernandaorg', avatar: '👩‍💼', emoji: '📦', isVerified: true, isInfluencer: true, followers: 23400, purchasesShared: 67, likesReceived: 8900 },
  { id: 'u8', name: 'Rafael Torres', handle: '@rafadrones', avatar: '🧑‍✈️', emoji: '🚁', isVerified: true, isInfluencer: true, followers: 67800, purchasesShared: 45, likesReceived: 34500 },
];

const MOCK_STORIES: PurchaseStory[] = [
  {
    id: 's1', user: MOCK_USERS[0], productId: 'p1', productName: 'Tenis Runner Pro Max', productEmoji: '👟', productImage: null, productPrice: 349.9, productOriginalPrice: 499.9, store: 'SportLife Store',
    comment: 'Melhor tenis que ja comprei! Super confortavel para corridas longas, valeu cada centavo. Recomendo demais!',
    timestamp: '2 min', likes: 234, isTrending: true, isFriend: true, isFollowing: true, shares: 45,
    comments: [
      { id: 'c1', userId: 'u2', userName: 'Carlos', userEmoji: '👨‍💻', text: 'Quanto ficou no cupom?', timestamp: '1 min', likes: 5 },
      { id: 'c2', userId: 'u4', userName: 'Pedro', userEmoji: '🏋️', text: 'Que top! Vou comprar tambem', timestamp: '30s', likes: 3 },
    ],
    gradientFrom: '#1a1a2e', gradientTo: '#16213e',
  },
  {
    id: 's2', user: MOCK_USERS[1], productId: 'p2', productName: 'Fone Bluetooth Noise X', productEmoji: '🎧', productImage: null, productPrice: 189.9, productOriginalPrice: 259.9, store: 'TechWorld',
    comment: 'Cancelamento de ruido incrivel! Bateria dura 40h. Perfeito para o home office.',
    timestamp: '15 min', likes: 156, isTrending: false, isFriend: true, isFollowing: true, shares: 23,
    comments: [
      { id: 'c3', userId: 'u1', userName: 'Ana', userEmoji: '👩‍🦰', text: 'Ja tenho esse, e sensacional!', timestamp: '10 min', likes: 8 },
    ],
    gradientFrom: '#0f3460', gradientTo: '#533483',
  },
  {
    id: 's3', user: MOCK_USERS[2], productId: 'p3', productName: 'Skincare Set Premium', productEmoji: '🧴', productImage: null, productPrice: 279.9, productOriginalPrice: null, store: 'BeautyZone',
    comment: 'Meu kit skincare favorito! Vitamina C + acido hialuronico = pele perfeita. Usando ha 2 semanas e ja vejo diferenca.',
    timestamp: '32 min', likes: 892, isTrending: true, isFriend: false, isFollowing: true, shares: 198,
    comments: [
      { id: 'c4', userId: 'u6', userName: 'Lucas', userEmoji: '🧑‍🦱', text: 'Pode usar no rosto todo?', timestamp: '25 min', likes: 2 },
      { id: 'c5', userId: 'u0', userName: 'Beatriz', userEmoji: '👩', text: 'Eu tambem quero! Passa o link?', timestamp: '20 min', likes: 6 },
      { id: 'c6', userId: 'u7', userName: 'Fernanda', userEmoji: '👩‍💼', text: 'Melhor investimento do ano', timestamp: '18 min', likes: 12 },
    ],
    gradientFrom: '#e94560', gradientTo: '#1a1a2e',
  },
  {
    id: 's4', user: MOCK_USERS[3], productId: 'p4', productName: 'Smartwatch Fit Band Ultra', productEmoji: '⌚', productImage: null, productPrice: 459.9, productOriginalPrice: 599.9, store: 'GadgetHouse',
    comment: 'Monitor cardiaco preciso, GPS integrado e IP68. Melhor smartwatch custo-beneficio!',
    timestamp: '1h', likes: 89, isTrending: false, isFriend: true, isFollowing: false, shares: 12,
    comments: [
      { id: 'c7', userId: 'u3', userName: 'Julia', userEmoji: '👩‍🎨', text: 'Combina com o GPS do celular?', timestamp: '45 min', likes: 1 },
    ],
    gradientFrom: '#0a1128', gradientTo: '#1b262c',
  },
  {
    id: 's5', user: MOCK_USERS[4], productId: 'p5', productName: 'Cafeteira Espresso Deluxe', productEmoji: '☕', productImage: null, productPrice: 899.9, productOriginalPrice: 1299.9, store: 'Casa & Co',
    comment: 'Maquina profissional com moedor integrado! Cafe como de cafeteria em casa. Melhor compra que fiz esse mes.',
    timestamp: '2h', likes: 1456, isTrending: true, isFriend: false, isFollowing: true, shares: 234,
    comments: [
      { id: 'c8', userId: 'u1', userName: 'Ana', userEmoji: '👩‍🦰', text: 'Que luxo! Quero uma desse', timestamp: '1h', likes: 15 },
      { id: 'c9', userId: 'u5', userName: 'Mariana', userEmoji: '👩‍🍳', text: 'O cafe dela e mesmo perfeito!', timestamp: '1h', likes: 22 },
    ],
    gradientFrom: '#3d0c02', gradientTo: '#1a1205',
  },
  {
    id: 's6', user: MOCK_USERS[5], productId: 'p6', productName: 'Mochila Urban Explorer', productEmoji: '🎒', productImage: null, productPrice: 219.9, productOriginalPrice: null, store: 'Adventure Gear',
    comment: 'Mochila impermeavel com compartimento laptop 15. Perfeita pra cidade e trilhas!',
    timestamp: '3h', likes: 67, isTrending: false, isFriend: true, isFollowing: false, shares: 8,
    comments: [],
    gradientFrom: '#2d4a3e', gradientTo: '#1a2f28',
  },
  {
    id: 's7', user: MOCK_USERS[6], productId: 'p7', productName: 'Kit Organizacao Minimalista', productEmoji: '📦', productImage: null, productPrice: 149.9, productOriginalPrice: 199.9, store: 'OrganizaStore',
    comment: '8 organizadores estilo escandinavo que transformaram meu apartamento! Tudo no lugar certo agora.',
    timestamp: '4h', likes: 345, isTrending: true, isFriend: false, isFollowing: true, shares: 78,
    comments: [
      { id: 'c10', userId: 'u0', userName: 'Camila', userEmoji: '👩', text: 'Preciso disso! Onde comprou?', timestamp: '3h', likes: 4 },
      { id: 'c11', userId: 'u2', userName: 'Carlos', userEmoji: '👨‍💻', text: 'Minimalismo e vida organised', timestamp: '3h', likes: 7 },
    ],
    gradientFrom: '#f5f0e8', gradientTo: '#e8e0d0',
  },
  {
    id: 's8', user: MOCK_USERS[7], productId: 'p8', productName: 'Drone Explorer 4K', productEmoji: '🚁', productImage: null, productPrice: 2499.9, productOriginalPrice: 3299.9, store: 'DroneShop BR',
    comment: 'Camera 4K 60fps com gimbal 3 eixos. Voce nao imagina a qualidade das fotos! 35min de voo.',
    timestamp: '5h', likes: 2345, isTrending: true, isFriend: false, isFollowing: true, shares: 456,
    comments: [
      { id: 'c12', userId: 'u3', userName: 'Julia', userEmoji: '👩‍🎨', text: 'Tirou fotos lindas!', timestamp: '4h', likes: 34 },
      { id: 'c13', userId: 'u4', userName: 'Pedro', userEmoji: '🏋️', text: 'Sonho de consumo!', timestamp: '4h', likes: 19 },
      { id: 'c14', userId: 'u1', userName: 'Ana', userEmoji: '👩‍🦰', text: 'Quanto ficou com desconto?', timestamp: '3h', likes: 11 },
    ],
    gradientFrom: '#0c1445', gradientTo: '#1a237e',
  },
];

const EXTRA_STORIES: PurchaseStory[] = [
  {
    id: 's9', user: MOCK_USERS[0], productId: 'p9', productName: 'Luminaria LED Smart Home', productEmoji: '💡', productImage: null, productPrice: 329.9, productOriginalPrice: null, store: 'LightDesign',
    comment: '16 milhoes de cores compativel com Alexa e Google. Automacao da casa nivel proximo!',
    timestamp: '6h', likes: 123, isTrending: false, isFriend: true, isFollowing: true, shares: 19,
    comments: [
      { id: 'c15', userId: 'u3', userName: 'Julia', userEmoji: '👩‍🎨', text: 'Funciona com HomeKit?', timestamp: '5h', likes: 2 },
    ],
    gradientFrom: '#2c1810', gradientTo: '#1a0f0a',
  },
  {
    id: 's10', user: MOCK_USERS[2], productId: 'p10', productName: 'Suplemento Whey Protein Pro', productEmoji: '💪', productImage: null, productPrice: 159.9, productOriginalPrice: 219.9, store: 'NutriFit Store',
    comment: 'Whey Isolado com 27g de proteina por dose. Sabor chocolate e divino!',
    timestamp: '8h', likes: 567, isTrending: true, isFriend: false, isFollowing: true, shares: 89,
    comments: [
      { id: 'c16', userId: 'u4', userName: 'Pedro', userEmoji: '🏋️', text: 'Qual sabor voce pegou?', timestamp: '7h', likes: 5 },
    ],
    gradientFrom: '#1a2332', gradientTo: '#0d1520',
  },
  {
    id: 's11', user: MOCK_USERS[4], productId: 'p11', productName: 'Jogo de Panelas Ceramicas', productEmoji: '🍳', productImage: null, productPrice: 599.9, productOriginalPrice: 899.9, store: 'CasaGourmet',
    comment: 'Antiaderente sem PFOA! Cozinha fica muito mais facil e saudavel. Indico para todo mundo!',
    timestamp: '10h', likes: 789, isTrending: true, isFriend: false, isFollowing: true, shares: 145,
    comments: [],
    gradientFrom: '#4a2c17', gradientTo: '#2a1a0d',
  },
  {
    id: 's12', user: MOCK_USERS[5], productId: 'p12', productName: 'Camiseta Dry Fit Premium', productEmoji: '👕', productImage: null, productPrice: 79.9, productOriginalPrice: null, store: 'FitWear',
    comment: 'Seca super rapido, conforto maximo pra academia. Comprei 3 cores!',
    timestamp: '12h', likes: 45, isTrending: false, isFriend: true, isFollowing: false, shares: 6,
    comments: [],
    gradientFrom: '#1e3a5f', gradientTo: '#0d1b2a',
  },
];

const TRENDING_ITEMS: TrendingItem[] = [
  { id: 't1', name: 'Tenis Runner Pro', emoji: '👟', price: 349.9, purchasesCount: 1245, rank: 1 },
  { id: 't2', name: 'Skincare Set', emoji: '🧴', price: 279.9, purchasesCount: 987, rank: 2 },
  { id: 't3', name: 'Cafeteira Espresso', emoji: '☕', price: 899.9, purchasesCount: 876, rank: 3 },
  { id: 't4', name: 'Drone Explorer 4K', emoji: '🚁', price: 2499.9, purchasesCount: 654, rank: 4 },
  { id: 't5', name: 'Kit Organizacao', emoji: '📦', price: 149.9, purchasesCount: 543, rank: 5 },
  { id: 't6', name: 'Fone Bluetooth', emoji: '🎧', price: 189.9, purchasesCount: 432, rank: 6 },
];

const INFLUENCER_PICKS: InfluencerPick[] = [
  { id: 'ip1', user: MOCK_USERS[2], productName: 'Sérum Vitamina C 20%', productEmoji: '✨', price: 79.9, discount: 20, reason: 'Meu segredo de pele perfeita', badge: 'Top Beauty Pick' },
  { id: 'ip2', user: MOCK_USERS[4], productName: 'Cafeteira Espresso', productEmoji: '☕', price: 899.9, discount: 30, reason: 'Cafe de cafeteria em casa', badge: 'Editor\'s Choice' },
  { id: 'ip3', user: MOCK_USERS[7], productName: 'Drone Explorer 4K', productEmoji: '🚁', price: 2499.9, discount: 25, reason: 'Melhor drone custo-beneficio', badge: 'Tech Gold' },
  { id: 'ip4', user: MOCK_USERS[6], productName: 'Kit Organizacao', productEmoji: '📦', price: 149.9, discount: 25, reason: 'Transformou minha casa', badge: 'Home Favorite' },
];

const USER_STATS = {
  purchasesShared: 42,
  likesReceived: 3890,
  followers: 1256,
  following: 340,
};

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function fmtNum(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

function fmtPrice(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function discPct(orig: number, curr: number): number {
  return Math.round(((orig - curr) / orig) * 100);
}

/* ================================================================== */
/*  Framer Motion Variants                                             */
/* ================================================================== */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 350, damping: 20 },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 22 },
  },
};

/* ================================================================== */
/*  Sub-Components                                                      */
/* ================================================================== */

/* ---- Heart Burst Particles on Double-Tap ---- */
function HeartBurst({ show, x, y }: { show: boolean; x: number; y: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        angle: (i * 360) / 8,
        distance: 30 + Math.random() * 20,
        size: 10 + Math.random() * 8,
      })),
    []
  );

  return (
    <AnimatePresence>
      {show && (
        <div className="r49-social-heart-burst" style={{ left: x, top: y }}>
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="r49-social-burst-particle"
              initial={{ scale: 1, x: 0, y: 0, opacity: 1 }}
              animate={{
                scale: 0,
                x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
                y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ fontSize: p.size }}
            >
              ❤️
            </motion.span>
          ))}
          <motion.span
            className="r49-social-burst-center"
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            ❤️
          </motion.span>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---- Story Highlight Ring (Instagram-style) ---- */
function StoryHighlightRing({ emoji, seen, isLive, onClick }: { emoji: string; seen: boolean; isLive: boolean; onClick: () => void }) {
  return (
    <motion.div
      className="r49-social-highlight-ring"
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label="Story highlight"
    >
      <motion.div
        className="r49-social-ring-outer"
        animate={!seen ? {
          boxShadow: '0 0 0 2px rgba(236,72,153,1), 0 0 0 4px rgba(168,85,247,1), 0 0 0 6px rgba(236,72,153,0.5)',
        } : {
          boxShadow: '0 0 0 2px rgba(156,163,175,0.5)',
        }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
      >
        <div className="r49-social-highlight-avatar">{emoji}</div>
      </motion.div>
      {isLive && (
        <motion.div
          className="r49-social-live-dot"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          AO VIVO
        </motion.div>
      )}
    </motion.div>
  );
}

/* ---- Filter Tabs ---- */
function FilterTabs({ active, onChange }: { active: FilterTabValue; onChange: (tab: FilterTabValue) => void }) {
  const tabs: { value: FilterTabValue; label: string; icon: string }[] = [
    { value: 'all', label: 'Todos', icon: '🌐' },
    { value: 'friends', label: 'Amigos', icon: '👥' },
    { value: 'trending', label: 'Trending', icon: '🔥' },
    { value: 'following', label: 'Seguindo', icon: '⭐' },
  ];

  return (
    <div className="r49-social-filter-tabs">
      {tabs.map((tab) => (
        <motion.div
          key={tab.value}
          className={'r49-social-filter-tab ' + (active === tab.value ? 'r49-social-filter-tab-active' : '')}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
          onClick={() => onChange(tab.value)}
          role="button"
          tabIndex={0}
          aria-label={`Filter: ${tab.label}`}
        >
          <span className="r49-social-tab-icon">{tab.icon}</span>
          <span className="r49-social-tab-label">{tab.label}</span>
          {active === tab.value && (
            <motion.div
              className="r49-social-tab-indicator"
              layoutId="r49-social-tab-indicator"
              transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* ---- Share Buttons ---- */
function ShareButtons({ productName }: { productName: string }) {
  const shareUrl = `https://domplace.com.br/product/${encodeURIComponent(productName)}`;
  const [copied, setCopied] = useState(false);

  const handleWhatsApp = useCallback(() => {
    const text = `Confira esse produto no DomPlace! 🛍️ ${productName} ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }, [productName, shareUrl]);

  const handleInstagram = useCallback(() => {
    window.open('https://instagram.com', '_blank');
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  return (
    <div className="r49-social-share-buttons">
      <motion.button
        className="r49-social-share-btn r49-social-share-whatsapp"
        whileTap={{ scale: 0.88 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
        onClick={handleWhatsApp}
        aria-label="Share on WhatsApp"
      >
        <span className="r49-social-share-emoji">💬</span>
        <span className="r49-social-share-label">WhatsApp</span>
      </motion.button>
      <motion.button
        className="r49-social-share-btn r49-social-share-instagram"
        whileTap={{ scale: 0.88 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
        onClick={handleInstagram}
        aria-label="Share on Instagram"
      >
        <span className="r49-social-share-emoji">📷</span>
        <span className="r49-social-share-label">Instagram</span>
      </motion.button>
      <motion.button
        className="r49-social-share-btn r49-social-share-copy"
        whileTap={{ scale: 0.88 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
        onClick={handleCopy}
        aria-label="Copy link"
      >
        <span className="r49-social-share-emoji">{copied ? '✅' : '🔗'}</span>
        <span className="r49-social-share-label">{copied ? 'Copiado!' : 'Copiar'}</span>
      </motion.button>
    </div>
  );
}

/* ---- Comment Section (Expandable) ---- */
function CommentSection({ comments, storyId }: { comments: MockComment[]; storyId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const visibleCount = expanded ? comments.length : Math.min(2, comments.length);

  return (
    <div className="r49-social-comment-section">
      {comments.length > 0 && (
        <motion.div className="r49-social-comments-list" layout>
          <AnimatePresence mode="popLayout">
            {comments.slice(0, visibleCount).map((comment, idx) => (
              <motion.div
                key={comment.id}
                className="r49-social-comment-item"
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                  delay: idx * 0.05,
                  type: 'spring' as const,
                  stiffness: 300,
                  damping: 22,
                }}
              >
                <span className="r49-social-comment-avatar">{comment.userEmoji}</span>
                <div className="r49-social-comment-content">
                  <span className="r49-social-comment-name">{comment.userName}</span>
                  <span className="r49-social-comment-text">{comment.text}</span>
                </div>
                <span className="r49-social-comment-meta">
                  <span className="r49-social-comment-time">{comment.timestamp}</span>
                  {comment.likes > 0 && (
                    <span className="r49-social-comment-likes">❤️ {comment.likes}</span>
                  )}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          {comments.length > 2 && !expanded && (
            <motion.button
              className="r49-social-comments-more"
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
              onClick={() => setExpanded(true)}
            >
              Ver mais {comments.length - 2} comentarios
            </motion.button>
          )}
        </motion.div>
      )}
      <div className="r49-social-comment-input-wrap">
        <input
          className="r49-social-comment-input"
          placeholder="Adicionar comentario..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <motion.button
          className="r49-social-comment-send"
          whileTap={{ scale: 0.88 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
          aria-label="Send comment"
        >
          📤
        </motion.button>
      </div>
    </div>
  );
}

/* ---- Story Card ---- */
function StoryCard({
  story,
  index,
  onLike,
  onAddToCart,
}: {
  story: PurchaseStory;
  index: number;
  onLike: (id: string) => void;
  onAddToCart: (story: PurchaseStory) => void;
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(story.likes);
  const [showBurst, setShowBurst] = useState(false);
  const [burstPos, setBurstPos] = useState({ x: 0, y: 0 });
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const lastTapRef = useRef<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const hasDisc = story.productOriginalPrice != null && story.productOriginalPrice > story.productPrice;

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!liked) {
        setLiked(true);
        setLikeCount((c) => c + 1);
        onLike(story.id);
      }
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        setBurstPos({ x: rect.width / 2 - 20, y: rect.height / 2 - 20 });
      }
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 700);
    }
    lastTapRef.current = now;
  }, [liked, story.id, onLike]);

  const handleLike = useCallback(() => {
    setLiked((prev) => {
      const next = !prev;
      setLikeCount((c) => c + (next ? 1 : -1));
      if (next) onLike(story.id);
      return next;
    });
  }, [story.id, onLike]);

  const handleShopLook = useCallback(() => {
    onAddToCart(story);
  }, [story, onAddToCart]);

  return (
    <motion.div
      ref={cardRef}
      className="r49-social-story-card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      onClick={handleTap}
    >
      <HeartBurst show={showBurst} x={burstPos.x} y={burstPos.y} />

      {/* Card Header: User info */}
      <div className="r49-social-card-header">
        <div className="r49-social-user-info">
          <div className="r49-social-avatar-wrap">
            <StoryHighlightRing
              emoji={story.user.avatar}
              seen={false}
              isLive={story.user.isInfluencer && index < 2}
              onClick={() => {}}
            />
          </div>
          <div className="r49-social-user-details">
            <div className="r49-social-user-name-row">
              <span className="r49-social-user-name">{story.user.name}</span>
              {story.user.isVerified && <span className="r49-social-verified-badge">✓</span>}
              {story.user.isInfluencer && <span className="r49-social-influencer-badge">⭐ Creator</span>}
            </div>
            <span className="r49-social-user-handle">{story.user.handle}</span>
          </div>
          <span className="r49-social-timestamp">{story.timestamp} atras</span>
        </div>
      </div>

      {/* Product Area */}
      <div
        className="r49-social-product-area"
        style={{ background: `linear-gradient(135deg, ${story.gradientFrom}, ${story.gradientTo})` }}
      >
        <motion.div
          className="r49-social-product-emoji-display"
          animate={{ y: [0, -6, 0], rotate: [0, 2, -2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {story.productEmoji}
        </motion.div>
        {story.isTrending && (
          <motion.div
            className="r49-social-trending-badge"
            initial={{ scale: 0, x: -20 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: 0.3 }}
          >
            🔥 Trending
          </motion.div>
        )}
        {hasDisc && (
          <motion.div
            className="r49-social-discount-badge"
            initial={{ scale: 0, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 15, delay: 0.4 }}
          >
            -{discPct(story.productOriginalPrice!, story.productPrice)}% OFF
          </motion.div>
        )}
      </div>

      {/* Purchase Comment */}
      <div className="r49-social-purchase-comment">
        <p className="r49-social-comment-text">{story.comment}</p>
      </div>

      {/* Product Info & Price */}
      <div className="r49-social-product-info">
        <div className="r49-social-product-meta">
          <span className="r49-social-store-name">🏪 {story.store}</span>
        </div>
        <h4 className="r49-social-product-name">{story.productName}</h4>
        <div className="r49-social-price-row">
          {hasDisc && <span className="r49-social-original-price">{fmtPrice(story.productOriginalPrice!)}</span>}
          <span className="r49-social-current-price">{fmtPrice(story.productPrice)}</span>
        </div>
      </div>

      {/* Shop This Look CTA */}
      <motion.div
        className="r49-social-shop-cta"
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
        onClick={(e) => {
          e.stopPropagation();
          handleShopLook();
        }}
      >
        <span className="r49-social-shop-cta-icon">🛒</span>
        <span className="r49-social-shop-cta-text">Compre este look</span>
      </motion.div>

      {/* Action Bar: Like, Comment, Share */}
      <div className="r49-social-action-bar">
        <motion.div
          className={'r49-social-action-btn ' + (liked ? 'r49-social-action-liked' : '')}
          whileTap={{ scale: 0.85 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
          onClick={(e) => {
            e.stopPropagation();
            handleLike();
          }}
          role="button"
          tabIndex={0}
          aria-label="Like"
        >
          <motion.span
            className="r49-social-heart-icon"
            animate={liked ? { scale: [1, 1.4, 0.9, 1.2, 1], rotate: [0, -10, 5, -5, 0] } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            {liked ? '❤️' : '🤍'}
          </motion.span>
          <span className="r49-social-action-count">{fmtNum(likeCount)}</span>
        </motion.div>

        <motion.div
          className="r49-social-action-btn"
          whileTap={{ scale: 0.85 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
          onClick={(e) => {
            e.stopPropagation();
            setShowComments((prev) => !prev);
          }}
          role="button"
          tabIndex={0}
          aria-label="Toggle comments"
        >
          <span>💬</span>
          <span className="r49-social-action-count">{fmtNum(story.comments.length)}</span>
        </motion.div>

        <motion.div
          className="r49-social-action-btn"
          whileTap={{ scale: 0.85 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
          onClick={(e) => {
            e.stopPropagation();
            setShowShare((prev) => !prev);
          }}
          role="button"
          tabIndex={0}
          aria-label="Share"
        >
          <span>↗️</span>
          <span className="r49-social-action-count">{fmtNum(story.shares)}</span>
        </motion.div>

        <motion.div
          className="r49-social-action-btn"
          whileTap={{ scale: 0.85 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
          role="button"
          tabIndex={0}
          aria-label="Save"
        >
          <span>🔖</span>
        </motion.div>
      </div>

      {/* Expandable Comment Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            className="r49-social-comments-expand"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <CommentSection comments={story.comments} storyId={story.id} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expandable Share Section */}
      <AnimatePresence>
        {showShare && (
          <motion.div
            className="r49-social-share-expand"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ShareButtons productName={story.productName} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ---- Trending Sidebar ---- */
function TrendingSidebar({ items }: { items: TrendingItem[] }) {
  return (
    <div className="r49-social-trending-sidebar">
      <h3 className="r49-social-trending-title">
        <span className="r49-social-trending-icon">🔥</span>
        Em Alta na Comunidade
      </h3>
      <div className="r49-social-trending-list">
        <AnimatePresence>
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              className="r49-social-trending-item"
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
              custom={idx}
              whileHover={{ x: 4, backgroundColor: 'rgba(168,85,247,0.06)' }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
            >
              <div className="r49-social-trending-rank">
                <span className={'r49-social-rank-num ' + (item.rank <= 3 ? 'r49-social-rank-top' : '')}>
                  {item.rank}
                </span>
              </div>
              <span className="r49-social-trending-emoji">{item.emoji}</span>
              <div className="r49-social-trending-info">
                <span className="r49-social-trending-name">{item.name}</span>
                <span className="r49-social-trending-price">{fmtPrice(item.price)}</span>
              </div>
              <span className="r49-social-trending-count">
                <span className="r49-social-trending-count-icon">🛍️</span>
                {fmtNum(item.purchasesCount)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---- Influencer Picks Section ---- */
function InfluencerPicks({ picks }: { picks: InfluencerPick[] }) {
  return (
    <div className="r49-social-influencer-section">
      <h3 className="r49-social-influencer-title">
        <span className="r49-social-influencer-title-icon">⭐</span>
        Picks dos Influencers
      </h3>
      <div className="r49-social-influencer-grid">
        <AnimatePresence>
          {picks.map((pick, idx) => (
            <motion.div
              key={pick.id}
              className="r49-social-influencer-card"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={idx}
              whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(168,85,247,0.15)' }}
              transition={{ type: 'spring' as const, stiffness: 280, damping: 20 }}
            >
              {/* Badge */}
              <motion.div
                className="r49-social-pick-badge"
                animate={{ scale: [1, 1.05, 1], opacity: [0.85, 1, 0.85] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.3 }}
              >
                🏆 {pick.badge}
              </motion.div>

              {/* Influencer info */}
              <div className="r49-social-pick-header">
                <span className="r49-social-pick-avatar">{pick.user.avatar}</span>
                <div>
                  <span className="r49-social-pick-name">{pick.user.name}</span>
                  {pick.user.isVerified && <span className="r49-social-pick-verified">✓</span>}
                </div>
              </div>

              {/* Product */}
              <div className="r49-social-pick-product">
                <span className="r49-social-pick-product-emoji">{pick.productEmoji}</span>
                <span className="r49-social-pick-product-name">{pick.productName}</span>
              </div>

              {/* Reason */}
              <p className="r49-social-pick-reason">"{pick.reason}"</p>

              {/* Price & Discount */}
              <div className="r49-social-pick-pricing">
                <span className="r49-social-pick-price">{fmtPrice(pick.price)}</span>
                <span className="r49-social-pick-discount">-{pick.discount}%</span>
              </div>

              {/* CTA */}
              <motion.div
                className="r49-social-pick-cta"
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
              >
                🛒 Comprar
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---- User Activity Stats ---- */
function UserActivityStats({ stats }: { stats: typeof USER_STATS }) {
  const statItems = [
    { label: 'Compras Compartilhadas', value: stats.purchasesShared, icon: '🛍️', color: 'rgba(59,130,246,0.12)' },
    { label: 'Curtidas Recebidas', value: stats.likesReceived, icon: '❤️', color: 'rgba(239,68,68,0.12)' },
    { label: 'Seguidores', value: stats.followers, icon: '👥', color: 'rgba(168,85,247,0.12)' },
    { label: 'Seguindo', value: stats.following, icon: '⭐', color: 'rgba(245,158,11,0.12)' },
  ];

  return (
    <div className="r49-social-stats-section">
      <h3 className="r49-social-stats-title">
        <span className="r49-social-stats-title-icon">📊</span>
        Sua Atividade Social
      </h3>
      <div className="r49-social-stats-grid">
        <AnimatePresence>
          {statItems.map((item, idx) => (
            <motion.div
              key={item.label}
              className="r49-social-stat-card"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: 0.1 + idx * 0.1,
                type: 'spring' as const,
                stiffness: 300,
                damping: 20,
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              style={{ backgroundColor: item.color }}
            >
              <span className="r49-social-stat-icon">{item.icon}</span>
              <span className="r49-social-stat-value">{fmtNum(item.value)}</span>
              <span className="r49-social-stat-label">{item.label}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---- Story Highlights Row ---- */
function StoryHighlightsRow({ stories }: { stories: PurchaseStory[] }) {
  const uniqueUsers = useMemo(() => {
    const seen = new Set<string>();
    return stories.filter((s) => {
      if (seen.has(s.user.id)) return false;
      seen.add(s.user.id);
      return true;
    });
  }, [stories]);

  return (
    <div className="r49-social-highlights-row">
      <AnimatePresence>
        {uniqueUsers.map((story, idx) => (
          <motion.div
            key={story.user.id}
            className="r49-social-highlight-item"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.08, type: 'spring' as const, stiffness: 300, damping: 20 }}
          >
            <StoryHighlightRing
              emoji={story.user.avatar}
              seen={idx > 4}
              isLive={story.user.isInfluencer && idx < 3}
              onClick={() => {}}
            />
            <span className="r49-social-highlight-name">{story.user.name.split(' ')[0]}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ---- Load More Button ---- */
function LoadMoreButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <motion.div
      className="r49-social-load-more"
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            className="r49-social-loading-spinner"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <motion.span
              className="r49-social-spinner-dot"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              ⏳
            </motion.span>
            <span>Carregando mais historias...</span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            className="r49-social-load-more-idle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <span className="r49-social-load-more-icon">🔄</span>
            <span>Carregar mais historias</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ================================================================== */
/*  Main Component: SocialCommerceHub                                  */
/* ================================================================== */

export function SocialCommerceHub() {
  const [activeFilter, setActiveFilter] = useState<FilterTabValue>('all');
  const [displayedStories, setDisplayedStories] = useState<PurchaseStory[]>(MOCK_STORIES);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allStories, setAllStories] = useState<PurchaseStory[]>(MOCK_STORIES);
  const [cartAdded, setCartAdded] = useState<string | null>(null);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const feedRef = useRef<HTMLDivElement>(null);
  const hasLoadedMore = useRef(false);

  /* Filter stories based on active tab */
  const filteredStories = useMemo(() => {
    switch (activeFilter) {
      case 'friends':
        return displayedStories.filter((s) => s.isFriend);
      case 'trending':
        return displayedStories.filter((s) => s.isTrending);
      case 'following':
        return displayedStories.filter((s) => s.isFollowing);
      default:
        return displayedStories;
    }
  }, [activeFilter, displayedStories]);

  /* Handle "Load more" infinite scroll simulation */
  const handleLoadMore = useCallback(() => {
    if (hasLoadedMore.current || loadingMore) return;
    hasLoadedMore.current = true;
    setLoadingMore(true);

    setTimeout(() => {
      setAllStories((prev) => {
        const newIds = new Set(prev.map((s) => s.id));
        const extra = EXTRA_STORIES.filter((s) => !newIds.has(s.id));
        return [...prev, ...extra];
      });
      setLoadingMore(false);
    }, 1200);
  }, [loadingMore]);

  /* Sync displayedStories from allStories */
  useEffect(() => {
    setDisplayedStories(allStories);
  }, [allStories]);

  /* Handle like */
  const handleLike = useCallback((id: string) => {
    /* Visual feedback is handled inside StoryCard */
  }, []);

  /* Handle add to cart */
  const handleAddToCart = useCallback((story: PurchaseStory) => {
    setCartAdded(story.id);
    setAddedItems((prev) => new Set(prev).add(story.id));
    setTimeout(() => setCartAdded(null), 2000);
  }, []);

  return (
    <section className="r49-social-hub r62-card-lift" aria-label="Social Commerce Hub">
      {/* ============================================================ */}
      {/*  Section Header                                               */}
      {/* ============================================================ */}
      <motion.div
        className="r49-social-header"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <div className="r49-social-header-left">
          <motion.div
            className="r49-social-header-icon"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            🛍️
          </motion.div>
          <div>
            <h2 className="r49-social-title r62-heading-gradient">Social Shopping</h2>
            <p className="r49-social-subtitle">
              Veja o que seus amigos e influencers estao comprando
            </p>
          </div>
        </div>
        <motion.div
          className="r49-social-header-badge"
          animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="r49-social-badge-icon">👥</span>
          <span className="r49-social-badge-text">12.4K ativos</span>
        </motion.div>
      </motion.div>

      {/* ============================================================ */}
      {/*  Story Highlights Row (Instagram-style)                      */}
      {/* ============================================================ */}
      <motion.div
        className="r49-social-highlights-section"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <StoryHighlightsRow stories={allStories} />
      </motion.div>

      {/* ============================================================ */}
      {/*  Filter Tabs                                                  */}
      {/* ============================================================ */}
      <motion.div
        className="r49-social-filters-wrap"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <FilterTabs active={activeFilter} onChange={setActiveFilter} />
      </motion.div>

      {/* ============================================================ */}
      {/*  Main Content: Feed + Sidebar                                */}
      {/* ============================================================ */}
      <div className="r49-social-content-layout">
        {/* ---- Feed Column ---- */}
        <div className="r49-social-feed-column" ref={feedRef}>
          <motion.div
            className="r49-social-feed-list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {filteredStories.map((story, idx) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  index={idx}
                  onLike={handleLike}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Load More Button */}
          {!hasLoadedMore.current && filteredStories.length > 0 && (
            <LoadMoreButton loading={loadingMore} onClick={handleLoadMore} />
          )}

          {/* Empty State */}
          {filteredStories.length === 0 && (
            <motion.div
              className="r49-social-empty-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
            >
              <span className="r49-social-empty-emoji">🔍</span>
              <p className="r49-social-empty-title">Nenhuma historia encontrada</p>
              <p className="r49-social-empty-text">
                Tente mudar o filtro ou carregar mais historias
              </p>
              <motion.div
                className="r49-social-empty-reset"
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
                onClick={() => setActiveFilter('all')}
              >
                Ver todos
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* ---- Sidebar Column ---- */}
        <aside className="r49-social-sidebar-column">
          {/* Trending Items */}
          <TrendingSidebar items={TRENDING_ITEMS} />

          {/* User Stats */}
          <UserActivityStats stats={USER_STATS} />

          {/* Influencer Picks */}
          <InfluencerPicks picks={INFLUENCER_PICKS} />
        </aside>
      </div>

      {/* ============================================================ */}
      {/*  Cart Added Toast                                             */}
      {/* ============================================================ */}
      <AnimatePresence>
        {cartAdded && (
          <motion.div
            className="r49-social-cart-toast"
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.9 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
          >
            <motion.span
              className="r49-social-toast-icon"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              ✅
            </motion.span>
            <span className="r49-social-toast-text">Produto adicionado ao carrinho!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default SocialCommerceHub;
