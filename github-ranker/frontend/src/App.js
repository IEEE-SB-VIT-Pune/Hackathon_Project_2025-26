import React, { useState, useEffect } from 'react';
import Scanner from './components/Scanner';
import Leaderboard from './components/Leaderboard';
import ProfileCard from './components/ProfileCard';
import './App.css';

function App() {
  // 1. ALWAYS initialize as an empty array [] to prevent .map() errors
  const [profiles, setProfiles] = useState([]);
  const [latestProfile, setLatestProfile] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ranker_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure the parsed data is actually an array
        setProfiles(Array.isArray(parsed) ? parsed : []);
      }
    } catch (e) {
      console.error("Failed to load local storage", e);
      setProfiles([]);
    }
  }, []);

  const addProfile = (newProfile) => {
    // Ensure the profile has a hackathonList property
    const safeProfile = { ...newProfile, hackathonList: newProfile.hackathonList || [] };
    const filtered = profiles.filter(p => p.username !== safeProfile.username);
    const updated = [safeProfile, ...filtered];
    setProfiles(updated);
    setLatestProfile(safeProfile);
    localStorage.setItem('ranker_data', JSON.stringify(updated));
  };

  return (
    <div className="App">
      <h1>GitHub Hackathon Ranker</h1>
      <Scanner onProfileAdded={addProfile} />
      
      {latestProfile && <ProfileCard profile={latestProfile} />}
      
      {/* 2. ONLY render Leaderboard if profiles is an array with items */}
      {profiles && profiles.length > 0 ? (
        <Leaderboard profiles={profiles} />
      ) : (
        <div style={{ marginTop: '40px', color: '#666' }}>
          <p>No profiles analyzed yet. Enter a GitHub URL to get started!</p>
        </div>
      )}
    </div>
  );
}

export default App;