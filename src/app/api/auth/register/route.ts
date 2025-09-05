import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { formatPhoneNumber, validatePhoneNumber, generateVerificationCode, sendVerificationSMS } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { phoneNumber, name } = await request.json();

    console.log('Registration request:', { phoneNumber, name });

    // Validate input
    if (!phoneNumber || !name) {
      return NextResponse.json(
        { error: 'Phone number and name are required' },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log('Formatted phone:', formattedPhone);
    
    if (!validatePhoneNumber(formattedPhone)) {
      console.log('Invalid phone number:', formattedPhone);
      return NextResponse.json(
        { error: 'Invalid phone number format. Please enter a valid 10-digit phone number.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let user = await User.findOne({ phoneNumber: formattedPhone });
    console.log('Existing user found:', !!user);
    
    if (user && user.isVerified) {
      return NextResponse.json(
        { error: 'Phone number already registered. Please use the login option instead.' },
        { status: 409 }
      );
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
      console.log('Updated existing unverified user');
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
      console.log('Created new user');
    }

    // Send verification SMS
    const smsSent = await sendVerificationSMS(formattedPhone, verificationCode);
    console.log('SMS sent status:', smsSent);
    console.log('Verification code (dev mode):', verificationCode);
    
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
