import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET: Listar notificações de um usuário (com filtros e paginação)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)

    const accountId = searchParams.get('accountId') || (session?.user as Record<string, unknown>)?.id as string | undefined

    if (!accountId) {
      return NextResponse.json({ notifications: [], total: 0, unreadCount: 0 })
    }

    const type = searchParams.get('type') // ORDER_UPDATE, PROMOTION, SYSTEM, etc.
    const isRead = searchParams.get('isRead') // 'true', 'false', or undefined for all
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const onlyUnreadCount = searchParams.get('count') === 'true'

    // If only unread count is requested, return early
    if (onlyUnreadCount) {
      const unreadCount = await db.notification.count({
        where: { accountId, isRead: false },
      })
      return NextResponse.json({ unreadCount })
    }

    // Build where clause
    const where: Record<string, unknown> = { accountId }
    if (type) where.type = type
    if (isRead !== null && isRead !== undefined) {
      where.isRead = isRead === 'true'
    }

    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          data: true,
          isRead: true,
          readAt: true,
          createdAt: true,
        },
      }),
      db.notification.count({ where }),
      db.notification.count({
        where: { accountId, isRead: false },
      }),
    ])

    // Parse data JSON strings
    const parsedNotifications = notifications.map((n) => ({
      ...n,
      data: n.data ? (typeof n.data === 'string' ? JSON.parse(n.data) : n.data) : null,
    }))

    return NextResponse.json({
      notifications: parsedNotifications,
      total,
      unreadCount,
      limit,
      offset,
    })
  } catch (error: unknown) {
    console.error('Erro ao buscar notificações:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH: Marcar notificação como lida (individual) ou todas
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { notificationId, markAll } = body

    const accountId = body.accountId || (session?.user as Record<string, unknown>)?.id as string | undefined

    if (!accountId) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    // Mark all as read
    if (markAll) {
      await db.notification.updateMany({
        where: { accountId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      })
      return NextResponse.json({ success: true, message: 'Todas as notificações marcadas como lidas' })
    }

    // Mark single as read
    if (!notificationId) {
      return NextResponse.json({ error: 'ID da notificação é obrigatório' }, { status: 400 })
    }

    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      return NextResponse.json({ error: 'Notificação não encontrada' }, { status: 404 })
    }

    if (notification.accountId !== accountId) {
      return NextResponse.json({ error: 'Você não pode modificar esta notificação' }, { status: 403 })
    }

    await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    })

    return NextResponse.json({ success: true, message: 'Notificação marcada como lida' })
  } catch (error: unknown) {
    console.error('Erro ao atualizar notificação:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE: Remover notificação individual ou todas de um tipo
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)

    const accountId = searchParams.get('accountId') || (session?.user as Record<string, unknown>)?.id as string | undefined
    const notificationId = searchParams.get('id')

    if (!accountId) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    // Delete specific notification
    if (notificationId) {
      const notification = await db.notification.findUnique({
        where: { id: notificationId },
      })

      if (!notification) {
        return NextResponse.json({ error: 'Notificação não encontrada' }, { status: 404 })
      }

      if (notification.accountId !== accountId) {
        return NextResponse.json({ error: 'Você não pode remover esta notificação' }, { status: 403 })
      }

      await db.notification.delete({ where: { id: notificationId } })
      return NextResponse.json({ success: true, message: 'Notificação removida' })
    }

    return NextResponse.json({ error: 'ID da notificação é obrigatório' }, { status: 400 })
  } catch (error: unknown) {
    console.error('Erro ao remover notificação:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
