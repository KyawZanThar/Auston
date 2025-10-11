// In: backend/middleware/auth.js (REPLACE THE ENTIRE FILE)

// In: backend/middleware/auth.js

const jwt = require('jsonwebtoken');
const config = require('../config'); // <-- Find the new config.js

// Use the secret from the config file
const JWT_SECRET = config.JWT_SECRET;
// Define the first function
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decodedUserPayload = jwt.verify(token, JWT_SECRET);
        req.user = decodedUserPayload;
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

// Define the second function
const requireRole = (role) => {
    return (req, res, next) => {
        // This function now relies on 'authenticate' having run first
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated.' });
        }
        if (req.user.role !== role) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
        }
        next();
    };
};

// Export both functions in a single, clean object
module.exports = {
    authenticate,
    requireRole
};