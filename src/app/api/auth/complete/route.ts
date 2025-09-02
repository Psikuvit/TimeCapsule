import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit';
import { signAccessToken } from '@/lib/jwt';
import { userService } from '@/lib/database';
import { authCompleteSchema } from '@/lib/validation';

async function handleAuthComplete(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = authCompleteSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { code, state } = validationResult.data;

    // Decode state to get provider
    let provider: string;
    try {
      const decodedState = JSON.parse(decodeURIComponent(state));
      provider = decodedState.provider;
    } catch {
      return NextResponse.json(
        { error: 'Invalid state parameter' },
        { status: 400 }
      );
    }

    let userData: any;

    if (provider === 'github') {
      // Exchange code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        return NextResponse.json(
          { error: 'GitHub OAuth failed' },
          { status: 400 }
        );
      }

      // Get user profile
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      const user = await userResponse.json();

      // Get primary email if not public
      let email = user.email;
      if (!email) {
        const emailsResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });
        const emails = await emailsResponse.json();
        const primaryEmail = emails.find((e: any) => e.primary && e.verified);
        email = primaryEmail?.email;
      }

      if (!email || !user.name) {
        return NextResponse.json(
          { error: 'Could not retrieve email or name from GitHub' },
          { status: 400 }
        );
      }

      userData = {
        id: user.id.toString(),
        email,
        name: user.name,
        picture: user.avatar_url,
        provider: 'github',
      };
    } else if (provider === 'google') {
      // Exchange code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        return NextResponse.json(
          { error: 'Google OAuth failed' },
          { status: 400 }
        );
      }

      // Get user profile
      const userResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`
      );

      const user = await userResponse.json();

      if (!user.email || !user.name) {
        return NextResponse.json(
          { error: 'Could not retrieve email or name from Google' },
          { status: 400 }
        );
      }

      userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        provider: 'google',
      };
    } else {
      return NextResponse.json(
        { error: 'Unsupported OAuth provider' },
        { status: 400 }
      );
    }

    // Upsert user in database
    const user = await userService.upsertUser(userData);

    // Create JWT token
    const token = signAccessToken({
      userId: user.id,
      email: user.email,
      provider: user.provider,
    });

    // Set HttpOnly cookie
    const response = NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        provider: user.provider,
        isPremium: user.isPremium,
      }
    });

    response.cookies.set('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Auth complete error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(
  handleAuthComplete,
  (req) => {
    // Get IP from headers (X-Forwarded-For for proxies, X-Real-IP for nginx)
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIp || 'unknown';
    return ip;
  }
);


