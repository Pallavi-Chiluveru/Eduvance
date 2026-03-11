const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Assessment title is required'],
            trim: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        topic: String,
        type: {
            type: String,
            enum: ['practice', 'topic_test', 'final'],
            required: true,
        },
        description: String,
        instructions: String,
        totalMarks: {
            type: Number,
            required: true,
        },
        passingMarks: {
            type: Number,
            required: true,
        },
        duration: {
            type: Number, // in minutes
            required: true,
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
        },
        shuffleQuestions: {
            type: Boolean,
            default: false,
        },
        maxAttempts: {
            type: Number,
            default: 1, // unlimited for practice => set to 999
        },
        startDate: Date,
        endDate: Date,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

assessmentSchema.index({ course: 1, type: 1 });
assessmentSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
