import React, { useEffect, useState } from 'react';
import { providerService } from '../../services/providerService';
import Pagination from '../../components/admin/Pagination';
import { useNavigate } from 'react-router-dom';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { toast } from 'react-toastify';
import { ProviderList, ProviderStatus } from '../../interface/IProvider';






const users_per_page = 2


const AdminProvidersPage: React.FC = () => {
  const [providers, setProviders] = useState<ProviderList[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('All');
  const [verificationStatus, setVerificationStatus] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProviders, setTotalProviders] = useState(0);
  const [totalPages, setTotalPages] = useState(0)
  const [error, setError] = useState('')

  const navigate = useNavigate()


  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await providerService.getProvidersForAdmin({
          search: searchTerm || '',
          status: approvalStatus !== 'All' ? approvalStatus : undefined,
          verification: verificationStatus !== 'All' ? verificationStatus : undefined,
          rating: ratingFilter !== 'All' ? ratingFilter : undefined,
          page: currentPage,
          limit: users_per_page,
        });
        setProviders(response.data)
        setTotalProviders(response.total)
        setTotalPages(response.totalPages)
        setError('')

      } catch (error) {
        setError(error.response?.data.message)
        console.error('Error fetching data:', error);
      }
    };

    fetchProviders();
  }, [searchTerm, approvalStatus, verificationStatus, ratingFilter, currentPage]);


  const getStatusClasses = (status: ProviderList['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Rejected':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  console.log('the provideers ', providers)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">

      <div className="flex-1 flex flex-col">

        <main className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Providers</h1>
            {/* <button onClick={() =>navigate('/provider-registration')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create Provider
            </button> */}
          </div>

          {/* Search & Filters */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow px-4 py-2 border rounded-md w-60 
                         bg-gray-50 dark:bg-gray-700 
                         text-gray-900 dark:text-gray-200 
                         border-gray-300 dark:border-gray-600"
            />

            <select
              value={approvalStatus}
              onChange={(e) => setApprovalStatus(e.target.value)}
              className="px-4 py-2 border rounded-md 
                         bg-gray-50 dark:bg-gray-700 
                         text-gray-900 dark:text-gray-200 
                         border-gray-300 dark:border-gray-600"
            >
              <option value="All">Approval Status</option>
              <option value="Approved">Approved</option>
              <option value="Suspended">Suspended</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>

            </select>

            {/* <select
              value={verificationStatus}
              onChange={(e) => setVerificationStatus(e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="All">Verification</option>
              <option value="Verified">Verified</option>
              <option value="Unverified">Unverified</option>
            </select>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="All">Rating</option>
              <option value="4.5">4.5+</option>
              <option value="4.0">4.0+</option>
              <option value="3.0">3.0+</option>
            </select> */}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['Photo', 'Name', 'Services Offered', 'Location', 'Status', 'Rating', 'Actions'].map((title) => (
                    <th
                      key={title}
                      className="px-6 py-3 text-left text-sm font-medium 
                                 text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {providers.length > 0 && !error ? (
                  providers.map((provider) => (
                    <tr key={provider.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <img
                          src={getCloudinaryUrl(provider.profilePhoto)}
                          alt={provider.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {provider.fullName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {provider.serviceOffered && provider.serviceOffered.length > 0 ? (
                          <ul className="list-disc pl-5">
                            {provider.serviceOffered.map((service, index) => (
                              <li key={index}>{service}</li>
                            ))}
                          </ul>
                        ) : (
                          <span>No service offered</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{provider.serviceArea}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusClasses(
                            provider.status ?? 'N/A'
                          )}`}
                        >
                          {provider.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {provider.rating ?? '--'}
                        <span className="ml-1 text-yellow-500">⭐</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-between gap-4">
                          <select
                            value={provider.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value as ProviderStatus;
                              try {
                                const res = await providerService.updateProviderStatus(provider.id, newStatus);
                                setProviders((prev) =>
                                  prev.map((p) => (p.id === provider.id ? { ...p, status: newStatus } : p))
                                );
                                toast.success(res.message || 'Status Updated Successfully');
                              } catch (err) {
                                console.error('Failed to update status:', err);
                                toast.error('Failed to update provider status.');
                              }
                            }}
                            className="text-sm px-2 py-1 border rounded-md 
                                       bg-gray-50 dark:bg-gray-700 
                                       text-gray-900 dark:text-gray-200 
                                       border-gray-300 dark:border-gray-600"
                          >
                            <option value={provider.status} disabled>
                              {provider.status}
                            </option>
                            {Object.values(ProviderStatus)
                              .filter((status) => status !== provider.status)
                              .map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 text-lg">
                      No providers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {providers.length} of {totalProviders} users
                </div>
                <div className="flex items-center space-x-2">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminProvidersPage;
