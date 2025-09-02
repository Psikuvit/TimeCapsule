import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, provider, redirectUri } = await request.json();

    console.log('Token exchange request:', { provider, redirectUri, hasCode: !!code });

    if (!code || !provider || !redirectUri) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let accessToken: string;

    if (provider === 'google') {
      accessToken = await exchangeGoogleToken(code, redirectUri);
    } else if (provider === 'github') {
      accessToken = await exchangeGitHubToken(code, redirectUri);
    } else {
      return NextResponse.json(
        { error: 'Unsupported OAuth provider' },
        { status: 400 }
      );
    }

    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('Token exchange error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to exchange authorization code for token: ${errorMessage}` },
      { status: 500 }
    );
  }
}

async function exchangeGoogleToken(code: string, redirectUri: string): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  console.log('Google OAuth config:', { 
    hasClientId: !!clientId, 
    hasClientSecret: !!clientSecret,
    redirectUri 
  });

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured. Please check NEXT_PUBLIC_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
  }

  const tokenRequest = {
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  };

  console.log('Google token request params:', { ...tokenRequest, client_secret: '[HIDDEN]' });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(tokenRequest),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google token exchange failed:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`Google token exchange failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  console.log('Google token response:', { hasAccessToken: !!data.access_token, tokenType: data.token_type });
  
  if (!data.access_token) {
    throw new Error('No access token received from Google');
  }

  return data.access_token;
}

async function exchangeGitHubToken(code: string, redirectUri: string): Promise<string> {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('GitHub OAuth credentials not configured');
  }

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub token exchange failed: ${error}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
  }

  return data.access_token;
}
