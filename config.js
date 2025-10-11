// In: backend/config.js

// This file is for SERVER-SIDE configuration only.
// It should contain secrets that the browser should NEVER see.

module.exports = {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/auston_library',
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret' // Change this for production
};