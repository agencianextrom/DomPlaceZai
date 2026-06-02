import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// In-memory cache for news (5 minute TTL)
let cachedNews: NewsItem[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

interface NewsItem {
  id: string
  title: string
  snippet: string
  source: string
  date: string
  url: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '5')
    const offset = (page - 1) * limit

    // Check cache
    const now = Date.now()
    if (cachedNews && now - cacheTimestamp < CACHE_TTL) {
      const paginated = cachedNews.slice(offset, offset + limit)
      return NextResponse.json({
        news: paginated,
        total: cachedNews.length,
        page,
        hasMore: offset + limit < cachedNews.length,
      })
    }

    // Use web search SDK
    const zai = await ZAI.create()
    const searchResults = await zai.web.search({
      query: 'Dom Eliseu Pará notícias',
      count: 10,
    })

    // Transform search results into news items
    const news: NewsItem[] = (searchResults?.results || []).map((result: any, index: number) => ({
      id: `news-${Date.now()}-${index}`,
      title: result.title || 'Notícia de Dom Eliseu',
      snippet: result.snippet || result.description || '',
      source: result.source || result.domain || 'Fonte local',
      date: result.date || result.publishedDate || new Date().toLocaleDateString('pt-BR'),
      url: result.url || result.link || '#',
    })).filter((item: NewsItem) =>
      item.title && item.snippet && item.snippet.length > 20
    )

    // Update cache
    cachedNews = news
    cacheTimestamp = now

    const paginated = news.slice(offset, offset + limit)

    return NextResponse.json({
      news: paginated,
      total: news.length,
      page,
      hasMore: offset + limit < news.length,
    })
  } catch (error) {
    console.error('News API error:', error)

    // Fallback news items
    const fallbackNews: NewsItem[] = [
      {
        id: 'fallback-1',
        title: 'Feira do Produtor Rural neste sábado no Centro de Dom Eliseu',
        snippet: 'Produtos frescos direto do produtor rural com preços especiais para a comunidade. Venha aproveitar!',
        source: 'Notícias Locais',
        date: new Date().toLocaleDateString('pt-BR'),
        url: '#',
      },
      {
        id: 'fallback-2',
        title: 'Novo posto de saúde abre em Dom Eliseu com atendimento gratuito',
        snippet: 'A comunidade de Dom Eliseu ganha mais uma unidade de saúde com novos equipamentos e profissionais.',
        source: 'Portal Pará',
        date: new Date().toLocaleDateString('pt-BR'),
        url: '#',
      },
      {
        id: 'fallback-3',
        title: 'Campeonato Regional em Dom Eliseu reúne times da região',
        snippet: 'Jogos emocionantes no estádio municipal com equipes de Dom Eliseu e cidades vizinhas.',
        source: 'Esporte Pará',
        date: new Date().toLocaleDateString('pt-BR'),
        url: '#',
      },
      {
        id: 'fallback-4',
        title: 'Rodovia PA-279 recebe melhorias na pavimentação',
        snippet: 'Serviços de manutenção e sinalização na rodovia que conecta Dom Eliseu a outros municípios.',
        source: 'Transparência PA',
        date: new Date().toLocaleDateString('pt-BR'),
        url: '#',
      },
      {
        id: 'fallback-5',
        title: 'Programa de fidelidade beneficia comerciantes de Dom Eliseu',
        snippet: 'Iniciativa municipal impulsiona o comércio local com benefícios para quem compra na cidade.',
        source: 'Comércio PA',
        date: new Date().toLocaleDateString('pt-BR'),
        url: '#',
      },
    ]

    const page = parseInt(new URL(request.url).searchParams.get('page') || '1')
    const limit = parseInt(new URL(request.url).searchParams.get('limit') || '5')
    const offset = (page - 1) * limit
    const paginated = fallbackNews.slice(offset, offset + limit)

    return NextResponse.json({
      news: paginated,
      total: fallbackNews.length,
      page,
      hasMore: offset + limit < fallbackNews.length,
    })
  }
}
