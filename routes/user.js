const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
// Authentication & Registration
router.post("/register", userController.registerUser);

// Read
router.get("/", userController.getAllUsers);
router.get("/profile/:userId", userController.getUserProfile);
router.get("/:userId/profile", userController.getOwnProfile);

// Create / Update
router.post("/:userId/profile", userController.createProfile);

// Delete
router.delete("/:userId", userController.deleteAccount);

module.exports = router;