const axios = require('axios');

async function analyzeProfile(username) {
  try {
    const headers = { 
      Authorization: `token ${process.env.GITHUB_TOKEN.trim()}`,
      'Accept': 'application/vnd.github.v3+json'
    };
    
    // CHANGE: Added 'type=owner' to ignore organization repos if unwanted
    // CHANGE: Changed sort to 'created' to keep the list stable (prevents jumping)
    const [userRes, repoRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`, { headers }),
      axios.get(`https://api.github.com/users/${username}/repos?per_page=100&type=owner&sort=created`, { headers })
    ]);

    const repos = repoRes.data.filter(r => !r.fork);
    let totalScore = 0;
    let hackathonList = [];

    repos.forEach(repo => {
      let repoScore = 50; // Base points for original work

      repoScore += (repo.stargazers_count * 20); 
      repoScore += (repo.forks_count * 10);
      
      // HACKATHON DETECTION
      const created = new Date(repo.created_at);
      const updated = new Date(repo.pushed_at);
      const durationHours = (updated - created) / 36e5;

      // Improved Sprint Detection: Hackathons are usually 12-96 hours of intense work
      const isSprint = durationHours > 12 && durationHours < 96;

      // Expanded Keywords: Added 'participation', 'contest', and 'project'
      const keys = ['hackathon', 'submission', 'sih', 'devpost', 'winner', 'hack', 'contest', 'participation'];
      
      const nameMatch = keys.some(k => repo.name.toLowerCase().includes(k));
      const descMatch = repo.description && keys.some(k => repo.description.toLowerCase().includes(k));

      if (nameMatch || descMatch || isSprint) {
        repoScore += 100;
        // Avoid duplicates in the list
        if (!hackathonList.includes(repo.name)) {
          hackathonList.push(repo.name);
        }
      }

      totalScore += repoScore;
    });

    // Weighted Social Score
    const finalScore = Math.round(
        totalScore + 
        (userRes.data.followers * 15) + // Increased weight for followers
        (userRes.data.public_repos * 5)
    );

    console.log(`📊 ${username} | Repos: ${repos.length} | Hackathons: ${hackathonList.length} | Score: ${finalScore}`);
    console.log(`📂 Detected List: ${hackathonList.join(', ')}`); // See exactly which ones matched

    return {
      username: userRes.data.login,
      avatar: userRes.data.avatar_url,
      score: finalScore,
      hackathonCount: hackathonList.length,
      hackathonList: hackathonList
    };
  } catch (error) {
    console.error("API Error:", error.message);
    throw error; 
  }
}

module.exports = { analyzeProfile };