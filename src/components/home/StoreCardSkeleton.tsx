'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function StoreCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Gradient header skeleton */}
      <div className="h-24 bg-muted/50">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      {/* Content skeleton */}
      <div className="p-3 flex gap-3">
        {/* Logo */}
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          {/* Store name */}
          <Skeleton className="h-4 w-3/4 rounded" />
          {/* Category badge */}
          <Skeleton className="h-5 w-20 rounded-md" />
          {/* Info row */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-12 rounded" />
            <Skeleton className="h-3 w-14 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          {/* Address */}
          <Skeleton className="h-2.5 w-40 rounded" />
        </div>
      </div>

      {/* Ver Loja button skeleton */}
      <div className="px-3 pb-3">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  )
}

export function StoreCardSkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <StoreCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function StoreCardSkeletonCarousel({ count = 3 }: { count?: number }) {
  return (
    <>
      {/* Mobile: horizontal carousel */}
      <div className="flex gap-3 overflow-hidden lg:hidden -mx-4 px-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="shrink-0 w-[260px] sm:w-[280px]">
            <StoreCardSkeleton />
          </div>
        ))}
      </div>
      {/* Desktop: grid */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <StoreCardSkeleton key={i} />
        ))}
      </div>
    </>
  )
}
