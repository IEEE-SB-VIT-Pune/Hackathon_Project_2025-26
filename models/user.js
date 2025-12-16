const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    bio: {
      type: String,
      default: ""
    },

    skills: {
      type: [String],
      default: []
    },

    resume_url: String,
    github_url: String,
    linkedin_url: String,

    no_of_hackathon_wins: {
      type: Number,
      default: 0
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
