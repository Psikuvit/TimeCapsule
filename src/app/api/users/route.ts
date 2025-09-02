import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { userService } from '@/lib/database';
import { updateUserSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      const payload = verifyAccessToken(token.value);
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('id');

      if (!userId) {
        return NextResponse.json(
          { error: 'User ID is required' },
          { status: 400 }
        );
      }

      // Users can only access their own data
      if (userId !== payload.userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      const user = await userService.getUserById(userId);
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
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      const payload = verifyAccessToken(token.value);
      const body = await request.json();
      
      // Validate input
      const validationResult = updateUserSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { 
            error: 'Validation failed', 
            details: validationResult.error.issues 
          },
          { status: 400 }
        );
      }

      const { name, email } = validationResult.data;

      // Users can only update their own profile
      const updatedUser = await userService.updateUser(payload.userId, {
        name,
        email,
      });

      if (!updatedUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          picture: updatedUser.picture,
          provider: updatedUser.provider,
          isPremium: updatedUser.isPremium,
          premiumExpiresAt: updatedUser.premiumExpiresAt,
        }
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      const payload = verifyAccessToken(token.value);
      const body = await request.json();
      
      // Validate input
      const validationResult = updateUserSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { 
            error: 'Validation failed', 
            details: validationResult.error.issues 
          },
          { status: 400 }
        );
      }

      const { name, email } = validationResult.data;

      // Users can only update their own profile
      const updatedUser = await userService.updateUser(payload.userId, {
        name,
        email,
      });

      if (!updatedUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          picture: updatedUser.picture,
          provider: updatedUser.provider,
          isPremium: updatedUser.isPremium,
          premiumExpiresAt: updatedUser.premiumExpiresAt,
        }
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}



