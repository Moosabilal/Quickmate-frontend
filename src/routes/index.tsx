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



const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/provider-registration', element: <ProviderRegistration /> },
  { path: '/forgot-password', element: <ForgotPasswordRequest /> },
  { path: '/reset-password/:token', element: <ResetPasswordForm /> },
  { path: '/verify-otp', element: <RegistrationOTPVerification /> },
  { path: '/services', element: <ServicesPage /> },
  { path: '/providers', element: <ProviderPage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/working', element: <HowItWorksPage /> },
  { path: '/booking_serviceList/:categoryId', element: <Booking_servicePage /> },
  { path: '/service-detailsPage/:serviceId', element: <ServiceDetailsPage /> },
  { element: <ProtectedRoute roles={['Customer','ServiceProvider']} />,
    children: [
      { path: '/profile', element: <ProfileSettings /> },
      { path: '/providerProfile/:userId', element: <Provider_profile /> },
    ],
  },
  
  {
    element: <ProtectedRoute roles={['Admin']} />,
    children: [
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/admin/users', element: <AdminUsersPage /> },
      { path: '/admin/providers', element: <AdminProvidersPage /> },
      { path: '/admin/categories', element: <CategoryCommissionManagement /> },
      { path: '/admin/categories/view/:categoryId', element: <CategoryDetailsPage />},
      { path: '/admin/categories/new', element: <CategoryForm /> },
      { path: '/admin/categories/edit/:categoryId', element: <CategoryForm /> },
      { path: '/admin/subcategories/new/:parentId', element: <CategoryForm /> },
      { path: '/admin/subcategories/edit/:parentId/:subcategoryId', element: <CategoryForm /> },
    ],
  },
]);

export default router;