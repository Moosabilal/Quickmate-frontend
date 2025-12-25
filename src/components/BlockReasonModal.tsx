import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Info } from 'lucide-react'; // Added Info icon
import { toast } from 'react-toastify';

interface BlockReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title?: string;
  subTitle?: string;
  placeholder?: string;
  isLoading: boolean;
  confirmButtonText?: string; 
  label?: string;
  emailNote?: string;             
}

const BlockReasonModal: React.FC<BlockReasonModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Block Account",
  subTitle,
  placeholder = "Please describe the reason...",
  isLoading = false,
  confirmButtonText = "Confirm Block",
  label = "Reason for blocking",
  emailNote = "Note: This explanation will be included in the email notification sent to the user/provider.",
}) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.info('Please provide a reason');
      return; 
    }
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-slate-100 dark:border-gray-700 flex justify-between items-center bg-slate-50 dark:bg-gray-800/50">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            {title}
          </h3>
          <button 
            disabled={isLoading}
            aria-label='close'
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            
            {subTitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {subTitle}
              </p>
            )}

            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg flex gap-3 items-start">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                {emailNote}
              </p>
            </div>
            
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {label} <span className="text-red-500">*</span>
            </label>
            <textarea
              disabled={isLoading}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-900 text-slate-900 dark:text-white resize-none h-32 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              autoFocus
            />
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              disabled={isLoading}
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              disabled={!reason.trim() || isLoading}
              onClick={handleSubmit}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all shadow-sm flex items-center gap-2
                ${reason.trim() && !isLoading
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-500/20' 
                  : 'bg-red-400 cursor-not-allowed opacity-70'
                }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                confirmButtonText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockReasonModal;