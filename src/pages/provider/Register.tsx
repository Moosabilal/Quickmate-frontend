import React, { useState, useRef, useEffect } from 'react';
import { ChevronUpIcon, ChevronDownIcon, CloudArrowUpIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { ICategoryResponse, ICommissionRuleResponse } from '../../util/interface/ICategory';
import { categoryService } from '../../services/categoryService';
import { providerService } from '../../services/providerService';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { updateProviderProfile } from '../../features/provider/providerSlice';
import { MapPin } from 'lucide-react';
import { Availability } from '../../util/interface/IProvider';



interface FormData {
    fullName: string;
    phoneNumber: string;
    email: string;
    serviceArea: string | null;
    serviceLocation: { lat: number; lng: number } | null;
    availability: Availability[];
    aadhaarIdProof: File | null;
    profilePhoto: File | null;
    agreeTerms: boolean;
}

interface CategoryTableDisplay extends ICategoryResponse {
    subCategoriesCount?: number | undefined;
    commissionRule?: ICommissionRuleResponse | null;
}

export const LocationSelector = ({ onSelect }: { onSelect: (lat: number, lng: number) => void }) => {
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
        serviceArea: '',
        serviceLocation: null,
        availability: [],
        aadhaarIdProof: null,
        profilePhoto: null,
        agreeTerms: false,
    });

    const [categories, setCategories] = useState<CategoryTableDisplay[]>([]);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [services, setServices] = useState<{ value: string; label: string }[]>([]);
    const [address, setAddress] = useState('')
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const navigate = useNavigate();

    const aadhaarIdProofRef = useRef<HTMLInputElement>(null);
    const profilePhotoRef = useRef<HTMLInputElement>(null);

    const dayOptions = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ];

    const handleDayToggle = (day: string, checked: boolean) => {
        setFormData(prev => {
            let updated = [...prev.availability];
            if (checked) {
                updated.push({ day, startTime: '', endTime: '' });
            } else {
                updated = updated.filter(av => av.day !== day);
            }
            return { ...prev, availability: updated };
        });
    };

    const handleTimeChange = (day: string, field: 'startTime' | 'endTime', value: string) => {
        setFormData(prev => {
            const updated = prev.availability.map(av =>
                av.day === day ? { ...av, [field]: value } : av
            );
            return { ...prev, availability: updated };
        });
    };





    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (type === 'checkbox') {
            const checkboxValue = (e.target as HTMLInputElement).value;
            if (id === 'agreeTerms') {
                setFormData(prev => ({ ...prev, agreeTerms: checked }));
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
        const newErrors: Record<string, string | undefined> = {};

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
        if (!formData.serviceLocation) {
            newErrors.serviceLocation = 'Service location is required.';
        }

        if (formData.availability.length === 0) {
            newErrors.availability = 'Select at least one available day.';
        } else {
            for (const { day, startTime, endTime } of formData.availability) {
                if (!startTime) newErrors[`${day}-startTime`] = `${day} start time required`;
                if (!endTime) newErrors[`${day}-endTime`] = `${day} end time required`;
                if (startTime && endTime && startTime >= endTime) {
                    newErrors[`${day}-endTime`] = `${day} end time must be after start time`;
                }
            }
        }
        if (!formData.aadhaarIdProof) newErrors.aadhaarIdProof = 'Aadhaar/ID Proof is required.';
        if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the Terms & Conditions.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) {
            const firstError = Object.values(errors)[0];
            if (firstError) {
                toast.error(firstError);
            }
            return;
        }

        const data = new FormData();
        data.append('fullName', formData.fullName);
        data.append('phoneNumber', formData.phoneNumber);
        data.append('email', formData.email);
        data.append('serviceArea', formData.serviceArea || 'unknown');

        if (formData.serviceLocation) {
            const { lat, lng } = formData.serviceLocation;
            data.append('serviceLocation', `${lat},${lng}`);
        }

        data.append('availability', JSON.stringify(formData.availability));

        if (formData.aadhaarIdProof) data.append('aadhaarIdProof', formData.aadhaarIdProof);
        if (formData.profilePhoto) data.append('profilePhoto', formData.profilePhoto);
        

        try {
            setIsLoading(true)
            const res = await providerService.register(data);
            toast.info(res.message)

            navigate('/verify-otp', { state: { email: formData.email.trim(), role: "ServiceProvider" } });

        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false)
        }
    };


    useEffect(() => {
        const fetchAddress = async () => {
            let location = formData.serviceLocation;

            if (!location?.lat || !location?.lng) return;

            try {
                const locationData = await providerService.getState(location.lat, location.lng);
                setFormData(prev => ({ ...prev, serviceArea: locationData.address.village || locationData.address.town || locationData.address.city || 'Unknown' }))
                setAddress(locationData.address.village || locationData.address.town || locationData.address.city || 'Unknown');
            } catch (err) {
                console.error('Failed to fetch address:', err);
                setAddress('Unknown');
            }
        };

        fetchAddress();
    }, [formData.serviceLocation]);

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
                    <p className="mt-4 text-lg text-gray-700 font-medium">Saving...</p>
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

                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-semibold mb-2">
                                    <span className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        Service Location
                                    </span>

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
                                {address && (
                                    <p className="mt-2 text-purple-800 text-sm font-semibold" >Area: {address}</p>
                                )}
                                {errors.serviceLocation && (
                                    <p className="text-red-500 text-xs mt-2 animate-pulse">
                                        {errors.serviceLocation}
                                    </p>
                                )}
                            </div>

                        </div>

                        <hr className="my-8 border-gray-200" />

                        {/* Available Days */}
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Available Days & Times</label>
                            <div className="space-y-4">
                                {dayOptions.map(day => {
                                    const existing = formData.availability.find(av => av.day === day);
                                    const checked = Boolean(existing);
                                    return (
                                        <div key={day} className="border p-4 rounded-lg">
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={(e) => handleDayToggle(day, e.target.checked)}
                                                />
                                                <span>{day}</span>
                                            </label>
                                            {checked && (
                                                <div className="flex gap-4 mt-3">
                                                    <div className="w-40">
                                                        <input
                                                            type="time"
                                                            value={existing?.startTime || ''}
                                                            onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                                                            className={`w-full px-3 py-2 border ${errors[`${day}-startTime`] ? 'border-red-500' : 'border-gray-200'} rounded-lg`}
                                                        />
                                                        {errors[`${day}-startTime`] && <p className="text-red-500 text-xs">{errors[`${day}-startTime`]}</p>}
                                                    </div>
                                                    <div className="w-40">
                                                        <input
                                                            type="time"
                                                            value={existing?.endTime || ''}
                                                            onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                                                            className={`w-full px-3 py-2 border ${errors[`${day}-endTime`] ? 'border-red-500' : 'border-gray-200'} rounded-lg`}
                                                        />
                                                        {errors[`${day}-endTime`] && <p className="text-red-500 text-xs">{errors[`${day}-endTime`]}</p>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {errors.availability && <p className="text-red-500 text-xs mt-2">{errors.availability}</p>}
                        </div>

                        <hr className="my-8 border-gray-200" />

                        <div className="space-y-6">
                            {renderFileUploadField("Aadhaar/ID Proof", "Upload your ID proof", "aadhaarIdProof", aadhaarIdProofRef)}
                            {renderFileUploadField("Profile Photo(Optional)", "Upload your profile photo", "profilePhoto", profilePhotoRef)}
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

                        <MapContainer center={mapCenter} zoom={5} className="h-[400px] w-full rounded-b-lg " style={{ height: '100%', width: '100%' }}>
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