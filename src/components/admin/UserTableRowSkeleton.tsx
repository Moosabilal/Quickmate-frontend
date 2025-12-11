export const UserTableRowSkeleton: React.FC = () => (
  <tr className="animate-pulse border-b border-gray-100 dark:border-gray-700 last:border-0">
    <td className="py-4 px-6">
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
    </td>
    <td className="py-4 px-6">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    </td>
    <td className="py-4 px-6">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </td>
    <td className="py-4 px-6">
      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
    </td>
    <td className="py-4 px-6 text-right">
      <div className="flex justify-end gap-2">
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </td>
  </tr>
);