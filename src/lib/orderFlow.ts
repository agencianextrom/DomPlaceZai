// DomPlace - Order Flow State Machine & Constants
// Defines valid order status transitions, payment labels, and helper functions
// Enhanced with validation, automatic notifications, commission, and loyalty points

import { db } from '@/lib/db'

export type OrderStatusType =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export type PaymentMethodType =
  | 'PIX'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'BOLETO'
  | 'CASH_ON_DELIVERY'

export const ORDER_STATUS_FLOW: Record<
  OrderStatusType,
  {
    next: OrderStatusType[]
    label: string
    description: string
    color: string
    bgColor: string
    borderColor: string
    icon: string
  }
> = {
  PENDING: {
    next: ['CONFIRMED', 'CANCELLED'],
    label: 'Pendente',
    description: 'Aguardando confirmação da loja',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-amber-300 dark:border-amber-700',
    icon: 'clock',
  },
  CONFIRMED: {
    next: ['PREPARING', 'CANCELLED'],
    label: 'Confirmado',
    description: 'Pedido confirmado pela loja',
    color: 'text-teal-700 dark:text-teal-400',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
    borderColor: 'border-teal-300 dark:border-teal-700',
    icon: 'check',
  },
  PREPARING: {
    next: ['READY', 'CANCELLED'],
    label: 'Preparando',
    description: 'Sendo preparado pela loja',
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: 'border-orange-300 dark:border-orange-700',
    icon: 'flame',
  },
  READY: {
    next: ['DELIVERING'],
    label: 'Pronto',
    description: 'Pronto para entrega/retirada',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
    icon: 'package',
  },
  DELIVERING: {
    next: ['DELIVERED'],
    label: 'Em Entrega',
    description: 'A caminho do destino',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
    icon: 'truck',
  },
  DELIVERED: {
    next: [],
    label: 'Entregue',
    description: 'Pedido entregue com sucesso',
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-300 dark:border-green-700',
    icon: 'check-circle',
  },
  CANCELLED: {
    next: ['REFUNDED'],
    label: 'Cancelado',
    description: 'Pedido cancelado',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-red-300 dark:border-red-700',
    icon: 'x-circle',
  },
  REFUNDED: {
    next: [],
    label: 'Reembolsado',
    description: 'Reembolso processado',
    color: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    borderColor: 'border-purple-300 dark:border-purple-700',
    icon: 'rotate-ccw',
  },
}

export const PAYMENT_LABELS: Record<PaymentMethodType, string> = {
  PIX: 'Pix',
  CREDIT_CARD: 'Cartão de Crédito',
  DEBIT_CARD: 'Cartão de Débito',
  BOLETO: 'Boleto',
  CASH_ON_DELIVERY: 'Dinheiro na Entrega',
}

export const DELIVERY_TYPE_LABELS: Record<string, string> = {
  DELIVERY: 'Entrega',
  PICKUP: 'Retirada na Loja',
}

// ============================================
// STATUS TRANSITION VALIDATION
// ============================================

/** Check if a status transition is valid */
export function isValidTransition(
  from: OrderStatusType,
  to: OrderStatusType
): boolean {
  if (from === to) return false // No self-transitions
  return ORDER_STATUS_FLOW[from]?.next.includes(to) ?? false
}

/** Get transition error message */
export function getTransitionError(
  from: OrderStatusType,
  to: OrderStatusType
): string {
  if (from === to) {
    return `O pedido já está com status "${getStatusLabel(from)}"`
  }
  return `Transição inválida: não é possível mudar de "${getStatusLabel(from)}" para "${getStatusLabel(to)}". Transições permitidas: ${ORDER_STATUS_FLOW[from]?.next.map(s => getStatusLabel(s)).join(', ') || 'nenhuma'}`
}

// ============================================
// LABEL HELPERS
// ============================================

/** Get the status label */
export function getStatusLabel(status: string): string {
  return ORDER_STATUS_FLOW[status as OrderStatusType]?.label ?? status
}

/** Get the status description */
export function getStatusDescription(status: string): string {
  return ORDER_STATUS_FLOW[status as OrderStatusType]?.description ?? ''
}

/** Get the full status info (color, bg, border) */
export function getStatusInfo(status: string) {
  const info = ORDER_STATUS_FLOW[status as OrderStatusType]
  if (!info) return null
  return {
    label: info.label,
    description: info.description,
    color: info.color,
    bgColor: info.bgColor,
    borderColor: info.borderColor,
    icon: info.icon,
    next: info.next,
  }
}

/** Get payment method label */
export function getPaymentLabel(method: string): string {
  return PAYMENT_LABELS[method as PaymentMethodType] ?? method
}

