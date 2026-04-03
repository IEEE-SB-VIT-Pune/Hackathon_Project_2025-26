import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/judge/Navbar";
import Footer from "../../components/judge/Footer";
import judgeApi from "../../services/judgeApi";
import { getHackathonById } from "../../services/api";
import EvaluationModal from "../../components/judge/EvaluationModal";
import "../../styles/judge.css";
import "../../styles/judge-additional.css";

const TeamSubmissions = () => {
  const { id: hackathonId } = useParams();
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [submissionFilter, setSubmissionFilter] = useState("All");
  const [evaluationFilter, setEvaluationFilter] = useState("All");
  const [currentUser, setCurrentUser] = useState(null);
  const [submitting, setSubmitting] = useState({});
  const submittingRef = useRef({});

  const [criteria, setCriteria] = useState([]);
  const [browniePoints, setBrowniePoints] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    fetchTeamsAndEvaluations();
  }, [hackathonId]);

  const fetchTeamsAndEvaluations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const userData = await judgeApi.getMe();
      setCurrentUser(userData.data);

      // Fetch hackathon details for criteria
      const hackathonRes = await getHackathonById(hackathonId);
      if (hackathonRes.data?.data) {
        setCriteria(hackathonRes.data.data.judgingCriteria || []);
        setBrowniePoints(hackathonRes.data.data.browniePoints || []);
      }

      // Get all teams for this hackathon
      const teamsResponse = await judgeApi.getTeamsByHackathon(hackathonId);

      if (!teamsResponse.success) {
        throw new Error("Failed to load teams");
      }

      // Enrich teams with evaluation data
      const enrichedTeams = await Promise.all(
        teamsResponse.data.map(async (team) => {
          try {
            // Check if team has submitted
            const hasSubmission = team.project && team.project.title;

            // Get evaluations for this team
            let currentJudgeEvaluation = null;
            let allEvaluations = [];

            try {
              const evalResponse = await judgeApi.getEvaluationsByTeam(
                hackathonId,
                team._id,
              );

              if (evalResponse.success) {
                allEvaluations = evalResponse.data;
                currentJudgeEvaluation = allEvaluations.find(
                  (evaluation) => evaluation.judgeId === userData.data._id,
                );
              }
            } catch (evalErr) {
              console.log("No evaluations found for team:", team._id);
            }

            return {
              id: team._id,
              name: team.name,
              ps: team.project?.description || "Not submitted yet",
              pptLink: team.project?.driveUrl || null,
              repoLink: team.project?.repoUrl || null,
              demoLink: team.project?.demoUrl || null,
              marks: currentJudgeEvaluation?.totalScore || 0,
              criteriaScores: currentJudgeEvaluation?.criteriaScores || [],
              browniePointsChecked: currentJudgeEvaluation?.browniePoints || [],
              remarks: currentJudgeEvaluation?.remarks || "",
              submissionStatus: hasSubmission
                ? currentJudgeEvaluation
                  ? "Evaluated"
                  : "Submitted"
                : "Not Submitted",
              evaluated: !!currentJudgeEvaluation,
              evaluationId: currentJudgeEvaluation?._id || null,
              rawTeam: team,
            };
          } catch (err) {
            console.error("Error enriching team:", err);
            return {
              id: team._id,
              name: team.name,
              ps: "Error loading details",
              pptLink: null,
              repoLink: null,
              demoLink: null,
              marks: 0,
              criteriaScores: [],
              browniePointsChecked: [],
              remarks: "",
              submissionStatus: "Not Submitted",
              evaluated: false,
              evaluationId: null,
              rawTeam: team,
            };
          }
        }),
      );

      setTeams(enrichedTeams);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError(err.message || "Failed to load team submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluationSubmit = (teamId, updatedEvaluation) => {
    setTeams((prevTeams) =>
      prevTeams.map((t) =>
        t.id === teamId
          ? {
              ...t,
              evaluated: true,
              submissionStatus: "Evaluated",
              evaluationId: updatedEvaluation._id,
              criteriaScores: updatedEvaluation.criteriaScores ?? t.criteriaScores,
              browniePointsChecked: updatedEvaluation.browniePointsChecked ?? t.browniePointsChecked,
              marks: updatedEvaluation.totalScore ?? t.marks,
              remarks: updatedEvaluation.remarks ?? t.remarks,
            }
          : t
      )
    );
  };

  const handleRemarksChange = (teamId, value) => {
    setTeams((prevTeams) =>
      prevTeams.map((team) =>
        team.id === teamId ? { ...team, remarks: value } : team,
      ),
    );
  };

  // Handled inside EvaluationModal now

  const getStatusClass = (status) => {
    switch (status) {
      case "Submitted":
        return "submission-submitted";
      case "Evaluated":
        return "submission-evaluated";
      case "Not Submitted":
        return "submission-not-submitted";
      default:
        return "";
    }
  };

  // Filter teams based on search and filters
  const filteredTeams = teams.filter((team) => {
    const matchesSearch = team.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSubmission =
      submissionFilter === "All" || team.submissionStatus === submissionFilter;
    const matchesEvaluation =
      evaluationFilter === "All" ||
      (evaluationFilter === "Evaluated" && team.evaluated) ||
      (evaluationFilter === "Pending" && !team.evaluated);

    return matchesSearch && matchesSubmission && matchesEvaluation;
  });

  const totalTeams = teams.length;
  const evaluatedCount = teams.filter((t) => t.evaluated).length;
  const pendingCount = totalTeams - evaluatedCount;

  if (loading) {
    return (
      <div className="judge-page">
        <Navbar />
        <main className="page-main">
          <div className="page-container">
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading team submissions...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="judge-page">
        <Navbar />
        <main className="page-main">
          <div className="page-container">
            <div className="error-container">
              <h2>Error Loading Submissions</h2>
              <p>{error}</p>
              <button
                className="btn-primary"
                onClick={fetchTeamsAndEvaluations}
              >
                Retry
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="judge-page">
      <Navbar />

      <main className="page-main">
        <div className="page-container">
          <div className="submissions-header">
            <button
              onClick={() => navigate(-1)}
              className="back-button"
              style={{ marginBottom: "16px" }}
            >
              ← Back
            </button>
            <h1 className="page-title">Team Submissions & Evaluation</h1>

            <div className="summary-pills">
              <div className="summary-pill summary-total">
                <span className="pill-label">Total Teams:</span>
                <span className="pill-value">{totalTeams}</span>
              </div>
              <div className="summary-pill summary-evaluated">
                <span className="pill-label">Evaluated:</span>
                <span className="pill-value">{evaluatedCount}</span>
              </div>
              <div className="summary-pill summary-pending">
                <span className="pill-label">Pending:</span>
                <span className="pill-value">{pendingCount}</span>
              </div>
            </div>
          </div>

          <div className="filters-section">
            <div className="filter-group search-group">
              <label className="filter-label">Search Teams</label>
              <div className="search-input-wrapper">
                <svg
                  className="search-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z"
                    stroke="#043873"
                    strokeWidth="2"
                  />
                  <path
                    d="M11.5 11.5L15 15"
                    stroke="#043873"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by team name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Submission Status</label>
              <select
                className="filter-select"
                value={submissionFilter}
                onChange={(e) => setSubmissionFilter(e.target.value)}
              >
                <option>All</option>
                <option>Submitted</option>
                <option>Not Submitted</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Evaluation Status</label>
              <select
                className="filter-select"
                value={evaluationFilter}
                onChange={(e) => setEvaluationFilter(e.target.value)}
              >
                <option>All</option>
                <option>Evaluated</option>
                <option>Pending</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="submissions-table">
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>Project Description</th>
                  <th>Links</th>
                  <th>Total Raw Score</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      No teams found
                    </td>
                  </tr>
                ) : (
                  filteredTeams.map((team, index) => (
                    <tr
                      key={team.id}
                      className={index % 2 === 1 ? "row-alt" : ""}
                    >
                      <td>
                        <span className="team-name-link">{team.name}</span>
                      </td>
                      <td>
                        <div className="ps-cell">
                          <span className="ps-text">{team.ps}</span>
                        </div>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexDirection: "column",
                          }}
                        >
                          {team.pptLink && (
                            <a
                              href={team.pptLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view-link"
                            >
                              PPT
                            </a>
                          )}
                          {team.repoLink && (
                            <a
                              href={team.repoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view-link"
                            >
                              Repo
                            </a>
                          )}
                          {team.demoLink && (
                            <a
                              href={team.demoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view-link"
                            >
                              Demo
                            </a>
                          )}
                          {!team.pptLink &&
                            !team.repoLink &&
                            !team.demoLink && (
                              <span className="na-text">N/A</span>
                            )}
                        </div>
                      </td>
                      <td>
                        <strong style={{ fontSize: '1.1rem', color: '#059669' }}>{team.marks ? team.marks.toFixed(1) : 0}</strong>
                      </td>
                      <td>
                        <span
                          className={`submission-badge ${getStatusClass(
                            team.submissionStatus,
                          )}`}
                        >
                          {team.submissionStatus}
                        </span>
                      </td>
                      <td>
                        {team.evaluated ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <button 
                              className="btn-secondary" 
                              onClick={() => setSelectedTeam(team)}
                              style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '0.9rem' }}
                            >
                              View Eval
                            </button>
                            <span style={{ fontSize: '0.8rem', color: '#10b981', textAlign: 'center', fontWeight: 'bold' }}>✓ Evaluated</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedTeam(team)}
                            disabled={team.submissionStatus === "Not Submitted"}
                            style={{ 
                              padding: '8px 16px', 
                              borderRadius: '6px', 
                              backgroundColor: team.submissionStatus === "Not Submitted" ? '#e2e8f0' : '#2563eb', 
                              color: team.submissionStatus === "Not Submitted" ? '#94a3b8' : 'white',
                              border: 'none',
                              cursor: team.submissionStatus === "Not Submitted" ? 'not-allowed' : 'pointer',
                              fontWeight: '600'
                            }}
                          >
                            Rate Project
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <EvaluationModal 
        isOpen={!!selectedTeam}
        onClose={() => setSelectedTeam(null)}
        team={selectedTeam}
        hackathonId={hackathonId}
        criteria={criteria}
        browniePoints={browniePoints}
        onEvaluationSubmit={handleEvaluationSubmit}
      />

      <Footer />
    </div>
  );
};

export default TeamSubmissions;
