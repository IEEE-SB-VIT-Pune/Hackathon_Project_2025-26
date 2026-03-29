import Hackathon from '../models/Hackathon.js';
import ProblemStatement from '../models/ProblemStatement.js';
import ProblemMetadata from '../models/ProblemMetadata.js';
import Team from '../models/Team.js';

/**
 * GET /api/hackathon/:hackathonId
 * Returns hackathon details, all associated problem statements, and the team for a given hackathon.
 */
export const getHackathonData = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    // Fetch hackathon
    const hackathon = await Hackathon.findById(hackathonId).lean();
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found. Please check the Hackathon ID.',
      });
    }

    // Fetch all problem statements linked to this hackathon
    const problems = await ProblemStatement.find({ hackathonId }).lean();

    // Attach metadata to each problem
    const problemIds = problems.map(p => p._id);
    const metadataList = await ProblemMetadata.find({ problemId: { $in: problemIds } }).lean();
    const metadataMap = new Map(metadataList.map(m => [m.problemId.toString(), m]));

    const problemsWithMetadata = problems.map(p => ({
      ...p,
      metadata: metadataMap.get(p._id.toString()) || null,
    }));

    // Fetch the first team associated with this hackathon
    // In a real auth-enabled system this would filter by current user
    const team = await Team.findOne({ hackathonId }).lean();

    res.json({
      success: true,
      data: {
        hackathon,
        problemStatements: problemsWithMetadata,
        teamId: team?._id || null,
        teamName: team?.name || null,
      },
    });
  } catch (error) {
    console.error('Error fetching hackathon data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hackathon data',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/hackathon/:hackathonId/team-skills
 * Update team skill profile with manually edited skills from UI
 */
export const updateTeamSkills = async (req, res) => {
  try {
    const { teamId, skills, domains, tools } = req.body;

    if (!teamId) {
      return res.status(400).json({ success: false, message: 'teamId is required' });
    }

    const { default: TeamSkillProfile } = await import('../models/TeamSkillProfile.js');

    const profile = await TeamSkillProfile.findOneAndUpdate(
      { teamId },
      {
        teamId,
        extractedSkills: skills || [],
        domains: domains || [],
        tools: tools || [],
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error updating team skills:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
