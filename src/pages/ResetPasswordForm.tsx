import React, { useState, useEffect } from 'react';
import { isAxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { ValidationErrorsForReset } from '../util/interface/IUser';
import { authService } from '../services/authService';
import { useAppSelector } from '../hooks/useAppSelector';

const validatePassword = (password: string): string | undefined => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (password.length > 128) return 'Password must be less than 128 characters';
  if (!/(?=.*[a-z])/.test(password)) return 'Include at least one lowercase letter';
  if (!/(?=.*[A-Z])/.test(password)) return 'Include at least one uppercase letter';
  if (!/(?=.*\d)/.test(password)) return 'Include at least one number';
  if (!/(?=.*[@$!%*?&])/.test(password)) return 'Include a special character (@$!%*?&)';
  return undefined;
};

const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
  if (!confirmPassword) return 'Please confirm your password';
  if (confirmPassword !== password) return 'Passwords do not match';
  return undefined;
};

const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const { token: tokenFromParams } = useParams<{ token: string }>();

  const [token, setToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrorsForReset>({});
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [initialCheckComplete, setInitialCheckComplete] = useState<boolean>(false);

  const { isAuthenticated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (tokenFromParams) {
      setToken(tokenFromParams);
      setInitialCheckComplete(true);
    } else {
      setError('Password reset token is missing from the URL.');
      setInitialCheckComplete(true);
      navigate('/forgot-password', { replace: true });
    }
  }, [tokenFromParams, navigate]);

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    setErrors((prev) => {
      const updatedErrors: ValidationErrorsForReset = {
        ...prev,
        newPassword: validatePassword(value),
      };
      if (confirmNewPassword.length > 0) {
        updatedErrors.confirmNewPassword = validateConfirmPassword(confirmNewPassword, value);
      }
      return updatedErrors;
    });
  };

  const handleConfirmNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmNewPassword(value);
    setErrors((prev) => ({
      ...prev,
      confirmNewPassword: validateConfirmPassword(value, newPassword),
    }));
  };

  const handleResetPassword = async () => {
    const newPassError = validatePassword(newPassword);
    const confirmPassError = validateConfirmPassword(confirmNewPassword, newPassword);

    setErrors({ newPassword: newPassError, confirmNewPassword: confirmPassError });

    if (newPassError || confirmPassError) {
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    if (!token) {
      setError('Password reset token is missing. Cannot reset password.');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.resetPassword(token, newPassword, confirmNewPassword);
      setMessage(response.message + ' You can now log in with your new password.');

      setTimeout(() => !isAuthenticated ? navigate('/login', { replace: true }) : navigate('/profile'), 3000);
    } catch (err) {
      let errorMessage = 'Failed to reset password. Please try again.';
      if (isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!initialCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <div className="text-xl font-medium text-gray-700 dark:text-gray-300 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error && !tokenFromParams) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center max-w-md">
          <p className="text-red-500 dark:text-red-400 text-lg font-medium">{error}</p>
          <button
            onClick={() => navigate('/forgot-password', { replace: true })}
            className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300"
          >
            Go to Forgot Password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter a new password for your account
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                className={`mt-1 block w-full px-4 py-3 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 pr-10 ${
                  errors.newPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter new password"
                value={newPassword}
                onChange={handleNewPasswordChange}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.newPassword ? (
              <p className="mt-2 text-sm text-red-500">{errors.newPassword}</p>
            ):(<p id="password-help" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Must be 8+ characters with uppercase, lowercase, number, and special character
                            </p>)}
          </div>

          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmNewPassword"
                name="confirmNewPassword"
                className={`mt-1 block w-full px-4 py-3 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 pr-10 ${
                  errors.confirmNewPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={handleConfirmNewPasswordChange}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmNewPassword && (
              <p className="mt-2 text-sm text-red-500">{errors.confirmNewPassword}</p>
            )}
          </div>

          <button
            onClick={handleResetPassword}
            disabled={loading || !!errors.newPassword || !!errors.confirmNewPassword}
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 flex items-center justify-center"
          >
            {loading ? (
              <svg
                className="animate-spin mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              'Reset Password'
            )}
          </button>

          {message && (
            <p className="text-center text-sm text-green-600 dark:text-green-400">{message}</p>
          )}
          {error && (
            <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        {!isAuthenticated && (<p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Back to{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:underline font-medium"
          >
            Login
          </button>
        </p>)}
      </div>
    </div>
  );
};

export default ResetPasswordForm;