import React, { useState, useEffect } from "react";
import judgeApi from "../../services/judgeApi";

const EvaluationModal = ({
  isOpen,
  onClose,
  team,
  hackathonId,
  criteria,
  browniePoints,
  onEvaluationSubmit,
}) => {
  const [scores, setScores] = useState({});
  const [selectedBrowniePoints, setSelectedBrowniePoints] = useState({});
  const [remarks, setRemarks] = useState(team?.remarks || "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && team) {
      // Initialize scores from team's evaluation if it exists, otherwise 0
      const initialScores = {};
      criteria.forEach((c) => {
        const found = Array.isArray(team.criteriaScores) 
          ? team.criteriaScores.find(s => s.name === c.name) 
          : null;
        initialScores[c._id || c.name] = found ? found.score : 0;
      });
      setScores(initialScores);

      const initialBrownie = {};
      browniePoints.forEach((bp) => {
        initialBrownie[bp._id || bp.name] =
          Array.isArray(team.browniePointsChecked) &&
          team.browniePointsChecked.some((checked) => checked.name === bp.name);
      });
      setSelectedBrowniePoints(initialBrownie);

      setRemarks(team.remarks || "");
    }
  }, [isOpen, team, criteria, browniePoints]);

  if (!isOpen || !team) return null;

  const handleScoreChange = (criterionId, value) => {
    if (value === "") {
      setScores({ ...scores, [criterionId]: "" });
      return;
    }
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
      setScores({ ...scores, [criterionId]: numValue });
    }
  };

  const toggleBrowniePoint = (bpId) => {
    setSelectedBrowniePoints({
      ...selectedBrowniePoints,
      [bpId]: !selectedBrowniePoints[bpId],
    });
  };

  const calculateTotal = () => {
    let total = 0;
    criteria.forEach((c) => {
      const score = scores[c._id || c.name] || 0;
      total += score * c.weight;
    });
    browniePoints.forEach((bp) => {
      if (selectedBrowniePoints[bp._id || bp.name]) {
        total += bp.weight;
      }
    });
    return total;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Format criteriaScores for backend
      const formattedCriteriaScores = criteria.map((c) => ({
        name: c.name,
        score: scores[c._id || c.name] || 0,
        weight: c.weight,
      }));

      // Format browniePoints for backend
      const formattedBrowniePoints = browniePoints
        .filter((bp) => selectedBrowniePoints[bp._id || bp.name])
        .map((bp) => ({
          name: bp.name,
          weight: bp.weight,
        }));

      const evaluationData = {
        criteriaScores: formattedCriteriaScores,
        browniePointsChecked: formattedBrowniePoints,
        remarks: remarks,
        round: "final",
        totalScore: calculateTotal(), // Will be recalculated optimally on backend
      };

      let response;
      if (team.evaluationId) {
        response = await judgeApi.updateEvaluation(
          team.evaluationId,
          evaluationData
        );
      } else {
        response = await judgeApi.createEvaluation(
          hackathonId,
          team.id,
          evaluationData
        );
      }

      if (response.success) {
        // Pass the updated team data back to parent
        onEvaluationSubmit(team.id, response.data);
        onClose();
      } else {
        alert(response.message || "Failed to submit evaluation");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "700px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "30px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "15px",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, color: "#1e293b", fontSize: "1.5rem" }}>
            Evaluating: <span style={{ color: "#2563eb" }}>{team.name}</span>
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            ×
          </button>
        </div>

        {/* Project Details snippet */}
        <div style={{ marginBottom: "25px", color: "#475569" }}>
          <p style={{ margin: "0 0 10px 0", lineHeight: "1.6" }}>
            <strong>Project:</strong> {team.ps}
          </p>
          <div style={{ display: "flex", gap: "15px" }}>
            {team.pptLink && (
              <a href={team.pptLink} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "none", fontWeight: "bold" }}>📄 PPT</a>
            )}
            {team.repoLink && (
              <a href={team.repoLink} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "none", fontWeight: "bold" }}>💻 Repo</a>
            )}
            {team.demoLink && (
              <a href={team.demoLink} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "none", fontWeight: "bold" }}>🌐 Demo</a>
            )}
          </div>
        </div>

        <div style={{ marginBottom: "25px" }}>
          <h3 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", color: "#0f172a" }}>Main Criteria (0 - 10)</h3>
          {criteria.map((c) => (
            <div
              key={c._id || c.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px dashed #e2e8f0",
              }}
            >
              <div>
                <strong style={{ display: "block", color: "#334155" }}>{c.name}</strong>
                <small style={{ color: "#64748b" }}>Weight: {c.weight}</small>
              </div>
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={scores[c._id || c.name] === "" ? "" : scores[c._id || c.name] || 0}
                onChange={(e) => handleScoreChange(c._id || c.name, e.target.value)}
                disabled={team.evaluated}
                style={{
                  width: "80px",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "1rem",
                  textAlign: "center",
                }}
              />
            </div>
          ))}
          {criteria.length === 0 && <p style={{ color: "#64748b" }}>No custom criteria set by organizer.</p>}
        </div>

        <div style={{ marginBottom: "25px" }}>
          <h3 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", color: "#0f172a" }}>Brownie Points</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "15px" }}>
            {browniePoints.map((bp) => {
              const checked = selectedBrowniePoints[bp._id || bp.name];
              return (
                <button
                  key={bp._id || bp.name}
                  onClick={() => !team.evaluated && toggleBrowniePoint(bp._id || bp.name)}
                  disabled={team.evaluated}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    border: checked ? "2px solid #10b981" : "2px solid #e2e8f0",
                    background: checked ? "#ecfdf5" : "white",
                    color: checked ? "#065f46" : "#475569",
                    cursor: team.evaluated ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                >
                  {bp.name}{bp.description ? `: ${bp.description}` : ''} (+{bp.weight})
                </button>
              );
            })}
            {browniePoints.length === 0 && <p style={{ color: "#64748b" }}>No brownie points available.</p>}
          </div>
        </div>

        <div style={{ marginBottom: "25px" }}>
          <h3 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", color: "#0f172a" }}>Remarks & Feedback</h3>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={team.evaluated}
            placeholder="Add constructive feedback here..."
            style={{
              width: "100%",
              minHeight: "100px",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              resize: "vertical",
              marginTop: "10px",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "20px",
            borderTop: "2px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: "1.2rem", color: "#1e293b" }}>
            Calculated Raw Score: <strong style={{ color: "#059669" }}>{calculateTotal()}</strong>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onClose}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "white",
                cursor: "pointer",
                fontWeight: "bold",
                color: "#475569",
              }}
            >
              Close
            </button>
            {!team.evaluated && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  padding: "10px 25px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#2563eb",
                  color: "white",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                }}
              >
                {submitting ? "Submitting..." : "Submit Evaluation"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationModal;
