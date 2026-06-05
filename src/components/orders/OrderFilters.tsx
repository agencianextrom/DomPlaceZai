'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, X, ArrowUpDown, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import type { OrderData } from '@/store/useAppStore'

interface OrderFiltersProps {
  orders: OrderData[]
  onFilteredOrdersChange: (orders: OrderData[]) => void
}

const statusFilters = [
  { value: 'ALL', label: 'Todos' },
  { value: 'ACTIVE', label: 'Em andamento' },
  { value: 'DELIVERED', label: 'Entregues' },
  { value: 'CANCELLED', label: 'Cancelados' },
]

const dateFilters = [
  { value: 'ALL', label: 'Todos' },
  { value: 'WEEK', label: 'Últimos 7 dias' },
  { value: 'MONTH', label: 'Últimos 30 dias' },
  { value: 'QUARTER', label: 'Últimos 3 meses' },
]

export function OrderFilters({ orders, onFilteredOrdersChange }: OrderFiltersProps) {
  const [activeStatus, setActiveStatus] = useState('ALL')
  const [activeDate, setActiveDate] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters = activeStatus !== 'ALL' || activeDate !== 'ALL' || searchQuery.length > 0

  const filteredOrders = useMemo(() => {
    let result = orders

    // Status filter
    if (activeStatus === 'ACTIVE') {
      result = result.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status))
    } else if (activeStatus !== 'ALL') {
      result = result.filter(o => o.status === activeStatus)
    }

    // Date filter
    if (activeDate !== 'ALL') {
      const now = Date.now()
      const dayMs = 86400000
      const thresholds: Record<string, number> = {
        WEEK: 7 * dayMs,
        MONTH: 30 * dayMs,
        QUARTER: 90 * dayMs,
      }
      const threshold = thresholds[activeDate]
      if (threshold) {
        result = result.filter(o => now - new Date(o.createdAt).getTime() < threshold)
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(o =>
        (o.storeName && o.storeName.toLowerCase().includes(q)) ||
        o.items?.some(item => item.productName.toLowerCase().includes(q))
      )
    }

    return result
  }, [orders, activeStatus, activeDate, searchQuery])

  // Push filtered results to parent
  useMemo(() => {
    onFilteredOrdersChange(filteredOrders)
  }, [filteredOrders, onFilteredOrdersChange])

  const clearFilters = () => {
    setActiveStatus('ALL')
    setActiveDate('ALL')
    setSearchQuery('')
  }

  const activeCount = [activeStatus !== 'ALL', activeDate !== 'ALL', searchQuery.length > 0].filter(Boolean).length

  return (
    <div className="space-y-3">
      {/* Main filter bar */}
      <div className="flex items-center gap-2">
        {/* Status pills */}
        <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar flex-1">
          {statusFilters.map(filter => (
            <motion.button
              key={filter.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveStatus(filter.value)}
              className="relative shrink-0 px-3 py-1.5 min-h-[44px] rounded-full text-xs font-medium transition-colors"
            >
              {activeStatus === filter.value && (
                <motion.div
                  layoutId="order-filter-pill"
                  className="absolute inset-0 bg-primary text-primary-foreground rounded-full shadow-sm"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className={`relative z-10 ${activeStatus === filter.value ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {filter.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Filter toggle */}
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            className="h-8 min-h-[44px] text-xs gap-1.5 shrink-0"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-3 w-3" />
            {hasActiveFilters && (
              <span className="h-4 w-4 rounded-full bg-white text-primary text-[10px] flex items-center justify-center font-bold">
                {activeCount}
              </span>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Search + filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-xl border border-border p-3 space-y-3 r62-card-lift r99-filter-panel">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por loja ou produto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 min-h-[44px] min-w-[44px] rounded-full bg-secondary flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Date range pills */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground">Período</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {dateFilters.map(filter => (
                    <motion.button
                      key={filter.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveDate(filter.value)}
                      className="relative px-2.5 py-2 rounded-full text-[11px] font-medium border transition-colors min-h-[44px]"
                    >
                      {activeDate === filter.value && (
                        <motion.div
                          layoutId="date-filter-pill"
                          className="absolute inset-0 bg-amber-500 text-white rounded-full shadow-sm"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className={`relative z-10 ${activeDate === filter.value ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`}>
                        {filter.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Results count + clear */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">
                  {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''}
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="min-h-[44px] text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count when filters closed but active */}
      {!showFilters && hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between"
        >
          <span className="text-xs text-muted-foreground">
            {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''} encontrado{filteredOrders.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={clearFilters}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Limpar
          </button>
        </motion.div>
      )}
    </div>
  )
}
