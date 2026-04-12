import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.js';
import {
  getOrganizerHackathons,
  getOrganizerApplications,
  reviewOrganizerApplication
} from '../controllers/organizer.controller.js';

const router = express.Router();

/* ================= PUBLIC / AUTHENTICATED ================= */

// Apply to become an organizer (Any logged-in user)
router.get('/applications', auth, authorize('VIEW_ORGANIZER_DASHBOARD', (req) => ({ user: req.user })), getOrganizerApplications);
router.patch('/applications/:id', auth, authorize('VIEW_ORGANIZER_DASHBOARD', (req) => ({ user: req.user })), reviewOrganizerApplication);

/* ================= ORGANIZER & ADMIN SHARED ================= */

// FIX: Switched from 'VIEW_ADMIN_DASHBOARD' to 'VIEW_ORGANIZER_DASHBOARD'
// This allows users who aren't System Admins but ARE Hackathon Organizers to pass.
router.get(
  '/hackathons', 
  auth, 
  authorize('VIEW_ORGANIZER_DASHBOARD', (req) => ({ user: req.user })), 
  getOrganizerHackathons
);

export default router;