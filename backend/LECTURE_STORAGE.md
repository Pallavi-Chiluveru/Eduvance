# Lecture File Storage Structure

## Overview
Lecture PDFs and documents are stored in a course-organized folder structure on the file system, not in MongoDB. This keeps the database lightweight and makes file management easier.

## Folder Structure

```
backend/
└── uploads/
    └── lectures/
        ├── {courseId1}/
        │   ├── unit1-introduction-1708089234567.pdf
        │   ├── unit1-syllabus-1708089345678.pdf
        │   ├── unit2-chapter1-1708089456789.pdf
        │   └── unit2-notes-1708089567890.docx
        ├── {courseId2}/
        │   ├── unit1-basics-1708089678901.pdf
        │   └── unit3-advanced-1708089789012.pdf
        └── {courseId3}/
            └── unit1-overview-1708089890123.pdf
```

## File Naming Convention

Files are automatically named using the pattern:
```
unit{chapter}-{sanitized-filename}-{timestamp}.{extension}
```

**Examples:**
- `unit1-introduction_to_programming-1708089234567.pdf`
- `unit2-data_structures-1708089345678.docx`
- `unit3-algorithms-1708089456789.ppt`

## How It Works

### Upload Process
1. Teacher selects a course and uploads a PDF/document
2. System creates course-specific folder if it doesn't exist: `uploads/lectures/{courseId}/`
3. File is saved with structured naming convention
4. MongoDB stores only the **relative URL path**: `/uploads/lectures/{courseId}/filename.pdf`
5. Students access files via this URL path

### Download Process
1. Student clicks download button
2. Frontend uses the `fileUrl` from the lecture object
3. Express serves the file from the static uploads folder
4. File downloads to student's device

### Delete Process
1. Teacher deletes a lecture
2. System removes the MongoDB document
3. System also deletes the physical file from disk
4. Prevents orphaned files and saves storage space

## Benefits

✅ **Organized**: Files grouped by course for easy management  
✅ **Scalable**: File system handles large files better than MongoDB  
✅ **Fast**: Direct file serving without database queries  
✅ **Clean**: Automatic cleanup when lectures are deleted  
✅ **Traceable**: Filenames include unit number and timestamp  
✅ **Safe**: Course-based folders prevent naming conflicts  

## File Size Limits

- Maximum file size: **50 MB** (configurable in `lectureUpload.js`)
- Allowed formats: `.pdf`, `.doc`, `.docx`, `.ppt`, `.pptx`, `.txt`

## Storage Location

- **Development**: `backend/uploads/lectures/`
- **Production**: Configure via `UPLOAD_DIR` environment variable

## Backup Recommendations

Since lecture files are stored on the file system:
1. Include `uploads/lectures/` in your backup strategy
2. Use cloud storage sync (AWS S3, Google Cloud Storage, etc.)
3. Regular automated backups of the entire uploads folder
4. Keep MongoDB backups separate (contains only file paths)

## Migration Notes

If you need to move files to a different server:
1. Copy the entire `uploads/lectures/` folder structure
2. File URLs in MongoDB will remain valid (relative paths)
3. No database changes needed

## Environment Variables

```env
UPLOAD_DIR=uploads          # Base upload directory
MAX_FILE_SIZE=52428800      # 50 MB in bytes
```

## Security

- Files are served through Express static middleware
- No direct file system access from frontend
- Teacher authorization required for upload/delete
- Student authentication required for download
- File type validation on upload

## Maintenance

To clean up orphaned files (if any):
```bash
# List all files in lectures folder
ls -R uploads/lectures/

# Compare with database records
# Delete files not referenced in MongoDB
```

## Future Enhancements

- [ ] Cloud storage integration (S3, Azure Blob)
- [ ] Automatic file compression
- [ ] Virus scanning on upload
- [ ] CDN integration for faster downloads
- [ ] File versioning support
