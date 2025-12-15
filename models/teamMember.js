const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema({
  team_id: mongoose.Schema.Types.ObjectId,
  user_id: mongoose.Schema.Types.ObjectId,

  role: String,

  joined_at: Date
});

module.exports = mongoose.model("TeamMember", teamMemberSchema);
