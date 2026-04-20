import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { AccountRole, AccountStatus } from '@prisma/client'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const user = session?.user as Record<string, unknown> | null
  if (!user || user.role !== 'ADMIN') {
    return null
  }
  return session
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta rota.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') as AccountRole | null
    const status = searchParams.get('status') as AccountStatus | null
    const search = searchParams.get('search') || ''
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 100)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0)

    // Montar filtro where
    const where: Record<string, unknown> = {}

    if (role && Object.values(AccountRole).includes(role)) {
      where.role = role
    }
    if (status && Object.values(AccountStatus).includes(status)) {
      where.status = status
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    const [accounts, total] = await Promise.all([
      db.account.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              totalSpent: true,
              orderCount: true,
              loyaltyBalance: true,
            },
          },
          storeOwner: {
            select: {
              id: true,
              name: true,
              status: true,
              totalSales: true,
              rating: true,
            },
          },
          deliveryDriver: {
            select: {
              id: true,
              vehicleType: true,
              status: true,
              verification: true,
              totalDeliveries: true,
              rating: true,
            },
          },
          affiliate: {
            select: {
              id: true,
              referralCode: true,
              totalEarnings: true,
              pendingEarnings: true,
              totalReferrals: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.account.count({ where }),
    ])

    const page = Math.floor(offset / limit) + 1
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      accounts: accounts.map((account) => ({
        id: account.id,
        email: account.email,
        name: account.name,
        phone: account.phone,
        avatar: account.avatar,
        role: account.role,
        status: account.status,
        emailVerified: account.emailVerified,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
        roleInfo: {
          user: account.user
            ? {
                totalSpent: account.user.totalSpent,
                orderCount: account.user.orderCount,
                loyaltyBalance: account.user.loyaltyBalance,
              }
            : null,
          storeOwner: account.storeOwner
            ? {
                storeId: account.storeOwner.id,
                storeName: account.storeOwner.name,
                storeStatus: account.storeOwner.status,
                totalSales: account.storeOwner.totalSales,
                rating: account.storeOwner.rating,
              }
            : null,
          deliveryDriver: account.deliveryDriver
            ? {
                vehicleType: account.deliveryDriver.vehicleType,
                status: account.deliveryDriver.status,
                verification: account.deliveryDriver.verification,
                totalDeliveries: account.deliveryDriver.totalDeliveries,
                rating: account.deliveryDriver.rating,
              }
            : null,
          affiliate: account.affiliate
            ? {
                referralCode: account.affiliate.referralCode,
                totalEarnings: account.affiliate.totalEarnings,
                pendingEarnings: account.affiliate.pendingEarnings,
                totalReferrals: account.affiliate.totalReferrals,
                status: account.affiliate.status,
              }
            : null,
        },
      })),
      pagination: {
        total,
        page,
        totalPages,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('[Admin Users] Erro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar usuários.' },
      { status: 500 }
    )
  }
}
