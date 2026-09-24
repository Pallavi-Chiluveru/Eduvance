const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 200 },
    type: { type: String, enum: ['platform', 'student', 'instructor', 'content', 'assessment', 'community'], required: true },
    content: { type: String, required: true, trim: true, maxlength: 20000 },
    status: { type: String, enum: ['draft', 'published', 'unpublished', 'archived'], default: 'draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    publishedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Policy', policySchema);
