// In: backend/controllers/bookController.js (REPLACE THE ENTIRE FILE)

const Book = require('../models/Book');
const path = require('path');
const axios = require('axios');

// --- USER UPLOADS & LISTING ---

const uploadBook = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    const { title, author, description, category } = req.body;
    if (!title || !author) return res.status(400).json({ message: 'Title and author are required.' });
    if (!req.user || !req.user.austonId) return res.status(401).json({ message: 'Authentication error.' });
    
    const newBook = new Book({
      title, author, description: description || '', category: category || 'General',
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.austonId,
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    });
    await newBook.save();
    res.status(201).json({ message: 'Book uploaded successfully.', book: newBook });
  } catch (err) { next(err); }
};

// In: backend/controllers/bookController.js

// Replace the existing listBooks function with this one
const listBooks = async (req, res, next) => {
  try {
    // Get query parameters
    const { q, category, hasAudio, page = 1, limit = 50 } = req.query;
    
    // Start with a base filter: only show 'approved' books
    const filter = { status: 'approved' };

    // --- THIS IS THE NEW PART ---
    // If the 'hasAudio' flag is present, filter for books that have an audioUrl
    if (hasAudio === 'true') {
      filter.audioUrl = { $exists: true, $ne: null };
    }

    if (q) {
      filter.$text = { $search: q };
    }
    if (category && category.toLowerCase() !== 'all') {
      filter.category = category;
    }

    const skip = (page - 1) * limit;
    const books = await Book.find(filter)
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));
      
    res.json(books);
  } catch (err) {
    next(err);
  }
};

const getMyUploads = async (req, res, next) => {
  try {
    if (!req.user || !req.user.austonId) return res.status(401).json({ message: 'Authentication error.' });
    const myBooks = await Book.find({ uploadedBy: req.user.austonId }).sort({ uploadedAt: -1 });
    res.status(200).json(myBooks);
  } catch (err) { next(err); }
};

// --- FILE SERVING ---

const getMockFile = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: `Book not found.` });
    if (book.status !== 'approved' && req.user.role !== 'admin') return res.status(403).json({ message: 'This book is awaiting approval.' });
    if (book.fileUrl.startsWith('http')) return res.redirect(book.fileUrl);
    
    const absoluteFilePath = path.join(__dirname, '..', book.fileUrl);
    res.sendFile(absoluteFilePath, (err) => {
      if (err && !res.headersSent) res.status(500).send('Server Error: Physical file is missing.');
    });
  } catch (err) { next(err); }
};

// In: backend/controllers/bookController.js

// Replace your existing getAudiobooks function with this one
// In: backend/controllers/bookController.js

// Replace your existing getAudiobooks function with this one
const getAudiobooks = async (req, res, next) => {
  console.log("\n--- [START] FETCHING TECH AUDIOBOOKS (ROBUST) ---");
  try {
    const searchQuery = 'subject:("computer science" OR "python programming" OR "software") AND mediatype:("audio")';
    const fields = 'identifier,title,creator,description';
    const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(searchQuery)}&fl[]=${fields}&sort[]=downloads desc&rows=20&output=json`;
    
    const response = await axios.get(url, { timeout: 15000, headers: { 'User-Agent': 'Auston-Library-App/1.0' } });
    const docs = response.data?.response?.docs;
    if (!docs || docs.length === 0) return res.json([]);

    // --- THIS IS THE CRITICAL FIX ---
    // For each book, make a second call to get its detailed file metadata
    const audiobooks = await Promise.all(docs.map(async (doc) => {
      try {
        const metaUrl = `https://archive.org/metadata/${doc.identifier}`;
        const metaResponse = await axios.get(metaUrl, { timeout: 5000 });
        const files = metaResponse.data?.files;

        let audioUrl = null;
        if (files) {
          // Find the first file that is an MP3 and not a low-quality derivative
          const mp3File = files.find(f => f.name.endsWith('.mp3') && f.format === 'VBR MP3');
          if (mp3File) {
            audioUrl = `https://archive.org/download/${doc.identifier}/${mp3File.name}`;
          }
        }
        
        // If we found a valid MP3 URL, create the book object
        if (audioUrl) {
          return {
            _id: `ia_${doc.identifier}`,
            title: doc.title || 'Untitled Audio',
            author: Array.isArray(doc.creator) ? doc.creator.join(', ') : (doc.creator || 'Unknown Artist'),
            description: Array.isArray(doc.description) ? doc.description[0] : (doc.description || 'No description available.'),
            coverUrl: `https://archive.org/services/get-item-image.php?identifier=${doc.identifier}`,
            audioUrl: audioUrl, // This is now a guaranteed direct MP3 link
            fileUrl: `https://archive.org/details/${doc.identifier}`,
            status: 'approved',
            category: 'Audiobook'
          };
        }
        return null; // Return null if no valid MP3 was found
      } catch (error) {
        console.error(`Failed to get metadata for ${doc.identifier}`, error.message);
        return null; // Return null on error
      }
    }));
    
    // Filter out any null results from the final array
    const validAudiobooks = audiobooks.filter(book => book !== null);
    
    console.log(`3. Successfully formatted ${validAudiobooks.length} audiobooks. Sending response.`);
    res.json(validAudiobooks);

  } catch (err) {
    console.error("Error fetching tech audiobooks:", err.message);
    res.json([]);
  } finally {
    console.log("--- [END] FETCHING TECH AUDIOBOOKS ---");
  }
};


