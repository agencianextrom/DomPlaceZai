'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// ─── Types ───────────────────────────────────────────────────────────────────

type PaymentMethodKey = 'pix' | 'credit_card' | 'debit_card' | 'cash';

type SplitMode = 'methods' | 'friends';

interface PaymentMethodDef {
  key: PaymentMethodKey;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  minAmount: number;
}

interface MethodAllocation {
  key: PaymentMethodKey;
  amount: number;
}

interface FriendPerson {
  id: string;
  name: string;
  phone: string;
  amount: number;
}

interface ValidationError {
  id: string;
  message: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PAYMENT_METHODS: PaymentMethodDef[] = [
  {
    key: 'pix',
    label: 'Pix',
    icon: '⚡',
    color: '#00b4d8',
    bgColor: 'rgba(0,180,216,0.12)',
    minAmount: 1,
  },
  {
    key: 'credit_card',
    label: 'Cartão de Crédito',
    icon: '💳',
    color: '#8338ec',
    bgColor: 'rgba(131,56,236,0.12)',
    minAmount: 5,
  },
  {
    key: 'debit_card',
    label: 'Cartão de Débito',
    icon: '🏦',
    color: '#fb5607',
    bgColor: 'rgba(251,86,7,0.12)',
    minAmount: 5,
  },
  {
    key: 'cash',
    label: 'Dinheiro',
    icon: '💵',
    color: '#06d6a0',
    bgColor: 'rgba(6,214,160,0.12)',
    minAmount: 2,
  },
];

const MIN_FRIEND_AMOUNT = 1;
const MAX_FRIENDS = 10;

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

function buildWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  const clean = digits.startsWith('55') ? digits : `55${digits}`;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${clean}?text=${encoded}`;
}

// ─── QR Code (simplified SVG pattern) ────────────────────────────────────────

function SimplePixQR({ pixKey, amount }: { pixKey: string; amount: number }) {
  const payload = `PIX:${pixKey}:${amount.toFixed(2)}`;
  const cells = 25;

  const grid: boolean[][] = [];
  for (let r = 0; r < cells; r++) {
    grid[r] = [];
    for (let c = 0; c < cells; c++) {
      let filled = false;

      // Finder patterns (top-left, top-right, bottom-left)
      const inFinder =
        (r < 7 && c < 7) ||
        (r < 7 && c >= cells - 7) ||
        (r >= cells - 7 && c < 7);

      if (inFinder) {
        const cr = r < 7 ? r : r - (cells - 7);
        const cc = c < 7 ? c : c - (cells - 7);
        const outer = cr === 0 || cr === 6 || cc === 0 || cc === 6;
        const inner = cr >= 2 && cr <= 4 && cc >= 2 && cc <= 4;
        filled = outer || inner;
      } else {
        const charIndex = (r * cells + c) % payload.length;
        filled = payload.charCodeAt(charIndex) % 2 === 0;
      }
      grid[r][c] = filled;
    }
  }

  const cellSize = 2.8;
  const size = cells * cellSize + 8;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="r39-qr-svg"
      role="img"
      aria-label={`QR Code Pix para ${pixKey}`}
    >
      <rect width={size} height={size} fill="white" rx="4" />
      {grid.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={4 + c * cellSize}
              y={4 + r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#18181b"
              rx={0.4}
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

// ─── Donut Chart ────────────────────────────────────────────────────────────

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

function DonutChart({ segments, remaining, total }: { segments: DonutSegment[]; remaining: number; total: number }) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 18;
  const center = radius + strokeWidth / 2 + 4;
  const svgSize = center * 2;

  const activeSegments = segments.filter((s) => s.value > 0);

  const arcs = activeSegments.map((seg, idx) => {
    const fraction = seg.value / total;
    const dashLength = fraction * circumference;
    const prevOffset = activeSegments
      .slice(0, idx)
      .reduce((sum, s) => sum + (s.value / total) * circumference, 0);
    return { ...seg, dashLength, dashOffset: -prevOffset, fraction };
  });

  return (
    <div className="r39-donut-wrapper relative flex items-center justify-center">
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} className="r39-donut-svg">
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Segments */}
        {arcs.map((arc, idx) => (
          <motion.circle
            key={`${arc.label}-${idx}`}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={arc.dashLength}
            strokeDashoffset={arc.dashOffset}
            initial={{ strokeDasharray: 0, opacity: 0 }}
            animate={{ strokeDasharray: arc.dashLength, opacity: 1 }}
            transition={{ duration: 0.5, delay: idx * 0.12, type: 'spring' as const, stiffness: 120, damping: 20 }}
            transform={`rotate(-90 ${center} ${center})`}
          />
        ))}
      </svg>
      {/* Center label */}
      <div className="r39-donut-center absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="r39-donut-remaining text-xs text-zinc-400"
          key={remaining}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' as const, stiffness: 200, damping: 18 }}
        >
          {remaining > 0 ? 'Restante' : 'Completo!'}
        </motion.span>
        <motion.span
          className="r39-donut-value text-sm font-bold text-zinc-800"
          key={remaining.toFixed(2)}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring' as const, stiffness: 200, damping: 18 }}
        >
          {formatCurrency(remaining)}
        </motion.span>
      </div>
    </div>
  );
}

// ─── Animated Remaining Balance ──────────────────────────────────────────────

function AnimatedRemaining({ remaining, total }: { remaining: number; total: number }) {
  const pct = total > 0 ? (remaining / total) * 100 : 100;

  return (
    <div className="r39-remaining-section space-y-2">
      <div className="r39-remaining-header flex items-center justify-between">
        <span className="r39-remaining-label text-sm font-medium text-zinc-500">Restante</span>
        <motion.span
          className="r39-remaining-value text-lg font-bold"
          style={{ color: remaining <= 0 ? '#06d6a0' : '#ef4444' }}
          key={remaining.toFixed(2)}
          initial={{ scale: 1.15, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
        >
          {formatCurrency(remaining)}
        </motion.span>
      </div>
      <Progress
        value={100 - pct}
        className="r39-remaining-bar h-2"
      />
      {remaining <= 0 && (
        <motion.div
          className="r39-remaining-success flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ type: 'spring' as const, stiffness: 200, damping: 22 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11.5 3.5L5.25 9.75L2.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Pagamento totalmente alocado
        </motion.div>
      )}
    </div>
  );
}

// ─── Validation Error ───────────────────────────────────────────────────────

function ValidationErrorToast({ error, onDismiss }: { error: ValidationError; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(error.id), 4000);
    return () => clearTimeout(timer);
  }, [error.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ type: 'spring' as const, stiffness: 350, damping: 28 }}
      className="r39-error-toast flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8" cy="10.5" r="0.75" fill="currentColor"/>
      </svg>
      <span className="r39-error-message flex-1">{error.message}</span>
    </motion.div>
  );
}

// ─── Method Split Panel ─────────────────────────────────────────────────────

function MethodSplitPanel({
  allocations,
  total,
  remaining,
  onUpdate,
}: {
  allocations: MethodAllocation[];
  total: number;
  remaining: number;
  onUpdate: (key: PaymentMethodKey, amount: number) => void;
}) {
  const handleAmountChange = useCallback(
    (key: PaymentMethodKey, raw: string) => {
      const cleaned = raw.replace(/[^\d.,]/g, '').replace(',', '.');
      const num = parseFloat(cleaned);
      if (isNaN(num)) {
        onUpdate(key, 0);
        return;
      }
      const currentOthers = allocations
        .filter((a) => a.key !== key)
        .reduce((sum, a) => sum + a.amount, 0);
      const maxAllowed = total - currentOthers;
      onUpdate(key, clamp(Math.round(num * 100) / 100, 0, maxAllowed));
    },
    [allocations, total, onUpdate],
  );

  const donutSegments: DonutSegment[] = allocations.map((a) => {
    const method = PAYMENT_METHODS.find((m) => m.key === a.key)!;
    return { label: method.label, value: a.amount, color: method.color };
  });

  return (
    <div className="r39-method-panel space-y-5">
      {/* Donut Chart */}
      <div className="r39-method-chart flex justify-center py-2">
        <DonutChart segments={donutSegments} remaining={remaining} total={total} />
      </div>

      {/* Legend */}
      <div className="r39-method-legend flex flex-wrap items-center justify-center gap-3">
        {donutSegments
          .filter((s) => s.value > 0)
          .map((s) => (
            <div key={s.label} className="r39-legend-item flex items-center gap-1.5">
              <span
                className="r39-legend-dot h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="r39-legend-label text-xs text-zinc-500">{s.label}</span>
              <span className="r39-legend-value text-xs font-semibold text-zinc-700">
                {formatCurrency(s.value)}
              </span>
            </div>
          ))}
      </div>

      {/* Allocation bars */}
      <div className="r39-method-allocations space-y-3">
        {PAYMENT_METHODS.map((method) => {
          const alloc = allocations.find((a) => a.key === method.key) ?? { key: method.key, amount: 0 };
          const fraction = total > 0 ? (alloc.amount / total) * 100 : 0;

          return (
            <motion.div
              key={method.key}
              layout
              className="r39-allocation-card rounded-xl border border-zinc-100 bg-zinc-50/60 p-3"
              style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
            >
              <div className="r39-allocation-header flex items-center justify-between mb-2">
                <div className="r39-allocation-info flex items-center gap-2">
                  <span
                    className="r39-allocation-icon flex h-8 w-8 items-center justify-center rounded-lg text-base"
                    style={{ backgroundColor: method.bgColor }}
                  >
                    {method.icon}
                  </span>
                  <span className="r39-allocation-label text-sm font-medium text-zinc-700">{method.label}</span>
                </div>
                <Badge
                  variant="secondary"
                  className="r39-allocation-badge text-xs"
                  style={{
                    backgroundColor: alloc.amount > 0 ? method.bgColor : 'rgba(0,0,0,0.05)',
                    color: alloc.amount > 0 ? method.color : '#a1a1aa',
                  }}
                >
                  {fraction > 0 ? `${fraction.toFixed(0)}%` : '—'}
                </Badge>
              </div>

              {/* Animated bar */}
              <div className="r39-allocation-bar-track relative h-2 w-full overflow-hidden rounded-full bg-zinc-200">
                <motion.div
                  className="r39-allocation-bar-fill absolute inset-y-0 left-0 rounded-full"
                  style={{ backgroundColor: method.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(fraction, 100)}%` }}
                  transition={{ type: 'spring' as const, stiffness: 140, damping: 22 }}
                />
              </div>

              {/* Amount input */}
              <div className="r39-allocation-input-row mt-2 flex items-center gap-2">
                <span className="r39-currency-symbol text-sm font-medium text-zinc-400">R$</span>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  className="r39-amount-input h-8 flex-1 border-zinc-200 bg-white text-sm"
                  value={alloc.amount > 0 ? alloc.amount.toFixed(2).replace('.', ',') : ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAmountChange(method.key, e.target.value)}
                />
                {alloc.amount > 0 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                  >
                    <div
                      className="r39-clear-btn flex min-h-[44px] min-w-[44px] h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-red-50 text-xs text-red-500 transition-colors hover:bg-red-100"
                      onClick={() => onUpdate(method.key, 0)}
                    >
                      ✕
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Minimum hint */}
              {alloc.amount > 0 && alloc.amount < method.minAmount && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="r39-min-hint mt-1 text-xs text-amber-600"
                >
                  Mínimo: {formatCurrency(method.minAmount)}
                </motion.p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Friend Split Panel ─────────────────────────────────────────────────────

function FriendSplitPanel({
  friends,
  total,
  remaining,
  splitEqually,
  onUpdateFriend,
  onAddFriend,
  onRemoveFriend,
  onToggleEqual,
}: {
  friends: FriendPerson[];
  total: number;
  remaining: number;
  splitEqually: boolean;
  onUpdateFriend: (id: string, field: 'name' | 'phone' | 'amount', value: string | number) => void;
  onAddFriend: () => void;
  onRemoveFriend: (id: string) => void;
  onToggleEqual: () => void;
}) {
  const donutSegments: DonutSegment[] = [
    { label: 'Você', value: 0, color: '#06d6a0' },
    ...friends.map((f) => ({ label: f.name || 'Pessoa', value: f.amount, color: '#8338ec' })),
  ];

  const friendShare = friends.length > 0 && splitEqually ? total / (friends.length + 1) : 0;
  const yourShare = splitEqually ? friendShare : remaining + friends.reduce((s, f) => s + f.amount, 0);

  return (
    <div className="r39-friend-panel space-y-5">
      {/* Donut */}
      <div className="r39-friend-chart flex justify-center py-2">
        <DonutChart segments={donutSegments} remaining={remaining} total={total} />
      </div>

      {/* Equal split toggle */}
      <div className="r39-equal-toggle flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/60 p-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
        <div className="r39-equal-info">
          <p className="r39-equal-label text-sm font-medium text-zinc-700">Divisão Igual</p>
          {splitEqually && friends.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="r39-each-amount mt-0.5 text-xs text-zinc-400"
            >
              {formatCurrency(friendShare)} por pessoa
            </motion.p>
          )}
        </div>
        <motion.div
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
        >
          <Button
            variant={splitEqually ? 'default' : 'outline'}
            size="sm"
            className={`r39-toggle-btn ${splitEqually ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''}`}
            onClick={onToggleEqual}
          >
            {splitEqually ? 'Igual ✓' : 'Personalizar'}
          </Button>
        </motion.div>
      </div>

      {/* Your share (when equal) */}
      {splitEqually && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ type: 'spring' as const, stiffness: 200, damping: 22 }}
          className="r39-your-share rounded-xl border border-emerald-100 bg-emerald-50/60 p-3"
          style={{ boxShadow: '0 2px 12px rgba(6,214,160,0.10)' }}
        >
          <div className="flex items-center gap-2">
            <span className="r39-your-icon flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm">
              👤
            </span>
            <div>
              <p className="r39-your-label text-sm font-medium text-emerald-800">Você paga</p>
              <motion.span
                key={yourShare.toFixed(2)}
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 250, damping: 20 }}
                className="r39-your-value text-lg font-bold text-emerald-700"
              >
                {formatCurrency(yourShare)}
              </motion.span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Friends list */}
      <div className="r39-friends-list space-y-3">
        <AnimatePresence mode="popLayout">
          {friends.map((friend, idx) => (
            <motion.div
              key={friend.id}
              layout
              initial={{ opacity: 0, x: -24, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.9 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 26 }}
              className="r39-friend-card relative rounded-xl border border-zinc-100 bg-white p-3"
              style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
            >
              {/* Avatar + index */}
              <div className="r39-friend-header flex items-center gap-2 mb-3">
                <span className="r39-friend-avatar flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">
                  {friend.name ? friend.name.charAt(0).toUpperCase() : idx + 1}
                </span>
                <div className="r39-friend-name-phone flex-1 space-y-1">
                  <Input
                    type="text"
                    placeholder="Nome"
                    className="r39-name-input h-7 border-zinc-200 text-sm"
                    value={friend.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onUpdateFriend(friend.id, 'name', e.target.value)
                    }
                  />
                  <Input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    className="r39-phone-input h-7 border-zinc-200 text-xs"
                    value={friend.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onUpdateFriend(friend.id, 'phone', normalizePhone(e.target.value))
                    }
                    maxLength={15}
                  />
                </div>
                {friends.length > 1 && (
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 18 }}
                  >
                    <div
                      className="r39-remove-friend flex min-h-[44px] min-w-[44px] h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-red-50 text-xs text-red-500 transition-colors hover:bg-red-100"
                      onClick={() => onRemoveFriend(friend.id)}
                    >
                      ✕
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Amount */}
              {!splitEqually && (
                <div className="r39-friend-amount-row flex items-center gap-2">
                  <span className="r39-currency-symbol text-sm font-medium text-zinc-400">R$</span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    className="r39-friend-amount-input h-8 flex-1 border-zinc-200 text-sm"
                    value={friend.amount > 0 ? friend.amount.toFixed(2).replace('.', ',') : ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const cleaned = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.');
                      const num = parseFloat(cleaned);
                      if (isNaN(num)) {
                        onUpdateFriend(friend.id, 'amount', 0);
                        return;
                      }
                      onUpdateFriend(friend.id, 'amount', Math.round(num * 100) / 100);
                    }}
                  />
                  {friend.phone && friend.name && friend.amount > 0 && (
                    <motion.a
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                      href={buildWhatsAppLink(
                        friend.phone,
                        `Olá ${friend.name}! 👋 Estou dividindo um pedido no DomPlace e sua parte é ${formatCurrency(friend.amount)}. Você pode pagar via Pix. Obrigado!`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="r39-whatsapp-btn flex min-h-[44px] min-w-[44px] h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-700 transition-colors hover:bg-green-200"
                      title="Enviar via WhatsApp"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </motion.a>
                  )}
                </div>
              )}

              {/* Equal amount display */}
              {splitEqually && friends.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="r39-equal-amount flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1.5"
                >
                  <span className="text-xs text-purple-600">Paga</span>
                  <span className="text-sm font-semibold text-purple-700">
                    {formatCurrency(friendShare)}
                  </span>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add friend */}
      {friends.length < MAX_FRIENDS && (
        <motion.div
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
        >
          <Button
            variant="outline"
            className="r39-add-friend-btn w-full border-dashed border-zinc-300 text-sm text-zinc-500"
            onClick={onAddFriend}
          >
            <span className="r39-add-icon mr-2 text-base">+</span>
            Adicionar Pessoa
          </Button>
        </motion.div>
      )}
      {friends.length >= MAX_FRIENDS && (
        <p className="r39-max-friends-hint text-center text-xs text-zinc-400">
          Máximo de {MAX_FRIENDS} pessoas atingido
        </p>
      )}
    </div>
  );
}

// ─── Loading State ───────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="r39-loading space-y-4 p-4">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, type: 'spring' as const, stiffness: 200, damping: 22 }}
          className="r39-skeleton-item h-16 animate-pulse rounded-xl bg-zinc-100"
        />
      ))}
      <div className="r39-skeleton-chart mx-auto h-32 w-32 animate-pulse rounded-full bg-zinc-100" />
      {[0, 1].map((i) => (
        <div key={`s${i}`} className="r39-skeleton-bar h-3 w-full animate-pulse rounded-full bg-zinc-100" />
      ))}
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 180, damping: 22 }}
      className="r39-empty flex flex-col items-center justify-center py-12 text-center"
    >
      <motion.div
        className="r39-empty-icon mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-3xl"
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
      >
        💸
      </motion.div>
      <h3 className="r39-empty-title mb-1 text-base font-semibold text-zinc-700">Dividir Pagamento</h3>
      <p className="r39-empty-desc mb-5 max-w-xs text-sm text-zinc-400">
        Divida o valor total entre múltiplos métodos de pagamento ou com amigos de forma fácil e rápida.
      </p>
      <motion.div whileTap={{ scale: 0.95 }} transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}>
        <Button onClick={onStart} className="r39-start-btn bg-violet-600 text-white hover:bg-violet-700">
          Começar
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

