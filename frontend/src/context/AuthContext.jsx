import { createContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, loginUser as loginApi, logoutUser as logoutApi, registerUser as registerApi } from '../api/authApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Listen for forced logout from axios interceptor
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      setLoading(false);
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  const login = async (credentials) => {
    const { user: loggedInUser } = await loginApi(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (formData) => {
    const registeredUser = await registerApi(formData);
    return registeredUser;
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}
