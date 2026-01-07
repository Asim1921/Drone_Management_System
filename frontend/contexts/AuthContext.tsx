'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../../shared/types';
import { getToken, getUser, setToken, setUser, removeToken, removeUser } from '../lib/auth';
import api from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: string, profile?: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      const savedUser = getUser();

      if (token && savedUser) {
        try {
          // Verify token is still valid
          const response = await api.get('/auth/me');
          setUserState(response.data.user);
          setUser(response.data.user);
        } catch (error) {
          removeToken();
          removeUser();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    
    // Check if verification is required
    if (response.data.requiresVerification) {
      throw new Error('Email verification required');
    }
    
    const { token, user } = response.data;
    setToken(token);
    setUser(user);
    setUserState(user);
  };

  const register = async (email: string, password: string, role?: string, profile?: any) => {
    const response = await api.post('/auth/register', { email, password, role, profile });
    const { token, user } = response.data;
    setToken(token);
    setUser(user);
    setUserState(user);
  };

  const logout = () => {
    removeToken();
    removeUser();
    setUserState(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

