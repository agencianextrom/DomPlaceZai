/**
 * Real product images from Unsplash (free, high-quality, no API key needed).
 * Each product slug maps to a specific product image URL.
 * Uses Unsplash's direct image CDN for reliable delivery.
 */

export const PRODUCT_REAL_IMAGES: Record<string, string[]> = {
  // === Mercado do Zé (FOOD) ===
  'arroz-tio-joao-5kg': [
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=400&fit=crop',
  ],
  'feijao-carioca-1kg': [
    'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=400&fit=crop',
  ],
  'oleo-soja-900ml': [
    'https://images.unsplash.com/photo-1474979266404-7f28a56171e2?w=400&h=400&fit=crop',
  ],
  'cafe-torrado-moido-500g': [
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
  ],
  'acucar-cristal-1kg': [
    'https://images.unsplash.com/photo-1581268298814-93df8b4fbaca?w=400&h=400&fit=crop',
  ],
  'farinha-mandioca-1kg': [
    'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=400&h=400&fit=crop',
  ],
  'macarrao-espaguete-500g': [
    'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&h=400&fit=crop',
  ],
  'leite-integral-1l': [
    'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop',
  ],

  // === Açaí da Boa (FOOD) ===
  'acai-300ml': [
    'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&h=400&fit=crop',
  ],
  'acai-500ml': [
    'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop',
  ],
  'acai-premium-700ml': [
    'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&h=400&fit=crop',
  ],
  'tigela-cupuacu-500ml': [
    'https://images.unsplash.com/photo-1557843360-819ac694c0b6?w=400&h=400&fit=crop',
  ],
  'smoothie-acai-banana': [
    'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=400&fit=crop',
  ],

  // === Farmácia Vida (HEALTH) ===
  'vitamina-c-500mg-60caps': [
    'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&h=400&fit=crop',
  ],
  'kit-primeiros-socorros': [
    'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&h=400&fit=crop',
  ],
  'dorflex-30comprimidos': [
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
  ],
  'protetor-solar-fps50-120ml': [
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1532947940-915b0fd1a140?w=400&h=400&fit=crop',
  ],
  'pomada-bepantol-50g': [
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
  ],

  // === Agropecuária São Paulo (AGRICULTURE) ===
  'adubo-npk-20kg': [
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
  ],
  'sementes-milho-5kg': [
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop',
  ],
  'muda-cupuacu': [
    'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=400&fit=crop',
  ],
  'kit-ferramentas-basico': [
    'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400&h=400&fit=crop',
  ],

  // === Padaria Pão Quente (FOOD) ===
  'pao-frances-6un': [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
  ],
  'bolo-chocolate-fatia': [
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop',
  ],
  'coxinha-frango-10un': [
    'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=400&h=400&fit=crop',
  ],
  'tapioca-recheada': [
    'https://images.unsplash.com/photo-1604152135912-04a022e23696?w=400&h=400&fit=crop',
  ],

  // === Loja do Eletrônico (ELECTRONICS) ===
  'capinha-celular-premium': [
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop',
  ],
  'fone-bluetooth-tws': [
    'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop',
  ],
  'carregador-turbo-20w': [
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=400&fit=crop',
  ],
  'power-bank-10000mah': [
    'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop',
  ],

  // === Pet Shop Amigo Fiel (ANIMALS) ===
  'racao-premium-caes-15kg': [
    'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop',
  ],
  'coleira-anti-pulgas': [
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop',
  ],
  'brinquedo-corda': [
    'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=400&h=400&fit=crop',
  ],
  'racao-gatos-adulto-3kg': [
    'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop',
  ],

  // === Salão da Bella (BEAUTY) ===
  'corte-feminino': [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop',
  ],
  'coloracao-capilar': [
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop',
  ],
  'manicure-completa': [
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop',
  ],
  'hidratacao-capilar': [
    'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&h=400&fit=crop',
  ],

  // === Store logos/cover images (used as fallback for products not in the map) ===
  '__store_covers': {
    'mercado-do-ze': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop',
    'acai-da-boa': 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&h=400&fit=crop',
    'farmacia-vida': 'https://images.unsplash.com/photo-1631549916768-481b48922f86?w=600&h=400&fit=crop',
    'agropecuaria-sp': 'https://images.unsplash.com/photo-1500937386664-ac56d6f37967?w=600&h=400&fit=crop',
    'padaria-pao-quente': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop',
    'loja-eletronico': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=400&fit=crop',
    'pet-shop-amigo-fiel': 'https://images.unsplash.com/photo-1450778869182-6c52262f8ee5?w=600&h=400&fit=crop',
    'salao-da-bella': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop',
  },
}

/**
 * Get the real image URL for a product by slug.
 * Falls back to an array with just the provided fallback URL.
 */
export function getProductRealImages(slug: string, fallback?: string): string[] {
  if (PRODUCT_REAL_IMAGES[slug]) {
    return PRODUCT_REAL_IMAGES[slug]
  }
  if (fallback) {
    return [fallback]
  }
  return []
}

/**
 * Get all product slugs that have real images.
 */
export function getAllProductsWithRealImages(): string[] {
  return Object.keys(PRODUCT_REAL_IMAGES).filter(k => !k.startsWith('__'))
}
