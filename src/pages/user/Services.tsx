import React, { useEffect, useState } from 'react';
import Pagination from '../../components/user/Pagination';
import { categoryService } from '../../services/categoryService';
import { IserviceResponse } from '../../util/interface/ICategory';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { useNavigate } from 'react-router-dom';

const ServicesPage: React.FC = () => {
  const servicesPerPage = 10;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans">
      <main className="container mx-auto px-4 py-12 pt-20">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-3 tracking-tight leading-snug">
            Our Service Categories
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto px-2">
            Discover amazing services tailored just for you
          </p>
        </div>


        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
            <span className="text-slate-700 font-medium text-lg">Featured Services</span>
            <span className="text-sm text-slate-500 bg-white/60 px-2 py-1 rounded-full">
              {totalServices} found
            </span>
          </div>

          <div className="relative w-full sm:w-64 md:w-72">
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full py-2 pl-9 pr-3 text-sm rounded-lg border border-slate-200 
                 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 
                 focus:ring-blue-400 focus:border-transparent transition-all 
                 duration-300 placeholder-slate-400 shadow-sm hover:shadow-md"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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


        {allServices.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
            {allServices.map((service) => (
              <div
                key={service.id}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden border border-white/20 hover:border-blue-200"
              >
                <div className="relative h-28 w-full overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
                  <img
                    src={getCloudinaryUrl(service.iconUrl || '')}
                    alt={service.name}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="p-3 text-center">
                  <h3 className="text-sm font-semibold text-slate-800 mb-2 truncate leading-tight">
                    {service.name}
                  </h3>
                  <button
                    onClick={() => navigate(`/service-detailsPage/${service.id}`)}
                    className="w-full py-1.5 px-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 text-xs font-medium shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.007-5.824-2.562M15 6.306A7.962 7.962 0 0112 9c-2.34 0-4.291-1.007-5.824-2.562"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Services Found</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              We couldn't find any services matching your search. Try different keywords.
            </p>
          </div>
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