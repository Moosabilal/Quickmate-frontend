import React, { useEffect, useState } from 'react';
import Header from '../../components/admin/Header';
import Sidebar from '../../components/admin/Sidebar';
import { providerService } from '../../services/providerService';
import { categoryService } from '../../services/categoryService';
import { ICategoryResponse } from '../../types/category';


interface Provider {
  id: string;
  photo: string;
  fullName: string;
  servicesOffered: string;
  location: string;
  status: 'Active' | 'InActive' | 'Suspended';
  rating: number;
}

const dummyProviders: Provider[] = [
  {
    id: '1',
    photo: 'https://via.placeholder.com/40',
    fullName: 'Sophia Carter',
    servicesOffered: 'Cleaning, Handyman',
    location: 'San Francisco, CA',
    status: 'Active',
    rating: 4.8,
  },
  {
    id: '2',
    photo: 'https://via.placeholder.com/40',
    fullName: 'Ethan Bennett',
    servicesOffered: 'Plumbing, Electrical',
    location: 'Los Angeles, CA',
    status: 'Active',
    rating: 4.5,
  },
  // Add more providers...
];

const AdminProvidersPage: React.FC = () => {
const [serviceOffered, setServiceOffered] = useState<{ _id: string; name: string }[]>([]);
const [providers, setProviders] = useState<any[]>([]);
const [categories, setCategories] = useState<ICategoryResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('All');
  const [verificationStatus, setVerificationStatus] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');

  useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await providerService.getProvidersForAdmin();
      console.log('this ithe responce', response)

      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  fetchUsers();
}, []);

// Match subcategory IDs after data is loaded
useEffect(() => {
  if (!providers.length || !categories.length) return;

  const matchedSubcategories: { _id: string; name: string }[] = [];

  providers.forEach((provider) => {
    categories.forEach((category) => {
      category.subCategories?.forEach((sub) => {
        if (sub._id === provider.serviceId) {
          matchedSubcategories.push({ _id: sub._id, name: sub.name });
        }
      });
    });
  });

  setServiceOffered(matchedSubcategories);
}, [providers, categories]);
  console.log('thisis the provider', providers)

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    // provider.servicesOffered.toLowerCase().includes(searchTerm.toLowerCase()) ||
    // provider.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesApproval = approvalStatus === 'All' || provider.status === approvalStatus;
    const matchesVerification = verificationStatus === 'All'; // For now
    const matchesRating = ratingFilter === 'All' || provider.rating >= parseFloat(ratingFilter);

    return matchesSearch && matchesApproval && matchesVerification && matchesRating;
  });

  console.log('this it he filtered providers', filteredProviders)

  const getStatusClasses = (status: Provider['status']) => {
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
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Providers</h1>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create Provider
            </button>
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
              <option value="InActive">InActive</option>
              <option value="Suspended">Suspended</option>
            </select>

            <select
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
            </select>
          </div>

          {/* Provider Table */}
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
                {filteredProviders.length > 0 ? (
                  filteredProviders.map((provider) => (
                    <tr key={provider.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <img src={provider.photo} alt={provider.fullName} className="w-10 h-10 rounded-full object-cover" />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{provider.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{provider.servicesOffered}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{provider.location}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusClasses(provider.status)}`}>
                          {provider.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {provider.rating}
                        <span className="ml-1 text-yellow-500">⭐</span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:underline text-sm">View</button>
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminProvidersPage;
