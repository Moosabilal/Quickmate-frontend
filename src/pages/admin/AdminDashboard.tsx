import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch'; 
import { logout } from '../../features/auth/authSlice'; 
import ThemeToggle from '../../components/ThemeToggle';

const dashboardStats = [
  { label: 'Total Users', value: '12,345', change: '+12%', color: 'text-green-500' },
  { label: 'Total Service Providers', value: '2,567', change: '+8%', color: 'text-green-500' },
  { label: 'Total Bookings', value: '8,912', change: '+15%', color: 'text-green-500' },
  { label: 'Revenue This Month', value: '₹45,678', change: '+20%', color: 'text-green-500' },
];

const topActiveProviders = [
  { id: 1, name: 'Sophia Carter', rating: 4.8, reviews: 123, imageUrl: 'https://via.placeholder.com/40/a78bfa/ffffff?text=SC' },
  { id: 2, name: 'Ethan Bennett', rating: 4.9, reviews: 150, imageUrl: 'https://via.placeholder.com/40/34d399/ffffff?text=EB' },
  { id: 3, name: 'Olivia Hayes', rating: 4.7, reviews: 75, imageUrl: 'https://via.placeholder.com/40/facc15/ffffff?text=OH' },
  { id: 4, name: 'Liam Foster', rating: 4.6, reviews: 95, imageUrl: 'https://via.placeholder.com/40/fb7185/ffffff?text=LF' },
  { id: 5, name: 'Ava Mitchell', rating: 4.9, reviews: 130, imageUrl: 'https://via.placeholder.com/40/60a5fa/ffffff?text=AM' },
];

const alerts = [
  { id: 1, message: '5 Unverified Providers', type: 'warning' },
  { id: 2, message: '3 Failed Payments', type: 'error' },
  { id: 3, message: '2 User Complaints', type: 'info' },
];

const AdminDashboard = () => {
  

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">

      <div className="flex-1 flex flex-col overflow-hidden">

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6">Overview of key metrics and recent activities</p>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
                <p className={`text-sm mt-1 ${stat.color}`}>{stat.change}</p>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
              <p className="text-2xl font-bold mb-2">₹123,456</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Last 12 Months <span className="text-green-500">+15%</span></p>
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500">
                (Chart Placeholder)
              </div>
              <div className="flex justify-around text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Daily Bookings</h3>
              <p className="text-2xl font-bold mb-2">245</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Last 30 Days <span className="text-green-500">+10%</span></p>
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500">
                (Chart Placeholder)
              </div>
              <div className="flex justify-around text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
          </section>

          {/* Top Active Providers */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Top Active Providers</h3>
            <div className="space-y-4">
              {topActiveProviders.map(provider => (
                <div key={provider.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={provider.imageUrl} alt={provider.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{provider.rating} &#9733; ({provider.reviews} reviews)</p>
                    </div>
                  </div>
                  <Link to={`/admin/providers/${provider.id}`} className="text-blue-600 dark:text-blue-400 text-sm hover:underline">View Profile</Link>
                </div>
              ))}
            </div>
          </section>

          {/* Alerts */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Alerts</h3>
            <div className="space-y-3">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`flex items-center p-3 rounded-md ${
                    alert.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' :
                    alert.type === 'error' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300' :
                    'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    {alert.type === 'warning' && <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.487 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>}
                    {alert.type === 'error' && <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>}
                    {alert.type === 'info' && <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>}
                  </svg>
                  <span>{alert.message}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;