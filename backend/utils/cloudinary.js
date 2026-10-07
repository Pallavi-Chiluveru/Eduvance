const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getCloudinaryConfigError() {
    const missing = [];
    if (!(process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME)) missing.push('CLOUDINARY_CLOUD_NAME');
    if (!process.env.CLOUDINARY_API_KEY) missing.push('CLOUDINARY_API_KEY');
    if (!process.env.CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET');
    return missing.length ? `Cloudinary is not configured. Missing: ${missing.join(', ')}` : null;
}

/**
 * Uploads a file to Cloudinary and deletes the local file
 * @param {string} localFilePath 
 * @param {string} folder 
 * @returns {Promise<{ secure_url: string, public_id: string }>} Uploaded image details
 */
const uploadToCloudinary = async (localFilePath, folder) => {
    if (!localFilePath) return null;

    const configError = getCloudinaryConfigError();
    if (configError) {
        const error = new Error(configError);
        error.code = 'CLOUDINARY_CONFIG_MISSING';
        throw error;
    }

    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            folder: folder || process.env.CLOUDINARY_FOLDER || 'avatars',
            resource_type: 'image',
        });

        return { secure_url: response.secure_url, public_id: response.public_id };
    } catch (error) {
        // Preserve Cloudinary's safe provider message/code for logs and API handling.
        console.error('Cloudinary upload failed:', {
            code: error.http_code || error.code || 'UNKNOWN',
            message: error.error?.message || error.message,
        });
        const uploadError = new Error(error.error?.message || error.message || 'Cloudinary upload failed');
        uploadError.statusCode = error.http_code === 401 || error.http_code === 403 ? 502 : 503;
        uploadError.code = error.http_code || error.code || 'CLOUDINARY_UPLOAD_FAILED';
        throw uploadError;
    } finally {
        if (fs.existsSync(localFilePath)) await fs.promises.unlink(localFilePath).catch(() => {});
    }
};

module.exports = { uploadToCloudinary, cloudinary, getCloudinaryConfigError };
