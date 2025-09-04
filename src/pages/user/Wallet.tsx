import React, { useEffect, useState } from 'react';
import axios from "axios";
import { toast } from 'react-toastify';
import {
  Plus,
  Minus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Filter,
  X,
  IndianRupee
} from 'lucide-react';
import Pagination from '../../components/user/Pagination';
import { walletService } from '../../services/walletService';
import { AddFundsModal } from '../../components/AddWithdrawFund';
import { TransactionStatus } from '../../interface/IPayment';



const inr = (n: number) =>
new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);


interface Transaction {
  id: string;
  type: 'payment' | 'refund' | 'booking';
  description: string;
  date: string;
  amount: number;
  icon: React.ReactNode;
}

// const Wallet: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'refunds'>('all');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [amount, setAmount] = useState<number>(0);
//   const [loading, setLoading] = useState(false);
    

//   const transactions: Transaction[] = [
//     {
//       id: '1',
//       type: 'payment',
//       description: 'Paid to ABC Cleaning',
//       date: 'May 15, 2024',
//       amount: -50.00,
//       icon: <ArrowUpRight className="w-4 h-4" />
//     },
//     {
//       id: '2',
//       type: 'refund',
//       description: 'Received from Refund',
//       date: 'May 10, 2024',
//       amount: 25.00,
//       icon: <ArrowDownLeft className="w-4 h-4" />
//     },
//     {
//       id: '3',
//       type: 'payment',
//       description: 'Paid to XYZ Plumbing',
//       date: 'May 5, 2024',
//       amount: -75.00,
//       icon: <ArrowUpRight className="w-4 h-4" />
//     },
//     {
//       id: '4',
//       type: 'booking',
//       description: 'Received from Booking',
//       date: 'April 20, 2024',
//       amount: 100.00,
//       icon: <ArrowDownLeft className="w-4 h-4" />
//     }
//   ];

//   const submit = () => {
//     if (amount <= 0) return;
//     setLoading(true);
//     // Simulate API call
//     setTimeout(() => {
//       setLoading(false);
//       setAmount(0);
//       alert(`Successfully added ₹${amount.toFixed(2)} to your wallet!`);
//     }, 2000);
//   };

//   const formatAmount = (amount: number) => {
//     const sign = amount >= 0 ? '+' : '';
//     return `${sign}₹${Math.abs(amount).toFixed(2)}`;
//   };

//   const getAmountColor = (amount: number) => {
//     return amount >= 0 ? 'text-emerald-600' : 'text-red-500';
//   };

//   const getTransactionIcon = (type: string, amount: number) => {
//     const baseClasses = "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center";
//     if (amount >= 0) {
//       return (
//         <div className={`${baseClasses} bg-emerald-50 text-emerald-600 border border-emerald-200`}>
//           <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
//         </div>
//       );
//     } else {
//       return (
//         <div className={`${baseClasses} bg-red-50 text-red-500 border border-red-200`}>
//           <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
//         </div>
//       );
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-4xl mx-auto p-4 sm:p-6">
//         {/* Header */}
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
//           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
//             <div className="flex-1">
//               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Wallet</h1>
//               <p className="text-gray-600 text-base sm:text-lg">Manage your funds and view transaction history</p>
//             </div>
//             <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-3 sm:p-4 rounded-xl border border-orange-200 self-start sm:self-auto">
//               <div className="w-16 h-10 sm:w-20 sm:h-12 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg shadow-sm"></div>
//             </div>
//           </div>

//           {/* Balance */}
//           <div className="mt-6 sm:mt-8 mb-6">
//             <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Current Balance</div>
//             <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">₹250.00</div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
//             <button className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm w-full sm:w-auto">
//               <Plus className="w-5 h-5" />
//               Add Funds
//             </button>
//             <button className="flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors w-full sm:w-auto">
//               <Minus className="w-5 h-5" />
//               Withdraw Funds
//             </button>
//           </div>
//         </div>

//         {/* Transactions Section */}
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
//           {/* Tab Navigation */}
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8">
//             <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 bg-gray-100 p-1 rounded-lg">
//               {[
//                 { key: 'all', label: 'All Transactions' },
//                 { key: 'completed', label: 'Completed Bookings' },
//                 { key: 'refunds', label: 'Refunds' }
//               ].map((tab) => (
//                 <button
//                   key={tab.key}
//                   onClick={() => setActiveTab(tab.key as any)}
//                   className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors text-center ${activeTab === tab.key
//                       ? 'bg-white text-gray-900 shadow-sm'
//                       : 'text-gray-600 hover:text-gray-900'
//                     }`}
//                 >
//                   {tab.label}
//                 </button>
//               ))}
//             </div>

//             {/* Filter Controls */}
//             <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
//               <button className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-colors text-sm">
//                 <Calendar className="w-4 h-4" />
//                 <span className="hidden sm:inline">Date Range</span>
//                 <span className="sm:hidden">Date</span>
//                 <ChevronDown className="w-4 h-4" />
//               </button>
//               <button className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-colors text-sm">
//                 <Filter className="w-4 h-4" />
//                 <span className="hidden sm:inline">Transaction Type</span>
//                 <span className="sm:hidden">Type</span>
//                 <ChevronDown className="w-4 h-4" />
//               </button>
//             </div>
//           </div>

