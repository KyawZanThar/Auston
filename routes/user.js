// In: backend/routes/user.js (REPLACE THE ENTIRE FILE)

const express = require('express');
const router = express.Router();

// Import the controller and middleware objects
const userCtrl = require('../controllers/userControllerFull');
const auth = require('../middleware/auth');
const uploadImage = require('../middleware/upload-image'); // <-- Import the new middleware

// ...

// --- UPDATE THIS ROUTE ---
// We add the upload middleware. 'avatar' is the name of the file field in our form.
router.post('/register', uploadImage.single('avatar'), userCtrl.registerValidators, userCtrl.register);

// --- ROUTES ---

// Public routes (no 'auth' middleware)
router.post('/register', userCtrl.registerValidators, userCtrl.register);
router.post('/login', userCtrl.login);

// Protected routes (require a valid token)
router.get('/profile', auth.authenticate, userCtrl.profile);
router.patch('/profile', auth.authenticate, uploadImage.single('avatar'), userCtrl.updateProfile);

// In: backend/routes/user.js

// ... your other routes ...

// --- ADD THIS NEW ROUTE ---
// Handles changing the user's password.
router.patch('/change-password', auth.authenticate, userCtrl.changePassword);



// Admin-only routes (require token AND 'admin' role)
// This is the line that was causing the crash. It is now clean.
router.get('/', auth.authenticate, auth.requireRole('admin'), userCtrl.listUsers);
router.delete('/:id', auth.authenticate, auth.requireRole('admin'), userCtrl.deleteUser);

module.exports = router;