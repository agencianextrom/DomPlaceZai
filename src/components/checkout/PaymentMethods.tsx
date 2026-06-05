'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentMethod {
  id: string; name: string; emoji: string; description: string; processingTime: string; badge?: string;
}

const paymentMethods: PaymentMethod[] = [
  { id: 'pix', name: 'Pix', emoji: '⚡', description: 'Pagamento instantâneo via Pix', processingTime: 'Imediato', badge: 'Recomendado' },
  { id: 'credit', name: 'Cartão de Crédito', emoji: '💳', description: 'Visa, Mastercard, Elo, Amex', processingTime: 'Imediato', badge: 'Mais popular' },
  { id: 'debit', name: 'Cartão de Débito', emoji: '🏦', description: 'Débito na hora da entrega', processingTime: 'Imediato' },
  { id: 'cash', name: 'Dinheiro', emoji: '💵', description: 'Pagamento em dinheiro na entrega', processingTime: 'Na entrega' },
  { id: 'boleto', name: 'Boleto', emoji: '📄', description: 'Boleto bancário à vista', processingTime: '1-2 dias úteis' },
];

const installmentOptions = [
  { count: 1, label: '1x sem juros' },
  { count: 2, label: '2x sem juros' },
  { count: 3, label: '3x sem juros' },
  { count: 6, label: '6x com juros' },
  { count: 12, label: '12x com juros' },
];

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function detectCardBrand(number: string): string {
  const c = number.replace(/\D/g, '');
  if (c.startsWith('4')) return 'Visa';
  if (c.startsWith('5')) return 'Mastercard';
  if (c.startsWith('3')) return 'Amex';
  if (c.startsWith('6')) return 'Elo';
  return '';
}

function getBrandColor(brand: string): string {
  const map: Record<string, string> = { Visa: 'from-blue-600 to-blue-800', Mastercard: 'from-orange-500 to-red-600', Amex: 'from-blue-400 to-cyan-600', Elo: 'from-red-500 to-yellow-500' };
  return map[brand] || 'from-zinc-400 to-zinc-600';
}

function generateMockPixCode(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '00020126';
  for (let i = 0; i < 52; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  code += '5204000053039865802BR5925DOMPLACE COMERCIO6009DOM ELISEU62070503***63041D3D';
  return code;
}

function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 16);
  const parts = cleaned.match(/.{1,4}/g);
  return parts ? parts.join(' ') : '';
}

function formatExpiry(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length >= 3) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  return cleaned;
}

function CheckmarkAnimated() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
      className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white shadow-md"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <motion.path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.1 }} />
      </svg>
    </motion.div>
  );
}

interface PaymentMethodsProps {
  orderTotal?: number;
  onPaymentSelect?: (method: string) => void;
}

