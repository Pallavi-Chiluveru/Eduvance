const path = require('path');
const types = { '.pdf': 'application/pdf', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.doc': 'application/msword', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
// Called only after the existing admin or document-owner authorization checks.
exports.streamInstructorDocument = (res, document, next) => {
    const storageId = document.storageId;
    if (typeof storageId !== 'string' || path.basename(storageId) !== storageId || /[\\/]/.test(storageId)) return res.status(404).json({ success: false, message: 'Document not found' });
    const type = types[path.extname(storageId).toLowerCase()] || 'application/octet-stream';
    res.set({ 'Content-Type': type, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' });
    res.sendFile(storageId, { root: path.join(__dirname, '..', 'private-uploads', 'instructor-documents'), dotfiles: 'deny' }, error => {
        if (error && !res.headersSent) next(error);
    });
};
