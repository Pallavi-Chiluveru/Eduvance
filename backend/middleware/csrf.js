const crypto = require('crypto');

/**
 * CSRF Protection — Double-Submit Cookie Pattern
 *
 * How it works:
 * 1. Client calls GET /api/auth/csrf-token → server returns a random token
 *    and also sets it as a cookie (_csrf).
 * 2. On every state-changing request (POST, PUT, PATCH, DELETE) the client
 *    sends the token in the X-CSRF-Token header.
 * 3. This middleware compares the header value to the cookie value.
 *    A cross-origin attacker can trigger the cookie to be sent automatically,
 *    but cannot read it (due to SameSite + httpOnly) and therefore cannot
 *    set the matching header — so the request fails.
 */

const CSRF_COOKIE = '_csrf';
const CSRF_HEADER = 'x-csrf-token';

const csrfCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
};

/**
 * Route handler: issue a new CSRF token.
 * Mount as GET /api/auth/csrf-token
 */
function generateCsrfToken(req, res) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie(CSRF_COOKIE, token, csrfCookieOptions);
    res.json({ success: true, data: { csrfToken: token } });
}

/**
 * Middleware: verify the CSRF token on state-changing methods.
 * Safe methods (GET, HEAD, OPTIONS) are skipped.
 */
function verifyCsrfToken(req, res, next) {
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(req.method)) {
        return next();
    }

    const cookieToken = req.cookies[CSRF_COOKIE];
    const headerToken = req.headers[CSRF_HEADER];

    if (!cookieToken || !headerToken) {
        return res.status(403).json({
            success: false,
            message: 'CSRF token missing. Fetch a token from GET /api/auth/csrf-token first.',
        });
    }

    // Constant-time comparison to prevent timing attacks
    if (cookieToken.length !== headerToken.length) {
        return res.status(403).json({ success: false, message: 'Invalid CSRF token' });
    }

    const valid = crypto.timingSafeEqual(
        Buffer.from(cookieToken, 'utf8'),
        Buffer.from(headerToken, 'utf8'),
    );

    if (!valid) {
        return res.status(403).json({ success: false, message: 'Invalid CSRF token' });
    }

    next();
}

module.exports = { generateCsrfToken, verifyCsrfToken };
