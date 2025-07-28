import React from 'react'
import Header from "../components/admin/Header";
import { Outlet } from "react-router-dom";


const AdminLayout = () => {
  return (
    <>
    <Header />
    <main className='p-4 top-20 h-fit'>
        <Outlet />
    </main>
    </>
  )
}

export default AdminLayout
