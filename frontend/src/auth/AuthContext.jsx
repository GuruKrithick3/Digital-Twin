import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authLogin, authLogout, authMe } from '../services/api';

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    authMe()
      .then((res) => {
        if (mounted && res.data && res.data.user) setUser(res.data.user);
      })
      .catch(() => {
        // no valid session
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await authLogin({ username, password });
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authLogout();
    } catch (e) {
      // ignore network errors on logout
    }
    setUser(null);
  }, []);

  const value = { user, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
