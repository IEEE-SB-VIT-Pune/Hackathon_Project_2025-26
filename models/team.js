const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  hackathon_id: mongoose.Schema.Types.ObjectId,

  name: String,
  description: String,

  created_by: mongoose.Schema.Types.ObjectId,

  is_open: Boolean,

  created_at: Date,
  updated_at: Date
});

module.exports = mongoose.model("Team", teamSchema);
