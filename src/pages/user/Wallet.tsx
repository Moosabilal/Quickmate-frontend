import React, { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Filter,
} from 'lucide-react';
import Pagination from '../../components/user/Pagination';
import { walletService } from '../../services/walletService';
import { AddFundsModal } from '../../components/AddWithdrawFund';
import { ITransaction, TransactionStatus, WalletFilter } from '../../util/interface/IPayment';

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

const TRANSACTION_PER_PAGE = 25;

const Wallet: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TransactionStatus>(TransactionStatus.ALL)
  const [currentPage, setCurrentPage] = useState(1);
  const [openAdd, setOpenAdd] = useState(false);
  const [balance, setBalance] = useState(0);
  const [addOrWithdraw, setAddOrWithdraw] = useState<string>('');
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [filters, setFilters] = useState<WalletFilter>({});
  const [totalPages, setTotalPages] = useState(1);


  const applyFilters = (newFilters: Partial<WalletFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const fetchWallet = useCallback(async (filters: WalletFilter = {}) => {
    if (activeTab === TransactionStatus.ALL) filters.status = "";
    else filters.status = activeTab;

    filters.page = currentPage;
    filters.limit = TRANSACTION_PER_PAGE;

    const query = new URLSearchParams(
      Object.entries(filters).reduce((acc, [key, value]) => {
        if (value) acc[key] = value.toString();
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const res = await walletService.getWallet(query);
    console.log("Wallet data:", res.data.transactions);
    setTotalPages(res.data.totalPages);
    setBalance(res.data.wallet.balance);
    setTransactions(res.data.transactions);
  }, [activeTab, currentPage]);

  useEffect(() => {
    fetchWallet(filters);
  }, [filters, fetchWallet]);

  const getTransactionIcon = (type: string, amount: number) => {
    const baseClasses = "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors";
    if (amount >= 0 && type === 'credit') {
      return (
        <div className={`${baseClasses} bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800`}>
          <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      );
    } else {
      return (
        <div className={`${baseClasses} bg-red-50 text-red-500 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800`}>
          <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      );
    }
  };

  const formatAmount = (amount: number, type: string) => (amount >= 0 && type === 'credit' ? "+" : "-") + inr(Math.abs(amount));
  
  const getAmountColor = (amount: number, type: string) => 
    amount >= 0 && type === 'credit' 
      ? 'text-emerald-600 dark:text-emerald-400' 
      : 'text-red-500 dark:text-red-400';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pb-20">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 mb-6 transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Wallet</h1>
              <p className="text-gray-600 dark:text-gray-400 text-base">Manage your funds and view transaction history</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 p-4 rounded-2xl border border-orange-200 dark:border-orange-800/50 self-start sm:self-auto hidden sm:block">
               <div className="w-12 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-sm opacity-80"></div>
            </div>
          </div>

          <div className="mt-8 mb-8">
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Current Balance</div>
            <div className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">{inr(balance)}</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                setOpenAdd(true)
                setAddOrWithdraw('Add')
              }}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-6 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-200 dark:shadow-none w-full sm:w-auto active:scale-[0.98]">
              <Plus className="w-5 h-5" />
              Add Funds
            </button>
            <button 
              className="flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600/80 text-gray-700 dark:text-gray-200 px-6 py-3.5 rounded-xl font-semibold transition-all w-full sm:w-auto active:scale-[0.98]"
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

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            
            <div className="flex flex-wrap gap-2 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl w-full lg:w-auto">
              {Object.values(TransactionStatus).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as TransactionStatus)}
                  className={`flex-1 lg:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === tab
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-600/50'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors text-sm w-full sm:w-auto">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <input
                  type="date"
                  onChange={(e) => applyFilters({ startDate: e.target.value })}
                  className="bg-transparent outline-none text-gray-700 dark:text-gray-200 w-full cursor-pointer placeholder-gray-500"
                />
              </div>
              
              {activeTab === TransactionStatus.ALL && (
                <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors text-sm w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <select
                    onChange={(e) =>
                      applyFilters({
                        transactionType: e.target.value as "credit" | "debit" | "",
                      })
                    }
                    className="bg-transparent outline-none text-gray-700 dark:text-gray-200 w-full cursor-pointer"
                  >
                    <option value="">All Types</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all border border-gray-100 dark:border-gray-700/50"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                      {getTransactionIcon(transaction.transactionType, transaction.amount)}
                    </div>
                    <div className="min-w-0 flex-1 pr-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                        {transaction.description || "Transaction"}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5">
                        {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className={`text-base sm:text-lg font-bold flex-shrink-0 ml-2 ${getAmountColor(transaction.amount, transaction.transactionType)}`}>
                    {formatAmount(transaction.amount, transaction.transactionType)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">No transactions found.</p>
              </div>
            )}
          </div>

          <div className="mt-8">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </div>

      <AddFundsModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={fetchWallet}
        description={addOrWithdraw === "Add" ? "Deposit to Wallet" : "Withdrawn from Wallet"}
        status={addOrWithdraw === "Add" ? TransactionStatus.DEPOSIT : TransactionStatus.WITHDRAWN}
        transactionType={addOrWithdraw === "Add" ? "credit" : "debit"}
      />
    </div>
  );
};

export default Wallet;