const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,

  bio: String,
  skills: [String],

  resume_url: String,

  github_url: String,
  linkedin_url: String,

  no_of_hackathon_wins: Number,

  role: String, 

  created_at: Date
});

module.exports = mongoose.model("User", userSchema);
