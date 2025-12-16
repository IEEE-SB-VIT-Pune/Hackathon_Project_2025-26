const User = require("../models/user");

/* ================= CHECK IF USER IS ADMIN ================= */
exports.isAdmin = async (req, res, next) => {
  try {
    // Get userId from request body or params
    const userId = req.body.adminId || req.query.adminId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Admin ID required"
      });
    }

    // Find user in database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user has admin role
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }

    // Attach user to request object for use in controllers
    req.admin = user;
    next();

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error.message
    });
  }
};

/* ================= CHECK IF USER EXISTS ================= */
exports.isUser = async (req, res, next) => {
  try {
    const userId = req.body.userId || req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID required"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    req.user = user;
    next();

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error.message
    });
  }
};