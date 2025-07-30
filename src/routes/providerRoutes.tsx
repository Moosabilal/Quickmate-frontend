import React, { lazy } from 'react';
const ProtectedRoute = lazy(() => import('../components/ProtectedRoute'));
const Provider_profile = lazy(() => import('../pages/provider/ProfileSetingPage'))
import { LayoutRoute } from './LayoutRoute';
import ProviderSidebarLayout from '../layouts/ProviderSidebarLayout';


const providerRoutes = [

    LayoutRoute(ProviderSidebarLayout, [
        {
            element: <ProtectedRoute roles={['ServiceProvider']} />,
            children: [
                { path: '/providerProfile/:userId', element: <Provider_profile /> },

            ],
        },
    ]),
];

export default providerRoutes.flat();
