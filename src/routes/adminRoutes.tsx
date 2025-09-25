import { createBrowserRouter } from 'react-router-dom';
import React, { lazy } from 'react'; 
import CategoryDetailsPage from '../pages/admin/CategoryDetailsPage';
import AdminProvidersPage from '../pages/admin/ProviderList';
import { LayoutRoute } from './LayoutRoute';


const ProtectedRoute = lazy(() => import('../components/ProtectedRoute'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const CategoryCommissionManagement = lazy(() => import('../pages/admin/Category'));
const CategoryForm = lazy(() => import('../pages/admin/Add&EditCategory'));
const AdminUsersPage = lazy(() => import('../pages/admin/UserList'));
const AdminSubscriptionPlans = lazy(() => import('../pages/admin/SubscriptionPlan'));
const UserDetailsPage = lazy(() => import('../pages/admin/UsersDetails'))


import AdminLayout from '../layouts/AdminLayout';

const adminRoutes = [
  LayoutRoute(AdminLayout, [
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
      { path: '/admin/subscriptionPlan', element: <AdminSubscriptionPlans /> },
      { path: '/admin/users/userDetails/:userId', element: <UserDetailsPage /> },
      ],
    },
  ]),
];

export default adminRoutes.flat();
