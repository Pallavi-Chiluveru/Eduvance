const User = require('../models/User');
const Reward = require('../models/Reward');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');

// Cookie options for refresh token
const refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
};

/**
 * POST /api/auth/register
 * Register a new user
 */
exports.register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, role, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        let user;
        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries) {
            try {
                let generatedStudentId = undefined;
                
                if (role === 'student') {
                    const studentsWithId = await User.find({ role: 'student', studentId: { $exists: true } }, 'studentId');
                    let maxId = 0;
                    studentsWithId.forEach(s => {
                        if (s.studentId && s.studentId.startsWith('STU')) {
                            const numPart = parseInt(s.studentId.replace('STU', ''), 10);
                            if (!isNaN(numPart) && numPart > maxId) {
                                maxId = numPart;
                            }
                        }
                    });
                    generatedStudentId = `STU${(maxId + 1).toString().padStart(3, '0')}`;
                }

                user = await User.create({
                    firstName,
                    lastName,
                    email,
                    password,
                    role,
                    phone,
                    studentId: generatedStudentId,
                });
                
                break; // Successfully created user, exit loop
            } catch (error) {
                // If there's a collision on studentId, retry
                if (error.code === 11000 && error.keyPattern && error.keyPattern.studentId) {
                    retries++;
                    if (retries === maxRetries) {
                        return res.status(500).json({ success: false, message: 'Failed to generate unique student ID. Please try again.' });
                    }
                } else {
                    // Throw other errors (like validation errors or duplicate email if any)
                    throw error;
                }
            }
        }

        // Generate tokens
        const payload = { id: user._id, role: user.role };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Save refresh token to DB
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', refreshToken, refreshCookieOptions);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    fullName: user.fullName,
                },
                accessToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/login
 * Login with email & password
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user with password field included
        const user = await User.findOne({ email }).select('+password +refreshToken');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Account is deactivated' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Generate tokens
        const payload = { id: user._id, role: user.role };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Update user record
        user.refreshToken = refreshToken;
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        res.cookie('refreshToken', refreshToken, refreshCookieOptions);

        // Award first_login badge for students
        if (user.role === 'student') {
            const existing = await Reward.findOne({ student: user._id, badge: 'first_login' });
            if (!existing) {
                await Reward.create({
                    student: user._id,
                    type: 'badge',
                    badge: 'first_login',
                    title: 'Welcome! 👋',
                    description: 'Logged in for the first time',
                    points: 10,
                    earnedAt: new Date(),
                });
            }
        }

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    fullName: user.fullName,
                    avatar: user.avatar,
                },
                accessToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token from cookie
 */
exports.refreshToken = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            return res.status(401).json({ success: false, message: 'No refresh token' });
        }

        const decoded = verifyRefreshToken(token);
        const user = await User.findById(decoded.id).select('+refreshToken');
        if (!user || user.refreshToken !== token) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        // Issue new tokens
        const payload = { id: user._id, role: user.role };
        const accessToken = generateAccessToken(payload);
        const newRefreshToken = generateRefreshToken(payload);

        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        res.cookie('refreshToken', newRefreshToken, refreshCookieOptions);

        res.json({
            success: true,
            data: { accessToken },
        });
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
};

/**
 * POST /api/auth/logout
 * Clear tokens
 */
exports.logout = async (req, res, next) => {
    try {
        // Clear refresh token in DB if user is authenticated
        if (req.user) {
            await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
        }

        res.cookie('refreshToken', '', { ...refreshCookieOptions, maxAge: 0 });
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('children', 'firstName lastName email studentId');
        res.json({
            success: true,
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};
