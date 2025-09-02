import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET === 'dev_secret_change_me') {
  throw new Error(
    'JWT_SECRET environment variable must be set to a secure random string in production'
  );
}

export interface JWTPayload {
  userId: string;
  email: string;
  provider: string;
  iat?: number;
  exp?: number;
}

export function signAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '15m', // 15 minutes
    issuer: 'timecapsule-app',
    audience: 'timecapsule-users',
  });
}

export function verifyAccessToken(token: string): JWTPayload {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'timecapsule-app',
      audience: 'timecapsule-users',
    }) as JWTPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
}

