import React from 'react'
import Header from "../components/user/Header";
import { Outlet } from "react-router-dom";
import Footer from '../components/user/Footer';


const userLayout = () => {
  return (
    <>
    <Header />
    <main className='min-h-screen'>
        <Outlet />
    </main>
    <Footer />
    </>
  )
}

export default userLayout
