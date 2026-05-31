import { createClient } from '@libsql/client'

const url = process.env.TURSO_URL!
const authToken = process.env.TURSO_AUTH_TOKEN!

const client = createClient({ url, authToken })

async function migrate() {
  console.log('Running Turso schema migration...')
  
  const migrations = [
    "ALTER TABLE Account ADD COLUMN referrer TEXT",
    "ALTER TABLE \"Order\" ADD COLUMN couponCode TEXT",
    "ALTER TABLE \"Order\" ADD COLUMN source TEXT DEFAULT 'app'",
    "ALTER TABLE ActivityLog ADD COLUMN deviceInfo TEXT",
    "ALTER TABLE Notification ADD COLUMN readAt DATETIME",
    "ALTER TABLE ChatMessage ADD COLUMN expiresAt DATETIME",
  ]
  
  for (const sql of migrations) {
    try {
      await client.execute(sql)
      console.log(`✅ Applied: ${sql.substring(0, 60)}...`)
    } catch (e: any) {
      if (e.message?.includes('duplicate column name') || e.message?.includes('already exists')) {
        console.log(`⏭️  Skipped (already exists): ${sql.substring(0, 50)}...`)
      } else {
        console.error(`❌ Failed: ${sql}`, e.message)
      }
    }
  }
  
  // Create new tables
  const tables = [
    `CREATE TABLE IF NOT EXISTS DeliveryZone (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)) || '-' || hex(randomblob(4)) || '-4' || substr(hex(randomblob(3)),1,3) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(hex(randomblob(3)),1,3) || '-' || hex(randomblob(12)))),
      name TEXT NOT NULL,
      neighborhood TEXT NOT NULL,
      city TEXT DEFAULT 'Dom Eliseu',
      state TEXT DEFAULT 'PA',
      deliveryFee REAL NOT NULL,
      estimatedMinutes INTEGER DEFAULT 30,
      isActive BOOLEAN DEFAULT 1,
      polygon TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS AppSettings (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)) || '-' || hex(randomblob(4)) || '-4' || substr(hex(randomblob(3)),1,3) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(hex(randomblob(3)),1,3) || '-' || hex(randomblob(12)))),
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      type TEXT DEFAULT 'string',
      description TEXT,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  ]
  
  for (const sql of tables) {
    try {
      await client.execute(sql)
      console.log(`✅ Created table`)
    } catch (e: any) {
      console.log(`⏭️  Table exists: ${e.message?.substring(0, 50)}`)
    }
  }
  
  console.log('\nMigration complete!')
  client.close()
}

migrate().catch(console.error)
