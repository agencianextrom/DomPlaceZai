'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift,
  Send,
  CreditCard,
  Mail,
  MessageCircle,
  Printer,
  QrCode,
  Clock,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  X,
  ArrowLeft,
  Eye,
  ShoppingCart,
  Tag,

  Star,
  Wallet,
  TrendingUp,
  Zap,
  GiftIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// ─── Types ──────────────────────────────────────────────
interface GiftCardDesign {
  id: string;
  store: string;
  logo: string;
  category: 'food' | 'fashion' | 'tech' | 'beauty' | 'entertainment' | 'home';
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
  pattern: 'circles' | 'stripes' | 'dots' | 'waves' | 'diamonds' | 'grid';
  tagline: string;
}

interface GiftCardValue {
  amount: number;
  label: string;
  popular?: boolean;
}

interface OwnedCard {
  id: string;
  cardDesign: GiftCardDesign;
  value: number;
  balance: number;
  purchasedAt: string;
  expiresAt: string;
  code: string;
  pin: string;
  isRedeemed: boolean;
  redeemedAt?: string;
}

interface PurchaseReceipt {
  id: string;
  cardDesign: GiftCardDesign;
  value: number;
  purchasedAt: string;
  deliveryMethod: 'email' | 'whatsapp' | 'print';
  recipientName?: string;
  recipientEmail?: string;
  giftMessage?: string;
}

type BuyMode = 'self' | 'gift';
type DeliveryMethod = 'email' | 'whatsapp' | 'print';
type ViewMode = 'shop' | 'wallet' | 'redeem';
type FilterCategory = 'all' | 'food' | 'fashion' | 'tech' | 'beauty' | 'entertainment' | 'home';
type FilterValueRange = 'all' | 'under50' | '50to100' | 'over100';

interface FilterState {
  category: FilterCategory;
  valueRange: FilterValueRange;
  search: string;
}

// ─── Constants ──────────────────────────────────────────
const STORAGE_KEY = 'r51-gift-card-data';

const GIFT_CARDS: GiftCardDesign[] = [
  {
    id: 'gc-amazon',
    store: 'Amazon Brasil',
    logo: '📦',
    category: 'tech',
    gradientFrom: '#FF9900',
    gradientTo: '#232F3E',
    accentColor: '#FF9900',
    pattern: 'stripes',
    tagline: 'Tudo que voce precisa',
  },
  {
    id: 'gc-riachuelo',
    store: 'Riachuelo',
    logo: '👗',
    category: 'fashion',
    gradientFrom: '#E4002B',
    gradientTo: '#8B0000',
    accentColor: '#E4002B',
    pattern: 'circles',
    tagline: 'Moda para todos',
  },
  {
    id: 'gc-ifood',
    store: 'iFood',
    logo: '🍔',
    category: 'food',
    gradientFrom: '#EA1D2C',
    gradientTo: '#B71C1C',
    accentColor: '#EA1D2C',
    pattern: 'dots',
    tagline: 'Sua fome, nosso delivery',
  },
  {
    id: 'gc-sephora',
    store: 'Sephora',
    logo: '💄',
    category: 'beauty',
    gradientFrom: '#000000',
    gradientTo: '#1a1a2e',
    accentColor: '#D4AF37',
    pattern: 'waves',
    tagline: 'A beleza e sua',
  },
  {
    id: 'gc-mercado-livre',
    store: 'Mercado Livre',
    logo: '🛒',
    category: 'tech',
    gradientFrom: '#FFF159',
    gradientTo: '#39B54A',
    accentColor: '#39B54A',
    pattern: 'grid',
    tagline: 'Compre e receba',
  },
  {
    id: 'gc-cinemark',
    store: 'Cinemark',
    logo: '🎬',
    category: 'entertainment',
    gradientFrom: '#2B0548',
    gradientTo: '#6A0DAD',
    accentColor: '#E040FB',
    pattern: 'diamonds',
    tagline: 'Experiencias inesqueciveis',
  },
  {
    id: 'gc-americanas',
    store: 'Americanas',
    logo: '🏠',
    category: 'home',
    gradientFrom: '#E11D48',
    gradientTo: '#0F172A',
    accentColor: '#FCD34D',
    pattern: 'circles',
    tagline: 'Tudo para sua casa',
  },
  {
    id: 'gc-spotify',
    store: 'Spotify',
    logo: '🎵',
    category: 'entertainment',
    gradientFrom: '#1DB954',
    gradientTo: '#191414',
    accentColor: '#1DB954',
    pattern: 'waves',
    tagline: 'Musica sem limites',
  },
];

const VALUES: GiftCardValue[] = [
  { amount: 25, label: 'R$ 25' },
  { amount: 50, label: 'R$ 50', popular: true },
  { amount: 100, label: 'R$ 100' },
  { amount: 200, label: 'R$ 200' },
];

const CATEGORY_LABELS: Record<FilterCategory, string> = {
  all: 'Todas',
  food: 'Alimentacao',
  fashion: 'Moda',
  tech: 'Tecnologia',
  beauty: 'Beleza',
  entertainment: 'Entretenimento',
  home: 'Casa',
};

const CATEGORY_ICONS: Record<string, string> = {
  all: '🏷️',
  food: '🍔',
  fashion: '👗',
  tech: '📱',
  beauty: '💄',
  entertainment: '🎬',
  home: '🏠',
};

const VALUE_RANGE_LABELS: Record<FilterValueRange, string> = {
  all: 'Todos',
  under50: 'Ate R$50',
  '50to100': 'R$50-R$100',
  over100: 'Acima R$100',
};

