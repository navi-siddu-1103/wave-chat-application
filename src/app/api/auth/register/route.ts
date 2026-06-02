import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { formatPhoneNumber, validatePhoneNumber, generateVerificationCode, sendVerificationSMS } from '@/lib/sms';
import { registerSchema } from '@/lib/validation';
import { ConflictError, ValidationError, AppError } from '@/lib/errors';
import { withErrorHandling, addSecurityHeaders, checkRateLimit } from '@/lib/security';
import { authRateLimiter } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Check rate limit
  const rateLimitResponse = checkRateLimit(request, authRateLimiter);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  logger.info('Processing registration request');

  try {
    await dbConnect();

    const body = await request.json();
    logger.debug('Registration body received', { hasPhoneNumber: !!body.phoneNumber, hasName: !!body.name });

    // Validate input using Zod
    const { phoneNumber, name } = await registerSchema.parseAsync(body).catch((error) => {
      logger.warn('Registration validation failed', { error: error.message });
      const errorMap: Record<string, string[]> = {};
      error.errors?.forEach((err: any) => {
        const path = err.path.join('.');
        if (!errorMap[path]) errorMap[path] = [];
        errorMap[path].push(err.message);
      });
      throw new ValidationError('Invalid registration data', errorMap);
    });

    const formattedPhone = formatPhoneNumber(phoneNumber);
    logger.debug('Phone formatted', { original: phoneNumber, formatted: formattedPhone });

    // Format phone number and validate
    if (!validatePhoneNumber(formattedPhone)) {
      logger.warn('Invalid phone number format', { phoneNumber: formattedPhone });
      throw new ValidationError('Invalid phone number format. Please enter a valid phone number.');
    }

    // Check if user already exists
    let user = await User.findOne({ phoneNumber: formattedPhone });
    logger.debug('Existing user check', { exists: !!user, verified: user?.isVerified });

    if (user && user.isVerified) {
      logger.warn('Registration attempted for verified phone', { phoneNumber: formattedPhone });
      throw new ConflictError('Phone number already registered. Please use the login option instead.');
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (user) {
      // Update existing unverified user
      user.name = name;
      user.verificationCode = verificationCode;
      user.verificationExpires = verificationExpires;
      await user.save();
      logger.info('Updated existing unverified user', { userId: user._id });
    } else {
      // Create new user
      user = new User({
        phoneNumber: formattedPhone,
        name,
        verificationCode,
        verificationExpires,
        isVerified: false,
      });
      await user.save();
      logger.info('Created new user', { userId: user._id });
    }

    // Send verification SMS
    const smsSent = await sendVerificationSMS(formattedPhone, verificationCode);
    logger.info('Verification SMS sent', { smsSent, phoneNumber: formattedPhone });

    if (!smsSent) {
      logger.error('Failed to send verification SMS', undefined, { phoneNumber: formattedPhone });
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
    logger.error('Registration error', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
});
