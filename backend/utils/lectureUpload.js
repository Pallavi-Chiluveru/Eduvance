const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Base upload directory
const baseUploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');

// Storage configuration for lectures
const lectureStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Get course ID from request body
        const courseId = req.body.course;

        if (!courseId) {
            return cb(new Error('Course ID is required'), null);
        }

        // Create course-specific directory: uploads/lectures/courseId/
        const courseDir = path.join(baseUploadDir, 'lectures', courseId);

        // Ensure directory exists
        if (!fs.existsSync(courseDir)) {
            fs.mkdirSync(courseDir, { recursive: true });
        }

        cb(null, courseDir);
    },
    filename: (req, file, cb) => {
        // Create filename: topic-title-timestamp.ext
        const topic = req.body.topic || 'general';
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9]/g, '_')
            .substring(0, 30);

        const filename = `${topic.replace(/\s+/g, '_')}-${baseName}-${timestamp}${ext}`;
        cb(null, filename);
    },
});

// File filter for lecture files
const lectureFileFilter = (req, file, cb) => {
    const allowedDocs = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedDocs.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${ext} is not allowed for lectures. Allowed: ${allowedDocs.join(', ')}`), false);
    }
};

const lectureUpload = multer({
    storage: lectureStorage,
    fileFilter: lectureFileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50 MB for lecture files
    },
});

module.exports = lectureUpload;
