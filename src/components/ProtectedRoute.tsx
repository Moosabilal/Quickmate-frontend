import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';

const ProtectedRoute = ({ roles }: { roles: string[] }) => {
  const { user, isAuthenticated } = useAppSelector(state => state.auth);

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!user || !roles.includes(user.role)) return <Navigate to="/" />;

  return <Outlet />;
};

export default ProtectedRoute;