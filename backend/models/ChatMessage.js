const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        response: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ['general', 'subject', 'technical', 'exam', 'other', 'ai'],
            default: 'general',
        },
        isAI: {
            type: Boolean,
            default: false,
        },
        isHelpful: {
            type: Boolean,
            default: null,
        },
    },
    { timestamps: true }
);

chatMessageSchema.index({ user: 1 });
chatMessageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
