import React, { useState } from 'react';
import { FaMapMarkerAlt, FaShieldAlt } from 'react-icons/fa';
import FloodMap from '../components/FloodMap';
import CGuardLogoIcon from '../components/CGuardLogoIcon';
import UCFloodRiskPopup from '../components/UCFloodRiskPopup';
import '../styles/FloodRiskPage.css';

const FloodRiskPage = ({ onBackToHome, onViewShelters, onViewEmergency }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationPrompt, setLocationPrompt] = useState(true);
  const [mapLocation, setMapLocation] = useState(null);
  const [showRiverLayer, setShowRiverLayer] = useState(true);
  const [showUcBoundaries, setShowUcBoundaries] = useState(true);
  const [selectedUC, setSelectedUC] = useState(null);
  const [locationLabel, setLocationLabel] = useState('Your Location');
  const [locationTime, setLocationTime] = useState(() => new Date().toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }));
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const formatLocationTime = (date = new Date()) =>
    date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });

  // Handle location sharing
  const handleAllowLocation = () => {
    if (!navigator.geolocation) {
      setLocationPrompt(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationText = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

        setMapLocation([latitude, longitude]);
        setLocationLabel(locationText);
        setLocationTime(formatLocationTime());
        setUserLocation((prev) => ({
          ...(prev || {}),
          lat: latitude,
          lng: longitude,
        }));
        setLocationPrompt(false);
      },
      () => {
        setLocationLabel('Location unavailable');
        setLocationTime(formatLocationTime());
        setLocationPrompt(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Voice search
  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
      };
      
      recognition.start();
    } else {
      alert('Voice search is not supported in your browser.');
    }
  };

  const clampRisk = (value) => Math.max(0, Math.min(100, Math.round(value)));

  const handleUcSelect = (selection) => {
    if (!selection) return;

    const baseRisk = selection.riskPercentage != null
      ? Number(selection.riskPercentage)
      : selection.discharge != null
        ? (Number(selection.discharge) / 50000) * 100
        : 40;

    const risk24 = clampRisk(baseRisk - 8);
    const risk48 = clampRisk(baseRisk);
    const risk72 = clampRisk(baseRisk - 14);

    setSelectedUC({
      uc: selection.ucName || 'Unknown UC',
      district: selection.district || 'Unknown District',
      risk24,
      risk48,
      risk72,
    });

    setUserLocation((prev) => ({
      ...(prev || {}),
      uc: selection.ucName || 'Unknown UC',
      district: selection.district || 'Unknown District',
      floodRisk: {
        twentyFourHour: risk24,
        fortyEightHour: risk48,
        seventyTwoHour: risk72,
      },
    }));
  };

  const handleViewShelters = () => {
    setShowPopup(false);
    if (onViewShelters) {
      onViewShelters(userLocation);
    }
  };

  return (
    <div className="flood-risk-page">
      {/* Header */}
      <div className="flood-risk-header">
        <div className="header-left">
          <div className="header-brand">
            <span className="header-logo-icon" aria-hidden="true">
              <CGuardLogoIcon size={34} />
            </span>
            <h1 className="page-title">C Guard | Chenab Basin</h1>
          </div>
        </div>
        <div className="header-right">
          <button className="back-btn" onClick={onBackToHome}>
            ← Back to Home
          </button>
          <div className="user-location-display">
            {locationLabel}
            <span className="location-time">{locationTime}</span>
          </div>
        </div>
      </div>

        {/* Map Guide Sidebar */}
        <div className="map-guide-sidebar">
          <h3 className="sidebar-title">Map Guide</h3>

          <label className="legend-item map-guide-toggle">
            <input
              type="checkbox"
              checked={showRiverLayer}
              onChange={(event) => setShowRiverLayer(event.target.checked)}
            />
            <div className="legend-line chenab-river"></div>
            <span>Chenab River</span>
          </label>

          <label className="legend-item map-guide-toggle">
            <input
              type="checkbox"
              checked={showUcBoundaries}
              onChange={(event) => setShowUcBoundaries(event.target.checked)}
            />
            <div className="legend-line uc-boundary"></div>
            <span>UC Boundaries</span>
          </label>

          <div className="risk-section">
            <p className="risk-indicator">% = Flood Risk Level</p>

            <h4 className="risk-title">Risk Levels</h4>

            <div className="risk-level-item">
              <div className="risk-dot low"></div>
              <span className="risk-label">LOW</span>
              <span className="risk-range">0–20%</span>
            </div>

            <div className="risk-level-item">
              <div className="risk-dot medium"></div>
              <span className="risk-label">MEDIUM</span>
              <span className="risk-range">21–40%</span>
            </div>

            <div className="risk-level-item">
              <div className="risk-dot high"></div>
              <span className="risk-label">HIGH</span>
              <span className="risk-range">41–60%</span>
            </div>

            <div className="risk-level-item">
              <div className="risk-dot very-high"></div>
              <span className="risk-label">VERY HIGH</span>
              <span className="risk-range">61–80%</span>
            </div>

            <div className="risk-level-item">
              <div className="risk-dot exc-high"></div>
              <span className="risk-label">EXC. HIGH</span>
              <span className="risk-range">81–100%</span>
            </div>
          </div>
        </div>

      {/* Map Container */}
      <div className="map-container">
        {locationPrompt && (
          <div className="location-prompt-overlay">
            <div className="location-prompt-card">
              <div className="location-icon-wrap" aria-hidden="true">
                <FaMapMarkerAlt className="location-icon-react" />
              </div>
              <h2>Share Your Location</h2>
              <p>Allow access to your location to view flood risk information for your area</p>
              <div className="location-trust-note">
                <FaShieldAlt aria-hidden="true" />
                <span>Used only for local flood risk guidance</span>
              </div>
              <button className="allow-location-btn" onClick={handleAllowLocation}>
                Allow Location Access
              </button>
              <button className="deny-location-btn" onClick={() => setLocationPrompt(false)}>
                Not Now
              </button>
            </div>
          </div>
        )}
        
        {/* Search Bar */}
        <div className="search-container">
          <form className="search-form" onSubmit={(e) => e.preventDefault()}>
            <div className="search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className={`mic-icon ${isListening ? 'listening' : ''}`} onClick={handleVoiceSearch}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
          </form>
        </div>

        <FloodMap
          searchQuery={searchQuery}
          userLocation={mapLocation}
          showRiverLayer={showRiverLayer}
          showUcBoundaries={showUcBoundaries}
          onUcSelect={handleUcSelect}
          onViewEmergency={onViewEmergency}
        />
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <UCFloodRiskPopup
          ucData={selectedUC}
          onClose={() => setShowPopup(false)}
          onViewShelters={handleViewShelters}
        />
      )}
    </div>
  );
};

export default FloodRiskPage;
