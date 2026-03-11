const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
    {
        assessment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assessment',
            required: true,
        },
        type: {
            type: String,
            enum: ['mcq', 'descriptive'],
            required: true,
        },
        questionText: {
            type: String,
            required: [true, 'Question text is required'],
        },
        // MCQ-specific fields
        options: [
            {
                text: { type: String },
                isCorrect: { type: Boolean, default: false },
            },
        ],
        // Descriptive-specific fields
        modelAnswer: String,
        maxWords: Number,
        // Common fields
        marks: {
            type: Number,
            required: true,
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
        },
        explanation: String, // Shown after attempt
        order: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

questionSchema.index({ assessment: 1, order: 1 });

module.exports = mongoose.model('Question', questionSchema);
