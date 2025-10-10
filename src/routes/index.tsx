import userRoutes from './userRoutes';
import adminRoutes from './adminRoutes';
import { createBrowserRouter } from 'react-router-dom';
import providerRoutes from './providerRoutes';
import commonRoutes from './commonRoutes';

const router = createBrowserRouter([
  ...userRoutes,
  ...adminRoutes,
  ...providerRoutes,
  ...commonRoutes,
]);

export default router;
