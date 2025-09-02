import React, { useState } from "react";
import axios from "axios";
import { X, IndianRupee } from "lucide-react";
import { loadRazorpay } from "../utils/razorpay"; // if using gateway

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; // refresh wallet
  useGateway?: boolean;  // toggle (dev vs prod)
};

const AddFundsModal: React.FC<Props> = ({ open, onClose, onSuccess, useGateway = false }) => {
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  if (!open) return null;

  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

  const handleDevDeposit = async () => {
    setLoading(true);
    try {
      await axios.post("/api/wallet/deposit", { amount }, { headers });
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayDeposit = async () => {
    setLoading(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Razorpay SDK failed to load");

      const { data } = await axios.post("/api/wallet/deposit/initiate", { amount }, { headers });

      const options = {
        key: data.keyId,
        amount: data.amount, // in paise
        currency: data.currency,
        name: "YourApp Wallet",
        description: "Add funds",
        order_id: data.orderId,
        handler: async (resp: any) => {
          // verify on backend & credit wallet
          await axios.post("/api/wallet/deposit/verify", {
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
            amount: data.amount,
          }, { headers });
          onSuccess();
          onClose();
        },
        prefill: { name: "User", email: "user@example.com" },
        theme: { color: "#059669" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } finally {
      setLoading(false);
    }
  };

  const submit = useGateway ? handleRazorpayDeposit : handleDevDeposit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add Funds</h3>
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

        <p className="text-sm text-gray-500 mt-2">You will add <span className="font-semibold">{inr(amount || 0)}</span> to your wallet.</p>

        <button
          disabled={!amount || amount <= 0 || loading}
          onClick={submit}
          className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {loading ? "Processing..." : "Add Funds"}
        </button>
      </div>
    </div>
  );
};

export default AddFundsModal;
