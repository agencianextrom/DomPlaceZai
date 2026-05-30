/**
 * Script to sync Prisma schema to Turso
 * Usage: bun run scripts/sync-turso.ts
 */
import { createClient } from '@libsql/client'

const url = process.env.TURSO_URL!
const authToken = process.env.TURSO_AUTH_TOKEN!

if (!url || !authToken) {
  console.error('Missing TURSO_URL or TURSO_AUTH_TOKEN')
  process.exit(1)
}

const client = createClient({ url, authToken })

// All CREATE TABLE statements from Prisma schema
const statements = [
  `CREATE TABLE IF NOT EXISTS "Account" ("id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL, "password" TEXT NOT NULL, "name" TEXT NOT NULL, "phone" TEXT, "avatar" TEXT, "role" TEXT NOT NULL DEFAULT 'USER', "status" TEXT NOT NULL DEFAULT 'ACTIVE', "emailVerified" DATETIME, "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT 0, "twoFactorSecret" TEXT, "locationConsent" BOOLEAN NOT NULL DEFAULT 0, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Account_email_key" ON "Account"("email")`,

  `CREATE TABLE IF NOT EXISTS "Store" ("id" TEXT NOT NULL PRIMARY KEY, "accountId" TEXT NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL, "description" TEXT, "category" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL', "logo" TEXT, "coverImage" TEXT, "phone" TEXT, "whatsapp" TEXT, "address" TEXT, "neighborhood" TEXT, "city" TEXT NOT NULL DEFAULT 'Dom Eliseu', "state" TEXT NOT NULL DEFAULT 'PA', "latitude" REAL, "longitude" REAL, "deliveryRadius" REAL, "deliveryFeeType" TEXT NOT NULL DEFAULT 'fixed', "deliveryFee" REAL NOT NULL DEFAULT 0, "freeDeliveryAbove" REAL, "minOrderValue" REAL, "rating" REAL NOT NULL DEFAULT 0, "totalReviews" INTEGER NOT NULL DEFAULT 0, "totalSales" INTEGER NOT NULL DEFAULT 0, "weeklyScore" REAL NOT NULL DEFAULT 0, "opensAt" TEXT, "closesAt" TEXT, "openDays" TEXT NOT NULL DEFAULT '1,2,3,4,5,6,7', "pixKey" TEXT, "socialMedia" TEXT, "commissionRate" REAL NOT NULL DEFAULT 0.10, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Store_accountId_key" ON "Store"("accountId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Store_slug_key" ON "Store"("slug")`,
  `CREATE INDEX IF NOT EXISTS "Store_category_idx" ON "Store"("category")`,
  `CREATE INDEX IF NOT EXISTS "Store_weeklyScore_idx" ON "Store"("weeklyScore")`,

  `CREATE TABLE IF NOT EXISTS "User" ("id" TEXT NOT NULL PRIMARY KEY, "accountId" TEXT NOT NULL, "cpf" TEXT, "bio" TEXT, "dateOfBirth" DATETIME, "loyaltyBalance" INTEGER NOT NULL DEFAULT 0, "totalSpent" REAL NOT NULL DEFAULT 0, "orderCount" INTEGER NOT NULL DEFAULT 0)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_accountId_key" ON "User"("accountId")`,

  `CREATE TABLE IF NOT EXISTS "DeliveryDriver" ("id" TEXT NOT NULL PRIMARY KEY, "accountId" TEXT NOT NULL, "cnhNumber" TEXT, "cnhImage" TEXT, "vehicleType" TEXT NOT NULL DEFAULT 'motorcycle', "vehiclePlate" TEXT, "vehicleImage" TEXT, "currentLatitude" REAL, "currentLongitude" REAL, "status" TEXT NOT NULL DEFAULT 'OFFLINE', "verification" TEXT NOT NULL DEFAULT 'PENDING', "rating" REAL NOT NULL DEFAULT 0, "totalDeliveries" INTEGER NOT NULL DEFAULT 0, "totalEarnings" REAL NOT NULL DEFAULT 0, "commissionRate" REAL NOT NULL DEFAULT 0.85, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "DeliveryDriver_accountId_key" ON "DeliveryDriver"("accountId")`,

  `CREATE TABLE IF NOT EXISTS "Admin" ("id" TEXT NOT NULL PRIMARY KEY, "accountId" TEXT NOT NULL, "level" INTEGER NOT NULL DEFAULT 1, "permissions" TEXT NOT NULL DEFAULT 'all', "lastLoginAt" DATETIME, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Admin_accountId_key" ON "Admin"("accountId")`,

  `CREATE TABLE IF NOT EXISTS "Affiliate" ("id" TEXT NOT NULL PRIMARY KEY, "accountId" TEXT NOT NULL, "referralCode" TEXT NOT NULL, "commissionRate" REAL NOT NULL DEFAULT 0.03, "totalEarnings" REAL NOT NULL DEFAULT 0, "pendingEarnings" REAL NOT NULL DEFAULT 0, "totalReferrals" INTEGER NOT NULL DEFAULT 0, "totalConversions" INTEGER NOT NULL DEFAULT 0, "status" TEXT NOT NULL DEFAULT 'ACTIVE', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Affiliate_accountId_key" ON "Affiliate"("accountId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Affiliate_referralCode_key" ON "Affiliate"("referralCode")`,

  `CREATE TABLE IF NOT EXISTS "Product" ("id" TEXT NOT NULL PRIMARY KEY, "storeId" TEXT NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL, "description" TEXT, "price" REAL NOT NULL, "comparePrice" REAL, "costPrice" REAL, "sku" TEXT, "barcode" TEXT, "images" TEXT NOT NULL DEFAULT '[]', "status" TEXT NOT NULL DEFAULT 'ACTIVE', "stock" INTEGER NOT NULL DEFAULT 0, "soldCount" INTEGER NOT NULL DEFAULT 0, "rating" REAL NOT NULL DEFAULT 0, "totalReviews" INTEGER NOT NULL DEFAULT 0, "weight" REAL, "dimensions" TEXT, "variations" TEXT, "isFeatured" BOOLEAN NOT NULL DEFAULT 0, "isNew" BOOLEAN NOT NULL DEFAULT 1, "isOffer" BOOLEAN NOT NULL DEFAULT 0, "tags" TEXT NOT NULL DEFAULT '[]', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Product_sku_key" ON "Product"("sku")`,

  `CREATE TABLE IF NOT EXISTS "ProductCategory" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "slug" TEXT NOT NULL, "icon" TEXT, "order" INTEGER NOT NULL DEFAULT 0, "parentId" TEXT)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "ProductCategory_slug_key" ON "ProductCategory"("slug")`,

  `CREATE TABLE IF NOT EXISTS "CartItem" ("id" TEXT NOT NULL PRIMARY KEY, "accountId" TEXT NOT NULL, "productId" TEXT NOT NULL, "quantity" INTEGER NOT NULL DEFAULT 1, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,

  `CREATE TABLE IF NOT EXISTS "Order" ("id" TEXT NOT NULL PRIMARY KEY, "orderNumber" TEXT NOT NULL, "accountId" TEXT NOT NULL, "storeId" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'PENDING', "subtotal" REAL NOT NULL, "deliveryFee" REAL NOT NULL DEFAULT 0, "discount" REAL NOT NULL DEFAULT 0, "total" REAL NOT NULL, "paymentMethod" TEXT, "paymentId" TEXT, "deliveryType" TEXT NOT NULL DEFAULT 'DELIVERY', "deliveryAddress" TEXT, "trackingCode" TEXT, "notes" TEXT, "estimatedTime" TEXT, "driverId" TEXT, "driverRating" REAL, "customerRating" REAL, "commission" REAL NOT NULL, "commissionRate" REAL NOT NULL, "paidAt" DATETIME, "deliveredAt" DATETIME, "cancelledAt" DATETIME, "cancelReason" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber")`,

  `CREATE TABLE IF NOT EXISTS "OrderItem" ("id" TEXT NOT NULL PRIMARY KEY, "orderId" TEXT NOT NULL, "productId" TEXT NOT NULL, "productName" TEXT NOT NULL, "productImage" TEXT, "price" REAL NOT NULL, "quantity" INTEGER NOT NULL, "total" REAL NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "OrderBump" ("id" TEXT NOT NULL PRIMARY KEY, "orderId" TEXT NOT NULL, "productId" TEXT, "title" TEXT NOT NULL, "price" REAL NOT NULL, "accepted" BOOLEAN NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS "OrderStatusHistory" ("id" TEXT NOT NULL PRIMARY KEY, "orderId" TEXT NOT NULL, "status" TEXT NOT NULL, "note" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,

  `CREATE TABLE IF NOT EXISTS "Address" ("id" TEXT NOT NULL PRIMARY KEY, "accountId" TEXT NOT NULL, "street" TEXT NOT NULL, "number" TEXT, "complement" TEXT, "neighborhood" TEXT NOT NULL, "city" TEXT NOT NULL DEFAULT 'Dom Eliseu', "state" TEXT NOT NULL DEFAULT 'PA', "zipCode" TEXT, "latitude" REAL, "longitude" REAL, "isDefault" BOOLEAN NOT NULL DEFAULT 0, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,

  `CREATE TABLE IF NOT EXISTS "Review" ("id" TEXT NOT NULL PRIMARY KEY, "accountId" TEXT NOT NULL, "storeId" TEXT, "productId" TEXT, "rating" INTEGER NOT NULL, "comment" TEXT, "images" TEXT NOT NULL DEFAULT '[]', "reply" TEXT, "isVerified" BOOLEAN NOT NULL DEFAULT 0, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,

  `CREATE TABLE IF NOT EXISTS "Favorite" ("id" TEXT NOT NULL PRIMARY KEY, "accountId" TEXT NOT NULL, "storeId" TEXT, "productId" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Favorite_accountId_storeId_key" ON "Favorite"("accountId", "storeId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Favorite_accountId_productId_key" ON "Favorite"("accountId", "productId")`,

  `CREATE TABLE IF NOT EXISTS "Promotion" ("id" TEXT NOT NULL PRIMARY KEY, "storeId" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT, "type" TEXT NOT NULL, "value" REAL NOT NULL, "minOrderValue" REAL, "maxDiscount" REAL, "usageLimit" INTEGER, "usageCount" INTEGER NOT NULL DEFAULT 0, "code" TEXT, "startsAt" DATETIME NOT NULL, "endsAt" DATETIME NOT NULL, "isActive" BOOLEAN NOT NULL DEFAULT 1, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Promotion_code_key" ON "Promotion"("code")`,

  `CREATE TABLE IF NOT EXISTS "Banner" ("id" TEXT NOT NULL PRIMARY KEY, "storeId" TEXT NOT NULL, "title" TEXT NOT NULL, "subtitle" TEXT, "image" TEXT NOT NULL, "link" TEXT, "level" TEXT NOT NULL DEFAULT 'FEATURED', "order" INTEGER NOT NULL DEFAULT 0, "startsAt" DATETIME, "endsAt" DATETIME, "isActive" BOOLEAN NOT NULL DEFAULT 1, "impressions" INTEGER NOT NULL DEFAULT 0, "clicks" INTEGER NOT NULL DEFAULT 0, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,

  `CREATE TABLE IF NOT EXISTS "Referral" ("id" TEXT NOT NULL PRIMARY KEY, "affiliateId" TEXT NOT NULL, "referredId" TEXT NOT NULL, "orderId" TEXT, "amount" REAL NOT NULL, "commission" REAL NOT NULL, "status" TEXT NOT NULL DEFAULT 'pending', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,

  `CREATE TABLE IF NOT EXISTS "UserPaymentMethod" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "type" TEXT NOT NULL, "token" TEXT, "lastFour" TEXT, "brand" TEXT, "holderName" TEXT, "isDefault" BOOLEAN NOT NULL DEFAULT 0, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,

  `CREATE TABLE IF NOT EXISTS "Notification" ("id" TEXT NOT NULL PRIMARY KEY, "accountId" TEXT NOT NULL, "title" TEXT NOT NULL, "message" TEXT NOT NULL, "type" TEXT NOT NULL, "data" TEXT, "isRead" BOOLEAN NOT NULL DEFAULT 0, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,

  `CREATE TABLE IF NOT EXISTS "ChatMessage" ("id" TEXT NOT NULL PRIMARY KEY, "orderId" TEXT, "senderId" TEXT NOT NULL, "receiverId" TEXT, "driverId" TEXT, "message" TEXT NOT NULL, "attachment" TEXT, "isRead" BOOLEAN NOT NULL DEFAULT 0, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,

  `CREATE TABLE IF NOT EXISTS "LoyaltyPoint" ("id" TEXT NOT NULL PRIMARY KEY, "accountId" TEXT NOT NULL, "points" INTEGER NOT NULL, "source" TEXT NOT NULL, "referenceId" TEXT, "expiresAt" DATETIME, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,

  `CREATE TABLE IF NOT EXISTS "PaidAdvertisement" ("id" TEXT NOT NULL PRIMARY KEY, "storeId" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT, "image" TEXT NOT NULL, "targetUrl" TEXT, "level" TEXT NOT NULL, "budget" REAL NOT NULL, "spent" REAL NOT NULL DEFAULT 0, "impressions" INTEGER NOT NULL DEFAULT 0, "clicks" INTEGER NOT NULL DEFAULT 0, "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL', "startsAt" DATETIME NOT NULL, "endsAt" DATETIME NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,

  `CREATE TABLE IF NOT EXISTS "ActivityLog" ("id" TEXT NOT NULL PRIMARY KEY, "accountId" TEXT NOT NULL, "action" TEXT NOT NULL, "details" TEXT, "ipAddress" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
]

async function main() {
  console.log('🔌 Connecting to Turso...')
  
  try {
    const result = await client.execute('SELECT 1 as test')
    console.log(`✅ Connected! Test query returned: ${JSON.stringify(result.rows)}`)
  } catch (e: any) {
    console.error('❌ Connection failed:', e.message)
    process.exit(1)
  }

  console.log(`\n🔄 Executing ${statements.length} SQL statements...`)
  
  let success = 0
  let errors = 0
  
  for (const sql of statements) {
    try {
      await client.execute(sql)
      success++
    } catch (e: any) {
      errors++
      console.warn(`  ⚠️ ${e.message?.substring(0, 120)}`)
    }
  }
  
  console.log(`\n✅ Done! ${success} succeeded, ${errors} warnings`)
  
  // Verify tables
  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  console.log(`\n📊 Tables in Turso (${tables.rows.length}):`)
  for (const row of tables.rows) {
    console.log(`  ✓ ${row.name}`)
  }
}

main().catch(console.error)
