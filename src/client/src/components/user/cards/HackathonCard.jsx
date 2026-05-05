import React from "react";
import { Users, Globe, CalendarDays, Trophy, CheckCircle2 } from "lucide-react";

const HackathonCard = ({ hackathon, onRegister, onViewDetails }) => {
  // --- BUTTON LOGIC HELPERS ---
  const isRegistered = hackathon.isRegistered;
  const isOngoing = hackathon.status === "ongoing";
  const isClosed = hackathon.status === "closed" || hackathon.status === "past";
  const isDraft = hackathon.status === "draft";
  const isRegistrationClosed = hackathon.isRegistrationClosed; // Naya prop fetch kiya

  const renderMainButton = () => {
    // Case 1: If user is already registered
    if (isRegistered) {
      return (
        <button
          className="btn btn-registered"
          onClick={onViewDetails}
        >
          <span className="tick-icon">✓</span>
          Registered
        </button>
      );
    }

    // Case 2: If hackathon is in DRAFT
    if (isDraft) {
      return (
        <button className="btn btn-primary" disabled>
          Coming Soon
        </button>
      );
    }

    // Case 3: If registration is closed (Date passed or Admin closed it)
    if (isOngoing || isClosed || isRegistrationClosed) {
      return (
        <button className="btn btn-primary" disabled>
          {isOngoing ? "Ongoing" : "Registration Closed"}
        </button>
      );
    }

    // Default: Registration Open
    return (
      <button className="btn btn-primary" onClick={onRegister}>
        Register Now
      </button>
    );
  };

  return (
    <div className="hackathon-card">
      {/* Card Image Section */}
      <div className="card-image-container">
        <img
          src={hackathon.image}
          alt={hackathon.name}
          className="card-image"
        />
        <span className={`status-badge status-${hackathon.status}`}>
          {hackathon.status}
        </span>
      </div>

      {/* Card Content Section */}
      <div className="card-content">
        {/* Title */}
        <h3 className="card-title">{hackathon.name}</h3>
        
        {/* Organizer */}
        <p className="card-org">by {hackathon.organization}</p>
        
        {/* Description */}
        <p className="card-description">{hackathon.description}</p>

        {/* Tags */}
        {hackathon.tags && hackathon.tags.length > 0 && (
          <div className="tag-container">
            {hackathon.tags.map((tag) => (
              <span key={tag} className={`tag tag-${tag}`}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Info Grid */}
        <div className="info-grid">
          <div className="info-item">
            <Users size={16} color="#64748b" />
            <span>{hackathon.teamSize}</span>
          </div>
          <div className="info-item">
            <Globe size={16} color="#64748b" />
            <span>{hackathon.mode}</span>
          </div>
          <div className="info-item">
            <CalendarDays size={16} color="#64748b" />
            <span>{hackathon.deadline}</span>
          </div>
          <div className="info-item">
            <Trophy size={16} color="#64748b" />
            <span>{hackathon.prizePool}</span>
          </div>
        </div>
      </div>

      {/* Card Actions Section */}
      <div className="card-actions">
        {renderMainButton()}
        <button
          className="btn btn-secondary"
          onClick={onViewDetails}
        >
          Details
        </button>
      </div>
    </div>
  );
};

export default HackathonCard;
