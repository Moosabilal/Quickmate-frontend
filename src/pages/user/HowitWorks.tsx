import React from 'react';

const HowItWorksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">

      <main className="container mx-auto px-6 md:px-12 py-16">
        <section className="relative bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl p-8 md:p-16 mb-20 overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-no-repeat bg-cover bg-center opacity-75"
               style={{ backgroundImage: "url('/booking_heroSection.png')" }}>
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center text-center py-16">
            <h1 className="text-sm uppercase tracking-widest text-indigo-700 font-semibold mb-2">How It Works</h1>
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-8">
              <span className="text-gray-600">How it works</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-10">
              Find, book, and manage local services with ease.
            </p>
            {/* <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform transition-all duration-300 hover:scale-105">
              Get Started
            </button> */}
          </div>
        </section>

        <section className="grid md:grid-cols-1 lg:grid-cols-1 gap-16">

          <div className="flex flex-col md:flex-row items-center bg-white rounded-2xl shadow-md p-8 overflow-hidden">
            <div className="md:w-1/2 p-4">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Find a Service</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                Search for the service you need, whether it's home cleaning, pet grooming, or handyman services. Our platform connects you with trusted professionals in your area.
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center items-center p-4">
              <img src="/find_service.png" alt="Find a Service" className="max-w-96 h-auto rounded-lg shadow-sm" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse items-center bg-white rounded-2xl shadow-md p-8 mt-12 overflow-hidden"> {/* Added mt-12 for spacing between sections */}
            <div className="md:w-1/2 p-4">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Book Instantly</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                Once you've found the right service provider, book your appointment instantly. Choose a convenient time slot and receive a confirmation.
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center items-center p-4">
              <img src="/book_instantly.png" alt="Book Instantly" className="max-w-96 h-auto rounded-lg shadow-sm" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center bg-white rounded-2xl shadow-md p-8 mt-12 overflow-hidden">
            <div className="md:w-1/2 p-4">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Enjoy Your Service</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                Sit back and relax while the professional takes care of your needs. After the service is completed, you can leave a review and easily rebook if needed.
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center items-center p-4">
              <img src="/enjoy_your_service.png" alt="Enjoy Your Service" className="max-w-96 h-auto rounded-lg shadow-sm" />
            </div>
          </div>

        </section>
      </main>
    </div>
  );
};

export default HowItWorksPage;