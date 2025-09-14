import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import ThemeToggle from '../components/ThemeToggle';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { login, updateProfile } from '../features/auth/authSlice';
import { providerService } from '../services/providerService';
import { updateProviderProfile } from '../features/provider/providerSlice';
import { BookingStatus, LocationState } from '../interface/IBooking';
import { bookingService } from '../services/bookingService';

let OTP_RESEND_TIMEOUT_SECONDS = 60;

const RegistrationOTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { email: registrationEmail, role, bookingId, newStatus } = (location.state as LocationState) || {};

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(OTP_RESEND_TIMEOUT_SECONDS);
  const [canResend, setCanResend] = useState(false);

  const dispatch = useAppDispatch()

  if (bookingId && newStatus) {
    OTP_RESEND_TIMEOUT_SECONDS = 10 * 60
  }


  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!registrationEmail) {
      toast.error('No email provided for OTP verification. Please register again.');
      navigate('/register', { replace: true });
      return;
    }

    setCanResend(false);
    setTimer(OTP_RESEND_TIMEOUT_SECONDS);

    timerRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(timerRef.current!);
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [registrationEmail, navigate]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };


  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    toast.dismiss();
    setLoading(true);

    if (!registrationEmail) {
      setError('Missing registration email. Please go back to registration.');
      toast.error('Error: Missing registration email.');
      setLoading(false);
      return;
    }

    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      toast.error('Please enter a valid 6-digit OTP.');
      setLoading(false);
      return;
    }

    try {
      if (role === "Customer") {
        await authService.verifyRegistrationOtp(registrationEmail, otp);
        toast.success('Account verified successfully! You can now log in.');
        navigate('/login', { replace: true });
      } else if (role === "ServiceProvider") {
        const { user, provider, message } = await providerService.verifyRegistrationOtp(registrationEmail, otp);
        dispatch(updateProfile({ user }))
        dispatch(updateProviderProfile({ provider }))
        toast.success(message);
        navigate(`/provider/providerProfile/${user.id}`, { replace: true });
      } else if (bookingId && newStatus) {
        const email = registrationEmail
        await bookingService.verifyOtp(email, otp)
        toast.success('Your Service completed successfully')
        navigate(`/provider/providerBookingManagement`)
      }

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'OTP verification failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    toast.dismiss();

    if (!registrationEmail) {
      setError('Missing registration email. Cannot resend OTP.');
      toast.error('Error: Missing registration email.');
      setLoading(false);
      return;
    }

    try {
      if (role === "Customer") {
        await authService.resendRegistrationOtp(registrationEmail);
      } else {
        await providerService.resendRegistrationOtp(registrationEmail);
      }
      toast.info('New OTP sent! Please check your inbox/spam folder.');
      setCanResend(false);
      setTimer(OTP_RESEND_TIMEOUT_SECONDS);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(timerRef.current!);
            setCanResend(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to resend OTP. Please try again later.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-950 dark:to-gray-850 p-4">
      <div className="relative bg-white dark:bg-gray-800 p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-2">
            QuickMate
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Verify Your Account
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
          Enter OTP
        </h2>

        {!registrationEmail && (
          <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded-md relative mb-4" role="alert">
            <span className="block sm:inline">
              No email found. Please go back to <Link to="/register" className="underline">Registration</Link>.
            </span>
          </div>
        )}

        {registrationEmail && (
          <p className="text-center text-gray-700 dark:text-gray-300 mb-4">
            A 6-digit OTP has been sent to **{registrationEmail}**.
          </p>
        )}

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              One-Time Password (OTP)
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition duration-200"
              placeholder="______"
              maxLength={6}
              disabled={loading}
              autoComplete="one-time-code"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify Account'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          {canResend ? (
            <button
              onClick={handleResendOtp}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Resend OTP
            </button>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Resend available in {formatTime(timer)} seconds
            </p>
          )}
        </div>

        {registrationEmail && role && <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-6">
          Didn't receive the OTP? Check your spam folder or{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            register again
          </Link>
        </p>}
      </div>
    </div>
  );
};

export default RegistrationOTPVerification;