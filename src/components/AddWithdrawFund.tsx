import { IndianRupee, X, Loader2 } from 'lucide-react';
import { walletService } from '../services/walletService';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Props } from '../util/interface/IPayment';
import { RazorpayResponse } from '../util/interface/IRazorpay';

export const AddFundsModal: React.FC<Props> = ({ open, onClose, onSuccess, description, status, transactionType}) => {
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  
  if (!open) return null;

  const handleRazorpayDeposit = async () => {
    setLoading(true);
    try {
      if (!window.Razorpay){
         throw new Error("Razorpay SDK failed to load");
      }

      const data = await walletService.initiateDeposit(amount);

      const options = {
        key: data.keyId,
        amount: data.amount * 100, 
        currency: data.currency,
        name: "Quickmate",
        description: "Add funds",
        order_id: data.orderId,
        handler: async (resp: RazorpayResponse) => {
          await walletService.verifyDeposit(
            resp.razorpay_order_id,
            resp.razorpay_payment_id,
            resp.razorpay_signature,
            data.amount,
            description,
            status,
            transactionType,
        );
          toast.success(`${data.amount} ${transactionType === 'credit' ? 'deposited to' : 'withdrawn from'} your wallet`)
          onSuccess();
          onClose();
        },
        prefill: { name: "User", email: "user@example.com" },
        theme: { color: "#3057b0ff" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
        console.error(error);
        toast.error("Transaction failed or cancelled");
    } finally {
      setLoading(false);
      setAmount(0)
    }
  };

  const submit = handleRazorpayDeposit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4 transition-all duration-300">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 transform transition-all scale-100 p-6">
        
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {transactionType === 'credit' ? "Add Funds" : "Withdraw Funds"}
          </h3>
          <button 
            type='button'
            aria-label="Close Modal"
            onClick={onClose} 
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount (INR)</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IndianRupee className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input
                        type="number"
                        min={1}
                        value={amount || ""}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        placeholder="Enter amount"
                        className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    You will {transactionType === 'credit' ? 'add' : 'withdraw'} <span className="font-bold text-gray-900 dark:text-white">₹{(amount || 0)}</span> {transactionType === 'credit' ? 'to' : 'from'} your wallet.
                </p>
            </div>
        </div>

        <button
          disabled={!amount || amount <= 0 || loading}
          onClick={submit}
          className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
             <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
             </>
          ) : (
             transactionType === 'credit' ? "Add Funds" : "Withdraw Funds"
          )}
        </button>
      </div>
    </div>
  );
};