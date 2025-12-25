import React, { useState, useRef, useEffect } from 'react';
import { User, Lock, Camera, Loader2, Edit, Save, X } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService'; 
import { adminService } from '../../services/adminService'; 
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { updateProfile } from '../../features/auth/authSlice';
import { isAxiosError } from 'axios';

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
        if(name.trim() === ""){
            toast.error("Name cannot be empty.");
            return;
        } else if (name.trim().length < 3){
            toast.error("Name must be at least 3 characters.");
            return;
        } else if (name.trim().length > 20){
            toast.error("Name must not exceed 20 characters.");
            return;
        }
        if (!email.trim()){
            toast.error("Email cannot be empty.");
            return;
        }
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
        } catch (err) {
            let errorMessage = "Failed to update profile.";
            if (isAxiosError(err) && err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            toast.error(errorMessage);
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
        } catch (err) {
            let errorMessage = "Failed to update password.";
            if (isAxiosError(err) && err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            toast.error(errorMessage);
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-700 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                        Account Settings
                    </h1>
                    <p className="text-slate-500 dark:text-gray-300 mt-1">
                        Manage your profile information and security settings
                    </p>
                </div>
                
                <form onSubmit={handleAccountSave}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        <div className="lg:col-span-2 space-y-8">
                            
                            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-600/50 transition-colors">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold flex items-center text-slate-900 dark:text-white gap-2">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        Personal Information
                                    </h2>
                                    {!isEditingProfile && (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingProfile(true)}
                                            className="px-4 py-2 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-200 rounded-xl hover:bg-slate-200 dark:hover:bg-gray-600 text-sm font-medium flex items-center gap-2 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </button>
                                    )}
                                </div>
                                
                                <div className="space-y-6">
                                    {isEditingProfile ? (
                                        <>
                                            <div>
                                                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Full Name</label>
                                                <input
                                                    id="fullName"
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Email Address</label>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="p-4 bg-slate-50 dark:bg-gray-700/50 rounded-xl border border-slate-100 dark:border-gray-700">
                                                <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                                                <p className="text-base font-medium text-slate-900 dark:text-white mt-1">{name}</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 dark:bg-gray-700/50 rounded-xl border border-slate-100 dark:border-gray-700">
                                                <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
                                                <p className="text-base font-medium text-slate-900 dark:text-white mt-1">{email}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-600/50 transition-colors">
                                <h2 className="text-xl font-bold mb-6 flex items-center text-slate-900 dark:text-white gap-2">
                                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    Security
                                </h2>
                                
                                {!showPasswordChange ? (
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 dark:bg-gray-700/30 rounded-xl border border-slate-100 dark:border-gray-700">
                                        <div className="mb-4 sm:mb-0">
                                            <p className="font-medium text-slate-900 dark:text-white">Password</p>
                                            <p className="text-sm text-slate-500 dark:text-gray-400">Update your account password regularly.</p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => setShowPasswordChange(true)}
                                            className="px-5 py-2.5 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-slate-700 dark:text-gray-200 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-600 text-sm font-medium shadow-sm transition-colors"
                                        >
                                            Change Password
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 dark:bg-gray-700/30 p-6 rounded-xl border border-slate-100 dark:border-gray-700">
                                        <div className="space-y-4 max-w-lg">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Current Password</label>
                                                <input
                                                    type="password"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">New Password</label>
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                />
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <button 
                                                    type="button"
                                                    onClick={() => handlePasswordUpdate()}
                                                    disabled={isUpdatingPassword}
                                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 font-medium transition-colors shadow-sm"
                                                >
                                                    {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                    Update Password
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => setShowPasswordChange(false)}
                                                    className="px-6 py-2.5 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-slate-700 dark:text-gray-200 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-600 font-medium transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-600/50 transition-colors">
                                <h2 className="text-xl font-bold mb-6 flex items-center text-slate-900 dark:text-white gap-2">
                                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <Camera className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    Profile Photo
                                </h2>
                                <div className="flex flex-col items-center">
                                    <div className="relative group">
                                        <div className="w-40 h-40 rounded-full overflow-hidden bg-slate-100 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg ring-1 ring-slate-200 dark:ring-gray-600 mb-6">
                                            <img 
                                                src={imagePreview || (user?.profilePicture ? user.profilePicture : '/profileImage.png')} 
                                                alt="Profile Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {isEditingProfile && (
                                            <button 
                                                type="button"
                                                aria-label='edit'
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute bottom-6 right-0 p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md transition-transform hover:scale-105"
                                            >
                                                <Camera className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    
                                    <input 
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    
                                    {isEditingProfile && (
                                        <div className="flex flex-col items-center w-full">
                                            <p className="text-xs text-slate-500 dark:text-gray-400 mb-4 text-center">Allowed *.jpeg, *.jpg, *.png, *.gif <br/> Max size of 3 MB</p>
                                            {imagePreview && (
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        setNewProfileImage(null);
                                                        setImagePreview(null);
                                                    }}
                                                    className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                                                >
                                                    <X className="w-3 h-3" /> Remove Preview
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isEditingProfile && (
                                <div className="sticky top-8 space-y-3">
                                    <button 
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:-translate-y-0.5"
                                    >
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {isSaving ? 'Saving Changes...' : 'Save Changes'}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={handleCancelEdit}
                                        disabled={isSaving}
                                        className="w-full px-6 py-3 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 text-slate-700 dark:text-gray-200 font-semibold rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminProfileSettings;