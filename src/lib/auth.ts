
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  isAuthenticated: boolean;
  provider: string;
  accessToken?: string;
  isPremium: boolean;
  premiumExpiresAt?: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// OAuth providers
export const OAUTH_PROVIDERS = {
  GOOGLE: 'google',
  GITHUB: 'github',
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
} as const;

export type OAuthProvider = typeof OAUTH_PROVIDERS[keyof typeof OAUTH_PROVIDERS];

interface OAuthProviderConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
}

interface OAuthConfig {
  [provider: string]: OAuthProviderConfig;
}

interface OAuthValidation {
  [provider: string]: {
    configured: boolean;
    missing?: string[];
  };
}

interface OAuthConfigResponse {
  oauthConfig: OAuthConfig;
  validation: OAuthValidation;
  serverTime: string;
}

// OAuth configuration - will be fetched from server
let OAUTH_CONFIG: OAuthConfigResponse | null = null;

// Function to get OAuth configuration from server
async function getOAuthConfig() {
  if (OAUTH_CONFIG) return OAUTH_CONFIG;
  
  try {
    const response = await fetch('/api/auth/config');
    if (response.ok) {
      const data = await response.json();
      OAUTH_CONFIG = data.oauthConfig;
      return OAUTH_CONFIG;
    } else {
      throw new Error('Failed to fetch OAuth configuration');
    }
  } catch (error) {
    console.error('Error fetching OAuth config:', error);
    throw new Error('OAuth configuration not available');
  }
}

// Authentication functions
export const login = async (provider: OAuthProvider): Promise<void> => {
  try {
    console.log('Starting login process for provider:', provider);
    
    const configResponse = await getOAuthConfig();
    console.log('Config response received:', configResponse);
    
    if (!configResponse) {
      throw new Error('OAuth configuration not available. Please check your environment variables.');
    }
    
    if (!configResponse.oauthConfig) {
      throw new Error('OAuth configuration object is missing from server response.');
    }
    
    const config = configResponse.oauthConfig[provider as keyof typeof configResponse.oauthConfig];
    console.log(`Config for ${provider}:`, config);
    
    if (!config) {
      throw new Error(`OAuth configuration for ${provider} is not found. Available providers: ${Object.keys(configResponse.oauthConfig).join(', ')}`);
    }
    
    if (!config.clientId) {
      throw new Error(`${provider} OAuth is not configured. Please set NEXT_PUBLIC_${provider.toUpperCase()}_CLIENT_ID environment variable.`);
    }

    // Generate state parameter for security
    const nonce = generateRandomState();
    const stateData = { nonce, provider };
    const state = encodeURIComponent(JSON.stringify(stateData));
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_provider', provider);

    // Build OAuth URL
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope,
      response_type: 'code',
      state: state,
      ...(provider === 'google' && { access_type: 'offline' }),
    });

    const authUrl = `${config.authUrl}?${params.toString()}`;
    
    // Redirect to OAuth provider
    window.location.href = authUrl;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const handleOAuthCallback = async (code: string, state: string, incomingProvider: string): Promise<User> => {
  // Verify state parameter
  const storedState = sessionStorage.getItem('oauth_state');
  const storedProvider = sessionStorage.getItem('oauth_provider');
  const parsedProvider = parseProviderFromState(state);
  const provider = storedProvider || parsedProvider || incomingProvider;
  
  console.log('OAuth callback:', { provider, storedProvider, state, storedState });
  
  if (state !== storedState || (storedProvider && provider !== storedProvider)) {
    throw new Error('Invalid OAuth state. Please try again.');
  }

  // Clear stored OAuth data
  sessionStorage.removeItem('oauth_state');
  sessionStorage.removeItem('oauth_provider');

  const configResponse = await getOAuthConfig();
  if (!configResponse) {
    throw new Error('OAuth configuration not available');
  }
  
  const config = configResponse.oauthConfig[provider as keyof typeof configResponse.oauthConfig];
  if (!config) {
    throw new Error(`Unsupported OAuth provider: ${provider}`);
  }

  // Ensure redirect URI matches exactly what was used in the initial request
  const redirectUri = `${window.location.origin}/auth/callback`;
  
  console.log('Processing OAuth callback with:', { provider, redirectUri });

  try {
    // Exchange authorization code, upsert user, set cookies server-side
    const tokenResponse = await fetch('/api/auth/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        state,
        redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(errorData.error || 'Failed to exchange authorization code for token');
    }

    const { user: dbUser } = await tokenResponse.json();

    // Create user object for frontend
    const user: User = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      picture: dbUser.picture || undefined,
      isAuthenticated: true,
      provider,
      isPremium: dbUser.isPremium,
      premiumExpiresAt: dbUser.premiumExpiresAt || undefined,
    };

    // No localStorage; cookies carry session. Notify app to refresh.
    try { window.dispatchEvent(new Event('auth-updated')); } catch {}

    return user;
  } catch (error) {
    console.error('OAuth callback error:', error);
    throw new Error('Authentication failed. Please try again.');
  }
};

export const logout = async (): Promise<void> => {
  await fetch('/api/auth/logout', { method: 'POST' });
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (typeof window === 'undefined') return null;
  try {
    const { user } = await fetch('/api/session', { cache: 'no-store' }).then(r => r.json());
    return user ?? null;
  } catch {
    return null;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return !!user;
};

export const refreshUser = async (): Promise<User | null> => {
  return getCurrentUser();
};

// Check if user has premium access
export const hasPremiumAccess = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;
  if (!user.isPremium) return false;
  if (user.premiumExpiresAt && new Date(user.premiumExpiresAt) < new Date()) return false;
  return true;
};

// Update user profile
export const updateUserProfile = async (updates: Partial<User>): Promise<User> => {
  try {
    const response = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }
    
    const updatedUser = await response.json();
    return updatedUser;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Utility functions
const generateRandomState = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Check if OAuth provider is configured
export const isOAuthProviderConfigured = (provider: OAuthProvider): boolean => {
  if (!OAUTH_CONFIG || typeof OAUTH_CONFIG !== 'object') return false;
  const config = OAUTH_CONFIG.validation[provider as keyof typeof OAUTH_CONFIG.validation];
  if (!config || typeof config !== 'object') return false;
  return !!config.configured;
};

const parseProviderFromState = (state: string | null): string | null => {
  if (!state) return null;
  try {
    const decodedState = JSON.parse(decodeURIComponent(state));
    return decodedState.provider || null;
  } catch {
    // Fallback for old format
    const idx = state.indexOf(':');
    if (idx === -1) return null;
    return state.slice(idx + 1);
  }
};
