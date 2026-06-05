'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  Shield,
  ShieldCheck,
  TrendingDown,
  ArrowDownRight,
  DollarSign,
  BarChart3,
  CheckCircle2,
  Clock,
  XCircle,
  Camera,
  ScanLine,
  Filter,
  SortAsc,
  SortDesc,
  Tag,
  AlertTriangle,
  Sparkles,
  History,
  ChevronDown,
  Upload,
  ExternalLink,
  Percent,
  Calculator,
  Trophy,
  Zap,
  Search,
  Store,
  CalendarDays,
  RefreshCw,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────
interface PriceComparison {
  id: string;
  productName: string;
  category: string;
  image: string;
  prices: StorePrice[];
  bestStore: string;
  bestPrice: number;
  priceHistory: number[];
  lastUpdated: string;
}

interface StorePrice {
  storeName: string;
  price: number;
  url: string;
  inStock: boolean;
}

interface PriceMatchClaim {
  id: string;
  productName: string;
  competitorStore: string;
  competitorPrice: number;
  ourPrice: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  resolvedDate?: string;
  savingsAmount: number;
}

interface PriceDropAlert {
  id: string;
  productName: string;
  previousPrice: number;
  currentPrice: number;
  dropPercent: number;
  storeName: string;
  date: string;
  category: string;
}

interface AutoRefundItem {
  id: string;
  productName: string;
  purchasePrice: number;
  currentPrice: number;
  potentialRefund: number;
  purchaseDate: string;
  priceDropDate: string;
  storeName: string;
  claimed: boolean;
  category: string;
}

interface SavingsDashboard {
  totalSaved: number;
  monthlySavings: number[];
  totalClaims: number;
  approvedClaims: number;
  pendingClaims: number;
  averageSavingsPercent: number;
}

interface PolicySection {
  id: string;
  title: string;
  content: string;
  icon: string;
}

type SortOption = 'biggest_savings' | 'newest' | 'status';
type FilterCategory = 'all' | 'groceries' | 'electronics' | 'beauty' | 'pharmacy' | 'home';
type DateRange = '7d' | '30d' | '90d' | 'all';

// ─── Mock Data ─────────────────────────────────────────
const STORE_NAMES = [
  'DomPlace',
  'SuperMercado Extra',
  'Carrefour',
  'Pao de Acucar',
  'Assai Atacadista',
];

const MOCK_COMPARISONS: PriceComparison[] = [
  {
    id: 'pc1',
    productName: 'Azeite de Oliva Extra Virgem 500ml',
    category: 'groceries',
    image: '🫒',
    prices: [
      { storeName: 'DomPlace', price: 29.90, url: '#', inStock: true },
      { storeName: 'SuperMercado Extra', price: 34.50, url: '#', inStock: true },
      { storeName: 'Carrefour', price: 32.90, url: '#', inStock: true },
      { storeName: 'Pao de Acucar', price: 36.80, url: '#', inStock: false },
      { storeName: 'Assai Atacadista', price: 27.90, url: '#', inStock: true },
    ],
    bestStore: 'Assai Atacadista',
    bestPrice: 27.90,
    priceHistory: [35.0, 33.5, 31.9, 30.2, 29.9, 28.5, 27.9],
    lastUpdated: '2025-01-15',
  },
  {
    id: 'pc2',
    productName: 'Headphone Bluetooth JBL Tune 520BT',
    category: 'electronics',
    image: '🎧',
    prices: [
      { storeName: 'DomPlace', price: 199.90, url: '#', inStock: true },
      { storeName: 'SuperMercado Extra', price: 229.00, url: '#', inStock: true },
      { storeName: 'Carrefour', price: 215.90, url: '#', inStock: true },
      { storeName: 'Pao de Acucar', price: 249.90, url: '#', inStock: true },
      { storeName: 'Assai Atacadista', price: 189.90, url: '#', inStock: true },
    ],
    bestStore: 'Assai Atacadista',
    bestPrice: 189.90,
    priceHistory: [280, 265, 250, 235, 220, 210, 199],
    lastUpdated: '2025-01-14',
  },
  {
    id: 'pc3',
    productName: 'Creme Hidratante Nivea Soft 200ml',
    category: 'beauty',
    image: '🧴',
    prices: [
      { storeName: 'DomPlace', price: 24.90, url: '#', inStock: true },
      { storeName: 'SuperMercado Extra', price: 28.50, url: '#', inStock: true },
      { storeName: 'Carrefour', price: 26.90, url: '#', inStock: true },
      { storeName: 'Pao de Acucar', price: 29.90, url: '#', inStock: true },
      { storeName: 'Assai Atacadista', price: 22.90, url: '#', inStock: true },
    ],
    bestStore: 'Assai Atacadista',
    bestPrice: 22.90,
    priceHistory: [32.0, 30.5, 28.9, 27.5, 26.0, 25.5, 24.9],
    lastUpdated: '2025-01-13',
  },
  {
    id: 'pc4',
    productName: 'Dorflex 20 Comprimidos',
    category: 'pharmacy',
    image: '💊',
    prices: [
      { storeName: 'DomPlace', price: 18.90, url: '#', inStock: true },
      { storeName: 'SuperMercado Extra', price: 21.50, url: '#', inStock: true },
      { storeName: 'Carrefour', price: 19.90, url: '#', inStock: true },
      { storeName: 'Pao de Acucar', price: 22.90, url: '#', inStock: true },
      { storeName: 'Assai Atacadista', price: 17.50, url: '#', inStock: false },
    ],
    bestStore: 'DomPlace',
    bestPrice: 18.90,
    priceHistory: [24.0, 23.0, 22.0, 21.5, 20.0, 19.5, 18.9],
    lastUpdated: '2025-01-12',
  },
  {
    id: 'pc5',
    productName: 'Detergente Ype 500ml',
    category: 'home',
    image: '🧹',
    prices: [
      { storeName: 'DomPlace', price: 2.49, url: '#', inStock: true },
      { storeName: 'SuperMercado Extra', price: 3.29, url: '#', inStock: true },
      { storeName: 'Carrefour', price: 2.99, url: '#', inStock: true },
      { storeName: 'Pao de Acucar', price: 3.49, url: '#', inStock: true },
      { storeName: 'Assai Atacadista', price: 2.19, url: '#', inStock: true },
    ],
    bestStore: 'Assai Atacadista',
    bestPrice: 2.19,
    priceHistory: [3.8, 3.5, 3.2, 3.0, 2.8, 2.6, 2.49],
    lastUpdated: '2025-01-11',
  },
];

