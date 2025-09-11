import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { CommissionTypes, ICategoryResponse, ICommissionRuleResponse } from '../../interface/ICategory';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { toast } from 'react-toastify';

const CategoryDetailsPage: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();

    const [categoryDetails, setCategoryDetails] = useState<ICategoryResponse | null>(null);
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
                setCategoryDetails(response);
            } catch (err) {
                setError("Failed to load category details. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategoryDetails();
    }, []);

    const handleEditSubCategory = (subcategoryId: string) => {
        const parentId = categoryId
        navigate(`/admin/subcategories/edit/${parentId}/${subcategoryId}`);
    };

    const handleToggleSubCategoryStatus = async (subcategoryId: string, currentStatus: boolean) => {
        try {

            const formData = new FormData();
            formData.append('status', String(!currentStatus));

            const subCategoryToUpdate = categoryDetails?.subCategories?.find(c => c._id === subcategoryId)
            if (subCategoryToUpdate) {
                formData.append('name', subCategoryToUpdate.name);
                formData.append('description', subCategoryToUpdate.description || '');
                formData.append('parentId', subCategoryToUpdate?.parentId ?? '')
                if (subCategoryToUpdate.icon) {
                    formData.append('icon', subCategoryToUpdate.icon);
                } else {
                    formData.append('icon', 'null');
                }
                formData.append("commissionType", subCategoryToUpdate.commissionType || CommissionTypes.NONE)
                formData.append("commissionValue", subCategoryToUpdate.commissionValue?.toString() || '')
                formData.append("commissionStatus", String(subCategoryToUpdate.commissionStatus))
            } else {
                console.warn(`subCategory with ID ${subcategoryId} not found for status toggle.`);
                setError("subCategory not found for status update.");
                setIsLoading(false);
                return;
            }

            await categoryService.updateCategory(subcategoryId, formData);

            if (categoryDetails && categoryDetails.subCategories) {
                setCategoryDetails(prevDetails => {
                    if (!prevDetails) return null;
                    const updatedSubCategories = (prevDetails.subCategories ?? []).map(sub => {
                        return sub._id === subcategoryId ? { ...sub, status: !currentStatus } : sub
                    });
                    return { ...prevDetails, subCategories: updatedSubCategories };
                });
            }
        } catch (err) {
            toast.error(`Failed to toggle subcategory status:, ${err}`);
            if (err instanceof Error) {
                setError(err.message || "Failed to toggle subcategory status.");
            } else {
                setError(String(err) || "Failed to toggle subcategory status.");
            }
        }
    };

    const handleToggleCommissionStatus = async (subcategoryId: string, currentCommissionStatus: boolean) => {
        try {
            const subCategoryToUpdate = categoryDetails?.subCategories?.find(c => c._id === subcategoryId)
            if (!subCategoryToUpdate) {
                console.warn(`subCategory with ID ${subcategoryId} not found for commission status toggle.`);
                setError("subCategory not found for commission status update.");
                setIsLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('commissionStatus', String(!currentCommissionStatus));
            formData.append('commissionType', subCategoryToUpdate.commissionType ?? "")
            formData.append('commissionValue', subCategoryToUpdate.commissionValue?.toString() ?? "")
            formData.append('parentId', subCategoryToUpdate.parentId ?? '')
            formData.append('name', subCategoryToUpdate.name);
            formData.append('description', subCategoryToUpdate.description || '');
            if (subCategoryToUpdate.icon) {
                formData.append('icon', subCategoryToUpdate.icon);
            } else {
                formData.append('icon', 'null');
            }

            await categoryService.updateCategory(subcategoryId, formData);

            if (categoryDetails && categoryDetails.subCategories) {
                setCategoryDetails(prevDetails => {
                    if (!prevDetails) return null;
                    const updatedSubCategories = (prevDetails.subCategories ?? []).map(sub => {
                        return sub._id === subcategoryId ? { ...sub, commissionStatus: !currentCommissionStatus } : sub
                    });
                    return { ...prevDetails, subCategories: updatedSubCategories };
                });
            }
        } catch (err: any) {
            console.error("Error toggling commission status:", err);
            setError(err.message || "Failed to toggle commission status.");
        }

    }

    if (isLoading) {
        return (
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                    <p className="mt-4 text-xl">Loading category details...</p>
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
                        onClick={() => navigate('/admin/categories')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Back to Categories
                    </button>
                </div>
            </div>
        );
    }

    if (!categoryDetails) {
        return (
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-xl text-yellow-500">Category not found.</p>
                    <button
                        onClick={() => navigate('/admin/categories')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Back to Categories
                    </button>
                </div>
            </div>
        );
    }

    const { name, description, iconUrl, status, commissionStatus, commissionType, commissionValue, subCategories } = categoryDetails;

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
                    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Category Details: {name}
                            </h1>
                            <Link
                                to="/admin/categories"
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                                Back to Categories
                            </Link>
                        </div>

                        <section className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
                            <div className="flex items-center space-x-6">
                                {iconUrl && (
                                    <img
                                        src={getCloudinaryUrl(iconUrl)}
                                        alt={`${name} icon`}
                                        className="w-24 h-24 object-cover rounded-lg shadow-md"
                                    />
                                )}
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Description: {description || 'N/A'}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Status:{' '}
                                        <span className={`font-semibold ${status ? 'text-green-500' : 'text-red-500'}`}>
                                            {status ? 'Active' : 'Inactive'}
                                        </span>
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Category Commission:{' '}
                                        {commissionStatus ? (
                                            <>
                                                {commissionType === 'Percentage' ? (
                                                    ` ${commissionValue}% (Percentage)`
                                                ) : (` ₹${commissionValue} (FlatFee)`)
                                                }
                                            </>
                                        ) : (
                                            ' Not Set'
                                        )}
                                    </p>
                                </div>
                            </div>
                        </section>



                        <section>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                    Subcategories
                                </h2>
                                <button
                                    onClick={() => navigate(`/admin/subcategories/new/${categoryId}`)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Add New Subcategory
                                </button>
                            </div>

                            {(!subCategories || subCategories.length === 0) ? (
                                <p className="text-gray-600 dark:text-gray-400">No subcategories found for this category.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {subCategories.map((sub) => (
                                                <tr key={sub._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {sub.iconUrl ? (
                                                            <img src={getCloudinaryUrl(sub.iconUrl)} alt={`${sub.name} icon`} className="w-12 h-12 object-cover rounded-md" />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center text-gray-500 text-xs">No Img</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{sub.name}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs overflow-hidden text-ellipsis">
                                                        {sub.description || 'No description'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span
                                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sub.status
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                                }`}
                                                        >
                                                            {sub.status ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-3">
                                                            <button
                                                                onClick={() => handleEditSubCategory(sub._id)}
                                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleSubCategoryStatus(sub._id, sub.status ?? false)}
                                                                className={`${sub.status
                                                                    ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                                                    : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                                                    }`}
                                                            >
                                                                {sub.status ? 'Deactivate' : 'Activate'}
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

                        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                            <h2 className="text-2xl font-semibold mb-6">Commission Rules</h2>
                            {(!subCategories || subCategories.length === 0) ? (
                                <p className="text-gray-600 dark:text-gray-400">No commission set yet!.</p>
                            ) : (

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
                                            {subCategories.map((category) => (
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
                                                            onClick={() => handleToggleCommissionStatus(category._id, category.commissionStatus ?? false)}
                                                            className={`${category.commissionStatus
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
                            )}
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CategoryDetailsPage;