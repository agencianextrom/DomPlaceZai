'use client'

import { Handshake, Sparkles, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

const partners = [
  { name: 'Cooperativa AgroVida', desc: 'Produtos orgânicos direto do produtor', gradient: 'from-green-500 to-emerald-600', icon: '🌿' },
  { name: 'Feira Livre Dom Eliseu', desc: 'Toda sexta-feira no centro da cidade', gradient: 'from-amber-500 to-orange-600', icon: '🏪' },
  { name: 'ART Pará', desc: 'Artesanato local com qualidade', gradient: 'from-rose-500 to-pink-600', icon: '🎨' },
]

export function PartnersBanner() {
  return (
    <section className="w-full">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Handshake className="h-5 w-5 text-primary" />
        <h2 className="text-lg sm:text-xl font-bold">Parcerias Locais</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {partners.map((partner, index) => (
          <motion.div
            key={partner.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.15)' }}
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${partner.gradient} p-4 sm:p-5 text-white cursor-pointer group transition-shadow duration-300`}
          >
            {/* Animated background shapes */}
            <motion.div
              className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10"
              animate={{ scale: [1, 1.15, 1], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 }}
            />
            <motion.div
              className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full bg-white/8"
              animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 }}
            />

            {/* Dot pattern overlay */}
            <div className="absolute inset-0 dot-pattern opacity-30" />

            <div className="relative z-10">
              <span className="text-2xl mb-2 block">{partner.icon}</span>
              <h3 className="font-semibold text-base sm:text-lg">{partner.name}</h3>
              <p className="text-sm text-white/90 mt-1">{partner.desc}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3 bg-white/20 hover:bg-white/30 text-white border-0 group-hover:bg-white/40 transition-all duration-200"
              >
                Conhecer
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