const MAX_GIFT_MESSAGE = 200;

// ─── Helpers ────────────────────────────────────────────
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generatePin(): string {
  let pin = '';
  for (let i = 0; i < 6; i++) {
    pin += Math.floor(Math.random() * 10).toString();
  }
  return pin;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getDaysUntilExpiry(expiresAt: string): number {
  const now = new Date();
  const exp = new Date(expiresAt);
  const diff = exp.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatCountdown(days: number): string {
  if (days === 0) return 'Expira hoje!';
  if (days === 1) return '1 dia';
  if (days < 30) return `${days} dias`;
  if (days < 365) return `${Math.floor(days / 30)} meses e ${days % 30} dias`;
  return `${Math.floor(days / 365)} anos`;
}

function matchesValueRange(amount: number, range: FilterValueRange): boolean {
  if (range === 'all') return true;
  if (range === 'under50') return amount <= 50;
  if (range === '50to100') return amount >= 50 && amount <= 100;
  return amount > 100;
}

// ─── Confetti Effect ────────────────────────────────────
function ConfettiBurst({ active }: { active: boolean }) {
  if (!active) return null;

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.4,
    color: ['#fbbf24', '#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#8b5cf6', '#f97316', '#ef4444'][i % 8],
    size: 4 + Math.random() * 6,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          initial={{ y: -10, x: `${p.x}%`, opacity: 1, scale: 1, rotate: 0 }}
          animate={{ y: 120, opacity: 0, scale: 0.2, rotate: p.rotation + 720 }}
          transition={{ duration: 1.2, delay: p.delay, ease: 'easeOut' }}
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            left: `${p.x}%`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Floating Sparkles ─────────────────────────────────
function FloatingSparkles() {
  const sparkles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    size: 6 + Math.random() * 8,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {sparkles.map((s) => (
        <motion.span
          key={s.id}
          className="absolute"
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1.2, 0.5],
            rotate: [0, 180],
            y: [0, -20, -40],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 3 + 2,
          }}
          style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: s.size }}
        >
          ✦
        </motion.span>
      ))}
    </div>
  );
}

// ─── Card Pattern Renderer ─────────────────────────────
function CardPattern({ pattern, accentColor }: { pattern: string; accentColor: string }) {
  const opacified = `${accentColor}22`;

  switch (pattern) {
    case 'circles':
      return (
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20%" cy="30%" r="25" fill={opacified} />
          <circle cx="70%" cy="60%" r="35" fill={opacified} />
          <circle cx="85%" cy="20%" r="18" fill={opacified} />
          <circle cx="40%" cy="80%" r="20" fill={opacified} />
        </svg>
      );
    case 'stripes':
      return (
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={i * 30} y1="0" x2={i * 30 + 60} y2="200" stroke={accentColor} strokeWidth="4" />
          ))}
        </svg>
      );
    case 'dots':
      return (
        <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
          {Array.from({ length: 24 }, (_, i) => (
            <circle key={i} cx={(i % 6) * 45 + 20} cy={Math.floor(i / 6) * 45 + 20} r="4" fill={accentColor} />
          ))}
        </svg>
      );
    case 'waves':
      return (
        <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60 Q 75 20, 150 60 T 300 60" fill="none" stroke={accentColor} strokeWidth="3" />
          <path d="M0 100 Q 75 60, 150 100 T 300 100" fill="none" stroke={accentColor} strokeWidth="3" />
          <path d="M0 140 Q 75 100, 150 140 T 300 140" fill="none" stroke={accentColor} strokeWidth="3" />
        </svg>
      );
    case 'diamonds':
      return (
        <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
          {Array.from({ length: 12 }, (_, i) => (
            <rect
              key={i}
              x={(i % 4) * 70 + 15}
              y={Math.floor(i / 4) * 60 + 15}
              width="20"
              height="20"
              rx="3"
              fill={accentColor}
              transform={`rotate(45 ${(i % 4) * 70 + 25} ${Math.floor(i / 4) * 60 + 25}`}
            />
          ))}
        </svg>
      );
    case 'grid':
      return (
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          {Array.from({ length: 6 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 35 + 10} x2="300" y2={i * 35 + 10} stroke={accentColor} strokeWidth="1" />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`v${i}`} x1={i * 40 + 10} y1="0" x2={i * 40 + 10} y2="200" stroke={accentColor} strokeWidth="1" />
          ))}
        </svg>
      );
    default:
      return null;
  }
}

// ─── QR Code Simulation (CSS Grid Pattern) ──────────────
function QRSimulation() {
  const cells = Array.from({ length: 21 * 21 }, (_, i) => ({
    id: i,
    active: Math.random() > 0.45,
  }));

  // Force finder patterns in corners
  [0, 1, 2, 6, 7, 8, 14, 15, 16, 18, 19, 20].forEach((r) => {
    [0, 1, 2, 6, 7, 8, 18, 19, 20].forEach((c) => {
      const idx = r * 21 + c;
      if (idx < cells.length) {
        if (r >= 0 && r <= 2 && c >= 0 && c <= 2) cells[idx].active = true;
        if (r >= 0 && r <= 2 && c >= 18 && c <= 20) cells[idx].active = true;
        if (r >= 18 && r <= 20 && c >= 0 && c <= 2) cells[idx].active = true;
      }
    });
  });

  return (
    <div
      className="mx-auto rounded-lg overflow-hidden"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(21, 1fr)',
        gap: '1px',
        width: 168,
        height: 168,
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 4,
      }}
    >
      {cells.map((cell) => (
        <motion.div
          key={cell.id}
          className="rounded-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: cell.active ? 1 : 0.08 }}
          transition={{ duration: 0.3, delay: cell.id * 0.002 }}
          style={{
            backgroundColor: cell.active ? '#1a1a2e' : 'rgba(255,255,255,0.3)',
          }}
        />
      ))}
    </div>
  );
}

