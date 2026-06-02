import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d';
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '30d';

export interface JWTPayload {
  userId: string;
  phoneNumber: string;
  isVerified: boolean;
  type?: 'access' | 'refresh'; // Token type for validation
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Expiration time in seconds
}

/**
 * Generate access token
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRATION }
  );
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: Omit<JWTPayload, 'type'>): TokenPair {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload.userId);
  
  // Parse expiration time
  const expiresIn = parseExpirationToSeconds(JWT_EXPIRATION);

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    if (payload.type !== 'access') {
      return null;
    }
    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Verify refresh token and return user ID
 */
export function verifyRefreshToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
    if (payload.type !== 'refresh') {
      return null;
    }
    return payload.userId;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

/**
 * Decode token without verification (for checking expiration, etc.)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload | null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  return decoded.exp * 1000 < Date.now();
}

/**
 * Parse expiration string (e.g., "7d", "24h") to seconds
 */
function parseExpirationToSeconds(expirationStr: string): number {
  const match = expirationStr.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 7 * 24 * 60 * 60; // Default 7 days
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 24 * 60 * 60;
    default:
      return 7 * 24 * 60 * 60;
  }
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}
