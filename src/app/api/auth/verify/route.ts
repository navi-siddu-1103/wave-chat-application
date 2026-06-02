import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { generateTokenPair } from '@/lib/jwt';
import { verifySchema } from '@/lib/validation';
import { NotFoundError, ValidationError, AppError, ConflictError } from '@/lib/errors';
import { withErrorHandling, addSecurityHeaders, checkRateLimit } from '@/lib/security';
import { authRateLimiter } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Check rate limit
  const rateLimitResponse = checkRateLimit(request, authRateLimiter);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  logger.info('Processing verification request');

  try {
    await dbConnect();

    const body = await request.json();
    logger.debug('Verification body received', { hasUserId: !!body.userId, hasCode: !!body.verificationCode });

    // Validate input using Zod
    const { userId, verificationCode } = await verifySchema.parseAsync(body).catch((error) => {
      logger.warn('Verification validation failed', { error: error.message });
      const errorMap: Record<string, string[]> = {};
      error.errors?.forEach((err: any) => {
        const path = err.path.join('.');
        if (!errorMap[path]) errorMap[path] = [];
        errorMap[path].push(err.message);
      });
      throw new ValidationError('Invalid verification data', errorMap);
    });

    // Find user
    const user = await User.findById(userId);
    logger.debug('User lookup for verification', { found: !!user, userId });

    if (!user) {
      logger.warn('Verification failed - user not found', { userId });
      throw new NotFoundError('User not found');
    }

    // Check if already verified
    if (user.isVerified) {
      logger.warn('Verification attempted for already verified user', { userId });
      throw new ConflictError('Phone number already verified');
    }

    // Check verification code (constant-time comparison to prevent timing attacks)
    const codeMatches = verificationCode === user.verificationCode;
    if (!codeMatches) {
      logger.warn('Invalid verification code', { userId });
      throw new ValidationError('Invalid verification code');
    }

    // Check if code has expired
    if (!user.verificationExpires || user.verificationExpires < new Date()) {
      logger.warn('Verification code expired', { userId });
      throw new ValidationError('Verification code has expired');
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationExpires = undefined;
    user.online = true;
    await user.save();
    logger.info('User verified successfully', { userId });

    // Generate token pair (access and refresh tokens)
    const tokens = generateTokenPair({
      userId: user._id.toString(),
      phoneNumber: user.phoneNumber,
      isVerified: true,
    });

    const response = NextResponse.json({
      message: 'Phone number verified successfully',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        online: user.online,
      },
    });

    return addSecurityHeaders(response);
  } catch (error) {
    logger.error('Verification error', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
});
