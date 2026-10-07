const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/cloudinary');

/**
 * GET /api/:role/profile
 * Get current user's profile
 */
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            success: true,
            data: { user },
        });
    } catch (error) {
        if (error.code === 'CLOUDINARY_CONFIG_MISSING') {
            error.statusCode = 503;
            error.message = 'Avatar uploads are not configured on the server.';
        }
        if (req.file?.path) {
            const fs = require('fs');
            await fs.promises.unlink(req.file.path).catch(() => {});
        }
        next(error);
    }
};

/**
 * PUT /api/:role/profile
 * Update current user's profile
 */
exports.updateProfile = async (req, res, next) => {
    try {
        const { firstName, lastName, phone, grade, section } = req.body;

        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (phone !== undefined) updateData.phone = phone;
        if (grade !== undefined) updateData.grade = grade;
        if (section !== undefined) updateData.section = section;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/:role/change-password
 * Change user's password
 */
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required',
            });
        }

        const user = await User.findById(req.user._id).select('+password');

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/:role/profile/avatar
 * Upload and update user avatar
 */
exports.uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image file',
            });
        }

        const uploadedAvatar = await uploadToCloudinary(req.file.path, 'avatars');
        const avatarUrl = uploadedAvatar?.secure_url;
        if (!avatarUrl) {
            return res.status(502).json({ success: false, message: 'Cloudinary did not return an avatar URL. Please retry.' });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { avatar: avatarUrl },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Avatar updated successfully',
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};
