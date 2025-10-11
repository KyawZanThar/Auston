// In: backend/models/db.js

const mongoose = require('mongoose');
// This path goes from /models up to /backend, then finds config.js
const config = require('../config'); 

const connectDB = async () => {
  const uri = config.MONGODB_URI;
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully.');
  } catch (err) {
    console.error('FATAL: MongoDB connection error:', err.message || err);
    process.exit(1);
  }
};

module.exports = connectDB;