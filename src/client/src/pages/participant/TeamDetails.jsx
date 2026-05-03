import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { API, getAuthHeaders, requestJoinTeam, withdrawJoinRequest, getMe } from '../../services/api';
import Navbar from '../../components/common/Navbar';
import '../../styles/TeamDetails.css';

const TeamDetails = () => {
    const { id, teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [joinMessage, setJoinMessage] = useState("");
    const [showJoinForm, setShowJoinForm] = useState(false);

    useEffect(() => {
        fetchData();
    }, [teamId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [teamRes, userRes] = await Promise.all([
                API.get(`/teams/${teamId}`, getAuthHeaders()),
                getMe()
            ]);
            if (teamRes.data.success) setTeam(teamRes.data.data);
            if (userRes.data.success) setUser(userRes.data.data);
        } catch (error) {
            console.error("Failed to load team details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        try {
            setRequesting(true);
            await requestJoinTeam(teamId, joinMessage);
            alert("Join request sent!");
            fetchData();
            setShowJoinForm(false);
        } catch (error) {
            alert(error.response?.data?.message || "Failed to send request");
        } finally {
            setRequesting(false);
        }
    };

    const handleWithdraw = async () => {
        if (!window.confirm("Withdraw your request?")) return;
        try {
            setRequesting(true);
            await withdrawJoinRequest(teamId);
            alert("Request withdrawn.");
            fetchData();
        } catch (error) {
            alert("Failed to withdraw request.");
        } finally {
            setRequesting(false);
        }
    };

    const teamSkills = team?.teamSkills || [];

    if (loading) return (
        <div className="team-details-wrapper">
            <Navbar />
            <div className="team-details-loading">Loading Team Details...</div>
        </div>
    );
    if (!team) return (
        <div className="team-details-wrapper">
            <Navbar />
            <div className="team-details-error">Team not found.</div>
        </div>
    );

    const isMember = team.members.some(m => String(m.userId?._id || m.userId) === String(user?._id) && m.status === 'accepted');
    const isPending = team.members.some(m => String(m.userId?._id || m.userId) === String(user?._id) && m.status === 'pending');
    const isFull = team.members.filter(m => m.status === 'accepted').length >= (team.maxSize || 4);

    return (
        <div className="team-details-wrapper">
            <Navbar />
            <div className="team-details-container">
            <div className="team-details-header">
                <button onClick={() => navigate(-1)} className="team-details-back-btn">← Back</button>
                <div className="team-details-title-section">
                    <h1 className="team-details-team-name">{team.name}</h1>
                    <div className="team-details-badge-row">
                        {team.isOpenToJoin ? <span className="team-details-open-badge">Open to Join</span> : <span className="team-details-closed-badge">Closed</span>}
                        <span className="team-details-member-count">{team.members.filter(m => m.status === 'accepted').length} / {team.maxSize || 4} Members</span>
                    </div>
                </div>
            </div>

            <div className="team-details-content-grid">
                <div className="team-details-main-col">
                    <div className="team-details-card">
                        <h2 className="team-details-card-title">Project Idea</h2>
                        <p className="team-details-description">{team.projectDescription || "No description provided yet."}</p>
                    </div>

                    <div className="team-details-card">
                        <h2 className="team-details-card-title">Team Skills</h2>
                        <div className="team-details-skills-wrapper">
                            {teamSkills.length > 0 ? (
                                teamSkills.map(skill => (
                                    <span key={skill} className="team-details-skill-tag">{skill}</span>
                                ))
                            ) : (
                                <p className="team-details-no-skills">No skills specific to this team yet.</p>
                            )}
                        </div>
                    </div>

                    <div className="team-details-card">
                        <h2 className="team-details-card-title">Team Members</h2>
                        <div className="team-details-member-list">
                            {team.members.filter(m => m.status === 'accepted').map(member => (
                                <div key={member.userId?._id} className="team-details-member-row">
                                    <div className="team-details-member-avatar">
                                        {member.userId?.fullName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="team-details-member-info">
                                        <div className="team-details-member-name">{member.userId?.fullName}</div>
                                        <div className="team-details-member-role">{member.role || "Member"}</div>
                                        <div className="team-details-member-skills">
                                            {member.userId?.skills?.slice(0, 3).map(s => (
                                                <span key={s} className="team-details-mini-skill">{s}</span>
                                            ))}
                                            {member.userId?.skills?.length > 3 && <span className="team-details-mini-skill">+{member.userId.skills.length - 3}</span>}
                                        </div>
                                    </div>
                                    <Link to={`/profile/${member.userId?._id}`} className="team-details-view-profile-btn">View Profile</Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="team-details-side-col">
                    <div className="team-details-card">
                        <h2 className="team-details-card-title">Status</h2>
                        {isMember ? (
                            <div className="team-details-status-box">You are in this team</div>
                        ) : isPending ? (
                            <div className="team-details-pending-box">
                                <p>Your request is pending</p>
                                <button onClick={handleWithdraw} disabled={requesting} className="team-details-withdraw-btn">
                                    {requesting ? "Withdrawing..." : "Withdraw Request"}
                                </button>
                            </div>
                        ) : isFull ? (
                            <div className="team-details-full-box">Team is full</div>
                        ) : !team.isOpenToJoin ? (
                          <div className="team-details-full-box">Not accepting requests</div>
                        ) : showJoinForm ? (
                            <div className="team-details-join-form">
                                <textarea 
                                    className="team-details-textarea"
                                    placeholder="Message to leader (optional)..."
                                    value={joinMessage}
                                    onChange={(e) => setJoinMessage(e.target.value)}
                                />
                                <div className="team-details-btn-row">
                                    <button onClick={() => setShowJoinForm(false)} className="team-details-cancel-btn">Cancel</button>
                                    <button onClick={handleJoin} disabled={requesting} className="team-details-confirm-join-btn">
                                        {requesting ? "Sending..." : "Send Request"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setShowJoinForm(true)} className="team-details-join-btn">Request to Join</button>
                        )}
                    </div>

                    <div className="team-details-card">
                        <h2 className="team-details-card-title">Team Leader</h2>
                        <div className="team-details-leader-row">
                            <div className="team-details-member-avatar large">
                                {team.leader?.fullName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="team-details-member-info">
                                <div className="team-details-member-name">{team.leader?.fullName}</div>
                                <div className="team-details-member-role">Leader</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
};

const styles = {
    // Removed - now using CSS classes from TeamDetails.css
};

export default TeamDetails;
