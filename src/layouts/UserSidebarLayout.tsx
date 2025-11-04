import React from 'react'
import Header from '../components/user/Header'
import Sidebar from '../components/user/Sidebar'
import Footer from '../components/user/Footer'
import { Outlet } from 'react-router-dom'

const UserSidebarLayout = () => {
    return (
        <>
            <Header />
            <div className='flex pt-20 h-fit ml-12'>
                <Sidebar />
                <main className="p-4 ml-16 top-20 h-fit mr-10 flex-1">
                    <Outlet />
                </main>
            </div>

        </>
    )
}

export default UserSidebarLayout
