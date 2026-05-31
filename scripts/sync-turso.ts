/**
 * Sync Prisma schema to Turso remote database
 * Connects to Turso using @libsql/client and applies missing columns/tables
 */
import { createClient } from '@libsql/client'
import { hashPassword } from '../src/lib/crypto'

async function syncTurso() {
  const url = process.env.TURSO_URL
  const token = process.env.TURSO_AUTH_TOKEN

  if (!url || !token) {
    console.error('❌ TURSO_URL and TURSO_AUTH_TOKEN are required')
    process.exit(1)
  }

  console.log(`🔗 Connecting to Turso: ${url}`)
  const client = createClient({ url, authToken: token })

  // Test connection
  try {
    await client.execute('SELECT 1')
    console.log('✅ Connected to Turso successfully')
  } catch (err) {
    console.error('❌ Failed to connect to Turso:', err)
    process.exit(1)
  }

  // Check existing tables
  const { rows: tables } = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  )
  const existingTables = new Set(tables.map(r => r.name))
  console.log(`📊 Found ${existingTables.size} existing tables`)

  // Check if Account table exists and has all columns
  if (existingTables.has('Account')) {
    const { rows: accountCols } = await client.execute("PRAGMA table_info('Account')")
    const colNames = new Set(accountCols.map((r: any) => r.name))
    console.log(`📋 Account columns: ${[...colNames].join(', ')}`)

    // Add missing columns
    const requiredColumns = [
      { name: 'referrer', type: 'TEXT' },
      { name: 'locationConsent', type: 'BOOLEAN DEFAULT 0' },
      { name: 'twoFactorEnabled', type: 'BOOLEAN DEFAULT 0' },
      { name: 'twoFactorSecret', type: 'TEXT' },
    ]

    for (const col of requiredColumns) {
      if (!colNames.has(col.name)) {
        try {
          await client.execute(`ALTER TABLE "Account" ADD COLUMN "${col.name}" ${col.type}`)
          console.log(`➕ Added column: Account.${col.name}`)
        } catch (err) {
          console.log(`⚠️ Could not add Account.${col.name}:`, err)
        }
      }
    }
  }

  // Check Store table
  if (existingTables.has('Store')) {
    const { rows: storeCols } = await client.execute("PRAGMA table_info('Store')")
    const colNames = new Set(storeCols.map((r: any) => r.name))
    
    const requiredColumns = [
      { name: 'pixKey', type: 'TEXT' },
      { name: 'socialMedia', type: 'TEXT' },
      { name: 'deliveryRadius', type: 'REAL' },
      { name: 'minOrderValue', type: 'REAL' },
    ]

    for (const col of requiredColumns) {
      if (!colNames.has(col.name)) {
        try {
          await client.execute(`ALTER TABLE "Store" ADD COLUMN "${col.name}" ${col.type}`)
          console.log(`➕ Added column: Store.${col.name}`)
        } catch (err) {
          console.log(`⚠️ Could not add Store.${col.name}:`, err)
        }
      }
    }
  }

  // Check Product table
  if (existingTables.has('Product')) {
    const { rows: prodCols } = await client.execute("PRAGMA table_info('Product')")
    const colNames = new Set(prodCols.map((r: any) => r.name))

    const requiredColumns = [
      { name: 'costPrice', type: 'REAL' },
      { name: 'barcode', type: 'TEXT' },
      { name: 'weight', type: 'REAL' },
      { name: 'dimensions', type: 'TEXT' },
    ]

    for (const col of requiredColumns) {
      if (!colNames.has(col.name)) {
        try {
          await client.execute(`ALTER TABLE "Product" ADD COLUMN "${col.name}" ${col.type}`)
          console.log(`➕ Added column: Product.${col.name}`)
        } catch (err) {
          console.log(`⚠️ Could not add Product.${col.name}:`, err)
        }
      }
    }
  }

  // Check DeliveryDriver table
  if (existingTables.has('DeliveryDriver')) {
    const { rows: driverCols } = await client.execute("PRAGMA table_info('DeliveryDriver')")
    const colNames = new Set(driverCols.map((r: any) => r.name))

    const requiredColumns = [
      { name: 'commissionRate', type: 'REAL DEFAULT 0.85' },
    ]

    for (const col of requiredColumns) {
      if (!colNames.has(col.name)) {
        try {
          await client.execute(`ALTER TABLE "DeliveryDriver" ADD COLUMN "${col.name}" ${col.type}`)
          console.log(`➕ Added column: DeliveryDriver.${col.name}`)
        } catch (err) {
          console.log(`⚠️ Could not add DeliveryDriver.${col.name}:`, err)
        }
      }
    }
  }

  // Check if DeliveryZone table exists
  if (!existingTables.has('DeliveryZone')) {
    try {
      await client.execute(`
        CREATE TABLE "DeliveryZone" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "neighborhood" TEXT NOT NULL,
          "city" TEXT NOT NULL DEFAULT 'Dom Eliseu',
          "state" TEXT NOT NULL DEFAULT 'PA',
          "deliveryFee" REAL NOT NULL,
          "estimatedMinutes" INTEGER NOT NULL DEFAULT 30,
          "isActive" BOOLEAN NOT NULL DEFAULT 1,
          "polygon" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `)
      await client.execute('CREATE INDEX "DeliveryZone_city_idx" ON "DeliveryZone"("city")')
      await client.execute('CREATE INDEX "DeliveryZone_isActive_idx" ON "DeliveryZone"("isActive")')
      console.log('➕ Created table: DeliveryZone')
    } catch (err) {
      console.log('⚠️ Could not create DeliveryZone:', err)
    }
  }

  // Check if AppSettings table exists
  if (!existingTables.has('AppSettings')) {
    try {
      await client.execute(`
        CREATE TABLE "AppSettings" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "key" TEXT NOT NULL,
          "value" TEXT NOT NULL,
          "type" TEXT NOT NULL DEFAULT 'string',
          "description" TEXT,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `)
      await client.execute('CREATE UNIQUE INDEX "AppSettings_key_key" ON "AppSettings"("key")')
      await client.execute('CREATE INDEX "AppSettings_key_idx" ON "AppSettings"("key")')
      console.log('➕ Created table: AppSettings')
      
      // Insert default settings
      const now = new Date().toISOString()
      const settings = [
        ['app_name', 'DomPlace', 'string', 'Nome do aplicativo'],
        ['city_name', 'Dom Eliseu', 'string', 'Nome da cidade'],
        ['state_code', 'PA', 'string', 'Sigla do estado'],
        ['default_delivery_fee', '5.00', 'number', 'Taxa de entrega padrão'],
        ['free_delivery_threshold', '50.00', 'number', 'Valor mínimo para frete grátis'],
        ['loyalty_points_per_real', '1', 'number', 'Pontos por real gasto'],
        ['welcome_bonus_points', '500', 'number', 'Pontos de boas-vindas'],
        ['max_delivery_radius_km', '15', 'number', 'Raio máximo de entrega em km'],
        ['platform_commission_rate', '0.10', 'number', 'Taxa de comissão da plataforma'],
        ['driver_commission_rate', '0.85', 'number', 'Taxa de comissão do entregador'],
        ['affiliate_commission_rate', '0.03', 'number', 'Taxa de comissão do afiliado'],
        ['min_order_value', '10.00', 'number', 'Valor mínimo do pedido'],
      ]
      for (const [key, value, type, description] of settings) {
        await client.execute({
          sql: `INSERT INTO "AppSettings" (id, key, value, type, description, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
          args: [`cfg-${key}`, key, value, type, description, now]
        })
      }
      console.log('➕ Inserted default app settings')
    } catch (err) {
      console.log('⚠️ Could not create AppSettings:', err)
    }
  }

  // Create default delivery zones for Dom Eliseu
  if (existingTables.has('DeliveryZone')) {
    const { rows: zones } = await client.execute('SELECT COUNT(*) as cnt FROM "DeliveryZone"')
    if ((zones[0] as any).cnt === 0) {
      const now = new Date().toISOString()
      const zonesData = [
        ['Centro', 'Centro', 0, 20],
        ['Jardim Alvorada', 'Jardim Alvorada', 3.00, 25],
        ['Vila Nova', 'Vila Nova', 4.00, 30],
        ['Zona Rural', 'Zona Rural', 8.00, 45],
        ['Distrito Industrial', 'Distrito Industrial', 5.00, 35],
      ]
      for (const [name, neighborhood, fee, minutes] of zonesData) {
        await client.execute({
          sql: `INSERT INTO "DeliveryZone" (id, name, neighborhood, city, state, deliveryFee, estimatedMinutes, isActive, createdAt, updatedAt) VALUES (?, ?, ?, 'Dom Eliseu', 'PA', ?, ?, 1, ?, ?)`,
          args: [`zone-${name.toLowerCase().replace(/\s/g, '-')}`, name, neighborhood, fee, minutes, now, now]
        })
      }
      console.log('➕ Created default delivery zones for Dom Eliseu')
    }
  }

  console.log('✅ Turso sync completed!')
}

syncTurso().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
