import { CheckCircle, Clock, XCircle } from "lucide-react";
import { BookingStatus } from "../../util/interface/IBooking";
import { RenderableStatus, StatusStyle } from "../../util/interface/IUser";

const statusStyles: Record<RenderableStatus, StatusStyle> = {
    [BookingStatus.COMPLETED]: {
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-800 dark:text-green-400',
        icon: <CheckCircle className="w-4 h-4" />
    },
    [BookingStatus.CANCELLED]: {
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-800 dark:text-red-400',
        icon: <XCircle className="w-4 h-4" />
    },
    [BookingStatus.PENDING]: {
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-800 dark:text-yellow-400',
        icon: <Clock className="w-4 h-4" />
    },
    [BookingStatus.CONFIRMED]: {
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        textColor: 'text-blue-800 dark:text-blue-400',
        icon: <CheckCircle className="w-4 h-4" />
    },
    [BookingStatus.IN_PROGRESS]: {
        bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
        textColor: 'text-cyan-800 dark:text-cyan-400',
        icon: <Clock className="w-4 h-4" />
    },
};

export const StatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
    if (status === BookingStatus.All) return null;

    const style = statusStyles[status as RenderableStatus] || statusStyles[BookingStatus.PENDING];

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs sm:text-sm font-medium rounded-full border border-transparent ${style.bgColor} ${style.textColor}`}>
            {style.icon}
            {status}
        </span>
    );
};