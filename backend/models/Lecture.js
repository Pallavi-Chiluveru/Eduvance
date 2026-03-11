const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Lecture title is required'],
            trim: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        topic: {
            type: String,
            required: [true, 'Topic is required'],
        },
        type: {
            type: String,
            enum: ['video', 'pdf', 'link'],
            required: true,
        },
        // For YouTube embeds
        videoUrl: String,
        // For uploaded PDFs
        fileUrl: String,
        fileName: String,
        description: String,
        duration: String, // e.g. "15:30"
        order: {
            type: Number,
            default: 0,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

lectureSchema.index({ course: 1, topic: 1 });
lectureSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Lecture', lectureSchema);
