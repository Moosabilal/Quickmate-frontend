import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { CommissionTypes, ICategoryFormCombinedData, ICategoryFormData } from '../../util/interface/ICategory';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { toast } from 'react-toastify';
import { Loader2, UploadCloud, X, AlertCircle } from 'lucide-react';
import { isAxiosError } from 'axios';

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
                } catch (err) {
                    console.error('Error fetching category/subcategory data:', err);
                    let errorMessage = "Failed to load category/subcategory details.";
                    if (isAxiosError(err) && err.response?.data?.message) {
                        errorMessage = err.response.data.message;
                    } else if (err instanceof Error) {
                        errorMessage = err.message;
                    }
                    setError(errorMessage);
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

                const newEntityId = response?.id;
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
        } catch (err) {
            console.error('Error saving category/subcategory:', err);
            let errorMessage = 'Failed to save category/subcategory. Please try again.';
            if (isAxiosError(err) && err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            setError(errorMessage);
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
            <div className="flex h-screen bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-gray-100 transition-colors duration-300">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
                    <p className="mt-4 text-xl font-medium">Loading data...</p>
                </div>
            </div>
        );
    }


    return (
        <div className="flex h-screen bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-slate-100 transition-colors duration-300">

            <div className="flex-1 flex flex-col overflow-hidden">

                <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-600/50 p-6 sm:p-8 transition-colors">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            {pageTitle}
                        </h1>
                        <p className="text-slate-500 dark:text-gray-400 mb-8">
                            {isEditMode ? 'Update ' : 'Create '}
                            {isSubCategoryMode ? 'subcategory' : 'category'} details and configuration.
                        </p>

                        {isLoading && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl flex flex-col items-center border border-gray-200 dark:border-gray-700">
                                    <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
                                    <p className="mt-4 text-slate-700 dark:text-gray-200 font-medium">Saving...</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            
                            <section className="border-b border-slate-200 dark:border-gray-700 pb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                                    Basic Information
                                </h2>
                                
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-slate-300 dark:border-gray-600 rounded-xl bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-400 dark:placeholder-gray-500"
                                            placeholder={`e.g., ${isSubCategoryMode ? 'Kitchen Cleaning' : 'Home Services'}`}
                                            disabled={isLoading}
                                        />
                                        {formErrors.name && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Description <span className="text-red-500">*</span></label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows={3}
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-slate-300 dark:border-gray-600 rounded-xl bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-400 dark:placeholder-gray-500 resize-y"
                                            placeholder="Briefly describe this category"
                                            disabled={isLoading}
                                        ></textarea>
                                        {formErrors.description && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Icon / Image</label>
                                    <div
                                        className={`flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-slate-300 dark:border-gray-600 rounded-xl cursor-pointer bg-slate-50 dark:bg-gray-700/30 hover:bg-slate-100 dark:hover:bg-gray-700/50 transition-colors relative group ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                    >
                                        {iconPreview ? (
                                            <>
                                                <div className="relative w-full h-full flex items-center justify-center p-4">
                                                    <img 
                                                        src={iconPreview.startsWith("blob:") ? iconPreview : getCloudinaryUrl(iconPreview)} 
                                                        alt="Icon Preview" 
                                                        className="max-h-full max-w-full object-contain rounded-lg shadow-sm" 
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveIcon}
                                                    className="absolute top-3 right-3 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-transform hover:scale-110"
                                                    title="Remove image"
                                                    disabled={isLoading}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500 dark:text-gray-400">
                                                <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                                    <UploadCloud className="w-8 h-8 text-blue-500" />
                                                </div>
                                                <p className="mb-2 text-sm"><span className="font-semibold text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop</p>
                                                <p className="text-xs opacity-70">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                                            </div>
                                        )}
                                        <input id="dropzone-file" type="file" className="hidden" onChange={handleIconUpload} accept="image/*" disabled={isLoading} />
                                        {!iconPreview && (
                                            <label htmlFor="dropzone-file" className="absolute inset-0 cursor-pointer"></label>
                                        )}
                                    </div>
                                    {formErrors.icon && (
                                        <p className="text-red-500 text-sm mt-2">{formErrors.icon}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-6 bg-slate-50 dark:bg-gray-700/30 p-4 rounded-xl border border-slate-100 dark:border-gray-700">
                                    <div>
                                        <span className="text-base font-semibold text-slate-800 dark:text-white block">Status</span>
                                        <span className="text-xs text-slate-500 dark:text-gray-400">Enable or disable this {isSubCategoryMode ? 'subcategory' : 'category'}</span>
                                    </div>
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
                                        <div className="w-11 h-6 bg-slate-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </section>

                            <section className="pb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                                    Commission Settings
                                </h2>
                                
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-3">Commission Type</label>
                                    <div className="flex flex-wrap gap-4">
                                        {['None', 'Percentage', 'FlatFee'].map((type) => (
                                            <label key={type} className={`
                                                flex items-center px-4 py-3 rounded-xl border cursor-pointer transition-all
                                                ${formData.commissionType === type 
                                                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                                                    : 'bg-white dark:bg-gray-700 border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-600'}
                                            `}>
                                                <input
                                                    type="radio"
                                                    className="form-radio text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 w-4 h-4"
                                                    name="commissionType"
                                                    value={type}
                                                    checked={formData.commissionType === type}
                                                    onChange={handleChange}
                                                    disabled={isLoading}
                                                />
                                                <span className={`ml-2 text-sm font-medium ${formData.commissionType === type ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-gray-200'}`}>
                                                    {type === 'FlatFee' ? 'Flat Fee' : type}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {formData.commissionType !== 'None' && (
                                    <div className="bg-slate-50 dark:bg-gray-700/30 p-5 rounded-xl border border-slate-200 dark:border-gray-700 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div>
                                            <label htmlFor="commissionValue" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                                                Commission Value ({formData.commissionType === 'Percentage' ? '%' : '₹'})
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    id="commissionValue"
                                                    name="commissionValue"
                                                    value={formData.commissionValue}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-400"
                                                    placeholder={formData.commissionType === 'Percentage' ? 'e.g., 10' : 'e.g., 50'}
                                                    min="0"
                                                    step={formData.commissionType === 'Percentage' ? "0.01" : "1"}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            {formErrors.commissionValue && (
                                                <p className="text-red-500 text-sm mt-1">{formErrors.commissionValue}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-sm font-medium text-slate-700 dark:text-gray-300 block">Commission Status</span>
                                                <span className="text-xs text-slate-500 dark:text-gray-400">Apply this commission rule immediately</span>
                                            </div>
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
                                                <div className="w-11 h-6 bg-slate-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </section>

                            <div className="flex flex-col-reverse sm:flex-row justify-between items-center pt-6 gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate(backPath)}
                                    className="w-full sm:w-auto px-6 py-2.5 border border-slate-300 dark:border-gray-600 rounded-xl text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition duration-200 font-medium"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>

                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                    {!isEditMode && !isSubCategoryMode && (
                                        <button
                                            type="submit"
                                            onClick={() => setSubmitAction('addSubcategory')}
                                            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition duration-200 font-medium flex items-center justify-center gap-2"
                                            title="Save category and then add subcategories to it"
                                            disabled={isLoading}
                                        >
                                            {isLoading && submitAction === 'addSubcategory' && <Loader2 className="animate-spin w-4 h-4" />}
                                            Save & Add Subcategory
                                        </button>
                                    )}

                                    <button
                                        type="submit"
                                        onClick={() => setSubmitAction('save')}
                                        className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition duration-200 font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                                        disabled={isLoading}
                                    >
                                        {isLoading && submitAction === 'save' && <Loader2 className="animate-spin w-4 h-4" />}
                                        {isEditMode ? 'Update ' : 'Save '}
                                        {isSubCategoryMode ? 'Subcategory' : 'Category'}
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