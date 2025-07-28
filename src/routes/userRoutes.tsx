import { createBrowserRouter } from 'react-router-dom';
import React, { lazy } from 'react'; 
import CategoryDetailsPage from '../pages/admin/CategoryDetailsPage';
import RegistrationOTPVerification from '../components/OtpVerification';
import ForgotPasswordRequest from '../pages/ForgotPasswordRequest';
import AdminProvidersPage from '../pages/admin/ProviderList';
import ServicesPage from '../pages/user/Services';
import ProviderPage from '../pages/user/Providers';
import AboutPage from '../pages/user/About_us';
import HowItWorksPage from '../pages/user/HowitWorks';
import ServiceDetailsPage from '../pages/user/ServiceDetailsPage';
import UserLayout from '../layouts/userLayout';


const Home = lazy(() => import('../pages/user/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/user/Register'));
const ProtectedRoute = lazy(() => import('../components/ProtectedRoute'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const CategoryCommissionManagement = lazy(() => import('../pages/admin/Category'));
const CategoryForm = lazy(() => import('../pages/admin/Add&EditCategory'));
const ResetPasswordForm = lazy(() => import('../pages/ResetPasswordForm'));
const ProfileSettings = lazy(() => import('../pages/user/ProfilPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/UserList'));
const ProviderRegistration = lazy(() => import('../pages/provider/Register'))
const Booking_servicePage = lazy(() => import('../pages/user/BookingServicePage'))
const Provider_profile = lazy(() => import('../pages/provider/ProfileSetingPage'))
import { LayoutRoute } from './LayoutRoute';

import UserSidebarLayout from '../layouts/UserSidebarLayout';
const userRoutes = [
  LayoutRoute(UserLayout, [
    { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPasswordRequest /> },
  { path: '/reset-password/:token', element: <ResetPasswordForm /> },
  { path: '/verify-otp', element: <RegistrationOTPVerification /> },
  { path: '/services', element: <ServicesPage /> },
  { path: '/providers', element: <ProviderPage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/working', element: <HowItWorksPage /> },
  { path: '/booking_serviceList/:categoryId', element: <Booking_servicePage /> },
  { path: '/service-detailsPage/:serviceId', element: <ServiceDetailsPage /> },
  ]),

  LayoutRoute(UserSidebarLayout, [
    {
      element: <ProtectedRoute roles={['Customer', 'ServiceProvider']} />,
      children: [
        { path: '/profile', element: <ProfileSettings /> },
        { path: '/provider-registration', element: <ProviderRegistration /> },

      ],
    },
  ]),
];

export default userRoutes.flat();
