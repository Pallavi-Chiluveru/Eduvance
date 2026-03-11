const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Course name is required'],
            trim: true,
        },
        code: {
            type: String,
            required: [true, 'Course code is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        category: {
            type: String,
            enum: [
                'Computer Science',
                'Programming',
                'Data Science',
                'Web Development',
                'Aptitude',
                'AI',
                'Other',
            ],
            default: 'Computer Science',
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        topics: [
            {
                title: { type: String, required: true },
                order: { type: Number, default: 0 },
            },
        ],
        thumbnail: String,
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

courseSchema.index({ teacher: 1 });

courseSchema.pre(/^find/, function (next) {
    if (this.getOptions().includeDeleted) return next();
    this.where({ isDeleted: { $ne: true } });
    next();
});

module.exports = mongoose.model('Course', courseSchema);
