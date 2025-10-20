import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { login } from '../../features/auth/authSlice';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { RegistrationFormTouched, RegistrationValidationErrors } from '../../util/interface/IUser';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<RegistrationValidationErrors>({});
    const [touched, setTouched] = useState<RegistrationFormTouched>({
        name: false,
        email: false,
        password: false,
        confirmPassword: false,
    });

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { isAuthenticated, user } = useAppSelector((state) => state.auth);

    const validateName = (name: string): string | undefined => {
        if (!name.trim()) {
            return 'Full name is required';
        }
        if (name.trim().length < 2) {
            return 'Name must be at least 2 characters long';
        }
        if (name.trim().length > 50) {
            return 'Name must be less than 50 characters';
        }
        if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
            return 'Name can only contain letters, spaces, hyphens, and apostrophes';
        }
        return undefined;
    };

    const validateEmail = (email: string): string | undefined => {
        if (!email.trim()) {
            return 'Email address is required';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return 'Please enter a valid email address';
        }
        if (email.length > 254) {
            return 'Email address is too long';
        }
        return undefined;
    };

    const validatePassword = (password: string): string | undefined => {
        if (!password) {
            return 'Password is required';
        }
        if (password.length < 8) {
            return 'Password must be at least 8 characters long';
        }
        if (password.length > 128) {
            return 'Password must be less than 128 characters';
        }
        if (!/(?=.*[a-z])/.test(password)) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/(?=.*\d)/.test(password)) {
            return 'Password must contain at least one number';
        }
        if (!/(?=.*[@$!%*?&])/.test(password)) {
            return 'Password must contain at least one special character (@$!%*?&)';
        }
        return undefined;
    };

    const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
        if (!confirmPassword) {
            return 'Please confirm your password';
        }
        if (confirmPassword !== password) {
            return 'Passwords do not match';
        }
        return undefined;
    };

    const validateAllFields = (): RegistrationValidationErrors => {
        return {
            name: validateName(name),
            email: validateEmail(email),
            password: validatePassword(password),
            confirmPassword: validateConfirmPassword(confirmPassword, password),
        };
    };

    const handleBlur = (field: keyof RegistrationFormTouched) => {
        setTouched(prev => ({ ...prev, [field]: true }));

        const errors = { ...validationErrors };
        switch (field) {
            case 'name':
                errors.name = validateName(name);
                break;
            case 'email':
                errors.email = validateEmail(email);
                break;
            case 'password':
                errors.password = validatePassword(password);
                if (touched.confirmPassword) {
                    errors.confirmPassword = validateConfirmPassword(confirmPassword, password);
                }
                break;
            case 'confirmPassword':
                errors.confirmPassword = validateConfirmPassword(confirmPassword, password);
                break;

        }
        setValidationErrors(errors);
    };

    useEffect(() => {
        if (touched.name) {
            setValidationErrors(prev => ({ ...prev, name: validateName(name) }));
        }
    }, [name, touched.name]);

    useEffect(() => {
        if (touched.email) {
            setValidationErrors(prev => ({ ...prev, email: validateEmail(email) }));
        }
    }, [email, touched.email]);

    useEffect(() => {
        if (touched.password) {
            setValidationErrors(prev => ({ ...prev, password: validatePassword(password) }));
        }
        if (touched.confirmPassword) {
            setValidationErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(confirmPassword, password) }));
        }
    }, [password, touched.password, touched.confirmPassword, confirmPassword]);

    useEffect(() => {
        if (touched.confirmPassword) {
            setValidationErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(confirmPassword, password) }));
        }
    }, [confirmPassword, password, touched.confirmPassword]);

    useEffect(() => {
        if (isAuthenticated) {
            if (user?.role === 'Admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
            toast.info('You are already logged in!');
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setTouched({
            name: true,
            email: true,
            password: true,
            confirmPassword: true,
        });

        const errors = validateAllFields();
        setValidationErrors(errors);

        const hasErrors = Object.values(errors).some(error => error !== undefined);
        if (hasErrors) {
            toast.error('Please correct the errors in the form');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await authService.register(name.trim(), email.trim(), password);

            navigate('/verify-otp', { state: { email: email.trim(), role: "Customer" } });




        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getInputClasses = (field: keyof RegistrationValidationErrors) => {
        const baseClasses = "mt-1 w-full p-3 border rounded-lg transition duration-200 focus:outline-none focus:ring-2";
        const hasError = touched[field] && validationErrors[field];

        if (hasError) {
            return `${baseClasses} border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/20 text-gray-900 dark:text-gray-100 focus:ring-red-500 focus:border-red-500`;
        }

        return `${baseClasses} border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-emerald-100 dark:from-gray-950 dark:to-teal-950 p-4">
            <div className="relative bg-white dark:bg-gray-800 p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 hover:shadow-2xl">
                <div className="absolute top-4 right-4">
                    <ThemeToggle />
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-teal-600 dark:text-teal-400 mb-2">
                        QuickMate
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                        Join us to find or provide amazing services!
                    </p>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
                    Create Your QuickMate Account
                </h2>

                {error && (
                    <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md relative mb-4">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={() => handleBlur('name')}
                            className={getInputClasses('name')}
                            placeholder="John Doe"
                            aria-invalid={touched.name && validationErrors.name ? 'true' : 'false'}
                            aria-describedby={touched.name && validationErrors.name ? 'name-error' : undefined}
                        />
                        {touched.name && validationErrors.name && (
                            <p id="name-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {validationErrors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
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
                            aria-invalid={touched.email && validationErrors.email ? 'true' : 'false'}
                            aria-describedby={touched.email && validationErrors.email ? 'email-error' : undefined}
                        />
                        {touched.email && validationErrors.email && (
                            <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {validationErrors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
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
                            aria-invalid={touched.password && validationErrors.password ? 'true' : 'false'}
                            aria-describedby={touched.password && validationErrors.password ? 'password-error' : 'password-help'}
                        />
                        {touched.password && validationErrors.password && (
                            <p id="password-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {validationErrors.password}
                            </p>
                        )}
                        {!touched.password && (
                            <p id="password-help" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Must be 8+ characters with uppercase, lowercase, number, and special character
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="confirm-password"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onBlur={() => handleBlur('confirmPassword')}
                            className={getInputClasses('confirmPassword')}
                            placeholder="••••••••"
                            aria-invalid={touched.confirmPassword && validationErrors.confirmPassword ? 'true' : 'false'}
                            aria-describedby={touched.confirmPassword && validationErrors.confirmPassword ? 'confirm-password-error' : undefined}
                        />
                        {touched.confirmPassword && validationErrors.confirmPassword && (
                            <p id="confirm-password-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {validationErrors.confirmPassword}
                            </p>
                        )}
                    </div>


                    <button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Registering...
                            </span>
                        ) : (
                            'Create My QuickMate Account!'
                        )}
                    </button>
                    <div className="w-full flex justify-center">
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                const idToken = credentialResponse.credential;
                                if (!idToken) return toast.error('No ID token received from Google');

                                try {
                                    const res = await authService.googleAuthLogin(idToken);
                                    dispatch(login({ user: res.data.user }));
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
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;