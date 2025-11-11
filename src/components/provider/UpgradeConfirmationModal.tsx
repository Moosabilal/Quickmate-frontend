import React from 'react';
import { X, AlertTriangle, Zap, CreditCard, Loader2 } from 'lucide-react';
import { IPlan, ISubscriptionPlan, UpgradeModalProps } from '../../util/interface/ISubscriptionPlan';

// Helper to format currency
const formatCurrency = (value: number) => {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};


export const UpgradeConfirmationModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  isProcessing,
  onClose,
  onConfirm,
  plan,
  details
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-auto transform transition-all"
        onClick={(e) => e.stopPropagation()} // Prevent closing on modal click
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Confirm Subscription Upgrade
            </h3>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
              type="button"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        <div className="p-6">
          <p className="text-gray-700 leading-relaxed mb-4 text-center">
            You are about to upgrade to the <strong className="text-gray-900">{plan.name}</strong> plan.
          </p>

          {/* Price Breakdown */}
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
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-800 mb-1">Please Note</p>
                <p className="text-sm text-yellow-700">
                  Your new billing cycle will begin today. Your subscription will renew on {new Date(Date.now() + (plan.durationInDays || 30) * 24 * 60 * 60 * 1000).toLocaleDateString()}.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-6 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-2 min-w-[160px] justify-center font-medium disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pay & Upgrade Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};