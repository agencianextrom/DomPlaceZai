'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Keyboard, ShoppingCart, QrCode, History, X, ArrowRight, Search, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'

interface ScannedProduct {
  id: string
  name: string
  price: number
  images: string
  storeId: string
  storeName: string
  category: string
}

interface ScanHistoryEntry {
  code: string
  productName: string
  scannedAt: string
}

interface ScanToShopProps {
  className?: string
}

const SCAN_HISTORY_KEY = 'r61-scan-history'
const MAX_HISTORY = 10

export function ScanToShop({ className = '' }: ScanToShopProps) {
  const [mode, setMode] = useState<'menu' | 'camera' | 'manual' | 'result'>('menu')
  const [barcode, setBarcode] = useState('')
  const [product, setProduct] = useState<ScannedProduct | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<ScanHistoryEntry[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const { addToCart } = useAppStore()

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SCAN_HISTORY_KEY)
      if (saved) {
        setHistory(JSON.parse(saved) as ScanHistoryEntry[])
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
    }
  }, [])

  const saveHistory = useCallback((code: string, productName: string) => {
    const entry: ScanHistoryEntry = {
      code,
      productName,
      scannedAt: new Date().toISOString(),
    }
    setHistory(prev => {
      const filtered = prev.filter(h => h.code !== code)
      const updated = [entry, ...filtered].slice(0, MAX_HISTORY)
      try {
        localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(updated))
      } catch {
        // Ignore localStorage errors
      }
      return updated
    })
  }, [])

  const startCamera = useCallback(async () => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch {
      setCameraError('Camera nao disponivel. Use a entrada manual.')
      setMode('manual')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [])

  const handleCameraOpen = useCallback(() => {
    setMode('camera')
    startCamera()
  }, [startCamera])

  const handleBack = useCallback(() => {
    stopCamera()
    setProduct(null)
    setError(null)
    setBarcode('')
    setCameraError(null)
    setMode('menu')
  }, [stopCamera])

  const lookupProduct = useCallback(async (code: string) => {
    setLoading(true)
    setError(null)
    setProduct(null)
    try {
      const res = await fetch(`/api/products?barcode=${encodeURIComponent(code)}`)
      if (!res.ok) throw new Error('Erro na busca')
      const data = await res.json()
      const products = data.products || []
      if (products.length > 0) {
        const p = products[0] as Record<string, unknown>
        const found: ScannedProduct = {
          id: String(p.id),
          name: String(p.name),
          price: Number(p.price) || 0,
          images: String(p.images || '[]'),
          storeId: String(p.storeId || ''),
          storeName: String(p.storeName || 'Loja'),
          category: String(p.category || 'OUTROS'),
        }
        setProduct(found)
        setMode('result')
        saveHistory(code, found.name)
      } else {
        setError('Produto nao encontrado. Tente outro codigo.')
      }
    } catch {
      setError('Erro ao buscar produto. Verifique sua conexao.')
    } finally {
      setLoading(false)
    }
  }, [saveHistory])

  const handleManualSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (barcode.trim()) {
      lookupProduct(barcode.trim())
    }
  }, [barcode, lookupProduct])

  const handleHistorySelect = useCallback((code: string) => {
    lookupProduct(code)
    setShowHistory(false)
  }, [lookupProduct])

  const handleAddToCart = useCallback(() => {
    if (!product) return
    const images = product.images.startsWith('[') ? product.images : '[]'
    addToCart({
      id: product.id,
      storeId: product.storeId,
      storeName: product.storeName,
      name: product.name,
      slug: product.name.toLowerCase().replace(/\s+/g, '-'),
      description: null,
      price: product.price,
      comparePrice: null,
      images,
      stock: 10,
      rating: 4.5,
      totalReviews: 10,
      isFeatured: false,
      isNew: false,
      isOffer: false,
      tags: '[]',
      variations: null,
      category: product.category,
    }, product.storeName, 1)
  }, [product, addToCart])

  return (
    <div className={`w-full ${className}`}>
      <section className="w-full bg-gradient-to-br from-emerald-50/50 via-background to-teal-50/30 rounded-2xl p-4 sm:p-5 border border-border/50 r62-card-lift">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
            <QrCode className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground r62-heading-gradient">Escanear Produto</h2>
            <p className="text-xs text-muted-foreground">Escaneie o codigo de barras para encontrar produtos</p>
          </div>
        </div>

        {/* Menu Mode */}
        {mode === 'menu' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleCameraOpen}
                className="min-h-[88px] flex-col gap-2 bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg active:scale-95 transition-transform"
              >
                <Camera className="h-6 w-6" />
                <span className="text-sm font-semibold">Escanear Camera</span>
              </Button>

              <Button
                onClick={() => setMode('manual')}
                className="min-h-[88px] flex-col gap-2 bg-gradient-to-br from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-lg active:scale-95 transition-transform"
              >
                <Keyboard className="h-6 w-6" />
                <span className="text-sm font-semibold">Digitar Codigo</span>
              </Button>
            </div>

            {history.length > 0 && (
              <div>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
                >
                  <History className="h-4 w-4" />
                  <span>Historico ({history.length})</span>
                  <ArrowRight className={`h-3 w-3 transition-transform ${showHistory ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence>
                  {showHistory && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1 mt-2">
                        {history.slice(0, 5).map((entry) => (
                          <button
                            key={`${entry.code}-${entry.scannedAt}`}
                            onClick={() => handleHistorySelect(entry.code)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left min-h-[44px] active:scale-[0.98] transition-transform"
                          >
                            <div className="flex items-center gap-2">
                              <QrCode className="h-4 w-4 text-emerald-500" />
                              <div>
                                <p className="text-sm font-medium truncate max-w-[200px]">{entry.productName}</p>
                                <p className="text-[10px] text-muted-foreground">{entry.code}</p>
                              </div>
                            </div>
                            <Search className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* Camera Mode */}
        {mode === 'camera' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
            className="space-y-3"
          >
            <div className="r61-scan-viewfinder aspect-[4/3] w-full max-w-sm mx-auto bg-black rounded-xl overflow-hidden">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="r61-scan-line" />
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <p className="text-white text-sm text-center px-4">{cameraError}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={handleBack}
                className="min-h-[44px] gap-2 active:scale-95 transition-transform"
              >
                <X className="h-4 w-4" />
                Voltar
              </Button>
              <Button
                onClick={() => setMode('manual')}
                className="min-h-[44px] gap-2 active:scale-95 transition-transform"
              >
                <Keyboard className="h-4 w-4" />
                Digitar
              </Button>
            </div>
          </motion.div>
        )}

        {/* Manual Mode */}
        {mode === 'manual' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
          >
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Codigo de barras</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Digite o codigo..."
                  className="w-full min-h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="min-h-[44px] gap-2 active:scale-95 transition-transform"
                >
                  <X className="h-4 w-4" />
                  Voltar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !barcode.trim()}
                  className="flex-1 min-h-[44px] gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white active:scale-95 transition-transform"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}
                      className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Buscar
                </Button>
              </div>
            </form>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive text-center mt-2"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Result Mode */}
        {mode === 'result' && product && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
            className="space-y-3"
          >
            <div className="r61-scan-product-card p-4">
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shrink-0">
                  <Sparkles className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.storeName}</p>
                  <p className="text-lg font-bold text-emerald-600 mt-1">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full mt-3 min-h-[44px] gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold r61-scan-btn"
              >
                <ShoppingCart className="h-4 w-4" />
                Adicionar ao Carrinho
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 min-h-[44px] gap-2 active:scale-95 transition-transform"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Escanear outro
              </Button>
              <Button
                onClick={() => {
                  handleAddToCart()
                  handleBack()
                }}
                className="flex-1 min-h-[44px] gap-2 active:scale-95 transition-transform"
              >
                <ShoppingCart className="h-4 w-4" />
                Comprar
              </Button>
            </div>
          </motion.div>
        )}

        {/* Loading Overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-2xl bg-background/80 backdrop-blur-sm flex items-center justify-center z-20"
            >
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}
                  className="h-8 w-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full"
                />
                <p className="text-sm text-muted-foreground">Buscando produto...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  )
}
