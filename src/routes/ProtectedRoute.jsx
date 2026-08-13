import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // Jab tak check ho raha hai ke user login hai ya nahi, loading dikhao
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Agar login nahi hai, to login page pe bhej do
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Login hai, to jo page andar hai wo dikha do
  return <Outlet />;
}