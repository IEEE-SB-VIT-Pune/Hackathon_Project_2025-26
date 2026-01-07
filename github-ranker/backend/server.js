require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rankRoutes = require('./routes/rank');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debugging: Check if the route is loaded correctly
if (!rankRoutes || typeof rankRoutes !== 'function') {
    console.error("❌ ERROR: rankRoutes is not a valid function! Check module.exports in routes/rank.js");
}

// Routes
app.use('/api', rankRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:3000`);
    console.log(`🔑 GitHub Token: ${process.env.GITHUB_TOKEN ? 'Loaded ✅' : 'Missing ❌'}`);
});