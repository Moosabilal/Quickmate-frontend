import React, { lazy } from 'react';
const ProtectedRoute = lazy(() => import('../components/ProtectedRoute'));
const Provider_profile = lazy(() => import('../pages/provider/ProfileSetingPage'))
const Chat_Room = lazy(() => import('../components/ChatRoom'))
const RegistrationOTPVerification = lazy(() => import('../components/OtpVerification'))

import { LayoutRoute } from './LayoutRoute';
import ProviderSidebarLayout from '../layouts/ProviderSidebarLayout';
import ProviderServicesPage from '../pages/provider/ProviderServicePage';
import ServiceManagementPage from '../pages/provider/Add&EditServices';
import ProviderBookingManagementPage from '../pages/provider/bookings';


const providerRoutes = [

    LayoutRoute(ProviderSidebarLayout, [
        {
            element: <ProtectedRoute roles={['ServiceProvider']} />,
            children: [
                { path: '/providerProfile/:userId', element: <Provider_profile /> },
                { path: '/providerService', element: <ProviderServicesPage /> },
                { path: '/providerService/new', element: <ServiceManagementPage /> },
                { path: '/providerService/edit/:serviceId', element: <ServiceManagementPage /> },
                { path: '/providerBookingManagement', element: <ProviderBookingManagementPage /> },
                { path: '/providerLiveChat', element: <Chat_Room /> },

            ],
        },
    ]),
];

export default providerRoutes.flat();
