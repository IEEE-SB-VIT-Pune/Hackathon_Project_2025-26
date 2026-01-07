# 🚀 GitHub Profile Ranker

A smart tool to audit GitHub profiles, calculate developer rankings, and detect high-intensity coding sprints (Hackathons).

---

## 📋 Prerequisites
To run this project, you need:
- **Node.js** (v18 or higher)
- **A GitHub Token** (To avoid API limits)
- **NPM** (Installed with Node)

---

## ⚙️ Quick Start

1. **Setup Backend:**
   - Go to `backend/` folder.
   - Run `npm install`.
   - Create a `.env` file and add: 
     `GITHUB_TOKEN=your_token_here`
   - Start with: `node server.js`

2. **Setup Frontend:**
   - Go to `frontend/` folder.
   - Run `npm install`.
   - Start with: `npm start`

---

## 🧠 Scoring Logic (How it Works)
The rank is calculated using a weighted system to measure real effort and community impact:

| Activity | Points Awarded |
| :--- | :--- |
| **Original Project** | +50 per Repository |
| **GitHub Stars** | +20 per Star |
| **Project Forks** | +10 per Fork |
| **Hackathon/Sprint** | +100 Bonus per detected project |
| **Followers** | +15 per Follower |

**Hackathon Detection:** The engine automatically flags projects as "Hackathons" if they contain specific keywords (like 'sih', 'hack', 'winner') or if the code was completed within a high-intensity **12-96 hour window**.

---

## 💾 Feature: Local Storage
This website uses **Local Storage** to save scanned profiles.
- **Why?** It allows users to revisit the site and see their scores instantly without waiting for the GitHub API to reload.
- **Where?** Data is stored in the browser under the key `ranker_data`.

---

## 🌐 Implementation Guide
If you want to add this ranking feature to your own website:

1. **Backend:** Move `scoringEngine.js` to your services folder.
2. **Schema Update:** Add a `score` column to your User database:
   ```javascript
   // Add this to your User Schema
   score: { type: Number, default: 0 }