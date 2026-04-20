import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET: Retorna dados de fidelidade do usuário autenticado
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

    // Últimas 20 entradas
    const history = allPoints.slice(0, 20)

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

    return NextResponse.json({
      success: true,
      data: {
        currentBalance,
        totalEarned,
        totalRedeemed: Math.abs(totalRedeemed),
        history,
        expiringSoon,
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
