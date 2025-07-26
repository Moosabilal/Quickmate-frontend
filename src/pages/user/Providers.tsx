import React, { useEffect, useState } from 'react';
import { IFeaturedProviders } from '../../types/provider';
import { providerService } from '../../services/providerService';
import { getCloudinaryUrl } from '../../util/cloudinary';
import Header from '../../components/user/Header';
import Pagination from '../../components/user/Pagination';
import Footer from '../../components/user/Footer';


const ProvidersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [providersData, setProvidersData] = useState<IFeaturedProviders[]>([])
    const [totalPages, setTotalPages] = useState(0);
    const [totalProviders, setTotalProviders] = useState(0)
  const providersPerPage = 2;


  useEffect(() => {
    const getProviders = async () => {
      try {
        const providers = await providerService.getFeaturedProviders({
          page: currentPage,
          limit: providersPerPage,
          search: searchTerm
        })
        setProvidersData(providers.providers)
        setTotalPages(providers.totalPages)
        setTotalProviders(providers.total)
      } catch (error) {
        console.error('Failed to fetch services:', error)
      }
    }
    getProviders()
  }, [currentPage, searchTerm])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };


  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
      < Header />

      <main className="flex-grow container mx-auto px-4 py-8 pt-28">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Find Your Perfect Service Provider</h1>

        {/* Search Bar - Enhanced */}
        <div className="mb-12 flex justify-center">
          <div className="relative w-full max-w-2xl shadow-lg rounded-full overflow-hidden focus-within:ring-4 focus-within:ring-blue-300 transition-all duration-300">
            <input
              type="text"
              placeholder="Search for a provider by name or service..."
              className="w-full py-4 pl-16 pr-6 text-lg rounded-full border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-300 placeholder-gray-500"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-l-4 border-blue-600 pl-4">Our Top Providers</h2>

        {providersData.length === 0 ? (
          <p className="text-center text-gray-600 text-xl py-10">No providers found matching your search. Please try a different query.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {providersData.map((provider) => (
              <div
                key={provider.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-200"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={getCloudinaryUrl(provider.profilePhoto)}
                    alt={provider.fullName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-lg font-semibold">{provider.serviceName}</span>
                  </div>
                </div>
                <div className="p-5 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{provider.fullName}</h3>
                  <p className="text-blue-600 font-medium text-lg">{provider.serviceName}</p>
                  <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300 text-base font-semibold shadow-md">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}  />
      </main>

      <Footer />
    </div>
  );
};

export default ProvidersPage;