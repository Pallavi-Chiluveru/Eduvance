const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const OTP_TTL_MS = 15 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;
let transporter;
let transporterVerification;

const getTransporter = () => {
    if (transporter) return transporter;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD;
    if (!user || !pass) throw new Error('Instructor verification email is not configured');
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT || 465),
        secure: String(process.env.EMAIL_SECURE ?? 'true') === 'true',
        auth: { user, pass },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 30000,
    });
    return transporter;
};

const verifyInstructorEmailTransport = async () => {
    if (!transporterVerification) {
        transporterVerification = getTransporter().verify().then(() => {
            if (process.env.NODE_ENV === 'development') console.log('Email SMTP connection successful');
            return true;
        }).catch((error) => {
            transporterVerification = undefined;
            console.error('Email SMTP connection failed:', { code: error.code, responseCode: error.responseCode, command: error.command });
            throw error;
        });
    }
    return transporterVerification;
};
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
    const previous = {
        hash: user.instructorVerification.emailVerificationCodeHash,
        expires: user.instructorVerification.emailVerificationExpires,
        sent: user.instructorVerification.emailVerificationLastSentAt,
        attempts: user.instructorVerification.emailVerificationFailedAttempts,
    };
    user.instructorVerification.emailVerificationCodeHash = hashOtp(user._id, code);
    user.instructorVerification.emailVerificationExpires = expiresAt;
    user.instructorVerification.emailVerificationLastSentAt = new Date(now);
    user.instructorVerification.emailVerificationFailedAttempts = 0;
    await user.save({ validateBeforeSave: false });
    try {
        const name = user.firstName || 'Instructor';
        await verifyInstructorEmailTransport();
        const result = await getTransporter().sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: user.email,
            subject: 'Verify your EduVance Email',
            text: `Hello ${name},\n\nThank you for registering as an Instructor on EduVance.\n\nYour verification code is:\n\n${code}\n\nThis code will expire in 15 minutes.\n\nIf you did not create this account, you can safely ignore this email.\n\nEduVance Team`,
            html: `<p>Hello ${name},</p><p>Thank you for registering as an Instructor on EduVance.</p><p>Your verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>This code will expire in 15 minutes.</p><p>If you did not create this account, you can safely ignore this email.</p><p>EduVance Team</p>`,
        });
        if (!result.accepted?.some(address => address.toLowerCase() === user.email.toLowerCase())) {
            const error = new Error('SMTP did not accept the registered recipient');
            error.code = 'ERECIPIENT';
            throw error;
        }
    } catch (smtpError) {
        console.error('Instructor verification email failed:', { code: smtpError.code, responseCode: smtpError.responseCode, command: smtpError.command });
        user.instructorVerification.emailVerificationCodeHash = previous.hash;
        user.instructorVerification.emailVerificationExpires = previous.expires;
        user.instructorVerification.emailVerificationLastSentAt = previous.sent;
        user.instructorVerification.emailVerificationFailedAttempts = previous.attempts || 0;
        await user.save({ validateBeforeSave: false });
        const error = new Error("We couldn't send the verification code. Please try again.");
        error.statusCode = 502; throw error;
    }
    return { expiresAt, resendAvailableAt: new Date(now + RESEND_COOLDOWN_MS) };
};

module.exports = { MAX_FAILED_ATTEMPTS, hashOtp, sendInstructorVerificationCode, verifyInstructorEmailTransport };