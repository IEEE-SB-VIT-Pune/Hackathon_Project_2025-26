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

function findTeamsForUser(userId) {
  const userIndex = users.findIndex(
    u => String(u.user_id) === String(userId)
  );

  if (userIndex === -1) {
    console.log("❌ Invalid USER ID");
    return;
  }

  const results = [];

  for (let i = 0; i < teams.length; i++) {
    if (!isEligible(users[userIndex], teams[i])) continue;

    const score = cosineSimilarity(
      userEmbeddings[userIndex],
      teamEmbeddings[i]
    );

    results.push({
      TEAM_ID: teams[i].team_id,
      DOMAIN: teams[i].domain,
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

rl.question("Enter USER ID: ", id => {
  findTeamsForUser(id);
  rl.close();
});
