import React, { Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import { ToastContainer } from 'react-toastify';
import { authService } from './services/authService';
import { useAppDispatch } from './hooks/useAppDispatch';
import { updateProfile } from './features/auth/authSlice';
import { providerService } from './services/providerService';
import { updateProviderProfile } from './features/provider/providerSlice';
import { useGlobalSocket } from './hooks/useGlobalSocket';
import { motion } from 'framer-motion';
const App = () => {
  const dispatch = useAppDispatch();
  
  useGlobalSocket();

  useEffect(() => {
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const isRefresh = navigationEntries[0]?.type === 'reload';

    if (isRefresh) {
      const fetchUser = async () => {
        try {
          const userData = await authService.getUser();
          console.log('the user Data', userData)
          dispatch(updateProfile({ user: userData }));

          if (userData.role === "ServiceProvider") {
            const providerData = await providerService.getProvider()

            dispatch(updateProviderProfile({ provider: providerData }))
          }
        } catch (error) {
          console.error('Failed to fetch user/provider data:', error);
        }
      };


      fetchUser();
    }
  }, [dispatch]);

  
  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900 text-slate-800 dark:text-gray-100 transition-colors duration-500 overflow-x-hidden font-sans">
      {/* Global Fixed Background Wrapper */}
      <div className="fixed inset-0 w-full h-full pointer-events-none -z-50 overflow-hidden">
        <div 
            className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600 dark:bg-purple-900/20 rounded-full blur-[90px] opacity-80 pointer-events-none animate-blob"
        ></div>
        <div 
            className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-pink-500 dark:bg-indigo-900/20 rounded-full blur-[90px] opacity-80 pointer-events-none animate-blob [animation-delay:2s]"
        ></div>
        <div 
            className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600 dark:bg-cyan-900/10 rounded-full blur-[90px] opacity-80 pointer-events-none animate-blob [animation-delay:4s]"
        ></div>
      </div>

      <div className="relative z-10">
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
          <div className="flex items-center justify-center min-h-screen bg-transparent">
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-indigo-500"></div>
            <p className="ml-4 text-xl font-medium">Loading QuickMate...</p>
          </div>
        }>
          <RouterProvider router={router} />
        </Suspense>
      </div>
    </div>
  );
};

export default App;