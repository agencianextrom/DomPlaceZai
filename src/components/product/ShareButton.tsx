'use client'

import { Share2, Copy, Check, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { toast } from 'sonner'
import { useState } from 'react'
import { formatBRL } from '@/components/product/ProductCard'

interface ShareButtonProps {
  productName: string
  productPrice: number
  storeName: string
}

export function ShareButton({ productName, productPrice, storeName }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const message = `Confira este produto no DomPlace: ${productName} por ${formatBRL(productPrice)} na loja ${storeName}! Acesse: ${typeof window !== 'undefined' ? window.location.href : 'https://domplace.com'}`

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
    toast.success('Abrindo WhatsApp...')
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      toast.success('Link copiado para a área de transferência!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Não foi possível copiar o link')
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex-1 h-12 border-primary/30 text-primary hover:bg-primary/5"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="center">
        <div className="space-y-1">
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
          >
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
              <MessageCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">WhatsApp</p>
              <p className="text-[10px] text-muted-foreground">Enviar por WhatsApp</p>
            </div>
          </button>
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
          >
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
              {copied ? (
                <Check className="h-5 w-5 text-emerald-600" />
              ) : (
                <Copy className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-semibold text-sm">{copied ? 'Copiado!' : 'Copiar Link'}</p>
              <p className="text-[10px] text-muted-foreground">Copiar mensagem</p>
            </div>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
