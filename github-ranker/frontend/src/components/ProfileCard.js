import React from 'react';

const ProfileCard = ({ profile }) => {
  // If no data has been fetched yet, show nothing
  if (!profile) return null;

  return (
    <div style={{ 
      border: '2px solid #28a745', 
      borderRadius: '12px', 
      padding: '20px', 
      margin: '20px auto', 
      backgroundColor: '#fff',
      maxWidth: '600px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      textAlign: 'left'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <img 
          src={profile.avatar} 
          alt="avatar" 
          style={{ width: '80px', borderRadius: '50%', border: '2px solid #eee' }} 
        />
        <div>
          <h2 style={{ margin: 0 }}>
            {profile.username} {profile.verified && '✅'}
          </h2>
          <p style={{ color: '#666', margin: '5px 0' }}>{profile.bio || "No bio available"}</p>
        </div>
      </div>
      
      <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '15px 0' }} />
      
      <div>
        <p><strong>🏆 Rank Score:</strong> <span style={{ color: '#28a745', fontWeight: 'bold' }}>{profile.score}</span></p>
        <p><strong>🚀 Hackathons Found:</strong> {profile.hackathonCount || 0}</p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
          {/* Mapping through keywords found by the backend */}
          {profile.hackathonList?.length > 0 ? (
            profile.hackathonList.map(repo => (
              <span key={repo} style={{ 
                background: '#e9ecef', 
                padding: '4px 10px', 
                borderRadius: '15px',
                fontSize: '0.8rem',
                color: '#495057'
              }}>
                📦 {repo}
              </span>
            ))
          ) : (
            <p style={{ color: '#999', fontSize: '0.9rem' }}>No specific hackathon projects detected.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;