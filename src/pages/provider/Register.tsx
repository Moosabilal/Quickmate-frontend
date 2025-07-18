import React, { useState, useRef, useEffect } from 'react';
import { ChevronUpIcon, ChevronDownIcon, CloudArrowUpIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { ICategoryResponse, ICommissionRuleResponse } from '../../types/category';
import { categoryService } from '../../services/categoryService';
import { providerService } from '../../services/providerService';
import { useNavigate } from 'react-router-dom';

interface FormData {
    fullName: string;
    phoneNumber: string;
    email: string;
    category: string;
    servicesOffered: string;
    serviceName: string
    serviceArea: string;
    serviceLocation: string;
    experience: number | '';
    availableDays: string[];
    startTime: string;
    endTime: string;
    averageChargeRange: string;
    aadhaarIdProof: File | null;
    profilePhoto: File | null;
    businessCertifications: File | null;
    agreeTerms: boolean;
}

interface CategoryTableDisplay extends ICategoryResponse {
    subCategoriesCount?: number | undefined;
    commissionRule?: ICommissionRuleResponse | null;
}

const ProviderRegistration: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        phoneNumber: '',
        email: '',
        category: '',
        servicesOffered: '',
        serviceName: '',
        serviceArea: '',
        serviceLocation: '',
        experience: '',
        availableDays: [],
        startTime: '',
        endTime: '',
        averageChargeRange: '',
        aadhaarIdProof: null,
        profilePhoto: null,
        businessCertifications: null,
        agreeTerms: false,
    });
    const [categories, setCategories] = useState<CategoryTableDisplay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [services, setServices] = useState<{ value: string; label: string }[]>([]);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({}); // State for validation errors
    const navigate = useNavigate();

    const aadhaarIdProofRef = useRef<HTMLInputElement>(null);
    const profilePhotoRef = useRef<HTMLInputElement>(null);
    const businessCertificationsRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const selectedCategory = categories.find(cat => cat._id === formData.category);

        if (selectedCategory && selectedCategory.subCategories) {
            const mappedServices = selectedCategory.subCategories.filter(sub => sub.parentId === selectedCategory._id).map(sub => ({ value: sub._id, label: sub.name }));

            setServices(mappedServices);
        } else {
            setServices([]);
        }
    }, [formData.category, categories]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value, type, checked } = e.target as HTMLInputElement;

        if (type === 'checkbox') {
            const checkboxValue = (e.target as HTMLInputElement).value;
            if (id === 'agreeTerms') {
                setFormData(prev => ({
                    ...prev,
                    agreeTerms: checked,
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    availableDays: checked
                        ? [...prev.availableDays, checkboxValue]
                        : prev.availableDays.filter(day => day !== checkboxValue),
                }));
            }
        } else {
            if (id === 'servicesOffered') {
                const selectedService = services.find(service => service.value === value);
                setFormData(prev => ({
                    ...prev,
                    [id]: value,
                    serviceName: selectedService?.label || '',
                }));
            } else {
                setFormData(prev => ({ ...prev, [id]: value }));
            }
        }
        setErrors(prev => ({ ...prev, [id]: undefined }));
    };


    const handleFileChange = (field: keyof FormData, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        setFormData(prev => ({ ...prev, [field]: file }));
        setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDrop = (field: keyof FormData, event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files ? event.dataTransfer.files[0] : null;
        setFormData(prev => ({ ...prev, [field]: file }));
        setErrors(prev => ({ ...prev, [field]: undefined })); // Clear error for the file input
    };

    // --- Validation Logic ---
    const validateForm = () => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};

        // Required fields
        if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required.';
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone Number is required.';
        } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Phone Number must be 10 digits.';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid.';
        }
        if (!formData.category) newErrors.category = 'Category is required.';
        if (!formData.servicesOffered) newErrors.servicesOffered = 'Service is required.';
        if (!formData.serviceArea.trim()) newErrors.serviceArea = 'Service Area (district) is required.';
        if (!formData.serviceLocation.trim()) {
            newErrors.serviceLocation = 'Service location (pincodes) is required.';
        } else if (!/^\d{6}$/.test(formData.serviceLocation)) { // Assuming 6-digit Indian pincodes
            newErrors.serviceLocation = 'Pincode must be 6 digits.';
        }

        if (formData.experience === '') {
            newErrors.experience = 'Experience is required.';
        } else if (formData.experience < 0) {
            newErrors.experience = 'Experience cannot be negative.';
        }
        if (formData.availableDays.length === 0) newErrors.availableDays = 'Select at least one available day.';
        if (!formData.startTime) newErrors.startTime = 'Start Time is required.';
        if (!formData.endTime) newErrors.endTime = 'End Time is required.';
        if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
            newErrors.endTime = 'End Time must be after Start Time.';
        }
        if (!formData.averageChargeRange.trim()) newErrors.averageChargeRange = 'Average Charge Range is required.';

        // File uploads (required)
        if (!formData.aadhaarIdProof) newErrors.aadhaarIdProof = 'Aadhaar/ID Proof is required.';
        if (!formData.profilePhoto) newErrors.profilePhoto = 'Profile Photo is required.';

        if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the Terms & Conditions.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };
    // --- End Validation Logic ---

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            console.log('Form has validation errors:', errors);
            // Optionally scroll to the first error or show a general message
            return;
        }

        const data = new FormData();

        data.append('fullName', formData.fullName);
        data.append('phoneNumber', formData.phoneNumber);
        data.append('email', formData.email);
        data.append('categoryId', formData.category);
        data.append('serviceId', formData.servicesOffered);
        data.append('serviceName', formData.serviceName)
        data.append('serviceArea', formData.serviceArea);
        data.append('serviceLocation', formData.serviceLocation);
        data.append('experience', String(formData.experience));
        data.append('startTime', formData.startTime);
        data.append('endTime', formData.endTime);
        data.append('averageChargeRange', formData.averageChargeRange);
        data.append('availableDays', JSON.stringify(formData.availableDays));

        if (formData.aadhaarIdProof) data.append('aadhaarIdProof', formData.aadhaarIdProof);
        if (formData.profilePhoto) data.append('profilePhoto', formData.profilePhoto);
        if (formData.businessCertifications) data.append('businessCertifications', formData.businessCertifications);

        try {
            await providerService.register(data);
            alert('Registration form submitted successfully!');
            navigate('/profile');
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Something went wrong. Please try again.');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const fetchedCategories: CategoryTableDisplay[] = await categoryService.getAllCategories();
                setCategories(fetchedCategories);
            } catch (error: any) {
                console.error("Error fetching data:", error);
                // Optionally handle error state for categories, e.g., show a message to the user
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);


    const dayOptions = [
        { value: 'monday', label: 'Monday' },
        { value: 'tuesday', label: 'Tuesday' },
        { value: 'wednesday', label: 'Wednesday' },
        { value: 'thursday', label: 'Thursday' },
        { value: 'friday', label: 'Friday' },
        { value: 'saturday', label: 'Saturday' },
        { value: 'sunday', label: 'Sunday' },
    ];

    const renderInputField = (label: string, id: keyof FormData, type: string = 'text', placeholder?: string, rows?: number, min?: number) => (
        <div className="mb-5">
            <label htmlFor={id as string} className="block text-gray-700 text-sm font-medium mb-2">
                {label}
            </label>
            {type === 'textarea' ? (
                <textarea
                    id={id as string}
                    name={id as string}
                    placeholder={placeholder}
                    value={formData[id] as string}
                    onChange={handleChange}
                    rows={rows}
                    className={`w-full px-4 py-2 border ${errors[id] ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y`}
                />
            ) : (
                <input
                    id={id as string}
                    name={id as string}
                    type={type}
                    placeholder={placeholder}
                    value={formData[id] as string | number}
                    onChange={handleChange}
                    min={min}
                    className={`w-full px-4 py-2 border ${errors[id] ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                />
            )}
            {errors[id] && <p className="text-red-500 text-xs mt-1">{errors[id]}</p>}
        </div>
    );

    const renderCustomSelectField = (label: string, id: keyof FormData, options: { value: string; label: string; }[], placeholder?: string) => (
        <div className="mb-5">
            <label htmlFor={id as string} className="block text-gray-700 text-sm font-medium mb-2">
                {label}
            </label>
            <div className="relative">
                <select
                    id={id as string}
                    name={id as string}
                    value={formData[id] as string}
                    onChange={handleChange}
                    className={`block appearance-none w-full bg-white border ${errors[id] ? 'border-red-500' : 'border-gray-300'} text-gray-700 py-3 px-4 pr-8 rounded-lg shadow-sm leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex flex-col items-center justify-center px-2 text-gray-700">
                    <ChevronUpIcon className="h-4 w-4 -mb-1" />
                    <ChevronDownIcon className="h-4 w-4 -mt-1" />
                </div>
            </div>
            {errors[id] && <p className="text-red-500 text-xs mt-1">{errors[id]}</p>}
        </div>
    );

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

    const renderFileUploadField = (label: string, subLabel: string, id: keyof FormData, fileRef: React.RefObject<HTMLInputElement>, optional?: boolean) => (
        <div className="mb-5">
            <label htmlFor={id as string} className="block text-gray-700 text-sm font-medium mb-2">
                {label} {optional && <span className="text-gray-500 text-xs">(Optional)</span>}
            </label>
            <div
                className={`w-full p-6 border-2 border-dashed ${errors[id] ? 'border-red-500' : 'border-gray-300'} rounded-lg text-center cursor-pointer hover:border-primary transition-colors duration-200`}
                onClick={() => fileRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(id, e)}
            >
                <input
                    id={id as string}
                    type="file"
                    ref={fileRef}
                    onChange={(e) => handleFileChange(id, e)}
                    className="hidden"
                    accept="image/*,.pdf"
                />
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-700 font-medium">{formData[id] ? (formData[id] as File).name : `Add ${label}`}</p>
                <p className="text-gray-500 text-sm">{subLabel}</p>
                <button
                    type="button"
                    className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                >
                    Upload
                </button>
                {formData[id] && (
                    <div className="mt-4">
                        {(formData[id] as File).type.startsWith('image/') ? (
                            <img
                                src={URL.createObjectURL(formData[id] as File)}
                                alt="Uploaded Preview"
                                className="mx-auto h-32 object-contain border rounded shadow"
                            />
                        ) : (
                            <div className="flex items-center justify-center text-sm text-gray-600">
                                <DocumentIcon className="h-5 w-5 mr-1" />
                                <span>{(formData[id] as File).name} uploaded</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {errors[id] && <p className="text-red-500 text-xs mt-1">{errors[id]}</p>}
        </div>
    );


    return (
        <div className="min-h-screen bg-background font-inter">
            <main className="container mx-auto px-4 py-8">
                <div className="bg-card p-8 rounded-lg shadow-custom max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Provider Registration</h1>

                    <form onSubmit={handleSubmit}>
                        {renderInputField("Full Name", "fullName", "text", "Enter your full name")}
                        {renderInputField("Phone Number", "phoneNumber", "tel", "Enter your phone number")}
                        {renderInputField("Email", "email", "email", "Enter your email")}

                        {renderCustomSelectField("Select Category", "category", categories.map(cat => ({ value: cat._id, label: cat.name })), "Select your main service category")}
                        {renderCustomSelectField("Select Services Offered", "servicesOffered", services, "Select your service")}

                        {renderInputField("Service location (Pincodes)", "serviceLocation", "text", "Enter the pincodes where you offer services")}
                        {renderInputField("Service Area (district)", "serviceArea", "text", "Enter the district where you offer services")}

                        <hr className="my-8 border-gray-200" />

                        {renderInputField("Experience (Years)", "experience", "number", "Enter your experience in years", undefined, 0)}

                        <div className="mb-5">
                            <label className="block text-gray-700 text-sm font-medium mb-2">Available Days</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {dayOptions.map((option) => (
                                    <label key={option.value} className="inline-flex items-center cursor-pointer text-gray-700">
                                        <input
                                            type="checkbox"
                                            name="availableDays"
                                            value={option.value}
                                            checked={formData.availableDays.includes(option.value)}
                                            onChange={handleChange}
                                            className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary border-gray-300"
                                        />
                                        <span className="ml-2 text-base">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.availableDays && <p className="text-red-500 text-xs mt-1">{errors.availableDays}</p>}
                        </div>

                        <div className="mb-5">
                            <label className="block text-gray-700 text-sm font-medium mb-2">Time Slots</label>
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <label htmlFor="startTime" className="sr-only">Start Time</label>
                                    <input
                                        id="startTime"
                                        name="startTime"
                                        type="time"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border ${errors.startTime ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                                    />
                                    {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="endTime" className="sr-only">End Time</label>
                                    <input
                                        id="endTime"
                                        name="endTime"
                                        type="time"
                                        value={formData.endTime}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border ${errors.endTime ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                                    />
                                    {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
                                </div>
                            </div>
                        </div>

                        {renderInputField("Average Charge Range", "averageChargeRange", "text", "Enter your average charge range (e.g., ₹500-₹1500)")}

                        {renderFileUploadField("Aadhaar/ID Proof", "Upload your ID proof", "aadhaarIdProof", aadhaarIdProofRef as React.RefObject<HTMLInputElement>)}

                        <hr className="my-8 border-gray-200" />

                        {renderFileUploadField("Profile Photo", "Upload your profile photo", "profilePhoto", profilePhotoRef as React.RefObject<HTMLInputElement>)}
                        {renderFileUploadField("Business Certifications", "Upload any business certifications", "businessCertifications", businessCertificationsRef as React.RefObject<HTMLInputElement>, true)}

                        <div className="mt-8">
                            <p className="text-gray-700 mb-4">Thank you for registering.</p>
                            <label className="inline-flex items-center cursor-pointer mb-6">
                                <input
                                    type="checkbox"
                                    id="agreeTerms"
                                    checked={formData.agreeTerms}
                                    onChange={handleChange}
                                    className={`form-checkbox h-5 w-5 ${errors.agreeTerms ? 'text-red-500' : 'text-primary'} rounded focus:ring-primary border-gray-300`}
                                />
                                <span className="ml-2 text-gray-700 text-sm">
                                    I agree to the <a href="#" className="text-primary hover:underline">Terms & Conditions</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                                </span>
                            </label>
                            {errors.agreeTerms && <p className="text-red-500 text-xs mt-1">{errors.agreeTerms}</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!formData.agreeTerms} // Still disable if terms not agreed
                        >
                            Submit Registration
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ProviderRegistration;