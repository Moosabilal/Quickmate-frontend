import React, { lazy } from 'react';
const ProtectedRoute = lazy(() => import('../components/ProtectedRoute'));
const Provider_profile = lazy(() => import('../pages/provider/ProfileSetingPage'))
const Chat_Room = lazy(() => import('../components/ChatRoom'))
const RegistrationOTPVerification = lazy(() => import('../components/OtpVerification'))
const ProviderDashboard = lazy(() => import ('../pages/provider/Dashboard'))
const EarningsAnalytics = lazy(() => import ('../pages/provider/Earnings'))
const PerformanceDashboard = lazy(() => import ('../pages/provider/PerformanceDashboard'))

import { LayoutRoute } from './LayoutRoute';
import ProviderSidebarLayout from '../layouts/ProviderSidebarLayout';
import ProviderServicesPage from '../pages/provider/ProviderServicePage';
import ServiceManagementPage from '../pages/provider/Add&EditServices';
import ProviderBookingManagementPage from '../pages/provider/bookings';
import MainChatLayout from '../layouts/MainChatLayout';
import ChatPlaceholder from '../components/ChatPlaceholder';
import VideoCallPage from '../components/VideoCallPage';



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
                // { path: '/provider/providerBookingManagement/providerLiveChat', element: <Chat_Room /> },
                { path: '/provider/earningsAnalitics', element: <EarningsAnalytics /> },
                { path: '/provider/performanceDashboard', element: <PerformanceDashboard /> }

            ],
        },
    ]),
];

export default providerRoutes.flat();
