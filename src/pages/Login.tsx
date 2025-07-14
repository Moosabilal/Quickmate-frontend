import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { login } from '../features/auth/authSlice';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';

interface ValidationErrors {
    email?: string;
    password?: string;
}

interface FormTouched {
    email: boolean;
    password: boolean;
}

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<FormTouched>({ email: false, password: false });

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);

    const validateEmail = (email: string): string | undefined => {
        if (!email.trim()) return 'Email address is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
        if (email.length > 254) return 'Email address is too long';
        return undefined;
    };

    const validatePassword = (password: string): string | undefined => {
        if (!password) return 'Password is required';
        if (password.length < 6) return 'Password must be at least 6 characters long';
        if (password.length > 128) return 'Password must be less than 128 characters';
        return undefined;
    };

    const validateAllFields = (): ValidationErrors => ({
        email: validateEmail(email),
        password: validatePassword(password)
    });

    const handleBlur = (field: keyof FormTouched) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        setValidationErrors(prev => ({
            ...prev,
            [field]: field === 'email' ? validateEmail(email) : validatePassword(password)
        }));
    };

    useEffect(() => {
        if (touched.email) setValidationErrors(prev => ({ ...prev, email: validateEmail(email) }));
    }, [email, touched.email]);

    useEffect(() => {
        if (touched.password) setValidationErrors(prev => ({ ...prev, password: validatePassword(password) }));
    }, [password, touched.password]);

    useEffect(() => {
        if (isAuthenticated) {
            navigate(user?.role === 'Admin' ? '/admin' : '/', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched({ email: true, password: true });
        const errors = validateAllFields();
        setValidationErrors(errors);
        if (Object.values(errors).some(error => error !== undefined)) {
            toast.error('Please correct the errors in the form');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { user } = await authService.login(email.trim(), password);
            dispatch(login({ user}));
            toast.success(`Welcome back, ${user.name}!`);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getInputClasses = (field: keyof ValidationErrors) => {
        const base = 'mt-1 w-full p-3 border rounded-lg transition duration-200 focus:outline-none focus:ring-2';
        const errorClass = touched[field] && validationErrors[field]
            ? 'border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-900/20 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-blue-500';
        return `${base} ${errorClass} text-gray-900 dark:text-gray-100 focus:border-transparent`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-950 dark:to-gray-850 p-4">
            <div className="relative bg-white dark:bg-gray-800 p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 hover:shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-2">QuickMate</h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">Welcome back!</p>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Access Your Account</h2>

                {error && (
                    <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => handleBlur('email')}
                            className={getInputClasses('email')}
                            placeholder="you@example.com"
                            aria-invalid={!!(touched.email && validationErrors.email)}
                        />
                        {touched.email && validationErrors.email && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={() => handleBlur('password')}
                            className={getInputClasses('password')}
                            placeholder="••••••••"
                            aria-invalid={!!(touched.password && validationErrors.password)}
                        />
                        {touched.password && validationErrors.password && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.password}</p>
                        )}
                    </div>

                    <div className="flex justify-end text-sm">
                        <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging In...
                            </span>
                        ) : (
                            'Login to QuickMate'
                        )}
                    </button>
                    <div className="w-full flex justify-center">    
                    <GoogleLogin 
                        onSuccess={async (credentialResponse) => {
                            const idToken = credentialResponse.credential;
                            if (!idToken) return toast.error('No ID token received from Google');

                            try {
                                const res = await authService.googleAuthLogin(idToken);
                                dispatch(login({ user: res.data.user}));
                                toast.success(`Welcome, ${res.data.user.name}`);
                                navigate('/');
                            } catch (error: any) {
                                console.error(error);
                                toast.error('Google login failed. Try again.');
                            }
                        }}
                        onError={() => toast.error('Google login failed')}
                    />
                    </div>
                </form>

                <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-6">
                    New to QuickMate?{' '}
                    <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
