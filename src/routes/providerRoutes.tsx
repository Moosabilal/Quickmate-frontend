import React, { lazy } from 'react';

// Common components
const ProtectedRoute = lazy(() => import('../components/ProtectedRoute'));
import { LayoutRoute } from './LayoutRoute';
import ProviderSidebarLayout from '../layouts/ProviderSidebarLayout';

// Page components
const Provider_profile = lazy(() => import('../pages/provider/ProfileSetingPage'));
const ProviderDashboard = lazy(() => import('../pages/provider/Dashboard'));
const EarningsAnalytics = lazy(() => import('../pages/provider/Earnings'));
const PerformanceDashboard = lazy(() => import('../pages/provider/PerformanceDashboard'));
const ProviderServicesPage = lazy(() => import('../pages/provider/ProviderServicePage'));
const ServiceManagementPage = lazy(() => import('../pages/provider/Add&EditServices'));
const ProviderBookingManagementPage = lazy(() => import('../pages/provider/bookings'));

// --- 1. Import the new Availability page component ---
const ProviderAvailabilityPage = lazy(() => import('../pages/provider/ProviderAvailabilityPage'));


const providerRoutes = [
    LayoutRoute(ProviderSidebarLayout, [
        {
            element: <ProtectedRoute roles={['ServiceProvider']} />,
            children: [
                { path: '/provider/providerDashboard', element: <ProviderDashboard /> },
                { path: '/provider/providerProfile/:userId', element: <Provider_profile /> },
                { path: '/provider/providerService', element: <ProviderServicesPage /> },
                { path: '/provider/providerService/new', element: <ServiceManagementPage /> },
                { path: '/provider/providerService/edit/:serviceId', element: <ServiceManagementPage /> },
                { path: '/provider/providerBookingManagement', element: <ProviderBookingManagementPage /> },

                // --- 2. Add the new route for the Availability page ---
                { path: '/provider/availability', element: <ProviderAvailabilityPage /> },

                { path: '/provider/earningsAnalitics', element: <EarningsAnalytics /> },
                { path: 'provider/performanceDashboard', element: <PerformanceDashboard /> }
            ],
        },
    ]),
];

export default providerRoutes.flat();