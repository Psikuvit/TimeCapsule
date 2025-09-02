import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(_request: NextRequest) {
  const c = await cookies();
  c.set('access_token', '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 });
  return NextResponse.json({ ok: true });
}
