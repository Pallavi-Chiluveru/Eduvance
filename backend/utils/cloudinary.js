const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a file to Cloudinary and deletes the local file
 * @param {string} localFilePath 
 * @param {string} folder 
 * @returns {Promise<string>} The secure URL of the uploaded image
 */
const uploadToCloudinary = async (localFilePath, folder = 'avatars') => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            folder: folder,
            resource_type: 'auto'
        });

        // Delete local file after upload
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return response.secure_url;
    } catch (error) {
        // Attempt to clean up local file if Cloudinary upload fails
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.error('Cloudinary Upload Error:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
};

module.exports = { uploadToCloudinary, cloudinary };
