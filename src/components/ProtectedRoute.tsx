import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';

const ProtectedRoute = ({ roles }: { roles: string[] }) => {
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  console.log('the protected route', user, isAuthenticated)

  if (!isAuthenticated) return <Navigate to="/login" />;
  console.log('not navifated to login')
  if (!user || !roles.includes(user.role)) return <Navigate to="/" />;
  console.log('the role mistake has resolved')

  return <Outlet />;
};

export default ProtectedRoute;