export const TableRowSkeleton: React.FC = () => (
  <tr className="animate-pulse border-b border-gray-200 dark:border-gray-700">
    <td className="px-6 py-4">
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-8 w-24 bg-gray-200 dark:bg-gray-600 rounded-md"></div>
    </td>
  </tr>
);