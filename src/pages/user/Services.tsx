import React, { useEffect, useState } from 'react';
import Pagination from '../../components/user/Pagination';
import { categoryService } from '../../services/categoryService';
import { IserviceResponse } from '../../types/category';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { useNavigate } from 'react-router-dom';

const ServicesPage: React.FC = () => {
  const servicesPerPage = 2;
  const [currentPage, setCurrentPage] = useState(1);
  const [allServices, setAllServices] = useState<IserviceResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate()

  useEffect(() => {
    const getServices = async () => {
      try {
        const response = await categoryService.getAllSubCategories({
          page: currentPage,
          limit: servicesPerPage,
          search: searchTerm,
        });
        setAllServices(response.allServices);
        setTotalPages(response.totalPages);
        setTotalServices(response.total);
      } catch (error) {
        console.error('Failed to fetch services:', error);
      }
    };
    getServices();
  }, [currentPage, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">

      <main className="container mx-auto px-4 py-16 pt-28">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
          Discover Our Service Categories
        </h1>

        {/* Styled Search Bar */}
        <div className="mb-12 flex justify-center">
          <div className="relative w-full max-w-2xl shadow-lg rounded-full overflow-hidden focus-within:ring-4 focus-within:ring-blue-300 transition-all duration-300">
            <input
              type="text"
              placeholder="Search for services..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full py-4 pl-16 pr-6 text-lg rounded-full border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-300 placeholder-gray-500"
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-l-4 border-blue-600 pl-4">
          Featured Services
        </h2>

        {allServices.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
            {allServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-200"
              >
                <div className="relative h-36 w-full overflow-hidden">
                  <img
                    src={getCloudinaryUrl(service.iconUrl || '')}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <span className="text-white text-sm sm:text-base font-semibold">{service.name}</span>
                  </div>
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                    {service.name}
                  </h3>
                  <button
                  onClick={() => navigate(`/service-detailsPage/${service.id}`)}
                   className="mt-2 px-4 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300 text-sm font-medium shadow">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 text-xl py-10">
            No services found matching your search.
          </p>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>
    </div>
  );
};

export default ServicesPage;
