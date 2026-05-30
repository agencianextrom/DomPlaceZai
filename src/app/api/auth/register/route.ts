import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/crypto'
import { apiError, getErrorMessage } from '@/lib/api-response'
import type { AccountRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, password, role } = body

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Nome, e-mail e senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'A senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'E-mail inválido' },
        { status: 400 }
      )
    }

    // Valid roles for registration
    const validRoles: AccountRole[] = ['USER', 'STORE_OWNER', 'DELIVERY_DRIVER', 'AFFILIATE']
    const accountRole: AccountRole = validRoles.includes(role) ? role : 'USER'

    // Check if email already exists
    const existingAccount = await db.account.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existingAccount) {
      return NextResponse.json(
        { success: false, error: 'Este e-mail já está cadastrado' },
        { status: 409 }
      )
    }

    // Hash password with PBKDF2
    const hashedPassword = hashPassword(password)

    // Create account
    const account = await db.account.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name.trim(),
        phone: phone?.trim() || null,
        role: accountRole,
        status: 'ACTIVE',
      },
    })

    // Create role-specific record
    if (accountRole === 'USER') {
      await db.user.create({
        data: {
          accountId: account.id,
          loyaltyBalance: 500, // Welcome bonus
        },
      })
    } else if (accountRole === 'STORE_OWNER') {
      await db.store.create({
        data: {
          accountId: account.id,
          name: `${name.trim()} - Loja`,
          slug: `${name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`,
          category: 'OTHER',
          status: 'PENDING_APPROVAL',
          city: 'Dom Eliseu',
          state: 'PA',
        },
      })
    } else if (accountRole === 'DELIVERY_DRIVER') {
      await db.deliveryDriver.create({
        data: {
          accountId: account.id,
          status: 'OFFLINE',
          verification: 'PENDING',
        },
      })
    } else if (accountRole === 'AFFILIATE') {
      // Generate unique referral code from name
      const baseCode = name.trim().toUpperCase().replace(/\s+/g, '').slice(0, 6)
      const referralCode = `${baseCode}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      await db.affiliate.create({
        data: {
          accountId: account.id,
          referralCode,
          commissionRate: 0.03, // 3% default
        },
      })
    }

    // Add loyalty welcome points
    await db.loyaltyPoint.create({
      data: {
        accountId: account.id,
        points: 500,
        source: 'BÔNUS_CADASTRO',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Conta criada com sucesso!',
      data: {
        id: account.id,
        email: account.email,
        name: account.name,
        role: account.role,
      },
    })
  } catch (error: unknown) {
    console.error('Erro no cadastro:', error)
    return apiError(getErrorMessage(error), 500, 'REGISTER_ERROR')
  }
}
