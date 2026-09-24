const mongoose = require('mongoose');

const mentorFeedbackSchema = new mongoose.Schema({
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    moduleId: String,
    feedback: { type: String, required: true, trim: true, maxlength: 3000 },
    followUp: { type: String, trim: true, maxlength: 2000, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('MentorFeedback', mentorFeedbackSchema);
