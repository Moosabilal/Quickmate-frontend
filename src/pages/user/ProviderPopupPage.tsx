import { Award, Star, X, MapPin, Phone, Mail, Calendar, Filter, IndianRupee } from 'lucide-react';
import { DaySchedule, IBackendProvider, ProviderPopupProps } from '../../util/interface/IProvider';
import React, { useCallback, useEffect, useState } from 'react';
import { providerService } from '../../services/providerService';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { toast } from 'react-toastify';
import { FilterParams } from '../../util/interface/IProvider';


const WeeklyScheduleDisplay: React.FC<{ schedule: DaySchedule[] }> = ({ schedule }) => {
  const activeDays = schedule.filter(day => day.active && day.slots.length > 0);

  if (activeDays.length === 0) {
    return <span className="text-gray-600">No weekly schedule set.</span>;
  }

  return (
    <>
      {activeDays.map((day, index) => (
        <span key={index} className="block text-gray-600">
          {day.day}: {day.slots.map(slot => `${slot.start} - ${slot.end}`).join(', ')}
        </span>
      ))}
    </>
  );
};



const ProviderPopup = ({
  setSelectedProvider,
  providerPopup,
  selectedProvider,
  setProviderPopup,
  serviceId,
  selectedDate,
  selectedTime,
  latitude,
  longitude,
  radiusKm
}: ProviderPopupProps) => {

  console.log('the dat', 
    providerPopup,
    selectedProvider,
    serviceId,
    selectedDate,
    selectedTime,
    latitude,
    longitude,
    radiusKm)

  console.log('the selected time', selectedTime)
  useEffect(() => {
  console.log("Updated coordinates in popup:", latitude, longitude);
}, [latitude, longitude]);

  const initialFilters: FilterParams = {
    experience: 0,
    price: 0,
    radius: radiusKm || 10,
    latitude: latitude || 0,
    longitude: longitude || 0,
    date: selectedDate || null,
    time: selectedTime || null
  };

  const [allProviders, setAllProviders] = useState<IBackendProvider[]>([]);
  const [filters, setFilters] = useState<FilterParams>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterParams>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  const getProvider = useCallback(async (filterParams: FilterParams) => {
      try {
        const filteredParams: Partial<FilterParams> = Object.fromEntries(
          Object.entries(filterParams).filter(
            ([, value]) =>
              value !== null &&
              value !== undefined &&
              value !== "" &&
              value !== 0 &&
              !(typeof value === "number" && isNaN(value))
          )
        );

        const providers = await providerService.getserviceProvider(serviceId, filteredParams);

        setAllProviders(providers);
      } catch (error: any) {
        console.error("Error fetching providers:", error);
        toast.error(error?.response?.data?.message || "Failed to fetch providers");
      }
    }, [serviceId]);

  useEffect(() => {
    if (serviceId) {
      getProvider(appliedFilters);
    }
  }, [serviceId, appliedFilters, selectedTime, getProvider]);


  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    getProvider(filters);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    getProvider(initialFilters);
  };

  const averageRating = selectedProvider?.reviews?.length
    ? (
      selectedProvider.reviews.reduce((sum, r) => sum + r.rating, 0) /
      selectedProvider.reviews.length
    ).toFixed(1)
    : "0";

  if (!providerPopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-6xl h-[80vh] flex gap-4">
        <div className="w-1/2 bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  Available Providers
                </h3>
                <div className="flex items-center gap-2 text-blue-100 text-sm mt-1">
                  <span>{allProviders.length} service providers</span>
                  {selectedTime && (
                    <>
                      <span>•</span>
                      <span>Filtered for {selectedTime}</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-all duration-200 hover:bg-white/20 ${showFilters ? 'bg-white/20 shadow-md' : ''}`}
                title="Toggle Filters"
              >
                <Filter
                  className={`w-5 h-5 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto h-full pb-20">
            <div className="p-4 space-y-3">
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${showFilters ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0'
                  }`}
              >
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-blue-600" />
                    Filter Providers
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Min Experience (years)"
                        value={filters.experience || ''}
                        min={0}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            experience: e.target.value ? Number(e.target.value) : 0,
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Max Price"
                        value={filters.price || ''}
                        min={0}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            price: e.target.value ? Number(e.target.value) : 0,
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleApplyFilters}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <Filter className="w-4 h-4" />
                      Apply Filters
                    </button>
                    <button
                      onClick={handleClearFilters}
                      className="px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>

              {allProviders.length > 0 ? (
                allProviders.map((provider) => (
                  <div
                    key={provider._id}
                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md transform hover:-translate-y-1 ${selectedProvider?._id === provider._id
                        ? 'bg-blue-50 border-blue-300 shadow-md ring-2 ring-blue-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    onClick={() => setSelectedProvider(provider)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={getCloudinaryUrl(provider.profilePhoto)}
                          alt={provider.fullName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                        {selectedProvider?._id === provider._id && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-pulse"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {provider.fullName}
                          </h4>
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-medium">{provider.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-blue-600 font-medium">
                          {provider.serviceArea}
                        </p>
                        <p className="text-xs text-gray-500">
                          {provider.reviews?.length ?? 0} reviews
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100 border border-dashed border-gray-300 rounded-xl">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                    <Award className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-sm font-medium">
                    No service providers found
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {selectedTime
                      ? `No providers available at ${selectedTime}. Try a different time or adjust filters.`
                      : 'Try adjusting your filters or search criteria'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-1/2 bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white flex justify-between items-center">
            <h3 className="text-xl font-bold">Provider Details</h3>
            <button
              onClick={() => setProviderPopup(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto h-full pb-20">
            {selectedProvider ? (
              <div className="p-6 space-y-6">
                <div className="text-center border-b pb-6">
                  <img
                    src={getCloudinaryUrl(selectedProvider.profilePhoto)}
                    alt={selectedProvider.fullName}
                    className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-green-100 mb-4"
                  />
                  <h4 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedProvider.fullName}
                  </h4>
                  <p className="text-green-600 font-semibold text-lg">
                    {selectedProvider.serviceName}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div
                      className="flex items-center gap-1 text-amber-500 cursor-pointer"
                      onClick={() => setShowReviews(!showReviews)}
                    >
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-bold">{averageRating}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span
                      className="text-gray-600 cursor-pointer hover:underline"
                      onClick={() => setShowReviews(!showReviews)}
                    >
                      {selectedProvider.reviews?.length ?? 0} reviews
                    </span>
                  </div>

                  {showReviews && (
                    <div className="bg-gray-50 p-4 rounded-lg mt-4">
                      <h5 className="font-medium text-gray-900 mb-3">User Reviews</h5>
                      {(selectedProvider.reviews?.length ?? 0) > 0 ? (
                        <div className="space-y-3">
                          {(selectedProvider.reviews ?? []).map((review, idx) => (
                            <div
                              key={idx}
                              className="p-3 border border-gray-200 rounded-lg bg-white shadow-sm"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={getCloudinaryUrl(review.userImg)}
                                    alt={review.userName}
                                    className="w-10 h-10 rounded-full object-cover border border-gray-300"
                                  />
                                  <span className="font-semibold text-gray-800">
                                    {review.userName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-amber-500">
                                  {Array.from({ length: review.rating }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-current" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-700 text-sm">{review.review}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600 text-sm">No reviews yet.</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <IndianRupee className="w-4 h-4" />
                      <span className="font-medium">Price</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {selectedProvider.price}
                    </p>
                    <p className="text-sm text-gray-600">per session</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-green-600 mb-1">
                      <Award className="w-4 h-4" />
                      <span className="font-medium">Experience</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {selectedProvider.experience}
                    </p>
                    <p className="text-sm text-gray-600">years of practice</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Available Hours & Days</p>
                      <WeeklyScheduleDisplay
                        schedule={
                          selectedProvider.availability?.weeklySchedule || []
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Service Area</p>
                      <p className="text-gray-600">{selectedProvider.serviceArea}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      <p className="text-gray-600">{selectedProvider.phoneNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">{selectedProvider.email}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">About</h5>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Professional service provider with extensive experience in their
                    field.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setProviderPopup(false)}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Select Provider
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-xl font-semibold text-gray-600 mb-2">
                  Select a Provider
                </h4>
                <p className="text-gray-500">
                  Choose a service provider from the list to view their detailed
                  information
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

};

export default ProviderPopup;