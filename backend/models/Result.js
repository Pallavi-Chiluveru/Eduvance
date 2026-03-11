const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        assessment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assessment',
            required: true,
        },
        submission: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Submission',
            required: true,
        },
        totalMarks: { type: Number, required: true },
        obtainedMarks: { type: Number, required: true },
        percentage: { type: Number, required: true },
        grade: {
            type: String,
            enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
        },
        isPassed: { type: Boolean, required: true },
        remarks: String,
        gradedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        gradedAt: Date,
    },
    { timestamps: true }
);

resultSchema.index({ student: 1, assessment: 1 });

// Calculate grade from percentage
resultSchema.pre('save', function (next) {
    const p = this.percentage;
    if (p >= 90) this.grade = 'A+';
    else if (p >= 80) this.grade = 'A';
    else if (p >= 70) this.grade = 'B+';
    else if (p >= 60) this.grade = 'B';
    else if (p >= 50) this.grade = 'C+';
    else if (p >= 40) this.grade = 'C';
    else if (p >= 33) this.grade = 'D';
    else this.grade = 'F';
    next();
});

module.exports = mongoose.model('Result', resultSchema);
