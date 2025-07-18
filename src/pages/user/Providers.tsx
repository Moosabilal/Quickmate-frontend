import React from 'react';

// --- Interfaces ---
interface Service {
  id: string;
  name: string;
  image: string; // URL to the image
  rating: number;
  reviews: number;
  price: number;
}

interface Provider {
  id: string;
  name: string;
  avatar: string; // URL to the avatar image
  service: string;
}

// --- Dummy Data ---
const featuredServices: Service[] = [
  { id: 's1', name: 'Home Cleaning', image: 'https://via.placeholder.com/180x150/f0f4f7/333333?text=Cleaning', rating: 4.8, reviews: 120, price: 50 },
  { id: 's2', name: 'Personal Training', image: 'https://via.placeholder.com/180x150/f0f4f7/333333?text=Training', rating: 4.9, reviews: 95, price: 60 },
  { id: 's3', name: 'Math Tutoring', image: 'https://via.placeholder.com/180x150/f0f4f7/333333?text=Tutoring', rating: 4.7, reviews: 150, price: 40 },
  { id: 's4', name: 'Event Photography', image: 'https://via.placeholder.com/180x150/f0f4f7/333333?text=Photography', rating: 4.9, reviews: 80, price: 150 },
  { id: 's5', name: 'Wedding Planning', image: 'https://via.placeholder.com/180x150/f0f4f7/333333?text=Wedding', rating: 4.8, reviews: 110, price: 200 },
];

const featuredProviders: Provider[] = [
  { id: 'p1', name: 'Sophia Carter', avatar: 'https://via.placeholder.com/150/f0f4f7/333333?text=SC', service: 'Cleaning Services' },
  { id: 'p2', name: 'Ethan Walker', avatar: 'https://via.placeholder.com/150/f0f4f7/333333?text=EW', service: 'Plumbing Services' },
  { id: 'p3', name: 'Olivia Bennett', avatar: 'https://via.placeholder.com/150/f0f4f7/333333?text=OB', service: 'Electrical Services' },
  { id: 'p4', name: 'Liam Harris', avatar: 'https://via.placeholder.com/150/f0f4f7/333333?text=LH', service: 'Landscaping Services' },
];

const ProviderPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      {/* Navbar - Consistent with previous pages */}
      <nav className="bg-gray-900 text-gray-300 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center max-w-7xl">
          {/* Left Section: QuickMaker Logo and Navigation Links */}
          <div className="flex items-center space-x-6">
            <a href="#" className="flex items-center text-xl font-bold text-gray-100">
              <span className="mr-2">QuickMaker</span>
            </a>
            <div className="hidden md:flex space-x-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Home</a>
              <a href="#" className="hover:text-white transition-colors">Services</a>
              <a href="#" className="hover:text-white transition-colors">Providers</a>
              <a href="#" className="hover:text-white transition-colors">About Us</a>
            </div>
          </div>

          {/* Right Section: Icons */}
          <div className="flex items-center space-x-4">
            {/* Notification Icon */}
            <button className="p-1 text-gray-400 hover:text-white focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17l-3 3m0 0l-3-3m3 3V3" />
              </svg>
            </button>
            {/* User Avatar */}
            <img
              className="h-8 w-8 rounded-full border-2 border-gray-400"
              src="https://via.placeholder.com/32/ffffff/000000?text=JD" // Placeholder for user avatar
              alt="User Profile"
            />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Hero Section with Search Bar (Optional, but good for a landing page) */}
        <section className="text-center py-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Find Your Perfect Service</h1>
          <p className="text-xl mb-8 opacity-90">Connecting you with skilled local professionals, effortlessly.</p>
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search for services or providers..."
              className="w-full p-4 pl-12 text-lg text-gray-800 rounded-full border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition duration-300"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </section>


        {/* How It Works Section - Replicating image_4c010f.png */}
        <section className="bg-white rounded-lg shadow-md p-8 md:p-12 mb-12 flex flex-col md:flex-row items-center justify-between">
          {/* Left Side: Image Placeholder */}
          <div className="md:w-1/2 flex justify-center md:justify-start mb-8 md:mb-0">
            <img
              src="https://via.placeholder.com/400x250/e0e0e0/555555?text=How+QuickMate+Works" // Placeholder image for 'How QuickMate Works'
              alt="How QuickMate Works"
              className="rounded-lg max-w-full h-auto"
            />
          </div>

          {/* Right Side: Text and Button */}
          <div className="md:w-1/2 md:pl-12 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              QuickMate connects you with skilled local professionals for all your needs.
              Simply search for the service you need, browse through profiles and reviews,
              book your service, and get things done! It's that easy.
            </p>
            <button className="inline-flex items-center bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md">
              Learn More
              <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </button>
          </div>
        </section>

        {/* Featured Services Section - Adapting from image_4b0dc9.jpg */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Featured Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {featuredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm"
              >
                <img
                  className="w-full h-36 object-cover object-center"
                  src={service.image}
                  alt={service.name}
                />
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{service.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {service.rating} ({service.reviews} reviews)
                  </p>
                  <p className="text-base text-gray-700">
                    Starting at <span className="font-semibold">${service.price}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Providers Section - Adapting from image_147d82.jpg */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Featured Providers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {featuredProviders.map((provider) => (
              <div
                key={provider.id}
                className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm text-center p-4"
              >
                <img
                  className="w-24 h-24 rounded-full object-cover object-center mx-auto mb-4 border-2 border-gray-300"
                  src={provider.avatar}
                  alt={provider.name}
                />
                <h3 className="text-lg font-medium text-gray-900 mb-1">{provider.name}</h3>
                <p className="text-sm text-blue-600 font-medium">{provider.service}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Note: Pagination is generally not included for 'Featured' sections on a landing page unless the list is very extensive.
                  If you need it, you can adapt the pagination logic from the previous ServicesPage example. */}

      </main>
    </div>
  );
};

export default ProviderPage;