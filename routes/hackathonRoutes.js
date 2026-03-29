import express from 'express';
import { getHackathonData, updateTeamSkills } from '../controllers/hackathonController.js';

const router = express.Router();

// GET /api/hackathon/:hackathonId — fetch hackathon + problems + teamId
router.get('/:hackathonId', getHackathonData);

// PATCH /api/hackathon/:hackathonId/team-skills — update skills from UI edits
router.patch('/:hackathonId/team-skills', updateTeamSkills);

export default router;
