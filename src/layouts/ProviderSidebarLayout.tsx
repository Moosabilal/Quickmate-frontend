

import React from 'react'
import Header from '../components/user/Header'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/provider/Sidebar'
import Footer from '../components/user/Footer'

const ProviderSidebarLayout = () => {
  return (
    <>
        <Header />
            <div className='flex pt-20 min-h-screen ml-12'>
                <div className="sticky top-20 h-fit p-4">
          <Sidebar />
        </div>
                <main className="pl-10 top-20 h-fit flex-1">
                    <Outlet />
                </main>
            </div>
    </>
  )
}

export default ProviderSidebarLayout
