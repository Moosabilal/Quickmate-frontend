export const BookingTableRowSkeleton: React.FC = () => (
  <tr className="animate-pulse border-b border-slate-100 dark:border-gray-700">
    <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-gray-600 rounded w-2/4"></div></td>
    <td className="p-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-gray-600"></div>
        <div className="h-4 bg-slate-200 dark:bg-gray-600 rounded w-3/4"></div>
      </div>
    </td>
    <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-gray-600 rounded w-3/4"></div></td>
    <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-gray-600 rounded w-1/2"></div></td>
    <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-gray-600 rounded w-3/4"></div></td>
    <td className="p-4 text-center"><div className="h-6 w-24 bg-slate-200 dark:bg-gray-600 rounded-full mx-auto"></div></td>
    <td className="p-4 text-center"><div className="h-6 w-24 bg-slate-200 dark:bg-gray-600 rounded-full mx-auto"></div></td>
    <td className="p-4 text-center"><div className="h-8 w-8 bg-slate-200 dark:bg-gray-600 rounded-md mx-auto"></div></td> 
  </tr>
);