// In: backend/middleware/upload-image.js

const multer = require('multer');
const path = require('path');

// Configure where to store the images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save images to a 'public/avatars' folder
    // We use a 'public' folder to make them easily accessible
    const uploadPath = path.join(__dirname, '..', 'public', 'avatars');
    require('fs').mkdirSync(uploadPath, { recursive: true }); // Create folder if it doesn't exist
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter for common image file types
function fileFilter (req, file, cb) {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Error: Only image files (jpeg, jpg, png, gif) are allowed!'));
}

// In: backend/middleware/upload-image.js

// Find this part of your file
const uploadImage = multer({
    storage: storage,
    fileFilter: fileFilter,
    // --- THIS IS THE PART TO CHANGE ---
    limits: { fileSize: 15 * 1024 * 1024 } // Increased limit to 10MB
});

module.exports = uploadImage;

