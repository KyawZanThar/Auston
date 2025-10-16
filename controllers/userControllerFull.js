// In: backend/controllers/userControllerFull.js (REPLACE THE ENTIRE FILE)

const User = require('../models/User'); // Make sure this path is correct
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

// --- VALIDATION RULES ---
const registerValidators = [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    body('username', 'Username is required').not().isEmpty(),
    body('austonId', 'Auston ID is required').not().isEmpty()
];

// --- CONTROLLER FUNCTIONS ---

// In: backend/controllers/userControllerFull.js

// Replace the existing 'register' function with this one
// In: backend/controllers/userControllerFull.js

// Replace your existing 'register' function with this one
// In: backend/controllers/userControllerFull.js

const register = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, austonId, role = 'student' } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // --- THIS IS THE NEW PART ---
        // Check if a file was uploaded and set the avatarUrl
        let avatarUrl = null;
        if (req.file) {
            // The path should be what the browser will use to access the file
            avatarUrl = `/avatars/${req.file.filename}`;
        }

        user = new User({
            username,
            email,
            password,
            austonId,
            role,
            avatarUrl // Save the path to the avatar
        });

        await user.save();
        
        // 1. Create the payload for the token
        const payload = {
            id: user.id,
            role: user.role,
            austonId: user.austonId,
            email: user.email,
            username: user.username
        };

        // 2. Sign the payload to create the JWT token
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '2h' } // Token will be valid for 2 hours
        );
        // ... (rest of the token creation and response logic is the same) ...
        res.status(201).json({ token });

    } catch (err) {
        console.error("Error during registration:", err.message);
        // Check for duplicate key error (e.g., if Auston ID is not unique)
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Email or Auston ID already exists.' });
        }
        next(err);
    }
};
// In: backend/controllers/userControllerFull.js

// Replace your existing 'login' function with this one
// In: backend/controllers/userControllerFull.js

const login = async (req, res, next) => {
    const { email, austonId, password } = req.body;
    try {
        const query = email ? { email } : { austonId };
        const user = await User.findOne(query);

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // --- THIS IS THE KEY CHANGE ---
        // Add avatarUrl to the payload and the response object
        const payload = {
            id: user.id,
            role: user.role,
            austonId: user.austonId,
            email: user.email,
            username: user.username,
            avatarUrl: user.avatarUrl // <-- ADD THIS
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '2h' });

        // We will also return the user object directly for simplicity
        res.json({ 
            token, 
            user: payload // Send the entire payload as the user object
        });

    } catch (err) {
        console.error("Error during login:", err.message);
        next(err);
    }
};

const profile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) { next(err); }
};

const listUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) { next(err); }
};

// In: backend/controllers/userControllerFull.js

// ... your other functions (register, login, etc.) ...

// In: backend/controllers/userControllerFull.js

// Replace your existing, placeholder 'updateProfile' function with this one
const updateProfile = async (req, res, next) => {
    try {
        // 1. Get the user ID from the authenticated token (provided by auth.js)
        const userId = req.user.id;
        
        // 2. Get the new username from the form data
        const { username } = req.body;

        // 3. Prepare an object with the data to be updated
        const updateData = {};
        if (username) {
            updateData.username = username;
        }

        // 4. Check if a new avatar file was uploaded by the 'uploadImage' middleware
        if (req.file) {
            // The path should be what the browser will use to access the file
            updateData.avatarUrl = `/avatars/${req.file.filename}`;
        }

        // 5. Find the user by their ID and update their data in the database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true } // 'new: true' returns the updated document
        ).select('-password'); // Exclude the password from the response

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        // 6. Create a NEW token with the updated user information
        const payload = {
            id: updatedUser.id,
            role: updatedUser.role,
            austonId: updatedUser.austonId,
            email: updatedUser.email,
            username: updatedUser.username,
            avatarUrl: updatedUser.avatarUrl // Include the new avatar URL
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '2h' });

        // 7. Send the new token and the updated user object back to the frontend
        res.json({
            message: 'Profile updated successfully.',
            token: token,
            user: payload
        });

    } catch (err) {
        console.error("Error during profile update:", err.message);
        next(err);
    }
};

// In: backend/controllers/userControllerFull.js

// ... your other functions (register, login, etc.) ...

// --- ADD THIS NEW FUNCTION ---
const changePassword = async (req, res, next) => {
    try {
        // 1. Get the data from the form
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // 2. Basic validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new passwords are required.' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
        }

        // 3. Find the user in the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // 4. Verify the CURRENT password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password.' });
        }

        // 5. Hash and save the NEW password
        // The pre-save hook in your User.js model will handle the hashing automatically.
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully.' });

    } catch (err) {
        next(err);
    }
};

// Placeholder functions for any other routes you might have

const deleteUser = async (req, res, next) => { res.status(501).json({ message: 'Not implemented yet.' }); };


// --- EXPORTS ---
module.exports = {
    registerValidators,
    register,
    login,
    profile,
    listUsers,
    updateProfile,
    deleteUser,
    changePassword
};