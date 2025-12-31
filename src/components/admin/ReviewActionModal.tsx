import React from 'react';
import { X, AlertTriangle, Loader2, Check, CheckCircle, Trash2, UserX, UserCheck } from 'lucide-react';
import { ModalConfig, ReviewAction, ReviewActionModalProps } from '../../util/interface/IReviewActionModel';

const CONFIGS: Record<ReviewAction, ModalConfig> = {
  'approve': {
    title: 'Approve Review',
    message: 'Are you sure you want to approve this review?',
    warning: 'This review will become public and will be factored into the provider\'s rating.',
    confirmText: 'Approve',
    icon: <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />,
    iconBg: 'bg-green-100 dark:bg-green-900/20',
    confirmBg: 'bg-green-600 dark:bg-green-600',
    confirmHoverBg: 'hover:bg-green-700 dark:hover:bg-green-500',
    confirmIcon: <Check className="w-4 h-4" />
  },
  're-approve': {
    title: 'Re-Approve Review',
    message: 'Are you sure you want to re-approve this review?',
    warning: 'This review will become public again and will be factored into the provider\'s rating.',
    confirmText: 'Re-Approve',
    icon: <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />,
    iconBg: 'bg-green-100 dark:bg-green-900/20',
    confirmBg: 'bg-green-600 dark:bg-green-600',
    confirmHoverBg: 'hover:bg-green-700 dark:hover:bg-green-500',
    confirmIcon: <Check className="w-4 h-4" />
  },
  'reject': {
    title: 'Reject Review',
    message: 'Are you sure you want to reject this review? It will be moved to the "Removed" tab.',
    warning: 'This action can be undone by re-approving the review.',
    confirmText: 'Reject & Remove',
    icon: <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />,
    iconBg: 'bg-red-100 dark:bg-red-900/20',
    confirmBg: 'bg-red-600 dark:bg-red-600',
    confirmHoverBg: 'hover:bg-red-700 dark:hover:bg-red-500',
    confirmIcon: <Trash2 className="w-4 h-4" />
  },
  'ban': {
    title: 'Ban User',
    message: 'Are you sure you want to ban this user? This will block their account.',
    warning: 'This user will not be able to log in or make new bookings.',
    confirmText: 'Ban User',
    icon: <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />,
    iconBg: 'bg-red-100 dark:bg-red-900/20',
    confirmBg: 'bg-red-600 dark:bg-red-600',
    confirmHoverBg: 'hover:bg-red-700 dark:hover:bg-red-500',
    confirmIcon: <UserX className="w-4 h-4" />
  },
  'unban': {
    title: 'Unban User',
    message: 'Are you sure you want to unban this user? This will reactivate their account.',
    warning: 'They will be able to log in and make new bookings.',
    confirmText: 'Unban User',
    icon: <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />,
    iconBg: 'bg-green-100 dark:bg-green-900/20',
    confirmBg: 'bg-green-600 dark:bg-green-600',
    confirmHoverBg: 'hover:bg-green-700 dark:hover:bg-green-500',
    confirmIcon: <Check className="w-4 h-4" />
  }
};

const ReviewActionModal: React.FC<ReviewActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  action,
  itemName,
  itemDetails,
}) => {
  if (!isOpen) return null;

  const config = CONFIGS[action];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full mx-auto transform transition-all border border-transparent dark:border-gray-700 animate-in slide-in-from-bottom-4 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${config.iconBg} transition-colors`}>
              {config.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{config.title}</h3>
          </div>
          {!isLoading && (
            <button 
              type="button"
              aria-label="Close Modal"
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-5 text-sm sm:text-base">
            {config.message}
          </p>

          {itemDetails && (
            <blockquote className="mb-5 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-l-4 border-gray-300 dark:border-gray-600">
              <p className="text-sm text-gray-700 dark:text-gray-300 italic line-clamp-3">"{itemDetails}"</p>
            </blockquote>
          )}
          
          {itemName && (
            <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">User Account</p>
              <p className="font-semibold text-gray-900 dark:text-white text-lg">{itemName}</p>
            </div>
          )}

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-xl p-4 transition-colors">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1 text-sm sm:text-base">Please Note</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300/80 leading-snug">
                  {config.warning}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2.5 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto px-6 py-2.5 text-white ${config.confirmBg} ${config.confirmHoverBg} rounded-xl transition-all shadow-md shadow-gray-200 dark:shadow-none flex items-center justify-center gap-2 min-w-[140px] font-medium disabled:opacity-50`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {config.confirmIcon}
                <span>{config.confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewActionModal;