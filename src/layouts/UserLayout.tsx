import React from 'react'
import Header from "../components/user/Header";
import { Outlet } from "react-router-dom";
import Footer from '../components/user/Footer';

const userLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className='flex-grow'>
            <Outlet />
        </main>
        <Footer />
    </div>
  )
}

export default userLayout
