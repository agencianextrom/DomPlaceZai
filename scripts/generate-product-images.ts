/**
 * Script to generate product images using z-ai-web-dev-sdk
 * Run with: npx tsx scripts/generate-product-images.ts
 */
import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

const outputDir = path.join(__dirname, '../public/images/products')

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const products = [
  { name: 'acai-500ml', prompt: 'Professional product photography of açaí bowl with granola and banana slices, rich purple açaí, top-down flat lay, white marble background, studio lighting, Brazilian food, high quality food photography' },
  { name: 'bolo-chocolate', prompt: 'Professional product photography of chocolate cake slice with dark ganache dripping, decadent dessert on white plate, white background, studio lighting, food photography, high quality' },
  { name: 'vitamina-c', prompt: 'Professional product photography of vitamin C supplement bottle orange label 500mg capsules, pharmacy product, clean white background, bright studio lighting, health wellness product photography' },
  { name: 'adubo-npk', prompt: 'Professional product photography of green fertilizer NPK bag 20kg agriculture, labeled bag on white background, studio lighting, product photography, farming supplies' },
  { name: 'arroz-tio-joao', prompt: 'Professional product photography of rice bag 5kg, Brazilian white rice in red packaging, clean white background, studio lighting, food product photography' },
  { name: 'oleo-soja', prompt: 'Professional product photography of soybean cooking oil bottle 900ml, yellow bottle with red cap, clean white background, studio lighting, food product shot' },
  { name: 'power-bank', prompt: 'Professional product photography of 10000mAh black power bank portable charger with USB cables, sleek modern design, clean white background, studio lighting, electronics product' },
  { name: 'capinha-celular', prompt: 'Professional product photography of premium silicone phone case clear with floral pattern, modern design, clean white background, studio lighting, smartphone accessory' },
  { name: 'coxinha-frango', prompt: 'Professional product photography of 10 crispy Brazilian coxinha chicken croquettes arranged on plate, golden fried, clean white background, studio lighting, Brazilian food photography' },
  { name: 'smoothie-acai', prompt: 'Professional product photography of açaí smoothie in transparent plastic cup with banana and strawberry, purple drink, clean white background, studio lighting, beverage photography' },
  { name: 'racao-gatos', prompt: 'Professional product photography of premium dry cat food 3kg bag, salmon flavor for adult cats, pet food product, clean white background, studio lighting' },
  { name: 'sementes-milho', prompt: 'Professional product photography of corn seeds 5kg bag, hybrid agriculture seeds in labeled packaging, clean white background, studio lighting, farming product' },
  { name: 'kit-ferramentas', prompt: 'Professional product photography of basic tool kit with hammer wrench screwdriver pliers arranged neatly, hardware tools, clean white background, studio lighting' },
  { name: 'feijao-carioca', prompt: 'Professional product photography of Brazilian carioca beans 1kg bag, dried beans in packaging, clean white background, studio lighting, food product' },
  { name: 'cafe-torrado', prompt: 'Professional product photography of roasted ground coffee 500g bag, premium Brazilian coffee, brown packaging, clean white background, studio lighting' },
  { name: 'macarrao-espaguete', prompt: 'Professional product photography of spaghetti pasta 500g box, Italian pasta in blue packaging, clean white background, studio lighting, food product' },
  { name: 'farinha-mandioca', prompt: 'Professional product photography of cassava flour 1kg bag, Brazilian farinha de mandioca, yellowish flour, clean white background, studio lighting' },
  { name: 'leite-integral', prompt: 'Professional product photography of whole milk 1 liter carton, Brazilian milk brand blue packaging, clean white background, studio lighting, dairy product' },
  { name: 'acucar-cristal', prompt: 'Professional product photography of crystal sugar 1kg bag, white sugar in clear packaging, clean white background, studio lighting, food product' },
  { name: 'racao-caes', prompt: 'Professional product photography of premium dog food 15kg bag, chicken and rice flavor, pet food product in green bag, clean white background, studio lighting' },
  { name: 'coleira-anti-pulgas', prompt: 'Professional product photography of anti-flea dog collar in packaging, blue collar, pet accessory, clean white background, studio lighting' },
  { name: 'brinquedo-corda', prompt: 'Professional product photography of dog rope toy for tug of war, colorful braided cotton rope, pet toy, clean white background, studio lighting' },
  { name: 'pao-frances', prompt: 'Professional product photography of 6 fresh French bread rolls, golden crusty baguette, bakery bread, clean white background, studio lighting, bread photography' },
  { name: 'tapioca-recheada', prompt: 'Professional product photography of Brazilian tapioca flatbread with cheese and ham filling, round golden tapioca, clean white background, studio lighting, food photography' },
  { name: 'fone-bluetooth', prompt: 'Professional product photography of TWS wireless Bluetooth earbuds in white charging case, modern true wireless earphones, clean white background, studio lighting, tech product' },
  { name: 'carregador-turbo', prompt: 'Professional product photography of 20W fast USB-C charger adapter white cube with cable, modern tech accessory, clean white background, studio lighting' },
  { name: 'corte-feminino', prompt: 'Professional photography of a beauty salon with woman getting haircut, modern hair salon interior, warm lighting, elegant styling station, professional service' },
  { name: 'coloracao-capilar', prompt: 'Professional photography of hair coloring products arranged, hair dye tubes and bowls, beauty salon products on marble surface, warm lighting, professional salon' },
  { name: 'manicure-completa', prompt: 'Professional photography of manicure set with colorful nail polish bottles and nail tools, beauty products arranged, clean white background, studio lighting' },
  { name: 'hidratacao-capilar', prompt: 'Professional photography of hair treatment products, hydrating hair mask tub and serum bottles, beauty salon products, clean white background, studio lighting' },
  { name: 'acai-300ml', prompt: 'Professional product photography of small açaí cup 300ml with granola topping, purple açaí in plastic cup, clean white background, studio lighting, Brazilian food' },
  { name: 'acai-premium-700ml', prompt: 'Professional product photography of large premium açaí bowl 700ml with fresh fruits strawberry banana kiwi, purple açaí, clean white background, studio lighting' },
  { name: 'tigela-cupuacu', prompt: 'Professional product photography of cupuaçu bowl dessert with tapioca flour, creamy yellow cupuaçu, clean white background, studio lighting, Brazilian food' },
  { name: 'muda-cupuacu', prompt: 'Professional product photography of cupuaçu fruit tree seedling in plastic pot, green plant nursery, healthy young plant, clean white background, studio lighting' },
  { name: 'kit-primeiros-socorros', prompt: 'Professional product photography of first aid kit box with bandages antiseptic gauze scissors, red cross medical kit, clean white background, studio lighting' },
  { name: 'dorflex-30', prompt: 'Professional product photography of Dorflex pain relief medication box 30 tablets, blue and white pharmaceutical packaging, clean white background, studio lighting' },
  { name: 'protetor-solar', prompt: 'Professional product photography of sunscreen SPF 50 bottle 120ml, sun protection cream, orange sunscreen tube, clean white background, studio lighting' },
  { name: 'pomada-bepantol', prompt: 'Professional product photography of Bepantol healing ointment tube 50g, dermal repair cream in tube, clean white background, studio lighting, pharmaceutical product' },
  // Store covers/banners
  { name: 'store-grocery', prompt: 'Beautiful grocery store interior with fresh produce colorful fruits vegetables organized shelves, warm lighting, modern supermarket, wide angle photography' },
  { name: 'store-acai', prompt: 'Vibrant açaí shop counter with purple açaí bowls toppings granola banana strawberry, Brazilian food stall, warm ambient lighting, tropical colors' },
  { name: 'store-pharmacy', prompt: 'Modern clean pharmacy interior with organized shelves medicine products, bright white lighting, professional pharmacy, healthcare store' },
  { name: 'store-agriculture', prompt: 'Agricultural supply store with seeds bags fertilizers tools, green and earth tones, farming supplies warehouse, rustic but organized' },
  { name: 'store-bakery', prompt: 'Artisan bakery interior with fresh bread pastries golden croissants on display, warm golden lighting, cozy French bakery style, inviting atmosphere' },
  { name: 'store-electronics', prompt: 'Modern electronics store interior with smartphones gadgets accessories on display shelves, blue LED lighting, tech store, sleek and modern' },
  { name: 'store-pets', prompt: 'Pet shop interior with dog food bags pet accessories toys grooming supplies, friendly warm atmosphere, animal supplies store, colorful and inviting' },
  { name: 'store-beauty', prompt: 'Elegant beauty salon interior with styling chairs mirrors hair products, warm pink and gold lighting, modern salon, luxurious atmosphere' },
]

