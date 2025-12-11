import { ChevronDown } from "lucide-react";

export const FilterDropdown: React.FC<{ 
    label: string; 
    options: string[];
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({ label, options, value, onChange }) => (
    <div className="relative w-full">
        <select 
            value={value} 
            onChange={onChange} 
            className="appearance-none w-full bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl py-2.5 pl-4 pr-10 text-slate-700 dark:text-gray-200 leading-tight focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors cursor-pointer"
        >
            <option value="All">{label}</option>
            {options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-gray-400">
            <ChevronDown className="w-4 h-4" />
        </div>
    </div>
);