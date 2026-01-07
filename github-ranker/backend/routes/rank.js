const router = require('express').Router();
// Import the analyzeProfile function from your scoringEngine
const { analyzeProfile } = require('../services/scoringEngine');

router.post('/rank-me', async (req, res) => {
    try {
        const { githubUrl } = req.body;

        if (!githubUrl) {
            return res.status(400).json({ error: "GitHub URL or username is required" });
        }

        // 1. Extract username from URL (handles trailing slashes and full URLs)
        // e.g., "https://github.com/tanu/" -> "tanu"
        const username = githubUrl.replace(/\/$/, "").split('/').pop();
        
        console.log(`🔍 Starting analysis for user: ${username}`);

        // 2. Call the scoring engine
        const results = await analyzeProfile(username);

        // 3. Send the results back to the frontend
        res.json(results);

    } catch (err) {
        // Detailed logging for your terminal
        console.error("❌ Route Error:", err.response?.data?.message || err.message);
        
        // Return a clean error to the frontend
        res.status(500).json({ 
            error: "Failed to fetch GitHub data", 
            details: err.response?.data?.message || err.message 
        });
    }
});

// IMPORTANT: Only export the router in this file
module.exports = router;