import React, { lazy } from 'react';
const ProtectedRoute = lazy(() => import('../components/ProtectedRoute'));
const Provider_profile = lazy(() => import('../pages/provider/ProfileSetingPage'))
import { LayoutRoute } from './LayoutRoute';
import ProviderSidebarLayout from '../layouts/ProviderSidebarLayout';
import ProviderServicesPage from '../pages/provider/ProviderServicePage';
import ServiceManagementPage from '../pages/provider/Add&EditServices';


const providerRoutes = [

    LayoutRoute(ProviderSidebarLayout, [
        {
            element: <ProtectedRoute roles={['ServiceProvider']} />,
            children: [
                { path: '/providerProfile/:userId', element: <Provider_profile /> },
                { path: '/providerService', element: <ProviderServicesPage /> },
                { path: '/providerService/new', element: <ServiceManagementPage /> },
                { path: '/providerService/new/:serviceId', element: <ServiceManagementPage /> },

            ],
        },
    ]),
];

export default providerRoutes.flat();
