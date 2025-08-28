import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { ICategoryResponse } from '../../interface/ICategory';
import { getCloudinaryUrl } from '../../util/cloudinary';

interface Service {
  id: string;
  name: string;
  price: number;
  priceUnit: string; 
  description: string;
  imageUrl: string;
}

const IMAGES = {
  floorCleaning: '/images/floor-cleaning.png',
  deepCleaning: '/images/deep-cleaning.png',
  moveOutCleaning: '/images/move-out-cleaning.png',
  objectCleaning: '/images/object-cleaning.png',
};

const Booking_servicePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState<ICategoryResponse[]>()
  const [categoryName, setCategoryName] = useState<string>('')

  const navigate = useNavigate()

  const { categoryId } = useParams<{categoryId?: string}>()

  useEffect(() => {
    const fetchServices = async () => {
        const response = await categoryService.getCategoryById(categoryId || '')
        setServices(response.subCategories)
        setCategoryName(response.name)
    }
    fetchServices()
  },[categoryId])

  const filteredServices = (services ?? []).filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.description ?? '' ).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">

      <main className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
          {categoryName}
        </h1>
        <p className="text-md sm:text-lg text-gray-600 mb-8">
          Find top-rated services in your area for {categoryName}.
        </p>

        <div className="mb-10 max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
              placeholder="Search for services"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
            Popular Cleaning Services
          </h2>
          <div className="grid grid-cols-1 gap-6 md:gap-8">
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <div key={service._id} className="relative flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 group border border-gray-100">
                  <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-md overflow-hidden mr-4 sm:mr-6">
                    <img
                      src={getCloudinaryUrl(service.iconUrl)}
                      alt={service.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
                      {service.name}
                    </h3>
                    {/* <p className="text-sm sm:text-base text-gray-600 mb-2">
                      <span className="font-bold text-indigo-600">Starting at ${service.price}</span>{service.priceUnit}
                    </p> */}
                    <p className="text-sm text-gray-500 line-clamp-2 sm:line-clamp-3">
                      {service.description}
                    </p>
                  </div>

                  <div className="flex-shrink-0 ml-4 sm:ml-6">
                    <button onClick={()=>navigate(`/service-detailsPage/${service._id}`)}
                     className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 text-sm sm:text-base">
                      View Details & Book
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-lg text-center">No services found matching your search.</p>
            )}
          </div>
        </section>

      </main>

    </div>
  );
};

export default Booking_servicePage;