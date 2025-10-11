// In: backend/routes/book.js (REPLACE THE ENTIRE FILE)

const express = require('express');
const router = express.Router();

const bookCtrl = require('../controllers/bookController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// --- USER-FACING ROUTES ---

// POST /api/books/upload
router.post('/upload', auth.authenticate, upload.single('file'), bookCtrl.uploadBook);

// GET /api/books/my-uploads
// router.get('/my-uploads', auth.authenticate, bookCtrl.getMyUploads);

router.get('/', bookCtrl.listBooks);

router.get('/audiobooks', auth.authenticate, bookCtrl.getAudiobooks);


// GET /api/books  (FIXED: Removed admin role requirement)
// Lists all APPROVED books for any authenticated user.
// CORRECT VERSION (Allows any logged-in user)
router.get('/my-uploads', auth.authenticate, bookCtrl.getMyUploads);

router.get('/', auth.authenticate, bookCtrl.listBooks);
// GET /api/books/mockfile/:id
router.get('/mockfile/:id', auth.authenticate, bookCtrl.getMockFile);


// --- ARXIV ROUTE ---

// GET /api/books/arxiv-latest (FIXED: Ensures this route exists)
// Gets a list of the latest CS papers from ArXiv.
 // router.get('/arxiv-latest', auth.authenticate, bookCtrl.getLatestArxivPapers);

// In: backend/routes/book.js

// DELETE this line:
// router.get('/tech-books', auth.authenticate, bookCtrl.getTechBooks);

// And ADD this new line in its place:
// Route to get a list of popular books from the Internet Archive.
// In: backend/routes/book.js

// DELETE this line:
// router.get('/archive-popular', auth.authenticate, bookCtrl.getPopularArchiveBooks);

// And ADD this new, clearer line in its place:
// Route to get a list of tech books from the Internet Archive.
router.get('/tech-books', bookCtrl.getTechBooks);
// --- ADMIN-ONLY ROUTES ---

// GET /api/books/admin/all
router.get('/admin/all', auth.authenticate, auth.requireRole('admin'), bookCtrl.adminListAll);

// PATCH /api/books/approve/:id
router.patch('/approve/:id', auth.authenticate, auth.requireRole('admin'), bookCtrl.approveBook);

// PATCH /api/books/reject/:id
router.patch('/reject/:id', auth.authenticate, auth.requireRole('admin'), bookCtrl.rejectBook);

// GET /api/books/admin/download/:id
router.get('/admin/download/:id', auth.authenticate, auth.requireRole('admin'), bookCtrl.downloadBook);


module.exports = router;