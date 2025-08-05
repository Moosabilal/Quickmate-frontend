import React, { useEffect, useState } from 'react';
import {
    Home,
    Calendar,
    Settings,
    Star,
    DollarSign,
    User,
    Bell,
    Plus,
    Edit3,
    Trash2,
    Award,
    Eye,
    X,
    Download,
    ExternalLink,
    ArrowLeft,
    Save,
    Upload,
    CheckCircle,
    AlertCircle,
    Backpack
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { providerService } from '../../services/providerService';
import { IAddAndEditServiceForm } from '../../interface/IService';
import { serviceService } from '../../services/serviceService';
import { toast } from 'react-toastify';

interface ICategory {
    id: string;
    name: string;
    parentId?: string;
}


const ServiceManagementPage: React.FC = () => {
    const [categories, setCategories] = useState<ICategory[]>([])
    const [subCategories, setSubCategories] = useState<ICategory[]>([])
    const [editingService, setEditingService] = useState<IAddAndEditServiceForm | null>(null);

    const [formData, setFormData] = useState<Partial<IAddAndEditServiceForm>>({
        title: '',
        description: '',
        categoryId: '',
        experience: 0,
        subCategoryId: '',
        duration: '0:0',
        basePrice: 0,
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
            console.log('the response ', response)
            setCategories(response.mainCategories)
            setSubCategories(response.services)
        }
        categories()
    }, [])


    // Mock services data
    const [services, setServices] = useState<IAddAndEditServiceForm[]>([
        {
            id: '1',
            title: 'Home Cleaning',
            description: 'Professional residential cleaning services with eco-friendly products and experienced staff',
            experience: 5,
            categoryId: '1',
            subCategoryId: null,
            duration: "2:30",
            categoryName: 'Home & Maintenance',
            basePrice: 25,
            priceUnit: 'PerHour',
            providerId: 'provider1',
            status: true,
            price: 120,
            businessCertification: 'certificate1.pdf',
        },
    ]);

    const handleAddService = () => {
        setEditingService(null);
    };

    const handleEditService = (service: IAddAndEditServiceForm) => {
        setEditingService(service);
    };

    const handleDelete = (serviceId: string) => {
        if (confirm('Are you sure you want to delete this service?')) {
            setServices(prevServices => prevServices.filter(service => service.id !== serviceId));
        }
    };


    useEffect(() => {
        if (editingService) {
            setFormData({
                title: editingService.title,
                description: editingService.description,
                experience: editingService.experience,
                categoryId: editingService.categoryId,
                subCategoryId: editingService.subCategoryId,
                duration: editingService.duration,
                basePrice: editingService.basePrice,
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
                basePrice: 0,
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

        if (!formData.basePrice || formData.basePrice <= 0) {
            newErrors.basePrice = 'Base price must be greater than 0';
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
            for (const [key, value] of Object.entries(formData)) {
                const prevValue = editingService?.[key as keyof IAddAndEditServiceForm];

                const isValueChanged = JSON.stringify(value) !== JSON.stringify(prevValue);

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
                toast.success("No changes detected. Skipping update.");
                setIsSubmitting(false);
                return;
            }

            const {message} = await serviceService.createdService(data);
            toast.success(message)
            navigate('/providerService')

        } catch (error) {
            console.error('Error saving service:', error);
        } finally {
            setIsSubmitting(false);
        }

    };

    const isEditing = !!editingService;

    return (
        <div className="min-h-screen bg-gray-50  px-6 w-full max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8 pt-12">
                <button
                    onClick={() => navigate(`/providerService`)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditing ? 'Edit Service' : 'Add New Service'}
                    </h1>
                    <p className="text-gray-600">
                        {isEditing ? 'Update your service details' : 'Create a new service offering'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                id="categoryId"
                                value={formData.categoryId || ''}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.categoryId ? 'border-red-300' : 'border-gray-300'
                                    }`}
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
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Service Title *
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
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.title ? 'border-red-300' : 'border-gray-300'
                                    }`}
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
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                id="description"
                                rows={4}
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.description ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder="Describe your service in detail"
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>

                        <div>
                            <label htmlFor="businessCertification" className="block text-sm font-medium text-gray-700 mb-2">
                                Business Certification <span className="text-gray-400" >(optional)</span>
                            </label>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        id="businessCertification"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setFormData({ ...formData, businessCertification: e.target.files?.[0] || '' })}
                                        className="flex-1 text-sm text-gray-600 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                                    />

                                </div>


                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">

                        <div>
                            <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-2">
                                Experience <span className='text-gray-400'>optional</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    id="experience"
                                    min="0"
                                    step="0.01"
                                    value={formData.experience || ''}
                                    onChange={(e) => setFormData({ ...formData, experience: parseFloat(e.target.value) || 0 })}
                                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.basePrice ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="priceUnit" className="block text-sm font-medium text-gray-700 mb-2">
                                Price Unit
                            </label>
                            <select
                                id="priceUnit"
                                value={formData.priceUnit || 'PerService'}
                                onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value as 'PerHour' | 'PerService' })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            >
                                <option value="PerService">Per Service</option>
                                <option value="PerHour">Per Hour</option>
                            </select>
                        </div>

                        {formData.priceUnit === 'PerHour' && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                        className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    >
                                        <option value="0">0 Hours</option>
                                        {[...Array(12).keys()].map((hour) => (
                                            <option key={hour + 1} value={hour + 1}>
                                                {hour + 1} Hour{hour + 1 > 1 ? 's' : ''}
                                            </option>
                                        ))}
                                    </select>

                                    <span className="font-bold text-lg">:</span>

                                    <select
                                        value={selectedMinute}
                                        onChange={(e) => {
                                            const minute = e.target.value;
                                            setSelectedMinute(minute);
                                            handleDurationChange(selectedHour, minute);
                                        }}
                                        className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    >
                                        {[0, 15, 30, 45].map((min) => (
                                            <option key={min} value={min}>
                                                {min} Minutes
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-2">
                                Base Price *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    id="basePrice"
                                    min="0"
                                    step="0.01"
                                    value={formData.basePrice || ''}
                                    onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.basePrice ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="0.00"
                                />
                            </div>
                            {errors.basePrice && <p className="text-red-500 text-sm mt-1">{errors.basePrice}</p>}
                        </div>


                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                                Display Price *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    id="price"
                                    min="0"
                                    step="0.01"
                                    value={formData.price || ''}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.price ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="0.00"
                                />
                            </div>
                            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700 mb-2">Status</label>
                            <div className="flex items-center space-x-3">
                                <div
                                    onClick={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            status: !prev.status,
                                        }))
                                    }
                                    className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 
        ${formData.status == true ? 'bg-green-500' : 'bg-red-400'}`}
                                >
                                    <div
                                        className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 
          ${!formData.status ? 'translate-x-6' : ''}`}
                                    ></div>
                                </div>
                                <span className="text-sm text-gray-600">
                                    {formData.status ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>



                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => {
                            setEditingService(null)
                            navigate(`/providerService`)
                        }}
                        className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {isEditing ? 'Update Service' : 'Create Service'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );

};

export default ServiceManagementPage;