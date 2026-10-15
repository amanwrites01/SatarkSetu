import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api.js';

const AuthContext = createContext(null);
const TOKEN_KEY = 'satarksetu-user-token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY) || '';
    } catch {
      return '';
    }
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify user on mount or token change
  useEffect(() => {
    let ignore = false;
    async function verify() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await api.auth.me(token);
        if (!ignore) {
          setUser(res.user);
        }
      } catch (err) {
        if (!ignore) {
          try {
            localStorage.removeItem(TOKEN_KEY);
          } catch {
            /* storage blocked */
          }
          setToken('');
          setUser(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    verify();
    return () => {
      ignore = true;
    };
  }, [token]);

  const login = useCallback(async (email, password) => {
    const res = await api.auth.login({ email, password });
    try {
      localStorage.setItem(TOKEN_KEY, res.token);
    } catch {
      /* storage blocked */
    }
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (email, password, name) => {
    const res = await api.auth.register({ email, password, name });
    try {
      localStorage.setItem(TOKEN_KEY, res.token);
    } catch {
      /* storage blocked */
    }
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      try {
        await api.auth.logout(token);
      } catch {
        /* ignore network failures on logout */
      }
    }
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage blocked */
    }
    setToken('');
    setUser(null);
  }, [token]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