interface SplitPaymentSelectorProps {
  orderTotal: number;
  /** Optional Pix key for QR code generation */
  pixKey?: string;
  /** Show a loading skeleton instead of the real UI */
  loading?: boolean;
}

export function SplitPaymentSelector({
  orderTotal,
  pixKey = 'domplace@pix.com.br',
  loading = false,
}: SplitPaymentSelectorProps) {
  // ── State ──
  const [activeMode, setActiveMode] = useState<SplitMode>('methods');
  const [showContent, setShowContent] = useState(false);

  // Method split state
  const [methodAllocations, setMethodAllocations] = useState<MethodAllocation[]>(
    PAYMENT_METHODS.map((m) => ({ key: m.key, amount: 0 })),
  );

  // Friend split state
  const [friends, setFriends] = useState<FriendPerson[]>([]);
  const [splitEqually, setSplitEqually] = useState(true);

  // Validation
  const [errors, setErrors] = useState<ValidationError[]>([]);

  // ── Derived ──
  const totalAllocatedMethods = useMemo(
    () => methodAllocations.reduce((s, a) => s + a.amount, 0),
    [methodAllocations],
  );

  const remainingMethods = useMemo(
    () => Math.round((orderTotal - totalAllocatedMethods) * 100) / 100,
    [orderTotal, totalAllocatedMethods],
  );

  const totalAllocatedFriends = useMemo(
    () => friends.reduce((s, f) => s + f.amount, 0),
    [friends],
  );

  const remainingFriends = useMemo(
    () => Math.round((orderTotal - totalAllocatedFriends) * 100) / 100,
    [orderTotal, totalAllocatedFriends],
  );

  const remaining = activeMode === 'methods' ? remainingMethods : remainingFriends;
  const totalAllocated = activeMode === 'methods' ? totalAllocatedMethods : totalAllocatedFriends;

  // ── Callbacks ──
  const dismissError = useCallback((id: string) => {
    setErrors((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const pushError = useCallback((message: string) => {
    const err: ValidationError = { id: generateId(), message };
    setErrors((prev) => [...prev.slice(-4), err]);
  }, []);

  const handleMethodUpdate = useCallback(
    (key: PaymentMethodKey, amount: number) => {
      const method = PAYMENT_METHODS.find((m) => m.key === key)!;
      if (amount > 0 && amount < method.minAmount) {
        pushError(`${method.label}: valor mínimo é ${formatCurrency(method.minAmount)}`);
      }
      const currentTotal = methodAllocations
        .filter((a) => a.key !== key)
        .reduce((s, a) => s + a.amount, 0);
      if (currentTotal + amount > orderTotal) {
        pushError('O total alocado não pode exceder o valor do pedido');
        amount = orderTotal - currentTotal;
      }
      setMethodAllocations((prev) =>
        prev.map((a) => (a.key === key ? { ...a, amount: Math.max(0, amount) } : a)),
      );
    },
    [methodAllocations, orderTotal, pushError],
  );

  const handleAddFriend = useCallback(() => {
    if (friends.length >= MAX_FRIENDS) return;
    setFriends((prev) => [
      ...prev,
      { id: generateId(), name: '', phone: '', amount: 0 },
    ]);
  }, [friends.length]);

  const handleRemoveFriend = useCallback((id: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleUpdateFriend = useCallback(
    (id: string, field: 'name' | 'phone' | 'amount', value: string | number) => {
      setFriends((prev) =>
        prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
      );
    },
    [],
  );

  const handleToggleEqual = useCallback(() => {
    setSplitEqually((prev) => !prev);
  }, []);

  const handleStart = useCallback(() => {
    setShowContent(true);
  }, []);

  const handleShareAll = useCallback(() => {
    if (friends.length === 0) {
      pushError('Adicione pelo menos uma pessoa para compartilhar');
      return;
    }
    const shareAmount = splitEqually
      ? orderTotal / (friends.length + 1)
      : 0;

    friends.forEach((f) => {
      const amount = splitEqually ? shareAmount : f.amount;
      if (f.phone && amount > 0) {
        const msg = `Olá ${f.name || 'amigo/a'}! 👋 Estou dividindo um pedido no DomPlace e sua parte é ${formatCurrency(amount)}. Você pode pagar via Pix. Obrigado!`;
        window.open(buildWhatsAppLink(f.phone, msg), '_blank');
      }
    });
  }, [friends, orderTotal, splitEqually, pushError]);

  // ── Validate friend amounts ──
  useEffect(() => {
    if (activeMode !== 'friends' || splitEqually || friends.length === 0) return;
    if (totalAllocatedFriends > orderTotal) {
      pushError('A soma das partes não pode exceder o valor total');
    }
    friends.forEach((f) => {
      if (f.amount > 0 && f.amount < MIN_FRIEND_AMOUNT) {
        pushError(`${f.name || 'Pessoa'}: valor mínimo é ${formatCurrency(MIN_FRIEND_AMOUNT)}`);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friends, totalAllocatedFriends, orderTotal, activeMode, splitEqually]);

  // ── Pix allocation for QR display ──
  const pixAllocation = useMemo(
    () => methodAllocations.find((a) => a.key === 'pix')?.amount ?? 0,
    [methodAllocations],
  );

  // ── Render ──

  if (loading) {
    return (
      <Card className="r39-root-card overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <LoadingState />
      </Card>
    );
  }

  if (!showContent) {
    return (
      <Card className="r39-root-card overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <EmptyState onStart={handleStart} />
      </Card>
    );
  }

  return (
    <Card className="r39-root-card overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      {/* Header */}
      <CardHeader className="r39-header pb-3">
        <div className="r39-title-row flex items-center justify-between">
          <CardTitle className="r39-title text-lg font-bold text-zinc-800">
            Dividir Pagamento
          </CardTitle>
          <Badge variant="outline" className="r39-total-badge border-zinc-200 text-sm font-semibold">
            Valor Total: <span className="ml-1 text-zinc-800">{formatCurrency(orderTotal)}</span>
          </Badge>
        </div>

        {/* Mode tabs */}
        <div className="r39-mode-tabs mt-3 flex gap-1 rounded-xl bg-zinc-100 p-1">
          {([
            { key: 'methods' as SplitMode, label: 'Dividir Métodos', icon: '💳' },
            { key: 'friends' as SplitMode, label: 'Dividir com Amigos', icon: '👥' },
          ]).map((tab) => (
            <motion.div
              key={tab.key}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
              className="r39-mode-tab flex-1"
            >
              <button
                className={`r39-mode-tab-btn flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeMode === tab.key
                    ? 'bg-white text-zinc-800'
                    : 'text-zinc-400 hover:text-zinc-600'
                }`}
                style={
                  activeMode === tab.key
                    ? { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
                    : undefined
                }
                onClick={() => setActiveMode(tab.key)}
              >
                <span className="text-base">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            </motion.div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="r39-content space-y-4 pt-0">
        {/* Validation errors */}
        <AnimatePresence>
          {errors.map((err) => (
            <ValidationErrorToast key={err.id} error={err} onDismiss={dismissError} />
          ))}
        </AnimatePresence>

        {/* Panel switch */}
        <AnimatePresence mode="wait">
          {activeMode === 'methods' ? (
            <motion.div
              key="methods-panel"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: 'spring' as const, stiffness: 260, damping: 24 }}
            >
              <MethodSplitPanel
                allocations={methodAllocations}
                total={orderTotal}
                remaining={remainingMethods}
                onUpdate={handleMethodUpdate}
              />
            </motion.div>
          ) : (
            <motion.div
              key="friends-panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring' as const, stiffness: 260, damping: 24 }}
            >
              <FriendSplitPanel
                friends={friends}
                total={orderTotal}
                remaining={remainingFriends}
                splitEqually={splitEqually}
                onUpdateFriend={handleUpdateFriend}
                onAddFriend={handleAddFriend}
                onRemoveFriend={handleRemoveFriend}
                onToggleEqual={handleToggleEqual}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Remaining balance */}
        <AnimatedRemaining remaining={remaining} total={orderTotal} />

        {/* QR Code for Pix */}
        <AnimatePresence>
          {activeMode === 'methods' && pixAllocation > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring' as const, stiffness: 200, damping: 22 }}
              className="r39-pix-qr-section rounded-xl border border-cyan-100 bg-cyan-50/40 p-4"
              style={{ boxShadow: '0 2px 12px rgba(0,180,216,0.08)' }}
            >
              <div className="r39-qr-header flex items-center gap-2 mb-3">
                <span className="r39-qr-icon flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-base">
                  ⚡
                </span>
                <div>
                  <p className="r39-qr-title text-sm font-semibold text-cyan-800">QR Code Pix</p>
                  <p className="r39-qr-value text-xs text-cyan-600">{formatCurrency(pixAllocation)}</p>
                </div>
              </div>
              <div className="r39-qr-display flex justify-center">
                <div className="r39-qr-frame rounded-xl bg-white p-3" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                  <SimplePixQR pixKey={pixKey} amount={pixAllocation} />
                </div>
              </div>
              <p className="r39-qr-key mt-2 text-center text-xs text-zinc-400">{pixKey}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WhatsApp share (friends mode) */}
        <AnimatePresence>
          {activeMode === 'friends' && friends.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ type: 'spring' as const, stiffness: 200, damping: 22 }}
            >
              <motion.div
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
              >
                <Button
                  className="r39-share-all-btn w-full bg-green-600 text-white hover:bg-green-700"
                  onClick={handleShareAll}
                >
                  <svg className="r39-share-icon mr-2" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Compartilhar no WhatsApp
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirm summary */}
        <AnimatePresence>
          {remaining <= 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ type: 'spring' as const, stiffness: 220, damping: 22 }}
              className="r39-summary-card rounded-xl border border-emerald-200 bg-emerald-50/60 p-4"
              style={{ boxShadow: '0 4px 16px rgba(6,214,160,0.12)' }}
            >
              <h4 className="r39-summary-title mb-2 text-sm font-semibold text-emerald-800">
                Resumo da Divisão
              </h4>
              <div className="r39-summary-rows space-y-1.5">
                {activeMode === 'methods' &&
                  methodAllocations
                    .filter((a) => a.amount > 0)
                    .map((a) => {
                      const method = PAYMENT_METHODS.find((m) => m.key === a.key)!;
                      return (
                        <div key={a.key} className="r39-summary-row flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: method.color }}
                            />
                            {method.label}
                          </span>
                          <span className="font-semibold text-zinc-700">{formatCurrency(a.amount)}</span>
                        </div>
                      );
                    })}
                {activeMode === 'friends' && (
                  <>
                    {splitEqually ? (
                      <>
                        <div className="r39-summary-row flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Você
                          </span>
                          <span className="font-semibold text-zinc-700">
                            {formatCurrency(orderTotal / (friends.length + 1))}
                          </span>
                        </div>
                        {friends.map((f) => (
                          <div key={f.id} className="r39-summary-row flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-purple-500" />
                              {f.name || 'Pessoa'}
                            </span>
                            <span className="font-semibold text-zinc-700">
                              {formatCurrency(orderTotal / (friends.length + 1))}
                            </span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        <div className="r39-summary-row flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Você
                          </span>
                          <span className="font-semibold text-zinc-700">
                            {formatCurrency(orderTotal - totalAllocatedFriends)}
                          </span>
                        </div>
                        {friends
                          .filter((f) => f.amount > 0)
                          .map((f) => (
                            <div key={f.id} className="r39-summary-row flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-purple-500" />
                                {f.name || 'Pessoa'}
                              </span>
                              <span className="font-semibold text-zinc-700">{formatCurrency(f.amount)}</span>
                            </div>
                          ))}
                      </>
                    )}
                  </>
                )}
                <div className="r39-summary-total mt-2 flex items-center justify-between border-t border-emerald-200 pt-2">
                  <span className="text-sm font-bold text-emerald-900">Total</span>
                  <span className="text-sm font-bold text-emerald-900">{formatCurrency(orderTotal)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