async function generateImages() {
  console.log('Initializing ZAI...')
  const zai = await ZAI.create()
  
  const results: { name: string; path: string; status: string }[] = []
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    const outputPath = path.join(outputDir, `${product.name}.png`)
    
    // Skip if image already exists
    if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
      console.log(`⏭️  Skipping ${product.name} (already exists)`)
      results.push({ name: product.name, path: outputPath, status: 'skipped' })
      continue
    }
    
    console.log(`🎨 Generating ${i + 1}/${products.length}: ${product.name}...`)
    
    try {
      const response = await zai.images.generations.create({
        prompt: product.prompt,
        size: '1024x1024',
      })
      
      const imageBase64 = response.data[0].base64
      const buffer = Buffer.from(imageBase64, 'base64')
      fs.writeFileSync(outputPath, buffer)
      
      console.log(`✅ Saved ${product.name} (${(buffer.length / 1024).toFixed(0)}KB)`)
      results.push({ name: product.name, path: outputPath, status: 'success' })
    } catch (error: any) {
      console.log(`❌ Failed ${product.name}: ${error.message}`)
      results.push({ name: product.name, path: outputPath, status: 'failed' })
    }
  }
  
  const success = results.filter(r => r.status === 'success').length
  const skipped = results.filter(r => r.status === 'skipped').length
  const failed = results.filter(r => r.status === 'failed').length
  
  console.log(`\n📊 Results: ${success} generated, ${skipped} skipped, ${failed} failed`)
}

generateImages().catch(console.error)
