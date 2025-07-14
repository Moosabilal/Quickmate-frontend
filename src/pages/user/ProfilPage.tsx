import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/user/Sidebar'; 
import Header from '../../components/user/Header'; 
import { useAppSelector } from '../../hooks/useAppSelector';
import ProfileSetting from './ProfileSetting';

const ProfileSettings: React.FC = () => {
  const { isAuthenticated } = useAppSelector(state => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />

      <div className="flex flex-1 mt-10" >
        <div className="fixed top-0 left-0 h-full w-64 pt-16 z-40">
          <Sidebar />
        </div>

        <main className="flex-1 ml-64 p-6 flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <Routes>
              <Route path="/" element={<ProfileSetting />} />
              <Route
                path="history"
                element={
                  <div className="p-8 text-gray-500 dark:text-gray-400 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <h1 className="text-2xl font-bold mb-4">Booking History</h1>
                    <p>Your booking history will appear here.</p>
                  </div>
                }
              />
              <Route
                path="wallet"
                element={
                  <div className="p-8 text-gray-500 dark:text-gray-400 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <h1 className="text-2xl font-bold mb-4">Wallet</h1>
                    <p>Manage your payment methods and balances here.</p>
                  </div>
                }
              />
              <Route
                path="chat"
                element={
                  <div className="p-8 text-gray-500 dark:text-gray-400 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <h1 className="text-2xl font-bold mb-4">Live Chat</h1>
                    <p>Connect with support or providers.</p>
                  </div>
                }
              />
              <Route
                path="assistant"
                element={
                  <div className="p-8 text-gray-500 dark:text-gray-400 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <h1 className="text-2xl font-bold mb-4">Booking Assistant</h1>
                    <p>Your personal booking assistant for quick services.</p>
                  </div>
                }
              />
              <Route
                path="calendar"
                element={
                  <div className="p-8 text-gray-500 dark:text-gray-400 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <h1 className="text-2xl font-bold mb-4">Calendar</h1>
                    <p>View your scheduled bookings.</p>
                  </div>
                }
              />
              <Route
                path="notifications"
                element={
                  <div className="p-8 text-gray-500 dark:text-gray-400 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <h1 className="text-2xl font-bold mb-4">Notifications</h1>
                    <p>Your recent notifications.</p>
                  </div>
                }
              />
              <Route
                path="manage-services"
                element={
                  <div className="p-8 text-gray-500 dark:text-gray-400 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <h1 className="text-2xl font-bold mb-4">Manage Your Services</h1>
                    <p>Provider specific settings.</p>
                  </div>
                }
              />
              <Route
                path="*"
                element={
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <p className="text-xl">Page Not Found within Profile</p>
                    <p className="text-sm">Please check the URL or select an option from the sidebar.</p>
                  </div>
                }
              />
            </Routes>
          </div>

        </main>
      </div>
    </div>
  );
};

export default ProfileSettings;