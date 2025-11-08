import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { CategoryTableDisplay, CommissionTypes, ICommissionSummary } from '../../util/interface/ICategory';
import Pagination from '../../components/admin/Pagination';
import { toast } from 'react-toastify';
import { useDebounce } from '../../hooks/useDebounce';
import { Loader2, Search } from 'lucide-react';

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

    const [_showDeductions, _setShowDeductions] = useState(true);

    const fetchPlans = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await categoryService.getAllCategories({
                page: currentPage,
                limit: CATEGORIES_PER_PAGE,
                search: debouncedSearchTerm,
            });

            console.log('the fetched categories ', response.data)
            setCategories(response.data || []);
            setTotalPages(response.totalPages);
            setTotalCategories(response.total);
        } catch (err: any) {
            setError(err.message || "Failed to load data.");
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
          console.log('the summary data ', data)
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
        console.log('the categoryId ', categoryId)
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
                console.warn(`Category with ID ${categoryId} not found for status toggle.`);
                setError("Category not found for status update.");
                setIsLoading(false);
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
            console.log('the categories ', categories)
        } catch (err: any) {
            console.error("Error toggling category status:", err);
            setError(err.message || "Failed to toggle category status.");
        }
    };

    const handleToggleCommissionStatus = async (categoryId: string, currentCommissionStatus: boolean) => {
        try {
            const categoryToUpdate = categories.find(c => c.id === categoryId);
            if (!categoryToUpdate) {
                console.warn(`Category with ID ${categoryId} not found for commission status toggle.`);
                setError("Category not found for commission status update.");
                setIsLoading(false);
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
        } catch (err: any) {
            console.error("Error toggling commission status:", err);
            setError(err.message || "Failed to toggle commission status.");
        }
    };


    const handleViewCategory = (categoryId: string) => {
        navigate(`/admin/categories/view/${categoryId}`);
    };


    if (isLoading) {
        return (
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                    <p className="mt-4 text-xl">Loading data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-xl text-red-500">Error: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">

            <div className="flex-1 flex flex-col overflow-hidden">

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
                    <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Category & Commission Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Manage service categories, subcategories, and commission rules for the platform.</p>

                    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <h2 className="text-2xl font-semibold">Category Management</h2>
                            <div className="relative w-full md:w-1/3">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1); 
                                    }}
                                    placeholder="Search by category name..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        <div className="overflow-x-auto mb-4">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sub-Categories</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">

                                    {isLoading ? (
                                        <tr><td colSpan={4} className="text-center p-8 text-gray-500">Loading...</td></tr>
                                    ) : categories.length === 0 ? (
                                        <tr><td colSpan={4} className="text-center p-8 text-gray-500">No categories found.</td></tr>
                                    ) : (
                                        categories.map((category) => (
                                            <tr key={category.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{category.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{category.subCategoriesCount ?? 0} Subcategories</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${category.status
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                            }`}
                                                    >
                                                        {category.status ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                                                        <button
                                                            onClick={() => handleEditCategory(category.id)}
                                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleCategoryStatus(category.id, category.status ?? false)}
                                                            className={`${category.status
                                                                ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                                                : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                                                }`}
                                                        >
                                                            {category.status ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleViewCategory(category.id)}
                                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
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
                        <button
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={() => navigate('/admin/categories/new')}
                        >
                            Add New Category
                        </button>
                        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing {categories.length} of {totalCategories} categories
                                </div>
                                <div className="flex items-center space-x-2">
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

                    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                        <h2 className="text-2xl font-semibold mb-6">Commission Rules</h2>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Commission %</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Flat Fee</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">





                                    {isLoading ? (
                                        <tr><td colSpan={5} className="text-center p-8 text-gray-500">Loading...</td></tr>
                                    ) : categories.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center p-8 text-gray-500">No categories found.</td></tr>
                                    ) : (
                                        categories.map((category) => (
                                            <tr key={category.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{category.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {category.commissionType === "Percentage"
                                                        ? `${category.commissionValue}%`
                                                        : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {category.commissionType === "FlatFee"
                                                        ? `₹${category.commissionValue}`
                                                        : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${category.commissionStatus
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
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
                                                            }`}
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
                        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing {categories.length} of {totalCategories} categories
                                </div>
                            </div>
                        </div>
                    </section>


                    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                        <h2 className="text-2xl font-semibold mb-6">Earnings Summary</h2>
                        {summaryLoading ? (
                          <div className="flex justify-center items-center h-48">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                          </div>
                        ) : summaryData ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Commission Revenue</p>
                                  <p className="text-2xl font-bold mt-1">{formatCurrency(summaryData.totalCommissionRevenue)}</p>
                                  <p className={`text-sm mt-1 ${summaryData.totalCommissionRevenueChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                      {formatPercent(summaryData.totalCommissionRevenueChange)}
                                  </p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Average Commission</p>
                                  <p className="text-2xl font-bold mt-1">{formatCurrency(summaryData.averageCommissionPerBooking)}</p>
                                  <p className={`text-sm mt-1 ${summaryData.averageCommissionPerBookingChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                      {formatPercent(summaryData.averageCommissionPerBookingChange)}
                                  </p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
                                  <p className="text-2xl font-bold mt-1">{summaryData.totalBookings}</p>
                                  <p className={`text-sm mt-1 ${summaryData.totalBookingsChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                      {formatPercent(summaryData.totalBookingsChange)}
                                  </p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Provider Payouts</p>
                                  <p className="text-2xl font-bold mt-1">{formatCurrency(summaryData.commissionDeductionsToProviders)}</p>
                                  <p className={`text-sm mt-1 ${summaryData.commissionDeductionsToProvidersChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                      {formatPercent(summaryData.commissionDeductionsToProvidersChange)}
                                  </p>
                              </div>
                          </div>
                        ) : (
                          <div className="text-center py-12 text-gray-500">Failed to load summary.</div>
                        )}

                        {/* <div className="flex items-center justify-end">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">Show Commission Deductions to Providers</span>
                            <label htmlFor="toggle-deductions" className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="toggle-deductions"
                                    className="sr-only peer"
                                    checked={showDeductions}
                                    onChange={() => setShowDeductions(!showDeductions)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div> */}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default CategoryCommissionManagement;