import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return false;
    }

    if (record.count >= this.config.maxRequests) {
      return true;
    }

    record.count++;
    return false;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Clean up expired records every 5 minutes
setInterval(() => {
  authRateLimiter.cleanup();
}, 5 * 60 * 1000);

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 requests per 15 minutes
});

export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  getIdentifier: (req: NextRequest) => string
) {
  return async (req: NextRequest) => {
    const identifier = getIdentifier(req);
    
    if (authRateLimiter.isRateLimited(identifier)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    return handler(req);
  };
}
