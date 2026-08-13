import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // App load hote hi check karo ke pehle se login session hai ya nahi
  useEffect(() => {
    const storedUser = localStorage.getItem('cc_user');
    const token = localStorage.getItem('cc_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function - backend ko email/password bhejta hai
  const login = async (email, password) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('cc_token', data.token);
    localStorage.setItem('cc_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  // Signup function - backend ko naya user data bhejta hai
  const signup = async (payload) => {
    const { data } = await apiClient.post('/auth/signup', payload);
    localStorage.setItem('cc_token', data.token);
    localStorage.setItem('cc_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    setUser(null);
  };

  const value = { user, setUser, loading, login, signup, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook - isse hum kisi bhi page mein user info access kar sakenge
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}