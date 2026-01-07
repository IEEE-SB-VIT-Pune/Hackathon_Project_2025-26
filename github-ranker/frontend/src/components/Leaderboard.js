import React from 'react';

const Leaderboard = ({ profiles }) => {
  // If the list is empty or not an array, show a message
  if (!Array.isArray(profiles) || profiles.length === 0) {
    return <p style={{ textAlign: 'center', color: '#666' }}>No profiles analyzed yet.</p>;
  }

  // Sort by score descending
  const sorted = [...profiles].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <h3 style={{ textAlign: 'center' }}>🏆 Global Rankings</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
        <thead style={{ backgroundColor: '#f8f9fa' }}>
          <tr>
            <th style={tableHeaderStyle}>Rank</th>
            <th style={tableHeaderStyle}>Developer</th>
            <th style={tableHeaderStyle}>Score</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, index) => (
            <tr key={p.username} style={{ borderBottom: '1px solid #eee' }}>
              <td style={tableCellStyle}>#{index + 1}</td>
              <td style={tableCellStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <img src={p.avatar} alt="mini-avatar" style={{ width: '30px', borderRadius: '50%' }} />
                   {p.username}
                </div>
              </td>
              <td style={tableCellStyle}><strong>{p.score || 0}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Simple inline styles for the table
const tableHeaderStyle = { padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' };
const tableCellStyle = { padding: '12px' };

export default Leaderboard;