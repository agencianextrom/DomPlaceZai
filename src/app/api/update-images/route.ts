import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { productImageMap, storeImageMap } from '@/lib/product-images'
import { getErrorMessage } from '@/lib/api-response'
import { logger } from '@/lib/logger'

/**
 * POST /api/update-images
 * Updates existing products and stores with real image URLs from Unsplash
 * This is a one-time migration endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check — admin only
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    const accountId = (session.user as any)?.id
    const account = await db.account.findUnique({ where: { id: accountId } })
    if (!account || account.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas administradores' }, { status: 403 })
    }

    let updatedProducts = 0
    let updatedStores = 0
    let errors: string[] = []

    // Update all products with real images
    const products = await db.product.findMany({
      select: { id: true, slug: true, images: true }
    })

    for (const product of products) {
      const imageUrl = productImageMap[product.slug]
      if (!imageUrl) continue

      try {
        await db.product.update({
          where: { id: product.id },
          data: {
            images: JSON.stringify([imageUrl])
          }
        })
        updatedProducts++
      } catch (err: any) {
        errors.push(`Product ${product.slug}: ${err.message}`)
      }
    }

    // Update all stores with real cover images and logos
    const stores = await db.store.findMany({
      select: { id: true, slug: true, coverImage: true, logo: true }
    })

    for (const store of stores) {
      const imageUrl = storeImageMap[store.slug]
      if (!imageUrl) continue

      try {
        await db.store.update({
          where: { id: store.id },
          data: {
            coverImage: imageUrl,
            logo: imageUrl
          }
        })
        updatedStores++
      } catch (err: any) {
        errors.push(`Store ${store.slug}: ${err.message}`)
      }
    }

    // Update banners with real store images
    const banners = await db.banner.findMany({
      select: { id: true, storeId: true, image: true }
    })

    for (const banner of banners) {
      const store = stores.find(s => s.id === banner.storeId)
      if (!store) continue

      const imageUrl = storeImageMap[store.slug]
      if (!imageUrl) continue

      try {
        await db.banner.update({
          where: { id: banner.id },
          data: { image: imageUrl }
        })
      } catch (err: any) {
        errors.push(`Banner ${banner.id}: ${err.message}`)
      }
    }

    logger.info(`Image update complete: ${updatedProducts} products, ${updatedStores} stores updated`)

    return NextResponse.json({
      success: true,
      message: 'Images updated successfully!',
      data: {
        updatedProducts,
        updatedStores,
        totalProducts: products.length,
        errors: errors.length > 0 ? errors : undefined
      }
    })
  } catch (error) {
    logger.error('Update images error:', error)
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  return POST(new NextRequest('/api/update-images', { method: 'POST' }))
}
