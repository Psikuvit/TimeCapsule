'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OAUTH_PROVIDERS, OAuthProvider } from '@/lib/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, isLoading } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authConfig, setAuthConfig] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Fetch OAuth configuration when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchConfig = async () => {
        try {
          setConfigLoading(true);
          const response = await fetch('/api/auth/config');
          if (response.ok) {
            const data = await response.json();
            setAuthConfig(data);
          } else {
            console.error('Failed to fetch OAuth config');
            setAuthConfig(null);
          }
        } catch (error) {
          console.error('Error fetching OAuth config:', error);
          setAuthConfig(null);
        } finally {
          setConfigLoading(false);
        }
      };
      
      fetchConfig();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Show loading while fetching config
  if (configLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading authentication options...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleLogin = async (provider: OAuthProvider) => {
    try {
      setError(null);
      setSelectedProvider(provider);
      
      await login(provider);
      // Note: login() now redirects to OAuth provider, so this won't execute
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
      console.error('Login error:', error);
      setSelectedProvider(null);
    }
  };

  const getProviderIcon = (provider: OAuthProvider) => {
    switch (provider) {
      case OAUTH_PROVIDERS.GOOGLE:
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        );
      case OAUTH_PROVIDERS.GITHUB:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      case OAUTH_PROVIDERS.FACEBOOK:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
      case OAUTH_PROVIDERS.TWITTER:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getProviderName = (provider: OAuthProvider) => {
    switch (provider) {
      case OAUTH_PROVIDERS.GOOGLE:
        return 'Google';
      case OAUTH_PROVIDERS.GITHUB:
        return 'GitHub';
      case OAUTH_PROVIDERS.FACEBOOK:
        return 'Facebook';
      case OAUTH_PROVIDERS.TWITTER:
        return 'Twitter';
      default:
        return provider;
    }
  };

  const getProviderColor = (provider: OAuthProvider) => {
    switch (provider) {
      case OAUTH_PROVIDERS.GOOGLE:
        return 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300';
      case OAUTH_PROVIDERS.GITHUB:
        return 'bg-gray-800 hover:bg-gray-900 text-white border-gray-700';
      case OAUTH_PROVIDERS.FACEBOOK:
        return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600';
      case OAUTH_PROVIDERS.TWITTER:
        return 'bg-blue-400 hover:bg-blue-500 text-white border-blue-400';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600';
    }
  };

  // Helper function to check if provider is configured
  const isProviderConfigured = (provider: OAuthProvider): boolean => {
    if (!authConfig?.validation) return false;
    return authConfig.validation[provider]?.configured || false;
  };

  // Filter only configured OAuth providers based on fetched config
  const configuredProviders = Object.values(OAUTH_PROVIDERS).filter(isProviderConfigured);

  if (configuredProviders.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">OAuth Not Configured</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No OAuth providers are configured. Please set up OAuth credentials in your environment variables.
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-left text-sm">
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Required environment variables:</p>
              <code className="text-gray-600 dark:text-gray-400">GOOGLE_CLIENT_ID</code><br/>
              <code className="text-gray-600 dark:text-gray-400">GOOGLE_CLIENT_SECRET</code><br/>
              <code className="text-gray-600 dark:text-gray-400">NEXT_PUBLIC_GITHUB_CLIENT_ID</code><br/>
              <code className="text-gray-600 dark:text-gray-400">GITHUB_CLIENT_SECRET</code>
            </div>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Sign In</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Choose your preferred sign-in method to continue
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {configuredProviders.map((provider) => (
            <button
              key={provider}
              onClick={() => handleLogin(provider)}
              disabled={isLoading || selectedProvider === provider}
              className={`w-full flex items-center justify-center px-4 py-3 border rounded-md transition-colors duration-200 font-medium ${
                getProviderColor(provider)
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {getProviderIcon(provider)}
              <span className="ml-3">
                {isLoading && selectedProvider === provider ? 'Redirecting...' : `Continue with ${getProviderName(provider)}`}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
