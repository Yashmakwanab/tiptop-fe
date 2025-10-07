'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  firstname: string;
  lastname: string;
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstname: string, lastname: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const response = await api.get('/auth/profile');
        setUser(response.data);
      } catch (error) {
        Cookies.remove('token');
        console.error('Failed to fetch user profile:', error);
      }
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    Cookies.set('token', response.data.access_token, { expires: 7 });
    setUser(response.data.user);
    router.push('/');
  };

  const register = async (email: string, password: string, firstname: string, lastname: string) => {
    const response = await api.post('/auth/register', { email, password, firstname, lastname });
    Cookies.set('token', response.data.access_token, { expires: 7 });
    setUser(response.data.user);
    router.push('/');
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    router.push('/signin');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};