const mongoose = require('mongoose');

const mentorAssignmentSchema = new mongoose.Schema({
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    removedAt: Date,
}, { timestamps: true });

mentorAssignmentSchema.index({ mentor: 1, student: 1 }, { unique: true });
module.exports = mongoose.model('MentorAssignment', mentorAssignmentSchema);
