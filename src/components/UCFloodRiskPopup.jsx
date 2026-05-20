import React from 'react';
import '../styles/UCFloodRiskPopup.css';

const UCFloodRiskPopup = ({ ucData, onClose, onViewShelters }) => {
  const getProgressColor = (percentage) => {
    if (percentage > 75) return '#dc2626';
    if (percentage >= 50) return '#ea580c';
    if (percentage >= 25) return '#facc15';
    return '#22c55e';
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
