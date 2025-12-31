import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Activity, IndianRupee } from 'lucide-react';
import { providerService } from '../../services/providerService'; 
import { EarningsAnalyticsData } from '../../util/interface/IProvider';
import { isAxiosError } from 'axios';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const EarningsAnalyticsContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Week' | 'Month' | 'Custom'>('Week');
  const [data, setData] = useState<EarningsAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'Custom') {
      setIsLoading(false);
      setData(null);
      return;
    }

    const fetchEarningsData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const period = activeTab.toLowerCase() as 'week' | 'month';
        const result = await providerService.getEarningsAnalytics(period);
        console.log('the result ', result)
        
        if (result.success) {
          setData(result.data);
        } else {
          throw new Error('Failed to fetch analytics data.');
        }

      } catch (err) {
        let errorMessage = 'An unexpected error occurred.';
        if (isAxiosError(err) && err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEarningsData();
  }, [activeTab]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-10 text-slate-500 dark:text-gray-400">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          Loading analytics...
        </div>
      );
    }
    if (error) {
      return <div className="text-center p-10 text-red-500 dark:text-red-400 font-medium">Error: {error}</div>;
    }
    if (activeTab === 'Custom') {
      return <div className="text-center p-10 text-slate-500 dark:text-gray-400">Please select a custom date range.</div>;
    }
    if (!data) {
      return <div className="text-center p-10 text-slate-500 dark:text-gray-400">No earnings data available for this period.</div>;
    }

    const earningsChange = Math.round(data.earningsChangePercentage);

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-blue-500 dark:from-indigo-600 dark:to-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20 dark:shadow-indigo-900/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div className={`flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full ${earningsChange >= 0 ? 'text-white' : 'text-red-200'}`}>
                <TrendingUp className={`w-4 h-4 ${earningsChange < 0 ? 'rotate-180' : ''}`} />
                <span className="text-sm font-semibold">{Math.abs(earningsChange)}%</span>
              </div>
            </div>
            <h3 className="text-white/80 text-sm font-medium mb-1">Earnings</h3>
            <p className="text-3xl sm:text-4xl font-bold mb-1">{formatCurrency(data.totalEarnings)}</p>
            <p className="text-white/80 text-sm">This {activeTab} ({earningsChange >= 0 ? '+' : ''}{earningsChange}%)</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full">
                <span className="text-sm font-semibold">+{data.newClients} New</span>
              </div>
            </div>
            <h3 className="text-slate-500 dark:text-gray-400 text-sm font-medium mb-1">Total Clients</h3>
            <p className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-1">{data.totalClients}</p>
            <p className="text-slate-500 dark:text-gray-400 text-sm">This {activeTab}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-gray-700 transition-colors">
             <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                 <Activity className="w-6 h-6 text-white" />
               </div>
             </div>
             <h3 className="text-slate-500 dark:text-gray-400 text-sm font-medium mb-1">Top Earning Service</h3>
             <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-1 truncate" title={data.topService.name}>
               {data.topService.name || 'N/A'}
             </p>
             <p className="text-slate-500 dark:text-gray-400 text-sm font-semibold">
               {formatCurrency(data.topService.earnings)} This {activeTab}
             </p>
           </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-slate-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-gray-700">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">Earnings Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-gray-700/50 border-b border-slate-100 dark:border-gray-700">
                  {['Date', 'Service', 'Client', 'Amount', 'Status'].map((col) => (
                    <th key={col} className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                {data.breakdown.length > 0 ? (
                  data.breakdown.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-slate-600 dark:text-gray-300">
                        {new Date(row.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-slate-800 dark:text-gray-200">
                        {row.service}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-600 dark:text-gray-400">
                        {row.client}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-800 dark:text-gray-200">
                        {formatCurrency(row.amount)}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-500 dark:text-gray-400">
                      No transactions found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };
  
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-1 sm:mb-2 transition-colors">Earnings</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm sm:text-base transition-colors">Track your earnings and performance</p>
        </div>
        
        <div className="flex space-x-2 mb-6 sm:mb-8 bg-white dark:bg-gray-800 rounded-2xl p-1 sm:p-2 shadow-sm border border-slate-100 dark:border-gray-700 w-fit overflow-x-auto transition-colors">
          {(['Month', 'Week'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {renderContent()}
      </div>
    </main>
  );
};

export default EarningsAnalyticsContent;