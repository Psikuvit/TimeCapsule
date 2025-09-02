import { NextRequest, NextResponse } from 'next/server';
import { ENV_VARS, getEnvValidationSummary } from '@/lib/env-validation';

export async function GET(request: NextRequest) {
  try {
    // Get environment validation from server side
    const envValidation = getEnvValidationSummary();
    
    // Create a safe version for client (only show NEXT_PUBLIC_ variables)
    const clientSafeEnvVars: Record<string, any> = {};
    
    for (const [key, config] of Object.entries(ENV_VARS)) {
      const value = process.env[key];
      const hasValue = value && value !== config.defaultValue;
      
      // Only expose NEXT_PUBLIC_ variables to client
      if (key.startsWith('NEXT_PUBLIC_')) {
        clientSafeEnvVars[key] = {
          ...config,
          value: hasValue ? value : null,
          hasValue,
          isConfigured: hasValue
        };
      } else {
        // For server-only variables, just show if they're configured
        clientSafeEnvVars[key] = {
          ...config,
          value: null, // Don't expose server values
          hasValue,
          isConfigured: hasValue
        };
      }
    }
    
    return NextResponse.json({
      envValidation,
      envVars: clientSafeEnvVars,
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug env error:', error);
    return NextResponse.json(
      { error: 'Failed to get environment information' },
      { status: 500 }
    );
  }
}
