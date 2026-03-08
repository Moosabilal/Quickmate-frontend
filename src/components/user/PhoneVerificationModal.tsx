import React, { useState } from 'react';
import { Phone, X, Loader2, ChevronRight } from 'lucide-react';

interface PhoneVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    phone: string;
    onPhoneChange: (phone: string) => void;
    onSendOtp: () => Promise<void>;
    onVerifyOtp: (otp: string) => Promise<void>;
    loading: boolean;
    title?: string;
    description?: string;
    showOtpInput: boolean;
    setShowOtpInput: (show: boolean) => void;
}

const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
    isOpen,
    onClose,
    phone,
    onPhoneChange,
    onSendOtp,
    onVerifyOtp,
    loading,
    title = "Phone Verification",
    description = "Please verify your mobile number.",
    showOtpInput,
    setShowOtpInput
}) => {
    const [otp, setOtp] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in duration-300">
                <div className="p-6 sm:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                            <Phone className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" /> {title}
                        </h3>
                        <button
                            onClick={() => { onClose(); setShowOtpInput(false); setOtp(''); }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {!showOtpInput ? (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed text-center">
                                    {description}
                                </p>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => onPhoneChange(e.target.value.replace(/[^0-9]/g, ''))}
                                        placeholder="10-digit mobile number"
                                        maxLength={10}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base font-medium text-gray-900 dark:text-white"
                                    />
                                </div>
                                <button
                                    onClick={onSendOtp}
                                    disabled={loading || phone.length < 10}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 flex items-center justify-center space-x-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <><span>Send Verification Code</span> <ChevronRight className="w-5 h-5 ml-1" /></>}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="text-center">
                                    <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold">Verification Code Sent!</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">Enter the 6-digit code sent to ...{phone.slice(-4)}</p>
                                </div>

                                <div className="flex justify-center py-2">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        className="w-full px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] border-2 border-blue-100 dark:border-blue-900/30 rounded-xl bg-blue-50/30 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowOtpInput(false)}
                                        className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => onVerifyOtp(otp)}
                                        disabled={loading || otp.length < 6}
                                        className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Verify & Save"}
                                    </button>
                                </div>
                                <button
                                    onClick={onSendOtp}
                                    className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline pt-2"
                                >
                                    Didn't receive the code? Resend
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhoneVerificationModal;
