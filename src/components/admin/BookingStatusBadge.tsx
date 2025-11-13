import { CheckCircle, Clock, XCircle, IndianRupee } from 'lucide-react';
import { JSX } from 'react';


export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusStyles: Record<string, { bg: string; text: string; icon: JSX.Element }> = {
        Paid: { bg: 'bg-green-100', text: 'text-green-800', icon: <IndianRupee className="w-4 h-4" /> },
        Unpaid: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" /> },
        Refunded: { bg: 'bg-gray-100', text: 'text-gray-800', icon: <IndianRupee className="w-4 h-4" /> },
        Completed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <CheckCircle className="w-4 h-4" /> },
        Pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" /> },
        Canceled: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-4 h-4" /> },
        Cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-4 h-4" /> },
        Ongoing: { bg: 'bg-cyan-100', text: 'text-cyan-800', icon: <Clock className="w-4 h-4" /> },
    };
    
    const style = statusStyles[status] || statusStyles.Pending;

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${style.bg} ${style.text}`}>
            {style.icon}
            {status}
        </span>
    );
};