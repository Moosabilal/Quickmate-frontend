import React, { useEffect, useState } from 'react';
import Pagination from '../../components/user/Pagination';
import { categoryService } from '../../services/categoryService';
import { IserviceResponse } from '../../util/interface/ICategory';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { Search, ArrowUpRight, Frown } from 'lucide-react';

const ServicesPage: React.FC = () => {
  const servicesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [allServices, setAllServices] = useState<IserviceResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const navigate = useNavigate();

  useEffect(() => {
    const getServices = async () => {
      try {
        const response = await categoryService.getAllSubCategories({
          page: currentPage,
          limit: servicesPerPage,
          search: debouncedSearchTerm,
        });
        setAllServices(response.allServices);
        setTotalPages(response.totalPages);
        setTotalServices(response.total);
      } catch (error) {
        console.error('Failed to fetch services:', error);
      }
    };
    getServices();
  }, [currentPage, debouncedSearchTerm, servicesPerPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-500 dark:selection:text-white transition-colors duration-300">
      
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/80 to-transparent dark:from-indigo-950/30" />
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-[10%] left-[-5%] w-72 h-72 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <main className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        
        <div className="max-w-3xl mx-auto text-center mb-16">
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tight mb-6 transition-colors duration-300">
            What can we help you <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              solve today?
            </span>
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed transition-colors duration-300">
            Browse our curated list of professional services. From quick fixes to major projects, we've got the experts you need.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-20 relative z-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full blur opacity-20 group-hover:opacity-30 transition-opacity duration-500 dark:opacity-40 dark:group-hover:opacity-50"></div>
            <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-full shadow-xl shadow-indigo-100/50 dark:shadow-none border border-slate-100 dark:border-slate-700 p-2 transition-all focus-within:border-indigo-300 dark:focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-500/20">
              <div className="pl-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                placeholder="Search for 'Plumbing', 'Cleaning'..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full py-3 px-4 text-lg bg-transparent border-none outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mr-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <span className="sr-only">Clear</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="absolute -bottom-10 left-0 w-full text-center">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors duration-300">
              Found {totalServices} {totalServices === 1 ? 'service' : 'services'}
            </span>
          </div>
        </div>

        {allServices.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-16">
            {allServices.map((service) => (
              <div
                key={service.id}
                onClick={() => navigate(`/service-detailsPage/${service.id}`)}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20 border border-slate-100 dark:border-slate-700 transition-all duration-500 cursor-pointer hover:-translate-y-1 flex flex-col h-full"
              >
                <div className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 mb-3 sm:mb-4">
                  <img
                    src={service.iconUrl || ''}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>

                <div className="px-1 sm:px-2 pb-1 sm:pb-2 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-2 sm:gap-4">
                    <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {service.name}
                    </h3>
                    
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shrink-0">
                      <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:rotate-45 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center py-20 px-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-lg">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
              <Frown className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Services Found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              We couldn't find any services matching "{searchTerm}". <br />
              Try checking for typos or use simpler keywords.
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-8 py-3 bg-slate-900 dark:bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors shadow-lg shadow-slate-200 dark:shadow-slate-900/50"
            >
              Clear Filters
            </button>
          </div>
        )}

        <div className="flex justify-center">
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

export default ServicesPage;