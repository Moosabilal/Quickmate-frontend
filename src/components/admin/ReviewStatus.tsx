import { CheckCircle, Clock, Trash2, XCircle } from "lucide-react";
import { ReviewStatus, StatusConfig } from "../../util/interface/IReview";

const statusConfig: Record<ReviewStatus, StatusConfig> = {
    [ReviewStatus.APPROVED]: {
        bg: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Approved'
    },
    [ReviewStatus.PENDING]: {
        bg: 'bg-yellow-100 text-yellow-800',
        icon: <Clock className="w-4 h-4" />,
        label: 'Pending'
    },
    [ReviewStatus.REMOVED]: {
        bg: 'bg-red-100 text-red-800',
        icon: <Trash2 className="w-4 h-4" />,
        label: 'Removed'
    },
    [ReviewStatus.REJECTED]: {
        bg: 'bg-red-100 text-red-800',
        icon: <XCircle className="w-4 h-4" />,
        label: 'Rejected'
    },
    [ReviewStatus.ALL]: {
        bg: 'bg-gray-100 text-gray-800',
        icon: <Clock className="w-4 h-4" />,
        label: 'N/A' 
    }
};

export const StatusBadge: React.FC<{ status: ReviewStatus | string }> = ({ status }) => {
    
    const config = (Object.values(ReviewStatus).includes(status as ReviewStatus))
        ? statusConfig[status as ReviewStatus] 
        : statusConfig[ReviewStatus.PENDING]; 

    if (status === ReviewStatus.ALL) {
        return null;
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${config.bg}`}>
            {config.icon}
            {config.label}
        </span>
    );
};