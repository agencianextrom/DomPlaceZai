// DomPlace - Order Flow State Machine & Constants
// Defines valid order status transitions, payment labels, and helper functions

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
  { next: OrderStatusType[]; label: string; color: string; bgColor: string }
> = {
  PENDING: {
    next: ['CONFIRMED', 'CANCELLED'],
    label: 'Pendente',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  CONFIRMED: {
    next: ['PREPARING', 'CANCELLED'],
    label: 'Confirmado',
    color: 'text-teal-700 dark:text-teal-400',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
  },
  PREPARING: {
    next: ['READY'],
    label: 'Preparando',
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  READY: {
    next: ['DELIVERING'],
    label: 'Pronto',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  DELIVERING: {
    next: ['DELIVERED'],
    label: 'Em Entrega',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  DELIVERED: {
    next: [],
    label: 'Entregue',
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  CANCELLED: {
    next: [],
    label: 'Cancelado',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  REFUNDED: {
    next: [],
    label: 'Reembolsado',
    color: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
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

// Check if a status transition is valid
export function isValidTransition(
  from: OrderStatusType,
  to: OrderStatusType
): boolean {
  return ORDER_STATUS_FLOW[from]?.next.includes(to) ?? false
}

// Get the status label
export function getStatusLabel(status: string): string {
  return ORDER_STATUS_FLOW[status as OrderStatusType]?.label ?? status
}

// Get payment method label
export function getPaymentLabel(method: string): string {
  return PAYMENT_LABELS[method as PaymentMethodType] ?? method
}

// Generate order number
export function generateOrderNumber(): string {
  const prefix = 'DP'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}${timestamp}${random}`
}
