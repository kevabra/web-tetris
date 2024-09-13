const mongoose = require('mongoose');

const gameHistorySchema = new mongoose.Schema({
    score: Number,
    level: Number,
    date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    gameHistory: [gameHistorySchema],
    highestScore: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', userSchema);


