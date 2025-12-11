import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { CategoryTableDisplay, CommissionTypes, ICommissionSummary } from '../../util/interface/ICategory';
import Pagination from '../../components/admin/Pagination';
import { toast } from 'react-toastify';
import { useDebounce } from '../../hooks/useDebounce';
import { Loader2, Search } from 'lucide-react';
import { isAxiosError } from 'axios';


const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const formatPercent = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(0)}%`;
};

const CATEGORIES_PER_PAGE = 4;

const CategoryCommissionManagement = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState<CategoryTableDisplay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1)

    const [totalPages, setTotalPages] = useState(0);
    const [totalCategories, setTotalCategories] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [summaryData, setSummaryData] = useState<ICommissionSummary | null>(null);
    const [summaryLoading, setSummaryLoading] = useState(true);

    const fetchPlans = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await categoryService.getAllCategories({
                page: currentPage,
                limit: CATEGORIES_PER_PAGE,
                search: debouncedSearchTerm,
            });

            setCategories(response.data || []);
            setTotalPages(response.totalPages);
            setTotalCategories(response.total);
        } catch (err) {
            let errorMessage = "Failed to load data.";
            if (isAxiosError(err) && err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, debouncedSearchTerm]);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    useEffect(() => {
        const fetchSummary = async () => {
            setSummaryLoading(true);
            try {
                const data = await categoryService.getCommissionSummary();
                setSummaryData(data);
            } catch (err) {
                console.error("Error fetching earnings summary:", err);
                toast.error("Failed to load earnings summary.");
            } finally {
                setSummaryLoading(false);
            }
        };
        fetchSummary();
    }, []);

    const handleEditCategory = (categoryId: string) => {
        navigate(`/admin/categories/edit/${categoryId}`);
    };

    const handleToggleCategoryStatus = async (categoryId: string, currentStatus: boolean) => {
        try {
            const formData = new FormData();
            formData.append('status', String(!currentStatus));

            const categoryToUpdate = categories.find(c => c.id === categoryId);
            if (categoryToUpdate) {
                formData.append('name', categoryToUpdate.name);
                formData.append('description', categoryToUpdate.description || '');
                if (categoryToUpdate.icon) {
                    formData.append('icon', categoryToUpdate.icon);
                } else {
                    formData.append('icon', 'null');
                }
                formData.append("commissionType", categoryToUpdate.commissionType || CommissionTypes.NONE)
                formData.append("commissionValue", categoryToUpdate.commissionValue?.toString() || '')
                formData.append("commissionStatus", String(categoryToUpdate.commissionStatus))
            } else {
                setError("Category not found for status update.");
                return;
            }
            await categoryService.updateCategory(categoryId, formData);

            setCategories(prevCategories =>
                prevCategories.map(cat =>
                    cat.id === categoryId
                        ? { ...cat, status: !currentStatus, commissionStatus: !currentStatus }
                        : cat
                )
            );
        } catch (err) {
            console.error("Error toggling category status:", err);
            let errorMessage = "Failed to toggle category status.";
            if (isAxiosError(err) && err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        }
    };

    const handleToggleCommissionStatus = async (categoryId: string, currentCommissionStatus: boolean) => {
        try {
            const categoryToUpdate = categories.find(c => c.id === categoryId);
            if (!categoryToUpdate) {
                setError("Category not found for commission status update.");
                return;
            }

            const isActivating = !currentCommissionStatus;
            if (isActivating && !categoryToUpdate.status) {
                toast.info(`Activate the ${categoryToUpdate.name} category to enable its commission rule.`);
                return;
            }

            const formData = new FormData();
            formData.append('commissionStatus', String(!currentCommissionStatus));
            formData.append('commissionType', categoryToUpdate.commissionType ?? "")
            formData.append('commissionValue', categoryToUpdate.commissionValue?.toString() ?? "")
            formData.append('name', categoryToUpdate.name);
            formData.append('description', categoryToUpdate.description || '');
            if (categoryToUpdate.icon) {
                formData.append('icon', categoryToUpdate.icon);
            } else {
                formData.append('icon', 'null');
            }

            await categoryService.updateCategory(categoryId, formData);

            setCategories(prevCategories =>
                prevCategories.map(cat =>
                    cat.id === categoryId
                        ? { ...cat, commissionStatus: !currentCommissionStatus }
                        : cat
                )
            );
        } catch (err) {
            console.error("Error toggling commission status:", err);
            let errorMessage = "Failed to toggle commission status.";
            if (isAxiosError(err) && err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        }
    };


    const handleViewCategory = (categoryId: string) => {
        navigate(`/admin/categories/view/${categoryId}`);
    };


    if (isLoading) {
        return (
            <div className="flex h-screen bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-gray-100 transition-colors duration-300">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
                    <p className="mt-4 text-xl font-medium">Loading data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-gray-100 transition-colors duration-300">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-xl text-red-500 dark:text-red-400 font-medium">Error: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        // Main Container: slate-50 / gray-700
        <div className="flex h-screen bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-slate-100 transition-colors duration-300">

            <div className="flex-1 flex flex-col overflow-hidden">

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-slate-900 dark:text-white">Category & Commission Management</h1>
                    <p className="text-slate-500 dark:text-slate-300 mb-8">Manage service categories, subcategories, and commission rules for the platform.</p>

                    {/* Category Management Section - gray-800 */}
                    <section className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-600/50 mb-8 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Category Management</h2>
                            <div className="relative w-full sm:w-72">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Search categories..."
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-gray-600 rounded-xl bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-400" />
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-gray-700 mb-4">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-700">
                                <thead className="bg-slate-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider">Category Name</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider">Sub-Categories</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-slate-200 dark:divide-gray-700">
                                    {isLoading ? (
                                        <tr><td colSpan={4} className="text-center p-8 text-slate-500 dark:text-gray-400">Loading...</td></tr>
                                    ) : categories.length === 0 ? (
                                        <tr><td colSpan={4} className="text-center p-8 text-slate-500 dark:text-gray-400">No categories found.</td></tr>
                                    ) : (
                                        categories.map((category) => (
                                            <tr key={category.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{category.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-300">{category.subCategoriesCount ?? 0} Subcategories</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span
                                                        className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full ${category.status
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800'
                                                            }`}
                                                    >
                                                        {category.status ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex flex-wrap gap-3">
                                                        <button
                                                            onClick={() => handleEditCategory(category.id)}
                                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleCategoryStatus(category.id, category.status ?? false)}
                                                            className={`${category.status
                                                                ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                                                : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                                                } transition-colors`}
                                                        >
                                                            {category.status ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleViewCategory(category.id)}
                                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                                                        >
                                                            View
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
                            <button
                                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                                onClick={() => navigate('/admin/categories/new')}
                            >
                                Add New Category
                            </button>

                            <div className="w-full sm:w-auto bg-slate-50 dark:bg-gray-700/30 px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-600">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-sm text-slate-500 dark:text-gray-400 whitespace-nowrap">
                                        Showing {categories.length} of {totalCategories} categories
                                    </div>
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        total={totalCategories}
                                        limit={CATEGORIES_PER_PAGE}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Commission Rules Section - gray-800 */}
                    <section className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-600/50 mb-8 transition-colors">
                        <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">Commission Rules</h2>

                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-gray-700">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-700">
                                <thead className="bg-slate-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider">Commission %</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider">Flat Fee</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-slate-200 dark:divide-gray-700">
                                    {isLoading ? (
                                        <tr><td colSpan={5} className="text-center p-8 text-slate-500 dark:text-gray-400">Loading...</td></tr>
                                    ) : categories.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center p-8 text-slate-500 dark:text-gray-400">No categories found.</td></tr>
                                    ) : (
                                        categories.map((category) => (
                                            <tr key={category.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{category.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-300">
                                                    {category.commissionType === "Percentage"
                                                        ? `${category.commissionValue}%`
                                                        : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-300">
                                                    {category.commissionType === "FlatFee"
                                                        ? `₹${category.commissionValue}`
                                                        : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span
                                                        className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full ${category.commissionStatus
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800'
                                                            }`}
                                                    >
                                                        {category.commissionStatus ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleToggleCommissionStatus(category.id, category.commissionStatus ?? false)}
                                                        className={`${category.commissionStatus
                                                            ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                                            : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                                            } transition-colors`}
                                                    >
                                                        {category.commissionStatus ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-slate-50 dark:bg-gray-700/30 px-6 py-4 border border-t-0 border-slate-200 dark:border-gray-700 rounded-b-xl flex items-center justify-between">
                            <div className="text-sm text-slate-500 dark:text-gray-400">
                                Showing {categories.length} of {totalCategories} categories
                            </div>
                        </div>
                    </section>

                    {/* Earnings Summary Section - gray-800 */}
                    <section className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-600/50 mb-8 transition-colors">
                        <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">Earnings Summary</h2>
                        {summaryLoading ? (
                            <div className="flex justify-center items-center h-32">
                                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                            </div>
                        ) : summaryData ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                <div className="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-5 border border-slate-100 dark:border-gray-600 transition-colors">
                                    <p className="text-sm text-slate-500 dark:text-gray-400">Total Revenue</p>
                                    <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{formatCurrency(summaryData.totalCommissionRevenue)}</p>
                                    <p className={`text-sm mt-1 font-medium ${summaryData.totalCommissionRevenueChange > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {formatPercent(summaryData.totalCommissionRevenueChange)}
                                    </p>
                                </div>
                                <div className="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-5 border border-slate-100 dark:border-gray-600 transition-colors">
                                    <p className="text-sm text-slate-500 dark:text-gray-400">Avg Commission</p>
                                    <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{formatCurrency(summaryData.averageCommissionPerBooking)}</p>
                                    <p className={`text-sm mt-1 font-medium ${summaryData.averageCommissionPerBookingChange > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {formatPercent(summaryData.averageCommissionPerBookingChange)}
                                    </p>
                                </div>
                                <div className="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-5 border border-slate-100 dark:border-gray-600 transition-colors">
                                    <p className="text-sm text-slate-500 dark:text-gray-400">Total Bookings</p>
                                    <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{summaryData.totalBookings}</p>
                                    <p className={`text-sm mt-1 font-medium ${summaryData.totalBookingsChange > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {formatPercent(summaryData.totalBookingsChange)}
                                    </p>
                                </div>
                                <div className="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-5 border border-slate-100 dark:border-gray-600 transition-colors">
                                    <p className="text-sm text-slate-500 dark:text-gray-400">Provider Payouts</p>
                                    <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{formatCurrency(summaryData.commissionDeductionsToProviders)}</p>
                                    <p className={`text-sm mt-1 font-medium ${summaryData.commissionDeductionsToProvidersChange > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {formatPercent(summaryData.commissionDeductionsToProvidersChange)}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500 dark:text-gray-400">Failed to load summary.</div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default CategoryCommissionManagement;