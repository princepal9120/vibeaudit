'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type User } from './api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  loginWithGitHub: () => void;
  logout: () => Promise<void>;
  setUserFromToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const userData = await api.getCurrentUser();
          setUser(userData);
        } catch {
          // Token invalid, clear it
          api.setToken(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { user: userData, token } = await api.login(email, password);
    api.setToken(token);
    setUser(userData);
  };

  const signup = async (email: string, password: string, name?: string) => {
    const { user: userData, token } = await api.signup(email, password, name);
    api.setToken(token);
    setUser(userData);
  };

  const loginWithGitHub = () => {
    window.location.href = api.getGitHubAuthUrl();
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore logout errors
    }
    api.setToken(null);
    setUser(null);
  };

  const setUserFromToken = async (token: string) => {
    api.setToken(token);
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
    } catch {
      api.setToken(null);
      throw new Error('Invalid token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        loginWithGitHub,
        logout,
        setUserFromToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
