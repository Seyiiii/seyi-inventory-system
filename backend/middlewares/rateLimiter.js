import rateLimit from 'express-rate-limit';

// General rate limiter for all routes
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    message: {
        message: 'Too many requests from this IP, please try again after 15 minutes',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for authentication routes (login/register)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login/register requests per 15 minutes
    message: {
        message: 'Too many authentication attempts, please try again after 15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for order placement to prevent spam
export const orderLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 15, // Limit each IP to 15 order placements per 10 minutes
    message: {
        message: 'Too many orders placed, please wait a while before trying again',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for cart operations
export const cartLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 50, // Limit each IP to 50 cart operations per 10 minutes
    message: {
        message: 'Too many cart updates, please slow down',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Generic limiter for data modification (POST, PUT, DELETE)
export const apiWriteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit to 30 write operations per 15 minutes
    message: {
        message: 'Too many data modification requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
