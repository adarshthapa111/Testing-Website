import { Skeleton } from "./skeleton"

export function TestCaseTableSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
              <th className="font-bold text-sm text-gray-700 dark:text-gray-300 py-4 px-6 uppercase tracking-wide text-left">
                ID
              </th>
              <th className="font-bold text-sm text-gray-700 dark:text-gray-300 py-4 px-6 uppercase tracking-wide text-left">
                Description
              </th>
              <th className="font-bold text-sm text-gray-700 dark:text-gray-300 py-4 px-6 uppercase tracking-wide text-left">
                Priority
              </th>
              <th className="font-bold text-sm text-gray-700 dark:text-gray-300 py-4 px-6 uppercase tracking-wide text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, index) => (
              <tr
                key={index}
                className={`border-b border-gray-100 dark:border-gray-800 ${
                  index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/30 dark:bg-gray-800/30'
                }`}
              >
                <td className="py-4 px-6">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="py-4 px-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </td>
                <td className="py-4 px-6">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 