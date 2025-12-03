import React from 'react'
import Header from '../components/user/Header'
import Sidebar from '../components/user/Sidebar'
import { Outlet } from 'react-router-dom'

const UserSidebarLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Header />
            
            <div className='flex pt-20 h-fit lg:ml-12 relative'>
                <Sidebar />
                
                <main className="p-4 w-full lg:ml-8 top-20 h-fit lg:mr-10 flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default UserSidebarLayout