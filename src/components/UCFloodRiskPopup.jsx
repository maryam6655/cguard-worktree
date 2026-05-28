import React from 'react';
import '../styles/UCFloodRiskPopup.css';

const UCFloodRiskPopup = ({ ucData, onClose, onViewShelters }) => {
  // Aligned with the 6-tier percentage table:
  //   0–20% Normal, 21–40% Low, 41–60% Medium, 61–80% High,
  //   81–95% Very High, 96–100% Exceptionally High
  const getProgressColor = (percentage) => {
    const value = Number(percentage);
    if (!Number.isFinite(value)) return '#22c55e';
    if (value <= 20) return '#22c55e'; // Normal
    if (value <= 40) return '#eab308'; // Low
    if (value <= 60) return '#f97316'; // Medium
    if (value <= 80) return '#ef4444'; // High
    if (value <= 95) return '#9333ea'; // Very High
    return '#7f1d1d';                  // Exceptionally High
  };

  return (
    <div className="uc-popup-overlay" onClick={onClose}>
      <div className="uc-popup-card" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="uc-popup-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <h3 className="uc-popup-title">
          Your Union Council: {ucData.uc} — {ucData.district}
        </h3>

        <div className="uc-popup-row">
          <div className="uc-popup-label">24-Hour Flood Risk</div>
          <div className="uc-popup-value">{ucData.risk24}%</div>
          <div className="uc-popup-bar">
            <div
              className="uc-popup-fill"
              style={{
                width: `${ucData.risk24}%`,
                backgroundColor: getProgressColor(ucData.risk24)
              }}
            ></div>
          </div>
        </div>

        <div className="uc-popup-row">
          <div className="uc-popup-label">48-Hour Flood Risk</div>
          <div className="uc-popup-value">{ucData.risk48}%</div>
          <div className="uc-popup-bar">
            <div
              className="uc-popup-fill"
              style={{
                width: `${ucData.risk48}%`,
                backgroundColor: getProgressColor(ucData.risk48)
              }}
            ></div>
          </div>
        </div>

        <div className="uc-popup-row">
          <div className="uc-popup-label">72-Hour Flood Risk</div>
          <div className="uc-popup-value">{ucData.risk72}%</div>
          <div className="uc-popup-bar">
            <div
              className="uc-popup-fill"
              style={{
                width: `${ucData.risk72}%`,
                backgroundColor: getProgressColor(ucData.risk72)
              }}
            ></div>
          </div>
        </div>

        <div className="uc-popup-status">{ucData.statusText}</div>

        <button className="uc-popup-btn" type="button" onClick={onViewShelters}>
          View Shelters List & Contacts
          <span className="uc-popup-arrow">→</span>
        </button>
      </div>
    </div>
  );
};

export default UCFloodRiskPopup;
