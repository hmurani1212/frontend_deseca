import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../Components/ProtectedRoute/ProtectedRoute';

// Auth Views (lazy loaded)
const Login = lazy(() => import('../View/Auth/Login'));
const Register = lazy(() => import('../View/Auth/Register'));

// Main Views (lazy loaded)
const Dashboard = lazy(() => import('../View/Dashboard/Dashboard'));
const Posts = lazy(() => import('../View/Posts/Posts'));
const CreatePost = lazy(() => import('../View/Posts/CreatePost'));
const EditPost = lazy(() => import('../View/Posts/EditPost'));
const PostAnalytics = lazy(() => import('../View/Posts/PostAnalytics'));
const Analytics = lazy(() => import('../View/Analytics/Analytics'));

// Loading component
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

const Routers: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/posts"
        element={
          <ProtectedRoute>
            <Posts />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/posts/create"
        element={
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/posts/:id/edit"
        element={
          <ProtectedRoute>
            <EditPost />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/posts/:id/analytics"
        element={
          <ProtectedRoute>
            <PostAnalytics />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </Suspense>
  );
};

export default Routers;

