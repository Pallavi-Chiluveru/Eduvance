const mongoose = require('mongoose');

const courseReviewSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    submissionNumber: { type: Number, required: true, min: 1 },
    decision: { type: String, enum: ['approved', 'changes_requested', 'rejected'], required: true },
    comments: { type: String, trim: true, maxlength: 3000, default: '' },
    submittedAt: { type: Date, required: true },
}, { timestamps: true });

courseReviewSchema.index({ course: 1, submissionNumber: 1 }, { unique: true });
module.exports = mongoose.model('CourseReview', courseReviewSchema);
