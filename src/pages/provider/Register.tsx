import React, { useState, useRef, useEffect } from 'react';
import { BellIcon, ChevronUpIcon, ChevronDownIcon, CloudArrowUpIcon, DocumentIcon } from '@heroicons/react/24/outline';
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
        serviceArea: '',
        serviceLocation:'',
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
    const [categories, setCategories] = useState<CategoryTableDisplay[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [services, setServices] = useState<{ value: string; label: string }[]>([])
    const navigate = useNavigate()

    const aadhaarIdProofRef = useRef<HTMLInputElement>(null);
    const profilePhotoRef = useRef<HTMLInputElement>(null);
    const businessCertificationsRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const selectedCategory = categories.find(cat => cat._id === formData.category);
        if (selectedCategory && selectedCategory.subCategories) {
            const mappedServices = selectedCategory.subCategories.map(sub => ({ value: sub._id, label: sub.name }))
            setServices(mappedServices)
        } else {
            setServices([])
        }
    }, [formData.category, categories])

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
            setFormData(prev => ({ ...prev, [id]: value }));
        }


    };

    const handleFileChange = (field: keyof FormData, event: React.ChangeEvent<HTMLInputElement>) => {

        const file = event.target.files ? event.target.files[0] : null;
        setFormData(prev => ({ ...prev, [field]: file }));
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDrop = (field: keyof FormData, event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files ? event.dataTransfer.files[0] : null;
        setFormData(prev => ({ ...prev, [field]: file }));
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData();

        data.append('fullName', formData.fullName);
        data.append('phoneNumber', formData.phoneNumber);
        data.append('email', formData.email);
        data.append('categoryId', formData.category);
        data.append('serviceId', formData.servicesOffered);
        data.append('serviceArea', formData.serviceArea);
        data.append('serviceLocation', formData.serviceLocation);
        data.append('experience', String(formData.experience));
        data.append('startTime', formData.startTime);
        data.append('endTime', formData.endTime);
        data.append('averageChargeRange', formData.averageChargeRange);
        data.append('availableDays', JSON.stringify(formData.availableDays)); // Convert array to string

        if (formData.aadhaarIdProof) data.append('aadhaarIdProof', formData.aadhaarIdProof);
        if (formData.profilePhoto) data.append('profilePhoto', formData.profilePhoto);
        if (formData.businessCertifications) data.append('businessCertifications', formData.businessCertifications);

        try {
            await providerService.register(data);

            alert('Registration form submitted successfully!');
            navigate('/profile')
            
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Something went wrong. Please try again.');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const fetchedCategories: CategoryTableDisplay[] = await categoryService.getAllCategories();
                setCategories(fetchedCategories)
            } catch (error: any) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData()
    }, [])


    const dayOptions = [
        { value: 'monday', label: 'Monday' },
        { value: 'tuesday', label: 'Tuesday' },
        { value: 'wednesday', label: 'Wednesday' },
        { value: 'thursday', label: 'Thursday' },
        { value: 'friday', label: 'Friday' },
        { value: 'saturday', label: 'Saturday' },
        { value: 'sunday', label: 'Sunday' },
    ];

    const renderInputField = (label: string, id: string, type: string = 'text', placeholder?: string, rows?: number, min?: number) => (
        <div className="mb-5">
            <label htmlFor={id} className="block text-gray-700 text-sm font-medium mb-2">
                {label}
            </label>
            {type === 'textarea' ? (
                <textarea
                    id={id}
                    name={id}
                    placeholder={placeholder}
                    value={formData[id as keyof FormData] as string}
                    onChange={handleChange}
                    rows={rows}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
                />
            ) : (
                <input
                    id={id}
                    name={id}
                    type={type}
                    placeholder={placeholder}
                    value={formData[id as keyof FormData] as string | number}
                    onChange={handleChange}
                    min={min}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            )}
        </div>
    );

    const renderCustomSelectField = (label: string, id: string, options: { value: string; label: string; }[], placeholder?: string) => (
        <div className="mb-5">
            <label htmlFor={id} className="block text-gray-700 text-sm font-medium mb-2">
                {label}
            </label>
            <div className="relative">
                <select
                    id={id}
                    name={id}
                    value={formData[id as keyof FormData] as string}
                    onChange={handleChange}
                    className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg shadow-sm leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-primary transition-colors duration-200"
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

                        {renderInputField("Service location (Pincodes)", "serviceLocation", "number", "Enter the pincodes where you offer services", 2)}
                        {renderInputField("Service Area (district)", "serviceArea", "text", "Enter the district where you offer services", 2)}

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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="endTime" className="sr-only">End Time</label>
                                    <input
                                        id="endTime"
                                        name="endTime"
                                        type="time"
                                        value={formData.endTime}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
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
                                    className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary border-gray-300"
                                />
                                <span className="ml-2 text-gray-700 text-sm">
                                    I agree to the <a href="#" className="text-primary hover:underline">Terms & Conditions</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!formData.agreeTerms}
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