import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('linkvault-token'));
  const [loading, setLoading] = useState(true);

  const saveAuth = useCallback((nextToken, nextUser) => {
    if (nextToken) {
      localStorage.setItem('linkvault-token', nextToken);
    } else {
      localStorage.removeItem('linkvault-token');
    }
    setToken(nextToken || null);
    setUser(nextUser || null);
  }, []);

  const fetchMe = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUser(response.data?.data?.user || null);
    } catch (error) {
      saveAuth(null, null);
    } finally {
      setLoading(false);
    }
  }, [token, saveAuth]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = useCallback(async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    const data = response.data?.data;
    saveAuth(data?.token, data?.user);
    return data;
  }, [saveAuth]);

  const register = useCallback(async (name, email, password) => {
    const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
    const data = response.data?.data;
    saveAuth(data?.token, data?.user);
    return data;
  }, [saveAuth]);

  const logout = useCallback(() => {
    saveAuth(null, null);
  }, [saveAuth]);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    register,
    logout
  }), [user, token, loading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
