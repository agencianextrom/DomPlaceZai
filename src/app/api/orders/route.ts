import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { accountId, storeId, items, deliveryType, deliveryAddress, paymentMethod, notes } = body
    
    if (!accountId || !storeId || !items || items.length === 0) {
      return NextResponse.json({ error: 'accountId, storeId, and items are required' }, { status: 400 })
    }
    
    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    
    // Get store delivery fee
    const store = await db.store.findUnique({ where: { id: storeId } })
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }
    
    const deliveryFee = deliveryType === 'PICKUP' ? 0 : (store.deliveryFee || 0)
    const total = subtotal + deliveryFee
    
    // Generate order number
    const orderCount = await db.order.count()
    const orderNumber = `DP${String(orderCount + 1).padStart(6, '0')}`
    
    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        accountId,
        storeId,
        status: 'PENDING',
        subtotal,
        deliveryFee,
        total,
        paymentMethod: paymentMethod || 'PIX',
        deliveryType: deliveryType || 'DELIVERY',
        deliveryAddress: deliveryAddress || null,
        notes: notes || null,
        commission: total * store.commissionRate,
        commissionRate: store.commissionRate,
        estimatedTime: '30-60 min',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName || item.name,
            productImage: item.productImage || null,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
          })),
        },
        statusHistory: {
          create: {
            status: 'PENDING',
            note: 'Pedido recebido',
          },
        },
      },
      include: {
        items: true,
        store: { select: { name: true } },
      },
    })
    
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        storeName: order.store.name,
        status: order.status,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
        createdAt: order.createdAt,
      },
    })
  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
