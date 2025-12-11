export const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; colorClasses: string }> = ({ title, value, icon, colorClasses }) => (
    <div className="flex-1 p-5 sm:p-6 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600/50 rounded-xl shadow-sm flex items-center gap-4 sm:gap-6 transition-colors duration-300">
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{value}</p>
        </div>
    </div>
);