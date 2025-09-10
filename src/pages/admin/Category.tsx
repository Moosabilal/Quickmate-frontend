import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { CommissionTypes, ICategoryResponse, ICommissionRuleResponse } from '../../interface/ICategory';
import Pagination from '../../components/admin/Pagination';

interface CategoryTableDisplay extends ICategoryResponse {
    subCategoriesCount?: number | undefined;
    commissionRule?: ICommissionRuleResponse | null;
}

const categories_per_page = 2;

const CategoryCommissionManagement = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState<CategoryTableDisplay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1)

    const dummyEarningsSummary = {
        totalCommissionRevenue: '₹50,000',
        totalCommissionRevenueChange: '+10%',
        averageCommissionPerBooking: '₹25',
        averageCommissionPerBookingChange: '-5%',
        totalBookings: '2,000',
        totalBookingsChange: '+15%',
        commissionDeductionsToProviders: '₹5,000',
        commissionDeductionsToProvidersChange: '-2%',
    };
    const [showDeductions, setShowDeductions] = useState(true); 


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedCategories: CategoryTableDisplay[] = await categoryService.getAllCategories();
                setCategories(fetchedCategories);
            } catch (err: any) {
                setError(err.message || "Failed to load data.");
            } finally {
                setIsLoading(false); 
            }
        };

        fetchData();
    }, []);

    const handleEditCategory = (categoryId: string) => {
        navigate(`/admin/categories/edit/${categoryId}`);
    };

    const handleToggleCategoryStatus = async (categoryId: string, currentStatus: boolean) => {
        try {
            const formData = new FormData();
            formData.append('status', String(!currentStatus));

            const categoryToUpdate = categories.find(c => c._id === categoryId);
            if (categoryToUpdate) {
                formData.append('name', categoryToUpdate.name);
                formData.append('description', categoryToUpdate.description || '');
                if (categoryToUpdate.icon) {
                    formData.append('icon', categoryToUpdate.icon);
                } else {
                    formData.append('icon', 'null');
                }
                formData.append("commissionType", categoryToUpdate.commissionType || CommissionTypes.NONE )
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
                    cat._id === categoryId ? { ...cat, status: !currentStatus } : cat
                )
            );
        } catch (err: any) {
            console.error("Error toggling category status:", err);
            setError(err.message || "Failed to toggle category status.");
        }
    };

    const handleToggleCommissionStatus = async (categoryId: string, currentCommissionStatus: boolean) => {
        try {
            const categoryToUpdate = categories.find(c => c._id === categoryId);
            if (!categoryToUpdate) {
                console.warn(`Category with ID ${categoryId} not found for commission status toggle.`);
                setError("Category not found for commission status update.");
                setIsLoading(false);
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
                    cat._id === categoryId
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

    const totalPages = Math.ceil(categories.length / categories_per_page);
    const startIndex = (currentPage - 1) * categories_per_page;
    const currentCategories = categories.slice(startIndex, startIndex + categories_per_page)

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">

            <div className="flex-1 flex flex-col overflow-hidden">

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
                    <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Category & Commission Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Manage service categories, subcategories, and commission rules for the platform.</p>

                    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                        <h2 className="text-2xl font-semibold mb-6">Category Management</h2>
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
                                    {currentCategories.map((category) => (
                                        <tr key={category._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{category.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{category.subCategoriesCount ?? 0} Subcategories</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        category.status
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
                                                        onClick={() => handleEditCategory(category._id)}
                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleCategoryStatus(category._id, category.status ?? false)}
                                                        className={`${
                                                            category.status
                                                                ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                                                : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                                        }`}
                                                    >
                                                        {category.status ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewCategory(category._id)}
                                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
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
                                Showing {currentCategories.length} of {categories.length} categories
                                </div>
                                <div className="flex items-center space-x-2">
                                <Pagination 
                                    currentPage={currentPage}
                                    totalPages={totalPages}
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
                                    {currentCategories.map((category) => (
                                        <tr key={category._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{category.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                {category.commissionType !== undefined && category.commissionType !== null && category.commissionType === "Percentage"
                                                    ? `${category.commissionValue}%`
                                                    : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                {category.commissionType !== undefined && category.commissionType !== null && category.commissionType === "FlatFee"
                                                    ? `₹${category.commissionValue}`
                                                    : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        category.commissionStatus
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                    }`}
                                                >
                                                    {category.commissionStatus ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                
                                                <button
                                                    onClick={() => handleToggleCommissionStatus(category._id, category.commissionStatus ?? false)}
                                                    className={`${
                                                        category.commissionStatus
                                                            ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                                            : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                                    }`}
                                                >
                                                    {category.commissionStatus ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {currentCategories.length} of {categories.length} categories
                                </div>
                            </div>
                        </div>
                    </section>
                    

                    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                        <h2 className="text-2xl font-semibold mb-6">Earnings Summary</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Commission Revenue</p>
                                <p className="text-2xl font-bold mt-1">{dummyEarningsSummary.totalCommissionRevenue}</p>
                                <p className={`text-sm mt-1 ${dummyEarningsSummary.totalCommissionRevenueChange.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                    {dummyEarningsSummary.totalCommissionRevenueChange}
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Average Commission Per Booking</p>
                                <p className="text-2xl font-bold mt-1">{dummyEarningsSummary.averageCommissionPerBooking}</p>
                                <p className={`text-sm mt-1 ${dummyEarningsSummary.averageCommissionPerBookingChange.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                    {dummyEarningsSummary.averageCommissionPerBookingChange}
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
                                <p className="text-2xl font-bold mt-1">{dummyEarningsSummary.totalBookings}</p>
                                <p className={`text-sm mt-1 ${dummyEarningsSummary.totalBookingsChange.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                    {dummyEarningsSummary.totalBookingsChange}
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Commission Deductions to Providers</p>
                                <p className="text-2xl font-bold mt-1">{dummyEarningsSummary.commissionDeductionsToProviders}</p>
                                <p className={`text-sm mt-1 ${dummyEarningsSummary.commissionDeductionsToProvidersChange.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                    {dummyEarningsSummary.commissionDeductionsToProvidersChange}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
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
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default CategoryCommissionManagement;