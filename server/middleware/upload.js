const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('./errorHandler');
const logger = require('../utils/logger');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allow images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  }
  // Allow PDFs for CV uploads
  else if (file.mimetype === 'application/pdf') {
    cb(null, true);
  }
  // Allow common document formats
  else if (file.mimetype === 'application/msword' || 
           file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  }
  else {
    cb(new AppError('Invalid file type. Only images, PDFs, and Word documents are allowed.', 400), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only allow 1 file per upload
  }
});

// Specific upload configurations
const uploadAvatar = upload.single('avatar');
const uploadCV = upload.single('cv');
const uploadDocument = upload.single('document');

// Error handling wrapper for multer
const handleUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File too large. Maximum size is 5MB.', 400));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new AppError('Unexpected file field.', 400));
        }
        return next(new AppError(err.message, 400));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

// Clean up uploaded files after processing
const cleanupUpload = (req, res, next) => {
  if (req.file && req.file.path) {
    // Remove file after processing (optional - you might want to keep it for a while)
    fs.unlink(req.file.path, (err) => {
      if (err) {
        logger.error('Error deleting uploaded file:', err);
      }
    });
  }
  next();
};

module.exports = {
  uploadAvatar: handleUpload(uploadAvatar),
  uploadCV: handleUpload(uploadCV),
  uploadDocument: handleUpload(uploadDocument),
  cleanupUpload
}; 