//           {/* Transaction List */}
//           <div className="space-y-3 sm:space-y-4">
//             {transactions.map((transaction) => (
//               <div
//                 key={transaction.id}
//                 className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-100"
//               >
//                 <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
//                   <div className="flex-shrink-0">
//                     {getTransactionIcon(transaction.type, transaction.amount)}
//                   </div>
//                   <div className="min-w-0 flex-1">
//                     <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg truncate">
//                       {transaction.description}
//                     </h3>
//                     <p className="text-gray-600 text-xs sm:text-sm">{transaction.date}</p>
//                   </div>
//                 </div>
//                 <div className={`text-base sm:text-lg lg:text-xl font-bold flex-shrink-0 ml-2 ${getAmountColor(transaction.amount)}`}>
//                   {formatAmount(transaction.amount)}
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
//             <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-lg">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold">Add Funds</h3>
//                 <button className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
//               </div>

//               <label className="block text-sm font-medium text-gray-700 mb-2">Amount (INR)</label>
//               <div className="flex items-center gap-2">
//                 <div className="flex items-center gap-2 flex-1 border rounded-xl px-3 py-2">
//                   <IndianRupee className="w-4 h-4 text-gray-500" />
//                   <input
//                     type="number"
//                     min={1}
//                     value={amount || ""}
//                     onChange={(e) => setAmount(Number(e.target.value))}
//                     placeholder="Enter amount"
//                     className="w-full outline-none"
//                   />
//                 </div>
//               </div>

//               <p className="text-sm text-gray-500 mt-2">You will add <span className="font-semibold">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount || 0)}</span> to your wallet.</p>

//               <button
//                 disabled={!amount || amount <= 0 || loading}
//                 onClick={submit}
//                 className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
//               >
//                 {loading ? "Processing..." : "Add Funds"}
//               </button>
//             </div>
//           </div>

//           <Pagination currentPage={currentPage} totalPages={3} onPageChange={setCurrentPage} />
//         </div>
//       </div>

//     </div>
//   );
// };

// export default Wallet;





const Wallet: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TransactionStatus>(TransactionStatus.ALL)
  const [currentPage, setCurrentPage] = useState(1);
  const [openAdd, setOpenAdd] = useState(false);
  const [balance, setBalance] = useState(0);
  const [addOrWithdraw, setAddOrWithdraw] = useState<string>('')
  const [transactions, setTransactions] = useState<any[]>([]);

  console.log('the transactions', transactions)

  const fetchWallet = async () => {
    const res = await walletService.getWallet();
    console.log('the response', res)
    setBalance(res.data.wallet.balance);
    setTransactions(res.data.transactions);
  };

  useEffect(() => { fetchWallet(); }, []);

    const getTransactionIcon = (type: string, amount: number) => {
    const baseClasses = "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center";
    if (amount >= 0 && type === 'credit') {
      return (
        <div className={`${baseClasses} bg-emerald-50 text-emerald-600 border border-emerald-200`}>
          <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      );
    } else {
      return (
        <div className={`${baseClasses} bg-red-50 text-red-500 border border-red-200`}>
          <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      );
    }
  };

  const formatAmount = (amount: number, type: string) => (amount >= 0 && type === 'credit' ? "+" : "-") + inr(Math.abs(amount));
  const getAmountColor = (amount: number, type: string) => amount >= 0 && type === 'credit' ? 'text-emerald-600' : 'text-red-500';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Wallet</h1>
              <p className="text-gray-600 text-base sm:text-lg">Manage your funds and view transaction history</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-3 sm:p-4 rounded-xl border border-orange-200 self-start sm:self-auto">
              <div className="w-16 h-10 sm:w-20 sm:h-12 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg shadow-sm"></div>
            </div>
          </div>

          {/* Balance */}
          <div className="mt-6 sm:mt-8 mb-6">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Current Balance</div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">{inr(balance)}</div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={() => {
                setOpenAdd(true)
                setAddOrWithdraw('Add')
              }}
              className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm w-full sm:w-auto">
              <Plus className="w-5 h-5" />
              Add Funds
            </button>
            <button className="flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors w-full sm:w-auto"
            onClick={() => {
              setOpenAdd(true)
              setAddOrWithdraw("Withdraw")
            }}
            >
              <Minus className="w-5 h-5" />
              Withdraw Funds
            </button>
          </div>
        </div>

                {/* Transactions Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
          {/* Tab Navigation */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 bg-gray-100 p-1 rounded-lg">
              {
              // [
              //   { key: 'all', label: 'All Transactions' },
              //   { key: 'completed', label: 'Completed Bookings' },
              //   { key: 'refunds', label: 'Refunds' },
              // ]
              Object.values(TransactionStatus).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors text-center ${activeTab === tab.key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-colors text-sm">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Date Range</span>
                <span className="sm:hidden">Date</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <button className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-colors text-sm">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Transaction Type</span>
                <span className="sm:hidden">Type</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Transaction List */}
          <div className="space-y-3 sm:space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-100"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {getTransactionIcon(transaction.transactionType, transaction.amount)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg truncate">
                      {transaction.description}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm">{transaction.createdAt}</p>
                  </div>
                </div>
                <div className={`text-base sm:text-lg lg:text-xl font-bold flex-shrink-0 ml-2 ${getAmountColor(transaction.amount, transaction.transactionType)}`}>
                  {formatAmount(transaction.amount, transaction.transactionType)}
                </div>
              </div>
            ))}
          </div>

          <Pagination currentPage={currentPage} totalPages={3} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* Add Funds Modal */}
      <AddFundsModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={fetchWallet}
        description={addOrWithdraw === "Add" ? "Deposit to Wallet" : "Withdrawn from Wallet"}
        transactionType={addOrWithdraw === "Add" ? "credit" : "debit"}
      />
    </div>
  );
};

export default Wallet;