const MOCK_CLAIMS: PriceMatchClaim[] = [
  {
    id: 'cl1',
    productName: 'Azeite Gallo 750ml',
    competitorStore: 'Carrefour',
    competitorPrice: 24.90,
    ourPrice: 28.90,
    status: 'approved',
    submittedDate: '2025-01-10',
    resolvedDate: '2025-01-11',
    savingsAmount: 4.00,
  },
  {
    id: 'cl2',
    productName: 'Sabao em Po Omo 1.6kg',
    competitorStore: 'Assai Atacadista',
    competitorPrice: 18.50,
    ourPrice: 22.90,
    status: 'pending',
    submittedDate: '2025-01-14',
    savingsAmount: 4.40,
  },
  {
    id: 'cl3',
    productName: 'Cafe Pilao 500g',
    competitorStore: 'SuperMercado Extra',
    competitorPrice: 16.00,
    ourPrice: 19.90,
    status: 'approved',
    submittedDate: '2025-01-08',
    resolvedDate: '2025-01-09',
    savingsAmount: 3.90,
  },
  {
    id: 'cl4',
    productName: 'Arroz Tio Joao 5kg',
    competitorStore: 'Pao de Acucar',
    competitorPrice: 22.00,
    ourPrice: 24.90,
    status: 'rejected',
    submittedDate: '2025-01-06',
    resolvedDate: '2025-01-07',
    savingsAmount: 2.90,
  },
  {
    id: 'cl5',
    productName: 'Aucar Uniao 1kg',
    competitorStore: 'Assai Atacadista',
    competitorPrice: 4.20,
    ourPrice: 5.49,
    status: 'pending',
    submittedDate: '2025-01-15',
    savingsAmount: 1.29,
  },
];

const MOCK_DROPS: PriceDropAlert[] = [
  {
    id: 'pd1',
    productName: 'TV Samsung 43" Smart',
    previousPrice: 1899.00,
    currentPrice: 1599.00,
    dropPercent: 15.8,
    storeName: 'DomPlace',
    date: '2025-01-15',
    category: 'electronics',
  },
  {
    id: 'pd2',
    productName: 'Leite Integral Parmalat 1L',
    previousPrice: 6.49,
    currentPrice: 5.29,
    dropPercent: 18.5,
    storeName: 'SuperMercado Extra',
    date: '2025-01-14',
    category: 'groceries',
  },
  {
    id: 'pd3',
    productName: 'Protetor Solar Nivea Sun FPS50',
    previousPrice: 59.90,
    currentPrice: 44.90,
    dropPercent: 25.0,
    storeName: 'DomPlace',
    date: '2025-01-13',
    category: 'beauty',
  },
  {
    id: 'pd4',
    productName: 'Desodorante Rexona Aerosol',
    previousPrice: 18.90,
    currentPrice: 15.90,
    dropPercent: 15.9,
    storeName: 'Carrefour',
    date: '2025-01-12',
    category: 'beauty',
  },
  {
    id: 'pd5',
    productName: 'Cerveja Heineken Lata 350ml 6pk',
    previousPrice: 32.90,
    currentPrice: 27.90,
    dropPercent: 15.2,
    storeName: 'Assai Atacadista',
    date: '2025-01-11',
    category: 'groceries',
  },
  {
    id: 'pd6',
    productName: 'Dipirona 500mg 30cp',
    previousPrice: 12.90,
    currentPrice: 9.90,
    dropPercent: 23.3,
    storeName: 'DomPlace',
    date: '2025-01-10',
    category: 'pharmacy',
  },
];

