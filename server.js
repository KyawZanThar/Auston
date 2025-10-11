// In: C:\Auston\server.js (REPLACE THE ENTIRE FILE)


const express = require('express');
const path = require('path');
// This path looks inside the 'models' subfolder for 'db.js'
const connectDB = require('./models/db'); // Correct path since 'models' is a subfolder
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectDB();

    app.use(cors());
    app.use(express.json());

    // --- THIS IS THE CRITICAL FIX ---

    // 1. Define the path to your 'Frontend' folder.
    // __dirname is 'C:\Auston'. We look for 'Frontend' directly inside it.
    const frontendPath = path.join(__dirname, 'Frontend');
    
    // 2. Tell Express to serve all static files from that 'Frontend' folder.
    app.use(express.static(frontendPath));

    // In: backend/server.js

// ... your other middleware ...

// Make the 'uploads' folder publicly accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ADD THIS NEW LINE ---
// Make the 'public' folder (which contains avatars) publicly accessible
app.use(express.static(path.join(__dirname, 'public')));

    // --- END OF FIX ---


    // --- API ROUTES ---
    // These require paths are now correct for this structure.
    const bookRoutes = require('./routes/book');
    const userRoutes = require('./routes/user');
    app.use('/api/books', bookRoutes);
    app.use('/api/users', userRoutes);


    // --- ROOT ROUTE ---
    // This will catch a request to the base URL (e.g., http://localhost:3001/)
    app.get('/', (req, res) => {
        // and send the main login page from its correct location.
        res.sendFile(path.join(frontendPath, 'HTML', 'login.html'));
    });


    // Global Error Handler
    app.use((err, req, res, next) => {
        console.error("--- Global Error Handler ---");
        console.error(err.stack);
        res.status(500).send('Something broke!');
    });

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();