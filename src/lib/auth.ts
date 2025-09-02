
const api = {
  upsertUser: async (payload: any) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to upsert user');
    return res.json();
  },
  getUserById: async (id: string) => {
    const res = await fetch(`/api/users?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },
  updatePremium: async (userId: string, isPremium: boolean, premiumExpiresAt?: Date) => {
    const res = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isPremium, premiumExpiresAt }),
    });
    if (!res.ok) throw new Error('Failed to update premium');
    return res.json();
  },
  updateProfile: async (userId: string, updates: any) => {
    const res = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...updates }),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },
};

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

// OAuth configuration - will be fetched from server
let OAUTH_CONFIG: any = null;

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
  const oauthConfig = await getOAuthConfig();
  const config = oauthConfig[provider as keyof typeof oauthConfig];
  
  if (!config?.clientId) {
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

  const oauthConfig = await getOAuthConfig();
  const config = oauthConfig[provider as keyof typeof oauthConfig];
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

    const { userId } = await tokenResponse.json();
    // Fetch session user via cookie-based session
    const dbUser = await api.getUserById(userId);

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

const fetchUserProfile = async (provider: string, accessToken: string, userInfoUrl: string): Promise<any> => {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
  };

  // GitHub requires User-Agent header
  if (provider === 'github') {
    headers['User-Agent'] = 'TimeCapsule-App';
  }

  const response = await fetch(userInfoUrl, { headers });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
};

// Helper: derive a reasonable display name
const resolveName = (userInfo: any): string | null => {
  const candidate = userInfo?.name || userInfo?.login || userInfo?.username || null;
  if (!candidate) return null;
  return String(candidate);
};

// Helper: ensure we have a provider id
const resolveProviderId = (userInfo: any): string => {
  const id = userInfo?.id ?? userInfo?.sub ?? null;
  if (!id) return `oauth_${Date.now()}`;
  return String(id);
};

// Helper: resolve email, including GitHub secondary API when needed
const resolveEmail = async (provider: string, accessToken: string, userInfo: any): Promise<string | null> => {
  // Google normally returns email when scope includes 'email'
  if (provider === 'google') {
    return userInfo?.email ?? null;
  }

  if (provider === 'github') {
    if (userInfo?.email) return userInfo.email;
    // Fallback: call the user/emails endpoint to get primary verified email
    try {
      const res = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'TimeCapsule-App',
        },
      });
      if (!res.ok) return null;
      const emails = await res.json();
      if (Array.isArray(emails)) {
        const primary = emails.find((e: any) => e?.primary && e?.verified) || emails.find((e: any) => e?.primary) || emails.find((e: any) => e?.verified);
        return primary?.email ?? null;
      }
    } catch {
      return null;
    }
  }

  return userInfo?.email ?? null;
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
  const config = OAUTH_CONFIG[provider as keyof typeof OAUTH_CONFIG];
  return !!(config?.clientId);
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