// ─── Gift Card Flip Preview ────────────────────────────
function GiftCardFlip({
  card,
  selectedValue,
  onClick,
  size = 'normal',
}: {
  card: GiftCardDesign;
  selectedValue: number;
  onClick: () => void;
  size?: 'normal' | 'compact';
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  const cardHeight = size === 'compact' ? 'h-40' : 'h-48';

  return (
    <motion.div
      className={`r51-gift-flip-card cursor-pointer ${cardHeight}`}
      onClick={() => {
        setIsFlipped((f) => !f);
        onClick();
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
    >
      <div
        className="r51-gift-perspective w-full h-full"
        style={{ perspective: 800 }}
      >
        <motion.div
          className="r51-gift-card-inner relative w-full h-full"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring' as const, stiffness: 120, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden p-4 flex flex-col justify-between"
            style={{
              backfaceVisibility: 'hidden',
              background: `linear-gradient(135deg, ${card.gradientFrom}, ${card.gradientTo})`,
              boxShadow: `0 8px 32px ${card.accentColor}33`,
            }}
          >
            <CardPattern pattern={card.pattern} accentColor={card.accentColor} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl">{card.logo}</span>
                <Badge className="bg-white/20 text-white border-0 text-xs">
                  {CATEGORY_LABELS[card.category]}
                </Badge>
              </div>
              <h4 className="text-white font-bold text-lg leading-tight">{card.store}</h4>
              <p className="text-white/70 text-xs italic">{card.tagline}</p>
            </div>
            <div className="relative z-10 flex items-end justify-between">
              <div>
                <p className="text-white/60 text-[10px] uppercase tracking-wider">Valor</p>
                <p className="text-white font-extrabold text-xl">R$ {selectedValue}</p>
              </div>
              <div className="flex items-center gap-1 text-white/50 text-xs">
                <Eye className="w-3 h-3" />
                <span>Vire para ver detalhes</span>
              </div>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden p-4 flex flex-col justify-between"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: `linear-gradient(135deg, ${card.gradientTo}, ${card.gradientFrom})`,
              boxShadow: `0 8px 32px ${card.accentColor}33`,
            }}
          >
            <CardPattern pattern={card.pattern} accentColor={card.accentColor} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{card.logo}</span>
                <span className="text-white font-bold text-sm">{card.store}</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-white/80 text-xs">
                  <Tag className="w-3 h-3" />
                  <span>Valido em todas as lojas</span>
                </div>
                <div className="flex items-center gap-2 text-white/80 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>Validade de 12 meses</span>
                </div>
                <div className="flex items-center gap-2 text-white/80 text-xs">
                  <CreditCard className="w-3 h-3" />
                  <span>Nao acumulativo com promocoes</span>
                </div>
              </div>
            </div>
            <div className="relative z-10">
              <div className="bg-black/20 rounded-lg px-3 py-2 text-center">
                <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Valor selecionado</p>
                <p className="text-white font-extrabold text-2xl">R$ {selectedValue}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Value Selector ─────────────────────────────────────
function ValueSelector({
  values,
  selected,
  onSelect,
}: {
  values: GiftCardValue[];
  selected: number;
  onSelect: (v: number) => void;
}) {
  return (
    <div className="flex gap-2">
      {values.map((v, idx) => (
        <motion.div
          key={v.amount}
          className="r51-gift-value-btn relative flex-1"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring' as const, stiffness: 350, damping: 22 }}
        >
          <Button
            variant={selected === v.amount ? 'default' : 'outline'}
            className={`w-full rounded-xl py-5 flex-col gap-1 relative overflow-hidden ${selected === v.amount ? 'shadow-lg' : ''}`}
            onClick={() => onSelect(v.amount)}
          >
            {v.popular && (
              <motion.div
                className="absolute -top-1 -right-1 z-10"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="text-[10px] bg-gradient-to-r from-amber-400 to-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold leading-none">
                  ★ Popular
                </span>
              </motion.div>
            )}
            <span className={`font-extrabold text-lg ${selected === v.amount ? 'text-white' : ''}`}>
              {v.label}
            </span>
          </Button>
          {selected === v.amount && (
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                boxShadow: '0 0 16px rgba(99, 102, 241, 0.35)',
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Buy / Send Toggle ──────────────────────────────────
function BuyModeToggle({ mode, onToggle }: { mode: BuyMode; onToggle: (m: BuyMode) => void }) {
  return (
    <div className="r51-gift-toggle-track relative flex bg-secondary rounded-xl p-1">
      <motion.div
        className="r51-gift-toggle-indicator absolute top-1 bottom-1 rounded-lg bg-primary"
        animate={{ left: mode === 'self' ? '4px' : '50%', width: 'calc(50% - 4px)' }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
      />
      {[
        { m: 'self' as BuyMode, label: 'Comprar para mim', icon: <ShoppingCart className="w-3.5 h-3.5" /> },
        { m: 'gift' as BuyMode, label: 'Presentear', icon: <Send className="w-3.5 h-3.5" /> },
      ].map(({ m, label, icon }) => (
        <motion.div
          key={m}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg cursor-pointer z-10 text-xs font-semibold transition-colors ${
            mode === m ? 'text-primary-foreground' : 'text-muted-foreground'
          }`}
          onClick={() => onToggle(m)}
          whileTap={{ scale: 0.95 }}
        >
          {icon}
          {label}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Gift Message Input ─────────────────────────────────
function GiftMessageInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const charCount = value.length;
  const isNearLimit = charCount > MAX_GIFT_MESSAGE * 0.8;
  const isOver = charCount > MAX_GIFT_MESSAGE;

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
        <GiftIcon className="w-3.5 h-3.5" />
        Mensagem de presente
      </label>
      <div className="relative">
        <textarea
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          rows={3}
          placeholder="Escreva uma mensagem especial..."
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_GIFT_MESSAGE))}
          maxLength={MAX_GIFT_MESSAGE}
        />
        <motion.div
          className={`absolute bottom-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            isOver
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              : isNearLimit
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-muted text-muted-foreground'
          }`}
          animate={{ scale: isOver ? [1, 1.1, 1] : 1 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
        >
          {charCount}/{MAX_GIFT_MESSAGE}
        </motion.div>
      </div>
    </div>
  );
}

// ─── Recipient Fields with Floating Labels ─────────────
function RecipientFields({
  name,
  email,
  phone,
  onNameChange,
  onEmailChange,
  onPhoneChange,
}: {
  name: string;
  email: string;
  phone: string;
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
}) {
  const FloatingInput = ({
    id,
    label,
    type = 'text',
    value,
    onChange,
  }: {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (v: string) => void;
  }) => {
    const [focused, setFocused] = useState(false);
    const isFloating = focused || value.length > 0;

    return (
      <div className="r51-gift-float-field relative">
        <motion.label
          className="absolute left-3 text-xs pointer-events-none"
          animate={{
            top: isFloating ? 6 : 14,
            fontSize: isFloating ? 9 : 12,
            color: focused ? '#6366f1' : '#a1a1aa',
            opacity: isFloating ? 0.9 : 0.6,
          }}
          transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
          htmlFor={id}
        >
          {label}
        </motion.label>
        <input
          id={id}
          type={type}
          className="w-full rounded-lg border border-border bg-background pt-5 pb-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground">Dados do destinatario</p>
      <FloatingInput id="r51-name" label="Nome completo" value={name} onChange={onNameChange} />
      <FloatingInput id="r51-email" label="Email" type="email" value={email} onChange={onEmailChange} />
      <FloatingInput id="r51-phone" label="WhatsApp (com DDD)" type="tel" value={phone} onChange={onPhoneChange} />
    </div>
  );
}

// ─── Delivery Method Selector ────────────────────────────
function DeliveryMethodSelector({
  method,
  onMethodChange,
}: {
  method: DeliveryMethod;
  onMethodChange: (m: DeliveryMethod) => void;
}) {
  const methods: { key: DeliveryMethod; label: string; icon: React.ReactNode; desc: string }[] = [
    { key: 'email', label: 'Email', icon: <Mail className="w-5 h-5" />, desc: 'Entrega instantanea' },
    { key: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-5 h-5" />, desc: 'Direto no chat' },
    { key: 'print', label: 'Imprimir', icon: <Printer className="w-5 h-5" />, desc: 'PDF para imprimir' },
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground">Forma de entrega</p>
      <div className="grid grid-cols-3 gap-2">
        {methods.map((m) => {
          const isSelected = method === m.key;
          return (
            <motion.div
              key={m.key}
              className={`r51-gift-delivery-option relative rounded-xl p-3 text-center cursor-pointer border-2 transition-colors ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/30'
              }`}
              onClick={() => onMethodChange(m.key)}
              whileTap={{ scale: 0.95 }}
            >
              {isSelected && (
                <motion.div
                  className="absolute -top-1.5 -right-1.5 z-10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                >
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </motion.div>
              )}
              <motion.div
                animate={isSelected ? { y: [0, -3, 0], rotate: [0, -5, 5, 0] } : {}}
                transition={{ duration: 0.5, repeat: isSelected ? Infinity : 0, repeatDelay: 2 }}
                className="mb-1.5 flex justify-center"
              >
                {m.icon}
              </motion.div>
              <p className="text-xs font-semibold">{m.label}</p>
              <p className="text-[10px] text-muted-foreground">{m.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Purchase Confirmation with Animated Receipt ────────
function PurchaseConfirmation({
  receipt,
  onDismiss,
}: {
  receipt: PurchaseReceipt;
  onDismiss: () => void;
}) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="r51-gift-receipt-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ConfettiBurst active={showConfetti} />
      <motion.div
        className="r51-gift-receipt-card bg-card rounded-2xl p-6 max-w-sm w-full mx-4 relative overflow-hidden border border-border shadow-2xl"
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.9 }}
        transition={{ type: 'spring' as const, stiffness: 200, damping: 22 }}
      >
        <FloatingSparkles />

        <motion.div
          className="text-center mb-4 relative z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 mb-3"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Gift className="w-8 h-8 text-white" />
          </motion.div>
          <h3 className="text-lg font-bold">Compra realizada!</h3>
          <p className="text-sm text-muted-foreground">Seu gift card esta pronto</p>
        </motion.div>

        <motion.div
          className="r51-gift-receipt-body bg-muted/50 rounded-xl p-4 space-y-3 relative z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring' as const, stiffness: 180, damping: 20 }}
        >
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <span className="text-xl">{receipt.cardDesign.logo}</span>
            <div>
              <p className="text-sm font-bold">{receipt.cardDesign.store}</p>
              <p className="text-xs text-muted-foreground">Gift Card</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-lg font-extrabold text-primary">R$ {receipt.value}</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data</span>
              <span className="font-medium">{formatDate(receipt.purchasedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entrega</span>
              <span className="font-medium capitalize">{receipt.deliveryMethod === 'email' ? 'Email' : receipt.deliveryMethod === 'whatsapp' ? 'WhatsApp' : 'Impressao'}</span>
            </div>
            {receipt.recipientName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destinatario</span>
                <span className="font-medium">{receipt.recipientName}</span>
              </div>
            )}
            {receipt.giftMessage && (
              <div className="pt-2 border-t border-border">
                <p className="text-muted-foreground italic">"{receipt.giftMessage}"</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          className="mt-4 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button className="w-full" onClick={onDismiss}>
              Continuar
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ─── Balance Tracker ────────────────────────────────────
function BalanceTracker({ ownedCards }: { ownedCards: OwnedCard[] }) {
  const totalBalance = ownedCards.reduce((sum, c) => sum + c.balance, 0);
  const totalValue = ownedCards.reduce((sum, c) => sum + c.value, 0);
  const usedAmount = totalValue - totalBalance;

  return (
    <motion.div
      className="r51-gift-balance-card rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 150, damping: 20 }}
    >
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/5" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-4 h-4 text-white/80" />
          <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">Saldo Total</span>
        </div>

        <div className="flex items-end gap-2 mb-4">
          <span className="text-3xl font-extrabold text-white">
            R$ {totalBalance.toFixed(2).replace('.', ',')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">Cartoes ativos</p>
            <p className="text-white font-bold text-lg">{ownedCards.filter((c) => !c.isRedeemed && c.balance > 0).length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">Ja utilizado</p>
            <p className="text-white font-bold text-lg">R$ {usedAmount.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>

        {ownedCards.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-white/60 mb-1">
              <span>Uso geral</span>
              <span>{totalValue > 0 ? Math.round((usedAmount / totalValue) * 100) : 0}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white/40 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${totalValue > 0 ? (usedAmount / totalValue) * 100 : 0}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Owned Cards Gallery ───────────────────────────────
function OwnedCardsGallery({
  cards,
  onRedeem,
}: {
  cards: OwnedCard[];
  onRedeem: (card: OwnedCard) => void;
}) {
  if (cards.length === 0) {
    return (
      <div className="r51-gift-empty-gallery text-center py-12">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-4xl mb-3"
        >
          🎁
        </motion.div>
        <p className="text-sm font-semibold text-muted-foreground">Nenhum gift card ainda</p>
        <p className="text-xs text-muted-foreground">Compre seu primeiro gift card!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <AnimatePresence mode="popLayout">
        {cards.map((card, idx) => {
          const daysLeft = getDaysUntilExpiry(card.expiresAt);
          const isExpiringSoon = daysLeft <= 30 && daysLeft > 0;
          const isExpired = daysLeft === 0;

          return (
            <motion.div
              key={card.id}
              className="r51-gift-owned-card relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: idx * 0.05, type: 'spring' as const, stiffness: 200, damping: 20 }}
              layout
            >
              <GiftCardFlip
                card={card.cardDesign}
                selectedValue={card.balance}
                onClick={() => {}}
                size="compact"
              />

              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold">R$ {card.balance.toFixed(2).replace('.', ',')}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {isExpired ? 'Expirado' : formatCountdown(daysLeft)}
                  </p>
                </div>
                <div className="flex gap-1">
                  {isExpiringSoon && (
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-[10px] px-1.5">
                      <Clock className="w-2.5 h-2.5 mr-0.5" />
                      Urgente
                    </Badge>
                  )}
                  {card.isRedeemed && (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[10px] px-1.5">
                      <Check className="w-2.5 h-2.5 mr-0.5" />
                      Usado
                    </Badge>
                  )}
                </div>
              </div>

              {!card.isRedeemed && card.balance > 0 && !isExpired && (
                <motion.div className="mt-2" whileTap={{ scale: 0.95 }}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs rounded-lg"
                    onClick={() => onRedeem(card)}
                  >
                    <QrCode className="w-3 h-3 mr-1" />
                    Resgatar
                  </Button>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ─── Redeem Flow with QR Code ──────────────────────────
function RedeemFlow({ card, onClose, onConfirm }: { card: OwnedCard; onClose: () => void; onConfirm: () => void }) {
  return (
    <motion.div
      className="r51-gift-redeem-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="r51-gift-redeem-card bg-card rounded-2xl p-6 max-w-sm w-full mx-4 relative border border-border shadow-2xl"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ type: 'spring' as const, stiffness: 200, damping: 22 }}
      >
        <motion.button
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-muted flex items-center justify-center"
          onClick={onClose}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-4 h-4" />
        </motion.button>

        <div className="text-center mb-5">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xl">{card.cardDesign.logo}</span>
            <h3 className="text-lg font-bold">{card.cardDesign.store}</h3>
          </div>
          <p className="text-sm text-muted-foreground">Saldo: <span className="font-bold text-primary">R$ {card.balance.toFixed(2).replace('.', ',')}</span></p>
        </div>

        <motion.div
          className="mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' as const, stiffness: 150, damping: 18 }}
        >
          <div className="bg-white rounded-xl p-4">
            <QRSimulation />
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">Apresente este QR code na loja</p>
        </motion.div>

        <div className="bg-muted/50 rounded-xl p-3 space-y-2 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Codigo</span>
            <span className="font-mono font-bold">{card.code}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">PIN</span>
            <span className="font-mono font-bold">{card.pin}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Expira em</span>
            <span className="font-bold">{formatDate(card.expiresAt)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <motion.div className="flex-1" whileTap={{ scale: 0.95 }}>
            <Button variant="outline" className="w-full" onClick={onClose}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
          </motion.div>
          <motion.div className="flex-1" whileTap={{ scale: 0.95 }}>
            <Button className="w-full" onClick={onConfirm}>
              <Check className="w-4 h-4 mr-1" />
              Confirmar Uso
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Filter Bar ─────────────────────────────────────────
function FilterBar({
  filters,
  onFiltersChange,
  showFilters,
  onToggleFilters,
}: {
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}) {
  const categories: FilterCategory[] = ['all', 'food', 'fashion', 'tech', 'beauty', 'entertainment', 'home'];
  const ranges: FilterValueRange[] = ['all', 'under50', '50to100', 'over100'];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="r51-gift-search-input pl-9 rounded-xl"
            placeholder="Buscar gift cards..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          />
        </div>
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={onToggleFilters}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={showFilters ? 'up' : 'down'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Filter className="w-4 h-4" />
              </motion.div>
            </AnimatePresence>
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="r51-gift-filters-panel bg-muted/30 rounded-xl p-3 space-y-3"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring' as const, stiffness: 200, damping: 25 }}
            style={{ overflow: 'hidden' }}
          >
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 font-semibold">Categoria</p>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <motion.div key={cat} whileTap={{ scale: 0.9 }}>
                    <Badge
                      variant={filters.category === cat ? 'default' : 'secondary'}
                      className="cursor-pointer text-xs px-2.5 py-1 rounded-lg"
                      onClick={() => onFiltersChange({ ...filters, category: cat })}
                    >
                      {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 font-semibold">Faixa de valor</p>
              <div className="flex flex-wrap gap-1.5">
                {ranges.map((range) => (
                  <motion.div key={range} whileTap={{ scale: 0.9 }}>
                    <Badge
                      variant={filters.valueRange === range ? 'default' : 'secondary'}
                      className="cursor-pointer text-xs px-2.5 py-1 rounded-lg"
                      onClick={() => onFiltersChange({ ...filters, valueRange: range })}
                    >
                      {VALUE_RANGE_LABELS[range]}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────
export function GiftCardMarketplace() {
  // View mode: shop | wallet | redeem
  const [viewMode, setViewMode] = useState<ViewMode>('shop');

  // Shop state
  const [selectedCard, setSelectedCard] = useState<GiftCardDesign | null>(null);
  const [selectedValue, setSelectedValue] = useState<number>(50);
  const [buyMode, setBuyMode] = useState<BuyMode>('self');
  const [giftMessage, setGiftMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('email');

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    valueRange: 'all',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Wallet state
  const [ownedCards, setOwnedCards] = useState<OwnedCard[]>([]);
  const [redeemCard, setRedeemCard] = useState<OwnedCard | null>(null);
  const [receipt, setReceipt] = useState<PurchaseReceipt | null>(null);

  const initializedRef = useRef(false);

  // Load from storage on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setOwnedCards(JSON.parse(stored) as OwnedCard[]);
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist owned cards
  const persistCards = useCallback((cards: OwnedCard[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch {
      // ignore
    }
  }, []);

  // Filter cards
  const filteredCards = GIFT_CARDS.filter((card) => {
    if (filters.category !== 'all' && card.category !== filters.category) return false;
    if (filters.search && !card.store.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Handle purchase
  const handlePurchase = useCallback(() => {
    if (!selectedCard) return;

    const newCard: OwnedCard = {
      id: `owned-${Date.now()}`,
      cardDesign: selectedCard,
      value: selectedValue,
      balance: selectedValue,
      purchasedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      code: generateCode(),
      pin: generatePin(),
      isRedeemed: false,
    };

    const newReceipt: PurchaseReceipt = {
      id: `receipt-${Date.now()}`,
      cardDesign: selectedCard,
      value: selectedValue,
      purchasedAt: new Date().toISOString(),
      deliveryMethod,
      recipientName: buyMode === 'gift' ? recipientName : undefined,
      recipientEmail: buyMode === 'gift' ? recipientEmail : undefined,
      giftMessage: buyMode === 'gift' ? giftMessage : undefined,
    };

    setOwnedCards((prev) => {
      const updated = [newCard, ...prev];
      persistCards(updated);
      return updated;
    });

    setReceipt(newReceipt);
  }, [selectedCard, selectedValue, deliveryMethod, buyMode, recipientName, recipientEmail, giftMessage, persistCards]);

  // Handle redeem
  const handleConfirmRedeem = useCallback(() => {
    if (!redeemCard) return;
    setOwnedCards((prev) => {
      const updated = prev.map((c) =>
        c.id === redeemCard.id
          ? { ...c, isRedeemed: true, balance: 0, redeemedAt: new Date().toISOString() }
          : c
      );
      persistCards(updated);
      return updated;
    });
    setRedeemCard(null);
  }, [redeemCard, persistCards]);

  // Dismiss receipt
  const dismissReceipt = useCallback(() => {
    setReceipt(null);
    setViewMode('wallet');
    // Reset shop form
    setGiftMessage('');
    setRecipientName('');
    setRecipientEmail('');
    setRecipientPhone('');
    setSelectedCard(null);
  }, []);

  // Tab definitions
  const tabs: { key: ViewMode; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'shop', label: 'Loja', icon: <ShoppingCart className="w-3.5 h-3.5" /> },
    {
      key: 'wallet',
      label: 'Carteira',
      icon: <Wallet className="w-3.5 h-3.5" />,
      badge: ownedCards.filter((c) => !c.isRedeemed && c.balance > 0).length,
    },
    { key: 'redeem', label: 'Resgatar', icon: <QrCode className="w-3.5 h-3.5" /> },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { type: 'spring' as const, stiffness: 140, damping: 20 },
  };

  return (
    <section className="r51-gift-container" aria-label="Gift Card Marketplace">
      {/* ── Header ─────────────────────────────── */}
      <motion.div
        className="r51-gift-header flex items-center justify-between"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 150, damping: 20 }}
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            className="r51-gift-logo-icon flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Gift className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h2 className="r51-gift-title text-lg font-bold">Gift Cards</h2>
            <p className="r51-gift-subtitle text-xs text-muted-foreground">Presenteie com estilo</p>
          </div>
        </div>
        <motion.div whileTap={{ scale: 0.9 }}>
          <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 text-xs px-3 py-1">
            <Zap className="w-3 h-3 mr-1" />
            {GIFT_CARDS.length} disponiveis
          </Badge>
        </motion.div>
      </motion.div>

      {/* ── Tab Navigation ──────────────────────── */}
      <motion.div
        className="r51-gift-tabs flex gap-1 bg-secondary rounded-xl p-1 mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring' as const, stiffness: 160, damping: 22 }}
      >
        {tabs.map((tab) => (
          <motion.div
            key={tab.key}
            className={`r51-gift-tab relative flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg cursor-pointer text-xs font-semibold transition-colors ${
              viewMode === tab.key ? 'text-primary-foreground' : 'text-muted-foreground'
            }`}
            onClick={() => setViewMode(tab.key)}
            whileTap={{ scale: 0.95 }}
          >
            {viewMode === tab.key && (
              <motion.div
                className="absolute inset-0 rounded-lg bg-primary"
                layoutId="r51-gift-tab-indicator"
                transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <motion.span
                  className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                >
                  {tab.badge}
                </motion.span>
              )}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Content ─────────────────────────────── */}
      <AnimatePresence mode="wait">
        {/* ── Shop View ─────────────────────────── */}
        {viewMode === 'shop' && (
          <motion.div
            key="shop"
            className="r51-gift-shop-view mt-4 space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring' as const, stiffness: 180, damping: 22 }}
          >
            {/* Filters */}
            <FilterBar
              filters={filters}
              onFiltersChange={setFilters}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters((p) => !p)}
            />

            {/* Value selector */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                Selecione o valor
              </p>
              <ValueSelector values={VALUES} selected={selectedValue} onSelect={setSelectedValue} />
            </div>

            {/* Card grid */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Escolha o Gift Card
                <span className="ml-auto text-[10px] text-muted-foreground font-normal">
                  {filteredCards.length} resultados
                </span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <AnimatePresence mode="popLayout">
                  {filteredCards.map((card, idx) => {
                    const isSelected = selectedCard?.id === card.id;
                    return (
                      <motion.div
                        key={card.id}
                        className="relative"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{
                          delay: idx * 0.06,
                          type: 'spring' as const,
                          stiffness: 200,
                          damping: 22,
                        }}
                        layout
                      >
                        <GiftCardFlip
                          card={card}
                          selectedValue={selectedValue}
                          onClick={() => setSelectedCard(card)}
                          size="normal"
                        />
                        {isSelected && (
                          <motion.div
                            className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                          >
                            <Check className="w-3.5 h-3.5 text-white" />
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Selected card purchase form */}
            <AnimatePresence>
              {selectedCard && (
                <motion.div
                  className="r51-gift-purchase-form bg-card rounded-2xl border border-border p-4 space-y-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring' as const, stiffness: 180, damping: 22 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="flex items-center gap-2 pb-3 border-b border-border">
                    <span className="text-xl">{selectedCard.logo}</span>
                    <div>
                      <p className="text-sm font-bold">{selectedCard.store}</p>
                      <p className="text-xs text-muted-foreground">R$ {selectedValue}</p>
                    </div>
                    <motion.div className="ml-auto" whileTap={{ scale: 0.9 }}>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedCard(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </div>

                  {/* Buy mode toggle */}
                  <BuyModeToggle mode={buyMode} onToggle={setBuyMode} />

                  {/* Gift fields */}
                  <AnimatePresence mode="wait">
                    {buyMode === 'gift' && (
                      <motion.div
                        key="gift-fields"
                        className="space-y-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ type: 'spring' as const, stiffness: 200, damping: 22 }}
                      >
                        <RecipientFields
                          name={recipientName}
                          email={recipientEmail}
                          phone={recipientPhone}
                          onNameChange={setRecipientName}
                          onEmailChange={setRecipientEmail}
                          onPhoneChange={setRecipientPhone}
                        />
                        <GiftMessageInput value={giftMessage} onChange={setGiftMessage} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Delivery method */}
                  {buyMode === 'gift' && (
                    <DeliveryMethodSelector method={deliveryMethod} onMethodChange={setDeliveryMethod} />
                  )}

                  {/* Price summary + Buy button */}
                  <div className="bg-muted/30 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Gift Card {selectedCard.store}</span>
                      <span className="font-bold">R$ {selectedValue.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Taxa de servico</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Gratis</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-sm font-bold">Total</span>
                      <span className="text-lg font-extrabold text-primary">R$ {selectedValue.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>

                  <motion.div whileTap={{ scale: 0.97 }}>
                    <Button
                      className="r51-gift-buy-btn w-full rounded-xl py-5 text-sm font-bold"
                      onClick={handlePurchase}
                      disabled={buyMode === 'gift' && (!recipientName || !recipientEmail)}
                      style={{
                        background: `linear-gradient(135deg, ${selectedCard.gradientFrom}, ${selectedCard.gradientTo})`,
                        boxShadow: `0 4px 20px ${selectedCard.accentColor}44`,
                      }}
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      {buyMode === 'self' ? `Comprar para mim - R$ ${selectedValue}` : `Presentear - R$ ${selectedValue}`}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Wallet View ───────────────────────── */}
        {viewMode === 'wallet' && (
          <motion.div
            key="wallet"
            className="r51-gift-wallet-view mt-4 space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring' as const, stiffness: 180, damping: 22 }}
          >
            {/* Balance tracker */}
            <BalanceTracker ownedCards={ownedCards} />

            {/* Expiring soon alert */}
            {ownedCards.some((c) => {
              const days = getDaysUntilExpiry(c.expiresAt);
              return days <= 30 && days > 0 && !c.isRedeemed;
            }) && (
              <motion.div
                className="r51-gift-expiry-alert bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3 flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...fadeInUp.transition, delay: 0.2 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                >
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </motion.div>
                <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                  Voce tem cartoes que expiram em breve!
                </span>
              </motion.div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: 'Total investido',
                  value: `R$ ${ownedCards.reduce((s, c) => s + c.value, 0).toFixed(2).replace('.', ',')}`,
                  icon: <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />,
                },
                {
                  label: 'Disponivel',
                  value: `R$ ${ownedCards.reduce((s, c) => s + c.balance, 0).toFixed(2).replace('.', ',')}`,
                  icon: <Wallet className="w-3.5 h-3.5 text-emerald-500" />,
                },
                {
                  label: 'Resgatados',
                  value: `${ownedCards.filter((c) => c.isRedeemed).length}`,
                  icon: <Check className="w-3.5 h-3.5 text-purple-500" />,
                },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  className="r51-gift-stat-card bg-card rounded-xl p-3 text-center border border-border/50"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.3 + idx * 0.08,
                    type: 'spring' as const,
                    stiffness: 200,
                    damping: 20,
                  }}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">{stat.icon}</div>
                  <p className="text-sm font-bold">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Owned cards gallery */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" />
                Meus Gift Cards
              </p>
              <OwnedCardsGallery cards={ownedCards} onRedeem={setRedeemCard} />
            </div>
          </motion.div>
        )}

        {/* ── Redeem View ─────────────────────────── */}
        {viewMode === 'redeem' && (
          <motion.div
            key="redeem"
            className="r51-gift-redeem-view mt-4 space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring' as const, stiffness: 180, damping: 22 }}
          >
            <div className="text-center py-4">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="text-5xl mb-3"
              >
                <QrCode className="w-12 h-12 mx-auto text-indigo-500" />
              </motion.div>
              <h3 className="text-lg font-bold">Resgatar Gift Card</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Selecione um cartao na carteira para resgatar
              </p>
            </div>

            {ownedCards.filter((c) => !c.isRedeemed && c.balance > 0).length === 0 ? (
              <div className="text-center py-8">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl mb-3"
                >
                  🎫
                </motion.div>
                <p className="text-sm font-semibold text-muted-foreground">Nenhum cartao para resgatar</p>
                <motion.div className="mt-3" whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" onClick={() => setViewMode('shop')}>
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Comprar Gift Cards
                  </Button>
                </motion.div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {ownedCards
                  .filter((c) => !c.isRedeemed && c.balance > 0)
                  .map((card, idx) => {
                    const daysLeft = getDaysUntilExpiry(card.expiresAt);
                    return (
                      <motion.div
                        key={card.id}
                        className="r51-gift-redeem-item bg-card rounded-xl border border-border overflow-hidden"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: idx * 0.06,
                          type: 'spring' as const,
                          stiffness: 200,
                          damping: 22,
                        }}
                      >
                        <div
                          className="p-3 flex items-center gap-2"
                          style={{
                            background: `linear-gradient(135deg, ${card.cardDesign.gradientFrom}, ${card.cardDesign.gradientTo})`,
                          }}
                        >
                          <span className="text-xl">{card.cardDesign.logo}</span>
                          <span className="text-white text-sm font-bold">{card.cardDesign.store}</span>
                        </div>
                        <div className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Saldo</span>
                            <span className="text-sm font-bold text-primary">
                              R$ {card.balance.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Expira</span>
                            <span className={`text-xs font-medium ${daysLeft <= 30 ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                              {formatCountdown(daysLeft)}
                            </span>
                          </div>
                          <motion.div whileTap={{ scale: 0.95 }}>
                            <Button size="sm" className="w-full text-xs rounded-lg" onClick={() => setRedeemCard(card)}>
                              <QrCode className="w-3 h-3 mr-1" />
                              Gerar QR Code
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Purchase Confirmation Modal ─────────── */}
      <AnimatePresence>
        {receipt && (
          <PurchaseConfirmation receipt={receipt} onDismiss={dismissReceipt} />
        )}
      </AnimatePresence>

      {/* ── Redeem Flow Modal ───────────────────── */}
      <AnimatePresence>
        {redeemCard && (
          <RedeemFlow
            card={redeemCard}
            onClose={() => setRedeemCard(null)}
            onConfirm={handleConfirmRedeem}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
