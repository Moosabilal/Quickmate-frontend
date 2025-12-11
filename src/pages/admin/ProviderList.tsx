import React, { useEffect, useState } from 'react';
import { providerService } from '../../services/providerService';
import Pagination from '../../components/admin/Pagination';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { toast } from 'react-toastify';
import { ProviderList, ProviderStatus } from '../../util/interface/IProvider';
import { useDebounce } from '../../hooks/useDebounce';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, MapPin, Star, Briefcase } from 'lucide-react';
import { TableRowSkeleton } from '../../components/admin/ProviderTableRowSkeleton';
import { isAxiosError } from 'axios';
import { MobileCardSkeleton } from '../../components/admin/ProviderMobileCardSkeleton';

const PROVIDER_PER_PAGE = 4;

const AdminProvidersPage: React.FC = () => {
  const [providers, setProviders] = useState<ProviderList[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProviders, setTotalProviders] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const navigate = useNavigate();

  const ratingOptions = [
    { label: '5 Stars', value: '5' },
    { label: '4 Stars', value: '4' },
    { label: '3 Stars', value: '3' },
    { label: '2 Stars', value: '2' },
    { label: '1 Star', value: '1' }
  ];

  useEffect(() => {
    const fetchProviders = async () => {
      setIsLoading(true);
      try {
        const response = await providerService.getProvidersForAdmin({
          search: debouncedSearchTerm || '',
          status: approvalStatus !== 'All' ? approvalStatus : undefined,
          rating: ratingFilter !== 'All' ? ratingFilter : undefined,
          page: currentPage,
          limit: PROVIDER_PER_PAGE,
        });
        setProviders(response.data);
        setTotalProviders(response.total);
        setTotalPages(response.totalPages);
        setError('');
      } catch (error) {
        let errorMessage = 'Failed to load providers';
        if (isAxiosError(error) && error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        setError(errorMessage);
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, [debouncedSearchTerm, approvalStatus, ratingFilter, currentPage]);

  const getStatusClasses = (status: ProviderList['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800';
      case 'Suspended':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
    }
  };

  const handleStatusChange = async (providerId: string, newStatus: ProviderStatus) => {
    try {
      const res = await providerService.updateProviderStatus(providerId, newStatus);
      setProviders((prev) =>
        prev.map((p) => (p.id === providerId ? { ...p, status: newStatus } : p))
      );
      toast.success(res.message || 'Status Updated Successfully');
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update provider status.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-700 flex transition-colors duration-300">
      <div className="flex-1 flex flex-col w-full">
        <main className="p-4 md:p-8 w-full max-w-[100vw] overflow-hidden">
          
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Providers</h1>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600/50 mb-6 flex flex-col md:flex-row flex-wrap gap-4 transition-colors">
            
            <div className="w-full md:flex-grow md:min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search providers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl 
                           bg-gray-50 dark:bg-gray-700 
                           text-gray-900 dark:text-white 
                           border-gray-200 dark:border-gray-600
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-48">
                <select
                  value={approvalStatus}
                  onChange={(e) => setApprovalStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl appearance-none cursor-pointer
                            bg-gray-50 dark:bg-gray-700 
                            text-gray-900 dark:text-white 
                            border-gray-200 dark:border-gray-600
                            focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                >
                  <option value="All">All Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              <div className="relative w-full sm:w-40">
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl appearance-none cursor-pointer
                            bg-gray-50 dark:bg-gray-700 
                            text-gray-900 dark:text-white 
                            border-gray-200 dark:border-gray-600
                            focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                >
                  <option value="All">All Ratings</option>
                  {ratingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600/50 overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    {['Photo', 'Name', 'Services Offered', 'Location', 'Status', 'Rating', 'Actions'].map((title) => (
                      <th
                        key={title}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {isLoading ? (
                    <>
                      {[...Array(PROVIDER_PER_PAGE)].map((_, i) => (
                        <TableRowSkeleton key={i} />
                      ))}
                    </>
                  ) : error ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-red-500 dark:text-red-400 text-lg">
                        {error}
                      </td>
                    </tr>
                  ) : providers.length > 0 ? (
                    providers.map((provider) => (
                      <tr key={provider.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={provider.profilePhoto ? getCloudinaryUrl(provider.profilePhoto): '/profileImage.png'}
                            alt={provider.fullName}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {provider.fullName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {provider.serviceOffered && provider.serviceOffered.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {provider.serviceOffered.slice(0, 2).map((service, index) => (
                                <span key={index} className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">{service}</span>
                                ))}
                                {provider.serviceOffered.length > 2 && (
                                <span className="text-xs text-gray-400">+{provider.serviceOffered.length - 2} more</span>
                                )}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-xs">No service listed</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {provider.serviceArea || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full border ${getStatusClasses(
                              provider.status ?? 'N/A'
                            )}`}
                          >
                            {provider.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center">
                            <span className="font-medium mr-1">{provider.rating ?? '--'}</span>
                            <span className="text-yellow-400">★</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <select
                              value={provider.status}
                              onChange={(e) => handleStatusChange(provider.id, e.target.value as ProviderStatus)}
                              className="text-xs px-2 py-1.5 border rounded-lg cursor-pointer
                                         bg-gray-50 dark:bg-gray-700 
                                         text-gray-900 dark:text-white 
                                         border-gray-200 dark:border-gray-600
                                         focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            >
                              {Object.values(ProviderStatus).map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                            
                            <button
                              onClick={() => navigate(`/admin/providers/${provider.id}`)}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center justify-center">
                          <Search className="w-8 h-8 mb-3 opacity-20" />
                          <p className="text-lg font-medium">No providers found</p>
                          <p className="text-sm">Try adjusting your filters or search query</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-4">
            {isLoading ? (
               <>
                 {[...Array(3)].map((_, i) => <MobileCardSkeleton key={i} />)}
               </>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : providers.length > 0 ? (
              providers.map((provider) => (
                <div key={provider.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-3">
                    <img
                      src={provider.profilePhoto ? getCloudinaryUrl(provider.profilePhoto) : '/profileImage.png'}
                      alt={provider.fullName}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                          <h3 className="font-bold text-gray-900 dark:text-white truncate">{provider.fullName}</h3>
                          <div className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                              <span>{provider.rating ?? '--'}</span>
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{provider.serviceArea || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 mb-2">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span className="font-medium">Services:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {provider.serviceOffered && provider.serviceOffered.length > 0 ? (
                            provider.serviceOffered.slice(0, 3).map((service, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[10px] rounded border border-blue-100 dark:border-blue-800">
                                    {service}
                                </span>
                            ))
                        ) : <span className="text-xs text-gray-400 italic">No services listed</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full border ${getStatusClasses(provider.status ?? 'N/A')}`}>
                      {provider.status}
                    </span>
                    
                    <div className="flex items-center gap-2">
                        <select
                            value={provider.status}
                            onChange={(e) => handleStatusChange(provider.id, e.target.value as ProviderStatus)}
                            className="text-xs px-2 py-1.5 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 outline-none"
                        >
                            {Object.values(ProviderStatus).map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            aria-label="View Details"
                            onClick={() => navigate(`/admin/providers/${provider.id}`)}
                            className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                No providers found.
              </div>
            )}
          </div>
            
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600/50 px-4 py-3 transition-colors">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-medium text-gray-900 dark:text-white">{(currentPage - 1) * PROVIDER_PER_PAGE + 1}</span> to <span className="font-medium text-gray-900 dark:text-white">{Math.min(currentPage * PROVIDER_PER_PAGE, totalProviders)}</span> of <span className="font-medium text-gray-900 dark:text-white">{totalProviders}</span> providers
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  total={totalProviders}
                  limit={PROVIDER_PER_PAGE}
                />
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default AdminProvidersPage;