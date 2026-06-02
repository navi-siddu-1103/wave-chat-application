/**
 * Custom error classes and error handling utilities
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: Record<string, string[]> | null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(
    message: string = 'Too many requests',
    public retryAfter?: number
  ) {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
    this.name = 'InternalServerError';
  }
}

/**
 * Format error response for API responses
 */
export function formatErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        ...(error instanceof ValidationError && { details: error.details }),
        ...(error instanceof RateLimitError && error.retryAfter && { retryAfter: error.retryAfter }),
      },
    };
  }

  // Handle other error types
  const message = error instanceof Error ? error.message : 'An unknown error occurred';
  console.error('Unhandled error:', error);

  return {
    error: {
      message,
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    },
  };
}
