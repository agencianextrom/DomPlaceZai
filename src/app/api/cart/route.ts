import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET: Buscar itens do carrinho de um usuário autenticado
// Para usuários autenticados, usa a sessão; para não autenticados, retorna vazio (cliente usa Zustand)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId') || (session?.user as any)?.id

    if (!accountId) {
      return NextResponse.json({ items: [] })
    }

    const items = await db.cartItem.findMany({
      where: { accountId },
      include: {
        product: {
          include: { store: { select: { name: true, deliveryFee: true, freeDeliveryAbove: true } } },
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
          slug: item.product.slug,
          description: item.product.description,
          price: item.product.price,
          comparePrice: item.product.comparePrice,
          images: item.product.images,
          stock: item.product.stock,
          rating: item.product.rating,
          totalReviews: item.product.totalReviews,
          isFeatured: item.product.isFeatured,
          isNew: item.product.isNew,
          isOffer: item.product.isOffer,
          tags: item.product.tags,
          variations: item.product.variations,
          category: '',
          storeName: item.product.store.name,
          storeId: item.product.storeId,
          storeLogo: null,
        },
        storeId: item.product.storeId,
        storeName: item.product.store.name,
        quantity: item.quantity,
      })),
      storeData: {
        deliveryFee: items.length > 0 ? items[0].product.store.deliveryFee : 0,
        freeDeliveryAbove: items.length > 0 ? items[0].product.store.freeDeliveryAbove : null,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Adicionar item ao carrinho (upsert)
// Se usuário autenticado, salva no DB; caso contrário, usa accountId do body
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const accountId = body.accountId || (session?.user as any)?.id
    const { productId, quantity = 1 } = body

    if (!accountId || !productId) {
      return NextResponse.json({ error: 'ID da conta e ID do produto são obrigatórios' }, { status: 400 })
    }

    if (quantity < 1) {
      return NextResponse.json({ error: 'Quantidade deve ser pelo menos 1' }, { status: 400 })
    }

    // Verificar se o produto existe e está disponível
    const product = await db.product.findUnique({
      where: { id: productId },
      include: { store: { select: { name: true, deliveryFee: true, freeDeliveryAbove: true } } },
    })
    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    if (product.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Produto não está disponível' }, { status: 400 })
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: `Estoque insuficiente. Disponível: ${product.stock}` },
        { status: 400 }
      )
    }

    // Verificar se já está no carrinho (upsert)
    const existing = await db.cartItem.findFirst({
      where: { accountId, productId },
    })

    if (existing) {
      const newQuantity = Math.min(existing.quantity + quantity, product.stock)
      const updated = await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQuantity },
      })
      return NextResponse.json({
        success: true,
        cartItem: {
          id: updated.id,
          productId: updated.productId,
          quantity: updated.quantity,
        },
        storeData: {
          storeId: product.storeId,
          storeName: product.store.name,
          deliveryFee: product.store.deliveryFee,
          freeDeliveryAbove: product.store.freeDeliveryAbove,
        },
        message: 'Quantidade atualizada no carrinho',
      })
    }

    const cartItem = await db.cartItem.create({
      data: { accountId, productId, quantity },
    })

    return NextResponse.json({
      success: true,
      cartItem: {
        id: cartItem.id,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
      },
      storeData: {
        storeId: product.storeId,
        storeName: product.store.name,
        deliveryFee: product.store.deliveryFee,
        freeDeliveryAbove: product.store.freeDeliveryAbove,
      },
      message: 'Produto adicionado ao carrinho',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH: Atualizar quantidade de um item no carrinho
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { cartItemId, quantity, accountId: bodyAccountId, productId: bodyProductId } = body

    // Allow update by cartItemId, or by accountId + productId
    if (!cartItemId && !(bodyAccountId && bodyProductId)) {
      return NextResponse.json(
        { error: 'ID do item ou (ID da conta + ID do produto) são obrigatórios' },
        { status: 400 }
      )
    }

    if (quantity !== undefined && quantity < 1) {
      return NextResponse.json({ error: 'Quantidade deve ser pelo menos 1' }, { status: 400 })
    }

    const accountId = bodyAccountId || (session?.user as any)?.id

    // Find cart item by cartItemId or by accountId + productId
    let cartItem
    if (cartItemId) {
      cartItem = await db.cartItem.findUnique({
        where: { id: cartItemId },
        include: { product: true },
      })
    } else if (accountId && bodyProductId) {
      cartItem = await db.cartItem.findFirst({
        where: { accountId, productId: bodyProductId },
        include: { product: true },
      })
    }

    if (!cartItem) {
      return NextResponse.json({ error: 'Item não encontrado no carrinho' }, { status: 404 })
    }

    // Verify ownership
    if (accountId && cartItem.accountId !== accountId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    if (quantity !== undefined && quantity > cartItem.product.stock) {
      return NextResponse.json(
        { error: `Estoque insuficiente. Disponível: ${cartItem.product.stock}` },
        { status: 400 }
      )
    }

    const updated = await db.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    })

    return NextResponse.json({ success: true, cartItem: { id: updated.id, quantity: updated.quantity } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Remover item do carrinho por productId ou limpar carrinho
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const cartItemId = searchParams.get('id')
    const accountId = searchParams.get('accountId') || (session?.user as any)?.id
    const productId = searchParams.get('productId')

    // Remove specific item by cartItemId
    if (cartItemId) {
      await db.cartItem.delete({ where: { id: cartItemId } })
      return NextResponse.json({ success: true, message: 'Item removido do carrinho' })
    }

    // Remove specific item by accountId + productId
    if (accountId && productId) {
      const deleted = await db.cartItem.deleteMany({
        where: { accountId, productId },
      })
      if (deleted.count === 0) {
        return NextResponse.json({ error: 'Item não encontrado no carrinho' }, { status: 404 })
      }
      return NextResponse.json({ success: true, message: 'Item removido do carrinho' })
    }

    // Clear all cart items for user
    if (accountId) {
      await db.cartItem.deleteMany({ where: { accountId } })
      return NextResponse.json({ success: true, message: 'Carrinho limpo' })
    }

    return NextResponse.json({ error: 'ID do item, ID da conta ou ID do produto é obrigatório' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
