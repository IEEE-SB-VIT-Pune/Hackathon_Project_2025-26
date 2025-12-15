const mongoose = require("mongoose");

const judgeSchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,

  expertise: [String],
  organization: String,

  created_at: Date
});

module.exports = mongoose.model("Judge", judgeSchema);
