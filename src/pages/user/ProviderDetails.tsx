import React, { useState, useEffect } from 'react';
import { Star, MapPin, Clock, Calendar, Award, CheckCircle, Briefcase, Loader2, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { providerService } from '../../services/providerService';
import { IProviderProfile, DaySchedule, IServiceDetails } from '../../util/interface/IProvider';
import { isAxiosError } from 'axios';
import { getCloudinaryUrl } from '../../util/cloudinary';

const ProviderDetailsPage: React.FC = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();

  const [provider, setProvider] = useState<IProviderProfile | null>(null);
  const [services, setServices] = useState<IServiceDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  useEffect(() => {
    if (!providerId) {
      setLoading(false);
      setError("No provider ID specified.");
      return;
    }

    const fetchProviderData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await providerService.getProviderDetails(providerId);
        
        if (response.success) {
          setProvider(response.data.provider);
          setServices(response.data.services);
        } else {
          throw new Error("Failed to fetch provider data.");
        }
      } catch (err) {
        let errorMessage = "Failed to load provider details.";
        if (isAxiosError(err) && err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, [providerId]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={18}
            className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
          />
        ))}
        <span className="ml-2 text-lg font-semibold text-white/90">{rating.toFixed(1)}</span>
      </div>
    );
  };
  
  const renderSchedule = (schedule: DaySchedule[]) => {
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const sortedSchedule = [...schedule].sort((a, b) => {
        if (a.active && !b.active) return -1;
        if (!a.active && b.active) return 1;
        return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
    });

    return sortedSchedule.map((day) => (
      <div
        key={day.day}
        className={`flex justify-between items-center p-3 rounded-xl transition-colors ${
          day.active 
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30' 
          : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700'
        }`}
      >
        <span className={`font-medium text-sm ${day.active ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
          {day.day}
        </span>
        {day.active && day.slots.length > 0 ? (
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-green-600 dark:text-green-400" />
            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
              {day.slots.map(s => `${s.start} - ${s.end}`).join(', ')}
            </span>
          </div>
        ) : (
          <span className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 font-medium italic">Closed</span>
        )}
      </div>
    ));
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{error || "Provider not found"}</h2>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pb-12">
      
      {/* Header Profile Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-900 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-xl relative">
        <button 
            onClick={() => navigate(-1)}
            className="absolute top-6 left-4 sm:left-8 text-white/80 hover:text-white transition-colors flex items-center gap-1 group"
        >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        <div className="max-w-7xl mx-auto mt-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative shrink-0">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl bg-white/10 backdrop-blur-sm">
                <img
                  src={getCloudinaryUrl(provider.profilePhoto)}
                  alt={provider.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              {provider.isVerified && (
                <div className="absolute bottom-1 right-1 bg-green-500 rounded-full p-2 border-4 border-indigo-700 dark:border-indigo-900 shadow-sm" title="Verified Provider">
                  <CheckCircle size={20} className="text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-3 mb-3">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{provider.fullName}</h1>
                {provider.isVerified && (
                  <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border border-white/10 mb-1.5">
                    Verified Pro
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-3 gap-x-6 text-blue-100">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  {renderStars(provider.rating || 0)}
                  <span className="text-sm opacity-80 border-l border-white/20 pl-2 ml-1">{provider.totalBookings} bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  <span className="text-base font-medium">{provider.serviceArea}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Schedule */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Calendar className="text-green-600 dark:text-green-400" size={24} />
                Weekly Availability
              </h2>
              <div className="space-y-3">
                {renderSchedule(provider?.availability?.weeklySchedule || [])}
              </div>
            </div>
          </div>

          {/* Right Column: Services */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Briefcase className="text-blue-600 dark:text-blue-400" size={28} />
                Available Services
              </h2>
              
              {services.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No services listed yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {services.map((service) => (
                    <div
                      key={service._id}
                      className={`relative rounded-2xl p-5 border-2 transition-all duration-300 cursor-pointer group hover:shadow-xl ${
                        selectedService === service._id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500'
                          : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-200 dark:hover:border-blue-700'
                      }`}
                      onClick={() => setSelectedService(service._id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white pr-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {service.title}
                        </h3>
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow-sm shrink-0">
                          ₹{service.price}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 min-h-[2.5em]">
                        {service.description}
                      </p>
                      
                      <div className="space-y-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock size={16} className="text-blue-500 dark:text-blue-400" />
                          <span>Duration: <span className="font-medium text-gray-900 dark:text-gray-200">{service.duration}</span></span>
                        </div>
                        {service.experience && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Award size={16} className="text-purple-500 dark:text-purple-400" />
                            <span>Experience: <span className="font-medium text-gray-900 dark:text-gray-200">{service.experience} years</span></span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-md text-xs font-medium border border-blue-100 dark:border-blue-800">
                            {service.categoryId.name}
                          </span>
                          <span className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2.5 py-0.5 rounded-md text-xs font-medium border border-purple-100 dark:border-purple-800">
                            {service.subCategoryId.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetailsPage;