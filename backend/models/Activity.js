const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        dateString: {
            type: String, // YYYY-MM-DD for easy unique indexing
            required: true,
        },
        points: {
            type: Number,
            default: 1,
        },
        activities: [
            {
                type: {
                    type: String,
                    enum: ['quiz_submit', 'lecture_view', 'login', 'practice'],
                    required: true,
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
                detail: String,
            }
        ],
    },
    { timestamps: true }
);

// Ensure one activity record per student per day
activitySchema.index({ student: 1, dateString: 1 }, { unique: true });
activitySchema.index({ student: 1, date: 1 });

module.exports = mongoose.model('Activity', activitySchema);
