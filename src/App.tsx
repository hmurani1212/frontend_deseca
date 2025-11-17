import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useStore, { RootState } from './Store/store';
import Routers from './Routers/Routers';
import ErrorBoundary from './Components/ErrorBoundary/ErrorBoundary';

const App: React.FC = () => {
  const initializeAuth = useStore((state: RootState) => state.initializeAuth);
  const isAuthLoading = useStore((state: RootState) => state.isAuthLoading);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);
  
  useEffect(() => {
    // Initialize authentication state from localStorage on app start
    const init = async (): Promise<void> => {
      await initializeAuth();
      setAuthInitialized(true);
    };
    
    init();
  }, [initializeAuth]);
  
  // Show loading screen while initializing auth
  // CRITICAL: Don't show loading screen if we're on login/register page to prevent form reset
  const currentPath = window.location.pathname;
  const isAuthPage = currentPath === '/login' || currentPath === '/register';
  
  // Only show loading screen on initial app load, not during login attempts
  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Don't show loading screen during login attempts on auth pages
  if (isAuthLoading && !isAuthPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
    <div className="App">
      <Routers />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
    </ErrorBoundary>
  );
};

export default App;

