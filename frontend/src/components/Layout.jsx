import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LayoutDashboard, Users, Package, FileText, LogOut, User } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Customers', path: '/customers', icon: <Users size={20} /> },
    { name: 'Products', path: '/products', icon: <Package size={20} /> },
    { name: 'Challans', path: '/challans', icon: <FileText size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">
            ERP
          </div>
          <span className="font-semibold text-gray-800">Mini ERP</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          isMobileMenuOpen ? 'block' : 'hidden'
        } md:flex flex-col w-full md:w-64 bg-white border-r border-gray-200 fixed md:sticky top-[57px] md:top-0 h-[calc(100vh-57px)] md:h-screen z-10 transition-transform duration-200 ease-in-out`}
      >
        <div className="hidden md:flex items-center justify-center h-16 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">
              ERP
            </div>
            <span className="font-bold text-xl text-gray-800 tracking-tight">Mini ERP</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center px-4 py-3 mb-2 rounded-lg bg-gray-50">
            <User size={32} className="text-gray-400 bg-white p-1 rounded-full border border-gray-200 mr-3" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'Unknown User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.role || 'User'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors focus:outline-none"
          >
            <LogOut size={20} className="mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
