import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Camera } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { changePassword, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from '../api/userApi';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';

export default function Settings() {
  const { user, refreshUser } = useAuth();

  // Account tab
  const [tab, setTab] = useState('account');

  // Account form
  const [accountForm, setAccountForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountMsg, setAccountMsg] = useState('');

  // Password form
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');

  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    setAccountMsg('');
    setAccountLoading(true);
    try {
      await updateAccountDetails({
        fullName: accountForm.fullName.trim() || undefined,
        email: accountForm.email.trim() || undefined,
      });
      await refreshUser();
      setAccountMsg('Account updated successfully');
    } catch (err) {
      setAccountMsg(err.response?.data?.message || 'Update failed');
    } finally {
      setAccountLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      setPasswordMsg('Both fields are required');
      return;
    }
    setPasswordLoading(true);
    try {
      await changePassword(passwordForm);
      setPasswordMsg('Password changed successfully');
      setPasswordForm({ oldPassword: '', newPassword: '' });
    } catch (err) {
      setPasswordMsg(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      await updateUserAvatar(formData);
      await refreshUser();
    } catch (err) {
      console.error('Avatar update failed:', err);
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('coverImage', file);
    try {
      await updateUserCoverImage(formData);
      await refreshUser();
    } catch (err) {
      console.error('Cover update failed:', err);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-2xl font-bold text-dark-100"
      >
        Settings
      </motion.h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-dark-900 p-1 w-fit border border-dark-800">
        {[
          { id: 'account', label: 'Account', icon: User },
          { id: 'security', label: 'Security', icon: Lock },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`relative flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
              tab === id ? 'text-white' : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            {tab === id && (
              <motion.div
                layoutId="settingsTab"
                className="absolute inset-0 rounded-lg bg-linear-to-r from-accent-500 to-brand-500"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </span>
          </button>
        ))}
      </div>

      {tab === 'account' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Images */}
          <div className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
            <h3 className="mb-4 font-semibold text-dark-100">Profile Images</h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar src={user?.avatar} alt={user?.fullName} size="xl" />
                <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-accent-500 p-1.5 text-white shadow-lg hover:bg-accent-600">
                  <Camera className="h-3.5 w-3.5" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-dark-200">Avatar</p>
                <p className="text-xs text-dark-400">Click the camera icon to change</p>
                <label className="mt-3 inline-block cursor-pointer rounded-lg bg-dark-800 px-3 py-1.5 text-xs text-dark-300 hover:bg-dark-700 transition-colors">
                  Update Cover Image
                  <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Account details */}
          <div className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
            <h3 className="mb-4 font-semibold text-dark-100">Account Details</h3>
            {accountMsg && (
              <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${
                accountMsg.includes('success') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {accountMsg}
              </div>
            )}
            <form onSubmit={handleAccountUpdate} className="space-y-4">
              <Input
                label="Full Name"
                value={accountForm.fullName}
                onChange={(e) => setAccountForm({ ...accountForm, fullName: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={accountForm.email}
                onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
              />
              <Button type="submit" variant="brand" size="sm" loading={accountLoading}>
                Save Changes
              </Button>
            </form>
          </div>
        </motion.div>
      )}

      {tab === 'security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
            <h3 className="mb-4 font-semibold text-dark-100">Change Password</h3>
            {passwordMsg && (
              <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${
                passwordMsg.includes('success') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {passwordMsg}
              </div>
            )}
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                placeholder="Enter current password"
              />
              <Input
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Enter new password"
              />
              <Button type="submit" variant="brand" size="sm" loading={passwordLoading}>
                Change Password
              </Button>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
}
