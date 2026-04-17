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
    const grouped: Record<string, any[]> = {}
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
