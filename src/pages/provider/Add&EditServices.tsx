import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save, IndianRupee, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { providerService } from '../../services/providerService';
import { IAddAndEditServiceForm } from '../../util/interface/IService';
import { serviceService } from '../../services/serviceService';
import { toast } from 'react-toastify';
import { ICategoryData } from '../../util/interface/ICategory';
import { isAxiosError } from 'axios';

const ServiceManagementPage: React.FC = () => {
    const { serviceId } = useParams<{ serviceId?: string }>()
    const [categories, setCategories] = useState<ICategoryData[]>([])
    const [subCategories, setSubCategories] = useState<ICategoryData[]>([])
    const [editingService, setEditingService] = useState<IAddAndEditServiceForm | null>(null);

    const [formData, setFormData] = useState<Partial<IAddAndEditServiceForm>>({
        title: '',
        description: '',
        categoryId: '',
        experience: 0,
        subCategoryId: '',
        duration: '0:0',
        priceUnit: 'PerService',
        status: true,
        price: 0,
        businessCertification: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedHour, setSelectedHour] = useState('0');
    const [selectedMinute, setSelectedMinute] = useState('0');
    const navigate = useNavigate()

    useEffect(() => {
        const categories = async () => {
            const response = await providerService.getServicesForAddpage()
            setCategories(response.mainCategories)
            setSubCategories(response.services)
        }
        categories()
    }, [])

    const handleEditService = (service: IAddAndEditServiceForm) => {
        setEditingService(service);
    };

    useEffect(() => {
        if (serviceId) {
            const getService = async () => {
                const response = await serviceService.getServiceById(serviceId)
                handleEditService(response)
            }
            getService()
        }

    }, [serviceId])


    useEffect(() => {
        if (editingService) {
            const [hour = '00', minute = '00'] = editingService.duration?.split(':') || [];
            setSelectedHour(hour);
            setSelectedMinute(minute); setFormData({
                title: editingService.title,
                description: editingService.description,
                experience: editingService.experience,
                categoryId: editingService.categoryId,
                subCategoryId: editingService.subCategoryId,
                duration: editingService.duration,
                priceUnit: editingService.priceUnit,
                status: editingService.status,
                price: editingService.price,
                businessCertification: editingService.businessCertification || ''
            });
        } else {
            setFormData({
                title: '',
                description: '',
                experience: 0,
                categoryId: '',
                subCategoryId: '',
                duration: '0:0',
                priceUnit: 'PerService',
                status: true,
                price: 0,
                businessCertification: ''
            });
        }
    }, [editingService]);


    const handleDurationChange = (hour: string, minute: string) => {
        setFormData({
            ...formData,
            duration: `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
            ,
        });
    };

    console.log('form data', formData);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title?.trim()) {
            newErrors.title = 'Please select your service';
        }

        if (!formData.description?.trim()) {
            newErrors.description = 'Description is required';
        }

        if (!formData.categoryId) {
            newErrors.categoryId = 'Category is required';
        }

        if (formData.priceUnit === 'PerService') {
            const [hours, minutes] = (formData.duration || '00:00').split(':').map(Number);
            if ((hours * 60 + minutes) < 15) {
                newErrors.duration = 'Duration must be at least 15 minutes';
            }
        }

        if (!formData.price || formData.price <= 0) {
            newErrors.price = 'Price must be greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const data = new FormData();
            let hasChanges = false;

            const normalize = (val: string | number | boolean | File | null | undefined) => {
                if (val instanceof File) return val.name;
                if (typeof val === 'boolean' || typeof val === 'number') return val;
                if (typeof val === 'string') return val.trim();
                if (val === null || val === undefined) return '';
                return JSON.stringify(val);
            };

            for (const [key, value] of Object.entries(formData)) {
                console.log('the key value', key, value);
                const prevValue = editingService?.[key as keyof IAddAndEditServiceForm];

                const isValueChanged = normalize(value) !== normalize(prevValue);

                if (isValueChanged) {
                    hasChanges = true;
                }

                if (value !== undefined && value !== null) {
                    if (value instanceof File) {
                        data.append(key, value);
                    } else {
                        data.append(key, String(value));
                    }
                }
            }

            if (editingService && !hasChanges) {
                toast.info("No changes detected.");
                setIsSubmitting(false);
                return;
            }


            if (editingService) {
                try {
                    for(const pair of data.entries()) {
                        console.log(`${pair[0]}: ${pair[1]}`);
                    }
                    const { message, success } = await serviceService.updateService(serviceId || '', data)
                    if (success) {
                        toast.success(message)
                        navigate('/provider/providerService')
                    } else {
                        toast.info(message)
                    }

                } catch (error) {
                    if (isAxiosError(error) && error.response?.data?.message) {
                        toast.error(error.response.data.message);
                    } else if (error instanceof Error) {
                        toast.error(error.message)
                    }
                }
            } else {
                const { message, success } = await serviceService.createdService(data);
                if (success) {
                    toast.success(message)
                    navigate('/provider/providerService')
                } else {
                    toast.info(message)
                }
            }

        } catch (error) {
            console.error('Error saving service:', error);
        } finally {
            setIsSubmitting(false);
        }

    };

    const isEditing = !!editingService;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                    <button
                        type="button"
                        aria-label='back button'
                        onClick={() => navigate(`/provider/providerService`)}
                        className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            {isEditing ? 'Edit Service' : 'Add New Service'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {isEditing ? 'Update your service details' : 'Create a new service offering'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 transition-colors">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        <div className="space-y-6">
                            <div>
                                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="categoryId"
                                    value={formData.categoryId || ''}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${errors.categoryId ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                >
                                    <option value="" disabled>Select a category</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
                            </div>

                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Service Title <span className="text-red-500">*</span>
                                </label>
                                <select
                                    disabled={!formData.categoryId}
                                    id="subCategoryId"
                                    value={formData.subCategoryId || ''}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const selectedSubCategory = subCategories.find(
                                            (sub) => sub.id === selectedId
                                        );

                                        setFormData({
                                            ...formData,
                                            subCategoryId: selectedId,
                                            title: selectedSubCategory?.name || '',
                                        });
                                    }}
                                    className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${errors.title ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                >
                                    <option value="" disabled>{formData.categoryId ? 'Select a Service' : 'Select a category first'}</option>
                                    {subCategories
                                        .filter((sub) => sub.parentId == formData.categoryId)
                                        .map((subCategory) => (
                                            <option key={subCategory.id} value={subCategory.id}>
                                                {subCategory.name}
                                            </option>
                                        ))}
                                </select>
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    rows={4}
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${errors.description ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                    placeholder="Describe your service in detail, what it includes..."
                                />
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>

                            {!editingService && (
                                <div>
                                    <label htmlFor="businessCertification" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Business Certification <span className="text-gray-400 dark:text-gray-500">(optional)</span>
                                    </label>
                                    <input
                                        type="file"
                                        id="businessCertification"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setFormData({ ...formData, businessCertification: e.target.files?.[0] || '' })}
                                        className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300 dark:hover:file:bg-blue-900/50 transition-colors"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Experience <span className='text-gray-400 dark:text-gray-500'>(Years - Optional)</span>
                                </label>
                                <input
                                    type="number"
                                    id="experience"
                                    min="0"
                                    step="0"
                                    value={formData.experience || ''}
                                    onChange={(e) => setFormData({ ...formData, experience: parseFloat(e.target.value) || 0 })}
                                    className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${errors.basePrice ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'}`}
                                    placeholder="e.g. 2"
                                />
                            </div>

                            <div>
                                <label htmlFor="priceUnit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Price Unit
                                </label>
                                <select
                                    id="priceUnit"
                                    value={formData.priceUnit || 'PerService'}
                                    onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value as 'PerHour' | 'PerService' })}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                                >
                                    <option value="PerService">Per Service</option>
                                    <option value="PerHour">Per Hour</option>
                                </select>
                            </div>

                            {formData.priceUnit === 'PerService' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Duration
                                    </label>
                                    <div className="flex gap-4 items-center">
                                        <select
                                            value={selectedHour}
                                            onChange={(e) => {
                                                const hour = e.target.value;
                                                setSelectedHour(hour);
                                                handleDurationChange(hour, selectedMinute);
                                            }}
                                            className="w-1/2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                                        >
                                            <option value="00">0 Hours</option>
                                            {[...Array(12).keys()].map((hour) => {
                                                const paddedHour = (hour + 1).toString().padStart(2, '0');
                                                return (
                                                    <option key={paddedHour} value={paddedHour}>
                                                        {hour + 1} Hour{hour + 1 > 1 ? 's' : ''}
                                                    </option>
                                                );
                                            })}
                                        </select>

                                        <span className="font-bold text-lg text-gray-400 dark:text-gray-500">:</span>

                                        <select
                                            value={selectedMinute}
                                            onChange={(e) => {
                                                const minute = e.target.value;
                                                setSelectedMinute(minute);
                                                handleDurationChange(selectedHour, minute);
                                            }}
                                            className="w-1/2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                                        >
                                            {[0, 15, 30, 45].map((min) => {
                                                const paddedMin = min.toString().padStart(2, '0');
                                                return (
                                                    <option key={paddedMin} value={paddedMin}>
                                                        {min} Minutes
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                    {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                                </div>
                            )}

                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Price <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <IndianRupee className='h-4 w-4 text-gray-400 dark:text-gray-500' />
                                    </div>
                                    <input
                                        type="number"
                                        id="price"
                                        min="0"
                                        step="0.01"
                                        value={formData.price || ''}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                        className={`w-full pl-9 pr-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${errors.price ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                        placeholder="0.00"
                                    />
                                </div>
                                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Service Status</span>
                                <div className="flex items-center gap-3">
                                    <span className={`text-sm font-medium ${formData.status ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {formData.status ? 'Active' : 'Inactive'}
                                    </span>
                                    <div
                                        onClick={() => setFormData((prev) => ({ ...prev, status: !prev.status }))}
                                        className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${formData.status ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                    >
                                        <div
                                            className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${formData.status ? 'translate-x-5' : ''}`}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => {
                                setEditingService(null)
                                navigate(`/provider/providerService`)
                            }}
                            className="w-full sm:w-auto px-6 py-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-500/30"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>{isEditing ? 'Update Service' : 'Create Service'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ServiceManagementPage;