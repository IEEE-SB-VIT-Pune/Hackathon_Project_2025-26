const mongoose = require("mongoose");
const User = require("../models/user");

/* ================= REGISTER USER ================= */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, bio, skills, resume_url, github_url, linkedin_url, role } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required"
      });
    }

    // Check duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    const newUser = new User({
      name,
      email,
      bio: bio || "",
      skills: Array.isArray(skills) ? skills : [],
      resume_url,
      github_url,
      linkedin_url,
      no_of_hackathon_wins: 0,
      role: role || "user"
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message
    });
  }
};

/* ================= CREATE / UPDATE PROFILE ================= */
exports.createProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const updates = req.body;

    // Prevent sensitive updates
    delete updates.email;
    delete updates.role;
    delete updates.no_of_hackathon_wins;
    delete updates.created_at;

    if (updates.skills && !Array.isArray(updates.skills)) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message
    });
  }
};

/* ================= GET OWN PROFILE ================= */
exports.getOwnProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message
    });
  }
};

/* ================= GET PUBLIC PROFILE ================= */
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const user = await User.findById(userId)
      .select("name bio skills github_url linkedin_url no_of_hackathon_wins");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message
    });
  }
};

/* ================= GET ALL USERS ================= */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      "name bio skills github_url linkedin_url no_of_hackathon_wins"
    );

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message
    });
  }
};

/* ================= DELETE ACCOUNT ================= */
exports.deleteAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting account",
      error: error.message
    });
  }
};
