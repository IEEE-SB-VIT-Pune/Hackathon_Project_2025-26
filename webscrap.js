// // github_skill_extractor.js

// import fetch from "node-fetch";
// import fs from "fs";
// import { createObjectCsvWriter } from "csv-writer";
// import readline from "readline";

// // ---------------- CONFIG ----------------
// const GITHUB_API = "https://api.github.com";
// const HEADERS = {
//   "Accept": "application/vnd.github+json"
// };

// // Language → inferred skills
// const LANGUAGE_SKILL_MAP = {
//   Python: ["Python", "Backend", "ML"],
//   JavaScript: ["JavaScript", "Frontend"],
//   TypeScript: ["Frontend"],
//   Java: ["Java", "Backend"],
//   "C++": ["C++"],
//   HTML: ["Frontend"],
//   CSS: ["Frontend"]
// };

// // ---------------- GITHUB API ----------------
// async function fetchRepos(username) {
//   const res = await fetch(`${GITHUB_API}/users/${username}/repos`, {
//     headers: HEADERS
//   });

//   if (!res.ok) return null;
//   return await res.json();
// }

// // ---------------- CORE LOGIC ----------------
// async function computeUserSkillsFromGithub(githubId) {
//   const repos = await fetchRepos(githubId);

//   if (!repos || repos.length === 0) {
//     console.log("GitHub data unavailable or private.");
//     return [];
//   }

//   const skillStats = {};

//   for (const repo of repos) {
//     const lang = repo.language;
//     if (!LANGUAGE_SKILL_MAP[lang]) continue;

//     const updatedAt = new Date(repo.updated_at);
//     const monthsSince =
//       (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24 * 30);

//     for (const skill of LANGUAGE_SKILL_MAP[lang]) {
//       if (!skillStats[skill]) {
//         skillStats[skill] = {
//           repo_count: 0,
//           total_size: 0,
//           last_used_months: 999
//         };
//       }

//       skillStats[skill].repo_count += 1;
//       skillStats[skill].total_size += repo.size;
//       skillStats[skill].last_used_months = Math.min(
//         skillStats[skill].last_used_months,
//         monthsSince
//       );
//     }
//   }

//   const rows = [];

//   for (const skill in skillStats) {
//     const s = skillStats[skill];

//     const repoScore = Math.min(s.repo_count / 5, 1.0);
//     const sizeScore = Math.min(s.total_size / 5000, 1.0);
//     const recencyScore = Math.exp(-0.1 * s.last_used_months);

//     const depth = Number(
//       (
//         0.4 * repoScore +
//         0.3 * sizeScore +
//         0.3 * recencyScore
//       ).toFixed(2)
//     );

//     rows.push({
//       github_id: githubId,
//       skill,
//       depth
//     });
//   }

//   return rows;
// }

// // ---------------- CSV HANDLING ----------------
// async function saveToCSV(data) {
//   const fileExists = fs.existsSync("user_skills_flat.csv");

//   const csvWriter = createObjectCsvWriter({
//     path: "user_skills_flat.csv",
//     header: [
//       { id: "github_id", title: "github_id" },
//       { id: "skill", title: "skill" },
//       { id: "depth", title: "depth" }
//     ],
//     append: fileExists
//   });

//   await csvWriter.writeRecords(data);
//   console.log("User skills saved to user_skills_flat.csv");
// }

// // ---------------- CLI ----------------
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// rl.question("Enter GitHub ID: ", async (githubId) => {
//   const result = await computeUserSkillsFromGithub(githubId.trim());

//   if (result.length > 0) {
//     await saveToCSV(result);
//   }

//   rl.close();
// });


// tp.js
import fetch from "node-fetch";
import fs from "fs";
import readline from "readline";

// ---------------- CONSTANTS ----------------
const GITHUB_API = "https://api.github.com";
const HEADERS = {
  "Accept": "application/vnd.github+json"
};

const OUTPUT_FILE = "user_skills_flat.json";

// Language → inferred skills
const LANGUAGE_SKILL_MAP = {
  Python: ["Python", "Backend", "ML"],
  JavaScript: ["JavaScript", "Frontend"],
  TypeScript: ["Frontend"],
  Java: ["Java", "Backend"],
  "C++": ["C++"],
  HTML: ["Frontend"],
  CSS: ["Frontend"]
};

// ---------------- FETCH REPOS ----------------
async function fetchRepos(username) {
  const res = await fetch(`${GITHUB_API}/users/${username}/repos`, {
    headers: HEADERS
  });

  if (!res.ok) return null;
  return await res.json();
}

// ---------------- CORE LOGIC ----------------
async function computeUserSkillsFromGithub(githubId) {
  const repos = await fetchRepos(githubId);

  if (!repos || repos.length === 0) {
    console.log("GitHub data unavailable or private.");
    return [];
  }

  const skillStats = {};

  for (const repo of repos) {
    const lang = repo.language;
    if (!LANGUAGE_SKILL_MAP[lang]) continue;

    const updatedAt = new Date(repo.updated_at);
    const monthsSince =
      (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24 * 30);

    for (const skill of LANGUAGE_SKILL_MAP[lang]) {
      if (!skillStats[skill]) {
        skillStats[skill] = {
          repo_count: 0,
          total_size: 0,
          last_used_months: 999
        };
      }

      skillStats[skill].repo_count += 1;
      skillStats[skill].total_size += repo.size;
      skillStats[skill].last_used_months = Math.min(
        skillStats[skill].last_used_months,
        monthsSince
      );
    }
  }

  const rows = [];

  for (const [skill, s] of Object.entries(skillStats)) {
    const repoScore = Math.min(s.repo_count / 5, 1.0);
    const sizeScore = Math.min(s.total_size / 5000, 1.0);
    const recencyScore = Math.exp(-0.1 * s.last_used_months);

    const depth = Number(
      (
        0.4 * repoScore +
        0.3 * sizeScore +
        0.3 * recencyScore
      ).toFixed(2)
    );

    rows.push({
      github_id: githubId,
      skill,
      depth
    });
  }

  return rows;
}

// ---------------- JSON STORAGE ----------------
function saveToJSON(newData) {
  let existingData = [];

  if (fs.existsSync(OUTPUT_FILE)) {
    const raw = fs.readFileSync(OUTPUT_FILE, "utf-8");
    existingData = JSON.parse(raw);
  }

  const updatedData = existingData.concat(newData);

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(updatedData, null, 2)
  );

  console.log("User skills saved to user_skills_flat.json");
}

// ---------------- CLI ----------------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Enter GitHub ID: ", async (githubId) => {
  const result = await computeUserSkillsFromGithub(githubId.trim());

  if (result.length > 0) {
    saveToJSON(result);
  }

  rl.close();
});
