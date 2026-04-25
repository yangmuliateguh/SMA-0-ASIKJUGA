import rateLimit from 'express-rate-limit';

const isRateLimitEnabled = process.env.RATE_LIMIT_ENABLED === 'false';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: 'RATE_LIMIT_EXCEEDED',
  },
  validate: {
    xForwardedForHeader: false,
  },
  skip: () => !isRateLimitEnabled,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again later.',
    error: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
  validate: {
    xForwardedForHeader: false,
  },
  skip: () => !isRateLimitEnabled,
});
