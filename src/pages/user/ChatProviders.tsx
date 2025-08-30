import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Star,
  MapPin,
  Clock,
  Search,
  Filter,
  Users,
  Badge,
  ChevronRight,
  Circle
} from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { IProviderForChatListPage } from '../../interface/IProvider';
import { providerService } from '../../services/providerService';



const ChatProvidersPage: React.FC = () => {
  const [providers, setProviders] = useState<IProviderForChatListPage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector(state => state.auth);


  useEffect(() => {
    const fetchProviders = async () => {

      setLoading(true);
      try {
        const response = await providerService.getProviderForChatPage()
        setProviders(response)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false);
      }

    };

    fetchProviders();
  }, []);

  const allServices = [...new Set(providers.flatMap(p => p.services))];


  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.services.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesService = !selectedService || provider.services.includes(selectedService);

    return matchesSearch && matchesService;
  });

  const handleStartChat = (bookingId: string, providerName: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    navigate(`/profile/chatListPage/live-chat`, {
      state: { bookingId, name: providerName }
    });
  };

  if (!isAuthenticated) {
    return (
      <>
        <main className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <MessageCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Sign In to Start Chatting
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Please sign in to connect with service providers and start chatting.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Sign In
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <main className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">

            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Chat with Providers
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                      Connect directly with service providers to discuss your needs
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      {filteredProviders.length} Providers Available
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search providers by name, service, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="pl-10 pr-8 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">All Services</option>
                      {allServices.map(service => (
                        <option key={service} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2 w-32"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded mb-2 w-24"></div>
                            <div className="flex space-x-2">
                              <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded-full w-20"></div>
                              <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded-full w-24"></div>
                            </div>
                          </div>
                        </div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-600 rounded-xl w-28"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          {/* Left side - Provider Info */}
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="relative flex-shrink-0">
                              <img
                                src={getCloudinaryUrl(provider.profilePicture)}
                                alt={provider.name}
                                className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover"
                              />
                              {provider.isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                  <Circle className="w-3 h-3 text-white fill-current" />
                                </div>
                              )}
                              
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                  {provider.name}
                                </h3>
                                {provider.isOnline && (
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                )}
                                {provider.lastMessageAt && (
                                  <span className="text-xs text-gray-600 dark:text-gray-500">
                                    • Last seen {new Date(provider.lastMessageAt).toLocaleString()}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center space-x-1 mb-2">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                  {provider.location}
                                    <span
                                      className="ml-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full"
                                    >
                                      {provider.services}
                                    </span>
                                </span>
                              </div>

                              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                {provider.lastMessage && (
                                  <div className="flex items-center space-x-1">
                                    <Badge className="w-4 h-4" />
                                    <span className="truncate max-w-xs">
                                      {provider.lastMessage}
                                    </span>
                                  </div>
                                )}
                                
                                </div>
                            </div>
                          </div>

                          <div className="flex-shrink-0 ml-6">
                            <button
                              onClick={() => handleStartChat(provider.bookingId!, provider.name)}
                              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>Start Chat</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && filteredProviders.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Providers Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Try adjusting your search terms or filters to find more providers.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedService('');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ChatProvidersPage;