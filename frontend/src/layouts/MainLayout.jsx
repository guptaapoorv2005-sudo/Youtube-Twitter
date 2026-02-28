import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  ThumbsUp,
  History,
  ListVideo,
  Users,
  Upload,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Film,
} from 'lucide-react';

const sidebarLinks = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/liked-videos', icon: ThumbsUp, label: 'Liked Videos' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/playlists', icon: ListVideo, label: 'Playlists' },
  { to: '/subscriptions', icon: Users, label: 'Subscriptions' },
  { to: '/upload', icon: Upload, label: 'Upload' },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-accent-500/15 text-accent-400 shadow-sm'
        : 'text-dark-300 hover:bg-dark-800 hover:text-dark-100'
    }`;

  return (
    <div className="flex h-screen overflow-hidden bg-dark-950">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed z-50 flex h-full w-64 flex-col border-r border-dark-800 bg-dark-900 transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-dark-800 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-accent-500 to-brand-500">
            <Film className="h-5 w-5 text-white" />
          </div>
          <span className="bg-linear-to-r from-accent-400 to-brand-400 bg-clip-text text-xl font-bold text-transparent">
            XTube
          </span>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5 text-dark-400" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {sidebarLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={linkClasses}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-dark-800 p-4">
          <NavLink
            to={`/channel/${user?.username}`}
            className="mb-3 flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-dark-800"
            onClick={() => setSidebarOpen(false)}
          >
            <img
              src={user?.avatar}
              alt={user?.fullName}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-dark-700"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-dark-100">{user?.fullName}</p>
              <p className="truncate text-xs text-dark-400">@{user?.username}</p>
            </div>
          </NavLink>
          <div className="flex gap-2">
            <NavLink
              to="/settings"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-dark-800 px-3 py-2 text-xs text-dark-300 transition-colors hover:bg-dark-700 hover:text-dark-100"
              onClick={() => setSidebarOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Settings
            </NavLink>
            <button
              onClick={handleLogout}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-dark-800 px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 border-b border-dark-800 bg-dark-900/80 px-4 py-3 backdrop-blur-sm">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6 text-dark-300" />
          </button>

          <form onSubmit={handleSearch} className="relative mx-auto w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-dark-700 bg-dark-800 py-2.5 pl-10 pr-4 text-sm text-dark-100 placeholder-dark-500 outline-none transition-colors focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30"
            />
          </form>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
