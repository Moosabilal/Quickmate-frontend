import React from 'react';
import { RouteObject } from 'react-router-dom';

export const LayoutRoute = (Layout: React.ComponentType,routes: RouteObject[]): RouteObject => ({
  element: <Layout />,
  children: routes,
});
