import React, { lazy } from 'react'; 
import RegistrationOTPVerification from '../components/OtpVerification';
import ForgotPasswordRequest from '../pages/ForgotPasswordRequest';
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
const ResetPasswordForm = lazy(() => import('../pages/ResetPasswordForm'));
const ProfileSettings = lazy(() => import('../pages/user/ProfilPage'));
const ProviderRegistration = lazy(() => import('../pages/provider/Register'))
const BookingHistory = lazy(() => import('../pages/user/BookingHistory'))
const Booking_servicePage = lazy(() => import('../pages/user/BookingServicePage'))
const Chat_Room = lazy(() => import('../components/ChatRoom'))
import { LayoutRoute } from './LayoutRoute';

import UserSidebarLayout from '../layouts/UserSidebarLayout';
import BookingConfirmation from '../pages/user/bookingConfirmation';
import ChatProvidersPage from '../pages/user/ChatProviders';
// import ChatRoom from '../components/ChatRoom';
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
  {
  element: <ProtectedRoute roles={['Customer', 'ServiceProvider']} />,
  children: [
    { path: '/confirmationModel/:bookingId', element: <BookingConfirmation /> },
  ],
}


  ]),

  LayoutRoute(UserSidebarLayout, [
    {
      element: <ProtectedRoute roles={['Customer', 'ServiceProvider']} />,
      children: [
        { path: '/profile', element: <ProfileSettings /> },
        { path: '/provider-registration', element: <ProviderRegistration /> },
        { path: '/profile/booking-history', element: <BookingHistory /> },
        { path: '/profile/chatListPage', element: <ChatProvidersPage /> },
        { path: '/profile/chatListPage/live-chat', element: <Chat_Room /> },


      ],
    },
  ]),
];

export default userRoutes.flat();
