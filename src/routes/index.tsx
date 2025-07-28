import userRoutes from './userRoutes';
import adminRoutes from './adminRoutes';
import { createBrowserRouter } from 'react-router-dom';
import providerRoutes from './providerRoutes';

const router = createBrowserRouter([
  ...userRoutes,
  ...adminRoutes,
  ...providerRoutes,
]);

export default router;
