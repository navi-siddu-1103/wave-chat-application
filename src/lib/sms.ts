import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.warn('Twilio credentials not configured. SMS verification will be simulated.');
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationSMS(phoneNumber: string, code: string): Promise<boolean> {
  if (!client) {
    console.log('\n🔔 ===== SMS SIMULATION MODE =====');
    console.log(`📱 Phone: ${phoneNumber}`);
    console.log(`🔐 Verification Code: ${code}`);
    console.log('⏰ Valid for: 10 minutes');
    console.log('================================\n');
    return true; // Simulate success for development
  }

  try {
    await client.messages.create({
      body: `Your Wave verification code is: ${code}. This code will expire in 10 minutes.`,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}

export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Handle different input formats
  if (cleaned.length === 10) {
    // US number without country code
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // US number with country code
    return `+${cleaned}`;
  } else if (cleaned.length === 11 && !cleaned.startsWith('1')) {
    // Assume it's missing the + sign
    return `+${cleaned}`;
  } else if (cleaned.length > 11) {
    // Take last 10 digits and add US country code
    const last10 = cleaned.slice(-10);
    return `+1${last10}`;
  } else if (cleaned.length >= 7) {
    // For numbers 7-9 digits, assume US and pad or use as is
    return `+1${cleaned}`;
  }
  
  // Return as is with + if it looks like international
  return cleaned.startsWith('+') ? phoneNumber : `+${cleaned}`;
}

export function validatePhoneNumber(phoneNumber: string): boolean {
  const cleaned = phoneNumber.replace(/\D/g, '');
  // Accept numbers between 7 and 15 digits (international standard)
  return cleaned.length >= 7 && cleaned.length <= 15;
}
