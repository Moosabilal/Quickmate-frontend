import React from 'react'
import Header from "../components/admin/Header";
import { Outlet } from "react-router-dom";
import Sidebar from '../components/admin/Sidebar'


const AdminLayout = () => {
  return (
    <>
    <Header />
    <div className='flex'>
            <Sidebar />

    <main className='p-4 flex-1 min-h-screen bg-gray-50'>
        <Outlet />
    </main>
    </div>
    </>
  )
}

export default AdminLayout
