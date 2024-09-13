const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import cors
const userRoutes = require('./routes/userRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const authMiddleware = require('./middleware/auth');
const authRoutes = require('./routes/auth.js');
const scoresRoutes = require('./routes/scores.js');
const dotenv = require('dotenv');
const app = express();


dotenv.config();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // For parsing application/json

// Routes
app.use('/api/users', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoresRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
