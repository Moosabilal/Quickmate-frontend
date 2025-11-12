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
    icon: <Zap className="w-6 h-6 text-blue-600" />,
    iconBg: 'bg-blue-100',
    confirmBg: 'bg-blue-600',
    confirmHoverBg: 'hover:bg-blue-700',
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
    icon: <ArrowDownCircle className="w-6 h-6 text-gray-600" />,
    iconBg: 'bg-gray-100',
    confirmBg: 'bg-gray-700',
    confirmHoverBg: 'hover:bg-gray-800',
  },
  cancelDowngrade: {
    type: 'cancelDowngrade',
    title: 'Cancel Pending Downgrade',
    message: 'Are you sure you want to cancel your scheduled downgrade? Your current plan will continue to renew as normal.',
    confirmText: 'Yes, Cancel It',
    icon: <XCircle className="w-6 h-6 text-yellow-600" />,
    iconBg: 'bg-yellow-100',
    confirmBg: 'bg-yellow-600',
    confirmHoverBg: 'hover:bg-yellow-700',
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
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-auto transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${config.iconBg}`}>
              {config.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {config.title}
              {plan && `: ${plan.name}`}
            </h3>
          </div>
          {!isProcessing && (
            <button onClick={onClose} >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        <div className="p-6">
          {actionType === 'upgrade' && details ? (
            <>
              <p className="text-gray-700 leading-relaxed mb-4 text-center">
                You are about to upgrade to the <strong className="text-gray-900">{plan?.name}</strong> plan.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">New Plan Price:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(details.newPlanPrice)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Credit from old plan:</span>
                  <span className="font-medium text-green-600">-{formatCurrency(details.oldPlanValue)}</span>
                </div>
                <hr className="border-gray-200 border-dashed" />
                <div className="flex justify-between items-center text-base">
                  <span className="font-bold text-gray-900">Total Due Today:</span>
                  <span className="font-bold text-2xl text-blue-600">{formatCurrency(details.finalAmount)}</span>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800 mb-1">Please Note</p>
                    <p className="text-sm text-yellow-700">
                      Your new billing cycle will begin today.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-700 leading-relaxed mb-4">
              {config.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-6 py-2.5 text-white ${config.confirmBg} ${config.confirmHoverBg} rounded-xl flex items-center gap-2 min-w-[160px] justify-center font-medium disabled:opacity-50`}
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