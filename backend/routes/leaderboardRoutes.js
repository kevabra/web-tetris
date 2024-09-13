const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get the leaderboard
router.get('/', async (req, res) => {
  try {
    // Fetch users and sort by highest score
    const users = await User.find().sort({ highestScore: -1 }).limit(10).select('username highestScore');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
