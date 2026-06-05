'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (typeof console !== 'undefined') {
      console.error('[DomPlace] Route error:', error.message, error.digest)
    }
  }, [error])

  return (
    <div className="r68-error-page flex flex-col items-center justify-center min-h-[60vh] px-4 py-12 text-center">
      {/* Icon */}
      <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
      </div>

      {/* Heading */}
      <h2 className="text-xl font-bold text-foreground mb-2">
        Ops! Algo deu errado
      </h2>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-8 max-w-sm leading-relaxed">
        Ocorreu um erro inesperado ao carregar esta seção.
        Tente recarregar ou volte para a página inicial.
      </p>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap justify-center">
        <Button
          onClick={reset}
          className="min-h-[44px] min-w-[44px] gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
        <Button
          variant="outline"
          onClick={() => (window.location.href = '/')}
          className="min-h-[44px] min-w-[44px] gap-2"
        >
          <Home className="h-4 w-4" />
          Início
        </Button>
      </div>

      {/* Error Digest */}
      {error.digest && (
        <p className="text-[11px] text-muted-foreground/60 mt-8">
          Código: {error.digest}
        </p>
      )}
    </div>
  )
}
