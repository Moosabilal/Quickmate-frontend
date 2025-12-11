import React, { useState, useEffect } from 'react';
import { Star, MapPin, Clock, Calendar, Award, CheckCircle, Briefcase } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { providerService } from '../../services/providerService';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { IProviderProfile, DaySchedule, IServiceDetails } from '../../util/interface/IProvider';
import { isAxiosError } from 'axios';


const ProviderDetailsPage: React.FC = () => {
  const { providerId } = useParams<{ providerId: string }>();

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
            size={20}
            className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
        <span className="ml-2 text-lg font-semibold text-gray-700">{rating.toFixed(1)}</span>
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
        className={`flex justify-between items-center p-3 rounded-lg ${
          day.active ? 'bg-green-50' : 'bg-gray-50'
        }`}
      >
        <span className={`font-medium ${day.active ? 'text-gray-800' : 'text-gray-400'}`}>
          {day.day}
        </span>
        {day.active && day.slots.length > 0 ? (
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-green-600" />
            <span className="text-sm text-gray-600">
              {day.slots.map(s => `${s.start} - ${s.end}`).join(', ')}
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Closed</span>
        )}
      </div>
    ));
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">{error || "Provider not found"}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 px-4 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                <img
                  src={getCloudinaryUrl(provider.profilePhoto)}
                  alt={provider.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              {provider.isVerified && (
                <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-2 border-4 border-white">
                  <CheckCircle size={24} />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-4xl font-bold">{provider.fullName}</h1>
                {provider.isVerified && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Verified
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-4">
                <div className="flex items-center gap-2">
                  {renderStars(provider.rating || 0)}
                  <span className="text-sm opacity-90">({provider.totalBookings} bookings)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={20} />
                  <span className="text-sm">{provider.serviceArea}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="text-green-600" size={24} />
                Weekly Schedule
              </h2>
              <div className="space-y-2">
                {renderSchedule(provider?.availability?.weeklySchedule || [])}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Briefcase className="text-blue-600" size={28} />
                Available Services
              </h2>
              
              {services.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No services available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {services.map((service) => (
                    <div
                      key={service._id}
                      className={`border-2 rounded-xl p-6 transition-all duration-300 cursor-pointer hover:shadow-xl transform hover:scale-105 ${
                        selectedService === service._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedService(service._id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-800">{service.title}</h3>
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full font-bold text-lg">
                          ₹{service.price}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {service.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={16} className="text-blue-500" />
                          <span>Duration: {service.duration}</span>
                        </div>
                        {service.experience && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Award size={16} className="text-purple-500" />
                            <span>{service.experience} years experience</span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                            {service.categoryId.name}
                          </span>
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
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