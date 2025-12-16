const express = require("express");
const router = express.Router();
const hackathonController = require("../controllers/hackathon");
const { isAdmin } = require("../middleware/auth");

/* ================= ADMIN ROUTES ================= */

router.post("/admin/create", isAdmin, hackathonController.createHackathon);
router.get("/admin/all", isAdmin, hackathonController.getAllHackathonsAdmin);
router.get("/admin/:hackathonId/registrations", isAdmin, hackathonController.getHackathonRegistrations);
router.put("/admin/:hackathonId", isAdmin, hackathonController.updateHackathon);
router.patch("/admin/:hackathonId/status", isAdmin, hackathonController.updateHackathonStatus);
router.delete("/admin/:hackathonId", isAdmin, hackathonController.deleteHackathon);

/* ================= USER ROUTES ================= */

router.get("/", hackathonController.getAllHackathons);
router.get("/:hackathonId", hackathonController.getHackathonDetails);
router.get("/:hackathonId/external", hackathonController.getExternalRegistration);
router.post("/:hackathonId/register", hackathonController.registerForHackathon);
router.delete("/:hackathonId/withdraw/:userId", hackathonController.withdrawFromHackathon);

module.exports = router;