const MOCK_REFUNDS: AutoRefundItem[] = [
  {
    id: 'rf1',
    productName: 'Notebook Dell Inspiron 15',
    purchasePrice: 3299.00,
    currentPrice: 2899.00,
    potentialRefund: 400.00,
    purchaseDate: '2024-12-20',
    priceDropDate: '2025-01-10',
    storeName: 'DomPlace',
    claimed: false,
    category: 'electronics',
  },
  {
    id: 'rf2',
    productName: 'Maquina de Lavar Brastemp 12kg',
    purchasePrice: 2499.00,
    currentPrice: 2199.00,
    potentialRefund: 300.00,
    purchaseDate: '2024-12-15',
    priceDropDate: '2025-01-08',
    storeName: 'DomPlace',
    claimed: false,
    category: 'home',
  },
  {
    id: 'rf3',
    productName: 'Smartphone Motorola G84',
    purchasePrice: 1499.00,
    currentPrice: 1299.00,
    potentialRefund: 200.00,
    purchaseDate: '2024-12-25',
    priceDropDate: '2025-01-12',
    storeName: 'DomPlace',
    claimed: true,
    category: 'electronics',
  },
  {
    id: 'rf4',
    productName: 'Perfume Channel N5 100ml',
    purchasePrice: 899.00,
    currentPrice: 749.00,
    potentialRefund: 150.00,
    purchaseDate: '2024-12-10',
    priceDropDate: '2025-01-05',
    storeName: 'DomPlace',
    claimed: false,
    category: 'beauty',
  },
];

const MOCK_DASHBOARD: SavingsDashboard = {
  totalSaved: 847.30,
  monthlySavings: [120.5, 98.0, 145.8, 110.2, 165.4, 207.4],
  totalClaims: 24,
  approvedClaims: 19,
  pendingClaims: 3,
  averageSavingsPercent: 12.5,
};

const POLICY_SECTIONS: PolicySection[] = [
  {
    id: 'eligibility',
    title: 'Elegibilidade para Price Match',
    content:
      'Todos os produtos comprados no DomPlace nos ultimos 30 dias sao elegiveis para price match. O produto deve ser identico (mesma marca, modelo e tamanho) e estar em estoque no concorrente localizado na mesma cidade.',
    icon: '✅',
  },
  {
    id: 'how-to-claim',
    title: 'Como Solicitar',
    content:
      '1. Encontre o mesmo produto mais barato em uma loja concorrente. 2. Tire um print da oferta atual com data visivel. 3. Preencha o formulario de reclamacao com os detalhes. 4. Nossa equipe analisara em ate 24 horas. 5. Se aprovado, voce recebera o reembolso via credito na conta DomPlace.',
    icon: '📋',
  },
  {
    id: 'exclusions',
    title: 'Exclusoes',
    content:
      'Nao aplicavel a: produtos em promocao de liquidacao, cupons de desconto de terceiros, mercado paralelo, lojas online sem CNPJ verificado, produtos usados ou recondicionados, e precos de membership exclusivos (ex: Amazon Prime).',
    icon: '🚫',
  },
  {
    id: 'auto-refund',
    title: 'Reembolso Automatico',
    content:
      'Se voce comprou um produto no DomPlace e o preco caiu dentro de 7 dias apos a compra, voce pode solicitar um reembolso automatico da diferenca. O credito sera aplicado na sua carteira DomPlace em ate 48 horas.',
    icon: '🔄',
  },
  {
    id: 'limits',
    title: 'Limites e Restricoes',
    content:
      'Maximo de 3 solicitacoes de price match por semana. Valor maximo de reembolso por item: R$ 500,00. Reembolso automatico valido apenas para compras feitas nos ultimos 7 dias. Ofertas de concorrentes devem ter validade de pelo menos 24 horas.',
    icon: '📊',
  },
];

// ─── Animated Shield Badge ─────────────────────────────
function AnimatedShieldBadge() {
  return (
    <motion.div
      className="r55-shield-container"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring' as const,
        stiffness: 200,
        damping: 15,
        delay: 0.1,
      }}
      style={{ transformOrigin: 'center center' }}
    >
      <motion.div
        className="r55-shield-inner"
        animate={{ rotate: [0, 3, -3, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: 'center bottom' }}
      >
        <div className="r55-shield-icon-wrap">
          <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
          <motion.div
            className="r55-shield-glow"
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.15, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: 'center center' }}
          />
        </div>
      </motion.div>
      <motion.p
        className="r55-shield-label"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        Garantia Ativa
      </motion.p>
    </motion.div>
  );
}

// ─── Shimmer Banner ────────────────────────────────────
function BestPriceBanner() {
  return (
    <motion.div
      className="r55-banner-container"
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring' as const,
        stiffness: 150,
        damping: 20,
      }}
    >
      <div className="r55-banner-shimmer" />
      <div className="r55-banner-content">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h3 className="r55-banner-title">Melhor Preco Garantido</h3>
        </div>
        <p className="r55-banner-subtitle">
          Encontrou mais barato? Nós devolvemos a diferença + 5% extra
        </p>
      </div>
    </motion.div>
  );
}

// ─── Sparkline Chart ───────────────────────────────────
function SparklineChart({ data, color }: { data: number[]; color: string }) {
  const svgWidth = 100;
  const svgHeight = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * svgWidth;
    const y = svgHeight - ((val - min) / range) * svgHeight;
    return `${x},${y}`;
  }).join(' ');

  const fillPoints = `0,${svgHeight} ${points} ${svgWidth},${svgHeight}`;

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="r55-sparkline-svg"
    >
      <polygon points={fillPoints} fill={color} opacity="0.15" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Monthly Bar Chart ─────────────────────────────────
