const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['points', 'badge', 'achievement'],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: String,
        points: {
            type: Number,
            default: 0,
        },
        badge: {
            type: String,
            enum: [
                'first_login',
                'course_complete',
                'perfect_score',
                'streak_7',
                'streak_30',
                'top_performer',
                'quick_learner',
                'flashcard_master',
                'attendance_star',
                'explorer',
                'coa_expert',
            ],
        },
        earnedAt: {
            type: Date,
            default: Date.now,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
        },
    },
    { timestamps: true }
);

rewardSchema.index({ student: 1 });
rewardSchema.index({ student: 1, badge: 1 });

module.exports = mongoose.model('Reward', rewardSchema);
