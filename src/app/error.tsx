'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.warn('[DomPlace Error Boundary]', error.message)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          Ops! Algo deu errado
        </h2>
        <p className="text-sm text-muted-foreground">
          Ocorreu um erro inesperado. Tente recarregar a página.
        </p>
        <Button onClick={reset} className="min-h-[44px] min-w-[44px] gap-2">
          <RotateCcw className="h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    </div>
  )
}
