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

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta rota.' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { action, role, reason } = body as {
      action: 'activate' | 'suspend' | 'block' | 'change_role'
      role?: AccountRole
      reason?: string
    }

    if (!action || !['activate', 'suspend', 'block', 'change_role'].includes(action)) {
      return NextResponse.json(
        { error: 'Ação inválida. Ações permitidas: activate, suspend, block, change_role.' },
        { status: 400 }
      )
    }

    // Buscar conta existente
    const account = await db.account.findUnique({
      where: { id },
    })

    if (!account) {
      return NextResponse.json(
        { error: 'Conta não encontrada.' },
        { status: 404 }
      )
    }

    const adminId = (session.user as Record<string, unknown>).id as string

    switch (action) {
      case 'activate': {
        const updated = await db.account.update({
          where: { id },
          data: { status: 'ACTIVE' },
        })
        await db.activityLog.create({
          data: {
            accountId: adminId,
            action: 'ACCOUNT_ACTIVATE',
            details: `Conta "${account.name}" (ID: ${account.id}) ativada pelo administrador.${reason ? ` Motivo: ${reason}` : ''}`,
          },
        })
        return NextResponse.json({
          message: `Conta "${updated.name}" ativada com sucesso.`,
          account: formatAccount(updated),
        })
      }

      case 'suspend': {
        const updated = await db.account.update({
          where: { id },
          data: { status: 'SUSPENDED' },
        })
        await db.activityLog.create({
          data: {
            accountId: adminId,
            action: 'ACCOUNT_SUSPEND',
            details: `Conta "${account.name}" (ID: ${account.id}) suspensa pelo administrador.${reason ? ` Motivo: ${reason}` : ''}`,
          },
        })
        return NextResponse.json({
          message: `Conta "${updated.name}" suspensa com sucesso.`,
          account: formatAccount(updated),
        })
      }

      case 'block': {
        const updated = await db.account.update({
          where: { id },
          data: { status: 'INACTIVE' },
        })
        await db.activityLog.create({
          data: {
            accountId: adminId,
            action: 'ACCOUNT_BLOCK',
            details: `Conta "${account.name}" (ID: ${account.id}) bloqueada pelo administrador.${reason ? ` Motivo: ${reason}` : ''}`,
          },
        })
        return NextResponse.json({
          message: `Conta "${updated.name}" bloqueada com sucesso. O usuário será desconectado.`,
          account: formatAccount(updated),
        })
      }

      case 'change_role': {
        if (!role || !Object.values(AccountRole).includes(role)) {
          return NextResponse.json(
            { error: 'Role inválida. Roles permitidas: USER, STORE_OWNER, AFFILIATE, DELIVERY_DRIVER, ADMIN.' },
            { status: 400 }
          )
        }

        if (role === account.role) {
          return NextResponse.json(
            { error: `A conta já possui o role "${role}".` },
            { status: 400 }
          )
        }

        const oldRole = account.role
        const operations: any[] = []

        // Atualizar role da conta
        operations.push(
          db.account.update({
            where: { id },
            data: { role },
          })
        )

        // Criar registros de role quando mudando PARA um novo role
        if (role === 'STORE_OWNER') {
          const existingStore = await db.store.findUnique({
            where: { accountId: account.id },
          })
          if (!existingStore) {
            operations.push(
              db.store.create({
                data: {
                  accountId: account.id,
                  name: `Loja de ${account.name}`,
                  slug: `loja-${account.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`,
                  category: 'OTHER',
                  status: 'PENDING_APPROVAL',
                },
              })
            )
          }
        }

        if (role === 'DELIVERY_DRIVER') {
          const existingDriver = await db.deliveryDriver.findUnique({
            where: { accountId: account.id },
          })
          if (!existingDriver) {
            operations.push(
              db.deliveryDriver.create({
                data: {
                  accountId: account.id,
                  vehicleType: 'motorcycle',
                  status: 'OFFLINE',
                  verification: 'PENDING',
                },
              })
            )
          }
        }

        if (role === 'AFFILIATE') {
          const existingAffiliate = await db.affiliate.findUnique({
            where: { accountId: account.id },
          })
          if (!existingAffiliate) {
            operations.push(
              db.affiliate.create({
                data: {
                  accountId: account.id,
                  referralCode: generateReferralCode(),
                  commissionRate: 0.03,
                  status: 'ACTIVE',
                },
              })
            )
          }
        }

        if (role === 'USER') {
          const existingUser = await db.user.findUnique({
            where: { accountId: account.id },
          })
          if (!existingUser) {
            operations.push(
              db.user.create({
                data: {
                  accountId: account.id,
                  loyaltyBalance: 0,
                },
              })
            )
          }
        }

        // Criar registro de User se mudando de USER e ainda não existe
        if (oldRole === 'USER' && role !== 'USER') {
          // Mantém o registro de User existente
        }

        await db.$transaction(operations)

        // Criar log de atividade
        await db.activityLog.create({
          data: {
            accountId: adminId,
            action: 'ACCOUNT_CHANGE_ROLE',
            details: `Role da conta "${account.name}" (ID: ${account.id}) alterado de ${oldRole} para ${role} pelo administrador.${reason ? ` Motivo: ${reason}` : ''}`,
          },
        })

        // Buscar conta atualizada
        const updated = await db.account.findUnique({ where: { id } })

        return NextResponse.json({
          message: `Role da conta "${updated?.name}" alterado de ${oldRole} para ${role} com sucesso.`,
          account: updated ? formatAccount(updated) : null,
        })
      }
    }
  } catch (error) {
    console.error('[Admin User Patch] Erro:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor ao atualizar conta.' },
      { status: 500 }
    )
  }
}

function formatAccount(account: { id: string; email: string; name: string; phone: string | null; avatar: string | null; role: string; status: string; emailVerified: Date | null; createdAt: Date; updatedAt: Date }) {
  return {
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
  }
}
