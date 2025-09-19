import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, User } from './auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: User;
}

// Middleware to authenticate requests
export const withAuth = (
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
) => {
  return async (req: NextRequest) => {
    try {
      const user = await authenticateRequest(req);

      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 },
        );
      }

      // Add user to request
      const authReq = req as AuthenticatedRequest;
      authReq.user = user;

      return handler(authReq);
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 },
      );
    }
  };
};

// Middleware to require admin role
export const withAdminAuth = (
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
) => {
  return withAuth(async (req: AuthenticatedRequest) => {
    if (req.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 },
      );
    }

    return handler(req);
  });
};

// Optional authentication middleware (doesn't block if no auth)
export const withOptionalAuth = (
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
) => {
  return async (req: NextRequest) => {
    try {
      const user = await authenticateRequest(req);

      // Add user to request if authenticated
      const authReq = req as AuthenticatedRequest;
      authReq.user = user || undefined;

      return handler(authReq);
    } catch (error) {
      console.error('Optional authentication middleware error:', error);

      // Continue without authentication on error
      const authReq = req as AuthenticatedRequest;
      authReq.user = undefined;

      return handler(authReq);
    }
  };
};

// CORS middleware for API routes
export const withCORS = (
  handler: (req: NextRequest) => Promise<NextResponse>,
) => {
  return async (req: NextRequest) => {
    const response = await handler(req);

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS',
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    );

    return response;
  };
};

// Rate limiting middleware (basic implementation)
const rateLimitMap = new Map();

export const withRateLimit = (
  maxRequests: number = 5,
  windowMs: number = 60000, // 1 minute
  handler: (req: NextRequest) => Promise<NextResponse>,
) => {
  return async (req: NextRequest) => {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    for (const [key, requests] of rateLimitMap.entries()) {
      rateLimitMap.set(
        key,
        requests.filter((time: number) => time > windowStart),
      );
      if (rateLimitMap.get(key).length === 0) {
        rateLimitMap.delete(key);
      }
    }

    // Check current requests
    const requests = rateLimitMap.get(ip) || [];
    const recentRequests = requests.filter(
      (time: number) => time > windowStart,
    );

    if (recentRequests.length >= maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    // Add current request
    recentRequests.push(now);
    rateLimitMap.set(ip, recentRequests);

    return handler(req);
  };
};
