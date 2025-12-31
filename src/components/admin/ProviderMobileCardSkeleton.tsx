export const MobileCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
    </div>
    <div className="flex justify-between gap-3">
      <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
      <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
    </div>
  </div>
);