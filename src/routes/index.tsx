import { createBrowserRouter } from 'react-router-dom';
import React, { lazy } from 'react'; 
import CategoryDetailsPage from '../pages/admin/CategoryDetailsPage';
import RegistrationOTPVerification from '../components/OtpVerification';
import ForgotPasswordRequest from '../pages/ForgotPasswordRequest';

const Home = lazy(() => import('../pages/user/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/user/Register'));
const ProtectedRoute = lazy(() => import('../components/ProtectedRoute'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const CategoryCommissionManagement = lazy(() => import('../pages/admin/Category'));
const CategoryForm = lazy(() => import('../pages/admin/Add&EditCategory'));
const ServiceForm = lazy(() => import('../pages/admin/subCategoryForm'));
const ResetPasswordForm = lazy(() => import('../pages/ResetPasswordForm'));
const ProfileSettings = lazy(() => import('../pages/user/ProfilPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/UserList'));



const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPasswordRequest /> },
  { path: '/reset-password/:token', element: <ResetPasswordForm /> },
  { path: '/verify-otp', element: <RegistrationOTPVerification /> },
  { element: <ProtectedRoute roles={['Customer']} />,
    children: [
      { path: '/Profile', element: <ProfileSettings /> },
    ],
  },
  
  {
    element: <ProtectedRoute roles={['Admin']} />,
    children: [
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/admin/users', element: <AdminUsersPage /> },
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