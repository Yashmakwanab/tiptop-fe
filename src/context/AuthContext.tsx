'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Employee } from '@/types/employee';

interface AuthContextType {
  user: Employee | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ requireOtp: boolean; email?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Employee | null>(null);
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

    if (response.data.requireOtp) {
      // OTP required for regular employees
      return {
        requireOtp: true,
        email: response.data.email,
      };
    } else {
      // Super admin - direct login
      Cookies.set('token', response.data.access_token, { expires: 7 });
      setUser(response.data.user);
      router.push('/');
      return {
        requireOtp: false,
      };
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    Cookies.set('token', response.data.access_token, { expires: 7 });
    setUser(response.data.user);
    router.push('/');
  };

  const resendOtp = async (email: string) => {
    await api.post('/auth/resend-otp', { email });
  };

  const register = async (email: string, password: string, firstName: string, LastName: string) => {
    const response = await api.post('/auth/register', { email, password, firstName, LastName });
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
    <AuthContext.Provider value={{ user, loading, login, verifyOtp, resendOtp, register, logout, checkAuth }}>
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