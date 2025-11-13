import React from 'react';
import { X, AlertTriangle, Loader2, Check, CheckCircle, Trash2, UserX, UserCheck } from 'lucide-react';
import { ModalConfig, ReviewAction, ReviewActionModalProps } from '../../util/interface/IReviewActionModel';


const CONFIGS: Record<ReviewAction, ModalConfig> = {
  'approve': {
    title: 'Approve Review',
    message: 'Are you sure you want to approve this review?',
    warning: 'This review will become public and will be factored into the provider\'s rating.',
    confirmText: 'Approve',
    icon: <CheckCircle className="w-6 h-6 text-green-600" />,
    iconBg: 'bg-green-100',
    confirmBg: 'bg-green-600',
    confirmHoverBg: 'hover:bg-green-700',
    confirmIcon: <Check className="w-4 h-4" />
  },
  're-approve': {
    title: 'Re-Approve Review',
    message: 'Are you sure you want to re-approve this review?',
    warning: 'This review will become public again and will be factored into the provider\'s rating.',
    confirmText: 'Re-Approve',
    icon: <CheckCircle className="w-6 h-6 text-green-600" />,
    iconBg: 'bg-green-100',
    confirmBg: 'bg-green-600',
    confirmHoverBg: 'hover:bg-green-700',
    confirmIcon: <Check className="w-4 h-4" />
  },
  'reject': {
    title: 'Reject Review',
    message: 'Are you sure you want to reject this review? It will be moved to the "Removed" tab.',
    warning: 'This action can be undone by re-approving the review.',
    confirmText: 'Reject & Remove',
    icon: <Trash2 className="w-6 h-6 text-red-600" />,
    iconBg: 'bg-red-100',
    confirmBg: 'bg-red-600',
    confirmHoverBg: 'hover:bg-red-700',
    confirmIcon: <Trash2 className="w-4 h-4" />
  },
  'ban': {
    title: 'Ban User',
    message: 'Are you sure you want to ban this user? This will block their account.',
    warning: 'This user will not be able to log in or make new bookings.',
    confirmText: 'Ban User',
    icon: <UserX className="w-6 h-6 text-red-600" />,
    iconBg: 'bg-red-100',
    confirmBg: 'bg-red-600',
    confirmHoverBg: 'hover:bg-red-700',
    confirmIcon: <UserX className="w-4 h-4" />
  },
  'unban': {
    title: 'Unban User',
    message: 'Are you sure you want to unban this user? This will reactivate their account.',
    warning: 'They will be able to log in and make new bookings.',
    confirmText: 'Unban User',
    icon: <UserCheck className="w-6 h-6 text-green-600" />,
    iconBg: 'bg-green-100',
    confirmBg: 'bg-green-600',
    confirmHoverBg: 'hover:bg-green-700',
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-auto transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${config.iconBg}`}>
              {config.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{config.title}</h3>
          </div>
          {!isLoading && (
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed mb-4">{config.message}</p>

          {/* Show review text or user name */}
          {itemDetails && (
            <blockquote className="mb-4 p-4 bg-gray-50 rounded-xl border-l-4 border-gray-400">
              <p className="text-sm text-gray-700 italic line-clamp-3">"{itemDetails}"</p>
            </blockquote>
          )}
          {itemName && (
            <div className="mb-4 p-4 bg-gray-50 rounded-xl border-l-4 border-gray-400">
              <p className="font-semibold text-gray-900">User: <span className="text-gray-700">{itemName}</span></p>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-800 mb-1">Please Note</p>
                <p className="text-sm text-yellow-700">{config.warning}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2.5 text-white ${config.confirmBg} ${config.confirmHoverBg} rounded-xl transition-colors flex items-center gap-2 min-w-[140px] justify-center font-medium disabled:opacity-50`}
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