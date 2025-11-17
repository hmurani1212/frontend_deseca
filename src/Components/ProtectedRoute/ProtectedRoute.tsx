import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import useStore, { RootState } from '../../Store/store';
import Layout from '../Layout/Layout';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useStore((state: RootState) => state.isAuthenticated);
  
  // If not authenticated, redirect to login
  // Note: Auth initialization is handled in App.tsx, so we don't need to check loading here
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;

