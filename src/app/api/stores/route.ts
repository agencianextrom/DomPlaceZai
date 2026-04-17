import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const where: any = {
      status: 'ACTIVE',
    }
    
    if (category) {
      where.category = category
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }
    
    const [stores, total] = await Promise.all([
      db.store.findMany({
        where,
        include: {
          account: { select: { name: true, avatar: true } },
        },
        orderBy: { weeklyScore: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.store.count({ where }),
    ])
    
    return NextResponse.json({
      stores: stores.map(s => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        description: s.description,
        category: s.category,
        logo: s.logo,
        coverImage: s.coverImage,
        phone: s.phone,
        whatsapp: s.whatsapp,
        address: s.address,
        neighborhood: s.neighborhood,
        city: s.city,
        state: s.state,
        deliveryFee: s.deliveryFee,
        freeDeliveryAbove: s.freeDeliveryAbove,
        rating: s.rating,
        totalReviews: s.totalReviews,
        opensAt: s.opensAt,
        closesAt: s.closesAt,
        openDays: s.openDays,
      })),
      total,
      limit,
      offset,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
