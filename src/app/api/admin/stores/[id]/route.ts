import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { StoreStatus, AccountStatus } from '@prisma/client'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const user = session?.user as Record<string, unknown> | null
  if (!user || user.role !== 'ADMIN') {
    return null
  }
  return session
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
    const { action, reason } = body as {
      action: 'approve' | 'suspend' | 'activate' | 'reject'
      reason?: string
    }

    if (!action || !['approve', 'suspend', 'activate', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Ação inválida. Ações permitidas: approve, suspend, activate, reject.' },
        { status: 400 }
      )
    }

    // Buscar loja com conta do proprietário
    const store = await db.store.findUnique({
      where: { id },
      include: { account: true },
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Loja não encontrada.' },
        { status: 404 }
      )
    }

    const adminId = (session.user as Record<string, unknown>).id as string

    let newStoreStatus: StoreStatus
    let newAccountStatus: AccountStatus
    let actionLabel: string

    switch (action) {
      case 'approve':
        newStoreStatus = 'ACTIVE'
        newAccountStatus = 'ACTIVE'
        actionLabel = 'aprovada'
        break
      case 'suspend':
        newStoreStatus = 'SUSPENDED'
        newAccountStatus = 'SUSPENDED'
        actionLabel = 'suspensa'
        break
      case 'activate':
        newStoreStatus = 'ACTIVE'
        newAccountStatus = 'ACTIVE'
        actionLabel = 'ativada'
        break
      case 'reject':
        newStoreStatus = 'INACTIVE'
        newAccountStatus = 'ACTIVE'
        actionLabel = 'rejeitada'
        break
    }

    // Atualizar loja e conta do proprietário
    const [updatedStore] = await db.$transaction([
      db.store.update({
        where: { id },
        data: { status: newStoreStatus },
        include: {
          account: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      db.account.update({
        where: { id: store.accountId },
        data: { status: newAccountStatus },
      }),
      db.activityLog.create({
        data: {
          accountId: adminId,
          action: `STORE_${action.toUpperCase()}`,
          details: `Loja "${store.name}" (ID: ${store.id}) ${actionLabel} pelo administrador.${reason ? ` Motivo: ${reason}` : ''}`,
        },
      }),
    ])

    return NextResponse.json({
      message: `Loja "${updatedStore.name}" ${actionLabel} com sucesso.`,
      store: {
        id: updatedStore.id,
        name: updatedStore.name,
        slug: updatedStore.slug,
        category: updatedStore.category,
        status: updatedStore.status,
        rating: updatedStore.rating,
        totalReviews: updatedStore.totalReviews,
        totalSales: updatedStore.totalSales,
        phone: updatedStore.phone,
        createdAt: updatedStore.createdAt,
        updatedAt: updatedStore.updatedAt,
        ownerName: updatedStore.account.name,
        ownerEmail: updatedStore.account.email,
      },
    })
  } catch (error) {
    console.error('[Admin Store Patch] Erro:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor ao atualizar loja.' },
      { status: 500 }
    )
  }
}
