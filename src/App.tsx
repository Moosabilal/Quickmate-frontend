import React, { Suspense } from 'react'; 
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import { ToastContainer } from 'react-toastify'; 

const App = () => {
  return (
    <>
      <ToastContainer
        position="bottom-right" 
        autoClose={5000}    
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"    
      />
    
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500"></div>
          <p className="ml-4 text-xl text-gray-700 dark:text-gray-300">Loading page...</p>
        </div>
      }>
        <RouterProvider router={router} />
      </Suspense>
    </>
  );
};

export default App;