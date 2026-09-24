const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dir = path.join(__dirname, '..', 'private-uploads', 'instructor-documents');
fs.mkdirSync(dir, { recursive: true });
const allowed = {
 resume: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
 proof: ['application/pdf', 'image/jpeg', 'image/png'],
};
module.exports = multer({
 storage: multer.diskStorage({ destination: (_r,_f,cb)=>cb(null,dir), filename: (_r,f,cb)=>cb(null,`${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(f.originalname).toLowerCase()}`) }),
 fileFilter: (_r,file,cb)=>allowed[file.fieldname]?.includes(file.mimetype) ? cb(null,true) : cb(new Error(file.fieldname==='resume'?'Resume must be PDF, DOC, or DOCX.':'Proof must be PDF, JPG, JPEG, or PNG.')),
 limits: { fileSize: 5 * 1024 * 1024, files: 2 }
});
