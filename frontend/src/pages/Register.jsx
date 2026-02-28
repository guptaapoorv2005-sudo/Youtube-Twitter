import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, Eye, EyeOff, Camera } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const avatarRef = useRef(null);
  const coverRef = useRef(null);

  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.fullName.trim() || !form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setError('All fields are required');
      return;
    }
    if (!avatarFile) {
      setError('Avatar image is required');
      return;
    }

    const formData = new FormData();
    formData.append('fullName', form.fullName.trim());
    formData.append('username', form.username.trim());
    formData.append('email', form.email.trim());
    formData.append('password', form.password);
    formData.append('avatar', avatarFile);
    if (coverFile) formData.append('coverImage', coverFile);

    setLoading(true);
    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="rounded-2xl border border-dark-800 bg-dark-900 p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-accent-500 to-brand-500">
            <Film className="h-7 w-7 text-white" />
          </div>
          <h1 className="bg-linear-to-r from-accent-400 to-brand-400 bg-clip-text text-2xl font-bold text-transparent">
            Create account
          </h1>
          <p className="mt-1 text-sm text-dark-400">Join VidTweet today</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar upload */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-dark-600 bg-dark-800 transition-colors hover:border-accent-500"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-6 w-6 text-dark-500" />
              )}
              <input
                ref={avatarRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </button>
            <div>
              <p className="text-sm font-medium text-dark-200">Profile photo *</p>
              <p className="text-xs text-dark-500">Click to upload avatar</p>
            </div>
          </div>

          <Input
            label="Full Name"
            placeholder="Your full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <Input
            label="Username"
            placeholder="Choose a username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="Your email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-dark-400 hover:text-dark-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Optional cover image */}
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-1.5">Cover Image (optional)</label>
            <button
              type="button"
              onClick={() => coverRef.current?.click()}
              className="w-full rounded-xl border border-dashed border-dark-600 bg-dark-800 py-3 text-sm text-dark-400 transition-colors hover:border-accent-500 hover:text-dark-200"
            >
              {coverFile ? coverFile.name : 'Choose cover image'}
            </button>
            <input
              ref={coverRef}
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>

          <Button type="submit" variant="brand" className="w-full" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-dark-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent-400 hover:text-accent-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
