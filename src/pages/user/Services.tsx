import React, { useEffect, useState } from 'react';
import Header from '../../components/user/Header';
import Pagination from '../../components/user/Pagination';
import { categoryService } from '../../services/categoryService';
import { IserviceResponse } from '../../types/category';
import { getCloudinaryUrl } from '../../util/cloudinary';


const ServicesPage: React.FC = () => {
  const servicesPerPage = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const [allServices, setAllServices] = useState<IserviceResponse[]>([])
  const [totalPages, setTotalPages] = useState(0);
  const [totalServices, setTotalServices] = useState(0)
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    const getServices = async () => {
      try {
        const response = await categoryService.getAllSubCategories({
          page: currentPage,
          limit: servicesPerPage,
          search: searchTerm
        })
        console.log('servicex', response)
        setAllServices(response.allServices)
        setTotalPages(response.totalPages)
        setTotalServices(response.total)
      } catch (error) {
        console.error('Failed to fetch services:', error)
      }
    }
    getServices()
  }, [currentPage, searchTerm])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="mb-8 mt-12 relative shadow-sm rounded-lg overflow-hidden max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search for services..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-4 pl-12 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out"
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b-2 border-blue-300 pb-2">Featured Services</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          {allServices.length > 0 ? (
            allServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <img
                  className="w-full h-36 object-cover object-center"
                  src={getCloudinaryUrl(service.iconUrl || '')}
                  alt={service.name}
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{service.name}</h3>
                  {/* <div className="flex items-center mb-2">
                  <span className="text-sm text-gray-600">
                    {service.rating} ({service.reviews} reviews)
                  </span>
                </div>
                <p className="text-gray-700 text-md font-bold"> 
                  Starting at <span className="text-blue-600">${service.price}</span>
                </p> */}
                </div>
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center py-12 ml-0">
              <p className="text-xl text-gray-700 font-medium">No services available</p>
            </div>
          )}
        </div>

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