import { motion } from 'framer-motion';
import { Search, Home, Compass, Video, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { IconButton } from '../ui/Button';

export const Navbar = ({ onMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/explore?q=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-40 bg-slate-900 border-b border-slate-700 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="cursor-pointer flex items-center gap-2"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white">
            V
          </div>
          <span className="hidden sm:inline font-bold text-white text-lg">VideoX</span>
        </motion.div>

        {/* Search Bar - hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search posts, videos, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full bg-slate-800 border border-slate-700 rounded-full pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Right side - desktop */}
        <div className="hidden md:flex items-center gap-4">
          {user && (
            <>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-full hover:bg-slate-800 transition-colors"
                onClick={() => navigate(`/profile/${user._id}`)}
              >
                <img
                  src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
                <span className="hidden sm:inline text-sm font-medium text-white">{user.username}</span>
              </motion.div>
              <IconButton
                icon={LogOut}
                onClick={handleLogout}
                className="text-red-400 hover:bg-red-500/10"
              />
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden">
          <IconButton icon={Menu} onClick={onMobileMenuOpen} />
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 py-2 border-t border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full bg-slate-800 border border-slate-700 rounded-full pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors text-sm"
          />
        </div>
      </div>
    </motion.nav>
  );
};