function MonthlyBarChart({ data }: { data: number[] }) {
  const months = ['Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan'];
  const maxVal = Math.max(...data, 1);

  return (
    <div className="r55-bar-chart-container">
      <div className="flex items-end justify-between gap-2" style={{ height: 100 }}>
        {data.map((val, i) => {
          const height = (val / maxVal) * 100;
          return (
            <div key={months[i]} className="flex flex-col items-center gap-1 flex-1">
              <motion.div
                className="r55-bar-fill"
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{
                  duration: 0.7,
                  delay: 0.5 + i * 0.1,
                  type: 'spring' as const,
                  stiffness: 120,
                  damping: 15,
                }}
                title={`R$ ${val.toFixed(2)}`}
              />
              <span className="r55-bar-label">{months[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Barcode Scanner Placeholder ───────────────────────
function BarcodeScanner() {
  const [isScanning, setIsScanning] = useState(false);

  return (
    <motion.div
      className="r55-scanner-container"
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
    >
      <div className="r55-scanner-viewport">
        <div className="r55-scanner-corner r55-scanner-corner-tl" />
        <div className="r55-scanner-corner r55-scanner-corner-tr" />
        <div className="r55-scanner-corner r55-scanner-corner-bl" />
        <div className="r55-scanner-corner r55-scanner-corner-br" />
        {isScanning && (
          <motion.div
            className="r55-scan-line"
            initial={{ top: '5%' }}
            animate={{ top: '90%' }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        )}
        {!isScanning && (
          <div className="r55-scanner-placeholder">
            <Camera className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground/50 mt-2">Escaneie o codigo de barras</p>
          </div>
        )}
      </div>
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <Button
          variant="outline"
          size="sm"
          className="r55-scan-btn mt-3"
          onClick={() => setIsScanning(!isScanning)}
        >
          <ScanLine className="w-4 h-4 mr-2" />
          {isScanning ? 'Parar Escaneamento' : 'Escanear Produto'}
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ─── Animated Status Badge ─────────────────────────────
function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const config = {
    pending: { label: 'Pendente', icon: Clock, bgClass: 'r55-status-pending', animColor: '#f59e0b' },
    approved: { label: 'Aprovado', icon: CheckCircle2, bgClass: 'r55-status-approved', animColor: '#22c55e' },
    rejected: { label: 'Rejeitado', icon: XCircle, bgClass: 'r55-status-rejected', animColor: '#ef4444' },
  };

  const cfg = config[status];
  const Icon = cfg.icon;

  return (
    <motion.div
      className={`r55-status-badge ${cfg.bgClass}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring' as const,
        stiffness: 180,
        damping: 15,
      }}
      style={{ transformOrigin: 'center center' }}
    >
      <Icon className="w-3.5 h-3.5" style={{ color: cfg.animColor }} />
      <span style={{ color: cfg.animColor }}>{cfg.label}</span>
    </motion.div>
  );
}

// ─── Green Drop Badge ──────────────────────────────────
function DropBadge({ percent }: { percent: number }) {
  return (
    <motion.div
      className="r55-drop-badge"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: 'spring' as const,
        stiffness: 200,
        damping: 18,
      }}
      style={{ transformOrigin: 'center center' }}
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: 'center center' }}
      >
        <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
      </motion.div>
      <span className="r55-drop-percent">-{percent.toFixed(1)}%</span>
    </motion.div>
  );
}

// ─── Animated Counter ──────────────────────────────────
function AnimatedValue({ target, prefix = 'R$ ' }: { target: number; prefix?: string }) {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);

  useEffect(() => {
    startRef.current = Date.now();
    const dur = 1000;

    const step = () => {
      const elapsed = Date.now() - startRef.current;
      const p = Math.min(elapsed / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(eased * target);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target]);

  return <span>{prefix}{val.toFixed(2).replace('.', ',')}</span>;
}

// ─── Comparison Row ────────────────────────────────────
function ComparisonRow({ item, index }: { item: PriceComparison; index: number }) {
  const domPrice = item.prices.find(p => p.storeName === 'DomPlace')?.price ?? item.bestPrice;
  const sortedPrices = [...item.prices].sort((a, b) => a.price - b.price);

  return (
    <motion.div
      className="r55-comparison-card glass-card"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring' as const,
        stiffness: 120,
        damping: 20,
        delay: 0.2 + index * 0.06,
      }}
    >
      <div className="r55-comparison-header">
        <div className="flex items-center gap-3">
          <span className="r55-product-emoji">{item.image}</span>
          <div>
            <h4 className="r55-product-name">{item.productName}</h4>
            <Badge variant="secondary" className="r55-category-badge text-[10px]">
              {item.category}
            </Badge>
          </div>
        </div>
        <div className="r55-sparkline-wrap">
          <SparklineChart data={item.priceHistory} color="#10b981" />
        </div>
      </div>

      <div className="r55-prices-grid">
        {sortedPrices.map((sp) => {
          const isBest = sp.storeName === item.bestStore;
          const isDomPlace = sp.storeName === 'DomPlace';
          return (
            <motion.div
              key={sp.storeName}
              className={`r55-price-cell ${isBest ? 'r55-price-cell-best' : ''} ${isDomPlace ? 'r55-price-cell-dom' : ''} ${!sp.inStock ? 'r55-price-cell-oos' : ''}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'spring' as const,
                stiffness: 150,
                damping: 18,
                delay: 0.3 + index * 0.04,
              }}
              style={{ transformOrigin: 'center center' }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {isBest && <Trophy className="w-3 h-3 text-amber-500" />}
                {isDomPlace && <Store className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                <span className="r55-store-name">{sp.storeName}</span>
              </div>
              <span className={`r55-price-value ${isBest ? 'r55-price-best' : ''}`}>
                R$ {sp.price.toFixed(2).replace('.', ',')}
              </span>
              {!sp.inStock && (
                <span className="r55-oos-label">Esgotado</span>
              )}
              {isDomPlace && (
                <div className="r55-dom-badge-wrap">
                  <Badge className="r55-dom-badge text-[9px]">
                    <Shield className="w-2.5 h-2.5 mr-0.5" />
                    DomPlace
                  </Badge>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Claim Form Modal ──────────────────────────────────
function ClaimPriceMatchModal() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    competitorStore: '',
    competitorPrice: '',
    competitorUrl: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback(() => {
    if (!formData.productName || !formData.competitorPrice) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ productName: '', competitorStore: '', competitorPrice: '', competitorUrl: '', notes: '' });
      setOpen(false);
    }, 2000);
  }, [formData]);

  const updateField = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="r55-claim-trigger-btn" size="lg">
            <Shield className="w-5 h-5 mr-2" />
            Solicitar Price Match
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="r55-modal-content sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Solicitar Price Match
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes do produto encontrado mais barato
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <motion.div
            className="r55-submit-success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'spring' as const,
              stiffness: 180,
              damping: 15,
            }}
            style={{ transformOrigin: 'center center' }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: 2 }}
              style={{ transformOrigin: 'center center' }}
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            </motion.div>
            <p className="text-lg font-semibold text-center">Solicitacao Enviada!</p>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Voce recebera uma resposta em ate 24 horas
            </p>
          </motion.div>
        ) : (
          <div className="r55-form-fields space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Nome do Produto *</Label>
              <Input
                placeholder="Ex: Azeite Gallo 750ml"
                value={formData.productName}
                onChange={e => updateField('productName', e.target.value)}
                className="r55-form-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Loja Concorrente *</Label>
              <Input
                placeholder="Ex: Carrefour"
                value={formData.competitorStore}
                onChange={e => updateField('competitorStore', e.target.value)}
                className="r55-form-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preco do Concorrente (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ex: 24.90"
                value={formData.competitorPrice}
                onChange={e => updateField('competitorPrice', e.target.value)}
                className="r55-form-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">URL da Oferta</Label>
              <Input
                placeholder="https://..."
                value={formData.competitorUrl}
                onChange={e => updateField('competitorUrl', e.target.value)}
                className="r55-form-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Observacoes</Label>
              <Textarea
                placeholder="Detalhes adicionais..."
                value={formData.notes}
                onChange={e => updateField('notes', e.target.value)}
                className="r55-form-textarea"
                rows={3}
              />
            </div>

            {/* Screenshot Upload Placeholder */}
            <div className="r55-upload-zone">
              <Upload className="w-6 h-6 text-muted-foreground/50 mx-auto" />
              <p className="text-xs text-muted-foreground/60 mt-1">
                Clique ou arraste para enviar print da oferta
              </p>
              <p className="text-[10px] text-muted-foreground/40 mt-0.5">
                PNG, JPG ate 5MB
              </p>
            </div>
          </div>
        )}

        {!submitted && (
          <DialogFooter>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="r55-cancel-btn"
              >
                Cancelar
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="r55-submit-btn"
                onClick={handleSubmit}
                disabled={!formData.productName || !formData.competitorPrice}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Enviar Solicitacao
              </Button>
            </motion.div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Policy Accordion ───────────────────────────────────
function PolicyAccordion() {
  return (
    <motion.div
      className="r55-policy-card glass-card"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring' as const,
        stiffness: 120,
        damping: 20,
        delay: 0.6,
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <h3 className="r55-section-title">Politica de Price Match</h3>
      </div>
      <Accordion type="single" collapsible className="r55-accordion">
        {POLICY_SECTIONS.map((section) => (
          <AccordionItem key={section.id} value={section.id} className="r55-accordion-item">
            <AccordionTrigger className="r55-accordion-trigger">
              <div className="flex items-center gap-2">
                <span>{section.icon}</span>
                <span className="text-sm font-medium">{section.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="r55-accordion-content">
              <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  );
}

// ─── Filter Controls ───────────────────────────────────
function FilterControls({
  category,
  setCategory,
  dateRange,
  setDateRange,
  sortBy,
  setSortBy,
}: {
  category: FilterCategory;
  setCategory: (c: FilterCategory) => void;
  dateRange: DateRange;
  setDateRange: (d: DateRange) => void;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
}) {
  const categories: { value: FilterCategory; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'groceries', label: 'Mercado' },
    { value: 'electronics', label: 'Eletronicos' },
    { value: 'beauty', label: 'Beleza' },
    { value: 'pharmacy', label: 'Farmacia' },
    { value: 'home', label: 'Casa' },
  ];

  const dateRanges: { value: DateRange; label: string }[] = [
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' },
    { value: '90d', label: '90 dias' },
    { value: 'all', label: 'Todos' },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'biggest_savings', label: 'Maior Economia' },
    { value: 'newest', label: 'Mais Recente' },
    { value: 'status', label: 'Status' },
  ];

  return (
    <motion.div
      className="r55-filter-controls glass-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring' as const,
        stiffness: 140,
        damping: 20,
        delay: 0.15,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filtros e Ordenacao</span>
      </div>

      {/* Category filter */}
      <div className="mb-3">
        <Label className="text-xs text-muted-foreground mb-1.5 block">
          <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Categoria</span>
        </Label>
        <div className="r55-filter-chips">
          {categories.map((cat) => (
            <motion.div
              key={cat.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                className={`r55-filter-chip ${category === cat.value ? 'r55-filter-chip-active' : ''}`}
                onClick={() => setCategory(cat.value)}
              >
                {cat.label}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Date range */}
      <div className="mb-3">
        <Label className="text-xs text-muted-foreground mb-1.5 block">
          <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Periodo</span>
        </Label>
        <div className="r55-filter-chips">
          {dateRanges.map((dr) => (
            <motion.div
              key={dr.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                className={`r55-filter-chip ${dateRange === dr.value ? 'r55-filter-chip-active' : ''}`}
                onClick={() => setDateRange(dr.value)}
              >
                {dr.label}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">
          <span className="flex items-center gap-1">
            {sortBy === 'biggest_savings' ? <SortDesc className="w-3 h-3" /> : sortBy === 'newest' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />}
            Ordenar por
          </span>
        </Label>
        <div className="r55-filter-chips">
          {sortOptions.map((opt) => (
            <motion.div
              key={opt.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                className={`r55-filter-chip ${sortBy === opt.value ? 'r55-filter-chip-active' : ''}`}
                onClick={() => setSortBy(opt.value)}
              >
                {opt.label}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────
export function PriceMatchGuarantee() {
  const [category, setCategory] = useState<FilterCategory>('all');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [sortBy, setSortBy] = useState<SortOption>('biggest_savings');
  const [activeTab, setActiveTab] = useState<'compare' | 'claims' | 'drops' | 'refunds' | 'dashboard' | 'policy'>('compare');

  // Filter and sort logic for claims
  const filteredClaims = useMemo(() => {
    let result = [...MOCK_CLAIMS];

    // Sort
    switch (sortBy) {
      case 'biggest_savings':
        result.sort((a, b) => b.savingsAmount - a.savingsAmount);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
        break;
      case 'status':
        const statusOrder = { pending: 0, approved: 1, rejected: 2 };
        result.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        break;
    }

    return result;
  }, [sortBy]);

  // Filter comparisons by category
  const filteredComparisons = useMemo(() => {
    if (category === 'all') return MOCK_COMPARISONS;
    return MOCK_COMPARISONS.filter(pc => pc.category === category);
  }, [category]);

  // Filter drops by category and date
  const filteredDrops = useMemo(() => {
    let result = [...MOCK_DROPS];
    if (category !== 'all') result = result.filter(d => d.category === category);

    const now = new Date('2025-01-15');
    if (dateRange !== 'all') {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      result = result.filter(d => new Date(d.date) >= cutoff);
    }

    // Sort
    switch (sortBy) {
      case 'biggest_savings':
        result.sort((a, b) => b.dropPercent - a.dropPercent);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'status':
        result.sort((a, b) => b.dropPercent - a.dropPercent);
        break;
    }

    return result;
  }, [category, dateRange, sortBy]);

  // Filter refunds
  const filteredRefunds = useMemo(() => {
    let result = [...MOCK_REFUNDS];
    if (category !== 'all') result = result.filter(r => r.category === category);
    return result;
  }, [category]);

  const tabs = [
    { id: 'compare' as const, label: 'Comparar Precos', icon: BarChart3 },
    { id: 'claims' as const, label: 'Minhas Reclamacoes', icon: Shield },
    { id: 'drops' as const, label: 'Quedas de Preco', icon: TrendingDown },
    { id: 'refunds' as const, label: 'Auto-Reembolso', icon: RefreshCw },
    { id: 'dashboard' as const, label: 'Painel Economia', icon: Calculator },
    { id: 'policy' as const, label: 'Politicas', icon: AlertTriangle },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { type: 'spring' as const, stiffness: 120, damping: 20 },
  };

  return (
    <section className="r55-price-match-container r62-card-lift" aria-label="Price Match Guarantee">
      {/* ── Header ─────────────────────────────── */}
      <motion.div
        className="r55-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring' as const,
          stiffness: 150,
          damping: 20,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AnimatedShieldBadge />
            <div>
              <h2 className="r55-title r62-heading-gradient">Price Match Guarantee</h2>
              <p className="r55-subtitle">
                Economize sempre — nos garantimos o menor preco
              </p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'spring' as const,
              stiffness: 200,
              damping: 18,
              delay: 0.2,
            }}
            style={{ transformOrigin: 'center center' }}
            className="hidden sm:block"
          >
            <ClaimPriceMatchModal />
          </motion.div>
        </div>
      </motion.div>

      {/* ── Best Price Banner ──────────────────── */}
      <BestPriceBanner />

      {/* ── Tabs ───────────────────────────────── */}
      <motion.div
        className="r55-tabs-container"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...fadeInUp.transition, delay: 0.15 }}
      >
        <div className="r55-tabs-scroll">
          {tabs.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.div
                key={tab.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <button
                  className={`r55-tab ${isActive ? 'r55-tab-active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.id === 'claims' && MOCK_CLAIMS.length > 0 && (
                    <span className="r55-tab-count">{MOCK_CLAIMS.filter(c => c.status === 'pending').length}</span>
                  )}
                  {tab.id === 'drops' && (
                    <span className="r55-tab-count r55-tab-count-green">{MOCK_DROPS.length}</span>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Mobile claim button */}
      <motion.div
        className="sm:hidden mt-3"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <ClaimPriceMatchModal />
      </motion.div>

      {/* ── Filter Controls ─────────────────────── */}
      <div className="mt-4">
        <FilterControls
          category={category}
          setCategory={setCategory}
          dateRange={dateRange}
          setDateRange={setDateRange}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </div>

      {/* ── Tab Content ─────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === 'compare' && (
          <motion.div
            key="compare"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{
              type: 'spring' as const,
              stiffness: 120,
              damping: 20,
            }}
            className="r55-tab-content"
          >
            <div className="r55-comparison-list space-y-3 mt-4">
              {filteredComparisons.map((item, index) => (
                <ComparisonRow key={item.id} item={item} index={index} />
              ))}
              {filteredComparisons.length === 0 && (
                <motion.div
                  className="r55-empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum produto encontrado nesta categoria</p>
                </motion.div>
              )}
            </div>

            {/* Barcode Scanner */}
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...fadeInUp.transition, delay: 0.5 }}
            >
              <div className="r55-scanner-section glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ScanLine className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-semibold">Scanner de Codigo de Barras</span>
                </div>
                <BarcodeScanner />
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'claims' && (
          <motion.div
            key="claims"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{
              type: 'spring' as const,
              stiffness: 120,
              damping: 20,
            }}
            className="r55-tab-content"
          >
            <div className="r55-claims-list space-y-3 mt-4">
              {filteredClaims.map((claim, index) => (
                <motion.div
                  key={claim.id}
                  className="r55-claim-card glass-card"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring' as const,
                    stiffness: 120,
                    damping: 20,
                    delay: 0.1 + index * 0.06,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="r55-claim-product-name">{claim.productName}</h4>
                      <div className="r55-claim-details">
                        <span className="text-xs text-muted-foreground">
                          Concorrente: {claim.competitorStore}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          R$ {claim.competitorPrice.toFixed(2).replace('.', ',')} vs R$ {claim.ourPrice.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          <DollarSign className="w-3 h-3 mr-0.5" />
                          Economia: R$ {claim.savingsAmount.toFixed(2).replace('.', ',')}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {claim.submittedDate}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={claim.status} />
                  </div>
                  {claim.resolvedDate && (
                    <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border/30">
                      Resolvido em: {claim.resolvedDate}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'drops' && (
          <motion.div
            key="drops"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{
              type: 'spring' as const,
              stiffness: 120,
              damping: 20,
            }}
            className="r55-tab-content"
          >
            <div className="r55-drops-list space-y-3 mt-4">
              {filteredDrops.map((drop, index) => (
                <motion.div
                  key={drop.id}
                  className="r55-drop-card glass-card"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    type: 'spring' as const,
                    stiffness: 120,
                    damping: 20,
                    delay: 0.1 + index * 0.06,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="r55-drop-product-name">{drop.productName}</h4>
                        <DropBadge percent={drop.dropPercent} />
                      </div>
                      <div className="r55-drop-prices">
                        <span className="r55-drop-old-price">
                          R$ {drop.previousPrice.toFixed(2).replace('.', ',')}
                        </span>
                        <ArrowDownRight className="w-3 h-3 text-emerald-500" />
                        <span className="r55-drop-new-price">
                          R$ {drop.currentPrice.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-[10px]">
                          <Store className="w-2.5 h-2.5 mr-0.5" />
                          {drop.storeName}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{drop.date}</span>
                      </div>
                    </div>
                    <motion.div
                      className="r55-drop-savings-bubble"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        type: 'spring' as const,
                        stiffness: 200,
                        damping: 15,
                        delay: 0.2 + index * 0.05,
                      }}
                      style={{ transformOrigin: 'center center' }}
                    >
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        -R$ {(drop.previousPrice - drop.currentPrice).toFixed(2).replace('.', ',')}
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
              {filteredDrops.length === 0 && (
                <motion.div
                  className="r55-empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <TrendingDown className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma queda de preco encontrada</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'refunds' && (
          <motion.div
            key="refunds"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{
              type: 'spring' as const,
              stiffness: 120,
              damping: 20,
            }}
            className="r55-tab-content"
          >
            <div className="r55-refunds-list space-y-3 mt-4">
              {filteredRefunds.map((refund, index) => (
                <motion.div
                  key={refund.id}
                  className={`r55-refund-card glass-card ${refund.claimed ? 'r55-refund-card-claimed' : ''}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring' as const,
                    stiffness: 120,
                    damping: 20,
                    delay: 0.1 + index * 0.06,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="r55-refund-product-name">{refund.productName}</h4>
                      <div className="r55-refund-prices">
                        <span className="text-xs text-muted-foreground">
                          Comprado: R$ {refund.purchasePrice.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400">
                          Atual: R$ {refund.currentPrice.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="secondary" className="text-[10px]">
                          <DollarSign className="w-2.5 h-2.5 mr-0.5" />
                          Reembolso: R$ {refund.potentialRefund.toFixed(2).replace('.', ',')}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          Compra: {refund.purchaseDate}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Queda: {refund.priceDropDate}
                        </span>
                      </div>
                    </div>
                    {refund.claimed ? (
                      <Badge className="r55-refund-claimed-badge">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Reembolsado
                      </Badge>
                    ) : (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="sm" className="r55-refund-claim-btn">
                          <RefreshCw className="w-3.5 h-3.5 mr-1" />
                          Reclamar
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
              {filteredRefunds.length === 0 && (
                <motion.div
                  className="r55-empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <RefreshCw className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum reembolso disponivel</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{
              type: 'spring' as const,
              stiffness: 120,
              damping: 20,
            }}
            className="r55-tab-content"
          >
            <div className="mt-4 space-y-4">
              {/* Total Saved Card */}
              <motion.div
                className="r55-dashboard-hero glass-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: 'spring' as const,
                  stiffness: 100,
                  damping: 18,
                  delay: 0.1,
                }}
                style={{ transformOrigin: 'center center' }}
              >
                <div className="r55-dashboard-gradient" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-medium text-emerald-100">Total Economizado</span>
                  </div>
                  <p className="r55-dashboard-total">
                    <AnimatedValue target={MOCK_DASHBOARD.totalSaved} />
                  </p>
                  <p className="text-xs text-emerald-200/70 mt-1">
                    Economia media de {MOCK_DASHBOARD.averageSavingsPercent}% por reclamacao
                  </p>
                </div>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    label: 'Reclamacoes',
                    value: MOCK_DASHBOARD.totalClaims,
                    icon: Shield,
                    color: 'r55-stat-shield',
                  },
                  {
                    label: 'Aprovadas',
                    value: MOCK_DASHBOARD.approvedClaims,
                    icon: CheckCircle2,
                    color: 'r55-stat-approved',
                  },
                  {
                    label: 'Pendentes',
                    value: MOCK_DASHBOARD.pendingClaims,
                    icon: Clock,
                    color: 'r55-stat-pending',
                  },
                  {
                    label: 'Economia Mensal',
                    value: MOCK_DASHBOARD.monthlySavings[5],
                    icon: Percent,
                    color: 'r55-stat-monthly',
                  },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      className={`r55-stat-card glass-card ${stat.color}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        type: 'spring' as const,
                        stiffness: 140,
                        damping: 18,
                        delay: 0.2 + i * 0.06,
                      }}
                    >
                      <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
                      <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                        {typeof stat.value === 'number' && stat.label !== 'Economia Mensal'
                          ? stat.value
                          : `R$ ${stat.value.toFixed(0)}`}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Monthly Savings Chart */}
              <motion.div
                className="r55-chart-section glass-card p-4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...fadeInUp.transition, delay: 0.5 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-semibold">Economia Mensal</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Total: R$ {MOCK_DASHBOARD.monthlySavings.reduce((a, b) => a + b, 0).toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <MonthlyBarChart data={MOCK_DASHBOARD.monthlySavings} />
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                className="r55-quick-stats glass-card p-4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...fadeInUp.transition, delay: 0.6 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold">Resumo Rapido</span>
                </div>
                <div className="space-y-3">
                  <div className="r55-stat-row">
                    <span className="text-xs text-muted-foreground">Taxa de Aprovacao</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {Math.round((MOCK_DASHBOARD.approvedClaims / MOCK_DASHBOARD.totalClaims) * 100)}%
                    </span>
                  </div>
                  <div className="r55-stat-row">
                    <span className="text-xs text-muted-foreground">Economia Media por Claim</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      R$ {(MOCK_DASHBOARD.totalSaved / MOCK_DASHBOARD.totalClaims).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className="r55-stat-row">
                    <span className="text-xs text-muted-foreground">Economia Mensal Atual</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      R$ {MOCK_DASHBOARD.monthlySavings[5].toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className="r55-stat-row">
                    <span className="text-xs text-muted-foreground">Total de Quedas Detectadas</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {MOCK_DROPS.length}
                    </span>
                  </div>
                  <div className="r55-stat-row">
                    <span className="text-xs text-muted-foreground">Reembolsos Pendentes</span>
                    <span className="text-sm font-bold text-amber-500">
                      {MOCK_REFUNDS.filter(r => !r.claimed).length}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === 'policy' && (
          <motion.div
            key="policy"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{
              type: 'spring' as const,
              stiffness: 120,
              damping: 20,
            }}
            className="r55-tab-content mt-4"
          >
            <PolicyAccordion />

            {/* Additional policy info */}
            <motion.div
              className="r55-policy-extra glass-card p-4 mt-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...fadeInUp.transition, delay: 0.7 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Historico de Politicas</span>
              </div>
              <div className="space-y-2">
                {[
                  { date: 'Jan 2025', change: 'Aumentado periodo de elegibilidade de 14 para 30 dias' },
                  { date: 'Dez 2024', change: 'Bonus de 5% extra adicionado para aprovacoes rapidas' },
                  { date: 'Nov 2024', change: 'Auto-refund implementado para compras de 7 dias' },
                ].map((item, i) => (
                  <motion.div
                    key={item.date}
                    className="r55-history-item"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      type: 'spring' as const,
                      stiffness: 120,
                      damping: 20,
                      delay: 0.8 + i * 0.08,
                    }}
                  >
                    <Badge variant="outline" className="text-[10px]">{item.date}</Badge>
                    <p className="text-xs text-muted-foreground ml-2">{item.change}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footer Stats ────────────────────────── */}
      <motion.div
        className="r55-footer-stats glass-card p-4 mt-6"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...fadeInUp.transition, delay: 0.8 }}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs text-muted-foreground">
              {MOCK_COMPARISONS.length} produtos monitorados
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">
              {MOCK_DROPS.length} quedas detectadas esta semana
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {STORE_NAMES.length} lojas comparadas
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
