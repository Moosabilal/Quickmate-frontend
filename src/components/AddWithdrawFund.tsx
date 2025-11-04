import { IndianRupee, X } from 'lucide-react';
import { walletService } from '../services/walletService';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Props } from '../util/interface/IPayment';
  



export const AddFundsModal: React.FC<Props> = ({ open, onClose, onSuccess, description, status, transactionType}) => {
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  if (!open) return null;

  const handleRazorpayDeposit = async () => {
    setLoading(true);
    try {
      if (!(window as any).Razorpay){
         throw new Error("Razorpay SDK failed to load");
      }

      const { data } = await walletService.initiateDeposit(amount);

      const options = {
        key: data.keyId,
        amount: data.amount * 100, 
        currency: data.currency,
        name: "Quickmate",
        description: "Add funds",
        order_id: data.orderId,
        handler: async (resp: any) => {
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

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } finally {
      setLoading(false);
      setAmount(0)
    }
  };

  const submit = handleRazorpayDeposit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{transactionType === 'credit' ? "Add Funds" : "Withdraw Funds"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-2">Amount (INR)</label>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1 border rounded-xl px-3 py-2">
            <IndianRupee className="w-4 h-4 text-gray-500" />
            <input
              type="number"
              min={1}
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter amount"
              className="w-full outline-none"
            />
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-2">You will {transactionType === 'credit' ? 'Add' : 'Withdraw'} <span className="font-semibold">{(amount || 0)}</span> {transactionType === 'credit' ? 'to' : 'from'} your wallet.</p>

        <button
          disabled={!amount || amount <= 0 || loading}
          onClick={submit}
          className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {loading ? "Processing..." : transactionType === 'credit' ? "Add Funds" : "Withdraw Funds"}
        </button>
      </div>
    </div>
  );
};