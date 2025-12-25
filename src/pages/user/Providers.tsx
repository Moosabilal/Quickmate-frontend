import React, { useEffect, useState } from 'react';
import { IFeaturedProviders } from '../../util/interface/IProvider';
import { providerService } from '../../services/providerService';
import Pagination from '../../components/user/Pagination';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { Search, Star, User } from 'lucide-react';

const ProvidersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [providersData, setProvidersData] = useState<IFeaturedProviders[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProviders, setTotalProviders] = useState(0);
  const providersPerPage = 8;
  const navigate = useNavigate();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const getProviders = async () => {
      try {
        const providers = await providerService.getFeaturedProviders({
          page: currentPage,
          limit: providersPerPage,
          search: debouncedSearchTerm,
        });
        setProvidersData(providers.providers);
        setTotalPages(providers.totalPages);
        setTotalProviders(providers.total);
      } catch (error) {
        console.error('Failed to fetch providers:', error);
      }
    };
    getProviders();
  }, [currentPage, debouncedSearchTerm, providersPerPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-500 dark:selection:text-white transition-colors duration-300">
      
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 pb-12 pt-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30 dark:opacity-20" />
         
        <div className="max-w-4xl mx-auto text-center relative z-10">
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tight mb-6 transition-colors duration-300">
            Find Your Perfect <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Service Provider
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
            Browse our network of verified experts ready to help you with your next project.
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8">

        <div className="max-w-2xl mx-auto mb-16 relative z-20">
          <div className="relative group">
             <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur opacity-20 group-hover:opacity-30 transition-opacity duration-500 dark:opacity-40 dark:group-hover:opacity-50"></div>
             <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-full shadow-xl shadow-blue-100/50 dark:shadow-none border border-slate-200 dark:border-slate-700 p-2 transition-all focus-within:border-blue-300 dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 dark:focus-within:ring-blue-500/20">
              <div className="pl-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                placeholder="Search by name (e.g., John Doe)..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full py-3 px-4 text-lg bg-transparent border-none outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
             </div>
          </div>
           <div className="text-center mt-4">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Found {totalProviders} {totalProviders === 1 ? 'professional' : 'professionals'}
            </span>
          </div>
        </div>

        {providersData.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8 mb-16">
            {providersData.map((provider) => (
              <div
                key={provider.id}
                className="group bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-2 sm:p-4 shadow-sm hover:shadow-2xl hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20 border border-slate-100 dark:border-slate-700 transition-all duration-500 flex flex-col h-full hover:-translate-y-1"
              >
                <div className="relative aspect-[4/4] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 mb-3 sm:mb-5">
                  <img
                    src={provider.profilePhoto}
                    alt={provider.fullName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-sm border border-white/50 dark:border-slate-700/50">
                    <p className="text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide truncate max-w-[80px] sm:max-w-none">
                        {provider.serviceName || "Service"}
                    </p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col px-1 sm:px-2 pb-1 sm:pb-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-1 sm:gap-0">
                      <h3 className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {provider.fullName}
                      </h3>
                      <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg border border-amber-100 dark:border-amber-800/30 self-start sm:self-auto">
                          <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-[10px] sm:text-xs font-bold text-amber-700 dark:text-amber-400">{provider.rating || 'New'}</span>
                      </div>
                  </div>

                  <div className="mt-auto pt-2 sm:pt-4">
                    <button
                        onClick={() => navigate(`/providers/${provider.id}`)}
                        className="w-full py-2 sm:py-3 px-2 sm:px-4 bg-slate-900 dark:bg-slate-700 text-white font-medium rounded-lg sm:rounded-xl hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors duration-300 shadow-lg shadow-slate-200 dark:shadow-slate-900/50 hover:shadow-blue-200 dark:hover:shadow-blue-900/30 flex items-center justify-center gap-1 sm:gap-2 group/btn text-xs sm:text-base"
                    >
                        <span className="hidden sm:inline">View Profile</span>
                        <span className="sm:hidden">View</span> 
                        <User className="w-3 h-3 sm:w-4 sm:h-4 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 animate-bounce-slow border border-slate-100 dark:border-slate-700">
              <Search className="w-10 h-10 text-slate-300 dark:text-slate-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Providers Found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
              We couldn't find anyone matching "{searchTerm}". Try checking for typos or use simpler keywords.
            </p>
            <button 
                onClick={() => setSearchTerm('')}
                className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
                Clear Filters
            </button>
          </div>
        )}

        <div className="flex justify-center pb-12">
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
      </main>
    </div>
  );
};

export default ProvidersPage;