/**
 * Security middleware utilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { AppError, RateLimitError, formatErrorResponse } from './errors';

/**
 * CORS configuration
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:9002',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
};

/**
 * Security headers
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

/**
 * Handle CORS preflight requests
 */
export function handleCORS(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      headers: corsHeaders,
    });
  }
}

/**
 * Validate origin for CORS
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim());

  // In development, allow localhost variants
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:9002', 'http://127.0.0.1:3000', 'http://127.0.0.1:9002');
  }

  return allowedOrigins.includes(origin);
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse) {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Wrap an API route handler with error handling and security
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse> | NextResponse
) {
  return async (...args: T) => {
    try {
      const response = await handler(...args);
      return addSecurityHeaders(response);
    } catch (error) {
      console.error('API error:', error);

      const isAppError = error instanceof AppError;
      const statusCode = isAppError ? error.statusCode : 500;
      const errorData = formatErrorResponse(error);

      const response = NextResponse.json(errorData, { status: statusCode });
      return addSecurityHeaders(response);
    }
  };
}

/**
 * Validate request against rate limit
 */
export function checkRateLimit(request: NextRequest, limiter: { isLimited: (req: Request) => { limited: boolean; retryAfter?: number } }) {
  const { limited, retryAfter } = limiter.isLimited(request);

  if (limited) {
    const response = NextResponse.json(
      {
        error: {
          message: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT_ERROR',
          statusCode: 429,
          retryAfter,
        },
      },
      { status: 429 }
    );

    if (retryAfter) {
      response.headers.set('Retry-After', retryAfter.toString());
    }

    return response;
  }

  return null;
}

/**
 * Validate request content type
 */
export async function validateContentType(request: NextRequest, expectedType: string) {
  const contentType = request.headers.get('content-type');
  if (!contentType?.includes(expectedType)) {
    throw new AppError(
      `Expected Content-Type: ${expectedType}`,
      400,
      'INVALID_CONTENT_TYPE'
    );
  }
}

/**
 * Safely parse JSON request body
 */
export async function safeParseJSON(request: NextRequest) {
  try {
    return await request.json();
  } catch (error) {
    throw new AppError('Invalid JSON in request body', 400, 'INVALID_JSON');
  }
}
