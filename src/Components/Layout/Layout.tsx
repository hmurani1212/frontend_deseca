import React, { useState, ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import useStore, { RootState } from '../../Store/store';
import { showToast } from '../Toaster/Toaster';
import { 
  FiMenu, 
  FiX, 
  FiHome, 
  FiFileText, 
  FiBarChart2, 
  FiLogOut, 
  FiUser 
} from 'react-icons/fi';

interface LayoutProps {
  children: ReactNode;
}

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactElement;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useStore((state: RootState) => state.user);
  const logout = useStore((state: RootState) => state.logout);
  
  const handleLogout = async (): Promise<void> => {
    await logout();
    showToast('Logged out successfully', 'success');
    navigate('/login');
  };
  
  const menuItems: MenuItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { path: '/posts', label: 'Posts', icon: <FiFileText /> },
    { path: '/analytics', label: 'Analytics', icon: <FiBarChart2 /> },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-indigo-600">Social Analytics</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>
          
          {/* Navigation - Matching example style */}
          <nav className="flex-1 px-4 py-6">
            <div className="flex flex-col w-full">
              {menuItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                
                return (
                  <motion.button key={index}>
                    <NavLink
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`text-[#607d8b] px-[28px] py-[10px] flex items-center gap-[10px] text-[14px] no-underline hover:text-[#03a9f3] navLinkCustom ${
                        isActive ? 'text-[#03a9f3] font-semibold' : ''
                      }`}
                    >
                      <span className="text-[13px] transition-all duration-300 ease-in-out">
                        {item.icon}
                      </span>
                      <span className='whitespace-nowrap text-[15px]'>{item.label}</span>
                    </NavLink>
                  </motion.button>
                );
              })}
            </div>
          </nav>
          
          {/* User section */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center mb-3 px-4 py-2">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <FiUser className="text-indigo-600" size={20} />
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || ''}
                </p>
                <p className="text-xs text-indigo-600 capitalize">
                  {user?.role || 'user'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FiLogOut className="mr-3" size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <FiMenu size={24} />
            </button>
            <div className="flex-1" />
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.name || 'User'}
              </span>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

