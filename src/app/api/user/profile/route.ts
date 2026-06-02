import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { verifyAccessToken } from '@/lib/jwt';
import { profileUpdateSchema } from '@/lib/validation';
import { AuthenticationError, NotFoundError, ValidationError } from '@/lib/errors';
import { withErrorHandling, addSecurityHeaders, checkRateLimit } from '@/lib/security';
import { apiRateLimiter } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

/**
 * Extract and verify JWT token from request
 */
function extractAndVerifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    throw new AuthenticationError('No authorization token provided');
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    throw new AuthenticationError('Invalid or expired token');
  }

  return payload;
}

export const GET = withErrorHandling(async (request: NextRequest) => {
  // Check rate limit
  const rateLimitResponse = checkRateLimit(request, apiRateLimiter);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  logger.info('Processing get profile request');

  try {
    await dbConnect();

    const payload = extractAndVerifyToken(request);
    logger.debug('Token verified', { userId: payload.userId });

    const user = await User.findById(payload.userId).select('-verificationCode -verificationExpires');

    if (!user) {
      logger.warn('User not found', { userId: payload.userId });
      throw new NotFoundError('User not found');
    }

    logger.info('Profile retrieved successfully', { userId: payload.userId });

    const response = NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        online: user.online,
        lastSeen: user.lastSeen,
      },
    });

    return addSecurityHeaders(response);
  } catch (error) {
    logger.error('Get profile error', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
});

export const PUT = withErrorHandling(async (request: NextRequest) => {
  // Check rate limit
  const rateLimitResponse = checkRateLimit(request, apiRateLimiter);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  logger.info('Processing update profile request');

  try {
    await dbConnect();

    const payload = extractAndVerifyToken(request);
    logger.debug('Token verified for profile update', { userId: payload.userId });

    const body = await request.json();
    logger.debug('Profile update body received', { hasName: !!body.name, hasAvatar: !!body.avatar });

    // Validate input using Zod
    const updateData = await profileUpdateSchema.parseAsync(body).catch((error) => {
      logger.warn('Profile update validation failed', { error: error.message });
      const errorMap: Record<string, string[]> = {};
      error.errors?.forEach((err: any) => {
        const path = err.path.join('.');
        if (!errorMap[path]) errorMap[path] = [];
        errorMap[path].push(err.message);
      });
      throw new ValidationError('Invalid profile update data', errorMap);
    });

    const user = await User.findById(payload.userId);

    if (!user) {
      logger.warn('User not found for profile update', { userId: payload.userId });
      throw new NotFoundError('User not found');
    }

    // Update user profile
    if (updateData.name) {
      user.name = updateData.name;
      logger.debug('Name updated', { userId: payload.userId });
    }
    if (updateData.avatar !== undefined) {
      user.avatar = updateData.avatar;
      logger.debug('Avatar updated', { userId: payload.userId });
    }
    user.lastSeen = new Date();

    await user.save();
    logger.info('Profile updated successfully', { userId: payload.userId });

    const response = NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        online: user.online,
        lastSeen: user.lastSeen,
      },
    });

    return addSecurityHeaders(response);
  } catch (error) {
    logger.error('Update profile error', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
});
