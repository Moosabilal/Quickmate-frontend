 import { Award, Star, X, DollarSign, MapPin, Phone, Clock, Mail  } from 'lucide-react'
import { IProvider } from './ServiceDetailsPage';
 
 
const mockProviders: IProvider[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    rating: 4.8,
    reviews: 156,
    price: 120,
    availableTime: '9:00 AM - 5:00 PM',
    specialty: 'Home Cleaning Specialist',
    experience: '8 years',
    location: 'Downtown Area',
    phone: '+1 (555) 123-4567',
    email: 'sarah.johnson@service.com',
    profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face',
    description: 'Professional cleaning specialist with expertise in residential deep cleaning and maintenance services.',
  },
  {
    id: '2',
    name: 'Michael Chen',
    rating: 4.9,
    reviews: 203,
    price: 150,
    availableTime: '8:00 AM - 6:00 PM',
    specialty: 'Premium Service Provider',
    experience: '12 years',
    location: 'City Center',
    phone: '+1 (555) 234-5678',
    email: 'michael.chen@service.com',
    profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face',
    description: 'Expert service provider specializing in high-quality home maintenance and repair services.',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    rating: 4.7,
    reviews: 89,
    price: 110,
    availableTime: '10:00 AM - 4:00 PM',
    specialty: 'Eco-Friendly Services',
    experience: '6 years',
    location: 'Suburban Areas',
    phone: '+1 (555) 345-6789',
    email: 'emily.rodriguez@service.com',
    profileImage: 'https://images.unsplash.com/photo-1594824091373-13db8ad016a8?w=100&h=100&fit=crop&crop=face',
    description: 'Environmentally conscious service provider focusing on eco-friendly cleaning and maintenance solutions.',
  },
  {
    id: '4',
    name: 'James Wilson',
    rating: 4.6,
    reviews: 134,
    price: 130,
    availableTime: '7:00 AM - 3:00 PM',
    specialty: 'Technical Services',
    experience: '15 years',
    location: 'Metro Area',
    phone: '+1 (555) 456-7890',
    email: 'james.wilson@service.com',
    profileImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=100&h=100&fit=crop&crop=face',
    description: 'Technical service specialist with extensive experience in complex home repairs and installations.',
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    rating: 4.9,
    reviews: 178,
    price: 140,
    availableTime: '11:00 AM - 7:00 PM',
    specialty: 'Customer Care Expert',
    experience: '10 years',
    location: 'All Areas',
    phone: '+1 (555) 567-8901',
    email: 'lisa.thompson@service.com',
    profileImage: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=100&h=100&fit=crop&crop=face',
    description: 'Dedicated service provider with expertise in customer satisfaction and personalized service delivery.',
  },
];

 
 const ProviderPopup = ({setSelectedProvider, providerPopup, selectedProvider, setProviderPopup}) => {
    if (!providerPopup) return null;

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
              <p className="text-blue-100 text-sm mt-1">{mockProviders.length} service providers</p>
            </div>
            <div className="overflow-y-auto h-full pb-20">
              <div className="p-4 space-y-3">
                {mockProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedProvider?.id === provider.id
                        ? 'bg-blue-50 border-blue-300 shadow-md'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedProvider(provider)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={provider.profileImage}
                          alt={provider.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                        {selectedProvider?.id === provider.id && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 truncate">{provider.name}</h4>
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-medium">{provider.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-blue-600 font-medium">{provider.specialty}</p>
                        <p className="text-xs text-gray-500">{provider.reviews} reviews • ${provider.price}/session</p>
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
                      src={selectedProvider.profileImage}
                      alt={selectedProvider.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-green-100 mb-4"
                    />
                    <h4 className="text-2xl font-bold text-gray-900 mb-1">{selectedProvider.name}</h4>
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
                      <p className="text-xl font-bold text-gray-900">${selectedProvider.price}</p>
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
                        <p className="text-gray-600">{selectedProvider.availableTime}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Service Area</p>
                        <p className="text-gray-600">{selectedProvider.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Phone</p>
                        <p className="text-gray-600">{selectedProvider.phone}</p>
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
                    <p className="text-gray-700 text-sm leading-relaxed">{selectedProvider.description}</p>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setProviderPopup(false)}
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Select Provider
                    </button>
                    <button className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                      View Reviews
                    </button>
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