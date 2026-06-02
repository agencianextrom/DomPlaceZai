/**
 * Product image mapping — maps product slugs and store slugs to real product images
 * Uses Unsplash for reliable, high-quality, free-to-use product photography
 * 
 * When local images are generated via scripts/generate-product-images.ts,
 * they will take priority (public/images/products/*.png)
 */
export const productImageMap: Record<string, string> = {
  // ===== MERCADO DO ZÉ (FOOD) =====
  'arroz-tio-joao-5kg': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
  'feijao-carioca-1kg': 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&h=400&fit=crop',
  'oleo-soja-900ml': 'https://images.unsplash.com/photo-1474979266404-7eaabda50445?w=400&h=400&fit=crop',
  'cafe-torrado-moido-500g': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
  'acucar-cristal-1kg': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=400&fit=crop',
  'farinha-mandioca-1kg': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
  'macarrao-espaguete-500g': 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&h=400&fit=crop',
  'leite-integral-1l': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop',

  // ===== AÇAÍ DA BOA (FOOD) =====
  'acai-300ml': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=400&fit=crop',
  'acai-500ml': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=400&fit=crop',
  'acai-premium-700ml': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=400&fit=crop',
  'tigela-cupuacu-500ml': 'https://images.unsplash.com/photo-1622434707128-5fba30704367?w=400&h=400&fit=crop',
  'smoothie-acai-banana': 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop',

  // ===== FARMÁCIA VIDA (HEALTH) =====
  'vitamina-c-500mg-60caps': 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&h=400&fit=crop',
  'kit-primeiros-socorros': 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&h=400&fit=crop',
  'dorflex-30comprimidos': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
  'protetor-solar-fps50-120ml': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
  'pomada-bepantol-50g': 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=400&fit=crop',

  // ===== AGROPECUÁRIA SÃO PAULO (AGRICULTURE) =====
  'adubo-npk-20kg': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=400&fit=crop',
  'sementes-milho-5kg': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop',
  'muda-cupuacu': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
  'kit-ferramentas-basico': 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400&h=400&fit=crop',

  // ===== PADARIA PÃO QUENTE (FOOD) =====
  'pao-frances-6un': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
  'bolo-chocolate-fatia': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
  'coxinha-frango-10un': 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=400&h=400&fit=crop',
  'tapioca-recheada': 'https://images.unsplash.com/photo-1621768807785-27852d2e8b8f?w=400&h=400&fit=crop',

  // ===== LOJA DO ELETRÔNICO (ELECTRONICS) =====
  'capinha-celular-premium': 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop',

  // ===== SLUG ALIASES (short slugs used by DailyDeals / WeekendSpecials) =====
  'arroz-tio-joao': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
  'vitamina-c': 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&h=400&fit=crop',
  'bolo-chocolate': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
  'racao-premium': 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop',
  'fone-bluetooth-tws': 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop',
  'carregador-turbo-20w': 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=400&fit=crop',
  'power-bank-10000mah': 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop',

  // ===== PET SHOP AMIGO FIEL (ANIMALS) =====
  'racao-premium-caes-15kg': 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop',
  'coleira-anti-pulgas': 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop',
  'brinquedo-corda': 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=400&h=400&fit=crop',
  'racao-gatos-adulto-3kg': 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop',

  // ===== SALÃO DA BELLA (BEAUTY) =====
  'corte-feminino': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop',
  'coloracao-capilar': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop',
  'manicure-completa': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop',
  'hidratacao-capilar': 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&h=400&fit=crop',
}

/**
 * Store cover/banner image mapping
 */
export const storeImageMap: Record<string, string> = {
  'mercado-do-ze': 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=400&fit=crop',
  'acai-da-boa': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=400&fit=crop',
  'farmacia-vida': 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&h=400&fit=crop',
  'agropecuaria-sp': 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop',
  'padaria-pao-quente': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=400&fit=crop',
  'loja-eletronico': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=400&fit=crop',
  'pet-shop-amigo-fiel': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=400&fit=crop',
  'salao-da-bella': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=400&fit=crop',
}

/**
 * Get the best available product image URL with fallback priority:
 * 1. First image from product.images JSON array
 * 2. Mapped URL from productImageMap (slug-based, Unsplash)
 * 3. Category default image
 * 4. null (caller should show gradient+icon fallback)
 */
export function resolveProductImage(options: {
  slug?: string
  category?: string
  images?: string // JSON string like '["url1","url2"]'
}): string | null {
  const { slug, category, images } = options

  // 1. Parse product.images JSON string
  if (images) {
    try {
      const parsed = JSON.parse(images)
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string' && parsed[0].length > 0) {
        return parsed[0]
      }
    } catch {
      // not valid JSON, continue
    }
  }

  // 2. Slug-based mapping
  if (slug && productImageMap[slug]) {
    return productImageMap[slug]
  }

  // 3. Category default image
  if (category && categoryDefaultImages[category]) {
    return categoryDefaultImages[category]
  }

  return null
}

/**
 * Get product image URL with fallback priority:
 * 1. Mapped URL from productImageMap (Unsplash)
 * 2. null
 */
export function getProductImageUrl(slug: string): string | null {
  return productImageMap[slug] || null
}

/**
 * Get store image URL
 */
export function getStoreImageUrl(slug: string): string | null {
  return storeImageMap[slug] || null
}

/** 
 * Default fallback images per category for products without specific images 
 */
export const categoryDefaultImages: Record<string, string> = {
  FOOD: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
  HEALTH: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=400&fit=crop',
  AGRICULTURE: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop',
  ELECTRONICS: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop',
  ANIMALS: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
  BEAUTY: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
  FASHION: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop',
  SERVICES: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop',
  HOME_GARDEN: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
  SPORTS: 'https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=400&h=400&fit=crop',
  EDUCATION: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop',
  CONSTRUCTION: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=400&fit=crop',
  AUTOMOTIVE: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop',
  OTHER: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
}
