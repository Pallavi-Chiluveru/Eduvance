const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, makeIdempotencyKey } = require('./emailService');

const OTP_TTL_MS = 15 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

const hashOtp = (userId, code) => {
    const secret = process.env.OTP_HASH_SECRET || process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    if (!secret) throw new Error('OTP_HASH_SECRET or JWT_ACCESS_SECRET must be configured');
    return crypto.createHmac('sha256', secret).update(`${userId}:${code}`).digest('hex');
};

const sendInstructorVerificationCode = async (userOrId, options = {}) => {
    const enforceCooldown = options.enforceCooldown !== false;
    const user = typeof userOrId?.save === 'function' ? userOrId : await User.findById(userOrId)
        .select('+instructorVerification.emailVerificationCodeHash +instructorVerification.emailVerificationExpires');
    if (!user || user.role !== 'instructor') {
        const error = new Error('Instructor account not found'); error.statusCode = 404; throw error;
    }
    if (user.instructorVerification.emailVerified) {
        const error = new Error('Email is already verified.'); error.statusCode = 409; throw error;
    }
    const now = Date.now();
    const lastSentAt = user.instructorVerification.emailVerificationLastSentAt?.getTime?.();
    if (enforceCooldown && lastSentAt && now - lastSentAt < RESEND_COOLDOWN_MS) {
        const retryAfter = Math.ceil((RESEND_COOLDOWN_MS - (now - lastSentAt)) / 1000);
        const error = new Error(`Please wait ${retryAfter} seconds before requesting another code.`);
        error.statusCode = 429; error.retryAfter = retryAfter; throw error;
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(now + OTP_TTL_MS);
    const verification = user.instructorVerification;
    const previous = {
        hash: verification.emailVerificationCodeHash,
        expires: verification.emailVerificationExpires,
        sent: verification.emailVerificationLastSentAt,
        attempts: verification.emailVerificationFailedAttempts,
    };
    verification.emailVerificationCodeHash = hashOtp(user._id, code);
    verification.emailVerificationExpires = expiresAt;
    verification.emailVerificationLastSentAt = new Date(now);
    verification.emailVerificationFailedAttempts = 0;
    await user.save({ validateBeforeSave: false });

    try {
        const name = user.firstName || 'Instructor';
        await sendVerificationEmail(user.email, name, code, null, makeIdempotencyKey('verify', user._id, code));
    } catch (deliveryError) {
        verification.emailVerificationCodeHash = previous.hash;
        verification.emailVerificationExpires = previous.expires;
        verification.emailVerificationLastSentAt = previous.sent;
        verification.emailVerificationFailedAttempts = previous.attempts || 0;
        await user.save({ validateBeforeSave: false });
        throw deliveryError;
    }
    return { expiresAt, resendAvailableAt: new Date(now + RESEND_COOLDOWN_MS) };
};

module.exports = { MAX_FAILED_ATTEMPTS, hashOtp, sendInstructorVerificationCode };
