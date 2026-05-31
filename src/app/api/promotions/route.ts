import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { apiError } from '@/lib/api-response'

// GET: Fetch active promotions/coupons
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const code = searchParams.get('code')

    if (code) {
      // Validate a specific coupon code
      const promotion = await db.promotion.findFirst({
        where: {
          code: code.toUpperCase(),
          isActive: true,
          startsAt: { lte: new Date() },
          endsAt: { gte: new Date() },
        },
      })
      if (!promotion) {
        return NextResponse.json({ valid: false, error: 'Cupom inválido ou expirado' })
      }
      return NextResponse.json({
        valid: true,
        promotion: {
          id: promotion.id,
          code: promotion.code,
          title: promotion.title,
          type: promotion.type,
          value: promotion.value,
          minOrderValue: promotion.minOrderValue,
          maxDiscount: promotion.maxDiscount,
          description: promotion.description,
          endsAt: promotion.endsAt,
        },
      })
    }

    // Fetch all active promotions
    const where: Record<string, unknown> = {
      isActive: true,
      startsAt: { lte: new Date() },
      endsAt: { gte: new Date() },
    }
    if (storeId) where.storeId = storeId

    const promotions = await db.promotion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({ promotions })
  } catch (error) {
    console.error('[Promotions API] Error:', error)
    return apiError('Erro ao buscar promoções', 500, 'FETCH_ERROR')
  }
}
