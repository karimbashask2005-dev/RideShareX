import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService, checkBackendHealth, walletService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeUser = (u) => {
    if (!u) return null;
    const normalized = { ...u };
    if (normalized._id && !normalized.id) {
      normalized.id = normalized._id.toString();
    }
    if (normalized.id && !normalized._id) {
      normalized._id = normalized.id;
    }
    return normalized;
  };

  const initAuth = async () => {
    try {
      await checkBackendHealth();
      const token = localStorage.getItem('rx_token');
      
      // If backend is active but we have a mock token, clear it to force real backend login
      if (token && !token.includes('.') && localStorage.getItem('rx_token')) {
        console.log('[Auth] Clearing mock token to transition to real MERN backend.');
        localStorage.removeItem('rx_token');
        localStorage.removeItem('rx_current_user');
        setUser(null);
        setLoading(false);
        return;
      }

      if (token) {
        const userData = await authService.me();
        setUser(normalizeUser(userData));
      }
    } catch (err) {
      console.error('[AuthContext] Auth initialization failed', err);
      // Clear token if invalid
      localStorage.removeItem('rx_token');
      localStorage.removeItem('rx_current_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      if (data.token) {
        localStorage.setItem('rx_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('rx_current_user', JSON.stringify(data.user));
      }
      setUser(normalizeUser(data.user));
      return data.user;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, phone, referralCode, gender) => {
    setLoading(true);
    try {
      const data = await authService.register(name, email, password, phone, referralCode, gender);
      if (data.token) {
        localStorage.setItem('rx_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('rx_current_user', JSON.stringify(data.user));
      }
      setUser(normalizeUser(data.user));
      return data.user;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('rx_token');
      localStorage.removeItem('rx_current_user');
      setUser(null);
    }
  };

  const completeProfile = async (profileData) => {
    try {
      const updatedUser = await authService.completeProfile(profileData);
      localStorage.setItem('rx_current_user', JSON.stringify(updatedUser));
      setUser(normalizeUser(updatedUser));
      return updatedUser;
    } catch (err) {
      throw err;
    }
  };

  const verifyPhone = async () => {
    try {
      const data = await authService.verifyPhone();
      localStorage.setItem('rx_current_user', JSON.stringify(data.user));
      setUser(normalizeUser(data.user));
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  const verifyEmail = async () => {
    try {
      const data = await authService.verifyEmail();
      localStorage.setItem('rx_current_user', JSON.stringify(data.user));
      setUser(normalizeUser(data.user));
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.me();
      localStorage.setItem('rx_current_user', JSON.stringify(userData));
      setUser(normalizeUser(userData));
      return userData;
    } catch (err) {
      console.error('[AuthContext] Refreshing user failed', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        completeProfile,
        verifyPhone,
        verifyEmail,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
