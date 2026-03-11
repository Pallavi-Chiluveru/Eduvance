const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
        },
        topic: String,
        front: {
            type: String,
            required: [true, 'Front text is required'],
        },
        back: {
            type: String,
            required: [true, 'Back text is required'],
        },
        // Spaced repetition fields
        difficulty: {
            type: Number, // 1-5 rating
            default: 3,
        },
        nextReview: {
            type: Date,
            default: Date.now,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
        interval: {
            type: Number, // days until next review
            default: 1,
        },
        easeFactor: {
            type: Number,
            default: 2.5,
        },
    },
    { timestamps: true }
);

flashcardSchema.index({ student: 1, course: 1 });
flashcardSchema.index({ student: 1, nextReview: 1 });

module.exports = mongoose.model('Flashcard', flashcardSchema);
