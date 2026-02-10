import { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../utils/AuthService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        if (AuthService.isAuthenticated()) {
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        AuthService.removeToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const data = await AuthService.login(email, password);
    setUser(data.user);
    return data;
  };

  const signup = async (name, email, password) => {
    const data = await AuthService.signup(name, email, password);
    setUser(data.user);
    return data;
  };

  const guestLogin = async (name) => {
    const data = await AuthService.guestLogin(name);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const data = await AuthService.updateProfile(updates);
    setUser(data.user);
    return data;
  };

  const uploadAvatar = async (file) => {
    const data = await AuthService.uploadAvatar(file);
    const updatedUser = { ...user, avatar: data.avatar };
    setUser(updatedUser);
    return data;
  };

  const setPresetAvatar = async (avatarUrl) => {
    const data = await AuthService.setPresetAvatar(avatarUrl);
    const updatedUser = { ...user, avatar: data.avatar };
    setUser(updatedUser);
    return data;
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isGuest: user?.isGuest || false,
    login,
    signup,
    guestLogin,
    logout,
    updateProfile,
    uploadAvatar,
    setPresetAvatar
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
