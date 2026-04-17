import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')
    
    if (!accountId) {
      return NextResponse.json({ items: [] })
    }
    
    const items = await db.cartItem.findMany({
      where: { accountId },
      include: {
        product: {
          include: { store: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json({
      items: items.map(item => ({
        id: item.id,
        productId: item.productId,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          comparePrice: item.product.comparePrice,
          images: item.product.images,
          stock: item.product.stock,
          storeName: item.product.store.name,
        },
        storeId: item.product.storeId,
        storeName: item.product.store.name,
        quantity: item.quantity,
      })),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { accountId, productId, quantity = 1 } = body
    
    if (!accountId || !productId) {
      return NextResponse.json({ error: 'accountId and productId required' }, { status: 400 })
    }
    
    // Check if product exists
    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    // Check if already in cart
    const existing = await db.cartItem.findFirst({
      where: { accountId, productId },
    })
    
    if (existing) {
      const updated = await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      })
      return NextResponse.json({ success: true, cartItem: updated })
    }
    
    const cartItem = await db.cartItem.create({
      data: { accountId, productId, quantity },
    })
    
    return NextResponse.json({ success: true, cartItem })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cartItemId = searchParams.get('id')
    const accountId = searchParams.get('accountId')
    
    if (cartItemId) {
      await db.cartItem.delete({ where: { id: cartItemId } })
      return NextResponse.json({ success: true })
    }
    
    if (accountId) {
      await db.cartItem.deleteMany({ where: { accountId } })
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ error: 'id or accountId required' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
