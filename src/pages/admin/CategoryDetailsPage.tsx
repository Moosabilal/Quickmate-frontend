import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { CommissionTypes, ICategoryDetailsPageData } from '../../util/interface/ICategory';
import { toast } from 'react-toastify';
import { Loader2, ArrowLeft, Edit, Power } from 'lucide-react';
import { isAxiosError } from 'axios';

const CategoryDetailsPage: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();

    const [pageData, setPageData] = useState<ICategoryDetailsPageData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategoryDetails = async () => {
            if (!categoryId) {
                setError("Category ID is missing.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                const response = await categoryService.getCategoryById(categoryId);
                console.log('the response', response)
                setPageData(response);
            } catch (err) {
                let errorMessage = "Failed to load category details.";
                if (isAxiosError(err) && err.response?.data?.message) {
                    errorMessage = err.response.data.message;
                } else if (err instanceof Error) {
                    errorMessage = err.message;
                }
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategoryDetails();
    }, [categoryId]);

    const handleEditSubCategory = (subcategoryId: string) => {
        const parentId = categoryId
        navigate(`/admin/subcategories/edit/${parentId}/${subcategoryId}`);
    };

    const handleToggleSubCategoryStatus = async (subcategoryId: string, currentStatus: boolean) => {
        try {
            const formData = new FormData();
            formData.append('status', String(!currentStatus));

            const subCategoryToUpdate = pageData?.subCategories?.find(c => c.id === subcategoryId)
            if (subCategoryToUpdate) {
                formData.append('name', subCategoryToUpdate.name);
                formData.append('description', subCategoryToUpdate.description || '');
                formData.append('parentId', subCategoryToUpdate?.parentId ?? '')
                if (subCategoryToUpdate.iconUrl) {
                    formData.append('icon', subCategoryToUpdate.iconUrl);
                } else {
                    formData.append('icon', 'null');
                }
                formData.append("commissionType", subCategoryToUpdate.commissionType || CommissionTypes.NONE)
                formData.append("commissionValue", subCategoryToUpdate.commissionValue?.toString() || '')
                formData.append("commissionStatus", String(subCategoryToUpdate.commissionStatus))
            } else {
                setError("subCategory not found for status update.");
                return;
            }

            await categoryService.updateCategory(subcategoryId, formData);

            setPageData(prevData => {
                if (!prevData) return null;

                const updatedSubCategories = prevData.subCategories.map(sub => {
                    if (sub.id === subcategoryId) {
                        return { ...sub, status: !currentStatus, commissionStatus: !currentStatus };
                    }
                    return sub;
                });

                return { ...prevData, subCategories: updatedSubCategories };
            });
            toast.success(`'${subCategoryToUpdate.name}' status updated.`);
        } catch (err) {
            toast.error(`Failed to toggle subcategory status`);
            let errorMessage = "Failed to toggle subcategory status.";
            if (isAxiosError(err) && err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        }
    };

    const handleToggleCommissionStatus = async (subcategoryId: string, currentCommissionStatus: boolean) => {
        try {
            const subCategoryToUpdate = pageData?.subCategories?.find(c => c.id === subcategoryId)
            if (!subCategoryToUpdate) {
                setError("subCategory not found for commission status update.");
                return;
            }
            if(subCategoryToUpdate.commissionType === CommissionTypes.NONE){
                toast.info(`Set a commission type for '${subCategoryToUpdate.name}' before activating the commission rule.`);
                return;
            }

            const isActivating = !currentCommissionStatus;
            if (isActivating && !subCategoryToUpdate.status) {
                toast.info(`Activate the ${subCategoryToUpdate.name} category to enable its commission rule.`);
                return;
            }

            const formData = new FormData();
            formData.append('commissionStatus', String(!currentCommissionStatus));
            formData.append('commissionType', subCategoryToUpdate.commissionType ?? "")
            formData.append('commissionValue', subCategoryToUpdate.commissionValue?.toString() ?? "")
            formData.append('parentId', subCategoryToUpdate.parentId ?? '')
            formData.append('name', subCategoryToUpdate.name);
            formData.append('description', subCategoryToUpdate.description || '');
            if (subCategoryToUpdate.iconUrl) {
                formData.append('icon', subCategoryToUpdate.iconUrl);
            } else {
                formData.append('icon', 'null');
            }

            await categoryService.updateCategory(subcategoryId, formData);

            setPageData(prevData => {
                if (!prevData) return null;
                const updatedSubCategories = prevData.subCategories.map(sub => {
                    if (sub.id === subcategoryId) {
                        return { ...sub, commissionStatus: !currentCommissionStatus };
                    }
                    return sub;
                });
                return { ...prevData, subCategories: updatedSubCategories };
            });
            toast.success(`Commission for '${subCategoryToUpdate.name}' updated.`);
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

    }

    if (isLoading) {
        return (
            <div className="flex h-screen bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-gray-100 transition-colors duration-300">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
                    <p className="mt-4 text-xl font-medium">Loading details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-gray-100 transition-colors duration-300">
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-xl text-red-500 dark:text-red-400 font-medium mb-4">Error: {error}</p>
                    <button
                        onClick={() => navigate('/admin/categories')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Categories
                    </button>
                </div>
            </div>
        );
    }

    if (!pageData) {
        return (
            <div className="flex h-screen bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-gray-100 transition-colors duration-300">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-xl text-yellow-500 dark:text-yellow-400 mb-4">Category not found.</p>
                    <button
                        onClick={() => navigate('/admin/categories')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Categories
                    </button>
                </div>
            </div>
        );
    }

    const { categoryDetails, subCategories } = pageData;
    const { name, description, iconUrl, status, commissionStatus, commissionType, commissionValue } = categoryDetails;

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                    
                    <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-600/50 p-6 sm:p-8 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                                Category Details: <span className="text-blue-600 dark:text-blue-400">{name}</span>
                            </h1>
                            <Link
                                to="/admin/categories"
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-200 rounded-xl hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </Link>
                        </div>

                        <section className="border-b border-slate-100 dark:border-gray-700 pb-8 mb-8">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                {iconUrl ? (
                                    <img
                                        src={iconUrl}
                                        alt={`${name} icon`}
                                        className="w-24 h-24 object-cover rounded-2xl shadow-md border border-slate-100 dark:border-gray-600"
                                    />
                                ) : (
                                    <div className="w-24 h-24 bg-slate-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-slate-400 text-xs">
                                        No Image
                                    </div>
                                )}
                                <div className="space-y-2 flex-1">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Description</p>
                                            <p className="text-slate-900 dark:text-gray-200 mt-1">{description || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Status</p>
                                            <p className="mt-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                    {status ? 'Active' : 'Inactive'}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <p className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Category Commission</p>
                                            <p className="text-slate-900 dark:text-gray-200 mt-1">
                                                {commissionStatus ? (
                                                    <>
                                                        {commissionType === 'Percentage' ? (
                                                            <span>{commissionValue}% <span className="text-slate-500 text-sm">(Percentage)</span></span>
                                                        ) : (
                                                            <span>₹{commissionValue} <span className="text-slate-500 text-sm">(Flat Fee)</span></span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-slate-400 italic">Not Set</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="mb-8">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Subcategories
                                </h2>
                                <button
                                    onClick={() => navigate(`/admin/subcategories/new/${categoryId}`)}
                                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-sm font-medium"
                                >
                                    Add New Subcategory
                                </button>
                            </div>

                            {(!subCategories || subCategories.length === 0) ? (
                                <div className="text-center p-8 bg-slate-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-slate-300 dark:border-gray-600">
                                    <p className="text-slate-500 dark:text-gray-400">No subcategories found for this category.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-gray-700">
                                    <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-700">
                                        <thead className="bg-slate-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">Description</th>
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-slate-200 dark:divide-gray-700">
                                            {subCategories.map((sub) => (
                                                <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {sub.iconUrl ? (
                                                            <img src={sub.iconUrl} alt={`${sub.name} icon`} className="w-10 h-10 object-cover rounded-lg border border-slate-100 dark:border-gray-600" />
                                                        ) : (
                                                            <div className="w-10 h-10 bg-slate-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-slate-400 text-[10px]">No Img</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{sub.name}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-gray-400 max-w-xs truncate hidden md:table-cell">
                                                        {sub.description || 'No description'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span
                                                            className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full ${sub.status
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800'
                                                                }`}
                                                        >
                                                            {sub.status ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => handleEditSubCategory(sub.id || '')}
                                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleSubCategoryStatus(sub.id || '', sub.status ?? false)}
                                                                className={`${sub.status
                                                                    ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
                                                                    : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'
                                                                    } p-1 hover:bg-slate-50 dark:hover:bg-gray-700 rounded transition-colors`}
                                                                title={sub.status ? 'Deactivate' : 'Activate'}
                                                            >
                                                                <Power className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Commission Rules</h2>
                            {(!subCategories || subCategories.length === 0) ? (
                                <div className="text-center p-8 bg-slate-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-slate-300 dark:border-gray-600">
                                    <p className="text-slate-500 dark:text-gray-400">No commission rules set yet.</p>
                                </div>
                            ) : (
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
                                            {subCategories.map((category) => (
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
                                                            onClick={() => handleToggleCommissionStatus(category.id!, category.commissionStatus ?? false)}
                                                            className={`${category.commissionStatus
                                                                ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                                                : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                                                } font-medium transition-colors text-xs uppercase tracking-wide`}
                                                        >
                                                            {category.commissionStatus ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CategoryDetailsPage;