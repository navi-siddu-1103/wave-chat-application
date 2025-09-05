import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { formatPhoneNumber, validatePhoneNumber, generateVerificationCode, sendVerificationSMS } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { phoneNumber } = await request.json();

    console.log('Login request for phone:', phoneNumber);

    // Validate input
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log('Formatted phone for login:', formattedPhone);
    
    if (!validatePhoneNumber(formattedPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please enter a valid 10-digit phone number.' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ phoneNumber: formattedPhone });
    console.log('User found:', !!user, 'Verified:', user?.isVerified);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Phone number not registered. Please sign up first.' },
        { status: 404 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Phone number not verified. Please complete registration first.' },
        { status: 404 }
      );
    }

    // Generate verification code for login
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.verificationCode = verificationCode;
    user.verificationExpires = verificationExpires;
    await user.save();

    // Send verification SMS
    const smsSent = await sendVerificationSMS(formattedPhone, verificationCode);
    console.log('Login SMS sent status:', smsSent);
    console.log('Login verification code (dev mode):', verificationCode);
    
    if (!smsSent) {
      return NextResponse.json(
        { error: 'Failed to send verification code' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Verification code sent successfully',
      userId: user._id,
      // Include verification code in development mode only
      ...(process.env.NODE_ENV === 'development' && { verificationCode }),
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
