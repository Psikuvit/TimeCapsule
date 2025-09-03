import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Determine the base URL for redirect URIs
    const headers = request.headers;
    const host = headers.get('host');
    const protocol = headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;
    const redirectUri = `${baseUrl}/auth/callback`;

    // Get OAuth configuration from server side
    const oauthConfig = {
      google: {
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        redirectUri: process.env.GOOGLE_REDIRECT_URI || redirectUri,
        scope: 'openid email profile',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      },
      github: {
        clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
        redirectUri: redirectUri,
        scope: 'read:user user:email',
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userInfoUrl: 'https://api.github.com/user',
      },
    };

    // Validate configuration
    const validation = {
      google: {
        configured: !!(oauthConfig.google.clientId),
        missing: !oauthConfig.google.clientId ? ['NEXT_PUBLIC_GOOGLE_CLIENT_ID'] : [],
      },
      github: {
        configured: !!(oauthConfig.github.clientId),
        missing: !oauthConfig.github.clientId ? ['NEXT_PUBLIC_GITHUB_CLIENT_ID'] : [],
      },
    };

    return NextResponse.json({
      oauthConfig,
      validation,
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Auth config error:', error);
    return NextResponse.json(
      { error: 'Failed to get OAuth configuration' },
      { status: 500 }
    );
  }
}
