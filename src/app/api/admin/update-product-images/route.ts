import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { PRODUCT_REAL_IMAGES } from '@/lib/product-real-images'
import { logger } from '@/lib/logger'

/**
 * POST /api/admin/update-product-images
 * Updates all product images in the database with real Unsplash URLs.
 */
export async function POST(request: Request) {
  try {
    // Simple admin check
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET || 'domplace-admin-2024'}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all products
    const products = await db.product.findMany({
      select: { id: true, slug: true, name: true, images: true, store: { select: { slug: true } } },
    })

    logger.info(`[update-product-images] Found ${products.length} products to update`)

    let updated = 0
    let skipped = 0
    const errors: string[] = []

    for (const product of products) {
      const realImages = PRODUCT_REAL_IMAGES[product.slug]
      
      if (realImages && realImages.length > 0) {
        try {
          const newImagesJson = JSON.stringify(realImages)
          await db.product.update({
            where: { id: product.id },
            data: { images: newImagesJson },
          })
          updated++
          logger.info(`[update-product-images] Updated: ${product.name} (${product.slug}) → ${realImages.length} images`)
        } catch (err) {
          const msg = `Failed to update ${product.slug}: ${err instanceof Error ? err.message : 'unknown'}`
          errors.push(msg)
          logger.error(`[update-product-images] ${msg}`)
        }
      } else {
        skipped++
      }
    }

    // Also update store cover images
    const storeCovers = PRODUCT_REAL_IMAGES['__store_covers'] as Record<string, string> | undefined
    if (storeCovers) {
      const stores = await db.store.findMany({
        select: { id: true, slug: true, name: true, coverImage: true, logo: true },
      })

      for (const store of stores) {
        const coverUrl = storeCovers[store.slug]
        if (coverUrl) {
          try {
            await db.store.update({
              where: { id: store.id },
              data: {
                coverImage: coverUrl,
                logo: coverUrl,
              },
            })
            logger.info(`[update-product-images] Updated store: ${store.name} (${store.slug})`)
          } catch (err) {
            const msg = `Failed to update store ${store.slug}: ${err instanceof Error ? err.message : 'unknown'}`
            errors.push(msg)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Product images updated successfully',
      data: {
        total: products.length,
        updated,
        skipped,
        errors: errors.length > 0 ? errors : undefined,
      },
    })
  } catch (error) {
    logger.error('[update-product-images] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
