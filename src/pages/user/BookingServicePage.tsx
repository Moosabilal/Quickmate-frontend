import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { ICategoryFormCombinedData } from '../../util/interface/ICategory';
import { toast } from 'react-toastify';
import { Search, ArrowRight, Loader2 } from 'lucide-react';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { useDebounce } from '../../hooks/useDebounce';

const Booking_servicePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState<ICategoryFormCombinedData[]>();
  const [categoryName, setCategoryName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Debounce the search term to avoid filtering on every keystroke
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId?: string }>();

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await categoryService.getCategoryById(categoryId || '');
        if (!response) {
          toast.error('Failed to fetch services for the selected category.');
          return;
        }

        setServices(response.subCategories);
        setCategoryName(response.categoryDetails.name);
      } catch (error) {
        console.error(error);
        toast.error('An error occurred while loading services.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [categoryId]);

  const filteredServices = (services ?? []).filter((service) =>
    service.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    (service.description ?? '').toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <main className="container mx-auto px-4 py-24 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            {categoryName || 'Services'}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find top-rated professionals and book the best services for {categoryName ? categoryName.toLowerCase() : 'your needs'} in your area.
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-12 max-w-xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="block w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-300 sm:text-base"
              placeholder={`Search in ${categoryName}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Popular Services
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {filteredServices.length} {filteredServices.length === 1 ? 'Result' : 'Results'}
            </span>
          </div>

          {loading ? (
             <div className="flex flex-col items-center justify-center py-20">
               <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
               <p className="text-gray-500 dark:text-gray-400">Loading services...</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className="relative flex flex-col sm:flex-row items-start sm:items-center p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900 transition-all duration-300 group overflow-hidden"
                  >
                    {/* Image Container */}
                    <div className="flex-shrink-0 w-full sm:w-32 h-48 sm:h-32 rounded-xl overflow-hidden mb-4 sm:mb-0 sm:mr-6 bg-gray-100 dark:bg-gray-700 relative">
                      {service.iconUrl ? (
                        <img
                          src={getCloudinaryUrl(service.iconUrl)}
                          alt={service.name}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                           <span className="text-xs">No Image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                    </div>

                    {/* Text Content */}
                    <div className="flex-grow min-w-0 w-full sm:w-auto">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                         <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1 sm:mb-0">
                           {service.name}
                         </h3>
                      </div>
                      
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 line-clamp-2 sm:line-clamp-2 mb-4 leading-relaxed">
                        {service.description || 'No description available for this service.'}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0 sm:ml-6">
                      <button
                        onClick={() => navigate(`/service-detailsPage/${service.id}`)}
                        className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 transform active:scale-95 shadow-lg shadow-indigo-500/30"
                      >
                        Book Now
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                  <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">No services found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search terms.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Booking_servicePage;