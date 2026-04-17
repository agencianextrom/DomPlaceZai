'use client'

import { Handshake, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const partners = [
  { name: 'Cooperativa AgroVida', desc: 'Produtos orgânicos direto do produtor', gradient: 'from-green-500 to-emerald-600' },
  { name: 'Feira Livre Dom Eliseu', desc: 'Toda sexta-feira no centro da cidade', gradient: 'from-amber-500 to-orange-600' },
  { name: 'ART Pará', desc: 'Artesanato local com qualidade', gradient: 'from-rose-500 to-pink-600' },
]

export function PartnersBanner() {
  return (
    <section className="w-full">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Handshake className="h-5 w-5 text-primary" />
        <h2 className="text-lg sm:text-xl font-bold">Parcerias Locais</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {partners.map((partner) => (
          <div
            key={partner.name}
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${partner.gradient} p-4 sm:p-5 text-white`}
          >
            <div className="absolute right-2 top-2 opacity-10">
              <Sparkles className="h-16 w-16" />
            </div>
            <h3 className="font-semibold text-base sm:text-lg">{partner.name}</h3>
            <p className="text-sm text-white/90 mt-1">{partner.desc}</p>
            <Button variant="secondary" size="sm" className="mt-3 bg-white/20 hover:bg-white/30 text-white border-0">
              Conhecer
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}
