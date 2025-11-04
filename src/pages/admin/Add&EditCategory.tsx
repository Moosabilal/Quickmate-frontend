import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { CommissionTypes, ICategoryFormCombinedData, ICategoryFormData } from '../../util/interface/ICategory';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { toast } from 'react-toastify'

const CategoryForm: React.FC = () => {
    const navigate = useNavigate();
    const { categoryId, parentId, subcategoryId } = useParams<{ categoryId?: string; parentId?: string; subcategoryId?: string }>();

    const isEditingCategory = !!categoryId && !parentId;
    const isAddingSubcategory = !!parentId && !subcategoryId;
    const isEditingSubcategory = !!parentId && !!subcategoryId;

    const [formData, setFormData] = useState<ICategoryFormData>({
        name: '',
        description: '',
        status: true,
        commissionType: CommissionTypes.NONE,
        commissionValue: '',
        commissionStatus: true,
        icon: null,
    });

    const [iconPreview, setIconPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitAction, setSubmitAction] = useState<'save' | 'addSubcategory'>('save');

    const currentEntityId = isEditingCategory ? categoryId : subcategoryId;
    const isEditMode = isEditingCategory || isEditingSubcategory;
    const isSubCategoryMode = isAddingSubcategory || isEditingSubcategory;

    useEffect(() => {
        const fetchEntityData = async () => {
            if (isEditMode && currentEntityId) {
                setIsDataLoading(true);
                setError(null);
                try {
                    const response: ICategoryFormCombinedData = await categoryService.getCategoryForEditAndShow(currentEntityId);

                    setFormData({
                        name: response.name,
                        description: response.description || '',
                        status: response.status ?? true,
                        commissionType: response.commissionType as CommissionTypes || 'None',
                        commissionValue: response.commissionValue || '',
                        commissionStatus: response.commissionStatus ?? true,
                        icon: response.iconUrl || null,
                    });
                    setIconPreview(response.iconUrl || null);
                } catch (err: any) {
                    console.error('Error fetching category/subcategory data:', err);
                    setError(err.message || "Failed to load category/subcategory details.");
                    navigate(isSubCategoryMode && parentId ? `/admin/categories/view/${parentId}` : '/admin/categories');
                } finally {
                    setIsDataLoading(false);
                }
            } else {
                setFormData({
                    name: '',
                    description: '',
                    status: true,
                    commissionType: CommissionTypes.NONE,
                    commissionValue: '',
                    commissionStatus: true,
                    icon: null,
                });
                setIconPreview(null);
            }
        };

        fetchEntityData();
    }, [isEditMode, currentEntityId, navigate, isSubCategoryMode, parentId]);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) {
            errors.name = "Name is required.";
        } else if (formData.name.length < 3) {
            errors.name = "Name must be at least 3 characters.";
        }

        if (!formData.description){
            errors.description = "Description is needed"
        } else if (formData.description.length < 5) {
            errors.description = "Description must be at least 5 characters."
        }

        if (
            formData.commissionType !== 'None' &&
            (formData.commissionValue === '' || Number(formData.commissionValue) <= 0)
        ) {
            errors.commissionValue = "Commission value must be a positive number.";
        }

        if (formData.icon instanceof File && !formData.icon.type.startsWith("image/")) {
            errors.icon = "Only image files are allowed.";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : value,
        }));
    };

    const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, icon: file }));
            setIconPreview(URL.createObjectURL(file));
        } else {
            setFormData(prev => ({ ...prev, icon: null }));
            setIconPreview(null);
        }
    };

    const handleRemoveIcon = () => {
        setFormData(prev => ({ ...prev, icon: null }));
        setIconPreview(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, icon: file }));
            setIconPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);

        const data = new FormData();
        data.append('name', formData.name.toLocaleLowerCase().trim());
        data.append('description', formData.description || '');
        data.append('status', String(formData.status));

        if (parentId) {
            data.append('parentId', parentId);
        }
        data.append('commissionType', formData.commissionType);
        if (formData.commissionType !== 'None') {
            data.append('commissionValue', String(formData.commissionValue));
            data.append('commissionStatus', String(formData.commissionStatus));
        } else {
            data.append('commissionValue', '');
            data.append('commissionStatus', String(false));
        }

        if (formData.icon instanceof File) {
            data.append('categoryIcon', formData.icon);
        } else if (formData.icon === null && iconPreview === null) {
            data.append('categoryIcon', '');
        }


        try {
            if (isEditMode && currentEntityId) {
                await categoryService.updateCategory(currentEntityId, data);
                toast.success(`${isSubCategoryMode ? 'Subcategory' : 'Category'} updated successfully!`);
            } else {
                const response = await categoryService.createCategory(data);
                toast.success(`${isSubCategoryMode ? 'Subcategory' : 'Category'} created successfully!`);

                const newEntityId = response?._id;
                if (newEntityId && submitAction === 'addSubcategory' && !isSubCategoryMode) {
                    navigate(`/admin/subcategories/new/${newEntityId}`);
                    return;
                }
            }

            if (isSubCategoryMode && parentId) {
                navigate(`/admin/categories/view/${parentId}`);
            } else {
                navigate('/admin/categories');
            }
        } catch (err: any) {
            console.error('Error saving category/subcategory:', err);
            setError(err?.response?.data?.message || 'Failed to save category/subcategory. Please try again.');
        } finally {
            setIsLoading(false);
            if (iconPreview && formData.icon instanceof File) {
                URL.revokeObjectURL(iconPreview);
            }
            setSubmitAction('save');
        }
    };

    const pageTitle = isSubCategoryMode
        ? (isEditMode ? 'Edit Subcategory' : 'Add New Subcategory')
        : (isEditMode ? 'Edit Category' : 'Add New Category');

    const backPath = isSubCategoryMode && parentId
        ? `/admin/categories/view/${parentId}`
        : '/admin/categories';

    if (isDataLoading) {
        return (
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                            <div className="flex items-center justify-center h-64">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                                    <p className="mt-4 text-lg">Loading data...</p>
                                </div>
                            </div>
                        </div>
                </div>
            </div>
        );
    }


    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">

            <div className="flex-1 flex flex-col overflow-hidden">

                <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
                    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {pageTitle}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            {isEditMode ? 'Update ' : 'Create '}
                            {isSubCategoryMode ? 'subcategory' : 'category'} details.
                        </p>

                        {isLoading && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                                    <p className="mt-4 text-white text-lg">Saving...</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <section className="border-b border-gray-200 dark:border-gray-700 pb-8">
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                                    {isSubCategoryMode ? 'Subcategory' : 'Category'} Information
                                </h2>
                                {error && (
                                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                        {error}
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                            placeholder={`e.g., ${isSubCategoryMode ? 'Kitchen Cleaning' : 'Home Services'}`}
                                            disabled={isLoading}
                                        />
                                        {formErrors.name && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description (Optional)</label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows={3}
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-y"
                                            placeholder="Briefly describe this category"
                                            disabled={isLoading}
                                        ></textarea>
                                        {formErrors.description && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Icon/Image (Optional)</label>
                                    <div
                                        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-200 relative ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                    >
                                        {iconPreview ? (
                                            <>
                                                <img src={iconPreview.startsWith("blob:") ? iconPreview : getCloudinaryUrl(iconPreview)} alt="Icon Preview" className="max-h-full max-w-full object-contain rounded-md" />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveIcon}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                                                    aria-label="Remove image"
                                                    disabled={isLoading}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                    </svg>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a3 3 0 013 3v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 00.707-.293l2.414-2.414A1 1 0 0113.172 2h3.656a1 1 0 01.707.293l2.414 2.414A1 1 0 0121 5.828V19a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"></path>
                                                </svg>
                                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                                            </>
                                        )}
                                        <input id="dropzone-file" type="file" className="hidden" onChange={handleIconUpload} accept="image/*" disabled={isLoading} />
                                        <label htmlFor="dropzone-file" className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 cursor-pointer" style={{ pointerEvents: isLoading ? 'none' : 'auto' }}>
                                            Upload Image
                                        </label>
                                        {formErrors.icon && (
                                            <p className="text-red-500 text-sm mt-2">{formErrors.icon}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-6">
                                    <span className="text-base font-medium text-gray-700 dark:text-gray-300">{isSubCategoryMode ? 'Subcategory' : 'Category'} Status</span>
                                    <label htmlFor="status" className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="status"
                                            name="status"
                                            className="sr-only peer"
                                            checked={formData.status}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </section>

                            <section className="pb-8">
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Commission Settings</h2>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Commission Type</label>
                                    <div className="flex space-x-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                className="form-radio text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                                                name="commissionType"
                                                value="None"
                                                checked={formData.commissionType === 'None'}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                            />
                                            <span className="ml-2 text-gray-900 dark:text-gray-100">None</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                className="form-radio text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                                                name="commissionType"
                                                value="Percentage"
                                                checked={formData.commissionType === 'Percentage'}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                            />
                                            <span className="ml-2 text-gray-900 dark:text-gray-100">Percentage</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                className="form-radio text-blue-600 focus:ring-blue-500 focus:ring-4 dark:focus:ring-blue-400"
                                                name="commissionType"
                                                value="FlatFee"
                                                checked={formData.commissionType === 'FlatFee'}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                            />
                                            <span className="ml-2 text-gray-900 dark:text-gray-100">Flat Fee</span>
                                        </label>
                                    </div>
                                </div>

                                {formData.commissionType !== 'None' && (
                                    <>
                                        <div>
                                            <label htmlFor="commissionValue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Commission Value ({formData.commissionType === 'Percentage' ? '%' : '₹'})
                                            </label>
                                            <input
                                                type="number"
                                                id="commissionValue"
                                                name="commissionValue"
                                                value={formData.commissionValue}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                                placeholder={formData.commissionType === 'Percentage' ? 'e.g., 10' : 'e.g., 50'}
                                                min="0"
                                                step={formData.commissionType === 'Percentage' ? "0.01" : "1"}
                                                disabled={isLoading}
                                            />
                                            {formErrors.commissionValue && (
                                                <p className="text-red-500 text-sm mt-1">{formErrors.commissionValue}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mt-6">
                                            <span className="text-base font-medium text-gray-700 dark:text-gray-300">Commission Status</span>
                                            <label htmlFor="commissionStatus" className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    id="commissionStatus"
                                                    name="commissionStatus"
                                                    className="sr-only peer"
                                                    checked={formData.commissionStatus}
                                                    onChange={handleChange}
                                                    disabled={isLoading}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </>
                                )}
                            </section>

                            <div className="flex justify-between items-center pt-6">
                                <button
                                    type="button"
                                    onClick={() => navigate(backPath)}
                                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>

                                <div className="flex space-x-4">
                                    {!isEditMode && !isSubCategoryMode && (
                                        <button
                                            type="submit"
                                            onClick={() => setSubmitAction('addSubcategory')}
                                            className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition duration-200"
                                            title="Save category and then add subcategories to it"
                                            disabled={isLoading}
                                        >
                                            {isLoading && submitAction === 'addSubcategory' ? (
                                                <div className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Saving & Adding...
                                                </div>
                                            ) : (
                                                'Save & Add Subcategory'
                                            )}
                                        </button>
                                    )}

                                    <button
                                        type="submit"
                                        onClick={() => setSubmitAction('save')}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition duration-200"
                                        disabled={isLoading}
                                    >
                                        {isLoading && submitAction === 'save' ? (
                                            <div className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                {isEditMode ? 'Updating...' : 'Saving...'}
                                            </div>
                                        ) : (
                                            isEditMode ? 'Update ' + (isSubCategoryMode ? 'Subcategory' : 'Category') : 'Save ' + (isSubCategoryMode ? 'Subcategory' : 'Category')
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryForm;