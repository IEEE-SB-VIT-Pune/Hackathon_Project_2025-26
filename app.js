const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

// Import routes
const userRoutes = require("./routes/user");
const hackathonRoutes = require("./routes/hackathon"); // Uncomment when ready

// Use routes
app.use("/user", userRoutes);
app.use("/hackathon", hackathonRoutes); // Uncomment when ready

app.get("/", (req, res) => {
  res.send("Project Started");
});

// Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;