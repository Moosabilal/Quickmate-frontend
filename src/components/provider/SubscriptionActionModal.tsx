import React from 'react';
import { X, AlertTriangle, Loader2, Check, ArrowDownCircle, XCircle, Zap, CreditCard } from 'lucide-react';
import { ModalActionType, ModalConfig, SubscriptionActionModalProps } from '../../util/interface/ISubscriptionPlan';

const formatCurrency = (value: number) => {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const MODAL_CONFIGS: Record<ModalActionType, ModalConfig> = {
  upgrade: {
    type: 'upgrade',
    title: 'Confirm Subscription Upgrade',
    confirmText: 'Pay & Upgrade Now',
    icon: <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    confirmBg: 'bg-blue-600 dark:bg-blue-600',
    confirmHoverBg: 'hover:bg-blue-700 dark:hover:bg-blue-500',
  },
  downgrade: {
    type: 'downgrade',
    title: 'Confirm Downgrade',
    message: (
      <>
        Are you sure you want to schedule this downgrade?
        <br />
        Your new, cheaper plan will start automatically when your current plan expires.
      </>
    ),
    confirmText: 'Schedule Downgrade',
    icon: <ArrowDownCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />,
    iconBg: 'bg-gray-100 dark:bg-gray-700',
    confirmBg: 'bg-gray-700 dark:bg-gray-600',
    confirmHoverBg: 'hover:bg-gray-800 dark:hover:bg-gray-500',
  },
  cancelDowngrade: {
    type: 'cancelDowngrade',
    title: 'Cancel Pending Downgrade',
    message: 'Are you sure you want to cancel your scheduled downgrade? Your current plan will continue to renew as normal.',
    confirmText: 'Yes, Cancel It',
    icon: <XCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />,
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    confirmBg: 'bg-yellow-600 dark:bg-yellow-600',
    confirmHoverBg: 'hover:bg-yellow-700 dark:hover:bg-yellow-500',
  },
};

export const SubscriptionActionModal: React.FC<SubscriptionActionModalProps> = ({
  isOpen,
  isProcessing,
  onClose,
  onConfirm,
  actionType,
  plan,
  details,
}) => {
  if (!isOpen) return null;

  const config = MODAL_CONFIGS[actionType];

  return (
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full mx-auto transform transition-all border border-transparent dark:border-gray-700 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${config.iconBg} transition-colors`}>
              {config.icon}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">
              {config.title}
              {plan && <span className="block text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">{plan.name}</span>}
            </h3>
          </div>
          {!isProcessing && (
            <button
              type="button"
              aria-label="close modal"
              onClick={onClose} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
          {actionType === 'upgrade' && details ? (
            <>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-center text-sm sm:text-base">
                You are about to upgrade to the <strong className="text-gray-900 dark:text-white font-bold">{plan?.name}</strong> plan.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4 space-y-3 mb-5 transition-colors">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">New Plan Price:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(details.newPlanPrice)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Credit from old plan:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">-{formatCurrency(details.oldPlanValue)}</span>
                </div>
                <hr className="border-gray-200 dark:border-gray-600 border-dashed" />
                <div className="flex justify-between items-center text-base">
                  <span className="font-bold text-gray-900 dark:text-white">Total Due Today:</span>
                  <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">{formatCurrency(details.finalAmount)}</span>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-xl p-4 transition-colors">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1 text-sm sm:text-base">Please Note</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300/80 leading-snug">
                      Your new billing cycle will begin today.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-sm sm:text-base">
              {config.message}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="w-full sm:w-auto px-6 py-2.5 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`w-full sm:w-auto px-6 py-2.5 text-white ${config.confirmBg} ${config.confirmHoverBg} rounded-xl flex items-center justify-center gap-2 min-w-[160px] font-medium disabled:opacity-50 transition-colors shadow-lg shadow-black/5 dark:shadow-black/20`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {actionType === 'upgrade' ? <CreditCard className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                <span>{config.confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};