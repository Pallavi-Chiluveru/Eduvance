/**
 * Stub email service — logs to console in development.
 * Replace with nodemailer / SendGrid / SES in production.
 */

const sendEmail = async ({ to, subject, html }) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`📧 Email (dev stub):`);
        console.log(`   To: ${to}`);
        console.log(`   Subject: ${subject}`);
        console.log(`   Body: ${html.substring(0, 120)}...`);
        return { success: true, messageId: 'dev-stub' };
    }

    // Production: integrate with nodemailer, SendGrid, etc.
    // const transporter = nodemailer.createTransport({ ... });
    // await transporter.sendMail({ from, to, subject, html });

    return { success: true };
};

/**
 * Send a password-reset email
 */
const sendPasswordResetEmail = async (email, resetToken) => {
    const resetUrl = `${process.env.CORS_ORIGIN}/reset-password?token=${resetToken}`;
    return sendEmail({
        to: email,
        subject: 'DLSES — Password Reset Request',
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
    });
};

/**
 * Send a welcome email
 */
const sendWelcomeEmail = async (email, name) => {
    return sendEmail({
        to: email,
        subject: 'Welcome to DLSES!',
        html: `<h2>Welcome, ${name}!</h2><p>Your DLSES account has been created successfully.</p>`,
    });
};

module.exports = { sendEmail, sendPasswordResetEmail, sendWelcomeEmail };
