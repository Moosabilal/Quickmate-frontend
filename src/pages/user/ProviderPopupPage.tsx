import { Award, Star, X, DollarSign, MapPin, Phone, Clock, Mail, Calendar } from 'lucide-react'
import { IBackendProvider } from '../../types/provider';
import { useEffect, useState } from 'react';
import { providerService } from '../../services/providerService';
import { getCloudinaryUrl } from '../../util/cloudinary';


const ProviderPopup = ({ setSelectedProvider, providerPopup, selectedProvider, setProviderPopup }) => {
  if (!providerPopup) return null;
  const [allProviders, setAllProviders] = useState<IBackendProvider[]>([])

  useEffect(() => {
    const getProvider = async () => {
      const providers = await providerService.getProvidersWithAllDetails()
      console.log('providers', providers)
      setAllProviders(providers)
    }
    getProvider()
  }, [])

  console.log('the udpated providers', allProviders)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-6xl h-[80vh] flex gap-4">
        {/* Left Box - Providers List */}
        <div className="w-1/2 bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Award className="w-6 h-6" />
              Available Providers
            </h3>
            <p className="text-blue-100 text-sm mt-1">{allProviders.length} service providers</p>
          </div>
          <div className="overflow-y-auto h-full pb-20">
            <div className="p-4 space-y-3">
              {allProviders.map((provider) => (
                <div
                  key={provider._id}
                  className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${selectedProvider?.id === provider._id
                      ? 'bg-blue-50 border-blue-300 shadow-md'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
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
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 truncate">{provider.fullName}</h4>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium">{provider.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-blue-600 font-medium">{provider.serviceArea}</p>
                      <p className="text-xs text-gray-500">{provider.reviews} reviews </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Box - Provider Details */}
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
                    alt={selectedProvider.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-green-100 mb-4"
                  />
                  <h4 className="text-2xl font-bold text-gray-900 mb-1">{selectedProvider.fullName}</h4>
                  <p className="text-green-600 font-semibold text-lg">{selectedProvider.specialty}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-bold">{selectedProvider.rating}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{selectedProvider.reviews} reviews</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">Price</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">500</p>
                    <p className="text-sm text-gray-600">per session</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-green-600 mb-1">
                      <Award className="w-4 h-4" />
                      <span className="font-medium">Experience</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{selectedProvider.experience}</p>
                    <p className="text-sm text-gray-600">of practice</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Available Hours</p>
                      <p className="text-gray-600">{selectedProvider.timeSlot?.startTime} - {selectedProvider.timeSlot?.endTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Available Days</p>
                      <p className="text-gray-600">
                        {selectedProvider.availableDays?.length
                          ? selectedProvider.availableDays.join(', ')
                          : 'Not specified'}
                      </p>
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
                  <p className="text-gray-700 text-sm leading-relaxed">description need to be update</p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setProviderPopup(false)}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Select Provider
                  </button>
                  {/* <button className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                    View Reviews
                  </button> */}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-xl font-semibold text-gray-600 mb-2">Select a Provider</h4>
                <p className="text-gray-500">Choose a service provider from the list to view their detailed information</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderPopup