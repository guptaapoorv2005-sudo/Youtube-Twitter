import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Compass, Video, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const MobileNav = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Explore', icon: Compass, path: '/explore' },
    { label: 'Videos', icon: Video, path: '/videos' },
    user && { label: 'Profile', icon: User, path: `/profile/${user._id}` },
  ].filter(Boolean);

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.nav
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed left-0 top-0 h-full w-72 bg-slate-900 border-r border-slate-700 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h2 className="font-bold text-white text-lg">Menu</h2>
              <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 space-y-2 p-4">
              {navItems.map(({ label, icon: Icon, path }) => (
                <motion.button
                  key={path}
                  whileHover={{ x: 4 }}
                  onClick={() => handleNavigate(path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Icon size={20} />
                  <span className="font-medium">{label}</span>
                </motion.button>
              ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700 space-y-2">
              {user && (
                <div className="px-4 py-3 rounded-lg bg-slate-800 flex items-center gap-2">
                  <img
                    src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                    alt={user.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{user.username}</p>
                    <p className="text-slate-400 text-xs">{user.email}</p>
                  </div>
                </div>
              )}
              <motion.button
                whileHover={{ x: 4 }}
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </motion.button>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
};
