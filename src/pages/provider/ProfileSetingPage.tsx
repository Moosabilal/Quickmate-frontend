import React, { useEffect, useMemo, useState } from 'react';
import { User, Phone, Mail, MapPin, Clock, FileText, Award, CheckCircle, XCircle, Ban, Eye, Edit3, X, Save, Upload } from 'lucide-react';
import { providerService } from '../../services/providerService';
import { IEditedProviderProfile, IProviderProfile, ProviderStatus } from '../../util/interface/IProvider';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { useAppSelector } from '../../hooks/useAppSelector';
import { toast } from 'react-toastify';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { updateProviderProfile } from '../../features/provider/providerSlice';

let DefaultIcon = L.divIcon({
    html: `<svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.596 0 0 5.596 0 12.5C0 19.404 12.5 41 12.5 41S25 19.404 25 12.5C25 5.596 19.404 0 12.5 0ZM12.5 17.5C9.739 17.5 7.5 15.261 7.5 12.5C7.5 9.739 9.739 7.5 12.5 7.5C15.261 7.5 17.5 9.739 17.5 12.5C17.5 15.261 15.261 17.5 12.5 17.5Z" fill="#3B82F6"/>
    </svg>`,
    className: 'custom-div-icon',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const statusMap = {
    Approved: {
        label: "Verified",
        icon: <CheckCircle className="w-5 h-5 text-white" />,
        badgeColor: "bg-green-500",
        text: "text-green-800",
        bg: "bg-green-100",
        iconSmall: <CheckCircle className="w-3 h-3 mr-1" />,
    },
    Pending: {
        label: "Pending",
        icon: <Clock className="w-5 h-5 text-white" />,
        badgeColor: "bg-yellow-500",
        text: "text-yellow-800",
        bg: "bg-yellow-100",
        iconSmall: <Clock className="w-3 h-3 mr-1" />,
    },
    Rejected: {
        label: "Rejected",
        icon: <XCircle className="w-5 h-5 text-white" />,
        badgeColor: "bg-red-500",
        text: "text-red-800",
        bg: "bg-red-100",
        iconSmall: <XCircle className="w-3 h-3 mr-1" />,
    },
    Suspended: {
        label: "Suspended",
        icon: <Ban className="w-5 h-5 text-white" />,
        badgeColor: "bg-gray-500",
        text: "text-gray-800",
        bg: "bg-gray-100",
        iconSmall: <Ban className="w-3 h-3 mr-1" />,
    },
};

const LocationSelector = ({ onSelect }: { onSelect: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onSelect(e.latlng.lat, e.latlng.lng);
        }
    });
    return null;
};

