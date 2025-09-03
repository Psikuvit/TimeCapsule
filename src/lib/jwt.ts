import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// Only throw error at runtime if JWT functions are actually called
function validateJWTSecret() {
  if (!JWT_SECRET) {
    throw new Error(
      'JWT_SECRET environment variable must be set to a secure random string'
    );
  }
}

export interface JWTPayload {
  userId: string;
  email: string;
  provider: string;
  iat?: number;
  exp?: number;
}

export function signAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  validateJWTSecret();

  return jwt.sign(payload, JWT_SECRET!, {
    expiresIn: '15m', // 15 minutes
    issuer: 'timecapsule-app',
    audience: 'timecapsule-users',
  });
}

export function verifyAccessToken(token: string): JWTPayload {
  validateJWTSecret();

  try {
    const decoded = jwt.verify(token, JWT_SECRET!, {
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

