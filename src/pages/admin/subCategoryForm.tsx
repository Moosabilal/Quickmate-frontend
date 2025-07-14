import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';
import Header from '../../components/admin/Header';
import { categoryService } from '../../services/categoryService';
import { ICategoryResponse, ISubcategoryFormFetchData } from '../../types/category';


const SubCategoryForm: React.FC = () => {
    const { parentId, subcategoryId } = useParams<{ parentId: string; subcategoryId?: string }>();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState<string>('');
    const [icon, setIcon] = useState<File | null>(null);
    const [iconPreview, setIconPreview] = useState<string | null>(null);
    const [status, setStatus] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isFormLoading, setIsFormLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const isEditing = !!subcategoryId;

    useEffect(() => {
        const fetchSubcategoryData = async () => {
            if (isEditing && subcategoryId) {
                setIsFormLoading(true);
                setFetchError(null);
                try {
                    const response: ICategoryResponse = await categoryService.getCategoryById(subcategoryId);

                    setName(response.name);
                    setDescription(response.description ?? ''); 
                    setIconPreview(response.icon || null);
                    setStatus(response.status ?? true);
                } catch (error) {
                    console.error('Error fetching subcategory for edit:', error);
                    setFetchError('Failed to load subcategory data. Please try again.');
                } finally {
                    setIsFormLoading(false);
                }
            } else {
                setName('');
                setDescription('');
                setIcon(null);
                setIconPreview(null);
                setStatus(true);
                setIsFormLoading(false);
            }
        };

        fetchSubcategoryData();
    }, [isEditing, subcategoryId]);

    const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIcon(file);
            setIconPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveIcon = () => {
        setIcon(null);
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
            setIcon(file);
            setIconPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('status', String(status));

        if (icon) {
            formData.append('categoryIcon', icon); 
        } else if (isEditing && iconPreview === null) {
            
            formData.append('icon', 'null'); 
        } else if (isEditing && iconPreview) {
            formData.append('icon', iconPreview);
        }

        if (!isEditing && parentId) {
            formData.append('parentId', parentId);
        }

        try {
            if (isEditing && subcategoryId) {
                await categoryService.updateCategory(subcategoryId, formData);
            } else {
                if (!parentId) {
                    throw new Error("Parent category ID is missing for new subcategory creation.");
                }
                await categoryService.createCategory(formData);
            }
            navigate(`/admin/categories/view/${parentId || ''}`);
        } catch (error) {
            console.error('Error saving subcategory:', error);
            setFetchError(`Failed to save subcategory: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsLoading(false);
            if (iconPreview && icon instanceof File) {
                URL.revokeObjectURL(iconPreview);
            }
        }
    };

    if (isFormLoading) {
        return (
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <Sidebar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Header />
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                    <p className="mt-4 text-xl">Loading subcategory data...</p>
                </div>
            </div>
        );
    }

    if (fetchError && !isLoading) {
        return (
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <Sidebar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Header />
                    <p className="text-xl text-red-500">Error: {fetchError}</p>
                    <Link to={`/admin/categories/view/${parentId || ''}`} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Back to Parent Category</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
                    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {isEditing ? 'Edit Subcategory' : `Add New Subcategory`}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            {isEditing ? 'Update service subcategory details.' : `Create a new service subcategory for parent ID: ${parentId}.`}
                        </p>

                        {isLoading && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                                    <p className="mt-4 text-white text-lg">Saving subcategory...</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Subcategory Information */}
                            <section className="border-b border-gray-200 dark:border-gray-700 pb-8">
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Subcategory Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subcategory Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                            placeholder="e.g., Deep Cleaning"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subcategory Description (Optional)</label>
                                        <textarea
                                            id="description"
                                            rows={3}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-y"
                                            placeholder="Briefly describe this subcategory"
                                            disabled={isLoading}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Subcategory Icon/Image (Optional)</label>
                                    <div
                                        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-200 relative ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                    >
                                        {iconPreview ? (
                                            <>
                                                <img src={iconPreview} alt="Subcategory Icon Preview" className="max-h-full max-w-full object-contain rounded-md" />
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
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-6">
                                    <span className="text-base font-medium text-gray-700 dark:text-gray-300">Subcategory Status</span>
                                    <label htmlFor="status-toggle" className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="status-toggle"
                                            className="sr-only peer"
                                            checked={status}
                                            onChange={() => setStatus(!status)}
                                            disabled={isLoading}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </section>

                            <div className="flex justify-between items-center pt-6">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/admin/categories/view/${parentId || ''}`)}
                                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition duration-200"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {isEditing ? 'Updating...' : 'Saving...'}
                                        </div>
                                    ) : (
                                        isEditing ? 'Update Subcategory' : 'Save Subcategory'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SubCategoryForm;