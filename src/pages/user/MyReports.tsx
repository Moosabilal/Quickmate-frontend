import React, { useEffect, useState } from 'react';
import { reportService } from '../../services/reportService';
import { toast } from 'react-toastify';
import { CalendarModal } from '../../components/user/CalendarModal';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, CheckCircle } from 'lucide-react';

const MyReports: React.FC = () => {
    const [reports, setReports] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [activeReport, setActiveReport] = useState<any>(null);

    const navigate = useNavigate();

    const fetchReports = async () => {
        try {
            const response = await reportService.getUserReports();
            setReports(response.reports || []);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch reports');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleScheduleClick = (report: any) => {
        setActiveReport(report);
        setIsCalendarOpen(true);
    };

    const handleSlotSelect = async (date: string, time: string) => {
        if (!activeReport) return;
        try {
            await reportService.scheduleUserRework(activeReport._id, date, time);
            toast.success("Rework scheduled successfully!");
            fetchReports();
        } catch (error: any) {
            toast.error(error.message || "Failed to schedule rework");
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'RESOLVED': return 'bg-green-100 text-green-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'DISMISSED': return 'bg-red-100 text-red-800';
            case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 w-full max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">My Reports</h1>
            {reports.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                    <p>No reports found.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {reports.map((report) => {
                        const needsReworkScheduling = report.status === 'RESOLVED' && report.assignedReworkProviderId && !report.reworkBookingId;

                        return (
                            <div key={report._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                <div className="p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-900">{report.reason}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                <span>Booking ID: {report.bookingId?.serviceId?.title || 'Unknown Service'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(report.status)}`}>
                                                {report.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{report.description}</p>
                                    </div>

                                    {report.adminFeedback && (
                                        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg mb-4">
                                            <p className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-1">Admin Resolution</p>
                                            <p className="text-sm text-indigo-900">{report.adminFeedback}</p>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
                                        {report.assignedReworkProviderId && typeof report.assignedReworkProviderId === 'string' && (
                                            <button
                                                onClick={() => navigate(`/providers/${report.assignedReworkProviderId}`)}
                                                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium rounded-lg transition-colors border border-blue-200"
                                            >
                                                <User className="w-4 h-4 mr-2" />
                                                Assigned Provider Details
                                            </button>
                                        )}
                                        {report.assignedReworkProviderId && typeof report.assignedReworkProviderId === 'object' && (
                                            <button
                                                onClick={() => navigate(`/providers/${report.assignedReworkProviderId._id}`)}
                                                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium rounded-lg transition-colors border border-blue-200"
                                            >
                                                <User className="w-4 h-4 mr-2" />
                                                Assigned Provider Details
                                            </button>
                                        )}

                                        {needsReworkScheduling ? (
                                            <button
                                                onClick={() => handleScheduleClick(report)}
                                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm text-sm font-medium rounded-lg transition-colors"
                                            >
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Schedule Rework
                                            </button>
                                        ) : report.reworkBookingId ? (
                                            <span className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 border border-green-200 text-sm font-medium rounded-lg">
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Rework Scheduled
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isCalendarOpen && activeReport && (
                <CalendarModal
                    isOpen={isCalendarOpen}
                    onClose={() => setIsCalendarOpen(false)}
                    latitude={activeReport.bookingId?.addressId?.locationCoords?.coordinates?.[1] || 0}
                    longitude={activeReport.bookingId?.addressId?.locationCoords?.coordinates?.[0] || 0}
                    serviceId={activeReport.bookingId?.serviceId?._id || activeReport.bookingId?.serviceId}
                    providerId={
                        typeof activeReport.assignedReworkProviderId === 'object'
                            ? activeReport.assignedReworkProviderId._id
                            : activeReport.assignedReworkProviderId
                    }
                    radius={100}
                    onSlotSelect={handleSlotSelect}
                />
            )}
        </div>
    );
};

export default MyReports;
