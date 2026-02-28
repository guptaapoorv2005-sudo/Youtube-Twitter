import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import Watch from '../pages/Watch';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import LikedVideos from '../pages/LikedVideos';
import History from '../pages/History';
import Subscriptions from '../pages/Subscriptions';
import Upload from '../pages/Upload';
import EditVideo from '../pages/EditVideo';
import Playlists from '../pages/Playlists';
import PlaylistDetail from '../pages/PlaylistDetail';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="/watch/:videoId" element={<Watch />} />
            <Route path="/channel/:username" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/liked-videos" element={<LikedVideos />} />
            <Route path="/history" element={<History />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/edit/:videoId" element={<EditVideo />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/playlists/:playlistId" element={<PlaylistDetail />} />
          </Route>

          {/* Catch-all -> redirect to home */}
          <Route path="*" element={<Login />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
