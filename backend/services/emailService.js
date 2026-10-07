const crypto = require('crypto');
const { Resend } = require('resend');

let resendClient;

const getClient = () => {
    if (!process.env.RESEND_API_KEY) throw new Error('Email provider is not configured');
    if (!resendClient) {
        resendClient = new Resend(process.env.RESEND_API_KEY);
        // The SDK's development logger prints the entire provider response,
        // which can contain recipient data. Keep useful metadata only.
        resendClient.logError = (_error, path, status) => {
            console.error('Resend API request failed', { status, path });
        };
    }
    return resendClient;
};

const getSender = () => {
    const address = process.env.EMAIL_FROM;
    if (!address) throw new Error('Email sender is not configured');
    const name = process.env.EMAIL_FROM_NAME || 'EduVance';
    return `${name.replace(/[<>\r\n]/g, '')} <${address}>`;
};

const getSafeProviderError = (error) => {
    let message = String(error?.message || 'Email provider request failed');
    message = message
        .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '<redacted-email>')
        .replace(/re_[A-Za-z0-9_-]+/g, '[redacted-api-key]')
        .replace(/\s+/g, ' ')
        .slice(0, 300);
    if (process.env.RESEND_API_KEY) message = message.split(process.env.RESEND_API_KEY).join('[redacted]');
    return message;
};

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

const sendEmail = async ({ to, subject, html, text, type = 'transactional', idempotencyKey }) => {
    try {
        const result = await getClient().emails.send({ from: getSender(), to, subject, html, text },
            idempotencyKey ? { idempotencyKey } : undefined);
        if (result.error) throw result.error;
        return result.data;
    } catch (error) {
        console.error('Email delivery failed', {
            EMAIL_PROVIDER: 'resend',
            EMAIL_TYPE: type,
            RECIPIENT: '<redacted>',
            ERROR_NAME: String(error?.name || 'Error').slice(0, 80),
            ERROR_CODE: String(error?.code || error?.statusCode || error?.status || 'unknown').slice(0, 80),
            ERROR: getSafeProviderError(error),
        });
        const deliveryError = new Error('We could not send the email. Please try again shortly.');
        deliveryError.statusCode = 502;
        deliveryError.code = 'EMAIL_DELIVERY_FAILED';
        throw deliveryError;
    }
};

const makeIdempotencyKey = (type, accountId, value) =>
    `${type}/${crypto.createHash('sha256').update(`${accountId}:${value}`).digest('hex')}`;

const sendVerificationEmail = (email, name, token, verificationUrl, idempotencyKey) => sendEmail({
    to: email,
    subject: 'Verify your EduVance email',
    text: `Hello ${name}, your verification code is ${token}. It expires in 15 minutes.`,
    html: `<p>Hello ${escapeHtml(name)},</p><p>Your EduVance verification code is:</p><p><strong>${escapeHtml(token)}</strong></p><p>This code expires in 15 minutes.</p>${verificationUrl ? `<p><a href="${escapeHtml(verificationUrl)}">Verify your email</a></p>` : ''}`,
    type: 'verification',
    idempotencyKey,
});

const sendPasswordResetEmail = (email, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL || process.env.CORS_ORIGIN}/reset-password?token=${encodeURIComponent(resetToken)}`;
    return sendEmail({ to: email, subject: 'EduVance password reset', html: `<p><a href="${resetUrl}">Reset your password</a>. This link expires in 1 hour.</p>`, type: 'password_reset' });
};

const sendWelcomeEmail = (email, name) => sendEmail({
    to: email, subject: 'Welcome to EduVance',
    html: `<h2>Welcome, ${escapeHtml(name)}!</h2><p>Your EduVance account has been created successfully.</p>`, type: 'welcome',
});

const sendNotificationEmail = (email, subject, message) => sendEmail({ to: email, subject, html: `<p>${escapeHtml(message)}</p>`, type: 'notification' });

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail, sendNotificationEmail, makeIdempotencyKey };
