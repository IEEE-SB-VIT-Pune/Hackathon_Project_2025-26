import fs from "fs";
import readline from "readline";

const users = JSON.parse(fs.readFileSync("users.json"));
const teams = JSON.parse(fs.readFileSync("teams.json"));
const userEmbeddings = JSON.parse(fs.readFileSync("user_embeddings.json"));
const teamEmbeddings = JSON.parse(fs.readFileSync("team_embeddings.json"));

function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function isEligible(user, team) {
  if (team.branch !== "Any" && user.branch !== team.branch) return false;
  if (user.year < team.min_year) return false;
  if (team.open_slots <= 0) return false;
  return true;
}

function findUsersForTeam(teamId) {
  const teamIndex = teams.findIndex(
    t => String(t.team_id) === String(teamId)
  );

  if (teamIndex === -1) {
    console.log("❌ Invalid TEAM ID");
    return;
  }

  const results = [];

  for (let i = 0; i < users.length; i++) {
    if (!isEligible(users[i], teams[teamIndex])) continue;

    const score = cosineSimilarity(
      userEmbeddings[i],
      teamEmbeddings[teamIndex]
    );

    results.push({
      USER_ID: users[i].user_id,
      DOMAIN: users[i].domain,
      SCORE: score.toFixed(4)
    });
  }

  results.sort((a, b) => b.SCORE - a.SCORE);
  console.table(results.slice(0, 5));
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Enter TEAM ID (eg TM1): ", id => {
  findUsersForTeam(id);
  rl.close();
});
