import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { hashPassword } from '@/lib/crypto'
import { getErrorMessage } from '@/lib/api-response'
import { rateLimit, getClientIP } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, error: 'Endpoint desabilitado em produção' }, { status: 403 })
  }
  const ip = getClientIP(request)
  const rl = rateLimit(ip, { limit: 2, windowMs: 300000 })
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Muitas tentativas. Tente novamente mais tarde.' }, { status: 429 })
  }
  return seedDatabase()
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, error: 'Endpoint desabilitado em produção' }, { status: 403 })
  }
  const ip = getClientIP(request)
  const rl = rateLimit(ip, { limit: 2, windowMs: 300000 })
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Muitas tentativas. Tente novamente mais tarde.' }, { status: 429 })
  }
  return seedDatabase()
}

async function seedDatabase() {
  try {
    const counts: Record<string, number> = {
      accounts: 0,
      stores: 0,
      products: 0,
      categories: 0,
      banners: 0,
      reviews: 0,
      promotions: 0,
    }

    // Clean existing data
    await db.orderItem.deleteMany()
    await db.orderStatusHistory.deleteMany()
    await db.orderBump.deleteMany()
    await db.chatMessage.deleteMany()
    await db.order.deleteMany()
    await db.cartItem.deleteMany()
    await db.favorite.deleteMany()
    await db.review.deleteMany()
    await db.loyaltyPoint.deleteMany()
    await db.notification.deleteMany()
    await db.paidAdvertisement.deleteMany()
    await db.promotion.deleteMany()
    await db.banner.deleteMany()
    await db.product.deleteMany()
    await db.productCategory.deleteMany()
    await db.user.deleteMany()
    await db.store.deleteMany()
    await db.affiliate.deleteMany()
    await db.deliveryDriver.deleteMany()
    await db.admin.deleteMany()
    await db.address.deleteMany()
    await db.userPaymentMethod.deleteMany()
    await db.activityLog.deleteMany()
    await db.account.deleteMany()

    // --- Categories ---
    const categories = [
      { name: 'Alimentação', slug: 'alimentacao', order: 1 },
      { name: 'Agricultura', slug: 'agricultura', order: 2 },
      { name: 'Saúde', slug: 'saude', order: 3 },
      { name: 'Eletrônicos', slug: 'eletronicos', order: 4 },
      { name: 'Animais', slug: 'animais', order: 5 },
      { name: 'Beleza', slug: 'beleza', order: 6 },
      { name: 'Moda', slug: 'moda', order: 7 },
      { name: 'Serviços', slug: 'servicos', order: 8 },
      { name: 'Casa & Jardim', slug: 'casa-jardim', order: 9 },
      { name: 'Esportes', slug: 'esportes', order: 10 },
      { name: 'Educação', slug: 'educacao', order: 11 },
      { name: 'Construção', slug: 'construcao', order: 12 },
      { name: 'Outros', slug: 'outros', order: 13 },
    ]
    await db.productCategory.createMany({ data: categories })
    counts.categories = categories.length

    // --- Admin account ---
    try {
      const adminAccount = await db.account.create({
        data: {
          email: 'admin@domplace.com',
          password: hashPassword('admin123'),
          name: 'Administrador DomPlace',
          phone: '(91) 99999-0000',
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      })
      await db.admin.create({
        data: { accountId: adminAccount.id, level: 1, permissions: 'all' },
      })
      counts.accounts++
    } catch { /* skip if exists */ }

    // --- Demo user account (demo@domplace.com / demo123) ---
    let demoAccountId = ''
    try {
      const demoAccount = await db.account.create({
        data: {
          email: 'demo@domplace.com',
          password: hashPassword('demo123'),
          name: 'Maria Silva',
          phone: '(91) 98888-1234',
          role: 'USER',
          status: 'ACTIVE',
        },
      })
      demoAccountId = demoAccount.id
      await db.user.create({
        data: {
          accountId: demoAccount.id,
          loyaltyBalance: 1250,
          totalSpent: 2450.00,
          orderCount: 15,
        },
      })
      counts.accounts++

      // Demo user address
      await db.address.create({
        data: {
          accountId: demoAccount.id,
          street: 'Rua Principal',
          number: '123',
          neighborhood: 'Centro',
          city: 'Dom Eliseu',
          state: 'PA',
          zipCode: '68555-000',
          isDefault: true,
        },
      })

      // Demo user loyalty points
      await db.loyaltyPoint.createMany({
        data: [
          { accountId: demoAccount.id, points: 500, source: 'BÔNUS_CADASTRO' },
          { accountId: demoAccount.id, points: 350, source: 'COMPRA', referenceId: 'DP000003' },
          { accountId: demoAccount.id, points: 200, source: 'INDICAÇÃO' },
          { accountId: demoAccount.id, points: 200, source: 'COMPRA', referenceId: 'DP000001' },
        ],
      })
    } catch { /* skip if exists */ }

    // --- Store user account (usuario@domplace.com) ---
    let userAccountId = ''
    try {
      const userAccount = await db.account.create({
        data: {
          email: 'usuario@domplace.com',
          password: hashPassword('user123'),
          name: 'João Santos',
          phone: '(91) 98888-5678',
          role: 'USER',
          status: 'ACTIVE',
        },
      })
      userAccountId = userAccount.id
      await db.user.create({
        data: {
          accountId: userAccount.id,
          loyaltyBalance: 800,
          totalSpent: 1500.00,
          orderCount: 10,
        },
      })
      counts.accounts++
    } catch { /* skip if exists */ }

    // --- Image map for store categories ---
    const storeImageMap: Record<string, string> = {
      'mercado-do-ze': '/images/grocery.jpg',
      'acai-da-boa': '/images/acai.jpg',
      'agropecuaria-sp': '/images/agriculture.jpg',
      'farmacia-vida': '/images/pharmacy.jpg',
      'padaria-pao-quente': '/images/bakery.jpg',
      'loja-eletronico': '/images/electronics.jpg',
      'pet-shop-amigo-fiel': '/images/pets.jpg',
      'salao-da-bella': '/images/beauty.jpg',
    }

    // --- Store 1: Mercado do Zé (FOOD) - 8 products ---
    const store1Data = {
      name: 'Mercado do Zé',
      slug: 'mercado-do-ze', category: 'FOOD' as const,
      coverImage: '/images/grocery.jpg', logo: '/images/grocery.jpg',
      description: 'O melhor mercado de Dom Eliseu com produtos frescos e preços justos. Arroz, feijão, óleo, farinha e muito mais.',
      address: 'Rua Principal, 123', neighborhood: 'Centro', phone: '(91) 99999-0001', whatsapp: '(91) 99999-0001',
      deliveryFee: 5.00, freeDeliveryAbove: 50, opensAt: '07:00', closesAt: '21:00',
      weeklyScore: 92, rating: 4.7, totalReviews: 128, totalSales: 850,
    }

    const store1Account = await db.account.create({
      data: {
        email: 'mercado-do-ze@domplace.com',
        password: hashPassword('store123'),
        name: 'Mercado do Zé',
        phone: '(91) 99999-0001',
        role: 'STORE_OWNER',
        status: 'ACTIVE',
      },
    })
    counts.accounts++

    const store1 = await db.store.create({
      data: {
        ...store1Data,
        accountId: store1Account.id,
        status: 'ACTIVE',
        city: 'Dom Eliseu',
        state: 'PA',
        pixKey: 'mercado-do-ze@pix.com',
      },
    })
    counts.stores++

    const store1Products = [
      { name: 'Arroz Tio João 5kg', slug: 'arroz-tio-joao-5kg', description: 'Arroz tipo 1 premium para o dia a dia. Grão selecionado.', price: 24.90, comparePrice: 29.90, stock: 50, rating: 4.5, totalReviews: 23, isFeatured: true, isNew: false, isOffer: true, tags: '["arroz","alimento","basico"]', variations: '["5kg","1kg"]' },
      { name: 'Feijão Carioca 1kg', slug: 'feijao-carioca-1kg', description: 'Feijão carioca selecionado de alta qualidade.', price: 8.90, comparePrice: null, stock: 80, rating: 4.3, totalReviews: 15, isFeatured: false, isNew: false, isOffer: false, tags: '["feijao","alimento","basico"]', variations: '["1kg","500g"]' },
      { name: 'Óleo de Soja 900ml', slug: 'oleo-soja-900ml', description: 'Óleo de soja puro para cozinhar.', price: 7.49, comparePrice: 8.99, stock: 40, rating: 4.1, totalReviews: 8, isFeatured: false, isNew: false, isOffer: true, tags: '["oleo","alimento","basico"]', variations: null },
      { name: 'Café Torrado e Moído 500g', slug: 'cafe-torrado-moido-500g', description: 'Café premium torrado e moído. Sabor intenso.', price: 18.90, comparePrice: 22.90, stock: 35, rating: 4.6, totalReviews: 19, isFeatured: true, isNew: false, isOffer: true, tags: '["cafe","alimento","bebida"]', variations: '["500g","250g"]' },
      { name: 'Açúcar Cristal 1kg', slug: 'acucar-cristal-1kg', description: 'Açúcar cristal refinado.', price: 5.49, comparePrice: null, stock: 60, rating: 4.0, totalReviews: 6, isFeatured: false, isNew: false, isOffer: false, tags: '["acucar","alimento","basico"]', variations: null },
      { name: 'Farinha de Mandioca 1kg', slug: 'farinha-mandioca-1kg', description: 'Farinha de mandioca tipica do Pará.', price: 6.90, comparePrice: null, stock: 45, rating: 4.4, totalReviews: 12, isFeatured: false, isNew: true, isOffer: false, tags: '["farinha","alimento","para"]', variations: null },
      { name: 'Macarrão Espaguete 500g', slug: 'macarrao-espaguete-500g', description: 'Macarrão espaguete premium.', price: 4.49, comparePrice: 5.29, stock: 70, rating: 4.2, totalReviews: 10, isFeatured: false, isNew: false, isOffer: true, tags: '["macarrao","alimento","massa"]', variations: null },
      { name: 'Leite Integral 1L', slug: 'leite-integral-1l', description: 'Leite integral pasteurizado.', price: 6.49, comparePrice: null, stock: 100, rating: 4.3, totalReviews: 14, isFeatured: true, isNew: false, isOffer: false, tags: '["leite","alimento","laticinio"]', variations: '["1L","500ml"]' },
    ]
    for (const pd of store1Products) {
      await db.product.create({
        data: {
          storeId: store1.id,
          name: pd.name, slug: pd.slug, description: pd.description,
          price: pd.price, comparePrice: pd.comparePrice, stock: pd.stock,
          rating: pd.rating, totalReviews: pd.totalReviews,
          isFeatured: pd.isFeatured, isNew: pd.isNew, isOffer: pd.isOffer,
          tags: pd.tags, variations: pd.variations || null,
          soldCount: Math.floor(Math.random() * 100),
          images: JSON.stringify([storeImageMap['mercado-do-ze'] || '']),
          status: 'ACTIVE',
        },
      })
      counts.products++
    }

    // --- Store 2: Açaí da Boa (FOOD) - 5 products ---
    const store2Data = {
      name: 'Açaí da Boa',
      slug: 'acai-da-boa', category: 'FOOD' as const,
      coverImage: '/images/acai.jpg', logo: '/images/acai.jpg',
      description: 'O mais autêntico açaí paraense, feito com frutas selecionadas. Tigelas, smoothies e muito mais.',
      address: 'Av. Brasil, 456', neighborhood: 'Centro', phone: '(91) 99999-0002', whatsapp: '(91) 99999-0002',
      deliveryFee: 3.00, freeDeliveryAbove: 30, opensAt: '08:00', closesAt: '22:00',
      weeklyScore: 98, rating: 4.9, totalReviews: 256, totalSales: 1200,
    }

    const store2Account = await db.account.create({
      data: {
        email: 'acai-da-boa@domplace.com',
        password: hashPassword('store123'),
        name: 'Açaí da Boa',
        phone: '(91) 99999-0002',
        role: 'STORE_OWNER',
        status: 'ACTIVE',
      },
    })
    counts.accounts++

    const store2 = await db.store.create({
      data: {
        ...store2Data,
        accountId: store2Account.id,
        status: 'ACTIVE',
        city: 'Dom Eliseu',
        state: 'PA',
        pixKey: 'acai-da-boa@pix.com',
      },
    })
    counts.stores++

    const store2Products = [
      { name: 'Açaí 300ml', slug: 'acai-300ml', description: 'Açaí cremoso no copo 300ml com granola.', price: 10.00, comparePrice: 12.00, stock: 80, rating: 4.8, totalReviews: 65, isFeatured: true, isNew: false, isOffer: true, tags: '["acai","sobremesa","para"]', variations: '["300ml","500ml","700ml"]' },
      { name: 'Açaí 500ml', slug: 'acai-500ml', description: 'Açaí cremoso com granola e banana. 500ml.', price: 15.00, comparePrice: 18.00, stock: 100, rating: 4.9, totalReviews: 89, isFeatured: true, isNew: false, isOffer: true, tags: '["acai","sobremesa","para"]', variations: '["300ml","500ml","700ml"]' },
      { name: 'Açaí Premium 700ml', slug: 'acai-premium-700ml', description: 'Açaí premium com frutas da estação e leite condensado.', price: 22.00, comparePrice: null, stock: 50, rating: 4.8, totalReviews: 45, isFeatured: true, isNew: true, isOffer: false, tags: '["acai","premium","sobremesa"]', variations: null },
      { name: 'Tigela de Cupuaçu 500ml', slug: 'tigela-cupuacu-500ml', description: 'Cupuaçu cremoso com farinha de tapioca.', price: 18.00, comparePrice: null, stock: 30, rating: 4.7, totalReviews: 32, isFeatured: false, isNew: true, isOffer: false, tags: '["cupuacu","sobremesa","para"]', variations: '["300ml","500ml"]' },
      { name: 'Smoothie de Açaí com Banana', slug: 'smoothie-acai-banana', description: 'Smoothie refrescante de açaí com banana e mel.', price: 14.00, comparePrice: 17.00, stock: 40, rating: 4.6, totalReviews: 28, isFeatured: false, isNew: true, isOffer: true, tags: '["smoothie","acai","bebida"]', variations: null },
    ]
    for (const pd of store2Products) {
      await db.product.create({
        data: {
          storeId: store2.id,
          name: pd.name, slug: pd.slug, description: pd.description,
          price: pd.price, comparePrice: pd.comparePrice, stock: pd.stock,
          rating: pd.rating, totalReviews: pd.totalReviews,
          isFeatured: pd.isFeatured, isNew: pd.isNew, isOffer: pd.isOffer,
          tags: pd.tags, variations: pd.variations || null,
          soldCount: Math.floor(Math.random() * 150),
          images: JSON.stringify([storeImageMap['acai-da-boa'] || '']),
          status: 'ACTIVE',
        },
      })
      counts.products++
    }

    // --- Store 3: Farmácia Vida (HEALTH) - 5 products ---
    const store3Data = {
      name: 'Farmácia Vida',
      slug: 'farmacia-vida', category: 'HEALTH' as const,
      coverImage: '/images/pharmacy.jpg', logo: '/images/pharmacy.jpg',
      description: 'Sua saúde em primeiro lugar. Medicamentos, suplementos, vitaminas e atendimento farmacêutico.',
      address: 'Rua Pará, 789', neighborhood: 'Centro', phone: '(91) 99999-0004', whatsapp: '(91) 99999-0004',
      deliveryFee: 0, freeDeliveryAbove: null as number | null, opensAt: '07:00', closesAt: '22:00',
      weeklyScore: 88, rating: 4.6, totalReviews: 89, totalSales: 620,
    }

    const store3Account = await db.account.create({
      data: {
        email: 'farmacia-vida@domplace.com',
        password: hashPassword('store123'),
        name: 'Farmácia Vida',
        phone: '(91) 99999-0004',
        role: 'STORE_OWNER',
        status: 'ACTIVE',
      },
    })
    counts.accounts++

    const store3 = await db.store.create({
      data: {
        ...store3Data,
        accountId: store3Account.id,
        status: 'ACTIVE',
        city: 'Dom Eliseu',
        state: 'PA',
        pixKey: 'farmacia-vida@pix.com',
      },
    })
    counts.stores++

    const store3Products = [
      { name: 'Vitamina C 500mg 60 cáps', slug: 'vitamina-c-500mg-60caps', description: 'Suplemento de vitamina C. Pote com 60 cápsulas.', price: 35.00, comparePrice: 42.00, stock: 100, rating: 4.7, totalReviews: 34, isFeatured: true, isNew: false, isOffer: true, tags: '["vitamina","suplemento","saude"]', variations: '["500mg","1000mg"]' },
      { name: 'Kit Primeiros Socorros', slug: 'kit-primeiros-socorros', description: 'Kit completo de primeiros socorros com curativos, antisséptico e gaze.', price: 59.90, comparePrice: 75.00, stock: 20, rating: 4.8, totalReviews: 22, isFeatured: true, isNew: false, isOffer: true, tags: '["kit","socorros","saude"]', variations: null },
      { name: 'Dorflex 30 comprimidos', slug: 'dorflex-30comprimidos', description: 'Analgésico e relaxante muscular.', price: 18.90, comparePrice: null, stock: 150, rating: 4.4, totalReviews: 11, isFeatured: false, isNew: false, isOffer: false, tags: '["dorflex","remedio","analgesico"]', variations: null },
      { name: 'Protetor Solar FPS 50 120ml', slug: 'protetor-solar-fps50-120ml', description: 'Protetor solar facial FPS 50. Proteção contra raios UVA e UVB.', price: 45.90, comparePrice: null, stock: 50, rating: 4.5, totalReviews: 18, isFeatured: false, isNew: true, isOffer: false, tags: '["protetor","solar","pele"]', variations: null },
      { name: 'Pomada Bepantol 50g', slug: 'pomada-bepantol-50g', description: 'Pomada reparadora para pele ressecada.', price: 28.90, comparePrice: 34.90, stock: 40, rating: 4.6, totalReviews: 16, isFeatured: false, isNew: false, isOffer: true, tags: '["pomada","pele","dermatologia"]', variations: null },
    ]
    for (const pd of store3Products) {
      await db.product.create({
        data: {
          storeId: store3.id,
          name: pd.name, slug: pd.slug, description: pd.description,
          price: pd.price, comparePrice: pd.comparePrice, stock: pd.stock,
          rating: pd.rating, totalReviews: pd.totalReviews,
          isFeatured: pd.isFeatured, isNew: pd.isNew, isOffer: pd.isOffer,
          tags: pd.tags, variations: pd.variations || null,
          soldCount: Math.floor(Math.random() * 80),
          images: JSON.stringify([storeImageMap['farmacia-vida'] || '']),
          status: 'ACTIVE',
        },
      })
      counts.products++
    }

    // --- Remaining stores (5 more) ---
    const storesData = [
      { name: 'Agropecuária São Paulo', slug: 'agropecuaria-sp', category: 'AGRICULTURE' as const, description: 'Tudo para o campo e para a cidade. Ferramentas, sementes e muito mais.', address: 'Rod. PA-279, Km 5', neighborhood: 'Zona Rural', phone: '(91) 99999-0003', whatsapp: '(91) 99999-0003', deliveryFee: 8.00, freeDeliveryAbove: 200, opensAt: '06:00', closesAt: '18:00', weeklyScore: 75, rating: 4.5, totalReviews: 67, totalSales: 320 },
      { name: 'Padaria Pão Quente', slug: 'padaria-pao-quente', category: 'FOOD' as const, description: 'Pão fresquinho todo dia! Doces, salgados e muito mais.', address: 'Rua Amazonas, 321', neighborhood: 'Centro', phone: '(91) 99999-0005', whatsapp: '(91) 99999-0005', deliveryFee: 3.00, freeDeliveryAbove: 25, opensAt: '05:00', closesAt: '20:00', weeklyScore: 95, rating: 4.8, totalReviews: 198, totalSales: 2100 },
      { name: 'Loja do Eletrônico', slug: 'loja-eletronico', category: 'ELECTRONICS' as const, description: 'Celulares, acessórios e eletrônicos com as melhores ofertas.', address: 'Rua Tocantins, 654', neighborhood: 'Centro', phone: '(91) 99999-0006', whatsapp: '(91) 99999-0006', deliveryFee: 5.00, freeDeliveryAbove: 100, opensAt: '08:00', closesAt: '20:00', weeklyScore: 70, rating: 4.3, totalReviews: 45, totalSales: 180 },
      { name: 'Pet Shop Amigo Fiel', slug: 'pet-shop-amigo-fiel', category: 'ANIMALS' as const, description: 'Tudo para seu melhor amigo. Rações, banho, tosa e acessórios.', address: 'Rua Maranhão, 987', neighborhood: 'Centro', phone: '(91) 99999-0007', whatsapp: '(91) 99999-0007', deliveryFee: 4.00, freeDeliveryAbove: 80, opensAt: '08:00', closesAt: '19:00', weeklyScore: 82, rating: 4.7, totalReviews: 112, totalSales: 490 },
      { name: 'Salão da Bella', slug: 'salao-da-bella', category: 'BEAUTY' as const, description: 'Beleza e bem-estar. Cortes, coloração e tratamentos capilares.', address: 'Rua Ceará, 147', neighborhood: 'Centro', phone: '(91) 99999-0008', whatsapp: '(91) 99999-0008', deliveryFee: 0, freeDeliveryAbove: null as number | null, opensAt: '09:00', closesAt: '20:00', weeklyScore: 90, rating: 4.9, totalReviews: 210, totalSales: 1500 },
    ]

    const allProductsData: Array<{ storeId: string; name: string; slug: string; description: string; price: number; comparePrice: number | null; stock: number; rating: number; totalReviews: number; isFeatured: boolean; isNew: boolean; isOffer: boolean; tags: string; variations: string | null }> = [
      // Agropecuária (store 4)
      { storeId: '', name: 'Adubo NPK 20kg', slug: 'adubo-npk-20kg', description: 'Adubo NPK para culturas diversas.', price: 89.90, comparePrice: null, stock: 25, rating: 4.4, totalReviews: 12, isFeatured: true, isNew: false, isOffer: false, tags: '["adubo","fertilizante","agricultura"]', variations: null },
      { storeId: '', name: 'Sementes de Milho 5kg', slug: 'sementes-milho-5kg', description: 'Sementes de milho híbrido alta produtividade.', price: 145.00, comparePrice: 169.90, stock: 15, rating: 4.6, totalReviews: 8, isFeatured: false, isNew: false, isOffer: true, tags: '["sementes","milho","plantio"]', variations: null },
      { storeId: '', name: 'Muda de Cupuaçu', slug: 'muda-cupuacu', description: 'Muda de cupuaçuzeiro pronta para plantio.', price: 25.00, comparePrice: null, stock: 30, rating: 4.8, totalReviews: 5, isFeatured: true, isNew: true, isOffer: false, tags: '["muda","cupuacu","frutifera"]', variations: null },
      { storeId: '', name: 'Kit Ferramentas Básico', slug: 'kit-ferramentas-basico', description: 'Kit de ferramentas básicas para campo e casa.', price: 67.00, comparePrice: 79.90, stock: 20, rating: 4.2, totalReviews: 9, isFeatured: false, isNew: false, isOffer: true, tags: '["ferramenta","kit","ferramentas"]', variations: null },
      // Padaria (store 5)
      { storeId: '', name: 'Pão Francês (6 un)', slug: 'pao-frances-6un', description: 'Pão francês fresquinho saindo do forno.', price: 6.00, comparePrice: null, stock: 200, rating: 4.9, totalReviews: 120, isFeatured: true, isNew: false, isOffer: false, tags: '["pao","padaria","fresco"]', variations: null },
      { storeId: '', name: 'Bolo de Chocolate Fatia', slug: 'bolo-chocolate-fatia', description: 'Fatia generosa de bolo com cobertura de ganache.', price: 16.50, comparePrice: null, stock: 15, rating: 4.8, totalReviews: 56, isFeatured: true, isNew: false, isOffer: false, tags: '["bolo","chocolate","doce"]', variations: '["Fatia","Inteiro"]' },
      { storeId: '', name: 'Coxinha de Frango (10un)', slug: 'coxinha-frango-10un', description: 'Coxinhas cremosas pack 10 unidades.', price: 35.00, comparePrice: 42.00, stock: 30, rating: 4.7, totalReviews: 78, isFeatured: false, isNew: false, isOffer: true, tags: '["coxinha","salgado","frango"]', variations: null },
      { storeId: '', name: 'Tapioca Recheada', slug: 'tapioca-recheada', description: 'Tapioca com queijo e presunto feita na hora.', price: 12.00, comparePrice: null, stock: 50, rating: 4.6, totalReviews: 34, isFeatured: false, isNew: true, isOffer: false, tags: '["tapioca","salgado","paraense"]', variations: '["Queijo","Presunto","Frango"]' },
      // Loja do Eletrônico (store 6)
      { storeId: '', name: 'Capinha de Celular Premium', slug: 'capinha-celular-premium', description: 'Capinha silicone para diversos modelos.', price: 29.90, comparePrice: 49.90, stock: 100, rating: 4.2, totalReviews: 19, isFeatured: false, isNew: true, isOffer: true, tags: '["capinha","acessorio","celular"]', variations: '["iPhone","Samsung","Motorola"]' },
      { storeId: '', name: 'Fone Bluetooth TWS', slug: 'fone-bluetooth-tws', description: 'Fone sem fio com bateria longa duração.', price: 79.90, comparePrice: 119.90, stock: 25, rating: 4.4, totalReviews: 14, isFeatured: true, isNew: false, isOffer: true, tags: '["fone","bluetooth","audio"]', variations: null },
      { storeId: '', name: 'Carregador Turbo 20W', slug: 'carregador-turbo-20w', description: 'Carregador rápido com cabo USB-C.', price: 45.00, comparePrice: null, stock: 40, rating: 4.5, totalReviews: 21, isFeatured: false, isNew: true, isOffer: false, tags: '["carregador","cabo","acessorio"]', variations: null },
      { storeId: '', name: 'Power Bank 10000mAh', slug: 'power-bank-10000mah', description: 'Power Bank portátil dupla saída USB.', price: 89.90, comparePrice: 129.90, stock: 15, rating: 4.3, totalReviews: 7, isFeatured: true, isNew: false, isOffer: true, tags: '["powerbank","bateria","acessorio"]', variations: null },
      // Pet Shop (store 7)
      { storeId: '', name: 'Ração Premium Cães 15kg', slug: 'racao-premium-caes-15kg', description: 'Ração super premium sabor frango e arroz.', price: 89.90, comparePrice: 109.90, stock: 30, rating: 4.8, totalReviews: 45, isFeatured: true, isNew: false, isOffer: true, tags: '["racao","cao","pet"]', variations: '["8kg","15kg","20kg"]' },
      { storeId: '', name: 'Coleira Anti-Pulgas', slug: 'coleira-anti-pulgas', description: 'Coleira anti-pulgas duração 8 meses.', price: 32.00, comparePrice: null, stock: 60, rating: 4.5, totalReviews: 28, isFeatured: false, isNew: false, isOffer: false, tags: '["coleira","pulga","pet"]', variations: '["Pequeno","Grande"]' },
      { storeId: '', name: 'Brinquedo Corda Resistente', slug: 'brinquedo-corda', description: 'Brinquedo de corda para cães.', price: 19.90, comparePrice: null, stock: 40, rating: 4.1, totalReviews: 12, isFeatured: false, isNew: true, isOffer: false, tags: '["brinquedo","pet","cao"]', variations: null },
      { storeId: '', name: 'Ração Gatos Adulto 3kg', slug: 'racao-gatos-adulto-3kg', description: 'Ração para gatos sabor salmão.', price: 45.00, comparePrice: 52.00, stock: 25, rating: 4.6, totalReviews: 19, isFeatured: false, isNew: false, isOffer: true, tags: '["racao","gato","pet"]', variations: null },
      // Salão da Bella (store 8)
      { storeId: '', name: 'Corte Feminino', slug: 'corte-feminino', description: 'Corte e styling feminino profissional.', price: 45.00, comparePrice: null, stock: 999, rating: 4.9, totalReviews: 98, isFeatured: true, isNew: false, isOffer: false, tags: '["corte","cabelo","beleza"]', variations: '["Corte","Corte + Escova"]' },
      { storeId: '', name: 'Coloração Capilar', slug: 'coloracao-capilar', description: 'Coloração profissional com produtos de qualidade.', price: 120.00, comparePrice: 150.00, stock: 999, rating: 4.8, totalReviews: 67, isFeatured: false, isNew: false, isOffer: true, tags: '["coloracao","cabelo","beleza"]', variations: null },
      { storeId: '', name: 'Manicure Completa', slug: 'manicure-completa', description: 'Manicure e pedicure com esmaltação.', price: 50.00, comparePrice: null, stock: 999, rating: 4.7, totalReviews: 54, isFeatured: false, isNew: true, isOffer: false, tags: '["manicure","unha","beleza"]', variations: null },
      { storeId: '', name: 'Hidratação Capilar', slug: 'hidratacao-capilar', description: 'Hidratação profunda para cabelos danificados.', price: 80.00, comparePrice: 95.00, stock: 999, rating: 4.9, totalReviews: 41, isFeatured: true, isNew: false, isOffer: true, tags: '["hidratacao","cabelo","tratamento"]', variations: null },
    ]

    const stores: any[] = [store1, store2, store3]
    for (let i = 0; i < storesData.length; i++) {
      const sd = storesData[i]
      try {
        const account = await db.account.create({
          data: {
            email: `${sd.slug}@domplace.com`,
            password: hashPassword('store123'),
            name: sd.name,
            phone: sd.phone,
            role: 'STORE_OWNER',
            status: 'ACTIVE',
          },
        })
        counts.accounts++

        const store = await db.store.create({
          data: {
            accountId: account.id,
            ...sd,
            status: 'ACTIVE',
            city: 'Dom Eliseu',
            state: 'PA',
            pixKey: `${sd.slug}@pix.com`,
          },
        })
        stores.push(store)
        counts.stores++
      } catch { /* skip if exists */ }
    }

    // Assign store IDs to product data and create products
    for (const pd of allProductsData) {
      if (pd.name === 'Adubo NPK 20kg') pd.storeId = stores[3]?.id
      else if (pd.name.startsWith('Sementes')) pd.storeId = stores[3]?.id
      else if (pd.name.startsWith('Muda')) pd.storeId = stores[3]?.id
      else if (pd.name.startsWith('Kit Ferra')) pd.storeId = stores[3]?.id
      else if (pd.name.startsWith('Pão')) pd.storeId = stores[4]?.id
      else if (pd.name.startsWith('Bolo')) pd.storeId = stores[4]?.id
      else if (pd.name.startsWith('Coxinha')) pd.storeId = stores[4]?.id
      else if (pd.name.startsWith('Tapioca')) pd.storeId = stores[4]?.id
      else if (pd.name.startsWith('Capinha')) pd.storeId = stores[5]?.id
      else if (pd.name.startsWith('Fone')) pd.storeId = stores[5]?.id
      else if (pd.name.startsWith('Carrega')) pd.storeId = stores[5]?.id
      else if (pd.name.startsWith('Power')) pd.storeId = stores[5]?.id
      else if (pd.name.startsWith('Ração Premium')) pd.storeId = stores[6]?.id
      else if (pd.name.startsWith('Coleira')) pd.storeId = stores[6]?.id
      else if (pd.name.startsWith('Brinquedo')) pd.storeId = stores[6]?.id
      else if (pd.name.startsWith('Ração Gatos')) pd.storeId = stores[6]?.id
      else if (pd.name.startsWith('Corte')) pd.storeId = stores[7]?.id
      else if (pd.name.startsWith('Coloração')) pd.storeId = stores[7]?.id
      else if (pd.name.startsWith('Manicure')) pd.storeId = stores[7]?.id
      else if (pd.name.startsWith('Hidratação')) pd.storeId = stores[7]?.id

      if (!pd.storeId) continue

      try {
        // Resolve store image from storeId
        const storeImage = storeImageMap[Object.keys(storeImageMap).find(k => {
          const store = stores.find(s => s.id === pd.storeId)
          if (!store) return false
          return k.includes(store.slug?.split('-').slice(0, 2).join('-') || '')
        }) || ''] || ''

        await db.product.create({
          data: {
            storeId: pd.storeId,
            name: pd.name, slug: pd.slug, description: pd.description,
            price: pd.price, comparePrice: pd.comparePrice, stock: pd.stock,
            rating: pd.rating, totalReviews: pd.totalReviews,
            isFeatured: pd.isFeatured, isNew: pd.isNew, isOffer: pd.isOffer,
            tags: pd.tags, variations: pd.variations || null,
            soldCount: Math.floor(Math.random() * 100),
            images: JSON.stringify([storeImage || '']),
            status: 'ACTIVE',
          },
        })
        counts.products++
      } catch { /* skip if exists */ }
    }

    // --- Banners ---
    const bannersData = [
      { storeId: stores[1]?.id, title: 'Ofertas da Semana', subtitle: 'Até 40% de desconto em produtos locais', level: 'DAILY_OFFERS' as const, order: 0, image: '/images/acai.jpg' },
      { storeId: stores[4]?.id, title: 'Entrega Grátis Pão Quente', subtitle: 'Compras acima de R$ 25 na padaria', level: 'DAILY_OFFERS' as const, order: 1, image: '/images/bakery.jpg' },
      { storeId: stores[3]?.id, title: 'Novidades Agropecuária', subtitle: 'Novas sementes e ferramentas chegaram!', level: 'NEW_IN_CITY' as const, order: 0, image: '/images/agriculture.jpg' },
      { storeId: stores[7]?.id, title: 'Salão da Bella - Novos Serviços', subtitle: 'Escova progressiva e botox capilar', level: 'NEW_IN_CITY' as const, order: 1, image: '/images/beauty.jpg' },
      { storeId: stores[0]?.id, title: 'Feira do Produtor', subtitle: 'Toda sexta-feira com produtos fresquinhos!', level: 'LOCAL_PARTNERSHIPS' as const, order: 0, image: '/images/grocery.jpg' },
      { storeId: stores[6]?.id, title: 'Dia do Pet', subtitle: '20% de desconto em rações todo sábado', level: 'SEASONAL' as const, order: 0, image: '/images/pets.jpg' },
      { storeId: stores[2]?.id, title: 'Farmácia Vida - Saúde em primeiro lugar', subtitle: 'Entrega grátis em todos os medicamentos', level: 'FEATURED' as const, order: 0, image: '/images/pharmacy.jpg' },
      { storeId: stores[5]?.id, title: 'Loja do Eletrônico - Ofertas Imperdíveis', subtitle: 'Fones e acessórios com até 50% OFF', level: 'FEATURED' as const, order: 1, image: '/images/electronics.jpg' },
    ]

    for (const bd of bannersData) {
      try {
        await db.banner.create({
          data: { ...bd, isActive: true, startsAt: new Date(), endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        })
        counts.banners++
      } catch { /* skip if exists */ }
    }

    // --- Reviews ---
    const reviewsData = [
      { accountId: demoAccountId || userAccountId, storeId: stores[1]?.id, productId: undefined, rating: 5, comment: 'Melhor açaí de Dom Eliseu! Sempre fresquinho.' },
      { accountId: demoAccountId || userAccountId, storeId: stores[4]?.id, productId: undefined, rating: 5, comment: 'Pão sempre fresquinho, adorei!' },
      { accountId: demoAccountId || userAccountId, storeId: stores[2]?.id, productId: undefined, rating: 4, comment: 'Vitamina C excelente, entrega rápida.' },
      { accountId: demoAccountId || userAccountId, storeId: stores[0]?.id, productId: undefined, rating: 4, comment: 'Bom preço e entrega rápida.' },
      { accountId: demoAccountId || userAccountId, storeId: stores[7]?.id, productId: undefined, rating: 5, comment: 'Corte perfeito! Profissional muito atenciosa.' },
    ]

    for (const rd of reviewsData) {
      try {
        await db.review.create({ data: { ...rd, isVerified: true } })
        counts.reviews++
      } catch { /* skip if exists */ }
    }

    // --- Promotions ---
    const promotionsData = [
      { storeId: stores[1]?.id, title: 'Açaí Feliz', description: '10% de desconto no açaí', type: 'PERCENTAGE' as const, value: 10, code: 'ACAI10', startsAt: new Date(), endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), isActive: true },
      { storeId: stores[4]?.id, title: 'Pão de Manhã', description: 'R$ 2 de desconto no pão antes das 8h', type: 'FIXED_AMOUNT' as const, value: 2, code: 'PAO2', startsAt: new Date(), endsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), isActive: true },
      { storeId: stores[0]?.id, title: 'Desconto do Mercado', description: '10% de desconto em compras acima de R$ 100', type: 'PERCENTAGE' as const, value: 10, code: 'MERCADO10', startsAt: new Date(), endsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), isActive: true },
      { storeId: stores[6]?.id, title: 'Frete Grátis Pet', description: 'Entrega grátis em rações acima de R$ 80', type: 'FREE_DELIVERY' as const, value: 0, code: 'PETGRATIS', startsAt: new Date(), endsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), isActive: true },
    ]

    for (const pd of promotionsData) {
      try {
        await db.promotion.create({ data: pd })
        counts.promotions++
      } catch { /* skip if exists */ }
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      data: counts,
    })
  } catch (error: unknown) {
    logger.error('Seed error:', error)
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 })
  }
}
