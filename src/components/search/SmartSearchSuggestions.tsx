'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  TrendingUp,
  Clock,
  Sparkles,
  X,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { cachedFetch } from '@/lib/api-cache';
import { useAppStore } from '@/store/useAppStore';

// ── Types ──────────────────────────────────────────────────────────────────

interface SuggestionItem {
  id: string;
  text: string;
  type: 'trending' | 'recent' | 'product' | 'category' | 'personalized';
  icon: string;
  subtitle?: string;
  highlighted?: string;
}

interface ProductsApiResponse {
  products: {
    id: string;
    name: string;
    category: string;
    storeName?: string;
    price: number;
    rating: number;
    totalReviews: number;
    images: string;
    isOffer: boolean;
    isNew: boolean;
  }[];
  total: number;
  filters?: { categories: string[] };
}

interface SmartSearchSuggestionsProps {
  query: string;
  onSelect: (query: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'r60-recent-searches';

const TRENDING_ITEMS: SuggestionItem[] = [
  { id: 't1', text: 'Pão integral', type: 'trending', icon: '🔥' },
  { id: 't2', text: 'Açaí', type: 'trending', icon: '🥤' },
  { id: 't3', text: 'Remédios', type: 'trending', icon: '💊' },
  { id: 't4', text: 'Frutas frescas', type: 'trending', icon: '🍎' },
  { id: 't5', text: 'Entrega rápida', type: 'trending', icon: '🚀' },
  { id: 't6', text: 'Pet shop', type: 'trending', icon: '🐕' },
];

const CATEGORIES = [
  { name: 'Alimentação', emoji: '🍽️' },
  { name: 'Eletrônicos', emoji: '📱' },
  { name: 'Saúde', emoji: '💊' },
  { name: 'Moda', emoji: '👗' },
  { name: 'Pet', emoji: '🐾' },
  { name: 'Mercado', emoji: '🛒' },
] as const;

const TYPE_LABELS: Record<SuggestionItem['type'], string> = {
  trending: '🔥 Em Alta',
  recent: '🕐 Recentes',
  product: '📦 Produtos',
  category: '📂 Categorias',
  personalized: '✨ Para Você',
};

const MAX_VISIBLE_RECENT = 5;
const MAX_VISIBLE_PRODUCTS = 8;
const MAX_RECENT_STORAGE = 10;

// ── Animation variants ────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 30,
      duration: 0.2,
    },
  },
  exit: { opacity: 0, y: -8, scale: 0.98 },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.2 },
  }),
};

// ── Helpers ───────────────────────────────────────────────────────────────

/** Highlight matching substring in text with bold wrapper */
function highlightMatch(text: string, query: string): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1 || query.length === 0) return text;
  return text.slice(0, idx) + '\u0001' + text.slice(idx, idx + query.length) + '\u0002' + text.slice(idx + query.length);
}

/** Group items by type while preserving order */
function groupByType(items: SuggestionItem[]): { type: SuggestionItem['type']; items: SuggestionItem[] }[] {
  const groups: { type: SuggestionItem['type']; items: SuggestionItem[] }[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    if (!seen.has(item.type)) {
      seen.add(item.type);
      groups.push({ type: item.type, items: [] });
    }
    groups[groups.length - 1].items.push(item);
  }
  return groups;
}

// ── Component ──────────────────────────────────────────────────────────────

