import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { timeCapsuleService } from '@/lib/database';
import { withRateLimit } from '@/lib/rate-limit';
import { createCapsuleSchema } from '@/lib/validation';

async function handleGetCapsules(req: NextRequest) {
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
      const capsules = await timeCapsuleService.getUserTimeCapsules(payload.userId);

      return NextResponse.json({ capsules });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Get capsules error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch capsules' },
      { status: 500 }
    );
  }
}

async function handleCreateCapsule(req: NextRequest) {
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
      const body = await req.json();
      
      // Validate input
      const validationResult = createCapsuleSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { 
            error: 'Validation failed', 
            details: validationResult.error.issues 
          },
          { status: 400 }
        );
      }

      const { message, deliveryDate } = validationResult.data;

      const capsule = await timeCapsuleService.createTimeCapsule({
        userId: payload.userId,
        message,
        deliveryDate: new Date(deliveryDate),
      });

      return NextResponse.json({ capsule });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Create capsule error:', error);
    return NextResponse.json(
      { error: 'Failed to create capsule' },
      { status: 500 }
    );
  }
}

async function handleDeleteCapsule(req: NextRequest) {
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
      const { searchParams } = new URL(req.url);
      const capsuleId = searchParams.get('id');

      if (!capsuleId) {
        return NextResponse.json(
          { error: 'Capsule ID is required' },
          { status: 400 }
        );
      }

      // Validate capsule ID format (should be a valid ObjectId)
      if (!/^[0-9a-fA-F]{24}$/.test(capsuleId)) {
        return NextResponse.json(
          { error: 'Invalid capsule ID format' },
          { status: 400 }
        );
      }

      const success = await timeCapsuleService.deleteTimeCapsule(capsuleId, payload.userId);

      if (!success) {
        return NextResponse.json(
          { error: 'Capsule not found or unauthorized' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Delete capsule error:', error);
    return NextResponse.json(
      { error: 'Failed to delete capsule' },
      { status: 500 }
    );
  }
}

const getIdentifier = (req: NextRequest) => {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  return ip;
};

export const GET = withRateLimit(handleGetCapsules, getIdentifier);
export const POST = withRateLimit(handleCreateCapsule, getIdentifier);
export const DELETE = withRateLimit(handleDeleteCapsule, getIdentifier);
