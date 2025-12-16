const mongoose = require("mongoose");
const Hackathon = require("../models/hackathon");
const User = require("../models/user");

/* ======================================================
   USER OPERATIONS
   ====================================================== */

// View all hackathons (supports filtering)
exports.getAllHackathons = async (req, res) => {
  try {
    const { type, status, mode } = req.query;
    let filter = {};

    if (type) filter.hackathon_type = type;
    if (mode) filter.mode = mode;

    if (status) {
      const now = new Date();
      if (status === "upcoming") filter.start_date = { $gt: now };
      else if (status === "ongoing") {
        filter.start_date = { $lte: now };
        filter.end_date = { $gte: now };
      } else if (status === "completed") filter.end_date = { $lt: now };
      else filter.status = status;
    }

    const hackathons = await Hackathon.find(filter).sort({ start_date: 1 });

    res.status(200).json({
      success: true,
      count: hackathons.length,
      data: hackathons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching hackathons",
      error: error.message
    });
  }
};

// View hackathon details
exports.getHackathonDetails = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      return res.status(400).json({ success: false, message: "Invalid hackathon ID" });
    }

    const hackathon = await Hackathon.findById(hackathonId).populate(
      "participants",
      "name email bio skills github_url linkedin_url"
    );

    if (!hackathon) {
      return res.status(404).json({ success: false, message: "Hackathon not found" });
    }

    res.status(200).json({ success: true, data: hackathon });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching hackathon details",
      error: error.message
    });
  }
};

// Register for internal hackathon
exports.registerForHackathon = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { userId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(hackathonId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: "Hackathon not found" });
    }

    if (hackathon.hackathon_type !== "internal") {
      return res.status(400).json({
        success: false,
        message: "This is not an internal hackathon"
      });
    }

    const now = new Date();
    if (hackathon.registration_start && now < hackathon.registration_start) {
      return res.status(400).json({ success: false, message: "Registration not started" });
    }
    if (hackathon.registration_end && now > hackathon.registration_end) {
      return res.status(400).json({ success: false, message: "Registration closed" });
    }

    const alreadyRegistered = hackathon.participants.some(
      id => id.toString() === userId
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: "Already registered for this hackathon"
      });
    }

    hackathon.participants.push(userId);
    await hackathon.save();

    res.status(200).json({
      success: true,
      message: "Successfully registered for hackathon"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering for hackathon",
      error: error.message
    });
  }
};

// External hackathon registration info
exports.getExternalRegistration = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      return res.status(400).json({ success: false, message: "Invalid hackathon ID" });
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: "Hackathon not found" });
    }

    if (hackathon.hackathon_type !== "external") {
      return res.status(400).json({
        success: false,
        message: "This is not an external hackathon"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        title: hackathon.title,
        external_registration_url: hackathon.external_registration_url,
        external_platform: hackathon.external_platform
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching external registration",
      error: error.message
    });
  }
};

// Withdraw from hackathon
exports.withdrawFromHackathon = async (req, res) => {
  try {
    const { hackathonId, userId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(hackathonId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: "Hackathon not found" });
    }

    const now = new Date();
    if (hackathon.registration_end && now > hackathon.registration_end) {
      return res.status(400).json({
        success: false,
        message: "Cannot withdraw after deadline"
      });
    }

    hackathon.participants = hackathon.participants.filter(
      id => id.toString() !== userId
    );

    await hackathon.save();

    res.status(200).json({
      success: true,
      message: "Successfully withdrawn from hackathon"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error withdrawing from hackathon",
      error: error.message
    });
  }
};

/* ======================================================
   ADMIN OPERATIONS
   ====================================================== */

// Create hackathon
exports.createHackathon = async (req, res) => {
  try {
    const allowedTypes = ["internal", "external"];
    const { hackathon_type } = req.body;

    if (!allowedTypes.includes(hackathon_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hackathon_type"
      });
    }

    const hackathon = new Hackathon({
      ...req.body,
      participants: [],
      created_at: new Date(),
      updated_at: new Date()
    });

    await hackathon.save();

    res.status(201).json({
      success: true,
      message: "Hackathon created successfully",
      data: hackathon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating hackathon",
      error: error.message
    });
  }
};

// Admin: View all hackathons
exports.getAllHackathonsAdmin = async (req, res) => {
  try {
    const hackathons = await Hackathon.find()
      .populate("participants", "name email")
      .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      count: hackathons.length,
      data: hackathons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching hackathons",
      error: error.message
    });
  }
};

// Admin: View registrations
exports.getHackathonRegistrations = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      return res.status(400).json({ success: false, message: "Invalid hackathon ID" });
    }

    const hackathon = await Hackathon.findById(hackathonId).populate("participants");
    if (!hackathon) {
      return res.status(404).json({ success: false, message: "Hackathon not found" });
    }

    res.status(200).json({
      success: true,
      total_participants: hackathon.participants.length,
      data: hackathon.participants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching registrations",
      error: error.message
    });
  }
};

// Admin: Update hackathon
exports.updateHackathon = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      return res.status(400).json({ success: false, message: "Invalid hackathon ID" });
    }

    delete req.body.participants;
    delete req.body.created_at;

    const hackathon = await Hackathon.findByIdAndUpdate(
      hackathonId,
      { $set: { ...req.body, updated_at: new Date() } },
      { new: true, runValidators: true }
    );

    if (!hackathon) {
      return res.status(404).json({ success: false, message: "Hackathon not found" });
    }

    res.status(200).json({
      success: true,
      message: "Hackathon updated successfully",
      data: hackathon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating hackathon",
      error: error.message
    });
  }
};

// Admin: Update status
exports.updateHackathonStatus = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { status } = req.body;

    const validStatuses = ["upcoming", "ongoing", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const hackathon = await Hackathon.findByIdAndUpdate(
      hackathonId,
      { status, updated_at: new Date() },
      { new: true }
    );

    if (!hackathon) {
      return res.status(404).json({ success: false, message: "Hackathon not found" });
    }

    res.status(200).json({
      success: true,
      message: "Hackathon status updated",
      data: hackathon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating status",
      error: error.message
    });
  }
};

// Admin: Delete hackathon
exports.deleteHackathon = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      return res.status(400).json({ success: false, message: "Invalid hackathon ID" });
    }

    const hackathon = await Hackathon.findByIdAndDelete(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: "Hackathon not found" });
    }

    res.status(200).json({
      success: true,
      message: "Hackathon deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting hackathon",
      error: error.message
    });
  }
};
