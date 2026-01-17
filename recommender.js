import fs from "fs";

/* =======================
   LOAD DATA
======================= */

const users = JSON.parse(fs.readFileSync("users.json"));
const teams = JSON.parse(fs.readFileSync("teams.json"));

const userEmbeddings = JSON.parse(fs.readFileSync("user_embeddings.json"));
const teamEmbeddings = JSON.parse(fs.readFileSync("team_embeddings.json"));

/* =======================
   MATH UTILS
======================= */

function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/* =======================
   BUSINESS RULES
======================= */

function isEligible(user, team) {
  if (user.branch !== team.branch) return false;
  if (user.year < team.min_year) return false;
  if (team.open_slots <= 0) return false;
  return true;
}

/* =======================
   USER → TEAM RECOMMENDATION
======================= */

function recommendTeamsForUser(userId, topK = 5) {
  const userIndex = users.findIndex(u => u.user_id === userId);
  if (userIndex === -1) return [];

  const results = [];

  for (let i = 0; i < teams.length; i++) {
    if (!isEligible(users[userIndex], teams[i])) continue;

    const score = cosineSimilarity(
      userEmbeddings[userIndex],
      teamEmbeddings[i]
    );

    results.push({
      team_id: teams[i].team_id,
      required_skills: teams[i].required_skills,
      domain: teams[i].domain,
      similarity_score: Number(score.toFixed(4))
    });
  }

  return results
    .sort((a, b) => b.similarity_score - a.similarity_score)
    .slice(0, topK);
}

/* =======================
   TEAM → USER RECOMMENDATION
======================= */

function recommendUsersForTeam(teamId, topK = 5) {
  const teamIndex = teams.findIndex(t => t.team_id === teamId);
  if (teamIndex === -1) return [];

  const results = [];

  for (let i = 0; i < users.length; i++) {
    if (!isEligible(users[i], teams[teamIndex])) continue;

    const score = cosineSimilarity(
      userEmbeddings[i],
      teamEmbeddings[teamIndex]
    );

    results.push({
      user_id: users[i].user_id,
      skills: users[i].skills,
      domain: users[i].domain,
      similarity_score: Number(score.toFixed(4))
    });
  }

  return results
    .sort((a, b) => b.similarity_score - a.similarity_score)
    .slice(0, topK);
}

/* =======================
   EXPLAINABILITY
======================= */

function explainMatch(userId, teamId) {
  const user = users.find(u => u.user_id === userId);
  const team = teams.find(t => t.team_id === teamId);

  if (!user || !team) return null;

  return {
    user_skills: user.skills,
    team_required_skills: team.required_skills,
    user_domain: user.domain,
    team_domain: team.domain
  };
}

/* =======================
   DEMO
======================= */

console.log("USER → TEAM");
console.log(recommendTeamsForUser(101));

console.log("\nTEAM → USER");
console.log(recommendUsersForTeam(201));

console.log("\nEXPLANATION");
console.log(explainMatch(101, 201));
