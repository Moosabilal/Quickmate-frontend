export const ReviewTableRowSkeleton: React.FC = () => (
    <tr className="animate-pulse border-b border-slate-100 dark:border-gray-700">
        <td className="px-6 py-4">
            <div className="h-4 bg-slate-200 dark:bg-gray-600 rounded w-3/4"></div>
        </td>
        <td className="px-6 py-4">
            <div className="h-4 bg-slate-200 dark:bg-gray-600 rounded w-3/4"></div>
        </td>
        <td className="px-6 py-4">
            <div className="h-4 bg-slate-200 dark:bg-gray-600 rounded w-full mb-2"></div>
            <div className="h-4 bg-slate-200 dark:bg-gray-600 rounded w-1/2"></div>
        </td>
        <td className="px-6 py-4">
            <div className="h-4 bg-slate-200 dark:bg-gray-600 rounded w-20"></div>
        </td>
        <td className="px-6 py-4">
            <div className="h-4 bg-slate-200 dark:bg-gray-600 rounded w-1/2"></div>
        </td>
        <td className="px-6 py-4">
            <div className="h-6 w-24 bg-slate-200 dark:bg-gray-600 rounded-full"></div>
        </td>
        <td className="px-6 py-4">
            <div className="flex space-x-3">
                <div className="h-8 w-16 bg-slate-200 dark:bg-gray-600 rounded-lg"></div>
                <div className="h-8 w-16 bg-slate-200 dark:bg-gray-600 rounded-lg"></div>
            </div>
        </td>
    </tr>
);