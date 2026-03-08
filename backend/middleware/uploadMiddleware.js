const multer = require('multer');
const path = require('path');

// Allowed MIME types for security
const allowedDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const allowedEvidenceTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'audio/mpeg', 'audio/mp3'];

// File size limit (10MB max for production)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Configure storage for uploaded files
const storage = multer.diskStorage({
  // Set destination folder based on route
  destination: function (req, file, cb) {
    // Check if it's a document or evidence upload
    if (req.baseUrl.includes('documents')) {
      cb(null, 'uploads/documents');
    } else {
      cb(null, 'uploads/evidence');
    }
  },

  // Create unique filename to prevent overwriting
  filename: function (req, file, cb) {
    // Get original file extension
    const ext = path.extname(file.originalname).toLowerCase();
    // Sanitize filename - remove special characters for security
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    // Create unique name: timestamp + random string + extension
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  }
});

// File filter to allow only specific file types and block dangerous files
const fileFilter = (req, file, cb) => {
  // Check file extension for security
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Block executable files and potential malware
  const blockedExtensions = ['.exe', '.bat', '.sh', '.php', '.js', '.vbs', '.cmd', '.com', '.pif'];
  if (blockedExtensions.includes(ext)) {
    return cb(new Error('Executable files are not allowed for security reasons'), false);
  }

  // Determine if it's a document or evidence route
  if (req.baseUrl.includes('documents')) {
    if (allowedDocTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents (.pdf, .doc, .docx) are allowed'), false);
    }
  } else {
    if (allowedEvidenceTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, PNG), videos (MP4), and audio files (MP3) are allowed'), false);
    }
  }
};

// Create multer upload instance with enhanced security
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE, // Reduced from 50MB to 10MB for production
    files: 5 // Limit number of files per request
  },
  fileFilter: fileFilter
});

module.exports = upload;
