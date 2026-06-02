import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { formatPhoneNumber, validatePhoneNumber, generateVerificationCode, sendVerificationSMS } from '@/lib/sms';
import { loginSchema } from '@/lib/validation';
import { NotFoundError, ValidationError, AppError } from '@/lib/errors';
import { withErrorHandling, addSecurityHeaders, checkRateLimit } from '@/lib/security';
import { authRateLimiter } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Check rate limit
  const rateLimitResponse = checkRateLimit(request, authRateLimiter);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  logger.info('Processing login request');

  try {
    await dbConnect();

    const body = await request.json();
    logger.debug('Login body received', { hasPhoneNumber: !!body.phoneNumber });

    // Validate input using Zod
    const { phoneNumber } = await loginSchema.parseAsync(body).catch((error) => {
      logger.warn('Login validation failed', { error: error.message });
      const errorMap: Record<string, string[]> = {};
      error.errors?.forEach((err: any) => {
        const path = err.path.join('.');
        if (!errorMap[path]) errorMap[path] = [];
        errorMap[path].push(err.message);
      });
      throw new ValidationError('Invalid login data', errorMap);
    });

    const formattedPhone = formatPhoneNumber(phoneNumber);
    logger.debug('Phone formatted', { original: phoneNumber, formatted: formattedPhone });

    if (!validatePhoneNumber(formattedPhone)) {
      logger.warn('Invalid phone number format', { phoneNumber: formattedPhone });
      throw new ValidationError('Invalid phone number format. Please enter a valid phone number.');
    }

    // Find user
    const user = await User.findOne({ phoneNumber: formattedPhone });
    logger.debug('User lookup', { found: !!user, verified: user?.isVerified });

    if (!user) {
      logger.warn('Login failed - user not found', { phoneNumber: formattedPhone });
      throw new NotFoundError('Phone number not registered. Please sign up first.');
    }

    if (!user.isVerified) {
      logger.warn('Login failed - user not verified', { userId: user._id });
      throw new NotFoundError('Phone number not verified. Please complete registration first.');
    }

    // Generate verification code for login
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.verificationCode = verificationCode;
    user.verificationExpires = verificationExpires;
    await user.save();

    // Send verification SMS
    const smsSent = await sendVerificationSMS(formattedPhone, verificationCode);
    logger.info('Login verification SMS sent', { smsSent, phoneNumber: formattedPhone });

    if (!smsSent) {
      logger.error('Failed to send login verification SMS', undefined, { phoneNumber: formattedPhone });
      throw new AppError('Failed to send verification code', 500);
    }

    const response = NextResponse.json({
      message: 'Verification code sent successfully',
      userId: user._id,
      // Include verification code in development mode only
      ...(process.env.NODE_ENV === 'development' && { verificationCode }),
    });

    return addSecurityHeaders(response);
  } catch (error) {
    logger.error('Login error', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
});
