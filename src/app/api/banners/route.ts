import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const banners = await db.banner.findMany({
      where: { isActive: true },
      include: {
        store: { select: { name: true } },
      },
      orderBy: [{ level: 'asc' }, { order: 'asc' }],
    })
    
    // Group by level
    interface BannerItem {
      id: string; storeId: string; storeName: string; title: string; subtitle: string | null; image: string | null; link: string | null; level: string; order: number
    }
    const grouped: Record<string, BannerItem[]> = {}
    banners.forEach(b => {
      if (!grouped[b.level]) grouped[b.level] = []
      grouped[b.level].push({
        id: b.id,
        storeId: b.storeId,
        storeName: b.store.name,
        title: b.title,
        subtitle: b.subtitle,
        image: b.image,
        link: b.link,
        level: b.level,
        order: b.order,
      })
    })
    
    return NextResponse.json({ banners: grouped, total: banners.length })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }, { status: 500 })
  }
}
