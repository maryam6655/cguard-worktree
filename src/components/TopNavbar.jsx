import React from 'react';
import CGuardLogoIcon from './CGuardLogoIcon';
import '../styles/AuthorityDashboard.css';

const TopNavbar = ({ user, onLogout }) => {
  return (
    <nav className="top-navbar">
      <div className="navbar-brand">
        <span className="brand-logo-icon" aria-hidden="true">
          <CGuardLogoIcon size={36} />
        </span>
        <div className="brand-logo">C Guard</div>
        <div className="brand-subtitle">Authority Dashboard</div>
      </div>
      <div className="navbar-actions">
        <div className="user-section">
          <div className="user-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <span className="welcome-text">Welcome, {user?.name || user?.email}</span>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default TopNavbar;
