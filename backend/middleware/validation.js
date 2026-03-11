const { body, param, query, validationResult } = require('express-validator');

/**
 * Process validation results — call after validation chains
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map((e) => ({
                field: e.path,
                message: e.msg,
            })),
        });
    }
    next();
};

// ───── Reusable validation chains ─────

const registerValidation = [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['student', 'teacher', 'parent', 'admin']).withMessage('Invalid role'),
];

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

const createCourseValidation = [
    body('name').trim().notEmpty().withMessage('Course name is required'),
    body('code').trim().notEmpty().withMessage('Course code is required'),
];

const createAssessmentValidation = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('course').isMongoId().withMessage('Valid course ID is required'),
    body('type').isIn(['practice', 'chapter_test', 'final']).withMessage('Invalid assessment type'),
    body('totalMarks').isInt({ min: 1 }).withMessage('Total marks must be a positive integer'),
    body('passingMarks').isInt({ min: 0 }).withMessage('Passing marks must be non-negative'),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer (minutes)'),
];

const mongoIdParam = [
    param('id').isMongoId().withMessage('Invalid ID format'),
];

const paginationQuery = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
];

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    createCourseValidation,
    createAssessmentValidation,
    mongoIdParam,
    paginationQuery,
};
