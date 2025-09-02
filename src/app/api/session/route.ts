import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { userService } from '@/lib/database';
import { withRateLimit } from '@/lib/rate-limit';

async function handleGetSession(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token');

    if (!token) {
      return NextResponse.json(
        { error: 'No access token found' },
        { status: 401 }
      );
    }

    try {
      const payload = verifyAccessToken(token.value);
      const user = await userService.getUserById(payload.userId);

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          provider: user.provider,
          isPremium: user.isPremium,
          premiumExpiresAt: user.premiumExpiresAt,
        }
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(
  handleGetSession,
  (req) => {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIp || 'unknown';
    return ip;
  }
);


