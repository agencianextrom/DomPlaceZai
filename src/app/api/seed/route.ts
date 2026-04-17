import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

export async function GET() {
  try {
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

    // Create categories
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
      { name: 'Outros', slug: 'outros', order: 12 },
    ]
    await db.productCategory.createMany({ data: categories })

    // Create admin account
    const adminPassword = hashPassword('admin123')
    const adminAccount = await db.account.create({
      data: {
        email: 'admin@domplace.com',
        password: adminPassword,
        name: 'Administrador DomPlace',
        phone: '(91) 99999-0000',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    })
    await db.admin.create({
      data: { accountId: adminAccount.id, level: 1, permissions: 'all' },
    })

    // Create user account for demo
    const userPassword = hashPassword('user123')
    const userAccount = await db.account.create({
      data: {
        email: 'usuario@domplace.com',
        password: userPassword,
        name: 'Maria Silva',
        phone: '(91) 98888-1234',
        role: 'USER',
        status: 'ACTIVE',
      },
    })
    const demoUser = await db.user.create({
      data: {
        accountId: userAccount.id,
        loyaltyBalance: 1250,
        totalSpent: 2450.00,
        orderCount: 15,
      },
    })

    // Create store accounts and stores
    const storesData = [
      { name: 'Mercado do Zé', slug: 'mercado-do-ze', category: 'FOOD', description: 'O melhor mercado de Dom Eliseu com produtos frescos e preços justos.', address: 'Rua Principal, 123', neighborhood: 'Centro', phone: '(91) 99999-0001', whatsapp: '(91) 99999-0001', deliveryFee: 5.00, freeDeliveryAbove: 50, opensAt: '07:00', closesAt: '21:00', weeklyScore: 92, rating: 4.7, totalReviews: 128, totalSales: 850 },
      { name: 'Açaí da Boa', slug: 'acai-da-boa', category: 'FOOD', description: 'O mais autêntico açaí paraense, feito com frutas selecionadas.', address: 'Av. Brasil, 456', neighborhood: 'Centro', phone: '(91) 99999-0002', whatsapp: '(91) 99999-0002', deliveryFee: 3.00, freeDeliveryAbove: 30, opensAt: '08:00', closesAt: '22:00', weeklyScore: 98, rating: 4.9, totalReviews: 256, totalSales: 1200 },
      { name: 'Agropecuária São Paulo', slug: 'agropecuaria-sp', category: 'AGRICULTURE', description: 'Tudo para o campo e para a cidade. Ferramentas, sementes e muito mais.', address: 'Rod. PA-279, Km 5', neighborhood: 'Zona Rural', phone: '(91) 99999-0003', whatsapp: '(91) 99999-0003', deliveryFee: 8.00, freeDeliveryAbove: 200, opensAt: '06:00', closesAt: '18:00', weeklyScore: 75, rating: 4.5, totalReviews: 67, totalSales: 320 },
      { name: 'Farmácia Vida', slug: 'farmacia-vida', category: 'HEALTH', description: 'Sua saúde em primeiro lugar. Medicamentos, suplementos e atendimento farmacêutico.', address: 'Rua Pará, 789', neighborhood: 'Centro', phone: '(91) 99999-0004', whatsapp: '(91) 99999-0004', deliveryFee: 0, freeDeliveryAbove: null, opensAt: '07:00', closesAt: '22:00', weeklyScore: 88, rating: 4.6, totalReviews: 89, totalSales: 620 },
      { name: 'Padaria Pão Quente', slug: 'padaria-pao-quente', category: 'FOOD', description: 'Pão fresquinho todo dia! Doces, salgados e muito mais.', address: 'Rua Amazonas, 321', neighborhood: 'Centro', phone: '(91) 99999-0005', whatsapp: '(91) 99999-0005', deliveryFee: 3.00, freeDeliveryAbove: 25, opensAt: '05:00', closesAt: '20:00', weeklyScore: 95, rating: 4.8, totalReviews: 198, totalSales: 2100 },
      { name: 'Loja do Eletrônico', slug: 'loja-eletronico', category: 'ELECTRONICS', description: 'Celulares, acessórios e eletrônicos com as melhores ofertas.', address: 'Rua Tocantins, 654', neighborhood: 'Centro', phone: '(91) 99999-0006', whatsapp: '(91) 99999-0006', deliveryFee: 5.00, freeDeliveryAbove: 100, opensAt: '08:00', closesAt: '20:00', weeklyScore: 70, rating: 4.3, totalReviews: 45, totalSales: 180 },
      { name: 'Pet Shop Amigo Fiel', slug: 'pet-shop-amigo-fiel', category: 'ANIMALS', description: 'Tudo para seu melhor amigo. Rações, banho, tosa e acessórios.', address: 'Rua Maranhão, 987', neighborhood: 'Centro', phone: '(91) 99999-0007', whatsapp: '(91) 99999-0007', deliveryFee: 4.00, freeDeliveryAbove: 80, opensAt: '08:00', closesAt: '19:00', weeklyScore: 82, rating: 4.7, totalReviews: 112, totalSales: 490 },
      { name: 'Salão da Bella', slug: 'salao-da-bella', category: 'BEAUTY', description: 'Beleza e bem-estar. Cortes, coloração e tratamentos capilares.', address: 'Rua Ceará, 147', neighborhood: 'Centro', phone: '(91) 99999-0008', whatsapp: '(91) 99999-0008', deliveryFee: 0, freeDeliveryAbove: null, opensAt: '09:00', closesAt: '20:00', weeklyScore: 90, rating: 4.9, totalReviews: 210, totalSales: 1500 },
    ]

    const stores: any[] = []
    for (const sd of storesData) {
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
    }

    // Create products
    const productsData = [
      // Mercado do Zé (store 0)
      { storeId: stores[0].id, name: 'Arroz Tio João 5kg', slug: 'arroz-tio-joao-5kg', description: 'Arroz tipo 1 premium para o dia a dia.', price: 24.90, comparePrice: 29.90, stock: 50, rating: 4.5, totalReviews: 23, isFeatured: true, isNew: false, isOffer: true, tags: '["arroz","alimento","basico"]' },
      { storeId: stores[0].id, name: 'Feijão Carioca 1kg', slug: 'feijao-carioca-1kg', description: 'Feijão carioca selecionado de alta qualidade.', price: 8.90, comparePrice: null, stock: 80, rating: 4.3, totalReviews: 15, isFeatured: false, isNew: false, isOffer: false, tags: '["feijao","alimento","basico"]' },
      { storeId: stores[0].id, name: 'Óleo de Soja 900ml', slug: 'oleo-soja-900ml', description: 'Óleo de soja puro para cozinhar.', price: 7.49, comparePrice: 8.99, stock: 40, rating: 4.1, totalReviews: 8, isFeatured: false, isNew: false, isOffer: true, tags: '["oleo","alimento","basico"]' },
      { storeId: stores[0].id, name: 'Açúcar Cristal 1kg', slug: 'acucar-cristal-1kg', description: 'Açúcar cristal refinado.', price: 5.49, comparePrice: null, stock: 60, rating: 4.0, totalReviews: 6, isFeatured: false, isNew: false, isOffer: false, tags: '["acucar","alimento","basico"]' },
      
      // Açaí da Boa (store 1)
      { storeId: stores[1].id, name: 'Açaí 500ml', slug: 'acai-500ml', description: 'Açaí cremoso com granola e banana.', price: 15.00, comparePrice: 18.00, stock: 100, rating: 4.9, totalReviews: 89, isFeatured: true, isNew: false, isOffer: true, tags: '["acai","sobremesa","pará"]', variations: '["300ml","500ml","700ml"]' },
      { storeId: stores[1].id, name: 'Açaí Premium 700ml', slug: 'acai-premium-700ml', description: 'Açaí premium com frutas da estação e leite condensado.', price: 22.00, comparePrice: null, stock: 50, rating: 4.8, totalReviews: 45, isFeatured: true, isNew: true, isOffer: false, tags: '["acai","premium","sobremesa"]' },
      { storeId: stores[1].id, name: 'Tigela de Cupuaçu', slug: 'tigela-cupuacu-500ml', description: 'Cupuaçu cremoso com farinha de tapioca.', price: 18.00, comparePrice: null, stock: 30, rating: 4.7, totalReviews: 32, isFeatured: false, isNew: true, isOffer: false, tags: '["cupuacu","sobremesa","pará"]', variations: '["300ml","500ml"]' },
      { storeId: stores[1].id, name: 'Smoothie de Açaí', slug: 'smoothie-acai', description: 'Smoothie refrescante de açaí com banana.', price: 12.00, comparePrice: 15.00, stock: 40, rating: 4.6, totalReviews: 28, isFeatured: false, isNew: true, isOffer: true, tags: '["smoothie","acai","bebida"]' },
      
      // Agropecuária (store 2)
      { storeId: stores[2].id, name: 'Adubo NPK 20kg', slug: 'adubo-npk-20kg', description: 'Adubo NPK para culturas diversas.', price: 89.90, comparePrice: null, stock: 25, rating: 4.4, totalReviews: 12, isFeatured: true, isNew: false, isOffer: false, tags: '["adubo","fertilizante","agricultura"]' },
      { storeId: stores[2].id, name: 'Sementes de Milho 5kg', slug: 'sementes-milho-5kg', description: 'Sementes de milho híbrido alta produtividade.', price: 145.00, comparePrice: 169.90, stock: 15, rating: 4.6, totalReviews: 8, isFeatured: false, isNew: false, isOffer: true, tags: '["sementes","milho","plantio"]' },
      { storeId: stores[2].id, name: 'Muda de Cupuaçu', slug: 'muda-cupuacu', description: 'Muda de cupuaçuzeiro pronta para plantio.', price: 25.00, comparePrice: null, stock: 30, rating: 4.8, totalReviews: 5, isFeatured: true, isNew: true, isOffer: false, tags: '["muda","cupuacu","frutifera"]' },
      { storeId: stores[2].id, name: 'Kit Ferramentas Básico', slug: 'kit-ferramentas-basico', description: 'Kit de ferramentas básicas para campo e casa.', price: 67.00, comparePrice: 79.90, stock: 20, rating: 4.2, totalReviews: 9, isFeatured: false, isNew: false, isOffer: true, tags: '["ferramenta","kit","ferramentas"]' },
      
      // Farmácia Vida (store 3)
      { storeId: stores[3].id, name: 'Vitamina C 500mg 60 cáps', slug: 'vitamina-c-500mg', description: 'Suplemento de vitamina C. 60 cápsulas.', price: 35.00, comparePrice: 42.00, stock: 100, rating: 4.7, totalReviews: 34, isFeatured: true, isNew: false, isOffer: true, tags: '["vitamina","suplemento","saude"]', variations: '["500mg","1000mg"]' },
      { storeId: stores[3].id, name: 'Protetor Solar FPS 50 120ml', slug: 'protetor-solar-fps50', description: 'Protetor solar facial FPS 50.', price: 45.90, comparePrice: null, stock: 50, rating: 4.5, totalReviews: 18, isFeatured: false, isNew: true, isOffer: false, tags: '["protetor","solar","pele"]' },
      { storeId: stores[3].id, name: 'Kit Primeiros Socorros', slug: 'kit-primeiros-socorros', description: 'Kit completo de primeiros socorros.', price: 59.90, comparePrice: 75.00, stock: 20, rating: 4.8, totalReviews: 22, isFeatured: true, isNew: false, isOffer: true, tags: '["kit","socorros","saude"]' },
      { storeId: stores[3].id, name: 'Dorflex 30 comprimidos', slug: 'dorflex-30comp', description: 'Analgésico e relaxante muscular.', price: 18.90, comparePrice: null, stock: 150, rating: 4.4, totalReviews: 11, isFeatured: false, isNew: false, isOffer: false, tags: '["dorflex","remedio","analgesico"]' },
      
      // Padaria Pão Quente (store 4)
      { storeId: stores[4].id, name: 'Pão Francês (6 un)', slug: 'pao-frances-6un', description: 'Pão francês fresquinho saindo do forno.', price: 6.00, comparePrice: null, stock: 200, rating: 4.9, totalReviews: 120, isFeatured: true, isNew: false, isOffer: false, tags: '["pao","padaria","fresco"]' },
      { storeId: stores[4].id, name: 'Bolo de Chocolate Fatia', slug: 'bolo-chocolate-fatia', description: 'Fatia generosa de bolo com cobertura de ganache.', price: 16.50, comparePrice: null, stock: 15, rating: 4.8, totalReviews: 56, isFeatured: true, isNew: false, isOffer: false, tags: '["bolo","chocolate","doce"]', variations: '["Fatia","Inteiro"]' },
      { storeId: stores[4].id, name: 'Coxinha de Frango (10un)', slug: 'coxinha-frango-10un', description: 'Coxinhas cremosas pack 10 unidades.', price: 35.00, comparePrice: 42.00, stock: 30, rating: 4.7, totalReviews: 78, isFeatured: false, isNew: false, isOffer: true, tags: '["coxinha","salgado","frango"]' },
      { storeId: stores[4].id, name: 'Tapioca Recheada', slug: 'tapioca-recheada', description: 'Tapioca com queijo e presunto feita na hora.', price: 12.00, comparePrice: null, stock: 50, rating: 4.6, totalReviews: 34, isFeatured: false, isNew: true, isOffer: false, tags: '["tapioca","salgado","paraense"]', variations: '["Queijo","Presunto","Frango"]' },
      
      // Loja do Eletrônico (store 5)
      { storeId: stores[5].id, name: 'Capinha de Celular Premium', slug: 'capinha-celular-premium', description: 'Capinha silicone para diversos modelos.', price: 29.90, comparePrice: 49.90, stock: 100, rating: 4.2, totalReviews: 19, isFeatured: false, isNew: true, isOffer: true, tags: '["capinha","acessorio","celular"]', variations: '["iPhone","Samsung","Motorola"]' },
      { storeId: stores[5].id, name: 'Fone Bluetooth TWS', slug: 'fone-bluetooth-tws', description: 'Fone sem fio com bateria longa duração.', price: 79.90, comparePrice: 119.90, stock: 25, rating: 4.4, totalReviews: 14, isFeatured: true, isNew: false, isOffer: true, tags: '["fone","bluetooth","audio"]' },
      { storeId: stores[5].id, name: 'Carregador Turbo 20W', slug: 'carregador-turbo-20w', description: 'Carregador rápido com cabo USB-C.', price: 45.00, comparePrice: null, stock: 40, rating: 4.5, totalReviews: 21, isFeatured: false, isNew: true, isOffer: false, tags: '["carregador","cabo","acessorio"]' },
      { storeId: stores[5].id, name: 'Power Bank 10000mAh', slug: 'power-bank-10000mah', description: 'Power Bank portátil dupla saída USB.', price: 89.90, comparePrice: 129.90, stock: 15, rating: 4.3, totalReviews: 7, isFeatured: true, isNew: false, isOffer: true, tags: '["powerbank","bateria","acessorio"]' },
      
      // Pet Shop (store 6)
      { storeId: stores[6].id, name: 'Ração Premium Cães 15kg', slug: 'racao-premium-caes-15kg', description: 'Ração super premium sabor frango e arroz.', price: 89.90, comparePrice: 109.90, stock: 30, rating: 4.8, totalReviews: 45, isFeatured: true, isNew: false, isOffer: true, tags: '["racao","cao","pet"]', variations: '["8kg","15kg","20kg"]' },
      { storeId: stores[6].id, name: 'Coleira Anti-Pulgas', slug: 'coleira-anti-pulgas', description: 'Coleira anti-pulgas duração 8 meses.', price: 32.00, comparePrice: null, stock: 60, rating: 4.5, totalReviews: 28, isFeatured: false, isNew: false, isOffer: false, tags: '["coleira","pulga","pet"]', variations: '["Pequeno","Grande"]' },
      { storeId: stores[6].id, name: 'Brinquedo Corda Resistente', slug: 'brinquedo-corda', description: 'Brinquedo de corda para cães.', price: 19.90, comparePrice: null, stock: 40, rating: 4.1, totalReviews: 12, isFeatured: false, isNew: true, isOffer: false, tags: '["brinquedo","pet","cao"]' },
      { storeId: stores[6].id, name: 'Ração Gatos Adulto 3kg', slug: 'racao-gatos-adulto-3kg', description: 'Ração para gatos sabor salmão.', price: 45.00, comparePrice: 52.00, stock: 25, rating: 4.6, totalReviews: 19, isFeatured: false, isNew: false, isOffer: true, tags: '["racao","gato","pet"]' },
      
      // Salão da Bella (store 7)
      { storeId: stores[7].id, name: 'Corte Feminino', slug: 'corte-feminino', description: 'Corte e styling feminino profissional.', price: 45.00, comparePrice: null, stock: 999, rating: 4.9, totalReviews: 98, isFeatured: true, isNew: false, isOffer: false, tags: '["corte","cabelo","beleza"]', variations: '["Corte","Corte + Escova"]' },
      { storeId: stores[7].id, name: 'Coloração Capilar', slug: 'coloracao-capilar', description: 'Coloração profissional com produtos de qualidade.', price: 120.00, comparePrice: 150.00, stock: 999, rating: 4.8, totalReviews: 67, isFeatured: false, isNew: false, isOffer: true, tags: '["coloracao","cabelo","beleza"]' },
      { storeId: stores[7].id, name: 'Manicure Completa', slug: 'manicure-completa', description: 'Manicure e pedicure com esmaltação.', price: 50.00, comparePrice: null, stock: 999, rating: 4.7, totalReviews: 54, isFeatured: false, isNew: true, isOffer: false, tags: '["manicure","unha","beleza"]' },
      { storeId: stores[7].id, name: 'Hidratação Capilar', slug: 'hidratacao-capilar', description: 'Hidratação profunda para cabelos danificados.', price: 80.00, comparePrice: 95.00, stock: 999, rating: 4.9, totalReviews: 41, isFeatured: true, isNew: false, isOffer: true, tags: '["hidratacao","cabelo","tratamento"]' },
    ]

    const products = []
    for (const pd of productsData) {
      const product = await db.product.create({
        data: {
          ...pd,
          slug: pd.slug,
          soldCount: Math.floor(Math.random() * 100),
          images: '[]',
          status: 'ACTIVE',
          variations: pd.variations || null,
        },
      })
      products.push(product)
    }

    // Create banners
    const bannersData = [
      { storeId: stores[1].id, title: 'Ofertas da Semana', subtitle: 'Até 40% de desconto em produtos locais', level: 'DAILY_OFFERS' as const, order: 0, image: 'banner-offers' },
      { storeId: stores[4].id, title: 'Entrega Grátis Pão Quente', subtitle: 'Compras acima de R$ 25 na padaria', level: 'DAILY_OFFERS' as const, order: 1, image: 'banner-pao' },
      { storeId: stores[2].id, title: 'Novidades Agropecuária', subtitle: 'Novas sementes e ferramentas chegaram!', level: 'NEW_IN_CITY' as const, order: 0, image: 'banner-agro' },
      { storeId: stores[7].id, title: 'Salão da Bella - Novos Serviços', subtitle: 'Escova progressiva e botox capilar', level: 'NEW_IN_CITY' as const, order: 1, image: 'banner-bella' },
      { storeId: stores[0].id, title: 'Feira do Produtor', subtitle: 'Toda sexta-feira com produtos fresquinhos!', level: 'LOCAL_PARTNERSHIPS' as const, order: 0, image: 'banner-feira' },
      { storeId: stores[6].id, title: 'Dia do Pet', subtitle: '20% de desconto em rações todo sábado', level: 'SEASONAL' as const, order: 0, image: 'banner-pet' },
      { storeId: stores[3].id, title: 'Farmácia Vida - Saúde em primeiro lugar', subtitle: 'Entrega grátis em todos os medicamentos', level: 'FEATURED' as const, order: 0, image: 'banner-farmacia' },
      { storeId: stores[5].id, title: 'Loja do Eletrônico - Ofertas Imperdíveis', subtitle: 'Fones e acessórios com até 50% OFF', level: 'FEATURED' as const, order: 1, image: 'banner-eletronico' },
    ]

    for (const bd of bannersData) {
      await db.banner.create({
        data: { ...bd, isActive: true, startsAt: new Date(), endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      })
    }

    // Create reviews
    const reviewsData = [
      { accountId: userAccount.id, storeId: stores[1].id, productId: products[4]?.id, rating: 5, comment: 'Melhor açaí de Dom Eliseu! Sempre fresquinho.' },
      { accountId: userAccount.id, storeId: stores[4].id, productId: products[16]?.id, rating: 5, comment: 'Pão sempre fresquinho, adorei!' },
      { accountId: userAccount.id, storeId: stores[3].id, productId: products[12]?.id, rating: 4, comment: 'Vitamina C excelente, entrega rápida.' },
      { accountId: userAccount.id, storeId: stores[0].id, productId: products[0]?.id, rating: 4, comment: 'Bom preço e entrega rápida.' },
      { accountId: userAccount.id, storeId: stores[7].id, productId: products[28]?.id, rating: 5, comment: 'Corte perfeito! Profissional muito atenciosa.' },
    ]

    for (const rd of reviewsData) {
      await db.review.create({ data: { ...rd, isVerified: true } })
    }

    // Create promotions
    await db.promotion.createMany({
      data: [
        { storeId: stores[1].id, title: 'Açaí Feliz', description: '10% de desconto no açaí', type: 'PERCENTAGE', value: 10, code: 'ACAI10', startsAt: new Date(), endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), isActive: true },
        { storeId: stores[4].id, title: 'Pão de Manhã', description: 'Desconto no pão antes das 8h', type: 'FIXED_AMOUNT', value: 2, startsAt: new Date(), endsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), isActive: true },
      ],
    })

    // Create loyalty points
    await db.loyaltyPoint.createMany({
      data: [
        { accountId: userAccount.id, points: 500, source: 'BÔNUS_CADASTRO' },
        { accountId: userAccount.id, points: 350, source: 'COMPRA', referenceId: 'DP000003' },
        { accountId: userAccount.id, points: 200, source: 'INDICAÇÃO' },
        { accountId: userAccount.id, points: 200, source: 'COMPRA', referenceId: 'DP000001' },
      ],
    })

    // Create address
    await db.address.create({
      data: {
        accountId: userAccount.id,
        street: 'Rua Principal',
        number: '123',
        neighborhood: 'Centro',
        city: 'Dom Eliseu',
        state: 'PA',
        zipCode: '68555-000',
        isDefault: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        accounts: 10,
        stores: stores.length,
        products: products.length,
        banners: bannersData.length,
        reviews: reviewsData.length,
        promotions: 2,
      },
    })
  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
