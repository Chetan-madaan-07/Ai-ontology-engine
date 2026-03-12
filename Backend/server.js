// First step of Parth's work: Setting up the Express server
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic test route to check if server is running
app.get('/', (req, res) => {
    res.send("Backend server is running ekdum mast, bhai!");
});

// We will add the /api/ingest and /api/graph routes here later

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is successfully running on port ${PORT} 🚀`);
});