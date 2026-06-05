'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, ShoppingBag } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error for monitoring
    if (typeof console !== 'undefined') {
      console.error('[DomPlace] Application error:', error.message, error.digest)
    }
  }, [error])

  return (
    <html lang="pt-BR">
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: '#fafafa',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          textAlign: 'center',
          padding: '24px',
          maxWidth: '420px',
          width: '100%',
        }}>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #059669, #14b8a6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 4px 16px rgba(5, 150, 105, 0.25)',
            }}>
              <ShoppingBag style={{ width: 28, height: 28, color: 'white' }} />
            </div>
          </motion.div>

          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.15 }}
          >
            <AlertTriangle style={{
              width: 48,
              height: 48,
              color: '#f59e0b',
              margin: '0 auto 16px',
            }} />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#1a1a2e',
              margin: '0 0 8px',
              lineHeight: 1.3,
            }}
          >
            Ops! Algo deu errado
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              fontSize: 14,
              color: '#6b7280',
              margin: '0 0 28px',
              lineHeight: 1.5,
            }}
          >
            Ocorreu um erro inesperado ao carregar a página. 
            Isso geralmente é temporário — tente recarregar.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <button
              onClick={reset}
              style={{
                minHeight: 44,
                minWidth: 44,
                padding: '12px 24px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #059669, #14b8a6)',
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
              }}
            >
              <RefreshCw style={{ width: 16, height: 16 }} />
              Tentar novamente
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              style={{
                minHeight: 44,
                minWidth: 44,
                padding: '12px 24px',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                background: 'white',
                color: '#374151',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Home style={{ width: 16, height: 16 }} />
              Ir para o início
            </button>
          </motion.div>

          {/* Error Digest */}
          {error.digest && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{
                fontSize: 11,
                color: '#9ca3af',
                marginTop: 24,
              }}
            >
              Código do erro: {error.digest}
            </motion.p>
          )}
        </div>
      </body>
    </html>
  )
}
