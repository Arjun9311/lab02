// Import required modules
const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

// Create the Express application
const app = express();

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Configuration: Port and Database file path from environment or defaults
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'bookstore.db');

// Global database connection variable
let db = null;

// Helper function to validate positive integer IDs
function isPositiveInteger(value) {
  return /^\d+$/.test(value) && Number(value) > 0;
}

// Route 1: GET /books/ - Retrieve all books
app.get('/books/', async (req, res, next) => {
  try {
    const getBooksQuery = 'SELECT * FROM book;';
    const books = await db.all(getBooksQuery);
    res.status(200).json(books);
  } catch (error) {
    next(error);
  }
});

// Route 2: GET /books/:bookId/ - Retrieve a single book by ID
app.get('/books/:bookId/', async (req, res, next) => {
  try {
    const { bookId } = req.params;

    // Validate that bookId is a positive integer
    if (!isPositiveInteger(bookId)) {
      return res.status(400).json({ error: 'Book ID must be a positive integer' });
    }

    // Query book using ? placeholder to prevent SQL injection
    const getBookQuery = 'SELECT * FROM book WHERE id = ?;';
    const book = await db.get(getBookQuery, [bookId]);

    // If no book matches the ID, return 404
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.status(200).json(book);
  } catch (error) {
    next(error);
  }
});

// Initialize SQLite database and start the Express server
async function initializeDBAndServer() {
  try {
    // Open connection to SQLite database
    db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    // Start server only after database connection succeeds
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    // Log error and exit process on connection failure
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
}

// Call initialization function to start DB and server
initializeDBAndServer();

module.exports = app;
