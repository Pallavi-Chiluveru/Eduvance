const rateLimit = require('express-rate-limit');

const createLimiter = (limit, windowMs = 15 * 60 * 1000) => rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: req => req.method === 'OPTIONS',
    handler: (req, res) => {
        const retryAfter = Math.max(1, Math.ceil((req.rateLimit.resetTime.getTime() - Date.now()) / 1000));
        res.set('Retry-After', String(retryAfter));
        res.status(429).json({ success: false, code: 'RATE_LIMITED', retryAfter,
            message: `Too many requests. Please try again in ${retryAfter} seconds.` });
    },
});

// Independent stores keep ordinary API traffic from locking users out of signup.
const general = createLimiter(200);
const entryLimits = new Map([
    ['/auth/csrf-token', createLimiter(60, 60 * 1000)],
    ['/auth/register', createLimiter(20)],
    ['/auth/login', createLimiter(30)],
    ['/auth/refresh', createLimiter(60, 60 * 1000)],
]);

module.exports = (req, res, next) => {
    const path = req.path.toLowerCase().replace(/\/+$/, '');
    return (entryLimits.get(path) || general)(req, res, next);
};