const mapCenter: LatLngExpression = [20.5937, 78.9629];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ProviderProfile: React.FC = () => {
    const { provider } = useAppSelector((state) => state.provider);
    const { user } = useAppSelector((state) => state.auth)

    console.log('the user', user)
    const [providerDetails, setProviderDetails] = useState<Partial<IProviderProfile>>({});
    const [editedDetails, setEditedDetails] = useState<IEditedProviderProfile>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formDataToSend, setFormDataToSend] = useState<FormData | null>(null);
    const [hasChangesToSend, setHasChangesToSend] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [address, setAddress] = useState('');

    const [formData, setFormData] = useState({
        serviceLocation: null as { lat: number; lng: number } | null
    });

    const location = useLocation();
    const dispatch = useAppDispatch()


    const parseLocationString = (locationString: string) => {
        if (!locationString) return null;
        const [lat, lng] = locationString.split(',');
        return {
            lat: parseFloat(lat),
            lng: parseFloat(lng)
        };
    };


    const fetchProvider = async () => {
        try {
            const providerData = await providerService.getProvider()
            setProviderDetails(providerData)
            dispatch(updateProviderProfile({ provider: providerData }))
        } catch (error) {
            console.log('the error in fetching provider', error)
            throw error
        }
    }



    useEffect(() => {
        if (provider && Object.keys(provider).length > 0) {
            setProviderDetails(provider);
            setEditedDetails({ ...provider });

            if (provider.serviceLocation) {
                const parsedLocation = parseLocationString(provider.serviceLocation);
                if (parsedLocation) {
                    setFormData(prev => ({
                        ...prev,
                        serviceLocation: parsedLocation
                    }));
                }
            }
        }
    }, [provider]);



    useEffect(() => {
        const fetchAddress = async () => {
            let location = formData.serviceLocation;

            if (!location && providerDetails.serviceLocation) {
                location = parseLocationString(providerDetails.serviceLocation);
            }

            if (!location?.lat || !location?.lng) return;

            try {
                const locationData = await providerService.getState(location.lat, location.lng);
                setAddress(locationData.address.village || locationData.address.town || locationData.address.city || 'Unknown');
            } catch (err) {
                console.error('Failed to fetch address:', err);
                setAddress('Unknown');
            }
        };

        fetchAddress();
    }, [formData.serviceLocation, providerDetails.serviceLocation]);

    useEffect(() => {
        const sendFormData = async () => {
            if (!formDataToSend || !hasChangesToSend) return;

            try {
                const updatedProvider = await providerService.updateProvider(formDataToSend);
                setProviderDetails(updatedProvider);
                toast.success('Profile updated successfully!');
            } catch (error) {
                toast.error(`Error updating provider:, ${error}`);
                toast.error('Error updating profile. Please try again.');
            } finally {
                setIsSaving(false);
                setIsEditing(false);
                setFormDataToSend(null);
                setHasChangesToSend(false);
            }
        };

        sendFormData();
    }, [formDataToSend, hasChangesToSend]);

    const openModal = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedImage(null);
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditedDetails({ ...providerDetails });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedDetails({ ...providerDetails });

        if (providerDetails.serviceLocation) {
            const parsedLocation = parseLocationString(providerDetails.serviceLocation);
            if (parsedLocation) {
                setFormData(prev => ({
                    ...prev,
                    serviceLocation: parsedLocation
                }));
            }
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const formDataToSend = new FormData();
            let hasChanges = false;

            for (const [key, originalValue] of Object.entries(providerDetails)) {
                if (key === 'serviceLocation' || key === 'serviceArea') continue;
                const editedValue = editedDetails[key as keyof IEditedProviderProfile];

                const finalValue =
                    editedValue !== undefined && editedValue !== null
                        ? editedValue
                        : originalValue;

                const valueChanged = JSON.stringify(editedValue) !== JSON.stringify(originalValue);

                if (valueChanged) {
                    hasChanges = true;
                }

                if (finalValue instanceof File) {
                    continue;
                }

                if (typeof finalValue === 'object' && finalValue !== null) {
                    formDataToSend.append(key, JSON.stringify(finalValue));
                } else if (finalValue !== undefined && finalValue !== null) {
                    formDataToSend.append(key, String(finalValue));
                }
            }

            const newLocation = formData.serviceLocation;
            const originalLocation = providerDetails.serviceLocation;

            if (newLocation && `${newLocation.lat},${newLocation.lng}` !== originalLocation) {
                const latLngString = `${newLocation.lat},${newLocation.lng}`;
                formDataToSend.append('serviceLocation', latLngString);

                if (address && address !== providerDetails.serviceArea) {
                    const finalAddress = Array.isArray(address) ? address.join(', ') : address;
                    formDataToSend.append('serviceArea', finalAddress);
                }

                hasChanges = true;
            }


            if (editedDetails.profilePhotoFile) {
                formDataToSend.append('profilePhoto', editedDetails.profilePhotoFile);
                hasChanges = true;
            }
            if (editedDetails.aadhaarIdProofFile) {
                formDataToSend.append('aadhaarIdProof', editedDetails.aadhaarIdProofFile);
                hasChanges = true;
            }

            if (hasChanges) {
                const updatedProvider = await providerService.updateProvider(formDataToSend);
                setProviderDetails(updatedProvider.provider);
                toast.success(updatedProvider.message);
            } else {
                toast.info('No changes detected');
            }

            setIsEditing(false);
        } catch (error) {
            console.error('Error updating provider:', error);
            toast.error('Error updating profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setEditedDetails(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDayToggle = (day: string) => {
        const current = editedDetails.availability || [];
        const exists = current.find(a => a.day === day);

        let updated;
        if (exists) {
            updated = current.filter(a => a.day !== day);
        } else {
            updated = [...current, { day, startTime: "", endTime: "" }];
        }

        setEditedDetails(prev => ({ ...prev, availability: updated }));
    };

    const handleTimeChange = (day: string, field: "startTime" | "endTime", value: string) => {
        const updated = (editedDetails.availability || []).map(a =>
            a.day === day ? { ...a, [field]: value } : a
        );

        setEditedDetails(prev => ({ ...prev, availability: updated }));
    };


    const getCurrentLocation = () => {
        if (formData.serviceLocation) {
            return formData.serviceLocation;
        }
        if (providerDetails.serviceLocation) {
            return parseLocationString(providerDetails.serviceLocation);
        }
        return null;
    };

    const currentLocation = getCurrentLocation();


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-6">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="w-5 h-5 text-green-300" />
                                            <span className="text-blue-100">Verified information</span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-3">
                                        {isEditing ? (
                                            <>
                                                <button
                                                    onClick={handleCancel}
                                                    className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
                                                >
                                                    <X className="w-4 h-4" />
                                                    <span>Cancel</span>
                                                </button>
                                                <button
                                                    onClick={handleSave}
                                                    disabled={isSaving}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2 disabled:opacity-50"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={handleEdit}
                                                className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                                <span>Edit Profile</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 space-y-8">
                                <section>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                                        <User className="w-6 h-6 mr-3 text-blue-600" />
                                        Basic Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-slate-50 rounded-xl p-4">
                                            <label className="text-sm font-medium text-slate-500 mb-1 block">Name</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editedDetails.fullName || ''}
                                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            ) : (
                                                <p className="text-slate-800 font-semibold">{providerDetails?.fullName}</p>
                                            )}
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-4">
                                            <label className="text-sm font-medium text-slate-500 mb-1 block flex items-center">
                                                <Phone className="w-4 h-4 mr-1" />
                                                Phone
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="tel"
                                                    value={editedDetails.phoneNumber || ''}
                                                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            ) : (
                                                <p className="text-slate-800 font-semibold">{providerDetails?.phoneNumber}</p>
                                            )}
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-4 md:col-span-2">
                                            <label className="text-sm font-medium text-slate-500 mb-1 block flex items-center">
                                                <Mail className="w-4 h-4 mr-1" />
                                                Email
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    value={editedDetails.email || ''}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            ) : (
                                                <p className="text-slate-800 font-semibold">{providerDetails?.email}</p>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                                        <Award className="w-6 h-6 mr-3 text-blue-600" />
                                        Service Area
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                                            <label className="text-sm font-medium text-purple-600 mb-2 block flex items-center">
                                                <MapPin className="w-4 h-4 mr-1" />
                                                Service Area District
                                            </label>

                                            {isEditing ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsMapOpen(true)}
                                                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm"
                                                    >
                                                        {currentLocation
                                                            ? `Selected: (${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)})`
                                                            : 'Select Location from Map'}
                                                    </button>
                                                    {address && (
                                                        <p className="mt-2 text-purple-800 text-sm font-semibold" >Area: {address}</p>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-lg font-semibold text-purple-700">{address}</p>
                                                    {currentLocation && (
                                                        <p className="text-sm text-purple-600 mt-1">
                                                            Coordinates: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                                        <Clock className="w-6 h-6 mr-3 text-blue-600" />
                                        Availability
                                    </h2>

                                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 space-y-4">
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                {daysOfWeek.map(day => {
                                                    const dayAvailability = editedDetails.availability?.find(a => a.day === day);
                                                    const isSelected = !!dayAvailability;

                                                    return (
                                                        <div key={day} className="flex items-center gap-4">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDayToggle(day)}
                                                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors 
                                                                    ${isSelected
                                                                        ? 'bg-blue-600 text-white'
                                                                        : 'bg-white text-blue-600 border border-blue-300'}
                                                                    `}
                                                            >
                                                                {day}
                                                            </button>

                                                            {isSelected && (
                                                                <div className="flex items-center gap-3">
                                                                    <div>
                                                                        <label className="text-xs pr-2 text-blue-500">Start</label>
                                                                        <input
                                                                            type="time"
                                                                            value={dayAvailability.startTime}
                                                                            onChange={(e) => handleTimeChange(day, "startTime", e.target.value)}
                                                                            className="p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                        />
                                                                    </div>
                                                                    <span className="text-blue-600">to</span>
                                                                    <div>
                                                                        <label className="text-xs pr-2 text-blue-500">End</label>
                                                                        <input
                                                                            type="time"
                                                                            value={dayAvailability.endTime}
                                                                            onChange={(e) => handleTimeChange(day, "endTime", e.target.value)}
                                                                            className="p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div>
                                                {providerDetails?.availability?.length ? (
                                                    providerDetails.availability.map((slot: any) => (
                                                        <p key={slot._id} className="text-md text-blue-700">
                                                            <strong>{slot.day}</strong>: {slot.startTime} to {slot.endTime}
                                                        </p>
                                                    ))
                                                ) : (
                                                    <p className="text-blue-500">No availability set</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </section>


                                <section>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Profile Photo</h2>
                                    <div className="flex items-start space-x-6 p-6 bg-slate-50 rounded-xl">
                                        <div className="relative">
                                            <img
                                                src={
                                                    editedDetails.profilePhotoFile
                                                        ? URL.createObjectURL(editedDetails.profilePhotoFile)
                                                        : getCloudinaryUrl(providerDetails?.profilePhoto || '')
                                                }
                                                alt={providerDetails?.fullName}
                                                className="w-24 h-24 rounded-2xl shadow-lg object-cover"
                                            />
                                            {providerDetails?.status && statusMap[providerDetails.status as keyof typeof statusMap] && (
                                                <div
                                                    className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${statusMap[providerDetails.status as keyof typeof statusMap].badgeColor}`}
                                                >
                                                    {statusMap[providerDetails.status as keyof typeof statusMap].icon}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-slate-800 mb-1">{providerDetails?.fullName}</h3>
                                            {providerDetails?.status && (
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-3 ${statusMap[providerDetails.status as keyof typeof statusMap]?.bg} ${statusMap[providerDetails.status as keyof typeof statusMap]?.text}`}
                                                >
                                                    {statusMap[providerDetails.status as keyof typeof statusMap]?.iconSmall}
                                                    {statusMap[providerDetails.status as keyof typeof statusMap]?.label}
                                                </span>
                                            )}
                                            {isEditing ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                const file = e.target.files[0];
                                                                setEditedDetails((prev) => ({
                                                                    ...prev,
                                                                    profilePhotoFile: file,
                                                                }));
                                                            }
                                                        }}
                                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                    />
                                                    <p className="text-xs text-slate-500">Upload a new profile photo (JPG, PNG, max 5MB)</p>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-500">You can change your profile photo in profile settings</p>
                                            )}
                                        </div>
                                        <div>
                                            {providerDetails?.status === ProviderStatus.InActive && (
                                                <Link
                                                    to="/provider-registration"
                                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                                >
                                                    Re-Apply
                                                </Link>
                                            )}
                                        </div>

                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                                        <FileText className="w-6 h-6 mr-3 text-blue-600" />
                                        Verification Documents
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-xl hover:border-blue-200 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                                    <FileText className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-800">Aadhaar/ID Proof</h3>
                                                    {/* <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Verified
                                                    </span> */}
                                                    {isEditing && (
                                                        <div className="mt-2 space-y-2">
                                                            <input
                                                                type="file"
                                                                accept="image/*,.pdf"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        setEditedDetails((prev) => ({
                                                                            ...prev,
                                                                            aadhaarIdProofFile: file,
                                                                        }));
                                                                    }
                                                                }}
                                                                className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700"
                                                            />
                                                            {editedDetails.aadhaarIdProofFile &&
                                                                editedDetails.aadhaarIdProofFile.type.startsWith("image/") && (
                                                                    <img
                                                                        src={URL.createObjectURL(editedDetails.aadhaarIdProofFile)}
                                                                        alt="Aadhaar Preview"
                                                                        className="mt-1 w-48 rounded-lg border border-gray-300 shadow"
                                                                    />
                                                                )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                                                onClick={() => {
                                                    const imageUrl = editedDetails.aadhaarIdProofFile
                                                        ? URL.createObjectURL(editedDetails.aadhaarIdProofFile)
                                                        : getCloudinaryUrl(providerDetails?.aadhaarIdProof || '');
                                                    openModal(imageUrl);
                                                }}
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span>View</span>
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-3xl w-full mx-4 relative">
                        <button
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 z-10"
                            onClick={closeModal}
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Document"
                            className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
                        />
                    </div>
                </div>
            )}

            {/* {(!user?.googleCalendar?.tokens || Object.values(user?.googleCalendar?.tokens).length === 0) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full relative">
                        <button
                            onClick={handleCloseCalendarModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-xl font-bold text-slate-800 mb-3">Google Calendar Sync</h2>
                        <p className="text-slate-600 mb-6">
                            By connecting your Google Calendar, your availability and bookings will automatically sync.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleCloseCalendarModal}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                // onClick={handleConnectCalendar}
                                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                            >
                                Connect Now
                            </button>
                        </div>
                    </div>
                </div>
            )} */}


            {isMapOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl h-[600px] rounded-lg shadow-xl relative">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-lg font-semibold">Select Service Location</h2>
                            <button
                                onClick={() => setIsMapOpen(false)}
                                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="h-[calc(600px-73px)] w-full">
                            <MapContainer
                                // Corrected center prop: use currentLocation if available, otherwise use mapCenter
                                center={currentLocation ? [currentLocation.lat, currentLocation.lng] : mapCenter}
                                zoom={currentLocation ? 10 : 5}
                                className="h-full w-full rounded-b-lg"
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <LocationSelector onSelect={(lat, lng) => {
                                    setFormData(prev => ({ ...prev, serviceLocation: { lat, lng } }));
                                    setIsMapOpen(false);
                                }} />
                                {/* Corrected Marker: only render if currentLocation is not null */}
                                {currentLocation && (
                                    <Marker position={[currentLocation.lat, currentLocation.lng]} />
                                )}
                            </MapContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderProfile;