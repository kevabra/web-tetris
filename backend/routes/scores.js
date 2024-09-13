const express = require('express');
const Score = require('../models/Score');
const User = require('../models/User');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // Middleware to verify JWT token

// Add score
/*
router.post('/', authMiddleware, async (req, res) => {
    const { score, level } = req.body;
    const userId = req.user.id;
    try {
        const newScore = new Score({ userId, score });
        await newScore.save();

        // Update highest score and game history
        const user = await User.findById(userId);
        if (score > user.highestScore) {
            user.highestScore = score;
        }
        user.gameHistory.push({ score, level });
        await user.save();

        res.status(201).json(newScore);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});*/

// Get all scores (leaderboard)
router.get('/', async (req, res) => {
    try {
        const scores = await Score.find().populate('userId').sort({ score: -1 }).limit(10);
        res.json(scores);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