// ============================================
// ORDER NUMBER GENERATION
// ============================================

/** Generate a unique order number */
export function generateOrderNumber(): string {
  const prefix = 'DP'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

// ============================================
// COMMISSION CALCULATION
// ============================================

/** Calculate commission on order delivery */
export function calculateCommission(
  total: number,
  commissionRate: number
): number {
  return Math.round(total * commissionRate * 100) / 100
}

// ============================================
// LOYALTY POINTS
// ============================================

/** Points configuration */
export const LOYALTY_CONFIG = {
  /** Points per R$1.00 spent */
  pointsPerReal: 1,
  /** Minimum order value to earn points */
  minimumOrderValue: 10,
  /** Bonus multiplier for first delivery (complete order) */
  firstOrderBonus: 50,
  /** Points expiration in days (0 = no expiration) */
  expirationDays: 365,
} as const

/** Calculate loyalty points for an order */
export function calculateLoyaltyPoints(
  orderTotal: number,
  isFirstOrder: boolean = false
): number {
  const basePoints = Math.floor(orderTotal * LOYALTY_CONFIG.pointsPerReal)
  const bonus = isFirstOrder ? LOYALTY_CONFIG.firstOrderBonus : 0
  return basePoints + bonus
}

// ============================================
// AUTOMATIC NOTIFICATION MESSAGES
// ============================================

interface NotificationPayload {
  accountId: string
  title: string
  message: string
  type: 'ORDER_UPDATE' | 'DELIVERY' | 'SYSTEM' | 'PROMOTION' | 'REVIEW'
  data?: Record<string, string>
}

/** Generate notification payload for status change */
export function getStatusChangeNotification(
  accountId: string,
  orderNumber: string,
  storeName: string,
  newStatus: OrderStatusType,
  additionalInfo?: string
): NotificationPayload {
  const messages: Record<OrderStatusType, { title: string; message: string }> = {
    PENDING: {
      title: 'Pedido recebido!',
      message: `Seu pedido #${orderNumber} em ${storeName} foi recebido e está aguardando confirmação.`,
    },
    CONFIRMED: {
      title: 'Pedido confirmado! ✅',
      message: `${storeName} confirmou seu pedido #${orderNumber}. O preparo começará em breve.`,
    },
    PREPARING: {
      title: 'Pedido em preparo 🔥',
      message: `${storeName} está preparando seu pedido #${orderNumber}. ${additionalInfo || 'Previsão: 30-45 minutos.'}`,
    },
    READY: {
      title: 'Pedido pronto! 📦',
      message: `Seu pedido #${orderNumber} de ${storeName} está pronto para ${additionalInfo || 'entrega'}!`,
    },
    DELIVERING: {
      title: 'Pedido a caminho! 🚚',
      message: `Seu pedido #${orderNumber} saiu para entrega. ${additionalInfo || ''}`,
    },
    DELIVERED: {
      title: 'Entrega finalizada! ✅',
      message: `Seu pedido #${orderNumber} de ${storeName} foi entregue. Avalie sua experiência!`,
    },
    CANCELLED: {
      title: 'Pedido cancelado',
      message: `O pedido #${orderNumber} foi cancelado. ${additionalInfo || 'Entre em contato com a loja para mais informações.'}`,
    },
    REFUNDED: {
      title: 'Reembolso processado 💰',
      message: `O reembolso do pedido #${orderNumber} foi processado com sucesso.`,
    },
  }

  const msg = messages[newStatus]

  return {
    accountId,
    title: msg.title,
    message: msg.message,
    type: newStatus === 'DELIVERED' ? 'ORDER_UPDATE'
      : newStatus === 'DELIVERING' ? 'DELIVERY'
      : 'ORDER_UPDATE',
    data: {
      orderNumber,
      storeName,
      status: newStatus,
    },
  }
}

/** Generate loyalty points notification */
export function getLoyaltyPointsNotification(
  accountId: string,
  pointsEarned: number,
  orderNumber: string,
  totalBalance: number
): NotificationPayload {
  return {
    accountId,
    title: `${pointsEarned} pontos de fidelidade! 🎁`,
    message: `Você ganhou ${pointsEarned} pontos pelo pedido #${orderNumber}. Seu saldo atual: ${totalBalance.toLocaleString('pt-BR')} pontos.`,
    type: 'PROMOTION',
    data: {
      pointsEarned: String(pointsEarned),
      totalBalance: String(totalBalance),
      orderNumber,
    },
  }
}

// ============================================
// SERVER-SIDE: Apply status transition with side effects
// ============================================

export interface OrderTransitionResult {
  success: boolean
  error?: string
  notification?: NotificationPayload
  loyaltyPoints?: { earned: number; totalBalance: number }
  commission?: number
}

/**
 * Apply a full status transition with all side effects:
 * - Validates the transition
 * - Updates order in database
 * - Creates status history entry
 * - Creates in-app notification
 * - Restores stock on cancel
 * - Awards loyalty points on delivery
 * - Calculates commission on delivery
 */
export async function applyStatusTransition(params: {
  orderId: string
  newStatus: OrderStatusType
  note?: string
  cancelReason?: string
  driverId?: string
  trackingCode?: string
}): Promise<OrderTransitionResult> {
  const { orderId, newStatus, note, cancelReason, driverId, trackingCode } = params

  // 1. Fetch current order with store info
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      store: { select: { name: true, commissionRate: true } },
      account: { select: { loyaltyPoints: true } },
      items: { select: { productId: true, quantity: true } },
    },
  })

  if (!order) {
    return { success: false, error: 'Pedido não encontrado' }
  }

  const currentStatus = order.status as OrderStatusType

  // 2. Validate transition
  if (!isValidTransition(currentStatus, newStatus)) {
    return {
      success: false,
      error: getTransitionError(currentStatus, newStatus),
    }
  }

  // 3. Build update data
  const updateData: Record<string, unknown> = { status: newStatus }

  if (driverId) updateData.driverId = driverId
  if (trackingCode) updateData.trackingCode = trackingCode

  // Handle delivery timestamp
  if (newStatus === 'DELIVERED') {
    updateData.deliveredAt = new Date()
  }

  // Handle cancellation
  if (newStatus === 'CANCELLED') {
    updateData.cancelledAt = new Date()
    updateData.cancelReason = cancelReason || null
  }

  // 4. Execute in transaction
  const result = await db.$transaction(async (tx) => {
    // Update order
    await tx.order.update({
      where: { id: orderId },
      data: updateData,
    })

    // Create status history entry
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: newStatus,
        note: note || null,
      },
    })

    // Restore stock on cancellation
    if (newStatus === 'CANCELLED') {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            soldCount: { decrement: item.quantity },
          },
        })
      }
    }

    // Award loyalty points on delivery
    let loyaltyResult: { earned: number; totalBalance: number } | undefined
    if (newStatus === 'DELIVERED') {
      const pointsEarned = calculateLoyaltyPoints(order.total)
      const expiresAt = LOYALTY_CONFIG.expirationDays > 0
        ? new Date(Date.now() + LOYALTY_CONFIG.expirationDays * 24 * 60 * 60 * 1000)
        : null

      await tx.loyaltyPoint.create({
        data: {
          accountId: order.accountId,
          points: pointsEarned,
          source: 'ORDER_DELIVERY',
          referenceId: orderId,
          expiresAt,
        },
      })

      // Calculate new total balance
      const allPoints = await tx.loyaltyPoint.findMany({
        where: { accountId: order.accountId },
        select: { points: true },
      })
      const totalBalance = allPoints.reduce((sum, p) => sum + p.points, 0)

      loyaltyResult = { earned: pointsEarned, totalBalance }
    }

    // Create in-app notification
    const notifPayload = getStatusChangeNotification(
      order.accountId,
      order.orderNumber,
      order.store.name,
      newStatus,
      note || undefined
    )

    await tx.notification.create({
      data: {
        accountId: order.accountId,
        title: notifPayload.title,
        message: notifPayload.message,
        type: notifPayload.type,
        data: JSON.stringify(notifPayload.data),
        isRead: false,
      },
    })

    // Create loyalty points notification if earned
    if (loyaltyResult) {
      const loyaltyNotif = getLoyaltyPointsNotification(
        order.accountId,
        loyaltyResult.earned,
        order.orderNumber,
        loyaltyResult.totalBalance
      )
      await tx.notification.create({
        data: {
          accountId: order.accountId,
          title: loyaltyNotif.title,
          message: loyaltyNotif.message,
          type: loyaltyNotif.type,
          data: JSON.stringify(loyaltyNotif.data),
          isRead: false,
        },
      })
    }

    return { loyaltyResult }
  })

  // 5. Calculate commission on delivery
  let commission: number | undefined
  if (newStatus === 'DELIVERED') {
    commission = calculateCommission(order.total, order.store.commissionRate)
  }

  // 6. Build notification payload for FCM push
  const notification = getStatusChangeNotification(
    order.accountId,
    order.orderNumber,
    order.store.name,
    newStatus,
    note || undefined
  )

  return {
    success: true,
    notification,
    loyaltyPoints: result.loyaltyResult,
    commission,
  }
}
