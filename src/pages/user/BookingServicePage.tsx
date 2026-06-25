import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { ICategoryFormCombinedData } from '../../util/interface/ICategory';
import { toast } from 'react-toastify';
import { Search, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { useDebounce } from '../../hooks/useDebounce';
import { motion, Variants } from 'framer-motion';

const Booking_servicePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState<ICategoryFormCombinedData[]>();
  const [categoryName, setCategoryName] = useState<string>('');
  const [loading, setLoading] = useState(true);

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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-transparent font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <main className="container mx-auto px-4 py-24 sm:px-6 lg:px-8 max-w-6xl">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16 sm:mb-20"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">{categoryName || 'Services'}</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Find top-rated professionals and book the best services tailored for {categoryName ? categoryName.toLowerCase() : 'your needs'} in your area.
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16 max-w-2xl mx-auto"
        >
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="block w-full pl-16 pr-6 py-5 border border-white/60 dark:border-gray-700/50 rounded-full bg-white/70 dark:bg-gray-800/80 backdrop-blur-xl text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 text-lg"
              placeholder={`Search in ${categoryName}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Content Section */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-between mb-10 pl-2"
          >
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
              Available Options
            </h2>
            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 px-4 py-1.5 rounded-full shadow-sm">
              {filteredServices.length} {filteredServices.length === 1 ? 'Result' : 'Results'}
            </span>
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-14 h-14 text-indigo-600 animate-spin mb-6" />
              <p className="text-lg text-slate-500 dark:text-gray-400 font-medium">Curating the best services for you...</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6"
            >
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <motion.div
                    key={service.id}
                    variants={itemVariants}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="relative flex flex-col sm:flex-row items-start sm:items-center p-6 bg-white dark:bg-gray-800/90 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:shadow-none border border-white/60 dark:border-white/10 transition-all duration-300 group overflow-hidden"
                  >
                    {/* Image Container */}
                    <div className="flex-shrink-0 w-full sm:w-40 h-56 sm:h-40 rounded-2xl overflow-hidden mb-6 sm:mb-0 sm:mr-8 bg-gray-100 dark:bg-gray-700 relative shadow-inner">
                      {service.iconUrl ? (
                        <img
                          src={getCloudinaryUrl(service.iconUrl)}
                          alt={service.name}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <Search className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-xs font-medium">No Image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Text Content */}
                    <div className="flex-grow min-w-0 w-full sm:w-auto">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                        <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">
                          {service.name}
                        </h3>
                      </div>

                      <p className="text-base sm:text-lg text-slate-500 dark:text-gray-300 line-clamp-2 sm:line-clamp-3 mb-6 leading-relaxed max-w-2xl">
                        {service.description || 'No description available for this service. Explore to find out more details.'}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0 sm:ml-8 flex flex-col justify-center h-full">
                      <button
                        onClick={() => navigate(`/service-detailsPage/${service.id}`)}
                        className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-slate-900 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold rounded-full focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all duration-300 transform active:scale-95 shadow-[0_8px_20px_rgb(0,0,0,0.15)] hover:shadow-[0_10px_25px_rgb(79,70,229,0.35)]"
                      >
                        Book Now
                        <ArrowRight className="ml-3 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-24 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <div className="mx-auto w-20 h-20 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <Search className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No services found</h3>
                  <p className="text-lg text-slate-500 dark:text-gray-400">We couldn't find anything matching your search. Try adjusting the terms.</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Booking_servicePage;