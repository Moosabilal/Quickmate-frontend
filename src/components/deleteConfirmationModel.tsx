import React from 'react';
import { X, AlertTriangle, Trash2, Shield, Star, Calendar, FileText, User, LogOut, LogOutIcon, CreditCard } from 'lucide-react';
import { DeleteConfirmationModalProps, DeleteConfirmationTypes } from '../util/interface/IDeleteModelType';

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemType,
  itemName,
  itemDetails,
  isLoading = false,
  customMessage,
  additionalInfo,
  confirmTextProp,
  titleProp
}) => {
  if (!isOpen) return null;

  const getItemConfig = (type: DeleteConfirmationTypes) => {
    const configs = {
      [DeleteConfirmationTypes.SERVICE]: {
        icon: <Shield className="w-6 h-6 text-blue-600" />,
        iconBg: 'bg-blue-100',
        title: 'Delete Service',
        defaultMessage: 'Are you sure you want to delete this service? This will remove it from your offerings and customers will no longer be able to book it.',
        warningText: 'This action will also cancel any pending bookings for this service.',
        confirmText: 'Delete Service'
      },
      [DeleteConfirmationTypes.BOOKING]: {
        icon: <Calendar className="w-6 h-6 text-purple-600" />,
        iconBg: 'bg-purple-100',
        title: 'Cancel Booking',
        defaultMessage: 'Are you sure you want to cancel this booking?.',
        warningText: '',
        confirmText: 'Cancel Booking'
      },
      [DeleteConfirmationTypes.CERTIFICATE]: {
        icon: <FileText className="w-6 h-6 text-green-600" />,
        iconBg: 'bg-green-100',
        title: 'Delete Certificate',
        defaultMessage: 'Are you sure you want to delete this certificate? This may affect your service credibility.',
        warningText: 'Customers will no longer see this certification on your profile.',
        confirmText: 'Delete Certificate'
      },
      [DeleteConfirmationTypes.PORTFOLIO]: {
        icon: <Star className="w-6 h-6 text-yellow-600" />,
        iconBg: 'bg-yellow-100',
        title: 'Delete Portfolio Item',
        defaultMessage: 'Are you sure you want to delete this portfolio item? This will remove it from your showcase.',
        warningText: 'This may impact how customers perceive your work quality.',
        confirmText: 'Delete Portfolio'
      },
      [DeleteConfirmationTypes.PROFILE]: {
        icon: <User className="w-6 h-6 text-red-600" />,
        iconBg: 'bg-red-100',
        title: titleProp,
        confirmText: confirmTextProp,
        defaultMessage: customMessage || "Are you sure?",
        warningText: "This will remove access to this site."
      },
      [DeleteConfirmationTypes.REVIEW]: {
        icon: <Star className="w-6 h-6 text-orange-600" />,
        iconBg: 'bg-orange-100',
        title: 'Delete Review Response',
        defaultMessage: 'Are you sure you want to delete your response to this review?',
        warningText: 'Customers will no longer see your response to this review.',
        confirmText: 'Delete Response'
      },
      [DeleteConfirmationTypes.LOGOUT]: {
        icon: <LogOut className="w-6 h-6 text-gray-600" />,
        iconBg: 'bg-gray-100',
        title: 'Logout',
        defaultMessage: 'Are you sure you want to log out? You will need to sign in again to access your account.',
        warningText: 'Make sure you have saved your work before logging out.',
        confirmText: 'Logout'
      },
      [DeleteConfirmationTypes.SUBSCRIPTION]: {
        icon: <CreditCard className="w-6 h-6 text-red-600" />,
        iconBg: 'bg-red-100',
        title: 'Remove Subscription Plan',
        defaultMessage: 'Are you sure you want to delete this subscription plan? Users currently subscribed may be affected.',
        warningText: 'This action cannot be undone. Ensure no active users depend on this plan before proceeding.',
        confirmText: 'Delete Plan',
      },

    };
    return configs[type];
  };

  const config = getItemConfig(itemType);
  const message = customMessage || config.defaultMessage;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-auto transform transition-all">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${config.iconBg}`}>
              {config.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {config.title}
            </h3>
          </div>
          {!isLoading && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        <div className="p-6">
          <p className="text-gray-700 leading-relaxed mb-4">
            {message}
          </p>

          {itemName && (
            <div className="mb-4 p-4 bg-gray-50 rounded-xl border-l-4 border-red-400">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">
                    {itemType.charAt(0).toUpperCase() + itemType.slice(1)}:
                    <span className="text-red-600 ml-2">{itemName}</span>
                  </p>
                  {itemDetails && (
                    <p className="text-sm text-gray-600 whitespace-pre-line">{itemDetails}</p>
                  )}
                </div>
                <Trash2 className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-800 mb-1">Important Notice</p>
                <p className="text-sm text-yellow-700">
                  {config.warningText}
                </p>
                {additionalInfo && (
                  <p className="text-sm text-yellow-700 mt-2 whitespace-pre-line">
                    {additionalInfo}
                  </p>
                )}
              </div>
            </div>
          </div>

          
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-6 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-2 min-w-[140px] justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{config.confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;