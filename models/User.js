const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// In: backend/models/User.js

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    austonId: { type: String, required: true, unique: true },
    role: { type: String, enum: ['student', 'admin', 'staff', 'visitor'], default: 'student' },
    
    // --- ADD THIS NEW FIELD ---
    avatarUrl: { type: String, default: null } // Will store path like '/avatars/avatar-12345.png'

}, { timestamps: true });

// ... your pre-save hook for password hashing ...

// This "pre-save hook" automatically hashes the password before any 'save' operation.
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});


module.exports = mongoose.model('User', userSchema);
