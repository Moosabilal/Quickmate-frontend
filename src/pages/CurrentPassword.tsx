import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Lock,
    Eye,
    EyeOff,
    Shield,
    AlertCircle,
    ArrowLeft,
    ChevronRight
} from 'lucide-react';
import { authService } from '../services/authService';

const CurrentPasswordPage = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    const { email } = location.state as { email: string };

    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentPassword(e.target.value);
        if (error) {
            setError('');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!currentPassword.trim()) {
            setError('Please enter your current password');
            return;
        }

        setLoading(true);
        setError('');

        try {

            const response = await authService.forgotPassword(email, currentPassword);
            navigate(`/reset-password/${response.resetToken}`, { replace: true })
            setCurrentPassword('');
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mx-auto mb-4">
                        <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Verify Your Identity
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Please enter your current password to continue
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Current Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="currentPassword"
                                    value={currentPassword}
                                    onChange={handleInputChange}
                                    className={`w-full pl-12 pr-12 py-4 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600'
                                        }`}
                                    placeholder="Enter your current password"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 rounded-r-xl transition-colors duration-200"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {(error) && (
                            <div
                                className={`rounded-xl p-4 border ${error
                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                        : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <AlertCircle
                                        className={`w-5 h-5 mr-3 flex-shrink-0 ${error ? 'text-red-600' : 'text-green-600'
                                            }`}
                                    />
                                    <p
                                        className={`text-sm ${error ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'
                                            }`}
                                    >
                                        {error}
                                    </p>
                                </div>
                            </div>
                        )}


                        <div className="flex space-x-4 pt-6">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="flex-1 flex items-center justify-center py-4 px-6 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back
                            </button>

                            <button
                                type="submit"
                                disabled={loading || !currentPassword.trim()}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Continue
                                        <ChevronRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        We need to verify your identity before allowing password changes
                    </p>
                </div>

                <div className="mt-4 text-center">
                    <button
                        onClick={() => navigate('/forgot-password')}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline"
                    >
                        Forgot your password?
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CurrentPasswordPage;