export function PaymentMethods({ orderTotal = 150.0, onPaymentSelect }: PaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState('pix');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [selectedInstallment, setSelectedInstallment] = useState(1);
  const [cashAmount, setCashAmount] = useState('');
  const [pixCodeCopied, setPixCodeCopied] = useState(false);

  const cardBrand = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);
  const pixCode = useMemo(() => generateMockPixCode(), []);
  const changeAmount = useMemo(() => {
    if (selectedMethod !== 'cash' || !cashAmount) return null;
    const amount = parseFloat(cashAmount.replace(',', '.'));
    if (isNaN(amount)) return null;
    const change = amount - orderTotal;
    return change > 0 ? change : null;
  }, [selectedMethod, cashAmount, orderTotal]);

  const handleMethodSelect = useCallback((methodId: string) => {
    setSelectedMethod(methodId);
    onPaymentSelect?.(methodId);
  }, [onPaymentSelect]);

  const handleCopyPix = useCallback(async () => {
    try { await navigator.clipboard.writeText(pixCode); } catch { /* fallback */ }
    setPixCodeCopied(true);
    setTimeout(() => setPixCodeCopied(false), 2500);
  }, [pixCode]);

  const inputClass = "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100";

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <motion.h2 initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
        className="mb-5 text-xl font-bold text-zinc-800 dark:text-zinc-100 sm:text-2xl">
        💳 Forma de Pagamento
      </motion.h2>

      {/* Animated pill selector */}
      <div className="mb-5 flex flex-wrap gap-2">
        {paymentMethods.map((method) => {
          const isActive = selectedMethod === method.id;
          return (
            <motion.button key={method.id} onClick={() => handleMethodSelect(method.id)} whileTap={{ scale: 0.95 }}
              className={`relative flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive ? 'text-white shadow-md' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600'}`}>
              {isActive && (
                <motion.div layoutId="payment-pill-bg" className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }} />
              )}
              <span className="relative z-10">{method.emoji}</span>
              <span className="relative z-10">{method.name}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Method cards */}
      <div className="space-y-3">
        {paymentMethods.map((method, index) => {
          const isActive = selectedMethod === method.id;
          return (
            <motion.div key={method.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring' as const, stiffness: 280, damping: 24, delay: index * 0.06 }}
              onClick={() => handleMethodSelect(method.id)}
              whileHover={{ scale: 1.01 }}
              className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                isActive ? 'border-green-500 bg-green-50/50 shadow-lg dark:bg-green-900/20' : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600'}`}>
              {isActive && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="absolute -inset-px rounded-xl bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 opacity-30" style={{ zIndex: -1 }} />
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.span className="text-2xl" animate={isActive ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>{method.emoji}</motion.span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{method.name}</h3>
                      {method.badge && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          method.badge === 'Recomendado' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                          {method.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{method.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">{method.processingTime}</span>
                  {isActive ? <CheckmarkAnimated /> : <div className="h-7 w-7 rounded-full border-2 border-zinc-300 dark:border-zinc-600" />}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Credit Card Fields */}
        {selectedMethod === 'credit' && (
          <motion.div key="credit-fields"
            initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 26 }} className="mt-5 overflow-hidden">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-700 dark:bg-zinc-800/50">
              <h4 className="mb-4 flex items-center justify-between text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                <span>Dados do Cartão</span>
                <AnimatePresence>
                  {cardBrand && (
                    <motion.div key={cardBrand} initial={{ opacity: 0, scale: 0.5, rotate: -20 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.5 }} transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                      className={`flex items-center gap-1.5 rounded-lg bg-gradient-to-r ${getBrandColor(cardBrand)} px-2.5 py-1 text-xs font-bold text-white shadow-sm`}>
                      {cardBrand}
                    </motion.div>
                  )}
                </AnimatePresence>
              </h4>
              <div className="mb-3">
                <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">Número do cartão</label>
                <input type="text" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} placeholder="0000 0000 0000 0000" maxLength={19} className={inputClass} />
              </div>
              <div className="mb-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">Nome no cartão</label>
                  <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Como no cartão" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">Validade</label>
                    <input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} placeholder="MM/AA" maxLength={5} className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">CVV</label>
                    <input type="password" value={cardCVV} onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="***" maxLength={4} className={inputClass} />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h5 className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">Parcelas</h5>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {installmentOptions.map((opt) => {
                    const isActive = selectedInstallment === opt.count;
                    const hasInterest = opt.count > 3;
                    const finalValue = hasInterest ? (orderTotal * Math.pow(1.02, opt.count - 1)) / opt.count : orderTotal / opt.count;
                    return (
                      <motion.button key={opt.count} onClick={() => setSelectedInstallment(opt.count)} whileTap={{ scale: 0.97 }}
                        className={`relative overflow-hidden rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                          isActive ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'}`}>
                        {isActive && (
                          <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="absolute inset-y-0 left-0 bg-green-100 dark:bg-green-900/20" />
                        )}
                        <div className="relative">
                          <div className="font-medium">{opt.count}x de {formatCurrency(finalValue)}</div>
                          <div className="text-[10px] opacity-70">{hasInterest ? 'com juros' : 'sem juros'}</div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pix */}
        {selectedMethod === 'pix' && (
          <motion.div key="pix-code" initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }} transition={{ type: 'spring' as const, stiffness: 300, damping: 26 }} className="mt-5 overflow-hidden">
            <div className="rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-800 dark:bg-green-900/20">
              <div className="mb-3 flex items-center gap-2">
                <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-xl">⚡</motion.span>
                <h4 className="text-sm font-semibold text-green-700 dark:text-green-300">Pagar com Pix</h4>
              </div>
              <div className="relative rounded-lg bg-white p-3 dark:bg-zinc-800">
                <code className="block break-all text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">{pixCode}</code>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleCopyPix}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-shadow hover:bg-green-600 hover:shadow-lg">
                <motion.span animate={pixCodeCopied ? { rotate: 360 } : {}} transition={{ duration: 0.4 }}>{pixCodeCopied ? '✅' : '📋'}</motion.span>
                {pixCodeCopied ? 'Código copiado!' : 'Copiar código Pix'}
              </motion.button>
              <p className="mt-2 text-center text-[10px] text-green-600/50 dark:text-green-400/40">Total: {formatCurrency(orderTotal)}</p>
            </div>
          </motion.div>
        )}

        {/* Cash */}
        {selectedMethod === 'cash' && (
          <motion.div key="cash-change" initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }} transition={{ type: 'spring' as const, stiffness: 300, damping: 26 }} className="mt-5 overflow-hidden">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-900/20">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xl">💵</span>
                <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-300">Pagamento em Dinheiro</h4>
              </div>
              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Valor entregue</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">R$</span>
                  <input type="text" value={cashAmount} onChange={(e) => setCashAmount(e.target.value)} placeholder="0,00" className={`${inputClass} pl-10`} />
                </div>
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {[50, 100, 150, 200, 300, 500].map((val) => (
                  <motion.button key={val} whileTap={{ scale: 0.95 }} onClick={() => setCashAmount(val.toString())}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 transition-colors hover:border-amber-300 hover:bg-amber-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 min-h-[44px]">
                    {formatCurrency(val)}
                  </motion.button>
                ))}
              </div>
              <div className="rounded-lg bg-white p-3 dark:bg-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Total do pedido:</span>
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{formatCurrency(orderTotal)}</span>
                </div>
                <div className="mt-1 border-t border-zinc-100 pt-1 dark:border-zinc-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Troco:</span>
                    <AnimatePresence mode="wait">
                      {changeAmount !== null ? (
                        <motion.span key="has-change" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                          className="text-sm font-bold text-green-600 dark:text-green-400">{formatCurrency(changeAmount)}</motion.span>
                      ) : (
                        <motion.span key="no-change" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="text-sm text-zinc-400 dark:text-zinc-500">{cashAmount ? 'Valor insuficiente' : '—'}</motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Boleto */}
        {selectedMethod === 'boleto' && (
          <motion.div key="boleto-info" initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }} transition={{ type: 'spring' as const, stiffness: 300, damping: 26 }} className="mt-5 overflow-hidden">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xl">📄</span>
                <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">Pagamento via Boleto</h4>
              </div>
              <div className="space-y-2 text-xs text-blue-600/80 dark:text-blue-400/60">
                <p>• O boleto será gerado após a confirmação do pedido</p>
                <p>• O pagamento pode levar até 2 dias úteis para ser processado</p>
                <p>• O pedido será liberado após a compensação do boleto</p>
              </div>
              <div className="mt-3 rounded-lg bg-white p-3 dark:bg-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Total:</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatCurrency(orderTotal)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Debit */}
        {selectedMethod === 'debit' && (
          <motion.div key="debit-info" initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }} transition={{ type: 'spring' as const, stiffness: 300, damping: 26 }} className="mt-5 overflow-hidden">
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-5 dark:border-purple-800 dark:bg-purple-900/20">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xl">🏦</span>
                <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300">Cartão de Débito na Entrega</h4>
              </div>
              <div className="space-y-2 text-xs text-purple-600/80 dark:text-purple-400/60">
                <p>• Tenha o cartão de débito em mãos na hora da entrega</p>
                <p>• A máquina de cartão será levada pelo entregador</p>
              </div>
              <div className="mt-3 rounded-lg bg-white p-3 dark:bg-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Total:</span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{formatCurrency(orderTotal)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default PaymentMethods;
