import React, { useState, useRef, useEffect } from 'react';
import { User, Lock, Camera, Loader2, Edit } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService'; 
import { adminService } from '../../services/adminService'; 
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { updateProfile } from '../../features/auth/authSlice';

const AdminProfileSettings: React.FC = () => {
    const { user } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [name, setName] = useState(user?.name || "Admin User");
    const [email, setEmail] = useState(user?.email || "admin@example.com");
    
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [showPasswordChange, setShowPasswordChange] = useState(false);

    const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    useEffect(() => {
        if (user && !isEditingProfile) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user, isEditingProfile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAccountSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            if (newProfileImage) {
                formData.append('profilePicture', newProfileImage);
            }
            
            const updatedUser = await authService.updateProfile(formData);
            dispatch(updateProfile({ user: updatedUser }));
            
            toast.success("Profile updated successfully!");
            setNewProfileImage(null);
            setImagePreview(null);
            setIsEditingProfile(false);
        } catch (err: any) {
            toast.error(err.message || "Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditingProfile(false);
        setName(user?.name || "Admin User");
        setEmail(user?.email || "admin@example.com");
        setNewProfileImage(null);
        setImagePreview(null);
    };

    const handlePasswordUpdate = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters.");
            return;
        }
        setIsUpdatingPassword(true);
        try {
            await adminService.changePassword(currentPassword, newPassword);
            
            toast.success("Password updated successfully!");
            setShowPasswordChange(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            toast.error(err.message || "Failed to update password.");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
                Admin Account Settings
            </h1>
            
            <form onSubmit={handleAccountSave}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    <div className="lg:col-span-2 space-y-8">
                        
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold flex items-center text-gray-900 dark:text-gray-100">
                                    <User className="w-5 h-5 mr-2 text-blue-600" />
                                    Account Information
                                </h2>
                                {!isEditingProfile && (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingProfile(true)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>
                                )}
                            </div>
                            
                            <div className="space-y-4">
                                {isEditingProfile ? (
                                    <>
                                        <div>
                                            <label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                            <input
                                                id="fullName"
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                            <input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                                            <p className="text-lg text-gray-900 dark:text-gray-100 p-2">{name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</label>
                                            <p className="text-lg text-gray-900 dark:text-gray-100 p-2">{email}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        
                    </div>

                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
                                <Camera className="w-5 h-5 mr-2 text-green-600" />
                                Profile Photo
                            </h2>
                            <div className="flex flex-col items-center">
                                <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-gray-300 dark:border-gray-600 mb-4">
                                    <img 
                                        src={imagePreview || (user?.profilePicture ? getCloudinaryUrl(user.profilePicture) : '/profileImage.png')} 
                                        alt="Profile Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <input 
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                                
                                {isEditingProfile && (
                                    <div className="flex flex-col items-center">
                                        <button 
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 text-sm font-medium"
                                        >
                                            Change Photo
                                        </button>
                                        {imagePreview && (
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setNewProfileImage(null);
                                                    setImagePreview(null);
                                                }}
                                                className="mt-2 text-xs text-red-500 hover:underline"
                                            >
                                                Remove Preview
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="sticky top-8">
                            {isEditingProfile && (
                                <div className="space-y-4">
                                    <button 
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={handleCancelEdit}
                                        disabled={isSaving}
                                        className="w-full px-8 py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg shadow-md hover:bg-gray-300 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
                            <Lock className="w-5 h-5 mr-2 text-red-600" />
                            Change Password
                        </h2>
                        
                        {!showPasswordChange ? (
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Update your account's password.</p>
                                <button 
                                    type="button"
                                    onClick={() => setShowPasswordChange(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                                >
                                    Change Password
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={(e) => { e.preventDefault(); handlePasswordUpdate(); }} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md mt-1 bg-white dark:bg-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md mt-1 bg-white dark:bg-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md mt-1 bg-white dark:bg-gray-700"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        type="submit" 
                                        disabled={isUpdatingPassword}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isUpdatingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Update Password
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setShowPasswordChange(false)}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfileSettings;