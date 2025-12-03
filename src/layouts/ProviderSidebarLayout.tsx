import React from 'react'
import Header from '../components/user/Header'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/provider/Sidebar'

const ProviderSidebarLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Header />
        
        <div className='flex pt-20 min-h-screen lg:ml-12 relative'>
            <div className="hidden lg:block sticky top-20 h-fit p-4">
                <Sidebar />
            </div>
            
            <main className="flex-1 w-full p-4 lg:pl-10">
                <Outlet />
            </main>
        </div>
    </div>
  )
}

export default ProviderSidebarLayout