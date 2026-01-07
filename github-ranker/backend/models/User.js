const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  githubUrl: String,
  // The specific columns you requested
  score: { type: Number, default: 0 }, 
  hackathonCount: { type: Number, default: 0 },
  lastAnalyzed: { type: Date }
});

module.exports = mongoose.model('User', UserSchema);