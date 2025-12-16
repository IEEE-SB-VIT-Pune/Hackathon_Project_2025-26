const mongoose = require("mongoose");

const problemStatementSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  tags: [String],
  pdf_link: String
});

const hackathonSchema = new mongoose.Schema({
  title: String,

  judge_email: Object,

  short_description: String,

  hackathon_type: {
    type: String,
    enum: ["internal", "external"],
    required: true
  },


  cover_image_url: String,
  organizer_name: String,

  external_registration_url: String,
  external_platform: String,

  detailed_description: String,
  rules: String,

  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  problem_statements: [problemStatementSchema],

  min_team_size: Number,
  max_team_size: Number,

  judging_criteria: String,
  prizes: String,

  mode: String,
  location: String,

  registration_start: Date,
  registration_end: Date,

  start_date: Date,
  end_date: Date,

  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed", "cancelled"],
    default: "upcoming"
  },

  created_at: Date,
  updated_at: Date
});

module.exports = mongoose.model("Hackathon", hackathonSchema);
