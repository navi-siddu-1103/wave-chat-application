import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { logger } from '@/lib/logger';
import { addSecurityHeaders } from '@/lib/security';

/**
 * Health check endpoint
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Check database connection
    await dbConnect();
    const dbTime = Date.now() - startTime;

    logger.info('Health check passed', {
      dbResponseTime: dbTime,
    });

    const response = NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {
          database: {
            status: 'ok',
            responseTime: `${dbTime}ms`,
          },
        },
      },
      { status: 200 }
    );

    return addSecurityHeaders(response);
  } catch (error) {
    logger.error('Health check failed', error instanceof Error ? error : new Error(String(error)));

    const response = NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );

    return addSecurityHeaders(response);
  }
}
