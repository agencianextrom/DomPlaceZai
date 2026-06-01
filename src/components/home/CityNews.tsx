'use client'

import { motion } from 'framer-motion'
import { ChevronRight, Calendar, MapPin } from 'lucide-react'
import { Newspaper } from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  description: string
  date: string
  gradient: string
  icon: string
}

const newsItems: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Feira do Produtor Rural neste sábado no Centro',
    description: 'Produtos frescos direto do produtor com preços especiais.',
    date: 'Hoje',
    gradient: 'from-emerald-500/20 to-teal-500/10',
    icon: '🥬',
  },
  {
    id: 'news-2',
    title: 'Novo posto de saúde abre segunda-feira no Bairro São José',
    description: 'Atendimento gratuito para toda a comunidade com novos equipamentos.',
    date: 'Segunda',
    gradient: 'from-rose-500/20 to-pink-500/10',
    icon: '🏥',
  },
  {
    id: 'news-3',
    title: 'Campeonato de Futebol Regional - Jogo final neste domingo',
    description: 'Jogo decisivo entre Dom Eliseu e Paragominas no estádio municipal.',
    date: 'Domingo',
    gradient: 'from-amber-500/20 to-orange-500/10',
    icon: '⚽',
  },
  {
    id: 'news-4',
    title: 'Açaí Fest retorna em julho com grande programação',
    description: 'Festival cultural com shows, culinária e muito açaí!',
    date: 'Julho',
    gradient: 'from-purple-500/20 to-fuchsia-500/10',
    icon: '🍇',
  },
  {
    id: 'news-5',
    title: 'Rodovia PA-279 recebe manutenção nesta semana',
    description: 'Serviços de pavimentação e sinalização entre Dom Eliseu e Ulianópolis.',
    date: 'Esta semana',
    gradient: 'from-slate-500/20 to-gray-500/10',
    icon: '🛣️',
  },
]

export function CityNews() {
  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
          <span className="text-xl">📰</span>
          <span className="text-gradient-primary bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
            Novidades de Dom Eliseu
          </span>
        </h2>
        <motion.button
          whileHover={{ x: 3 }}
          className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
        >
          Ver mais
          <ChevronRight className="h-3.5 w-3.5" />
        </motion.button>
      </div>

      {/* Horizontal scrollable cards - max 3 visible */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 snap-x snap-mandatory">
        {newsItems.slice(0, 5).map((news, index) => (
          <motion.article
            key={news.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08, duration: 0.35 }}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="shrink-0 w-[280px] sm:w-[300px] snap-start rounded-xl bg-card border border-border/50 overflow-hidden cursor-pointer group hover:shadow-lg hover:border-primary/20 transition-all"
          >
            {/* Image placeholder area */}
            <div className={`relative h-28 bg-gradient-to-br ${news.gradient} flex items-center justify-center`}>
              <span className="text-4xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                {news.icon}
              </span>
              {/* Date badge */}
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-medium text-muted-foreground">{news.date}</span>
              </div>
              {/* Location badge */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                <MapPin className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-medium text-primary">Dom Eliseu</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-3">
              <h3 className="text-sm font-semibold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                {news.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                {news.description}
              </p>
              <div className="flex items-center gap-1 mt-2 text-[10px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Ler mais
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
