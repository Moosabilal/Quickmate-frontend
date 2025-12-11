import React, { useState } from 'react'
import Header from "../components/admin/Header";
import { Outlet } from "react-router-dom";
import Sidebar from '../components/admin/Sidebar'

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-700 transition-colors duration-300">
      {/* Pass toggle function to Header */}
      <Header onToggleSidebar={toggleSidebar} />
      
      <div className='flex pt-20 min-h-screen relative'>
        
        {/* Sidebar handles its own responsive behavior based on isOpen prop */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={closeSidebar}
          />
        )}

        {/* Main Content Area */}
        <main className='p-4 flex-1 bg-gray-50 dark:bg-gray-700 transition-colors duration-300 w-full overflow-x-hidden'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout