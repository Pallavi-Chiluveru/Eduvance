const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        assessment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assessment',
            required: true,
        },
        answers: [
            {
                question: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Question',
                    required: true,
                },
                // For MCQ
                selectedOption: Number, // index of selected option
                // For descriptive
                answerText: String,
                // Grading
                marksAwarded: { type: Number, default: 0 },
                isCorrect: Boolean,
                feedback: String,
            },
        ],
        totalMarks: {
            type: Number,
            default: 0,
        },
        percentage: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['in_progress', 'submitted', 'graded'],
            default: 'submitted',
        },
        startedAt: Date,
        submittedAt: {
            type: Date,
            default: Date.now,
        },
        timeTaken: Number, // in seconds
        attemptNumber: {
            type: Number,
            default: 1,
        },
    },
    { timestamps: true }
);

submissionSchema.index({ student: 1, assessment: 1 });
submissionSchema.index({ assessment: 1, status: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
