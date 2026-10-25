import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../api/client';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  eco_points: number;
  avatar_url?: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const data = await apiRequest<User>('/api/v1/auth/me');
      setUser(data);
    } catch (err) {
      console.warn('Failed to load user profile, token may be expired:', err);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const data = await apiRequest<{ access_token: string; user: User }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const register = async (fullName: string, email: string, password: string) => {
    const data = await apiRequest<{ access_token: string; user: User }>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ full_name: fullName, email, password }),
    });
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const data = await apiRequest<User>('/api/v1/auth/me');
        setUser(data);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
