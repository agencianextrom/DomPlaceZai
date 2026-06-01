import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// ============================================
// GET: Retorna dados de fidelidade do usuário autenticado
// ============================================

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const accountId = (session?.user as Record<string, unknown>)?.id as string | undefined

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'Usuário não autenticado. Faça login para continuar.' },
        { status: 401 }
      )
    }

    const now = new Date()

    // Buscar todos os pontos de fidelidade do usuário
    const allPoints = await db.loyaltyPoint.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        points: true,
        source: true,
        referenceId: true,
        expiresAt: true,
        createdAt: true,
      },
    })

    // Calcular saldo atual (pontos não expirados)
    const currentBalance = allPoints
      .filter((p) => !p.expiresAt || p.expiresAt > now)
      .reduce((sum, p) => sum + p.points, 0)

    // Total já ganho (soma de pontos positivos)
    const totalEarned = allPoints
      .filter((p) => p.points > 0)
      .reduce((sum, p) => sum + p.points, 0)

    // Total já resgatado (soma de pontos negativos)
    const totalRedeemed = allPoints
      .filter((p) => p.points < 0)
      .reduce((sum, p) => sum + p.points, 0)

    // Últimas 50 entradas (histórico completo)
    const history = allPoints.slice(0, 50)

    // Pontos expirando em até 30 dias
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const expiringSoon = allPoints
      .filter(
        (p) =>
          p.points > 0 &&
          p.expiresAt &&
          p.expiresAt > now &&
          p.expiresAt <= thirtyDaysFromNow
      )
      .map((p) => ({
        id: p.id,
        points: p.points,
        source: p.source,
        expiresAt: p.expiresAt,
      }))

    // Resumo mensal (últimos 6 meses)
    const sixMonthsAgo = new Date(now)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyHistory = allPoints
      .filter((p) => p.createdAt >= sixMonthsAgo)
      .reduce(
        (acc, p) => {
          const month = p.createdAt.toISOString().slice(0, 7) // "YYYY-MM"
          if (!acc[month]) {
            acc[month] = { earned: 0, redeemed: 0 }
          }
          if (p.points > 0) acc[month].earned += p.points
          else acc[month].redeemed += Math.abs(p.points)
          return acc
        },
        {} as Record<string, { earned: number; redeemed: number }>
      )

    return NextResponse.json({
      success: true,
      data: {
        currentBalance,
        totalEarned,
        totalRedeemed: Math.abs(totalRedeemed),
        history,
        expiringSoon,
        monthlyHistory,
      },
    })
  } catch (error: unknown) {
    console.error('Erro ao buscar dados de fidelidade:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor. Tente novamente.' },
      { status: 500 }
    )
  }
}

// ============================================
// POST: Adicionar ou resgatar pontos de fidelidade
// ============================================

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const accountId = (session?.user as Record<string, unknown>)?.id as string | undefined
    const body = await request.json()
    const { action, points, source, referenceId } = body as {
      action: 'add' | 'redeem'
      points: number
      source: string
      referenceId?: string
    }

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'Usuário não autenticado.' },
        { status: 401 }
      )
    }

    if (!action || !['add', 'redeem'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Ação inválida. Use "add" ou "redeem".' },
        { status: 400 }
      )
    }

    if (!points || points <= 0) {
      return NextResponse.json(
        { success: false, error: 'Quantidade de pontos deve ser maior que zero.' },
        { status: 400 }
      )
    }

    // Calcular saldo atual
    const now = new Date()
    const allPoints = await db.loyaltyPoint.findMany({
      where: { accountId },
      select: { points: true, expiresAt: true },
    })

    const currentBalance = allPoints
      .filter((p) => !p.expiresAt || p.expiresAt > now)
      .reduce((sum, p) => sum + p.points, 0)

    if (action === 'redeem' && currentBalance < points) {
      return NextResponse.json(
        { success: false, error: `Saldo insuficiente. Saldo atual: ${currentBalance} pontos.` },
        { status: 400 }
      )
    }

    // Data de expiração: 12 meses a partir de agora
    const expiresAt = new Date(now)
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    // Criar entrada de pontos (negativa para resgate)
    const entry = await db.loyaltyPoint.create({
      data: {
        accountId,
        points: action === 'add' ? points : -points,
        source: source || (action === 'add' ? 'Adição manual' : 'Resgate'),
        referenceId: referenceId || null,
        expiresAt: action === 'add' ? expiresAt : null,
      },
    })

    // Recalcular novo saldo
    const newBalance = action === 'add' ? currentBalance + points : currentBalance - points

    return NextResponse.json({
      success: true,
      data: {
        id: entry.id,
        points: entry.points,
        source: entry.source,
        previousBalance: currentBalance,
        newBalance,
        expiresAt: entry.expiresAt,
      },
    })
  } catch (error: unknown) {
    console.error('Erro ao processar pontos de fidelidade:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
