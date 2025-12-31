import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CalendarCheck, Smile } from 'lucide-react';

const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300">

      <main className="container mx-auto px-4 sm:px-6 md:px-12 py-12 md:py-16">
        
        <section className="relative bg-gradient-to-br from-purple-100 to-blue-100 dark:from-indigo-900 dark:to-purple-900 rounded-3xl p-8 md:p-16 mb-16 md:mb-20 overflow-hidden shadow-lg dark:shadow-gray-900/50 transition-colors">
          <div className="absolute inset-0 bg-no-repeat bg-cover bg-center opacity-60 dark:opacity-20 transition-opacity"
               style={{ backgroundImage: "url('/booking_heroSection.png')" }}>
          </div>
          <div className="absolute inset-0 bg-white/30 dark:bg-black/40 backdrop-blur-[2px]"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center text-center py-8 md:py-12">
            <h1 className="text-sm md:text-base uppercase tracking-widest text-indigo-700 dark:text-indigo-300 font-bold mb-3">How It Works</h1>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
              <span className="block text-gray-800 dark:text-gray-100">Simple steps to</span>
              <span className="text-indigo-600 dark:text-indigo-400">get things done</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mb-8 leading-relaxed">
              Find, book, and manage local services with ease. We connect you with verified professionals in minutes.
            </p>
            <button 
              type="button"
              onClick={() => navigate('/services')}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold py-3.5 px-8 rounded-full text-lg shadow-xl shadow-indigo-600/20 transform transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-12 md:gap-16 lg:gap-24">

          <div className="flex flex-col md:flex-row items-center bg-white dark:bg-gray-800 rounded-3xl shadow-md dark:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300 hover:shadow-lg dark:hover:shadow-2xl hover:-translate-y-1 transform">
            <div className="md:w-1/2 p-8 md:p-12 order-2 md:order-1">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6">
                <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">Find a Service</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                Search for the service you need, whether it's home cleaning, pet grooming, or handyman services. Our platform connects you with trusted professionals in your area.
              </p>
            </div>
            <div className="md:w-1/2 p-6 md:p-8 bg-blue-50 dark:bg-gray-700/50 flex justify-center items-center h-full order-1 md:order-2">
              <img src="/find_service.png" alt="Find a Service" className="w-full max-w-sm h-auto rounded-xl shadow-lg transform rotate-2 transition-transform hover:rotate-0 duration-500" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center bg-white dark:bg-gray-800 rounded-3xl shadow-md dark:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300 hover:shadow-lg dark:hover:shadow-2xl hover:-translate-y-1 transform">
            <div className="md:w-1/2 p-6 md:p-8 bg-purple-50 dark:bg-gray-700/50 flex justify-center items-center h-full order-1">
              <img src="/book_instantly.png" alt="Book Instantly" className="w-full max-w-sm h-auto rounded-xl shadow-lg transform -rotate-2 transition-transform hover:rotate-0 duration-500" />
            </div>
            <div className="md:w-1/2 p-8 md:p-12 order-2">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6">
                <CalendarCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">Book Instantly</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                Once you've found the right service provider, book your appointment instantly. Choose a convenient time slot and receive a confirmation in seconds.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center bg-white dark:bg-gray-800 rounded-3xl shadow-md dark:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300 hover:shadow-lg dark:hover:shadow-2xl hover:-translate-y-1 transform">
            <div className="md:w-1/2 p-8 md:p-12 order-2 md:order-1">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6">
                <Smile className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">Enjoy Your Service</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                Sit back and relax while the professional takes care of your needs. After the service is completed, you can leave a review and easily rebook if needed.
              </p>
            </div>
            <div className="md:w-1/2 p-6 md:p-8 bg-green-50 dark:bg-gray-700/50 flex justify-center items-center h-full order-1 md:order-2">
              <img src="/enjoy_your_service.png" alt="Enjoy Your Service" className="w-full max-w-sm h-auto rounded-xl shadow-lg transform rotate-2 transition-transform hover:rotate-0 duration-500" />
            </div>
          </div>

        </section>
      </main>
    </div>
  );
};

export default HowItWorksPage;