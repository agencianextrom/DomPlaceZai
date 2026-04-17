import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const store = await db.store.findUnique({
      where: { id },
      include: {
        account: { select: { name: true, avatar: true } },
        products: {
          where: { status: 'ACTIVE' },
          orderBy: { soldCount: 'desc' },
          take: 50,
        },
      },
    })
    
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      id: store.id,
      name: store.name,
      slug: store.slug,
      description: store.description,
      category: store.category,
      logo: store.logo,
      coverImage: store.coverImage,
      phone: store.phone,
      whatsapp: store.whatsapp,
      address: store.address,
      neighborhood: store.neighborhood,
      city: store.city,
      state: store.state,
      deliveryFee: store.deliveryFee,
      freeDeliveryAbove: store.freeDeliveryAbove,
      rating: store.rating,
      totalReviews: store.totalReviews,
      totalSales: store.totalSales,
      opensAt: store.opensAt,
      closesAt: store.closesAt,
      openDays: store.openDays,
      pixKey: store.pixKey,
      socialMedia: store.socialMedia,
      products: store.products.map(p => ({
        id: p.id,
        storeId: p.storeId,
        storeName: store.name,
        storeLogo: store.logo,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice,
        images: p.images,
        stock: p.stock,
        rating: p.rating,
        totalReviews: p.totalReviews,
        isFeatured: p.isFeatured,
        isNew: p.isNew,
        isOffer: p.isOffer,
        tags: p.tags,
        variations: p.variations,
        category: store.category,
      })),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
