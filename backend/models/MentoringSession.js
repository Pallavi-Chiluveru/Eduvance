const mongoose = require('mongoose');

const mentoringSessionSchema = new mongoose.Schema({
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    topic: { type: String, required: true, trim: true, maxlength: 300 },
    notes: { type: String, required: true, trim: true, maxlength: 4000 },
    feedback: { type: String, trim: true, maxlength: 3000, default: '' },
    followUp: { type: String, trim: true, maxlength: 2000, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('MentoringSession', mentoringSessionSchema);
