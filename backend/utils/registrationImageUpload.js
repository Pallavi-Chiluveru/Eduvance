const multer = require('multer');
const path = require('path');

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxImageSize = 5 * 1024 * 1024;

const registrationImageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxImageSize, files: 1 },
    fileFilter: (_req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
        if (!allowedMimeTypes.includes(file.mimetype) || !allowedExtensions.includes(extension)) {
            return callback(new Error('Profile image must be a JPEG, PNG, or WebP image.'));
        }
        callback(null, true);
    },
});

module.exports = registrationImageUpload;
