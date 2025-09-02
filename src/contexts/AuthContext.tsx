'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthState, login, logout, refreshUser, updateUserProfile, OAuthProvider } from '@/lib/auth';
import { useMemo } from 'react';

interface AuthContextType extends AuthState {
  login: (provider: OAuthProvider) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await fetch('/api/session', { cache: 'no-store' })
          .then(r => r.json())
          .then(d => d.user as User | null)
          .catch(() => null);
        if (user) {
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initializeAuth();

    const onAuthUpdated = () => {
      initializeAuth();
    };
    window.addEventListener('auth-updated', onAuthUpdated);
    return () => window.removeEventListener('auth-updated', onAuthUpdated);
  }, []);

  // Listen for storage changes (when user logs in/out in another tab)
  useEffect(() => {
    const handleStorageChange = async () => {
      const user = await fetch('/api/session', { cache: 'no-store' })
        .then(r => r.json())
        .then(d => d.user as User | null)
        .catch(() => null);
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: !!user,
      });
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogin = async (provider: OAuthProvider) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // login() now redirects to OAuth provider
      await login(provider);
      
      // Note: This won't execute due to redirect, but keeping for error handling
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      await logout();
      
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const handleUpdateProfile = async (updates: Partial<User>) => {
    try {
      const updatedUser = await updateUserProfile(updates);
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const handleRefreshUser = async () => {
    try {
      const user = await refreshUser();
      
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: !!user,
      });
    } catch (error) {
      console.error('User refresh error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const value: AuthContextType = {
    ...authState,
    login: handleLogin,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
    refreshUserData: handleRefreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
