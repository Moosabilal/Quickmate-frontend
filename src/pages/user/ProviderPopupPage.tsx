import { Award, Star, X, MapPin, Phone, Mail, Calendar, Filter, IndianRupee, ArrowLeft } from 'lucide-react';
import { DaySchedule, IBackendProvider, ProviderPopupProps } from '../../util/interface/IProvider';
import React, { useCallback, useEffect, useState } from 'react';
import { providerService } from '../../services/providerService';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { toast } from 'react-toastify';
import { FilterParams } from '../../util/interface/IProvider';
import { isAxiosError } from 'axios';

const WeeklyScheduleDisplay: React.FC<{ schedule: DaySchedule[] }> = ({ schedule }) => {
  const activeDays = schedule.filter(day => day.active && day.slots.length > 0);

  if (activeDays.length === 0) {
    return <span className="text-gray-500 dark:text-gray-400 text-sm">No weekly schedule set.</span>;
  }

  return (
    <div className="space-y-1">
      {activeDays.map((day, index) => (
        <div key={index} className="flex justify-between text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">{day.day}</span>
          <span className="text-gray-600 dark:text-gray-400">
            {day.slots.map(slot => `${slot.start} - ${slot.end}`).join(', ')}
          </span>
        </div>
      ))}
    </div>
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
      } catch (error) {
        console.error("Error fetching providers:", error);
        let errorMessage = "Failed to fetch providers";
        if (isAxiosError(error) && error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast.error(errorMessage);
      }
    }, [serviceId]);

  useEffect(() => {
    if (serviceId) {
      getProvider(filters);
    }
  }, [serviceId, selectedTime, getProvider, filters]); 

  const handleApplyFilters = () => {
    getProvider(filters);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
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
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-0 md:p-4 animate-in fade-in duration-200">
      <div className="w-full h-full md:h-[85vh] max-w-6xl bg-white dark:bg-gray-800 md:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-colors">
        
        {/* LEFT PANEL: Provider List */}
        {/* On mobile, hidden if a provider is selected */}
        <div className={`w-full md:w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 ${selectedProvider ? 'hidden md:flex' : 'flex h-full'}`}>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-4 text-white shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Available Providers
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-blue-100 text-xs mt-1">
                  <span>{allProviders.length} found</span>
                  {selectedTime && (
                    <>
                      <span>•</span>
                      <span>{selectedTime}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg transition-all duration-200 hover:bg-white/20 ${showFilters ? 'bg-white/20 shadow-md' : ''}`}
                  title="Toggle Filters"
                >
                  <Filter className={`w-5 h-5 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                <button
                  aria-label="Close Provider Popup"
                  type='button'
                  onClick={() => setProviderPopup(false)}
                  className="p-2 rounded-lg hover:bg-white/20 md:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-4 space-y-3">
              {/* Filters Section */}
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showFilters ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0'}`}>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Filter Options</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500 dark:text-gray-400">Min Experience</label>
                      <input
                        type="number"
                        placeholder="Years"
                        value={filters.experience || ''}
                        min={0}
                        onChange={(e) => setFilters((prev) => ({ ...prev, experience: Number(e.target.value) }))}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500 dark:text-gray-400">Max Price</label>
                      <input
                        type="number"
                        placeholder="Price"
                        value={filters.price || ''}
                        min={0}
                        onChange={(e) => setFilters((prev) => ({ ...prev, price: Number(e.target.value) }))}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleApplyFilters}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Apply
                    </button>
                    <button
                      onClick={handleClearFilters}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* Provider List */}
              {allProviders.length > 0 ? (
                allProviders.map((provider) => (
                  <div
                    key={provider._id}
                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedProvider?._id === provider._id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 ring-1 ring-blue-300 dark:ring-blue-700'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800'
                    }`}
                    onClick={() => setSelectedProvider(provider)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={getCloudinaryUrl(provider.profilePhoto)}
                          alt={provider.fullName}
                          className="w-14 h-14 rounded-full object-cover border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
                        />
                        {selectedProvider?._id === provider._id && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                            {provider.fullName}
                          </h4>
                          <div className="flex items-center gap-1 text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded text-xs font-bold">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{provider.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {provider.serviceArea}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                            {provider.reviews?.length ?? 0} reviews
                            </p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">₹{provider.price}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Filter className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">No providers found</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[200px]">
                    Try adjusting your filters or search radius.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Provider Details */}
        {/* On mobile, hidden if NO provider is selected. On desktop, shows placeholder if none selected */}
        <div className={`w-full md:w-1/2 bg-white dark:bg-gray-800 flex flex-col h-full ${selectedProvider ? 'flex' : 'hidden md:flex'}`}>
          <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 p-4 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
                {/* Back button for Mobile */}
                <button 
                    aria-label="Back to Provider List"
                    type='button'
                    onClick={() => setSelectedProvider(null)}
                    className="md:hidden p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-bold">Provider Details</h3>
            </div>
            <button
              aria-label="Close Provider Details"
              type='button'
              onClick={() => setProviderPopup(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {selectedProvider ? (
              <div className="p-6 space-y-6">
                {/* Header Info */}
                <div className="text-center border-b border-gray-100 dark:border-gray-700 pb-6">
                  <div className="relative inline-block">
                    <img
                        src={getCloudinaryUrl(selectedProvider.profilePhoto)}
                        alt={selectedProvider.fullName}
                        className="w-24 h-24 rounded-full object-cover border-4 border-green-50 dark:border-green-900/30 shadow-md bg-gray-100 dark:bg-gray-700"
                    />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-3">
                    {selectedProvider.fullName}
                  </h4>
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    {selectedProvider.serviceName}
                  </p>
                  
                  <div className="flex items-center justify-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full text-amber-600 dark:text-amber-400 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors" onClick={() => setShowReviews(!showReviews)}>
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-bold text-sm">{averageRating}</span>
                    </div>
                    <button 
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                        onClick={() => setShowReviews(!showReviews)}
                    >
                      {selectedProvider.reviews?.length ?? 0} reviews
                    </button>
                  </div>

                  {/* Reviews Dropdown */}
                  {showReviews && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl mt-4 text-left border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">User Reviews</h5>
                      {(selectedProvider.reviews?.length ?? 0) > 0 ? (
                        <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                          {(selectedProvider.reviews ?? []).map((review, idx) => (
                            <div key={idx} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <img src={getCloudinaryUrl(review.userImg)} alt="" className="w-6 h-6 rounded-full object-cover bg-gray-200" />
                                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">{review.userName}</span>
                                </div>
                                <div className="flex gap-0.5">
                                  {Array.from({ length: review.rating }).map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">{review.review}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-xs italic">No reviews yet.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                      <IndianRupee className="w-4 h-4" />
                      <span className="font-semibold text-xs uppercase tracking-wide">Price</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedProvider.price}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">per session</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                      <Award className="w-4 h-4" />
                      <span className="font-semibold text-xs uppercase tracking-wide">Experience</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedProvider.experience}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">years</p>
                  </div>
                </div>

                {/* Details List */}
                <div className="space-y-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">Schedule</p>
                      <div className="mt-1">
                        <WeeklyScheduleDisplay schedule={selectedProvider.availability?.weeklySchedule || []} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">Service Area</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedProvider.serviceArea}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">Phone</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedProvider.phoneNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">Email</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedProvider.email}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setProviderPopup(false)}
                    className="w-full bg-green-600 text-white py-3.5 px-4 rounded-xl hover:bg-green-700 transition-colors font-semibold shadow-lg shadow-green-600/30 active:scale-[0.98]"
                  >
                    Confirm Provider
                  </button>
                </div>
              </div>
            ) : (
              // Desktop Placeholder State
              <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50 dark:bg-gray-800/50">
                <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <Award className="w-10 h-10 text-gray-300 dark:text-gray-500" />
                </div>
                <h4 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
                  Select a Provider
                </h4>
                <p className="text-gray-500 dark:text-gray-400 max-w-xs">
                  Choose a service provider from the list on the left to view their detailed information and schedule.
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