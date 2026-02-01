import { motion } from 'framer-motion';
import { Home, Compass, Video, User, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Explore', icon: Compass, path: '/explore' },
    { label: 'Videos', icon: Video, path: '/videos' },
    user && { label: 'Profile', icon: User, path: `/profile/${user._id}` },
  ].filter(Boolean);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-700 h-screen sticky top-0 p-4"
    >
      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map(({ label, icon: Icon, path }) => (
          <motion.button
            key={path}
            whileHover={{ x: 4 }}
            onClick={() => navigate(path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(path)
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
          </motion.button>
        ))}
      </nav>

      {/* Footer */}
      <div className="space-y-2 pt-4 border-t border-slate-700">
        <motion.button
          whileHover={{ x: 4 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </motion.button>
      </div>
    </motion.aside>
  );
};
