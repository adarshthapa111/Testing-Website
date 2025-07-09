import { Skeleton } from "@/components/ui/skeleton"

interface FeatureSkeletonProps {
  count?: number
}

export function SiderBarLoader({ count = 5 }: FeatureSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl p-4 bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 animate-pulse"
        >
          <div className="flex items-start gap-3">
            {/* Icon skeleton */}
            <div className="flex-shrink-0 mt-0.5">
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                {/* Title skeleton */}
                <Skeleton className="h-4 w-24 rounded" />
                
                {/* Badge skeleton */}
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>
              
              {/* Description skeleton - 2 lines */}
              <div className="space-y-1 mb-3">
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-3/4 rounded" />
              </div>
              
              {/* Status indicators skeleton */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-3 w-12 rounded" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-3 w-10 rounded" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-3 w-8 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
