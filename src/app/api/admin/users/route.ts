import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userService } from '@/lib/database';

export async function GET(request: NextRequest) {
  // Admin-only: return all users
  try {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    let payload;
    try {
      payload = require('@/lib/jwt').verifyAccessToken(token.value);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    // Fetch user by ID
    const user = await userService.getUserById(payload.userId);
    if (!user || user.email !== 'thegengestar@gmail.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const users = await userService.getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
