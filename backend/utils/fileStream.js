const fs = require('fs');
const path = require('path');

/**
 * Shared utility to stream PDF files securely
 */
exports.streamFile = (res, filePath, fileName) => {
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'File not found' });
    }

    const stat = fs.statSync(filePath);

    res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Length': stat.size,
        'Content-Disposition': `inline; filename="${fileName || 'document.pdf'}"`,
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
};
