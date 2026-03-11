const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});

// File filter
const fileFilter = (_req, file, cb) => {
    const allowedVideo = ['.mp4', '.mpeg', '.webm', '.mkv'];
    const allowedDocs = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
    const allowedImages = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const all = [...allowedVideo, ...allowedDocs, ...allowedImages];

    const ext = path.extname(file.originalname).toLowerCase();
    if (all.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${ext} is not allowed. Allowed: ${all.join(', ')}`), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10 MB
    },
});

module.exports = upload;
