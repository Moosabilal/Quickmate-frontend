import { AlertTriangle, CheckCircle, Clock, PlayCircle, XCircle } from "lucide-react";
import { BookingStatus } from "../util/interface/IBooking";

export const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
        case BookingStatus.COMPLETED:
            return <CheckCircle className="w-4 h-4" />;
        case BookingStatus.CONFIRMED:
            return <Clock className="w-4 h-4" />;
        case BookingStatus.CANCELLED:
            return <XCircle className="w-4 h-4" />;
        case BookingStatus.IN_PROGRESS:
            return <PlayCircle className="w-4 h-4" />;
        case BookingStatus.EXPIRED:
            return <AlertTriangle className="w-4 h-4" />;
        default:
            return <Clock className="w-4 h-4" />;
    }
};