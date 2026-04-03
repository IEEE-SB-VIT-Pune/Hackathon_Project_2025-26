import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import Navbar from '../../components/common/Navbar'; 
import Footer from '../../components/common/Footer';
import { getHackathonById, getHackathonLeaderboard, updateHackathon } from '../../services/api';
import '../../styles/admin.css';

function HackathonDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); 

  const [hackathon, setHackathon] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [criteria, setCriteria] = useState([]);
  const [browniePoints, setBrowniePoints] = useState([]);
  const [isEditingCriteria, setIsEditingCriteria] = useState(false);

  // ─── ROLE-BASED NAVIGATION LOGIC ───
  // If systemRole is 'admin', they get the full Admin Navbar.
  // If systemRole is 'user', they get the restricted Organizer Navbar.
  const navMode = user?.systemRole === "admin" ? "admin" : "organizer";

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        setLoading(true);
        const [res, lbRes] = await Promise.all([
          getHackathonById(id),
          getHackathonLeaderboard(id).catch(() => ({ data: { data: [] } }))
        ]);
        const data = res.data.data;
        setHackathon(data);
        setLeaderboard(lbRes.data?.data || []);
        
        // Setup initial criteria state
        if (data.judgingCriteria) setCriteria(data.judgingCriteria);
        if (data.browniePoints) setBrowniePoints(data.browniePoints);

      } catch (err) {
        setError('Failed to load hackathon dashboard. Access Denied or Not Found.');
      } finally {
        setLoading(false);
      }
    };
    fetchHackathon();
  }, [id]);

  const handleSaveCriteria = async () => {
    try {
      setSaving(true);
      const res = await updateHackathon(id, { judgingCriteria: criteria, browniePoints });
      if (res.data?.success) {
        setIsEditingCriteria(false);
        setHackathon(res.data.data);
      }
    } catch (err) {
      alert('Failed to update criteria');
    } finally {
      setSaving(false);
    }
  };

  const addCriterion = () => setCriteria([...criteria, { name: '', description: '', weight: 1 }]);
  const removeCriterion = (index) => setCriteria(criteria.filter((_, i) => i !== index));
  const updateCriterion = (index, field, value) => {
    const newCriteria = [...criteria];
    newCriteria[index][field] = value;
    setCriteria(newCriteria);
  };

  const addBrowniePoint = () => setBrowniePoints([...browniePoints, { name: '', description: '', weight: 1 }]);
  const removeBrowniePoint = (index) => setBrowniePoints(browniePoints.filter((_, i) => i !== index));
  const updateBrowniePoint = (index, field, value) => {
    const newBrownie = [...browniePoints];
    newBrownie[index][field] = value;
    setBrowniePoints(newBrownie);
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <Navbar navigationMode={navMode} />
        <main className="admin-main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <div className="loader">Loading secure dashboard...</div>
        </main>
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className="admin-layout">
        <Navbar navigationMode={navMode} />
        <main className="admin-main">
          <div className="admin-container error-text" style={{ color: '#dc2626', textAlign: 'center', marginTop: '50px' }}>
            <h2>{error}</h2>
            <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* The Navbar now automatically adapts. 
          Organizer sees: "Organizer Portal" | Logout
          Admin sees: "Admin Dashboard" | Dashboard | Create Hackathon | Logout
      */}
      <Navbar navigationMode={navMode} title="Manage Event" />

      <main className="admin-main">
        {/* ─── ACTION HEADER ─── */}
        <div className="admin-container" style={{ marginTop: '20px' }}>
          {/* Back Button */}
          <button
            onClick={() => navigate('/admin/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              color: '#043873',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '16px',
              padding: '8px 0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#4f9cf9'}
            onMouseLeave={(e) => e.target.style.color = '#043873'}
          >
            ← Back to Dashboard
          </button>

          <div className="admin-controls-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div className="admin-controls-left">
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>{hackathon.title}</h3>
              <span className={`status-badge status-${hackathon.status}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold' }}>
                {hackathon.status}
              </span>
            </div>

            <div className="admin-controls-actions">
              <button
                className="btn-primary"
                style={{ backgroundColor: '#111827', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => navigate(`/admin/hackathons/${id}/edit`)}
              >
                Edit Event Details
              </button>
            </div>
          </div>
        </div>

        {/* ─── VISUAL HERO ─── */}
        <div className="hackathon-hero" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '50px 0', color: 'white', textAlign: 'center', marginTop: '20px' }}>
          <div className="hero-content">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{hackathon.title}</h1>
            <p style={{ opacity: 0.8 }}>
              {new Date(hackathon.startDate).toLocaleDateString()} – {new Date(hackathon.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* ─── STATS OVERVIEW ─── */}
        <div className="admin-container" style={{ marginTop: '30px' }}>
          <section className="overview-section">
            <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#475569' }}>Management Overview</h2>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="stats-card" style={{ background: '#fff', padding: '25px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '2rem', fontWeight: '900' }}>{hackathon.maxTeamSize}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Max Team Size</div>
              </div>

              <div className="stats-card" style={{ background: '#fff', padding: '25px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '2rem', fontWeight: '900', textTransform: 'capitalize' }}>{hackathon.status}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Current Status</div>
              </div>

              <div className="stats-card" style={{ background: '#fff', padding: '25px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '2rem', fontWeight: '900' }}>
                  {new Date(hackathon.registrationDeadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Reg. Deadline</div>
              </div>
            </div>
          </section>
        </div>

        {/* ─── CONTENT DETAILS ─── */}
        <div className="admin-container view-container" style={{ marginTop: '40px', display: 'grid', gap: '30px', paddingBottom: '60px' }}>
          <section className="view-section">
            <h2 style={{ fontSize: '1.1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>Description</h2>
            <p style={{ color: '#334155', lineHeight: '1.6' }}>{hackathon.description}</p>
          </section>

          {/* PROBLEM STATEMENTS */}
          {hackathon.problemStatements && hackathon.problemStatements.length > 0 && (
            <section className="view-section">
              <h2 style={{ fontSize: '1.1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>Problem Statements</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {hackathon.problemStatements.map((ps, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      padding: '20px', 
                      backgroundColor: '#f8fafc', 
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <h3 style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '1.05rem', 
                      fontWeight: '600', 
                      color: '#0f172a' 
                    }}>
                      {index + 1}. {ps.title}
                    </h3>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.95rem', 
                      lineHeight: '1.6', 
                      color: '#475569',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {ps.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ROUNDS */}
          {hackathon.rounds && hackathon.rounds.length > 0 && (
            <section className="view-section">
              <h2 style={{ fontSize: '1.1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>Rounds</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {hackathon.rounds.map((round, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      padding: '20px', 
                      backgroundColor: '#fef3c7', 
                      borderRadius: '12px',
                      border: '1px solid #fbbf24'
                    }}
                  >
                    <h3 style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '1.05rem', 
                      fontWeight: '600', 
                      color: '#92400e' 
                    }}>
                      Round {index + 1}: {round.name}
                    </h3>
                    <p style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '0.95rem', 
                      lineHeight: '1.6', 
                      color: '#78350f',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {round.description}
                    </p>
                    
                    {(round.startDate || round.endDate) && (
                      <div style={{ 
                        display: 'flex', 
                        gap: '20px', 
                        marginBottom: '12px',
                        fontSize: '0.85rem',
                        color: '#92400e'
                      }}>
                        {round.startDate && (
                          <div>
                            <strong>Start:</strong> {new Date(round.startDate).toLocaleString()}
                          </div>
                        )}
                        {round.endDate && (
                          <div>
                            <strong>End:</strong> {new Date(round.endDate).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {round.submissionRequirements && (
                      <div style={{ 
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: '#fffbeb',
                        borderRadius: '8px',
                        border: '1px solid #fcd34d'
                      }}>
                        <strong style={{ color: '#92400e', fontSize: '0.9rem' }}>Submission Requirements:</strong>
                        <p style={{ 
                          margin: '8px 0 0 0', 
                          fontSize: '0.9rem', 
                          color: '#78350f',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {round.submissionRequirements}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="view-section">
            <h2 style={{ fontSize: '1.1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>Rules</h2>
            <p style={{ color: '#334155', lineHeight: '1.6' }}>{hackathon.rules}</p>
          </section>

          <section className="view-section">
            <h2 style={{ fontSize: '1.1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>Prize Pool</h2>
            {hackathon.prizes && hackathon.prizes.length > 0 ? (
              <div>
                {hackathon.prizes.map((prize, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '10px 15px', 
                    background: '#f8fafc', 
                    borderRadius: '8px', 
                    marginBottom: '10px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <span style={{ fontWeight: '600', color: '#334155' }}>{prize.position}</span>
                    <span style={{ fontWeight: '700', color: '#059669', fontSize: '1.1rem' }}>
                      ₹{prize.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
                <div style={{ 
                  marginTop: '15px', 
                  paddingTop: '15px', 
                  borderTop: '2px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Total Prize Pool:</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#059669' }}>
                    ₹{hackathon.prizes.reduce((sum, prize) => sum + prize.amount, 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ) : (
              <p style={{ fontWeight: '600', fontSize: '1.2rem', color: '#059669' }}>{hackathon.prizePool}</p>
            )}
          </section>

          {/* ─── JUDGING SETUP ─── */}
          <section className="view-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
              <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Judging Criteria & Extra Points</h2>
              {!isEditingCriteria ? (
                <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.9rem' }} onClick={() => setIsEditingCriteria(true)}>Edit Setup</button>
              ) : (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.9rem' }} onClick={() => setIsEditingCriteria(false)}>Cancel</button>
                  <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.9rem' }} onClick={handleSaveCriteria} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '40px' }}>
              {/* Main Criteria */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1rem', color: '#1e293b' }}>Main Custom Criteria (R1-R5)</h3>
                  {isEditingCriteria && <button type="button" onClick={addCriterion} style={{ background: '#e2e8f0', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>+ Add</button>}
                </div>
                {criteria.map((c, i) => (
                  <div key={i} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '10px', display: 'flex', gap: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input type="text" value={c.name} onChange={(e) => updateCriterion(i, 'name', e.target.value)} disabled={!isEditingCriteria} placeholder="Criterion Name (e.g., Innovation)" style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                      <input type="number" min="1" value={c.weight} onChange={(e) => updateCriterion(i, 'weight', Number(e.target.value))} disabled={!isEditingCriteria} placeholder="Weight" style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                    </div>
                    {isEditingCriteria && (
                      <button type="button" onClick={() => removeCriterion(i)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                    )}
                  </div>
                ))}
                {criteria.length === 0 && <p style={{ fontSize: '0.9rem', color: '#64748b' }}>No main criteria set.</p>}
              </div>

              {/* Brownie Points */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1rem', color: '#1e293b' }}>Brownie Points / Checklists (C1-C8)</h3>
                  {isEditingCriteria && <button type="button" onClick={addBrowniePoint} style={{ background: '#e2e8f0', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>+ Add</button>}
                </div>
                {browniePoints.map((bp, i) => (
                  <div key={i} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '10px', display: 'flex', gap: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input type="text" value={bp.name} onChange={(e) => updateBrowniePoint(i, 'name', e.target.value)} disabled={!isEditingCriteria} placeholder="Point Name (e.g., Deployed App)" style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                      <input type="number" min="1" value={bp.weight} onChange={(e) => updateBrowniePoint(i, 'weight', Number(e.target.value))} disabled={!isEditingCriteria} placeholder="Score Weight" style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                    </div>
                    {isEditingCriteria && (
                      <button type="button" onClick={() => removeBrowniePoint(i)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                    )}
                  </div>
                ))}
                {browniePoints.length === 0 && <p style={{ fontSize: '0.9rem', color: '#64748b' }}>No brownie points set.</p>}
              </div>
            </div>
          </section>

          {/* ─── LIVE LEADERBOARD ─── */}
          <section className="view-section">
            <h2 style={{ fontSize: '1.2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>Live Ranking & Leaderboard</h2>
            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>Rank</th>
                    <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>Team Name</th>
                    <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>Judges Evaluated</th>
                    <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>Final Aggregate Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No team evaluations found for this hackathon yet.</td>
                    </tr>
                  ) : (
                    leaderboard.map((team, index) => (
                      <tr key={team.teamId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px', fontWeight: 'bold', color: index < 3 ? '#d97706' : '#64748b' }}>#{index + 1}</td>
                        <td style={{ padding: '16px', fontWeight: '600', color: '#0f172a' }}>{team.teamName}</td>
                        <td style={{ padding: '16px', color: '#475569' }}>{team.judgesCount}</td>
                        <td style={{ padding: '16px', fontWeight: '800', color: '#059669' }}>{team.finalScore} / 100</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default HackathonDashboard;