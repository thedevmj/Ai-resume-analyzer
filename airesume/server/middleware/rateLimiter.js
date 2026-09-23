const rateLimit = require('express-rate-limit');

const defaultMessage = (label) => ({
  success: false,
  error: `Too many requests${label ? ` (${label})` : ''}. Please try again later.`,
});

const baseConfig = {
  standardHeaders: true,
  legacyHeaders: false,
};

// General API limit
const apiLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: defaultMessage('general'),
});

// Strict auth limit - prevents brute force on login
const loginLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: defaultMessage('login'),
});

// Registration limit - prevents mass account creation
const registerLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: defaultMessage('registration'),
});

// Refresh token limit - frequent token refreshes are suspicious
const refreshLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: defaultMessage('token refresh'),
});

// AI analysis is expensive - keep it per-hour
const analysisLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: defaultMessage('resume analysis'),
});

// AI feedback generation is expensive - keep it per-hour
const feedbackLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000,
  limit: 30,
  message: defaultMessage('feedback'),
});

// Download limit - prevents abuse of resume generation
const downloadLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: defaultMessage('download'),
});

module.exports = {
  apiLimiter,
  loginLimiter,
  registerLimiter,
  refreshLimiter,
  analysisLimiter,
  feedbackLimiter,
  downloadLimiter,
};