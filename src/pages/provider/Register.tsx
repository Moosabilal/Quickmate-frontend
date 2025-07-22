import React, { useState, useRef, useEffect } from 'react';
import { ChevronUpIcon, ChevronDownIcon, CloudArrowUpIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { ICategoryResponse, ICommissionRuleResponse } from '../../types/category';
import { categoryService } from '../../services/categoryService';
import { providerService } from '../../services/providerService';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface FormData {
    fullName: string;
    phoneNumber: string;
    email: string;
    category: string;
    servicesOffered: string;
    serviceName: string;
    serviceArea: string;
    serviceLocation: { lat: number; lng: number } | null;
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

const LocationSelector = ({ onSelect }: { onSelect: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onSelect(e.latlng.lat, e.latlng.lng);
        }
    });
    return null;
};

const ProviderRegistration: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        phoneNumber: '',
        email: '',
        category: '',
        servicesOffered: '',
        serviceName: '',
        serviceArea: '',
        serviceLocation: null,
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
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [services, setServices] = useState<{ value: string; label: string }[]>([]);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const navigate = useNavigate();

    const aadhaarIdProofRef = useRef<HTMLInputElement>(null);
    const profilePhotoRef = useRef<HTMLInputElement>(null);
    const businessCertificationsRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const selectedCategory = categories.find(cat => cat._id === formData.category);
        if (selectedCategory && selectedCategory.subCategories) {
            const mappedServices = selectedCategory.subCategories
                .filter(sub => sub.parentId === selectedCategory._id)
                .map(sub => ({ value: sub._id, label: sub.name }));
            setServices(mappedServices);
        } else {
            setServices([]);
        }
    }, [formData.category, categories]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        if (type === 'checkbox') {
            const checkboxValue = (e.target as HTMLInputElement).value;
            if (id === 'agreeTerms') {
                setFormData(prev => ({ ...prev, agreeTerms: checked }));
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
        setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const validateForm = () => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};
        
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
        if (!formData.serviceLocation) {
            newErrors.serviceLocation = 'Service location is required.';
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
        if (!formData.aadhaarIdProof) newErrors.aadhaarIdProof = 'Aadhaar/ID Proof is required.';
        if (!formData.profilePhoto) newErrors.profilePhoto = 'Profile Photo is required.';
        if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the Terms & Conditions.';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) {
            console.log('Form has validation errors:', errors);
            return;
        }
        
        const data = new FormData();
        data.append('fullName', formData.fullName);
        data.append('phoneNumber', formData.phoneNumber);
        data.append('email', formData.email);
        data.append('categoryId', formData.category);
        data.append('serviceId', formData.servicesOffered);
        data.append('serviceName', formData.serviceName);
        data.append('serviceArea', formData.serviceArea);
        
        if (formData.serviceLocation) {
            const { lat, lng } = formData.serviceLocation;
            data.append('serviceLocation', `${lat},${lng}`);
        }
        
        data.append('experience', String(formData.experience));
        data.append('startTime', formData.startTime);
        data.append('endTime', formData.endTime);
        data.append('averageChargeRange', formData.averageChargeRange);
        data.append('availableDays', JSON.stringify(formData.availableDays));
        
        if (formData.aadhaarIdProof) data.append('aadhaarIdProof', formData.aadhaarIdProof);
        if (formData.profilePhoto) data.append('profilePhoto', formData.profilePhoto);
        if (formData.businessCertifications) data.append('businessCertifications', formData.businessCertifications);
        
        try {
            console.log('the serinding dat', data)
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
        <div className="mb-6">
            <label htmlFor={id as string} className="block text-gray-700 text-sm font-semibold mb-2">
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
                    className={`w-full px-4 py-3 border ${errors[id] ? 'border-red-500' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white`}
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
                    className={`w-full px-4 py-3 border ${errors[id] ? 'border-red-500' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white`}
                />
            )}
            {errors[id] && <p className="text-red-500 text-xs mt-2 animate-pulse">{errors[id]}</p>}
        </div>
    );

    const renderCustomSelectField = (label: string, id: keyof FormData, options: { value: string; label: string }[], placeholder?: string) => (
        <div className="mb-6">
            <label htmlFor={id as string} className="block text-gray-700 text-sm font-semibold mb-2">
                {label}
            </label>
            <div className="relative">
                <select
                    id={id as string}
                    name={id as string}
                    value={formData[id] as string}
                    onChange={handleChange}
                    className={`block appearance-none w-full bg-white border ${errors[id] ? 'border-red-500' : 'border-gray-200'} text-gray-700 py-3 px-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                >
                    {placeholder && <option value="" disabled>{placeholder}</option>}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex flex-col items-center justify-center px-3 text-gray-500">
                    <ChevronUpIcon className="h-4 w-4 -mb-1" />
                    <ChevronDownIcon className="h-4 w-4 -mt-1" />
                </div>
            </div>
            {errors[id] && <p className="text-red-500 text-xs mt-2 animate-pulse">{errors[id]}</p>}
        </div>
    );

    const renderFileUploadField = (label: string, subLabel: string, id: keyof FormData, fileRef: React.RefObject<HTMLInputElement | null>, optional?: boolean) => (
        <div className="mb-6">
            <label htmlFor={id as string} className="block text-gray-700 text-sm font-semibold mb-2">
                {label} {optional && <span className="text-gray-400 text-xs">(Optional)</span>}
            </label>
            <div
                className={`w-full p-8 border-2 border-dashed ${errors[id] ? 'border-red-500' : 'border-gray-200'} rounded-xl text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 bg-white`}
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
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-700 font-semibold">{formData[id] ? (formData[id] as File).name : `Add ${label}`}</p>
                <p className="text-gray-500 text-sm mt-1">{subLabel}</p>
                <button
                    type="button"
                    className="mt-4 px-6 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300"
                >
                    Upload
                </button>
                {formData[id] && (
                    <div className="mt-4">
                        {(formData[id] as File).type.startsWith('image/') ? (
                            <img
                                src={URL.createObjectURL(formData[id] as File)}
                                alt="Uploaded Preview"
                                className="mx-auto h-40 object-contain rounded-lg shadow-sm border border-gray-200"
                            />
                        ) : (
                            <div className="flex items-center justify-center text-sm text-gray-600">
                                <DocumentIcon className="h-5 w-5 mr-2" />
                                <span>{(formData[id] as File).name} uploaded</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {errors[id] && <p className="text-red-500 text-xs mt-2 animate-pulse">{errors[id]}</p>}
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-gray-50 items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
                    <p className="mt-4 text-lg text-gray-700 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

const mapCenter: LatLngExpression = [20.5937, 78.9629]; 

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-4xl mx-auto border border-gray-100">
                    <h1 className="text-4xl font-bold text-gray-800 mb-10 text-center tracking-tight">Provider Registration</h1>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-700">Personal Information</h2>
                            {renderInputField("Full Name", "fullName", "text", "Enter your full name")}
                            {renderInputField("Phone Number", "phoneNumber", "tel", "Enter your phone number")}
                            {renderInputField("Email", "email", "email", "Enter your email")}
                        </div>

                        <hr className="my-8 border-gray-200" />

                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-700">Service Details</h2>
                            {renderCustomSelectField("Select Category", "category", categories.map(cat => ({ value: cat._id, label: cat.name })), "Select your main service category")}
                            {renderCustomSelectField("Select Services Offered", "servicesOffered", services, "Select your service")}
                            
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-semibold mb-2">
                                    Service Location
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsMapOpen(true)}
                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
                                >
                                    {formData.serviceLocation
                                        ? `Selected: (${formData.serviceLocation.lat.toFixed(4)}, ${formData.serviceLocation.lng.toFixed(4)})`
                                        : 'Select Location from Map'}
                                </button>
                                {errors.serviceLocation && (
                                    <p className="text-red-500 text-xs mt-2 animate-pulse">
                                        {errors.serviceLocation}
                                    </p>
                                )}
                            </div>

                            {renderInputField("Service Area (District)", "serviceArea", "text", "Enter the district where you offer services")}
                        </div>

                        <hr className="my-8 border-gray-200" />

                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-700">Professional Details</h2>
                            {renderInputField("Experience (Years)", "experience", "number", "Enter your experience in years", undefined, 0)}
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-semibold mb-2">Available Days</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {dayOptions.map((option) => (
                                        <label key={option.value} className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="availableDays"
                                                value={option.value}
                                                checked={formData.availableDays.includes(option.value)}
                                                onChange={handleChange}
                                                className="form-checkbox h-5 w-5 text-blue-500 rounded focus:ring-blue-500 border-gray-200"
                                            />
                                            <span className="ml-2 text-gray-700 text-sm font-medium">{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.availableDays && <p className="text-red-500 text-xs mt-2 animate-pulse">{errors.availableDays}</p>}
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-semibold mb-2">Time Slots</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="startTime" className="sr-only">Start Time</label>
                                        <input
                                            id="startTime"
                                            name="startTime"
                                            type="time"
                                            value={formData.startTime}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border ${errors.startTime ? 'border-red-500' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white`}
                                        />
                                        {errors.startTime && <p className="text-red-500 text-xs mt-2 animate-pulse">{errors.startTime}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="endTime" className="sr-only">End Time</label>
                                        <input
                                            id="endTime"
                                            name="endTime"
                                            type="time"
                                            value={formData.endTime}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border ${errors.endTime ? 'border-red-500' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white`}
                                        />
                                        {errors.endTime && <p className="text-red-500 text-xs mt-2 animate-pulse">{errors.endTime}</p>}
                                    </div>
                                </div>
                            </div>
                            {renderInputField("Average Charge Range", "averageChargeRange", "text", "Enter your average charge range (e.g., ₹500-₹1500)")}
                        </div>

                        <hr className="my-8 border-gray-200" />

                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-700">Documents</h2>
                            {renderFileUploadField("Aadhaar/ID Proof", "Upload your ID proof", "aadhaarIdProof", aadhaarIdProofRef)}
                            {renderFileUploadField("Profile Photo", "Upload your profile photo", "profilePhoto", profilePhotoRef)}
                            {renderFileUploadField("Business Certifications", "Upload any business certifications", "businessCertifications", businessCertificationsRef, true)}
                        </div>

                        <div className="mt-10 space-y-6">
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="agreeTerms"
                                    checked={formData.agreeTerms}
                                    onChange={handleChange}
                                    className={`form-checkbox h-5 w-5 ${errors.agreeTerms ? 'text-red-500' : 'text-blue-500'} rounded focus:ring-blue-500 border-gray-200`}
                                />
                                <span className="ml-2 text-gray-700 text-sm font-medium">
                                    I agree to the <a href="#" className="text-blue-500 hover:underline">Terms & Conditions</a> and <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>
                                </span>
                            </label>
                            {errors.agreeTerms && <p className="text-red-500 text-xs mt-2 animate-pulse">{errors.agreeTerms}</p>}
                            <button
                                type="submit"
                                className="w-full bg-blue-500 text-white py-3 rounded-full font-semibold text-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={!formData.agreeTerms}
                            >
                                Submit Registration
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Map Modal */}
            {isMapOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white w-[90%] max-w-2xl h-[500px] rounded-lg shadow-xl relative">
                        <h2 className="text-lg font-semibold p-4 border-b">Select Service Location</h2>
                        <button 
                            onClick={() => setIsMapOpen(false)} 
                            className="absolute top-3 right-4 text-xl hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center"
                        >
                            ×
                        </button>

                        <MapContainer center={mapCenter} zoom={5} className="h-[400px] w-full rounded-b-lg">
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <LocationSelector onSelect={(lat, lng) => {
                                setFormData(prev => ({ ...prev, serviceLocation: { lat, lng } }));
                                setErrors(prev => ({ ...prev, serviceLocation: undefined }));
                                setIsMapOpen(false);
                            }} />
                            {formData.serviceLocation && (
                                <Marker position={[formData.serviceLocation.lat, formData.serviceLocation.lng]} />
                            )}
                        </MapContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderRegistration;