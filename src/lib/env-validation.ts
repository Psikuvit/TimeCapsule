/**
 * Environment variable validation utility
 * Provides helpful error messages for missing or incorrectly configured variables
 */

export interface EnvVarConfig {
  name: string;
  required: boolean;
  description: string;
  pattern?: RegExp;
  defaultValue?: string;
  generateCommand?: string;
  setupUrl?: string;
}

export const ENV_VARS: Record<string, EnvVarConfig> = {
  // Database
  MONGODB_URI: {
    name: 'MONGODB_URI',
    required: false,
    description: 'MongoDB connection string',
    defaultValue: 'mongodb://127.0.0.1:27017/timecapsule'
  },
  
  // JWT
  JWT_SECRET: {
    name: 'JWT_SECRET',
    required: true,
    description: 'JWT signing secret',
    generateCommand: 'node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"'
  },
  
  // GitHub OAuth
  NEXT_PUBLIC_GITHUB_CLIENT_ID: {
    name: 'NEXT_PUBLIC_GITHUB_CLIENT_ID',
    required: true,
    description: 'GitHub OAuth client ID (public)',
    setupUrl: 'https://github.com/settings/developers'
  },
  GITHUB_CLIENT_SECRET: {
    name: 'GITHUB_CLIENT_SECRET',
    required: true,
    description: 'GitHub OAuth client secret (private)',
    setupUrl: 'https://github.com/settings/developers'
  },
  
  // Google OAuth
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: {
    name: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
    required: true,
    description: 'Google OAuth client ID (public)',
    setupUrl: 'https://console.cloud.google.com/apis/credentials'
  },
  GOOGLE_CLIENT_SECRET: {
    name: 'GOOGLE_CLIENT_SECRET',
    required: true,
    description: 'Google OAuth client secret (private)',
    setupUrl: 'https://console.cloud.google.com/apis/credentials'
  },
  GOOGLE_REDIRECT_URI: {
    name: 'GOOGLE_REDIRECT_URI',
    required: false,
    description: 'Google OAuth redirect URI (optional)'
  },
  
  // Stripe
  STRIPE_SECRET_KEY: {
    name: 'STRIPE_SECRET_KEY',
    required: true,
    description: 'Stripe secret key',
    pattern: /^sk_(test|live)_/,
    defaultValue: 'sk_test_placeholder',
    setupUrl: 'https://dashboard.stripe.com/apikeys'
  },
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: true,
    description: 'Stripe publishable key',
    pattern: /^pk_(test|live)_/,
    defaultValue: 'pk_test_placeholder',
    setupUrl: 'https://dashboard.stripe.com/apikeys'
  },
  PRICE_ID: {
    name: 'PRICE_ID',
    required: true,
    description: 'Stripe price ID',
    pattern: /^price_/,
    defaultValue: 'price_your_stripe_price_id_here',
    setupUrl: 'https://dashboard.stripe.com/products'
  },
  
  // System
  NODE_ENV: {
    name: 'NODE_ENV',
    required: false,
    description: 'Environment mode',
    defaultValue: 'development'
  }
};

export function validateEnvironment(): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const [key, config] of Object.entries(ENV_VARS)) {
    const value = process.env[key];
    const hasValue = value && value !== config.defaultValue;
    
    if (config.required && !hasValue) {
      errors.push(`Missing required environment variable: ${config.name}`);
      if (config.generateCommand) {
        errors.push(`  Generate with: ${config.generateCommand}`);
      }
      if (config.setupUrl) {
        errors.push(`  Setup at: ${config.setupUrl}`);
      }
    } else if (hasValue && config.pattern && !config.pattern.test(value)) {
      errors.push(`Invalid format for ${config.name}: expected pattern ${config.pattern.source}`);
    } else if (!config.required && !hasValue && config.defaultValue) {
      warnings.push(`Using default value for ${config.name}: ${config.defaultValue}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function getEnvValidationSummary() {
  const validation = validateEnvironment();
  const summary = {
    total: Object.keys(ENV_VARS).length,
    configured: 0,
    missing: 0,
    usingDefaults: 0
  };
  
  for (const [key, config] of Object.entries(ENV_VARS)) {
    const value = process.env[key];
    const hasValue = value && value !== config.defaultValue;
    
    if (hasValue) {
      summary.configured++;
    } else if (config.required) {
      summary.missing++;
    } else {
      summary.usingDefaults++;
    }
  }
  
  return {
    ...validation,
    summary
  };
}
