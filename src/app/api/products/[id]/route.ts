import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const product = await db.product.findUnique({
      where: { id },
      include: {
        store: { select: { name: true, logo: true, category: true, id: true } },
      },
    })
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      id: product.id,
      storeId: product.storeId,
      storeName: product.store.name,
      storeLogo: product.store.logo,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      comparePrice: product.comparePrice,
      images: product.images,
      stock: product.stock,
      rating: product.rating,
      totalReviews: product.totalReviews,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      isOffer: product.isOffer,
      tags: product.tags,
      variations: product.variations,
      category: product.store.category,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
