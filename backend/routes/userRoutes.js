const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    // Create a new user
    user = new User({
      username,
      password: await bcrypt.hash(password, 10)
    });

    await user.save();
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login a user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Generate a token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '480h' });
    res.json({ token });
  
});

// Get user profile and game history
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user game history
router.post('/update-game-history', authMiddleware, async (req, res) => {
  try {
    const { score, level } = req.body;

    // Find the user and update game history
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.gameHistory.push({ score, level });
    user.highestScore = Math.max(user.highestScore, score);
    await user.save();

    res.json({ msg: 'Game history updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user game history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('gameHistory');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user.gameHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
