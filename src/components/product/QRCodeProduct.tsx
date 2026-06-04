'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

interface QRCodeProductProps {
  productId: string;
  productName: string;
  price: number;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function hashChar(str: string, index: number): number {
  const c = str.charCodeAt(index % str.length);
  return ((c * 7 + 13) ^ (index * 31)) & 0xff;
}

function generateQRPattern(seed: string, gridSize = 21): boolean[][] {
  const grid: boolean[][] = [];
  for (let r = 0; r < gridSize; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < gridSize; c++) {
      const isFinderTL = r < 7 && c < 7 && (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
      const isFinderTR = r < 7 && c >= gridSize - 7 && (r === 0 || r === 6 || c === gridSize - 7 || c === gridSize - 1 || (r >= 2 && r <= 4 && c >= gridSize - 5 && c <= gridSize - 3));
      const isFinderBL = r >= gridSize - 7 && c < 7 && (r === gridSize - 7 || r === gridSize - 1 || c === 0 || c === 6 || (r >= gridSize - 5 && r <= gridSize - 3 && c >= 2 && c <= 4));
      if (isFinderTL || isFinderTR || isFinderBL) {
        row.push(true);
      } else {
        const val = hashChar(seed, r * gridSize + c);
        row.push(val > 100);
      }
    }
    grid.push(row);
  }
  return grid;
}

function QRSvg({ seed, size = 200 }: { seed: string; size?: number }) {
  const gridSize = 21;
  const pattern = useMemo(() => generateQRPattern(seed, gridSize), [seed]);
  const cellSize = size / gridSize;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
      <rect width={size} height={size} fill="white" rx="4" />
      {pattern.map((row, r) =>
        row.map((filled, c) =>
          filled ? <rect key={`${r}-${c}`} x={c * cellSize} y={r * cellSize} width={cellSize} height={cellSize} fill="#1a1a2e" rx={1} /> : null
        )
      )}
    </svg>
  );
}

function FloatingParticles() {
  const particles = useMemo(
    () => Array.from({ length: 10 }).map((_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 4 + 2, delay: Math.random() * 3, duration: Math.random() * 4 + 4,
    })),
    []
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-emerald-400/20"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{ y: [0, -30, 0, 20, 0], x: [0, 15, -10, 5, 0], opacity: [0.2, 0.6, 0.3, 0.5, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

export function QRCodeProduct({ productId, productName, price }: QRCodeProductProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const svgRef = useRef<HTMLDivElement>(null);

  const productUrl = useMemo(() => `https://domplacezai.com.br/produto/${productId}`, [productId]);

  useEffect(() => { setMounted(true); }, []);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
    } catch {
      const el = document.createElement('textarea');
      el.value = productUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [productUrl]);

  const handleWhatsAppShare = useCallback(() => {
    const text = encodeURIComponent(`Confira este produto no DomPlace: ${productName} por ${formatCurrency(price)}\n${productUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }, [productName, price, productUrl]);

  const handleDownloadQR = useCallback(() => {
    const svgEl = svgRef.current?.querySelector('svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 0, 0, 400, 400);
      ctx.fillStyle = '#1a1a2e';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(productName, 200, 370);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qrcode-${productId}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  }, [productId, productName]);

  if (!mounted) {
    return (
      <div className="flex animate-pulse items-center justify-center rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-800">
        <div className="h-48 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 260, damping: 20 }}
      className="relative mx-auto w-full max-w-sm"
    >
      <FloatingParticles />
      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/60 p-6 shadow-xl backdrop-blur-xl dark:border-zinc-600/30 dark:bg-zinc-800/60 sm:p-8">
        <div className="mb-5 overflow-hidden rounded-xl">
          <motion.h3
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative bg-gradient-to-r from-zinc-800 via-zinc-600 to-zinc-800 bg-clip-text text-center text-lg font-bold text-transparent dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-100 sm:text-xl"
          >
            📱 Compartilhar produto
            <motion.div
              className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            />
          </motion.h3>
        </div>

        <motion.div
          ref={svgRef}
          initial={{ opacity: 0, rotateY: -15 }}
          animate={{ opacity: 1, rotateY: 0 }}
          transition={{ delay: 0.2, type: 'spring' as const, stiffness: 200, damping: 18 }}
          className="mx-auto mb-5 flex items-center justify-center rounded-2xl border border-zinc-100 bg-white p-4 shadow-inner dark:border-zinc-700 dark:bg-zinc-900"
        >
          <QRSvg seed={productId} size={180} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mb-5 text-center">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 sm:text-base">{productName}</p>
          <p className="mt-1 text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(price)}</p>
        </motion.div>

        <div className="flex flex-col gap-2.5">
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600">
            <motion.span animate={copied ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>{copied ? '✅' : '🔗'}</motion.span>
            {copied ? 'Link copiado!' : 'Copiar link'}
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleWhatsAppShare}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-shadow hover:shadow-lg">
            <span>💬</span> WhatsApp
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleDownloadQR}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-shadow hover:shadow-lg">
            <span>📥</span> Baixar QR Code
          </motion.button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-4 truncate rounded-lg bg-zinc-100 px-3 py-2 text-center text-xs text-zinc-500 dark:bg-zinc-700/50 dark:text-zinc-400">
          {productUrl}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default QRCodeProduct;
