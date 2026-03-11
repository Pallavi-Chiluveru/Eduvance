const { verifyAccessToken } = require('../config/jwt');
const User = require('../models/User');

/**
 * Protect routes — verify JWT from Authorization header or cookie
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Check Authorization header first
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Fallback to cookie
        else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized — no token provided',
            });
        }

        // Verify token
        const decoded = verifyAccessToken(token);

        // Attach user to request (without password)
        const user = await User.findById(decoded.id);
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User not found or account deactivated',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired',
                code: 'TOKEN_EXPIRED',
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Not authorized — invalid token',
        });
    }
};

module.exports = { protect };
