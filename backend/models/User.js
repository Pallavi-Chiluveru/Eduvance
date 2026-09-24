const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
            maxlength: 50,
        },
        lastName: {
            type: String,
            default: '',
            trim: true,
            maxlength: 50,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6,
            select: false, // Don't return password by default
        },
        role: {
            type: String,
            enum: ['student', 'instructor', 'admin', 'reviewer', 'mentor'],
            required: [true, 'Role is required'],
        },
        avatar: {
            type: String,
            default: '',
        },
        phone: {
            type: String,
            trim: true,
        },
        // Student-specific fields
        studentId: {
            type: String,
            sparse: true,
            unique: true,
        },
        grade: String,
        section: String,
        learningStreak: { type: Number, default: 0 },
        bestStreak: { type: Number, default: 0 },
        lastActivityDate: Date,
        // Instructor-specific
        department: String,
        specialization: String,
        instructorVerification: {
            emailVerified: { type: Boolean, default: false },
            emailVerificationCodeHash: { type: String, select: false },
            emailVerificationExpires: { type: Date, select: false },
            emailVerificationLastSentAt: { type: Date },
            emailVerificationFailedAttempts: { type: Number, default: 0, min: 0 },
            organization: { type: String, trim: true, maxlength: 150 },
            expertise: { type: String, trim: true, maxlength: 200 },
            qualification: { type: String, trim: true, maxlength: 200 },
            experienceYears: { type: Number, min: 0, max: 70 },
            bio: { type: String, trim: true, maxlength: 1200 },
            professionalUrl: { type: String, trim: true },
            resumeDocument: {
                storageId: String, originalName: String, mimeType: String, size: Number,
            },            proofDocument: {
                storageId: String, originalName: String, mimeType: String, size: Number,
            },
            status: { type: String, enum: ['incomplete', 'pending', 'approved', 'rejected', 'changes_requested'], default: 'incomplete' },
            submittedAt: Date, reviewedAt: Date,
            reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            adminMessage: { type: String, maxlength: 1000 },
            rejectionCount: { type: Number, default: 0, min: 0 },
            rejectionWindowStartedAt: Date,
            lastRejectedAt: Date,
            reapplyAvailableAt: Date,
            rejectionHistory: [{
                _id: false, rejectedAt: Date,
                rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                reason: { type: String, maxlength: 1000 },
            }],
            submissionHistory: [{ _id: false, submittedAt: Date }],
        },        // Account status
        isActive: {
            type: Boolean,
            default: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        lastLogin: Date,
        refreshToken: {
            type: String,
            select: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName || ''}`.trim();
});

// Index for common queries
userSchema.index({ role: 1, isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Soft delete: filter out deleted users by default
userSchema.pre(/^find/, function (next) {
    if (this.getOptions().includeDeleted) return next();
    this.where({ isDeleted: { $ne: true } });
    next();
});

module.exports = mongoose.model('User', userSchema);
