import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { verifyRefreshToken, generateTokenPair } from '@/lib/jwt';
import { AuthenticationError } from '@/lib/errors';
import { withErrorHandling, addSecurityHeaders, checkRateLimit } from '@/lib/security';
import { authRateLimiter } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

/**
 * Refresh access token using refresh token
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Check rate limit
  const rateLimitResponse = checkRateLimit(request, authRateLimiter);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  logger.info('Processing token refresh request');

  try {
    await dbConnect();

    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      logger.warn('Refresh token missing');
      throw new AuthenticationError('Refresh token is required');
    }

    // Verify refresh token
    const userId = verifyRefreshToken(refreshToken);
    if (!userId) {
      logger.warn('Invalid refresh token', { hasToken: !!refreshToken });
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    logger.debug('Refresh token verified', { userId });

    // Get user to regenerate token pair
    const user = await User.findById(userId);
    if (!user || !user.isVerified) {
      logger.warn('User not found or not verified for refresh', { userId });
      throw new AuthenticationError('User not found or not verified');
    }

    // Generate new token pair
    const tokens = generateTokenPair({
      userId: user._id.toString(),
      phoneNumber: user.phoneNumber,
      isVerified: true,
    });

    logger.info('Token refreshed successfully', { userId });

    const response = NextResponse.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    });

    return addSecurityHeaders(response);
  } catch (error) {
    logger.error('Token refresh error', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
});
