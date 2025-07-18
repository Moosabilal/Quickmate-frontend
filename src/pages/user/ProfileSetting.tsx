
import { MdDelete, MdEdit, MdHome, MdWork } from 'react-icons/md';
import { useAppSelector } from '../../hooks/useAppSelector';
import React, { useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import { useRef } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { updateProfile } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { getCloudinaryUrl } from '../../util/cloudinary';


const ProfileSetting: React.FC = () => {
    const { user } = useAppSelector(state => state.auth);
    const [isEditing, setIsEditing] = useState(false);

    const [name, setName] = useState(user?.name || 'N/A');
    const [email, setEmail] = useState(user?.email || 'N/A');
    const [profilePicture, setProfilePicture] = useState<string | File | null>('nothing');

    const [editingName, setEditingName] = useState('');
    const [editingEmail, setEditingEmail] = useState('');
    const [editingProfilePicture, setEditingProfilePicture] = useState<string | File | null>('');

    const navigate = useNavigate()

    const nameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);

    const isCustomer = user?.role === "Customer"

    const dispatch = useAppDispatch();

    const addresses = [
        { id: '1', type: 'Home', street: '123 Maple Street', city: 'Anytown', country: 'USA', zip: '12345' },
        { id: '2', type: 'Work', street: '456 Oak Avenue', city: 'Anytown', country: 'USA', zip: '67890' },
    ];


    useEffect(() => {
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        const isRefresh = navigationEntries[0]?.type === 'reload';

        if (isRefresh) {
            const fetchUser = async () => {
                try {
                    const userData = await authService.getUser();
                    setName(userData.name);
                    setEmail(userData.email);
                    setProfilePicture(userData.profilePicture || 'nothing');
                    dispatch(updateProfile({ user: userData }));
                } catch (error) {
                    console.error('Failed to fetch user data:', error);
                }
            };

            fetchUser();
        }
    }, []);


    const handleEditProfile = () => {
        setEditingName(name);
        setEditingEmail(email);
        setEditingProfilePicture(profilePicture);
        setIsEditing(true);
    };

    const handleSaveChanges = async () => {
        try {
            const formData = new FormData();
            formData.append('name', editingName);
            formData.append('email', editingEmail);
            if (editingProfilePicture instanceof File) {
                formData.append('profilePicture', editingProfilePicture);
            } else if (typeof editingProfilePicture === 'string' && editingProfilePicture) {
                formData.append('profilePicture', editingProfilePicture);
            }
            const updatedData = await authService.updateProfile(formData);

            setName(editingName);
            setEmail(editingEmail);
            setProfilePicture(editingProfilePicture);

            alert('Profile saved!');
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to save profile. Please try again.');
        }
    };


    const handleCancel = () => {
        setEditingName(name);
        setEditingEmail(email);
        setEditingProfilePicture(profilePicture);
        setIsEditing(false);
    };

    const handleEditAddress = (id: string) => alert(`Edit Address ${id} clicked!`);
    const handleDeleteAddress = (id: string) => {
        if (window.confirm(`Are you sure you want to delete address ${id}?`)) {
            alert(`Delete Address ${id} confirmed!`);
        }
    };
    const handleAddAddress = () => alert('Add Address clicked!');

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEditingProfilePicture(file);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">Account</h1>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 flex flex-col md:flex-row items-center md:items-start justify-between">
                {isEditing ? (
                    <>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Edit Account Info</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                    <input
                                        type="text"
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                    <input
                                        type="email"
                                        value={editingEmail}
                                        onChange={(e) => setEditingEmail(e.target.value)}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>

                                <div className="flex space-x-4 mt-4">
                                    <button
                                        onClick={handleSaveChanges}
                                        className="px-8 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="px-8 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center w-full mt-4">
                            <div className="relative w-32 h-32">
                                <img
                                    src={
                                        editingProfilePicture
                                            ? typeof editingProfilePicture === 'string'
                                                ? getCloudinaryUrl(editingProfilePicture)
                                                : URL.createObjectURL(editingProfilePicture)
                                            : undefined
                                    }
                                    alt="Profile"
                                    className="w-full h-full rounded-full object-cover border-2 border-blue-300 dark:border-blue-700 shadow-md"
                                />
                                <label
                                    htmlFor="profileImageInput"
                                    className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 cursor-pointer bg-white dark:bg-gray-800 p-1 rounded-full shadow-md border border-gray-300 dark:border-gray-600"
                                    title="Change Profile Picture"
                                >
                                    <svg
                                        className="w-5 h-5 text-gray-600 dark:text-gray-300"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 112.828 2.828L11.828 16H9v-2.828z" />
                                    </svg>
                                </label>
                                <input
                                    id="profileImageInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfilePictureChange}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Profile info</h2>
                            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">{name}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">{email} • { }</p>
                            <button
                                onClick={handleEditProfile}
                                className="mt-4 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-sm font-semibold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                            >
                                Edit
                            </button>
                        </div>
                        <div className="mt-6 md:mt-0 md:ml-6 flex-shrink-0">
                            <img
                                src={typeof profilePicture === 'string' ? getCloudinaryUrl(profilePicture) : profilePicture instanceof File ? URL.createObjectURL(profilePicture) : undefined}
                                alt="Profile"
                                className="w-28 h-28 rounded-full object-cover border-2 border-blue-300 dark:border-blue-700 shadow-md"
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Addresses Section
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Addresses</h2>
                <div className="space-y-4">
                    {addresses.map((address) => (
                        <div key={address.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center">
                                {address.type === 'Home' ? (
                                    <MdHome className="w-6 h-6 text-blue-500 dark:text-blue-300 mr-3 flex-shrink-0" />
                                ) : (
                                    <MdWork className="w-6 h-6 text-purple-500 dark:text-purple-300 mr-3 flex-shrink-0" />
                                )}
                                <div>
                                    <p className="text-gray-800 dark:text-gray-100 font-medium">{address.type}</p>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {address.street}, {address.city}, {address.country}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => handleEditAddress(address.id)}
                                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    aria-label={`Edit ${address.type} address`}
                                >
                                    <MdEdit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteAddress(address.id)}
                                    className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                    aria-label={`Delete ${address.type} address`}
                                >
                                    <MdDelete className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={handleAddAddress}
                    className="mt-6 px-4 py-2 border border-blue-500 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-sm font-semibold"
                >
                    Add address
                </button>
            </div> */}
            {isCustomer &&
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6 mt-10">
                <div className="w-full md:w-1/2 flex justify-center">
                    <img
                        src="/home-service-vector.webp"
                        alt="Start Earning"
                        className="w-56 h-auto"
                    />

                </div>

                <div className="w-full md:w-1/2">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Start Earning with Your Skills
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Join thousands of professionals offering trusted services in your city.
                    </p>
                    <button
                        onClick={() => navigate('/provider-registration')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
                    >
                        Register as a Provider
                    </button>
                </div>
            </div>}

        </div>
    );
};

export default ProfileSetting;