export function SmartSearchSuggestions({
  query,
  onSelect,
  isOpen,
  onClose,
}: SmartSearchSuggestionsProps) {
  const [allProducts, setAllProducts] = useState<ProductsApiResponse['products']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [localRecentSearches, setLocalRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const { addRecentSearch } = useAppStore();

  // ── Fetch products for suggestions ────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setIsLoading(true);
      try {
        const data = await cachedFetch<ProductsApiResponse>('/api/products?limit=50');
        if (!cancelled && data?.products) {
          setAllProducts(data.products);
        }
      } catch {
        // Silently ignore fetch errors – suggestions degrade gracefully
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchProducts();
    return () => { cancelled = true; };
  }, []);

  // ── Load recent searches from localStorage ────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        setLocalRecentSearches(parsed);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // ── Close on Escape key ───────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // ── Close on click outside ────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen, onClose]);

  // ── Compute suggestions ──────────────────────────────────────────────
  const suggestions = useMemo(() => {
    const items: SuggestionItem[] = [];
    const q = query.toLowerCase().trim();

    if (!q) {
      // Empty query → show trending + recent
      items.push(...TRENDING_ITEMS);

      localRecentSearches.slice(0, MAX_VISIBLE_RECENT).forEach((text, i) => {
        items.push({
          id: `r-${i}`,
          text,
          type: 'recent',
          icon: '🕐',
        });
      });

      return items;
    }

    // Filter products matching query
    const matched = allProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
      .slice(0, MAX_VISIBLE_PRODUCTS);

    matched.forEach((p) => {
      items.push({
        id: `p-${p.id}`,
        text: p.name,
        type: 'product',
        icon: '📦',
        subtitle: p.storeName || 'Loja',
        highlighted: highlightMatch(p.name, query),
      });
    });

    // Category matches
    CATEGORIES.filter((c) => c.name.toLowerCase().includes(q)).forEach(
      (c, i) => {
        items.push({
          id: `cat-${i}`,
          text: `Buscar em ${c.name}`,
          type: 'category',
          icon: c.emoji,
          subtitle: 'Ver todos',
        });
      },
    );

    // Recent matches if they contain the query
    localRecentSearches
      .filter((s) => s.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((text, i) => {
        items.push({
          id: `rm-${i}`,
          text,
          type: 'recent',
          icon: '🕐',
          highlighted: highlightMatch(text, query),
        });
      });

    return items;
  }, [query, allProducts, localRecentSearches]);

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleSelect = useCallback(
    (item: SuggestionItem) => {
      // Update global store
      addRecentSearch(item.text);

      // Update local storage
      const updated = [
        item.text,
        ...localRecentSearches.filter((s) => s !== item.text),
      ].slice(0, MAX_RECENT_STORAGE);
      setLocalRecentSearches(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore write errors
      }

      onSelect(item.text);
    },
    [addRecentSearch, localRecentSearches, onSelect],
  );

  const clearRecent = useCallback(() => {
    setLocalRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  // ── Render helpers ────────────────────────────────────────────────────

  function renderHighlighted(text: string, highlighted: string | undefined) {
    if (!highlighted) return text;

    const parts = highlighted.split('\u0001');
    if (parts.length < 2) return text;

    const before = parts[0];
    const rest = parts[1].split('\u0002');
    const match = rest[0];
    const after = rest[1];

    return (
      <>
        {before}
        <span className="font-bold text-indigo-600">{match}</span>
        {after}
      </>
    );
  }

  // ── Early return ─────────────────────────────────────────────────────

  if (!isOpen) return null;

  const grouped = groupByType(suggestions);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          className="r60-suggestions-panel absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-100 overflow-hidden z-50 max-h-[60vh] overflow-y-auto"
        >
          {/* ── Header ───────────────────────────────────────────────── */}
          <div className="r60-suggestions-header flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Sugestões
              </span>
            </div>
            <div className="flex items-center gap-1">
              {localRecentSearches.length > 0 && (
                <button
                  onClick={clearRecent}
                  className="text-[10px] text-red-500 hover:text-red-600 font-medium px-2 py-1.5 rounded-md hover:bg-red-50 transition-colors active:scale-95 transition-transform"
                >
                  Limpar
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 active:scale-95 transition-transform"
                aria-label="Fechar sugestões"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* ── AI result badge (when query is active) ─────────────── */}
          {query && (
            <div className="r60-suggestions-badge flex items-center gap-1.5 px-3 py-2 bg-indigo-50 border-b border-indigo-100">
              <Sparkles className="h-3 w-3 text-indigo-600" />
              <span className="text-[11px] text-indigo-700 font-medium">
                {suggestions.length}{' '}
                {suggestions.length === 1 ? 'resultado' : 'resultados'} para &ldquo;
                {query}&rdquo;
              </span>
            </div>
          )}

          {/* ── Loading skeleton ────────────────────────────────────── */}
          {isLoading && allProducts.length === 0 && (
            <div className="p-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`skel-${i}`}
                  className="flex items-center gap-3 px-3 py-3 animate-pulse"
                >
                  <div className="h-8 w-8 rounded-lg bg-gray-200" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-3/4 rounded bg-gray-200" />
                    <div className="h-2.5 w-1/2 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Suggestion groups ───────────────────────────────────── */}
          {!isLoading && (
            <div className="r60-suggestions-list p-1">
              {grouped.length === 0 ? (
                /* Empty state */
                <div className="r60-suggestions-empty px-3 py-8 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                    className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3"
                  >
                    <Search className="h-6 w-6 text-gray-300" />
                  </motion.div>
                  <p className="text-sm font-medium text-gray-500">
                    Nenhum resultado encontrado
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Tente outra busca ou verifique a ortografia
                  </p>
                </div>
              ) : (
                grouped.map((group) => (
                  <div key={group.type}>
                    {/* Section label – only show when query is empty for type grouping */}
                    {group.items.length > 0 && TYPE_LABELS[group.type] && (
                      <div className="flex items-center gap-1.5 px-3 pt-2 pb-1">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          {TYPE_LABELS[group.type]}
                        </span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                    )}

                    {/* Items */}
                    <div role="listbox" className="space-y-0.5">
                      {group.items.map((item, i) => (
                        <motion.button
                          key={item.id}
                          custom={i}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          onClick={() => handleSelect(item)}
                          role="option"
                          aria-selected={false}
                          className="r60-suggestion-item w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 active:scale-95 transition-transform text-left min-h-[44px]"
                        >
                          <span
                            className="text-lg flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50"
                            aria-hidden="true"
                          >
                            {item.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {renderHighlighted(item.text, item.highlighted)}
                            </p>
                            {item.subtitle && (
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                          <ArrowRight
                            className="h-3.5 w-3.5 text-gray-300 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-hidden="true"
                          />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Footer ───────────────────────────────────────────────── */}
          {query && suggestions.length > 0 && (
            <div className="r60-suggestions-footer border-t border-gray-100 px-3 py-2.5">
              <button
                onClick={() => onSelect(query)}
                className="r60-suggestions-search-btn w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 active:scale-95 transition-transform min-h-[44px]"
              >
                <Search className="h-4 w-4" />
                <span>Buscar &ldquo;{query}&rdquo;</span>
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
