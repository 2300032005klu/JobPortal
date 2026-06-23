import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';

export type Role = 'CANDIDATE' | 'RECRUITER';


export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
  skills?: string[];
  experience?: string;
  resumeUrl?: string;
  resume_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string, role: Role) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'token';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // Backward-compatible alias (existing code uses refreshUser)
  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  useEffect(() => {
    fetchCurrentUser().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authService.login({ email, password });

      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setUser(res.user);

      // Immediately sync AuthContext from backend using the new token
      await fetchCurrentUser();

      return res;
    } finally {
      setLoading(false);
    }
  };



  const register = async (name: string, email: string, password: string, role: Role) => {
    setLoading(true);
    try {
      const res = await authService.register({ name, email, password, role });

      // backend might or might not return token; handle both
      if (res?.token) {
        localStorage.setItem(TOKEN_KEY, res.token);
      }
      if (res?.user) {
        localStorage.setItem('user', JSON.stringify(res.user));
        setUser(res.user);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // Clear UI state instantly (even if backend call is slow)
    setUser(null);
    setLoading(false);

    try {
      await authService.logout();
    } catch {
      // ignore network/server errors on logout
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('user');
    }
  };


  const value = useMemo<AuthContextType>(
    () => ({ user, loading, login, register, logout, refreshUser }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading]
  );


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
