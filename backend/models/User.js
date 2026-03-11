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
            required: [true, 'Last name is required'],
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
            enum: ['student', 'teacher', 'parent', 'admin'],
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
        // Parent-specific: linked children
        children: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        // Teacher-specific
        department: String,
        specialization: String,
        // Account status
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
    return `${this.firstName} ${this.lastName}`;
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
