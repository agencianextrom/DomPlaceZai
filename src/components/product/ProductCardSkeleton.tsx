'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden h-full flex flex-col">
      {/* Image area skeleton */}
      <div className="relative aspect-square flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
        <Skeleton className="h-16 w-16 rounded-2xl" />
      </div>

      {/* Info area skeleton */}
      <div className="p-2.5 flex flex-col flex-1 min-h-0">
        {/* Store name */}
        <div className="flex items-center gap-1.5 mt-0">
          <Skeleton className="h-4 w-4 rounded-sm" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>

        {/* Product name */}
        <div className="mt-1 space-y-1.5">
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-3/4 rounded" />
        </div>

        {/* Price area */}
        <div className="mt-auto pt-1.5">
          <Skeleton className="h-5 w-20 rounded" />
          <div className="flex items-center gap-1 mt-1.5">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-2.5 w-8 rounded ml-0.5" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductCardSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ProductCardSkeletonCarousel({ count = 4 }: { count?: number }) {
  return (
    <>
      {/* Mobile: horizontal carousel */}
      <div className="flex gap-3 overflow-hidden lg:hidden -mx-4 px-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="shrink-0 w-[170px] sm:w-[200px]">
            <ProductCardSkeleton />
          </div>
        ))}
      </div>
      {/* Desktop: grid */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </>
  )
}
