/**
 * Environment configuration validation
 */

import { logger } from './logger';

export interface EnvConfig {
  // Database
  MONGODB_URI: string;

  // Authentication
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRATION: string;
  JWT_REFRESH_EXPIRATION: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;

  // AI/Genkit
  GEMINI_API_KEY: string;

  // Twilio (optional)
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_PHONE_NUMBER?: string;

  // CORS
  ALLOWED_ORIGINS: string;

  // Logging
  LOG_LEVEL: string;
  NODE_ENV: 'development' | 'production' | 'test';

  // Rate limiting
  ENABLE_RATE_LIMITING: string;

  // Security
  ENABLE_CSRF_PROTECTION: string;
}

/**
 * Validate environment configuration
 */
export function validateEnvConfig(): EnvConfig {
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'GEMINI_API_KEY',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    const error = new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
    logger.error('Environment validation failed', error);
    throw error;
  }

  const config: EnvConfig = {
    MONGODB_URI: process.env.MONGODB_URI!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    JWT_EXPIRATION: process.env.JWT_EXPIRATION || '7d',
    JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '30d',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:9002',
    LOG_LEVEL: process.env.LOG_LEVEL || 'INFO',
    NODE_ENV: (process.env.NODE_ENV as any) || 'development',
    ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING || 'true',
    ENABLE_CSRF_PROTECTION: process.env.ENABLE_CSRF_PROTECTION || 'true',
  };

  logger.info('Environment configuration validated successfully', {
    nodeEnv: config.NODE_ENV,
    hasGeminiKey: !!config.GEMINI_API_KEY,
    allowedOrigins: config.ALLOWED_ORIGINS,
  });

  return config;
}

/**
 * Get configuration safely
 */
export function getConfig(): Partial<EnvConfig> {
  return {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_EXPIRATION: process.env.JWT_EXPIRATION || '7d',
    JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '30d',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '***' : undefined,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:9002',
    LOG_LEVEL: process.env.LOG_LEVEL || 'INFO',
    NODE_ENV: process.env.NODE_ENV as any,
    ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING || 'true',
    ENABLE_CSRF_PROTECTION: process.env.ENABLE_CSRF_PROTECTION || 'true',
  };
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if feature flag is enabled
 */
export function isFeatureEnabled(flag: string): boolean {
  const value = process.env[`ENABLE_${flag.toUpperCase()}`];
  return value !== 'false' && value !== '0';
}
