import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { ShieldAlert, RefreshCw, Eye, X, MessageSquare, CheckCircle, AlertTriangle } from 'lucide-react';
import { adminReportService } from '../../services/adminReportService';
import { providerService } from '../../services/providerService';
import { Link } from 'react-router-dom';
import Pagination from '../../components/admin/Pagination';

interface ReportData {
    _id: string;
    userId: { _id: string; name: string; email: string };
    providerId: { _id: string; fullName: string; email: string };
    bookingId: { _id: string; bookedOrderId: string; serviceName: string; amount: number };
    reason: string;
    description: string;
    status: string;
    adminReply?: string;
    createdAt: string;
}

const ReportModerationPage: React.FC = () => {
    const [reports, setReports] = useState<ReportData[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReports, setTotalReports] = useState(0);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [pendingUpdate, setPendingUpdate] = useState<{ reportId: string; status: string } | null>(null);
    const [tempReply, setTempReply] = useState('');
    const [resolutionType, setResolutionType] = useState<'refund' | 'correction'>('refund');
    const [actionLoading, setActionLoading] = useState(false);

    const [providers, setProviders] = useState<any[]>([]);
    const [selectedNewProvider, setSelectedNewProvider] = useState<string>('');
    const [loadingProviders, setLoadingProviders] = useState(false);

    const limit = 10;

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            const data = await adminReportService.getReportsForAdmin(page, limit);
            if (data.success) {
                setReports(data.reports);
                setTotalPages(data.totalPages);
                setTotalReports(data.totalReports);
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Failed to fetch reports');
            }
        } finally {
            setLoading(false);
        }
    }, [page, limit]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleStatusChange = async (reportId: string, newStatus: string) => {
        if (newStatus === 'RESOLVED' || newStatus === 'DISMISSED') {
            setPendingUpdate({ reportId, status: newStatus });
            setTempReply('');
            setResolutionType('refund');
            setSelectedNewProvider('');
            setShowReplyModal(true);
            return;
        }

        await performStatusUpdate(reportId, newStatus);
    };

    const performStatusUpdate = async (reportId: string, newStatus: string, reply?: string, resType?: string, pId?: string) => {
        try {
            setActionLoading(true);
            if (newStatus === 'RESOLVED' && resType === 'correction' && !pId) {
                toast.error('Please select a replacement provider for the correction');
                return;
            }

            const data = await adminReportService.updateReportStatus(reportId, newStatus, reply, resType, pId);
            if (data.success) {
                toast.success(`Report status updated to ${newStatus}`);
                setReports(prev =>
                    prev.map(report =>
                        report._id === reportId ? { ...report, status: newStatus, ...(reply && { adminReply: reply }) } : report
                    )
                );
                setShowReplyModal(false);
                setPendingUpdate(null);
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Failed to update status');
            }
        } finally {
            setActionLoading(false);
        }
    };

    const confirmStatusUpdate = () => {
        if (pendingUpdate) {
            performStatusUpdate(
                pendingUpdate.reportId,
                pendingUpdate.status,
                tempReply.trim() || undefined,
                pendingUpdate.status === 'RESOLVED' ? resolutionType : undefined,
                pendingUpdate.status === 'RESOLVED' && resolutionType === 'correction' ? selectedNewProvider : undefined
            );
        }
    };

    useEffect(() => {
        if (showReplyModal && pendingUpdate?.status === 'RESOLVED') {
            const loadProviders = async () => {
                setLoadingProviders(true);
                try {
                    const report = reports.find(r => r._id === pendingUpdate.reportId);
                    const requiredService = report?.bookingId?.serviceName?.toLowerCase()?.trim();
                    const reportedProviderId = report?.providerId?._id;

                    const res = await providerService.getProvidersForAdmin({ limit: 100, status: 'Approved' });

                    let availableProviders = res?.data || res?.providers || [];

                    if (reportedProviderId) {
                        availableProviders = availableProviders.filter((p: any) =>
                            (p.id || p._id) !== reportedProviderId
                        );
                    }

                    if (requiredService) {
                        availableProviders = availableProviders.filter((p: any) =>
                            p.serviceOffered && p.serviceOffered.some((s: string) => s.toLowerCase().trim() === requiredService)
                        );
                    }

                    setProviders(availableProviders);
                    if (availableProviders.length > 0) {
                        setSelectedNewProvider(availableProviders[0].id || availableProviders[0]._id);
                    } else {
                        setSelectedNewProvider('');
                    }
                } catch (e) {
                    console.error("Failed to load providers", e);
                } finally {
                    setLoadingProviders(false);
                }
            };
            loadProviders();
        }
    }, [showReplyModal, pendingUpdate, reports]);

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800';
            case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
            case 'RESOLVED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800';
            case 'DISMISSED': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                        Report Moderation
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Review and manage reports submitted by users against service providers.
                    </p>
                </div>
                <button
                    onClick={fetchReports}
                    className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Refresh Reports"
                >
                    <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white font-semibold border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4">Report Details</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Provider</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : reports.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No reports found.
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report) => (
                                    <tr
                                        key={report._id}
                                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white mb-1">
                                                {report.reason}
                                            </div>
                                            <div className="text-xs text-gray-500 mb-2 max-w-xs truncate" title={report.description}>
                                                {report.description}
                                            </div>
                                            <div className="text-xs text-gray-400 mb-2">
                                                Date: {new Date(report.createdAt).toLocaleDateString()}
                                            </div>
                                            {report.bookingId && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs text-blue-600 font-medium">#{(report.bookingId.bookedOrderId || report.bookingId._id).slice(-8).toUpperCase()}</span>
                                                    <Link
                                                        to={`/admin/bookings/${report.bookingId._id}`}
                                                        className="inline-flex items-center gap-1 text-[11px] px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 dark:hover:text-blue-300 rounded border border-blue-200 dark:border-blue-800 transition-colors font-medium cursor-pointer"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                        View Booking
                                                    </Link>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {report.userId?.name || 'Unknown User'}
                                            </div>
                                            <div className="text-xs text-gray-500">{report.userId?.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {report.providerId?.fullName || 'Unknown Provider'}
                                            </div>
                                            <div className="text-xs text-gray-500">{report.providerId?.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                    report.status
                                                )}`}
                                            >
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <select
                                                value={report.status?.toUpperCase()}
                                                onChange={(e) => handleStatusChange(report._id, e.target.value)}
                                                disabled={report.status?.toUpperCase() === 'RESOLVED' || report.status?.toUpperCase() === 'DISMISSED'}
                                                className={`bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${report.status?.toUpperCase() === 'RESOLVED' || report.status?.toUpperCase() === 'DISMISSED' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="UNDER_REVIEW">Under Review</option>
                                                <option value="RESOLVED">Resolved</option>
                                                <option value="DISMISSED">Dismissed</option>
                                            </select>
                                            {report.adminReply && (
                                                <div className="mt-2 text-left bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-[11px] border border-blue-100 dark:border-blue-800/30 text-blue-800 dark:text-blue-300">
                                                    <span className="font-semibold block mb-0.5">Admin Reply:</span>
                                                    {report.adminReply}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={page}
                    limit={limit}
                    total={totalReports}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </div>

            {showReplyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {pendingUpdate?.status === 'RESOLVED' ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-gray-500" />
                                )}
                                Confirm {pendingUpdate?.status === 'RESOLVED' ? 'Resolution' : 'Dismissal'}
                            </h3>
                            <button
                                onClick={() => setShowReplyModal(false)}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                You are about to mark this report as <span className="font-bold text-gray-900 dark:text-white">{pendingUpdate?.status === 'RESOLVED' ? 'RESOLVED' : 'DISMISSED'}</span>.
                            </p>

                            {pendingUpdate?.status === 'RESOLVED' && (
                                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                                    <label className="text-sm font-semibold text-gray-900 dark:text-white block mb-3">
                                        Choose Resolution Type:
                                    </label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setResolutionType('refund')}
                                            className={`flex-1 p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${resolutionType === 'refund'
                                                ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-800 dark:text-blue-100'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                                                }`}
                                        >
                                            <span className="font-bold">Refund</span>
                                            <span className="text-[10px] opacity-75">Money back to user</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setResolutionType('correction')}
                                            className={`flex-1 p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${resolutionType === 'correction'
                                                ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-800 dark:text-blue-100'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                                                }`}
                                        >
                                            <span className="font-bold">Correction</span>
                                            <span className="text-[10px] opacity-75">Assign rework session</span>
                                        </button>
                                    </div>

                                    {resolutionType === 'correction' && (
                                        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
                                            <label className="text-sm font-semibold text-gray-900 dark:text-white block mb-2">
                                                Select Replacement Provider:
                                            </label>
                                            {loadingProviders ? (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Loading active providers...</p>
                                            ) : (
                                                <select
                                                    value={selectedNewProvider}
                                                    onChange={(e) => setSelectedNewProvider(e.target.value)}
                                                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                >
                                                    <option value="" disabled>-- Select a Provider --</option>
                                                    {providers.map(p => (
                                                        <option key={p.id || p._id} value={p.id || p._id}>{p.fullName} ({p.email})</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                    <MessageSquare className="w-4 h-4" />
                                    Admin Reply / Feedback
                                </label>
                                <textarea
                                    value={tempReply}
                                    onChange={(e) => setTempReply(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-gray-700/30 flex gap-3">
                            <button
                                onClick={() => setShowReplyModal(false)}
                                className="flex-1 py-3 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-[0.98]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmStatusUpdate}
                                disabled={actionLoading}
                                className={`flex-1 py-3 px-4 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${pendingUpdate?.status === 'RESOLVED'
                                    ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                                    }`}
                            >
                                {actionLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Confirm {pendingUpdate?.status === 'RESOLVED' ? 'Resolution' : 'Dismissal'}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportModerationPage;
