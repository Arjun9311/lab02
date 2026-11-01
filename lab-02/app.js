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
