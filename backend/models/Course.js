const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Course name is required'],
            trim: true,
            minlength: 3,
            maxlength: 120,
        },
        code: {
            type: String,
            required: [true, 'Course code is required'],
            unique: true,
            uppercase: true,
            trim: true,
            match: [/^[A-Z0-9-]{2,20}$/, 'Course code must contain only letters, numbers, or hyphens'],
        },
        description: {
            type: String,
            required: [true, 'Short description is required'],
            trim: true,
            minlength: 10,
            maxlength: 300,
        },
        fullDescription: { type: String, trim: true, minlength: 20, maxlength: 3000 },
        language: { type: String, trim: true, default: 'English', maxlength: 50 },
        durationHours: { type: Number, min: 1, max: 1000 },
        prerequisites: { type: String, trim: true, maxlength: 1000 },
        learningOutcomes: [{ type: String, trim: true, maxlength: 300 }],
        category: {
            type: String,
            trim: true,
            maxlength: 100,
            default: 'Computer Science',
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        topics: [
            {
                title: { type: String, required: true },
                order: { type: Number, default: 0 },
            },
        ],
        chapters: [{ title: { type: String, required: true }, order: { type: Number, default: 0 } }],
        thumbnail: String,
        difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
        modules: [{ title: { type: String, required: true, trim: true }, order: { type: Number, default: 0 }, lessons: [{ title: { type: String, required: true, trim: true }, order: { type: Number, default: 0 } }] }],
        status: { type: String, enum: ['draft', 'submitted', 'pending_review', 'under_review', 'changes_requested', 'approved', 'published', 'rejected', 'archived'], default: 'draft' },
        reviewMessage: String,
        submittedAt: Date,
        reviewedAt: Date,
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

courseSchema.index({ instructor: 1 });
courseSchema.index({ status: 1, submittedAt: 1 });
courseSchema.virtual('topicCount').get(function () {
    if (this.modules?.length) return this.modules.reduce((total, module) => total + (module.lessons?.length || 0), 0);
    return this.topics?.length || this.chapters?.length || 0;
});
courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

courseSchema.pre(/^find/, function (next) {
    if (this.getOptions().includeDeleted) return next();
    this.where({ isDeleted: { $ne: true } });
    next();
});

module.exports = mongoose.model('Course', courseSchema);
