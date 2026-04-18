'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardList, Package, CheckCircle2, XCircle, Clock,
  PackageCheck, CircleDot, ArrowUpDown, Calendar,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface OrderData {
  id: string
  status: string
  createdAt: string
  total: number
  [key: string]: unknown
}

interface OrderFilterProps {
  /** All orders to filter */
  orders: OrderData[]
  /** Currently active status filter */
  activeFilter: string
  /** Callback when filter changes */
  onFilterChange: (filter: string) => void
  /** Currently active sort */
  activeSort: string
  /** Callback when sort changes */
  onSortChange: (sort: string) => void
  /** Currently active date filter */
  activeDateFilter: string
  /** Callback when date filter changes */
  onDateFilterChange: (filter: string) => void
}

const statusTabs = [
  {
    value: 'ALL',
    label: 'Todos',
    icon: CircleDot,
    color: 'bg-muted text-muted-foreground',
    activeColor: 'bg-primary text-primary-foreground',
  },
  {
    value: 'active',
    label: 'Em Andamento',
    icon: Clock,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    activeColor: 'bg-amber-500 text-white',
    statuses: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING'],
  },
  {
    value: 'DELIVERED',
    label: 'Entregue',
    icon: PackageCheck,
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    activeColor: 'bg-emerald-500 text-white',
  },
  {
    value: 'CANCELLED',
    label: 'Cancelados',
    icon: XCircle,
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    activeColor: 'bg-red-500 text-white',
  },
]

const dateFilters = [
  { value: 'ALL', label: 'Todos' },
  { value: 'TODAY', label: 'Hoje' },
  { value: 'WEEK', label: 'Semana' },
  { value: 'MONTH', label: 'Mes' },
]

const sortOptions = [
  { value: 'recent', label: 'Recentes' },
  { value: 'oldest', label: 'Antigos' },
  { value: 'highest', label: 'Maior valor' },
  { value: 'lowest', label: 'Menor valor' },
]

export function OrderFilter({
  orders,
  activeFilter,
  onFilterChange,
  activeSort,
  onSortChange,
  activeDateFilter,
  onDateFilterChange,
}: OrderFilterProps) {
  // Count orders per tab
  const counts = useMemo(() => {
    const all = orders.length
    const active = orders.filter(
      (o) => !['DELIVERED', 'CANCELLED'].includes(o.status)
    ).length
    const delivered = orders.filter((o) => o.status === 'DELIVERED').length
    const cancelled = orders.filter((o) => o.status === 'CANCELLED').length

    const map: Record<string, number> = {
      ALL: all,
      active,
      DELIVERED: delivered,
      CANCELLED: cancelled,
    }
    return map
  }, [orders])

  return (
    <div className="space-y-3">
      {/* Status Tab Pills */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {statusTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeFilter === tab.value
          const count = counts[tab.value] || 0

          return (
            <motion.button
              key={tab.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFilterChange(tab.value)}
              className={`
                relative shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                transition-all duration-200 border
                ${isActive
                  ? `${tab.activeColor} border-transparent shadow-md`
                  : `${tab.color} border-transparent hover:opacity-80`
                }
              `}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              <Badge
                className={`
                  h-5 min-w-[1.25rem] flex items-center justify-center text-[10px] font-bold border-0
                  ${isActive
                    ? 'bg-white/25 text-inherit'
                    : 'bg-muted/50 text-muted-foreground'
                  }
                `}
              >
                {count}
              </Badge>

              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="order-filter-indicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-4 rounded-full bg-current"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Secondary filters row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Date filter pills */}
        <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0 mr-1" />
          {dateFilters.map((df) => (
            <motion.button
              key={df.value}
              whileTap={{ scale: 0.93 }}
              onClick={() => onDateFilterChange(df.value)}
              className={`
                shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all
                ${activeDateFilter === df.value
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-transparent text-muted-foreground border-transparent hover:bg-secondary'
                }
              `}
            >
              {df.label}
            </motion.button>
          ))}
        </div>

        {/* Separator */}
        <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

        {/* Sort pills */}
        <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 mr-1" />
          {sortOptions.map((so) => (
            <motion.button
              key={so.value}
              whileTap={{ scale: 0.93 }}
              onClick={() => onSortChange(so.value)}
              className={`
                shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all
                ${activeSort === so.value
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : 'bg-transparent text-muted-foreground border-transparent hover:bg-secondary'
                }
              `}
            >
              {so.label}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
