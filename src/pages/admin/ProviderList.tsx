import React, { useEffect, useState } from 'react';
import { providerService } from '../../services/providerService';
import Pagination from '../../components/admin/Pagination';
import { useNavigate } from 'react-router-dom';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { toast } from 'react-toastify';

export enum ProviderStatus {
  Active = 'Active',
  InActive = 'InActive',
  Suspended = 'Suspended',
  Pending = 'pending',
}

interface ProviderList {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  serviceId: string;
  serviceArea: string;
  profilePhoto: string;
  servicesOffered: string;
  status: ProviderStatus;
  rating?: number;
}

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
    const fetchUsers = async () => {
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

    fetchUsers();
  }, [searchTerm, approvalStatus, verificationStatus, ratingFilter, currentPage]);


  const getStatusClasses = (status: ProviderList['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'InActive':
        return 'bg-yellow-100 text-yellow-800';
      case 'Suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">

      <div className="flex-1 flex flex-col">

        <main className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Providers</h1>
            {/* <button onClick={() =>navigate('/provider-registration')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create Provider
            </button> */}
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow px-4 py-2 border rounded-md w-60"
            />

            <select
              value={approvalStatus}
              onChange={(e) => setApprovalStatus(e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="All">Approval Status</option>
              <option value="Active">Active</option>
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

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Photo', 'Name', 'Services Offered', 'Location', 'Status', 'Rating', 'Actions'].map((title) => (
                    <th key={title} className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {providers.length > 0 && !error ? (
                  providers.map((provider) => (
                    <tr key={provider.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <img src={getCloudinaryUrl(provider.profilePhoto)} alt={provider.fullName} className="w-10 h-10 rounded-full object-cover" />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{provider.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{provider.servicesOffered}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{provider.serviceArea}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusClasses(provider.status ?? 'N/A')}`}>
                          {provider.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {provider.rating ?? "--"}
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
                                  prev.map((p) =>
                                    p.id === provider.id ? { ...p, status: newStatus } : p
                                  )
                                );
                                toast.success(res.message || "Status Updated Successfully");
                              } catch (err) {
                                console.error('Failed to update status:', err);
                                toast.error('Failed to update provider status.');
                              }
                            }}
                            className="text-sm px-2 py-1 border rounded-md text-gray-700"
                          >
                            <option value={provider.status} disabled>
                              {provider.status}
                            </option>

                            {/* Other statuses (excluding the current one) */}
                            {Object.values(ProviderStatus)
                              .filter((status) => status !== provider.status)
                              .map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                          </select>


                          <button
                            onClick={() => navigate(`/admin/providers/${provider.id}`)}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-lg">
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
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
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