// --- INTERNET ARCHIVE API ---

// In: backend/controllers/bookController.js

// DELETE the getPopularArchiveBooks function and REPLACE it with this one.
const getTechBooks = async (req, res, next) => {
  console.log("\n--- [START] FETCHING TECH BOOKS FROM INTERNET ARCHIVE ---");
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const rows = 20;
    const offset = (page - 1) * rows;

    // --- THIS IS THE CORRECT, TECH-FOCUSED QUERY ---
    const searchQuery = 'subject:("computer science" OR "python programming" OR "software engineering") AND mediatype:("texts")';
    
    const fields = 'identifier,title,creator,description,subject';
    const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(searchQuery)}&fl[]=${fields}&sort[]=publicdate desc&rows=${rows}&start=${offset}&output=json`;
    
    console.log("1. Calling Internet Archive API for TECH books:", url);

    const response = await axios.get(url, {
        timeout: 15000,
        headers: { 'User-Agent': 'Auston-Library-App/1.0' }
    });

    const docs = response.data?.response?.docs;
    if (!docs || docs.length === 0) {
        console.warn("⚠️ Internet Archive API returned no tech book results for this query.");
        return res.json([]);
    }
    console.log(`2. Found ${docs.length} tech books from the API.`);

    const books = docs.map(doc => {
      const title = doc.title || 'Untitled';
      const author = Array.isArray(doc.creator) ? doc.creator.join(', ') : (doc.creator || 'Unknown Author');
      return {
        _id: `ia_${doc.identifier}`,
        title, author,
        description: Array.isArray(doc.description) ? doc.description[0] : (doc.description || 'No description available.'),
        coverUrl: `https://archive.org/services/get-item-image.php?identifier=${doc.identifier}`,
        fileUrl: `https://archive.org/details/${doc.identifier}`,
        status: 'approved',
        category: 'IT & CS' // Assign a consistent category
      };
    }).filter(book => book.title !== 'Untitled');
    
    console.log("3. Successfully formatted tech books. Sending response.");
    res.json(books);

  } catch (err) {
    console.error("❌ CRITICAL ERROR fetching from Internet Archive API:", err.message);
    res.json([]); // Send empty array on failure so frontend doesn't break
  } finally {
    console.log("--- [END] FETCHING TECH BOOKS ---");
  }
};

// --- IMPORTANT: UPDATE YOUR EXPORTS ---
// At the end of the file, make sure you are exporting the correct function name.
module.exports = {
  getTechBooks, // <-- UPDATED
  // ... all your other exported functions (uploadBook, listBooks, etc.)
};
// --- ADMIN FUNCTIONS ---
const adminListAll = async (req, res, next) => {
    try {
        const books = await Book.find().sort({ uploadedAt: -1 });
        res.json(books);
    } catch (err) { next(err); }
};
const approveBook = async (req, res, next) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.json({ message: 'Book approved', book });
    } catch (err) { next(err); }
};
const rejectBook = async (req, res, next) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
        if (!book) return res.status(404).json({ message: 'Book rejected', book });
        res.json({ message: 'Book rejected', book });
    } catch (err) { next(err); }
};
const downloadBook = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        const filePath = path.join(__dirname, '..', book.fileUrl);
        res.download(filePath);
    } catch (err) { next(err); }
};

// --- THIS IS THE SINGLE, CORRECT EXPORT BLOCK ---
module.exports = {
  uploadBook,
  listBooks,
  getMyUploads,
  getMockFile,
  getTechBooks,
  adminListAll,
  downloadBook,
  approveBook,
  rejectBook,
  getAudiobooks
};