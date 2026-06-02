/**
 * Rate limiting utilities
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (request: Request) => string; // Custom key generator
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      keyGenerator: (req) => {
        // Get IP from various sources
        return (
          (req.headers.get('x-forwarded-for') as string)?.split(',')[0] ||
          (req.headers.get('x-real-ip') as string) ||
          'unknown'
        );
      },
      ...config,
    };

    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if request should be rate limited
   */
  isLimited(request: Request): { limited: boolean; retryAfter?: number } {
    const key = this.config.keyGenerator!(request);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get request timestamps for this key
    const timestamps = this.requests.get(key) || [];

    // Filter out old timestamps outside the window
    const recentRequests = timestamps.filter((time) => time > windowStart);

    if (recentRequests.length >= this.config.maxRequests) {
      // Rate limit exceeded
      const oldestRequest = Math.min(...recentRequests);
      const retryAfter = Math.ceil((oldestRequest + this.config.windowMs - now) / 1000);
      return { limited: true, retryAfter };
    }

    // Record this request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);

    return { limited: false };
  }

  /**
   * Clean up old entries
   */
  private cleanup() {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    for (const [key, timestamps] of this.requests.entries()) {
      const recentRequests = timestamps.filter((time) => time > windowStart);
      if (recentRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recentRequests);
      }
    }
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string) {
    this.requests.delete(key);
  }

  /**
   * Reset all rate limits
   */
  resetAll() {
    this.requests.clear();
  }
}

// Create rate limiters for different endpoints
export const createRateLimiter = (config: RateLimitConfig) => new RateLimiter(config);

// Pre-configured rate limiters
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 requests per 15 minutes
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
});

export const messageRateLimiter = createRateLimiter({
  windowMs: 1000, // 1 second
  maxRequests: 10, // 10 messages per second (burst)
});
