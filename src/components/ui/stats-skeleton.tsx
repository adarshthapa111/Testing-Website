import { Skeleton } from "./skeleton"

export function StatsCardSkeleton() {
  return (
    <div className="border-0 shadow-lg bg-gradient-to-br from-gray-500 to-gray-600 text-white rounded-lg">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-24 mb-2 bg-white/20" />
            <Skeleton className="h-8 w-16 mb-1 bg-white/40" />
            <Skeleton className="h-3 w-20 bg-white/20" />
          </div>
          <div className="p-3 rounded-xl bg-white/20">
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: 4 }).map((_, index) => (
        <StatsCardSkeleton key={index} />
      ))}
    </div>
  )
} 